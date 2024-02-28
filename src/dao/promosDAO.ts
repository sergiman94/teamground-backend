import {MongoClient, Collection} from "mongodb"
import { PromoJSON } from "src/models/promos/promos.model"

let promos: Collection<any>

export default class PromosDAO {

    /** injected mongo db collection connection from server index */
    static async injectDB (conn: MongoClient) {
        try {
            promos = await conn.db(process.env.MAIN_DB).collection("promos")
        } catch (error) {
            console.log(`There was a problem connection to promossDAO ${error}`)
        }
    }

    static async addPromo(promoData: PromoJSON) {
        try {
            await promos.insertOne(promoData)
            return {success: true, data: promoData}
        } catch (error) {
            if (String(error).startsWith("MongoError: E11000 duplicate key error")) {
                return { error: "A Promo with the given data already exists." }
            }
            console.error(`Error occurred while adding new promo, ${error}.`)
            return { error: error }
        }
    }

    static async getPromo(promoKey) {
        try {
            let promo = await promos.findOne({key: promoKey})
            return promo
        } catch (error) {
            console.log(`Error getting promo --> ${error}`)
            return {error:`Error getting promo --> ${error}`}
        }
    }

    static async getPromos() {
        try {
            let promoList = await promos.find().toArray()
            return promoList
        } catch (error) {
            console.log(`Error listing promos --> ${error}`)
            let promoList = []
            return promoList
        }
    }

    static async updatePromo (promoKey, promo: PromoJSON) {
        try {
            const updateResponse =  await promos.updateOne(
                {key: promoKey},
                {$set: {
                    // Set here necesary changes
                    name: promo.name
                }} 
            )

            if (updateResponse.matchedCount === 0) {
                throw new Error("Couldn't find a match for this credential");
            }

            return promoKey
                
        } catch (error) {
            console.log('error updating promo', error)
            return {error: `Error updating promo --> ${error}`}
        }
    }

    static async deletePromo (promoKey) {
        try {
            await promos.deleteOne({key: promoKey})

            if (! (await this.getPromo(promoKey))) {
                return {success: `promo ${promoKey} successfully deleted`}
            } else {
                return {error: `Can not delete promo ${promoKey}`}
            }
        } catch (error) {
            console.log(`Error deleting promo --> ${error}`)
            return {error: `Can not delete promo ${promoKey} error ${error}`}
        }
    }

}