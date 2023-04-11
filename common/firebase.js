const settings = require("../config/settings");
const axios = require("axios");

const { logger } = require("../logger");

exports.send = async (data) => {
  if (!data.topic || !data.message) {
    throw { message: "Topic or title not found" };
  } else {
    const message = {
      notification: {
        title: data.title || settings.get("company_name"),
        body: data.message,
      },
      to: `/topics/${data.topic}`,
    };

    if (data.data) {
      message.data = data.data;
    }

    try {
      const response = await await axios.post(
        "https://fcm.googleapis.com/fcm/send",
        message,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `key=${settings.get("fcm_token")}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      logger.error(error.message);
      throw error;
    }
  }
};
