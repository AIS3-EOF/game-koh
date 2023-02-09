import { MongoClient, Db } from 'mongodb'

export const connect = async () => {
	const client = new MongoClient(process.env.DB_CONN_STRING!)
	await client.connect()
	return client.db(process.env.DB_NAME)
}

declare global {
	var db: Db
}
