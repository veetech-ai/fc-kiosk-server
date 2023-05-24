const {
  organizationsInApplication,
} = require("../../../../../common/organizations.data");
const helper = require("../../../../helper");
const moment = require("moment");
const CouponsServices = require("../../../../../services/coupons");

let testCustomerToken,
  superAdminToken,
  testOrganizatonId = organizationsInApplication.test.id,
  zongOrganizationId = organizationsInApplication.zong.id,
  zongGolfCourseId,
  testGolfCourseId;

beforeAll(async () => {
  testCustomerToken = await helper.get_token_for("testCustomer");
  superAdminToken = await helper.get_token_for("superadmin");
});
let requestBody = {
  title: "Example",
  description: "Test Coupon",
  expiry: moment().add(30, "minutes").format("YYYY-MM-DDTHH:mm:ssZ").toString(),
  code: "XYZa123",
  discountType: "fixed",
  discount: 50,
  maxUseLimit: 100,
};

describe("POST /coupons", () => {
  const makeApiRequest = async (
    params,
    token = superAdminToken,
    endpoint = "coupons",
  ) => {
    return helper.post_request_with_authorization({
      endpoint,
      token,
      params: { ...params },
    });
  };
  beforeAll(async () => {
    // create golf courses

    const testGolfCourseCreationResponse = await makeApiRequest(
      {
        name: "TEST COURSE",
        orgId: testOrganizatonId,
        state: "Albama",
        city: "Abbeville",
      },
      superAdminToken,
      "kiosk-courses",
    );
    testGolfCourseId = testGolfCourseCreationResponse.body.data.id;

    const zongGolfCourseCreationResponse = await makeApiRequest(
      {
        name: "ZONG COURSE",
        orgId: zongOrganizationId,
        state: "Albama",
        city: "Abbeville",
      },
      superAdminToken,
      "kiosk-courses",
    );

    zongGolfCourseId = zongGolfCourseCreationResponse.body.data.id;
  });

  it("should return 400 and validation errors for the corresponding required fields", async () => {
    const expectedResponse = {
      success: false,
      data: {
        errors: {
          code: ["The code field is required."],
          discount: ["The discount field is required."],
          discountType: ["The discountType field is required."],
          expiry: ["The expiry field is required."],
          title: ["The title field is required."],
        },
      },
    };

    const response = await makeApiRequest({});

    expect(response.body).toStrictEqual(expectedResponse);
    expect(response.statusCode).toBe(400);
  });

  it("should return 400 and validation error for expiry that is neither ISO or RFC 2822 supported", async () => {
    const expectedResponse = {
      success: false,
      data: "The expiry must be a valid date",
    };

    const response = await makeApiRequest({
      ...requestBody,
      expiry: "23/05/2050",
    });

    expect(response.body).toStrictEqual(expectedResponse);
    expect(response.statusCode).toBe(400);
  });

  it("should return 400 and validation error for expiry that is smaller than current date and time", async () => {
    const expectedResponse = {
      success: false,
      data: "The expiry must be greater than the current date",
    };

    const response = await makeApiRequest({
      ...requestBody,
      expiry: moment().subtract(5, "minutes"),
    });

    expect(response.body).toStrictEqual(expectedResponse);
    expect(response.statusCode).toBe(400);
  });

  it("should return error if super admin does not send orgId nor gcId in the body", async () => {
    // It is compulsory for super admin to send either gcId or orgId.

    const expectedResponse = {
      success: false,
      data: "Parent resource id is required",
    };

    const response = await makeApiRequest(requestBody);

    expect(response.body).toStrictEqual(expectedResponse);
    expect(response.statusCode).toBe(400);
  });
  it("should return error if both gcId and orgId are sent - Coupon can have only one parent", async () => {
    const expectedResponse = {
      success: false,
      data: "Coupon can have only one parent",
    };
    const requestBodyClone = {
      ...requestBody,
      orgId: testOrganizatonId,
      gcId: 1000,
    };
    const response = await makeApiRequest(requestBodyClone, testCustomerToken);

    expect(response.body).toStrictEqual(expectedResponse);
    expect(response.statusCode).toBe(400);
  });

  it("should return error if test organization's customer tries to create coupons in the organization he/she does not belong to", async () => {
    // It is compulsory for super admin to send either gcId or orgId.

    const expectedResponse = {
      success: false,
      data: "You are not allowed",
    };
    const requestBodyClone = { ...requestBody, orgId: zongOrganizationId };
    const response = await makeApiRequest(requestBodyClone, testCustomerToken);

    expect(response.body).toStrictEqual(expectedResponse);
    expect(response.statusCode).toBe(403);
  });

  it("should return error if customer tries to create coupons in the golf course of the different organization", async () => {
    // It is compulsory for super admin to send either gcId or orgId.

    const expectedResponse = {
      success: false,
      data: "Parent does not exist",
    };
    const requestBodyClone = { ...requestBody, gcId: zongGolfCourseId };
    const response = await makeApiRequest(requestBodyClone, testCustomerToken);

    expect(response.body).toStrictEqual(expectedResponse);
    expect(response.statusCode).toBe(404);
  });

  it("should return error if customer tries to create coupons in the golf course of the different organization", async () => {
    // It is compulsory for super admin to send either gcId or orgId.

    const expectedResponse = {
      success: false,
      data: "Parent does not exist",
    };
    const requestBodyClone = { ...requestBody, gcId: zongGolfCourseId };
    const response = await makeApiRequest(requestBodyClone, testCustomerToken);

    expect(response.body).toStrictEqual(expectedResponse);
    expect(response.statusCode).toBe(404);
  });

  it("should return error if organization does not exist in case of super admin", async () => {
    const expectedResponse = {
      success: false,
      data: "Parent does not exist",
    };
    const requestBodyClone = { ...requestBody, orgId: -1 };
    const response = await makeApiRequest(requestBodyClone, superAdminToken);

    expect(response.body).toStrictEqual(expectedResponse);
    expect(response.statusCode).toBe(404);
  });

  it("should create the coupon under the customer's organization successfully", async () => {
    const requestBodyClone = { ...requestBody };
    const response = await makeApiRequest(requestBodyClone, testCustomerToken);
    await CouponsServices.deleteCouponsWhere({ code: requestBodyClone.code });
    const expectedResponse = {
      title: "Example",
      description: "Test Coupon",
      code: "XYZa123",
      discountType: "fixed",
      discount: 50,
      maxUseLimit: 100,
      orgId: testOrganizatonId,
    };
    expect(response.body.data).toEqual(
      expect.objectContaining(expectedResponse),
    );

    // test the expiry date separately
    const receivedExpiryDate = new Date(response.body.data.expiry);
    const expectedExpiryDate = new Date(requestBodyClone.expiry);
    expect(receivedExpiryDate).toEqual(expectedExpiryDate);

    expect(response.body.success).toBe(true);
    expect(response.statusCode).toBe(200);
  });

  it("should create the coupon under the customer's organization's golf course successfully", async () => {
    const requestBodyClone = { ...requestBody, gcId: testGolfCourseId };
    const response = await makeApiRequest(requestBodyClone, testCustomerToken);
    await CouponsServices.deleteCouponsWhere({ code: requestBodyClone.code });
    const expectedResponse = {
      title: "Example",
      description: "Test Coupon",
      code: "XYZa123",
      discountType: "fixed",
      discount: 50,
      maxUseLimit: 100,
      gcId: testGolfCourseId,
    };
    expect(response.body.data).toEqual(
      expect.objectContaining(expectedResponse),
    );

    // test the expiry date separately
    const receivedExpiryDate = new Date(response.body.data.expiry);
    const expectedExpiryDate = new Date(requestBodyClone.expiry);
    expect(receivedExpiryDate).toEqual(expectedExpiryDate);

    expect(response.body.success).toBe(true);
    expect(response.statusCode).toBe(200);
  });

  it("should create the coupon of 'percentage' discount type ", async () => {
    const requestBodyClone = {
      ...requestBody,
      discountType: "percentage",
      orgId: testOrganizatonId,
    };
    const response = await makeApiRequest(requestBodyClone, superAdminToken);
    await CouponsServices.deleteCouponsWhere({ code: requestBodyClone.code });

    const expectedResponse = {
      title: "Example",
      description: "Test Coupon",
      code: "XYZa123",
      discountType: "percentage",
      discount: 50,
      maxUseLimit: 100,
      orgId: testOrganizatonId,
    };
    expect(response.body.data).toEqual(
      expect.objectContaining(expectedResponse),
    );

    // test the expiry date separately
    const receivedExpiryDate = new Date(response.body.data.expiry);
    const expectedExpiryDate = new Date(requestBodyClone.expiry);
    expect(receivedExpiryDate).toEqual(expectedExpiryDate);

    expect(response.body.success).toBe(true);
    expect(response.statusCode).toBe(200);
  });
  it("should return an error if the coupon with the same coupon code already exists", async () => {
    const requestBodyClone = { ...requestBody, orgId: testOrganizatonId };
    await makeApiRequest(requestBodyClone, superAdminToken);

    const response = await makeApiRequest(requestBodyClone);
    await CouponsServices.deleteCouponsWhere({ code: requestBodyClone.code });
    const expectedResponse = {
      success: false,
      data: "Coupon already exists",
    };
    expect(response.body).toEqual(expectedResponse);

    expect(response.statusCode).toBe(409);
  });
});
