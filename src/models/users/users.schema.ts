import { Schema } from 'mongoose'

const UserSchema = new Schema({
    chatId: String,
    firstName: String,
    lastName: String,
    discount: Number
})

export default UserSchema