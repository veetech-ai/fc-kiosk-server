const Validator = require("validatorjs");
const apiResponse = require("../../common/api.response");
const ServiceError = require("../../utils/serviceError");

const tileService = require("./../../services/kiosk/tiles");
const { get_pagination_params } = require("../../common/helper");

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
   *     consumes:
   *       - application/json
   *     parameters:
   *        - in: body
   *          name: body
   *          description: >
   *            * `name`: Name of the tile.
   *
   *            * `isPublished`: Published status of a tile.
   *
   *            * `isSuperTile`: Make this tile a big tile?
   *
   *            * `order`: Position of the tile in the tiles list.
   *
   *            * `gcId`: Id  of the golf course, to create a tile for.
   *
   *            * `layoutNumber`: Which layout to show when user clicks on the tile?
   *              * `0` for default layout
   *              * `1` for first custom layout
   *              * `2` for second custom layout
   *              * `3` for third custom layout
   *          schema:
   *             type: object
   *             required:
   *                - name
   *                - gcId
   *             properties:
   *                name:
   *                   type: string
   *                   default: "Test Tile"
   *
   *                isPublished:
   *                   type: boolean
   *
   *                isSuperTile:
   *                   type: boolean
   *                   default: false
   *
   *                layoutNumber:
   *                   type: number
   *                   enum: [0, 1, 2, 3]
   *                   default: 0
   *                   description: >
   *
   *                gcId:
   *                   type: number
   *                   default: 1
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
    const validation = new Validator(req.body, {
      name: "required|string",
      gcId: "required|integer",
      isSuperTile: "boolean",
      isPublished: "boolean",
      layoutNumber: "integer",
    });

    if (validation.fails()) {
      throw new ServiceError(validation.firstError(), 400);
    }

    const tile = await tileService.create(req.body);

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

    const tile = await tileService.updateOrder(
      req.params.id,
      req.body.gcId,
      req.body.newOrder,
    );

    return apiResponse.success(res, req, tile, 200);
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

    const paginationOptions = get_pagination_params({
      limit: req.query.size || 10,
      page: req.query.page || 1,
    });

    const data = await tileService.get({
      where: { builtIn: req.query.builtInOnly == "true" },
      paginationOptions,
    });

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
   *     description: Create a Tile.
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
    const tile = await tileService.getOne({ id: req.params.id });

    return apiResponse.success(res, req, tile, 200);
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
   *     consumes:
   *       - application/json
   *     parameters:
   *        - in: path
   *          name: id
   *          description: id of the tile to update
   *
   *        - in: body
   *          name: body
   *          description: >
   *            * `name`: New name for the tile
   *
   *            * `layoutNumber`: New layoutNumber for the tile
   *
   *          schema:
   *             type: object
   *             properties:
   *                name:
   *                   type: string
   *
   *                layoutNumber:
   *                   type: number
   *                   default: 0
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
      name: "required|string",
      layoutNumber: "integer",
    });

    if (paramValidation.fails()) {
      throw new ServiceError(paramValidation.firstError(), 400);
    }

    if (bodyValidation.fails()) {
      throw new ServiceError(bodyValidation.firstError(), 400);
    }

    if (req.body.name && !req.body.name.trim().length) {
      throw new ServiceError("Invalid tile name provided.", 400);
    }

    const tile = await tileService.updateTile(req.params.id, req.body);

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
   *          description: id of the tile to move
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

    const tile = await tileService.changeSuperTile(
      req.params.id,
      req.body.gcId,
      req.body.status,
    );

    return apiResponse.success(res, req, tile, 200);
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
   *          description: id of the tile to move
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

    const tile = await tileService.changePublishStatus(
      req.params.id,
      req.body.gcId,
      req.body.status,
    );

    return apiResponse.success(res, req, tile, 200);
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
   *          description: id of the tile to move
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

    const tile = await tileService.delete(req.params.id);

    return apiResponse.success(res, req, tile, 200);
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

    return apiResponse.success(res, req, tile, 200);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
