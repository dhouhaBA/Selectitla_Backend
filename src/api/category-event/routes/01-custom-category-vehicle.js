module.exports = {
  routes: [
    {
      method: "GET",
      path: "/category-events/category/:name",
      handler: "category-event.findByName",
    },
  ],
};
