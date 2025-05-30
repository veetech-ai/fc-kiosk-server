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
const config = require("../../config/config");
const UserModel = require("../../services/user");
const { send_wedding_event } = require("../user/helper");
Validator.prototype.firstError = function () {
  const fields = Object.keys(this.rules);
  for (let i = 0; i < fields.length; i++) {
    const err = this.errors.first(fields[i]);
    if (err) return err;
  }
};

const UPLOAD_PATH = "uploads/events";

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
      UPLOAD_PATH,
      imageFormats,
    );

    fields.corousal = [];

    if (files.corousal) {
      if (Array.isArray(files.corousal)) {
        const promises = [];
        for (const image of files.corousal) {
          promises.push(
            fileUploader.upload_file(image, UPLOAD_PATH, imageFormats),
          );
        }

        fields.corousal = await Promise.all(promises);
      } else {
        const url = await fileUploader.upload_file(
          files.corousal,
          UPLOAD_PATH,
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

    helper.mqtt_publish_message(`we/${fields.gcId}/created`, {
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
        UPLOAD_PATH,
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
        let uuids = [];

        if (config.aws.upload) {
          uuids = fields.corousalUrls.map(
            (url) => url.split(".com/")[1].split("?")[0],
          );
        } else if (config.azure.upload) {
          throw new Error("Not implemented");
        } else {
          uuids = fields.corousalUrls.map((url) => url.split("/")[2]);
        }

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
            fileUploader.upload_file(image, UPLOAD_PATH, imageFormats),
          );
        }

        if (!Array.isArray(fields.corousal)) fields.corousal = [];

        // doing spreading here, because .concat doesn't work for some reason
        fields.corousal.push(...(await Promise.all(promises)));
      } else {
        // if single image is sent, it will not be in an array
        const url = await fileUploader.upload_file(
          files.corousal,
          UPLOAD_PATH,
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
      `we/${fields.gcId}/updated`,
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

    let data = await eventService.getEvents({ where: { gcId: req.params.id } });

    data.events = data.events.map((event) => {
      event.imageUrl = fileUploader.getFileURL(event.imageUrl);
      return event;
    });

    apiResponse.success(res, req, data, 200);
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

    let specificEvent = await eventService.getEvents({
      where: { id: req.params.id },
    });
    await eventService.delelteEvent(req.params.id);

    helper.mqtt_publish_message(
      `we/${specificEvent.events[0].dataValues.gcId}/deleted`,
      {
        eventId: req.params.id,
      },
    );
    apiResponse.success(res, req, null, 204);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
exports.create_contact_wedding_event = async (req, res) => {
  /**
   * @swagger
   *
   * /events/contacts:
   *   post:
   *     security:
   *       - auth: []
   *     description: contact with golf owner of golf course.
   *     tags: [Events]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     parameters:
   *       - name: weddingEventId
   *         description: id of wedding event
   *         in: formData
   *         required: true
   *         type: integer
   *       - name: phone
   *         description: phone of golfer
   *         in: formData
   *         required: false
   *         type: string
   *       - name: email
   *         description: email of golfer
   *         in: formData
   *         required: false
   *         type: string
   *       - name: contact_medium
   *         description: contact_medium
   *         in: formData
   *         enum: ['text', 'call']
   *         required: false
   *         type: string
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.body, {
      weddingEventId: "required|integer",
      phone: "string",
      email: "string",
      contact_medium: "string",
    });
    // based on eventId, get organiuzation id
    // organization people
    // get role_id 3
    // send to role id 3

    if (validation.fails()) {
      return apiResponse.fail(res, validation.errors);
    }

    const { weddingEventId, phone, email, contact_medium } = req.body;
    const weddingEvent = await eventService.getEvents({
      where: { id: weddingEventId },
    });
    if (weddingEvent.events.length == 0) {
      throw new Error("No Users in this Organization");
    }
    const weddingEventName = weddingEvent.events[0].dataValues.title;
    const weddingEventgcId = weddingEvent.events[0].dataValues.gcId;
    const courseData = await courseService.getCourseById(weddingEventgcId, {
      exclude: [],
    });
    const orgId = courseData.dataValues.org_id;
    const users = await UserModel.get_users_by_organizations(orgId);
    const contact_info = {
      userPhone: phone,
      userEmail: email,
      contactMedium: contact_medium,
    };

    await send_wedding_event(res, req, weddingEventName, contact_info, users);

    return apiResponse.success(
      res,
      req,
      "Emails Sent. We will contact you",
      200,
    );
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
