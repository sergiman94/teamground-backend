
import TeamsDAO from "../../../dao/teamsDAO";
import { TeamJSON, Teams } from "../../../models/teams/teams.model";
import { Service } from "../service.interface";

class TeamsService implements Service<TeamJSON> {

    getTotal(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    create(item: TeamJSON): Promise<void> {
        return this.save(item)
    }

    async update(key: string, item: TeamJSON): Promise<any> {
        let teamUpdated = await TeamsDAO.updateTeam(key, item)
        console.log(teamUpdated)
        return this.get(teamUpdated)
    }

    patch?(changes: any): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async save(item: TeamJSON): Promise<any> {
        const team = new Teams(item)
        const insertResult = await TeamsDAO.addTeam(item)

        if (!insertResult.success) {
            throw new Error("Can't insert user to database");
        }

        let teamCreated = await TeamsDAO.getTeam(item.key)
        return Promise.resolve(teamCreated).catch(error => console.log(error))
    }

    async get(key: any): Promise<any> {
        let team = await TeamsDAO.getTeam(key)
        return team
    }
    
    async list(query?: any) {
        let items = await TeamsDAO.getTeams()
        if (query && query.data) {
            let response = items.filter((team: TeamJSON) => team.name.toLowerCase().includes(`${query.data}`) || team.address.toLowerCase().includes(`${query.data}`) || team.location.toLowerCase().includes(`${query.data}`) )
            return response 
        }
        return items
    }

    async delete(key: any): Promise<any> {
        let teamDeleted = await TeamsDAO.deleteTeam(key)
        return teamDeleted
    }

}

const teamsService = new TeamsService()
export default teamsService