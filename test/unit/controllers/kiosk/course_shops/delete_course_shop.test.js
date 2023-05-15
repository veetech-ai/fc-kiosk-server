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
  testUpdated: {
    name : "Assistant Updated",
    subheading: "Sub Heading Updated",
    description: "Extensive Description Updated",
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
  shopId,
  token = adminToken,
) => {
  const shops = await helper.delete_request_with_authorization({
    endpoint: `course-shops/${shopId}`,
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

describe("DELETE /api/v1/course-shops/{shopId}", () => {
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
  });
  
  it("should return an error if the customer is of different org", async () => {
    const response = await makeApiRequest(testCourseShopId, zongCustomerToken);
    const expectedResponse = "Shop not Found"

    expect(response.body.data).toEqual(expectedResponse);
  });

  it("should return an successfully delete a shop with same org customer", async () => {
    const response = await makeApiRequest(testCourseShopId, customerToken);
    const expectedResponse = "Shop Deleted"

    expect(response.body.data).toEqual(expectedResponse);
  });

  it("should delete shop if the user is admin", async () => {
    const response = await makeApiRequest(zongCourseShopId, adminToken);
    const expectedResponse = "Shop Deleted"

    expect(response.body.data).toEqual(expectedResponse);
  });

});
