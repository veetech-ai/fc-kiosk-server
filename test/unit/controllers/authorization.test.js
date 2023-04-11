const jwt = require("jsonwebtoken");
const config = require("../../../config/config");
const helper = require("../../helper");

let tokens, inactive_user;
beforeAll(async () => {
  tokens = await helper.get_all_roles_tokens();
  inactive_user = (
    await helper.post_request({
      endpoint: "user/register",
      params: {
        name: "Test inactive user",
        email: helper.inactive_user_email,
        password: helper.inactive_user_password,
        password_confirmation: helper.inactive_user_password,
        phone: "+15417545597",
      },
    })
  ).body.data;
});

describe("/auth", () => {
  // login
  it("Should fail when  Email  is Invalid (password correct)", async () => {
    const res = await helper.post_request({
      endpoint: "auth",
      params: {
        email: helper.wrong_email,
        password: helper.super_admin_password,
      },
    });

    expect(res.statusCode).toEqual(422);
    expect(res.body.success).toEqual(false);
    expect(res.body.data).toEqual("Invalid email");
  });
  it("Should fail when  Password  is Wrong (email correct)", async () => {
    const res = await helper.post_request({
      endpoint: "auth",
      params: {
        email: helper.super_admin_email,
        password: helper.wrong_password,
      },
    });

    expect(res.statusCode).toEqual(422);
    expect(res.body.success).toEqual(false);
    expect(res.body.data).toEqual("Invalid Password");
  });
  it("Correct login credentials", async () => {
    const res = await helper.post_request({
      endpoint: "auth",
      params: {
        email: helper.super_admin_email,
        password: helper.super_admin_password,
      },
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
  });

  it.skip('Refresh Token of role "device" must increase default expiry time by provided number of seconds', async () => {
    const res = await helper.post_request({
      endpoint: "auth",
      params: {
        email: helper.device_role_user_email,
        password: helper.device_role_user_password,
      },
    });
    const { iat, exp } = jwt.decode(res.body.data.refreshToken);

    const defaultExp = Number(config.jwt.refreshExpirationInSeconds);
    const secondsExtension = Number(config.jwt.tokenExpiryExtensionSeconds);
    const expectedExp = iat + defaultExp + secondsExtension;

    expect(expectedExp).toEqual(exp);
  });

  it("should auth and expiry time should be expirationLongInSeconds with string boolean value true", async () => {
    const res = await helper.post_request({
      endpoint: "auth",
      params: {
        email: helper.super_admin_email,
        password: helper.super_admin_password,
        remember: true,
      },
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);

    const { iat, exp } = jwt.decode(res.body.data.accessToken);
    const expectedExp = iat + Number(config.jwt.expirationLongInSeconds);
    expect(expectedExp).toEqual(exp);
  });

  it("should auth and expiry time should be expirationLongInSeconds with string value true", async () => {
    const res = await helper.post_request({
      endpoint: "auth",
      params: {
        email: helper.super_admin_email,
        password: helper.super_admin_password,
        remember: "true",
      },
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);

    const { iat, exp } = jwt.decode(res.body.data.accessToken);
    const expectedExp = iat + Number(config.jwt.expirationLongInSeconds);
    expect(expectedExp).toEqual(exp);
  });

  it("should auth and expiry time should be expirationLongInSeconds with string value True", async () => {
    const res = await helper.post_request({
      endpoint: "auth",
      params: {
        email: helper.super_admin_email,
        password: helper.super_admin_password,
        remember: "True",
      },
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);

    const { iat, exp } = jwt.decode(res.body.data.accessToken);
    const expectedExp = iat + Number(config.jwt.expirationLongInSeconds);
    expect(expectedExp).toEqual(exp);
  });

  it("should auth and expiry time should be expirationShortInSeconds with string value False", async () => {
    const res = await helper.post_request({
      endpoint: "auth",
      params: {
        email: helper.super_admin_email,
        password: helper.super_admin_password,
        remember: "False",
      },
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);

    const { iat, exp } = jwt.decode(res.body.data.accessToken);
    const expectedExp = iat + Number(config.jwt.expirationShortInSeconds);
    expect(expectedExp).toEqual(exp);
  });

  it("should auth and expiry time should be expirationShortInSeconds with wrong string value", async () => {
    const res = await helper.post_request({
      endpoint: "auth",
      params: {
        email: helper.super_admin_email,
        password: helper.super_admin_password,
        remember: "unparsable",
      },
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);

    const { iat, exp } = jwt.decode(res.body.data.accessToken);
    const expectedExp = iat + Number(config.jwt.expirationShortInSeconds);
    expect(expectedExp).toEqual(exp);
  });
  it('Refresh Token of all roles except "device" must have the default expiry time', async () => {
    const emailPaswordsOfTestAccounts = [
      [helper.super_admin_email, helper.super_admin_password],
      [helper.admin_email, helper.admin_password],
      [helper.testAccountEmail, helper.testAccountPassword],
      [helper.testOperatorEmail, helper.testOperatorPassword],
      [helper.testCeoEmail, helper.testCeoPassword],
      [helper.zongCustomerEmail, helper.zongCustomerPassword],
    ];
    for (const [email, password] of emailPaswordsOfTestAccounts) {
      const res = await helper.post_request({
        endpoint: "auth",
        params: {
          email: email,
          password: password,
        },
      });
      const { iat, exp } = jwt.decode(res.body.data.refreshToken);

      const defaultExp = Number(config.jwt.refreshExpirationInSeconds);
      const expectedExp = iat + defaultExp;
      expect(expectedExp).toEqual(exp);
    }
  });

  it("In correct login credentials", async () => {
    const res = await helper.post_request({
      endpoint: "auth",
      params: {
        email: helper.incorrect_email,
        password: helper.incorrect_password,
      },
    });

    expect(res.statusCode).toEqual(422);
    expect(res.body.success).toEqual(false);
  });

  it("In correct email format for Login", async () => {
    const res = await helper.post_request({
      endpoint: "auth",
      params: {
        email: `${helper.super_admin_email}1`,
        password: helper.super_admin_password,
      },
    });

    expect(res.statusCode).toEqual(422);
    expect(res.body.success).toEqual(false);
  });
});

describe("/refresh-token", () => {
  // Refresh token
  it("Empty token", async () => {
    const res = await helper.post_request({
      endpoint: "refresh-token",
      params: {},
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toEqual(false);
  });

  it("Invalid token", async () => {
    const res = await helper.post_request({
      endpoint: "refresh-token",
      params: {
        token: "invalid token",
      },
    });

    expect(res.statusCode).toEqual(407);
    expect(res.body.success).toEqual(false);
  });

  it("Success Case", async () => {
    const res = await helper.post_request({
      endpoint: "refresh-token",
      params: {
        token: tokens.superadmin,
      },
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
  });
});

describe("/auth/login-as", () => {
  // Login As
  it("Without authorization token", async () => {
    const res = await helper.post_request({
      endpoint: "auth/login-as",
      params: {},
    });

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toEqual(false);
  });

  it("Empty token", async () => {
    const res = await helper.post_request_with_authorization({
      endpoint: "auth/login-as",
      params: {},
      token: tokens.superadmin,
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toEqual(false);
  });

  it("Invalid token", async () => {
    const res = await helper.post_request_with_authorization({
      endpoint: "auth/login-as",
      params: {
        token: "invalid token",
      },
      token: tokens.superadmin,
    });

    expect(res.statusCode).toEqual(500);
    expect(res.body.success).toEqual(false);
  });

  it("Without Super admin account", async () => {
    const res = await helper.post_request_with_authorization({
      endpoint: "auth/login-as",
      params: {
        token: "token",
      },
      token: tokens.testCustomer,
    });

    expect(res.statusCode).toEqual(403);
    expect(res.body.success).toEqual(false);
  });

  it("Success case", async () => {
    const user_call = await helper.get_request_with_authorization({
      endpoint: "user/get/1",
      token: tokens.superadmin,
    });

    const res = await helper.post_request_with_authorization({
      endpoint: "auth/login-as",
      params: {
        token: user_call.body.data.mqtt_token,
      },
      token: tokens.superadmin,
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
  });
});

describe("/auth/resend-activation-email", () => {
  // resend-activation-email
  it("without params", async () => {
    const res = await helper.post_request({
      endpoint: "auth/resend-activation-email",
      params: {},
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toEqual(false);
  });

  it("Invalid email format", async () => {
    const res = await helper.post_request({
      endpoint: "auth/resend-activation-email",
      params: {
        email: `${helper.incorrect_email}1`,
      },
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toEqual(false);
  });

  it("Invalid email address", async () => {
    const res = await helper.post_request({
      endpoint: "auth/resend-activation-email",
      params: {
        email: helper.incorrect_email,
      },
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toEqual(false);
  });

  it("Already verified email address", async () => {
    const res = await helper.post_request({
      endpoint: "auth/resend-activation-email",
      params: {
        email: helper.test_email,
      },
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toEqual(false);
  });

  it("Success Case", async () => {
    const res = await helper.post_request({
      endpoint: "auth/resend-activation-email",
      params: {
        email: helper.inactive_user_email,
      },
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
  });
});

describe("/auth/verify-code", () => {
  // verify registration code
  it("without params", async () => {
    const res = await helper.post_request({
      endpoint: "auth/verify-code",
      params: {},
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toEqual(false);
  });

  it("Invalid email format", async () => {
    const res = await helper.post_request({
      endpoint: "auth/verify-code",
      params: {
        email: `${helper.incorrect_email}1`,
        code: "invalid code",
      },
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toEqual(false);
  });

  it("Invalid email address", async () => {
    const res = await helper.post_request({
      endpoint: "auth/verify-code",
      params: {
        email: helper.incorrect_email,
        code: "invalid code",
      },
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toEqual(false);
  });

  it("Success Case", async () => {
    const inactive_user_profile = (
      await helper.get_request_with_authorization({
        endpoint: `user/get/${inactive_user.id}`,
        token: tokens.superadmin,
      })
    ).body.data;

    const res = await helper.post_request({
      endpoint: "auth/verify-code",
      params: {
        email: inactive_user_profile.email,
        code: inactive_user_profile.email_code,
      },
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
  });
});
