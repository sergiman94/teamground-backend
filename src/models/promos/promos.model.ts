import { nanoid } from "nanoid"

export interface PromoJSON {
    key?: string
    name?: string
    content?: string
    image?:string
    owner?: string
    show?: boolean
}

export class Promos implements PromoJSON {
    key?: string
    name?: string
    content?: string
    image?:string
    owner?: string
    show?: boolean

    constructor(params: PromoJSON) {
        if (!params) {
            this.key = null
            this.name = null
            this.content = null
            this.image = null
            this.owner = null
            this.show = null
        } else {
            this.key = params.key || nanoid(8)
            this.name = params.name  || '-'
            this.content = params.content || 'No hay contenido para esta promoción'
            this.image = params.image || 'https://images.genial.ly/5a58ab96bfbfc70f6eb4d2c0/6f5ec1dc-d566-42a8-83f9-2dd6b5c26daf.png'
            this.owner = params.owner || '-'
            this.show = params.show || false
        }
    }
}

