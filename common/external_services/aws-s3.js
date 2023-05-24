const AWS = require("aws-sdk");
const fs = require("fs");

const { logger } = require("../../logger");

const { aws } = require("../../config/config");

const ServiceError = require("../../utils/serviceError");

/**
 * Class Represent the service of S3 cloud service
 *
 * It is responsible to managing the S3 and its operations
 */
class S3Service {
  /**
   * Creates a new instance of S3 with default configs in env file
   */
  constructor() {
    if (!aws.upload) return;
    this.region = aws.region;
    // Set the Region
    AWS.config.update({ region: this.region, apiVersion: aws.apiVersion });
    AWS.config.getCredentials((err) => {
      if (err) logger.error(err.stack);
      logger.info("AWS credentials loaded successfully:");
    });
    this.s3 = new AWS.S3();
    this.defaultBucketName = aws.bucketName;
  }

  /**
   * Call AWS S3 to upload a new file using multipart buffer in from selected bucket
   * @param {string} localFilePath path of file to be uploaded to bucket
   * @param {string} key unique identifier for file
   * @param {string} bucketName Name of bucket
   * @return {Promise<string>} A  key uploaded object.
   */
  async uploadFile(localFilePath, key, bucketName = this.defaultBucketName) {
    const fileStream = fs.createReadStream(localFilePath);
    fileStream.on("error", (err) => {
      logger.error(`File Error ${err}`);
      throw err;
    });
    const uploadParams = { Bucket: bucketName, Key: key, Body: fileStream }; // ACL: 'public-read',
    if (!aws.upload) return null;
    const data = await this.s3.upload(uploadParams).promise();
    return data.Key;
  }

  /**
   * Call AWS S3 to get all files from selected bucket
   * @param {string} bucketName Name of bucket
   * @return {Promise<FilesList>} A promise with List of all objects.
   */
  async listObjects(bucketName = this.defaultBucketName) {
    if (!aws.upload) return null;
    const bucketParams = { Bucket: bucketName };

    const data = await this.s3.listObjectsV2(bucketParams).promise();

    return { count: data.KeyCount, data: data.Contents };
  }

  /**
   * Call AWS S3 to delete a file from selected bucket
   * @param {string} bucketName Name of bucket
   * @param {string} key key of file
   * @return {Promise<DeleteResponse>} A promise with response of delete API call.
   */
  async deleteObject(key, bucketName = this.defaultBucketName) {
    if (!aws.upload) return null;
    const bucketParams = {
      Bucket: bucketName,
      Key: key,
    };
    return new Promise((resolve, reject) => {
      this.s3.deleteObject(bucketParams, (err, data) => {
        if(err)
        reject(new ServiceError("Something went wrong"))
        resolve(data);
      });
    });
  }

  /**
   * Call AWS S3 to get a file from selected bucket
   * @param {string} key key of file
   * @param {string} bucketName Name of bucket
   * @return {string} the URL of file
   */
  getObjectUrl(key, bucketName = this.defaultBucketName) {
    if (!aws.upload) return null;
    const bucketParams = {
      Bucket: bucketName,
      Key: key,
      Expires: 60 * aws.urlExpiryInMinutes, // time in seconds
    };
    return this.s3.getSignedUrl("getObject", bucketParams);
  }

  /**
   * Call AWS S3 to retrieve the policy of selected bucket
   * @param {string} bucketName Name of bucket
   * @return {Promise<Policy>} A promise with policy of selected bucket.
   *
   * For More details to working with actions kindly refer to https://docs.aws.amazon.com/AmazonS3/latest/dev/using-with-s3-actions.html
   */
  getBucketPolicy(bucketName = this.defaultBucketName) {
    if (!aws.upload) return null;
    const bucketParams = {
      Bucket: bucketName,
    };
    return new Promise((resolve, reject) => {
      this.s3.getBucketPolicy(bucketParams, (err, data) => {
        if (err) reject(err);
        resolve(data.Policy);
      });
    });
  }

  /**
   * Call AWS S3 to update the policy of selected bucket
   * @param {string} bucketName Name of bucket
   * @param {JSON} policy Updated policy to be applied on bucket
   * @return {Promise<UpdateResult>} A promise with result of update API to AWS S3.
   *
   * For More details to working with actions kindly refer to https://docs.aws.amazon.com/AmazonS3/latest/dev/using-with-s3-actions.html
   */
  putBucketPolicy(bucketName = this.defaultBucketName, policy = null) {
    if (!aws.upload) return null;
    const newPolicy = policy || {
      Version: "2012-10-17",
      Statement: [
        {
          Sid: "VisualEditor0",
          Effect: "Allow",
          Action: ["s3:PutObject", "s3:GetObject"],
          Resource: [`arn:aws:s3:::${bucketName}/*`],
        },
        {
          Sid: "VisualEditor1",
          Effect: "Allow",
          Action: "s3:ListBucket",
          Resource: [
            `arn:aws:s3:::${bucketName}/*`,
            `arn:aws:s3:::${bucketName}`,
          ],
        },
      ],
    };
    // convert policy JSON into string and assign into params
    const bucketPolicyParams = {
      Bucket: bucketName,
      Policy: JSON.stringify(newPolicy),
    };

    return new Promise((resolve, reject) => {
      this.s3.putBucketPolicy(bucketPolicyParams, (err, data) => {
        if (err) reject(err);
        resolve(data);
      });
    });
  }

  /**
   * Call AWS S3 to delete the policy of selected bucket
   * @param {string} bucketName Name of bucket
   * @return {Promise<DeleteResult>} A promise with result of delete API to AWS S3.
   *
   * For More details to working with actions kindly refer to https://docs.aws.amazon.com/AmazonS3/latest/dev/using-with-s3-actions.html
   */
  deleteBucketPolicy(bucketName = this.defaultBucketName) {
    if (!aws.upload) return null;
    const bucketParams = { Bucket: bucketName };
    return new Promise((resolve, reject) => {
      this.s3.deleteBucketPolicy(bucketParams, (err, data) => {
        if (err) reject(err);
        resolve(data);
      });
    });
  }
}

module.exports = new S3Service();
