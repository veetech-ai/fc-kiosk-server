const Validator = require("validatorjs");
const apiResponse = require("../../common/api.response");
const ServiceError = require("../../utils/serviceError");

const tileService = require("./../../services/kiosk/tiles");
const helper = require("../../common/helper");
const formidable = require("formidable");
const { upload_file, getFileURL } = require("../../common/upload");
const config = require("../../config/config");

Validator.prototype.firstError = function () {
  const fields = Object.keys(this.rules);
  for (let i = 0; i < fields.length; i++) {
    const err = this.errors.first(fields[i]);
    if (err) return err;
  }
};

/**
 * @swagger
 * tags:
 *   name: Tiles
 *   description: Tile Management APIs
 */
exports.create = async (req, res) => {
  /**
   * @swagger
   *
   * /tiles:
   *   post:
   *     security:
   *       - auth: []
   *     description: Create a new Tile.
   *     tags: [Tiles]
   *     consumes: multipart/form-data
   *     parameters:
   *       - in: formData
   *         name: name
   *         description: The name of the custom tile
   *         required: true
   *         type: string
   *
   *       - in: formData
   *         name: bgImage
   *         description: The background image for the tile
   *         required: false
   *         type: file
   *
   *       - in: formData
   *         name: isPublished
   *         description: Published status of tile, set it to true to publish it right away
   *         required: false
   *         type: string
   *
   *       - in: formData
   *         name: isSuperTile
   *         description: Make this tile a big tile on kiosk?
   *         required: false
   *         type: string
   *
   *       - in: formData
   *         name: order
   *         description: The order of the tile in tiles list
   *         required: false
   *         type: string
   *
   *       - in: formData
   *         name: layoutNumber
   *         description: The layout number to use for this tile
   *         required: false
   *         type: string
   *
   *       - in: formData
   *         name: gcId
   *         description: The id of the golf course
   *         required: true
   *         type: integer
   *
   *       - in: formData
   *         name: layoutData
   *         description: The content of the layout in JSON form
   *         required: false
   *         type: string
   *
   *       - in: formData
   *         name: layoutImages
   *         description: The array of image of used in layout
   *         required: false
   *         type: array
   *         items:
   *            type: file
   *
   *     produces:
   *       - application/json
   *     responses:
   *       201:
   *         description: Created
   *       400:
   *         description: Request body is not valid
   *       404:
   *         description: Golf course with gcId not found
   *       500:
   *         description: Something went wrong on server side
   */

  try {
    const form = new formidable.IncomingForm({
      maxFileSize: 1 * 1024 * 1024, // 1MB
      multiples: true,
    });

    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          let errMsg = err.message;
          if (err.message.includes("maxFileSize exceeded")) {
            errMsg = "The size of signature image can not exceed 1MB";
          }
          reject(new ServiceError(errMsg, 400));
        }

        resolve({ fields, files });
      });
    });

    const validation = new Validator(fields, {
      name: "required|string",
      gcId: "required|integer",
      bgImage: "string",
      isSuperTile: "boolean",
      isPublished: "boolean",
      layoutNumber: "integer",
      layoutData: "string",
    });

    if (validation.fails()) {
      throw new ServiceError(validation.firstError(), 400);
    }

    try {
      if (fields.layoutData) {
        const json = JSON.parse(fields.layoutData);
        if (Object.keys(json).length < 1) {
          throw new ServiceError(
            "The layouData object must have atleast one key",
            400,
          );
        }
      }
    } catch (err) {
      const msg = err.message || "Got invalid JSON string for layoutData";
      throw new ServiceError(msg, 400);
    }

    const { bgImage, layoutImages } = files;
    const allowedTypes = ["jpg", "jpeg", "png", "webp"];

    if (bgImage) {
      fields.bgImage = await upload_file(
        bgImage,
        `uploads/tiles`,
        allowedTypes,
      );
    }

    if (layoutImages) {
      if (Array.isArray(layoutImages)) {
        const promises = [];

        for (const image of layoutImages) {
          promises.push(upload_file(image, `uploads/tiles`, allowedTypes));
        }

        fields.layoutImages = await Promise.all(promises);
      } else {
        fields.layoutImages = [
          await upload_file(layoutImages, `uploads/tiles`, allowedTypes),
        ];
      }
    }

    if (Array.isArray(fields.layoutImages)) {
      fields.layoutImages = JSON.stringify(fields.layoutImages);
    }

    const tile = await tileService.create(fields);

    helper.mqtt_publish_message(
      `ta/${fields.gcId}/created`,
      { tileId: tile.id },
      false,
    );

    return apiResponse.success(res, req, tile, 201);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};

