module.exports = ({ env }) => ({
  email: {
    config: {
      provider: "nodemailer",
      providerOptions: {
        host: env("SMTP_HOST"),
        port: env("SMTP_PORT"),
        auth: {
          user: env("SMTP_USERNAME"),
          pass: env("SMTP_PASSWORD"),
        },
        pool: true,
        logger: true,
        debug: true,
        maxConnections: 10000,
      },

      settings: {
        defaultFrom: env("DEFAULT_EMAIL"),
        defaultReplyTo: env("DEFAULT_EMAIL"),
      },
    },
  },
  "users-permissions": {
    enabled: true,
    config: {
      jwt: {
        expiresIn: process.env.JWT_SECRET_EXPIRES,
      },
    },
  },
});
