const config = require("../config/config");
const stripe = require("stripe")(config.stripe.secret);
// const settings = require('../config/settings')

function strip_response(response) {
  return response.data || response;
}

exports.get_products = (data = {}) => {
  return new Promise(async (resolve, reject) => {
    try {
      const products = await stripe.products.list();
      resolve(strip_response(products));
    } catch (err) {
      reject(err);
    }
  });
};

exports.create_product = (data = {}) => {
  return new Promise(async (resolve, reject) => {
    try {
      const product = await stripe.products.create({
        name: data.name || "MyFirstProd",
      });
      resolve(strip_response(product));
    } catch (err) {
      reject(err);
    }
  });
};

exports.get_product = (data = {}) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (data.id) {
        const product = await stripe.products.retrieve(data.id);
        resolve(strip_response(product));
      } else {
        reject({ message: "Product ID not found" });
      }
    } catch (err) {
      reject(err);
    }
  });
};

exports.update_product = (data = {}) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (data.id && data.attributes) {
        const product = await stripe.products.update(data.id, data.attributes);
        resolve(strip_response(product));
      } else {
        reject({ message: "Product ID or Product Attributes not found" });
      }
    } catch (err) {
      reject(err);
    }
  });
};

exports.delete_product = (data = {}) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (data.id) {
        const deleted = await stripe.products.del(data.id);
        resolve(strip_response(deleted));
      } else {
        reject({ message: "Product ID not found" });
      }
    } catch (err) {
      reject(err);
    }
  });
};

exports.charge = (data = {}) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (data.amount && data.source) {
        const charge = await stripe.charges.create({
          amount: data.amount * 100,
          currency: data.currency || "pkr",
          source: data.source,
          metadata: data.metadata || {},
        });
        resolve(strip_response(charge));
      } else {
        reject({ message: "Invalid Parametes for payment." });
      }
    } catch (err) {
      reject(err);
    }
  });
};
