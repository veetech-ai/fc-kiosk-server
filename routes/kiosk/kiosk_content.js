const config = require("../../config/config");
const KioskContentController = require("../../controllers/kiosk/kiosk_content/kiosk_content");
const KioskContentCouponController = require("../../controllers/kiosk/kiosk_content/coupons");

const validation_middleware = require("../../middlewares/auth.validation");
const FeedbackController = require("../../controllers/kiosk/kiosk_content/feedback");
const LessonController = require("../../controllers/kiosk/kiosk_content/lesson");
const ContactLessonController = require("../../controllers/kiosk/kiosk_content/contact_lesson");
const ShopsController = require("../../controllers/kiosk/kiosk_content/shops");
const ContactMembershipController = require("../../controllers/kiosk/kiosk_content/contact_membership");
const CareersController = require("../../controllers/kiosk/kiosk_content/careers");
const ContactCareersController = require("../../controllers/kiosk/kiosk_content/contact-careers");
const FaqsController = require("../../controllers/kiosk/kiosk_content/faqs");

exports.routesConfig = function (app, router) {
  const kioskContentBaseUrl = `${config.app.apiPath}kiosk-content`;
  router.get(kioskContentBaseUrl + "/screens", [
    validation_middleware.onlyDeviceAccess,
    KioskContentController.get_screens_for_device,
  ]);

  router.get(kioskContentBaseUrl + "/course-info", [
    validation_middleware.onlyDeviceAccess,
    KioskContentController.getCourseInfo,
  ]);

  router.post(kioskContentBaseUrl + "/feedbacks", [
    validation_middleware.onlyDeviceAccess,
    FeedbackController.create_feedback,
  ]);

  router.get(kioskContentBaseUrl + "/lessons", [
    validation_middleware.onlyDeviceAccess,
    LessonController.getLessons,
  ]);

  router.get(kioskContentBaseUrl + "/lessons/:lessonId", [
    validation_middleware.onlyDeviceAccess,
    LessonController.getLesson,
  ]);

  router.post(kioskContentBaseUrl + "/lessons/contacts", [
    validation_middleware.onlyDeviceAccess,
    ContactLessonController.create_contact_lesson,
  ]);

  router.get(kioskContentBaseUrl + "/shops", [
    validation_middleware.onlyDeviceAccess,
    ShopsController.getShops,
  ]);

  router.patch(kioskContentBaseUrl + "/coupons", [
    validation_middleware.onlyDeviceAccess,
    KioskContentCouponController.redeemCoupon,
  ]);

  router.post(kioskContentBaseUrl + "/memberships/contacts", [
    validation_middleware.onlyDeviceAccess,
    ContactMembershipController.create_contact_membership,
  ])
  
  router.get(kioskContentBaseUrl + "/careers", [
    validation_middleware.onlyDeviceAccess,
    CareersController.getAll,
  ]);

  router.post(kioskContentBaseUrl + "/careers/contacts", [
    validation_middleware.onlyDeviceAccess,
    ContactCareersController.create,
  ]);

  router.get(kioskContentBaseUrl + "/faqs", [
    validation_middleware.onlyDeviceAccess,
    FaqsController.getFaqs,
  ]);
};
