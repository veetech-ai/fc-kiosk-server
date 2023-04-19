const apiResponse = require("../common/api.response");
const config = require("../config/config");

exports.index = (req, res) => {
  try {
    const data = `Welcome to ${config.app.title}`;
    // res.json(data);
    res.writeHead(200, {
      "Content-Type": "text/html",
      "Content-Length": data.length,
    });
    res.write(data);
  } catch (err) {
    apiResponse.fail(res, err.message, 500);
  }
};
