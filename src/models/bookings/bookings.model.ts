import { nanoid } from "nanoid"

export interface BookingCommentJSON {
    description?: string
    timestamp?: string
    owner?: string
}

export interface BookingJSON {
    key?: string 
    title?: string
    image?: string
    confirmed?: boolean
    date?: string
    time?: string
    owner?: string
    field?: string
    confirmedAction?: boolean
    status?:string /** active, canceled, outdated */
    matchKey?: string
    comments?: Array<BookingCommentJSON>
    timestamp?: string
    training?: string
}

export class Bookings implements BookingJSON {
    key?: string 
    title?: string
    image?: string
    confirmed?: boolean
    date?: string
    time?: string
    owner?: string
    field?: string
    confirmedAction?: boolean
    status?: string 
    matchKey?: string
    comments?: Array<BookingCommentJSON>
    timestamp?: string
    training?: string

    constructor(params: BookingJSON) {
        if (!params) {
            this.key = null
            this.title = null
            this.image = null
            this.confirmed = null
            this.date = null
            this.time = null
            this.confirmedAction = null
            this.status = null
            this.matchKey = null
            this.comments = null
            this.timestamp = null
            this.training = null
            this.field = null
        } else {
            this.key = params.key || nanoid(8)
            this.title = params.title || "-" 
            this.image = params.image || "https://storage.googleapis.com/proudcity/mebanenc/uploads/2021/03/placeholder-image.png"
            this.confirmed = params.confirmed || false
            this.date = params.date || ""
            this.time = params.time || ""
            this.owner = params.owner || null
            this.field = params.field || null
            this.confirmedAction = params.confirmedAction || false 
            this.status = params.status || 'active'
            this.matchKey = params.matchKey || null
            this.comments = params.comments || []
            this.timestamp = params.timestamp || String(Date.now())
            this.training = params.training || null
        }
    } 
}
