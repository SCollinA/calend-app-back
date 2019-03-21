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
            return User.findOne(args.input)
        },
        getEvent: (obj, args, context, info) => {
            return Event.findOne(args.input)
        },
        getUsers: (obj, args, context, info) => {
            return User.find(args.input)
        },
        getEvents: (obj, args, context, info) => {
            return Event.find(args.input)
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
            console.log(args.input)
            return User.create(args.input)
        },
        updateUser: (obj, args, context, info) => {
            return User.findByIdAndUpdate(args.id, args.input)
        },
        removeUser: (obj, args, context, info) => {
            return User.remove(args.input)
        },
        addEvent: (obj, args, context, info) => {
            return Event.create(args.input)
        },
        updateEvent: (obj, args, context, info) => {
            return Event.findByIdAndUpdate(args.id, args.input)
        },
        removeEvent: (obj, args, context, info) => {
            return Event.remove(args.input)
        },
    },
}

module.exports = { resolvers }