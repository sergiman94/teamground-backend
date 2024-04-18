import { nanoid } from "nanoid"

export interface PostCommentJSON {
    name?: string,
    userImage?: string
    content?: string
    username?: string
    timestamp?: string
    owner?: string
}

export interface PostJSON {
    key?: string
    description?: string
    name?: string 
    userImage?: string
    image?: string
    video?: string
    likes?:Array<String>
    comments?:Array<PostCommentJSON>
    timestamp?: string
    match?: string
    type?: string
    matchKey?: string
    owner?: string
    username?: string
}

export class Posts implements PostJSON {
    key ?: string
    description?: string
    name?: string 
    userImage?: string
    image ?: string
    video ?: string
    likes?:Array<String>
    comments?:Array<{name?:string, userImage?:string, content?: string}>
    timestamp?: string;
    match?: string
    type?: string
    matchKey?: string
    owner?: string
    username?: string

    constructor(params?: PostJSON) {
        if (!params) {
            this.key = null
            this.description = null
            this.name = null
            this.userImage = null
            this.image = null
            this.video = null
            this.likes = null
            this.comments = null
            this.type = null
            this.match = null
            this.matchKey = null
            this.timestamp = null
            this.owner = null
            this.username = null
        } else {
            this.key = params.key || nanoid(8)
            this.description = params.description || ''
            this.name = params.name || ''
            this.userImage = params.userImage || 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png'
            this.image = params.image !== '' ? params.image : null 
            this.video = params.video || null
            this.likes = params.likes || []
            this.comments = params.comments || []
            this.timestamp = params.timestamp || String(Date.now())
            this.type = params.type || 'regular'
            this.match = params.match || null
            this.matchKey = params.matchKey || null
            this.owner = params.owner || '-'
            this.username = params.username || params.name
        }
    } 



}
