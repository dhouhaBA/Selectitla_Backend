"use strict";

/**
 * Controller for handling customer operations
 */

const { createCoreController } = require("@strapi/strapi").factories;
const CONTROLLER_KEY = "api::customer.customer";

module.exports = createCoreController(CONTROLLER_KEY, ({ strapi }) => ({
  async create(ctx) {
    // Extract request body
    const { body } = ctx.request;
    //   // Check if the date_naiss has a valid format (YYYY-MM-DD)
    //   const dateNaissRegex = /^\d{4}-\d{2}-\d{2}$/;
    //   if (!dateNaissRegex.test(body.data.date_of_birth)) {
    //     // If the date format is invalid, return an error response
    //     return ctx.throw(
    //       400,
    //       "Invalid date format for date_naiss. Please use YYYY-MM-DD."
    //     );
    //   }
    //   // Check if the password and password confirmation match
    //   if (body.data.password !== body.data.confirm_password) {
    //     // If passwords do not match, return an error response
    //     return ctx.throw(400, "Password and confirmation do not match.");
    //   }
    //   // Check if a user with the same username or email already exists
    //   const existingUser = await strapi.db
    //     .query("plugin::users-permissions.user")
    //     .findOne({ where: { email: body.data.email } });

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

    //       },
    //     }
    //   );
    //   // If the user creation is successful, proceed to upload your image and  create the customer
    //   if (user) {
    //     if (ctx.is("multipart") && user) {
    //       const { files } = ctx.request;
    //       // If there is only one file, directly process it
    //       const singleFile = Object.values(files)[0];
    //       // Upload the file and associate it with the created entry
    //       await strapi.plugins.upload.services.upload.upload({
    //         data: {
    //           refId: user.id,
    //           ref: CONTROLLER_KEY,
    //           field: "photo",
    //         },
    //         files: {
    //           path: singleFile.path,
    //           name: singleFile.name,
    //           type: singleFile.type, // mime type of the file
    //           size: singleFile.size,
    //         },
    //       });
    //     }
    // Create a new customer entry in the database
    return await strapi.db.query(CONTROLLER_KEY).create({
      data: {
        name: body.data.name,
        surname: body.data.surname,
        phone: body.data.phone,
        driver_license: body.data.driver_license,
        Insurance: body.data.Insurance,
        address: body.data.address,
        credit_cards: body.data.credit_cards,
        user: body.data.user,
        publishedAt: new Date(),
      },
    });
  },
  // async find(ctx) {
  //   return await strapi.db.query(CONTROLLER_KEY).findMany({
  //     populate: { user: { populate: true } },
  //   });
  // },
  async delete(ctx) {
    const { id } = ctx.params;

    if (!id) {
      return ctx.throw(400, "Invalid customer id.");
    }

    // Check if the customer exists
    const customer = await strapi.db.query(CONTROLLER_KEY).findOne({
      where: { id: id },
      populate: { user: true },
    });

    if (!customer) {
      return ctx.throw(404, "Customer not found.");
    }
    // Delete the associated user
    await strapi.db
      .query("plugin::users-permissions.user")
      .delete({ where: { id: customer.user.id } });

    // Delete the customer
    await strapi.db.query(CONTROLLER_KEY).delete({ where: { id: id } });

    return { message: "Customer deleted successfully." };
  },
}));
