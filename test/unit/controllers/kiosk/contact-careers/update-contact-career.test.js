const {
  organizationsInApplication,
} = require("../../../../../common/organizations.data");
const helper = require("../../../../helper");
const product = require("../../../../../common/products");

const CoursesServices = require("../../../../../services/kiosk/course");
const DevicesServices = require("../../../../../services/device");
const ContactsCareersServices = require("../../../../../services/kiosk/contact-careers");

const { uuid } = require("uuidv4");

let testCustomerToken,
  superAdminToken,
  testOrganizatonId = organizationsInApplication.test.id,
  zongOrganizationId = organizationsInApplication.zong.id,
  contactCareers = {};

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
const careers = {
  test: {
    title: "Test Career",
    content: "<h2>Example Content</h2>",
    type: "Full Time",
    link: "https://example.com",
  },
  zong: {
    title: "Career",
    content: "<h2>Example Content</h2>",
    type: "Full Time",
    link: "https://example.com",
  },
};

beforeAll(async () => {
  testCustomerToken = await helper.get_token_for("testCustomer");
  superAdminToken = await helper.get_token_for("superadmin");
});

afterAll(async () => {
  for await (const course of Object.values(courses)) {
    await CoursesServices.deleteWhere({ id: course.id });
  }
});

describe("PATCH /careers/contacts/{careerContactId}", () => {
  const updateCareerContactByCareerId = async (
    params,
    careerId,
    token = superAdminToken,
  ) => {
    return helper.patch_request_with_authorization({
      endpoint: `careers/contacts/${careerId}`,
      token,
      params,
    });
  };

  const createDevice = async (params, token = superAdminToken) => {
    return helper.post_request_with_authorization({
      endpoint: "device/create",
      token,
      params,
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
      params,
    });
  };

  const createContactCareer = async (params, token) => {
    return helper.post_request_with_authorization({
      endpoint: "kiosk-content/careers/contacts",
      token,
      params,
    });
  };

  beforeAll(async () => {
    const orgs = ["test", "zong"];
    for await (const org of orgs) {
      // Create golf courses
      const response = await createGolfCourses(
        { ...courses[org] },
        superAdminToken,
      );
      courses[org].id = response.body.data.id;

      // Create career
      const careerCreationResponse = await createCareer(
        { ...careers[org], gcId: courses[org].id },
        superAdminToken,
      );
      careers[org].id = careerCreationResponse.body.data.id;

      // Create device
      const deviceCreationResponse = await createDevice({
        serial: uuid(),
        pin_code: 1111,
        device_type: product.products.kiosk.id,
      });
      const deviceId = deviceCreationResponse.body.data.id;
      const deviceToken =
        deviceCreationResponse.body.data.device_token.split(" ")[1];

      if (org != "test") {
        await DevicesServices.update(deviceId, {
          owner_id: zongOrganizationId,
        });
      }

      // link device with the golf course
      await DevicesServices.update(deviceId, { gcId: courses[org].id });

      // Create contact career
      const contactCareerBody = {
        careerId: careers[org].id,
        email: `example${org}@xyz.com`,
      };
      const careerContactRequestCreationResponse = await createContactCareer(
        {
          ...contactCareerBody,
        },
        deviceToken,
      );

      contactCareers[org] = {
        ...contactCareerBody,
        id: careerContactRequestCreationResponse.body.data.id,
      };
    }
  });

  it("should return 400 and validation error for the invalid isAddressed field data type", async () => {
    const expectedResponse = {
      success: false,
      data: {
        errors: {
          isAddressed: ["The isAddressed attribute has errors."],
        },
      },
    };
    const response = await updateCareerContactByCareerId(
      { isAddressed: "abc" },
      careers.test.id,
      superAdminToken,
    );
    expect(response.body).toEqual(expectedResponse);
    expect(response.statusCode).toBe(400);
  });
  it("should return an error if the test organization's customer tries to address the contact request of some different organization", async () => {
    const expectedResponse = {
      success: false,
      data: "Contact request not found",
    };

    const response = await updateCareerContactByCareerId(
      { isAddressed: "true" },
      contactCareers.zong.id,
      testCustomerToken,
    );
    expect(response.body).toEqual(expectedResponse);
    expect(response.statusCode).toBe(404);
  });

  it("should return 200 - already up to date in case the test customer sends the empty object", async () => {
    const expectedResponse = {
      success: true,
      data: "Career's contact request already up to date",
    };

    const response = await updateCareerContactByCareerId(
      {},
      contactCareers.test.id,
      testCustomerToken,
    );
    expect(response.body).toEqual(expectedResponse);
    expect(response.statusCode).toBe(200);
  });

  it("should return 200 and update the contact request in case the test customer tries to address (string representation) the contact request of his/her own organization", async () => {
    const expectedResponse = {
      success: true,
      data: "Career's contact request updated successfully",
    };

    const response = await updateCareerContactByCareerId(
      { isAddressed: "true" },
      contactCareers.test.id,
      testCustomerToken,
    );
    expect(response.body).toEqual(expectedResponse);
    expect(response.statusCode).toBe(200);

    const careerContactRequest = await ContactsCareersServices.findOneContact({
      id: contactCareers.test.id,
    });
    expect(careerContactRequest.isAddressed).toBe(true);

    await ContactsCareersServices.updateCareerContactById(
      contactCareers.test.id,
      { isAddressed: false },
    );
  });

  it("should return 200 and update the contact request in case the test customer tries to address (boolean representation) the contact request of his/her own organization", async () => {
    const expectedResponse = {
      success: true,
      data: "Career's contact request updated successfully",
    };

    const response = await updateCareerContactByCareerId(
      { isAddressed: true },
      contactCareers.test.id,
      testCustomerToken,
    );
    expect(response.body).toEqual(expectedResponse);
    expect(response.statusCode).toBe(200);

    const careerContactRequest = await ContactsCareersServices.findOneContact({
      id: contactCareers.test.id,
    });
    expect(careerContactRequest.isAddressed).toBe(true);

    await ContactsCareersServices.updateCareerContactById(
      contactCareers.test.id,
      { isAddressed: false },
    );
  });

  it("should return 200 and update the contact request in case the test customer tries to un-address the contact request of his/her own organization", async () => {
    const expectedResponse = {
      success: true,
      data: "Career's contact request updated successfully",
    };

    await updateCareerContactByCareerId(
      { isAddressed: true },
      contactCareers.test.id,
      testCustomerToken,
    );

    const response = await updateCareerContactByCareerId(
      { isAddressed: false },
      contactCareers.test.id,
      testCustomerToken,
    );

    expect(response.body).toEqual(expectedResponse);
    expect(response.statusCode).toBe(200);
    const careerContactRequest = await ContactsCareersServices.findOneContact({
      id: contactCareers.test.id,
    });
    expect(careerContactRequest.isAddressed).toBe(false);

    await ContactsCareersServices.updateCareerContactById(
      contactCareers.test.id,
      { isAddressed: false },
    );
  });

  it("should return 200 and update the contact request in case the super admin tries to address the contact request of any organization", async () => {
    const expectedResponse = {
      success: true,
      data: "Career's contact request updated successfully",
    };

    const response = await updateCareerContactByCareerId(
      { isAddressed: true },
      contactCareers.test.id,
      testCustomerToken,
    );
    expect(response.body).toEqual(expectedResponse);
    expect(response.statusCode).toBe(200);

    const careerContactRequest = await ContactsCareersServices.findOneContact({
      id: contactCareers.test.id,
    });
    expect(careerContactRequest.isAddressed).toBe(true);

    await ContactsCareersServices.updateCareerContactById(
      contactCareers.test.id,
      { isAddressed: false },
    );
  });
});
