import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { typeDefs, resolvers } from './schema'
import fs from 'fs'
import http from 'http'
import https from 'https'
import bodyparser from 'body-parser'
require('dotenv').config()
