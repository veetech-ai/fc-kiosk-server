const {
  getRolesWithAuthorities,
  extraRolesWithAuthorities,
} = require("../../../../common/roles_with_authorities");
const testhelpers = require("../../../helper");
let { rolesData } = getRolesWithAuthorities();
const _ = require("lodash");

/** RolesData has objects with keys in snake case, while we recieve data in camelCase
 * That's why using lodash to convert the snake case to the camel case
 */
const convertToCamecase = (rolesData) => {
  for (let i = 0; i < rolesData.length; i++) {
    rolesData[i] = _.mapKeys(rolesData[i], (value, key) => _.camelCase(key));
  }
};

describe("testing GET /roles/ API", () => {
  let superAdminToken,
    testCustomerToken,
    testManagerToken,
    testOperatorToken,
    adminRoles,
    extraRoles,
    rolesDataWithoutExtraRoles,
    organizationalRoles;
  beforeAll(async () => {
    const extraRolesIds = Object.values(extraRolesWithAuthorities).map(
      (r) => r.id,
    );
    convertToCamecase(rolesData);
    extraRoles = rolesData.filter((r) => extraRolesIds.includes(r.id));

    rolesDataWithoutExtraRoles = rolesData.filter(
      (r) => !extraRolesIds.includes(r.id),
    );
    adminRoles = rolesDataWithoutExtraRoles.filter((r) => r.super || r.admin);
    organizationalRoles = rolesDataWithoutExtraRoles.filter(
      (r) => !r.super && !r.admin,
    );
    const tokens = await testhelpers.get_all_roles_tokens();
    superAdminToken = tokens.superadmin;
    testCustomerToken = tokens.testCustomer;

    testManagerToken = tokens.testManager;
    testOperatorToken = tokens.testOperator;
  });
  it("should return all roles except extra roles with rights in case of a super admin", async () => {
    const params = {
      endpoint: "roles",
      token: superAdminToken,
    };
    const response = await testhelpers.get_request_with_authorization(params);
    const roles = response.body.data;

    rolesDataWithoutExtraRoles.forEach((role) => {
      expect(roles).toEqual(
        expect.arrayContaining([expect.objectContaining(role)]),
      );
    });
  });

  it("should return all roles including extra roles if includeExtraRoles set to true with rights in case of a super admin", async () => {
    const params = {
      endpoint: "roles",
      token: superAdminToken,
      queryParams: {
        includeExtraRoles: true,
      },
    };
    const response = await testhelpers.get_request_with_authorization(params);
    const roles = response.body.data;

    rolesData.forEach((role) => {
      expect(roles).toEqual(
        expect.arrayContaining([expect.objectContaining(role)]),
      );
    });
  });

  it("should exclude admin level roles and include only title in case of a customer", async () => {
    const params = {
      endpoint: "roles",
      token: testCustomerToken,
    };
    const response = await testhelpers.get_request_with_authorization(params);
    const roles = response.body.data;

    // Admin roles should not be in the response

    adminRoles.forEach((role) => {
      expect(roles).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({ title: role.title }),
        ]),
      );
    });
    // All organizational roles with only titles should be in the response
    organizationalRoles.forEach((role) => {
      expect(roles).toEqual(expect.arrayContaining([{ title: role.title }]));
    });
  });

  it("should exclude admin level roles and include only title in case of a manager", async () => {
    const params = {
      endpoint: "roles",
      token: testManagerToken,
    };
    const response = await testhelpers.get_request_with_authorization(params);
    const roles = response.body.data;

    // Admin roles should not be in the response

    adminRoles.forEach((role) => {
      expect(roles).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({ title: role.title }),
        ]),
      );
    });
    // All organizational roles with only titles should be in the response
    organizationalRoles.forEach((role) => {
      expect(roles).toEqual(expect.arrayContaining([{ title: role.title }]));
    });
  });

  it("should include extra roles as well if includeExtraRoles set to true in case of organizational user", async () => {
    const params = {
      endpoint: "roles",
      token: testManagerToken,
      queryParams: {
        includeExtraRoles: true,
      },
    };
    const response = await testhelpers.get_request_with_authorization(params);
    const roles = response.body.data;

    // Admin roles should not be in the response

    adminRoles.forEach((role) => {
      expect(roles).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({ title: role.title }),
        ]),
      );
    });
    // All organizational roles with only titles should be in the response
    organizationalRoles.forEach((role) => {
      expect(roles).toEqual(expect.arrayContaining([{ title: role.title }]));
    });

    // Extra roles should also be present
    extraRoles.forEach((role) => {
      expect(roles).toEqual(expect.arrayContaining([{ title: role.title }]));
    });
  });

  it("should not allow operator to get the roles as he/she does have the getRoles authority", async () => {
    const params = {
      endpoint: "roles",
      token: testOperatorToken,
    };
    const response = await testhelpers.get_request_with_authorization(params);
    expect(response.body).toStrictEqual({
      success: false,
      data: "You are not allowed",
    });
    expect(response.status).toStrictEqual(403);
  });
});
