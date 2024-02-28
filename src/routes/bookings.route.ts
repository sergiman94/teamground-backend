const express = require('express')
import {Request, Response, Router} from 'express'
import { BookingJSON, Bookings } from '../models/bookings/bookings.model'
import bookingsService from '../../src/api/services/bookings/bookings.service'
import {success, errorResponse} from '../api/utils/utils'
import { TrainingJSON } from '../../src/models/trainings/trainings.model'
import traininsService from '../../src/api/services/trainings/trainings.service'
import { NotificationMessage } from '../../src/api/services/notifications/notifications.types'
import { UserJSON } from '../../src/models/users/users.model'
import usersService from '../../src/api/services/users/users.service'
import { FieldJSON } from '../../src/models/fields/fields.model'
import fieldsService from '../../src/api/services/fields/fields.service'
import NotificationsService from '../../src/api/services/notifications/notifications.service'
import { NotificationJSON } from '../models/notifications/notifications.model'
const notificationsService = new NotificationsService()
const router: Router = express.Router()
const bcrypt = require('bcrypt')

/** list*/
//TODO: change items.reverse() to sort by item timestamp
router.get('/', async (req, res) => {
    try {
        let items = (await bookingsService.list(req.query)).reverse()
        let page = Number(req.query.page) || 1
        let limit = 12
        let paginated = items.slice((page - 1) * limit, page * limit);
        success(res, paginated, 200, limit, paginated.length, page, items.length)
    } catch (error) {
        console.log(`Error with bookings list service --> ${error}`)
        errorResponse(req, res,`Error with bookings list service`, 500, error)
    }
})

/** list all active bookings by user id */
router.get('/active/:id', async (req, res) => {
    try {
        let userId = req.params.id || ''
        let items: Array<BookingJSON> = await bookingsService.list(req.query)
        let userItems: Array<BookingJSON> = items.filter(value => value.owner === userId).reverse()

        let limit = 12
        let page = Number(req.query.page) || 1
        let paginated = userItems.slice((page - 1) * limit, page * limit);

        success(res, paginated, 200, limit, paginated.length, page, userItems.length)
        
    } catch (error) {
        console.log(`Error with list all active bookings by user id --> ${error}` )
        errorResponse(req, res,`Error with list all active bookings by user id`, 500, error)

    }
})

/** list all active bookings by match id */
router.get('/match/:id', async (req, res) => { 
    try {
        let matchKey = req.params.id
        let items: Array<BookingJSON> = await bookingsService.list(req.query)
        let matchBooking: Array<BookingJSON> = items.filter(value => value.matchKey && value.matchKey === matchKey).reverse()
        
        let limit = 12
        let page = Number(req.query.page) || 1
        let paginated = matchBooking.slice((page - 1) * limit, page * limit);

        success(res, paginated, 200, limit, paginated.length, page, matchBooking.length)
    } catch (error) {
        console.log(`Error getting booking by match id ${error}`)
        errorResponse(req, res, `Error getting booking by match id`, 500, error)
    }
})

/** list all active bookings by field id */
router.get('/field/:id', async (req, res) => {
    try {
        let fieldId = req.params.id
        let items: Array<BookingJSON> = (await bookingsService.list()).reverse()
        let fieldItems: Array<BookingJSON> = items.filter(value => value.field === fieldId)
        
        let limit = 12
        let page = Number(req.query.page) || 1
        let paginated = fieldItems.slice((page - 1) * limit, page * limit);

        success(res, paginated, 200, limit, paginated.length, page, fieldItems.length)

    } catch (error) {
        console.log(`Error getting bookings by field id ${error}`)
        errorResponse(req, res,`Error getting bookings by field id` , 500, error)
    }
})

