// External Module Imports
const Validator = require("validatorjs");

// Common Imports
const apiResponse = require("../../common/api.response");

const eventService = require("../../services/mobile/event");
const ServiceError = require("../../utils/serviceError");
const { upload_file, getFileURL } = require("../../common/upload");
const { parseFormData, getURLOfImages } = require("../../common/helper");
const formidable = require("formidable");

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Events API's
 */

exports.createEvent = async (req, res) => {
  /**
   * @swagger
   *
   * /events:
   *   post:
   *     security:
   *        - auth: []
   *     description: Retrieves the hole related information for a single course
   *     tags: [Events]
   *     consumes:
   *       - multipart/form-data
   *     parameters:
   *       - name: title
   *         description: title of the event
   *         in: formData
   *         required: true
   *         type: string
   *
   *       - name: gcId
   *         description: id of golf course
   *         in: formData
   *         required: true
   *         type: number
   *
   *       - name: thumbnail
   *         description: thumbnail image for event
   *         in: formData
   *         required: true
   *         type: file
   *
   *       - name: openingTime
   *         description: openingTime image for event
   *         in: formData
   *         default: "10:00"
   *         type: string
   *
   *       - name: closingTime
   *         description: closingTime image for event
   *         in: formData
   *         default: "12:00"
   *         type: string
   *
   *       - name: address
   *         description: address image for event
   *         in: formData
   *         defaul: "132 street XYZ"
   *         type: string
   *
   *       - name: corousal
   *         description: corousal image for event
   *         in: formData
   *         type: array
   *         items:
   *           type: file
   *
   *       - name: description
   *         description: description image for event
   *         in: formData
   *         type: string
   *
   *       - name: details
   *         description: details image for event
   *         in: formData
   *         type: HTML
   *
   *
   *     produces:
   *       - application/json
   *     responses:
   *       201:
   *         description: success
   *       400:
   *         description: One or more request parameters are not valid
   *       500:
   *         description: Something went wrong on server side
   */
  try {
    const form = new formidable.IncomingForm();
    form.multiples = true;
    form.maxFileSize = 50 * 1024 * 1024; // 5 Megabytes

    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

    const validation = new Validator(fields, {
      title: "required|string",
      gcId: "required|integer",
      openingTime: ["required", "regex:/^([01]?[0-9]|2[0-3]):[0-5][0-9]/"],
      closingTime: ["required", "regex:/^([01]?[0-9]|2[0-3]):[0-5][0-9]/"],
      address: "required|string",
      details: "string",
      description: "string",
    });

    if (validation.fails()) {
      return apiResponse.fail(res, validation.errors, 400);
    }

    if (!files.thumbnail) {
      return apiResponse.fail(res, "thumbnail image is required", 400);
    }

    const imageFormats = ["jpg", "jpeg", "png", "webp"];

    fields.imageUrl = await upload_file(
      files.thumbnail,
      `uploads/events/`,
      imageFormats,
    );

    if (files.corousal && files.corousal.length) {
      const promises = [];
      for (const image of files.corousal) {
        promises.push(upload_file(image, `uploads/events/`, imageFormats));
      }

      fields.corousal = await Promise.all(promises);
    }

    delete fields["thumbnail"];

    const event = await eventService.createEvent(fields);

    event.imageUrl = getFileURL(event.imageUrl);
    event.corousal = getURLOfImages(event.corousal);

    apiResponse.success(res, req, event, 201);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};

exports.updateEvent = async (req, res) => {
  /**
   * @swagger
   *
   * /events/{eventId}:
   *   patch:
   *     security:
   *        - auth: []
   *     description: Retrieves the hole related information for a single course
   *     tags: [Events]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     parameters:
   *       - name: eventId
   *         description: id of the event
   *         in: path
   *         required: true
   *         type: string
   *
   *       - name: title
   *         description: title of the event
   *         in: formData
   *         required: true
   *         type: string
   *
   *       - name: gcId
   *         description: id of golf course
   *         in: formData
   *         required: true
   *         type: number
   *
   *       - name: thumbnail
   *         description: thumbnail image for event
   *         in: formData
   *         required: true
   *         type: file
   *
   *       - name: openingTime
   *         description: openingTime image for event
   *         in: formData
   *         default: "10:00"
   *         type: string
   *
   *       - name: closingTime
   *         description: closingTime image for event
   *         in: formData
   *         default: "12:00"
   *         type: string
   *
   *       - name: address
   *         description: address image for event
   *         in: formData
   *         defaul: "132 street XYZ"
   *         type: string
   *
   *       - name: corousal
   *         description: corousal image for event
   *         in: formData
   *         type: array
   *         items:
   *           type: file
   *
   *       - name: description
   *         description: description image for event
   *         in: formData
   *         type: string
   *
   *       - name: details
   *         description: details image for event
   *         in: formData
   *         type: HTML
   *
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   *       404:
   *         description: Event doesn't exist
   *       400:
   *         description: One or more request parameters are not valid
   *       500:
   *         description: Something went wrong on server side
   */
  try {
    const form = new formidable.IncomingForm();
    form.multiples = true;
    form.maxFileSize = 50 * 1024 * 1024; // 5 Megabytes

    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

    const validation = new Validator(fields, {
      title: "string",
      gcId: "integer",
      openingTime: ["regex:/^([01]?[0-9]|2[0-3]):[0-5][0-9]/"],
      closingTime: ["regex:/^([01]?[0-9]|2[0-3]):[0-5][0-9]/"],
      address: "string",
      details: "string",
      description: "string",
    });

    if (validation.fails()) return apiResponse.fail(res, validation.errors);

    const imageFormats = ["jpg", "jpeg", "png", "webp"];

    if (fields.thumbnail) {
      fields.imageUrl = await upload_file.upload_file(
        files.thumbnail,
        `uploads/events/`,
        imageFormats,
      );

      delete fields["thumbnail"];
    }

    if (files.corousal && files.corousal.length) {
      const promises = [];
      for (const image of files.corousal) {
        promises.push(upload_file(image, `uploads/events/`, imageFormats));
      }

      fields.corousal = await Promise.all(promises);
    }

    const event = await eventService.updateEvent(fields, req.params.id);

    event.imageUrl = getFileURL(event.imageUrl);
    event.corousal = getURLOfImages(event.corousal);

    apiResponse.success(res, req, event, 200);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};

exports.getEvents = async (req, res) => {
  /**
   * @swagger
   *
   * /events:
   *   get:
   *     security:
   *        - auth: []
   *     description: Retrieves a list of events.
   *     tags: [Events]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     parameters:
   *       - name: page
   *         in: query
   *         description: page number
   *         required: false
   *         default: 1
   *         type: integer
   *
   *       - name: size
   *         in: query
   *         description: page size
   *         required: false
   *         default: 10
   *         type: integer
   *
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   *       500:
   *         description: Something went wrong on server side
   */
  try {
    let events = await eventService.getEvents();

    events = events.map((event) => {
      event.imageUrl = getFileURL(event.imageUrl);
      return event;
    });

    apiResponse.success(res, req, events, 200);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};

exports.getEventsOfCourse = async (req, res) => {
  /**
   * @swagger
   *
   * /events/course/{id}:
   *   get:
   *     security:
   *        - auth: []
   *     description: Retrieves a list of events against a particular course.
   *     tags: [Events]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     parameters:
   *       - name: id
   *         in: path
   *         description: id of the golf course
   *         required: true
   *         type: number
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   *       404:
   *         description: Either course doesn't exist or the course doesn't have events
   *       400:
   *         description: id is not a valid number
   *       500:
   *         description: Something went wrong on server side
   */
  try {
    const validation = new Validator(req.params, {
      id: "required|integer",
    });

    if (validation.fails()) {
      return apiResponse.fail(res, validation.errors, 400);
    }

    let events = await eventService.getEvents({ gcId: req.params.id });

    if (!events.length) throw new ServiceError("Not Found", 404);

    events = events.map((event) => {
      event.imageUrl = getFileURL(event.imageUrl);
      return event;
    });

    apiResponse.success(res, req, events, 200);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};

exports.getSingleEvent = async (req, res) => {
  /**
   * @swagger
   *
   * /events/{eventId}:
   *   get:
   *     security:
   *        - auth: []
   *     description: Retrieves the information of the single event
   *     tags: [Events]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     parameters:
   *       - name: eventId
   *         description: Id of the event
   *         in: path
   *         required: true
   *         type: integer
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   *       404:
   *         description: Event doesn't exist
   *       400:
   *         description: id is not valid
   *       500:
   *         description: Something went wrong on server side
   */
  try {
    const validation = new Validator(req.query, {});

    if (validation.fails()) {
      return apiResponse.fail(res, validation.errors, 400);
    }

    const event = await eventService.getSingleEvent({ id: req.params.id });

    event.imageUrl = getFileURL(event.imageUrl);

    if (event.corousal) event.corousal = getURLOfImages(event.corousal);

    apiResponse.success(res, req, event, 200);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};

exports.deleteEvent = async (req, res) => {
  /**
   * @swagger
   *
   * /events/{eventId}:
   *   delete:
   *     security:
   *        - auth: []
   *     description: Deletes the particular event from DB
   *     tags: [Events]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     parameters:
   *       - name: eventId
   *         description: Id of the event
   *         in: path
   *         required: true
   *         type: integer
   *     produces:
   *       - application/json
   *     responses:
   *       204:
   *         description: success
   *       404:
   *         description: Event with given id doesn't exist
   *       400:
   *         description: id is not a valid number
   *       500:
   *         description: Something went wrong on server side
   */
  try {
    const validation = new Validator(req.params, {
      id: "required|integer",
    });

    if (validation.fails()) {
      return apiResponse.fail(res, validation.errors, 400);
    }

    await eventService.delelteEvent(req.params.id);

    apiResponse.success(res, req, null, 204);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};