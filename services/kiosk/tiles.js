const { Op } = require("sequelize");
const { validateObject } = require("../../common/helper");
const models = require("../../models/index");
const ServiceError = require("../../utils/serviceError");
const CousreService = require("./course");

const { Tile, Course_Tile } = models;

const _SKIP_KEYS = ["id", "tileId", "TileId", "createdAt", "updatedAt"];

const allowedFields = Object.keys(Tile.rawAttributes)
  .filter((key) => !_SKIP_KEYS.includes(key))
  .concat(
    Object.keys(Course_Tile.rawAttributes).filter(
      (key) => !_SKIP_KEYS.includes(key),
    ),
  );

const validateLayoutNumber = (number) => {
  if (number < 0 || number > 3) {
    throw new ServiceError("The layoutNumber must one of 0, 1, 2 or 4.", 400);
  }
};

exports.get = async ({ where = {}, paginationOptions }) => {
  const count = await Tile.count();
  const tiles = await Tile.findAll({ where, ...paginationOptions });

  return { count, tiles };
};

exports.getCourseTiles = async (gcId) => {
  await CousreService.getCourseById(gcId);
  return Course_Tile.findAll({
    where: { gcId },
    attributes: [
      ["id", "courseTileId"],
      "isSuperTile",
      "isPublished",
      "layoutNumber",
      "orderNumber",
      "gcId",
    ],
    order: [["orderNumber", "ASC"]],
    include: { model: Tile, attributes: ["id", "name", "builtIn"] },
  });
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

  if (status && existingSuperTile) {
    throw new ServiceError("A super tile already exists for this course.", 400);
  }

  const [updatedRows] = await Course_Tile.update(
    { isSuperTile: status },
    { where: { tileId, gcId } },
  );

  if (!updatedRows) return "No change in db";

  return { tileId, gcId, isSuperTile: status };
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

    const maxOrderNumber = await Course_Tile.count({
      where: { gcId },
    });

    const isNewOrderValid =
      order.to <= maxOrderNumber &&
      order.to >= 1 &&
      order.from <= maxOrderNumber &&
      order.from >= 1;

    if (maxOrderNumber && !isNewOrderValid) {
      throw new ServiceError(
        `The order must a number min: 1 and max: ${maxOrderNumber}`,
        400,
      );
    }

    if (order.to == order.from) {
      throw new ServiceError(
        "The newOrder value must not be same as current orderNumber",
        400,
      );
    }

    const beingMovedDownward = order.from - order.to < 0;
    const beingMovedUpward = order.from - order.to > 0;

    // update the order of other tiles accordingly
    if (beingMovedDownward) {
      await Course_Tile.update(
        { orderNumber: models.sequelize.literal("orderNumber - 1") },
        {
          where: {
            gcId,
            [Op.and]: {
              orderNumber: {
                [Op.gt]: order.from,
                [Op.lte]: order.to,
              },
            },
          },
        },
      );
    } else if (beingMovedUpward) {
      await Course_Tile.update(
        { orderNumber: models.sequelize.literal("orderNumber + 1") },
        {
          where: {
            gcId,
            [Op.and]: {
              orderNumber: {
                [Op.lt]: order.from,
                [Op.gte]: order.to,
              },
            },
          },
        },
      );
    }

    // update order of requested tile
    const [updatedRows] = await Course_Tile.update(
      { orderNumber: order.to },
      {
        where: {
          tileId,
          gcId,
        },
      },
    );

    if (!updatedRows) return "No update in db";

    await transact.commit();
    return { tileId, gcId, order };
  } catch (err) {
    transact.rollback();
    throw err;
  }
};

const sortByOrder = () => {};

exports.changePublishStatus = async (tileId, gcId, status = false) => {
  // throw error, if ids are not valid
  await this.getOne({ id: tileId });
  await CousreService.getCourseById(gcId);

  const [updatedRows] = await Course_Tile.update(
    { isPublished: status },
    { where: { tileId, gcId } },
  );

  if (!updatedRows) return "No change in db";

  return { tileId, gcId, isPublished: status };
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

    // 0. check if layout number is valid
    validateLayoutNumber(layoutNumber);

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

exports.updateTile = async (id, data) => {
  const tileToUpdate = await this.getOne({ id });
  if (!tileToUpdate) {
    throw new ServiceError("Tile Not Found.", 404);
  }

  if (tileToUpdate.builtIn) {
    throw new ServiceError("Can not update a built in tile.", 400);
  }

  if (data.layoutNumber) {
    validateLayoutNumber(data.layoutNumber);
  }

  const [updatedRows] = await Tile.update(
    validateObject(data, ["name", "layoutNumber"]),
    {
      where: { id },
    },
  );

  if (!updatedRows) return "No change in db";

  return { tileId: id, data };
};

exports.assignDefaultTiles = async (gcId) => {
  const defaultTiles = await Tile.findAll({ where: { builtIn: true } });

  const payload = defaultTiles.map((tile) => ({
    tileId: tile.id,
    gcId,
    layoutNumber: 0,
    isPublished: true,
    isSuperTile: false,
    orderNumber: tile.id,
  }));
  await Course_Tile.bulkCreate(payload);
  return this.getCourseTiles(gcId);
};

exports.deleteCourseTile = async (tileId, gcId) => {
  const transact = await models.sequelize.transation();
  try {
    await this.getOne({ id: tileId });
    await CousreService.getCourseById(gcId);

    await Course_Tile.destroy({ where: { tileId, gcId } });

    // destroy corresponding Tile entry too, if its created by user
    await Tile.destroy({ where: { id: tileId, builtIn: false } });

    transact.commit();
    return true;
  } catch (err) {
    transact.rollback();
    throw err;
  }
};
