import {MongoClient, Collection} from "mongodb"
import { BookingJSON } from "src/models/bookings/bookings.model"

let bookings: Collection<any>

export default class BookingsDAO {

    /** injected mongo db collection connection from server index */
    static async injectDB (conn: MongoClient) {
        try {
            bookings = await conn.db(process.env.MAIN_DB).collection("bookings")
        } catch (error) {
            console.log(`There was a problem connection to bookingsDAO ${error}`)
        }
    }

    static async addBooking(fieldData: BookingJSON) {
        try {
            await bookings.insertOne(fieldData)
            return {success: true, data: fieldData}
        } catch (error) {
            if (String(error).startsWith("MongoError: E11000 duplicate key error")) {
                return { error: "A Booking with the given data already exists." }
            }
            console.error(`Error occurred while adding new booking, ${error}.`)
            return { error: error }
        }
    }

    static async getBooking(bookingKey) {
        try {
            let booking = await bookings.findOne({key: bookingKey})
            return booking
        } catch (error) {
            console.log(`Error getting booking --> ${error}`)
            return {error:`Error getting booking --> ${error}`}
        }
    }

    static async getBookingByMatchKey(bookingMatchKey) {
        try {
            let booking = await bookings.findOne({matchKey: bookingMatchKey})
            return booking
        } catch (error) {
            console.log(`Error getting booking --> ${error}`)
            return {error:`Error getting booking --> ${error}`}
        }
    }

    static async getBookingByTrainingKey(bookingMatchKey) {
        try {
            let booking = await bookings.findOne({training: bookingMatchKey})
            return booking
        } catch (error) {
            console.log(`Error getting booking --> ${error}`)
            return {error:`Error getting booking --> ${error}`}
        }
    }

    static async getBookings() {
        try {
            let bookingsList = await bookings.find().toArray()
            return bookingsList
        } catch (error) {
            console.log(`Error listing bookings --> ${error}`)
            let bookingsList = []
            return bookingsList
        }
    }

    static async updateBooking (bookingKey, booking: BookingJSON) {
        try {
            const updateResponse =  await bookings.updateOne(
                {key: bookingKey},
                {$set: {
                    // Set here necesary changes
                    confirmedAction: booking.confirmedAction, 
                    confirmed: booking.confirmed,
                    status: booking.status,
                    comments: booking.comments,
                    field: booking.field
                }} 
            )

            if (updateResponse.matchedCount === 0) {
                throw new Error("Couldn't find a match for this credential");
            }

            return bookingKey
                
        } catch (error) {
            console.log('error updating booking', error)
            return {error: `Error updating booking --> ${error}`}
        }
    }

    static async updateBookingField (bookingKey, booking: BookingJSON) {
        try {
            const updateResponse = await bookings.updateOne(
                {key: bookingKey},
                {$set: {
                    // Set here necesary changes
                    field: booking.field
                }} 
            )

            if (updateResponse.matchedCount === 0) {
                throw new Error("Couldn't find a match for this credential");
            }

            return bookingKey
                
        } catch (error) {
            console.log('error updating booking', error)
            return {error: `Error updating booking --> ${error}`}
        }
    }

    static async deleteBooking (bookingKey) {
        try {
            await bookings.deleteOne({key: bookingKey})

            if (! (await this.getBooking(bookingKey))) {
                return {success: `booking ${bookingKey} successfully deleted`}
            } else {
                return {error: `Can not delete booking ${bookingKey}`}
            }
        } catch (error) {
            console.log(`Error deleting booking --> ${error}`)
            return {error: `Can not delete booking ${bookingKey} error ${error}`}
        }
    }

}