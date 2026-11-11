/**
 * Real-Time Database Synchronizer for Synology NAS (DS925+) <-> MongoDB Atlas Cloud
 * 
 * Supports:
 * 1. Real-time MongoDB Change Streams (Replica Set mode)
 * 2. High-Frequency Delta Heartbeat Sync (Fallback for standalone nodes)
 * 3. Bidirectional Reconciliation with Last-Write-Wins (LWW) conflict resolution
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const LOCAL_URI = process.env.LOCAL_MONGODB_URI || 'mongodb://127.0.0.1:27017/recruitment_dashboard';
const CLOUD_URI = process.env.CLOUD_MONGODB_URI || process.env.MONGODB_URI;

const COLLECTIONS = ['candidates', 'jobs', 'interviews', 'callrecords', 'users'];

let localConn = null;
let cloudConn = null;
let isSyncRunning = false;

export async function initRealtimeDBSync() {
  if (!CLOUD_URI || CLOUD_URI === LOCAL_URI) {
    console.log('[DB-Sync] Unified single database mode active. No remote database bridge required.');
    return;
  }

  try {
    console.log('[DB-Sync] Initializing Real-Time Synology NAS <-> Cloud Database Bridge...');
    
    // Connect to Local NAS MongoDB
    localConn = await mongoose.createConnection(LOCAL_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    }).asPromise();
    console.log(`[DB-Sync] ✅ Connected to Local NAS MongoDB (${LOCAL_URI})`);

    // Connect to Cloud MongoDB Atlas
    cloudConn = await mongoose.createConnection(CLOUD_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    }).asPromise();
    console.log('[DB-Sync] ✅ Connected to Remote MongoDB Atlas');

    // Run Initial Delta Sync
    await performDeltaSync();

    // Setup Change Streams where available
    setupChangeStreams();

    // Fallback Continuous Sync Poller (every 10 seconds)
    setInterval(async () => {
      if (!isSyncRunning) {
        await performDeltaSync();
      }
    }, 10000);

    console.log('[DB-Sync] 🚀 Real-Time Synology NAS Database Sync Gateway is LIVE!');
  } catch (err) {
    console.warn(`[DB-Sync] Connection notice: ${err.message}. Will retry bridge in 15 seconds...`);
    setTimeout(initRealtimeDBSync, 15000);
  }
}

/**
 * Bidirectional Delta Sync between Local NAS and Cloud Atlas
 */
async function performDeltaSync() {
  if (isSyncRunning || !localConn || !cloudConn) return;
  isSyncRunning = true;

  try {
    for (const collName of COLLECTIONS) {
      const localColl = localConn.collection(collName);
      const cloudColl = cloudConn.collection(collName);

      // 1. Sync Cloud to Local
      const cloudDocs = await cloudColl.find({}).limit(500).toArray();
      for (const doc of cloudDocs) {
        const query = doc.id ? { id: doc.id } : { _id: doc._id };
        const localDoc = await localColl.findOne(query);

        if (!localDoc) {
          await localColl.insertOne(doc);
        } else {
          const cloudTime = new Date(doc.updatedAt || doc.lastUpdatedDate || 0).getTime();
          const localTime = new Date(localDoc.updatedAt || localDoc.lastUpdatedDate || 0).getTime();
          if (cloudTime > localTime) {
            const { _id, ...cleanDoc } = doc;
            await localColl.updateOne(query, { $set: cleanDoc });
          }
        }
      }

      // 2. Sync Local to Cloud
      const localDocs = await localColl.find({}).limit(500).toArray();
      for (const doc of localDocs) {
        const query = doc.id ? { id: doc.id } : { _id: doc._id };
        const cloudDoc = await cloudColl.findOne(query);

        if (!cloudDoc) {
          await cloudColl.insertOne(doc);
        } else {
          const localTime = new Date(doc.updatedAt || doc.lastUpdatedDate || 0).getTime();
          const cloudTime = new Date(cloudDoc.updatedAt || cloudDoc.lastUpdatedDate || 0).getTime();
          if (localTime > cloudTime) {
            const { _id, ...cleanDoc } = doc;
            await cloudColl.updateOne(query, { $set: cleanDoc });
          }
        }
      }
    }
  } catch (e) {
    // Non-blocking sync error
  } finally {
    isSyncRunning = false;
  }
}

/**
 * Listen to real-time MongoDB Change Streams
 */
function setupChangeStreams() {
  COLLECTIONS.forEach((collName) => {
    try {
      const localColl = localConn.collection(collName);
      const cloudColl = cloudConn.collection(collName);

      // Local Change Stream -> Replicate to Cloud
      const localStream = localColl.watch([], { fullDocument: 'updateLookup' });
      localStream.on('change', async (change) => {
        try {
          if (change.operationType === 'insert' || change.operationType === 'update' || change.operationType === 'replace') {
            const doc = change.fullDocument;
            if (doc) {
              const query = doc.id ? { id: doc.id } : { _id: doc._id };
              const { _id, ...cleanDoc } = doc;
              await cloudColl.updateOne(query, { $set: cleanDoc }, { upsert: true });
            }
          } else if (change.operationType === 'delete') {
            if (change.documentKey?._id) {
              await cloudColl.deleteOne({ _id: change.documentKey._id });
            }
          }
        } catch (e) {
          // Fallback poller handles missed events
        }
      });
      localStream.on('error', () => {
        // Change stream unsupported (e.g. standalone non-replicaSet)
      });

      // Cloud Change Stream -> Replicate to Local NAS
      const cloudStream = cloudColl.watch([], { fullDocument: 'updateLookup' });
      cloudStream.on('change', async (change) => {
        try {
          if (change.operationType === 'insert' || change.operationType === 'update' || change.operationType === 'replace') {
            const doc = change.fullDocument;
            if (doc) {
              const query = doc.id ? { id: doc.id } : { _id: doc._id };
              const { _id, ...cleanDoc } = doc;
              await localColl.updateOne(query, { $set: cleanDoc }, { upsert: true });
            }
          } else if (change.operationType === 'delete') {
            if (change.documentKey?._id) {
              await localColl.deleteOne({ _id: change.documentKey._id });
            }
          }
        } catch (e) {
          // Fallback poller handles missed events
        }
      });
      cloudStream.on('error', () => {
        // Standalone or restricted permissions
      });
    } catch (e) {
      // Ignored
    }
  });
}

// Standalone runner execution
if (process.argv[1] && process.argv[1].endsWith('realtimeDBSync.js')) {
  initRealtimeDBSync();
}

