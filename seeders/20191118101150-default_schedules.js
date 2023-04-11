"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    const schedules_arr = [
      {
        orgId: null,
        name: "Weekends Plan",
        description: "Only on Weekends",
        schedule: JSON.stringify(
          '{"mon":[],"tue":[],"wed":[],"thr":[],"fri":[],"sat":[{"i":39,"timestamp":1549013400000,"set":{"p":1,"m":0,"t":26,"f":2,"sv":0,"sh":0,"fl":0,"s":0,"h":0}},{"i":87,"timestamp":1549056600000,"set":{"p":0,"m":1,"t":22,"f":2,"sv":0,"sh":0,"fl":0,"s":0,"h":0}}],"sun":[{"i":39,"timestamp":1549013400000,"set":{"p":1,"m":0,"t":26,"f":2,"sv":0,"sh":0,"fl":0,"s":0,"h":0}},{"i":87,"timestamp":1549056600000,"set":{"p":0,"m":1,"t":22,"f":2,"sv":0,"sh":0,"fl":0,"s":0,"h":0}}]}',
        ),
        admin_created: true,
        mqtt_token: "dr1b8gBh",
      },
      {
        orgId: null,
        name: "Office Timing",
        description: "Office Times from 9AM to 5PM",
        schedule: JSON.stringify(
          '{"mon":[{"i":37,"timestamp":1549011600000,"set":{"p":1,"m":1,"t":22,"f":2,"sv":1,"sh":1,"fl":0,"s":0,"h":0}},{"i":69,"timestamp":1549040400000,"set":{"p":0,"m":1,"t":22,"f":2,"sv":0,"sh":0,"fl":0,"s":0,"h":0}}],"tue":[{"i":37,"timestamp":1549011600000,"set":{"p":1,"m":1,"t":22,"f":2,"sv":1,"sh":1,"fl":0,"s":0,"h":0}},{"i":69,"timestamp":1549040400000,"set":{"p":0,"m":1,"t":22,"f":2,"sv":0,"sh":0,"fl":0,"s":0,"h":0}}],"wed":[{"i":37,"timestamp":1549011600000,"set":{"p":1,"m":1,"t":22,"f":2,"sv":1,"sh":1,"fl":0,"s":0,"h":0}},{"i":69,"timestamp":1549040400000,"set":{"p":0,"m":1,"t":22,"f":2,"sv":0,"sh":0,"fl":0,"s":0,"h":0}}],"thr":[{"i":37,"timestamp":1549011600000,"set":{"p":1,"m":1,"t":22,"f":2,"sv":1,"sh":1,"fl":0,"s":0,"h":0}},{"i":69,"timestamp":1549040400000,"set":{"p":0,"m":1,"t":22,"f":2,"sv":0,"sh":0,"fl":0,"s":0,"h":0}}],"fri":[{"i":37,"timestamp":1549011600000,"set":{"p":1,"m":1,"t":22,"f":2,"sv":1,"sh":1,"fl":0,"s":0,"h":0}},{"i":69,"timestamp":1549040400000,"set":{"p":0,"m":1,"t":22,"f":2,"sv":0,"sh":0,"fl":0,"s":0,"h":0}}],"sat":[],"sun":[]}',
        ),
        admin_created: true,
        mqtt_token: "60Ae9WKq",
      },
      {
        orgId: null,
        name: "Cool Nights",
        description: "Cool Night times",
        schedule: JSON.stringify(
          '{"mon":[{"i":85,"timestamp":1549054800000,"set":{"p":1,"m":1,"t":22,"f":2,"sv":0,"sh":0,"fl":0,"s":0,"h":0}},{"i":33,"timestamp":1549008000000,"set":{"p":0,"m":1,"t":22,"f":2,"sv":0,"sh":0,"fl":0,"s":0,"h":0}}],"tue":[{"i":85,"timestamp":1549054800000,"set":{"p":1,"m":1,"t":22,"f":2,"sv":0,"sh":0,"fl":0,"s":0,"h":0}},{"i":33,"timestamp":1549008000000,"set":{"p":0,"m":1,"t":22,"f":2,"sv":0,"sh":0,"fl":0,"s":0,"h":0}}],"wed":[{"i":85,"timestamp":1549054800000,"set":{"p":1,"m":1,"t":22,"f":2,"sv":0,"sh":0,"fl":0,"s":0,"h":0}},{"i":33,"timestamp":1549008000000,"set":{"p":0,"m":1,"t":22,"f":2,"sv":0,"sh":0,"fl":0,"s":0,"h":0}}],"thr":[{"i":85,"timestamp":1549054800000,"set":{"p":1,"m":1,"t":22,"f":2,"sv":0,"sh":0,"fl":0,"s":0,"h":0}},{"i":33,"timestamp":1549008000000,"set":{"p":0,"m":1,"t":22,"f":2,"sv":0,"sh":0,"fl":0,"s":0,"h":0}}],"fri":[{"i":85,"timestamp":1549054800000,"set":{"p":1,"m":1,"t":22,"f":2,"sv":0,"sh":0,"fl":0,"s":0,"h":0}},{"i":33,"timestamp":1549008000000,"set":{"p":0,"m":1,"t":22,"f":2,"sv":0,"sh":0,"fl":0,"s":0,"h":0}}],"sat":[{"i":85,"timestamp":1549054800000,"set":{"p":1,"m":1,"t":22,"f":2,"sv":0,"sh":0,"fl":0,"s":0,"h":0}},{"i":33,"timestamp":1549008000000,"set":{"p":0,"m":1,"t":22,"f":2,"sv":0,"sh":0,"fl":0,"s":0,"h":0}}],"sun":[{"i":85,"timestamp":1549054800000,"set":{"p":1,"m":1,"t":22,"f":2,"sv":0,"sh":0,"fl":0,"s":0,"h":0}},{"i":33,"timestamp":1549008000000,"set":{"p":0,"m":1,"t":22,"f":2,"sv":0,"sh":0,"fl":0,"s":0,"h":0}}]}',
        ),
        admin_created: true,
        mqtt_token: "akPBgapy",
      },
      {
        orgId: null,
        name: "Constant Hot",
        description: "High Temperature Mode for Winters",
        schedule: JSON.stringify(
          '{"mon":[{"i":29,"timestamp":1549004400000,"set":{"p":1,"m":4,"t":40,"f":2,"sv":1,"sh":1,"fl":0,"s":0,"h":0}}],"tue":[{"i":29,"timestamp":1549004400000,"set":{"p":1,"m":4,"t":40,"f":2,"sv":1,"sh":1,"fl":0,"s":0,"h":0}}],"wed":[{"i":29,"timestamp":1549004400000,"set":{"p":1,"m":4,"t":40,"f":2,"sv":1,"sh":1,"fl":0,"s":0,"h":0}}],"thr":[{"i":29,"timestamp":1549004400000,"set":{"p":1,"m":4,"t":40,"f":2,"sv":1,"sh":1,"fl":0,"s":0,"h":0}}],"fri":[{"i":29,"timestamp":1549004400000,"set":{"p":1,"m":4,"t":40,"f":2,"sv":1,"sh":1,"fl":0,"s":0,"h":0}}],"sat":[{"i":29,"timestamp":1549004400000,"set":{"p":1,"m":4,"t":40,"f":2,"sv":1,"sh":1,"fl":0,"s":0,"h":0}}],"sun":[{"i":29,"timestamp":1549004400000,"set":{"p":1,"m":4,"t":40,"f":2,"sv":1,"sh":1,"fl":0,"s":0,"h":0}}]}',
        ),
        admin_created: true,
        mqtt_token: "trTUtrqN",
      },
      {
        orgId: null,
        name: "Constant Normal",
        description: "Normal Temperature",
        schedule: JSON.stringify(
          '{"mon":[{"i":37,"timestamp":1549011600000,"set":{"p":1,"m":0,"t":26,"f":2,"sv":0,"sh":0,"fl":0,"s":0,"h":0}}],"tue":[{"i":37,"timestamp":1549011600000,"set":{"p":1,"m":0,"t":26,"f":2,"sv":0,"sh":0,"fl":0,"s":0,"h":0}}],"wed":[{"i":37,"timestamp":1549011600000,"set":{"p":1,"m":0,"t":26,"f":2,"sv":0,"sh":0,"fl":0,"s":0,"h":0}}],"thr":[{"i":37,"timestamp":1549011600000,"set":{"p":1,"m":0,"t":26,"f":2,"sv":0,"sh":0,"fl":0,"s":0,"h":0}}],"fri":[{"i":37,"timestamp":1549011600000,"set":{"p":1,"m":0,"t":26,"f":2,"sv":0,"sh":0,"fl":0,"s":0,"h":0}}],"sat":[{"i":37,"timestamp":1549011600000,"set":{"p":1,"m":0,"t":26,"f":2,"sv":0,"sh":0,"fl":0,"s":0,"h":0}}],"sun":[{"i":37,"timestamp":1549011600000,"set":{"p":1,"m":0,"t":26,"f":2,"sv":0,"sh":0,"fl":0,"s":0,"h":0}}]}',
        ),
        admin_created: true,
        mqtt_token: "rJmolTKJ",
      },
    ];

    return queryInterface.bulkInsert("Schedules", schedules_arr, {
      updateOnDuplicate: ["name", "schedule"],
    });
  },

  down: (queryInterface, Sequelize) => {
    // return queryInterface.bulkDelete('Schedules', null, {});
  },
};
