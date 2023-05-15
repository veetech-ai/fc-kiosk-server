const helper = require("../../../../helper");
const upload_file = require("../../../../../common/upload");
const product = require("../../../../../common/products");
const { uuid } = require("uuidv4");
const { organizationsInApplication, testOrganizations } = require("../../../../../common/organizations.data");

// Fixtures
const coursesFixtures = {
  test: {
    name: "Course 1",
    city: "Test City 1",
    state: "Test State 1",
    orgId: organizationsInApplication.test.id,
  },
  zong: {
    name: "Course 2",
    city: "Test City 2",
    state: "Test State 2",
    orgId: testOrganizations.zong.id,
  }
}

const shopFixtures = {
  test: {
    name : "Assistant",
    subheading: "Sub Heading",
    description: "Extensive Description",
  },
  zong: {
    name : "Assistant",
    subheading: "Sub Heading",
    description: "Extensive Description",
  },
}

const deviceFixtures = {
  test: {
    serial: uuid(),
    pin_code: 1111,
    device_type: product.products.kiosk.id,
  },
  unlinked: {
    serial: uuid(),
    pin_code: 2222,
    device_type: product.products.kiosk.id,
  },
}

let testCourseId;
let zongCourseId;
let testCourseShopId;
let zongCourseShopId;
let deviceId;
let deviceToken;
let unlinkedDeviceToken;
let unlinkedDeviceId;
let adminToken;
let customerToken;
let zongCustomerToken;
let testOperatorToken;
let mockedReqBody = shopFixtures.test;

// Helper Functions for this test
async function createGolfCourse(reqBody, token = adminToken) {
  const course = await helper.post_request_with_authorization({
    endpoint: "kiosk-courses/create",
    token: token,
    params: reqBody,
  });
  return course
}

async function createGolfCourseShop(reqBody, token = adminToken) {
  const courseShop = await helper.post_request_with_authorization({
    endpoint: "course-shops",
    token: token,
    params: reqBody,
  });

  return courseShop
}

async function createDevice(reqBody, token = adminToken) {
  const device_created = await helper.post_request_with_authorization({
    endpoint: "device/create",
    token: token,
    params: reqBody,
  });

  return device_created
}

async function linkDeviceToCourse(deviceId, courseId, token = adminToken) {
  const linkedDevice = await helper.put_request_with_authorization({
    endpoint: `device/${deviceId}/courses/${courseId}/link`,
    params: {},
    token: token,
  });

  return linkedDevice
}

function changeFormidableMockedValues(reqBody) {
  mockedReqBody = reqBody
}

const makeApiRequest = async (
  token = deviceToken,
) => {
  const shops = await helper.get_request_with_authorization({
    endpoint: `kiosk-content/shops`,
    token: token,
  });
  return shops
};

// mocks
jest.mock("formidable", () => {
  return {
    IncomingForm: jest.fn().mockImplementation(() => {
      return {
        multiples: true,
        parse: (req, cb) => {
          cb(
            null,
            mockedReqBody,
            {
              image: {
                name: "mock-logo.png",
                type: "image/png",
                size: 5000, // bytes
                path: "/mock/path/to/logo.png",
              },
            },
          );
        },
      };
    }),
  };
});

jest
.spyOn(upload_file, "uploadImageForCourse")
.mockImplementation(() => Promise.resolve("mock-logo-url"));

describe("GET /api/v1/kiosk-content/shops", () => {
  beforeAll(async () => {
    // Create some courses for the test organization
    adminToken = await helper.get_token_for("admin");
    customerToken = await helper.get_token_for("testCustomer");
    zongCustomerToken = await helper.get_token_for("zongCustomer");
    testOperatorToken = await helper.get_token_for("testOperator");
    
    const course = await createGolfCourse(coursesFixtures.test, adminToken);
    const zongCourse = await createGolfCourse(coursesFixtures.zong, adminToken);
    
    testCourseId = course.body.data.id
    zongCourseId = zongCourse.body.data.id
    
    const reqBodyOne = {...shopFixtures.test, gcId: testCourseId }
    changeFormidableMockedValues(reqBodyOne) 
    const courseShop = await createGolfCourseShop(reqBodyOne, adminToken);
    testCourseShopId = courseShop.body.data.id;

    const reqBodyTwo = {...shopFixtures.zong, gcId: zongCourseId }
    changeFormidableMockedValues(reqBodyTwo) 
    const zongCourseShop = await createGolfCourseShop(reqBodyTwo, adminToken);
    zongCourseShopId = zongCourseShop.body.data.id;

    // Create a device
    const device = await createDevice(deviceFixtures.test);
    deviceId = device.body.data.id;
    deviceToken = device.body.data.device_token.split(" ")[1];

    const deviceUnlinked = await createDevice(deviceFixtures.unlinked);
    unlinkedDeviceId = deviceUnlinked.body.data.id;
    unlinkedDeviceToken = deviceUnlinked.body.data.device_token.split(" ")[1];
    
    // Link Device
    await linkDeviceToCourse(deviceId, testCourseId)
  });

  it("should return a list shops for the golf course attached to device", async () => {
    const response = await makeApiRequest(deviceToken);
    const expectedResponse = {
      "createdAt": expect.any(String),
      "description": expect.any(String),
      "gcId": expect.any(Number),
      "id": expect.any(Number),
      "image": expect.any(String),
      "name": expect.any(String),
      "orgId": expect.any(Number),
      "subheading": expect.any(String),
      "updatedAt": expect.any(String),
    }
    expect(response.body.data).toEqual(expect.arrayContaining([expect.objectContaining(expectedResponse)]));
  });

  it("should return an error if the device is not attached to a golf course", async () => {
    const response = await makeApiRequest(unlinkedDeviceToken);
    const expectedResponse = "Course not found";

    expect(response.body.data).toEqual(expectedResponse);
  });

});
