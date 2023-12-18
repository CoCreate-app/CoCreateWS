const { MongoClient } = require('mongodb');

const storageUrl = '';
const database = '652c8d62679eca03e0b116a7'

async function removeDuplicates() {
    let client;
    try {
        client = await MongoClient.connect(storageUrl, { useNewUrlParser: true, useUnifiedTopology: true });
        const db = client.db(database);

        const duplicates = await db.collection('careers').aggregate([
            {
                $group: {
                    _id: "$name", // Group by the `name` field
                    uniqueIds: { $addToSet: "$_id" }, // Add all `_id`s to an array
                    count: { $sum: 1 } // Count occurrences
                }
            },
            {
                $match: {
                    count: { $gt: 1 } // Match groups having more than 1 occurrence
                }
            }
        ]).toArray();

        for (const doc of duplicates) {
            doc.uniqueIds.shift(); // Keep the first `_id` and remove the rest
            await db.collection('careers').deleteMany({ _id: { $in: doc.uniqueIds } });
        }

        console.log("Duplicates removed successfully.");
    } catch (err) {
        console.error("An error occurred:", err);
    } finally {
        if (client) {
            await client.close();
        }
    }
}

removeDuplicates();
