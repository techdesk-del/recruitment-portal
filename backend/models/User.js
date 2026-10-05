import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, trim: true },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true, 
    lowercase: true,
    index: true 
  },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['admin', 'recruiter', 'hiring_manager'], 
    default: 'recruiter',
    index: true 
  },
  department: { type: String, default: 'Recruitment & HR' },
  avatar: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['active', 'inactive'], 
    default: 'active' 
  },
  lastLogin: { type: String, default: () => new Date().toISOString() }
}, {
  timestamps: true
});

// Hash password before saving if modified
UserSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Safe JSON serialization omitting password hash
UserSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
