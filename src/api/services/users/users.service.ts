import { MatchJSON } from "../../../models/matches/matches.model";
import UsersDAO from "../../../dao/usersDAO";
import { UserJSON, Users } from "../../../models/users/users.model";
import { Service } from "../service.interface";

class UsersService implements Service<UserJSON> {

    getTotal(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    create(item: UserJSON): Promise<void> {
        return this.save(item)
    }

    async update(key: string, item: UserJSON): Promise<any> {
        let userUpdated = await UsersDAO.updateUser(key, item)
        console.log(userUpdated)
        return this.get(userUpdated)
    }

    async addUserMatch(key: string, item: UserJSON, match: string): Promise<any> {
        let itemUpdated = await UsersDAO.addUserMatch(key, [...item.matches, match])
        return this.get(itemUpdated)
    }

    async updateFirstTime (key:string, firstTime: Boolean): Promise<any> {
        const userUpdated = await UsersDAO.updateUserFirstTime(key, firstTime)

        return userUpdated
    }

    async updateNotificationsSeen (key:string, seen: Boolean): Promise<any> {
        const userUpdated = await UsersDAO.updateUserNotificationsSeen(key, seen)

        return userUpdated
    }

    async addNotification (key:string, notification: any): Promise<any> {

        const user = await UsersDAO.getUser(key)
        let newNotifications = [...user.notifications, notification] 

        const userUpdated = await UsersDAO.addNotification(key, newNotifications)

        return userUpdated
    }

    patch?(changes: any): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async save(item: UserJSON): Promise<any> {
        const user = new Users(item)
        const insertResult = await UsersDAO.addUser(item)

        if (!insertResult.success) {
            throw new Error("Can't insert user to database");
        }

        let userCreated = await UsersDAO.getUser(item.key)
        return Promise.resolve(userCreated).catch(error => console.log(error))
    }

    async get(key: any): Promise<any> {
        let user = await UsersDAO.getUser(key)
        return user
    }

    async getByEmail(email: any): Promise<any> {
        let user = await UsersDAO.getUserByEmail(email)
        return user
    }

    async getUserPushToken(key: any): Promise<any> {
        let user = await UsersDAO.getUser(key)
        return user.pushToken
    }
    
    async list(query?: any) {

        let users = await UsersDAO.getUsers()

        if (query && query.highlighted) {
            let highlightedUsers = users.filter((user: UserJSON) =>  user.highlighted)
            return highlightedUsers 
        } else if (query && query.data) {
            // this could change due to UX (maybe we'll need to add more conditions to satisfy query parameters)
            let data = users.filter((item: UserJSON) => item.username.toLowerCase().includes(`${query.data}`) || item.displayName.toLowerCase().includes(`${query.data}`))
            return data
        }

        return users
    }

    async delete(key: any): Promise<any> {
        let userDeleted = await UsersDAO.deleteUser(key)
        return userDeleted
    }

    async getByUsername(username): Promise<any> {
        let user = await UsersDAO.getByUsername(username)
        return user;
    }
    
    async getByFieldId(fieldKey): Promise<any> {
        let user = await UsersDAO.getByFieldKey(fieldKey)
        return user
    }
}

const usersService = new UsersService()
export default usersService