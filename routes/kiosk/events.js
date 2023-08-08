const config = require("../../config/config");
const eventsController = require("../../controllers/kiosk/events");
const validation_middleware = require("../../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const events = `${config.app.apiPath}events`;

  router.get(events, [
    validation_middleware.validJWTOptional,
    eventsController.getEvents,
  ]);
  router.get(events + "/course/:id", [
    validation_middleware.validJWTNeeded,
    eventsController.getEventsOfCourse,
  ]);
  router.get(events + "/:id", [
    validation_middleware.validJWTNeeded,
    eventsController.getSingleEvent,
  ]);
  router.post(events, [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "manageCourses"]),
    eventsController.createEvent,
  ]);
  router.patch(events + "/:id", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "manageCourses"]),
    eventsController.updateEvent,
  ]);
  router.delete(events + "/:id", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "manageCourses"]),
    eventsController.deleteEvent,
  ]);
};