exports.changeOrder = async (req, res) => {
  /**
   * @swagger
   *
   * /tiles/{id}/order:
   *   patch:
   *     security:
   *       - auth: []
   *     description: Create a Tile.
   *     tags: [Tiles]
   *     consumes:
   *       - application/json
   *     parameters:
   *        - in: path
   *          name: id
   *          description: id of the tile to move
   *
   *        - in: body
   *          name: body
   *          description: >
   *            * `newOrder`: New position of the tile.
   *
   *            * `gcId`: ID of the golf course?
   *
   *          schema:
   *             type: object
   *             required:
   *                - newOrder
   *                - gcId
   *             properties:
   *                newOrder:
   *                   type: number
   *                   default: 1
   *
   *                gcId:
   *                   type: number
   *                   default: 1
   *
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   *       400:
   *         description: Request body is not valid
   *       404:
   *         description: Golf course or tile not found
   *       500:
   *         description: Something went wrong on server side
   */

  try {
    const paramValidation = new Validator(req.params, {
      id: "required|integer",
    });

    const bodyValidation = new Validator(req.body, {
      newOrder: "required|integer",
      gcId: "required|integer",
    });

    if (paramValidation.fails()) {
      throw new ServiceError(paramValidation.firstError(), 400);
    }

    if (bodyValidation.fails()) {
      throw new ServiceError(bodyValidation.firstError(), 400);
    }

    const data = await tileService.updateOrder(
      req.params.id,
      req.body.gcId,
      req.body.newOrder,
    );

    helper.mqtt_publish_message(`ta/${req.body.gcId}/order`, data, false);

    return apiResponse.success(res, req, data, 200);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};

exports.getAll = async (req, res) => {
  /**
   * @swagger
   *
   * /tiles:
   *   get:
   *     security:
   *       - auth: []
   *     description: Create a Tile.
   *     tags: [Tiles]
   *     parameters:
   *       - name: builtInOnly
   *         in: query
   *         description: Get built-in tiles only, if it is set to true
   *         default: true
   *         type: boolean
   *
   *       - name: page
   *         in: query
   *         description: page number
   *         required: false
   *         default: 1
   *         type: integer
   *
   *       - name: size
   *         in: query
   *         description: page size
   *         required: false
   *         default: 10
   *         type: integer
   *
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   *       500:
   *         description: Something went wrong on server side
   */

  try {
    const validation = new Validator(req.query, {
      builtInOnly: "boolean",
      page: "integer",
      size: "integer",
    });

    if (validation.fails()) {
      throw new ServiceError(validation.firstError(), 400);
    }

    const paginationOptions = helper.get_pagination_params({
      limit: req.query.size || 10,
      page: req.query.page || 1,
    });

    const data = await tileService.get({
      where: { builtIn: req.query.builtInOnly == "true" },
      paginationOptions,
    });

    if (data.tiles) {
      data.tiles.forEach((tile) => {
        if (tile.bgImage) tile.bgImage = getFileURL(tile.bgImage);
      });
    }

    return apiResponse.success(
      res,
      req,
      { ...data, pagination: paginationOptions },
      200,
    );
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};

exports.getOne = async (req, res) => {
  /**
   * @swagger
   *
   * /tiles/{id}:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get the data of a tile.
   *     tags: [Tiles]
   *     parameters:
   *        - name: id
   *          in: path
   *          description: id of the tile
   *
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   *       500:
   *         description: Something went wrong on server side
   */

  try {
    const paramValidation = new Validator(req.params, {
      id: "required|integer",
    });

    if (paramValidation.fails()) {
      throw new ServiceError(paramValidation.firstError(), 400);
    }
    const data = await tileService.getOne({ id: req.params.id });

    // if (!data.tile.builtIn) {
    // can get the images for builtIn tiles as well
    const tileImage = data.tile.bgImage;
    const layoutImages = data.tileData.layoutImages;

    if (tileImage) data.tile.bgImage = getFileURL(tileImage);

    if (layoutImages) {
      data.tileData.layoutImages = JSON.parse(layoutImages).map((url) =>
        getFileURL(url),
      );
    }
    // }

    return apiResponse.success(res, req, data, 200);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};

exports.getCourseTiles = async (req, res) => {
  /**
   * @swagger
   *
   * /tiles/course/{id}:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get tiles of a course.
   *     tags: [Tiles]
   *     parameters:
   *        - name: id
   *          in: path
   *          description: id of the golf course
   *
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   *       500:
   *         description: Something went wrong on server side
   */

  try {
    const paramValidation = new Validator(req.params, {
      id: "required|integer",
    });

    if (paramValidation.fails()) {
      throw new ServiceError(paramValidation.firstError(), 400);
    }
    const tile = await tileService.getCourseTiles(req.params.id);

    tile.forEach((tile) => {
      if (tile.Tile.bgImage) tile.Tile.bgImage = getFileURL(tile.Tile.bgImage);
    });

    return apiResponse.success(res, req, tile, 200);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};

exports.updateTile = async (req, res) => {
  /**
   * @swagger
   *
   * /tiles/{id}:
   *   patch:
   *     security:
   *       - auth: []
   *     description: Update tile information.
   *     tags: [Tiles]
   *     consumes: multipart/form-data
   *     parameters:
   *       - in: path
   *         name: id
   *         description: The id of the custom tile
   *         required: true
   *         type: string
   *
   *       - in: formData
   *         name: name
   *         description: The name of the custom tile
   *         required: true
   *         type: string
   *
   *       - in: formData
   *         name: bgImage
   *         description: The background image for the tile
   *         required: false
   *         type: file
   *
   *       - in: formData
   *         name: isPublished
   *         description: Published status of tile, set it to true to publish it right away
   *         required: false
   *         type: string
   *
   *       - in: formData
   *         name: layoutNumber
   *         description: The layout number to use for this tile
   *         required: false
   *         type: string
   *
   *       - in: formData
   *         name: gcId
   *         description: The id of the golf course
   *         required: true
   *         type: integer
   *
   *       - in: formData
   *         name: layoutData
   *         description: The content of the layout in JSON form
   *         required: false
   *         type: string
   *
   *       - in: formData
   *         name: layoutImages
   *         description: The JSON array of new images for this layout
   *         required: false
   *         type: array
   *         items:
   *            type: file
   *
   *       - in: formData
   *         name: layoutImagesUrls
   *         description: The JSON array of urls of existing images, provide urls of the images here, that need to be kept while updating the layout
   *         required: false
   *         type: string
   *
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   *       400:
   *         description: Request body is not valid
   *       404:
   *         description: Golf course or tile not found
   *       500:
   *         description: Something went wrong on server side
   */

  try {
    const form = new formidable.IncomingForm({
      maxFileSize: 1 * 1024 * 1024, //1MB
      multiples: true,
    });

    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          let errMsg = err.message;
          if (err.message.includes("maxFileSize exceeded")) {
            errMsg = "The size of signature image can not exceed 1MB";
          }
          reject(new ServiceError(errMsg, 400));
        }

        resolve({ fields, files });
      });
    });

    const validation = new Validator(fields, {
      name: "required|string",
      gcId: "required|integer",
      bgImage: "string",
      isPublished: "boolean",
      layoutNumber: "integer",
      layoutData: "string",
      layoutImagesUrls: "string",
    });

    if (validation.fails()) {
      throw new ServiceError(validation.firstError(), 400);
    }

    if (fields.name && !fields.name.trim().length) {
      throw new ServiceError("Invalid tile name provided.", 400);
    }

    const paramValidation = new Validator(req.params, {
      id: "required|integer",
    });

    if (paramValidation.fails()) {
      throw new ServiceError(paramValidation.firstError(), 400);
    }

    try {
      if (fields.layoutData) {
        const json = JSON.parse(fields.layoutData);
        if (Object.keys(json) < 1) {
          throw new ServiceError(
            "The layouData object must have atleast one key",
            400,
          );
        }
      }
    } catch (err) {
      const msg = err.message || "Got invalid JSON string for layoutData";
      throw new ServiceError(msg, 400);
    }

    if (fields.layoutImagesUrls) {
      try {
        fields.layoutImagesUrls = JSON.parse(fields.layoutImagesUrls);
        if (!Array.isArray(fields.layoutImagesUrls)) {
          throw new ServiceError("The layoutImagesUrls must be a JSON array");
        }

        // throw error if every item in the array is not valid url
        fields.layoutImagesUrls.forEach((url) => new URL(url));
      } catch (err) {
        const msg =
          err.message || "Got invalid JSON array for layoutImagesUrls";
        throw new ServiceError(msg, 400);
      }

      try {
        let uuids = [];

        if (config.aws.upload) {
          uuids = fields.layoutImagesUrls.map(
            (url) => url.split(".com/")[1].split("?")[0],
          );
        } else if (config.azure.upload) {
          throw new Error("Not implemented");
        } else {
          uuids = fields.layoutImagesUrls.map(
            (url) => "/files" + url.split("/files")[1],
          );
        }

        fields.layoutImages = [];
        // .concat doesn't work here for some reason
        fields.layoutImages.push(...uuids);
      } catch (err) {
        throw new ServiceError(
          "Unable to update existing urls for layout images",
          400,
        );
      }
    }

    const { bgImage, layoutImages } = files;
    const allowedTypes = ["jpg", "jpeg", "png", "webp"];

    if (bgImage) {
      fields.bgImage = await upload_file(
        bgImage,
        `uploads/tiles`,
        allowedTypes,
      );
    }

    if (layoutImages) {
      if (!Array.isArray(fields.layoutImages)) fields.layoutImages = [];

      if (Array.isArray(layoutImages)) {
        const promises = [];

        for (const image of layoutImages) {
          promises.push(upload_file(image, `uploads/tiles`, allowedTypes));
        }

        fields.layoutImages.push(...(await Promise.all(promises)));
      } else {
        fields.layoutImages.push(
          await upload_file(layoutImages, `uploads/tiles`, allowedTypes),
        );
      }
    }

    if (Array.isArray(fields.layoutImages)) {
      fields.layoutImages = JSON.stringify(fields.layoutImages);
    }

    const tile = await tileService.updateTile(req.params.id, fields);
    helper.mqtt_publish_message(
      `ta/${tile.data.gcId}/updated`,
      { tileId: tile.tileId },
      false,
    );

    return apiResponse.success(res, req, tile, 200);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};

