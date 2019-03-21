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
            return User.findOne(args)
        },
        getEvent: (obj, args, context, info) => {
            return Event.findOne(args)
        },
        getUsers: (obj, args, context, info) => {
            return User.find(args)
        },
        getEvents: (obj, args, context, info) => {
            return Event.find(args)
        },
        getAllUsers: (obj, args, context, info) => {
            return User.find()
        },
        getAllEvents: (obj, args, context, info) => {
            return Event.find()
        },
    },
    Mutation: {
        addUser: (obj, args, context, info) => {
            return User.create(args)
        },
        updateUser: (obj, args, context, info) => {
            return User.findByIdAndUpdate(args.id, args)
        },
        removeUser: (obj, args, context, info) => {
            return User.remove(args)
        },
        addEvent: (obj, args, context, info) => {
            return Event.create(args)
        },
        updateEvent: (obj, args, context, info) => {
            return Event.findByIdAndUpdate(args.id, args)
        },
        removeEvent: (obj, args, context, info) => {
            return Event.remove(args)
        },
    },
    Subscription: {

    }
}

module.exports = { resolvers }