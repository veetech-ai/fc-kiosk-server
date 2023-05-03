const organizationsInApplication = {
  test: {
    name: "Test",
    description: "Test organization for testing ",
  },
  veetech: {
    name: "Veetech",
    description: "Test organization for testing ",
  },
  digitalFairways: {
    name: "Digital Fairways",
    description: "Digital Fairways Mobile Management",
  },
  digitalConnect: {
    name: "Fairways Connect",
    description: "Fairways Connect Kiosk Management",
  },
  golfers: {
    name: "Golfers",
    description: "Digital Fairways Mobile App Users",
  },
};

const organizationsData = Object.values(organizationsInApplication);

module.exports = {
  organizationsInApplication,
  organizationsData,
};
