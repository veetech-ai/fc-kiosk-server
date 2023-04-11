// External Module Imports
const _ = require("lodash");

// Services Imports
const UserModel = require("../../services/user");
const DeviceModel = require("../../services/device");
const ProductModel = require("../../services/product");
const OrganizationDeviceModel = require("../../services/user_device");

exports.checkOperatorIds = async (operatorIds) => {
  const arrayOfOperatorIds = operatorIds
    .split("|")
    .map((id) => Number(id))
    .filter((id) => id !== 0);
  if (arrayOfOperatorIds.filter((id) => Number.isNaN(id)).length) {
    return "Invalid operator id";
  }

  const operatorsData = await UserModel.findByIds(arrayOfOperatorIds);
  if (arrayOfOperatorIds.length !== operatorsData.length) {
    return "Operator not found";
  }
};

exports.register_with_new_user = async (params) => {
  try {
    if (params.reset) {
      await DeviceModel.reset(params.device.id);
    }

    const product = await ProductModel.findByID(params.device.device_type);

    await DeviceModel.set_owner_with_bill_info({
      product: product,
      owner_id: params.user_id,
      device: params.device,
    });

    const created_user = await OrganizationDeviceModel.create({
      user_id: params.user_id,
      device_id: params.device.id,
    });

    return created_user;
  } catch (err) {
    if (err == "exists") {
      throw Error({ message: "exists" });
    } else {
      throw Error(err);
    }
  }
};

exports.objectsEqual = (o1, o2) => _.isEqualWith(o1, o2);
