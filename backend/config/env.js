import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load backend/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config(); // Also load root .env as fallback

export const ENV = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://techdesk_db_user:aakash2899@cluster0.mflxz4m.mongodb.net/recruitment_dashboard?retryWrites=true&w=majority',
  LINKEDIN_SYNC_EMAIL: process.env.LINKEDIN_SYNC_EMAIL,
  LINKEDIN_SYNC_PASSWORD: process.env.LINKEDIN_SYNC_PASSWORD,
  LINKEDIN_IMAP_HOST: process.env.LINKEDIN_IMAP_HOST || 'imap.gmail.com',
  LINKEDIN_IMAP_PORT: parseInt(process.env.LINKEDIN_IMAP_PORT || '993', 10),
  JWT_SECRET: process.env.JWT_SECRET || 'urbangaon_enterprise_jwt_secret_key_2026_rbac_production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  REDIS_URL: process.env.REDIS_URL || '',
  REDIS_HOST: process.env.REDIS_HOST || '127.0.0.1',
  REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379', 10),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || '',
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_FROM: process.env.SMTP_FROM || 'UrbanGaon Careers <careers@urbangaon.com>',
  COMPANY_NAME: 'UrbanGaon',
  COMPANY_WEBSITE: 'https://urbangaon.com'
};
