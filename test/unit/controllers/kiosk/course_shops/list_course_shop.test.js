const helper = require("../../../../helper");
const upload_file = require("../../../../../common/upload");
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

let testCourseId;
let zongCourseId;
let testCourseShopId;
let zongCourseShopId;
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
function changeFormidableMockedValues(reqBody) {
  mockedReqBody = reqBody
}

const makeApiRequest = async (
  courseId,
  token = adminToken,
) => {
  console.log("idddddddddddddddddddddddddd", courseId);
  return helper.get_request_with_authorization({
    endpoint: `course-shops/course/${courseId}`,
    token: token,
  });
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

describe("POST /api/v1/course-shops", () => {
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
    console.log(testCourseId, zongCourseId);
    const courseShop = await createGolfCourseShop({...shopFixtures.test, gcId: testCourseId }, adminToken);
    testCourseShopId = courseShop.body.data.id;

    const zongCourseShop = await createGolfCourseShop({...shopFixtures.zong, gcId: zongCourseId }, adminToken);
    zongCourseShopId = zongCourseShop.body.data.id;
    
    // console.log("ddsddd,", zongCourseShop.body.data);
  });

  it("should return a list shops for the golf course", async () => {
    const response = await makeApiRequest(testCourseId);
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

  it("should return shops for courses to the same org customer", async () => {
    const response = await makeApiRequest(testCourseId, customerToken);
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
    console.log("response.body.data.length", response.body.data);
    expect(response.body.data).toEqual(expect.arrayContaining([expect.objectContaining(expectedResponse)]));
  });

  it("should return an error if the golf course is of different org", async () => {
    const response = await makeApiRequest(testCourseId, zongCustomerToken);
    const expectedResponse = "Course not Found"
    expect(response.body.data).toEqual(expectedResponse);
  });
  
  // it("should not create a new course shop for different org golf course", async () => {
  //   jest
  //     .spyOn(upload_file, "uploadImageForCourse")
  //     .mockImplementation(() => Promise.resolve("mock-logo-url"));

  //   const response = await makeApiRequest(shopFixtures.test, zongCustomerToken);
  //   const expectedResponse = "Course not Found"
  //   expect(response.body.data).toEqual(expectedResponse);
  // });

  // it("should return an error if user belongs to same organization but do not have proper rights is not authorized", async () => {
  //   const response = await makeApiRequest(
  //     shopFixtures.valid,
  //     testOperatorToken,
  //   );
  //   expect(response.body.data).toEqual("You are not allowed");
  // });

});
