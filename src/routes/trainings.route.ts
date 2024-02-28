import { Router } from "express";
import teamsService from "../../src/api/services/teams/teams.service";
import { TrainingJSON, Trainings } from "../models/trainings/trainings.model";
import traininsService from "../../src/api/services/trainings/trainings.service";
import { success, errorResponse } from "../api/utils/utils";
import { TeamJSON } from "../models/teams/teams.model";
import bookingsService from "../../src/api/services/bookings/bookings.service";
import { FieldJSON } from "../../src/models/fields/fields.model";
import {
  BookingJSON,
  Bookings,
} from "../../src/models/bookings/bookings.model";
import fieldsService from "../../src/api/services/fields/fields.service";
import NotificationsService from "../../src/api/services/notifications/notifications.service";
import usersService from "../../src/api/services/users/users.service";
import { UserJSON } from "../../src/models/users/users.model";
const express = require("express");
const router: Router = express.Router();
const notificationsService = new NotificationsService();

/** list*/
//TODO: change items.reverse() to sort by item timestamp
router.get("/", async (req, res) => {
  try {
    let items = (await traininsService.list(req.query)).reverse();
    let page = Number(req.query.page) || 1;
    let paginated = items.slice((page - 1) * 12, page * 12);
    success(res, paginated, 200, 12, paginated.length, page, items.length);
  } catch (error) {
    console.log(`Error with matches list service --> ${error}`);
    errorResponse(req, res, `Error with matches list service`, 500, error);
  }
});

/** create */
router.post("/", async (req, res) => {
  try {
    // Create the training
    let training = new Trainings(req.body);
    training.players.push(training.coach);
    let trainingCreated = await traininsService.create(training);

    // add this new training to the current team
    let trainingTeam: TeamJSON = await teamsService.get(training.team);
    trainingTeam.trainings = [...trainingTeam.trainings, training.key];
    await teamsService.update(trainingTeam.key, trainingTeam);

    // if field is not null then create a booking with training=true
    if (training.field) {
      let field: FieldJSON = await fieldsService.get(training.field);
      let bookingBody = {
        title: field.field,
        image: field.image,
        date: training.date,
        time: training.hour,
        owner: training.coach,
        field: field.key,
        training: training.key,
      };
      let booking = new Bookings(bookingBody);
      await bookingsService
        .create(booking)
        .catch((e) => console.log(`Error creating booking relationship ${e}`));
    }

    // send push notification to all members of the team
    let recipients = [];
    let recipientsKeys = [];
    let saves = [];
    let trainingCoach: UserJSON = await usersService.get(training.coach);
    let notificationBody = `${trainingCoach.displayName} ha creado un nuevo entreno`;
    for (let i = 0; i < trainingTeam.members.length; i++) {
      const teamPlayerKey = trainingTeam.members[i];
      let pushToken = await usersService.getUserPushToken(teamPlayerKey);
      if (pushToken) {
        recipients.push(pushToken);
        recipientsKeys.push(teamPlayerKey);
      }
    }
    if (recipients.length)
      await notificationsService.broadcast(notificationBody, recipients);
    // save notifications in db
    // TODO: this is duplicated code, this could be automated
    if (recipientsKeys.length) {
      for (let i = 0; i < recipientsKeys.length; i++) {
        const recipientKey = recipientsKeys[i];
        saves.push(
          notificationsService.create({
            title: notificationBody,
            owner: recipientKey,
            iconName: "rocket",
          })
        );
      }
      if (saves.length) await Promise.allSettled(saves);
    }

    success(res, trainingCreated, 200);
  } catch (error) {
    console.log(`Error with team create service ${error}`);
    errorResponse(req, res, `Error with team create service`, 500, error);
  }
});

/** add user to training */
router.put("/join/:id", async (req, res) => {
  try {
    let trainingKey = req.params.id || "";
    let newplayerID = req.body.newPlayerId;
    if (!newplayerID) throw new Error("No new user in request body");
    let training: TrainingJSON = await traininsService.get(trainingKey);
    training.players = [...training.players, newplayerID];
    let itemUpdated = await traininsService.update(trainingKey, training);

    // send notification to all memebers of the team
    let recipients = [];
    let recipientsKeys = [];
    let saves = [];
    let trainingTeam: TeamJSON = await teamsService.get(training.team);
    let newPlayer: UserJSON = await usersService.get(newplayerID);
    let notificationBody = `${newPlayer.displayName} se ha unido al entreno`;
    for (let i = 0; i < trainingTeam.members.length; i++) {
      const teamPlayerKey = trainingTeam.members[i];
      let pushToken = await usersService.getUserPushToken(teamPlayerKey);
      if (pushToken) {
        recipients.push(pushToken);
        recipientsKeys.push(teamPlayerKey);
      }
    }
    if (recipients.length)
      await notificationsService.broadcast(notificationBody, recipients);
    // save notifications in db
    if (recipientsKeys.length) {
      for (let i = 0; i < recipientsKeys.length; i++) {
        const recipientKey = recipientsKeys[i];
        saves.push(
          notificationsService.create({
            title: notificationBody,
            owner: recipientKey,
            iconName: "rocket",
          })
        );
      }
      if (saves.length) await Promise.allSettled(saves);
    }
    success(res, itemUpdated, 200);
  } catch (error) {
    console.log(`Error joining user to training ${error}`);
    errorResponse(req, res, `Error joining user to training`, 500, error);
  }
});

