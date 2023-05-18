// External Module Imports
const Validator = require("validatorjs");
const formidable = require("formidable");

// Common Imports
const apiResponse = require("../../common/api.response");
const helper = require("../../common/helper");
const upload_file = require("../../common/upload");
// Logger Imports
const courseService = require("../../services/kiosk/course");
const courseFaqsService = require("../../services/kiosk/course-faqs");

/**
 * @swagger
 * tags:
 *   name: Course-Faqs
 *   description: Golf Course's FAQs API's
 */
exports.createCourseFaq = async (req, res) => {
  /**
   * @swagger
   *
   * /course-faqs:
   *   post:
   *     security:
   *       - auth: []
   *     description: create golf course Faq.
   *     tags: [Course-Faqs]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     parameters:
   *       - name: gcId
   *         description: golf course for which faq is being created
   *         in: formData
   *         required: true
   *         type: integer
   *       - name: question
   *         description: Question
   *         in: formData
   *         required: true
   *         type: string
   *       - name: answer
   *         description: Answer for the question
   *         in: formData
   *         required: true
   *         type: string
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.body, {
      gcId: "required|integer",
      question: "required|string",
      answer: "required|string",
    });

    if (validation.fails()) {
      return apiResponse.fail(res, validation.errors);
    }

    const faqBody = req.body;
    const loggedInUserOrgId = req.user.orgId;
    const course = await courseService.getCourse(
      { id: faqBody.gcId },
      loggedInUserOrgId,
    );
    faqBody.orgId = course.orgId;

    const faq = await courseFaqsService.create(faqBody);

    return apiResponse.success(res, req, faq);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};

exports.getCourseFaqs = async (req, res) => {
  /**
   * @swagger
   *
   * /course-faqs/courses/{courseId}:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get faqs for a specific course.
   *     tags: [Course-Faqs]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: courseId
   *         description: Golf Course ID
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   */

  try {
    const courseId = Number(req.params.courseId);
    if (!courseId) {
      return apiResponse.fail(res, "courseId must be a valid number");
    }

    const loggedInUserOrgId = req.user.orgId;
    await courseService.getCourse(
      { id: req.params.courseId },
      loggedInUserOrgId,
    );

    const courseFaqs = await courseFaqsService.getCourseFaqs(courseId);

    return apiResponse.success(res, req, courseFaqs);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};

exports.updateCourseFaq = async (req, res) => {
  /**
   * @swagger
   * /course-faqs/{faqId}:
   *   patch:
   *     security:
   *       - auth: []
   *     description: update faq for a golf course.
   *     tags: [Course-Faqs]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - in: path
   *         name: faqId
   *         description: id of course
   *         required: true
   *         type: integer
   *       - name: question
   *         description: Question
   *         in: formData
   *         required: false
   *         type: string
   *       - name: answer
   *         description: Answer for the question
   *         in: formData
   *         required: false
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */

  try {
    const validation = new Validator(req.body, {
      name: "string",
      subheading: "string",
      description: "string",
    });

    if (validation.fails()) {
      return apiResponse.fail(res, validation.errors);
    }

    const faqId = req.params.faqId;
    const loggedInUserOrgId = req.user.orgId;
    await courseFaqsService.getCourseFaq({ id: faqId }, loggedInUserOrgId);

    const updatedCourseFaq = await courseFaqsService.updateCourseFaq(
      faqId,
      req.body,
    );

    return apiResponse.success(res, req, updatedCourseFaq);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};

exports.deleteCourseFaq = async (req, res) => {
  /**
   * @swagger
   *
   * /course-faqs/{faqId}:
   *   delete:
   *     security:
   *       - auth: []
   *     description: Delete faq.
   *     tags: [Course-Faqs]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: faqId
   *         description: Organization ID
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   */

  try {
    const faqId = Number(req.params.faqId);
    if (!faqId) {
      return apiResponse.fail(res, "faqId must be a valid number");
    }

    const loggedInUserOrgId = req.user.orgId;
    await courseFaqsService.getCourseFaq({ id: faqId }, loggedInUserOrgId);

    await courseFaqsService.deleteCourseFaq({ id: faqId });
    return apiResponse.success(res, req, "Faq Deleted");
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
