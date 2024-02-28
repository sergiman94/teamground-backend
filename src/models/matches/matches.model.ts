import { nanoid } from "nanoid"
import { FieldJSON } from "../fields/fields.model"
import { TeamJSON } from "../teams/teams.model"
import { UserJSON } from "../users/users.model"

export interface MatchJSON {
    key?: string
    field?: string
    confirmedPlayers?: Array<String>
    remainingPlayers?: string
    players?: string
    horizontal?: boolean
    active?: boolean
    date?: string
    hour?: string
    name?: string
    cta?: string
    organizer?: string
    highlighted?: boolean
    timestamp?: string
    status?:string /** active, canceled, outdated */
    modality?:string
}

export class Matches implements MatchJSON {
    key?: string
    field?: string
    confirmedPlayers?: Array<String>
    remainingPlayers?: string
    players?: string
    horizontal?: boolean
    active?: boolean
    date?: string
    hour?: string
    name?: string
    cta?: string
    organizer?: string
    highlighted?: boolean
    timestamp?: string
    status?: string
    modality?:string

    constructor(params: MatchJSON) {
        if (!params) {
            this.key = null
            this.field = null
            this.confirmedPlayers = null
            this.remainingPlayers = null
            this.players = null
            this.horizontal = null
            this.active = null
            this.date = null
            this.hour = null
            this.name = null
            this.cta = null
            this.organizer = null
            this.highlighted = null
            this.timestamp = null
            this.status = null
            this.modality = null
        } else {
            this.key = params.key || nanoid(8)
            this.field = params.field || null 
            this.confirmedPlayers = params.confirmedPlayers || []
            this.remainingPlayers = params.remainingPlayers || "-"
            this.players = params.players || "-"
            this.horizontal = params.horizontal || true
            this.active = params.active || true
            this.date = params.date || "-"
            this.hour = params.hour || "-"
            this.name = params.name || "-"
            this.cta = params.cta || "Ver Detalles"
            this.organizer = params.organizer || null
            this.highlighted = params.highlighted || false
            this.timestamp = params.timestamp || Date.now().toString()
            this.status = params.status || 'active'
            this.modality = params.modality || '-'
        }
    }
}

