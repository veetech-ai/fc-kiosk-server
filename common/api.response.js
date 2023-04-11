const zlib = require("zlib");
const jsonSize = require("json-size");

/**
 * Sends the formatted response with status code and body
 * @param {Express.Response} res Response instance from express.js
 * @param {Express.Request} req Request instance from express.js
 * @param {{[fieldName: string]: any}} data Data to send with response
 * @param {200 | 201 | 204} status Http status code for success
 * @returns any
 */
module.exports.success = function (res, req, data, status = 200) {
  const formattedResponse = {
    success: true,
    data: data,
    // data_size_bytes: jsonSize(data)+ ' Bytes',
    // data_size_killo_bytes: jsonSize(data)/1000+ ' KB',
    // data_size_mega_bytes: jsonSize(data)/1000000 + ' MB',
  };
  if (req.query && req.query.ct && req.query.ct == 1) {
    // const data_size_mega_bytes = jsonSize(data) / 1000000
    if (jsonSize(data) > 2000) {
      // Greater than 1 MB then apply GZIP
      res.writeHead(status, {
        "Content-Type": "application/json",
        "Content-Encoding": "gzip",
      });
      // const buf = new Buffer(JSON.stringify(formattedResponse), 'utf-8');
      const buf = Buffer.from(JSON.stringify(formattedResponse), "utf-8");
      zlib.gzip(buf, function (_, result) {
        res.end(result);
      });
    } else {
      return res.status(status).send(formattedResponse);
    }
  } else {
    return res.status(status).send(formattedResponse);
  }
};

module.exports.pagination = function (res, req, data, total_records) {
  res.setHeader("total-records", total_records);
  return this.success(res, req, data);
};

module.exports.success_with_headers = function (res, req, data, headers) {
  if (headers.length > 0) {
    for (let i = 0; i < headers.length; i++) {
      res.setHeader(headers[i].key, headers[i].value);
    }
  }
  return this.success(res, req, data);
};

module.exports.fail = function (res, data, status = 400) {
  if (status === 403 && (data == "" || !data)) data = "You are not allowed";
  if (status === 401 && (data == "" || !data)) data = "Unauthorized";
  const formattedResponse = {
    success: false,
    data: data,
  };

  return res.status(status).send(formattedResponse);
};

module.exports.redirect = function (res, link, status = 301) {
  return res.status(status).redirect(link);
};
