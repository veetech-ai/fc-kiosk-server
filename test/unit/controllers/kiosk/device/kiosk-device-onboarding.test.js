const helper = require("../../../../helper");
const product = require("../../../../../common/products");
const { uuid } = require("uuidv4");

async function getCurrentOTP(token) {
  const otp = await helper.get_request_with_authorization({
    endpoint: "device-onboarding-codes",
    token,
  });

  return otp?.body?.data?.code;
}
async function createDeviceForOnboarding(reqBody, token = null) {
  const device = await helper.post_request_with_authorization(
    {
      endpoint: "device/create/onboarding",
      params: reqBody,
      token,
    },
    true,
  );

  return device;
}

describe("post /api/v1/device/create/onboarding", () => {
  let expectedCode;
  let superAdminToken;

  beforeAll(async () => {
    superAdminToken = await helper.get_token_for("superadmin");
    expectedCode = await getCurrentOTP(superAdminToken);
  });

  it("should throw an error if code is not provided in header", async () => {
    const reqBody = {
      serial: uuid(),
      pin_code: uuid(),
      device_type: product.products.kiosk.id,
    };
    const response = await createDeviceForOnboarding(reqBody);

    const expectedResponse = {
      success: false,
      data: "Device code not provided",
    };
    expect(response.body).toEqual(expectedResponse);
  });

  it("should throw an error if the device onboarding code is not valid", async () => {
    const reqBody = {
      serial: uuid(),
      pin_code: uuid(),
      device_type: product.products.kiosk.id,
    };

    const response = await createDeviceForOnboarding(reqBody, 1111);
    const expectedResponse = { success: false, data: "Invalid code" };
    expect(response.body).toMatchObject(expectedResponse);
  });

  it("should successfully create a device and return device token", async () => {
    const reqBody = {
      serial: uuid(),
      pin_code: uuid(),
      device_type: product.products.kiosk.id,
    };
    const response = await createDeviceForOnboarding(reqBody, expectedCode);

    expect(response.body.success).toEqual(true);
    expect(response.body?.data?.device_token).toEqual(expect.any(String));
  });

  it("should throw error if token is used twice", async () => {
    const reqBody = {
      serial: uuid(),
      pin_code: uuid(),
      device_type: product.products.kiosk.id,
    };

    const response = await createDeviceForOnboarding(reqBody, expectedCode);
    const expectedResponse = { success: false, data: "Invalid code" };

    expect(response.body).toEqual(expectedResponse);
  });
});
