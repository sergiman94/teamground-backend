
import PromosDAO from "../../../dao/promosDAO";
import { PromoJSON } from "../../../models/promos/promos.model";
import { Service } from "../service.interface";

class PromosService implements Service<PromoJSON> {

    getTotal(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    create(item: PromoJSON): Promise<void> {
        return this.save(item)
    }

    async update(key: string, item: PromoJSON): Promise<any> {
        let itemUpdated = await PromosDAO.updatePromo(key, item)
        console.log(itemUpdated)
        return this.get(itemUpdated)
    }

    patch?(changes: any): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async save(item: PromoJSON): Promise<any> {
        const insertResult = await PromosDAO.addPromo(item)

        if (!insertResult.success) {
            throw new Error("Can't insert user to database");
        }

        let itemCreated = await PromosDAO.getPromo(item.key)
        return Promise.resolve(itemCreated).catch(error => console.log(error))
    }

    async get(key: any): Promise<any> {
        let item = await PromosDAO.getPromo(key)
        return item
    }
    
    async list(query?: any) {
        let items = await PromosDAO.getPromos()
        return items
    }

    async delete(key: any): Promise<any> {
        let itemDeleted = await PromosDAO.deletePromo(key)
        return itemDeleted
    }

}

const promosService = new PromosService()
export default promosService