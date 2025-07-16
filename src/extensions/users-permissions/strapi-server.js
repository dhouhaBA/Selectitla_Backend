// Import necessary dependencies and utilities
const utils = require("@strapi/utils");
const { getService } = require("../users-permissions/utils");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const {
  validateCallbackBody,
} = require("../users-permissions/controllers/validation/auth");

// Additional imports
const { setMaxListeners } = require("process");
const { sanitize } = utils;
const { ApplicationError, ValidationError } = utils.errors;

// Function to sanitize user data based on the user schema and authentication context
const sanitizeUser = (user, ctx) => {
  const { auth } = ctx.state;
  const userSchema = strapi.getModel("plugin::users-permissions.user");
  return sanitize.contentAPI.output(user, userSchema, { auth });
};

// Function to issue a JSON Web Token (JWT)
const issueJWT = (payload, jwtOptions = {}) => {
  _.defaults(jwtOptions, strapi.config.get("plugin.users-permissions.jwt"));
  return jwt.sign(
    _.clone(payload.toJSON ? payload.toJSON() : payload),
    strapi.config.get("plugin.users-permissions.jwtSecret"),
    jwtOptions
  );
};

// Function to verify a refresh token using the REFRESH_SECRET from the environment
const verifyRefreshToken = (token) => {
  return new Promise(function (resolve, reject) {
    jwt.verify(
      token,
      process.env.REFRESH_SECRET,
      {},
      function (err, tokenPayload = {}) {
        if (err) {
          return reject(new Error("Invalid token."));
        }
        resolve(tokenPayload);
      }
    );
  });
};

// Function to issue a refresh token
const issueRefreshToken = (payload, jwtOptions = {}) => {
  _.defaults(jwtOptions, strapi.config.get("plugin.users-permissions.jwt"));
  return jwt.sign(
    _.clone(payload.toJSON ? payload.toJSON() : payload),
    process.env.REFRESH_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES }
  );
};
// Function to clear the user session (logout)
const clearUserSession = (ctx) => {
  // Clear JWT token in the response
  ctx.cookies.set("jwt", null, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Set to true in production
    signed: true,
    maxAge: 0, // Expire immediately
    overwrite: true,
  });
  // Clear refresh JWT token in the response
  ctx.cookies.set("refreshToken", null, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Set to true in production
    signed: true,
    maxAge: 0, // Expire immediately
    overwrite: true,
  });
};
// Export the Strapi plugin initialization function
module.exports = (plugin) => {
  // Configure the authentication callback controller

  plugin.controllers.auth.callback = async (ctx) => {
    const provider = ctx.params.provider || "local";
    const params = ctx.request.body;
    const store = strapi.store({ type: "plugin", name: "users-permissions" });
    const grantSettings = await store.get({ key: "grant" });
    const grantProvider = provider === "local" ? "email" : provider;
    if (!_.get(grantSettings, [grantProvider, "enabled"])) {
      throw new ApplicationError("This provider is disabled");
    }
    if (provider === "local") {
      await validateCallbackBody(params);
      const { identifier } = params;
      // Check if the user exists.
      const user = await strapi
        .query("plugin::users-permissions.user")
        .findOne({
          where: {
            provider,
            $or: [
              { email: identifier.toLowerCase() },
              { username: identifier },
            ],
          },
          populate: { photo: true },
        });
      if (!user) {
        return ctx.notFound("Invalid email or password");
      }

      if (!user.password) {
        return ctx.notFound("Invalid email or password");
      }
      const validPassword = await getService("user").validatePassword(
        params.password,
        user.password
      );
      if (!validPassword) {
        return ctx.notFound("Invalid email or password");
      } else {
        ctx.cookies.set("refreshToken", issueRefreshToken({ id: user.id }), {
          httpOnly: true,
          secure: false,
          signed: true,
          overwrite: true,
        });
        ctx.send({
          status: "Authenticated",
          jwt: issueJWT(
            { id: user.id },
            { expiresIn: process.env.JWT_SECRET_EXPIRES }
          ),
          user: await sanitizeUser(user, ctx),
        });
      }
      const advancedSettings = await store.get({ key: "advanced" });
      const requiresConfirmation = _.get(
        advancedSettings,
        "email_confirmation"
      );
      if (requiresConfirmation && user.confirmed !== true) {
        throw new ApplicationError("Your account email is not confirmed");
      }
      if (user.blocked === true) {
        throw new ApplicationError(
          "Your account has been blocked by an administrator"
        );
      }
      return ctx.send({
        jwt: getService("jwt").issue({ id: user.id }),
        user: await sanitizeUser(user, ctx),
      });
    }
    // Connect the user with a third-party provider.
    try {
      const user = await getService("providers").connect(provider, ctx.query);
      return ctx.send({
        jwt: getService("jwt").issue({ id: user.id }),
        user: await sanitizeUser(user, ctx),
      });
    } catch (error) {
      throw new ApplicationError(error.message);
    }
  };

  // Configure the token refresh controller
  plugin.controllers.auth["refreshToken"] = async (ctx) => {
    const store = await strapi.store({
      type: "plugin",
      name: "users-permissions",
    });
    const { refreshToken } = ctx.request.body;
    let refreshCookie = ctx.cookies.get("refreshToken");

    if (!refreshCookie && !refreshToken) {
      return ctx.badRequest("No Authorization");
    }
    if (!refreshCookie) {
      if (refreshToken) {
        refreshCookie = refreshToken;
      } else {
        return ctx.badRequest("No Authorization");
      }
    }
    try {
      const obj = await verifyRefreshToken(refreshCookie);
      const user = await strapi
        .query("plugin::users-permissions.user")
        .findOne({ where: { id: obj.id } });
      if (!user) {
        throw new ValidationError("Invalid identifier or password");
      }
      if (
        _.get(await store.get({ key: "advanced" }), "email_confirmation") &&
        user.confirmed !== true
      ) {
        throw new ApplicationError("Your account email is not confirmed");
      }
      if (user.blocked === true) {
        throw new ApplicationError(
          "Your account has been blocked by an administrator"
        );
      }
      const refreshToken = issueRefreshToken({ id: user.id });
      ctx.cookies.set("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        signed: true,
        overwrite: true,
      });
      ctx.send({
        jwt: issueJWT(
          { id: obj.id },
          { expiresIn: process.env.JWT_SECRET_EXPIRES }
        ),
        refreshToken: refreshToken,
      });
    } catch (err) {
      return ctx.badRequest(err.toString());
    }
  };
  // Configure the logout controller
  plugin.controllers.auth.logout = async (ctx) => {
    // Perform logout actions, e.g., deleting the user session
    // This could involve clearing session data, revoking tokens, etc.
    clearUserSession(ctx);

    // Respond with a success message or any relevant data
    ctx.send({
      message: "Logout successful",
    });
  };
  // Configure a new route for the token refresh endpoint
  plugin.routes["content-api"].routes.push({
    method: "POST",
    path: "/token/refresh",
    handler: "auth.refreshToken",
    config: {
      policies: [],
      prefix: "",
    },
  });
  // Configure a new route for the logout endpoint
  plugin.routes["content-api"].routes.push({
    method: "POST",
    path: "/auth/logout",
    handler: "auth.logout",
    config: {
      policies: [], // You can add any policies if needed
      prefix: "",
    },
  });
  // Return the modified plugin configuration
  return plugin;
};
