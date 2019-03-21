const 
    mongoose,
    {
        Schema,
    } = require('mongoose')
const { EventSchema } = require('./Events')

const UserSchema = new Schema({
        name: String,
        pwhash: String,
        events: [EventSchema]
    })

const User = mongoose.model('User', UserSchema)

module.exports = {
    User,
    UserSchema
}