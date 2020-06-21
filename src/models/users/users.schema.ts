import { Schema } from 'mongoose'
// import { findOneOrCreate } from './users.statics'

const UserSchema = new Schema({
    userId: String,
    firstName: String,
    lastName: String
})

// UserSchema.statics.findOneOrCreate = findOneOrCreate

export default UserSchema