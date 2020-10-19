import { Schema } from 'mongoose'

const BookingSchema = new Schema({
    userId: String,
    eventId: String,
    status: Number
})

export default BookingSchema