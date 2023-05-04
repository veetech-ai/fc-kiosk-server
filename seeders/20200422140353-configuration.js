"use strict";
const config = require("./../config/config");

module.exports = {
  up: (queryInterface, Sequelize) => {
    const default_config = {
      logo: 3,
      logo_bg: false,
      theme_skin: false,
      color_scheme: 2,
      choose_sizes: 1,
      footer_text: `2020 © ${config.app.title}`,
      fb: "",
      twitter: "",
      google: "",
      account_layout: 2,
      loader: 1,
      slack_notifications: true,
      product_type: false,
      device_trial_period: true,
      device_grace_period: true,
      device_history_limit: "200",
      recent_device_history_limit: "10",
      unread_notification_limit: "12",
      all_notifications_limit: "50",
      profile_image_max_size: "5",
      binary_file_max_size: "2",
      upload_file_max_size: "50",
      bill_duration: "30",
      device_locked_due_bill_message:
        "Bill not paid. Device is locked. You can't do this action.",
      default_grace_period: "7",
      default_trial_period: "30",
      schedules_allow_per_day: "10",
      label_print_company_name: `${config.app.title}`,
      label_print_company_website: `${config.app.frontendURL}`,
      company_about: "We are best with our services",
      company_address:
        "7340 S. Kyrene Rd. • Suite 101 • Tempe, AZ 85283",
      company_phone: "+92 (51) 831 7562",
      company_email: "dev@veetech.ai",
      company_timing: "9:00 AM to 5:00 PM",
      fb_auth: false,
      gmail_auth: false,
      twitter_auth: false,
    };

    const config_arr = [
      {
        id: 1,
        config: JSON.stringify(default_config),
        orgId: null,
      },
    ];

    return queryInterface.bulkInsert("Configurations", config_arr, {
      updateOnDuplicate: ["id", "config", "orgId"],
    });
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
  },
};