/* confirm or reject booking */
router.put('/confirmation/:id', async (req, res) => {
    try {
      let bookingId = req.params.id;
      let value = req.body.confirmation;
      let booking: BookingJSON = await bookingsService.get(bookingId);
      booking.confirmed = value;
      booking.confirmedAction = true;
      let bookingUpdated = await bookingsService.update(bookingId, booking);
      // Once booking confirmed add the training to the source team
      if (booking.training) {
        let training: TrainingJSON = await traininsService.get(
          booking.training
        );
        training.confirmed = value;
        training.confirmedAction = true;
        await traininsService.update(training.key, training);
      }
      // send push notification to user
      let messageBody = "";
      let bookingOwner: UserJSON = await usersService.get(booking.owner);
      if (bookingOwner.pushToken) {
        let bookingField: FieldJSON = await fieldsService.get(booking.field);
        messageBody = `Tu reserva en ${bookingField.field} ha sido ${
          value === true ? "confirmada" : "rechazada"
        }`;
        let message: NotificationMessage = {
          to: bookingOwner.pushToken,
          body: messageBody,
          sound: "default",
        };
        await notificationsService.send(message);
      }
      // save notification in DB
      let notification: NotificationJSON = {
        title: messageBody,
        owner: bookingOwner.key,
        iconName: value === true ? "rocket" : "minus"
      };
      await notificationsService.create(notification);

      success(res, bookingUpdated, 200);
    } catch (error) {
        console.log(`Error executing booking confirmation ${error}`)
        errorResponse(req, res, `Error executing booking confirmation`, 500, error)
    }
})

/** add comment to booking */
router.put('/add/comment/:id', async (req, res) => {
    try {
        let bookingId = req.params.id
        let newComment = req.body.comment

        // add a comment to booking document
        let booking: BookingJSON = await bookingsService.get(bookingId)
        let newComments = [...booking.comments, newComment]
        booking.comments = newComments
        let bookingUpdated = await bookingsService.update(bookingId, booking)
        success(res, bookingUpdated, 200)

    } catch (error) {
        console.log(`Error adding booking comment ${error}`)
        errorResponse(req, res, `Error adding booking comment`, 500, error)
    }
})

/** create */
router.post('/', async (req, res) => {
    try {
        let item = new Bookings(req.body)
        let itemCreated = await bookingsService.create(item)
        success(res, itemCreated, 200)
    } catch (error) {
        console.log(`Error with team create service ${error}`)
        errorResponse(req, res,`Error with team create service`, 500, error)
    }
})

/** get booking by matchKey */
router.get('/match/:id', async (req, res) => {
    try {
        let matchKey = req.params.id || ''
        let item: BookingJSON = await bookingsService.getByMatchKey(matchKey)
        item.comments.reverse()
        success(res, item, 200)
    } catch (error) {
        console.log(`Error with bookings get service ${error}`)
        errorResponse(req, res,`Error with bookings get service`, 500, error)
    }
})

/** get booking by trainingKey */
router.get('/training/:id', async (req, res) => {
    try {
        let trainingKey = req.params.id || ''
        let item: BookingJSON = await bookingsService.getByTrainingKey(trainingKey)
        item.comments.reverse()
        success(res, item, 200)
    } catch (error) {
        console.log(`Error with bookings get service ${error}`)
        errorResponse(req, res,`Error with bookings get service`, 500, error)
    }
})

/** get by id */
router.get('/:id', async (req, res) => {
    try {
        let itemKey = req.params.id || ''
        let item: BookingJSON = await bookingsService.get(itemKey)
        item.comments.reverse()
        success(res, item, 200)
    } catch (error) {
        console.log(`Error with bookings get service ${error}`)
        errorResponse(req, res,`Error with bookings get service`, 500, error)
    }
})

/** update by id*/
router.put('/:id', async (req, res) => {
    try {
        let itemKey = req.params.id || ''
        let item = new Bookings(req.body)
        let itemUpdated = await bookingsService.update(itemKey, item)
        success(res, itemUpdated, 200)
    } catch (error) {
        console.log(`Error with bookings update service ${error}`)
        errorResponse(req, res,`Error with bookings update service`, 500, error)
    }
})

/** delete by id*/
router.delete('/:id', async (req, res) => {
    try {
        let itemKey = req.params.id || ''
        let itemDeleted = await bookingsService.delete(itemKey)
        success(res, itemDeleted, 200)
    } catch (error) {
        console.log(`Error with bookings delete service ${error}`)
        errorResponse(req, res,`Error with bookings delete service`, 500, error)
    }
})

export default router
