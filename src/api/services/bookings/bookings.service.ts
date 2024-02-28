
import { FieldCommentJSON, FieldJSON } from "src/models/fields/fields.model";
import BookingsDAO from "../../../dao/bookingsDAO";
import { BookingJSON } from "../../../models/bookings/bookings.model";
import { Service } from "../service.interface";

class BookingsService implements Service<BookingJSON> {

    getTotal(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    create(item: BookingJSON): Promise<void> {
        return this.save(item)
    }

    async update(key: string, item: BookingJSON): Promise<any> {
        let itemUpdated = await BookingsDAO.updateBooking(key, item)
        return this.get(itemUpdated)
    }

    // this function updates the field of a booking
    async updateField(field: FieldJSON): Promise<any> {
        try {
          // get bookings of a field
          let fieldBookings: Array<BookingJSON> = (await this.list()).filter((booking: BookingJSON) => booking.field === field.key);
          let updates = [];
          for (let i = 0; i < fieldBookings.length; i++) {
            const fieldBooking = fieldBookings[i];
            fieldBooking.field = field.key;
            updates.push(this.update(fieldBooking.key, fieldBooking));
          }

          Promise.allSettled(updates)
            .then((response) => {
              console.log(`fulfilled`);
            })
            .catch((error) => {
               throw new Error(error);
            });
        } catch (error) {
            console.log(error)
        }
    }


    patch?(changes: any): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async save(item: BookingJSON): Promise<any> {
        const insertResult = await BookingsDAO.addBooking(item)

        if (!insertResult.success) {
            throw new Error("Can't insert user to database");
        }

        let itemCreated = await BookingsDAO.getBooking(item.key)
        return Promise.resolve(itemCreated).catch(error => console.log(error))
    }

    async get(key: any): Promise<any> {
        let item = await BookingsDAO.getBooking(key)
        return item
    }

    async getByMatchKey(matchKey: any): Promise<any> {
        let item = await BookingsDAO.getBookingByMatchKey(matchKey)
        return item
    }
    
    async getByTrainingKey(trainingKey: any): Promise<any> {
        let item = await BookingsDAO.getBookingByTrainingKey(trainingKey)
        return item
    }

    async list(query?: any) {
        let items = await BookingsDAO.getBookings()

        if (query && query.data) {
            // TODO: this commented line below were allowing the client to search also by field name, because we change 
            // from storing FieldJSON to store ID's this is not longer possible, we need to allow that in the future
            // let response = items.filter((booking: BookingJSON) => booking.date.toLowerCase().includes(`${query.data}`) || booking.field.field.toLowerCase().includes(`${query.data}`))
            let response = items.filter((booking: BookingJSON) => booking.date.toLowerCase().includes(`${query.data}`))
            return response
        }

        return items
    }

    async delete(key: any): Promise<any> {
        let itemDeleted = await BookingsDAO.deleteBooking(key)
        return itemDeleted
    }

}

const bookingsService = new BookingsService()
export default bookingsService