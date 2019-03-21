import 
    mongoose,
    {
        Schema,
    } from 'mongoose'
import { EventSchema } from './Events'

export const UserSchema = new Schema({
        name: String,
        pwhash: String,
        events: [EventSchema]
    })

export const User = mongoose.model('User', UserSchema)

