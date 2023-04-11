exports.organizationWithAuthorities = {
  superAdmin: {
    id: 1,
    title: "super admin",
    people_metrics: true,
    sim_kiosk: true,
    devices: true,
    weather_station: true,
  },
  admin: {
    id: 2,
    title: "admin",
    people_metrics: true,
    sim_kiosk: true,
    devices: true,
    weather_station: true,
  },
  peopleMetrics: {
    id: 3,
    title: "people metrics",
    people_metrics: true,
    sim_kiosk: false,
    devices: false,
    weather_station: false,
  },
  weatherStation: {
    id: 4,
    title: "weather station",
    people_metrics: false,
    sim_kiosk: false,
    devices: true,
    weather_station: true,
  },
  simKiosk: {
    id: 5,
    title: "sim kiosk",
    people_metrics: false,
    sim_kiosk: true,
    devices: true,
    weather_station: false,
  },
  basic: {
    id: 6,
    title: "basic",
    people_metrics: false,
    sim_kiosk: false,
    devices: false,
    weather_station: false,
  },
};

exports.getOrganizationWithAuthorities = () => {
  return Object.values(this.organizationWithAuthorities);
};
