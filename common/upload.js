const fs = require("fs");
const path = require("path");
const { uuid } = require("uuidv4");
const config = require("./../config/config");
const settings = require("../config/settings");
const server_upload = require("../common/server_upload");
// const azureUpload = require("./external_services/azure-blob-service");
const awsS3 = require("./external_services/aws-s3");
const uploadPath = "./public/uploads/";
const publicPath = "./public/";

/**
 * setting default uploading cloud from env
 *
 * If no configs provided it will upload all files to local server
 */
let defaultUploadOn;
if (config.isCloudUpload) {
  defaultUploadOn = config.aws.upload ? 3 : 2; // AWS has privilige if both clouds uploads are true
} else defaultUploadOn = 1; // self local server

exports.upload_path = uploadPath;
exports.public_path = publicPath;

const validateFile = (file, allowedExtension = [], maxSizeInMb = 5) => {
  const fileExtension = this.get_file_extension(file.name)
    .toLowerCase()
    .substring(1);
  if (allowedExtension.indexOf(fileExtension) === -1)
    throw {
      status: 400,
      message: `Only ${allowedExtension.join(", ")} files are allowed`,
    };
  const fileSizeInMb = file.size / 1000000;
  if (fileSizeInMb > maxSizeInMb) {
    throw {
      status: 400,
      message:
        "Too large file. File must be less than equal to " +
        maxSizeInMb +
        " MB",
    };
  }

  return true;
};
exports.uploadProfileImage = async (
  imageFile,
  userId,
  uploadOn = defaultUploadOn,
) => {
  try {
    const newpath = `${this.upload_path}users-profile-images/${userId}`;
    const fileName = this.rename_file(imageFile.name);
    if (!fs.existsSync(newpath)) fs.mkdirSync(newpath, { recursive: true });
    validateFile(
      imageFile,
      ["jpg", "jpeg", "png"],
      settings.get("profile_image_max_size"),
    );

    switch (uploadOn) {
      case 1:
        return await server_upload.upload(imageFile, `${newpath}/${fileName}`);
      // case 2:
      //   return await azureUpload.upload(
      //     imageFile,
      //     `users-profile-images/${userId}/${fileName}`,
      //   );
      case 3:
        return await awsS3.uploadFile(imageFile.path, uuid());
      default:
        throw {
          message:
            "The uploadOn parameter is not correct please correct it in params ",
        };
    }
  } catch (err) {
    throw err.status ? err : { message: err.message };
  }
};

exports.upload_binary = async (file, uploadOn = defaultUploadOn) => {
  try {
    const newPath = `${this.upload_path}fw`;
    const fileName = file.name;
    if (!fs.existsSync(newPath)) fs.mkdirSync(newPath, { recursive: true });
    validateFile(file, ["bin"], settings.get("binary_file_max_size"));

    switch (uploadOn) {
      case 1:
        return await server_upload.upload(file, `${newPath}/${fileName}`);
      // case 2:
      //   return await azureUpload.upload(file, `fw/${fileName}`);
      case 3:
        return await awsS3.uploadFile(file.path, uuid());
      default:
        throw {
          message:
            "The uploadOn parameter is not correct please correct it in params ",
        };
    }
  } catch (err) {
    throw err.status ? err : { message: err.message };
  }
};

exports.upload_file = async (
  file,
  path = "uploads/mix",
  allowed_extension = [],
) => {
  try {
    const self = this;
    const newpath = `${self.public_path}${path}`;
    const fileName = file.name;
    if (!fs.existsSync(newpath)) fs.mkdirSync(newpath, { recursive: true });
    validateFile(file, allowed_extension, settings.get("upload_file_max_size"));

    switch (defaultUploadOn) {
      case 1:
        return await server_upload.upload(file, `${newpath}/${fileName}`);
      // case 2:
      //   return await azureUpload.upload(file, `${path}/${fileName}`);
      case 3:
        return await awsS3.uploadFile(file.path, uuid());
      default:
        throw {
          message:
            "The defaultUploadOn parameter is not correct please correct it in env params ",
        };
    }
  } catch (err) {
    throw err.status ? err : { message: err.message };
  }
};

exports.rename_file = (filename) => {
  const extension = path.extname(filename);
  return `${Date.now()}${extension}`;
};

exports.get_file_extension = (filename) => {
  return path.extname(filename);
};

exports.getHost = () => {
  if (config.azure.upload) {
    return config.azure.storageURL;
  } else {
    return config.app.backendURL;
  }
};

