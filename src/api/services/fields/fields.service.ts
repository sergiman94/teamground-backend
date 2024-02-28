
import FieldsDAO from "../../../dao/fieldsDAO";
import { FieldJSON, Fields } from "../../../models/fields/fields.model";
import { Service } from "../service.interface";

class FieldsService implements Service<FieldJSON> {

    getTotal(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    create(item: FieldJSON): Promise<void> {
        return this.save(item)
    }

    async update(key: string, item: FieldJSON): Promise<any> {
        let itemUpdated = await FieldsDAO.updateField(key, item)
        return this.get(itemUpdated)
    }

    async addMatchField(key: string, item: FieldJSON, match: string): Promise<any> {
        let itemUpdated = await FieldsDAO.addMatchField(key, [...item.matches, match])
        return this.get(itemUpdated)
    }

    patch?(changes: any): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async save(item: FieldJSON): Promise<any> {
        const insertResult = await FieldsDAO.addField(item)

        if (!insertResult.success) {
            throw new Error("Can't insert user to database");
        }

        let itemCreated = await FieldsDAO.getField(item.key)
        return Promise.resolve(itemCreated).catch(error => console.log(error))
    }

    async get(key: any): Promise<any> {
        let item = await FieldsDAO.getField(key)
        return item
    }
    
    async list(query?: any) {
        let items = await FieldsDAO.getFields()
        if (query && query.highlighted) {
            let highlightedFields = items.filter((item: FieldJSON) =>  item.highlighted)
            return highlightedFields 
        } else if (query && query.name) {
            let foundItems = items.filter((item:FieldJSON) => item.field.toLowerCase().includes(`${query.name}`))
            return foundItems
        }
        return items
    }

    async delete(key: any): Promise<any> {
        let itemDeleted = await FieldsDAO.deleteField(key)
        return itemDeleted
    }

}

const fieldsService = new FieldsService()
export default fieldsService