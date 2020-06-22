import { Schema } from 'mongoose'

const EventSchema = new Schema({
    name: String,
    description: String,
    address: String,
    date: Date
})

export default EventSchema