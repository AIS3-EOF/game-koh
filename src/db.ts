import * as mongoDB from 'mongodb'
import * as dotenv from 'dotenv'

export const connect = async () => {
	dotenv.config()
	const client: mongoDB.MongoClient = new mongoDB.MongoClient(process.env.DB_CONN_STRING as string)
	await client.connect()
	return client.db(process.env.DB_NAME)
}
