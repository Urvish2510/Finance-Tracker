import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { beforeAll, afterAll } from 'vitest'
import app from '../../server/server.js'
import request from 'supertest'

let mongo

export async function startIntegrationDb() {
  // Ensure clean state
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close()
  }
  
  mongo = await MongoMemoryServer.create()
  const uri = mongo.getUri()
  process.env.MONGODB_URI = uri
  
  // Connect to the test database
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
}

export async function stopIntegrationDb() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close()
  }
  if (mongo) {
    await mongo.stop()
  }
}

export async function clearIntegrationDb() {
  const collections = mongoose.connection.collections
  for (const key in collections) {
    await collections[key].deleteMany({})
  }
}

// Global setup for integration tests only
beforeAll(async () => {
  await startIntegrationDb()
}, 60000)

afterAll(async () => {
  await stopIntegrationDb()
}, 30000)

export const api = () => request(app)
