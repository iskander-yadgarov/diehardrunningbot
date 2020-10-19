import { model } from "mongoose"
import { IBookingDocument } from "./bookings.types"
import BookingSchema from "./bookings.schema"

export const BookingModel = model<IBookingDocument>('booking', BookingSchema)
