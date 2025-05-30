const config = require("../config/config");

const defaultAuthorities = {
  super: false,
  admin: false,
  get_users: false,
  manage_users: false,
  get_devices: false,
  manage_devices: false,
  ceo: false,
  get_logs: false,
  manage_logs: false,
  get_kpis: false,
  manage_kpis: false,
  get_organization: false,
  manage_organization: false,
  get_schedules: false,
  manage_schedules: false,
  get_groups: false,
  manage_groups: false,
  get_roles: false,
  get_courses: false,
  manage_courses: false,
  get_coupons: false,
  manage_coupons: false,
};

exports.roleWithAuthorities = {
  superAdmin: {
    ...defaultAuthorities,
    id: 1,
    title: "super admin",
    super: true,
    admin: true,
    get_users: false,
    manage_users: false,
    get_devices: false,
    manage_devices: false,
    ceo: false,
    get_logs: false,
    manage_logs: false,
    get_kpis: false,
    manage_kpis: false,
    get_organization: false,
    manage_organization: false,
    get_schedules: true,
    manage_schedules: true,
    get_groups: true,
    manage_groups: true,
    get_roles: true,
  },
  admin: {
    ...defaultAuthorities,
    id: 2,
    title: "admin",
    super: false,
    admin: true,
    get_users: false,
    manage_users: false,
    get_devices: false,
    manage_devices: false,
    ceo: false,
    get_logs: false,
    manage_logs: false,
    get_kpis: false,
    manage_kpis: false,
    get_organization: false,
    manage_organization: false,
    get_roles: true,
  },
  customer: {
    ...defaultAuthorities,
    id: 3,
    title: "customer",
    super: false,
    admin: false,
    get_users: true,
    manage_users: true,
    get_devices: true,
    manage_devices: true,
    ceo: false,
    get_logs: true,
    manage_logs: true,
    get_kpis: true,
    manage_kpis: true,
    get_organization: true,
    manage_organization: false,
    get_schedules: true,
    manage_schedules: true,
    get_groups: true,
    manage_groups: true,
    get_roles: true,
    get_courses: true,
    manage_courses: true,
    get_coupons: true,
    manage_coupons: true,
  },
  operator: {
    ...defaultAuthorities,
    id: 4,
    title: "operator",
    super: false,
    admin: false,
    get_users: false,
    manage_users: false,
    get_devices: true,
    manage_devices: false,
    ceo: false,
    get_logs: false,
    manage_logs: false,
    get_kpis: true,
    manage_kpis: false,
    get_organization: false,
    manage_organization: false,
  },
  manager: {
    ...defaultAuthorities,
    id: 12,
    title: "manager",
    super: false,
    admin: false,
    get_users: true,
    manage_users: true,
    get_devices: true,
    manage_devices: true,
    ceo: false,
    get_logs: true,
    manage_logs: true,
    get_kpis: true,
    manage_kpis: true,
    get_organization: true,
    manage_organization: true,
    get_schedules: true,
    manage_schedules: true,
    get_groups: true,
    manage_groups: true,
    get_roles: true,
  },
  golfer: {
    ...defaultAuthorities,
    id: 15,
    title: "golfer",
    super: false,
    admin: false,
    get_users: false,
    manage_users: false,
    get_devices: false,
    manage_devices: false,
    ceo: false,
    get_logs: false,
    manage_logs: false,
    get_kpis: false,
    manage_kpis: false,
    get_organization: false,
    manage_organization: false,
    get_schedules: false,
    manage_schedules: false,
    get_groups: false,
    manage_groups: false,
    get_roles: false,
  },
};

exports.extraRolesWithAuthorities = {
  device: {
    ...defaultAuthorities,
    id: 9,
    title: "device",
    super: false,
    admin: false,
    get_users: true,
    manage_users: false,
    get_devices: true,
    manage_devices: true,
    ceo: false,
    get_logs: false,
    manage_logs: true,
    get_kpis: false,
    manage_kpis: false,
    get_organization: false,
    manage_organization: false,
  },
};
// The below mentioned roles are not going to be used in AUTOMA. We are keeping them just for the existing test cases.
// Wait! Please remove the irrelevant test cases, remove this object as well and don't curse me. Thanks ;)
exports.roleWithAuthoritiesForTests = {
  ceo: {
    ...defaultAuthorities,
    id: 8,
    title: "ceo",
    super: false,
    admin: false,
    get_users: true,
    manage_users: true,
    get_devices: true,
    manage_devices: true,
    ceo: true,
    get_logs: true,
    manage_logs: true,
    get_kpis: true,
    manage_kpis: true,
    get_organization: true,
    manage_organization: false,
    get_schedules: true,
    manage_schedules: true,
    get_groups: true,
    manage_groups: true,
  },
  approver: {
    ...defaultAuthorities,
    id: 5,
    title: "approver",
    super: false,
    admin: false,
    get_users: true,
    manage_users: false,
    get_devices: true,
    manage_devices: false,
  },
  reviewer: {
    ...defaultAuthorities,
    id: 6,
    title: "reviewer",
    super: false,
    admin: false,
    get_users: true,
    manage_users: true,
    get_devices: false,
    manage_devices: false,
  },

  basic: {
    ...defaultAuthorities,
    id: 7,
    title: "basic",
    super: false,
    admin: false,
    get_users: false,
    manage_users: false,
    get_devices: false,
    manage_devices: false,
  },
  agent: {
    ...defaultAuthorities,
    id: 10,
    title: "agent",
    super: false,
    admin: false,
    get_users: false,
    manage_users: false,
    get_devices: false,
    manage_devices: false,
  },
  annotator: {
    ...defaultAuthorities,
    id: 11,
    title: "annotator",
    super: false,
    admin: false,
    get_users: false,
    manage_users: false,
    get_devices: false,
    manage_devices: false,
  },
};

exports.getRolesWithAuthorities = () => {
  let rolesToInclude = {
    ...this.roleWithAuthorities,
    ...this.extraRolesWithAuthorities,
  };
  if (config.env == "test")
    rolesToInclude = { ...rolesToInclude, ...this.roleWithAuthoritiesForTests };
  return {
    rolesData: Object.values(rolesToInclude),
    roleWithAuthorities: rolesToInclude,
    defaultAuthorities: Object.keys(defaultAuthorities),
  };
};

exports.reportToUserDictionary = {
  superadmin: [],
  admin: ["superadmin"],

  customer: [],
  manager: ["customer"],
  operator: ["manager"],
};
