const marked = require("marked");
module.exports = {
  "* * * 01 * *": async ({ strapi }) => {
    //console.log("cron running");
    // try {
    //   let emails = await strapi.db
    //     .query("api::email-template.email-template")
    //     .findOne({
    //       select: ["subject", "content"],
    //     });
    //   console.log(emails);
    //   const subscribers = await strapi.db
    //     .query("api::customer.customer")
    //     .findMany({
    //       select: ["name", "surname"],
    //       populate: { user: true },
    //     });

    //   //       const content = marked.parse(emails[0].Content);
    //   await Promise.all(
    //     //subscribers.data.map(async (el, i) => {
    //     await strapi.plugin("email").service("email").send({
    //       to: "rawianem@gmail.com",
    //       subject: emails.subject,
    //       html: emails.Content,
    //     })
    //     //  })
    //   );
  //   } catch (error) {
  //     console.log(error);
  //   }
   },
};
