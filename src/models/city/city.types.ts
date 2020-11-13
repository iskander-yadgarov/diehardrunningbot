import { Document, Model } from "mongoose"

export interface ICity {
    name: String
}

export interface ICityDocument extends ICity, Document {}
export interface ICityModel extends Model<ICityDocument> {}