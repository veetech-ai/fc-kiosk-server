const helper = require("../../../../helper");
const product = require("../../../../../common/products");
const upload_file = require("../../../../../common/upload");
const { uuid } = require("uuidv4");

let mockFields;
let mockFiles;
jest.mock("formidable", () => {
  return {
    IncomingForm: jest.fn().mockImplementation(() => {
      return {
        multiples: true,
        parse: (req, cb) => {
          cb(null, mockFields, mockFiles);
        },
      };
    }),
  };
});
let fields = {
  state: "Alabama",
  title: "Main Ad",
};

let files = {
  adImage: {
    name: "mock-logo.png",
    type: "image/png",
    size: 5000, // bytes
    path: "/mock/path/to/logo.png",
  },
};
jest
  .spyOn(upload_file, "uploadImageForCourse")
  .mockImplementation(() => Promise.resolve("mock-logo-url"));
const mockFormidable = (fields, files) => {
  mockFields = fields;
  mockFiles = files;
};
describe("GET /api/v1/kiosk-content/ads", () => {
  let adminToken;
  let courseId;
  let deviceId;
  let deviceToken;
  let unlinkeddeviceToken;
  let createdAd;
  let testOrganizationId = 1;
  let productId = product.products.kiosk.id;

  beforeAll(async () => {
    // Create some courses for the test organization
    const courses = {
      name: "Course 1",
      city: "Test City 1",
      state: "Test State 1",
      orgId: testOrganizationId,
    };
    const deviceReqBody = {
      serial: uuid(),
      pin_code: 1111,
      device_type: productId,
    };
    const seconddeviceReqBody = {
      serial: uuid(),
      pin_code: 1122,
      device_type: productId,
    };

    adminToken = await helper.get_token_for("admin");
    const course = await helper.post_request_with_authorization({
      endpoint: "kiosk-courses",
      token: adminToken,
      params: courses,
    });
    courseId = course.body.data.id;
    const device_created = await helper.post_request_with_authorization({
      endpoint: "device/create",
      token: adminToken,
      params: deviceReqBody,
    });
    deviceId = device_created.body.data.id;
    const unlinked_device_created =
      await helper.post_request_with_authorization({
        endpoint: "device/create",
        token: adminToken,
        params: seconddeviceReqBody,
      });
    unlinkeddeviceToken =
      unlinked_device_created.body.data.device_token.split(" ")[1];
    await helper.put_request_with_authorization({
      endpoint: `device/${deviceId}/courses/${courseId}/link`,
      params: {},
      token: adminToken,
    });
    const device = await helper.get_request_with_authorization({
      endpoint: `device/${deviceId}`,
      token: adminToken,
    });
    deviceToken = device.body.data.Device.device_token.split(" ")[1];

    const makeAdApi = async (fields, files) => {
      fields.gcId = courseId;
      mockFormidable(fields, files);
      return await helper.post_request_with_authorization({
        endpoint: `ads`,
        token: adminToken,
        params: fields,
      });
    };
    createdAd = await makeAdApi(files, fields);
  });

  const makeApiRequest = async (token = deviceToken) => {
    return await helper.get_request_with_authorization({
      endpoint: `kiosk-content/ads`,
      token: token,
    });
  };

  it("should successfully return ads registered against the golf course linked to device", async () => {
    const expectedObject = {
      id: createdAd.body.data.id,
      gcId: createdAd.body.data.gcId,
      smallImage: createdAd.body.data.smallImage,
      orgId: createdAd.body.data.orgId,
      screens: createdAd.body.data.screens,
    };
    const response = await makeApiRequest();
    expect(response.body.success).toEqual(true);
    expect(response.body.data).toEqual(
      expect.arrayContaining([expect.objectContaining(expectedObject)]),
    );
  });
  it("should return error while the api is being accessed by the unlinked device ", async () => {
    const response = await makeApiRequest(unlinkeddeviceToken);
    expect(response.body.success).toBe(false);
    expect(response.status).toBe(404);
    expect(response.body.data).toBe("No Course linked with the device");
  });
  it("returns error if api is accsessed by any other than device token", async () => {
    const response = await makeApiRequest(adminToken);
    expect(response.body.data).toEqual("Token invalid or expire");
  });
});
