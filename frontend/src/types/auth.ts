export type UserRole = 'admin' | 'recruiter' | 'hiring_manager';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  avatar?: string;
  status?: 'active' | 'inactive';
  lastLogin?: string;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: AuthUser;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  department?: string;
}

export type AuthPermission =
  | 'manage_users'
  | 'delete_candidate'
  | 'create_candidate'
  | 'bulk_upload'
  | 'edit_candidate'
  | 'change_candidate_status'
  | 'schedule_interview'
  | 'calling_desk'
  | 'submit_evaluation'
  | 'export_data'
  | 'system_settings';

export const ROLE_PERMISSIONS: Record<UserRole, AuthPermission[]> = {
  admin: [
    'manage_users',
    'delete_candidate',
    'create_candidate',
    'bulk_upload',
    'edit_candidate',
    'change_candidate_status',
    'schedule_interview',
    'calling_desk',
    'submit_evaluation',
    'export_data',
    'system_settings',
  ],
  recruiter: [
    'create_candidate',
    'bulk_upload',
    'edit_candidate',
    'change_candidate_status',
    'schedule_interview',
    'calling_desk',
    'submit_evaluation',
    'export_data',
  ],
  hiring_manager: [
    'submit_evaluation',
    'schedule_interview',
    'export_data',
  ],
};

export const ROLE_LABELS: Record<UserRole, { label: string; badge: string; color: string; description: string }> = {
  admin: {
    label: 'Administrator',
    badge: 'Admin',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: 'Full corporate access: manage users, delete candidates, pipeline, and settings.'
  },
  recruiter: {
    label: 'Lead Recruiter',
    badge: 'Recruiter',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    description: 'Pipeline manager: candidate intake, calling desk, stage progression & notes.'
  },
  hiring_manager: {
    label: 'Hiring Manager',
    badge: 'Manager',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    description: 'Evaluator: view candidate profiles, scorecards, feedback & interview schedules.'
  }
};
