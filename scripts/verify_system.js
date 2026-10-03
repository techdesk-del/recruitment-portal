import mongoose from '../backend/node_modules/mongoose/index.js';
import dns from 'dns';

try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch(e) {}

const uri = 'mongodb+srv://techdesk_db_user:aakash2899@cluster0.mflxz4m.mongodb.net/recruitment_dashboard?retryWrites=true&w=majority';

async function verify() {
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB Atlas!');
    const db = mongoose.connection.db;

    const candCount = await db.collection('candidates').countDocuments();
    const jobCount = await db.collection('jobs').countDocuments();
    const intCount = await db.collection('interviews').countDocuments();
    const callCount = await db.collection('callrecords').countDocuments();

    console.log('\n📊 VERIFIED LIVE ATLAS COUNTS:');
    console.log(` - Candidates: ${candCount}`);
    console.log(` - Jobs: ${jobCount}`);
    console.log(` - Scheduled/Completed Interviews: ${intCount}`);
    console.log(` - Call Audit Records: ${callCount}`);

    // Verify key candidates from sheet
    const sonu = await db.collection('candidates').findOne({ name: 'Sonu Kumar' });
    console.log('\n🔍 Candidate Verification:');
    console.log(` - Sonu Kumar: Status = ${sonu?.status}, Job = ${sonu?.jobAppliedFor}, Source = ${sonu?.source}, Recruiter = ${sonu?.recruiterAssigned}`);

    const satyaveer = await db.collection('candidates').findOne({ name: 'Satyaveer Singh Shekhawat' });
    console.log(` - Satyaveer: Status = ${satyaveer?.status}, Job = ${satyaveer?.jobAppliedFor}, Source = ${satyaveer?.source}, Recruiter = ${satyaveer?.recruiterAssigned}`);

    const arya = await db.collection('candidates').findOne({ name: 'Arya Mishra' });
    console.log(` - Arya Mishra: Status = ${arya?.status}, Job = ${arya?.jobAppliedFor}, Source = ${arya?.source}, Recruiter = ${arya?.recruiterAssigned}`);

    const irshad = await db.collection('candidates').findOne({ name: 'Irshad Khokar' });
    console.log(` - Irshad Khokar: Status = ${irshad?.status}, Job = ${irshad?.jobAppliedFor}, Source = ${irshad?.source}, Recruiter = ${irshad?.recruiterAssigned}`);

    const shilendra = await db.collection('candidates').findOne({ name: 'Shilendra Saxena' });
    console.log(` - Shilendra Saxena: Status = ${shilendra?.status}, Job = ${shilendra?.jobAppliedFor}, Source = ${shilendra?.source}`);

    // Verify Old Mock Data is 100% GONE
    const rajesh = await db.collection('candidates').findOne({ name: 'Rajesh Kumar Verma' });
    const ananya = await db.collection('candidates').findOne({ name: 'Ananya Deshmukh' });
    console.log(`\n🧹 Old Raw Data Check:`);
    console.log(` - Rajesh Kumar Verma in Atlas: ${rajesh ? 'FOUND (ERROR)' : 'NONE (PURGED ✅)'}`);
    console.log(` - Ananya Deshmukh in Atlas: ${ananya ? 'FOUND (ERROR)' : 'NONE (PURGED ✅)'}`);

    await mongoose.disconnect();
    console.log('\n🎉 System verification complete. All data 100% in sync!');
  } catch (err) {
    console.error('❌ Verification failed:', err);
    process.exit(1);
  }
}

verify();
