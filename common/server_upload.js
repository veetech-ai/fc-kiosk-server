const mv = require("mv");
const config = require("../config/config");

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