exports.updateSuperTile = async (req, res) => {
  /**
   * @swagger
   *
   * /tiles/{id}/super:
   *   patch:
   *     security:
   *       - auth: []
   *     description: Change super tile status of a tile.
   *     tags: [Tiles]
   *     consumes:
   *       - application/json
   *     parameters:
   *        - in: path
   *          name: id
   *          description: id of the tile
   *
   *        - in: body
   *          name: body
   *          description: >
   *            * `status`: true to make it super tile, false to reverse it
   *
   *            * `gcId`: ID of the golf course
   *
   *          schema:
   *             type: object
   *             required:
   *                - newOrder
   *                - gcId
   *             properties:
   *                status:
   *                   type: number
   *                   default: 1
   *
   *                gcId:
   *                   type: number
   *                   default: 1
   *
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   *       400:
   *         description: Request body is not valid
   *       404:
   *         description: Golf course or tile not found
   *       500:
   *         description: Something went wrong on server side
   */

  try {
    const paramValidation = new Validator(req.params, {
      id: "required|integer",
    });

    const bodyValidation = new Validator(req.body, {
      gcId: "required|integer",
      status: "required|boolean",
    });

    if (paramValidation.fails()) {
      throw new ServiceError(paramValidation.firstError(), 400);
    }

    if (bodyValidation.fails()) {
      throw new ServiceError(bodyValidation.firstError(), 400);
    }

    const data = await tileService.changeSuperTile(
      req.params.id,
      req.body.gcId,
      req.body.status,
    );

    helper.mqtt_publish_message(`ta/${req.body.gcId}/super`, data, false);

    return apiResponse.success(res, req, data, 200);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};

exports.udpatePublishedStatus = async (req, res) => {
  /**
   * @swagger
   *
   * /tiles/{id}/publish:
   *   patch:
   *     security:
   *       - auth: []
   *     description: Publish or un publish a tile.
   *     tags: [Tiles]
   *     consumes:
   *       - application/json
   *     parameters:
   *        - in: path
   *          name: id
   *          description: id of the tile to publish or unpublish
   *
   *        - in: body
   *          name: body
   *          description: >
   *            * `status`: true to make it super tile, false to reverse it
   *
   *            * `gcId`: ID of the golf course
   *
   *          schema:
   *             type: object
   *             required:
   *                - newOrder
   *                - gcId
   *             properties:
   *                status:
   *                   type: number
   *                   default: 1
   *
   *                gcId:
   *                   type: number
   *                   default: 1
   *
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   *       400:
   *         description: Request body is not valid
   *       404:
   *         description: Golf course or tile not found
   *       500:
   *         description: Something went wrong on server side
   */

  try {
    const paramValidation = new Validator(req.params, {
      id: "required|integer",
    });

    const bodyValidation = new Validator(req.body, {
      gcId: "required|integer",
      status: "required|boolean",
    });

    if (paramValidation.fails()) {
      throw new ServiceError(paramValidation.firstError(), 400);
    }

    if (bodyValidation.fails()) {
      throw new ServiceError(bodyValidation.firstError(), 400);
    }

    const data = await tileService.changePublishStatus(
      req.params.id,
      req.body.gcId,
      req.body.status,
    );

    helper.mqtt_publish_message(`ta/${req.body.gcId}/publish`, data, false);

    return apiResponse.success(res, req, data, 200);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};

exports.deleteTile = async (req, res) => {
  /**
   * @swagger
   *
   * /tiles/{id}:
   *   delete:
   *     security:
   *       - auth: []
   *     description: Delete any Tile. (Only super admin can delete built in tiles)
   *     tags: [Tiles]
   *     parameters:
   *        - in: path
   *          name: id
   *          description: id of the tile to delete
   *     produces:
   *       - application/json
   *     responses:
   *       204:
   *         description: success
   *       400:
   *         description: Request body is not valid
   *       403:
   *         description: Unauthorized request
   *       404:
   *         description: Golf course or tile not found
   *       500:
   *         description: Something went wrong on server side
   */

  try {
    const paramValidation = new Validator(req.params, {
      id: "required|integer",
    });

    if (paramValidation.fails()) {
      throw new ServiceError(paramValidation.firstError(), 400);
    }

    await tileService.delete(req.params.id);

    return apiResponse.success(res, req, null, 204);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};

exports.deleteCourseTile = async (req, res) => {
  /**
   * @swagger
   *
   * /tiles/{id}/course/{gcId}:
   *   delete:
   *     security:
   *       - auth: []
   *     description: Delete the tile of a course.
   *     tags: [Tiles]
   *     parameters:
   *        - in: path
   *          name: id
   *          description: id of the tile to delete
   *
   *        - in: path
   *          name: gcId
   *          default: 1
   *          description: id of the golf course
   *     produces:
   *       - application/json
   *     responses:
   *       204:
   *         description: success
   *       400:
   *         description: Request body is not valid
   *       404:
   *         description: Golf course or tile not found
   *       500:
   *         description: Something went wrong on server side
   */

  try {
    const paramValidation = new Validator(req.params, {
      id: "required|integer",
      gcId: "required|integer",
    });

    if (paramValidation.fails()) {
      throw new ServiceError(paramValidation.firstError(), 400);
    }

    const tile = await tileService.deleteCourseTile(
      req.params.id,
      req.params.gcId,
    );

    helper.mqtt_publish_message(
      `ta/${tile.tileData.gcId}/deleted`,
      { tileId: tile.tileData.tileId },
      false,
    );

    return apiResponse.success(res, req, null, 204);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
