import 
    mongoose, 
    { 
        Schema,
    } from 'mongoose'

export const EventSchema = new Schema({
    name: String,
    timeStart: Date,
    timeEnd: Date,
    notes: String,
})

export const Event = mongoose.model('Event', EventSchema)
