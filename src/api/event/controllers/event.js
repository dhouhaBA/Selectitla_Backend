"use strict";

/**
 * event controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

const CONTROLLER_KEY = "api::event.event";
const FILE_FIELD = "photos";
module.exports = createCoreController(CONTROLLER_KEY, ({ strapi }) => ({
  async processFiles(ctx, response) {
    if (ctx.is("multipart") && response) {
      const { files } = ctx.request;
      // Iterate over the uploaded files
      const fileValues = Object.values(files);
      // If there is only one file, directly process it
      const singleFile = fileValues[0];
      if (singleFile != null) {
        // Upload the file and associate it with the created entry
        await strapi.plugins.upload.services.upload.upload({
          data: {
            refId: response.id,
            ref: CONTROLLER_KEY,
            field: FILE_FIELD,
          },
          files: singleFile,
        });
      }
    }
  },
  async create(ctx) {
    const { body } = ctx.request;
    console.log(body);
    const data = body;

    // Date and time validation

    const currentDate = new Date();
    const currentDateFormatted =
      currentDate.getFullYear() +
      "-" +
      String(currentDate.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(currentDate.getDate()).padStart(2, "0");
    const startDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);
    const startTime = new Date(`${data.start_date} ${data.start_time}`);
    const endTime = new Date(`${data.end_date} ${data.end_time}`);
    console.log(startDate, currentDate);
    // Check if start_date is greater than or equal to today
    if (startDate.toString() < currentDateFormatted) {
      // start_date must be greater than or equal to today
      return ctx.throw(
        400,
        "The start date must be greater than or equal to today."
      );
    }

    // Check if end_date is greater than or equal to start_date
    if (endDate < startDate) {
      // end_date must be greater than or equal to the start_date
      return ctx.throw(
        400,
        "The end date must be greater than or equal to the start date."
      );
    }

    // Check if start_date is equal to end_date and start_time is greater than or equal to end_time
    if (startDate === endDate && data.start_time >= data.end_time) {
      // start_time must be less than end_time when start_date is equal to end_date
      return ctx.throw(
        400,
        "The start time must be less than the end time when start date is equal to end date."
      );
    }
    let [hours, minutes] = data.start_time.split(":");

    // Créer un objet Date et définir l'heure et les minutes
    let date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(0); // Réinitialiser les secondes à zéro
    date.setMilliseconds(0); // Réinitialiser les millisecondes à zéro

    // Formatter l'objet Date au format HH:mm:ss.SSS
    const formattedStartTime = date.toISOString().slice(11, 23);
    [hours, minutes] = data.end_time.split(":");

    // Créer un objet Date et définir l'heure et les minutes
    date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(0); // Réinitialiser les secondes à zéro
    date.setMilliseconds(0); // Réinitialiser les millisecondes à zéro

    // Formatter l'objet Date au format HH:mm:ss.SSS
    const formattedEndTime = date.toISOString().slice(11, 23);
    // Create the record in the database
    const response = await strapi.db.query(CONTROLLER_KEY).create({
      data: {
        name: data.name,
        price: data.price,
        promoting_info: data.promoting_info,
        name_promoter: data.name_promoter,
        description: data.description,
        partner: data.partner,
        category_events: data.category_events,
        total_bottles: data.total_bottles,
        total_seats: data.total_seats,
        remaining_seats: data.total_seats,
        remaining_bottles: data.total_bottles,
        start_date: startDate,
        start_time: formattedStartTime,
        end_date: endDate,
        end_time: formattedEndTime,
        location: data.location,
        publishedAt: new Date(),
      },
    });

    // Process any associated files
    await this.processFiles(ctx, response);

    // Return the response
    return response;
  },

  async update(ctx) {
    const { body } = ctx.request;
    console.log(body);
    const data = body;

    // Date and time validation

    const currentDate = new Date();
    const currentDateFormatted =
      currentDate.getFullYear() +
      "-" +
      String(currentDate.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(currentDate.getDate()).padStart(2, "0");
    const startDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);
    const startTime = new Date(`${data.start_date} ${data.start_time}`);
    const endTime = new Date(`${data.end_date} ${data.end_time}`);
    console.log(startDate, currentDate);
    // Check if start_date is greater than or equal to today
    if (startDate.toString() < currentDateFormatted) {
      // start_date must be greater than or equal to today
      return ctx.throw(
        400,
        "The start date must be greater than or equal to today."
      );
    }

    // Check if end_date is greater than or equal to start_date
    if (endDate < startDate) {
      // end_date must be greater than or equal to the start_date
      return ctx.throw(
        400,
        "The end date must be greater than or equal to the start date."
      );
    }

    // Check if start_date is equal to end_date and start_time is greater than or equal to end_time
    if (startDate === endDate && data.start_time >= data.end_time) {
      // start_time must be less than end_time when start_date is equal to end_date
      return ctx.throw(
        400,
        "The start time must be less than the end time when start date is equal to end date."
      );
    }
    let [hours, minutes] = data.start_time.split(":");

    // Créer un objet Date et définir l'heure et les minutes
    let date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(0); // Réinitialiser les secondes à zéro
    date.setMilliseconds(0); // Réinitialiser les millisecondes à zéro

    // Formatter l'objet Date au format HH:mm:ss.SSS
    const formattedStartTime = date.toISOString().slice(11, 23);
    [hours, minutes] = data.end_time?.split(":");

    // Créer un objet Date et définir l'heure et les minutes
    date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(0); // Réinitialiser les secondes à zéro
    date.setMilliseconds(0); // Réinitialiser les millisecondes à zéro

    // Formatter l'objet Date au format HH:mm:ss.SSS
    const formattedEndTime = date.toISOString().slice(11, 23);
    // Create the record in the database
    const response = await strapi.db.query(CONTROLLER_KEY).update({
      data: {
        name: data.name,
        price: data.price,
        promoting_info: data.promoting_info,
        name_promoter: data.name_promoter,
        description: data.description,
        partner: data.partner,
        category_events: data.category_events,
        total_bottles: data.total_bottles,
        total_seats: data.total_seats,
        remaining_seats: data.total_seats,
        remaining_bottles: data.total_bottles,
        start_date: startDate,
        start_time: formattedStartTime,
        end_date: endDate,
        end_time: formattedEndTime,
        location: data.location,
      },
      where: { id: data.id },
      populate: true,
    });
    // const response = await super.update(ctx);
    // await this.processFiles(ctx, response);
    return response;
  },
}));
