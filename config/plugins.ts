export default ({ env }) => ({
  // email: {
  //   config: {
  //     provider: "mailgun",
  //     providerOptions: {
  //       key: env("MAILGUN_API_KEY"), // Required
  //       domain: env("MAILGUN_DOMAIN"), // Required
  //       url: env("MAILGUN_URL", "https://api.mailgun.net"), //Optional. If domain region is Europe use 'https://api.eu.mailgun.net'
  //     },
  //     settings: {
  //       defaultFrom: env("EMAIL_DEFAULT_FROM"),
  //       defaultReplyTo: env("EMAIL_DEFAULT_REPLY_TO"),
  //     },
  //   },
  // },

  email: {
    config: {
      provider: "amazon-ses",
      providerOptions: {
        key: env("AWS_SES_ACCESS_KEY"),
        secret: env("AWS_SES_SECRET_KEY"),
        amazon: `https://email.${env("AWS_SES_REGION")}.amazonaws.com`,
      },
      settings: {
        defaultFrom: env("EMAIL_DEFAULT_FROM"),
        defaultReplyTo: env("EMAIL_DEFAULT_REPLY_TO"),
      },
    },
  },
});
