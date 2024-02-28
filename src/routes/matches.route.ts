const express = require("express");
import { Router } from "express";
import { Matches, MatchJSON } from "../models/matches/matches.model";
import matchesService from "../../src/api/services/matches/matches.service";
import { success, errorResponse } from "../api/utils/utils";
import fieldsService from "../../src/api/services/fields/fields.service";
import { FieldJSON } from "../models/fields/fields.model";
import usersService from "../../src/api/services/users/users.service";
import { UserJSON } from "../models/users/users.model";
import bookingsService from "../../src/api/services/bookings/bookings.service";
import {
  BookingJSON,
  Bookings,
} from "../../src/models/bookings/bookings.model";
import { TrainingJSON } from "../../src/models/trainings/trainings.model";
import traininsService from "../../src/api/services/trainings/trainings.service";
import NotificationsService from "../api/services/notifications/notifications.service";
import { NotificationMessage } from "../api/services/notifications/notifications.types";
import { NotificationJSON } from "src/models/notifications/notifications.model";
const router: Router = express.Router();
const notificationsService = new NotificationsService();

/** list*/
//TODO: change items.reverse() to sort by item timestamp
router.get("/", async (req, res) => {
  try {
    let items = (await matchesService.list(req.query)).reverse();
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
    // grab variables and fetch necessary items
    const promises = [];
    let organizerId = req.body.organizer;
    let capacity = req.body.players;
    let fieldId = req.body.field;
    if (!organizerId && !capacity && !fieldId)
      throw new Error("One or more fields are required");
    let field: FieldJSON = await fieldsService.get(fieldId).catch((e) => {
      console.log("error getting field -> ", e);
      throw new Error("Couldn't get match field");
    });
    let organizer: UserJSON = await usersService.get(organizerId).catch((e) => {
      console.log("error getting organizer -> ", e);
      throw new Error("Couldn't get organizer");
    });
    // Add organizer as a confirmed player to this match
    let confirmedPlayers = [];
    if (organizer) confirmedPlayers.push(organizer.key);
    req.body.confirmedPlayers = confirmedPlayers;

    // Create the match object
    let match = new Matches(req.body);
    let matchCreated = await matchesService.create(match);

    // create match into the field relationship(match field) ... agregando partido a la cancha
    promises.push(fieldsService.addMatchField(fieldId, field, match.key));

    // create match into the organzier relationship(user match) ... agregando partifo al usuario
    promises.push(usersService.addUserMatch(organizerId, organizer, match.key));

    // create a booking for the user ... creando la reserva del partido
    let bookingJSON: BookingJSON = {
      title: field.field,
      image: field.image,
      confirmed: false,
      date: match.date,
      time: match.hour,
      owner: organizer.key,
      field: fieldId,
      matchKey: match.key,
    };
    let booking = new Bookings(bookingJSON);
    bookingsService.create(booking);
    await Promise.allSettled(promises).catch((e) => {
      console.error("An error has occured during match creation --> ", e);
      throw new Error(`An error has occured during match creation --> ${e}`);
    });

    // send push notification to field owner
    let messageBody = `Nueva reserva de ${organizer.displayName}`;
    let fieldOwner: UserJSON = await usersService.getByFieldId(match.field);
    if (fieldOwner && fieldOwner.pushToken) {
      let message: NotificationMessage = {
        to: fieldOwner.pushToken,
        body: messageBody,
        sound: "default",
      };
      await notificationsService.send(message);
    }

    // save notification in DB
    let notification: NotificationJSON = {
      title: messageBody,
      owner: fieldOwner.key,
      iconName: 'rocket'
    };
    await notificationsService.create(notification);
    success(res, matchCreated, 200);
  } catch (error) {
    console.log(`Error with team create service ${error}`);
    errorResponse(req, res, `Error with team create service`, 500, error);
  }
});

/** get by id */
router.get("/:id", async (req, res) => {
  try {
    let itemKey = req.params.id || "";
    let item = await matchesService.get(itemKey);
    success(res, item, 200);
  } catch (error) {
    console.log(`Error with matches get service ${error}`);
    errorResponse(req, res, `Error with matches get service`, 500, error);
  }
});

/** get field matches by field id  */
router.get("/field/:id", async (req, res) => {
  try {
    let itemKey = req.params.id || "";
    let field: FieldJSON = await fieldsService.get(itemKey);
    success(res, field.matches, 200);
  } catch (error) {
    console.log(`Error getting field matches by field id ${error}`);
    errorResponse(
      req,
      res,
      `Error getting field matches by field id`,
      500,
      error
    );
  }
});

/** get user matches by user id */
router.get("/user/:id", async (req, res) => {
  try {
    let userKey = req.params.id || "";
    let matches = (await matchesService.list(req.query)).reverse();
    let userMatches = matches.filter(
      (match: MatchJSON) => match.organizer === userKey
    );
    let page = Number(req.query.page) || 1;
    let paginated = userMatches.slice((page - 1) * 12, page * 12);
    success(
      res,
      paginated,
      200,
      12,
      paginated.length,
      page,
      userMatches.length
    );
  } catch (error) {
    console.log(`Error getting field matches by field id ${error}`);
    errorResponse(
      req,
      res,
      `Error getting field matches by field id`,
      500,
      error
    );
  }
});

