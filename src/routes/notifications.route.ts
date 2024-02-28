const express = require("express");
import { Router } from "express";
import { success, errorResponse } from "../api/utils/utils";
import NotificationsService from "../api/services/notifications/notifications.service";
import {
  NotificationJSON,
  Notifications,
} from "../models/notifications/notifications.model";
const router: Router = express.Router();
const bcrypt = require("bcrypt");
const notificationsService = new NotificationsService();

/** list*/
router.get("/", async (req, res) => {
  try {
    let items = (await notificationsService.list(req.query)).reverse();
    let page = Number(req.query.page) || 1;
    let paginated = items.slice((page - 1) * 12, page * 12);
    success(res, paginated, 200, 12, paginated.length, page, items.length);
  } catch (error) {
    console.log(`Error with notification list service --> ${error}`);
    errorResponse(req, res, `Error with notification list service`, 500, error);
  }
});

/** list notifications by user id */
router.get("/:id", async (req, res) => {
  try {
    let userID = req.params.id || "";
    let notifications = (await notificationsService.list(req.query)).reverse();
    let items = notifications.filter(
      (notification: NotificationJSON) => notification.owner === userID
    );
    let page = Number(req.query.page) || 1;
    let paginated = items.slice((page - 1) * 12, page * 12);
    success(res, paginated, 200, 12, paginated.length, page, items.length);
  } catch (error) {
    console.log(`Error with notification list service --> ${error}`);
    errorResponse(req, res, `Error with notification list service`, 500, error);
  }
});

/** update by id*/
router.put("/:id", async (req, res) => {
  try {
    let itemKey = req.params.id || "";
    let item = new Notifications(req.body);
    let itemUpdated = await notificationsService.update(itemKey, item);
    success(res, itemUpdated, 200);
  } catch (error) {
    console.log(`Error with notification update service ${error}`);
    errorResponse(
      req,
      res,
      `Error with notification update service`,
      500,
      error
    );
  }
});

/** update read notification */
router.put("/read/:id", async (req, res) => {
  try {
    let itemKey = req.params.id || "";
    let item: NotificationJSON = new Notifications(req.body);
    item.read = true;
    let itemUpdated = await notificationsService.update(itemKey, item);
    success(res, itemUpdated, 200);
  } catch (error) {
    console.log(`Error with notification update service ${error}`);
    errorResponse(
      req,
      res,
      `Error with notification update service`,
      500,
      error
    );
  }
});

/** check if user has notifications pending (read: false) */
router.get("/check/:id", async (req, res) => {
  try {
    let userID = req.params.id || "";
    let notifications = await notificationsService.list(req.query);
    let items = notifications.filter(
      (notification: NotificationJSON) => notification.owner === userID
    );
    let checkedNotifications = items.filter((not: NotificationJSON) => not.read === false).length > 0;
    success(res, !checkedNotifications, 200);
  } catch (error) {
    console.log(`Error with notification list service --> ${error}`);
    errorResponse(req, res, `Error with notification list service`, 500, error);
  }
});

export default router;
