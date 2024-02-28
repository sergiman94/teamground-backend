import MatchesDAO from "../../../dao/matchesDAO";
import { MatchJSON } from "../../../models/matches/matches.model";
import { Service } from "../service.interface";

class MatchesService implements Service<MatchJSON> {

    getTotal(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    create(item: MatchJSON): Promise<void> {
        return this.save(item)
    }

    async update(key: string, item: MatchJSON): Promise<any> {
        let itemUpdated = await MatchesDAO.updateMatch(key, item)
        return this.get(itemUpdated)
    }

    patch?(changes: any): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async save(item: MatchJSON): Promise<any> {
        const insertResult = await MatchesDAO.addMatch(item)
        if (!insertResult.success) {
            throw new Error("Can't insert user to database");
        }
        let itemCreated = await MatchesDAO.getMatch(item.key)
        return Promise.resolve(itemCreated).catch(error => console.log(error))
    }

    async get(key: any): Promise<any> {
        let item = await MatchesDAO.getMatch(key)
        return item
    }
    
    async list(query?: any) {
        let items = await MatchesDAO.getMatches()
        if (query && query.highlighted) {
            let highlightedMatches = items.filter((item: MatchJSON) =>  item.highlighted)
            return highlightedMatches 
        } else if (query && query.data) {
            // TODO: this line below was supporting qurying by field name, but due to changes
            // now is not available, this because we are getting nnow the id instead of 
            // the actual field involved, we should make it possible to query by field in the future
            // let data = items.filter((item: MatchJSON) => item.date.toLowerCase().includes(`${query.data}`) || item.field.field.toLowerCase().includes(`${query.data}`))
            let data = items.filter((item: MatchJSON) => item.date.toLowerCase().includes(`${query.data}`))
            return data
        }
        return items
    }

    async delete(key: any): Promise<any> {
        let itemDeleted = await MatchesDAO.deleteMatch(key)
        return itemDeleted
    }

}

const matchesService = new MatchesService()
export default matchesService