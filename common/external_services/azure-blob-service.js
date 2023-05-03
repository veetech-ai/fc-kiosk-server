const azure = require("azure-storage");
const config = require("../../config/config");
const { logger } = require("../../logger");
let blobService;
try {
  blobService = azure.createBlobService(config.azure.storageConnectionString);
} catch (error) {
  logger.error(
    "Azure storage config is missing - azure-blob-service.js",
    error.message,
  );
}

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
              resolve(path);
            }
          },
        );
      }
    });
  });
};

exports.getFileUrl = (path) => {
  return `${config.azure.storageURL}${container}/${path}`;
};
