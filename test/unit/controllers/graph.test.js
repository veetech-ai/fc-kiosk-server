const helper = require("../../helper");
const { logger } = require("../../../logger");

describe("/graph/get", () => {
  let tokens;

  const responseObj = {
    completed: 0,
    error: 0,
    cancelled: 0,
    rejected: 0,
    avgMachineTime: 0,
    avgOperatorTime: 0,
    maximumTime: 0,
    minimumTime: 0,
    avgFullCycleTime: 0,
    uph: 0,
    passRate: 0,
  };

  beforeAll(async () => {
    tokens = await helper.get_all_roles_tokens();
  });

  it("should return data successfully when logged in user is admin or super admin, device id exists and device_type is correct", async () => {
    try {
      const data = {
        queryParams: {
          device_id: 12,
          filter: "today",
        },
        token: tokens.superadmin,
        endpoint: "graph/get",
      };

      const response = await helper.get_request_with_authorization(data);

      expect(response.body.data).toMatchObject(responseObj);
      expect(response.status).toBe(200);
    } catch (error) {
      logger.error(error);
    }
  });

  it("should return error if query param 'filter' has value other than today or yesterday or 7d", async () => {
    try {
      const data = {
        queryParams: {
          filter: "stop",
        },
        token: tokens.testCustomer,
        endpoint: "graph/get",
      };

      const response = await helper.get_request_with_authorization(data);
      expect(response.status).toBe(400);
      expect(response.body.data.errors.filter[0]).toStrictEqual(
        "The filter format is invalid.",
      );
    } catch (error) {
      logger.error(error);
    }
  });

  it("should return error if query param 'filter' todays", async () => {
    try {
      const data = {
        queryParams: {
          filter: "todays",
        },
        token: tokens.testCustomer,
        endpoint: "graph/get",
      };

      const response = await helper.get_request_with_authorization(data);

      expect(response.status).toBe(400);
      expect(response.body.data.errors.filter[0]).toStrictEqual(
        "The filter format is invalid.",
      );
    } catch (error) {
      logger.error(error);
    }
  });
});
