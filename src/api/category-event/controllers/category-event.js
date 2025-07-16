"use strict";

/**
 * category-event controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::category-event.category-event",
  ({ strapi }) => ({
    async findByName(ctx) {
      const { name } = ctx.params;

      try {
        // Utilisez le service Strapi associé à l'entité 'category-event'
        const entry = await strapi.db
          .query("api::category-event.category-event")
          .findOne({
            select: ["name"],
            where: { name: name },
          });
        return entry;
      } catch (error) {
        // Gérer les erreurs éventuelles
        console.error(error); // Loger l'erreur dans la console pour le débogage
        return ctx.send(
          { message: "Error during search", error: error.message },
          500
        );
      }
    },
  })
);
