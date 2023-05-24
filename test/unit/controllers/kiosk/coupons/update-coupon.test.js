const {
  organizationsInApplication,
} = require("../../../../../common/organizations.data");
const helper = require("../../../../helper");

const CoursesServices = require("../../../../../services/kiosk/course");
const CouponsServices = require("../../../../../services/coupons");

const moment = require("moment");
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
let organizationSpecificCoupons = {
  test: {
    title: `Test Coupon`,
    description: "Test Coupon",
    code: "TESTORG",
    discountType: "fixed",
    discount: 50,
    maxUseLimit: 100,
    expiry: moment().add(30, "minutes").format("YYYY-MM-DDTHH:mm:ssZ"),
    orgId: testOrganizatonId,
  },
  zong: {
    title: `Zong Coupon`,
    description: "Zong Coupon",
    code: "ZONGORG",
    discountType: "fixed",
    discount: 50,
    maxUseLimit: 100,
    expiry: moment().add(30, "minutes").format("YYYY-MM-DDTHH:mm:ssZ"),
    orgId: zongOrganizationId,
  },
};

let golfCourseSpecificCoupons = {
  test: {
    title: `Test Coupon`,
    description: "Test Coupon",
    code: "TESTGC",
    discountType: "fixed",
    discount: 50,
    maxUseLimit: 100,
    expiry: moment().add(30, "minutes").format("YYYY-MM-DDTHH:mm:ssZ"),
  },
  zong: {
    title: `Zong Coupon`,
    description: "Zong Coupon",
    code: "ZONGGC",
    discountType: "fixed",
    discount: 50,
    maxUseLimit: 100,
    expiry: moment().add(30, "minutes").format("YYYY-MM-DDTHH:mm:ssZ"),
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
describe("PATCH /coupons/couponId", () => {
  const updateCoupons = async (params, couponId, token = superAdminToken) => {
    return helper.patch_request_with_authorization({
      params,
      endpoint: `coupons/${couponId}`,
      token,
    });
  };

  const createGolfCourses = async (params, token = superAdminToken) => {
    return helper.post_request_with_authorization({
      params,
      endpoint: "kiosk-courses",
      token,
    });
  };

  const createCoupons = async (params, token = superAdminToken) => {
    return helper.post_request_with_authorization({
      params,
      endpoint: "coupons",
      token,
    });
  };
  beforeAll(async () => {
    // create golf courses

    const orgs = ["test", "zong"];
    for await (const org of orgs) {
      const golfCourseCreationResponse = await createGolfCourses(
        { ...courses[org] },
        superAdminToken,
      );
      if (!golfCourseCreationResponse.body.success) {
        throw new Error(
          "Something bad happened while creating the golf course",
        );
      }
      courses[org].id = golfCourseCreationResponse.body.data.id;

      // Golf course specific coupons creation
      const golfCourseSpecificCouponToBeCreated =
        golfCourseSpecificCoupons[org];
      golfCourseSpecificCouponToBeCreated.gcId = courses[org].id;
      const golfCourseSpecificCouponsCreationResponse = await createCoupons(
        { ...golfCourseSpecificCouponToBeCreated },
        superAdminToken,
      );
      if (!golfCourseSpecificCouponsCreationResponse.body.success) {
        throw new Error(
          "Something bad happened while creating the golf course specific coupon",
        );
      }
      golfCourseSpecificCouponToBeCreated.id =
        golfCourseSpecificCouponsCreationResponse.body.data.id;

      // organization specific coupons creation
      const organiationSpecificCouponToBeCreated =
        organizationSpecificCoupons[org];

      const organizationSpecificCouponsCreationResponse = await createCoupons(
        { ...organiationSpecificCouponToBeCreated },
        superAdminToken,
      );
      if (!organizationSpecificCouponsCreationResponse.body.success) {
        throw new Error(
          "Something bad happened while creating the org specific coupon",
        );
      }
      organiationSpecificCouponToBeCreated.id =
        organizationSpecificCouponsCreationResponse.body.data.id;
    }
  });

  it("should return 400 and validation error for invalid couponId", async () => {
    const expectedResponse = {
      success: false,
      data: "The couponId must be an integer.",
    };

    const response = await updateCoupons({}, "abc", superAdminToken);
    expect(response.body).toStrictEqual(expectedResponse);
    expect(response.statusCode).toBe(400);
  });

  it("should return an error if someone tries to update the orgId, gcId or code of a coupon", async () => {
    const expectedResponse = {
      success: false,
      data: "Can not update the requested item/s",
    };
    const response = await updateCoupons(
      { orgId: 2, gcId: 3, code: "NEW" },
      organizationSpecificCoupons.test.id,
      superAdminToken,
    );
    expect(response.body).toStrictEqual(expectedResponse);
    expect(response.statusCode).toBe(400);
  });

  it("should return an error if someone tries to update the coupon expiry with the format that is not ISO supported", async () => {
    const expectedResponse = {
      success: false,
      data: "The expiry must be a valid date",
    };

    const response = await updateCoupons(
      { expiry: "24/05/2050" },
      organizationSpecificCoupons.test.id,
      superAdminToken,
    );
    expect(response.body).toStrictEqual(expectedResponse);
    expect(response.statusCode).toBe(400);
  });

  it("should return an error if someone tries to update the coupon expiry with the date that is smaller than the current date", async () => {
    const expectedResponse = {
      success: false,
      data: "The expiry must be greater than the current date",
    };

    const response = await updateCoupons(
      { expiry: moment().subtract(5, "minutes") },
      organizationSpecificCoupons.test.id,
      superAdminToken,
    );
    expect(response.body).toStrictEqual(expectedResponse);
    expect(response.statusCode).toBe(400);
  });

  it("should return an error if test organization's customer tries to update the coupon of some other organization's golf course specific coupon", async () => {
    const expectedResponse = {
      success: false,
      data: "Coupon not found",
    };

    const response = await updateCoupons(
      { title: "ZONGGCNEW" },
      golfCourseSpecificCoupons.zong.id,
      testCustomerToken,
    );
    expect(response.body).toStrictEqual(expectedResponse);
    expect(response.statusCode).toBe(404);
  });

  it("should return an error if test organization's customer tries to update the coupon of some other organization's coupon", async () => {
    const expectedResponse = {
      success: false,
      data: "Coupon not found",
    };

    const response = await updateCoupons(
      { title: "ZONGORGNEW" },
      organizationSpecificCoupons.zong.id,
      testCustomerToken,
    );
    expect(response.body).toStrictEqual(expectedResponse);
    expect(response.statusCode).toBe(404);
  });

  it("should return an error if super admin tries to update the non-existing coupon", async () => {
    const expectedResponse = {
      success: false,
      data: "Coupon not found",
    };

    const response = await updateCoupons({}, -1, superAdminToken);
    expect(response.body).toStrictEqual(expectedResponse);
    expect(response.statusCode).toBe(404);
  });

  it("should update the coupon if the test customer tries to update his/her own organization's golf course specific coupon", async () => {
    const expectedResponse = {
      success: true,
      data: "Coupon updated successfully",
    };
    const reqBody = {
      title: "TESTGCNEW",
      discount: 35.5,
      discountType: "percentage",
      description: "Test GC Coupon",
      maxUseLimit: 1000,
    };
    const expiryFormat = "YYYY-MM-DDTHH:mm:ss[Z]";
    let expiry = moment().add(50, "minutes");
    const response = await updateCoupons(
      { ...reqBody, expiry },
      golfCourseSpecificCoupons.test.id,
      testCustomerToken,
    );
    expect(response.body).toEqual(expectedResponse);
    expect(response.statusCode).toEqual(200);

    // check if the data actually got updated in the database as well or not.
    const coupon = await CouponsServices.findOneCoupon({
      id: golfCourseSpecificCoupons.test.id,
    });
    expect(coupon).toEqual(expect.objectContaining(reqBody));

    const returnedExpiry = moment(coupon.expiry).format(expiryFormat);
    expiry = moment(expiry).format(expiryFormat);
    expect(expiry).toEqual(returnedExpiry);

    await updateCoupons(
      golfCourseSpecificCoupons.test,
      golfCourseSpecificCoupons.test.id,
      testCustomerToken,
    );
  });

  it("should update the coupon if the test customer tries to update his/her own organization's coupon", async () => {
    const expectedResponse = {
      success: true,
      data: "Coupon updated successfully",
    };
    const reqBody = {
      title: "TESTORGNEW",
      discount: 35.5,
      discountType: "percentage",
      description: "Test ORG Coupon",
      maxUseLimit: 1000,
    };
    const expiryFormat = "YYYY-MM-DDTHH:mm:ss[Z]";
    let expiry = moment().add(50, "minutes");
    const response = await updateCoupons(
      { ...reqBody, expiry },
      organizationSpecificCoupons.test.id,
      testCustomerToken,
    );
    expect(response.body).toEqual(expectedResponse);
    expect(response.statusCode).toEqual(200);

    // check if the data actually got updated in the database as well or not.
    const coupon = await CouponsServices.findOneCoupon({
      id: organizationSpecificCoupons.test.id,
    });
    expect(coupon).toEqual(expect.objectContaining(reqBody));

    const returnedExpiry = moment(coupon.expiry).format(expiryFormat);
    expiry = moment(expiry).format(expiryFormat);
    expect(expiry).toEqual(returnedExpiry);

    await updateCoupons(
      organizationSpecificCoupons.test,
      organizationSpecificCoupons.test.id,
      testCustomerToken,
    );
  });

  it("should update the coupon if the super admin tries to update any organization specific coupon", async () => {
    const expectedResponse = {
      success: true,
      data: "Coupon updated successfully",
    };
    const reqBody = {
      title: "TESTORGNEW",
      discount: 35.5,
      discountType: "percentage",
      description: "Test ORG Coupon",
      maxUseLimit: 1000,
    };
    const expiryFormat = "YYYY-MM-DDTHH:mm:ss[Z]";
    let expiry = moment().add(50, "minutes");
    const response = await updateCoupons(
      { ...reqBody, expiry },
      organizationSpecificCoupons.test.id,
      superAdminToken,
    );
    expect(response.body).toEqual(expectedResponse);
    expect(response.statusCode).toEqual(200);

    // check if the data actually got updated in the database as well or not.
    const coupon = await CouponsServices.findOneCoupon({
      id: organizationSpecificCoupons.test.id,
    });
    expect(coupon).toEqual(expect.objectContaining(reqBody));

    const returnedExpiry = moment(coupon.expiry).format(expiryFormat);
    expiry = moment(expiry).format(expiryFormat);
    expect(expiry).toEqual(returnedExpiry);

    await updateCoupons(
      organizationSpecificCoupons.test,
      organizationSpecificCoupons.test.id,
      superAdminToken,
    );
  });

  it("should update the coupon if the super admin tries to update any golf course specific coupon", async () => {
    const expectedResponse = {
      success: true,
      data: "Coupon updated successfully",
    };
    const reqBody = {
      title: "TESTGCNEW",
      discount: 35.5,
      discountType: "percentage",
      description: "Test GC Coupon",
      maxUseLimit: 1000,
    };
    const expiryFormat = "YYYY-MM-DDTHH:mm:ss[Z]";
    let expiry = moment().add(50, "minutes");
    const response = await updateCoupons(
      { ...reqBody, expiry },
      golfCourseSpecificCoupons.test.id,
      superAdminToken,
    );
    expect(response.body).toEqual(expectedResponse);
    expect(response.statusCode).toEqual(200);

    // check if the data actually got updated in the database as well or not.
    const coupon = await CouponsServices.findOneCoupon({
      id: golfCourseSpecificCoupons.test.id,
    });
    expect(coupon).toEqual(expect.objectContaining(reqBody));

    const returnedExpiry = moment(coupon.expiry).format(expiryFormat);
    expiry = moment(expiry).format(expiryFormat);
    expect(expiry).toEqual(returnedExpiry);

    await updateCoupons(
      golfCourseSpecificCoupons.test,
      golfCourseSpecificCoupons.test.id,
      superAdminToken,
    );
  });
});