/** check if user already joined a match */
router.get("/check/user/joined/:matchid/:userid", async (req, res) => {
  try {
    let matchKey = req.params.matchid || "";
    let userKey = req.params.userid || "";
    let match: MatchJSON = await matchesService.get(matchKey);
    let joined =
      match.confirmedPlayers.filter((player) => player === userKey).length > 0
        ? true
        : false;
    success(res, joined, 200);
  } catch (error) {
    console.log(`error checking if user alreaady joined match ${error}`);
    errorResponse(
      req,
      res,
      `Error checking if user already joinde match`,
      500,
      error
    );
  }
});

/** update by id*/
router.put("/:id", async (req, res) => {
  try {
    let itemKey = req.params.id || "";
    let item = new Matches(req.body);
    let itemUpdated = await matchesService.update(itemKey, item);
    success(res, itemUpdated, 200);
  } catch (error) {
    console.log(`Error with matches update service ${error}`);
    errorResponse(req, res, `Error with matches update service`, 500, error);
  }
});

/*** add user to match (Join user to match) */
router.put("/newplayer/:id/", async (req, res) => {
  try {
    let matchKey = req.params.id || "";
    if (!req.body.newPlayerId) throw new Error("No new user in request body");
    let match: MatchJSON = await matchesService.get(matchKey);
    let newPlayer: UserJSON = await usersService
      .get(req.body.newPlayerId)
      .catch((e) => {
        console.log("error getting organizer -> ", e);
        throw new Error(`Couldn't get organizer ${e}`);
      });

    // add new user into the current match
    match.confirmedPlayers.push(req.body.newPlayerId);
    let matchUpdated = await matchesService.update(matchKey, match);

    // add current match into the new user
    await usersService
      .addUserMatch(req.body.newPlayerId, newPlayer, match.key)
      .catch((e) => {
        throw new Error(`couldn't add match to user schema ${e}`);
      });

    // send notification to host
    let recipients = [];
    let recipientsKeys = [];
    let saves = [];
    let bodyMessage = `${newPlayer.displayName} se ha unido a tu partido`;
    for (let i = 0; i < match.confirmedPlayers.length; i++) {
      const playerKey = match.confirmedPlayers[i];
      recipientsKeys.push(playerKey);
      let pushToken = await usersService.getUserPushToken(playerKey);
      if (pushToken) {
        recipients.push(pushToken);
      }
    }
    if (recipients.length)
      await notificationsService.broadcast(bodyMessage, recipients);
    // save notifications in db
    if (recipientsKeys.length) {
      for (let i = 0; i < recipientsKeys.length; i++) {
        const recipientKey = recipientsKeys[i];
        saves.push(
          notificationsService.create({
            title: bodyMessage,
            owner: recipientKey,
            iconName: "rocket"
          })
        );
      }
      if (saves.length) await Promise.allSettled(saves);
    }
    // send response
    success(res, matchUpdated, 200);
  } catch (error) {
    console.log(`Error with matches update service ${error}`);
    errorResponse(req, res, `Error with matches update service`, 500, error);
  }
});

/** cancel match from match host */
router.put("/cancel/:id/", async (req, res) => {
  try {
    let matchKey = req.params.id || "";
    let match: MatchJSON = await matchesService.get(matchKey);
    match.status = "canceled";
    let matchUpdated = await matchesService.update(matchKey, match);
    // update match status from bookings collection to 'canceled' status
    let booking: BookingJSON = await bookingsService.getByMatchKey(matchKey);
    booking.status = "canceled";
    await bookingsService.update(booking.key, booking).catch((e) => {
      throw new Error(`couldn't change booking status ${e}`);
    });

    // send push notification to match confirmed players
    let recipients = [];
    let recipientsKeys = [];
    let saves = [];
    let bodyMessage = `Partido del ${match.date} cancelado`;
    for (let index = 0; index < match.confirmedPlayers.length; index++) {
      const confirmedPlayerKey = match.confirmedPlayers[index];
      let pushToken = await usersService.getUserPushToken(confirmedPlayerKey);
      recipientsKeys.push(confirmedPlayerKey);
      if (pushToken) {
        recipients.push(pushToken);
      }
    }
    if (recipients.length)
      await notificationsService.broadcast(bodyMessage, recipients);

    // save match confirmed players notifications in db
    if (recipientsKeys.length) {
      for (let i = 0; i < recipientsKeys.length; i++) {
        const recipientKey = recipientsKeys[i];
        saves.push(
          notificationsService.create({
            title: bodyMessage,
            owner: recipientKey,
            iconName: "minus"
          })
        );
      }
      if (saves.length) await Promise.allSettled(saves);
    }

    // send notification to field
    let fieldOwner: UserJSON = await usersService.getByFieldId(match.field);
    if (fieldOwner.pushToken) {
      let message: NotificationMessage = {
        to: fieldOwner.pushToken,
        body: bodyMessage,
        sound: "default",
      };
      await notificationsService.send(message);
    }

    // save notification in db
    let notification: NotificationJSON = {
      title: bodyMessage,
      owner: fieldOwner.key,
      iconName: "minus"
    };
    await notificationsService.create(notification);

    // send response
    success(res, matchUpdated, 200);
  } catch (error) {
    console.log(`Error with matches update service ${error}`);
    errorResponse(req, res, `Error with matches update service`, 500, error);
  }
});

