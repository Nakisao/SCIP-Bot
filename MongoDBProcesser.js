const { MongoClient, ServerApiVersion } = require('mongodb');
// Load .env into process.env (optional)
try {
	require('dotenv').config();
}
catch {
	// dotenv not installed; environment variables will be used instead
}
// Read MongoDB URI from environment (recommended) or set in a secure config store.
const uri = process.env.MONGODB_LOCAL || process.env.MONGODB_URI;

if (!uri) {
	console.error('No MONGODB_URI environment variable set. MongoDB operations will not run.');
}
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

async function run() {
	try {
		if (!uri) return console.warn('Skipping MongoDB connection: no URI provided.');
		// Connect the client to the server (optional starting in v4.7)
		await client.connect();
		// Send a ping to confirm a successful connection
		await client.db('admin').command({ ping: 1 });
		console.log('Pinged your deployment. You successfully connected to MongoDB!');
	}
	finally {
		// Ensures that the client will close when you finish/error
		if (client && client.close) await client.close();
	}
}
run().catch(console.dir);

// Ensure any option params are URL encoded. https://www.mongodb.com/docs/atlas/troubleshoot-connection/#special-characters-in-connection-string-password