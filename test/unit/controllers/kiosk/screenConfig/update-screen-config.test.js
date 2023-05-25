const helper = require("../../../../helper");
const AdsService = require("../../../../../services/kiosk/ads");
const Commonhelper = require("../../../../../common/helper");
const upload_file = require("../../../../../common/upload");

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
describe("GET /api/v1/screen-config/courses/update-screen/{courseId}", () => {
  let adminToken;
  let customerToken;
  let testManagerToken;
  let differentOrganizationCustomerToken;
  let testOrganizationId = 1;
  let courseId;
  let validbody = { courseInfo: true, lessons: false };
  const invalidBody = { courseInfo: "aa", lessons: false };
  beforeAll(async () => {
    global.mqtt_connection_ok = true;
    // Create some courses for the test organization
    const courses = {
      name: "Course 1",
      city: "Test City 1",
      state: "Test State 1",
      orgId: testOrganizationId,
    };

    adminToken = await helper.get_token_for("admin");
    customerToken = await helper.get_token_for("testCustomer");
    testManagerToken = await helper.get_token_for("testManager");
    differentOrganizationCustomerToken = await helper.get_token_for(
      "zongCustomer",
    );
    const course = await helper.post_request_with_authorization({
      endpoint: "kiosk-courses",
      token: adminToken,
      params: courses,
    });
    courseId = course.body.data.id;
    const makeAdApi = async (fields, files) => {
      fields.gcId = courseId;
      mockFormidable(fields, files);
      return await helper.post_request_with_authorization({
        endpoint: `ads`,
        token: adminToken,
        params: fields,
      });
    };
    const ree = await makeAdApi(files, fields);
    console.log("ree :", ree.body.data);
  });

  afterAll(() => {
    global.mqtt_connection_ok = false;
  });

  const makeApiRequest = async (courseId, params, token = adminToken) => {
    return await helper.put_request_with_authorization({
      endpoint: `screen-config/courses/${courseId}`,
      params,
      token: token,
    });
  };

  it("should successfully update screen configurations for a given course", async () => {
    const response = await makeApiRequest(courseId, validbody);
    const { courseInfo, lessons } = response.body.data;
    const actualResponse = { courseInfo, lessons };
    expect(actualResponse).toMatchObject(validbody);
  });

  it("returns 404 status code Request with expected message for an invalid course ID", async () => {
    const response = await makeApiRequest(999);
    expect(response.status).toEqual(404);
    expect(response.body.data).toEqual("Course not found");
  });
  it("ensure that organization customer can get screen details for the course belongs to same organization ", async () => {
    const response = await makeApiRequest(courseId, validbody, customerToken);
    const { courseInfo, lessons } = response.body.data;
    const actualResponse = { courseInfo, lessons };
    expect(actualResponse).toMatchObject(validbody);
  });
  it("returns validation error for an invalid course ID", async () => {
    const response = await makeApiRequest("aa");
    expect(response.body.data).toEqual("courseId must be a valid number");
  });
  it("should throw validation error when a non-boolean value is passed in the request body", async () => {
    const response = await makeApiRequest(courseId, invalidBody, customerToken);
    expect(response.body.data.errors).toEqual({
      courseInfo: ["The courseInfo attribute has errors."],
    });
  });
  it("should return an error if user belongs to same organization but do not have proper rights is not authorized", async () => {
    const response = await makeApiRequest(
      courseId,
      validbody,
      testManagerToken,
    );
    expect(response.body.data).toEqual("You are not allowed");
  });

  it("should return an error if user belongs to different organization", async () => {
    const response = await makeApiRequest(
      courseId,
      validbody,
      differentOrganizationCustomerToken,
    );
    expect(response.body.data).toEqual("Course not found");
  });

  it("should successfully update the screens of related golf course ads after screens config has been updated", async () => {
    const response = await makeApiRequest(courseId, validbody, customerToken);
    const allowedFields = [
      "courseInfo",
      "coupons",
      "lessons",
      "statistics",
      "memberships",
      "feedback",
      "careers",
      "shop",
      "faq",
    ];

    const filterdObject = Commonhelper.validateObject(
      response.body.data,
      allowedFields,
    );
    const enabledScreens = Object.keys(filterdObject).filter(
      (key) => filterdObject[key] === true,
    );
    const ads = await AdsService.getAds({ gcId: courseId });
    expect(ads[0].dataValues.screens).toEqual(enabledScreens);
  });
});
