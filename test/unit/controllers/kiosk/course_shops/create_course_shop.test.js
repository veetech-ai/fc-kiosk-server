const helper = require("../../../../helper");
const upload_file = require("../../../../../common/upload");
const { organizationsInApplication, testOrganizations } = require("../../../../../common/organizations.data");

// Fixtures
let adminToken;
let customerToken;
let zongCustomerToken;
let testOperatorToken;

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
  valid:{
    gcId : 1,
    name : "Assistant",
    subheading: "Sub Heading",
    description: "Extensive Description",
  },
}

// Helper Functions for this test
async function createGolfCourse(reqBody, token) {
  const course = await helper.post_request_with_authorization({
    endpoint: "kiosk-courses/create",
    token: token,
    params: reqBody,
  });
  return course
}

function mockFormidable(mockedReqBody) {
  return {
    IncomingForm: jest.fn().mockImplementation(() => {
      return {
        multiples: true,
        parse: (req, cb) => {
          cb(
            null,
            {
              ...mockedReqBody
            },
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
}

const makeApiRequest = async (
  params,
  token = adminToken,
) => {
  return helper.post_request_with_authorization({
    endpoint: `course-shops`,
    token: token,
    params: params,
  });
};

// mocks
jest.mock("formidable", () => {
  return mockFormidable(shopFixtures.valid);
});


describe("POST /api/v1/course-shops", () => {
  beforeAll(async () => {
    // Create some courses for the test organization
    adminToken = await helper.get_token_for("admin");
    customerToken = await helper.get_token_for("testCustomer");
    zongCustomerToken = await helper.get_token_for("zongCustomer");
    testOperatorToken = await helper.get_token_for("testOperator");

    const course = await createGolfCourse(coursesFixtures.test, adminToken);
    shopFixtures.valid.gcId = course.body.data.id;
  });

  it("should create a new course shop with valid input", async () => {
    jest
      .spyOn(upload_file, "uploadImageForCourse")
      .mockImplementation(() => Promise.resolve("mock-logo-url"));

    const response = await makeApiRequest(shopFixtures.valid);
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
    expect(response.body.data).toEqual(expectedResponse);
  });

  it("should create a new course shop for same org golf course", async () => {
    jest
      .spyOn(upload_file, "uploadImageForCourse")
      .mockImplementation(() => Promise.resolve("mock-logo-url"));

    const response = await makeApiRequest(shopFixtures.valid, customerToken);
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
    expect(response.body.data).toEqual(expectedResponse);
  });
  
  it("should not create a new course shop for different org golf course", async () => {
    jest
      .spyOn(upload_file, "uploadImageForCourse")
      .mockImplementation(() => Promise.resolve("mock-logo-url"));

    const response = await makeApiRequest(shopFixtures.valid, zongCustomerToken);
    const expectedResponse = "Course not Found"
    expect(response.body.data).toEqual(expectedResponse);
  });

  it("should return an error if user belongs to same organization but do not have proper rights is not authorized", async () => {
    const response = await makeApiRequest(
      shopFixtures.valid,
      testOperatorToken,
    );
    expect(response.body.data).toEqual("You are not allowed");
  });

});
