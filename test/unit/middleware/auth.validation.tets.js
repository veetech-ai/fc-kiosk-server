const {
  superAdminOrAdminOrCustomerAccess,
} = require("../../../middlewares/auth.validation");
const { fail } = require("../../../common/api.response");

jest.mock("../../../common/api.response", () => ({
  fail: jest
    .fn()
    .mockImplementation((res, data = "You are not allowed", status = 400) => {
      return { success: false, data: data };
    }),
}));

const next = jest.fn();
const res = {};
let req = {
  body: {},
  user: {
    super_admin: true,
  },
};

describe("superAdminOrAdminOrCustomerAccess middleware test", () => {
  describe("success cases", () => {
    it("should called next if user is super admin", () => {
      superAdminOrAdminOrCustomerAccess(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      expect(fail).not.toHaveBeenCalled();
    });

    it("should called next if user is same organization customer", () => {
      req = {
        body: {
          orgId: 4,
        },
        user: {
          orgId: 4,
        },
      };
      superAdminOrAdminOrCustomerAccess(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      expect(fail).not.toHaveBeenCalled();
    });

    it("should called next if user is admin and role is not admin and super admin", () => {
      req = {
        body: {
          role: "customer",
        },
        user: {
          admin: true,
        },
      };
      superAdminOrAdminOrCustomerAccess(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      expect(fail).not.toHaveBeenCalled();
    });
  });

  describe("fail cases", () => {
    it("should called fail if user is not super admin, admin and customer", () => {
      const req = {
        body: {},
        user: {},
      };
      superAdminOrAdminOrCustomerAccess(req, res, next);
      expect(fail).toHaveBeenCalledTimes(1);
      expect(next).not.toHaveBeenCalled();
    });

    it("should called fail if customer is not same organization customer", () => {
      req = {
        body: {
          orgId: 4,
        },
        user: {
          orgId: 2,
        },
      };
      superAdminOrAdminOrCustomerAccess(req, res, next);
      expect(fail).toHaveBeenCalledTimes(1);
      expect(next).not.toHaveBeenCalled();
    });

    it("should called fail if user is admin and role is admin", () => {
      req = {
        body: {
          role: "super admin",
        },
        user: {
          admin: true,
        },
      };
      superAdminOrAdminOrCustomerAccess(req, res, next);
      expect(fail).toHaveBeenCalledTimes(1);
      expect(next).not.toHaveBeenCalled();
    });

    it("should called fail if user is admin and role is super admin", () => {
      req = {
        body: {
          role: "admin",
        },
        user: {
          admin: true,
        },
      };
      superAdminOrAdminOrCustomerAccess(req, res, next);
      expect(fail).toHaveBeenCalledTimes(1);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
