// External Module Imports
const apiResponse = require("../../common/api.response");
const { validateObject } = require("../../common/helper");
const aboutusServices = require("../../services/mobile/aboutus");

/**
 * @swagger
 * tags:
 *   name: AboutUs
 *   description: AboutUs API's
 */

exports.getAboutUs = async (req, res) => {
  /**
   * @swagger
   *
   * /aboutus:
   *   get:
   *     security:
   *      - auth: []
   *     summary: Retrieves AboutUs Description.
   *     description: Retrieves a list of frequently asked questions.
   *     tags: [AboutUs]
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Success
   *       500:
   *         description: Internal Server Error
   */
  try {
    const about = await aboutusServices.getAboutUs();

    return apiResponse.success(res, req, about);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};

exports.updateAboutUs = async (req, res) => {
  /**
   * @swagger
   *
   * /aboutus/{id}:
   *   put:
   *     security:
   *       - auth: []
   *     summary: Update About Us.
   *     description: Updates existing content.
   *     tags: [AboutUs]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: ID of the AboutUs to update.
   *       - name: body
   *         in: body
   *         description: Updated About Us data.
   *         required: true
   *         schema:
   *           type: object
   *           properties:
   *             content:
   *               type: string
   *               description: The updated About Us content.
   *
   *     responses:
   *       200:
   *         description: Success. Returns the updated About Us content.
   *       400:
   *         description: Bad Request. The request body is missing or invalid.
   *       404:
   *         description: Not Found. The About Us content with the specified ID was not found.
   *       500:
   *         description: Internal Server Error. An unexpected error occurred.
   */

  try {
    const { id } = req.params;
    const filteredBody = validateObject(req.body, "content");

    // Update the FAQ
    const noOfAffectedRows = await aboutusServices.updateAboutUs(
      id,
      filteredBody,
    );

    return apiResponse.success(
      res,
      req,
      noOfAffectedRows
        ? "AboutUs updated successfully"
        : "AboutUs already up to date",
    );
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
