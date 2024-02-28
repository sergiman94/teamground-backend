import { Router } from "express";
import usersService from "../../src/api/services/users/users.service";
import { UserJSON } from "../../src/models/users/users.model";
import mailerSend from "../../src/api/services/mailerSend/mailerSend.service";
import { errorResponse, success } from "../../src/api/utils/utils";
const express = require('express')
const router: Router = express.Router()

router.post('/test', async (req, res) => { 
    try {
        let mailSent = await mailerSend.sendMail()
        success(res, mailSent, 200)
    } catch (error) {
        console.log('Error sending test email', error)
        errorResponse(req, res, 'Error sending test email', 500, error)
    }
})

router.post("/confirmation", async (req, res) => {
  try {
    let userId = req.body.userId;
    let user: UserJSON = await usersService.get(userId);
    let mailSent = await mailerSend.sendConfirmationEmail(user);
    success(res, mailSent, 200);
  } catch (error) {
    console.log("Error sending confirmation email", error);
    errorResponse(req, res, "Error sending confirmation email", 500, error);
  }
});


router.post("/reset", async (req, res) => {
  try {
    let userId = req.body.userId;
    let user: UserJSON = await usersService.get(userId);
    let mailSent = await mailerSend.sendResetPasswordEmail(user);
    success(res, mailSent, 200);
  } catch (error) {
    console.log("Error sending reset email", error);
    errorResponse(req, res, "Error sending reset email", 500, error);
  }
});

router.post("/signup", async (req, res) => {
  try {
    let userId = req.body.userId;
    let user: UserJSON = await usersService.get(userId);
    let mailSent = await mailerSend.sendSignUpEmail(user);
    success(res, mailSent, 200);
  } catch (error) {
    console.log("Error sending signup email", error);
    errorResponse(req, res, "Error sending signup email", 500, error);
  }
});

export default router