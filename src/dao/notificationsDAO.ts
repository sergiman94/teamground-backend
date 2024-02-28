import {MongoClient, Collection} from "mongodb"
import { NotificationJSON } from "../models/notifications/notifications.model"

let notifications: Collection<any>

export default class NotificationsDAO {

    /** injected mongo db collection connection from server index */
    static async injectDB (conn: MongoClient) {
        try {
            notifications = await conn.db(process.env.MAIN_DB).collection("notifications")
        } catch (error) {
            console.log(`There was a problem connection to notificationsDAO ${error}`)
        }
    }

    static async addNotification(fieldData: NotificationJSON) {
        try {
            await notifications.insertOne(fieldData)
            return {success: true, data: fieldData}
        } catch (error) {
            if (String(error).startsWith("MongoError: E11000 duplicate key error")) {
                return { error: "A notification with the given data already exists." }
            }
            console.error(`Error occurred while adding new notification, ${error}.`)
            return { error: error }
        }
    }

    static async getNotification(notificationKey) {
        try {
            let notification = await notifications.findOne({key: notificationKey})
            return notification
        } catch (error) {
            console.log(`Error getting notification --> ${error}`)
            return {error:`Error getting notification --> ${error}`}
        }
    }

    static async getNotifications() {
        try {
            let notificationList = await notifications.find().toArray()
            return notificationList
        } catch (error) {
            console.log(`Error listing notifications --> ${error}`)
            let notificationList = []
            return notificationList
        }
    }

    static async updateNotification (notificationKey, notification: NotificationJSON) {
        try {
            const updateResponse =  await notifications.updateOne(
                {key: notificationKey},
                {$set: {
                    read: notification.read
                }} 
            )
            if (updateResponse.matchedCount === 0) {
                throw new Error("Couldn't find a match for this credential");
            }
            return notificationKey  
        } catch (error) {
            console.log('error updating notification', error)
            return {error: `Error updating notification --> ${error}`}
        }
    }

    static async deleteNotification (notificationKey) {
        try {
            await notifications.deleteOne({key: notificationKey})

            if (! (await this.getNotification(notificationKey))) {
                return {success: `notification ${notificationKey} successfully deleted`}
            } else {
                return {error: `Can not delete notification ${notificationKey}`}
            }
        } catch (error) {
            console.log(`Error deleting notification --> ${error}`)
            return {error: `Can not delete notification ${notificationKey} error ${error}`}
        }
    }

}