import { Document, Model } from "mongoose"

export interface IDiscount {
    userId: String,
    amount: Number
}

export interface IDiscountDocument extends IDiscount, Document {}
export interface IDiscountModel extends Model<IDiscountDocument> {}