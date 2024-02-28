const express = require('express')
import {Request, Response, Router} from 'express'
import passport from 'passport'
import usersService from '../../src/api/services/users/users.service'
import { UserJSON, Users } from '../../src/models/users/users.model'
import {success, errorResponse} from '../api/utils/utils'
import * as passportConfig from '../api/utils/passportConfig'
const router: Router = express.Router()
const bcrypt = require('bcrypt')
import '../api/utils/passportConfig'

/** list users */
router.get('/' /*, passportConfig.isAuthenticated, */ ,async (req, res) => {
    try {
        let items = await usersService.list(req.query)

        let page = Number(req.query.page) || 1
        let paginated = items.slice((page - 1) * 12, page * 12);
        success(res, paginated.reverse(), 200, 12, paginated.length, page, items.length)
    } catch (error) {
        console.log(`Error with users list service --> ${error}`)
        errorResponse(req, res,`Error with users list service`, 500, error)
    }
})

/*** check if username already exists */
router.get('/check/:username', async (req, res) => {
    try {
        let username = req.params.username
        let users =  await usersService.list()
        let exists = users.filter((user:UserJSON) => user.username.toLowerCase() === String(username).toLowerCase()).length > 0
        success(res, exists, 200)
    } catch (error) {
        console.log(`Error with check if username already exists--> ${error}`)
        errorResponse(req, res,`Error with check if username already exists`, 500, error)
    }
})

/** create user */
router.post('/', async (req, res) => {
    try {
        req.body.password = await bcrypt.hash(req.body.password, 10).then(hash => hash);
        let user = new Users(req.body)
        let userCreated = await usersService.create(user)
        success(res, userCreated, 200)
    } catch (error) {
        console.log(`Error with user create service ${error}`)
        errorResponse(req, res,`Error with user create service`, 500, error)
    }
})

/** add push token to user */
router.post('/pushtoken/:id/:pushToken', async (req, res) => { 
    try {   
        let userId = req.params.id
        let pushToken = req.params.pushToken
        let user: UserJSON = await usersService.get(userId)
        user.pushToken = pushToken
        let updatedItem = await usersService.update(user.key, user)
        success(res, updatedItem, 200)
    } catch (error) { 
        console.log('Error adding push token to user', error)
        errorResponse(req, res, 'Error adding push token to user', 500, error)
    }
})

/** revoke push token **/
router.post('/revoke/pushtoken/:id', async (req, res) => { 
    try {   
        let userId = req.params.id
        let user: UserJSON = await usersService.get(userId)
        user.pushToken = null
        let updatedItem = await usersService.update(user.key, user)
        success(res, updatedItem, 200)
    } catch (error) { 
        console.log('Error adding push token to user', error)
        errorResponse(req, res, 'Error adding push token to user', 500, error)
    }
})

/** reset password */
router.put('/reset/psw/:id', async (req, res) => { 
    try {   
        let userId = req.params.id
        let user: UserJSON = await usersService.get(userId)
        user.password = await bcrypt.hash(req.body.password, 10).then(hash => hash)
        let updatedItem = await usersService.update(user.key, user)
        success(res, updatedItem, 200)
    } catch (error) { 
        console.log('Error resetting password', error)
        errorResponse(req, res, 'Error resetting password', 500, error)
    }
})

/** get user by id */
router.get('/:id', async (req, res) => {
    try {
        let userKey = req.params.id || ''
        let user = await usersService.get(userKey)
        success(res, user, 200)
    } catch (error) {
        console.log(`Error with users get service ${error}`)
        errorResponse(req, res,`Error with users get service`, 500, error)
    }
})

/** get user by email */
router.get('/email/:email', async (req, res) => {
    try {
        let userEmail = req.params.email || ''
        let user = await usersService.getByEmail(userEmail)
        if (!user) {
            throw new Error("No user found");
        }
        success(res, user, 200)
    } catch (error) {
        console.log(`Error with users get by email service ${error}`)
        errorResponse(req, res,`Error with users get by email service`, 500, error)
    }
})

/** get user by username */
router.get('/username/:username', async (req, res) => {
    try {
        let username = req.params.username || ''
        let user = await usersService.getByUsername(username)
        success(res, user, 200)
    } catch (error) {
        console.log(`Error with users get service ${error}`)
        errorResponse(req, res,`Error with users get service`, 500, error)
    }
})

/** update user by id*/
router.put('/:id', async (req, res) => {
    try {
        let userKey = req.params.id || ''
        let user = new Users(req.body)
        let userUpdated:UserJSON = await usersService.update(userKey, user)
        success(res, userUpdated, 200)
    } catch (error) {
        console.log(`Error with users update service ${error}`)
        errorResponse(req, res,`Error with users update service`, 500, error)
    }
})

