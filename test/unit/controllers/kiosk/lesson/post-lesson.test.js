const helper = require("../../../../helper");
const upload_file = require("../../../../../common/upload");

// Mocking formidable
// jest.mock("formidable", () => {
//   return {
//     IncomingForm: jest.fn().mockImplementation(() => {
//       return {
//         multiples: true,
//         parse: (req, cb) => {
//           cb(
//             null,
//             {
//               name: "Mark Rober",
//               title: "Assistant",
//               content: "asdasdasdas asdasdasda",
//               timings: "9:00-10:00",
//             },
//             {
//               image: {
//                 name: "mock-logo.png",
//                 type: "image/png",
//                 size: 5000, // bytes
//                 path: "/mock/path/to/logo.png",
//               },
//             },
//           );
//         },
//       };
//     }),
//   };
// });
// Mocking formidable
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

const mockFormidable = (fields, files) => {
  mockFields = fields;
  mockFiles = files;
};

describe("POST /api/v1/kiosk-courses/{orgId}/{courseId}/lesson", () => {
  let adminToken;
  let courseId;
  let orgId;
  let customerToken;
  let testOperatorToken;
  let testOrganizationId = 1;

  beforeAll(async () => {
    // Create some courses for the test organization
    const courses = {
      name: "Course 1",
      city: "Test City 1",
      state: "Test State 1",
      orgId: testOrganizationId,
    };

    adminToken = await helper.get_token_for("admin");
    customerToken = await helper.get_token_for("testCustomer");
    testOperatorToken = await helper.get_token_for("testOperator");
    const course = await helper.post_request_with_authorization({
      endpoint: "kiosk-courses",
      token: adminToken,
      params: courses,
    });
    courseId = course.body.data.id;
    orgId = course.body.data.orgId;
  });

  const makeApiRequest = async (params, token = adminToken) => {
    return helper.post_request_with_authorization({
      endpoint: `course-lesson`,
      token: token,
      params: params,
    });
  };

  it("should create a new course info with valid input", async () => {
    const fields = {
      gcId: courseId,
      name: "Mark -o plier",
      title: "Assistant Professor",
      content: "asdasdasdas asdasdasda",
      timings: "9:00-10:00",
    };

    const files = {
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

    const response = await makeApiRequest(fields);
    expect(response.body.data.name).toEqual(fields.name);
    expect(response.body.data.title).toEqual(fields.title);
    expect(response.body.data.content).toEqual(fields.content);
    expect(response.body.data.timings).toEqual(fields.timings);
  });
  it("should create a new course with the customer token who is the part of same organization", async () => {
    const fields = {
      gcId: courseId,
      name: "Mark -o plier",
      title: "Assistant Professor",
      content: "asdasdasdas asdasdasda",
      timings: "9:00-10:00",
    };

    const files = {
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

    const response = await makeApiRequest(fields, customerToken);
    expect(response.body.data.name).toEqual(fields.name);
    expect(response.body.data.title).toEqual(fields.title);
    expect(response.body.data.content).toEqual(fields.content);
    expect(response.body.data.timings).toEqual(fields.timings);
  });
  it("should return an error if user belongs to different organization", async () => {
    const params = {};
    const response = await makeApiRequest(params, testOperatorToken);
    expect(response.body.data).toEqual("You are not allowed");
  });
});
