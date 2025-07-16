"use strict";

/**
 * villa controller
 */

const { createCoreController } = require("@strapi/strapi").factories;
const CONTROLLER_KEY = "api::villa.villa";
const FILE_FIELD = "photos";
module.exports = createCoreController(CONTROLLER_KEY, ({ strapi }) => ({
  async processFiles(ctx, response) {
    if (ctx.is("multipart") && response) {
      const { files } = ctx.request;
      // Iterate over the uploaded files
      const fileValues = Object.values(files);
      if (fileValues.length > 1) {
        // If there are multiple files, use the nested loop
        fileValues.forEach(async (file) => {
          Object.values(file).forEach(async (fil) => {
            // Upload the file and associate it with the created entry
            await strapi.plugins.upload.services.upload.upload({
              data: {
                refId: response.id,
                ref: CONTROLLER_KEY,
                field: FILE_FIELD,
              },
              files: {
                path: fil.path,
                name: fil.name,
                type: fil.type, // mime type of the file
                size: fil.size,
              },
            });
          });
        });
      } else if (fileValues.length === 1) {
        // If there is only one file, directly process it
        const singleFile = fileValues[0];
        // Upload the file and associate it with the created entry
        await strapi.plugins.upload.services.upload.upload({
          data: {
            refId: response.id,
            ref: CONTROLLER_KEY,
            field: FILE_FIELD,
          },
          files: {
            path: singleFile.path,
            name: singleFile.name,
            type: singleFile.type, // mime type of the file
            size: singleFile.size,
          },
        });
      }
    }
  },
  async create(ctx) {
    const response = await super.create(ctx);
    await this.processFiles(ctx, response);
    return response;
  },
  async update(ctx) {
    const response = await super.update(ctx);
    await this.processFiles(ctx, response);
    return response;
  },
  async changeAvailability(ctx) {
    const { body } = ctx.request;
    const response = await strapi.db.query(CONTROLLER_KEY).update({
      data: {
        available: body.data.available,
      },
      where: {
        id: body.data.id,
      },
    });
    return response;
  },
}));