/** update user first time by id*/
router.put('/firsttime/:id', async (req, res) => {
    try {
        let userKey = req.params.id || ''
        let firstTime = req.body.firstTime
        let userUpdated = await usersService.updateFirstTime(userKey, firstTime)
        success(res, userUpdated, 200)
    } catch (error) {
        console.log(`Error with users update first time service ${error}`)
        errorResponse(req, res,`Error with users update first time service`, 500, error)
    }
})

/** update user first time by id*/
router.put('/notificationseen/:id', async (req, res) => {
    try {
        let userKey = req.params.id || ''
        let seen = req.body.notificationSeen
        let userUpdated = await usersService.updateNotificationsSeen(userKey, seen)
        success(res, userUpdated, 200)
    } catch (error) {
        console.log(`Error with users update first time service ${error}`)
        errorResponse(req, res,`Error with users update first time service`, 500, error)
    }
})

/** Add notification to  user*/
router.put('/addnotification/:id', async (req, res) => {
    try {
        let userKey = req.params.id || ''
        let notification = req.body.notification
        let userUpdated = await usersService.addNotification(userKey, notification)
        success(res, userUpdated, 200)
    } catch (error) {
        console.log(`Error with users update in notification service ${error}`)
        errorResponse(req, res,`Error with users notification service`, 500, error)
    }
})

/** delete user by id*/
router.delete('/:id', async (req, res) => {
    try {
        let userKey = req.params.id || ''
        let userDeleted = await usersService.delete(userKey)
        success(res, userDeleted, 200)
    } catch (error) {
        console.log(`Error with users delete service ${error}`)
        errorResponse(req, res,`Error with users delete service`, 500, error)
    }
})

/** user authentication login */
router.post("/login", async (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) throw err;
    if (!user) res.send("No User Exists");
    else {
      req.logIn(user, (err) => {
        if (err) throw err;
        console.log('successful login')
        res.send(req.user);
      });
    }
  })(req, res, next);
});

/** user authentication logout */
router.get("/auth/logout", async (req, res,) => {
    
    //@ts-ignore
    req.logOut()
    res.send('user is logged out')
})

/** check if user is authenticated */
router.get("/auth/isauth", async (req: Request, res: Response) => {
    res.send(req.isAuthenticated());
})

/** confrim user email */
router.put("/confirm/mail/:id", async (req, res) => {
    try {
        let userId = req.params.id
        let user: UserJSON = await usersService.get(userId)
        user.emailConfirmed = true 
        let updatedUser = await usersService.update(user.key, user)
        success(res, updatedUser, 200)        
    } catch (error) {
        console.log('Error on email confirmation', error)
        errorResponse(req, res,`Error on email confirmation`, 500, error)
    }
})

/** ------------- OAUTH ----------------- */

/** google register */ 
router.get("/register/google", passport.authenticate("google", { scope: ["profile", "email"] }));

/** twitter register */ 
router.get("/register/twitter", passport.authenticate("twitter"))

/** google register callback */
router.get("/register/google/callback", passport.authenticate("google", { failureRedirect: "/auth/google" }),
  // Redirect user back to the mobile app using deep linking
  (req, res) => {
    res.redirect(
      //@ts-ignore
      //`exp://192.168.1.10:19000?firstName=${req.user.firstName}/lastName=${req.user.lastName}/email=${req.user.email}/name=${req.user.name}/picture=${req.user.picture}/username=${req.user.username}` // this is the deep link for EXPO and DEV environment
      `tmgrnd://?firstName=${req.user.firstName}/lastName=${req.user.lastName}/email=${req.user.email}/name=${req.user.name}/picture=${req.user.picture}/username=${req.user.username}` // this is the deep link for EXPO and DEV environment
    );
  }
);

/** twitter register callback */
router.get("/register/twitter/callback", passport.authenticate("twitter", { failureRedirect: "/auth/twiter" }),
  // Redirect user back to the mobile app using deep linking
  (req, res) => {
    console.log(req.user)
    res.redirect(
      //@ts-ignore
      //`exp://192.168.1.10:19000?firstName=${req.user.firstName}/lastName=${req.user.lastName}/email=${req.user.email}/name=${req.user.name}/picture=${req.user.picture}/username=${req.user.username}` // this is the deep link for EXPO and DEV environment
    `tmgrnd://?firstName=${req.user.firstName}/lastName=${req.user.lastName}/email=${req.user.email}/name=${req.user.name}/picture=${req.user.picture}/username=${req.user.username}`
    );
  }
);

export default router
