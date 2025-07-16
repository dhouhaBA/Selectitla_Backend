"use strict";

module.exports = () => {
  return async (ctx, next) => {
    await next();

    if (
      ctx.request.url === "/api/auth/local/register" &&
      ctx.response.status === 200
    ) {
      // Extract the role from the request body
      const { role } = ctx.request.body;

      // Check if the role is provided in the request body
      if (!role) {
        return; // If role is not provided, do nothing
      }

      try {
        // Get the user object from the response body
        const { user } = ctx.response.body;

        // Update the user's role with the specified role
        await strapi.entityService.update(
          "plugin::users-permissions.user",
          user.id,
          {
            data: {
              role: role,
            },
          }
        );
      } catch (error) {
        console.error("Error assigning role to user:", error);
        // Handle any errors that occur during the role assignment
        // You can log the error, send an email to the admin, or take any other appropriate action
      }
    }
  };
};
