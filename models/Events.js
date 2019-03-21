import 
    mongoose, 
    { 
        Schema,
    } from 'mongoose'
import { UserSchema } from './Users'

export const EventSchema = new Schema({
    name: String,
    time_start: Date,
    time_end: Date,
    notes: String,
    users: [UserSchema]
})

export const Event = mongoose.model('Event', EventSchema)
