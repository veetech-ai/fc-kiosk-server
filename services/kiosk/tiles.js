const { Op } = require("sequelize");
const { validateObject } = require("../../common/helper");
const models = require("../../models/index");
const ServiceError = require("../../utils/serviceError");
const CousreService = require("./course");
const { async } = require("crypto-random-string");

const { Tile, Course_Tile } = models;

const _RESTRICTED_KEYS = ["id", "tileId", "createdAt", "updatedAt"];

const allowedFields = Object.keys(Tile.rawAttributes)
  .filter((key) => !_RESTRICTED_KEYS.includes(key))
  .concat(
    Object.keys(Course_Tile.rawAttributes).filter(
      (key) => !_RESTRICTED_KEYS.includes(key),
    ),
  );

exports.get = async (where) => {
  return Course_Tile.findAll({ where, include: Tile });
};

exports.getCourseTiles = async (id) => {
  await CousreService.getCourseById(id);
  return Course_Tile.findAll({ where: { gcId: id }, include: Tile });
};

exports.getOne = async (where) => {
  const tile = Tile.findOne({ where, include: Course_Tile });
  if (!tile) throw new ServiceError("Tile Not Found", 404);
  return tile;
};

exports.changeSuperTile = async (tileId, gcId, status = false) => {
  // throw error, if ids are not valid
  await this.getOne({ id: tileId });
  await CousreService.getCourseById(gcId);

  const existingSuperTile = await Course_Tile.findOne({
    attributes: ["id"],
    where: { gcId, isSuperTile: true },
  });

  if (existingSuperTile) {
    throw new ServiceError("A super tile already exists for this course.", 400);
  }

  return Course_Tile.update(
    { isSuperTile: status },
    { where: { tileId, gcId } },
  );
};

exports.updateOrder = async (tileId, gcId, newOrder) => {
  const transact = await models.sequelize.transaction();
  try {
    // throw error, if ids are not valid
    await this.getOne({ id: tileId });
    await CousreService.getCourseById(gcId);

    const requestedTileInfo = await Course_Tile.findOne({
      where: { tileId },
      attributes: ["orderNumber"],
    });

    const order = {
      from: requestedTileInfo.orderNumber,
      to: newOrder,
    };

    const validMaxOrderNumber = await Course_Tile.count({
      where: { gcId },
    });

    const isNewOrderValid =
      order.to <= validMaxOrderNumber &&
      order.to >= 1 &&
      order.from <= validMaxOrderNumber &&
      order.from >= 1;

    if (validMaxOrderNumber && !isNewOrderValid) {
      throw new ServiceError(
        `The order must a number min: 1 and max: ${validMaxOrderNumber}`,
        400,
      );
    }

    // update order of requested tile
    const res = await Course_Tile.update(
      { orderNumber: order.to },
      {
        where: {
          tileId,
          gcId,
        },
      },
    );

    // update the order of other tiles accordingly
    if (order.from - order.to > 0) {
      await Course_Tile.update(
        { orderNumber: models.sequelize.literal("orderNumber + 1") },
        {
          where: {
            [Op.and]: {
              orderNumber: {
                [Op.lt]: order.from,
                [Op.gte]: order.to,
              },
            },
          },
        },
      );
    } else {
      await Course_Tile.update(
        { orderNumber: models.sequelize.literal("orderNumber - 1") },
        {
          where: {
            [Op.and]: {
              orderNumber: {
                [Op.gt]: order.from,
                [Op.lte]: order.to,
              },
            },
          },
        },
      );
    }

    await transact.commit();
    return true;
    //   return Course_Tile.findAll({
    //     order: [["order", "ASC"]],
    //     include: Tile,
    //     where: { gcId },
    //   });
  } catch (err) {
    transact.rollback();
    throw err;
  }
};

exports.changePublishStatus = async (tileId, gcId, status = false) => {
  // throw error, if ids are not valid
  await this.getOne({ id: tileId });
  await CousreService.getCourseById(gcId);

  return Course_Tile.update(
    { isPublished: status },
    { where: { tileId, gcId } },
  );
};

exports.create = async (data) => {
  const transact = await models.sequelize.transaction();
  try {
    const {
      name,
      gcId,
      isPublished = true,
      isSuperTile = false,
      layoutNumber = 0,
    } = validateObject(data, allowedFields);

    // 1. check if the course exists
    await CousreService.getCourseById(gcId);

    // 2. if isSuperTile is true, then make sure its the only super tile
    const existingSuperTile = await Course_Tile.findOne({
      where: { gcId, isSuperTile: true },
      attributes: ["id"],
    });

    if (existingSuperTile) {
      throw new ServiceError(
        "A super tile already exists for this course.",
        400,
      );
    }

    // 3. check if order is valid order number
    const validMaxOrderNumber = await Course_Tile.count({
      where: { gcId },
    });

    // 4. create new tile with max order
    const tile = await Tile.create({ name });
    const courseTile = await Course_Tile.create({
      tileId: tile.id,
      gcId,
      isPublished,
      isSuperTile,
      orderNumber: validMaxOrderNumber + 1,
      layoutNumber,
    });

    await transact.commit();

    // 5. prepare and send the response
    return { ...tile.dataValues, ...courseTile.dataValues, id: tile.id };
  } catch (err) {
    transact.rollback();
    throw err; // forward the err to controller
  }
};

exports.delete = async (id) => {
  await this.getOne(id);

  return Tile.destroy({ where: { id } });
};

exports.deleteCourseTile = async (tileId, gcId) => {
  await this.getOne({ id: tileId });
  await CousreService.getCourseById(gcId);

  // TODO destroy corresponding Tile entry too, if its created by user

  return Course_Tile.destroy({ where: { tileId, gcId } });
};
