import { Document, Model } from "mongoose";

export interface IEvent {
    name: String,
    description: String,
    address: String,
    date: Date,
    isPublished: boolean
}

export interface IEventDocument extends IEvent, Document {}
export interface IEventModel extends Model<IEventDocument> {}