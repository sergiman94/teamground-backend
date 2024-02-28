import { nanoid } from "nanoid"
import { encryptPassword } from "../../api/utils/utils"
import * as bcrypt from 'bcrypt'
import { MatchJSON } from "../matches/matches.model"
import { TeamJSON } from "../teams/teams.model"

export interface UserJSON {
    key?: string,
    username?: string,
    password?: any,
    email?: string
    firstTime?: boolean
    notifications?: Array<{title?:string, time?: string, body?: string}>,
    notificationSeen?: boolean,
    description?: string,
    image?: string,
    score?: string
    age?: string
    cityAndStatelocation?: string
    playedMatches?: string
    cta?: string
    following?: Array<UserJSON>
    followers?: Array<UserJSON>
    preferedPosition?: string 
    highlighted?: boolean
    matches?: Array<string>
    role?: string
    field?: string
    displayName?: string
    team?: string
    emailConfirmed?: boolean
    pushToken?: string
}

export class Users implements UserJSON {
    key?: string
    username?: string
    password?: any
    email?: string
    firstTime?: boolean
    notifications?: { title?: string; time?: string; body?: string; }[];
    notificationSeen?: boolean;
    description?: string
    image?: string
    score?: string
    age?: string
    cityAndStatelocation?: string
    playedMatches?: string
    cta?: string
    following?: Array<UserJSON>
    followers?: Array<UserJSON>
    highlighted?: boolean
    matches?: Array<string>
    preferedPosition?: string 
    role?: string
    field?: string
    displayName?: string
    team?: string
    emailConfirmed?: boolean
    pushToken?: string

    constructor(params?: UserJSON) {
        if (!params) {
            this.key = null
            this.username = null
            this.password = null
            this.email = null
            this.firstTime = null
            this.notifications = null
            this.notificationSeen = null
            this.description = null
            this.image = null
            this.score = null
            this.age = null
            this.cityAndStatelocation = null
            this.playedMatches = null
            this.cta = null
            this.following = null
            this.followers = null 
            this.highlighted = null
            this.matches = null
            this.preferedPosition = null 
            this.role = null
            this.field = null
            this.displayName = null
            this.team = null
            this.emailConfirmed = null
            this.pushToken = null
        } else {
            this.key = params.key || nanoid(18)
            this.username = params.username
            this.password = params.password
            this.email = params.email || ""
            this.firstTime = params.firstTime || true
            this.notifications = params.notifications || []
            this.notificationSeen = params.notificationSeen || true
            this.description = params.description || "-"
            this.image = params.image || "https://agcnwo.com/wp-content/uploads/2020/09/avatar-placeholder.png"
            this.score = params.score || "0"
            this.age = params.score || "0"
            this.cityAndStatelocation = params.cityAndStatelocation || "-"
            this.playedMatches = params.playedMatches || "0"
            this.cta = params.playedMatches || "Ver Detalles"
            this.followers = params.followers || []
            this.following = params.following || []
            this.highlighted = params.highlighted || false
            this.matches = params.matches || []
            this.preferedPosition = params.preferedPosition || '-'
            this.role = params.role || 'player'
            this.field = params.field || '-'
            this.displayName = params.displayName || params.username
            this.team = params.team || null
            this.emailConfirmed = params.emailConfirmed || false
            this.pushToken = params.pushToken || null
        }
    }

   
}