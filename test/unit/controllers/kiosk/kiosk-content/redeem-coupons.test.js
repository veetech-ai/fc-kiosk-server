const {
  organizationsInApplication,
} = require("../../../../../common/organizations.data");
const product = require("../../../../../common/products");

const helper = require("../../../../helper");
const moment = require("moment");
const { uuid } = require("uuidv4");
const CouponServices = require("../../../../../services/coupons");
const CouponUsedServices = require("../../../../../services/coupon_used");

let testCustomerToken,
  superAdminToken,
  testOrganizationDeviceToken,
  testOrganizatonId = organizationsInApplication.test.id,
  zongOrganizationId = organizationsInApplication.zong.id,
  testOrganizationDeviceId,
  testGolfCourseId;

let couponCreationBody = {
  title: "Example",
  description: "Test Coupon",
  expiry: moment().format("YYYY-MM-DDTHH:mm:ssZ"),
  code: "XYZa123",
  discountType: "fixed",
  discount: 50,
  maxUseLimit: 1,
};
beforeAll(async () => {
  testCustomerToken = await helper.get_token_for("testCustomer");
  superAdminToken = await helper.get_token_for("superadmin");
  zongCustomerToken = await helper.get_token_for("zongCustomer");
});

describe("PATCH /kisok-content/coupons - Redeem Coupons", () => {
  const makeApiRequest = async (
    params,
    token = testOrganizationDeviceToken,
    endpoint = "kiosk-content/coupons", // redeem coupon
  ) => {
    return helper.patch_request_with_authorization({
      endpoint,
      token,
      params: params,
    });
  };

  const createGolfCourse = async (params, token = superAdminToken) => {
    const linkedDevice = await helper.post_request_with_authorization({
      endpoint: `kiosk-courses/create`,
      params,
      token: token,
    });

    return linkedDevice;
  };

  const createDevice = async (params, token = superAdminToken) => {
    const device = await helper.post_request_with_authorization({
      endpoint: `device/create`,
      params,
      token: token,
    });

    return device;
  };

  const linkDeviceToCourse = async (
    deviceId,
    courseId,
    token = superAdminToken,
  ) => {
    const linkedDevice = await helper.put_request_with_authorization({
      endpoint: `device/${deviceId}/courses/${courseId}/link`,
      params: {},
      token: token,
    });

    return linkedDevice;
  };

  const createCoupons = async (params, token = superAdminToken) => {
    const createdCoupon = await helper.post_request_with_authorization({
      endpoint: "coupons",
      params,
      token: token,
    });

    return createdCoupon?.body?.data;
  };
  beforeAll(async () => {
    // create golf courses

    const testGolfCourseCreationResponse = await createGolfCourse({
      name: "TEST COURSE",
      orgId: testOrganizatonId,
      state: "Albama",
      city: "Abbeville",
    });
    testGolfCourseId = testGolfCourseCreationResponse.body.data.id;

    const zongGolfCourseCreationResponse = await createGolfCourse({
      name: "ZONG COURSE",
      orgId: zongOrganizationId,
      state: "Albama",
      city: "Abbeville",
    });

    zongGolfCourseId = zongGolfCourseCreationResponse.body.data.id;

    // Create a device under test organization
    const testOrganizationDevice = await createDevice({
      serial: uuid(),
      pin_code: 1111,
      device_type: product.products.kiosk.id,
    });

    testOrganizationDeviceId = testOrganizationDevice.body.data.id;
    testOrganizationDeviceToken =
      testOrganizationDevice?.body?.data?.device_token.split(" ")[1];

    // Link device with the test organization golf course
    const linkedDevice = await linkDeviceToCourse(
      testOrganizationDevice?.body?.data.id,
      testGolfCourseId,
    );
  });

  it("should return an error if the coupon with the specified 'code' does not exist", async () => {
    const reqBody = {
      code: "InValID",
    };
    const expectedResponse = {
      success: false,
      data: "Invalid Coupon or coupon may expire",
    };
    const response = await makeApiRequest(reqBody);
    expect(response.body).toEqual(expectedResponse);
    expect(response.statusCode).toEqual(404);
  });

  it("should return an error if the coupon with the specified 'code' is inactive", async () => {
    const inactiveCouponCode = "INACTIVE";
    const reqBody = {
      code: inactiveCouponCode,
    };
    const expectedResponse = {
      success: false,
      data: "Invalid Coupon or coupon may expire",
    };
    await createCoupons({
      ...couponCreationBody,
      code: inactiveCouponCode,
      orgId: testOrganizatonId,
      status: 0,
    });

    const response = await makeApiRequest(reqBody);

    await CouponServices.deleteAll({ code: inactiveCouponCode });

    expect(response.body).toEqual(expectedResponse);
    expect(response.statusCode).toEqual(404);
  });

  it("should return an error if the coupon with the specified 'code' is expired", async () => {
    const expiredCouponCode = "EXPIRED";
    const reqBody = {
      code: expiredCouponCode,
    };
    const expectedResponse = {
      success: false,
      data: "Invalid Coupon or coupon may expire",
    };
    await createCoupons({
      ...couponCreationBody,
      code: expiredCouponCode,
      expiry: new Date(Date.now() - 5 * 60 * 1000),
      orgId: testOrganizatonId,
    });

    const response = await makeApiRequest(reqBody);

    await CouponServices.deleteAll({ code: expiredCouponCode });
    expect(response.body).toEqual(expectedResponse);
    expect(response.statusCode).toEqual(404);
  });

  it("should redeem the coupon successfully if the coupon belongs to device's golf course", async () => {
    const validCouponCode = "VALID";
    const reqBody = {
      code: validCouponCode,
    };
    const expectedResponse = {
      success: true,
      data: "Coupon redeemed successfully",
    };
    await createCoupons({
      ...couponCreationBody,
      code: validCouponCode,
      expiry: new Date(Date.now() + 10 * 60 * 1000),
      gcId: testGolfCourseId,
    });
    const response = await makeApiRequest(reqBody);

    await CouponServices.deleteAll({ code: validCouponCode });

    expect(response.body).toEqual(expectedResponse);
    expect(response.statusCode).toEqual(200);
  });

  it("should redeem the coupon successfully if the coupon belongs to device's organization", async () => {
    const validCouponCode = "VALID";
    const reqBody = {
      code: validCouponCode,
    };
    const expectedResponse = {
      success: true,
      data: "Coupon redeemed successfully",
    };
    await createCoupons({
      ...couponCreationBody,
      code: validCouponCode,
      expiry: new Date(Date.now() + 10 * 60 * 1000),
      orgId: testOrganizatonId,
    });
    const response = await makeApiRequest(reqBody);

    await CouponServices.deleteAll({ code: validCouponCode });

    expect(response.body).toEqual(expectedResponse);
    expect(response.statusCode).toEqual(200);
  });

  it("should return an error if the coupon's max use limit already reached", async () => {
    const validCouponCode = "VALID";
    const reqBody = {
      code: validCouponCode,
    };
    const expectedResponse = {
      success: false,
      data: "Invalid Coupon or coupon may expire",
    };
    await createCoupons({
      ...couponCreationBody,
      maxUseLimit: 1,
      code: validCouponCode,
      expiry: new Date(Date.now() + 10 * 60 * 1000),
      gcId: testGolfCourseId,
    });
    await makeApiRequest(reqBody);
    const response = await makeApiRequest(reqBody);

    await CouponServices.deleteAll({ code: validCouponCode });

    expect(response.body).toEqual(expectedResponse);
    expect(response.statusCode).toEqual(404);
  });

  it("should return success if the history record is created successfully after coupon redeemed", async () => {
    const validCouponCode = "VALID";
    const reqBody = {
      code: validCouponCode,
    };
    const expectedResponse = {
      success: true,
      data: {
        gcId: testGolfCourseId,
        deviceId: testOrganizationDeviceId,
      },
    };
    const coupon = await createCoupons({
      ...couponCreationBody,
      maxUseLimit: 1,
      code: validCouponCode,
      expiry: new Date(Date.now() + 10 * 60 * 1000),
      gcId: testGolfCourseId,
    });
    await makeApiRequest(reqBody);
    const response = await CouponUsedServices.findByWhere({
      couponId: coupon.id,
    });

    expect(response.dataValues).toEqual(
      expect.objectContaining(expectedResponse.data),
    );

    await CouponServices.deleteAll({ code: validCouponCode });
  });
});
