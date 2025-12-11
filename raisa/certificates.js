const { MongoClient, ObjectId } = require('mongodb');

// Reuse a single MongoClient for the lifetime of the process.
let _client = null;

function getMongoUri() {
	return process.env.MONGODB_LOCAL;
}

async function getClient() {
	if (_client && _client.topology && _client.topology.isConnected && _client.topology.isConnected()) {
		return _client;
	}
	const uri = getMongoUri();
	_client = new MongoClient(uri, { connectTimeoutMS: 10000, serverSelectionTimeoutMS: 10000 });
	await _client.connect();
	return _client;
}

/**
 * Delete a certificate by id.
 * Tries a few sensible filters in order:
 *  - {_id: ObjectId(id)} if `id` parses as ObjectId
 *  - {certificateId: id}
 *  - {id: id}
 * Returns true if a document was deleted, false if not found.
 */
async function deleteCertificateById(id) {
	if (!id) throw new Error('certificate id is required');

	const client = await getClient();
	const db = client.db('RAISA');
	const col = db.collection('Certificates');

	// Try to delete by _id if it's a valid ObjectId
	try {
		if (ObjectId.isValid(id)) {
			const _id = new ObjectId(id);
			const res = await col.deleteOne({ _id });
			if (res.deletedCount && res.deletedCount > 0) return true;
		}
	}
	// eslint-disable-next-line no-unused-vars
	catch (error) {
		// ignore and continue with other filters
	}

	// Try common alternate id fields
	const alternateFilters = [
		{ certificateId: id },
		{ id: id },
	];

	for (const filter of alternateFilters) {
		const res = await col.deleteOne(filter);
		if (res.deletedCount && res.deletedCount > 0) return true;
	}

	return false;
}

/**
 * Create a new certificate document.
 * Accepts an object with fields like { description, appointRank }
 * Returns the created certificate object (including `certificateId`).
 */
async function createCertificate({ description, appointRank } = {}) {
	if (!description) throw new Error('description is required to create a certificate');

	const client = await getClient();
	const db = client.db('RAISA');
	const col = db.collection('Certificates');

	const certificateId = new ObjectId().toString();
	const doc = {
		certificateId,
		description,
		appointRank: appointRank || null,
		createdAt: new Date(),
	};

	const res = await col.insertOne(doc);
	if (res.insertedId) {
		return Object.assign({ _id: res.insertedId }, doc);
	}
	throw new Error('failed to insert certificate');
}

module.exports = {
	deleteCertificateById,
	createCertificate,
};
