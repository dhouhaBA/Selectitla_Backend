"use strict";

/**
 * user-notification-key controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::user-notification-key.user-notification-key",
  ({ strapi }) => ({
    async subscribe(ctx) {
      const { subscription } = ctx.request.body;

      // Save the subscription data in the user-notification-key model
      const userNotificationKey = await strapi.db
        .query("api::user-notification-key.user-notification-key")
        .create({
          data: {
            user: ctx.state.user,
            subscription: subscription,
            publishedAt: new Date(), // Set published_at to current date and time
          },
        });

      ctx.send({
        message: "User subscribed successfully",
        data: userNotificationKey,
      });
    },
    async unsubscribe(ctx) {
      const { id, subscription } = ctx.request.body.data;

      try {
        // Find the user's subscription in the user-notification-key model
        const userSubscription = strapi.db
          .query("user-notification-key")
          .findOne({
            select: ["subscription"],
            where: {
              user: id,
              subscription: subscription,
            },
          });

        if (!userSubscription) {
          return ctx.notFound("User subscription not found");
        }

        // Delete the user's subscription
        await strapi.db
          .query("api::user-notification-key.user-notification-key")
          .delete({
            where: { user: { id: id } },
          });

        ctx.send({
          message: "User unsubscribed successfully",
        });
      } catch (error) {
        console.error("Error unsubscribing user:", error);
        ctx.internalServerError(
          "An error occurred while unsubscribing the user"
        );
      }
    },
  })
);
