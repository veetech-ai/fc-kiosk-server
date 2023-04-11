const GeoFencesModel = require("../services/geofences");
const apiResponse = require("../common/api.response");
const Validator = require("validatorjs");

/**
 * @swagger
 * tags:
 *   name: GeoFence
 *   description: GeoFence management
 */

exports.get_all = async (req, res) => {
  /**
   * @swagger
   *
   * /geofence/all:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get GeoFence
   *     tags: [GeoFence]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const limit =
      req.query.limit && req.query.limit <= 100
        ? parseInt(req.query.limit)
        : 10;
    let page = 0;
    if (req.query) {
      if (req.query.page) {
        req.query.page = parseInt(req.query.page);
        page = Number.isInteger(req.query.page) ? req.query.page : 0;
      }
    }

    const result = await GeoFencesModel.list(req.user.id, limit, page);

    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.get_by_id = async (req, res) => {
  /**
   * @swagger
   *
   * /geofence/get/{id}:
   *   get:
   *     security:
   *      - auth: []
   *     description: Get geofence by ID
   *     tags: [GeoFence]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: Mode ID
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   */
  try {
    const result = await GeoFencesModel.findByID(req.params.id);

    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.create = (req, res) => {
  /**
   * @swagger
   *
   * /geofence/create:
   *   post:
   *     security:
   *      - auth: []
   *     description: Create new geofence
   *     tags: [GeoFence]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: name
   *         description: Name
   *         in: formData
   *         required: true
   *         type: string
   *       - name: radius
   *         description: Radius of fence (Circle)
   *         in: formData
   *         required: true
   *         type: string
   *       - name: lat
   *         description: Lat
   *         in: formData
   *         required: true
   *         type: string
   *       - name: lng
   *         description: Lng
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.body, {
      name: "required",
      radius: "required",
      lat: "required",
      lng: "required",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      try {
        req.body.user_id = req.user.id;
        const result = await GeoFencesModel.create(req.body);
        return apiResponse.success(res, req, result);
      } catch (err) {
        return apiResponse.fail(res, err.message, 500);
      }
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.update = (req, res) => {
  /**
   * @swagger
   *
   * /geofence/update/{id}:
   *   put:
   *     security:
   *       - auth: []
   *     description: Update geofence
   *     tags: [GeoFence]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: ID
   *         in: path
   *         required: true
   *         type: number
   *       - name: name
   *         description: Name
   *         in: formData
   *         required: true
   *         type: string
   *       - name: radius
   *         description: Radius of fence (Circle)
   *         in: formData
   *         required: true
   *         type: string
   *       - name: lat
   *         description: Lat
   *         in: formData
   *         required: true
   *         type: string
   *       - name: lng
   *         description: Lng
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.body, {
      name: "required",
      radius: "required",
      lat: "required",
      lng: "required",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      const id = req.params.id;

      if (!id) return apiResponse.fail(res, "GeoFence not found", 404);

      try {
        const fence = await GeoFencesModel.findByID(id);
        if (!fence) return apiResponse.fail(res, "GeoFence not found", 404);

        const result = await GeoFencesModel.update(fence.id, req.body);

        return apiResponse.success(res, req, result);
      } catch (err) {
        return apiResponse.fail(res, err.message, 500);
      }
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.delete = async (req, res) => {
  /**
   * @swagger
   *
   * /geofence/delete/{id}:
   *   delete:
   *     security:
   *       - auth: []
   *     description: Delete geofence
   *     tags: [GeoFence]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: Mode ID
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const id = req.params.id;
    if (!id) return apiResponse.fail(res, "Geofence not found", 404);

    const fence = await GeoFencesModel.findByID(id);
    if (!fence) return apiResponse.fail(res, "GeoFence not found", 404);

    const result = await GeoFencesModel.delete(id);

    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};
