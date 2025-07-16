"use strict";

/**
 * partner controller
 */

const { createCoreController } = require("@strapi/strapi").factories;
const CONTROLLER_KEY = "api::partner.partner";

module.exports = createCoreController(CONTROLLER_KEY, ({ strapi }) => ({
  // async create(ctx) {
  //   // Extract request body
  //   const { body } = ctx.request;
  //   // Check if the date_naiss has a valid format (YYYY-MM-DD)

  //   // Check if the password and password confirmation match
  //   // if (body.data.password !== body.data.confirm_password) {
  //   //   // If passwords do not match, return an error response
  //   //   return ctx.throw(400, "Password and confirmation do not match.");
  //   // }
  //   // Check if a user with the same username or email already exists
  //   const existingUser = await strapi.db
  //     .query("plugin::users-permissions.user")
  //     .findOne({
  //       where: { email: body.data.email },
  //       populate: {
  //         user: { populate: true },
  //         events: { populate: true },
  //         villas: { populate: true },
  //         vehicles: { populate: true },
  //       },
  //     });

  //   if (existingUser) {
  //     // If a user with the same username or email exists, return an error response
  //     return ctx.throw(
  //       400,
  //       "User with the same username or email already exists."
  //     );
  //   }
  //   // Create a new user in the database
  //   const user = await strapi.entityService.create(
  //     "plugin::users-permissions.user",
  //     {
  //       data: {
  //         username: body.data.email,
  //         email: body.data.email,
  //         password: body.data.password,
  //         gender: body.data.gender,
  //         date_of_birth: body.data.date_of_birth,
  //         confirmed: true,
  //         blocked: false,
  //         role: body.data.role,
  //       },
  //     }
  //   );
  //   // If the user creation is successful, proceed to create the partner
  //   if (user) {
  //     if (ctx.is("multipart") && body.files && body.files.photo) {
  //       const { photo } = body.files;
  //       // Upload the file and associate it with the created entry
  //       await strapi.plugins.upload.services.upload.upload({
  //         data: {
  //           refId: user.id,
  //           ref: "user",
  //           field: "photo",
  //         },
  //         files: {
  //           path: photo.path,
  //           name: photo.name,
  //           type: photo.type, // mime type of the file
  //           size: photo.size,
  //         },
  //       });
  //     }
  //     // Create a new customer entry in the database
  //     return await strapi.db.query(CONTROLLER_KEY).create({
  //       data: {
  //         name: body.data.name,
  //         surname: body.data.surname,
  //         phone: body.data.phone,
  //         events: body.data.events,
  //         villas: body.data.villas,
  //         vehicles: body.data.vehicles,
  //         user: user.id,
  //         publishedAt: new Date(),
  //       },
  //     });
  //   }
  // },
  async create(ctx) {
    // Extract request body
    const { body } = ctx.request;

    // Check if a user with the provided ID exists

    return await strapi.db.query(CONTROLLER_KEY).create({
      data: {
        name: body.data.name,
        surname: body.data.surname,
        phone: body.data.phone,
        address: body.data.address,
        events: body.data.events,
        villas: body.data.villas,
        vehicles: body.data.vehicles,
        user: body.data.user,
        publishedAt: new Date(),
      },
    });
  },
  async find(ctx) {
    return await strapi.db.query(CONTROLLER_KEY).findMany({
      populate: {
        user: {
          populate: true,
        },
        events: {
          populate: true,
        },
        villas: {
          populate: true,
        },
        vehicles: {
          populate: true,
        },
      },
    });
  },
}));