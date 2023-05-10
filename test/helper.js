const app = require("../main");
const supertest = require("supertest");
const config = require("../config/config");
const request = supertest(app);

const { logger } = require("../logger");

// jest.useFakeTimers()
jest.setTimeout(300000);
exports.wrong_email = "zxy@cowlar.com";
exports.wrong_password = "0987654321";
exports.super_admin_email =
  process.env.SUPER_ADMIN_EMAIL || "superadmin@df.com";
exports.super_admin_password = process.env.SUPER_ADMIN_PASSWORD || "123456";

exports.admin_email = process.env.ADMIN_EMAIL || "admin@df.com";
exports.admin_password = process.env.ADMIN_PASSWORD || "123456";

exports.admind_email = process.env.ADMIN_D_EMAIL || "admind@df.com";
exports.admind_password = process.env.ADMIN_D_PASSWORD || "123456";

exports.incorrect_email = "incorrect.email@cowlar.com";
exports.incorrect_password = "1234567";

exports.testAccountEmail = process.env.TEST_ACCOUNT_EMAIL || "test@df.com";
exports.testAccountPassword = process.env.TEST_ACCOUNT_PASSWORD || "123456";

exports.testDAccountEmail = process.env.TEST_D_ACCOUNT_EMAIL || "testd@df.com";
exports.testDAccountPassword = process.env.TEST_D_ACCOUNT_PASSWORD || "123456";

exports.testOperatorEmail =
  process.env.OPERATOR_EMAIL || "testorgoperator@df.com";
exports.testOperatorPassword = process.env.OPERATOR_PASSWORD || "123456";

exports.testCeoEmail = process.env.CEO_EMAIL || "testorgceo@df.com";
exports.testCeoPassword = process.env.CEO_PASSWORD || "123456";

exports.testManagerEmail = process.env.MANAGER_EMAIL || "testorgmanager@df.com";
exports.testManagerPassword = process.env.MANAGER_PASSWORD || "123456";

exports.zongCustomerEmail = process.env.CEO_EMAIL || "zong@df.com";
exports.zongCustomerPassword = process.env.CEO_PASSWORD || "123456";

exports.zongOperatorEmail = process.env.ZONG_OPERATOR_EMAIL || "zongop@df.com";
exports.zongOperatorPassword = process.env.ZONG_OPERATOR_PASSWORD || "123456";

exports.zongCeoEmail = process.env.ZONG_CEO_EMAIL || "zongceo@df.com";
exports.zongCeoPassword = process.env.ZONG_CEO_PASSWORD || "123456";

exports.inactive_user_email =
  process.env.INACTIVE_USER_EMAIL || "test-inactive@cowlar.com";
exports.inactive_user_password = process.env.INACTIVE_USER_PASSWORD || "123456";

exports.device_role_user_email =
  process.env.DEVICE_ROLE_USER_EMAIL || "testorgdevice@df.com";
exports.device_role_user_password =
  process.env.DEVICE_ROLE_USER_PASSWORD || "123456";

exports.super_admin_email = "superadmin@df.com";
exports.super_admin_password = "123456";

exports.admin_email = "admin@df.com";
exports.admin_password = "123456";

exports.test_email = "test.sim-dispenser@cowlar.com";
exports.test_password = "123456";

exports.incorrect_email = "incorrect.email@cowlar.com";
exports.incorrect_password = "1234567";

exports.simple_user_email = "simple-user@cowlar.com";
exports.simple_user_password = "123456";

exports.inactive_user_email = "test-inactive@cowlar.com";
exports.inactive_user_password = "123456";

exports.customer_email = "testorg.sim-dispenser@cowlar.com";
exports.customer_password = "123456";

exports.get_all_roles_tokens = async () => {
  return {
    superadmin: await this.get_token_for("superadmin"),
    admin: await this.get_token_for("admin"),
    testCustomer: await this.get_token_for("testCustomer"),
    testOperator: await this.get_token_for("testOperator"),
    ceo: await this.get_token_for("ceo"),
    testManager: await this.get_token_for("testManager"),
    zongCustomer: await this.get_token_for("zongCustomer"),
    zongCeo: await this.get_token_for("zongCeo"),
  };
};

