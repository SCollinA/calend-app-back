import 
    mongoose,
    {
        Schema,
    } from 'mongoose'

export const UserSchema = new Schema({
        name: String,
        pwhash: String,
    })

export const User = mongoose.model('User', UserSchema)

