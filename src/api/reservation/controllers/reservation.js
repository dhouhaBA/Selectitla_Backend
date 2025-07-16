"use strict";

/**
 * reservation controller
 */
const fs = require("fs");
const { notify } = require("../../../../config/web-push"); // Assuming you have a separate module for web push logic

const { createCoreController } = require("@strapi/strapi").factories;
const CONTROLLER_KEY = "api::reservation.reservation";
const FILE_FIELD = "documents";

module.exports = createCoreController(CONTROLLER_KEY, ({ strapi }) => ({
  async create(ctx) {
    const { body } = ctx.request;
    const data = JSON.parse(body.data);

    // Check that the customer ID is provided
    if (!data.customer || !data.customer.id) {
      return ctx.badRequest("Customer ID is required.");
    }

    // Fetch the customer data from the database
    const customer = await strapi
      .query("customer")
      .findOne({ id: data.customer.id });

    // Check if the customer exists
    if (!customer) {
      return ctx.badRequest("Customer not found.");
    }

    // Add the fetched customer data to the reservation data
    data.customer = customer;

    // Proceed with reservation creation if all validations succeed
    const response = await super.create(ctx);

    // Rest of the code
    // ...
  },

  async updateReservationStatus(ctx) {
    try {
      const { id, status, rejectionReason } = ctx.request.body.data;

      if (!id || !status) {
        return ctx.badRequest("Reservation ID and status must be provided.");
      }

      // Check if the provided state is valid (Confirmed or Canceled)
      if (status !== "Confirmed" && status !== "Canceled") {
        return ctx.badRequest(
          'Invalid status provided. Use "Confirmed" or "Canceled".'
        );
      }

      // Fetch the existing reservation
      const result = await strapi.db.query(CONTROLLER_KEY).findOne({
        select: ["status"],
        where: { id: id },
        populate: true,
      });
      if (!result) {
        return ctx.notFound("Reservation not found.");
      }

      // Check if the existing reservation is still in "Pending" state
      if (result.status !== "Pending") {
        return ctx.badRequest(
          "Updating status is only allowed when the status is 'Pending'."
        );
      }
      // update
      const updatedReservation = await strapi.db.query(CONTROLLER_KEY).update({
        where: { id: id },
        data: {
          status: status,
          rejection_reason: rejectionReason,
        },
        populate: { event: true  },
      });

      let notificationData = {};

      if (status === "Canceled") {
        // Include reason for cancellation
        notificationData = {
          title: "Reservation Update",
          body: `Your reservation has been canceled. Reason: ${
            rejectionReason || "No reason provided"
          }.`,
        };
      } else {
        // Ask the user to proceed with payment
        notificationData = {
          title: "Reservation Update",
          body: `Your reservation status has been updated to ${updatedReservation.status}. Please proceed with payment.`,
          // You can add more optional notification data here
        };
      }
      if (status === "Canceled" && !updatedReservation.attributes.event) {
        // update the remaining_bottles and remaining_seats
        await strapi.db.query("api::event.event").update({
          where: { id: updatedReservation.attributes.event.id },
          data: {
            remaining_bottles:
              updatedReservation.attributes.event.remaining_bottles +
              updatedReservation.attributes.bottles,
            remaining_seats:
              updatedReservation.attributes.event.remaining_seats +
              updatedReservation.attributes.seats,
          },
        });
      }
      // Notify the user about the reservation status change using web push
      // Send the web push notification
      await notify(strapi, result.customer.id, notificationData);

      return {
        message: `Reservation status updated successfully. New status: ${updatedReservation.status}`,
        data: updatedReservation,
      };
    } catch (error) {
      console.error("Error updating reservation state:", error);
      return ctx.internalServerError(
        "An error occurred while updating the reservation status."
      );
    }
  },
}));