/** user leaves match  */
router.put("/leave/:id", async (req, res) => {
  try {
    let matchKey = req.params.id || "";
    if (!req.body.newPlayerId) throw new Error("No new user in request body");
    let match: MatchJSON = await matchesService.get(matchKey);

    // remove user from the current match
    let matchConfirmedPlayers = match.confirmedPlayers.filter(
      (player) => player !== req.body.newPlayerId
    );
    match.confirmedPlayers = matchConfirmedPlayers;
    let matchUpdated = await matchesService.update(matchKey, match);

    // remove current match from new user
    let user: UserJSON = await usersService.get(req.body.newPlayerId);
    let userMatches = user.matches.filter((myMatch) => myMatch !== match.key);
    user.matches = userMatches;
    await usersService
      .update(user.key, user)
      .catch((e) => `couldn't remove match from user ${e}`);

    // send notification to match confirmed players (confirmed players array includes the match host)
    let recipients = [];
    let recipientsKeys = [];
    let saves = [];
    let bodyMessage = `${user.displayName} ha dejado el partido del ${match.date}`;
    for (let i = 0; i < match.confirmedPlayers.length; i++) {
      const playerKey = match.confirmedPlayers[i];
      recipientsKeys.push(playerKey);
      let pushToken = await usersService.getUserPushToken(playerKey);
      if (pushToken) {
        recipients.push(pushToken);
      }
    }
    if (recipients.length)
      await notificationsService.broadcast(bodyMessage, recipients);
    // save notifications in db
    if (recipientsKeys.length) {
      for (let i = 0; i < recipientsKeys.length; i++) {
        const recipientKey = recipientsKeys[i];
        saves.push(
          notificationsService.create({
            title: bodyMessage,
            owner: recipientKey,
            iconName: "minus"
          })
        );
      }
      if (saves.length) await Promise.allSettled(saves);
    }

    // send the response
    success(res, matchUpdated, 200);
  } catch (error) {
    console.log(`Error with matches update service ${error}`);
    errorResponse(req, res, `Error with matches update service`, 500, error);
  }
});

/** check for outdated matches and trainings (change status) */
router.put("/check/data", async (req, res) => {
  try {
    let matches: Array<MatchJSON> = await matchesService.list();
    let trainings: Array<TrainingJSON> = await traininsService.list();
    let updates = [];
    let currentTime = new Date(); // server time
    // check over matches
    for (let i = 0; i < matches.length; i++) {
      const match: MatchJSON = matches[i];
      let matchTime = new Date(Number(match.timestamp) * 1000);
      if (matchTime < currentTime) {
        console.log(
          `match with key ${match.key} with date ${match.date} at ${match.hour} is outdated`
        );
        // update current match status
        match.status = "outdated";
        updates.push(matchesService.update(match.key, match));
        // update current bookking related to match affected
        let booking: BookingJSON = await bookingsService.getByMatchKey(
          match.key
        );
        booking.status = "outdated";
        updates.push(bookingsService.update(booking.key, booking));
      }
    }
    // check over trainings
    for (let j = 0; j < trainings.length; j++) {
      const trainin = trainings[j];
      let time = new Date(Number(trainin.timestamp) * 1000);
      if (time < currentTime) {
        console.log(
          `match with key ${trainin.key} with date ${trainin.date} at ${trainin.hour} is outdated`
        );
        let training: TrainingJSON = await traininsService.get(trainin.key);
        training.status = "outdated";
        updates.push(traininsService.update(training.key, training));
      }
    }
    await Promise.allSettled(updates)
      .then((r) => {
        console.log("all matches updated");
        success(res, "all outdated matches set", 200);
      })
      .catch((e) => {
        console.log("error upddating matches");
        throw new Error(e);
      });
  } catch (error) {
    console.log(`Error with matches update service ${error}`);
    errorResponse(req, res, `Error with matches update service`, 500, error);
  }
});

/** delete by id*/
router.delete("/:id", async (req, res) => {
  try {
    let itemKey = req.params.id || "";
    let itemDeleted = await matchesService.delete(itemKey);
    success(res, itemDeleted, 200);
  } catch (error) {
    console.log(`Error with matches delete service ${error}`);
    errorResponse(req, res, `Error with matches delete service`, 500, error);
  }
});

export default router;
