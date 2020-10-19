import { Schema } from 'mongoose'

const DiscountSchema = new Schema({
    userId: String,
    amount: Number
})

export default DiscountSchema