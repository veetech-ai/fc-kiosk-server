const models = require("../../models/index");
const ServiceError = require("../../utils/serviceError");
const upload_file = require("../../common/upload");

const Shop = models.Shop;

exports.getShopsByGolfCourseId = async (gcId) => {
  const shops = await Shop.findAll({
    where: { gcId },
    raw: true,
  });

  if (shops.length) {
    shops.forEach(shop => {
      if(!shop?.image) return;
      const image = upload_file.getFileURL(shop.image);
      shop.image = image
    })
  } 
  
  return shops;
}
