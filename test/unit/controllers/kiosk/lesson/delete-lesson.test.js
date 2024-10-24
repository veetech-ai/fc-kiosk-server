const helper = require("../../../../helper");
const models = require("../../../../../models/index");
const product = require("../../../../../common/products");
const upload_file = require("../../../../../common/upload");
const courseLessonContact = require("../../../../../services/kiosk/contact_lesson");
const { uuid } = require("uuidv4");
let mockFields;
let mockFiles;
let fields;
let files;
let lessonId;
let reqBodyForContactLesson;
let contactCoachId;
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

const mockFormidable = (fields, files) => {
  mockFields = fields;
  mockFiles = files;
};
describe("DELETE /api/v1/course-lesson/{lessonId}", () => {
  let adminToken;
  let courseId;
  let deviceId;
  let deviceToken;
  let testOrganizationId = 1;
  let productId = product.products.kiosk.id;
  let customerToken;
  let differentOrganizationCustomerToken;

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

    adminToken = await helper.get_token_for("admin");
    customerToken = await helper.get_token_for("testCustomer");
    differentOrganizationCustomerToken = await helper.get_token_for(
      "zongCustomer",
    );
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
    const createLesson = async () => {
      fields = {
        gcId: courseId,
        name: "Mark Rober",
        title: "Assistant",
        content: "asdasdasdas asdasdasda",
        timings: "9:00-10:00",
      };

      files = {
        image: {
          name: "mock-logo.png",
          type: "image/png",
          size: 5000, // bytes
          path: "/mock/path/to/logo.png",
        },
      };

      mockFormidable(fields, files);
      jest
        .spyOn(upload_file, "uploadImageForCourse")
        .mockImplementation(() => Promise.resolve("mock-logo-url"));
      const lesson = await helper.post_request_with_authorization({
        endpoint: `course-lesson`,
        token: adminToken,
        params: fields,
      });
      return lesson.body.data.id;
    };
    lessonId = await createLesson();
    reqBodyForContactLesson = {
      lessonId: lessonId,
      phone: "+92111111",
      contact_medium: "call",
    };
    const contactLesson = await helper.post_request_with_authorization({
      endpoint: `kiosk-content/lessons/contacts`,
      token: deviceToken,
      params: reqBodyForContactLesson,
    });
    contactCoachId = contactLesson.body.data.id;
  });

  const makeApiRequest = async (lessonId, token = adminToken) => {
    return await helper.delete_request_with_authorization({
      endpoint: `course-lesson/${lessonId}`,
      token: token,
    });
  };
  const makeApiRequestForGettingLessonContact = async (
    lessonId,
    token = adminToken,
  ) => {
    return await helper.get_request_with_authorization({
      endpoint: `course-lesson/${lessonId}/contacts`,
      token: token,
    });
  };

  it("should successfully return contact lesson response", async () => {
    const response = await makeApiRequest(lessonId);
    expect(response.body.data).toBe(1);
  });

  it("should successfully return contact lesson response with customer of same organization", async () => {
    const response = await makeApiRequestForGettingLessonContact(lessonId);
    expect(response.body.data).toBe("Not found");
  });
});
