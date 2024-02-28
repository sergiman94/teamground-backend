import { nanoid } from "nanoid"

export interface FieldCommentJSON {
    description?: string
    timestamp?: string
    owner?: string
}

export interface FieldJSON {
    key?: string,
    field?: string,
    address?: string
    description?: string,
    fullDescription?: string
    image?: string
    cta?: string
    horizontal?: boolean
    location?: {
        zone?: string,
        city?: string, 
        state?: string,
        lat?: string,
        lon?: string,
    },
    numberOfFields?: string,
    schedule?: {
        free?:Array<{date?: string, weekDay?: string, timeStart?: string, timeEnd?: string}>, 
        busy?:Array<{date?: string, weekDay?: string, timeStart?: string, timeEnd?: string}>
    }
    matches?: Array<string>
    highlighted?: boolean
    points?: Array<Number>
    rankedUsers?: string
    comments?: Array<FieldCommentJSON>
    fieldImages?: Array<String>
    lat?: string
    lng?: string
}


export class Fields implements FieldJSON {
    key?: string
    field?: string 
    address?: string
    description?: string
    fullDescription?: string
    image?: string
    cta?: string
    horizontal?: boolean
    location?: {
        zone?: string
        city?: string 
        state?: string
        lat?: string
        lon?: string
    }
    numberOfFields?: string
    schedule?: {
        free?:Array<{date?: string, weekDay?: string, timeStart?: string, timeEnd?: string}>, 
        busy?:Array<{date?: string, weekDay?: string, timeStart?: string, timeEnd?: string}>
    }
    matches?: string[]
    highlighted?: boolean
    points?: Array<Number>
    rankedUsers?: string
    comments?: Array<FieldCommentJSON>
    fieldImages?: Array<String>
    lat?: string
    lng?: string

    constructor(params?: FieldJSON) {
        if (!params) {
            this.key = null
            this.field = null
            this.address = null
            this.description = null
            this.fullDescription = null
            this.image = null
            this.cta = null
            this.horizontal = null
            this.location = null
            this.numberOfFields = null
            this.schedule = null
            this.matches = null
            this.highlighted = null
            this.points = null
            this.rankedUsers = null
            this.comments = null
            this.fieldImages = null
            this.lat = null
            this.lng = null
        } else {
            this.key = params.key || nanoid(18)
            this.field = params.field || "-"
            this.address = params.address || "-"
            this.description = params.description || "-"
            this.fullDescription = params.fullDescription || "-"
            this.image = params.image || "https://apexprd.org/wp-content/uploads/2017/10/placeholder-activity-adult-sports-soccer.jpg"
            this.cta = params.cta || "Ver descripcion del lugar"
            this.horizontal = params.horizontal || true
            this.location = params.location || null
            this.numberOfFields = params.numberOfFields
            this.schedule = params.schedule || null
            this.matches = params.matches || []
            this.highlighted = params.highlighted || false
            this.points = params.points || []
            this.rankedUsers = params.rankedUsers || '0'
            this.comments = params.comments || []
            this.fieldImages = params.fieldImages || []
            this.lat = params.lat || "-"
            this.lng = params.lng || "-"
        }
    }
}

