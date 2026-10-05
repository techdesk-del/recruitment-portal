import { User } from '../models/User.js';
import { ensureDBConnected } from '../config/database.js';

export const DEFAULT_USERS = [
  {
    id: 'user-admin-01',
    name: 'Urban Gaon',
    email: 'admin@urbangaon.com',
    password: 'admin123',
    role: 'admin',
    department: 'Talent Acquisition & Management',
    avatar: 'UG'
  }
];

export async function autoSeedUsers() {
  try {
    const isConnected = await ensureDBConnected();
    if (!isConnected) return;

    for (const u of DEFAULT_USERS) {
      let user = await User.findOne({ email: u.email });
      if (!user) {
        user = new User(u);
        await user.save();
        console.log(`🔐 [Auth Seeder] Created primary user: ${u.email}`);
      } else {
        // Ensure name is Urban Gaon and password is admin123
        user.name = u.name;
        user.avatar = u.avatar;
        user.password = u.password;
        user.role = 'admin';
        await user.save();
        console.log(`🔐 [Auth Seeder] Synchronized credentials for: ${u.email}`);
      }
    }
  } catch (err) {
    console.warn('⚠️ [Auth Seeder] Note during user seeding:', err.message);
  }
}
