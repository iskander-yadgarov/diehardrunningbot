import { Document, Model } from "mongoose";

export interface IUser {
    chatId: String,
    firstName: String,
    lastName: String
}

export interface IUserDocument extends IUser, Document {}
export interface IUserModel extends Model<IUserDocument> {}