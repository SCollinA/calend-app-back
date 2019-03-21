const mongoose = require('mongoose')
const Schema = mongoose.Schema

const EventSchema = new Schema({
    name: String,
    timeStart: Date,
    timeEnd: Date,
    notes: String,
})

const Event = mongoose.model('Event', EventSchema)

module.exports = {
    Event,
    EventSchema
}