exports.get_token_for = async (role = "superadmin", getNewToken = false) => {
  const params = {
    email: null,
    password: null,
    remember: true,
  };

  if (!getNewToken && global.auth_tokens && global.auth_tokens[role]) {
    return global.auth_tokens[role];
  } else {
    if (role == "superadmin") {
      params.email = this.super_admin_email;
      params.password = this.super_admin_password;
    } else if (role == "testsuperadmin") {
      params.email = "testsuperadmin@df.com";
      params.password = "123456";
    } else if (role == "admin") {
      params.email = this.admin_email;
      params.password = this.admin_password;
    } else if (role == "adminD") {
      params.email = this.admind_email;
      params.password = this.admind_password;
    } else if (role == "testCustomer") {
      params.email = this.testAccountEmail;
      params.password = this.testAccountPassword;
    } else if (role == "testManager") {
      params.email = this.testManagerEmail;
      params.password = this.testManagerPassword;
    } else if (role == "testOperator") {
      params.email = this.testOperatorEmail;
      params.password = this.testOperatorPassword;
    } else if (role == "ceo") {
      params.email = this.testCeoEmail;
      params.password = this.testCeoPassword;
    } else if (role == "zongCustomer") {
      params.email = this.zongCustomerEmail;
      params.password = this.zongCustomerPassword;
    } else if (role == "zongOperator") {
      params.email = this.zongOperatorEmail;
      params.password = this.zongOperatorPassword;
    } else if (role == "zongCeo") {
      params.email = this.zongCeoEmail;
      params.password = this.zongCeoPassword;
    } else if (role == "testDCustomer") {
      params.email = this.testDAccountEmail;
      params.password = this.testDAccountPassword;
    } else if (role == "testAdminD") {
      params.email = this.admind_email;
      params.password = this.admind_password;
    }

    try {
      const res = await request.post(`${config.app.apiPath}auth`).send(params);

      if (res.status !== 200) {
        throw new Error("Auth Failed!");
      }

      const token = res.body.data.accessToken;

      global.auth_tokens[role] = token;
      return token;
    } catch (error) {
      logger.error(error);
    }
  }
};
exports.get_request = async (data) => {
  return await request.get(`${config.app.apiPath}${data.endpoint}`).send();
};

/**
 * Makes a get request to given endpoint and payload in `data`
 * @param {{endpoint: string, token: string, queryParams: {[fieldName: string]: string}}} data Request payload
 * @returns Promise<any>
 */
exports.get_request_with_authorization = async (data) => {
  return await request
    .get(`${config.app.apiPath}${data.endpoint}`)
    .set("Content-type", "multipart/form-data")
    .set("authorization", data.token)
    .query(data.queryParams)
    .send();
};

exports.post_request = async (data) => {
  return await request
    .post(`${config.app.apiPath}${data.endpoint}`)
    .send(data.params);
};

/**
 * Makes a post request against given endpoint and payload
 * @param {{endpoint: string, token: string, params: {file_key: string, file_path: string, [fieldName: string]: any}}} data Configuration for the request
 * @returns Promise <any>
 */
exports.post_request_with_authorization = async (data) => {
  try {
    if (data.fileupload) {
      const dirname = __dirname;
      return await request
        .post(`${config.app.apiPath}${data.endpoint}`)
        .set("authorization", data.token)
        .field(data.params)
        .attach(
          data.params.file_key || "file",
          `${dirname}/assets/${data.params.file_path || "test.bin"}`,
        );
    } else {
      return await request
        .post(`${config.app.apiPath}${data.endpoint}`)
        .set("authorization", data.token || "")
        .send(data.params);
    }
  } catch (error) {
    console.error(error);
  }
};

exports.put_request = async (data) => {
  return await request
    .put(`${config.app.apiPath}${data.endpoint}`)
    .send(data.params);
};

/**
 * Makes a put request against given endpint with provided configurations
 * @param {{ endpoint: string,token: string, params: {file_key: string, file_path: string, [fieldName: string]: any}}} data Configuration options for put request
 * @returns Promise<any>
 */
exports.put_request_with_authorization = async (data) => {
  if (data.fileupload) {
    const dirname = __dirname;
    return await request
      .put(`${config.app.apiPath}${data.endpoint}`)
      .set("authorization", data.token)
      .field(data.params)
      .attach(
        data.params.file_key || "file",
        `${dirname}/assets/${data.params.file_path || "test.bin"}`,
      );
  } else {
    return await request
      .put(`${config.app.apiPath}${data.endpoint}`)
      .set("authorization", data.token)
      .send(data.params);
  }
};
exports.patch_request_with_authorization = async (data) => {
  if (data.fileupload) {
    const dirname = __dirname;
    return await request
      .patch(`${config.app.apiPath}${data.endpoint}`)
      .set("authorization", data.token)
      .field(data.params)
      .attach(
        data.params.file_key || "file",
        `${dirname}/assets/${data.params.file_path || "test.bin"}`,
      );
  } else {
    return await request
      .patch(`${config.app.apiPath}${data.endpoint}`)
      .set("authorization", data.token)
      .send(data.params);
  }
};
exports.delete_request = async (data) => {
  return await request
    .delete(`${config.app.apiPath}${data.endpoint}`)
    .send(data.params);
};

exports.delete_request_with_authorization = async (data) => {
  return await request
    .delete(`${config.app.apiPath}${data.endpoint}`)
    .set("authorization", data.token)
    .send(data.params);
};
