import { Schema } from 'mongoose'

const EventSchema = new Schema({
    name: String,
    description: String,
    address: String,
    date: Date,
    capacity: Number,
    price: Number
})

export default EventSchema