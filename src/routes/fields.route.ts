const express = require("express");
import { Router } from "express";
import { FieldJSON, Fields } from "../models/fields/fields.model";
import fieldsService from "../../src/api/services/fields/fields.service";
import { success, errorResponse } from "../api/utils/utils";
import { UserJSON } from "../../src/models/users/users.model";
import usersService from "../../src/api/services/users/users.service";
import { NotificationMessage } from "../api/services/notifications/notifications.types";
import NotificationsService from "../../src/api/services/notifications/notifications.service";
import { NotificationJSON } from "src/models/notifications/notifications.model";
const router: Router = express.Router();
const notificationService = new NotificationsService();

/** list*/
router.get("/", async (req, res) => {
  try {
    let items = (await fieldsService.list(req.query)).reverse();
    let limit = 12;
    let page = Number(req.query.page) || 1;
    let paginated = items.slice((page - 1) * limit, page * limit);
    success(res, paginated, 200, limit, paginated.length, page, items.length);
  } catch (error) {
    console.log(`Error with fields list service --> ${error}`);
    errorResponse(req, res, `Error with fields list service`, 500, error);
  }
});

/** create */
router.post("/", async (req, res) => {
  try {
    let item = new Fields(req.body);
    let itemCreated = await fieldsService.create(item);
    success(res, itemCreated, 200);
  } catch (error) {
    console.log(`Error with team create service ${error}`);
    errorResponse(req, res, `Error with team create service`, 500, error);
  }
});

/** get by id */
router.get("/:id", async (req, res) => {
  try {
    let itemKey = req.params.id || "";
    let item: FieldJSON = await fieldsService.get(itemKey);
    if (item && item.comments) item.comments.reverse();
    success(res, item, 200);
  } catch (error) {
    console.log(`Error with fields get service ${error}`);
    errorResponse(req, res, `Error with fields get service`, 500, error);
  }
});

/** update by id*/
router.put("/:id", async (req, res) => {
  try {
    let itemKey = req.params.id || "";
    let item = new Fields(req.body);
    let itemUpdated = await fieldsService.update(itemKey, item);
    success(res, itemUpdated, 200);
  } catch (error) {
    console.log(`Error with fields update service ${error}`);
    errorResponse(req, res, `Error with fields update service`, 500, error);
  }
});

/** add a comment to field */
router.put("/add/comment/:id", async (req, res) => {
  try {
    let fieldId = req.params.id;
    let newComment = req.body.comment;
    let field: FieldJSON = await fieldsService.get(fieldId);
    let newComments = [...field.comments, newComment];
    field.comments = newComments;
    let fieldUpdated = await fieldsService.update(fieldId, field);

    // send push notification to the field owner
    let messageBody = `Tu cancha tiene un nuevo comentario`;
    let fieldOwner: UserJSON = await usersService.getByFieldId(field.key);
    if (fieldOwner.pushToken) {
      let message: NotificationMessage = {
        to: fieldOwner.pushToken,
        body: messageBody,
        sound: "default",
      };
      await notificationService.send(message);
    }

    // save notification in DB
    let notification: NotificationJSON = {
      title: messageBody,
      owner: fieldOwner.key,
      iconName: "rocket"
    };
    await notificationService.create(notification);

    // send response
    success(res, fieldUpdated, 200);
  } catch (error) {
    console.log(`Error adding booking comment ${error}`);
    errorResponse(req, res, `Error adding booking comment`, 500, error);
  }
});

/** rate a field (give points) */
router.put("/points/:id", async (req, res) => {
  try {
    let fieldId = req.params.id || "";
    let pointValue = Number(req.body.point);
    let field: FieldJSON = await fieldsService.get(fieldId);
    field.points = [...field.points, pointValue];
    let fieldUpdated = await fieldsService.update(field.key, field);

    // send push notification to the field owner
    let messageBody = `Han valorado tu cancha`;
    let fieldOwner: UserJSON = await usersService.getByFieldId(field.key);
    if (fieldOwner.pushToken) {
      let message: NotificationMessage = {
        to: fieldOwner.pushToken,
        body: messageBody,
        sound: "default",
      };
      await notificationService.send(message);
    }

    // save notification into DB
    let notification: NotificationJSON = {
      title: messageBody,
      owner: fieldOwner.key,
      iconName: "rocket"
    };
    await notificationService.create(notification);

    success(res, fieldUpdated, 200);
  } catch (error) {
    console.log(`Error adding points to the match ${error}`);
    errorResponse(req, res, `Error adding points to the match`, 500, error);
  }
});

/** delete by id*/
router.delete("/:id", async (req, res) => {
  try {
    let itemKey = req.params.id || "";
    let itemDeleted = await fieldsService.delete(itemKey);
    success(res, itemDeleted, 200);
  } catch (error) {
    console.log(`Error with fields delete service ${error}`);
    errorResponse(req, res, `Error with fields delete service`, 500, error);
  }
});

export default router;
