import {MongoClient, Collection} from "mongodb"
import { FieldJSON } from "src/models/fields/fields.model"
import { MatchJSON } from "src/models/matches/matches.model"


let fields: Collection<any>

export default class FieldsDAO {

    /** injected mongo db collection connection from server index */
    static async injectDB (conn: MongoClient) {
        try {
            fields = await conn.db(process.env.MAIN_DB).collection("fields")
        } catch (error) {
            console.log(`There was a problem connection to FieldsDAO ${error}`)
        }
    }

    static async addField(fieldData: FieldJSON) {
        try {
            await fields.insertOne(fieldData)
            return {success: true, data: fieldData}
        } catch (error) {
            if (String(error).startsWith("MongoError: E11000 duplicate key error")) {
                return { error: "A Field with the given data already exists." }
            }
            console.error(`Error occurred while adding new field, ${error}.`)
            return { error: error }
        }
    }

    static async getField(fieldKey) {
        try {
            let field = await fields.findOne({key: fieldKey})
            return field
        } catch (error) {
            console.log(`Error getting field --> ${error}`)
            return {error:`Error getting field --> ${error}`}
        }
    }

    static async getFields() {
        try {
            let fieldsList = await fields.find().toArray()
            return fieldsList
        } catch (error) {
            console.log(`Error listing fields --> ${error}`)
            let fieldsList = []
            return fieldsList
        }
    }

    static async updateField (fieldKey, field: FieldJSON) {
        try {
            const updateResponse =  await fields.updateOne(
                {key: fieldKey},
                {$set: {
                    // Set here necesary changes
                    field: field.field,
                    highlighted: field.highlighted,
                    address: field.address,
                    description: field.description,
                    fullDescription: field.fullDescription,
                    matches: field.matches,
                    comments: field.comments,
                    points: field.points,
                    rankedUsers: field.rankedUsers,
                    fieldImages: field.fieldImages,
                    image: field.image
                }} 
            )

            if (updateResponse.matchedCount === 0) {
                throw new Error("Couldn't find a match for this credential");
            }

            return fieldKey
                
        } catch (error) {
            console.log('error updating field', error)
            return {error: `Error updating field --> ${error}`}
        }
    }

    static async addMatchField (fieldKey, matches: Array<string>) {
        try {

            const updateResponse =  await fields.updateOne(
                {key: fieldKey},
                {$set: {
                    // Set here necesary changes
                    matches: matches
                }} 
            )

            if (updateResponse.matchedCount === 0) {
                throw new Error("Couldn't find a match for this credential");
            }

            return fieldKey
                
        } catch (error) {
            console.log('error adding match field', error)
            return {error: `Error adding match field --> ${error}`}
        }
    }

    static async deleteField (fieldKey) {
        try {
            await fields.deleteOne({key: fieldKey})

            if (! (await this.getField(fieldKey))) {
                return {success: `field ${fieldKey} successfully deleted`}
            } else {
                return {error: `Can not delete field ${fieldKey}`}
            }
        } catch (error) {
            console.log(`Error deleting field --> ${error}`)
            return {error: `Can not delete field ${fieldKey} error ${error}`}
        }
    }

}