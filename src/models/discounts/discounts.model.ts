import { model } from "mongoose"
import { IDiscountDocument } from "./discounts.types"
import DiscountSchema from "./discounts.schema"

export const DiscountModel = model<IDiscountDocument>('discount', DiscountSchema)
