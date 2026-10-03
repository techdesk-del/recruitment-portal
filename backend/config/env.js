import 'dotenv/config';

export const ENV = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://techdesk_db_user:aakash2899@cluster0.mflxz4m.mongodb.net/recruitment_dashboard?retryWrites=true&w=majority',
  LINKEDIN_SYNC_EMAIL: process.env.LINKEDIN_SYNC_EMAIL,
  LINKEDIN_SYNC_PASSWORD: process.env.LINKEDIN_SYNC_PASSWORD,
  LINKEDIN_IMAP_HOST: process.env.LINKEDIN_IMAP_HOST || 'imap.gmail.com',
  LINKEDIN_IMAP_PORT: parseInt(process.env.LINKEDIN_IMAP_PORT || '993', 10)
};
