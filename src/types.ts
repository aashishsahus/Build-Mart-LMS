/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RoleId = 'role_sr_acc' | 'role_jr_acc' | 'role_ap_ar' | 'role_tax_assoc' | string;

export interface Role {
  id: RoleId;
  name: string;
  department: string;
  description: string;
  skillRequirements: string[];
}

export type UserStatus = 'Active' | 'Deactivated' | 'Left';

export interface User {
  id: string;
  name: string;
  email: string;
  roleId: RoleId;
  roleIds?: RoleId[]; // Supporting multiple job profiles concurrently
  department: string;
  focusEntity: string; // e.g. "Rathi Buildmart Pvt Ltd", "Accounts Div - Core Matrix"
  avatarUrl?: string;
  password?: string; // Plaintext or secure token for client demonstration
  status?: UserStatus; // 'Active' or 'Deactivated' or 'Left' (Resigned)
}

export interface Chapter {
  id: string;
  roleId: RoleId;
  name: string;
  order: number;
}

export type UnitFrequency = 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Ad-hoc';
export type UnitSkillLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Unit {
  id: string;
  chapterId: string;
  code: string;
  taskName: string;
  frequency: UnitFrequency;
  skillRequired: UnitSkillLevel;
  videoTitle: string;
  videoUrl: string; // YouTube Embed or Vimeo or placeholder link
  description: string;
}

export type ProgressStatus = 'Not Started' | 'In Progress' | 'Completed (Pending Review)' | 'Verified & Mastered';

export interface ProgressHistoryEntry {
  status: ProgressStatus;
  timestamp: string;
  changedBy: string;
  notes?: string;
}

export interface ProgressLog {
  id: string; // userId_unitId
  userId: string;
  unitId: string;
  status: ProgressStatus;
  lastUpdated: string; // ISO Date String
  notes?: string; // Optional user notes when submitting unit
  verifiedBy?: string; // Admin userId who verified
  verificationDate?: string;
  watchPercent?: number; // Calculated watch tracking progress (0-100)
  startedAt?: string;
  completedAt?: string;
  history?: ProgressHistoryEntry[];
}

export interface CertificateTemplate {
  focusEntity: string;
  subHeader: string;
  title: string;
  proudlyAwardedTo: string;
  bodyText: string;
  signatureText: string;
  signatureTitle: string;
  signatureSub: string;
  stampLabel: string;
  establishedText: string;
}

export interface CompanyBranding {
  companyName: string;
  companyAbbreviation: string;
  companyTagline: string;
  logoType: 'icon' | 'image' | 'emoji';
  logoValue: string; // Icon name e.g. "BookOpen", "Shield", URL, or Emoji e.g. "🏢"
}

export interface ExamQuestion {
  id: string;
  chapterId?: string; // Tying to a chapter
  type: 'mcq' | 'text';
  topic: string;
  question: string;
  options?: string[];
  correctAnswerIndex?: number;
  correctAnswerText?: string;
  explanation: string;
  isActive: boolean;
}

export interface ExamConfig {
  examEnabled: boolean;
  requirePassToUnlockNext: boolean;
}


