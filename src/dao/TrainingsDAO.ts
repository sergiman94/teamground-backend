import {MongoClient, Collection} from "mongodb"
import { TrainingJSON } from "src/models/trainings/trainings.model"

let trainings: Collection<any>

export default class TrainingsDAO {
  /** injected mongo db collection connection from server index */
  static async injectDB(conn: MongoClient) {
    try {
      trainings = await conn.db(process.env.MAIN_DB).collection("trainings");
    } catch (error) {
      console.log(`There was a problem connection to TrainingsDAO ${error}`);
    }
  }

  static async addTraining(trainingData: TrainingJSON) {
    try {
      await trainings.insertOne(trainingData);
      return { success: true, data: trainingData };
    } catch (error) {
      if (String(error).startsWith("MongoError: E11000 duplicate key error")) {
        return { error: "A Training with the given data already exists." };
      }
      console.error(`Error occurred while adding new Training, ${error}.`);
      return { error: error };
    }
  }

  static async getTraining(traininKey) {
    try {
      let training = await trainings.findOne({ key: traininKey });
      return training;
    } catch (error) {
      console.log(`Error getting training --> ${error}`);
      return { error: `Error getting training --> ${error}` };
    }
  }

  static async getTrainings() {
    try {
      let trainingList = await trainings.find().toArray();
      return trainingList;
    } catch (error) {
      console.log(`Error listing trainings --> ${error}`);
      let matchesList = [];
      return matchesList;
    }
  }

  static async updateTraining(trainingKey: any, training: TrainingJSON) {
    try {
      const updateResponse = await trainings.updateOne(
        { key: trainingKey },
        {
          $set: {
            // Set here necesary changes
            players: training.players,
            active: training.active,
            date: training.date,
            hour: training.hour,
            timestamp: training.timestamp,
            status: training.status,
            field: training.field,
            confirmed: training.confirmed, 
            confirmedAction: training.confirmedAction
          },
        }
      );

      if (updateResponse.matchedCount === 0) {
        throw new Error("Couldn't find a training for this credential");
      }

      return trainingKey;
    } catch (error) {
      console.log("error updating training", error);
      return { error: `Error updating training --> ${error}` };
    }
  }

  static async deleteMatch(trainingKey) {
    try {
      await trainings.deleteOne({ key: trainingKey });

      if (!(await this.getTraining(trainingKey))) {
        return { success: `training ${trainingKey} successfully deleted` };
      } else {
        return { error: `Can not delete match ${trainingKey}` };
      }
    } catch (error) {
      console.log(`Error deleting post --> ${error}`);
      return { error: `Can not delete post ${trainingKey} error ${error}` };
    }
  }
}