// External Module Imports
const Validator = require("validatorjs");

// Common Imports
const apiResponse = require("../../common/api.response");
const helper = require("../../common/helper");

/**
 * @swagger
 * tags:
 *   name: Course-Feedbacks
 *   description: Courses API's
 */

exports.getFeedBacksForCourses = async (req, res) => {
    /**
     * @swagger
     *
     * /course-feedbacks/courses/{courseId}:
     *   get:
     *     security:
     *       - auth: []
     *     description: Get feedbacks for specific courses.
     *     tags: [Course-Feedbacks]
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: courseId
     *         description: course ID
     *         in: path
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: Success
     */
  
    try {
      const orgId = Number(req.params.orgId);
      if (!orgId) {
        return apiResponse.fail(res, "orgId must be a valid number");
      }
      const courses = await courseService.getCoursesByOrganization(orgId);
      return apiResponse.success(res, req, courses);
    } catch (error) {
      return apiResponse.fail(res, error.message, error.statusCode || 500);
    }
  };