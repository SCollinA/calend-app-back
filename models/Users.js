const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = mongoose.Schema.Types.ObjectId

const UserSchema = new Schema({
        name: String,
        pwhash: String,
        eventIds: [ObjectId]
    })

const User = mongoose.model('User', UserSchema)

module.exports = {
    User,
    UserSchema
}