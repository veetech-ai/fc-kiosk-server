const azure = require("azure-storage");
const config = require("../config/config");
const blobService = azure.createBlobService(
  config.azure.storageConnectionString,
);

const container = config.azure.storageContainer;

exports.upload = (file, path) => {
  return new Promise((resolve, reject) => {
    blobService.createContainerIfNotExists(container, (error) => {
      if (error) {
        reject({ message: error });
      } else {
        blobService.createBlockBlobFromLocalFile(
          container,
          path,
          file.path,
          (error, result) => {
            if (error) {
              reject({ message: error });
            } else {
              resolve(`${config.azure.storageURL}${container}/${path}`);
            }
          },
        );
      }
    });
  });
};
