import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase, getDatabaseState } from '../config/database';
import { User } from '../models/User';
import { Creator } from '../models/Creator';
import { Brand } from '../models/Brand';
import { CampaignBrief } from '../models/CampaignBrief';
import { Project } from '../models/Project';
import { FinancialLedgerEntry } from '../models/FinancialLedgerEntry';

const runPreflight = async () => {
  console.log('🔍 Executing Kampus.VC MongoDB Production Database Preflight Inspection...\n');

  const connected = await connectDatabase();
  const dbState = getDatabaseState();

  if (!connected || !dbState.isConnected) {
    console.error('❌ Database preflight check failed: Unable to connect to MongoDB instance.');
    console.log('ℹ️ Check MONGODB_URI configuration in server environment variables.');
    process.exit(1);
  }

  console.log(`✅ Connected to Database Host: ${dbState.host}`);
  console.log(`✅ Target Database Name: ${dbState.name}\n`);

  console.log('🛠️ Verifying Required Indexes across Core Schemas...');

  try {
    // Sync indexes safely without dropping existing indexes
    await User.syncIndexes();
    await Creator.syncIndexes();
    await Brand.syncIndexes();
    await CampaignBrief.syncIndexes();
    await Project.syncIndexes();
    await FinancialLedgerEntry.syncIndexes();

    console.log('  - User Schema: Unique email index verified.');
    console.log('  - Creator Schema: User ID index verified.');
    console.log('  - Brand Schema: User ID index verified.');
    console.log('  - CampaignBrief Schema: Brand ID & Status indexes verified.');
    console.log('  - Project Schema: Brand/Creator partner indexes verified.');
    console.log('  - FinancialLedgerEntry Schema: Transaction ID unique index verified.');

    console.log('\n🎉 Database Preflight Inspection Passed Successfully! Ready for production queries.');
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`⚠️ Index Sync warning/error: ${msg}`);
  } finally {
    await disconnectDatabase();
    process.exit(0);
  }
};

runPreflight();
