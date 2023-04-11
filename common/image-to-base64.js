// Inspiration Code: https://github.com/renanbastos93/image-to-base64/blob/master/image-to-base64.js
const fileSystem = require("fs");
const path = require("path");
const helper = require("./helper");

function validUrl(url) {
  return /http(s)?:\/\/(\w+:?\w*@)?(\S+)(:\d+)?((?<=\.)\w+)+(\/([\w#!:.?+=&%@!\-/])*)?/gi.test(
    url,
  );
}

function validTypeImage(image) {
  return /(?<=\S+)\.(jpg|png|jpeg)/gi.test(image);
}

function base64ToNode(buffer) {
  return buffer.toString("base64");
}

function readFileAndConvert(fileName) {
  if (fileSystem.statSync(fileName).isFile()) {
    return base64ToNode(
      fileSystem.readFileSync(path.resolve(fileName)).toString("base64"),
    );
  }
  return null;
}

function isImage(urlOrImage) {
  if (validTypeImage(urlOrImage)) {
    return Promise.resolve(readFileAndConvert(urlOrImage));
  } else {
    return Promise.reject(
      "[*] An error occurred: Invalid image [validTypeImage === false]",
    );
  }
}

exports.imageToBase64 = async (urlOrImage) => {
  if (validUrl(urlOrImage)) {
    return helper
      .fetch(urlOrImage)
      .then((response) => {
        return response;
      })
      .then(base64ToNode);
  } else {
    return isImage(urlOrImage);
  }
};
