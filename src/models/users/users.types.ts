import { Document, Model } from "mongoose";

export interface IUser {
    chatId: String,
    firstName: String,
    lastName: String,
    discount: Number
}

export interface IUserDocument extends IUser, Document {}
export interface IUserModel extends Model<IUserDocument> {}