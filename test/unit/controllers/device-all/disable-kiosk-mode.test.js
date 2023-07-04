const helper = require("../../../helper");
const { uuid } = require("uuidv4");
const product = require("../../../../common/products");
describe("GET /api/v1/device/{id}/disable-kiosk-mode", () => {
  let superAdminToken;
  let adminToken;
  let customerToken;
  let deviceId;
  let invalidDeviceId = 90000000;
  let stringDeviceId = "Not integer";

  beforeAll(async () => {
    const bodyData = {
      serial: uuid(),
      pin_code: 1111,
      device_type: product.products.kiosk.id,
    };

    superAdminToken = await helper.get_token_for("superadmin");
    adminToken = await helper.get_token_for("admin");
    customerToken = await helper.get_token_for("testCustomer");

    const device = await helper.post_request_with_authorization({
      endpoint: "device/create",
      token: superAdminToken,
      params: bodyData,
    });
    deviceId = device.body.data.id;
  });

  const makeApiRequest = async (deviceId, token = superAdminToken) => {
    const deviceIdString = deviceId.toString();

    return await helper.get_request_with_authorization({
      endpoint: `device/${deviceIdString}/disable-kiosk-mode`,
      params: {},
      token: token,
    });
  };

  it("should allow admin to successfully disable the kiosk mode", async () => {
    const response = await makeApiRequest(deviceId, adminToken);
    const expectedResponse = {
      message: "Payload: Disable kiosk mode has been sent successfully",
      statusCode: 200,
    };
    expect(response.body.data).toBe(expectedResponse.message);
    expect(response.status).toEqual(expectedResponse.statusCode);
  });

  it("should allow superadmin successfully disable the kiosk mode", async () => {
    const response = await makeApiRequest(deviceId, superAdminToken);
    const expectedResponse = {
      message: "Payload: Disable kiosk mode has been sent successfully",
      statusCode: 200,
    };
    expect(response.body.data).toBe(expectedResponse.message);
    expect(response.status).toEqual(expectedResponse.statusCode);
  });

  it("should return 404 status code with expected message for an invalid device", async () => {
    const response = await makeApiRequest(invalidDeviceId, superAdminToken);
    const expectedResponse = {
      message: "Device not found",
      statusCode: 404,
    };
    expect(response.body.data).toBe(expectedResponse.message);
    expect(response.status).toEqual(expectedResponse.statusCode);
  });

  it("should return 400 status code with expected message for an non integer device", async () => {
    const response = await makeApiRequest(stringDeviceId, superAdminToken);
    const expectedResponse = {
      message: "Device id must be a valid integer",
      statusCode: 400,
    };
    expect(response.body.data).toBe(expectedResponse.message);
    expect(response.status).toEqual(expectedResponse.statusCode);
  });

  it("should not allow customer to disable kiosk mode", async () => {
    const response = await makeApiRequest(stringDeviceId, customerToken);
    const expectedResponse = {
      message: "You are not allowed",
      statusCode: 403,
    };
    expect(response.body.data).toBe(expectedResponse.message);
    expect(response.status).toEqual(expectedResponse.statusCode);
  });
});
