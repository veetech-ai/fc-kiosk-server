const settings = require("../config/settings");
const moment = require("moment");
const config = require("../config/config");

const { logger } = require("../logger");

function response(response) {
  return response.data;
}

function set_params(data, type = false) {
  try {
    if (!type || ["m", "c"].indexOf(type) <= -1) {
      return false;
    }

    const now = moment();
    const pp_TxnDateTime = moment(now).format("YYYYMMDDHHmmss");
    const pp_TxnExpiryDateTime = moment(now)
      .add(1, "H")
      .format("YYYYMMDDHHmmss");
    const pp_TxnRefNo = `T${pp_TxnDateTime}`;

    const params = {
      pp_Language: "EN",
      pp_MerchantID: config.jazzCash.merchantId,
      pp_SubMerchantID: "",
      pp_Password: config.jazzCash.password,
      pp_BankID: "",
      pp_ProductID: "",
      pp_TxnRefNo: pp_TxnRefNo,
      pp_Amount: data.amount * 100,
      pp_TxnCurrency: "PKR",
      pp_TxnDateTime: pp_TxnDateTime,
      pp_BillReference: data.order_id,
      pp_Description:
        data.desc || `Order Payment from ${settings.get("company_name")}`,
      pp_TxnExpiryDateTime: pp_TxnExpiryDateTime,
      pp_SecureHash: "",
      // "ppmpf_1": "",
      // "ppmpf_2": "",
      // "ppmpf_3": "",
      // "ppmpf_4": "",
      // "ppmpf_5": "",
    };

    if (type == "m") {
      params.pp_MobileNumber = data.mobile_number;
      params.pp_CNIC = data.cnic;

      params.ppmpf_1 = "";
      params.ppmpf_2 = "";
      params.ppmpf_3 = "";
      params.ppmpf_4 = "";
      params.ppmpf_5 = "";
    }

    if (type == "c") {
      params.pp_TxnType = "MPAY";

      params.pp_IsRegisteredCustomer = "";
      params.pp_ShouldTokenizeCardNumber = "";
      params.pp_C3DSecureID = "";

      params.pp_CustomerID = data.user_id;
      params.pp_CustomerEmail = data.user_email;
      params.pp_CustomerMobile = data.mobile_number;

      params.pp_CustomerCardNumber = data.card_number;
      params.pp_CustomerCardExpiry = data.card_expiry;
      params.pp_CustomerCardCvv = data.cvv;
    }

    return params;
  } catch (err) {
    logger.error(err);
    return false;
  }
}

function get_pp_secure_hash(params, type = false) {
  try {
    if (!type || ["m", "c"].indexOf(type) <= -1) {
      return false;
    }

    const CryptoJS = require("crypto-js");

    // if(type == 'c'){ sorted_string += params.aaa+'&'; }

    let sorted_string = config.jazzCash.salt + "&";
    sorted_string += params.pp_Amount + "&";
    sorted_string += params.pp_BillReference + "&";
    if (type == "m") {
      sorted_string += params.pp_CNIC + "&";
    }

    if (type == "c") {
      sorted_string += params.pp_CustomerCardCvv + "&";
    }
    if (type == "c") {
      sorted_string += params.pp_CustomerCardExpiry + "&";
    }
    if (type == "c") {
      sorted_string += params.pp_CustomerCardNumber + "&";
    }
    if (type == "c") {
      sorted_string += params.pp_CustomerEmail + "&";
    }
    if (type == "c") {
      sorted_string += params.pp_CustomerID + "&";
    }
    if (type == "c") {
      sorted_string += params.pp_CustomerMobile + "&";
    }

    sorted_string += params.pp_Description + "&";
    sorted_string += params.pp_Language + "&";
    sorted_string += params.pp_MerchantID + "&";

    if (type == "m") {
      sorted_string += params.pp_MobileNumber + "&";
    }

    sorted_string += params.pp_Password + "&";
    sorted_string += params.pp_TxnCurrency + "&";
    sorted_string += params.pp_TxnDateTime + "&";
    sorted_string += params.pp_TxnExpiryDateTime + "&";
    sorted_string += params.pp_TxnRefNo + "&";

    if (type == "c") {
      sorted_string += params.pp_TxnType + "&";
    }

    // if(type == 'c'){
    //     params.pp_TxnType = 'MPAY';

    //     params.pp_IsRegisteredCustomer = "";
    //     params.pp_ShouldTokenizeCardNumber = "";
    //     params.pp_C3DSecureID = "";

    //     params.pp_CustomerID = data.user_id;
    //     params.pp_CustomerEmail = data.user_email;
    //     params.pp_CustomerMobile = data.mobile_number;

    //     params.pp_CustomerCardNumber = data.card_number;
    //     params.pp_CustomerCardExpiry = data.card_expiry;
    //     params.pp_CustomerCardCvv = data.cvv;
    // }

    sorted_string = sorted_string.slice(0, -1);

    return CryptoJS.enc.Hex.stringify(
      CryptoJS.HmacSHA256(sorted_string, config.jazzCash.salt),
    );
  } catch (err) {
    return false;
  }
}

exports.pay_with_mobile_account = (data = {}) => {
  return new Promise(async (resolve, reject) => {
    try {
      const axios = require("axios");
      const api_url = `${config.jazzCash.apiLink}/Purchase/DoMWalletTransaction`;

      const params = set_params(data, "m");
      if (params) {
        const pp_SecureHash = get_pp_secure_hash(params, "m");
        if (pp_SecureHash) {
          params.pp_SecureHash = pp_SecureHash;

          try {
            axios
              .post(api_url, params)
              .then((jazzcash_response) => {
                const res = response(jazzcash_response);
                if (res.pp_ResponseCode == "000") {
                  res.payment_status = "success";
                  resolve(res);
                } else {
                  res.payment_status = "fail";
                  reject(res);
                }
              })
              .catch((err) => {
                reject(err);
              });
          } catch (err) {
            reject(err);
          }
        } else {
          reject({ message: "InvalidSecureHash" });
        }
      } else {
        reject("InvalidParams");
      }
    } catch (err) {
      reject(err);
    }
  });
};

exports.pay_with_card = (data = {}) => {
  return new Promise(async (resolve, reject) => {
    try {
      const axios = require("axios");
      const api_url = `${config.jazzCash.apiLink}/Purchase/PAY`;

      const params = set_params(data, "c");
      if (params) {
        const pp_SecureHash = get_pp_secure_hash(params, "c");
        if (pp_SecureHash) {
          params.pp_SecureHash = pp_SecureHash;

          try {
            axios
              .post(api_url, params)
              .then((jazzcash_response) => {
                const res = response(jazzcash_response);
                if (res.pp_ResponseCode == "000") {
                  res.payment_status = "success";
                  resolve(res);
                } else {
                  res.payment_status = "fail";
                  reject(res);
                }
              })
              .catch((err) => {
                reject(err);
              });
          } catch (err) {
            reject(err);
          }
        } else {
          reject({ message: "InvalidSecureHash" });
        }
      } else {
        reject("InvalidParams");
      }
    } catch (err) {
      reject(err);
    }
  });
};
