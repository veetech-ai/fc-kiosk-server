const {
  organizationsInApplication,
} = require("../../../../../common/organizations.data");
const helper = require("../../../../helper");

const CareersServices = require("../../../../../services/kiosk/career");

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

describe("PATCH /careers/:careerId", () => {
  const makePatchApiRequest = async (
    params,
    careerId,
    token = superAdminToken,
  ) => {
    return helper.patch_request_with_authorization({
      endpoint: `careers/${careerId}`,
      token,
      params,
    });
  };
  const makePostApiRequest = async (
    params,
    token = superAdminToken,
    endpoint = "careers",
  ) => {
    return helper.post_request_with_authorization({
      endpoint,
      token,
      params: params,
    });
  };

  beforeAll(async () => {
    // create golf courses
    const orgs = ["test", "zong"];
    for await (const org of orgs) {
      const response = await makePostApiRequest(
        { ...courses[org] },
        superAdminToken,
        "kiosk-courses",
      );
      courses[org].id = response.body.data.id;
    }

    for await (const org of orgs) {
      const course = courses[org];
      const response = await makePostApiRequest(
        {
          gcId: course.id,
          ...commonCareerBody,
        },
        superAdminToken,
        "careers",
      );
      careers[org] = response.body.data;
    }
  });

  it("should return 400 and validation errors for the corresponding required fields", async () => {
    const expectedResponse = {
      success: false,
      data: {
        errors: {
          title: ["The title must be a string."],
          type: ["The type must be a string."],
          content: ["The content must be a string."],
          link: ["The link must be a string."],
          timings: ["The timings must be a JSON string."],
        },
      },
    };

    const response = await makePatchApiRequest(
      { title: 1, type: 1, content: 1, timings: "abc", link: 123 },
      careers.test.id,
    );

    expect(response.body).toStrictEqual(expectedResponse);
    expect(response.statusCode).toBe(400);
  });

  it("should return 400 and validation error for the invalid career id in the route path", async () => {
    const expectedResponse = {
      success: false,
      data: "The careerId must be an integer.",
    };

    const response = await makePatchApiRequest({}, "abc");

    expect(response.body).toStrictEqual(expectedResponse);
    expect(response.statusCode).toBe(400);
  });

  it("should return 404 if the test organization's customer tries to update the career of some other organization", async () => {
    const expectedResponse = {
      success: false,
      data: "Career not found",
    };

    const response = await makePatchApiRequest(
      {},
      careers.zong.id,
      testCustomerToken,
    );

    expect(response.body).toStrictEqual(expectedResponse);
    expect(response.statusCode).toBe(404);
  });

  it("should return 200 if the test organization's customer tries to update the career with empty body", async () => {
    const expectedResponse = {
      success: true,
      data: "Career already up to date",
    };

    const response = await makePatchApiRequest(
      {},
      careers.test.id,
      testCustomerToken,
    );

    expect(response.body).toStrictEqual(expectedResponse);
    expect(response.statusCode).toBe(200);
  });

  it("should give an error if test organization's customer tries to update the career's golf course", async () => {
    const expectedResponse = {
      success: false,
      data: "Can not update the requested item/s",
    };

    const response = await makePatchApiRequest(
      { gcId: courses.zong.id },
      careers.test.id,
      testCustomerToken,
    );

    expect(response.body).toStrictEqual(expectedResponse);
    expect(response.statusCode).toBe(400);
  });

  it("should update the career successfully if test organization's customer tries to update the career of his/her own organization", async () => {
    const expectedResponse = {
      success: true,
      data: "Career updated successfully",
    };

    const newBody = {
      title: "New Career",
      type: "Part Time",
      content: "<h1>Example Content</h1>",
      timings: JSON.stringify({ startTime: "9:00", endTime: "5:00" }),
      link: "newLink.com",
    };
    const response = await makePatchApiRequest(
      newBody,
      careers.test.id,
      testCustomerToken,
    );
    expect(response.body).toStrictEqual(expectedResponse);
    expect(response.statusCode).toBe(200);

    const updatedCareer = await CareersServices.findOneCareer({
      id: careers.test.id,
    });
    expect(updatedCareer).toEqual(
      expect.objectContaining({
        ...newBody,
        timings: { startTime: "9:00", endTime: "5:00" },
      }),
    );

    await CareersServices.updateCareerById(careers.test.id, {
      ...commonCareerBody,
    });
  });

  it("should update the career successfully if super admin tries to update any existing career of the existing organization", async () => {
    const expectedResponse = {
      success: true,
      data: "Career updated successfully",
    };

    const newBody = {
      title: "New Career",
      type: "Part Time",
      content: "<h2>Example Content</h2>",
      timings: JSON.stringify({ startTime: "9:00", endTime: "5:00" }),
      link: "newLink.com",
    };
    const abc = await CareersServices.findOneCareer({ id: careers.test.id });
    const response = await makePatchApiRequest(
      newBody,
      careers.test.id,
      superAdminToken,
    );
    expect(response.body).toStrictEqual(expectedResponse);
    expect(response.statusCode).toBe(200);

    const updatedCareer = await CareersServices.findOneCareer({
      id: careers.test.id,
    });
    expect(updatedCareer).toEqual(
      expect.objectContaining({
        ...newBody,
        timings: { startTime: "9:00", endTime: "5:00" },
      }),
    );

    await CareersServices.updateCareerById(careers.test.id, {
      ...commonCareerBody,
    });
  });
});
