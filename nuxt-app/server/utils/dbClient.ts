import { Client } from 'pg'

export function getDb() {
  const client = new Client({
    host: 'localhost',
    user: 'dev',
    password: 'dev',
    database: 'poc',
    port: 5432
  })

  return client
}