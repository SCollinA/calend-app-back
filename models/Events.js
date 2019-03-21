const 
    mongoose, 
    { 
        Schema,
    } = require('mongoose')

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