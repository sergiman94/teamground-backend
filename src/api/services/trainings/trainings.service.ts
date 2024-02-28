import TrainingsDAO from "../../../dao/TrainingsDAO";
import { TrainingJSON } from "../../../models/trainings/trainings.model";
import { Service } from "../service.interface";

class TrainingsService implements Service<TrainingJSON> {
  getTotal(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  create(item: TrainingJSON): Promise<void> {
    return this.save(item)
  }

  async update(key: string, item: TrainingJSON): Promise<any> {
    let itemUpdated = await TrainingsDAO.updateTraining(key, item)
    return this.get(itemUpdated)
  }

  patch?(changes: any): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async save(item: TrainingJSON): Promise<any> {
    const insertItem = await TrainingsDAO.addTraining(item);

    if (!insertItem.success) {
      throw new Error("Can't insert training to database");
    }

    let itemCreated = await TrainingsDAO.getTraining(item.key);
    return Promise.resolve(itemCreated).catch((error) => console.log(error));
  }

  async get(key: any): Promise<any> {
    let item = await TrainingsDAO.getTraining(key)
    return item
  }

  async list(query?: any) {
    let items = await TrainingsDAO.getTrainings()

    if (query && query.data) {
        let response = items.filter((training: TrainingJSON) => training.date.toLowerCase().includes(`${query.data}`) || training.hour.toLowerCase().includes(`${query.data}`)  || training.team.includes(`${query.data}`))
        return response
    }

    return items
  }

  async delete(key: any): Promise<any> {
    let itemDeleted = await TrainingsDAO.deleteMatch(key)
    return itemDeleted
  }
}

const traininsService = new TrainingsService()
export default traininsService