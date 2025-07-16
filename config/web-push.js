// Import necessary modules
const { readFileSync, writeFileSync, existsSync } = require("fs");
const { join } = require("path");
const webpush = require("web-push");

// Define the path to the VAPID (Voluntary Application Server Identification) keys file
const pathToVapidKey = join(__dirname, "vapidKeys.json");

// Check if the VAPID keys file exists; if not, generate and save new keys
if (!existsSync(pathToVapidKey)) {
  const keys = webpush.generateVAPIDKeys();
  writeFileSync(pathToVapidKey, JSON.stringify(keys));
}

// Read and parse the VAPID keys from the file
const vapidKeys = JSON.parse(
  readFileSync(join(__dirname, "vapidKeys.json")).toString()
);

// Set up VAPID details for web push notifications
webpush.setVapidDetails(
  "mailto:example@yourdomain.org",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// Define a function to notify users with web push subscriptions
const notify = async (strapi, userID, data) => {
  // Retrieve user subscriptions with non-null web push subscriptions
  const userSubscriptions = await strapi.entityService.findMany(
    "api::user-notification-key.user-notification-key",
    {
      where: {
        user: {
          id: userID,
        },
      },
      filters: {
        subscription: {
          $notNull: true,
        },
      },
    }
  );
  // Iterate through each user and send a delayed web push notification
  userSubscriptions.forEach((userSubscription) => {
    setTimeout(() => {
      webpush
        .sendNotification(userSubscription.subscription, JSON.stringify(data))
        .then(() => {console.log("Notification sent", data)

      })
        .catch(console.error);
    }, 6000); // Delay of 6000 milliseconds (6 seconds) between notifications for each user
  });
};

// Export the webpush module and the notify function for external use
module.exports = {
  webpush,
  notify,
};
