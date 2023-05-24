const {
  organizationsInApplication,
} = require("../../../../../common/organizations.data");
const helper = require("../../../../helper");

const CouponsServices = require("../../../../../services/coupons");
const CoursesServices = require("../../../../../services/kiosk/course");
const moment = require("moment");
let testCustomerToken,
  superAdminToken,
  testOrganizationId = organizationsInApplication.test.id,
  zongOrganizationId = organizationsInApplication.zong.id;

let courses = {
  test: {
    name: "TEST COURSE",
    orgId: testOrganizationId,
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
let commonCouponBody = {
  title: "Example",
  description: "Test Coupon",
  expiry: moment().add(30, "minutes").format("YYYY-MM-DDTHH:mm:ssZ").toString(),
  code: "XYZa123",
  discountType: "fixed",
  discount: 50,
  maxUseLimit: 100,
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

describe("DELETE /coupons/:couponId", () => {
  const deleteCouponById = async (couponId, token = superAdminToken) => {
    return helper.delete_request_with_authorization({
      endpoint: `coupons/${couponId}`,
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
  const createCoupons = async (params, token = superAdminToken) => {
    return helper.post_request_with_authorization({
      endpoint: "coupons",
      token,
      params: {
        ...commonCouponBody,
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

  it("should return 400 and validation error for the invalid couponId data type", async () => {
    const expectedResponse = {
      success: false,
      data: "The couponId must be an integer.",
    };
    const response = await deleteCouponById("abc", testCustomerToken);
    expect(response.body).toEqual(expectedResponse);
    expect(response.statusCode).toBe(400);
  });
  it("should return an error if the test organization's customer tries to delete the coupon of some organization's golf course", async () => {
    const expectedResponse = {
      success: false,
      data: "Coupon not found",
    };
    const couponCreationResponse = await createCoupons(
      { gcId: courses.zong.id },
      superAdminToken,
    );
    const zongGolfCourseCouponId = couponCreationResponse.body.data.id;
    const response = await deleteCouponById(
      zongGolfCourseCouponId,
      testCustomerToken,
    );
    expect(response.body).toEqual(expectedResponse);
    expect(response.statusCode).toBe(404);

    // Even after the API failure we will still remove the coupon using the service to avoid the tests' dependency.
    await CouponsServices.deleteCouponsWhere({ id: zongGolfCourseCouponId });
  });

  it("should return an error if the test organization's customer tries to delete the coupon of some different organization", async () => {
    const expectedResponse = {
      success: false,
      data: "Coupon not found",
    };
    const couponCreationResponse = await createCoupons(
      { orgId: zongOrganizationId },
      superAdminToken,
    ); // Will create the organization specific coupon under test organization
    const zongOrganizationCouponId = couponCreationResponse.body.data.id;
    const response = await deleteCouponById(
      zongOrganizationCouponId,
      testCustomerToken,
    );
    expect(response.body).toEqual(expectedResponse);
    expect(response.statusCode).toBe(404);

    // Even after the API failure we will still remove the coupon using the service to avoid the tests' dependency.
    await CouponsServices.deleteCouponsWhere({ id: zongOrganizationCouponId });
  });
  it("should return an error if the super admin tries to delete a non-existing coupon", async () => {
    const expectedResponse = {
      success: false,
      data: "Coupon not found",
    };
    const response = await deleteCouponById(-1, superAdminToken);
    expect(response.body).toEqual(expectedResponse);
    expect(response.statusCode).toBe(404);
  });

  it("should delete the coupon if the test organization's customer tries to delete the coupon of his/her own organization", async () => {
    const expectedResponse = {
      success: true,
      data: "Coupon deleted successfully",
    };

    const couponCreationResponse = await createCoupons(
      { orgId: testOrganizationId },
      superAdminToken,
    );
    const testOrganizationCouponId = couponCreationResponse.body.data.id;
    const couponDeletionResponse = await deleteCouponById(
      testOrganizationCouponId,
      testCustomerToken,
    );
    expect(couponDeletionResponse.body).toEqual(expectedResponse);
    expect(couponDeletionResponse.statusCode).toBe(200);

    expect(
      CouponsServices.findOneCoupon({ id: testOrganizationCouponId }),
    ).rejects.toThrow("Coupon not found");
  });

  it("should delete the coupon if the test organization's customer tries to delete the coupon of his/her own organization's golf course", async () => {
    const expectedResponse = {
      success: true,
      data: "Coupon deleted successfully",
    };

    const couponCreationResponse = await createCoupons(
      { gcId: courses.test.id },
      superAdminToken,
    );
    const testGolfCourseCouponId = couponCreationResponse.body.data.id;
    const couponDeletionResponse = await deleteCouponById(
      testGolfCourseCouponId,
      testCustomerToken,
    );
    expect(couponDeletionResponse.body).toEqual(expectedResponse);
    expect(couponDeletionResponse.statusCode).toBe(200);

    expect(
      CouponsServices.findOneCoupon({ id: testGolfCourseCouponId }),
    ).rejects.toThrow("Coupon not found");
  });

  it("should delete the career if the super admin tries to delete any existing organization specific coupon", async () => {
    const expectedResponse = {
      success: true,
      data: "Coupon deleted successfully",
    };

    const couponCreationResponse = await createCoupons(
      { orgId: testOrganizationId },
      superAdminToken,
    );
    const testOrganizationCouponId = couponCreationResponse.body.data.id;
    const couponDeletionResponse = await deleteCouponById(
      testOrganizationCouponId,
      superAdminToken,
    );
    expect(couponDeletionResponse.body).toEqual(expectedResponse);
    expect(couponDeletionResponse.statusCode).toBe(200);

    expect(
      CouponsServices.findOneCoupon({ id: testOrganizationCouponId }),
    ).rejects.toThrow("Coupon not found");
  });
  it("should delete the career if the super admin tries to delete any existing golf course specific coupon", async () => {
    const expectedResponse = {
      success: true,
      data: "Coupon deleted successfully",
    };

    const couponCreationResponse = await createCoupons(
      { gcId: courses.zong.id },
      superAdminToken,
    );
    const zongGolfCourseCouponId = couponCreationResponse.body.data.id;
    const couponDeletionResponse = await deleteCouponById(
      zongGolfCourseCouponId,
      superAdminToken,
    );
    expect(couponDeletionResponse.body).toEqual(expectedResponse);
    expect(couponDeletionResponse.statusCode).toBe(200);

    expect(
      CouponsServices.findOneCoupon({ id: zongGolfCourseCouponId }),
    ).rejects.toThrow("Coupon not found");
  });
});
