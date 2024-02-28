import {MongoClient, Collection} from "mongodb"
import { TeamJSON } from "src/models/teams/teams.model"

let teams: Collection<any>

export default class TeamsDAO {

    /** injected mongo db collection connection from server index */
    static async injectDB (conn: MongoClient) {
        try {
            teams = await conn.db(process.env.MAIN_DB).collection("teams")
        } catch (error) {
            console.log(`There was a problem connection to TeamsDAO ${error}`)
        }
    }

    static async addTeam(teamData: TeamJSON) {
        try {
            await teams.insertOne(teamData)
            return {success: true, data: teamData}
        } catch (error) {
            if (String(error).startsWith("MongoError: E11000 duplicate key error")) {
                return { error: "A Team with the given data already exists." }
            }
            console.error(`Error occurred while adding new team, ${error}.`)
            return { error: error }
        }
    }

    static async getTeam(teamKey) {
        try {
            let team = await teams.findOne({key: teamKey})
            return team
        } catch (error) {
            console.log(`Error getting team --> ${error}`)
            return {error:`Error getting team --> ${error}`}
        }
    }

    static async getTeams() {
        try {
            let teamsList = await teams.find().toArray()
            return teamsList
        } catch (error) {
            console.log(`Error listing teams --> ${error}`)
            let teamsList = []
            return teamsList
        }
    }

    static async updateTeam (teamKey, team: TeamJSON) {
        try {
            const updateResponse =  await teams.updateOne(
                {key: teamKey},
                {$set: {
                    // Set here necesary changes
                    name: team.name,
                    image: team.image,
                    address: team.address,
                    location: team.location,
                    description: team.description,
                    media: team.media,
                    trainings: team.trainings,
                    members: team.members
                }} 
            )

            if (updateResponse.matchedCount === 0) {
                throw new Error("Couldn't find a match for this credential");
            }

            return teamKey
                
        } catch (error) {
            console.log('error updating team', error)
            return {error: `Error updating team --> ${error}`}
        }
    }


    static async deleteTeam (teamKey) {
        try {
            await teams.deleteOne({key: teamKey})

            if (! (await this.getTeam(teamKey))) {
                return {success: `team ${teamKey} successfully deleted`}
            } else {
                return {error: `Can not delete team ${teamKey}`}
            }
        } catch (error) {
            console.log(`Error deleting team --> ${error}`)
            return {error: `Can not delete team ${teamKey} error ${error}`}
        }
    }

}