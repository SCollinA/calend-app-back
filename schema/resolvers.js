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
        getEvent: (obj, args, context, info) => {
            console.log('getting event', args.event)
            return Event.findOne(args.event)
        },
        getUsers: (obj, args, context, info) => {
            console.log('getting users', args.user)
            return User.find(args.user)
        },
        getEvents: (obj, args, context, info) => {
            console.log('getting all events for user', args.event)
            return Event.find(args.event)
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
            return User.create(args.user)
        },
        updateUser: (obj, args, context, info) => {
            console.log('updating user', args.oldUser, args.newUser)
            // must guarantee updating user id exists
            // or send original user info to find
            return User.findOneAndUpdate(args.oldUser, args.newUser)
            .then(() => User.findOne(args.newUser))
        },
        removeUser: (obj, args, context, info) => {
            console.log('removing user', args.user)
            return User.remove(args.user)
        },
        addEvent: (obj, args, context, info) => {
            console.log('adding new event', args.event)
            return Event.create(args.event)
        },
        updateEvent: (obj, args, context, info) => {
            console.log('updating event', args.oldEvent, args.newEvent)
            // must guarantee updating user id exists
            // or send original user info to find
            return Event.findOneAndUpdate(args.oldEvent, args.newEvent)
            .then(() => Event.findOne(args.newEvent))
        },
        removeEvent: (obj, args, context, info) => {
            console.log('removing event', args.event)
            return Event.remove(args.event)
        },
        addUserToEvent: (obj, args, context, info) => {
            console.log('adding user to event', args.user, args.event)
            return User.findOne(args.user)
            .then(user => {
                return Event.findOne(args.event)
                .then(event => {
                    user.eventIds.push(event._id)
                    event.userIds.push(user._id)
                    return user.save()
                    .then(() => event.save())
                    .then(() => User.findById(user._id))
                })
            })
        },
        removeUserFromEvent: (obj, args, context, info) => {
            console.log('removing user from event', args.user, args.event)
            return User.findOne(args.user)
            .then(user => {
                return Event.findOne(args.event)
                .then(event => {
                    user.eventIds = user.eventIds.filter(eventId => eventId !== event._id)
                    event.userIds = event.userIds.filter(userId => userId !== user._id)
                    return user.save()
                    .then(() => event.save())
                    .then(() => User.findById(user.id))
                })
            })
        }
    },
}

module.exports = { resolvers }