const { ApolloServer } = require('apollo-server-express')
const { typeDefs } = require('./schema/typeDefs')
const { resolvers } = require('./schema/resolvers')
// const fs = require('fs')
const http = require('http')
// const https = require('https')
const bodyParser = require('body-parser')
require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)
mongoose.connect(
    'mongodb://localhost:27017/calend-app', 
    { 
        useNewUrlParser: true,
        useFindAndModify: false,
        useCreateIndex: true
    }
)
const store = new MongoDBStore({
    uri: 'mongodb://localhost:27017/calend-app',
    collection: 'sessions'
})

const configurations = {
    production: { ssl: false, port: 4000, hostname: 'localhost' },
    development: { ssl: false, port: 4000, hostname: 'localhost' }
}

const environment = process.env.NODE_ENV || 'production'
const config = configurations[environment]

const apollo = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req, connection }) => {
        if (connection) { // this is a subscription
            return connection.context
        } else {
            const authorization = req.headers.authorization || ''
            return { 
                authorization, 
                session 
            }
    }},
    cors: {
        origin: [
            'http://localhost:3000', // dev client port
            'https://calnd.app' // prod url
]}})

const app = express()
app.use(session({
    secret: 'random123',
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
    store,
    resave: false,
    saveUninitialized: true,
})) 
app.use(bodyParser.urlencoded({extended: false}))
app.use(express.static('build'))
app.use(bodyParser.json({limit: '50mb'}));

apollo.applyMiddleware({ app })

const server = http.createServer(app)

apollo.installSubscriptionHandlers(server)

server.listen({
        ...config
    }, () => console.log(
        '🚀 Server ready at',
        `http${config.ssl ? 's' : ''}://${config.hostname}:${config.port}${apollo.graphqlPath}`
))