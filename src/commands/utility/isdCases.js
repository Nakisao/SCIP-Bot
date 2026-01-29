const { MongoClient, ObjectId } = require('mongodb');

// Load dotenv if available
try {
	require('dotenv').config();
}
// eslint-disable-next-line no-empty
catch {}

// Reuse a single MongoClient for the lifetime of the process.
let _client = null;

function getMongoUri() {
	return process.env.MONGODB_LOCAL || 'mongodb://localhost:27017';
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
 * Create a new ISD case or append to an existing one.
 * Checks if a case already exists for the target user.
 * If it exists, appends to it; otherwise, creates a new case.
 * @param {string} targetUserId - The Discord user ID of the target
 * @param {string} creatorUserId - The Discord user ID of the creator
 * @param {string} reason - The reason for creating/appending to the case
 * @param {number} securityLevel - The security level (0-6)
 * @returns {Object} The created or updated case object
 */
async function createOrAppendCase({ targetUserId, creatorUserId, reason, securityLevel }) {
	if (!targetUserId) throw new Error('targetUserId is required');
	if (!creatorUserId) throw new Error('creatorUserId is required');
	if (!reason) throw new Error('reason is required');
	if (securityLevel === undefined || securityLevel === null) throw new Error('securityLevel is required');

	const client = await getClient();
	const db = client.db('ISD');
	const col = db.collection('Cases');

	// Check if a case already exists for this target user
	const existingCase = await col.findOne({ targetUserId });

	if (existingCase) {
		// Append to existing case
		const updatedCase = await col.findOneAndUpdate(
			{ targetUserId },
			{
				$push: {
					entries: {
						_id: new ObjectId(),
						creatorUserId,
						reason,
						securityLevel,
						createdAt: new Date(),
					},
				},
				$set: { updatedAt: new Date() },
			},
			{ returnDocument: 'after' },
		);
		return updatedCase.value;
	}
	else {
		// Create a new case
		const newCase = {
			caseId: new ObjectId().toString(),
			targetUserId,
			createdAt: new Date(),
			updatedAt: new Date(),
			entries: [
				{
					_id: new ObjectId(),
					creatorUserId,
					reason,
					securityLevel,
					createdAt: new Date(),
				},
			],
		};

		const res = await col.insertOne(newCase);
		if (res.insertedId) {
			return Object.assign({ _id: res.insertedId }, newCase);
		}
		throw new Error('failed to insert case');
	}
}

/**
 * Find a case by case ID.
 * @param {string} caseId - The case ID to find
 * @returns {Object|null} The case document or null if not found
 */
async function getCaseById(caseId) {
	if (!caseId) throw new Error('caseId is required');

	const client = await getClient();
	const db = client.db('ISD');
	const col = db.collection('Cases');

	return await col.findOne({ caseId });
}

/**
 * Find a case by target user ID.
 * @param {string} targetUserId - The Discord user ID
 * @returns {Object|null} The case document or null if not found
 */
async function getCaseByTargetUserId(targetUserId) {
	if (!targetUserId) throw new Error('targetUserId is required');

	const client = await getClient();
	const db = client.db('ISD');
	const col = db.collection('Cases');

	return await col.findOne({ targetUserId });
}

module.exports = {
	createOrAppendCase,
	getCaseById,
	getCaseByTargetUserId,
};