/** check if user already joined a training */
router.get("/check/user/joined/:matchid/:userid", async (req, res) => {
  try {
    let trainingKey = req.params.matchid || "";
    let userKey = req.params.userid || "";
    let training: TrainingJSON = await traininsService.get(trainingKey);
    let joined =
      training.players.filter((player) => player === userKey).length > 0
        ? true
        : false;

    success(res, joined, 200);
  } catch (error) {
    console.log(`error checking if user alreaady joined training ${error}`);
    errorResponse(
      req,
      res,
      `Error checking if user already joinde training`,
      500,
      error
    );
  }
});

/** leave training */
router.put("/leave/:id", async (req, res) => {
  try {
    let trainingKey = req.params.id || "";
    let newPlayerId = req.body.newPlayerId;
    if (!newPlayerId) throw new Error("No new user in request body");

    let training: TrainingJSON = await traininsService.get(trainingKey);
    training.players = training.players.filter(
      (player) => player !== req.body.newPlayerId
    );

    let itemUpdated = await traininsService.update(trainingKey, training);

    // send notification to all memebers of the team
    let recipients = [];
    let recipientsKeys = [];
    let saves = [];
    let trainingTeam: TeamJSON = await teamsService.get(training.team);
    let newPlayer: UserJSON = await usersService.get(newPlayerId);
    let notificationBody = `${newPlayer.displayName} ha dejado al entreno`;
    for (let i = 0; i < trainingTeam.members.length; i++) {
      const teamPlayerKey = trainingTeam.members[i];
      let pushToken = await usersService.getUserPushToken(teamPlayerKey);
      if (pushToken) {
        recipients.push(pushToken);
        recipientsKeys.push(teamPlayerKey);
      }
    }
    if (recipients.length)
      await notificationsService.broadcast(notificationBody, recipients);
    // save notifications in db
    if (recipientsKeys.length) {
      for (let i = 0; i < recipientsKeys.length; i++) {
        const recipientKey = recipientsKeys[i];
        saves.push(
          notificationsService.create({
            title: notificationBody,
            owner: recipientKey,
            iconName: "minus",
          })
        );
      }
      if (saves.length) await Promise.allSettled(saves);
    }
    success(res, itemUpdated, 200);
  } catch (error) {
    console.log(`Error leaving user to training ${error}`);
    errorResponse(req, res, `Error leaving user to training`, 500, error);
  }
});

/** cancel training */
router.put("/cancel/:id", async (req, res) => {
  try {
    let trainingKey = req.params.id || "";
    if (!req.body.newPlayerId) throw new Error("No new user in request body");

    let training: TrainingJSON = await traininsService.get(trainingKey);
    training.status = "canceled";
    let trainingUpdated = await traininsService.update(trainingKey, training);

    if (training.field) {
      let booking: BookingJSON = await bookingsService.getByTrainingKey(
        training.key
      );
      booking.status = "canceled";
      await bookingsService.update(booking.key, booking);
    }

    let trainingTeam: TeamJSON = await teamsService.get(training.team);

    // send push notification to all members of the team
    let recipients = [];
    let recipientsKeys = [];
    let saves = [];
    let trainingCoach: UserJSON = await usersService.get(training.coach);
    let notificationBody = `${trainingCoach.displayName} ha cancelado el entreno`;
    for (let i = 0; i < trainingTeam.members.length; i++) {
      const teamPlayerKey = trainingTeam.members[i];
      let pushToken = await usersService.getUserPushToken(teamPlayerKey);
      if (pushToken) {
        recipients.push(pushToken);
        recipientsKeys.push(teamPlayerKey);
      }
    }
    if (recipients.length)
      await notificationsService.broadcast(notificationBody, recipients);
    // save notifications in db
    // TODO: this is duplicated code, this could be automated
    if (recipientsKeys.length) {
      for (let i = 0; i < recipientsKeys.length; i++) {
        const recipientKey = recipientsKeys[i];
        saves.push(
          notificationsService.create({
            title: notificationBody,
            owner: recipientKey,
            iconName: "minus",
          })
        );
      }
      if (saves.length) await Promise.allSettled(saves);
    }

    success(res, trainingUpdated, 200);
  } catch (error) {
    console.log(`Error cancel training ${error}`);
    errorResponse(req, res, `Error cancel training`, 500, error);
  }
});

/** get trainings by field id */
router.get("/field/:id", async (req, res) => {
  try {
    let itemKey = req.params.id || "";
    let items = (await traininsService.list(req.query))
      .filter(
        (training: TrainingJSON) => training.field && training.field === itemKey
      )
      .reverse();
    success(res, items, 200);
  } catch (error) {
    console.log(`Error with matches list service --> ${error}`);
    errorResponse(req, res, `Error with matches list service`, 500, error);
  }
});

/** get by id */
router.get("/:id", async (req, res) => {
  try {
    let itemKey = req.params.id || "";
    let item = await traininsService.get(itemKey);
    success(res, item, 200);
  } catch (error) {
    console.log(`Error with matches get service ${error}`);
    errorResponse(req, res, `Error with matches get service`, 500, error);
  }
});

/** update by id*/
router.put("/:id", async (req, res) => {
  try {
    let itemKey = req.params.id || "";
    let item = new Trainings(req.body);
    let itemUpdated = await traininsService.update(itemKey, item);
    success(res, itemUpdated, 200);
  } catch (error) {
    console.log(`Error with matches update service ${error}`);
    errorResponse(req, res, `Error with matches update service`, 500, error);
  }
});

/** delete by id*/
router.delete("/:id", async (req, res) => {
  try {
    let itemKey = req.params.id || "";
    let itemDeleted = await traininsService.delete(itemKey);
    success(res, itemDeleted, 200);
  } catch (error) {
    console.log(`Error with matches delete service ${error}`);
    errorResponse(req, res, `Error with matches delete service`, 500, error);
  }
});

export default router;
