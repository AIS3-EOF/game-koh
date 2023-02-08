import * as mongoDB from 'mongodb'

export const connect = async () => {
	const client: mongoDB.MongoClient = new mongoDB.MongoClient(
		process.env.DB_CONN_STRING!,
	)
	await client.connect()
	return client.db(process.env.DB_NAME)
}
