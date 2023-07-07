const UserAddressesModel = require("../services/user_addresses");
const apiResponse = require("../common/api.response");
const Validator = require("validatorjs");


/**
 * @swagger
 * tags:
 *   name: User Addresses
 *   description: User Addresses Management
 */

exports.list = async (req, res) => {
  /**
   * @swagger
   *
   * /user-addresses:
   *   get:
   *     security:
   *      - auth: []
   *     description: Get all user addresses
   *     tags: [User Addresses]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */

  try {
    const addresses = await UserAddressesModel.list(req.user.id);
    return apiResponse.success(res, req, addresses);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.get_by_id = async (req, res) => {
  /**
   * @swagger
   *
   * /user-addresses/get/{addressId}:
   *   get:
   *     security:
   *      - auth: []
   *     description: Get user address by ID
   *     tags: [User Addresses]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: addressId
   *         description: Address ID
   *         in: path
   *         required: true
   *         type: number
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const address = await UserAddressesModel.findByID(
      req.params.addressId,
      req.user.id,
    );

    if (address) return apiResponse.success(res, req, address);

    return apiResponse.fail(res, "Address not found");
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.add_new = (req, res) => {
  /**
   * @swagger
   *
   * /user-addresses/new:
   *   post:
   *     security:
   *       - auth: []
   *     description: Add New Address
   *     tags: [User Addresses]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: address
   *         description: User address in JSON string
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */

  const validation = new Validator(req.body, {
    address: "required|json",
  });

  validation.fails(function () {
    return apiResponse.fail(res, validation.errors);
  });

  validation.passes(async function () {
    try {
      const address = JSON.parse(req.body.address);

      if (
        !address.first_name ||
        !address.last_name ||
        !address.address ||
        !address.city ||
        !address.country ||
        !address.phone
      ) {
        return apiResponse.fail(res, "missing required field");
      }

      req.body.user_id = req.user.id;

      const result = await UserAddressesModel.create(req.body);
      return apiResponse.success(res, req, result);
    } catch (err) {
      return apiResponse.fail(res, err.message, 500);
    }
  });
};

exports.update = (req, res) => {
  /**
   * @swagger
   *
   * /user-addresses/update/{addressId}:
   *   put:
   *     security:
   *       - auth: []
   *     description: Update user address
   *     tags: [User Addresses]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: addressId
   *         description: Address ID
   *         in: path
   *         required: true
   *         type: number
   *       - name: address
   *         description: User address in JSON string
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */

  const validation = new Validator(req.body, {
    address: "required|json",
  });

  validation.fails(function () {
    return apiResponse.fail(res, validation.errors);
  });

  validation.passes(async function () {
    try {
      req.body.user_id = req.user.id;

      const address = await UserAddressesModel.findByID(
        req.params.addressId,
        req.user.id,
      );

      if (!address) return apiResponse.fail(res, "Address not found");

      await UserAddressesModel.update(req.params.addressId, req.body);
      return apiResponse.success(res, req, "Address Updated");
    } catch (err) {
      return apiResponse.fail(res, err.message, 500);
    }
  });
};

exports.delete_by_id = async (req, res) => {
  /**
   * @swagger
   *
   * /user-addresses/delete/{addressId}:
   *   delete:
   *     security:
   *       - auth: []
   *     description: Delete user address
   *     tags: [User Addresses]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: addressId
   *         description: Address ID
   *         in: path
   *         required: true
   *         type: number
   *     responses:
   *       200:
   *         description: Success
   */
  try {
    const address = await UserAddressesModel.findByID(
      req.params.addressId,
      req.user.id,
    );
    if (!address) return apiResponse.fail(res, "Address not found");

    await UserAddressesModel.delete(req.params.addressId, req.user.id);
    return apiResponse.success(res, req, "Address deleted", 200);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.get_default_address = async (req, res) => {
  /**
   * @swagger
   *
   * /user-addresses/get-default:
   *   get:
   *     security:
   *      - auth: []
   *     description: Get user default address
   *     tags: [User Addresses]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const address = await UserAddressesModel.findByWhere({
      user_id: req.user.id,
      is_default: 1,
    });

    if (address) return apiResponse.success(res, req, address);

    return apiResponse.fail(res, "No default address found");
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.make_default = async (req, res) => {
  /**
   * @swagger
   *
   * /user-addresses/make-default/{addressId}:
   *   post:
   *     security:
   *       - auth: []
   *     description: Make default address
   *     tags: [User Addresses]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: addressId
   *         description: Address ID
   *         in: path
   *         required: true
   *         type: number
   *     responses:
   *       200:
   *         description: Success
   */
  try {
    const address = await UserAddressesModel.findByID(
      req.params.addressId,
      req.user.id,
    );
    if (!address) return apiResponse.fail(res, "Address not found");

    const result = await UserAddressesModel.makeDefaultAddress(
      req.params.addressId,
      req.user.id,
    );
    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};
