const config = require("./config");

exports.get = (key) => {
  const app_config =
    typeof global_app_config !== "undefined" ? global_app_config : {};

  let logo = "https://www.cowlar.com/assets/img/web/CowlarLogo-2.png";
  if (app_config.logo) {
    logo = `${config.app.backendURL}files/images/logos/${app_config.logo}.png`;
  }

  const settings = {
    company_name:
      app_config.label_print_company_name || config.app.title || "Cowlar",
    company_website:
      app_config.label_print_company_website || "http://cowlar.com",
    company_phone: app_config.company_phone || "051-831-7562",
    company_email: app_config.company_email || "team@cowlar.com",
    company_address:
      app_config.company_address ||
      "Office 27 3rd Floor, Silver City Plaza, G-11 Markaz, Islamabad, Pakistan",
    company_about: app_config.company_about || "Cowlar",
    company_logo: logo,

    // Device History limits
    device_history_limit: parseInt(app_config.device_history_limit) || 200,
    recent_device_history_limit:
      parseInt(app_config.recent_device_history_limit) || 10,

    // Notifications limits
    unread_notification_limit:
      parseInt(app_config.unread_notification_limit) || 12,
    all_notifications_limit: parseInt(app_config.all_notifications_limit) || 50,

    // in MBs
    profile_image_max_size: parseFloat(app_config.profile_image_max_size) || 5,
    binary_file_max_size: parseFloat(app_config.binary_file_max_size) || 1,
    upload_file_max_size: parseFloat(app_config.upload_file_max_size) || 50,

    // Device forcefully offile interval | Note: IN SECONDS
    device_offline_interval_forcefully:
      parseInt(app_config.device_offline_interval_forcefully) || 10,

    // 11=sim-kiosk
    default_device_type: parseInt(app_config.default_device_type) || 24,

    // Billing
    device_trial_period: app_config.device_trial_period || false,
    device_grace_period: app_config.device_grace_period || false,
    default_grace_period: parseInt(app_config.default_grace_period) || 7, // days
    default_trial_period: parseInt(app_config.default_trial_period) || 30, // days
    bill_duration: 30, // days
    device_locked_due_bill_message:
      app_config.device_locked_due_bill_message ||
      "Bill not paid. Device is locked. You can't do this action.",

    fcm_token: config.fcmToken,

    mqtt_group: app_config.mqtt_group || config.mqtt.group || null,

    /**
     * 300 is in minutes
     * 300 = GMT+5 (Pakistan Time)
     */
    default_tz_for_device: {
      tz: config.timeZone,
    },

    // TFA = Two factor authentication. its value is in minutes
    TFA_code_length: 10, // must be even number
    TFA_code_expiray: 10,
    TFA_resend_tries_limit: 3,
    TFA_resend_tries_limit_time_interval: 30, // In minutes

    user_login_info_limit: 5,
  };

  return settings[key] ? settings[key] : app_config[key];
};
