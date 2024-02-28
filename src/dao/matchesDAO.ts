import { MongoClient, Collection } from "mongodb";
import { MatchJSON } from "src/models/matches/matches.model";

let matches: Collection<any>;

export default class MatchesDAO {
  /** injected mongo db collection connection from server index */
  static async injectDB(conn: MongoClient) {
    try {
      matches = await conn.db(process.env.MAIN_DB).collection("matches");
    } catch (error) {
      console.log(`There was a problem connection to MatchesDAO ${error}`);
    }
  }

  static async addMatch(matchData: MatchJSON) {
    try {
      await matches.insertOne(matchData);
      return { success: true, data: matchData };
    } catch (error) {
      if (String(error).startsWith("MongoError: E11000 duplicate key error")) {
        return { error: "A Match with the given data already exists." };
      }
      console.error(`Error occurred while adding new match, ${error}.`);
      return { error: error };
    }
  }

  static async getMatch(matchKey) {
    try {
      let match = await matches.findOne({ key: matchKey });
      return match;
    } catch (error) {
      console.log(`Error getting match --> ${error}`);
      return { error: `Error getting match --> ${error}` };
    }
  }

  static async getMatches() {
    try {
      let matchList = await matches.find().toArray();
      return matchList;
    } catch (error) {
      console.log(`Error listing matches --> ${error}`);
      let matchesList = [];
      return matchesList;
    }
  }

  static async updateMatch(matchKey, match: MatchJSON) {
    try {
      const updateResponse = await matches.updateOne(
        { key: matchKey },
        {
          $set: {
            // Set here necesary changes
            name: match.name,
            confirmedPlayers: match.confirmedPlayers,
            status: match.status,
            field: match.field,
          },
        }
      );

      if (updateResponse.matchedCount === 0) {
        throw new Error("Couldn't find a match for this credential");
      }

      return matchKey;
    } catch (error) {
      console.log("error updating match", error);
      return { error: `Error updating match --> ${error}` };
    }
  }

  static async deleteMatch(matchKey) {
    try {
      await matches.deleteOne({ key: matchKey });

      if (!(await this.getMatch(matchKey))) {
        return { success: `match ${matchKey} successfully deleted` };
      } else {
        return { error: `Can not delete match ${matchKey}` };
      }
    } catch (error) {
      console.log(`Error deleting post --> ${error}`);
      return { error: `Can not delete post ${matchKey} error ${error}` };
    }
  }
}
