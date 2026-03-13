// User types matching backend
export enum UserRole {
  CITIZEN = 'citizen',
  CONTRIBUTOR = 'contributor',
  MODERATOR = 'moderator',
  NODAL_OFFICER = 'nodal_officer',
  AUDITOR = 'auditor',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

export interface User {
  id: number;
  phone: string;
  email?: string;
  full_name?: string;
  role: UserRole;
  phone_verified: boolean;
  email_verified: boolean;
  reputation_score: number;
  avatar_url?: string;
  preferred_language: string;
  primary_address?: string;
  bio?: string;
  profile_completion?: 'minimal' | 'basic' | 'complete';
  total_reports?: number;
  total_validations?: number;
  helpful_validations?: number;
  created_at: string;
  updated_at?: string;
}

/** Extended type for profile views that explicitly need all stats fields */
export type UserProfileDetails = Required<Pick<User, 'total_reports' | 'total_validations' | 'helpful_validations'>> & User;

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  user_id: number;
  role: UserRole;
}
