const express = require("express");
import { Request, Response, Router } from "express";
import usersService from "../../src/api/services/users/users.service";
import { UserJSON } from "src/models/users/users.model";
import teamsService from "../../src/api/services/teams/teams.service";
import { success, errorResponse } from "../api/utils/utils";
import { TeamJSON, Teams } from "../models/teams/teams.model";
import NotificationsService from "../api/services/notifications/notifications.service";
import { NotificationMessage } from "../api/services/notifications/notifications.types";
import { NotificationJSON } from "src/models/notifications/notifications.model";
const router: Router = express.Router();
const notificationsService = new NotificationsService();

/** list teams */
router.get("/", async (req, res) => {
  try {
    let items = await teamsService.list(req.query);
    let limit = 12;
    let page = Number(req.query.page) || 1;
    let paginated = items.slice((page - 1) * limit, page * limit);
    success(res, paginated, 200, limit, paginated.length, page, items.length);
  } catch (error) {
    console.log(`Error with teams list service --> ${error}`);
    errorResponse(req, res, `Error with teams list service`, 500, error);
  }
});

/** create team */
router.post("/", async (req, res) => {
  try {
    let team = new Teams(req.body);
    team.members = [team.coach];
    let itemCreated = await teamsService.create(team);

    // add new team to user
    let teamCoach: UserJSON = await usersService.get(team.coach);
    teamCoach.team = team.key;
    await usersService.update(teamCoach.key, teamCoach);
    success(res, itemCreated, 200);
  } catch (error) {
    console.log(`Error with team create service ${error}`);
    errorResponse(req, res, `Error with team create service`, 500, error);
  }
});

/** get team by id */
router.get("/:id", async (req, res) => {
  try {
    let itemKey = req.params.id || "";
    let item = await teamsService.get(itemKey);
    success(res, item, 200);
  } catch (error) {
    console.log(`Error with teams get service ${error}`);
    errorResponse(req, res, `Error with teams get service`, 500, error);
  }
});

/** update team by id*/
router.put("/:id", async (req, res) => {
  try {
    let itemKey = req.params.id || "";
    let item = new Teams(req.body);
    let itemUpdated = await teamsService.update(itemKey, item);
    success(res, itemUpdated, 200);
  } catch (error) {
    console.log(`Error with teams update service ${error}`);
    errorResponse(req, res, `Error with teams update service`, 500, error);
  }
});

/** new user join a team */
router.put("/join/:teamid/:userid", async (req, res) => {
  try {
    let teamKey = req.params.teamid || "";
    let newUserKey = req.params.userid || "";
    let team: TeamJSON = await teamsService.get(teamKey);
    team.members = [...team.members, newUserKey];
    let teamUpdated = await teamsService.update(teamKey, team);
    let newUser: UserJSON = await usersService.get(newUserKey);
    let notificationBody = `${newUser.displayName} se ha unido a tu equipo`;

    // send push notification to team coach
    let coach: UserJSON = await usersService.get(team.coach);
    if (coach.pushToken) {
      let message: NotificationMessage = {
        to: coach.pushToken,
        body: notificationBody,
        sound: "default",
      };
      await notificationsService.send(message);

      // save notification in DB
      let notification: NotificationJSON = {
        title: message.body,
        owner: coach.key,
        iconName: "rocket",
      };
      await notificationsService.create(notification);
    }

    // send push notification to all members of the team
    let recipients = [];
    let recipientsKeys = [];
    let saves = [];
    for (let i = 0; i < team.members.length; i++) {
      const teamPlayerKey = team.members[i];
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
    // send response
    success(res, teamUpdated, 200);
  } catch (error) {
    console.log(`Error with joining team --> ${error}`);
    errorResponse(req, res, `Error with joining team `, 500, error);
  }
});

/** leave team */
router.put("/leave/:teamid/:userid", async (req, res) => {
  try {
    let teamKey = req.params.teamid || "";
    let currentUserKey = req.params.userid || "";

    let team: TeamJSON = await teamsService.get(teamKey);
    team.members = team.members.filter((member) => member !== currentUserKey);
    let teamUpdated = await teamsService.update(teamKey, team);

    success(res, teamUpdated, 200);
  } catch (error) {
    console.log(`Error with joining team --> ${error}`);
    errorResponse(req, res, `Error with joining team `, 500, error);
  }
});

/** delete team by id*/
router.delete("/:id", async (req, res) => {
  try {
    let itemKey = req.params.id || "";
    let itemDeleted = await teamsService.delete(itemKey);
    success(res, itemDeleted, 200);
  } catch (error) {
    console.log(`Error with teams delete service ${error}`);
    errorResponse(req, res, `Error with teams delete service`, 500, error);
  }
});

export default router;
