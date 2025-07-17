"use strict";

const CONTROLLER_KEY = "api::event.event";
const FILE_FIELD = "photos";

module.exports = ({ strapi }) => ({
  async processFiles(ctx, response) {
    if (typeof ctx.is === "function" && ctx.is("multipart") && response) {
      const { files } = ctx.request;
      const fileValues = Object.values(files || {});
      const singleFile = fileValues[0];
      if (singleFile) {
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
    const { body, files } = ctx.request;
    const data = body;

    const currentDate = new Date();
    const currentDateFormatted = currentDate.toISOString().split("T")[0];
    const startDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);

    if (data.start_date < currentDateFormatted) {
      return ctx.throw(400, "The start date must be greater than or equal to today.");
    }

    if (endDate < startDate) {
      return ctx.throw(400, "The end date must be greater than or equal to the start date.");
    }

    if (
      startDate.toDateString() === endDate.toDateString() &&
      data.start_time >= data.end_time
    ) {
      return ctx.throw(400, "The start time must be less than the end time when start date is equal to end date.");
    }

    const formatTime = (t) => {
      const [h, m] = t.split(":");
      const d = new Date();
      d.setHours(h, m, 0, 0);
      return d.toISOString().slice(11, 23);
    };

    const formattedStartTime = formatTime(data.start_time);
    const formattedEndTime = formatTime(data.end_time);

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

    await this.processFiles(ctx, response);
    return response;
  },

  async update(ctx) {
    const { body } = ctx.request;
    const data = body;

    const currentDate = new Date();
    const currentDateFormatted = currentDate.toISOString().split("T")[0];
    const startDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);

    if (data.start_date < currentDateFormatted) {
      return ctx.throw(400, "The start date must be greater than or equal to today.");
    }

    if (endDate < startDate) {
      return ctx.throw(400, "The end date must be greater than or equal to the start date.");
    }

    if (
      startDate.toDateString() === endDate.toDateString() &&
      data.start_time >= data.end_time
    ) {
      return ctx.throw(400, "The start time must be less than the end time when start date is equal to end date.");
    }

    const formatTime = (t) => {
      const [h, m] = t.split(":");
      const d = new Date();
      d.setHours(h, m, 0, 0);
      return d.toISOString().slice(11, 23);
    };

    const formattedStartTime = formatTime(data.start_time);
    const formattedEndTime = formatTime(data.end_time);

    const response = await strapi.db.query(CONTROLLER_KEY).update({
      where: { id: data.id },
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
      populate: true,
    });

    return response;
  },
});
