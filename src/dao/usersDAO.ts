import { MongoClient, Collection } from "mongodb";
import { MatchJSON } from "src/models/matches/matches.model";
import { UserJSON, Users } from "src/models/users/users.model";

let users: Collection<any>;

export default class UsersDAO {
  /** injected mongo db collection connection from server index */
  static async injectDB(conn: MongoClient) {
    try {
      users = await conn.db(process.env.MAIN_DB).collection("users");
    } catch (error) {
      console.log(`There was a problem connection to UsersDAO ${error}`);
    }
  }

  static async addUser(userData: UserJSON) {
    try {
      await users.insertOne(userData);
      return { success: true, data: userData };
    } catch (error) {
      if (String(error).startsWith("MongoError: E11000 duplicate key error")) {
        return { error: "A User with the given data already exists." };
      }
      console.error(`Error occurred while adding new user, ${error}.`);
      return { error: error };
    }
  }

  static async getUser(userKey) {
    try {
      let user = await users.findOne({ key: userKey });
      return user;
    } catch (error) {
      console.log(`Error getting user --> ${error}`);
      return { error: `Error getting user --> ${error}` };
    }
  }

  static async getUserByEmail(email) {
    try {
      let user = await users.findOne({ email: email });
      return user;
    } catch (error) {
      console.log(`Error getting user by email --> ${error}`);
      return { error: `Error getting user by email --> ${error}` };
    }
  }

  static async getByUsername(username) {
    try {
      let user = await users.findOne({ username: username });
      return user;
    } catch (error) {
      console.log(`Error getting user --> ${error}`);
      return { error: `Error getting user --> ${error}` };
    }
  }

  static async getByFieldKey(fieldKey) {
    try {
      let user = await users.findOne({ field: fieldKey });
      return user;
    } catch (error) {
      console.log(`Error getting user --> ${error}`);
      return { error: `Error getting user --> ${error}` };
    }
  }

  static async getUsers() {
    try {
      let usersList = await users.find().toArray();
      return usersList;
    } catch (error) {
      console.log(`Error listing users --> ${error}`);
      let usersList = [];
      return usersList;
    }
  }

  static async updateUser(userKey, user: UserJSON) {
    try {
      const updateResponse = await users.updateOne(
        { key: userKey },
        {
          $set: {
            preferedPosition: user.preferedPosition,
            description: user.description,
            matches: user.matches,
            displayName: user.displayName,
            image: user.image,
            team: user.team,
            emailConfirmed: user.emailConfirmed,
            password: user.password,
            pushToken: user.pushToken
          },
        }
      );

      if (updateResponse.matchedCount === 0) {
        throw new Error("Couldn't find a match for this credential");
      }

      return userKey;
    } catch (error) {
      console.log("error updating user", error);
      return { error: `Error updating user --> ${error}` };
    }
  }

  static async updateUserFirstTime(userKey, firstTime) {
    try {
      const updateResponse = await users.updateOne(
        { key: userKey },
        {
          $set: {
            firstTime: firstTime,
          },
        }
      );

      if (updateResponse.matchedCount === 0) {
        throw new Error("Couldn't find a match for this credential");
      }

      return updateResponse;
    } catch (error) {
      console.log("error updating user", error);
      return { error: `Error updating user --> ${error}` };
    }
  }

  static async updateUserNotificationsSeen(userKey, seen) {
    try {
      const updateResponse = await users.updateOne(
        { key: userKey },
        {
          $set: {
            notificationSeen: seen,
          },
        }
      );

      if (updateResponse.matchedCount === 0) {
        throw new Error("Couldn't find a match for this credential");
      }

      return updateResponse;
    } catch (error) {
      console.log("error updating user", error);
      return { error: `Error updating user --> ${error}` };
    }
  }

  static async addNotification(userKey, notificationsArr) {
    try {
      const updateResponse = await users.updateOne(
        { key: userKey },
        {
          $set: {
            notifications: notificationsArr,
          },
        }
      );

      if (updateResponse.matchedCount === 0) {
        throw new Error("Couldn't find a match for this credential");
      }

      return updateResponse;
    } catch (error) {
      console.log("error updating user", error);
      return { error: `Error updating user --> ${error}` };
    }
  }

  static async addUserMatch(userKey, matches: Array<string>) {
    try {
      const updateResponse = await users.updateOne(
        { key: userKey },
        {
          $set: {
            // Set here necesary changes
            matches: matches,
          },
        }
      );

      if (updateResponse.matchedCount === 0) {
        throw new Error("Couldn't find a user for this credential");
      }

      return userKey;
    } catch (error) {
      console.log("error adding user field", error);
      return { error: `Error adding user field --> ${error}` };
    }
  }

  static async deleteUser(userKey) {
    try {
      await users.deleteOne({ key: userKey });

      if (!(await this.getUser(userKey))) {
        return { success: `user ${userKey} successfully deleted` };
      } else {
        return { error: `Can not delete user ${userKey}` };
      }
    } catch (error) {
      console.log(`Error deleting user --> ${error}`);
      return { error: `Can not delete user ${userKey} error ${error}` };
    }
  }
}
