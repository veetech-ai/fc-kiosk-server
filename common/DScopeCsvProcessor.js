const fs = require("fs");
const csv = require("fast-csv");
const moment = require("moment-timezone");

async function removeDuplicateMaxHeaders(csvFilePath) {
  const arrays = [];
  let headers, indexesOfMax, headersModified;

  return new Promise((resolve, reject) => {
    const csvOptions = { comment: "#" };
    const stream = fs.createReadStream(csvFilePath);
    stream.on("error", (err) => reject(err));

    csv
      .parseStream(stream, csvOptions)
      .on("error", (error) => reject("ERROR:", error))
      .on("data", (row) => {
        if (row[0] != -1) arrays.push(row);
      })
      .on("end", (rowCount) => {
        if (arrays.length === 0) return reject(new Error("File is empty!"));
        headers = arrays[0];
        indexesOfMax = headers.reduce((a, e, i) => {
          if (e === "max") a.push(i);
          return a;
        }, []);
        headersModified = headers;
        indexesOfMax.forEach((indexOfMax) => {
          headersModified[indexOfMax] = `${headersModified[indexOfMax - 1]} ${
            headersModified[indexOfMax]
          }`;
        });
        resolve(headersModified);
      });
  });
}

function replaceSpecialCharacters(array) {
  const data = array.map((header) => {
    return header.replace(/�m/g, "u").replace(/µm/g, "u").replace(/µ/g, "u");
  });
  return data;
}

function removeStringFormatters(array) {
  const escapedArray = array.map((header) => {
    return header.replace(/\n/g, " ").replace(/\r/g, "");
  });
  return escapedArray;
}

async function getCsvData(csvFilePath) {
  const headers = await removeDuplicateMaxHeaders(csvFilePath);
  const headerFormattersEscaped = removeStringFormatters(headers);
  const headersEscaped = replaceSpecialCharacters(headerFormattersEscaped);
  // use the headers to parse the file again with rename headers set to true to get the data
  return new Promise((resolve, reject) => {
    const data = [];
    const stream = fs.createReadStream(csvFilePath);
    stream.on("error", (err) => reject(err));

    const csvOptions = {
      headers: headersEscaped,
      renameHeaders: true,
      comment: "#",
    };
    csv
      .parseStream(stream, csvOptions)
      .on("error", (error) => reject("ERROR:", error))
      .on("data", (row) => {
        if (Object.values(row)[0] != -1) data.push(row);
      })
      .on("end", (rowCount) => {
        resolve(data);
      });
  });
}

function formatBooleans(data, arrayOfKeys) {
  arrayOfKeys.forEach((key) => {
    if (Object.keys(data).includes(key)) {
      if (data[key] === "false" || data[key] === "FALSE") {
        data[key] = "fail";
      } else if (data[key] === "true" || data[key] === "TRUE") {
        data[key] = "pass";
      } else {
        data[key] = "unknown";
      }
    }
  });
}

// ================================ Done line ================================
function formatNumbers(data, arrayOfKeys) {
  // Check if the key exists
  // Check if the value is ''
  // Check if the value is '-'
  arrayOfKeys.forEach((key) => {
    if (Object.keys(data).includes(key)) {
      if (data[key] !== "" && data[key] !== "-") {
        data[key] = Number(data[key]);
      }
    }
  });
}
function formatCsv(data, timezone = "America/Chicago") {
  const formattedData = data.map((item) => {
    const expectedDataObject = () => {
      const itemClone = item;

      delete itemClone.Date;
      delete itemClone["Serial number"];
      delete itemClone["Station s/n"];
      delete itemClone["PASS/FAIL_globalpass"];
      delete itemClone["Sample name"];
      delete itemClone.Operator;

      return itemClone;
    };

    const timeparsed = moment
      .parseZone(item.Date, "YYYY-MM-DD, h:mm:ss")
      .format("YYYY-MM-DD HH:mm:ss");
    const timeUtc = moment.tz(timeparsed, timezone).toISOString();

    const keysToFormatToBoolean = [
      "Zone D scratches_pass",
      "Zone C scratches_pass",
      "PASS/FAIL_globalpass",
      "Zone A scratches_pass",
      "Zone A defects_pass",
      "Zone B scratches <3u_pass",
      "Zone B scratches >3u_pass",
      "Zone B defects <2u_pass",
      "Zone B defects 2 to 5u_pass",
      "Zone B defects >5u_pass",
      "Zone C defects_pass",
      "Zone D defects <10u_pass",
      "Zone D defects >10u_pass",
      // extra headers
      "Zone B defects >4u_pass",
      "Zone B defects 2 to 4u_pass",
      "Zone B scratches >2u_pass",
      "Zone B scratches <2u_pass",
    ];
    formatBooleans(item, keysToFormatToBoolean);
    const keysToFormatToNumbers = [
      "Zone D scratches",
      "Zone C scratches",
      "Serial number",
      "Zone A scratches",
      "Zone D defects <10u",
      "Zone D defects >10u",
      "Zone C defects",
      "Zone B defects >4u",
      "Zone B defects 2 to 4u",
      "Zone B defects <2u",
      "Zone B scratches >2u",
      "Zone B scratches <2u",
      "Zone A defects",
      "Zone B scratches <3u",
      "Zone B scratches >3u",
      "Zone B defects 2 to 5u",
      "Zone B defects >5u",
    ];

    formatNumbers(item, keysToFormatToNumbers);

    const expectedData = {
      date: timeUtc,
      serialNo: item["Serial number"],
      stationSerialNo: item["Station s/n"],
      globalPass: item["PASS/FAIL_globalpass"],
      sampleName: item["Sample name"],
      operator: item.Operator,
      ...expectedDataObject(),
    };
    return expectedData;
  });
  return formattedData;
}

async function DScopeCsvProcessor(csvFilePath) {
  try {
    const data = await getCsvData(csvFilePath);
    const formattedData = formatCsv(data);
    // loop over data and use services to add data to the database

    return formattedData;
  } catch (error) {
    if (error.code === "ENOENT")
      throw new Error("CSV Not Found!\n Please check the path\n");
    throw error;
  }
}

module.exports = {
  DScopeCsvProcessor,
};
/*
    Example Usage In File
    const csvPath = './data/Inspection-history_2021-07-02_07-02-50.csv',
    addDataToDatabase(csvPath)
*/
