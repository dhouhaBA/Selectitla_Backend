module.exports = {
  routes: [
    {
      method: "POST",
      path: "/userNotification/subscribe",
      handler: "user-notification-key.subscribe",
    },
    {
      method: "POST",
      path: "/userNotification/unsubscribe",
      handler: "user-notification-key.unsubscribe",
    },

  ],
};