exports.getFileURL = (key) => {
  const imagesWithCompleteUrl = [];

  if (!key) return null; // Return null if no key found

  if (typeof key === "string") {
    switch (defaultUploadOn) {
      case 1:
        return `${config.app.backendURL}${key}`.replace("./public/", "files/");
      // case 2:
      //   return azureUpload.getFileUrl(key);
      case 3:
        return awsS3.getObjectUrl(key);
      default:
        throw {
          message:
            "The defaultUploadOn parameter is not correct please correct it in env params ",
        };
    }
  }

  if (Array.isArray(key)) {
    for (const data of key) {
      switch (defaultUploadOn) {
        case 1:
          return `${config.app.backendURL}${key}`.replace(
            "./public/",
            "files/",
          );
        // case 2:
        //   return azureUpload.getFileUrl(key);
        case 3: {
          const imageWithCompleteUrl = awsS3.getObjectUrl(data);
          imagesWithCompleteUrl.push(imageWithCompleteUrl);
          break;
        }
        default:
          throw {
            message:
              "The defaultUploadOn parameter is not correct please correct it in env params ",
          };
      }
    }
    return imagesWithCompleteUrl;
  }
};

exports.uploadCourseImage = async (
  imageFile,
  courseId,
  uploadOn = defaultUploadOn,
) => {
  try {
    const newpath = `${this.upload_path}golf-courses-images/${courseId}`;
    const fileName = this.rename_file(imageFile.name);
    if (!fs.existsSync(newpath)) fs.mkdirSync(newpath, { recursive: true });
    validateFile(
      imageFile,
      ["jpg", "jpeg", "png"],
      settings.get("profile_image_max_size"),
    );

    switch (uploadOn) {
      case 1:
        return await server_upload.upload(imageFile, `${newpath}/${fileName}`);
      // case 2:
      //   return await azureUpload.upload(
      //     imageFile,
      //     `users-profile-images/${userId}/${fileName}`,
      //   );
      case 3:
        return await awsS3.uploadFile(imageFile.path, uuid());
      default:
        throw {
          message:
            "The uploadOn parameter is not correct please correct it in params ",
        };
    }
  } catch (err) {
    throw err.status ? err : { message: err.message };
  }
};
exports.uploadCourseImages = async (
  imageFiles,
  courseId,
  uploadOn = defaultUploadOn,
) => {
  try {
    const newpath = `${this.upload_path}golf-courses-images/${courseId}`;
    if (!fs.existsSync(newpath)) fs.mkdirSync(newpath, { recursive: true });

    const uploadedFiles = [];
    const isIterable = Symbol.iterator in Object(imageFiles);
    if (!isIterable) {
      return await this.uploadCourseImage(imageFiles, courseId, 3);
    }
    for (const imageFile of imageFiles) {
      validateFile(
        imageFile,
        ["jpg", "jpeg", "png"],
        settings.get("profile_image_max_size"),
      );
      const fileName = this.rename_file(imageFile.name);
      let uploadedFile;
      switch (uploadOn) {
        case 1:
          uploadedFile = await server_upload.upload(
            imageFile,
            `${newpath}/${fileName}`,
          );
          uploadedFiles.push(uploadedFile);
          break;
        // case 2:
        //   return await azureUpload.upload(
        //     imageFile,
        //     `users-profile-images/${userId}/${fileName}`,
        //   );
        case 3:
          uploadedFile = await awsS3.uploadFile(imageFile.path, uuid());
          uploadedFiles.push(uploadedFile);
          break;
        default:
          throw {
            message:
              "The uploadOn parameter is not correct please correct it in params ",
          };
      }
    }
    return uploadedFiles;
  } catch (err) {
    throw err.status ? err : { message: err.message };
  }
};

exports.uploadImageForCourse = async (
  imageFile,
  courseId,
  path = "golf-courses-images/",
  uploadOn = defaultUploadOn,
) => {
  if (!imageFile) return null;
  try {
    const newpath = `${this.upload_path}${path}${courseId}`;
    const fileName = this.rename_file(imageFile.name);
    if (!fs.existsSync(newpath)) fs.mkdirSync(newpath, { recursive: true });
    validateFile(
      imageFile,
      ["jpg", "jpeg", "png"],
      settings.get("profile_image_max_size"),
    );

    switch (uploadOn) {
      case 1:
        return await server_upload.upload(imageFile, `${newpath}/${fileName}`);
      // case 2:
      //   return await azureUpload.upload(
      //     imageFile,
      //     `users-profile-images/${userId}/${fileName}`,
      //   );
      case 3:
        return await awsS3.uploadFile(imageFile.path, uuid());
      default:
        throw {
          message:
            "The uploadOn parameter is not correct please correct it in params ",
        };
    }
  } catch (err) {
    throw err.status ? err : { message: err.message };
  }
};