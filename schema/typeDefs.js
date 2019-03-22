const { gql } = require('apollo-server-express')

const typeDefs = gql`
    scalar Date
    input UserInput {
        _id: ID
        name: String
        eventIds: [ID]
    }
    input EventInput {
        _id: ID
        name: String
        timeStart: Date
        timeEnd: Date
        notes: String
        userIds: [ID]
    }
    type Query {
        getUser(user: UserInput): User
        getEvent(event: EventInput): Event
        getUsers(user: UserInput): [User]
        getEvents(event: EventInput): [Event]
        getAllUsers: [User]
        getAllEvents: [Event]
    }
    type Mutation {
        addUser(user: UserInput): User
        updateUser(user: UserInput): User
        removeUser(user: UserInput): User
        addEvent(event: EventInput): Event
        updateEvent(event: EventInput): Event
        removeEvent(event: EventInput): Event
        addUserToEvent(user: UserInput, event: EventInput): Event
        removeUserFromEvent(user: UserInput, event: EventInput): Event
    }
    type AuthPayload {
        token: String
    }
    type User {
        _id: ID!
        name: String
        eventIds: [ID]
    }
    type Event {
        _id: ID!
        name: String
        timeStart: Date
        timeEnd: Date
        notes: String
        userIds: [ID]
    }
`

module.exports = { typeDefs }