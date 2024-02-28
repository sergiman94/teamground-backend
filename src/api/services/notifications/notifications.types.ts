export interface NotificationMessage {
    to: string // user pushToken,
    sound?: string |  "default",
    body: string,
    data?: Object | {}
}