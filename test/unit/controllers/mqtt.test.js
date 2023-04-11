const helperTest = require("../../helper");
const { uuid } = require("uuidv4");
const { products } = require("../../../common/products");

const {
  updateScreenBasedOnDeviceId,
} = require("../../../controllers/mqtt/helper");

describe("device last seen", () => {
  let tokens;
  let devices;
  async function createNewDevices(token) {
    const devicesData = {
      kiosk: {
        device_type: products.kiosk.id,
        serial: uuid(),
        pin_code: "1111",
      },
    };
    const data = {
      endpoint: "device/create",
      token,
    };
    const devices = {};
    for await (const [key, value] of Object.entries(devicesData)) {
      data.params = value;
      const device = await helperTest.post_request_with_authorization(data);
      devices[key] = device.body.data;
    }
    return devices;
  }
  beforeAll(async () => {
    tokens = await helperTest.get_all_roles_tokens();
    devices = await createNewDevices(tokens.admin);
  });

  it("test last seen device time save in database correctly", async () => {
    const lastSeen = Date.now();
    const action = {
      deviceId: devices.kiosk.id,
      deviceType: devices.kiosk.device_type,
      ts: lastSeen,
    };
    await updateScreenBasedOnDeviceId({
      action,
      deviceId: devices.kiosk.id,
    });
    const res = await helperTest.get_request_with_authorization({
      endpoint: `device/${devices.kiosk.id}`,
      token: tokens.admin,
    });
    expect(res.body.success).toBe(true);
    expect(res.body.data.Device.lst).toBe(lastSeen.toString());
  });
});
