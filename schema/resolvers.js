const { GraphQLScalarType } = require('graphql')
const { Kind } = require('graphql/language')
// const bcrypt = require('bcrypt')
require('dotenv').config()
// const pubsub = new PubSub()

const { User } = require('../models/Users')
const { Event } = require('../models/Events')

const resolvers = {
    Date: new GraphQLScalarType({
        name: 'Date',
        description: 'Date custom scalar type',
        parseValue(value) {
            return new Date(value); // value from the client
        },
        serialize(value) {
            return value.getTime(); // value sent to the client
        },
        parseLiteral(ast) {
            if (ast.kind === Kind.INT) {
                return new Date(ast.value) // ast value is always in string format
            }
            return null;
        },
    }),
    Query: {
        getUser: (obj, args, context, info) => {
            console.log('getting user', args.user)
            return User.findOne(args.user)
        },
        getUserEvent: (obj, args, context, info) => {
            console.log('getting event for user', args.event, args.user)
            return User.findOne(args.user)
            .then(user => {
                // search the db to find matching event
                return Event.findOne(args.event)
                .then(event => {
                    return user.events.id(event._id)
                })
            })
        },
        getUsers: (obj, args, context, info) => {
            console.log('getting users', args.user)
            return User.find(args.user)
        },
        getUsersEvents: (obj, args, context, info) => {
            console.log('getting all events for user', args.user)
            return User.findOne(args.user)
            // return all events
            .then(user => user.events)
        },
        getAllUsers: (obj, args, context, info) => {
            console.log('getting all users')
            return User.find()
        },
        getAllEvents: (obj, args, context, info) => {
            console.log('getting all events')
            return Event.find()
        },
    },
    Mutation: {
        addUser: (obj, args, context, info) => {
            console.log('adding new user', args.user)
            return User.create(args.input)
        },
        updateUser: (obj, args, context, info) => {
            console.log('updating user', args.user)
            // must guarantee updating user id exists
            // or send original user info to find
            return User.findOneAndUpdate({ _id: args.user._id }, args.user)
        },
        removeUser: (obj, args, context, info) => {
            console.log('removing user', args.user)
            return User.remove(args.user)
        },
        addEvent: (obj, args, context, info) => {
            console.log('adding new event to user', args.event, args.user)
            return User.findOne(args.user)
            .then(user => {
                const newEvent = user.events.create(args.event)
                user.events.push(newEvent)
                return user.save()
                .then(() => User.findById(user._id)
                .then(() => user.events.id(newEvent._id)))
            })
            
        },
        updateEvent: (obj, args, context, info) => {
            return Event.findOneAndUpdate({ _id: args.input._id }, args.input)
        },
        removeEvent: (obj, args, context, info) => {
            return Event.remove(args.input)
        },
        addEventToUser: (obj, args, context, info) => {
            console.log('add event to user', obj, args, context, info)
            return User.findById(args.userId)
            .then(user => {
                console.log('found user to add event to', user)
                return Event.findById(args.eventId)
                .then(event => {
                    console.log('found event to add to user', event)
                    user.events.push(event)
                    return user.save()
                    .then(() => User.findById(user.id))
                })
            })
        },
        removeEventFromUser: (obj, args, context, info) => {
            console.log('remove event from user', obj, args, context, info)
            return User.findById(args.userId)
            .then(user => {
                console.log('found user to remove event from', user)
                return Event.findById(args.eventId)
                .then(event => {
                    console.log('found event to remove from user', event)
                    user.events = user.events.filter(userEvent => 
                        userEvent.id !== event.id
                    )
                    return user.save()
                    .then(() => User.findById(user.id))
                })
            })
        }
    },
}

module.exports = { resolvers }