import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 1. Update backend/data/seedData.json
const seedPath = path.join(rootDir, 'backend/data/seedData.json');
if (fs.existsSync(seedPath)) {
  const seedData = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
  let count = 0;
  if (Array.isArray(seedData.interviews)) {
    seedData.interviews = seedData.interviews.map((item, idx) => {
      if (item.round && item.round.includes('Round 1')) {
        item.interviewerName = 'Satyaveer Singh';
        item.interviewerRole = 'HR Recruiter / Screening Lead';
        item.interviewerEmail = 'satyaveer.singh@urbangaon.com';
        count++;
      } else if (item.round && (item.round.includes('Round 2') || item.round.includes('Leadership'))) {
        if (idx % 2 === 0) {
          item.interviewerName = 'Dr Sharmila Yadav';
          item.interviewerRole = 'Director HR / Final Evaluation';
          item.interviewerEmail = 'sharmila.yadav@urbangaon.com';
        } else {
          item.interviewerName = 'CEO (Urban Gaon)';
          item.interviewerRole = 'Chief Executive Officer';
          item.interviewerEmail = 'jobs@urbangaon.com';
        }
        count++;
      }
      return item;
    });
    fs.writeFileSync(seedPath, JSON.stringify(seedData, null, 2), 'utf8');
    console.log(`✅ seedData.json updated: ${count} interviews synced.`);
  }
}

// 2. Update frontend/src/data/mockData.ts
const mockPath = path.join(rootDir, 'frontend/src/data/mockData.ts');
if (fs.existsSync(mockPath)) {
  let content = fs.readFileSync(mockPath, 'utf8');
  // Update Dr Sharmila Yadav on Round 1 to Satyaveer Singh
  content = content.replace(/("round":\s*"Round 1: Screening \/ Technical",[\s\S]*?"interviewerName":\s*)"Dr Sharmila Yadav"/g, '$1"Satyaveer Singh"');
  // Update Sharmila Yadav & Executive Panel to Dr Sharmila Yadav
  content = content.replace(/"interviewerName":\s*"Sharmila Yadav & Executive Panel"/g, '"interviewerName": "Dr Sharmila Yadav"');
  content = content.replace(/"interviewerRole":\s*"Lead Recruiter & Panel Member"/g, '"interviewerRole": "HR Recruiter / Screening Lead"');
  content = content.replace(/"interviewerEmail":\s*"dr\.satyaveer\.singh@urbangaon\.com"/g, '"interviewerEmail": "satyaveer.singh@urbangaon.com"');
  fs.writeFileSync(mockPath, content, 'utf8');
  console.log('✅ mockData.ts updated.');
}

// 3. Update MongoDB Atlas database
try {
  const { connectDB } = await import('../backend/config/database.js');
  await connectDB();
  const { Interview } = await import('../backend/models/Interview.js');

  const allInterviews = await Interview.find({});
  let r1Count = 0;
  let r2Count = 0;

  for (let i = 0; i < allInterviews.length; i++) {
    const doc = allInterviews[i];
    if (doc.round && doc.round.includes('Round 1')) {
      doc.interviewerName = 'Satyaveer Singh';
      doc.interviewerRole = 'HR Recruiter / Screening Lead';
      doc.interviewerEmail = 'satyaveer.singh@urbangaon.com';
      await doc.save();
      r1Count++;
    } else if (doc.round && (doc.round.includes('Round 2') || doc.round.includes('Leadership'))) {
      if (i % 2 === 0) {
        doc.interviewerName = 'Dr Sharmila Yadav';
        doc.interviewerRole = 'Director HR / Final Evaluation';
        doc.interviewerEmail = 'sharmila.yadav@urbangaon.com';
      } else {
        doc.interviewerName = 'CEO (Urban Gaon)';
        doc.interviewerRole = 'Chief Executive Officer';
        doc.interviewerEmail = 'jobs@urbangaon.com';
      }
      await doc.save();
      r2Count++;
    }
  }

  console.log(`✅ MongoDB Atlas updated: ${r1Count} Round 1 interviews -> Satyaveer Singh, ${r2Count} Round 2 interviews -> Dr Sharmila Yadav / CEO.`);
  process.exit(0);
} catch (err) {
  console.error('❌ MongoDB sync error:', err.message);
  process.exit(0);
}
