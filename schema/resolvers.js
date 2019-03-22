const { GraphQLScalarType } = require('graphql')
const { Kind } = require('graphql/language')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()
// const pubsub = new PubSub()
const { APP_SECRET } = process.env
const { checkLoggedIn } = require('../utils')

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
            const saltRounds = 10
            const salt = bcrypt.genSaltSync(saltRounds)
            const pwhash = bcrypt.hashSync(args.user.pwhash, salt)
            return User.create({ ...args.user, pwhash })
            .then(user => {
                const token = jwt.sign({ isLoggedIn: true }, APP_SECRET, {
                    expiresIn: 60 * 60 * 24 // expires in one day
                })
                return { 
                    token,
                    user
                }
            })
            .catch(err => new Error('username taken'))
        },
        updateUser: (obj, args, context, info) => {
            checkLoggedIn(context)
            console.log('updating user', args.oldUser, args.newUser)
            return User.findOneAndUpdate(args.oldUser, args.newUser)
            .then(() => User.findOne(args.newUser))
        },
        removeUser: (obj, args, context, info) => {
            checkLoggedIn(context)
            console.log('removing user', args.user)
            return User.remove(args.user)
        },
        addEvent: (obj, args, context, info) => {
            checkLoggedIn(context)
            console.log('adding new event', args.event)
            return Event.create(args.event)
        },
        updateEvent: (obj, args, context, info) => {
            checkLoggedIn(context)
            console.log('updating event', args.oldEvent, args.newEvent)
            // must guarantee updating user id exists
            // or send original user info to find
            return Event.findOneAndUpdate(args.oldEvent, args.newEvent)
            .then(() => Event.findOne(args.newEvent))
        },
        removeEvent: (obj, args, context, info) => {
            checkLoggedIn(context)
            console.log('removing event', args.event)
            return Event.remove(args.event)
        },
        addUserToEvent: (obj, args, context, info) => {
            checkLoggedIn(context)
            console.log('adding user to event', args.user, args.event)
            return User.findOne(args.user)
            .then(user => {
                return Event.findOne(args.event)
                .then(event => {
                    if (!(user.eventIds.find(eventId => eventId.equals(event._id)) ||
                    event.userIds.find(userId => userId.equals(user._id)))) {
                        user.eventIds.push(event._id)
                        event.guestIds.push(user._id)
                        return user.save()
                        .then(() => event.save())
                        .then(() => User.findById(user._id))
                    }
                })
            })
        },
        removeUserFromEvent: (obj, args, context, info) => {
            checkLoggedIn(context)
            console.log('removing user from event', args.user, args.event)
            return User.findOne(args.user)
            .then(user => {
                return Event.findOne(args.event)
                .then(event => {
                    user.eventIds = user.eventIds.filter(eventId => !eventId.equals(event._id))
                    event.guestIds = event.guestIds.filter(userId => !userId.equals(user._id))
                    return user.save()
                    .then(() => event.save())
                    .then(() => User.findById(user.id))
                })
            })
        },
        login: (obj, args, context, info) => {
            console.log('logging in user', args.user.name)
            return User.findOne({ name: args.user.name })
            .then(user => {
                if (!user) { throw new Error('bad username or password') }
                const pwMatch = bcrypt.compareSync(args.user.pwhash, user.pwhash)
                if (!pwMatch) { throw new Error('bad username or password') }
                console.log('good password')
                const token = jwt.sign({ isLoggedIn: true }, APP_SECRET, {
                    expiresIn: 60 * 60 * 24 // expires in one day
                })
                return { 
                    token,
                    user
                }
            })
            
        }
    },
}

module.exports = { resolvers }