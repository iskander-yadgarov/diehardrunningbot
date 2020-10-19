import { Document, Model } from "mongoose"

export interface IBooking {
    userId: String,
    eventId: String,
    status: Number
}

export interface IBookingDocument extends IBooking, Document {}
export interface IBookingModel extends Model<IBookingDocument> {}