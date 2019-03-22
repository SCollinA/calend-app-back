const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = mongoose.Schema.Types.ObjectId

const EventSchema = new Schema({
    name: String,
    timeStart: Date,
    timeEnd: Date,
    notes: String,
    hostId: ObjectId,
    guestIds: [ObjectId]
})

const Event = mongoose.model('Event', EventSchema)

module.exports = {
    Event,
    EventSchema
}