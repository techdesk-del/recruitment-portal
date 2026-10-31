import { User } from '../models/User.js';
import { ensureDBConnected } from '../config/database.js';

export const DEFAULT_USERS = [
  {
    id: 'user-jobs-01',
    name: 'Urban Gaon Careers',
    email: 'jobs@urbangaon.com',
    password: 'jobs123',
    role: 'admin',
    department: 'Talent Acquisition & Management',
    avatar: 'UG'
  }
];

export async function autoSeedUsers() {
  try {
    const isConnected = await ensureDBConnected();
    if (!isConnected) return;

    // Purge legacy admin account
    await User.deleteMany({ email: 'admin@urbangaon.com' });
    console.log('🗑️ [Auth Seeder] Removed legacy admin account: admin@urbangaon.com');

    for (const u of DEFAULT_USERS) {
      let user = await User.findOne({ email: u.email });
      if (!user) {
        user = new User(u);
        await user.save();
        console.log(`🔐 [Auth Seeder] Created primary user: ${u.email}`);
      } else {
        // Ensure credentials and role are synchronized
        user.name = u.name;
        user.avatar = u.avatar;
        user.password = u.password;
        user.role = 'admin';
        user.status = 'active';
        await user.save();
        console.log(`🔐 [Auth Seeder] Synchronized credentials for: ${u.email}`);
      }
    }
  } catch (err) {
    console.warn('⚠️ [Auth Seeder] Note during user seeding:', err.message);
  }
}
