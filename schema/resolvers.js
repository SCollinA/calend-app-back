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
            console.log('hello', ast)
            if (ast.kind === Kind.INT) {
                return new Date(parseInt(ast.value)) // ast value is always in string format
            } else if (ast.kind === Kind.STRING) {
                return new Date(ast.value)
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
            const conditions = args.event
            if (conditions.guestIds) {
                conditions.guestIds = { 
                    $all: conditions.guestIds 
                }
            }
            if (conditions.timeStart) {
                const searchDate = new Date(args.event.timeStart)
                conditions.timeStart = { 
                    $gte: searchDate, 
                    $lt: new Date(searchDate.getTime() + 1 * 24 * 60 * 60 * 1000)
                }
            }
            console.log(conditions)
            return Event.find(conditions)
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
            const token = jwt.sign({ isLoggedIn: true }, APP_SECRET, {
                expiresIn: 60 * 60 * 24 // expires in one day
            })
            return User.create({ ...args.user, pwhash, token })
            .then(user => {
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
            const saltRounds = 10
            const salt = bcrypt.genSaltSync(saltRounds)
            const pwhash = args.newUser.pwhash && bcrypt.hashSync(args.newUser.pwhash, salt)
            const newUser = pwhash ? {
                ...args.newUser,
                pwhash,
            } : args.newUser
            return User.findOneAndUpdate(args.oldUser, newUser)
            .then(() => User.findOne({ _id: args.oldUser._id }))
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
            .then(event => User.findById(args.event.hostId)
            .then(user => {
                user.eventIds.push(event._id)
                return user.save()
                .then(() => event)
            }))
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
                    // if user has not already been added to event
                    if (!(user.eventIds && user.eventIds.find(eventId => eventId.equals(event._id))) ||
                    (event.guestIds && event.guestIds.find(userId => userId.equals(user._id))) ||
                    (event.hostId === user._id)) {
                        user.eventIds.push(event._id)
                        event.guestIds.push(user._id)
                        return user.save()
                        .then(() => event.save())
                        .then(() => Event.findById(event._id))
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
                    .then(() => Event.findById(event._id))
                })
            })
        },
        login: (obj, args, context, info) => {
            console.log('logging in user', args.user.name)
            return User.findOne({ name: args.user.name })
            .then(user => {
                console.log('found user', user)
                const pwMatch = bcrypt.compareSync(args.user.pwhash, user.pwhash)
                if (!pwMatch) { throw new Error('bad username or password') }
                console.log('good password')
                const token = jwt.sign({ isLoggedIn: true }, APP_SECRET, {
                    expiresIn: 60 * 60 * 24 // expires in one day
                })
                user.token = token
                return user.save()
                .then(() => User.findById(user.id))
                .then(user => ({ 
                    token,
                    user
                }))
            })
        },
        autoLogin: (obj, args, context, info) => {
            console.log('auto-logging in user', args.token)
            return User.findOne({ token: args.token })
            .then(user => {
                console.log('found user', user)
                const token = jwt.sign({ isLoggedIn: true }, APP_SECRET, {
                    expiresIn: 60 * 60 * 24 // expires in one day
                })
                user.token = token
                console.log('assigned new token to user', user)
                return user.save()
                .then(() => User.findById(user._id))
                .then(user => {
                    console.log('found upated auto-logged in user', user)
                    return { 
                        token,
                        user
                    }
                })
            })
            .catch(() => console.log('could not find user for auto-login'))
        },
        // logout mutation removes jwt
        logout: (obj, args, context, info) => {
            console.log('logging out user', args.user)
            User.findOne(args.user)
            .then(user => {
                user.token = null
                return user.save()
                .then(() => null)
            })
        },
    },
}

module.exports = { resolvers }