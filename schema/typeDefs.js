const { gql } = require('apollo-server-express')

const typeDefs = gql`
    scalar Date
    input UserInput {
        id: ID
        name: String
        events: [EventInput]
    }
    input EventInput {
        id: ID
        name: String
        timeStart: Date
        timeEnd: Date
        notes: String
    }
    type Query {
        getUser(input: UserInput): User
        getEvent(input: EventInput): Event
        getUsers(input: UserInput): [User]
        getEvents(input: EventInput): [Event]
        getAllUsers: [User]
        getAllEvents: [Event]
    }
    type Mutation {
        addUser(input: UserInput): User
        updateUser(input: UserInput): User
        removeUser(id: ID): User
        addEvent(input: EventInput): Event
        updateEvent(input: EventInput): Event
        removeEvent(id: ID): Event
        addEventToUser(eventId: ID, userId: ID): User
        removeEventFromUser(eventId: ID, userId: ID): User
    }
    type AuthPayload {
        token: String
    }
    type User {
        id: ID!
        name: String
        events: [Event]
    }
    type Event {
        id: ID!
        name: String
        timeStart: Date
        timeEnd: Date
        notes: String
    }
`

module.exports = { typeDefs }