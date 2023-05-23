const {
  organizationsInApplication,
} = require("../../../../../common/organizations.data");
const helper = require("../../../../helper");

const CoursesServices = require("../../../../../services/kiosk/course");
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
let coupons = {
  test: [
    {
      title: `Test Coupon 1`,
      description: "Test Coupon",
      code: "XYZa123",
      discountType: "fixed",
      discount: 50,
      maxUseLimit: 100,
      expiry: moment().add(10, "minutes").format("YYYY-MM-DDTHH:mm:ssZ"),
    },
    {
      title: `Test Coupon 2`,
      description: "Test Coupon",
      code: "XYZa124",
      discountType: "percentage",
      discount: 50,
      maxUseLimit: 100,
      expiry: moment().add(10, "minutes").format("YYYY-MM-DDTHH:mm:ssZ"),
    },
  ],
  zong: [
    {
      title: `Zong Coupon`,
      description: "Zong Coupon",
      code: "ABCa123",
      discountType: "fixed",
      discount: 50,
      maxUseLimit: 100,
      expiry: moment().add(10, "minutes").format("YYYY-MM-DDTHH:mm:ssZ"),
    },
  ],
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
describe("GET /coupons/courses/courseId", () => {
  const getCouponsByCourseId = async (courseId, token = superAdminToken) => {
    return helper.get_request_with_authorization({
      endpoint: `coupons/courses/${courseId}`,
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

      for await (const coupon of coupons[org]) {
        const couponsCreationResponse = await createCoupons(
          { ...coupon, gcId: courses[org].id },
          superAdminToken,
        );
        if (!couponsCreationResponse.body.success) {
          throw new Error("Something bad happened while creating the coupon");
        }
        coupon.id = couponsCreationResponse.body.data.id;
        coupon.gcId = courses[org].id;
      }
    }
  });

  it("should return 400 and validation error for invalid course id", async () => {
    const expectedResponse = {
      success: false,
      data: "The courseId must be an integer.",
    };

    const response = await getCouponsByCourseId(
      "invalidCourseId",
      testCustomerToken,
    );
    expect(response.body).toStrictEqual(expectedResponse);
    expect(response.statusCode).toBe(400);
  });

  it("should return an error if test organization's customer tries to get the coupons of other organization's golf course", async () => {
    const expectedResponse = {
      success: false,
      data: "Course not found",
    };

    const response = await getCouponsByCourseId(
      courses.zong.id,
      testCustomerToken,
    );
    expect(response.body).toStrictEqual(expectedResponse);
    expect(response.statusCode).toBe(404);
  });

  it("should return an error if super admin tries to get the coupons of non existing course", async () => {
    const expectedResponse = {
      success: false,
      data: "Course not found",
    };

    const response = await getCouponsByCourseId(-1, superAdminToken);
    expect(response.body).toStrictEqual(expectedResponse);
    expect(response.statusCode).toBe(404);
  });

  it("should return test organization's golf course's coupons in case of test organization's customer", async () => {
    const expectedCoupons = [...coupons.test];
    const response = await getCouponsByCourseId(
      courses.test.id,
      testCustomerToken,
    );
    const actualCoupons = response.body.data;
    expectedCoupons.forEach((expectedCoupon) => {
      expectedCoupon.expiry = moment(expectedCoupon.expiry).utc().toString();
      const actualCouponIndex = actualCoupons.findIndex(
        (x) => x.id == expectedCoupon.id,
      );
      actualCoupons[actualCouponIndex].expiry = moment(
        actualCoupons[actualCouponIndex].expiry,
      )
        .utc()
        .toString();
      expect(actualCoupons).toEqual(
        expect.arrayContaining([expect.objectContaining(expectedCoupon)]),
      );
    });

    expect(response.body.success).toBe(true);
    expect(response.statusCode).toBe(200);
  });

  it("should return an array of coupons if super admin tries to get any existing golf course's coupons", async () => {
    const expectedCoupons = [...coupons.zong];
    const response = await getCouponsByCourseId(
      courses.zong.id,
      superAdminToken,
    );
    const actualCoupons = response.body.data;
    expectedCoupons.forEach((expectedCoupon) => {
      expectedCoupon.expiry = moment(expectedCoupon.expiry).utc().toString();
      const actualCouponIndex = actualCoupons.findIndex(
        (x) => x.id == expectedCoupon.id,
      );
      actualCoupons[actualCouponIndex].expiry = moment(
        actualCoupons[actualCouponIndex].expiry,
      )
        .utc()
        .toString();
      expect(actualCoupons).toEqual(
        expect.arrayContaining([expect.objectContaining(expectedCoupon)]),
      );
    });

    expect(response.body.success).toBe(true);
    expect(response.statusCode).toBe(200);
  });
});
