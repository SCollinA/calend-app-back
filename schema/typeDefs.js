const { gql } = require('apollo-server-express')

const typeDefs = gql`
    scalar Date
    input UserInput {
        __typename: String
        _id: ID
        name: String
        pwhash: String
        eventIds: [ID]
    }
    input EventInput {
        __typename: String
        _id: ID
        name: String
        timeStart: Date
        timeEnd: Date
        notes: String
        hostId: ID
        guestIds: [ID]
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
        addUser(user: UserInput): AuthPayload
        updateUser(oldUser: UserInput, newUser: UserInput): User
        removeUser(user: UserInput): User
        addEvent(event: EventInput): Event
        updateEvent(oldEvent: EventInput, newEvent: EventInput): Event
        removeEvent(event: EventInput): Event
        addUserToEvent(user: UserInput, event: EventInput): Event
        removeUserFromEvent(user: UserInput, event: EventInput): Event
        login(user: UserInput): AuthPayload
        autoLogin(token: String): AuthPayload
        logout: User
    }
    type AuthPayload {
        token: String
        user: User
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
        hostId: ID
        guestIds: [ID]
    }
`

module.exports = { typeDefs }