const config = require("../config/config");

let organizationsInApplication = {
  test: {
    id: 1,
    name: "Test",
    description: "Test organization for testing ",
  },
  veetech: {
    id: 2,
    name: "Veetech",
    description: "Test organization for testing ",
  },
  golfers: {
    id: 3,
    name: "Golfers",
    description: "Digital Fairways Mobile App Users",
  },
};

const testOrganizations = {
  zong: {
    id: 50,
    name: "Zong",
    description: "Test organization for testing",
  },
};

if (config.env == "test")
  organizationsInApplication = {
    ...organizationsInApplication,
    ...testOrganizations,
  };
const organizationsData = Object.values(organizationsInApplication);

module.exports = {
  organizationsInApplication,
  organizationsData,
};
