const { gql } = require('apollo-server-express')

const typeDefs = gql`
    scalar Date
    input UserInput {
        _id: ID
        name: String
        events: [EventInput]
    }
    input EventInput {
        _id: ID
        name: String
        timeStart: Date
        timeEnd: Date
        notes: String
    }
    type Query {
        getUser(user: UserInput): User
        getUserEvent(user: UserInput, event: EventInput): Event
        getUsers(user: UserInput): [User]
        getUsersEvents(user: UserInput): [Event]
        getAllUsers: [User]
        getAllEvents: [Event]
    }
    type Mutation {
        addUser(user: UserInput): User
        updateUser(user: UserInput): User
        removeUser(user: ID): User
        addEvent(user: UserInput, event: EventInput): Event
        updateEvent(event: EventInput): Event
        removeEvent(event: ID): Event
        addEventToUser(event: EventInput, user: UserInput): User
        removeEventFromUser(event: EventInput, user: UserInput): User
    }
    type AuthPayload {
        token: String
    }
    type User {
        _id: ID!
        name: String
        events: [Event]
    }
    type Event {
        _id: ID!
        name: String
        timeStart: Date
        timeEnd: Date
        notes: String
    }
`

module.exports = { typeDefs }