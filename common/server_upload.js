const mv = require("mv");
const config = require("../config/config");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");

exports.upload = (file, file_name) => {
  return new Promise((resolve, reject) => {
    try {
      mv(file.path, file_name, function (err) {
        if (err) {
          reject({ message: err });
        } else {
          const file = `${config.app.backendURL}${file_name}`.replace(
            "./public/",
            "files/",
          );
          resolve(file);
        }
      });
    } catch (err) {
      reject({ message: err });
    }
  });
};

exports.uploadv1 = (file, directory = "") => {
  return new Promise((resolve, reject) => {
    try {
      const uuid = uuidv4();
      const ext = file.name.split(".").pop();
      const fileName = `${uuid}.${ext}`;
      const filePath = `files/${directory}${fileName}`; // Change the path as needed

      fs.rename(file.path, filePath, (err) => {
        if (err) reject(err.message);

        const fileUrl = `${config.app.backendURL}${filePath}`;
        resolve({ uuid, fileUrl });
      });
    } catch (err) {
      reject(err.message);
    }
  });
};

// in IA project
// exports.upload = (file, fileName) => {
//   return new Promise((resolve, reject) => {
//     mv(file.path, fileName, (err) => {
//       if (err) {
//         reject({ message: err });
//       } else {
//         resolve(fileName);
//       }
//     });
//   });
// };
