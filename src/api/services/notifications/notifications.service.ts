/***
 * This service can be converted to an npm module for everyone to use it
 */
import Expo from "expo-server-sdk";
import { NotificationMessage } from "./notifications.types";
import { NotificationJSON, Notifications } from "../../../models/notifications/notifications.model";
import { Service } from "../service.interface";
import NotificationsDAO from "../../../dao/notificationsDAO";

export default class NotificationsService implements Service<NotificationJSON> {
  constructor() {}

  send(message: NotificationMessage): Promise<void> {
    try {
      // verify is a valid pushToken
      if (!Expo.isExpoPushToken(message.to)) {
        console.log(`Push token ${message.to} is not a valid Expo push token`);
        throw new Error(
          `Push token ${message.to} is not a valid Expo push token`
        );
      }

      let expo = new Expo();

      // create single message
      let messages = [];
      messages.push(message);

      // send push notification to expo
      let chunks = expo.chunkPushNotifications(messages);
      let tickets = [];
      (async () => {
        for (let chunk of chunks) {
          try {
            let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            tickets.push(...ticketChunk);
          } catch (error) {
            console.error(error);
          }
        }
      })();

      // handle tickets and receipts
      let receiptIds = [];
      for (let ticket of tickets) {
        if (ticket.id) {
          receiptIds.push(ticket.id);
        }
      }
      let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
      (async () => {
        for (let chunk of receiptIdChunks) {
          try {
            let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
            console.log(receipts);
            for (let receiptId in receipts) {
              let { status, details } = receipts[receiptId];
              if (status === "ok") {
                continue;
              } else if (status === "error") {
                console.error(`There was an error sending a notification`);
                if (details) {
                  console.error(`The error code is ${details}`);
                }
              }
            }
          } catch (error) {
            console.error(error);
          }
        }
      })();
    } catch (error) {
      console.log(`couldn't send notification ${error}`);
    }
    return;
  }

  broadcast(body: string, recipients: Array<string>): Promise<void> {
    try {
      let expo = new Expo();
      let messages: Array<NotificationMessage> = [];

      // build messages
      for (let pushToken of recipients) {
        // Check that all your push tokens appear to be valid Expo push tokens
        if (!Expo.isExpoPushToken(pushToken)) {
          console.error(
            `Push token ${pushToken} is not a valid Expo push token`
          );
          continue;
        }
        messages.push({
          to: pushToken,
          body: body,
          sound: "default",
        });
      }

      // send push notification to expo
      let chunks = expo.chunkPushNotifications(messages as any);
      let tickets = [];
      (async () => {
        for (let chunk of chunks) {
          try {
            let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            console.log(ticketChunk);
            tickets.push(...ticketChunk);
          } catch (error) {
            console.error(error);
          }
        }
      })();

      // handle tickets and receipts
      let receiptIds = [];
      for (let ticket of tickets) {
        if (ticket.id) {
          receiptIds.push(ticket.id);
        }
      }
      let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
      (async () => {
        for (let chunk of receiptIdChunks) {
          try {
            let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
            console.log(receipts);
            for (let receiptId in receipts) {
              let { status, details } = receipts[receiptId];
              if (status === "ok") {
                continue;
              } else if (status === "error") {
                console.error(`There was an error sending a notification`);
                if (details) {
                  console.error(`The error code is ${details}`);
                }
              }
            }
          } catch (error) {
            console.error(error);
          }
        }
      })();
    } catch (error) {
      console.log(`couldn't broadcast notification ${error}`);
    }

    return;
  }

  getTotal(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  create(item: NotificationJSON): Promise<void> {
    let newNotification = new Notifications(item)
    return this.save(newNotification);
  }

  async update(key: string, item: NotificationJSON): Promise<any> {
    let itemUpdated = await NotificationsDAO.updateNotification(key, item);
    return this.get(itemUpdated);
  }

  patch?(changes: any): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async save(item: NotificationJSON): Promise<any> {
    const insertResult = await NotificationsDAO.addNotification(item);
    if (!insertResult.success) {
      throw new Error("Can't insert notification to database");
    }
    let itemCreated = await NotificationsDAO.getNotification(item.key);
    return Promise.resolve(itemCreated).catch((error) => console.log(error));
  }

  async get(key: any): Promise<any> {
    let item = await NotificationsDAO.getNotification(key);
    return item;
  }

  async list(query: any) {
    let items = await NotificationsDAO.getNotifications()
    if (query & query.data) {
      let data = items.filter((item: NotificationJSON) => item.title.includes(`${query.data}`))
      return data
    }
    return items
  }

  async delete(key: any): Promise<any> {
    let itemDeleted = await NotificationsDAO.deleteNotification(key)
    return itemDeleted
  }
}
