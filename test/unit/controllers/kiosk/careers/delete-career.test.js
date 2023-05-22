const {
  organizationsInApplication,
} = require("../../../../../common/organizations.data");
const helper = require("../../../../helper");

const CareersServices = require("../../../../../services/kiosk/career");
const CoursesServices = require("../../../../../services/kiosk/course");

let testCustomerToken,
  superAdminToken,
  testOrganizatonId = organizationsInApplication.test.id,
  zongOrganizationId = organizationsInApplication.zong.id;

let courses = {
  test: {
    name: "TEST COURSE",
    orgId: testOrganizatonId,
    state: "Albama",
    city: "Abbeville",
  },
  zong: {
    name: "ZONG COURSE",
    orgId: zongOrganizationId,
    state: "Albama",
    city: "Abbeville",
  },
};
const commonCareerBody = {
  title: "Career",
  content: "<h2>Example Content</h2>",
  type: "Full Time",
  timings: JSON.stringify({ startTime: "10:00", endTime: "16:00" }),
  link: "https://example.com",
};
let careers = {};

beforeAll(async () => {
  testCustomerToken = await helper.get_token_for("testCustomer");
  superAdminToken = await helper.get_token_for("superadmin");
});

afterAll(async () => {
  for await (const course of Object.values(courses)) {
    await CoursesServices.deleteWhere({ id: course.id });
  }
});

describe("DELETE /careers/:careerId", () => {
  const deleteCareerById = async (careerId, token = superAdminToken) => {
    return helper.delete_request_with_authorization({
      endpoint: `careers/${careerId}`,
      token,
    });
  };
  const createGolfCourses = async (params, token = superAdminToken) => {
    return helper.post_request_with_authorization({
      endpoint: "kiosk-courses",
      token,
      params,
    });
  };
  const createCareer = async (params, token = superAdminToken) => {
    return helper.post_request_with_authorization({
      endpoint: "careers",
      token,
      params: {
        ...commonCareerBody,
        ...params,
      },
    });
  };

  beforeAll(async () => {
    // create golf courses
    const orgs = ["test", "zong"];
    for await (const org of orgs) {
      const response = await createGolfCourses(
        { ...courses[org] },
        superAdminToken,
      );
      courses[org].id = response.body.data.id;
    }
  });

  it("should return 400 and validation error for the invalid careerId type", async () => {
    const expectedResponse = {
      success: false,
      data: "The careerId must be an integer.",
    };
    const response = await deleteCareerById("abc", testCustomerToken);
    expect(response.body).toEqual(expectedResponse);
    expect(response.statusCode).toBe(400);
  });
  it("should return an error if the test organization's customer tries to delete the career of some different organization", async () => {
    const expectedResponse = {
      success: false,
      data: "Career not found",
    };
    const careerCreationResponse = await createCareer(
      { gcId: courses.zong.id },
      superAdminToken,
    );
    const zongOrganizationCareerId = careerCreationResponse.body.data.id;
    const response = await deleteCareerById(
      zongOrganizationCareerId,
      testCustomerToken,
    );
    expect(response.body).toEqual(expectedResponse);
    expect(response.statusCode).toBe(404);
  });
  it("should return an error if the super admin tries to delete a non-existing career", async () => {
    const expectedResponse = {
      success: false,
      data: "Career not found",
    };
    const response = await deleteCareerById(-1, superAdminToken);
    expect(response.body).toEqual(expectedResponse);
    expect(response.statusCode).toBe(404);
  });

  it("should delete the career if the test organization's customer tries to delete the career of his/her own organization", async () => {
    const expectedResponse = {
      success: true,
      data: "Career deleted successfully",
    };
    // Create a career in test organization
    const careerCreationResponse = await createCareer(
      { gcId: courses.test.id },
      superAdminToken,
    );
    const testOrganizationCareerId = careerCreationResponse.body.data.id;
    const careerDeletionResponse = await deleteCareerById(
      testOrganizationCareerId,
      testCustomerToken,
    );
    expect(careerDeletionResponse.body).toEqual(expectedResponse);
    expect(careerDeletionResponse.statusCode).toBe(200);

    try {
      await CareersServices.findOneCareer({ id: testOrganizationCareerId });
    } catch (error) {
      expect(error.message).toBe("Career not found");
    }
  });

  it("should delete the career if the super admin tries to delete any existing career of any organization", async () => {
    const expectedResponse = {
      success: true,
      data: "Career deleted successfully",
    };
    // Create a career in test organization
    const careerCreationResponse = await createCareer(
      { gcId: courses.test.id },
      superAdminToken,
    );
    const testOrganizationCareerId = careerCreationResponse.body.data.id;
    const careerDeletionResponse = await deleteCareerById(
      testOrganizationCareerId,
      superAdminToken,
    );
    expect(careerDeletionResponse.body).toEqual(expectedResponse);
    expect(careerDeletionResponse.statusCode).toBe(200);

    try {
      await CareersServices.findOneCareer({ id: testOrganizationCareerId });
    } catch (error) {
      expect(error.message).toBe("Career not found");
    }
  });
});
