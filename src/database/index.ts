/**
 * This file binds MongoDB remote collections into the monolith 
 * 
 */

import { MongoClient } from "mongodb";
import PostsDAO from "../dao/postsDAO";
import BookingsDAO from "../dao/bookingsDAO";
import FieldsDAO from "../dao/fieldsDAO";
import MatchesDAO from "../dao/matchesDAO";
import TeamsDAO from "../dao/teamsDAO";
import UsersDAO from "../dao/usersDAO";
import PromosDAO from "../dao/promosDAO";
import TrainingsDAO from "../dao/TrainingsDAO";
import NotificationsDAO from "../dao/notificationsDAO";

const log = require("emoji-logger");

var figlet = require("figlet");

export default async function connect(url) {
  let params = {
    useNewUrlParser: true,
    poolSize: 50,
    wtimeout: 2500,
    useUnifiedTopology: true,
  };

  await MongoClient.connect(url, params)
    .then(async (connection: MongoClient) => {
      figlet("TeamGround", function (err, data) {
        if (err) {
          console.log("Something went wrong with figlet...");
          console.dir(err);
          return;
        }
        console.log(data);
      });

      /** init and register DAO Connections */
      await UsersDAO.injectDB(connection)
        .then((r) => log(" Users DAO connected ", "success"))
        .catch((error) => log(error, "error"));
      await TeamsDAO.injectDB(connection)
        .then((r) => log(" Team DAO connected ", "success"))
        .catch((error) => log(error, "error"));
      await MatchesDAO.injectDB(connection)
        .then((r) => log(" Matches DAO connected ", "success"))
        .catch((error) => log(error, "error"));
      await FieldsDAO.injectDB(connection)
        .then((r) => log(" Fields DAO connected ", "success"))
        .catch((error) => log(error, "error"));
      await BookingsDAO.injectDB(connection)
        .then((r) => log(" Bookings DAO connected ", "success"))
        .catch((error) => log(error, "error"));
      await PostsDAO.injectDB(connection)
        .then((r) => log(" Posts DAO connected ", "success"))
        .catch((error) => log(error, "error"));
      await PromosDAO.injectDB(connection)
        .then((r) => log(" Promos DAO connected ", "success"))
        .catch((error) => log(error, "error"));
      await TrainingsDAO.injectDB(connection)
        .then((r) => log(" Trainings DAO connected ", "success"))
        .catch((error) => log(error, "error"));
      await NotificationsDAO.injectDB(connection)
        .then((r) => log(" Notifications DAO connected ", "success"))
        .catch((error) => log(error, "error"));
    })
    .catch((err) => log(`ERROR CONNECTING TO DB ${err}`, "error"));
}
