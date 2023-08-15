// External Module Imports
const Validator = require("validatorjs");
const formidable = require("formidable");

// Common Imports
const apiResponse = require("../../common/api.response");

const eventService = require("../../services/kiosk/events");
const courseService = require("../../services/kiosk/course");
const ServiceError = require("../../utils/serviceError");
const fileUploader = require("../../common/upload");
const helper = require("../../common/helper");

Validator.prototype.firstError = function () {
  const fields = Object.keys(this.rules);
  for (let i = 0; i < fields.length; i++) {
    const err = this.errors.first(fields[i]);
    if (err) return err;
  }
};

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
   *       - name: details
   *         description: details image for event
   *         in: formData
   *         type: HTML
   *
   *       - name: description
   *         description: description image for event
   *         in: formData
   *         type: HTML
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
    form.maxFileSize = 5 * 1024 * 1024; // 5 Megabytes

    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

    const validation = new Validator(fields, {
      title: "required|string",
      gcId: "required|integer",
      openingTime: ["required", `regex:${helper.hour24timeRegex}`],
      closingTime: ["required", `regex:${helper.hour24timeRegex}`],
      address: "required|string",
      details: "string",
      description: "string",
    });

    if (validation.fails()) {
      throw new ServiceError(validation.firstError(), 400);
    }

    if (!files.thumbnail) {
      throw new ServiceError("The thumbnail image is required.", 400);
    }

    // to throw error if course is not found
    await courseService.getCourseById(fields.gcId);

    const imageFormats = ["jpg", "jpeg", "png", "webp"];

    fields.imageUrl = await fileUploader.upload_file(
      files.thumbnail,
      `uploads/events/`,
      imageFormats,
    );

    fields.corousal = [];

    if (files.corousal) {
      if (Array.isArray(files.corousal)) {
        const promises = [];
        for (const image of files.corousal) {
          promises.push(
            fileUploader.upload_file(image, `uploads/events/`, imageFormats),
          );
        }

        fields.corousal = await Promise.all(promises);
      } else {
        const url = await fileUploader.upload_file(
          files.corousal,
          `uploads/events/`,
          imageFormats,
        );

        fields.corousal.push(url);
      }
    }

    const event = await eventService.createEvent(fields);

    if (event.imageUrl) {
      event.imageUrl = fileUploader.getFileURL(event.imageUrl);
    }
    if (event.corousal && event.corousal.length) {
      event.corousal = helper.getURLOfImages(event.corousal);
    }

    helper.mqtt_publish_message(`we/${event.id}/created`, {
      eventId: event.id,
    });
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
   *       - name: corousalUrls
   *         description: Corousal image urls for event. Use these to update existing images in corousal
   *         in: formData
   *         type: json
   *
   *       - name: corousal
   *         description: New images for corousal of an event. Use this to upload new images
   *         in: formData
   *         type: array
   *         items:
   *           type: file
   *
   *       - name: details
   *         description: details image for event
   *         in: formData
   *         type: HTML
   *
   *       - name: description
   *         description: description image for event
   *         in: formData
   *         type: HTML
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
    form.maxFileSize = 5 * 1024 * 1024; // 5 Megabytes

    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

    const validation = new Validator(fields, {
      title: "string",
      gcId: "integer",
      openingTime: [`regex:${helper.hour24timeRegex}`],
      closingTime: [`regex:${helper.hour24timeRegex}`],
      corousalUrls: "string",
      address: "string",
      details: "string",
      description: "string",
    });

    if (validation.fails()) {
      throw new ServiceError(validation.firstError(), 400);
    }

    // to throw error if course is not found
    if (fields.gcId) await courseService.getCourseById(fields.gcId);

    const imageFormats = ["jpg", "jpeg", "png", "webp"];

    if (files.thumbnail) {
      fields.imageUrl = await fileUploader.upload_file(
        files.thumbnail,
        `uploads/events/`,
        imageFormats,
      );
    }

    // update existing images in db, if we recieved the urls
    if (fields.corousalUrls) {
      try {
        fields.corousalUrls = JSON.parse(fields.corousalUrls);

        // throw error if every item in the array is not valid url
        fields.corousalUrls.forEach((url) => new URL(url));

        if (!Array.isArray(fields.corousalUrls)) throw new Error();
      } catch (err) {
        throw new ServiceError(
          "The corousalUrls must be a valid JSON array of urls",
          400,
        );
      }

      try {
        const uuids = fields.corousalUrls.map(
          (url) => url.split(".com/")[1].split("?")[0],
        );

        fields.corousal = [];
        // .concat doesn't work here for some reason
        fields.corousal.push(...uuids);
      } catch (err) {
        throw new ServiceError(
          "Unable to update existing urls for corousal images",
          400,
        );
      }
    }

    if (files.corousal) {
      // if multiple images, then it will be a File Array
      if (Array.isArray(files.corousal)) {
        const promises = [];
        for (const image of files.corousal) {
          promises.push(
            fileUploader.upload_file(image, `uploads/events/`, imageFormats),
          );
        }

        if (!Array.isArray(fields.corousal)) fields.corousal = [];

        // doing spreading here, because .concat doesn't work for some reason
        fields.corousal.push(...(await Promise.all(promises)));
      } else {
        // if single image is sent, it will not be in an array
        const url = await fileUploader.upload_file(
          files.corousal,
          `uploads/events/`,
          imageFormats,
        );
        fields.corousal.push(url);
      }
    }

    const event = await eventService.updateEvent(fields, req.params.id);

    event.imageUrl = fileUploader.getFileURL(event.imageUrl);

    if (event.corousal && event.corousal.length) {
      event.corousal = helper.getURLOfImages(event.corousal);
    }

    helper.mqtt_publish_message(
      `we/${req.params.id}/updated`,
      {
        eventId: req.params.id,
      },
      false,
    );
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
    const validation = new Validator(req.query, {
      page: "integer",
      size: "integer",
    });

    if (validation.fails()) {
      throw new ServiceError(validation.firstError(), 400);
    }

    const paginationOptions = helper.get_pagination_params({
      limit: req.query.size || 10,
      page: req.query.page || 1,
    });

    let data = await eventService.getEvents({ paginationOptions });

    data.events = data.events.map((event) => {
      event.imageUrl = fileUploader.getFileURL(event.imageUrl);
      return event;
    });

    apiResponse.success(
      res,
      req,
      { ...data, pagination: paginationOptions },
      200,
    );
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
      throw new ServiceError(validation.firstError(), 400);
    }

    let events = await eventService.getEvents({ gcId: req.params.id });

    if (!events.length) throw new ServiceError("Not Found", 404);

    events = events.map((event) => {
      event.imageUrl = fileUploader.getFileURL(event.imageUrl);
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
      throw new ServiceError(validation.firstError(), 400);
    }

    const event = await eventService.getSingleEvent({ id: req.params.id });

    event.imageUrl = fileUploader.getFileURL(event.imageUrl);

    if (event.corousal) event.corousal = helper.getURLOfImages(event.corousal);

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
      throw new ServiceError(validation.firstError(), 400);
    }

    await eventService.delelteEvent(req.params.id);

    helper.mqtt_publish_message(`we/${req.params.id}/deleted`, {
      eventId: req.params.id,
    });
    apiResponse.success(res, req, null, 204);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
