const helper = require("../../../../helper");
const product = require("../../../../../common/products");
const upload_file = require("../../../../../common/upload");
const { uuid } = require("uuidv4");

jest.mock("formidable", () => {
  return {
    IncomingForm: jest.fn().mockImplementation(() => {
      return {
        multiples: true,
        parse: (req, cb) => {
          cb(
            null,
            {
              name: "Sedona Golf Club Exclusive",
              holes: 18,
              par: 72,
              yards: "6900",
              slope: "113",
              content: "Amazing course with beautiful landscapes",
              email: "sample123@gmail.com",
            },
            {
              logo: {
                name: "mock-logo.png",
                type: "image/png",
                size: 5000, // bytes
                path: "/mock/path/to/logo.png",
              },
              course_images: [
                {
                  name: "mock-course-image1.png",
                  type: "image/png",
                  size: 5000, // bytes
                  path: "/mock/path/to/course-image1.png",
                },
                {
                  name: "mock-course-image2.png",
                  type: "image/png",
                  size: 5000, // bytes
                  path: "/mock/path/to/course-image2.png",
                },
              ],
            },
          );
        },
      };
    }),
  };
});

describe("GET /api/v1/kiosk-content/course-info", () => {
  let adminToken;
  let courseId;
  let deviceId;
  let deviceToken;
  let testOrganizationId = 1;
  let productId = product.products.kiosk.id;

  beforeAll(async () => {
    jest
      .spyOn(upload_file, "uploadCourseImage")
      .mockImplementation(() => Promise.resolve("mock-logo-url"));
    jest
      .spyOn(upload_file, "uploadCourseImages")
      .mockImplementation(() => Promise.resolve("mock-images-url"));

    const courseInfoReqBody = {
      name: "Sedona Golf Club Exclusive",
      holes: 18,
      par: 72,
      yards: 6900,
      slope: 113,
      content: "Amazing course with beautiful landscapes",
    };

    // Create some courses for the test organization
    const coursesReqBody = {
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

    adminToken = await helper.get_token_for("admin");

    const course = await helper.post_request_with_authorization({
      endpoint: "kiosk-courses/create",
      token: adminToken,
      params: coursesReqBody,
    });
    courseId = course.body.data.id;

    const device_created = await helper.post_request_with_authorization({
      endpoint: "device/create",
      token: adminToken,
      params: deviceReqBody,
    });
    deviceId = device_created.body.data.id;

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

    await helper.patch_request_with_authorization({
      endpoint: `kiosk-courses/${courseId}/course-info`,
      token: adminToken,
      params: courseInfoReqBody,
    });
  });

  const makeApiRequest = async (token = deviceToken) => {
    return await helper.get_request_with_authorization({
      endpoint: `kiosk-content/course-info`,
      token: token,
    });
  };

  it("should successfully list course info related to device", async () => {
    const expected = {
      name: "Sedona Golf Club Exclusive",
      holes: 18,
      par: 72,
      yards: 6900,
      slope: 113,
      content: "Amazing course with beautiful landscapes",
    };
    const response = await makeApiRequest();
    expect(response.body.data).toEqual(expect.objectContaining(expected));
  });

  it("returns 403 status code Request", async () => {
    const response = await makeApiRequest({}, adminToken);
    expect(response.body.data).toEqual("Token invalid or expire");
  });
});
