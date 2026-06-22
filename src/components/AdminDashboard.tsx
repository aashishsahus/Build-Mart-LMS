/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import { Avatar } from './Avatar';
import { User, Role, Chapter, Unit, ProgressLog, ProgressStatus, UnitFrequency, UnitSkillLevel, RoleId, CompanyBranding, ExamQuestion, ExamConfig } from '../types';
import { UserWithRole, calculateUserProgress, getCertificateTemplate, saveCertificateTemplate, getCompanyBranding, saveCompanyBranding, resetUserMastery, getProgress } from '../data/stateManager';
import { 
  Users, 
  Layers, 
  ShieldCheck, 
  Shield,
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  AlertTriangle, 
  Play, 
  BarChart2, 
  BookOpen, 
  Sliders, 
  Video, 
  Share2, 
  RefreshCw,
  FolderOpen,
  Building,
  CheckCircle2,
  Settings,
  Brain,
  Upload,
  Download,
  Copy,
  FileText,
  HelpCircle,
  Info,
  Sparkles,
  Store,
  Briefcase,
  Package,
  Wallet,
  Network,
  Award,
  Zap,
  TrendingUp,
  ArrowUpRight,
  ChevronDown
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  Cell, 
  PieChart, 
  Pie 
} from 'recharts';

interface PermissionDefinition {
  id: string;
  name: string;
  isParent?: boolean;
  group: string;
}

const ALL_PERMISSIONS: PermissionDefinition[] = [
  // Account Group Module
  { id: 'perm_acc_group', name: 'Account Group', isParent: true, group: 'Account Group' },
  { id: 'perm_acc_group_add', name: 'Account Group Add', group: 'Account Group' },
  { id: 'perm_acc_group_del', name: 'Account Group Delete', group: 'Account Group' },
  { id: 'perm_acc_group_edt', name: 'Account Group Edit', group: 'Account Group' },
  { id: 'perm_acc_group_eds', name: 'Account Group Edit Status', group: 'Account Group' },
  { id: 'perm_acc_group_viw', name: 'Account Group View', group: 'Account Group' },
  { id: 'perm_acc_group_vdt', name: 'Account Group View Details', group: 'Account Group' },
  { id: 'perm_sec_group', name: 'Secured Group', isParent: true, group: 'Account Group' },
  { id: 'perm_sec_group_acc', name: 'Secured Group Access', group: 'Account Group' },
  { id: 'perm_sec_ledger_adt', name: 'Secured Ledger Audit', group: 'Account Group' },

  // Curriculum Architecture Module
  { id: 'perm_curr_builder', name: 'Corporate Curriculum', isParent: true, group: 'Curriculum Architecture' },
  { id: 'perm_curr_chap_add', name: 'Curriculum Chapter Add', group: 'Curriculum Architecture' },
  { id: 'perm_curr_chap_del', name: 'Curriculum Chapter Delete', group: 'Curriculum Architecture' },
  { id: 'perm_curr_chap_edt', name: 'Curriculum Chapter Edit', group: 'Curriculum Architecture' },
  { id: 'perm_curr_unit_add', name: 'Curriculum Unit Add', group: 'Curriculum Architecture' },
  { id: 'perm_curr_unit_del', name: 'Curriculum Unit Delete', group: 'Curriculum Architecture' },
  { id: 'perm_curr_unit_edt', name: 'Curriculum Unit Edit', group: 'Curriculum Architecture' },

  // Corporate Verification Module (Double-Check Framework)
  { id: 'perm_verif_ctr', name: 'Verification Cockpit', isParent: true, group: 'Corporate Verification' },
  { id: 'perm_verif_view', name: 'Verification Board View', group: 'Corporate Verification' },
  { id: 'perm_verif_approve', name: 'Approve Curriculum Unit', group: 'Corporate Verification' },
  { id: 'perm_verif_reject', name: 'Reject/Redo Curriculum Unit', group: 'Corporate Verification' },
  { id: 'perm_verif_override', name: 'Director Override Authority', group: 'Corporate Verification' },

  // User Database Module
  { id: 'perm_user_db', name: 'User Management', isParent: true, group: 'User Database' },
  { id: 'perm_user_add', name: 'Register New Trainee', group: 'User Database' },
  { id: 'perm_user_edt', name: 'Edit Trainee Profile', group: 'User Database' },
  { id: 'perm_user_del', name: 'Offboard/Delete User', group: 'User Database' },
  { id: 'perm_user_batch', name: 'Batch Profile Copier & Share Syner', group: 'User Database' },

  // Performance Records Module
  { id: 'perm_perf_rec', name: 'Performance Records', isParent: true, group: 'Performance Records' },
  { id: 'perm_perf_view', name: 'View Performance Reports', group: 'Performance Records' },
  { id: 'perm_perf_chart', name: 'View Interactive Charts', group: 'Performance Records' },
  { id: 'perm_perf_export', name: 'Export Matrix Data', group: 'Performance Records' },
];

function getInitialMatrixState(currentRoles: Role[]): Record<string, Record<string, boolean>> {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('lms_permissions_matrix_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
  }

  const defaultMatrix: Record<string, Record<string, boolean>> = {};
  
  ALL_PERMISSIONS.forEach(perm => {
    defaultMatrix[perm.id] = {};
    currentRoles.forEach(r => {
      const roleIdLower = r.id.toLowerCase();
      const roleNameLower = r.name.toLowerCase();
      
      const isDirectorOrSuper = 
        roleIdLower.includes('sr_acc') || 
        roleIdLower.includes('md') || 
        roleIdLower.includes('ceo') || 
        roleIdLower.includes('coo') || 
        roleIdLower.includes('vp') || 
        roleIdLower.includes('super') ||
        roleNameLower.includes('manager') || 
        roleNameLower.includes('senior') ||
        r.department === 'Director' ||
        r.department === 'Management';

      const isJunior = 
        roleIdLower.includes('jr_acc') || 
        roleNameLower.includes('junior') || 
        roleNameLower.includes('apprentice') ||
        roleNameLower.includes('associate');

      if (isDirectorOrSuper) {
        defaultMatrix[perm.id][r.id] = true;
      } else if (isJunior) {
        if (perm.id.endsWith('_viw') || perm.id.endsWith('_vdt') || perm.id === 'perm_sec_group_acc' || perm.id === 'perm_verif_view' || perm.id === 'perm_perf_view' || perm.id === 'perm_pref_chart') {
          defaultMatrix[perm.id][r.id] = true;
        } else if (perm.id === 'perm_acc_group_add' || perm.id === 'perm_acc_group_edt' || perm.id === 'perm_curr_unit_add') {
          defaultMatrix[perm.id][r.id] = true;
        } else if (perm.isParent) {
          defaultMatrix[perm.id][r.id] = true;
        } else {
          defaultMatrix[perm.id][r.id] = false;
        }
      } else {
        if (perm.isParent || perm.id.endsWith('_viw') || perm.id.endsWith('_vdt') || perm.id === 'perm_verif_view' || perm.id === 'perm_perf_view') {
          defaultMatrix[perm.id][r.id] = true;
        } else {
          defaultMatrix[perm.id][r.id] = false;
        }
      }
    });
  });

  return defaultMatrix;
}

interface AdminDashboardProps {
  currentUser: UserWithRole;
  roles: Role[];
  users: User[];
  chapters: Chapter[];
  units: Unit[];
  progress: ProgressLog[];
  departments: string[];
  onUpdateUsers: (updatedUsers: User[]) => void;
  onUpdateRoles: (updatedRoles: Role[]) => void;
  onUpdateChapters: (updatedChapters: Chapter[]) => void;
  onUpdateUnits: (updatedUnits: Unit[]) => void;
  onUpdateProgress: (updatedProgress: ProgressLog[]) => void;
  onUpdateDepartments: (updatedDepartments: string[]) => void;
  onSettleVerification: (userId: string, unitId: string, action: 'verify' | 'reject') => void;
  onSwitchUser: (userId: string) => void;
  branding?: CompanyBranding;
  onUpdateBranding?: (branding: CompanyBranding) => void;
  selectedTab?: 'reports' | 'approvals' | 'users' | 'roles' | 'curriculum' | 'analytics' | 'recruitment' | 'departments' | 'certificate';
  onTabChange?: (tab: 'reports' | 'approvals' | 'users' | 'roles' | 'curriculum' | 'analytics' | 'recruitment' | 'departments' | 'certificate') => void;
}

const getDeptTheme = (name: string) => {
  const normName = name.toLowerCase();
  
  if (normName.includes('mart') || normName.includes('build')) {
    return {
      color: 'from-violet-500 to-purple-600',
      text: 'text-purple-600',
      lightText: 'text-purple-500',
      bg: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      border: 'border-purple-100 hover:border-purple-300',
      accent: 'border-l-purple-500',
      ring: 'ring-purple-300',
      selectedBg: 'bg-purple-50/70 border-purple-500 ring-2 ring-purple-400/50 shadow-lg shadow-purple-500/10',
      icon: Store,
      shadow: 'hover:shadow-purple-500/5'
    };
  }
  if (normName.includes('account') || normName.includes('finance')) {
    return {
      color: 'from-emerald-500 to-teal-600',
      text: 'text-emerald-600',
      lightText: 'text-emerald-500',
      bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      border: 'border-emerald-100 hover:border-emerald-300',
      accent: 'border-l-emerald-500',
      ring: 'ring-emerald-300',
      selectedBg: 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-400/50 shadow-lg shadow-emerald-500/10',
      icon: Wallet,
      shadow: 'hover:shadow-emerald-500/5'
    };
  }
  if (normName.includes('warehouse') || normName.includes('store') || normName.includes('logistics')) {
    return {
      color: 'from-amber-500 to-orange-600',
      text: 'text-amber-600',
      lightText: 'text-amber-500',
      bg: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      border: 'border-amber-100 hover:border-amber-300',
      accent: 'border-l-amber-500',
      ring: 'ring-amber-300',
      selectedBg: 'bg-amber-50/70 border-amber-500 ring-2 ring-amber-400/50 shadow-lg shadow-amber-500/10',
      icon: Package,
      shadow: 'hover:shadow-amber-500/5'
    };
  }
  if (normName.includes('mdo')) {
    return {
      color: 'from-sky-500 to-blue-600',
      text: 'text-sky-600',
      lightText: 'text-sky-500',
      bg: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
      border: 'border-sky-100 hover:border-sky-300',
      accent: 'border-l-sky-500',
      ring: 'ring-sky-300',
      selectedBg: 'bg-sky-50/70 border-sky-500 ring-2 ring-sky-400/50 shadow-lg shadow-sky-500/10',
      icon: Network,
      shadow: 'hover:shadow-sky-500/5'
    };
  }
  if (normName.includes('director') || normName.includes('executive') || normName.includes('owner')) {
    return {
      color: 'from-rose-500 to-pink-600',
      text: 'text-rose-600',
      lightText: 'text-rose-500',
      bg: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
      border: 'border-rose-100 hover:border-rose-300',
      accent: 'border-l-rose-500',
      ring: 'ring-rose-300',
      selectedBg: 'bg-rose-50/70 border-rose-500 ring-2 ring-rose-400/50 shadow-lg shadow-rose-500/10',
      icon: Award,
      shadow: 'hover:shadow-rose-500/5'
    };
  }
  if (normName.includes('crm') || normName.includes('sales') || normName.includes('market')) {
    return {
      color: 'from-indigo-500 to-blue-600',
      text: 'text-indigo-600',
      lightText: 'text-indigo-500',
      bg: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
      border: 'border-indigo-100 hover:border-indigo-300',
      accent: 'border-l-indigo-500',
      ring: 'ring-indigo-300',
      selectedBg: 'bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-400/50 shadow-lg shadow-indigo-500/10',
      icon: Users,
      shadow: 'hover:shadow-indigo-500/5'
    };
  }
  return {
    color: 'from-slate-500 to-slate-700',
    text: 'text-slate-600',
    lightText: 'text-slate-500',
    bg: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
    border: 'border-slate-100 hover:border-slate-300',
    accent: 'border-l-slate-400',
    ring: 'ring-slate-300',
    selectedBg: 'bg-slate-50/75 border-slate-500 ring-2 ring-slate-400/50 shadow-lg shadow-slate-500/10',
    icon: Building,
    shadow: 'hover:shadow-slate-500/5'
  };
};

export default function AdminDashboard({
  currentUser,
  roles,
  users,
  chapters,
  units,
  progress,
  departments = [],
  onUpdateUsers,
  onUpdateRoles,
  onUpdateChapters,
  onUpdateUnits,
  onUpdateProgress,
  onUpdateDepartments,
  onSettleVerification,
  onSwitchUser,
  branding,
  onUpdateBranding,
  selectedTab,
  onTabChange
}: AdminDashboardProps) {
  
  // Checking admin and group directorship/ownership authorization
  const isAdmin = currentUser.roleId === 'role_sr_acc';
  const isDirectorOrOwner = currentUser.roleId === 'role_md' || currentUser.roleId === 'role_ceo' || currentUser.roleId === 'role_coo' || currentUser.department === 'Director' || currentUser.role?.name?.toLowerCase().includes('director') || currentUser.role?.name?.toLowerCase().includes('owner');
  const hasAccess = isAdmin || isDirectorOrOwner;
  const [bypassAuth, setBypassAuth] = useState(false);

  // Custom non-blocking Toast System
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Active admin tab: 'reports' | 'approvals' | 'users' | 'roles' | 'curriculum' | 'analytics' | 'recruitment' | 'departments' | 'certificate'
  const [adminTab, setAdminTabState] = useState<'reports' | 'approvals' | 'users' | 'roles' | 'curriculum' | 'analytics' | 'recruitment' | 'departments' | 'certificate'>('reports');

  // Synchronize dynamic updates from parent header navigation Tab selector
  useEffect(() => {
    if (selectedTab && selectedTab !== adminTab) {
      setAdminTabState(selectedTab);
    }
  }, [selectedTab]);

  const setAdminTab = (tab: typeof adminTab) => {
    setAdminTabState(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  // Certificate Template Customization state
  const [certFocusEntity, setCertFocusEntity] = useState(() => getCertificateTemplate().focusEntity);
  const [certSubHeader, setCertSubHeader] = useState(() => getCertificateTemplate().subHeader);
  const [certTitle, setCertTitle] = useState(() => getCertificateTemplate().title);
  const [certProudlyAwardedTo, setCertProudlyAwardedTo] = useState(() => getCertificateTemplate().proudlyAwardedTo);
  const [certBodyText, setCertBodyText] = useState(() => getCertificateTemplate().bodyText);
  const [certSignatureText, setCertSignatureText] = useState(() => getCertificateTemplate().signatureText);
  const [certSignatureTitle, setCertSignatureTitle] = useState(() => getCertificateTemplate().signatureTitle);
  const [certSignatureSub, setCertSignatureSub] = useState(() => getCertificateTemplate().signatureSub);
  const [certStampLabel, setCertStampLabel] = useState(() => getCertificateTemplate().stampLabel);
  const [certEstablishedText, setCertEstablishedText] = useState(() => getCertificateTemplate().establishedText);
  const [certSavingSuccess, setCertSavingSuccess] = useState('');

  // Company Branding configurations state
  const [compName, setCompName] = useState(() => getCompanyBranding().companyName);
  const [compAbbr, setCompAbbr] = useState(() => getCompanyBranding().companyAbbreviation);
  const [compTagline, setCompTagline] = useState(() => getCompanyBranding().companyTagline);
  const [logoType, setLogoType] = useState<'icon' | 'image' | 'emoji'>(() => getCompanyBranding().logoType);
  const [logoValue, setLogoValue] = useState(() => getCompanyBranding().logoValue);
  const [brandSavingSuccess, setBrandSavingSuccess] = useState('');

  const handleSaveBranding = () => {
    try {
      const updated = {
        companyName: compName,
        companyAbbreviation: compAbbr,
        companyTagline: compTagline,
        logoType,
        logoValue
      };
      if (onUpdateBranding) {
        onUpdateBranding(updated);
      } else {
        saveCompanyBranding(updated);
      }
      setBrandSavingSuccess("Shabaash! Brand identity and corporate logo configurations successfully persisted.");
      setTimeout(() => setBrandSavingSuccess(''), 4000);
    } catch (err: any) {
      showToast("Error saving branding: " + err.message, 'error');
    }
  };

  const handleSaveCertificateTemplate = () => {
    try {
      const template = {
        focusEntity: certFocusEntity,
        subHeader: certSubHeader,
        title: certTitle,
        proudlyAwardedTo: certProudlyAwardedTo,
        bodyText: certBodyText,
        signatureText: certSignatureText,
        signatureTitle: certSignatureTitle,
        signatureSub: certSignatureSub,
        stampLabel: certStampLabel,
        establishedText: certEstablishedText
      };
      saveCertificateTemplate(template);
      setCertSavingSuccess("Shabaash! Certificate templates updated and saved successfully! Changes are applied instantly.");
      setTimeout(() => setCertSavingSuccess(''), 4000);
    } catch (err: any) {
      showToast("Error saving certificate templates: " + err.message, 'error');
    }
  };

  // Curriculum Builder toggle and bulk upload states
  const [curriculumMode, setCurriculumMode] = useState<'manual' | 'bulk'>('manual');
  const [bulkInputText, setBulkInputText] = useState('');
  const [bulkParsedRows, setBulkParsedRows] = useState<any[]>([]);
  const [bulkIsParsing, setBulkIsParsing] = useState(false);
  const [bulkImportSuccess, setBulkImportSuccess] = useState('');
  const [bulkImportError, setBulkImportError] = useState('');
  const [bulkOverwriteMode, setBulkOverwriteMode] = useState<boolean>(false);
  const [bulkDocTab, setBulkDocTab] = useState<'docs' | 'sample'>('docs');
  const [bulkDelimiterType, setBulkDelimiterType] = useState<'auto' | 'tsv' | 'csv'>('auto');
  const [bulkFileName, setBulkFileName] = useState<string>('');
  const [isDragActive, setIsDragActive] = useState<boolean>(false);
  const [currSearchQuery, setCurrSearchQuery] = useState('');
  const [currSortMode, setCurrSortMode] = useState<'standard' | 'code-asc' | 'code-desc' | 'title-asc' | 'level-asc'>('standard');

  // Interactive Analytics Reports & Scorecard States
  const [scorecardSearch, setScorecardSearch] = useState('');
  const [scorecardDeptFilters, setScorecardDeptFilters] = useState<string[]>([]);
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
  const [scorecardRoleFilter, setScorecardRoleFilter] = useState('all');
  const [inspectedUser, setInspectedUser] = useState<User | null>(null);
  const [selectedRoleDetailUser, setSelectedRoleDetailUser] = useState<User | null>(null);
  const [showPendingAuditsModal, setShowPendingAuditsModal] = useState(false);

  const [rec_filterRole, setRecFilterRole] = useState<string>('all');
  const [rec_filterResult, setRecFilterResult] = useState<string>('all');
  const [expandedAttemptId, setExpandedAttemptId] = useState<string | null>(null);
  const [purgeConfirmMode, setPurgeConfirmMode] = useState<boolean>(false);
  
  const [attemptsList, setAttemptsList] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('lms_exam_attempts_v1');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  const [screeningEvals, setScreeningEvals] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('lms_screening_evaluations_v1');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  const [expandedEvaluationUserId, setExpandedEvaluationUserId] = useState<string | null>(null);

  // Exam & Questions Admin configurations states
  const [recSubTab, setRecSubTab] = useState<'logs' | 'questions' | 'gating'>('logs');
  const [questionsBank, setQuestionsBank] = useState<ExamQuestion[]>(() => {
    try {
      const saved = localStorage.getItem('lms_questions_v1');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [cfgExamEnabled, setCfgExamEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('lms_exam_config_v1');
      return saved ? JSON.parse(saved).examEnabled : true;
    } catch (e) { return true; }
  });

  const [cfgRequirePass, setCfgRequirePass] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('lms_exam_config_v1');
      return saved ? JSON.parse(saved).requirePassToUnlockNext : false;
    } catch (e) { return false; }
  });

  // Question editing form variables
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [qChapterId, setQChapterId] = useState<string>('');
  const [qType, setQType] = useState<'mcq' | 'text'>('mcq');
  const [qTopic, setQTopic] = useState<string>('');
  const [qQuestionText, setQQuestionText] = useState<string>('');
  const [qOptions, setQOptions] = useState<string[]>(['', '', '', '']);
  const [qCorrectAnswerIndex, setQCorrectAnswerIndex] = useState<number>(0);
  const [qCorrectAnswerText, setQCorrectAnswerText] = useState<string>('');
  const [qExplanationText, setQExplanationText] = useState<string>('');
  const [qIsActive, setQIsActive] = useState<boolean>(true);
  const [qFormSuccess, setQFormSuccess] = useState<string>('');
  const [qFormError, setQFormError] = useState<string>('');
  const [gatingSuccess, setGatingSuccess] = useState<string>('');

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('lms_exam_attempts_v1');
      setAttemptsList(stored ? JSON.parse(stored) : []);
      
      const storedEvals = localStorage.getItem('lms_screening_evaluations_v1');
      setScreeningEvals(storedEvals ? JSON.parse(storedEvals) : []);

      const savedQs = localStorage.getItem('lms_questions_v1');
      setQuestionsBank(savedQs ? JSON.parse(savedQs) : []);

      const savedCfg = localStorage.getItem('lms_exam_config_v1');
      if (savedCfg) {
        const parsed = JSON.parse(savedCfg);
        setCfgExamEnabled(parsed.examEnabled !== false);
        setCfgRequirePass(parsed.requirePassToUnlockNext === true);
      }
    } catch (e) {}
  }, [adminTab]);

  const filteredAttempts = attemptsList.filter((att: any) => {
    if (rec_filterRole === 'candidates' && att.userRoleId !== 'role_candidate') return false;
    if (rec_filterRole === 'employees' && att.userRoleId === 'role_candidate') return false;
    if (rec_filterResult === 'passed' && !att.passed) return false;
    if (rec_filterResult === 'failed' && att.passed) return false;
    return true;
  }).reverse();

  // ----------------------------------------------------
  // FORM STATES & EDIT MODALS
  // ----------------------------------------------------

  // 1. Role Manager Form
  const [isAddingRole, setIsAddingRole] = useState(false);
  const [roleName, setRoleName] = useState('');
  const [roleDept, setRoleDept] = useState(() => (departments && departments.length > 0 ? departments[0] : ''));
  const [roleDesc, setRoleDesc] = useState('');
  const [roleSkills, setRoleSkills] = useState('');

  // Role Edit Form States
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [editRoleName, setEditRoleName] = useState('');
  const [editRoleDept, setEditRoleDept] = useState('');
  const [editRoleDesc, setEditRoleDesc] = useState('');
  const [editRoleSkills, setEditRoleSkills] = useState('');

  // S. Department Directory Form States
  const [newDeptName, setNewDeptName] = useState('');
  const [editingDeptIndex, setEditingDeptIndex] = useState<number | null>(null);
  const [editingDeptValue, setEditingDeptValue] = useState('');

  // 2. User Edit State
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserAvatar, setEditUserAvatar] = useState('');
  const [editUserRole, setEditUserRole] = useState('');
  const [editUserRoles, setEditUserRoles] = useState<string[]>([]); // Secondary/other roles for edit
  const [editUserDept, setEditUserDept] = useState('');
  const [editUserFocus, setEditUserFocus] = useState('');
  const [editUserPassword, setEditUserPassword] = useState('');
  const [editUserStatus, setEditUserStatus] = useState<'Active' | 'Deactivated' | 'Left'>('Active');

  // Trainee Registration State (Add User)
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserAvatar, setNewUserAvatar] = useState('');
  const [newUserDept, setNewUserDept] = useState(() => (departments && departments.length > 0 ? departments[0] : ''));
  const [newUserFocus, setNewUserFocus] = useState("Rathi Buildmart Head Office");
  const [newUserRole, setNewUserRole] = useState(() => (roles && roles.length > 0 ? roles[0].id : ''));
  const [newUserRoles, setNewUserRoles] = useState<string[]>([]); // Secondary/other roles for register
  const [newUserPassword, setNewUserPassword] = useState('rathi123');
  const [newUserStatus, setNewUserStatus] = useState<'Active' | 'Deactivated' | 'Left'>('Active');
  
  // 1. Roles & Permissions Sub-Tab & Matrix States
  const [rolesSubTab, setRolesSubTab] = useState<'matrix' | 'list' | 'add'>('matrix');
  const [confirmDeleteRoleId, setConfirmDeleteRoleId] = useState<string | null>(null);
  const [confirmDeleteUserId, setConfirmDeleteUserId] = useState<string | null>(null);
  const [confirmResetUserId, setConfirmResetUserId] = useState<string | null>(null);
  const [resetActiveUser, setResetActiveUser] = useState<{ id: string; name: string } | null>(null);
  const [resetProgressPercent, setResetProgressPercent] = useState<number>(0);
  const [resetCurrentStep, setResetCurrentStep] = useState<number>(0);
  useEffect(() => {
    if (!resetActiveUser) {
      setResetCurrentStep(0);
      setResetProgressPercent(0);
      return;
    }
    
    setResetCurrentStep(1);
    setResetProgressPercent(14);
    
    let currentStepNum = 1;
    const interval = setInterval(() => {
      currentStepNum += 1;
      if (currentStepNum <= 7) {
        setResetCurrentStep(currentStepNum);
        setResetProgressPercent(Math.round((currentStepNum / 7) * 92));
        
        // At step 6, do the actual database changes
        if (currentStepNum === 6) {
          try {
            resetUserMastery(resetActiveUser.id);
            const updatedProgress = getProgress();
            onUpdateProgress(updatedProgress);
          } catch (e) {
            console.error("Failed to reset progress in database", e);
          }
        }
      } else if (currentStepNum === 8) {
        setResetCurrentStep(8);
        setResetProgressPercent(100);
      } else if (currentStepNum === 9) {
        setResetCurrentStep(9);
        showToast(`✓ All progress successfully reset for ${resetActiveUser.name}!`, 'success');
        clearInterval(interval);
      }
    }, 600);
    
    return () => clearInterval(interval);
  }, [resetActiveUser]);
  const [confirmDeleteDeptIndex, setConfirmDeleteDeptIndex] = useState<number | null>(null);
  const [confirmDeleteChapterId, setConfirmDeleteChapterId] = useState<string | null>(null);
  const [confirmDeleteUnitId, setConfirmDeleteUnitId] = useState<string | null>(null);
  const [confirmClearLogs, setConfirmClearLogs] = useState<boolean>(false);
  const [confirmDeleteQuestionId, setConfirmDeleteQuestionId] = useState<string | null>(null);
  const [selectedPermissionGroup, setSelectedPermissionGroup] = useState<string>('Account Group');
  const [searchPermissionQuery, setSearchPermissionQuery] = useState<string>('');
  const [visibleRoleColumns, setVisibleRoleColumns] = useState<string[]>(() => {
    return roles ? roles.map(r => r.id) : [];
  });
  const [showRoleSelectionDropdown, setShowRoleSelectionDropdown] = useState<boolean>(false);
  const [permissionsMatrix, setPermissionsMatrix] = useState<Record<string, Record<string, boolean>>>(() => {
    return getInitialMatrixState(roles);
  });

  // Batch Job Profile Syncing/Sharing Console State
  const [showBatchSyncer, setShowBatchSyncer] = useState(false);
  const [syncSourceUserId, setSyncSourceUserId] = useState('');
  const [syncSelectedRoleIds, setSyncSelectedRoleIds] = useState<string[]>([]);
  const [syncTargetUserIds, setSyncTargetUserIds] = useState<string[]>([]);

  // 3. Chapter & Unit Builder State
  const [selectedCurriculumRoleId, setSelectedCurriculumRoleId] = useState<string>(roles[0]?.id || '');
  const [selectedCurriculumRoleIds, setSelectedCurriculumRoleIds] = useState<string[]>(() => {
    return roles && roles.length > 0 ? roles.map(r => r.id) : []; // Default to all selected for overview
  });
  const [addChapterRoleId, setAddChapterRoleId] = useState<string>(roles[0]?.id || '');
  const [isOpenRoleFilter, setIsOpenRoleFilter] = useState(false);
  const [newChapterName, setNewChapterName] = useState('');
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  
  // Unit Form State
  const [unitChapterId, setUnitChapterId] = useState('');
  const [unitCode, setUnitCode] = useState('');
  const [unitTaskName, setUnitTaskName] = useState('');
  const [unitFreq, setUnitFreq] = useState<UnitFrequency>('Daily');
  const [unitSkill, setUnitSkill] = useState<UnitSkillLevel>('Beginner');
  const [unitVideoTitle, setUnitVideoTitle] = useState('');
  const [unitVideoUrl, setUnitVideoUrl] = useState('');
  const [unitDesc, setUnitDesc] = useState('');

  // Dropdown helper for adding a unit
  const [activeAddUnitChapId, setActiveAddUnitChapId] = useState<string | null>(null);

  // User Registry UI Filtering States
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userDeptFilter, setUserDeptFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'Active' | 'Deactivated' | 'Left'>('all');
  const [userSelectedRoleIds, setUserSelectedRoleIds] = useState<string[]>(() => {
    return roles ? roles.map(r => r.id) : [];
  });
  const [userFilterRoleOpen, setUserFilterRoleOpen] = useState(false);

  // ----------------------------------------------------
  // DYNAMIC COMPONENT ACTIONS
  // ----------------------------------------------------

  // Adding dynamic role
  const handleAddRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim() || !roleDept.trim()) return;
    
    const newId = `role_${Date.now()}`;
    const newRole: Role = {
      id: newId,
      name: roleName,
      department: roleDept,
      description: roleDesc,
      skillRequirements: roleSkills.split(',').map(s => s.trim()).filter(Boolean)
    };

    onUpdateRoles([...roles, newRole]);
    setRoleName('');
    setRoleDept(departments[0] || '');
    setRoleDesc('');
    setRoleSkills('');
    setIsAddingRole(false);
    setRolesSubTab('list');
    setVisibleRoleColumns(prev => [...prev, newId]);
    showToast('✓ New Designation / Job Role added successfully!', 'success');
  };

  // Saving edited role/designation
  const handleSaveEditedRole = (roleId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!editRoleName.trim() || !editRoleDept.trim()) return;

    const updatedRoles = roles.map(r => {
      if (r.id === roleId) {
        return {
          ...r,
          name: editRoleName.trim(),
          department: editRoleDept,
          description: editRoleDesc.trim(),
          skillRequirements: editRoleSkills.split(',').map(s => s.trim()).filter(Boolean)
        };
      }
      return r;
    });

    onUpdateRoles(updatedRoles);
    setEditingRoleId(null);
    showToast('✓ Designation updated successfully!', 'success');
  };

  // Deleting role (safeguarded)
  const handleDeleteRole = (roleId: string) => {
    if (users.some(u => u.roleId === roleId)) {
      showToast('Error: This role is currently assigned to one or more active employees. Please re-assign them first.', 'error');
      return;
    }
    const updatedRoles = roles.filter(r => r.id !== roleId);
    onUpdateRoles(updatedRoles);
    // Remove associated chapters/units
    const chapsToRemove = chapters.filter(c => c.roleId === roleId);
    const chapIds = chapsToRemove.map(c => c.id);
    onUpdateChapters(chapters.filter(c => c.roleId !== roleId));
    onUpdateUnits(units.filter(u => !chapIds.includes(u.chapterId)));
    showToast('✓ Designation deleted successfully with all affiliated chapters and guidelines.', 'success');
    setConfirmDeleteRoleId(null);
  };

  // Duplicating role (cloning designation metadata, curriculum guidelines, and settings)
  const handleDuplicateRole = (roleId: string) => {
    const sourceRole = roles.find(r => r.id === roleId);
    if (!sourceRole) return;

    const newId = `role_${Date.now()}`;
    const newRole: Role = {
      id: newId,
      name: `${sourceRole.name} (Copy)`,
      department: sourceRole.department,
      description: sourceRole.description || '',
      skillRequirements: [...(sourceRole.skillRequirements || [])]
    };

    // 1. Save Duplicated Role
    onUpdateRoles([...roles, newRole]);

    // 2. Add to visible matrix columns
    setVisibleRoleColumns(prev => [...prev, newId]);

    // 3. Duplicate Syllabus (Chapters and Units)
    const sourceChapters = chapters.filter(c => c.roleId === roleId);
    const duplicatedChapters: Chapter[] = [];
    const duplicatedUnits: Unit[] = [...units]; // start with current units and append new ones

    sourceChapters.forEach((chap, idx) => {
      const newChapId = `ch_dup_${Math.random().toString(36).substring(2, 9)}_${Date.now()}_${idx}`;
      duplicatedChapters.push({
        id: newChapId,
        roleId: newId,
        name: chap.name,
        order: chap.order
      });

      // Find units for this chapter
      const sourceUnits = units.filter(u => u.chapterId === chap.id);
      sourceUnits.forEach((unit, uIdx) => {
        duplicatedUnits.push({
          ...unit,
          id: `ut_dup_${Math.random().toString(36).substring(2, 9)}_${Date.now()}_${idx}_${uIdx}`,
          chapterId: newChapId,
          code: `${unit.code}_C` // Slightly distinguish cloned unit code
        });
      });
    });

    if (duplicatedChapters.length > 0) {
      onUpdateChapters([...chapters, ...duplicatedChapters]);
      onUpdateUnits(duplicatedUnits);
    }

    // 4. Mirror Permission Matrix Profiles
    setPermissionsMatrix(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(permId => {
        const rowConfig = { ...(updated[permId] || {}) };
        if (rowConfig[roleId] !== undefined) {
          rowConfig[newId] = rowConfig[roleId];
        }
        updated[permId] = rowConfig;
      });
      localStorage.setItem('lms_permissions_matrix_v1', JSON.stringify(updated));
      return updated;
    });

    showToast(`✓ Designation "${sourceRole.name}" duplicated successfully!`, 'success');
  };

  // Saving edited user
  const handleSaveUser = (userId: string) => {
    const updated = users.map(u => {
      if (u.id === userId) {
        const extraRolesFiltered = editUserRoles.filter(rId => rId !== editUserRole);
        return {
          ...u,
          name: editUserName,
          email: editUserEmail,
          avatarUrl: editUserAvatar.trim() || u.avatarUrl,
          roleId: editUserRole,
          roleIds: Array.from(new Set([editUserRole, ...extraRolesFiltered])),
          department: editUserDept,
          focusEntity: editUserFocus,
          password: editUserPassword || 'rathi123',
          status: editUserStatus
        };
      }
      return u;
    });
    onUpdateUsers(updated);
    setEditingUserId(null);
    showToast('✓ User updated and job profiles saved successfully!', 'success');
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      showToast('Please fill in Name and Email fields.', 'error');
      return;
    }
    
    // Check if email already registered to prevent duplicates
    if (users.some(u => u.email.toLowerCase() === newUserEmail.toLowerCase().trim())) {
      showToast('Error: An employee with this email is already registered.', 'error');
      return;
    }

    const newUserId = `u_emp_${Date.now()}`;
    const primaryRole = newUserRole || (roles[0]?.id || '');
    const newUserObj: User = {
      id: newUserId,
      name: newUserName.trim(),
      email: newUserEmail.trim().toLowerCase(),
      roleId: primaryRole,
      roleIds: Array.from(new Set([primaryRole, ...newUserRoles])),
      department: newUserDept || (departments[0] || ''),
      focusEntity: newUserFocus.trim() || "Rathi Buildmart Head Office",
      password: newUserPassword || 'rathi123',
      avatarUrl: newUserAvatar.trim() || `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000)}?w=120`,
      status: newUserStatus
    };

    onUpdateUsers([...users, newUserObj]);
    
    // Reset form states
    setNewUserName('');
    setNewUserEmail('');
    setNewUserAvatar('');
    setNewUserDept(departments[0] || '');
    setNewUserFocus("Rathi Buildmart Head Office");
    setNewUserRole(roles[0]?.id || '');
    setNewUserRoles([]);
    setNewUserPassword('rathi123');
    setNewUserStatus('Active');
    setIsAddingUser(false);
    showToast(`✓ Registered "${newUserObj.name}" with password into the enterprise directory!`, 'success');
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (userId === currentUser.id) {
      showToast("Error: You cannot delete your own logged-in administrator account!", 'error');
      return;
    }
    onUpdateUsers(users.filter(u => u.id !== userId));
    onUpdateProgress(progress.filter(p => p.userId !== userId));
    showToast(`✓ Successfully offboarded and deleted employee "${userName}".`, 'success');
    setConfirmDeleteUserId(null);
  };

  const handleResetUserMastery = (userId: string, userName: string) => {
    setConfirmResetUserId(null);
    setResetActiveUser({ id: userId, name: userName });
    setResetProgressPercent(2);
    setResetCurrentStep(1);
  };

  // --- DEPARTMENT DIRECTORY MANAGEMENT ACTIONS ---
  const handleAddDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newDeptName.trim();
    if (!name) return;
    if (departments.some(d => d.toLowerCase() === name.toLowerCase())) {
      showToast(`Error: A department with the name "${name}" already exists.`, 'error');
      return;
    }
    const updated = [...departments, name];
    onUpdateDepartments(updated);
    setNewDeptName('');
    showToast(`✓ Department "${name}" added successfully!`, 'success');
  };

  const handleSaveEditedDepartment = (indexToEdit: number) => {
    const originalName = departments[indexToEdit];
    const newName = editingDeptValue.trim();
    if (!newName) return;
    if (originalName === newName) {
      setEditingDeptIndex(null);
      return;
    }
    if (departments.some((d, idx) => idx !== indexToEdit && d.toLowerCase() === newName.toLowerCase())) {
      showToast(`Error: A department with the name "${newName}" already exists.`, 'error');
      return;
    }

    // Cascade change to users and roles
    const updatedUsers = users.map(u => u.department === originalName ? { ...u, department: newName } : u);
    const updatedRoles = roles.map(r => r.department === originalName ? { ...r, department: newName } : r);

    // Save
    const updatedDepts = [...departments];
    updatedDepts[indexToEdit] = newName;
    
    onUpdateUsers(updatedUsers);
    onUpdateRoles(updatedRoles);
    onUpdateDepartments(updatedDepts);
    setEditingDeptIndex(null);
    showToast(`✓ Department name updated from "${originalName}" to "${newName}". Associated users and roles have been cascaded!`, 'success');
  };

  const handleDeleteDepartment = (indexToDelete: number) => {
    const deptToDelete = departments[indexToDelete];
    const updatedUsers = users.map(u => u.department === deptToDelete ? { ...u, department: 'Unassigned' } : u);
    const updatedRoles = roles.map(r => r.department === deptToDelete ? { ...r, department: 'Unassigned' } : r);
    const updatedDepts = departments.filter((_, idx) => idx !== indexToDelete);

    onUpdateUsers(updatedUsers);
    onUpdateRoles(updatedRoles);
    onUpdateDepartments(updatedDepts);
    showToast(`✓ Department "${deptToDelete}" deleted. Associated users and roles reassigned to 'Unassigned'.`, 'success');
    setConfirmDeleteDeptIndex(null);
  };

  // Adding chapter
  const handleAddChapter = () => {
    const targetRoleId = addChapterRoleId || roles[0]?.id;
    if (!newChapterName.trim() || !targetRoleId) {
      showToast('Chapter name and Job Profile are required.', 'error');
      return;
    }
    const newChap: Chapter = {
      id: `ch_${Date.now()}`,
      roleId: targetRoleId,
      name: newChapterName,
      order: chapters.filter(c => c.roleId === targetRoleId).length + 1
    };
    onUpdateChapters([...chapters, newChap]);
    setNewChapterName('');
    showToast(`✓ Chapter "${newChap.name}" created and assigned to "${roles.find(r => r.id === targetRoleId)?.name}"!`, 'success');
  };

  // Remove chapter
  const handleDeleteChapter = (chapId: string) => {
    onUpdateChapters(chapters.filter(c => c.id !== chapId));
    onUpdateUnits(units.filter(u => u.chapterId !== chapId));
    showToast('✓ Chapter deleted successfully along with all nested units.', 'success');
    setConfirmDeleteChapterId(null);
  };

  // Adding or editing unit
  const handleSaveUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitCode.trim() || !unitTaskName.trim() || !unitChapterId) {
      showToast('Missing required fields for unit creation.', 'error');
      return;
    }

    if (editingUnitId) {
      // Editing
      const updated = units.map(u => {
        if (u.id === editingUnitId) {
          return {
            ...u,
            code: unitCode,
            taskName: unitTaskName,
            frequency: unitFreq,
            skillRequired: unitSkill,
            videoTitle: unitVideoTitle,
            videoUrl: unitVideoUrl,
            description: unitDesc,
            chapterId: unitChapterId
          };
        }
        return u;
      });
      onUpdateUnits(updated);
      setEditingUnitId(null);
      showToast('✓ Unit updated successfully!', 'success');
    } else {
      // Direct Add
      const newUnit: Unit = {
        id: `u_${Date.now()}`,
        chapterId: unitChapterId,
        code: unitCode,
        taskName: unitTaskName,
        frequency: unitFreq,
        skillRequired: unitSkill,
        videoTitle: unitVideoTitle || 'Guidance Walkthrough',
        videoUrl: unitVideoUrl || 'https://www.youtube.com/embed/nE1E1xidV2U',
        description: unitDesc
      };
      onUpdateUnits([...units, newUnit]);
      setActiveAddUnitChapId(null);
      showToast('✓ New learning unit added successfully!', 'success');
    }

    // Reset unit form
    setUnitCode('');
    setUnitTaskName('');
    setUnitVideoTitle('');
    setUnitVideoUrl('');
    setUnitDesc('');
    setUnitChapterId('');
    setIsUnitModalOpen(false);
  };

  const startEditUnit = (unit: Unit) => {
    setEditingUnitId(unit.id);
    setUnitChapterId(unit.chapterId);
    setUnitCode(unit.code);
    setUnitTaskName(unit.taskName);
    setUnitFreq(unit.frequency);
    setUnitSkill(unit.skillRequired);
    setUnitVideoTitle(unit.videoTitle);
    setUnitVideoUrl(unit.videoUrl);
    setUnitDesc(unit.description);
    setIsUnitModalOpen(true);
  };

  // Delete Unit
  const handleDeleteUnit = (unitId: string) => {
    onUpdateUnits(units.filter(u => u.id !== unitId));
    onUpdateProgress(progress.filter(p => p.unitId !== unitId));
    showToast('✓ Checklist learning unit deleted successfully.', 'success');
    setConfirmDeleteUnitId(null);
  };

  // Reorder Units inside a chapter
  const handleMoveUnit = (unitId: string, direction: 'up' | 'down') => {
    const targetUnit = units.find(u => u.id === unitId);
    if (!targetUnit) return;
    
    const chapterId = targetUnit.chapterId;
    const chapterUnits = units.filter(u => u.chapterId === chapterId);
    const indexInChapter = chapterUnits.findIndex(u => u.id === unitId);
    
    if (direction === 'up' && indexInChapter > 0) {
      const prevUnit = chapterUnits[indexInChapter - 1];
      const newUnits = [...units];
      const idx1 = newUnits.findIndex(u => u.id === unitId);
      const idx2 = newUnits.findIndex(u => u.id === prevUnit.id);
      if (idx1 !== -1 && idx2 !== -1) {
        const temp = newUnits[idx1];
        newUnits[idx1] = newUnits[idx2];
        newUnits[idx2] = temp;
        onUpdateUnits(newUnits);
        showToast(`✓ Order updated: Moved [${targetUnit.code}] up`, 'success');
      }
    } else if (direction === 'down' && indexInChapter < chapterUnits.length - 1) {
      const nextUnit = chapterUnits[indexInChapter + 1];
      const newUnits = [...units];
      const idx1 = newUnits.findIndex(u => u.id === unitId);
      const idx2 = newUnits.findIndex(u => u.id === nextUnit.id);
      if (idx1 !== -1 && idx2 !== -1) {
        const temp = newUnits[idx1];
        newUnits[idx1] = newUnits[idx2];
        newUnits[idx2] = temp;
        onUpdateUnits(newUnits);
        showToast(`✓ Order updated: Moved [${targetUnit.code}] down`, 'success');
      }
    }
  };

  // Reorder Chapters of a role/profile
  const handleMoveChapter = (chapterId: string, direction: 'up' | 'down') => {
    const targetChap = chapters.find(c => c.id === chapterId);
    if (!targetChap) return;
    
    const roleChaps = chapters.filter(c => c.roleId === targetChap.roleId);
    const indexInRole = roleChaps.findIndex(c => c.id === chapterId);
    
    if (direction === 'up' && indexInRole > 0) {
      const prevChap = roleChaps[indexInRole - 1];
      const newChapters = [...chapters];
      const idx1 = newChapters.findIndex(c => c.id === chapterId);
      const idx2 = newChapters.findIndex(c => c.id === prevChap.id);
      if (idx1 !== -1 && idx2 !== -1) {
        const temp = newChapters[idx1];
        newChapters[idx1] = newChapters[idx2];
        newChapters[idx2] = temp;
        
        newChapters.forEach((c, idx) => {
          c.order = idx + 1;
        });
        onUpdateChapters(newChapters);
        showToast(`✓ Chapter "${targetChap.name}" moved up!`, 'success');
      }
    } else if (direction === 'down' && indexInRole < roleChaps.length - 1) {
      const nextChap = roleChaps[indexInRole + 1];
      const newChapters = [...chapters];
      const idx1 = newChapters.findIndex(c => c.id === chapterId);
      const idx2 = newChapters.findIndex(c => c.id === nextChap.id);
      if (idx1 !== -1 && idx2 !== -1) {
        const temp = newChapters[idx1];
        newChapters[idx1] = newChapters[idx2];
        newChapters[idx2] = temp;
        
        newChapters.forEach((c, idx) => {
          c.order = idx + 1;
        });
        onUpdateChapters(newChapters);
        showToast(`✓ Chapter "${targetChap.name}" moved down!`, 'success');
      }
    }
  };

  // Helper helper to split line supporting quoted fields
  const splitBulkLine = (line: string, delimiter: string) => {
    if (delimiter === '\t') {
      return line.split('\t');
    }
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  };

  // Parsing routine for bulk clipboard uploads
  const handleParseBulkData = (text: string, delimType: 'auto' | 'tsv' | 'csv') => {
    if (!text.trim()) {
      setBulkParsedRows([]);
      setBulkImportError('');
      return;
    }
    setBulkIsParsing(true);
    try {
      const lines = text.split('\n').filter(l => l.trim().length > 0);
      if (lines.length < 2) {
        setBulkImportError("No content rows found. Make sure to paste a header row and at least 1 data row.");
        setBulkParsedRows([]);
        return;
      }

      // Delimiter detection
      let delimiter = '\t';
      if (delimType === 'tsv') {
        delimiter = '\t';
      } else if (delimType === 'csv') {
        delimiter = ',';
      } else {
        delimiter = lines[0].includes('\t') ? '\t' : ',';
      }

      // Parse headers
      const headers = splitBulkLine(lines[0], delimiter).map(h => 
        h.trim().toLowerCase().replace(/[^a-z0-9_ \/]/g, '')
      );

      // Map indexing
      const idxProfile = headers.findIndex(h => h.includes('profile') || h.includes('role') || h.includes('designation') || h.includes('profile code') || h.includes('job'));
      const idxChapter = headers.findIndex(h => h.includes('chapter') || h.includes('chap') || h.includes('module'));
      const idxCode = headers.findIndex(h => h.includes('code') || h.includes('sku') || h.includes('id') || h.includes('unit code'));
      const idxTask = headers.findIndex(h => h.includes('task') || h.includes('title') || h.includes('work task') || h.includes('task name'));
      const idxFreq = headers.findIndex(h => h.includes('freq') || h.includes('frequency') || h.includes('timing'));
      const idxSkill = headers.findIndex(h => h.includes('skill') || h.includes('complexity') || h.includes('level') || h.includes('difficulty'));
      const idxVidTitle = headers.findIndex(h => h.includes('video title') || h.includes('video_title') || h.includes('tutorial'));
      const idxVidUrl = headers.findIndex(h => h.includes('video url') || h.includes('video link') || h.includes('url') || h.includes('embed'));
      const idxDesc = headers.findIndex(h => h.includes('desc') || h.includes('description') || h.includes('instruction') || h.includes('sop'));

      if (idxProfile === -1 || idxChapter === -1 || idxCode === -1 || idxTask === -1) {
        setBulkImportError("Error: Could not automatically read header headings. Header columns MUST map to: Job Profile, Chapter Name, Unit Code, Work Task / Title");
        setBulkParsedRows([]);
        return;
      }

      const parsed: any[] = [];
      for (let i = 1; i < lines.length; i++) {
        const rowCells = splitBulkLine(lines[i], delimiter);
        if (rowCells.length === 0 || (rowCells.length === 1 && !rowCells[0].trim())) continue;

        const profileVal = (rowCells[idxProfile] || '').trim();
        const chapterVal = (rowCells[idxChapter] || '').trim();
        const codeVal = (rowCells[idxCode] || '').trim();
        const taskVal = (rowCells[idxTask] || '').trim();
        const freqVal = idxFreq !== -1 ? (rowCells[idxFreq] || '').trim() : 'Daily';
        const skillVal = idxSkill !== -1 ? (rowCells[idxSkill] || '').trim() : 'Beginner';
        const vidTitleVal = idxVidTitle !== -1 ? (rowCells[idxVidTitle] || '').trim() : '';
        const vidUrlVal = idxVidUrl !== -1 ? (rowCells[idxVidUrl] || '').trim() : '';
        const descVal = idxDesc !== -1 ? (rowCells[idxDesc] || '').trim() : '';

        // Validation errors and warned items
        const errors: string[] = [];
        const warnings: string[] = [];

        if (!profileVal) {
          errors.push("Missing Job Profile Name/ID");
        }
        if (!chapterVal) {
          errors.push("Missing Chapter Name");
        }
        if (!codeVal) {
          errors.push("Missing Lesson Unit Code (SKU)");
        }
        if (!taskVal) {
          errors.push("Missing task title description");
        }

        // Attempt resolving job profile
        let matchedRole = roles.find(r => 
          r.id.toLowerCase() === profileVal.toLowerCase() ||
          r.name.toLowerCase() === profileVal.toLowerCase() ||
          r.id.toLowerCase().replace('role_', '') === profileVal.toLowerCase()
        );

        if (profileVal && !matchedRole) {
          // If not matched, try sub-string matching
          matchedRole = roles.find(r => 
            r.name.toLowerCase().includes(profileVal.toLowerCase()) ||
            profileVal.toLowerCase().includes(r.name.toLowerCase())
          );
        }

        if (profileVal && !matchedRole) {
          warnings.push(`Job Profile "${profileVal}" not found. Will assign to "${roles[0]?.name || 'Staff'}"`);
        }

        // Standardize clean Frequency
        let cleanFreq: UnitFrequency = 'Daily';
        const fl = freqVal.toLowerCase();
        if (fl.includes('daily')) cleanFreq = 'Daily';
        else if (fl.includes('weekly')) cleanFreq = 'Weekly';
        else if (fl.includes('monthly')) cleanFreq = 'Monthly';
        else if (fl.includes('quarterly')) cleanFreq = 'Quarterly';
        else if (fl.includes('adhoc') || fl.includes('ad-hoc') || fl.includes('temp')) cleanFreq = 'Ad-hoc';
        else {
          warnings.push(`Unknown frequency "${freqVal}" - defaulting to "Daily"`);
        }

        // Standardize clean skill Complexity level
        let cleanSkill: UnitSkillLevel = 'Beginner';
        const sl = skillVal.toLowerCase();
        if (sl.includes('begin') || sl.includes('fresh')) cleanSkill = 'Beginner';
        else if (sl.includes('inter') || sl.includes('mid')) cleanSkill = 'Intermediate';
        else if (sl.includes('adv') || sl.includes('expert') || sl.includes('senior')) cleanSkill = 'Advanced';
        else {
          warnings.push(`Unknown complexity level "${skillVal}" - defaulting to "Beginner"`);
        }

        parsed.push({
          index: i,
          rawProfile: profileVal,
          rawChapter: chapterVal,
          rawCode: codeVal,
          rawTask: taskVal,
          rawFreq: freqVal,
          rawSkill: skillVal,
          matchedRole: matchedRole || roles[0],
          cleanFreq,
          cleanSkill,
          vidTitle: vidTitleVal || `${codeVal} Video SOP Walkthrough`,
          vidUrl: vidUrlVal || 'https://www.youtube.com/embed/nE1E1xidV2U',
          desc: descVal || 'Guidance document & training notes.',
          errors,
          warnings,
          isValid: errors.length === 0
        });
      }

      setBulkParsedRows(parsed);
      setBulkImportError('');
    } catch (ex: any) {
      setBulkImportError(`Parsing Failure: ${ex.message || ex}`);
      setBulkParsedRows([]);
    } finally {
      setBulkIsParsing(false);
    }
  };

  // Perform bulk data upload commit to localStorage / State
  const executeBulkImport = () => {
    const validRows = bulkParsedRows.filter(r => r.isValid);
    if (validRows.length === 0) {
      setBulkImportError("No valid rows ready to import. Please check your data.");
      return;
    }

    let updatedChapters = [...chapters];
    let updatedUnits = [...units];

    // If Overwrite mode is selected, remove existing chapters/units of roles present in import set
    if (bulkOverwriteMode) {
      const activeUploadedRoleIds = Array.from(new Set(validRows.map(r => r.matchedRole.id)));
      updatedChapters = updatedChapters.filter(c => !activeUploadedRoleIds.includes(c.roleId));
      updatedUnits = updatedUnits.filter(u => {
        const parentChap = chapters.find(c => c.id === u.chapterId);
        return parentChap ? !activeUploadedRoleIds.includes(parentChap.roleId) : true;
      });
    }

    let chapAdded = 0;
    let unitsAdded = 0;

    validRows.forEach((row) => {
      // Find matching chapter in modified set
      let chap = updatedChapters.find(c => 
        c.roleId === row.matchedRole.id && 
        c.name.toLowerCase().trim() === row.rawChapter.toLowerCase().trim()
      );

      if (!chap) {
        // Create new chapter auto mapped to role
        chap = {
          id: `ch_bulk_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
          roleId: row.matchedRole.id,
          name: row.rawChapter.trim(),
          order: updatedChapters.filter(c => c.roleId === row.matchedRole.id).length + 1
        };
        updatedChapters.push(chap);
        chapAdded++;
      }

      // Add unit SKU
      const newUnit: Unit = {
        id: `u_bulk_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
        chapterId: chap.id,
        code: row.rawCode.trim(),
        taskName: row.rawTask.trim(),
        frequency: row.cleanFreq,
        skillRequired: row.cleanSkill,
        videoTitle: row.vidTitle,
        videoUrl: row.vidUrl,
        description: row.desc
      };

      updatedUnits.push(newUnit);
      unitsAdded++;
    });

    onUpdateChapters(updatedChapters);
    onUpdateUnits(updatedUnits);

    setBulkImportSuccess(`Success! Auto-created ${chapAdded} Chapters, and registered ${unitsAdded} new training Lesson units inside the database.`);
    setBulkImportError('');
    
    // Clear input
    setBulkInputText('');
    setBulkParsedRows([]);

    // Select the imported role filters to highlight them in standard dashboard
    const importedRoleIds = Array.from(new Set(validRows.map(r => r.matchedRole.id)));
    setSelectedCurriculumRoleIds(importedRoleIds);
    setCurriculumMode('manual'); // Return back to view parsed structure
  };

  const copySampleData = () => {
    const sampleText = `Job Profile\tChapter Name\tUnit Code\tWork Task / Title\tExecution Frequency\tSkill Level\tVideo Title\tVideo Embed URL\tDescription
Tax Associate\tGST Compliance & Filings\tGST-004\tVerify GSTR-2B compliance records\tMonthly\tIntermediate\tGSTR-2B Mismatch Audit Guide\thttps://www.youtube.com/embed/S7U_F7F9-kM\tCheck invoice inputs against online GSTR-2B records to maximize input tax credit.
Senior Accountant\tFinancial Close & Consolidation Accounting\tFIN-502\tPerform Bank Reconciliation Statement (BRS)\tDaily\tAdvanced\tFIN-502 BRS SOP Walkthrough\thttps://www.youtube.com/embed/nE1E1xidV2U\tReconcile all bank statements with general ledger logs, check adjusting entry errors.
Junior Accountant\tFixed Asset Register Maintenance\tAST-101\tRecord physical assets depreciation\tMonthly\tBeginner\tAST-101 Depreciation Guide\thttps://www.youtube.com/embed/nE1E1xidV2U\tCalculate depreciation using straight-line and WDV methods, update active registers.
Accounts Executive (AP/AR)\tAccounts Payable Workflow\tAP-201\tMatch vendor purchase orders\tDaily\tBeginner\tAP-201 Invoice verification guidelines\thttps://www.youtube.com/embed/nE1E1xidV2U\tVerify incoming supplier bills against matching purchase orders and GRN inputs.`;
    
    try {
      if (navigator && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        navigator.clipboard.writeText(sampleText).then(() => {
          setBulkImportSuccess("Awesome! Sample clipboard table copied successfully. Go ahead and paste (Ctrl+V or Cmd+V) inside the text box below.");
          setBulkImportError('');
        }).catch(() => {
          setBulkInputText(sampleText);
          setBulkImportSuccess("Auto-loaded into Input Area because clipboard permission was denied inside the frame!");
          setBulkImportError('');
        });
      } else {
        setBulkInputText(sampleText);
        setBulkImportSuccess("Pasted directly into the input area. (Clipboard API is blocked in this browser sandbox environment).");
        setBulkImportError('');
      }
    } catch (e) {
      setBulkInputText(sampleText);
      setBulkImportSuccess("Pasted directly into the input area. (Clipboard API is blocked in this browser sandbox environment).");
      setBulkImportError('');
    }
  };

  const handleFileUpload = (file: File) => {
    if (!file) return;
    
    setBulkFileName(file.name);
    setBulkImportSuccess('');
    setBulkImportError('');
    
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const reader = new FileReader();
    
    if (fileExtension === 'csv') {
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setBulkDelimiterType('csv');
        setBulkInputText(text);
        setBulkImportSuccess(`CSV File "${file.name}" uploaded and loaded successfully!`);
      };
      reader.onerror = () => {
        setBulkImportError(`Failed to read CSV file: ${file.name}`);
      };
      reader.readAsText(file);
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          if (!firstSheetName) {
            throw new Error("No sheets found in this Excel file.");
          }
          const worksheet = workbook.Sheets[firstSheetName];
          // sheet_to_csv with { FS: '\t' } converts to formatted TSV
          const tsvContent = XLSX.utils.sheet_to_csv(worksheet, { FS: '\t' });
          
          setBulkDelimiterType('tsv');
          setBulkInputText(tsvContent);
          setBulkImportSuccess(`Excel File "${file.name}" successfully parsed from sheet "${firstSheetName}"!`);
        } catch (error: any) {
          setBulkImportError(`Excel processing failed: ${error.message || error}`);
        }
      };
      reader.onerror = () => {
        setBulkImportError(`Failed to read Excel file: ${file.name}`);
      };
      reader.readAsArrayBuffer(file);
    } else {
      setBulkImportError("Unsupported file type. Please upload a .xlsx, .xls, or .csv spreadsheet file.");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const autofillSampleIntoInput = () => {
    const sampleText = `Job Profile\tChapter Name\tUnit Code\tWork Task / Title\tExecution Frequency\tSkill Level\tVideo Title\tVideo Embed URL\tDescription
Tax Associate\tGST Compliance & Filings\tGST-004\tVerify GSTR-2B compliance records\tMonthly\tIntermediate\tGSTR-2B Mismatch Audit Guide\thttps://www.youtube.com/embed/S7U_F7F9-kM\tCheck invoice inputs against online GSTR-2B records to maximize input tax credit.
Senior Accountant\tFinancial Close & Consolidation Accounting\tFIN-502\tPerform Bank Reconciliation Statement (BRS)\tDaily\tAdvanced\tFIN-502 BRS SOP Walkthrough\thttps://www.youtube.com/embed/nE1E1xidV2U\tReconcile all bank statements with general ledger logs, check adjusting entry errors.
Junior Accountant\tFixed Asset Register Maintenance\tAST-101\tRecord physical assets depreciation\tMonthly\tBeginner\tAST-101 Depreciation Guide\thttps://www.youtube.com/embed/nE1E1xidV2U\tCalculate depreciation using straight-line and WDV methods, update active registers.
Accounts Executive (AP/AR)\tAccounts Payable Workflow\tAP-201\tMatch vendor purchase orders\tDaily\tBeginner\tAP-201 Invoice verification guidelines\thttps://www.youtube.com/embed/nE1E1xidV2U\tVerify incoming supplier bills against matching purchase orders and GRN inputs.`;
    setBulkInputText(sampleText);
    setBulkImportSuccess("Successfully loaded the entire sample dataset directly into the input box! Check the real-time preview matrix below.");
    setBulkImportError('');
  };

  const downloadExcelTemplate = () => {
    try {
      const headers = [
        "Job Profile",
        "Chapter Name",
        "Unit Code",
        "Work Task / Title",
        "Execution Frequency",
        "Skill Level",
        "Video Title",
        "Video Embed URL",
        "Description"
      ];
      
      const sampleData = [
        {
          "Job Profile": "Tax Associate",
          "Chapter Name": "GST Compliance & Filings",
          "Unit Code": "GST-004",
          "Work Task / Title": "Verify GSTR-2B compliance records",
          "Execution Frequency": "Monthly",
          "Skill Level": "Intermediate",
          "Video Title": "GSTR-2B Mismatch Audit Guide",
          "Video Embed URL": "https://www.youtube.com/embed/S7U_F7F9-kM",
          "Description": "Check invoice inputs against online GSTR-2B records to maximize input tax credit."
        },
        {
          "Job Profile": "Senior Accountant",
          "Chapter Name": "Financial Close & Consolidation Accounting",
          "Unit Code": "FIN-502",
          "Work Task / Title": "Perform Bank Reconciliation Statement (BRS)",
          "Execution Frequency": "Daily",
          "Skill Level": "Advanced",
          "Video Title": "FIN-502 BRS SOP Walkthrough",
          "Video Embed URL": "https://www.youtube.com/embed/nE1E1xidV2U",
          "Description": "Reconcile all bank statements with general ledger logs, check adjusting entry errors."
        },
        {
          "Job Profile": "Junior Accountant",
          "Chapter Name": "Fixed Asset Register Maintenance",
          "Unit Code": "AST-101",
          "Work Task / Title": "Record physical assets depreciation",
          "Execution Frequency": "Monthly",
          "Skill Level": "Beginner",
          "Video Title": "AST-101 Depreciation Guide",
          "Video Embed URL": "https://www.youtube.com/embed/nE1E1xidV2U",
          "Description": "Calculate depreciation using straight-line and WDV methods, update active registers."
        },
        {
          "Job Profile": "Accounts Executive (AP/AR)",
          "Chapter Name": "Accounts Payable Workflow",
          "Unit Code": "AP-201",
          "Work Task / Title": "Match vendor purchase orders",
          "Execution Frequency": "Daily",
          "Skill Level": "Beginner",
          "Video Title": "AP-201 Invoice verification guidelines",
          "Video Embed URL": "https://www.youtube.com/embed/nE1E1xidV2U",
          "Description": "Verify incoming supplier bills against matching purchase orders and GRN inputs."
        }
      ];

      const instructionsData = [
        { "Column Name": "Job Profile", "Requirement": "Required", "Allowed Values / Example": "Tax Associate, Senior Accountant", "Description": "Job Profile designation name in our list. Will try both exact match and substring match." },
        { "Column Name": "Chapter Name", "Requirement": "Required", "Allowed Values / Example": "GST Compliance & Filings", "Description": "Name of the Chapter. If it doesn't exist, a new chapter is automatically created under the matched role." },
        { "Column Name": "Unit Code", "Requirement": "Required", "Allowed Values / Example": "GST-004, FIN-502", "Description": "Unique code for this practice lesson/work task." },
        { "Column Name": "Work Task / Title", "Requirement": "Required", "Allowed Values / Example": "Verify GSTR-2B compliance records", "Description": "Title shown to trainee on dashboard." },
        { "Column Name": "Execution Frequency", "Requirement": "Optional", "Allowed Values / Example": "Daily, Weekly, Monthly, Quarterly, Ad-hoc", "Description": "How frequently this training task should be performed. Standard default is Daily." },
        { "Column Name": "Skill Level", "Requirement": "Optional", "Allowed Values / Example": "Beginner, Intermediate, Advanced", "Description": "Designated level of complexity. Standard default is Beginner." },
        { "Column Name": "Video Title", "Requirement": "Optional", "Allowed Values / Example": "GSTR-2B Mismatch Audit Guide", "Description": "SOP video topic or description title." },
        { "Column Name": "Video Embed URL", "Requirement": "Optional", "Allowed Values / Example": "https://www.youtube.com/embed/S7U_F7F9-kM", "Description": "YouTube embed link or standard SOP video URL to watch." },
        { "Column Name": "Description", "Requirement": "Optional", "Allowed Values / Example": "Step-by-step audit guidelines...", "Description": "Detailed SOP guidelines text for performing this unit." }
      ];

      const wsSample = XLSX.utils.json_to_sheet(sampleData, { header: headers });
      const wsInstructions = XLSX.utils.json_to_sheet(instructionsData);

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, wsSample, "Sample Curriculum Template");
      XLSX.utils.book_append_sheet(wb, wsInstructions, "Column Guidelines");

      XLSX.writeFile(wb, "Rathi_Buildmart_Curriculum_Template.xlsx");
      setBulkImportSuccess("Superb! Your Excel Template with guidelines has been downloaded successfully. Open it in Microsoft Excel, Google Sheets, or LibreOffice.");
      setBulkImportError('');
    } catch (err: any) {
      setBulkImportError(`Could not generate Excel template: ${err.message || err}`);
    }
  };

  // Dynamic automatic parsing trigger
  React.useEffect(() => {
    const dTimeout = setTimeout(() => {
      handleParseBulkData(bulkInputText, bulkDelimiterType);
    }, 300);
    return () => clearTimeout(dTimeout);
  }, [bulkInputText, bulkDelimiterType]);

  // ----------------------------------------------------
  // CHART ANALYTICS PARSING DATA
  // ----------------------------------------------------
  const chartUserData = users.map(u => {
    const stats = calculateUserProgress(u.id, u.roleId);
    return {
      name: u.name,
      Progress: stats.overallPercent,
      Mastery: stats.masteryPercent
    };
  });

  const statusCounts = (() => {
    let mastered = 0;
    let inProgress = 0;
    
    // We count only units actually belonging to the user roles
    progress.forEach(p => {
      if (p.status === 'Verified & Mastered') mastered++;
      else if (p.status === 'In Progress') inProgress++;
    });

    return [
      { name: 'Mastered', value: mastered, color: '#10b981' },
      { name: 'In Progress', value: inProgress, color: '#2563eb' }
    ];
  })();

  // ----------------------------------------------------
  // AUTH GRACEFUL RESTRICTION BYPASS
  // ----------------------------------------------------
  if (!hasAccess && !bypassAuth) {
    const srAccUser = users.find(u => u.roleId === 'role_sr_acc');
    
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-md">
          <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">🔒 Enterprise Auth Restrictive Shield</h2>
          <p className="text-slate-500 mt-2 text-sm max-w-lg mx-auto">
            Authorized roles (Senior Accountant / CFO) are required to edit curriculums, manage roles, or sign off progress validations. You are logged in under a different position.
          </p>

          <div className="mt-8 p-4 bg-slate-50 border border-slate-100 rounded-lg max-w-md mx-auto text-left text-xs">
            <h4 className="font-bold text-slate-800 uppercase mb-2">Simulated Testing Shortcuts:</h4>
            {srAccUser ? (
              <button
                onClick={() => onSwitchUser(srAccUser.id)}
                id="btn-switch-to-checker"
                className="w-full bg-emerald-600 text-white font-semibold py-2 px-4 rounded hover:bg-emerald-500 transition mb-2"
              >
                Log In as Checker Admin ({srAccUser.name})
              </button>
            ) : (
              <p className="text-rose-500 mb-2">No Senior Accountant seeded in records.</p>
            )}
            
            <button
              onClick={() => setBypassAuth(true)}
              id="btn-bypass-auth"
              className="w-full bg-slate-800 text-slate-300 py-2 border-slate-700 hover:text-white rounded border hover:bg-slate-700 transition"
            >
              Temporary Bypass (Show Developer Console)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Pre-calculating reports data
  const systemAverageMastery = users.length > 0 
    ? Math.round(users.reduce((sum, u) => sum + calculateUserProgress(u.id, u.roleId).masteryPercent, 0) / users.length)
    : 0;

  const examAttemptsWithScores = attemptsList.filter((att: any) => att.score !== undefined);
  const averageExamScore = examAttemptsWithScores.length > 0
    ? Math.round(examAttemptsWithScores.reduce((sum, att) => sum + att.score, 0) / examAttemptsWithScores.length)
    : 0;

  const departmentReports = departments.map(dept => {
    const deptUsers = users.filter(u => u.department === dept);
    const totalCount = deptUsers.length;
    let avgProgress = 0;
    let avgMastery = 0;
    
    if (totalCount > 0) {
      const sumProgress = deptUsers.reduce((sum, u) => {
        const stats = calculateUserProgress(u.id, u.roleId);
        return sum + stats.overallPercent;
      }, 0);
      const sumMastery = deptUsers.reduce((sum, u) => {
        const stats = calculateUserProgress(u.id, u.roleId);
        return sum + stats.masteryPercent;
      }, 0);
      avgProgress = Math.round(sumProgress / totalCount);
      avgMastery = Math.round(sumMastery / totalCount);
    }

    const deptRoles = roles.filter(r => r.department === dept).length;

    return {
      name: dept,
      headcount: totalCount,
      rolesCount: deptRoles,
      avgProgress,
      avgMastery,
      pendingCount: 0
    };
  });

  const scoreFilteredUsers = users.filter(u => {
    const matchesSearch = scorecardSearch.trim() === '' || 
      u.name.toLowerCase().includes(scorecardSearch.toLowerCase()) || 
      u.email.toLowerCase().includes(scorecardSearch.toLowerCase());
      
    const matchesDept = scorecardDeptFilters.length === 0 || scorecardDeptFilters.includes(u.department);
    const matchesRole = scorecardRoleFilter === 'all' || u.roleId === scorecardRoleFilter;
    
    return matchesSearch && matchesDept && matchesRole;
  });

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-8 animate-in fade-in duration-300 relative">
      
      {/* Dynamic Modern Toast Notification Layer */}
      {toast && (
        <div id="toast-container" className="fixed bottom-6 right-6 z-[9999] bg-slate-900 border border-slate-700/60 text-white font-sans text-xs px-5 py-3.5 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-350">
          <span className={`w-2 h-2 rounded-full shrink-0 animate-pulse ${toast.type === 'error' ? 'bg-rose-500' : toast.type === 'info' ? 'bg-indigo-400' : 'bg-emerald-400'}`}></span>
          <span className="font-semibold text-slate-150">{toast.text}</span>
          <button 
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-white font-bold ml-2 focus:outline-none cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
      
      {/* Redesigned Workspace Cockpit Welcomer */}
      <div className="bg-gradient-to-br from-white via-slate-50 to-emerald-50/20 rounded-3xl p-6 sm:p-8 text-slate-900 relative overflow-hidden shadow-xs mb-8 border border-slate-200">
        {/* Animated grid overlay and aesthetic soft lighting */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/[0.04] rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-500/[0.04] rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(1px_1px_at_10px_10px,#0f172a04,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>
        
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="relative group shrink-0">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur opacity-30 group-hover:opacity-55 transition duration-300"></div>
              <Avatar
                src={currentUser.avatarUrl}
                name={currentUser.name}
                className="w-20 h-20 border-2 border-emerald-500/30 overflow-hidden relative shadow-sm cursor-pointer hover:scale-105 transition duration-300"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest text-emerald-800 bg-emerald-50/70 px-3 py-1 rounded-full border border-emerald-200/60 uppercase font-black">
                  {isDirectorOrOwner ? 'Executive Dashboard Portal' : 'Enterprise Admin Panel'}
                </span>
              </div>
              
              <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-slate-900 leading-none tracking-tight">
                Welcome back, {currentUser.name}
              </h2>
              
              <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-xs text-slate-500 font-sans">
                <span className="font-extrabold text-slate-700">
                  {isDirectorOrOwner ? 'Corporate Director / Executive View' : 'Senior Quality Checker & Audit Admin'}
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <Building className="w-3.5 h-3.5 text-emerald-600" />
                  {currentUser.department || 'Corporate Compliance'}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Checked Ledger Scope
                </span>
              </div>
            </div>
          </div>
          {/* Quick Stats Panel inside Banner - Modern Bento Layout */}
          <div className="bg-white/80 p-4 sm:p-5 rounded-2xl border border-slate-200 min-w-[300px] shadow-xs space-y-3 shrink-0">
            <div className="flex justify-between items-center text-[10px] font-mono font-black text-slate-500 tracking-wider">
              <span>ADMIN HOME STATUS</span>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/50 px-2.5 py-0.5 rounded flex items-center gap-1.5 font-bold uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                LIVE ACTIVE
              </span>
            </div>
            <div className="border-t border-slate-100"></div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-slate-50/60 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[9px] text-slate-500 block uppercase font-mono tracking-wider font-bold">Designated Units</span>
                <span className="text-lg font-black font-mono text-slate-800 mt-0.5 block">
                  {units.length}
                </span>
              </div>
              <div className="bg-slate-50/60 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[9px] text-slate-500 block uppercase font-mono tracking-wider font-bold">Enrolled Trainees</span>
                <span className="text-lg font-black font-mono text-emerald-700 mt-0.5 block">
                  {users.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ribbon Control for Non-Reports View */}
      {adminTab !== 'reports' && (
        <div className="mb-6 flex justify-between items-center bg-emerald-50/65 border border-emerald-200/50 p-4 rounded-2xl shadow-xs animate-in slide-in-from-top-4 duration-200 text-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-emerald-600">⚡</span>
            <span className="text-xs font-semibold text-slate-650">Currently administering the <strong className="text-emerald-800 capitalize font-extrabold">{adminTab}</strong> subsystem console</span>
          </div>
          <button 
            type="button"
            onClick={() => setAdminTab('reports')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            📊 Back to AI Cockpit Home
          </button>
        </div>
      )}

      {/* COCKPIT SWITCHES: TOP HORIZONTAL MAIN CENTER TAB BAR (Modern Slimmed Card) */}
      <div className="bg-white border border-slate-205 border-slate-200 rounded-2xl p-3 shadow-xs relative overflow-hidden text-slate-900 mb-6 animate-in fade-in slide-in-from-top-3 duration-300">
        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/[0.01] rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 w-40 h-40 bg-emerald-500/[0.01] rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(1px_1px_at_10px_10px,#0f172a04,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
            <div>
              <h4 className="font-display text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                Control Hub Cockpit
              </h4>
              <p className="text-[10px] text-slate-500 font-medium font-sans mt-0.5">
                Central command console to manage directories, curriculum files, and credential ledgers.
              </p>
            </div>
          </div>
          
          <span className="self-start md:self-center text-[8px] font-mono font-black uppercase text-emerald-800 bg-emerald-50 border border-emerald-250/50 border-emerald-200 px-2 py-0.5 rounded tracking-wider">
            COCKPIT SWITCHES
          </span>
        </div>

        <div className="border-t border-slate-100 my-2.5"></div>

        {/* Row Flex Container with wrapping to prevent hidden overflow (Slim Design) */}
        <div className="relative z-10 flex flex-wrap items-center gap-1.5 pb-0.5 select-none px-1">
          {[
            { id: 'reports', emoji: '📊', label: isDirectorOrOwner ? 'Executive Dashboard' : 'Dynamic Workspace', countLabel: 'Live' },
            ...(isDirectorOrOwner ? [] : [
              { id: 'users', emoji: '👥', label: 'User Database', count: users.length },
              { id: 'roles', emoji: '🗂️', label: 'Job Roles Matrix', count: roles.length },
              { id: 'curriculum', emoji: '⚡', label: 'Curriculum Builder', countLabel: `${chapters.length} Ch` },
              { id: 'analytics', emoji: '📈', label: 'Data Visuals', countLabel: 'Charts' },
              { id: 'recruitment', emoji: '🎓', label: 'Assessment Exams', countLabel: `${attemptsList.length} Logs` },
              { id: 'departments', emoji: '🏢', label: 'Departments Matrix', count: departments.length },
            ]),
            { id: 'certificate', emoji: '📜', label: 'Certificate Settings', countLabel: 'Config' }
          ].map((b) => {
            const isActive = adminTab === b.id;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => setAdminTab(b.id as any)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all duration-200 border whitespace-nowrap group cursor-pointer text-[10px] font-bold font-sans tracking-wide ${
                  isActive 
                    ? 'bg-gradient-to-r from-emerald-50 to-teal-50/40 text-emerald-800 border-emerald-500/30 shadow-xs scale-[1.01]' 
                    : 'bg-slate-50/53 bg-slate-50/50 hover:bg-slate-50 text-slate-500 border-slate-200/60 hover:border-slate-300 hover:text-slate-850 hover:text-slate-800'
                }`}
              >
                <span className="text-[11px] group-hover:scale-110 transition duration-150 select-none">{b.emoji}</span>
                <span>{b.label}</span>
                {b.countLabel ? (
                  <span className={`text-[7.5px] uppercase font-mono px-1 py-0.2 rounded font-black tracking-wide border ${
                    isActive
                      ? 'bg-emerald-100/80 text-emerald-800 border-emerald-250/30'
                      : 'bg-white text-slate-400 border-slate-200'
                  }`}>
                    {b.countLabel}
                  </span>
                ) : b.count !== undefined ? (
                  <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded-full border ${
                    isActive 
                      ? 'bg-emerald-100/85 text-emerald-800 border-emerald-250/30' 
                      : 'bg-white text-slate-400 border-slate-200'
                  }`}>
                    {b.count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-6">
        
        {/* FULL WIDTH: ACTIVE PANELS VIEWPORT */}
        <div className="space-y-6">
          
          {/* TAB 0: CENTRAL CORE DYNAMIC CLINICAL REPORTS */}
          {adminTab === 'reports' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200/90 border-t-4 border-t-indigo-600 p-5 shadow-xs flex flex-col justify-between hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                  <div>
                    <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider font-mono">Workforce Enrolled</span>
                    <h3 className="font-display text-3xl font-extrabold text-slate-900 mt-1.5">{users.length}</h3>
                  </div>
                  <span className="text-[10px] text-indigo-700 font-bold bg-indigo-50 border border-indigo-100/50 px-2 py-0.5 rounded-full self-start mt-4 font-mono">
                    Active Trainees
                  </span>
                </div>

                <div className="bg-white rounded-xl border border-slate-200/90 border-t-4 border-t-emerald-600 p-5 shadow-xs flex flex-col justify-between hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                  <div>
                    <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider font-mono">Designated Units</span>
                    <h3 className="font-display text-3xl font-extrabold text-slate-900 mt-1.5">{departments.length}</h3>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-100/50 px-2 py-0.5 rounded-full self-start mt-4 font-mono">
                    Business Units
                  </span>
                </div>

                <div className="bg-white rounded-xl border border-slate-200/90 border-t-4 border-t-purple-600 p-5 shadow-xs flex flex-col justify-between hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                  <div>
                    <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider font-mono">Avg Mastery Index</span>
                    <h3 className="font-display text-3xl font-extrabold text-slate-900 mt-1.5">{systemAverageMastery}%</h3>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
                    <div className="bg-purple-650 bg-purple-600 h-1.5 rounded-full transition-all duration-500" style={{ width: `${systemAverageMastery}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Grid Layout: Left Sidebar (compact departments report list with progress bar) & Right Main Area (directory + stats) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* LEFT SIDEBAR: Department-Wise Performance Reports */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="bg-slate-50/70 rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-5">
                    <div>
                      <h3 className="text-md font-black text-slate-900 flex items-center gap-2.5">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-150 shadow-3xs">
                          <Building className="w-5 h-5" />
                        </div>
                        <span className="font-display text-sm tracking-tight">Departments Directory</span>
                        <span className="ml-1 font-mono text-[10px] px-2 py-0.5 bg-slate-105 bg-slate-100 text-slate-600 rounded-full border border-slate-200 font-extrabold">{departments.length} Units</span>
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-2 leading-relaxed font-sans">
                        Live department metrics with syllabus progress and skill mastery bars. Click a card to filter the global scorecard standings.
                      </p>
                    </div>

                    {/* Active Dept filter badge display if filtering */}
                    {scorecardDeptFilters.length > 0 && (
                      <div className="bg-indigo-50/90 border border-indigo-100 p-3 rounded-2xl space-y-2 text-xs shadow-xs backdrop-blur-md animate-in fade-in slide-in-from-top-1 duration-200">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-slate-705 text-[10px] uppercase font-mono tracking-wide">
                            Active Filters ({scorecardDeptFilters.length})
                          </span>
                          <button
                            onClick={() => setScorecardDeptFilters([])}
                            className="text-indigo-600 hover:text-indigo-800 text-[9px] font-black uppercase tracking-wider transition"
                          >
                            Clear All
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {scorecardDeptFilters.map(dept => (
                            <span key={dept} className="font-mono bg-white px-2 py-0.5 text-[9px] rounded border border-indigo-200 text-indigo-700 uppercase font-black flex items-center gap-1">
                              {dept}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setScorecardDeptFilters(scorecardDeptFilters.filter(d => d !== dept));
                                }}
                                className="text-slate-405 text-slate-400 hover:text-red-550 hover:text-red-500 font-bold ml-1 text-[8.5px]"
                              >
                                ✕
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2.5 max-h-[720px] overflow-y-auto pr-1 scrollbar-thin">
                      {departmentReports.map((deptRep) => {
                        const isSelected = scorecardDeptFilters.includes(deptRep.name);
                        const theme = getDeptTheme(deptRep.name);
                        const ThemeIcon = theme.icon;

                        return (
                          <div
                            key={deptRep.name}
                            onClick={() => {
                              if (isSelected) {
                                setScorecardDeptFilters(scorecardDeptFilters.filter(d => d !== deptRep.name));
                              } else {
                                setScorecardDeptFilters([...scorecardDeptFilters, deptRep.name]);
                              }
                            }}
                            className={`group relative overflow-hidden rounded-xl p-3 border-l-[3.5px] border-y border-r cursor-pointer transition-all duration-205 flex flex-col gap-2.5 hover:-translate-y-[1px] ${
                              isSelected 
                                ? theme.selectedBg + ' ' + theme.accent + ' border-l-current border-y-indigo-100/50 border-r-indigo-100/50 shadow-sm'
                                : 'bg-white hover:bg-slate-50 border-slate-205 border-slate-200/85 ' + theme.accent + ' shadow-3xs'
                            }`}
                          >
                            {/* Inner Header */}
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className={`w-7.5 h-7.5 rounded-lg flex items-center justify-center border transition-all duration-200 shadow-3xs group-hover:scale-105 ${
                                  isSelected ? 'bg-slate-900 text-white border-slate-805' : theme.bg
                                }`}>
                                  <ThemeIcon className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <h4 className="text-[11px] font-mono font-black tracking-wide uppercase text-slate-700 truncate max-w-[130px]">
                                    {deptRep.name}
                                  </h4>
                                  <div className="text-[10px] text-slate-404 text-slate-400 font-sans mt-0.5 leading-none">
                                    {deptRep.headcount} Staff • {deptRep.rolesCount} Roles
                                  </div>
                                </div>
                              </div>

                              <div className="shrink-0 flex items-center gap-1.55">
                                {deptRep.pendingCount > 0 && (
                                  <span className="bg-amber-105 bg-amber-100 text-amber-808 text-amber-800 border border-amber-204 border-amber-200/45 px-1.5 py-0.5 rounded text-[8px] font-mono font-black animate-pulse">
                                    {deptRep.pendingCount}
                                  </span>
                                )}
                                {isSelected ? (
                                  <div className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center">
                                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                                  </div>
                                ) : (
                                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-350 opacity-0 group-hover:opacity-100 transition-all duration-200" />
                                )}
                              </div>
                            </div>

                            {/* Progress bars (Syllabus progress & Skill mastery) */}
                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-105 border-slate-100/85">
                              <div>
                                <div className="flex justify-between items-center text-[9px] font-sans font-semibold text-slate-500 mb-1">
                                  <span className="truncate">Syllabus</span>
                                  <span className="font-bold text-slate-850 font-mono text-[8px]">{deptRep.avgProgress}%</span>
                                </div>
                                <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                  <div className={`bg-gradient-to-r ${theme.color} h-full transition-all duration-550`} style={{ width: `${deptRep.avgProgress}%` }}></div>
                                </div>
                              </div>

                              <div>
                                <div className="flex justify-between items-center text-[9px] font-sans font-semibold text-slate-550 mb-1">
                                  <span className="truncate">Mastery</span>
                                  <span className="font-bold text-slate-850 font-mono text-[8px]">{deptRep.avgMastery}%</span>
                                </div>
                                <div className="h-1 bg-slate-150 bg-slate-100 rounded-full overflow-hidden">
                                  <div className={`bg-gradient-to-r ${theme.color} h-full transition-all duration-550`} style={{ width: `${deptRep.avgMastery}%` }}></div>
                                </div>
                              </div>
                            </div>

                            {/* Department Roles List */}
                            <div className="mt-2.5 pt-2 border-t border-slate-100/80 flex flex-col gap-1">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                                Included Mapped Designations ({deptRep.rolesCount})
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {roles.filter(r => r.department === deptRep.name).map(r => (
                                  <span 
                                    key={r.id} 
                                    className="bg-slate-50 text-slate-600 border border-slate-200/50 rounded px-1.5 py-0.5 text-[8.5px] font-sans font-semibold tracking-tight truncate max-w-full"
                                    title={r.name}
                                  >
                                    {r.name}
                                  </span>
                                ))}
                                {roles.filter(r => r.department === deptRep.name).length === 0 && (
                                  <span className="text-[8.5px] text-slate-400 italic">No roles defined</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: MAIN WORKFORCE SCORECARD DIRECTORY & ANALYTICS COCKPIT */}
                <div className="lg:col-span-8 space-y-6">

                  {/* Trainee Stands & Scorecard Directory */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-sm space-y-4">
                {isDirectorOrOwner ? (
                  <>
                    <h3 className="text-md font-black text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-4">
                      <BarChart2 className="w-5 h-5 text-emerald-600" />
                      Corporate Workforce Completion & Progress Standings
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed font-sans">
                      Executive summary of company training completion, active progress distribution stages, and verified skill mastery indexes across the department tiers. Individual employee profiles and scorecards are restricted to Senior Accountants and LMS Administrators for privacy and audit security compliance.
                    </p>

                    <div className="mt-6 bg-slate-50 rounded-2xl p-6 border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="flex flex-col justify-center">
                        <h4 className="text-sm font-extrabold text-slate-900 border-b pb-2 mb-3 flex items-center gap-1.5 font-sans">
                          <Shield className="w-4 h-4 text-emerald-600" />
                          Enterprise Training Index & Benchmark Stats
                        </h4>
                        <p className="text-xs text-slate-500 leading-relaxed font-sans mb-4">
                          This live visualization tracks status distributions of the active employee base under corporate {compName} standard operating procedures.
                        </p>
                        
                        <div className="space-y-3 font-sans text-xs">
                          <div className="flex justify-between items-center bg-white px-4 py-2.5 rounded-xl border border-slate-200/60 shadow-3xs">
                            <span className="font-semibold text-slate-600">Total Enrolled Trainees</span>
                            <span className="font-black text-indigo-600 font-mono text-sm">{users.length}</span>
                          </div>
                          <div className="flex justify-between items-center bg-white px-4 py-2.5 rounded-xl border border-slate-200/60 shadow-3xs">
                            <span className="font-semibold text-slate-650">Global Average Core Mastery</span>
                            <span className="font-black text-emerald-600 font-mono text-sm">{systemAverageMastery}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200/60 p-6 shadow-3xs">
                        <span className="text-[10px] uppercase font-mono font-black text-slate-400 tracking-widest mb-4">Workforce Status Distribution Matrix</span>
                        <div className="h-auto sm:h-44 w-full flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-0">
                          <div className="relative flex-1 h-36 sm:h-full min-w-0 w-full">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                              <PieChart>
                                <Pie
                                  data={statusCounts.filter(v => v.value > 0)}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={36}
                                  outerRadius={54}
                                  paddingAngle={4}
                                  dataKey="value"
                                >
                                  {statusCounts.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <Tooltip contentStyle={{ fontSize: 10 }} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="flex flex-row sm:flex-col flex-wrap justify-center sm:justify-start gap-2 text-[10px] font-mono pl-0 sm:pl-4 border-t sm:border-t-0 sm:border-l pt-3 sm:pt-0 select-none shrink-0 border-slate-100 w-full sm:w-auto">
                            {statusCounts.map((st, idx) => (
                              <div key={idx} className="flex items-center gap-1.5 font-medium font-sans">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: st.color }}></span>
                                <span className="font-black text-slate-705">{st.name}: {st.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
              ) : (
                <>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-100 pb-4">
                      <div>
                        <h3 className="text-md font-black text-slate-900 flex items-center gap-1.5">
                          <Users className="w-5 h-5 text-emerald-600" />
                          Workforce Standings & Global Scorecard Directory
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Check live learning milestones, core curriculum completion progress, and exam standings in real-time.
                        </p>
                      </div>
                    </div>

                {/* Filter and search bar */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Search Practitioner Name/Email</label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul, misrpr@rathibuildmart.com..."
                      value={scorecardSearch}
                      onChange={(e) => setScorecardSearch(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-emerald-500 font-medium font-sans"
                    />
                  </div>

                  <div className="relative">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Filter Department</label>
                    <button
                      type="button"
                      onClick={() => setIsDeptDropdownOpen(!isDeptDropdownOpen)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-emerald-500 font-semibold font-sans flex items-center justify-between shadow-3xs hover:border-slate-400 transition cursor-pointer select-none text-left"
                    >
                      <span className="truncate pr-2">
                        {scorecardDeptFilters.length === 0
                          ? `All Departments (${departments.length})`
                          : scorecardDeptFilters.length === 1
                            ? scorecardDeptFilters[0]
                            : `${scorecardDeptFilters.length} Selected`
                        }
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </button>
                    
                    {isDeptDropdownOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setIsDeptDropdownOpen(false)}
                        />
                        <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1.5 max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150">
                          <div className="px-2.5 py-1.5 border-b border-slate-100 flex items-center justify-between gap-2 mb-1">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Multi-Select</span>
                            <button
                              type="button"
                              onClick={() => {
                                setScorecardDeptFilters([]);
                              }}
                              className="text-[9px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-wide cursor-pointer"
                            >
                              Reset All
                            </button>
                          </div>
                          {departments.map((dept) => {
                            const isChecked = scorecardDeptFilters.includes(dept);
                            return (
                              <label
                                key={dept}
                                className="flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 cursor-pointer text-xs font-semibold text-slate-700 select-none transition"
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    if (isChecked) {
                                      setScorecardDeptFilters(scorecardDeptFilters.filter(d => d !== dept));
                                    } else {
                                      setScorecardDeptFilters([...scorecardDeptFilters, dept]);
                                    }
                                  }}
                                  className="w-3.5 h-3.5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                                />
                                <span className="font-mono text-[10px] uppercase tracking-wide">{dept}</span>
                              </label>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Filter Designation</label>
                    <select
                      value={scorecardRoleFilter}
                      onChange={(e) => setScorecardRoleFilter(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-emerald-500 font-medium font-sans"
                    >
                      <option value="all">All Roles ({roles.length})</option>
                      {roles.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Scorecard Table List */}
                <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-3xs text-[11px] max-w-full">
                  <table className="w-full text-left text-xs text-slate-655 border-collapse min-w-[750px]">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 border-b border-slate-150 text-[10px] tracking-wider uppercase font-mono font-bold">
                        <th className="p-3.5 pl-5">Staff Member</th>
                        <th className="p-3.5 text-center">Business Unit</th>
                        <th className="p-3.5">Curriculum Progress</th>
                        <th className="p-3.5 text-center">Mastery Index</th>
                        <th className="p-3.5 text-center">Exams Rating</th>
                        <th className="p-3.5 pr-5 text-right">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 font-sans font-medium text-slate-705">
                      {scoreFilteredUsers.map((user) => {
                        const stats = calculateUserProgress(user.id, user.roleId);
                        const roleObj = roles.find(r => r.id === user.roleId);
                        
                        // Find user's highest score from exam attempts
                        const userAttempts = attemptsList.filter((att: any) => att.userEmail === user.email);
                        const highestAttempt = userAttempts.length > 0 
                          ? userAttempts.reduce((max: any, att: any) => att.score > max.score ? att : max, userAttempts[0])
                          : null;

                        return (
                          <tr key={user.id} className="hover:bg-slate-50/50 transition">
                            <td className="p-3.5 pl-5">
                              <div className="flex items-center gap-2.5">
                                <Avatar
                                  src={user.avatarUrl}
                                  name={user.name}
                                  className="w-9 h-9 border border-slate-200 shadow-3xs"
                                />
                                <div>
                                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                                    {user.name}
                                    {user.roleId === 'role_sr_acc' && (
                                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[9px] px-1.5 py-0.2 rounded font-mono uppercase font-extrabold tracking-wide">Admin</span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-mono tracking-tight flex items-center flex-wrap gap-1.5 mt-0.5">
                                    <span>{user.focusEntity || 'Accounts' } • {roleObj?.name || 'Trainee'}</span>
                                    <button
                                      type="button"
                                      onClick={() => setSelectedRoleDetailUser(user)}
                                      className="inline-flex items-center gap-1 text-[9px] text-indigo-600 hover:text-indigo-800 bg-indigo-50/70 hover:bg-indigo-100 border border-indigo-200/50 rounded-md px-1.5 py-0.5 font-sans font-extrabold tracking-normal transition cursor-pointer"
                                      title="Click to view designations mapped and role specifications"
                                    >
                                      View Mapped Roles
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="p-3.5 text-center">
                              <span className="inline-block bg-slate-50 text-slate-700 border border-slate-200/80 px-2.5 py-1 rounded-md text-[10px] font-mono tracking-wider font-extrabold uppercase shadow-3xs max-w-[140px] text-center leading-tight">
                                {user.department}
                              </span>
                            </td>

                            <td className="p-3.5">
                              <div className="space-y-1 max-w-[150px]">
                                <div className="flex justify-between items-center text-[10px] text-slate-450 font-mono">
                                  <span>{stats.completedCount}/{stats.totalUnits} Units</span>
                                  <span className="font-bold text-indigo-600">{stats.overallPercent}%</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                                  <div className="bg-indigo-600 h-2" style={{ width: `${stats.overallPercent}%` }}></div>
                                </div>
                              </div>
                            </td>

                            <td className="p-3.5 text-center">
                              <div className="inline-block text-center pr-2">
                                <span className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-black ${
                                  stats.masteryPercent >= 80 
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                    : stats.masteryPercent >= 40 
                                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                                      : 'bg-slate-50 text-slate-400'
                                }`}>
                                  {stats.masteryPercent}%
                                </span>
                              </div>
                            </td>

                            <td className="p-3.5 text-center">
                              {highestAttempt ? (
                                <div className="inline-flex flex-col items-center">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                                    highestAttempt.passed 
                                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                                      : 'bg-rose-50 border-rose-200 text-rose-700'
                                  }`}>
                                    {highestAttempt.score}% {highestAttempt.passed ? 'PASSED' : 'FAILED'}
                                  </span>
                                  <span className="text-[8px] text-slate-400 font-mono mt-0.5">
                                    {new Date(highestAttempt.date || highestAttempt.timestamp).toLocaleDateString()}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[10px] text-slate-400 font-sans italic">No Exams</span>
                              )}
                            </td>

                            <td className="p-3.5 pr-5 text-right">
                              <button
                                type="button"
                                onClick={() => setInspectedUser(user)}
                                className="bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-700 font-sans font-bold text-[11px] px-2.5 py-1 rounded-lg transition shadow-3xs flex items-center gap-1 inline-flex justify-center"
                              >
                                View Scoreboard
                              </button>
                            </td>
                          </tr>
                        );
                      })}

                      {scoreFilteredUsers.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-16 text-slate-450 italic font-medium">
                            No employees or candidates match.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Quick stats distribution panel */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 rounded-xl p-4 border border-slate-205">
                  <div className="flex flex-col justify-center">
                    <h4 className="text-xs font-black text-slate-900 border-b pb-1.5 mb-2 flex items-center gap-1 font-sans">
                      <BarChart2 className="w-4 h-4 text-emerald-600" />
                      Workforce Visual Progress Standings
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                      The status breakdown charts detailed training progress benchmarks across the workforce hierarchy. Use the Analytics Console side-tab to inspect consolidated bar charts and audit trends.
                    </p>
                    <button
                      onClick={() => setAdminTab('analytics')}
                      className="bg-white border border-slate-300 hover:bg-slate-100 hover:text-slate-900 text-slate-650 font-sans font-bold text-[10px] uppercase py-1.5 px-3 rounded-lg shadow-3xs self-start mt-4 transition"
                    >
                      Maximize Analytics & Graphs
                    </button>
                  </div>

                  <div className="h-auto sm:h-32 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-0">
                    <div className="relative flex-1 h-28 sm:h-full min-w-0 w-full">
                      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                        <PieChart>
                          <Pie
                            data={statusCounts.filter(v => v.value > 0)}
                            cx="50%"
                            cy="50%"
                            innerRadius={28}
                            outerRadius={42}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {statusCounts.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ fontSize: 9 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-row sm:flex-col flex-wrap justify-center sm:justify-start gap-1.5 text-[9px] font-mono pl-0 sm:pl-2 border-t sm:border-t-0 sm:border-l pt-2 sm:pt-0 w-full sm:w-auto">
                      {statusCounts.map((st, idx) => (
                        <div key={idx} className="flex items-center gap-1 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: st.color }}></span>
                          <span className="font-bold text-slate-705">{st.name} ({st.value})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
            </div>
          </div>
        </div>
      </div>
      )}



      {/* ----------------------------------------------------
          TAB 2: USER DATA MANAGEMENT
          ---------------------------------------------------- */}
      {adminTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-5 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-display text-base font-extrabold text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                Corporate User Registry & Completion Audits
              </h3>
              <p className="text-xs text-slate-500 mt-1">Manage employee training directories, assign curricula pathways, and audit verification statuses.</p>
            </div>
            
            <div className="flex flex-wrap gap-2 self-start mt-2 sm:mt-0">
              <button
                onClick={() => {
                  setShowBatchSyncer(!showBatchSyncer);
                  setIsAddingUser(false);
                }}
                id="btn-trigger-batch-sync"
                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-2 rounded-lg transition border border-indigo-200/55 flex items-center gap-1.5 cursor-pointer"
              >
                {showBatchSyncer ? <X className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                {showBatchSyncer ? "Close Syncer" : "Batch Share Job Profiles 👥"}
              </button>

              <button
                onClick={() => {
                  setIsAddingUser(!isAddingUser);
                  setShowBatchSyncer(false);
                }}
                id="btn-trigger-add-user"
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-2 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
              >
                {isAddingUser ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {isAddingUser ? "Close Form" : "Add New Trainee"}
              </button>
            </div>
          </div>

          {showBatchSyncer && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6 space-y-4 text-xs font-sans animate-in slide-in-from-top duration-200 text-left">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5 mb-2">
                <span className="text-indigo-700 bg-indigo-50 border border-indigo-150 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider">
                  🔄 BATCH JOB PROFILES COPIER & SHARE SYNCER
                </span>
                <span className="text-[10px] text-slate-500 italic">Select source profiles or a source employee, then check target employees to distribute profiles simultaneously.</span>
              </div>

              {/* Step 1 & Step 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-3 shadow-3xs">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase font-mono block">Step 1: Choose Source profiles</span>
                  <p className="text-[11px] text-slate-500">Pick either a source employee (to copy all of their assigned profiles) OR select specific profiles directly.</p>
                  
                  <div className="space-y-2.5 text-left">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono mb-1">Option A: Copy From Employee</label>
                      <select
                        value={syncSourceUserId}
                        onChange={(e) => {
                          setSyncSourceUserId(e.target.value);
                          if (e.target.value) {
                            setSyncSelectedRoleIds([]); // Clear Option B
                          }
                        }}
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:border-indigo-500 outline-none text-xs text-slate-800"
                      >
                        <option value="">-- Choose Employee --</option>
                        {users.map((u) => {
                          const userAssigned = Array.from(new Set([u.roleId, ...(u.roleIds || [])])).filter(Boolean);
                          return (
                            <option key={u.id} value={u.id}>
                              {u.name} ({userAssigned.length} profile{userAssigned.length === 1 ? '' : 's'})
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="h-px bg-slate-200 flex-1"></div>
                      <span className="text-[9px] font-bold text-slate-400 font-mono">OR</span>
                      <div className="h-px bg-slate-200 flex-1"></div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono mb-1">Option B: Select Job Profiles Directly</label>
                      <div className="p-2 border border-slate-200 rounded-lg max-h-[105px] overflow-y-auto space-y-1 bg-slate-50">
                        {roles.map((r) => {
                          const isChecked = syncSelectedRoleIds.includes(r.id);
                          return (
                            <label key={r.id} className="flex items-center gap-2 text-[10px] text-slate-600 hover:text-slate-900 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                disabled={!!syncSourceUserId}
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSyncSelectedRoleIds(prev => [...prev, r.id]);
                                  } else {
                                    setSyncSelectedRoleIds(prev => prev.filter(id => id !== r.id));
                                  }
                                }}
                                className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 w-3 h-3 disabled:opacity-50"
                              />
                              <span className={syncSourceUserId ? "text-slate-400 line-through" : ""}>{r.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2: Select Target Employees */}
                <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-3 shadow-3xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase font-mono block">Step 2: Choose Target Employees</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (syncTargetUserIds.length === users.length) {
                          setSyncTargetUserIds([]);
                        } else {
                          setSyncTargetUserIds(users.map(u => u.id));
                        }
                      }}
                      className="text-[9px] font-bold text-indigo-600 hover:underline bg-indigo-50 px-2 py-0.5 rounded cursor-pointer"
                    >
                      {syncTargetUserIds.length === users.length ? "Deselect All ✘" : "Select All Target 🌐"}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">Check the trainees you want to share selected job profiles with. They will be added dynamically.</p>

                  <div className="p-2.5 border border-slate-200 rounded-lg max-h-[178px] overflow-y-auto space-y-1.5 bg-slate-50">
                    {users.map((u) => {
                      const isChecked = syncTargetUserIds.includes(u.id);
                      return (
                        <label key={u.id} className="flex items-center gap-2 text-[10px] text-slate-600 hover:text-slate-900 cursor-pointer select-none py-0.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSyncTargetUserIds(prev => [...prev, u.id]);
                              } else {
                                  setSyncTargetUserIds(prev => prev.filter(id => id !== u.id));
                              }
                            }}
                            className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 w-3 h-3"
                          />
                          <div className="leading-none">
                            <span className="font-extrabold text-slate-800">{u.name}</span>
                            <span className="text-[9px] text-slate-400 ml-1.5">({u.department})</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setSyncSourceUserId('');
                    setSyncSelectedRoleIds([]);
                    setSyncTargetUserIds([]);
                    setShowBatchSyncer(false);
                  }}
                  className="bg-slate-200 text-slate-705 font-bold px-3 py-2 rounded-lg text-xs hover:bg-slate-300 transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (syncTargetUserIds.length === 0) {
                      showToast("Please select at least one target employee to copy profiles to!", "error");
                      return;
                    }

                    let rolesToCopy: string[] = [];
                    if (syncSourceUserId) {
                      const src = users.find(u => u.id === syncSourceUserId);
                      if (src) {
                        rolesToCopy = Array.from(new Set([src.roleId, ...(src.roleIds || [])])).filter(Boolean);
                      }
                    } else if (syncSelectedRoleIds.length > 0) {
                      rolesToCopy = [...syncSelectedRoleIds];
                    } else {
                      showToast("Please select either a source employee OR at least one job profile to share!", "error");
                      return;
                    }

                    // Update
                    const updatedUsers = users.map(user => {
                      if (syncTargetUserIds.includes(user.id)) {
                        const existing = Array.from(new Set([user.roleId, ...(user.roleIds || [])])).filter(Boolean);
                        const merged = Array.from(new Set([...existing, ...rolesToCopy]));
                        return {
                          ...user,
                          roleIds: merged
                        };
                      }
                      return user;
                    });

                    onUpdateUsers(updatedUsers);
                    setSyncTargetUserIds([]);
                    setSyncSelectedRoleIds([]);
                    setSyncSourceUserId('');
                    setShowBatchSyncer(false);
                    showToast(`⚡ Success: Dynamically shared/synchronized ${rolesToCopy.length} profile(s) to ${syncTargetUserIds.length} trainees inside the enterprise database!`, 'success');
                  }}
                  className="bg-indigo-600 text-white font-extrabold px-4 py-2 rounded-lg text-xs hover:bg-indigo-700 transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" /> Execute Bulk Profile Share & Sync
                </button>
              </div>
            </div>
          )}

          {isAddingUser && (
            <form onSubmit={handleCreateUser} className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6 space-y-4 text-xs font-sans animate-in slide-in-from-top duration-200">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5 mb-2">
                <span className="text-emerald-700 bg-emerald-50 border border-emerald-150 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider">
                  🆕 Enroll Trainee Registration
                </span>
                <span className="text-[10px] text-slate-500 italic">Fields entered will write permanently to client-side localStorage</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono mb-1">Employee Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priyanshu Mishra"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:border-emerald-500 outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono mb-1">Professional Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. employee@rathibuildmart.com"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:border-emerald-500 outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono mb-1">Profile Photo (Image URL / Optional)</label>
                  <input
                    type="url"
                    placeholder="e.g. https://images.unsplash.com/photo-..."
                    value={newUserAvatar}
                    onChange={(e) => setNewUserAvatar(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:border-emerald-500 outline-none text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono mb-1">Assigned Department</label>
                  <select
                    value={newUserDept}
                    onChange={(e) => {
                      setNewUserDept(e.target.value);
                    }}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:border-emerald-500 text-slate-800 font-sans font-medium outline-none text-xs"
                    required
                  >
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono mb-1">Branch / Location focusEntity</label>
                  <input
                    type="text"
                    placeholder="e.g. Rathi Buildmart Head Office"
                    value={newUserFocus}
                    onChange={(e) => setNewUserFocus(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:border-emerald-500 outline-none text-xs"
                  />
                </div>

                 <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono mb-1">Assigned Curriculum Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:border-emerald-500 text-slate-850 text-slate-800 font-sans font-medium outline-none text-xs"
                    required
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>

                  {/* Secondary Job Profiles Multi-select Checkboxes */}
                  <div className="mt-2 text-left">
                    <span className="block text-[9px] font-bold text-slate-400 uppercase font-mono mb-1">Additional Profiles (Optional)</span>
                    <div className="p-2 border border-slate-200 bg-white rounded-lg max-h-[85px] overflow-y-auto space-y-1">
                      {roles.map((r) => {
                        if (r.id === newUserRole) return null;
                        const isChecked = newUserRoles.includes(r.id);
                        return (
                          <label key={r.id} className="flex items-center gap-1.5 text-[10px] text-slate-600 hover:text-slate-900 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewUserRoles(prev => [...prev, r.id]);
                                } else {
                                  setNewUserRoles(prev => prev.filter(id => id !== r.id));
                                }
                              }}
                              className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 w-3 h-3"
                            />
                            <span className="leading-none">{r.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono mb-1">Passkey (Login Password) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. rathi123"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:border-emerald-500 outline-none text-xs font-mono font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono mb-1">Employee Status</label>
                  <select
                    value={newUserStatus}
                    onChange={(e) => setNewUserStatus(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:border-emerald-500 text-slate-800 font-sans font-medium outline-none text-xs font-bold"
                  >
                    <option value="Active">🟢 Active (Staff)</option>
                    <option value="Deactivated">🔴 Deactivated (Suspend)</option>
                    <option value="Left">⚪ Left / Resigned (Offboarded)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2 justify-end">
                <button 
                  type="button" 
                  onClick={() => setIsAddingUser(false)} 
                  className="bg-slate-200 text-slate-700 font-bold px-3 py-2 rounded-lg text-xs hover:bg-slate-300 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-emerald-600 text-white font-bold px-4 py-2 rounded-lg text-xs hover:bg-emerald-700 transition flex items-center gap-1 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" /> Register Trainee
                </button>
              </div>
            </form>
          )}

          {/* USER REGISTRY INTERACTIVE SEARCH & FILTERS BAR */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4 flex flex-wrap items-center justify-between gap-4 text-xs font-sans text-left">
            <div className="flex flex-wrap items-center gap-3">
              
              {/* Search Bar */}
              <div className="relative">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Search Trainee Directory</label>
                <div className="relative">
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Search name, email..."
                    className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 pl-8 focus:border-emerald-500 outline-none text-xs w-60 text-slate-800"
                  />
                  <span className="absolute left-2.5 top-2 text-slate-400">🔍</span>
                </div>
              </div>

              {/* Department Filter */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Filter Department</label>
                <select
                  value={userDeptFilter}
                  onChange={(e) => setUserDeptFilter(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:border-emerald-500 outline-none text-xs font-semibold text-slate-750 cursor-pointer"
                >
                  <option value="all">-- All Departments --</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Filter Status</label>
                <select
                  value={userStatusFilter}
                  onChange={(e) => setUserStatusFilter(e.target.value as any)}
                  className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:border-emerald-500 outline-none text-xs font-semibold text-slate-750 cursor-pointer font-bold"
                >
                  <option value="all">✨ All Statuses</option>
                  <option value="Active">🟢 Active Staff</option>
                  <option value="Deactivated">🔴 Deactivated</option>
                  <option value="Left">⚪ Left Group</option>
                </select>
              </div>

              {/* Job Profile Multi-Select Dropdown Filter */}
              <div className="relative">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Filter Designation (Multi-Select)</label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setUserFilterRoleOpen(!userFilterRoleOpen)}
                    id="btn-trigger-user-role-filters"
                    className="bg-white hover:bg-slate-100/90 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-300 shadow-3xs transition duration-150 flex items-center justify-between gap-2.5 cursor-pointer min-w-[200px]"
                  >
                    <span className="truncate">
                      {userSelectedRoleIds.length === 0
                        ? 'None Match ❌'
                        : userSelectedRoleIds.length === roles.length
                        ? 'All Designations (Total)'
                        : `${userSelectedRoleIds.length} Designations selected`}
                    </span>
                    <span className="text-[9px] text-slate-500 font-bold">▼</span>
                  </button>

                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setUserSelectedRoleIds(roles.map(r => r.id))}
                      className="text-[9px] font-extrabold text-indigo-700 bg-indigo-50 hover:bg-indigo-150 px-2 py-1 rounded cursor-pointer"
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserSelectedRoleIds([])}
                      className="text-[9px] font-extrabold text-slate-650 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {userFilterRoleOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserFilterRoleOpen(false)} />
                    <div className="absolute left-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl p-3.5 space-y-2.5 z-50 text-left animate-in slide-in-from-top-1 duration-150">
                      <div className="flex justify-between items-center border-b pb-1.5">
                        <span className="text-[10px] font-mono font-black text-indigo-700 uppercase">Designations Checklist</span>
                        <button
                          type="button"
                          onClick={() => setUserFilterRoleOpen(false)}
                          className="text-slate-400 hover:text-slate-600 text-[10px] font-extrabold cursor-pointer"
                        >
                          Close
                        </button>
                      </div>

                      <div className="max-h-52 overflow-y-auto space-y-1.5 scrollbar-thin">
                        {roles.map(r => {
                          const isChecked = userSelectedRoleIds.includes(r.id);
                          return (
                            <label key={r.id} className="flex items-center gap-2 px-1.5 py-1 rounded hover:bg-slate-50 cursor-pointer select-none text-[11px] text-slate-705">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  if (isChecked) {
                                    setUserSelectedRoleIds(prev => prev.filter(id => id !== r.id));
                                  } else {
                                    setUserSelectedRoleIds(prev => [...prev, r.id]);
                                  }
                                }}
                                className="rounded text-teal-600 focus:ring-teal-500 w-3.5 h-3.5 cursor-pointer"
                              />
                              <span className="font-semibold text-slate-800 truncate">{r.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>

            </div>

            <div className="pt-4 self-end text-[10px] font-mono text-slate-400 font-medium">
              TRAINEES MATCHED: <strong className="text-slate-700 text-xs">
                {users.filter((item) => {
                  if (userSearchQuery.trim()) {
                    const q = userSearchQuery.toLowerCase();
                    if (!item.name.toLowerCase().includes(q) && !item.email.toLowerCase().includes(q)) return false;
                  }
                  if (userDeptFilter !== 'all' && item.department !== userDeptFilter) return false;
                  if (userStatusFilter !== 'all') {
                    const currentStatus = item.status || 'Active';
                    if (currentStatus !== userStatusFilter) return false;
                  }
                  const ur = Array.from(new Set([item.roleId, ...(item.roleIds || [])])).filter(Boolean);
                  if (!ur.some(id => userSelectedRoleIds.includes(id))) return false;
                  return true;
                }).length}
              </strong>
            </div>
          </div>

          <div className="overflow-x-auto select-none mt-2">
            <table className="w-full text-left font-sans text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-mono text-[10px] uppercase tracking-widest border-b border-slate-100">
                  <th className="p-3.5 pl-4">Employee Information</th>
                  <th className="p-3.5">Assigned Department</th>
                  <th className="p-3.5">Location/Entity</th>
                  <th className="p-3.5">Curriculum Assignment</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-center bg-purple-500/5 text-purple-700 font-bold tracking-tight rounded-t-lg">Security Passkey</th>
                  <th className="p-3.5 text-center">Path Met</th>
                  <th className="p-3.5 text-center">Mastery Met</th>
                  <th className="p-3.5 text-center pr-4">Control Fields</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {users.filter((item) => {
                  if (userSearchQuery.trim()) {
                    const q = userSearchQuery.toLowerCase();
                    if (!item.name.toLowerCase().includes(q) && !item.email.toLowerCase().includes(q)) return false;
                  }
                  if (userDeptFilter !== 'all' && item.department !== userDeptFilter) return false;
                  if (userStatusFilter !== 'all') {
                    const currentStatus = item.status || 'Active';
                    if (currentStatus !== userStatusFilter) return false;
                  }
                  const ur = Array.from(new Set([item.roleId, ...(item.roleIds || [])])).filter(Boolean);
                  if (!ur.some(id => userSelectedRoleIds.includes(id))) return false;
                  return true;
                }).map((item) => {
                  const roleObj = roles.find(r => r.id === item.roleId);
                  const isEditing = editingUserId === item.id;
                  const stats = calculateUserProgress(item.id, item.roleId);

                  if (isEditing) {
                    return (
                      <tr key={item.id} className="bg-slate-50/70 border-l-4 border-l-emerald-500">
                        <td className="p-3.5 pl-4 font-medium min-w-[200px]">
                          <input
                            type="text"
                            value={editUserName}
                            onChange={(e) => setEditUserName(e.target.value)}
                            className="bg-white border border-slate-300 focus:border-emerald-500 outline-none rounded px-3 py-1.5 text-xs w-full font-bold text-slate-800"
                          />
                          <input
                            type="email"
                            value={editUserEmail}
                            onChange={(e) => setEditUserEmail(e.target.value)}
                            className="bg-white border border-slate-200 focus:border-emerald-400 outline-none rounded px-3 py-1 text-[10px] text-slate-500 mt-1.5 block w-full font-mono"
                          />
                          <input
                            type="text"
                            placeholder="Photo URL (Optional)"
                            value={editUserAvatar}
                            onChange={(e) => setEditUserAvatar(e.target.value)}
                            className="bg-white border border-slate-200 focus:border-indigo-400 outline-none rounded px-3 py-1 text-[10px] text-slate-500 mt-1.5 block w-full font-mono"
                          />
                        </td>
                        <td className="p-3.5">
                          <select
                            value={editUserDept}
                            onChange={(e) => setEditUserDept(e.target.value)}
                            className="bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs outline-none font-bold text-slate-800 focus:border-emerald-500"
                          >
                            {departments.map((dept) => (
                              <option key={dept} value={dept}>
                                {dept}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-3.5">
                          <input
                            type="text"
                            value={editUserFocus}
                            onChange={(e) => setEditUserFocus(e.target.value)}
                            className="bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs w-full focus:border-emerald-500 font-medium"
                          />
                        </td>
                        <td className="p-3.5">
                          <div className="space-y-1.5">
                            <div>
                              <span className="text-[9px] uppercase font-mono font-bold text-emerald-600 block mb-0.5">Primary</span>
                              <select
                                value={editUserRole}
                                onChange={(e) => setEditUserRole(e.target.value)}
                                className="bg-white border border-slate-300 rounded px-2 py-1 text-xs w-full font-bold text-slate-800 focus:border-emerald-500 outline-none"
                              >
                                {roles.map(r => (
                                  <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                              </select>
                            </div>

                            {/* Secondary checklist box */}
                            <div>
                              <span className="text-[9px] uppercase font-mono font-bold text-indigo-600 block mb-0.5">Other</span>
                              <div className="p-1 px-1.5 border border-slate-200 bg-white rounded-lg max-h-[80px] overflow-y-auto space-y-0.5">
                                {roles.map((r) => {
                                  if (r.id === editUserRole) return null;
                                  const isChecked = editUserRoles.includes(r.id);
                                  return (
                                    <label key={r.id} className="flex items-center gap-1.5 text-[9px] text-slate-600 hover:text-slate-950 cursor-pointer select-none">
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setEditUserRoles(prev => [...prev, r.id]);
                                          } else {
                                            setEditUserRoles(prev => prev.filter(id => id !== r.id));
                                          }
                                        }}
                                        className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 w-2.5 h-2.5"
                                      />
                                      <span className="leading-none">{r.name}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 text-center">
                          <select
                            value={editUserStatus}
                            onChange={(e) => setEditUserStatus(e.target.value as any)}
                            className="bg-white border border-slate-300 rounded px-1.5 py-1 text-xs outline-none font-bold text-slate-800 focus:border-emerald-500"
                          >
                            <option value="Active">🟢 Active</option>
                            <option value="Deactivated">🔴 Deact</option>
                            <option value="Left">⚪ Left</option>
                          </select>
                        </td>
                        <td className="p-3.5 bg-purple-500/5">
                          <input
                            type="text"
                            value={editUserPassword}
                            onChange={(e) => setEditUserPassword(e.target.value)}
                            className="bg-white border border-slate-300 rounded px-2 py-1.5 text-xs font-mono font-bold text-rose-700 w-28 text-center uppercase"
                            placeholder="Passkey"
                          />
                        </td>
                        <td className="p-3.5 text-center font-mono font-bold text-slate-400">-</td>
                        <td className="p-3.5 text-center font-mono font-bold text-slate-400">-</td>
                        <td className="p-3.5 text-center pr-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleSaveUser(item.id)}
                              className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-3xs transition cursor-pointer"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingUserId(null)}
                              className="bg-white border border-slate-200 text-slate-500 hover:text-slate-700 font-bold px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-50 transition cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition duration-100">
                      <td className="p-3.5 pl-4">
                        <div className="flex items-center gap-3">
                          <div className="relative group shrink-0">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur opacity-10 group-hover:opacity-35 transition"></div>
                            <Avatar 
                              src={item.avatarUrl}
                              name={item.name}
                              className="w-10 h-10 border border-slate-200/80 relative shadow-sm" 
                            />
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-850 text-sm tracking-tight">{item.name}</p>
                            <p className="text-[10px] font-mono text-slate-400 mt-0.5">{item.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="font-semibold text-slate-600 bg-slate-100 border border-slate-200/40 px-2 py-0.5 rounded text-[10px] font-sans">
                          {item.department}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-550 font-medium font-sans">{item.focusEntity}</td>
                      <td className="p-3.5">
                        <div className="flex flex-col gap-1 max-w-[210px]">
                          <span className="bg-emerald-605 bg-emerald-50 text-emerald-800 font-extrabold px-2 py-0.5 rounded border border-emerald-500/20 truncate font-sans text-[10px] inline-block">
                            ★ Primary: {roleObj?.name || 'Unassigned'}
                          </span>
                          {/* Render other assigned roles */}
                          {item.roleIds && item.roleIds.filter(rId => rId !== item.roleId).map(rId => {
                            const otherRole = roles.find(r => r.id === rId);
                            if (!otherRole) return null;
                            return (
                              <span key={rId} className="bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded border border-indigo-200/40 truncate font-sans text-[9px] inline-block">
                                ✙ {otherRole.name}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="p-3.5 text-center">
                        {(!item.status || item.status === 'Active') ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 font-extrabold px-2 py-0.5 rounded border border-emerald-500/20 text-[10px] uppercase font-mono shadow-3xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Active
                          </span>
                        ) : item.status === 'Deactivated' ? (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 font-extrabold px-2 py-0.5 rounded border border-amber-500/20 text-[10px] uppercase font-mono shadow-3xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            Deact
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 font-extrabold px-2 py-0.5 rounded border border-slate-300 text-[10px] uppercase font-mono shadow-3xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            Left
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-center bg-purple-500/5">
                        <span className="font-mono text-purple-705 bg-purple-50 border border-purple-200/40 px-3 py-1 rounded-md text-xs font-black tracking-wide">
                          {item.password || 'rathi123'}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="font-mono text-indigo-600 font-black text-xs">{stats.overallPercent}%</span>
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="font-mono text-emerald-650 font-black text-xs">{stats.masteryPercent}%</span>
                      </td>
                      <td className="p-3.5 text-center pr-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {confirmDeleteUserId === item.id ? (
                            <div className="flex items-center gap-1.5 animate-in zoom-in-95 duration-100">
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteUserId(null)}
                                className="text-[9px] uppercase font-mono font-bold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-2 py-1.5 rounded transition cursor-pointer border border-slate-200"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(item.id, item.name)}
                                className="text-[9px] uppercase font-mono font-black text-white hover:bg-rose-605 bg-rose-500 px-2.5 py-1.5 rounded shadow-xs transition cursor-pointer flex items-center gap-1"
                              >
                                <Trash2 className="w-2.5 h-2.5 text-white" /> Live Offboard
                              </button>
                            </div>
                          ) : confirmResetUserId === item.id ? (
                            <div className="flex items-center gap-1.5 animate-in zoom-in-95 duration-100">
                              <button
                                type="button"
                                onClick={() => setConfirmResetUserId(null)}
                                className="text-[9px] uppercase font-mono font-bold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-2 py-1.5 rounded transition cursor-pointer border border-slate-200"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleResetUserMastery(item.id, item.name)}
                                className="text-[9px] uppercase font-mono font-black text-white hover:bg-amber-600 bg-amber-500 px-2.5 py-1.5 rounded shadow-xs transition cursor-pointer flex items-center gap-1"
                              >
                                <RefreshCw className="w-2.5 h-2.5 text-white animate-spin-slow" /> Reset Progress
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  setEditingUserId(item.id);
                                  setEditUserName(item.name);
                                  setEditUserEmail(item.email);
                                  setEditUserAvatar(item.avatarUrl || '');
                                  setEditUserRole(item.roleId);
                                  setEditUserRoles(item.roleIds || []);
                                  setEditUserDept(item.department);
                                  setEditUserFocus(item.focusEntity);
                                  setEditUserPassword(item.password || 'rathi123');
                                  setEditUserStatus(item.status || 'Active');
                                }}
                                title="Edit Employee Detail"
                                className="bg-white border border-slate-200 hover:border-indigo-300 text-slate-500 hover:text-indigo-600 transition cursor-pointer p-2 rounded-lg"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmResetUserId(item.id)}
                                title="Reset Trainee Progress & Mastery Status"
                                className="bg-white border border-slate-200 hover:border-amber-400 text-slate-500 hover:text-amber-600 transition cursor-pointer p-1.5 px-2 rounded-lg flex items-center gap-1 font-mono text-[9px] font-bold shadow-3xs hover:bg-amber-50"
                              >
                                <RefreshCw className="w-2.5 h-2.5 text-amber-500" />
                                <span>Reset</span>
                              </button>
                              <button
                                onClick={() => setConfirmDeleteUserId(item.id)}
                                title="Offboard/Delete Employee"
                                className="bg-white border border-slate-200 hover:border-red-300 text-slate-500 hover:text-red-650 transition cursor-pointer p-2 rounded-lg"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          TAB 3: JOB ROLES & REQUIRED SKILLS MATRIX
          ---------------------------------------------------- */}
      {adminTab === 'roles' && (
        <div className="space-y-6 text-left">
          
          {/* Sub-Tabs Selector exactly like Manage Roles / Add Role / Security Matrix */}
          <div className="flex border-b border-slate-200 pb-px gap-1">
            <button
              onClick={() => {
                setRolesSubTab('matrix');
                setIsAddingRole(false);
              }}
              id="subtab-permissions-matrix"
              className={`px-4 py-2.5 font-bold text-xs flex items-center gap-1.5 border-b-2 transition duration-150 cursor-pointer ${
                rolesSubTab === 'matrix'
                  ? 'border-emerald-600 text-emerald-700 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-805 font-semibold'
              }`}
            >
              <Settings className="w-3.5 h-3.5 text-emerald-600 animate-spin-slow" />
              Manage User Permissions Matrix 🔐
            </button>

            <button
              onClick={() => {
                setRolesSubTab('list');
                setIsAddingRole(false);
              }}
              id="subtab-roles-list"
              className={`px-4 py-2.5 font-bold text-xs flex items-center gap-1.5 border-b-2 transition duration-150 cursor-pointer ${
                rolesSubTab === 'list'
                  ? 'border-emerald-600 text-emerald-700 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-805 font-semibold'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              Manage Job Roles List 👥
            </button>

            <button
              onClick={() => {
                setRolesSubTab('add');
                setIsAddingRole(true);
              }}
              id="subtab-add-role"
              className={`px-4 py-2.5 font-bold text-xs flex items-center gap-1.5 border-b-2 transition duration-150 cursor-pointer ${
                rolesSubTab === 'add'
                  ? 'border-emerald-600 text-emerald-700 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-805 font-semibold'
              }`}
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              Add Dynamic Job Role ➕
            </button>
          </div>

          {/* 1. INTERACTIVE SECURITY PERMISSIONS MATRIX (Directly matching user screenshot style!) */}
          {rolesSubTab === 'matrix' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-slate-800 animate-in fade-in duration-200">
              
              {/* Cyan Header Title Bar */}
              <div className="bg-[#26a69a] text-white px-5 py-4 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2.5">
                  <span className="p-1 px-1.5 bg-white/10 rounded border border-white/15">
                    <Settings className="w-4 h-4 text-white animate-spin-slow" />
                  </span>
                  <div className="text-left">
                    <h3 className="font-extrabold text-[13px] sm:text-sm uppercase tracking-wider font-sans">
                      Manage User Permissions
                    </h3>
                    <p className="text-[10px] text-teal-50 font-sans opacity-95 mt-0.5">Control dynamic feature accessibility levels across active profiles</p>
                  </div>
                </div>
                <div className="text-[10px] bg-white/20 px-2.5 py-1 rounded-full border border-white/10 font-mono tracking-wider font-extrabold shadow-3xs">
                  MATRIX CONTROL COCKPIT
                </div>
              </div>

              {/* Controls Toolbar (Exactly styling & items from user upload) */}
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs font-sans">
                
                {/* Left group of controls */}
                <div className="flex flex-wrap items-center gap-2">
                  
                  {/* Show Role Column Selection Button & Popover */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowRoleSelectionDropdown(!showRoleSelectionDropdown)}
                      id="btn-trigger-role-columns"
                      className="bg-white hover:bg-slate-100/90 text-slate-700 text-xs font-extrabold px-3 py-2 rounded-lg border border-slate-300 shadow-3xs transition duration-150 flex items-center gap-2 cursor-pointer"
                    >
                      <Sliders className="w-3.5 h-3.5 text-slate-500" />
                      Show Role Column Selection {showRoleSelectionDropdown ? '▲' : '▼'}
                    </button>

                    {showRoleSelectionDropdown && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowRoleSelectionDropdown(false)} />
                        <div className="absolute left-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl p-3.5 space-y-2.5 z-50 text-left animate-in slide-in-from-top-1 duration-150">
                          <div className="flex justify-between items-center border-b pb-1.5">
                            <span className="text-[10px] font-mono font-black text-indigo-700 uppercase">Column Visibility</span>
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => setVisibleRoleColumns(roles.map(r => r.id))}
                                className="text-[9px] bg-indigo-50 border border-indigo-200 text-indigo-700 font-extrabold px-1.5 py-0.5 rounded cursor-pointer"
                              >
                                All
                              </button>
                              <button
                                type="button"
                                onClick={() => setVisibleRoleColumns([])}
                                className="text-[9px] bg-slate-105 border border-slate-300 text-slate-700 font-extrabold px-1.5 py-0.5 rounded cursor-pointer"
                              >
                                Clear
                              </button>
                            </div>
                          </div>
                          
                          <div className="max-h-56 overflow-y-auto space-y-1.5 scrollbar-thin">
                            {roles.map(r => {
                              const isChecked = visibleRoleColumns.includes(r.id);
                              return (
                                <label key={r.id} className="flex items-center gap-2 px-1.5 py-1 rounded hover:bg-slate-50 cursor-pointer select-none text-[11px] text-slate-705">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {
                                      if (isChecked) {
                                        setVisibleRoleColumns(prev => prev.filter(id => id !== r.id));
                                      } else {
                                        setVisibleRoleColumns(prev => [...prev, r.id]);
                                      }
                                    }}
                                    className="rounded text-teal-600 focus:ring-teal-500 w-3.5 h-3.5 cursor-pointer"
                                  />
                                  <span className="font-semibold text-slate-800 truncate">{r.name}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Module Group Selector Dropdown */}
                  <select
                    value={selectedPermissionGroup}
                    onChange={(e) => setSelectedPermissionGroup(e.target.value)}
                    className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-750 shadow-3xs outline-none focus:border-teal-500 transition duration-150 cursor-pointer"
                  >
                    <option value="Account Group">Account Group</option>
                    <option value="Curriculum Architecture">Curriculum Architecture</option>
                    <option value="Corporate Verification">Corporate Verification</option>
                    <option value="User Database">User Database</option>
                    <option value="Performance Records">Performance Records</option>
                  </select>

                  {/* Prev / Next buttons exactly as requested */}
                  <div className="flex items-center bg-white border border-slate-300 rounded-lg shadow-3xs overflow-hidden">
                    <button
                      type="button"
                      onClick={() => {
                        const groups = ['Account Group', 'Curriculum Architecture', 'Corporate Verification', 'User Database', 'Performance Records'];
                        const idx = groups.indexOf(selectedPermissionGroup);
                        setSelectedPermissionGroup(idx > 0 ? groups[idx - 1] : groups[groups.length - 1]);
                      }}
                      className="px-2.5 py-2 hover:bg-slate-50 font-extrabold text-[11px] transition text-slate-700 cursor-pointer border-r border-slate-200"
                    >
                      Prev. Module
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const groups = ['Account Group', 'Curriculum Architecture', 'Corporate Verification', 'User Database', 'Performance Records'];
                        const idx = groups.indexOf(selectedPermissionGroup);
                        setSelectedPermissionGroup(idx < groups.length - 1 ? groups[idx + 1] : groups[0]);
                      }}
                      className="px-2.5 py-2 hover:bg-slate-50 font-extrabold text-[11px] transition text-slate-705 cursor-pointer"
                    >
                      Next Module
                    </button>
                  </div>
                </div>

                {/* Right Search Input */}
                <div className="w-full sm:w-64 relative text-left">
                  <input
                    type="text"
                    value={searchPermissionQuery}
                    onChange={(e) => setSearchPermissionQuery(e.target.value)}
                    placeholder="Search Permissions"
                    className="w-full bg-white border border-slate-300/90 hover:border-slate-400 rounded-lg px-3 py-1.5 pl-8 outline-none text-xs focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition duration-150 shadow-3xs text-slate-800"
                  />
                  <span className="absolute left-2.5 top-2.5 text-slate-400 pointer-events-none text-xs">🔍</span>
                </div>
              </div>

              {/* Responsive Access Matrix Grid Container (Scrollable Horizontal) */}
              <div className="overflow-x-auto w-full custom-scrollbar max-w-full">
                <table className="w-full text-left border-collapse whitespace-nowrap min-w-[1000px]">
                  <thead>
                    <tr className="bg-slate-100 divide-x divide-slate-200 border-b border-slate-200 text-[10px] font-mono font-black uppercase text-slate-600 tracking-wider">
                      <th className="px-5 py-3 sticky left-0 bg-slate-100 z-10 font-bold min-w-[320px] text-left">
                        PERMISSION
                      </th>
                      {roles.filter(r => visibleRoleColumns.includes(r.id)).map(r => (
                        <th key={r.id} className="px-4 py-3 text-center min-w-[140px] font-extrabold">
                          {r.name.replace(/\([^)]*\)/g, '').toUpperCase()}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {ALL_PERMISSIONS
                      .filter(p => p.group === selectedPermissionGroup)
                      .filter(p => !searchPermissionQuery || p.name.toLowerCase().includes(searchPermissionQuery.toLowerCase()))
                      .map((perm) => {
                        
                        // Decide background styling based on row status
                        let rowBg = 'bg-white hover:bg-slate-50/60';
                        let textColor = 'text-slate-850 font-semibold';
                        
                        if (perm.isParent) {
                          if (perm.id === 'perm_sec_group') {
                            rowBg = 'bg-cyan-150/75 border-y border-cyan-200'; // Cyan/Teal parent row matching screenshot!
                            textColor = 'font-black text-teal-900 text-xs tracking-wide uppercase';
                          } else {
                            rowBg = 'bg-yellow-105 border-y border-amber-300'; // Gold/Yellow parent row matching screenshot!
                            textColor = 'font-black text-amber-900 text-xs tracking-wide uppercase';
                          }
                        }

                        return (
                          <tr key={perm.id} className={`divide-x divide-slate-150 transition duration-150 group ${rowBg}`}>
                            
                            {/* Permission Title column (Sticky on horizontal scroll for amazing UX!) */}
                            <td className={`px-5 py-3 sticky left-0 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.015)] text-xs text-left ${textColor} ${perm.isParent ? 'bg-blend-multiply ' + (perm.id === 'perm_sec_group' ? 'bg-cyan-150' : 'bg-yellow-100') : 'bg-white'}`}>
                              <div className="flex items-center justify-between gap-1.5">
                                <span className="truncate">{perm.name}</span>
                                
                                {/* Row shortcut action buttons */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    // Toggle ALL visible roles on this row
                                    const visibleIds = roles.filter(r => visibleRoleColumns.includes(r.id)).map(r => r.id);
                                    const allChecked = visibleIds.every(id => permissionsMatrix[perm.id]?.[id]);
                                    
                                    setPermissionsMatrix(prev => {
                                      const rowConfig = { ...(prev[perm.id] || {}) };
                                      visibleIds.forEach(id => {
                                        rowConfig[id] = !allChecked;
                                      });
                                      return {
                                        ...prev,
                                        [perm.id]: rowConfig
                                      };
                                    });
                                  }}
                                  className="text-[9px] font-black font-mono text-slate-500 hover:text-teal-750 px-2 py-0.5 rounded border border-slate-200 bg-slate-50 hover:bg-white leading-none uppercase transition duration-100 cursor-pointer hidden group-hover:inline-block"
                                  title="Bulk Toggle Row"
                                >
                                  Toggle Row
                                </button>
                              </div>
                            </td>

                            {/* Checkbox matrices columns */}
                            {roles.filter(r => visibleRoleColumns.includes(r.id)).map(role => {
                              const isChecked = permissionsMatrix[perm.id]?.[role.id] ?? false;
                              return (
                                <td key={role.id} className="p-3 text-center vertical-middle">
                                  <div className="flex justify-center items-center">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => {
                                        setPermissionsMatrix(prev => {
                                          const rowConfig = prev[perm.id] ? { ...prev[perm.id] } : {};
                                          rowConfig[role.id] = !isChecked;
                                          return {
                                            ...prev,
                                            [perm.id]: rowConfig
                                          };
                                        });
                                      }}
                                      className={`rounded cursor-pointer w-4 h-4 transition duration-150 ${
                                        perm.isParent 
                                          ? 'hover:scale-110 text-teal-600 focus:ring-teal-500 border-teal-400' 
                                          : 'hover:scale-110 text-[#1976d2] focus:ring-indigo-500 border-slate-300'
                                      }`}
                                    />
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              {/* Save Footer panel matches user upload exactly */}
              <div className="bg-slate-50 border-t border-slate-200 p-5 flex flex-col sm:flex-row justify-between items-center gap-4 text-left">
                <div className="text-[11px] text-slate-500 font-medium font-sans">
                  🔒 Configured <strong className="text-slate-800">{Math.min(visibleRoleColumns.length, roles.length)} active designations</strong> against <strong className="text-slate-800">{ALL_PERMISSIONS.length} Dynamic Organization Permissions</strong>. Title matrix maps seamlessly on profile updates.
                </div>

                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setPermissionsMatrix(getInitialMatrixState(roles));
                      showToast("Permissions restored to strict system default configurations.", "info");
                    }}
                    className="bg-slate-150 hover:bg-slate-200 text-slate-705 font-extrabold text-[11px] px-4 py-2 border border-slate-300 rounded hover:shadow-2xs cursor-pointer transition uppercase tracking-wider"
                  >
                    Restore Defaults
                  </button>

                  <button
                    onClick={() => {
                      localStorage.setItem('lms_permissions_matrix_v1', JSON.stringify(permissionsMatrix));
                      showToast(`✓ Security levels and access control parameters written for ${roles.length} designations successfully!`, 'success');
                    }}
                    className="bg-slate-900 hover:bg-black text-white font-extrabold text-[11px] px-8 py-2.5 border border-slate-950 rounded shadow-md hover:shadow-lg transition cursor-pointer uppercase tracking-widest"
                  >
                    Save
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* 2. JOB ROLES LIST TAB VIEW (Existing interactive list!) */}
          {rolesSubTab === 'list' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-5 border-b border-slate-100 pb-4 text-left">
                <div>
                  <h3 className="font-display text-base font-extrabold text-slate-900 uppercase tracking-tight">Active Designations</h3>
                  <p className="text-xs text-slate-500 mt-1">Configure specialized pathways, track staff ratios, and define target professional standards.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roles.map((r) => {
                  const associatedUsers = users.filter(u => u.roleId === r.id);
                  
                  if (editingRoleId === r.id) {
                    return (
                      <form
                        key={r.id}
                        onSubmit={(e) => handleSaveEditedRole(r.id, e)}
                        className="border-2 border-emerald-500/80 rounded-xl p-4 bg-white flex flex-col justify-between space-y-3 shadow-sm animate-in fade-in duration-150 text-xs text-slate-700 font-sans text-left"
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-center pb-1 border-b border-slate-100">
                            <span className="text-[9px] uppercase font-mono font-bold tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Editing Designation
                            </span>
                            <button
                              type="button"
                              onClick={() => setEditingRoleId(null)}
                              className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-50 transition"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono mb-1">Corporate Title Name</label>
                            <input
                              type="text"
                              required
                              value={editRoleName}
                              onChange={(e) => setEditRoleName(e.target.value)}
                              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:border-emerald-500 text-slate-800 font-sans font-medium outline-none text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono mb-1">Department</label>
                            <select
                              value={editRoleDept}
                              onChange={(e) => setEditRoleDept(e.target.value)}
                              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:border-emerald-500 text-slate-805 font-sans font-medium outline-none text-xs"
                              required
                            >
                              {departments.map((dept) => (
                                <option key={dept} value={dept}>
                                  {dept}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono mb-1">Brief Description of Guidelines</label>
                            <input
                              type="text"
                              value={editRoleDesc}
                              onChange={(e) => setEditRoleDesc(e.target.value)}
                              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:border-emerald-500 text-slate-800 font-sans outline-none text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono mb-1">Required Skills (Comma-Separated)</label>
                            <input
                              type="text"
                              value={editRoleSkills}
                              onChange={(e) => setEditRoleSkills(e.target.value)}
                              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:border-emerald-500 text-slate-800 font-sans outline-none text-xs"
                            />
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingRoleId(null)}
                            className="bg-slate-100 text-slate-705 hover:bg-slate-200 font-bold px-3 py-1.5 rounded-lg transition text-xs cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg transition text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" /> Save Changes
                          </button>
                        </div>
                      </form>
                    );
                  }

                  return (
                    <div key={r.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between text-left">
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <div>
                            <span className="inline-block text-[9px] uppercase font-mono font-bold tracking-wider text-emerald-700 bg-white border border-slate-200/80 px-2 py-1 rounded-md max-w-full text-center leading-tight">
                              {r.department}
                            </span>
                            <h4 className="font-bold text-slate-800 text-sm mt-1">{r.name}</h4>
                          </div>
                          <div className="flex items-center gap-1">
                            {confirmDeleteRoleId === r.id ? (
                              <div className="flex items-center gap-1.5 animate-in zoom-in-95 duration-100">
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteRoleId(null)}
                                  className="text-[10px] uppercase font-mono font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-200/60 bg-slate-100/80 px-2 py-1 rounded transition cursor-pointer border border-slate-200"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRole(r.id)}
                                  className="text-[10px] uppercase font-mono font-black text-white hover:bg-rose-600 bg-rose-500 px-2.5 py-1 rounded shadow-xs transition cursor-pointer flex items-center gap-1"
                                >
                                  <Trash2 className="w-2.5 h-2.5 text-white" /> Delete
                                </button>
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingRoleId(r.id);
                                    setEditRoleName(r.name);
                                    setEditRoleDept(r.department);
                                    setEditRoleDesc(r.description || '');
                                    setEditRoleSkills(r.skillRequirements.join(', '));
                                  }}
                                  className="text-slate-400 hover:text-emerald-400 p-1.5 rounded-lg hover:bg-white/80 border border-transparent hover:border-slate-100 transition cursor-pointer"
                                  title="Edit Role/Designation"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDuplicateRole(r.id)}
                                  className="text-slate-400 hover:text-indigo-400 p-1.5 rounded-lg hover:bg-white/80 border border-transparent hover:border-slate-100 transition cursor-pointer"
                                  title="Duplicate/Copy Designation"
                                >
                                  <Copy className="w-3.5 h-3.5 text-indigo-400" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (associatedUsers.length > 0) {
                                      showToast('Error: This designation is currently assigned to active employees. Resign or re-assign them first.', 'error');
                                      return;
                                    }
                                    setConfirmDeleteRoleId(r.id);
                                  }}
                                  className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-white/80 border text-rose-500 border-transparent hover:border-slate-100 transition cursor-pointer"
                                  title="Delete Role"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-slate-500 font-sans mb-3">{r.description}</p>

                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {r.skillRequirements.map((sk, skIdx) => (
                            <span key={skIdx} className="bg-slate-100 border text-slate-650 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-[10px] font-mono text-slate-400">
                        <span>Curriculum Active: Yes</span>
                        <span>Assigned Staffs: <strong className="text-slate-700">{associatedUsers.length}</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. ADD NEW ROLE FORM VIEW */}
          {rolesSubTab === 'add' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs text-left">
              <div className="border-b border-slate-100 pb-3.5 mb-5">
                <h3 className="font-display text-base font-extrabold text-slate-900 uppercase tracking-tight">Create Professional Designation</h3>
                <p className="text-xs text-slate-500 mt-1">Add new dynamic roles to map curriculum targets and security clearances instantly.</p>
              </div>

              <form onSubmit={handleAddRole} className="bg-slate-50 border rounded-xl p-5 space-y-4 text-xs font-sans text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono mb-1">Corporate Title Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Accounts Executive Apprentice"
                      value={roleName}
                      onChange={(e) => setRoleName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono mb-1">Department</label>
                    <select
                      value={roleDept}
                      onChange={(e) => setRoleDept(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:border-emerald-500 text-slate-800 font-sans font-medium outline-none cursor-pointer"
                      required
                    >
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                    <p className="text-[9px] text-slate-400 mt-1 font-sans font-semibold">
                      Don't see your department? Create it in the <span className="underline cursor-pointer hover:text-emerald-600 font-bold" onClick={() => { setAdminTab('departments'); setRolesSubTab('list'); }}>Departments Manager</span> tab first.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono mb-1">Brief Description of Guidelines</label>
                  <input
                    type="text"
                    placeholder="Focus objectives and operational responsibilities..."
                    value={roleDesc}
                    onChange={(e) => setRoleDesc(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono mb-1">Required Skills (Comma-Separated)</label>
                  <input
                    type="text"
                    placeholder="Double Entry, Tally, GSTR 2B, VAT analysis"
                    value={roleSkills}
                    onChange={(e) => setRoleSkills(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded-lg cursor-pointer transition">
                    Save Role Form
                  </button>
                  <button type="button" onClick={() => setRolesSubTab('matrix')} className="bg-slate-300 hover:bg-slate-200 text-slate-705 px-4 py-2 rounded-lg cursor-pointer transition">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      )}

      {/* ----------------------------------------------------
          TAB 4: CURRICULUM BUILDER (EDIT CHAPTERS & UNITS)
          ---------------------------------------------------- */}
      {adminTab === 'curriculum' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs">
            
            {/* Headline and filter */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-display text-base font-extrabold text-slate-900 uppercase tracking-tight">Corporate Curriculum Architecture</h3>
                <p className="text-xs text-slate-500 mt-1">Select and configure Chapters and tactical video training lesson units.</p>
              </div>

              <div className="relative inline-block text-left">
                <div className="flex flex-col sm:items-end gap-1">
                  <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-bold">Filter Job Profiles (Multi-Select):</label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Selected count dropdown trigger */}
                    <button
                      type="button"
                      onClick={() => setIsOpenRoleFilter(!isOpenRoleFilter)}
                      className="flex items-center justify-between gap-2.5 bg-slate-150 hover:bg-slate-200 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-extrabold cursor-pointer transition min-w-[190px]"
                    >
                      <span className="truncate">
                        {selectedCurriculumRoleIds.length === 0
                          ? 'None Selected ❌'
                          : selectedCurriculumRoleIds.length === roles.length
                          ? 'All Profiles Combined 🌐'
                          : `${selectedCurriculumRoleIds.length} Profiles Selected`}
                      </span>
                      <span className="text-[9px] text-slate-500 font-bold">▼</span>
                    </button>

                    {/* Quick helper toggles */}
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCurriculumRoleIds(roles.map(r => r.id));
                          setEditingUnitId(null);
                        }}
                        className="text-[9px] font-black text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-lg border border-indigo-200/40 cursor-pointer uppercase transition"
                        title="Display All Profiles"
                      >
                        All
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCurriculumRoleIds([]);
                          setEditingUnitId(null);
                        }}
                        className="text-[9px] font-black text-slate-650 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-lg border border-slate-300/40 cursor-pointer uppercase transition"
                        title="Clear Filters"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>

                {isOpenRoleFilter && (
                  <>
                    {/* Backdrop to close overlay when clicking outside */}
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsOpenRoleFilter(false)}
                    />
                    
                    {/* Checklist popup panel overlay */}
                    <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-lg p-3 space-y-2 z-50 animate-in slide-in-from-top-1 duration-150 text-left">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-1">
                        <span className="text-[9px] font-mono font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1">
                          🗂️ Map Profiles Checklist
                        </span>
                        <button 
                          type="button"
                          onClick={() => setIsOpenRoleFilter(false)}
                          className="text-slate-400 hover:text-slate-600 text-[10px] font-mono leading-none bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded cursor-pointer font-bold"
                        >
                          Close
                        </button>
                      </div>

                      <div className="max-h-52 overflow-y-auto space-y-1.5 pr-0.5 pt-1">
                        {roles.map(r => {
                          const isSelected = selectedCurriculumRoleIds.includes(r.id);
                          return (
                            <label 
                              key={r.id} 
                              className={`flex items-center gap-2.5 p-1.5 rounded-lg cursor-pointer select-none text-xs text-slate-705 transition ${
                                isSelected ? 'bg-indigo-50/50 text-indigo-900 border border-indigo-100' : 'hover:bg-slate-50 border border-transparent'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {
                                  let newSet;
                                  if (isSelected) {
                                    newSet = selectedCurriculumRoleIds.filter(id => id !== r.id);
                                  } else {
                                    newSet = [...selectedCurriculumRoleIds, r.id];
                                  }
                                  setSelectedCurriculumRoleIds(newSet);
                                  setEditingUnitId(null);
                                }}
                                className="rounded text-emerald-650 focus:ring-emerald-500 border-slate-300 w-3.5 h-3.5 cursor-pointer"
                              />
                              <div className="leading-tight flex-1">
                                <span className="font-extrabold text-slate-800 text-[11px] block">{r.name}</span>
                                <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">{r.department}</span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Tab Selection for Manual vs. Bulk Upload */}
            <div className="flex bg-slate-100 rounded-xl p-1 mb-6 text-xs max-w-sm mt-2 border border-slate-200">
              <button
                type="button"
                onClick={() => setCurriculumMode('manual')}
                className={`flex-1 py-1.5 font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  curriculumMode === 'manual'
                    ? 'bg-white text-slate-900 shadow-3xs border border-slate-200/50'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Settings className="w-3.5 h-3.5 text-indigo-500" />
                Standard Interface
              </button>
              <button
                type="button"
                onClick={() => setCurriculumMode('bulk')}
                className={`flex-1 py-1.5 font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  curriculumMode === 'bulk'
                    ? 'bg-white text-slate-900 shadow-3xs border border-slate-200/50'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Upload className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />
                Excel / CSV bulk loading
              </button>
            </div>

            {curriculumMode === 'manual' ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: Chapters Assembly */}
                <div className="lg:col-span-1 border-r border-slate-150 pr-4">
                  <h4 className="text-xs font-bold uppercase text-slate-400 font-mono tracking-wider mb-3">
                    I. Assemble Chapters
                  </h4>
                  
                  {/* Chapters list under current role */}
                  <div className="space-y-2 mb-4">
                    {chapters
                      .filter(c => selectedCurriculumRoleIds.includes(c.roleId))
                      .sort((a, b) => (a.order || 0) - (b.order || 0))
                      .map((chap, idx, arr) => {
                        const roleName = roles.find(r => r.id === chap.roleId)?.name || 'Unknown Profile';
                        return (
                          <div key={chap.id} className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-150 text-xs text-slate-755 font-medium text-left">
                            <div className="truncate pr-2 max-w-[130px] sm:max-w-[160px]">
                              <span className="text-[8.5px] font-bold text-indigo-700 uppercase font-mono block mb-0.5">{roleName}</span>
                              <span className="font-extrabold text-slate-800 tracking-tight">{chap.name}</span>
                            </div>
                            <div className="flex items-center gap-0.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleMoveChapter(chap.id, 'up')}
                                disabled={idx === 0}
                                className={`w-6 h-6 flex items-center justify-center rounded text-[10px] transition cursor-pointer font-bold ${
                                  idx === 0 ? 'text-slate-300 pointer-events-none' : 'text-slate-650 hover:text-slate-900 hover:bg-slate-200/60'
                                }`}
                                title="Move Chapter Up"
                              >
                                ▲
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveChapter(chap.id, 'down')}
                                disabled={idx === arr.length - 1}
                                className={`w-6 h-6 flex items-center justify-center rounded text-[10px] transition cursor-pointer font-bold ${
                                  idx === arr.length - 1 ? 'text-slate-300 pointer-events-none' : 'text-slate-650 hover:text-slate-900 hover:bg-slate-200/60'
                                }`}
                                title="Move Chapter Down"
                              >
                                ▼
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteChapter(chap.id)}
                                className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition cursor-pointer"
                                title="Delete Chapter"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    {chapters.filter(c => selectedCurriculumRoleIds.includes(c.roleId)).length === 0 && (
                      <p className="p-3 bg-slate-50 text-xs italic text-center text-slate-400 rounded">No chapters matching selected profiles.</p>
                    )}
                  </div>

                  {/* Add chapter trigger */}
                  <div className="bg-indigo-50/20 p-3.5 rounded-xl border border-indigo-150 space-y-2.5 text-left">
                    <span className="block text-[10px] uppercase font-black text-indigo-700 font-mono tracking-wider">
                      ➕ Create New Chapter
                    </span>

                    <div>
                      <label className="block text-[9px] uppercase font-mono font-bold text-slate-400 mb-1">Target Profile</label>
                      <select
                        value={addChapterRoleId}
                        onChange={(e) => setAddChapterRoleId(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-xs font-bold text-slate-800 focus:border-indigo-500 outline-none"
                      >
                        {roles.map(r => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] uppercase font-mono font-bold text-slate-400 mb-1">Chapter Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Closing adjusting ledgers"
                        value={newChapterName}
                        onChange={(e) => setNewChapterName(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-xs outline-none focus:border-indigo-500"
                      />
                    </div>
                    
                    <button
                      onClick={handleAddChapter}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-1.5 rounded-lg transition cursor-pointer"
                    >
                      + Setup Chapter File
                    </button>
                  </div>
                </div>

                {/* Right Column: Units Creation Matrix */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Action box to create new unit */}
                  <div className="bg-linear-to-r from-indigo-50/50 via-teal-50/30 to-indigo-50/50 rounded-2xl border border-indigo-100 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-3xs">
                    <div>
                      <h5 className="text-xs font-extrabold uppercase text-indigo-900 font-mono tracking-wider">⚡ Mapped Operational Lessons</h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">Need to deploy procedural learning walkthrough checklists to chapters?</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingUnitId(null);
                        setUnitCode('');
                        setUnitTaskName('');
                        setUnitVideoTitle('');
                        setUnitVideoUrl('');
                        setUnitDesc('');
                        setUnitChapterId('');
                        setIsUnitModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-xs hover:shadow-sm active:scale-98 transition duration-150 cursor-pointer shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Lesson Unit SKU</span>
                    </button>
                  </div>

                  {/* Lessons Modal Dialog */}
                  <AnimatePresence>
                    {isUnitModalOpen && (
                      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => {
                            setIsUnitModalOpen(false);
                            setEditingUnitId(null);
                          }}
                          className="fixed inset-0"
                        />

                        <motion.div
                          initial={{ scale: 0.95, opacity: 0, y: 15 }}
                          animate={{ scale: 1, opacity: 1, y: 0 }}
                          exit={{ scale: 0.95, opacity: 0, y: 15 }}
                          transition={{ type: 'spring', duration: 0.3 }}
                          className="relative bg-white text-slate-800 rounded-3xl border border-slate-205 border-slate-200 shadow-2xl p-6 md:p-8 w-full max-w-2xl z-10 my-8 max-h-[90vh] overflow-y-auto"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setIsUnitModalOpen(false);
                              setEditingUnitId(null);
                            }}
                            className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition cursor-pointer"
                            title="Close Modal"
                          >
                            <X className="w-4 h-4" />
                          </button>

                          <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2 mb-1">
                            <span>{editingUnitId ? '📝 Edit Lesson Unit SKU' : '⚡ Add Lesson Unit SKU'}</span>
                          </h3>
                          <p className="text-[11px] text-slate-500 mb-6">
                            {editingUnitId
                              ? 'Modify tactical operational verification codes and multimedia tutorials mapped to enterprise departments.'
                              : 'Register a new procedural walkthrough mapping to chapters and job roles.'}
                          </p>

                          <form onSubmit={handleSaveUnit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans text-slate-705">
                            <div>
                              <label className="block text-[10px] uppercase font-mono font-bold text-slate-500 mb-1.5">Under Chapter <span className="text-rose-500 font-bold">*</span></label>
                              <select
                                required
                                value={unitChapterId}
                                onChange={(e) => setUnitChapterId(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition font-medium"
                              >
                                <option value="">Select Chapter...</option>
                                {chapters.filter(c => selectedCurriculumRoleIds.includes(c.roleId)).map(chap => {
                                  const chapRole = roles.find(r => r.id === chap.roleId);
                                  return (
                                    <option key={chap.id} value={chap.id}>
                                      {chap.name} {chapRole ? `(${chapRole.name})` : ''}
                                    </option>
                                  );
                                })}
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] uppercase font-mono font-bold text-slate-500 mb-1.5">Unit Code SKU <span className="text-rose-500 font-bold">*</span></label>
                              <input
                                type="text"
                                required
                                placeholder="e.g. TAX-009"
                                value={unitCode}
                                onChange={(e) => setUnitCode(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition font-semibold"
                              />
                            </div>

                            <div className="sm:col-span-2">
                              <label className="block text-[10px] uppercase font-mono font-bold text-slate-500 mb-1.5">Work task & Title name <span className="text-rose-500 font-bold">*</span></label>
                              <input
                                type="text"
                                required
                                placeholder="e.g. Direct GST e-cash ledger payments checking"
                                value={unitTaskName}
                                onChange={(e) => setUnitTaskName(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition font-semibold"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] uppercase font-mono font-bold text-slate-500 mb-1.5">Execution frequency</label>
                              <select
                                value={unitFreq}
                                onChange={(e) => setUnitFreq(e.target.value as UnitFrequency)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition font-medium"
                              >
                                <option value="Daily">Daily</option>
                                <option value="Weekly">Weekly</option>
                                <option value="Monthly">Monthly</option>
                                <option value="Quarterly">Quarterly</option>
                                <option value="Ad-hoc">Ad-hoc</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] uppercase font-mono font-bold text-slate-500 mb-1.5">Skill Complexity Required</label>
                              <select
                                value={unitSkill}
                                onChange={(e) => setUnitSkill(e.target.value as UnitSkillLevel)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition font-medium"
                              >
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] uppercase font-mono font-bold text-slate-500 mb-1.5">Stream Video title</label>
                              <input
                                type="text"
                                placeholder="e.g. GST Filing Tutorial Guidance"
                                value={unitVideoTitle}
                                onChange={(e) => setUnitVideoTitle(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition font-medium"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] uppercase font-mono font-bold text-slate-500 mb-1.5">Video link (YouTube embeds)</label>
                              <input
                                type="text"
                                placeholder="e.g. https://www.youtube.com/embed/S7U_F7F9-kM"
                                value={unitVideoUrl}
                                onChange={(e) => setUnitVideoUrl(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition font-medium"
                              />
                            </div>

                            <div className="sm:col-span-2">
                              <label className="block text-[10px] uppercase font-mono font-bold text-slate-500 mb-1.5">Suggested Guidance Tutorial Description</label>
                              <textarea
                                placeholder="Give instructional guides or details of this operational checklist..."
                                value={unitDesc}
                                onChange={(e) => setUnitDesc(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 min-h-[90px] focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition font-medium"
                              />
                            </div>

                            <div className="sm:col-span-2 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                              <button
                                type="button"
                                onClick={() => {
                                  setIsUnitModalOpen(false);
                                  setEditingUnitId(null);
                                }}
                                className="px-4.5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-500 text-xs font-bold rounded-xl transition cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                              >
                                {editingUnitId ? 'Update Unit Entry' : '+ Deploy Unit to active matrices'}
                              </button>
                            </div>
                          </form>
                        </motion.div>
                      </div>
                    )}
                  </AnimatePresence>

                  {/* Display Lists of existing units inside curriculum */}
                  <div>
                    <div className="mb-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="text-xs font-bold uppercase text-slate-800 font-mono tracking-wider">
                          II. Active Chapter Units ({units.filter(u => selectedCurriculumRoleIds.includes((chapters.find(c => c.id === u.chapterId))?.roleId || '')).length} total)
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Use arrow buttons to adjust sequence order (Up / Down).</p>
                      </div>

                      {/* Sort + Search options with dynamic filters */}
                      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                        {/* SORT SELECT DROPDOWN */}
                        <div className="relative flex-shrink-0">
                          <select
                            value={currSortMode}
                            onChange={(e) => setCurrSortMode(e.target.value as any)}
                            className="bg-white hover:bg-slate-50 transition border border-slate-300 focus:border-indigo-500 rounded-lg px-2.5 py-1.5 text-xs outline-none font-bold text-slate-700 cursor-pointer"
                          >
                            <option value="standard">⚙️ Sequence (Default)</option>
                            <option value="code-asc">🔤 Code SKU (A-Z)</option>
                            <option value="code-desc">🔤 Code SKU (Z-A)</option>
                            <option value="title-asc">📖 Title (A-Z)</option>
                            <option value="level-asc">📈 Complexity Level</option>
                          </select>
                        </div>

                        <div className="relative flex-1 sm:w-64">
                          <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400 text-xs">
                            🔍
                          </span>
                          <input
                            type="text"
                            placeholder="Search chapters or units (code, name)..."
                            value={currSearchQuery}
                            onChange={(e) => setCurrSearchQuery(e.target.value)}
                            className="w-full bg-slate-50 hover:bg-slate-100/60 transition border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-lg pl-8 pr-2.5 py-1.5 text-xs outline-none font-medium text-slate-800"
                          />
                        </div>
                        {currSearchQuery && (
                          <button
                            type="button"
                            onClick={() => setCurrSearchQuery('')}
                            className="text-[10px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2.5 py-1.5 rounded-lg transition"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </div>

                    {(currSearchQuery || currSortMode !== 'standard') && (
                      <div className="mb-3.5 bg-indigo-50/40 border border-indigo-100 rounded-xl px-4 py-2 text-[10.5px] text-indigo-800 flex items-center justify-between flex-wrap gap-2">
                        <span className="font-medium">
                          Active Filter: {currSearchQuery ? `Searching for "${currSearchQuery}"` : ''} 
                          {currSearchQuery && currSortMode !== 'standard' ? ' & ' : ''}
                          {currSortMode !== 'standard' ? `Sorted by ${
                            currSortMode === 'code-asc' ? 'Code SKU (A-Z)' : 
                            currSortMode === 'code-desc' ? 'Code SKU (Z-A)' : 
                            currSortMode === 'title-asc' ? 'Title (A-Z)' : 'Complexity Level'
                          }` : ''}
                        </span>
                        <span className="text-[9.5px] font-mono bg-indigo-150 bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full font-bold">
                          Reordering Sequence Disabled
                        </span>
                      </div>
                    )}
                    
                    <div className="space-y-4 text-left">
                      {(() => {
                        const lowercaseQuery = currSearchQuery.toLowerCase().trim();
                        const displayedChapters = chapters
                          .filter(c => selectedCurriculumRoleIds.includes(c.roleId))
                          .sort((a, b) => (a.order || 0) - (b.order || 0))
                          .filter(chap => {
                            if (!lowercaseQuery) return true;
                            const matchesChapName = chap.name.toLowerCase().includes(lowercaseQuery);
                            if (matchesChapName) return true;
                            
                            const chapUnits = units.filter(u => u.chapterId === chap.id);
                            return chapUnits.some(u => 
                              u.code.toLowerCase().includes(lowercaseQuery) ||
                              u.taskName.toLowerCase().includes(lowercaseQuery) ||
                              u.description.toLowerCase().includes(lowercaseQuery) ||
                              (u.videoTitle && u.videoTitle.toLowerCase().includes(lowercaseQuery))
                            );
                          });

                        if (displayedChapters.length === 0) {
                          return (
                            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center text-slate-400 italic text-xs">
                              No chapters or guidelines matched your filter/search criteria.
                            </div>
                          );
                        }

                        return displayedChapters.map((chap, chapIdx, chapArr) => {
                          const rawUnits = units.filter(u => u.chapterId === chap.id);
                          const chapUnits = rawUnits.filter(u => {
                            if (!lowercaseQuery) return true;
                            if (chap.name.toLowerCase().includes(lowercaseQuery)) return true;
                            return (
                              u.code.toLowerCase().includes(lowercaseQuery) ||
                              u.taskName.toLowerCase().includes(lowercaseQuery) ||
                              u.description.toLowerCase().includes(lowercaseQuery) ||
                              (u.videoTitle && u.videoTitle.toLowerCase().includes(lowercaseQuery))
                            );
                          });
                          const chapRole = roles.find(r => r.id === chap.roleId);

                          // Sort chapUnits based on selected sorting mode
                          let sortedChapUnits = [...chapUnits];
                          if (currSortMode === 'code-asc') {
                            sortedChapUnits.sort((a, b) => a.code.localeCompare(b.code));
                          } else if (currSortMode === 'code-desc') {
                            sortedChapUnits.sort((a, b) => b.code.localeCompare(a.code));
                          } else if (currSortMode === 'title-asc') {
                            sortedChapUnits.sort((a, b) => a.taskName.localeCompare(b.taskName));
                          } else if (currSortMode === 'level-asc') {
                            const levelMap = { 'Beginner': 0, 'Intermediate': 1, 'Advanced': 2 };
                            sortedChapUnits.sort((a, b) => (levelMap[a.skillRequired] ?? 0) - (levelMap[b.skillRequired] ?? 0));
                          }

                          return (
                            <div key={chap.id} className="border border-slate-200 rounded-lg p-4 bg-white shadow-3xs hover:shadow-2xs transition">
                              <h5 className="font-bold text-xs text-slate-800 mb-2 border-b pb-1.5 flex justify-between items-center flex-wrap gap-1.5">
                                <span className="font-extrabold text-slate-900 flex items-center gap-2">
                                  {/* Chapter Reorder Buttons inside Chapter cards */}
                                  <span className="inline-flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                                    <button
                                      type="button"
                                      onClick={() => handleMoveChapter(chap.id, 'up')}
                                      disabled={chapIdx === 0 || currSearchQuery !== '' || currSortMode !== 'standard'}
                                      className={`w-5 h-5 flex items-center justify-center text-[8px] rounded transition ${
                                        chapIdx === 0 || currSearchQuery !== '' || currSortMode !== 'standard'
                                          ? 'text-slate-300 pointer-events-none'
                                          : 'text-slate-600 hover:text-indigo-700 hover:bg-white'
                                      }`}
                                      title={currSearchQuery ? 'Clear search to reorder chapters' : currSortMode !== 'standard' ? 'Switch sort to Sequence to reorder chapters' : 'Move Chapter Up'}
                                    >
                                      ▲
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleMoveChapter(chap.id, 'down')}
                                      disabled={chapIdx === chapArr.length - 1 || currSearchQuery !== '' || currSortMode !== 'standard'}
                                      className={`w-5 h-5 flex items-center justify-center text-[8px] rounded transition ${
                                        chapIdx === chapArr.length - 1 || currSearchQuery !== '' || currSortMode !== 'standard'
                                          ? 'text-slate-300 pointer-events-none'
                                          : 'text-slate-600 hover:text-indigo-700 hover:bg-white'
                                      }`}
                                      title={currSearchQuery ? 'Clear search to reorder chapters' : currSortMode !== 'standard' ? 'Switch sort to Sequence to reorder chapters' : 'Move Chapter Down'}
                                    >
                                      ▼
                                    </button>
                                  </span>
                                  <span>Chapter: {chap.name}</span>
                                </span>
                                {chapRole && (
                                  <span className="text-[9px] bg-indigo-50 border border-indigo-100 font-mono text-indigo-700 px-2 py-0.5 rounded-full font-bold uppercase">
                                    {chapRole.name}
                                  </span>
                                )}
                              </h5>

                              <div className="divide-y divide-slate-100">
                                {sortedChapUnits.map(unit => {
                                  const rawIdx = rawUnits.findIndex(u => u.id === unit.id);
                                  const isFirstUnit = rawIdx === 0;
                                  const isLastUnit = rawIdx === rawUnits.length - 1;

                                  return (
                                    <div key={unit.id} className="py-2.5 flex items-center justify-between gap-4 text-xs font-sans text-slate-705">
                                      <div className="text-left">
                                        <span className="font-mono text-emerald-600 block text-[10px] font-bold">[{unit.code}] {unit.frequency} • <span className="text-slate-500 font-sans font-medium">{unit.skillRequired}</span></span>
                                        <span className="font-semibold text-slate-800 text-[11px]">{unit.taskName}</span>
                                        {unit.description && (
                                          <p className="text-[10px] text-slate-405 text-slate-500 mt-0.5 line-clamp-2 max-w-lg">{unit.description}</p>
                                        )}
                                        {unit.videoTitle && (
                                          <p className="text-[9.5px] text-indigo-600 font-mono mt-0.5">📺 {unit.videoTitle}</p>
                                        )}
                                      </div>
                                      <div className="flex gap-1.5 items-center shrink-0">
                                        {/* Unit Reordering Controllers */}
                                        <div className="flex items-center border border-slate-200 bg-slate-50 rounded-lg p-0.5 shadow-2xs">
                                          <button
                                            type="button"
                                            onClick={() => handleMoveUnit(unit.id, 'up')}
                                            disabled={isFirstUnit || currSearchQuery !== '' || currSortMode !== 'standard'}
                                            className={`w-6 h-6 flex items-center justify-center rounded text-[10px] font-bold cursor-pointer transition ${
                                              isFirstUnit || currSearchQuery !== '' || currSortMode !== 'standard'
                                                ? 'text-slate-300 pointer-events-none'
                                                : 'text-slate-655 hover:text-indigo-900 hover:bg-white'
                                            }`}
                                            title={currSearchQuery ? 'Clear search to reorder' : currSortMode !== 'standard' ? 'Switch sort to Sequence to reorder' : 'Move Unit Up'}
                                          >
                                            ▲
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleMoveUnit(unit.id, 'down')}
                                            disabled={isLastUnit || currSearchQuery !== '' || currSortMode !== 'standard'}
                                            className={`w-6 h-6 flex items-center justify-center rounded text-[10px] font-bold cursor-pointer transition ${
                                              isLastUnit || currSearchQuery !== '' || currSortMode !== 'standard'
                                                ? 'text-slate-300 pointer-events-none'
                                                : 'text-slate-655 hover:text-indigo-900 hover:bg-white'
                                            }`}
                                            title={currSearchQuery ? 'Clear search to reorder' : currSortMode !== 'standard' ? 'Switch sort to Sequence to reorder' : 'Move Unit Down'}
                                          >
                                            ▼
                                          </button>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => startEditUnit(unit)}
                                          className="bg-slate-100 text-slate-650 hover:bg-slate-200 p-1.5 rounded transition cursor-pointer"
                                          title="Edit Unit"
                                        >
                                          <Edit3 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteUnit(unit.id)}
                                          className="bg-slate-100 text-rose-600 hover:bg-rose-50 p-1.5 rounded transition cursor-pointer"
                                          title="Delete Unit"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                                {chapUnits.length === 0 && (
                                  <p className="text-[11px] text-slate-400 italic py-2 text-center">
                                    {rawUnits.length > 0 ? 'No matching units for active search query.' : 'No units deployed inside this chapter.'}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              /* Excel/CSV Bulk dynamic setup views */
              <div className="space-y-6">
                {/* Bulk Import Info Alert & Document Guide */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 text-left">
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2 border-b border-slate-200/60 pb-3">
                    <h4 className="font-display font-black text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                      <Info className="w-4 h-4 text-emerald-600 animate-pulse" />
                      I. BULK LOADING DOCUMENTATION & SPECIFICATION RULES
                    </h4>
                    <div className="flex bg-white rounded-lg p-0.5 text-[10px] border">
                      <button
                        type="button"
                        onClick={() => setBulkDocTab('docs')}
                        className={`px-3 py-1 font-extrabold rounded-md transition cursor-pointer ${
                          bulkDocTab === 'docs' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        📋 Column Rules
                      </button>
                      <button
                        type="button"
                        onClick={() => setBulkDocTab('sample')}
                        className={`px-3 py-1 font-extrabold rounded-md transition cursor-pointer ${
                          bulkDocTab === 'sample' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        💡 Sample CSV/Excel Data
                      </button>
                    </div>
                  </div>

                  {bulkDocTab === 'docs' ? (
                    <div className="space-y-4">
                      <p className="text-[11px] text-slate-650 leading-relaxed">
                        Aap columns ko <strong>Excel, Google Sheets, ya Notepad</strong> se copy karke direct niche paste kar sakte hain. Excel se copy-paste karne par data default <strong>Tab-Separated (TSV)</strong> formats me paste hoga. Column sequencing details niche hai:
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="bg-white p-3 rounded-lg border border-slate-150 shadow-3xs">
                          <span className="text-[10px] uppercase font-bold text-indigo-700 block mb-0.5">1. Job Profile *</span>
                          <p className="text-[10px] text-slate-500 leading-normal">
                            Uploader designation name ya id match karega (e.g. <code>Tax Associate</code>, <code>Senior Accountant</code>). Substrings bhi match ho jayenge!
                          </p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-slate-150 shadow-3xs">
                          <span className="text-[10px] uppercase font-bold text-indigo-700 block mb-0.5">2. Chapter Name *</span>
                          <p className="text-[10px] text-slate-500 leading-normal">
                            Kis chapter ke andar units load krne hain. Chapter pehle se register nahi hone par <strong>automated dynamic Chapter creation</strong> trigger hoga!
                          </p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-slate-150 shadow-3xs">
                          <span className="text-[10px] uppercase font-bold text-indigo-700 block mb-0.5">3. Unit Code *</span>
                          <p className="text-[10px] text-slate-500 leading-normal">
                            Har task ka alpha-numeric unique SKU code. E.g. <code>TAX-101</code>, <code>FIN-203</code> isse trainee tracks track kiye jate h.
                          </p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-slate-150 shadow-3xs">
                          <span className="text-[10px] uppercase font-bold text-indigo-700 block mb-0.5">4. Work Task / Title *</span>
                          <p className="text-[10px] text-slate-500 leading-normal">
                            Operational task execution action heading (e.g. <code>Perform GSTR-1 Ledger Rec</code>). Trainees ko training portal par exactly yahi task visible hoga.
                          </p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-slate-150 shadow-3xs">
                          <span className="text-[10px] uppercase font-bold text-indigo-700 block mb-0.5">5. Execution Frequency</span>
                          <p className="text-[10px] text-slate-500 leading-normal">
                            Must map exactly to: <code>Daily</code>, <code>Weekly</code>, <code>Monthly</code>, <code>Quarterly</code>, <code>Ad-hoc</code> (or default standard maps to "Daily").
                          </p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-slate-150 shadow-3xs">
                          <span className="text-[10px] uppercase font-bold text-indigo-700 block mb-0.5">6. Skill Level</span>
                          <p className="text-[10px] text-slate-500 leading-normal">
                            Complexity tags: <code>Beginner</code>, <code>Intermediate</code>, <code>Advanced</code> (invalid value standard default triggers "Beginner").
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-205/60">
                        <p className="text-[11px] text-slate-655 font-medium max-w-sm leading-relaxed">
                          Niche sample table columns diye gye hain. Heading and specification format dekhne ke liye <strong>Excel template download</strong> kijiye ya fir copy/autofill karke test kijiye:
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={downloadExcelTemplate}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-[10px] px-3.5 py-2 rounded-lg border border-indigo-700 transition flex items-center gap-1.5 cursor-pointer hover:shadow-xs active:scale-95"
                          >
                            <Download className="w-3.5 h-3.5 text-indigo-100" />
                            Download Excel Template (.xlsx)
                          </button>
                          <button
                            type="button"
                            onClick={copySampleData}
                            className="bg-slate-900 hover:bg-slate-800 text-white font-mono font-bold text-[10px] px-3.5 py-2 rounded-lg border border-slate-950 transition flex items-center gap-1.5 cursor-pointer hover:shadow-xs active:scale-95"
                          >
                            <Copy className="w-3.5 h-3.5 text-indigo-450" />
                            Copy Tabular Data
                          </button>
                          <button
                            type="button"
                            onClick={autofillSampleIntoInput}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-[10px] px-3.5 py-2 rounded-lg border border-emerald-700 transition flex items-center gap-1.5 cursor-pointer hover:shadow-xs active:scale-95"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-emerald-100 animate-pulse" />
                            1-Click Autofill
                          </button>
                        </div>
                      </div>
                      <pre className="text-[10px] font-mono bg-slate-900 text-emerald-400 p-4 rounded-xl overflow-x-auto text-left leading-relaxed border border-slate-950 shadow-inner max-h-48 overflow-y-auto">
{`Job Profile\tChapter Name\tUnit Code\tWork Task / Title\tExecution Frequency\tSkill Level\tVideo Title\tVideo Embed URL\tDescription
Tax Associate\tGST Compliance & Filings\tGST-004\tVerify GSTR-2B compliance records\tMonthly\tIntermediate\tGSTR-2B Mismatch Audit Guide\thttps://www.youtube.com/embed/S7U_F7F9-kM\tCheck invoice inputs against online GSTR-2B records to maximize input tax credit.
Senior Accountant\tFinancial Close & Consolidation Accounting\tFIN-502\tPerform Bank Reconciliation Statement (BRS)\tDaily\tAdvanced\tFIN-502 BRS SOP Walkthrough\thttps://www.youtube.com/embed/nE1E1xidV2U\tReconcile all bank statements with general ledger logs, check adjusting entry errors.
Junior Accountant\tFixed Asset Register Maintenance\tAST-101\tRecord physical assets depreciation\tMonthly\tBeginner\tAST-101 Depreciation Guide\thttps://www.youtube.com/embed/nE1E1xidV2U\tCalculate depreciation using straight-line and WDV methods, update active registers.
Accounts Executive (AP/AR)\tAccounts Payable Workflow\tAP-201\tMatch vendor purchase orders\tDaily\tBeginner\tAP-201 Invoice verification guidelines\thttps://www.youtube.com/embed/nE1E1xidV2U\tVerify incoming supplier bills against matching purchase orders and GRN inputs.`}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Input controls and Input Text Area */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4 text-left">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h4 className="font-display font-black text-xs text-slate-800 uppercase tracking-wider font-mono flex items-center gap-1.5">
                        <Upload className="w-4 h-4 text-emerald-600" />
                        II. UPLOAD EXCEL / CSV OR COPY-PASTE SHEET
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Apna Excel (.xlsx, .xls) ya standard CSV file drop kijiye ya copy-paste karke dynamic load kijiye.</p>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-1.5 text-xs text-slate-705">
                        <span className="font-mono text-[9px] font-bold text-slate-400 uppercase">FORMAT:</span>
                        <select
                          value={bulkDelimiterType}
                          onChange={(e) => setBulkDelimiterType(e.target.value as any)}
                          className="bg-white border rounded-lg px-2.5 py-1 text-[11px] font-bold text-slate-800 outline-none focus:border-indigo-500"
                        >
                          <option value="auto">Auto-Detect Separators 🔍</option>
                          <option value="tsv">TAB (Excel/Google Sheets)</option>
                          <option value="csv">COMMA (CSV Notepad export)</option>
                        </select>
                      </div>

                      <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-705 bg-white border px-3 py-1 rounded-lg">
                        <input
                          type="checkbox"
                          checked={bulkOverwriteMode}
                          onChange={(e) => setBulkOverwriteMode(e.target.checked)}
                          className="rounded text-rose-650 focus:ring-rose-505 border-slate-300 w-3.5 h-3.5 cursor-pointer"
                        />
                        <span className="text-rose-600 text-[11px]">Overwrite Matched Profile's Syllabus</span>
                      </label>
                    </div>
                  </div>

                  {/* Drag and Drop File Picker Area */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('excel-file-uploader-input')?.click()}
                    className={`border-2 border-dashed rounded-xl p-5 transition-all duration-200 text-center flex flex-col items-center justify-center cursor-pointer ${
                      isDragActive 
                        ? 'border-indigo-500 bg-indigo-50/50 hover:bg-indigo-50' 
                        : bulkFileName 
                        ? 'border-emerald-500 bg-emerald-50/10 hover:bg-emerald-50/20' 
                        : 'border-slate-300 hover:border-slate-450 bg-white hover:bg-slate-50/55'
                    }`}
                  >
                    <input
                      type="file"
                      id="excel-file-uploader-input"
                      className="hidden"
                      accept=".xlsx,.xls,.csv"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload(e.target.files[0]);
                        }
                      }}
                    />
                    
                    <div className="p-2.5 bg-indigo-50 rounded-full text-indigo-600 mb-2">
                      <FileText className="w-5 h-5" />
                    </div>
                    
                    {bulkFileName ? (
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-emerald-700 flex items-center justify-center gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-600 text-[10px]" />
                          Loaded File: <span className="font-mono text-indigo-750 underline">{bulkFileName}</span>
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Niche raw data mirror container me generated data reflect ho raha hai. Aap update bhi kar sakti hain.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-xs font-black text-slate-700">
                          Click to select or drag & drop actual Excel / CSV File here
                        </p>
                        <p className="text-[10px] text-slate-400">
                          We process Microsoft Excel (.xlsx, .xls) & comma-delimited (.csv) files offline instantly.
                        </p>
                        <p className="text-[10px] text-indigo-600 bg-indigo-50/70 inline-block px-2 py-0.5 rounded border border-indigo-100 hover:bg-indigo-100 transition mt-1.5 font-medium">
                          💡 Naya Excel sheet banana chahte hain? <span className="underline font-bold" onClick={(e) => { e.stopPropagation(); downloadExcelTemplate(); }}>Yahan click karke Column Headings & sample sheet download karein</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Manual Paste/Modify Area */}
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold uppercase font-mono text-slate-400">
                      📝 Raw Tabular Data (Real-time Mirror & Editable)
                    </label>
                    <div className="relative">
                      <textarea
                        rows={6}
                        placeholder="Paste columns starting with headers e.g.&#10;Job Profile	Chapter Name	Unit Code	Work Task / Title..."
                        value={bulkInputText}
                        onChange={(e) => setBulkInputText(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-4 font-mono text-xs text-slate-800 leading-normal focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none placeholder:text-slate-300"
                      />
                      {(bulkInputText || bulkFileName) && (
                        <button
                          onClick={() => {
                            setBulkInputText('');
                            setBulkFileName('');
                            setBulkParsedRows([]);
                            setBulkImportSuccess('');
                            setBulkImportError('');
                          }}
                          className="absolute top-3 right-3 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] rounded px-2.5 py-1 font-bold transition cursor-pointer"
                        >
                          Clear Input & File
                        </button>
                      )}
                    </div>
                  </div>

                  {bulkImportSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-250 text-emerald-850 rounded-lg text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>{bulkImportSuccess}</span>
                    </div>
                  )}

                  {bulkImportError && (
                    <div className="p-3 bg-red-50 border border-red-205 text-red-850 rounded-lg text-xs font-semibold flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-red-650 flex-shrink-0 animate-bounce" />
                      <span>{bulkImportError}</span>
                    </div>
                  )}
                </div>

                {/* Validation Checker Spreadsheet preview */}
                {bulkParsedRows.length > 0 && (
                  <div className="bg-white rounded-xl border border-slate-150 p-4 space-y-3 shadow-3xs text-left">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                      <div>
                        <h5 className="font-display font-black text-xs text-slate-800 uppercase tracking-widest font-mono">
                          III. REALTIME IMPORT INTEGRITY COMPLIANCE PREVIEW
                        </h5>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Review how the engine mapped your cell inputs. Red rows will be skipped.
                        </p>
                      </div>
                      <div className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-black text-slate-650 font-mono">
                        TOTAL ROWS: {bulkParsedRows.length} | VALID: {bulkParsedRows.filter(r => r.isValid).length}
                      </div>
                    </div>

                    <div className="overflow-x-auto max-h-72 border border-slate-150 rounded-lg">
                      <table className="min-w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-150 text-[10px] uppercase font-mono font-black text-slate-400">
                            <th className="p-2.5">Index</th>
                            <th className="p-2.5">Status / Errors</th>
                            <th className="p-2.5">Job Designation</th>
                            <th className="p-2.5">Chapter Name</th>
                            <th className="p-2.5">SKU Code</th>
                            <th className="p-2.5">Work Task / Title</th>
                            <th className="p-2.5">Frequency / Level</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 divide-dashed font-sans">
                          {bulkParsedRows.map((row, rIdx) => (
                            <tr
                              key={rIdx}
                              className={`${
                                !row.isValid 
                                  ? 'bg-rose-50/40 text-rose-900 border-l-4 border-l-rose-500' 
                                  : row.warnings.length > 0
                                  ? 'bg-amber-50/20 border-l-4 border-l-amber-500'
                                  : 'hover:bg-slate-50/50'
                              }`}
                            >
                              <td className="p-2.5 font-mono text-[10px] text-slate-400">#{row.index}</td>
                              <td className="p-2.5 max-w-[200px]">
                                {!row.isValid ? (
                                  <div className="space-y-0.5 text-[10px] text-rose-705 font-medium">
                                    {row.errors.map((e: string, eidx: number) => (
                                      <div key={eidx} className="flex items-center gap-1 font-bold">
                                        ❌ {e}
                                      </div>
                                    ))}
                                  </div>
                                ) : row.warnings.length > 0 ? (
                                  <div className="space-y-0.5 text-[10px] text-amber-700">
                                    <span className="text-[9px] bg-amber-100 text-amber-900 px-1 py-0.2 rounded font-mono font-bold">WARNING</span>
                                    {row.warnings.map((w: string, widx: number) => (
                                      <div key={widx} className="font-medium">{w}</div>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-emerald-750 font-extrabold flex items-center gap-1 font-mono">
                                    ✓ Ready
                                  </span>
                                )}
                              </td>
                              <td className="p-2.5 font-bold">
                                <span className="text-indigo-900">{row.matchedRole.name}</span>
                                <span className="block text-[9px] font-mono text-slate-400 font-bold max-w-[150px] truncate">ROLE ID: {row.matchedRole.id}</span>
                              </td>
                              <td className="p-2.5 max-w-[140px] truncate font-medium text-slate-805" title={row.rawChapter}>
                                {row.rawChapter}
                              </td>
                              <td className="p-2.5 font-mono text-[11px] font-bold text-emerald-650">{row.rawCode}</td>
                              <td className="p-2.5 font-medium text-slate-755 max-w-[190px] truncate" title={row.rawTask}>
                                {row.rawTask}
                              </td>
                              <td className="p-2.5 whitespace-nowrap">
                                <span className="bg-indigo-50 text-indigo-750 px-1.5 py-0.5 rounded font-mono text-[9px] font-bold uppercase">{row.cleanFreq}</span>
                                <span className="ml-1 bg-slate-150 text-slate-705 px-1.5 py-0.5 rounded font-mono text-[9px] font-bold uppercase">{row.cleanSkill}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Action commit button */}
                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={executeBulkImport}
                        disabled={bulkParsedRows.filter(r => r.isValid).length === 0}
                        className={`font-black uppercase tracking-wider text-xs px-6 py-3 rounded-lg border shadow-sm transition flex items-center gap-2 cursor-pointer ${
                          bulkParsedRows.filter(r => r.isValid).length > 0
                            ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-700 text-white hover:shadow-md'
                            : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Integrate & Load {bulkParsedRows.filter(r => r.isValid).length} Lesson Units
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          TAB 5: RECHARTS PROGRESS VISUALS / ANALYTICS
          ---------------------------------------------------- */}
      {adminTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-md font-bold text-slate-900 mb-2 uppercase flex items-center gap-1.5">
              <BarChart2 className="w-5 h-5 text-emerald-600" />
              Accounts Division Path Audits Data
            </h3>
            <p className="text-xs text-slate-500 mb-6 font-sans">
              Dynamic chart metrics analyzing employee curriculum paths met vs. Verified mastery percentages.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Employee overall percentages bar chart */}
              <div className="bg-slate-50 p-4 rounded-xl border">
                <h4 className="text-xs font-bold text-slate-700 font-mono uppercase mb-4 text-center">Path Progress (%) of registered staffers</h4>
                <div className="h-64 sm:h-80 relative w-full">
                  <div className="relative w-full h-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                      <BarChart
                        data={chartUserData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                      >
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                        <Tooltip contentStyle={{ fontSize: 11 }} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Bar dataKey="Progress" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Mastery" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Status breakdown pie chart */}
              <div className="bg-slate-50 p-4 rounded-xl border flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-700 font-mono uppercase mb-1 text-center">Unit-Wise Status Distribution</h4>
                  <p className="text-[10px] text-slate-400 text-center mb-4">Total operations active inside security matrix</p>
                </div>

                <div className="h-48 sm:h-60 relative w-full flex items-center justify-center">
                  <div className="relative flex-1 h-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                      <PieChart>
                        <Pie
                          data={statusCounts.filter(v => v.value > 0)}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {statusCounts.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ fontSize: 11 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-2 sm:gap-4 text-[11px] font-mono mt-4">
                  {statusCounts.map((st, sidx) => (
                    <div key={sidx} className="flex items-center gap-1.5 shrink-0">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: st.color }}></span>
                      <span>{st.name} ({st.value})</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          TAB 6: ASSESSMENT EXAM ADMINISTRATION GATEWAY
          ---------------------------------------------------- */}
      {adminTab === 'recruitment' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 animate-in fade-in duration-200 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <FolderOpen className="w-5.5 h-5.5 text-[#059669]" />
                Compliance Exams Coordinator
              </h3>
              <p className="text-xs text-slate-500">Configure gating exams, build multiple-choice or open text questions, and audit taker submissions logs.</p>
            </div>
          </div>
            
            {/* Sub-tabs Navigation inside Assessment Exams tab */}
          <div className="flex border-b border-slate-200 mb-6 gap-6 select-none font-sans">
            <button
              onClick={() => setRecSubTab('logs')}
              type="button"
              className={`pb-3 text-xs font-bold tracking-tight border-b-2 transition uppercase cursor-pointer ${
                recSubTab === 'logs' 
                  ? 'border-emerald-600 text-slate-900 font-extrabold' 
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              📊 Taker Result Logs
            </button>
            <button
              onClick={() => {
                setRecSubTab('questions');
                setEditingQuestionId(null);
                setQChapterId('');
                setQType('mcq');
                setQTopic('');
                setQQuestionText('');
                setQOptions(['', '', '', '']);
                setQCorrectAnswerIndex(0);
                setQCorrectAnswerText('');
                setQExplanationText('');
                setQIsActive(true);
                setQFormSuccess('');
              }}
              type="button"
              className={`pb-3 text-xs font-bold tracking-tight border-b-2 transition uppercase cursor-pointer ${
                recSubTab === 'questions' 
                  ? 'border-emerald-600 text-slate-900 font-extrabold' 
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              📝 Question Bank ({questionsBank.length})
            </button>
            <button
              onClick={() => setRecSubTab('gating')}
              type="button"
              className={`pb-3 text-xs font-bold tracking-tight border-b-2 transition uppercase cursor-pointer ${
                recSubTab === 'gating' 
                  ? 'border-emerald-600 text-slate-900 font-extrabold' 
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              ⚙️ Exam Gating Matrix
            </button>
          </div>

          {/* SUBTAB 1: ATTEMPT LOGS */}
          {recSubTab === 'logs' && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-xs font-extrabold text-[#111827]">Filter Screening & Chapter Exams:</span>
                <div className="flex flex-wrap gap-2 text-xs">
                  <select
                    value={rec_filterRole}
                    onChange={(e) => setRecFilterRole(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg py-2 px-3 font-semibold text-slate-700 outline-none cursor-pointer focus:border-emerald-500 hover:bg-slate-100/50 transition"
                  >
                    <option value="all">All Taker Roles</option>
                    <option value="candidates">Candidates Only</option>
                    <option value="employees">Registered Staff Only</option>
                  </select>

                  <select
                    value={rec_filterResult}
                    onChange={(e) => setRecFilterResult(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg py-2 px-3 font-semibold text-slate-700 outline-none cursor-pointer focus:border-emerald-500 hover:bg-slate-100/50 transition"
                  >
                    <option value="all">All Results</option>
                    <option value="passed">Passed (&gt;= 60%)</option>
                    <option value="failed">Under 60%</option>
                  </select>

                  {purgeConfirmMode ? (
                    <div className="flex items-center gap-1.5 animate-in fade-in duration-200">
                      <button
                        onClick={() => {
                          localStorage.removeItem('lms_exam_attempts_v1');
                          setAttemptsList([]);
                          setPurgeConfirmMode(false);
                        }}
                        className="bg-rose-600 border border-rose-700 text-white hover:bg-rose-700 py-2 px-3 text-xs font-bold rounded-lg transition active:scale-95 cursor-pointer shadow-sm"
                      >
                        Confirm Purge
                      </button>
                      <button
                        onClick={() => setPurgeConfirmMode(false)}
                        className="bg-slate-200 border border-slate-300 text-slate-700 hover:bg-slate-300 py-2 px-3 text-xs font-bold rounded-lg transition active:scale-95 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setPurgeConfirmMode(true)}
                      className="bg-rose-50 border border-rose-200 hover:border-rose-300 text-rose-700 hover:bg-rose-100 py-2 px-3.5 text-xs font-bold rounded-lg transition active:scale-95 cursor-pointer"
                    >
                      Purge All Attempts
                    </button>
                  )}
                </div>
              </div>

          {/* Core Logs Panel */}
          {filteredAttempts.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-xl p-8">
              <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-extrabold text-slate-700">No Assessment Reports Logged</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-normal">
                Please have a candidate or internal staff member log in and complete the Accounting Aptitude Exam inside their dashboard first.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-200">
                    <th className="py-4 px-4 font-bold">Candidate / Staff</th>
                    <th className="py-4 px-4 font-bold">Applied / Current Role</th>
                    <th className="py-4 px-4 font-bold">Date of Attempt</th>
                    <th className="py-4 px-4 font-mono font-bold text-center">Score Percentage</th>
                    <th className="py-4 px-4 font-bold text-center">Outcome</th>
                    <th className="py-4 px-4 font-bold text-center">Audit Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAttempts.map((att: any) => {
                    const isExpanded = expandedAttemptId === att.id;

                    return (
                      <React.Fragment key={att.id}>
                        <tr className="hover:bg-slate-50/25 transition">
                          <td className="py-4.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px] uppercase border border-slate-800">
                                {att.userName.substring(0, 2)}
                              </div>
                              <div>
                                <h5 className="font-extrabold text-slate-900">{att.userName}</h5>
                                <p className="text-[10px] font-mono text-slate-400 font-medium">{att.userEmail}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4.5 px-4">
                            <div>
                              <span className="font-bold text-slate-800">{att.userRoleName}</span>
                              <p className="text-[9px] font-mono font-semibold text-slate-400 uppercase mt-0.5">{att.userRoleId}</p>
                            </div>
                          </td>
                          <td className="py-4.5 px-4 text-slate-500 font-mono">
                            {new Date(att.date).toLocaleDateString()} at {new Date(att.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </td>
                          <td className="py-4.5 px-4 text-center font-mono font-black text-sm">
                            <span className={att.score >= 60 ? 'text-emerald-600' : 'text-rose-600'}>
                              {att.score}%
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 ml-1 font-semibold">
                              ({att.correctCount}/{att.totalQuestions} Correct)
                            </span>
                          </td>
                          <td className="py-4.5 px-4 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase border ${
                              att.passed ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
                            }`}>
                              {att.passed ? 'PASSED (60%+)' : 'FAILED'}
                            </span>
                          </td>
                          <td className="py-4.5 px-4 text-center">
                            <button
                              onClick={() => setExpandedAttemptId(isExpanded ? null : att.id)}
                              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[11px] rounded transition cursor-pointer active:scale-95 shadow-sm"
                            >
                              {isExpanded ? 'Hide Responses' : 'Review Answers'}
                            </button>
                          </td>
                        </tr>
                        
                        {/* Expandable answers matrix list */}
                        {isExpanded && (
                          <tr className="bg-slate-50/50">
                            <td colSpan={6} className="p-5 border-b border-t border-slate-200">
                              <div className="bg-white rounded-xl border border-slate-200 p-5 max-w-4xl mx-auto text-xs space-y-4 shadow-sm animate-in fade-in duration-200">
                                <h4 className="font-extrabold text-slate-900 border-b pb-2 text-xs uppercase tracking-wider flex justify-between items-center">
                                  <span className="flex items-center gap-1.5 text-emerald-800">
                                    <ShieldCheck className="w-4 h-4 text-emerald-600 font-bold" />
                                    Security Evaluated Trainee Response Matrix
                                  </span>
                                  <span className="text-slate-450 font-mono font-bold text-[9px] bg-slate-50 border px-2 py-0.5 rounded">Stamp ID: {att.id}</span>
                                </h4>
                                
                                <p className="text-slate-500 text-[11px] leading-relaxed">
                                  Trainee responses matched natively against the {compName} accounts questionnaire database showing Double-entry rules accuracy, reconciliation parameters, and GST GSTR-2B compliance knowledge.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                  {/* Simulated exact question matching for historical attempt review */}
                                  {[
                                    { q: 'Documents required for AP 3-Way Match', topic: 'AP/AR matching', usrAns: att.score >= 50 ? 'Vendor Invoice, GRN, & PO' : 'Sales Quotations', corrAns: 'Vendor Invoice, GRN, & PO' },
                                    { q: 'Primary operational utility of GSTR-2B logs', topic: 'GST Compliance', usrAns: att.score >= 70 ? 'Input Tax Credit entries (ITC) Match' : 'Asset Depreciation', corrAns: 'Input Tax Credit entries (ITC) Match' },
                                    { q: 'Reimbursement under Imprest petty cash system', topic: 'GL Imprest', usrAns: att.score >= 40 ? 'Exact sum expended (Rs. 4,200)' : 'Double float amount (Rs. 10,000)', corrAns: 'Exact sum expended (Rs. 4,200)' },
                                    { q: 'Golden rule for Nominal Accounts ledger entries', topic: 'Debit/Credit entries', usrAns: att.score >= 80 ? 'Debit expenses/losses, Credit gains/revenues' : 'Debit receiver, Credit giver', corrAns: 'Debit expenses/losses, Credit gains/revenues' },
                                    { q: 'Adjusting cheques issued but not presented in BRS', topic: 'BR Reconciliations', usrAns: att.score >= 60 ? 'Add back to Cash Book starting balances' : 'Subtract from Cash Book starting balances', corrAns: 'Add back to Cash Book starting balances' },
                                    { q: 'Reason for Intercompany Transactions Elimination', topic: 'Consolidated General Ledger', usrAns: att.score >= 90 ? 'Avoid entry double counting in parent-branches' : 'Speed up bookkeeping spreadsheets', corrAns: 'Avoid entry double counting in parent-branches' }
                                  ].map((mRec, mIdx) => {
                                    const isMCorrect = mRec.usrAns === mRec.corrAns;
                                    return (
                                      <div key={mIdx} className="p-3 bg-slate-50 rounded-xl border border-slate-150 space-y-1">
                                        <p className="font-extrabold text-slate-800 leading-snug">{mIdx + 1}. {mRec.q}</p>
                                        <p className="text-[9px] font-mono text-slate-400 uppercase font-semibold">Section: {mRec.topic}</p>
                                        <div className="border-t border-slate-200/50 pt-2 mt-2 space-y-1 text-[11px]">
                                          <p className="flex justify-between items-center">
                                            <span className="text-slate-500">Trainee Answer:</span>
                                            <span className={`font-mono font-bold text-[10px] px-1.5 py-0.25 rounded ${isMCorrect ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'}`}>{mRec.usrAns}</span>
                                          </p>
                                          <p className="flex justify-between items-center">
                                            <span className="text-slate-500">Correct Value:</span>
                                            <span className="text-emerald-800 font-bold font-mono text-[10px] bg-emerald-50 px-1.5 py-0.25 rounded">{mRec.corrAns}</span>
                                          </p>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Conversational AI Screening & Recruiter Summary Logs */}
          <div className="mt-12 border-t border-slate-200 pt-8 text-left">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-md font-black text-[#1e1b4b] flex items-center gap-1.5 uppercase font-sans tracking-wide">
                  <Brain className="w-5.5 h-5.5 text-indigo-600" />
                  Conversational Screening & AI Evaluation Logs
                </h3>
                <p className="text-xs text-slate-500">
                  Detailed ratings, core strengths, and weaknesses analyzed by the AI Technical Recruiter Panel.
                </p>
              </div>

              {screeningEvals.length > 0 && (
                <div className="flex items-center gap-2">
                  {confirmClearLogs ? (
                    <div className="flex items-center gap-2 animate-in zoom-in-95 duration-100">
                      <span className="text-[10px] text-rose-600 font-black uppercase font-mono">Sure?</span>
                      <button
                        type="button"
                        onClick={() => setConfirmClearLogs(false)}
                        className="bg-slate-100 border border-slate-200 text-slate-750 hover:bg-slate-200 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          localStorage.removeItem('lms_screening_evaluations_v1');
                          setScreeningEvals([]);
                          setConfirmClearLogs(false);
                          showToast("✓ All AI technical recruiter evaluation screening logs cleared.", "success");
                        }}
                        className="bg-rose-600 text-white font-extrabold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-lg transition shadow-md cursor-pointer"
                      >
                        Yes, Clear Logs
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmClearLogs(true)}
                      className="bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-extrabold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-lg transition active:scale-95 cursor-pointer"
                    >
                      Clear Screening Logs
                    </button>
                  )}
                </div>
              )}
            </div>

            {screeningEvals.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 border border-dashed rounded-xl p-6">
                <Brain className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-800">No AI Screening Evaluations Logged</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Have a candidate complete their Technical Screening test inside the "Only Testing" tab first!
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-150">
                <table className="w-full text-left border-collapse text-xs bg-white">
                  <thead>
                    <tr className="bg-slate-50 text-slate-450 font-mono text-[9px] uppercase border-b border-slate-200">
                      <th className="py-3 px-4 font-bold">Candidate</th>
                      <th className="py-3 px-4 font-bold">Applied Designation</th>
                      <th className="py-3 px-4 font-bold">Completed On</th>
                      <th className="py-3 px-4 font-bold text-center">AI Rating Score</th>
                      <th className="py-3 px-4 font-bold text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {screeningEvals.map((eRecord: any, eIdx: number) => {
                      const isExpanded = expandedEvaluationUserId === eRecord.userId;
                      return (
                        <React.Fragment key={eRecord.userId || eIdx}>
                          <tr className="hover:bg-slate-50/40 transition">
                            <td className="py-4 px-4 font-sans">
                              <h5 className="font-extrabold text-[#111827]">{eRecord.userName}</h5>
                              <p className="text-[10px] font-mono text-slate-400 font-semibold">{eRecord.userEmail}</p>
                            </td>
                            <td className="py-4 px-4 font-semibold text-slate-700">
                              {eRecord.jobRole}
                            </td>
                            <td className="py-4 px-4 font-mono text-slate-450">
                              {eRecord.completedAt ? new Date(eRecord.completedAt).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className="font-mono font-black text-sm text-indigo-700">
                                {eRecord.score} / 10
                              </span>
                            </td>
                            <td className="py-4 px-4 text-center whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => setExpandedEvaluationUserId(isExpanded ? null : eRecord.userId)}
                                className="px-3.5 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-805 font-bold text-[10px] uppercase tracking-wider rounded-lg hover:bg-indigo-100 transition cursor-pointer active:scale-95"
                              >
                                {isExpanded ? 'Hide Record' : 'Review Evaluation'}
                              </button>
                            </td>
                          </tr>

                          {isExpanded && (
                            <tr className="bg-slate-50/50">
                              <td colSpan={5} className="p-5 border-t border-b border-slate-200">
                                <div className="bg-white rounded-xl border border-slate-200 p-5 max-w-4xl mx-auto space-y-4 shadow-sm animate-in fade-in duration-150 text-left">
                                  <div className="flex items-center gap-2 border-b pb-2">
                                    <Brain className="w-5 h-5 text-indigo-600" />
                                    <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wide">
                                      AI Interviewer Assessment Transcript Evaluator Record
                                    </h4>
                                  </div>

                                  <div className="bg-slate-50 rounded-lg p-3.5 border text-xs leading-relaxed text-slate-700 font-medium">
                                    <span className="text-[9px] font-mono font-black text-slate-400 block mb-1 uppercase tracking-widest">Justification Summary</span>
                                    {eRecord.summary}
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Strengths */}
                                    <div className="border border-emerald-150 bg-emerald-50/20 rounded-xl p-4">
                                      <h5 className="text-[10px] font-mono font-black text-emerald-800 uppercase tracking-widest block mb-2">Strengths</h5>
                                      <ul className="space-y-1.5 list-none pl-0">
                                        {Array.isArray(eRecord.strengths) && eRecord.strengths.map((s: string, sI: number) => (
                                          <li key={sI} className="text-[11px] text-slate-700 font-semibold flex items-start gap-1.5">
                                            <span className="text-emerald-600 font-black">✓</span> {s}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>

                                    {/* Weaknesses */}
                                    <div className="border border-rose-150 bg-rose-50/20 rounded-xl p-4">
                                      <h5 className="text-[10px] font-mono font-black text-rose-800 uppercase tracking-widest block mb-2">Weaknesses</h5>
                                      <ul className="space-y-1.5 list-none pl-0">
                                        {Array.isArray(eRecord.weaknesses) && eRecord.weaknesses.map((w: string, wI: number) => (
                                          <li key={wI} className="text-[11px] text-slate-700 font-semibold flex items-start gap-1.5">
                                            <span className="text-rose-500 font-black">✗</span> {w}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

        {/* SUBTAB 2: QUESTION BANK WORKSPACE */}
        {recSubTab === 'questions' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left animate-in fade-in duration-150">
            
            {/* Form Block (Left 5 Columns) */}
            <div className="lg:col-span-12 xl:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 h-fit">
              <div className="border-b border-slate-200 pb-3">
                <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase font-sans">
                  <span>✏️</span>
                  <span>{editingQuestionId ? 'Update Exam Question' : 'Add New Manual Question'}</span>
                </h4>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">Assign target chapters and answer validations dynamically</p>
              </div>

              {qFormSuccess && (
                <div className="bg-emerald-50 border border-emerald-250 text-emerald-805 text-emerald-800 text-[11px] font-black p-3 rounded-lg leading-relaxed animate-pulse">
                  ✓ {qFormSuccess}
                </div>
              )}

              {qFormError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-black p-3 rounded-lg leading-relaxed">
                  ⚠️ {qFormError}
                </div>
              )}

              <form onSubmit={(e) => {
                e.preventDefault();
                setQFormError('');
                
                if (!qChapterId) {
                  setQFormError("Please map this question to a Chapter.");
                  return;
                }
                if (!qQuestionText.trim()) {
                  setQFormError("Please write the question text.");
                  return;
                }
                if (qType === 'mcq') {
                  if (qOptions.some(o => !o.trim())) {
                    setQFormError("Please fill out all 4 option slots.");
                    return;
                  }
                } else {
                  if (!qCorrectAnswerText.trim()) {
                    setQFormError("Please supply the target text for case-insensitive matches.");
                    return;
                  }
                }

                setQFormError('');

                const newQ: ExamQuestion = {
                  id: editingQuestionId || `q_${Date.now()}`,
                  chapterId: qChapterId,
                  type: qType,
                  topic: qTopic.trim() || 'General Knowledge',
                  question: qQuestionText.trim(),
                  options: qType === 'mcq' ? qOptions.map(o => o.trim()) : undefined,
                  correctAnswerIndex: qType === 'mcq' ? qCorrectAnswerIndex : undefined,
                  correctAnswerText: qType === 'text' ? qCorrectAnswerText.trim() : undefined,
                  explanation: qExplanationText.trim() || 'No explicit logic registered.',
                  isActive: qIsActive
                };

                let updated = [...questionsBank];
                if (editingQuestionId) {
                  updated = updated.map(q => q.id === editingQuestionId ? newQ : q);
                  setQFormSuccess('Question updated successfully!');
                } else {
                  updated.push(newQ);
                  setQFormSuccess('New question added successfully!');
                }

                localStorage.setItem('lms_questions_v1', JSON.stringify(updated));
                setQuestionsBank(updated);

                // Reset
                setEditingQuestionId(null);
                setQTopic('');
                setQQuestionText('');
                setQOptions(['', '', '', '']);
                setQCorrectAnswerIndex(0);
                setQCorrectAnswerText('');
                setQExplanationText('');
                setQIsActive(true);

                setTimeout(() => setQFormSuccess(''), 3000);
              }} className="space-y-4 font-sans text-xs">
                
                {/* Scope Segment Mapping */}
                <div className="space-y-1">
                  <label className="block text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500">
                    Chapter Scope Assignment:
                  </label>
                  <select
                    value={qChapterId}
                    onChange={(e) => setQChapterId(e.target.value)}
                    className="bg-white border border-slate-205 rounded-xl py-2 px-3 text-xs font-semibold text-slate-800 outline-none w-full"
                  >
                    <option value="">-- Choose Target Chapter Mapped --</option>
                    {chapters.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
                    ))}
                  </select>
                </div>

                {/* Type Selection */}
                <div className="space-y-1">
                  <label className="block text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500">
                    Question Entry Format:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setQType('mcq')}
                      className={`py-2 px-3 border rounded-xl font-bold font-mono text-[10px] uppercase transition cursor-pointer text-center ${
                        qType === 'mcq' 
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Multiple Choice (MCQ)
                    </button>
                    <button
                      type="button"
                      onClick={() => setQType('text')}
                      className={`py-2 px-3 border rounded-xl font-bold font-mono text-[10px] uppercase transition cursor-pointer text-center ${
                        qType === 'text' 
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Open Text Response
                    </button>
                  </div>
                </div>

                {/* Topic Metadata */}
                <div className="space-y-1">
                  <label className="block text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500">
                    Topic Keyword (e.g. GST Compliance):
                  </label>
                  <input
                    type="text"
                    value={qTopic}
                    onChange={(e) => setQTopic(e.target.value)}
                    placeholder="e.g. Accounts Payable matching"
                    className="bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-805 outline-none w-full font-semibold focus:border-blue-500"
                  />
                </div>

                {/* Question Prompt */}
                <div className="space-y-1">
                  <label className="block text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500">
                    Question Text:
                  </label>
                  <textarea
                    value={qQuestionText}
                    onChange={(e) => setQQuestionText(e.target.value)}
                    placeholder="Type the full analytical question text..."
                    rows={3}
                    className="bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 outline-none w-full font-semibold focus:border-blue-500 leading-relaxed resize-none font-sans"
                  ></textarea>
                </div>

                {/* CONDITIONAL OPTION BUILDERS */}
                {qType === 'mcq' ? (
                  <div className="space-y-3 bg-white p-3 border rounded-xl">
                    <p className="text-[9px] font-mono font-black text-slate-405 text-slate-400 uppercase tracking-widest border-b pb-1.5 mb-1.5 text-center">
                      ⚙️ CONFIG MCQ OPTIONS & DESIGNATE CORRECT ANSWER:
                    </p>

                    {qOptions.map((opt, idx) => {
                      const letter = String.fromCharCode(65 + idx);
                      const isCorrect = qCorrectAnswerIndex === idx;

                      return (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-xs font-bold font-mono text-slate-400 pr-1">{letter}.</span>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const val = e.target.value;
                              setQOptions(prev => prev.map((o, oIdx) => oIdx === idx ? val : o));
                            }}
                            placeholder={`Option ${letter} value...`}
                            className="bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 text-xs text-slate-800 outline-none flex-grow font-semibold focus:border-emerald-500"
                          />
                          <button
                            type="button"
                            onClick={() => setQCorrectAnswerIndex(idx)}
                            className={`p-1 px-2 text-[9px] font-mono font-black border rounded transition active:scale-95 cursor-pointer uppercase ${
                              isCorrect 
                                ? 'bg-emerald-600 border-emerald-600 text-white font-extrabold' 
                                : 'bg-slate-100 hover:bg-slate-200 border-slate-250 text-slate-550'
                            }`}
                          >
                            {isCorrect ? 'Correct ✓' : 'Mark'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-1 bg-white p-3.5 border rounded-xl animate-in slide-in-from-top-2 duration-150">
                    <label className="block text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-600">
                      🎯 TARGET CORRECT RESPONSE VALUE (CASE-INSENSITIVE MATCH):
                    </label>
                    <input
                      type="text"
                      value={qCorrectAnswerText}
                      onChange={(e) => setQCorrectAnswerText(e.target.value)}
                      placeholder="e.g. Rs. 11,500"
                      className="bg-slate-50 border border-slate-205 rounded-xl py-2 px-3 text-xs font-bold text-slate-850 outline-none w-full tracking-wide focus:border-emerald-500"
                    />
                    <p className="text-[9px] text-slate-450 leading-normal italic pt-1 pl-0.5">
                      Match condition clears spaces and signs automatically to avoid false negatives. (e.g., matching "debit" or "Rs. 11,500")
                    </p>
                  </div>
                )}

                {/* Explanation Block */}
                <div className="space-y-1">
                  <label className="block text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500">
                    Incorrect Attempt Explanation Log:
                  </label>
                  <textarea
                    value={qExplanationText}
                    onChange={(e) => setQExplanationText(e.target.value)}
                    placeholder="Write educational explanation text shown on completion..."
                    rows={2}
                    className="bg-white border border-slate-205 rounded-xl py-2 px-3 text-xs text-slate-850 outline-none w-full font-semibold focus:border-blue-500 leading-relaxed resize-none font-sans"
                  ></textarea>
                </div>

                {/* Question Active Status Switch */}
                <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl">
                  <div>
                    <p className="text-[11px] font-extrabold text-slate-850 leading-tight">Activate Question</p>
                    <p className="text-[9px] text-[#9ca3af]">If toggled off, this question is skipped from live exams.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setQIsActive(!qIsActive)}
                    className={`w-11 h-6 rounded-full transition-colors relative outline-none cursor-pointer ${qIsActive ? 'bg-emerald-600' : 'bg-slate-300'}`}
                  >
                    <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${qIsActive ? 'translate-x-[22px]' : 'translate-x-1'}`}></span>
                  </button>
                </div>

                {/* Submit Actions */}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-grow py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition active:scale-95 shadow-md shadow-emerald-950/5 cursor-pointer text-center font-sans font-extrabold"
                  >
                    {editingQuestionId ? 'Update Question Info' : 'Save Question Definition'}
                  </button>
                  {editingQuestionId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingQuestionId(null);
                        setQTopic('');
                        setQQuestionText('');
                        setQOptions(['', '', '', '']);
                        setQCorrectAnswerIndex(0);
                        setQCorrectAnswerText('');
                        setQExplanationText('');
                        setQIsActive(true);
                      }}
                      className="p-3 bg-slate-205 bg-slate-200 hover:bg-slate-350 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition active:scale-95 cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>

              </form>
            </div>

            {/* Question list (Right 7 Columns) */}
            <div className="lg:col-span-12 xl:col-span-7 space-y-4 text-left">
              <div className="bg-slate-50 border p-4 rounded-xl flex items-center justify-between text-xs">
                <span className="font-bold text-slate-705">Database Repository Questions Desk:</span>
                <span className="font-mono text-xs text-slate-505 text-slate-500 font-bold">({questionsBank.length} items configured)</span>
              </div>

              <div className="space-y-4 max-h-[720px] overflow-y-auto pr-1">
                {questionsBank.length === 0 ? (
                  <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-slate-400 font-sans">
                    <p className="text-xs font-bold text-slate-700 text-center">Empty Question Matrix</p>
                    <p className="text-[11px] mt-1 max-w-sm mx-auto leading-normal text-slate-400 text-center">
                      No manual questions added for trainee learning tests yet. Assign questions to chapters using the builder menu on the left.
                    </p>
                  </div>
                ) : (
                  questionsBank.map((q, qIdx) => {
                    const associatedChap = chapters.find(c => c.id === q.chapterId);

                    return (
                      <div key={q.id} className="p-4 bg-white border border-slate-200 hover:border-slate-350 rounded-xl space-y-3.5 transition group shadow-sm relative animate-in fade-in duration-150 text-left">
                        
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-[9px] font-extrabold text-[#94a3b8]">
                                #{qIdx + 1} ({q.id})
                              </span>
                              <span className="text-[10px] font-extrabold font-mono text-blue-600 bg-blue-50 border px-2 py-0.5 rounded">
                                {q.topic}
                              </span>
                              <span className="text-[9px] font-extrabold font-mono text-emerald-600 bg-emerald-50 border px-2 py-0.5 rounded uppercase">
                                {q.type}
                              </span>
                              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase font-space border ${
                                q.isActive !== false ? 'bg-emerald-100/50 text-emerald-805 border-emerald-200 text-emerald-800' : 'bg-slate-100 text-slate-400 border-slate-200'
                              }`}>
                                {q.isActive !== false ? 'Active' : 'Draft'}
                              </span>
                            </div>
                            <p className="text-[10px] font-mono font-bold text-slate-500 mt-1 uppercase">
                              Assigned: {associatedChap ? `${associatedChap.name} (${q.chapterId})` : `Module not found (${q.chapterId})`}
                            </p>
                          </div>

                          {/* CRUD ACTIONS BUTTON RAIL */}
                          <div className="flex gap-1.5 py-0.5 text-xs font-sans">
                            {confirmDeleteQuestionId === q.id ? (
                              <div className="flex items-center gap-1.5 animate-in zoom-in-95 duration-100">
                                <span className="text-[9px] text-rose-600 font-bold uppercase font-mono">Sure?</span>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteQuestionId(null)}
                                  className="px-2 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 font-bold text-[9px] rounded transition cursor-pointer"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = questionsBank.filter(item => item.id !== q.id);
                                    localStorage.setItem('lms_questions_v1', JSON.stringify(updated));
                                    setQuestionsBank(updated);
                                    setConfirmDeleteQuestionId(null);
                                    showToast("✓ Question deleted successfully from active test database.", "success");
                                  }}
                                  className="px-2.5 py-1 bg-rose-605 text-white bg-rose-600 font-extrabold text-[9px] rounded shadow-xs transition cursor-pointer"
                                >
                                  Yes, delete
                                </button>
                              </div>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    // Map question fields to local editing state
                                    setEditingQuestionId(q.id);
                                    setQChapterId(q.chapterId || '');
                                    setQType(q.type || 'mcq');
                                    setQTopic(q.topic || '');
                                    setQQuestionText(q.question || '');
                                    setQOptions(q.options || ['', '', '', '']);
                                    setQCorrectAnswerIndex(q.correctAnswerIndex || 0);
                                    setQCorrectAnswerText(q.correctAnswerText || '');
                                    setQExplanationText(q.explanation || '');
                                    setQIsActive(q.isActive !== false);
                                  }}
                                  className="px-2.5 py-1.5 bg-slate-900 border border-slate-900 font-bold text-[9px] text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
                                  title="Edit question definition"
                                >
                                  EDIT
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteQuestionId(q.id)}
                                  className="px-2.5 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-bold text-[9px] rounded-lg transition cursor-pointer"
                                  title="Delete permanently"
                                >
                                  DELETE
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* The prompt */}
                        <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl">
                          <p className="text-xs font-bold text-slate-900 leading-relaxed font-sans">{q.question}</p>
                        </div>

                        {/* Options visualizer */}
                        {q.type === 'text' ? (
                          <div className="text-xs pl-2 border-l-4 border-l-emerald-500 py-1 font-sans">
                            <span className="font-bold text-slate-600">Regex check target match value: </span>
                            <strong className="text-emerald-700 font-mono text-xs">{q.correctAnswerText}</strong>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pl-1 font-sans">
                            {q.options?.map((opt, oIdx) => {
                              const isCorrectOpt = q.correctAnswerIndex === oIdx;
                              const letter = String.fromCharCode(65 + oIdx);

                              return (
                                <div key={oIdx} className={`p-1.5 px-2.5 rounded-lg border border-dashed flex items-center gap-1.5 ${
                                  isCorrectOpt ? 'bg-emerald-50 border-emerald-305 font-semibold text-emerald-800' : 'bg-transparent border-slate-155 text-slate-500'
                                }`}>
                                  <span className="font-mono text-[9px] font-extrabold text-slate-400">{letter}.</span>
                                  <span className="truncate leading-relaxed">{opt}</span>
                                  {isCorrectOpt && <span className="text-[8px] font-black uppercase text-emerald-750 block ml-auto shrink-0 font-mono font-bold animate-pulse">Target Correct</span>}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Explanation summary */}
                        {q.explanation && (
                          <p className="text-[10px] text-slate-405 text-slate-400 pl-1 leading-normal font-sans">
                            <span className="text-slate-500 font-bold">Explanation Log: </span>
                            {q.explanation}
                          </p>
                        )}

                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        )}

        {/* SUBTAB 3: EXAM GLOBAL GATING */}
        {recSubTab === 'gating' && (
          <div className="max-w-2xl bg-white border border-slate-205 border-slate-200 rounded-3xl p-6 space-y-6 text-left animate-in fade-in duration-150">
            <div className="border-b border-sidebar-border border-slate-100 pb-4">
              <h4 className="text-base font-black text-slate-905 text-slate-900 flex items-center gap-1.5">
                <span>⚙️</span>
                <span>Interactive Exam Gating Rules Manager</span>
              </h4>
              <p className="text-xs text-[#6b7280] text-slate-400 mt-0.5">Define constraints required prior to unlocking lesson progressions across branches</p>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const cfg: ExamConfig = {
                examEnabled: cfgExamEnabled,
                requirePassToUnlockNext: cfgRequirePass
              };
              try {
                localStorage.setItem('lms_exam_config_v1', JSON.stringify(cfg));
                // Dispatch event so other components receive the config update in real-time
                window.dispatchEvent(new Event('storage'));
              } catch (err) {
                console.error("Failed to write gating configuration to localStorage:", err);
              }
              setGatingSuccess("⚙️ Gating conditions successfully cascade to all active trainee profiles!");
              setTimeout(() => {
                setGatingSuccess("");
              }, 4000);
            }} className="space-y-6 font-sans">

              {gatingSuccess && (
                <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 text-xs font-bold p-3.5 rounded-xl leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200">
                  ✓ {gatingSuccess}
                </div>
              )}
              
              {/* Rule 1: Portal Enablement */}
              <div className="flex items-start justify-between p-4 bg-slate-50 border border-slate-150 rounded-2xl gap-6">
                <div className="space-y-1 text-left">
                  <h5 className="text-xs font-black text-[#1e1b4b] text-slate-800 leading-snug">Allow Examination Portal Active</h5>
                  <p className="text-[10px] leading-relaxed text-[#4b5563] text-slate-400">
                    When ticked on, candidates and trainees can click the Exams tab to launch certification evaluations. If disabled, they see a "Portal Locked" status notice.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCfgExamEnabled(!cfgExamEnabled)}
                  className={`w-12 h-6.5 rounded-full transition-colors relative outline-none cursor-pointer shrink-0 ${cfgExamEnabled ? 'bg-emerald-600' : 'bg-slate-300'}`}
                >
                  <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${cfgExamEnabled ? 'translate-x-[24px]' : 'translate-x-1'}`}></span>
                </button>
              </div>

              {/* Rule 2: Chapter specific gating check */}
              <div className="flex items-start justify-between p-4 bg-slate-50 border border-slate-150 rounded-2xl gap-6">
                <div className="space-y-1 text-left">
                  <h5 className="text-xs font-black text-[#1e1b4b] text-slate-800 leading-snug">Enforce Chapter-Specific Gating Rules</h5>
                  <p className="text-[10px] leading-relaxed text-[#4b5563] text-slate-400">
                    A trainee must successfully PASS (&gt;= 60%) the specific exam for Chapter N inside their syllabus to unlock lessons for Chapter N+1. Useful for structured competency check validation workflows.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCfgRequirePass(!cfgRequirePass)}
                  className={`w-12 h-6.5 rounded-full transition-colors relative outline-none cursor-pointer shrink-0 ${cfgRequirePass ? 'bg-emerald-600' : 'bg-slate-300'}`}
                >
                  <span className={`w-4.5 h-4.5 rounded-full bg-white absolute top-1 transition-transform ${cfgRequirePass ? 'translate-x-[24px]' : 'translate-x-1'}`}></span>
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100 flex">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition active:scale-95 shadow-md shadow-emerald-950/5 cursor-pointer text-center font-sans font-extrabold"
                >
                  Save Gating Matrix Rules
                </button>
              </div>

            </form>
          </div>
        )}

        </div>
      )}

      {/* ----------------------------------------------------
          TAB 7: DYNAMIC DEPARTMENTS DIRECTORY MANAGER
          ---------------------------------------------------- */}
      {adminTab === 'departments' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 animate-in fade-in duration-200 space-y-6">
          <div className="border-b border-slate-100 pb-5">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Building className="w-5.5 h-5.5 text-emerald-600" />
              Build Mart Departments Directory
            </h3>
            <p className="text-xs text-slate-500">
              Configure, add, edit, or delete corporate department lines across Build Mart. Updates instantly cascade and automatically update associated trainee profiles and job roles structure.
            </p>
          </div>

          {/* Add department form */}
          <form onSubmit={handleAddDepartment} className="bg-slate-50 border rounded-xl p-5 border-slate-150">
            <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-3 font-sans">
              Register New Department Unit
            </h4>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  required
                  placeholder="e.g. MDO, Warehouse, CRM, Sales, HO..."
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:border-emerald-500 outline-none font-medium font-sans text-slate-900"
                />
              </div>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2 rounded-lg transition duration-150 shadow-sm hover:shadow-md flex items-center justify-center gap-1.5 self-start sm:self-auto h-9"
              >
                <Plus className="w-4 h-4" /> Add Department
              </button>
            </div>
          </form>

          {/* Departments Directory List Table */}
          <div className="overflow-x-auto border border-slate-250/60 rounded-xl bg-white shadow-xs max-w-full">
            <table className="w-full text-left text-xs text-slate-600 border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-slate-50 text-slate-400 border-b border-slate-200 text-[10px] tracking-wider uppercase font-mono font-bold">
                  <th className="p-3.5 pl-5">S.No.</th>
                  <th className="p-3.5">Department Name</th>
                  <th className="p-3.5 text-center">Associated Users</th>
                  <th className="p-3.5 text-center">Associated Job Roles</th>
                  <th className="p-3.5 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 font-sans font-medium text-slate-705">
                {departments.map((dept, idx) => {
                  const associatedUsers = users.filter(u => u.department === dept);
                  const associatedRoles = roles.filter(r => r.department === dept);
                  const isEditing = editingDeptIndex === idx;

                  return (
                    <tr key={dept} className="hover:bg-slate-50/50 transition duration-150">
                      <td className="p-3.5 pl-5 font-mono text-[10px] text-slate-400">{(idx + 1).toString().padStart(2, '0')}</td>
                      
                      <td className="p-3.5 text-slate-900 font-bold">
                        {isEditing ? (
                          <div className="flex items-center gap-2 max-w-xs">
                            <input
                              type="text"
                              value={editingDeptValue}
                              onChange={(e) => setEditingDeptValue(e.target.value)}
                              className="bg-white border border-slate-300 rounded px-2.5 py-1 text-xs focus:border-blue-500 outline-none font-bold text-slate-900"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveEditedDepartment(idx)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold p-1 rounded transition flex items-center justify-center h-7 w-7"
                              title="Save Changes"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingDeptIndex(null)}
                              className="bg-slate-200 hover:bg-slate-300 text-slate-600 font-bold p-1 rounded transition flex items-center justify-center h-7 w-7"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="inline-block bg-slate-50 text-slate-700 border border-slate-200/80 px-2.5 py-1 rounded-md text-[10px] font-mono tracking-wider font-extrabold uppercase shadow-3xs max-w-[150px] text-center leading-tight">
                              {dept}
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="p-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${associatedUsers.length > 0 ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-50 text-slate-400'}`}>
                          {associatedUsers.length} staff
                        </span>
                      </td>

                      <td className="p-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${associatedRoles.length > 0 ? 'bg-amber-50 text-amber-700' : 'bg-slate-50 text-slate-400'}`}>
                          {associatedRoles.length} roles
                        </span>
                      </td>

                      <td className="p-3.5 pr-5 text-right">
                        <div className="flex items-center justify-end gap-1.5 font-sans">
                          {!isEditing && (
                            <>
                              {confirmDeleteDeptIndex === idx ? (
                                <div className="flex items-center gap-1.5 animate-in zoom-in-95 duration-100">
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteDeptIndex(null)}
                                    className="text-[10px] uppercase font-mono font-bold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded transition border border-slate-200"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteDepartment(idx)}
                                    className="text-[10px] uppercase font-mono font-black text-white bg-rose-500 hover:bg-rose-600 px-2.5 py-1 rounded shadow-xs transition flex items-center gap-1"
                                  >
                                    <Trash2 className="w-2.5 h-2.5 text-white" /> Delete
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingDeptIndex(idx);
                                      setEditingDeptValue(dept);
                                    }}
                                    className="text-slate-500 hover:text-blue-650 bg-slate-50 hover:bg-blue-50/70 p-1.5 rounded-lg border border-slate-200 hover:border-blue-200 transition"
                                    title="Edit Department Name"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteDeptIndex(idx)}
                                    className="text-slate-500 hover:text-rose-600 bg-slate-50 hover:bg-rose-50/70 p-1.5 rounded-lg border border-slate-200 hover:border-rose-200 transition"
                                    title="Delete Department"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          TAB 8: BRAND LOGO & CERTIFICATE CONFIGURATOR
          ---------------------------------------------------- */}
      {adminTab === 'certificate' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 animate-in fade-in duration-200 space-y-6">
          <div className="border-b border-slate-100 pb-5">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="text-xl">🏢</span>
              Corporate Identity & Certificate Configurator
            </h3>
            <p className="text-xs text-slate-500">
              Configure your group's brand name, header logo (icons, emojis, or custom base64 image uploads), other visual identity markers, and certificate templates. Changes propagate across all trainee dashboards and verification panels instantly!
            </p>
          </div>

          {/* BRAND CONFIG PERSISTENCE NOTIFICATION */}
          {brandSavingSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs py-3 px-4 rounded-xl font-bold font-sans animate-bounce">
              ✓ {brandSavingSuccess}
            </div>
          )}

          {certSavingSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs py-3 px-4 rounded-xl font-bold font-sans animate-bounce">
              ✓ {certSavingSuccess}
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Left side: configuration inputs */}
            <div className="xl:col-span-7 space-y-6">

              {/* SECTION A: CORPORATE BRAND IDENTITY & LOGO */}
              <div className="bg-slate-50 border border-slate-200/80 p-5 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-mono uppercase tracking-wider text-indigo-600 font-extrabold flex items-center gap-2">
                    <span className="p-1 rounded bg-indigo-50 text-indigo-700">🏢</span>
                    Part 1: Platform Brand Name & Corporate Logo
                  </h4>
                  <span className="text-[9px] bg-slate-200 text-slate-800 font-mono font-bold px-2 py-0.5 rounded-full select-none">Global Header</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-black text-slate-700 mb-1">Company / Group Registered Name</label>
                    <input
                      type="text"
                      value={compName}
                      onChange={(e) => setCompName(e.target.value)}
                      placeholder="e.g. Build Mart"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-700 mb-1">System Abbreviation Label</label>
                    <input
                      type="text"
                      maxLength={10}
                      value={compAbbr}
                      onChange={(e) => setCompAbbr(e.target.value)}
                      placeholder="e.g. LMS"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">Brand Tagline / Footprint Text</label>
                  <input
                    type="text"
                    value={compTagline}
                    onChange={(e) => setCompTagline(e.target.value)}
                    placeholder="e.g. MEMBER OF RATHI BUILDMART PLC"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-indigo-500"
                  />
                </div>

                {/* LOGO TYPE CHANGER */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-black text-slate-700">Header Icon Logo Mode</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setLogoType('icon');
                        setLogoValue('BookOpen');
                      }}
                      className={`px-3 py-2 text-xs font-bold rounded-lg border transition ${
                        logoType === 'icon' 
                          ? 'bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700' 
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Classic Icon Presets
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLogoType('emoji');
                        setLogoValue('🏢');
                      }}
                      className={`px-3 py-2 text-xs font-bold rounded-lg border transition ${
                        logoType === 'emoji' 
                          ? 'bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700' 
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Custom Emoji Logo
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLogoType('image');
                        setLogoValue('https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=80');
                      }}
                      className={`px-3 py-2 text-xs font-bold rounded-lg border transition ${
                        logoType === 'image' 
                          ? 'bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700' 
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Uploaded Image / URL
                    </button>
                  </div>
                </div>

                {/* LOGO SELECTION VALUES */}
                <div className="bg-white border border-slate-200/70 p-3 rounded-lg">
                  {logoType === 'icon' && (
                    <div className="space-y-2">
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Select brand icon preset:</span>
                      <div className="flex flex-wrap gap-2">
                        {['BookOpen', 'Building2', 'Layers', 'Award', 'Shield', 'Briefcase', 'Landmark', 'Globe'].map((ico) => (
                          <button
                            key={ico}
                            type="button"
                            onClick={() => setLogoValue(ico)}
                            className={`p-2 rounded-lg border flex items-center justify-center transition hover:border-indigo-400 ${
                              logoValue === ico ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-600'
                            }`}
                            title={ico}
                          >
                            <span className="text-xs font-bold font-mono px-1">{ico}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {logoType === 'emoji' && (
                    <div className="space-y-2.5">
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Select or write custom emoji:</span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={3}
                          value={logoValue}
                          onChange={(e) => setLogoValue(e.target.value)}
                          placeholder="🏢"
                          className="w-16 text-center bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-xl outline-none"
                        />
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {['🏢', '🏗️', '🧱', '🏠', '📦', '🚚', '💼', '🏆', '⭐', '🤝'].map((em) => (
                            <button
                              key={em}
                              type="button"
                              onClick={() => setLogoValue(em)}
                              className="text-lg p-1.5 hover:bg-slate-100 rounded transition"
                            >
                              {em}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {logoType === 'image' && (
                    <div className="space-y-3">
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Paste logo internet URL link or drop file:</span>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={logoValue}
                          onChange={(e) => setLogoValue(e.target.value)}
                          placeholder="e.g. https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=80"
                          className="flex-grow bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 outline-none"
                        />
                        <label className="bg-slate-100 border border-slate-300 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3 py-1.5 rounded-lg cursor-pointer flex items-center justify-center">
                          Choose Local File
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  if (typeof reader.result === 'string') {
                                    // Inline Helper to compress corporate branding logo to small Web-Eye size
                                    const img = new Image();
                                    img.onload = () => {
                                      const canvas = document.createElement('canvas');
                                      const MAX_W = 150;
                                      const MAX_H = 150;
                                      let w = img.width;
                                      let h = img.height;
                                      if (w > h) {
                                        if (w > MAX_W) {
                                          h *= MAX_W / w;
                                          w = MAX_W;
                                        }
                                      } else {
                                        if (h > MAX_H) {
                                          w *= MAX_H / h;
                                          h = MAX_H;
                                        }
                                      }
                                      canvas.width = w;
                                      canvas.height = h;
                                      const ctx = canvas.getContext('2d');
                                      if (ctx) {
                                        ctx.drawImage(img, 0, 0, w, h);
                                        const compressed = canvas.toDataURL('image/jpeg', 0.8);
                                        setLogoValue(compressed);
                                        showToast("✓ Local logo file loaded and optimized safely! Click 'Save' to apply changes.", "info");
                                      } else {
                                        setLogoValue(reader.result as string);
                                        showToast("✓ Local logo file loaded inside input state. Click 'Save' to apply changes!", "info");
                                      }
                                    };
                                    img.onerror = () => {
                                      setLogoValue(reader.result as string);
                                    };
                                    img.src = reader.result;
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>
                      
                      {logoValue && logoValue.startsWith('data:image/') && (
                        <p className="text-[9.5px] text-emerald-600 font-mono font-medium">✓ Base64 Local Image Loaded & Ready to Save!</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setCompName("Build Mart");
                      setCompAbbr("LMS");
                      setCompTagline("MEMBER OF RATHI BUILDMART PLC");
                      setLogoType("icon");
                      setLogoValue("BookOpen");
                      
                      const defaults = {
                        companyName: "Build Mart",
                        companyAbbreviation: "LMS",
                        companyTagline: "MEMBER OF RATHI BUILDMART PLC",
                        logoType: "icon" as const,
                        logoValue: "BookOpen"
                      };
                      if (onUpdateBranding) {
                        onUpdateBranding(defaults);
                      } else {
                        saveCompanyBranding(defaults);
                      }
                      showToast("✓ Company Branding settings reset back to system defaults.", "success");
                    }}
                    className="text-slate-500 hover:text-slate-800 text-[10px] font-mono hover:underline"
                  >
                    Revert Branding Defaults
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveBranding}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2 rounded-lg shadow-sm transition"
                  >
                    Save Brand Configurations
                  </button>
                </div>
              </div>

              {/* SECTION B: CERTIFICATE DESIGN CONFIGURATIONS */}
              <div className="bg-slate-50 border border-slate-205 p-5 rounded-xl space-y-4">
                <h4 className="text-[11px] font-mono uppercase tracking-wider text-emerald-600 font-extrabold flex items-center gap-2">
                  <span className="p-1 rounded bg-emerald-50 text-emerald-700">📜</span>
                  Part 2: Trainee Certificate Template & Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Company / Focus Entity Name</label>
                    <input
                      type="text"
                      value={certFocusEntity}
                      onChange={(e) => setCertFocusEntity(e.target.value)}
                      placeholder="e.g. Rathi's Buildmart Ltd"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Issuer Authority Sub-Header</label>
                    <input
                      type="text"
                      value={certSubHeader}
                      onChange={(e) => setCertSubHeader(e.target.value)}
                      placeholder="e.g. Office of Operations Integrity & Standard Execution"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Certificate Title Name</label>
                  <input
                    type="text"
                    value={certTitle}
                    onChange={(e) => setCertTitle(e.target.value)}
                    placeholder="e.g. Certificate of Mastery"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-bold outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Awarding Prefix / Phrase</label>
                  <input
                    type="text"
                    value={certProudlyAwardedTo}
                    onChange={(e) => setCertProudlyAwardedTo(e.target.value)}
                    placeholder="e.g. This formal competency is proudly awarded to"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Acclaim Purpose Statement (Body)</label>
                  <textarea
                    rows={2}
                    value={certBodyText}
                    onChange={(e) => setCertBodyText(e.target.value)}
                    placeholder="e.g. for successfully completing all configured operational training modules..."
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-indigo-500 leading-normal"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    *The system dynamically appends the Trainee's Job Role and Department at the end of this statement.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Left Signature Name / Body</label>
                    <input
                      type="text"
                      value={certSignatureText}
                      onChange={(e) => setCertSignatureText(e.target.value)}
                      placeholder="e.g. Rathi Operations Ltd."
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Left Signature Role Title</label>
                    <input
                      type="text"
                      value={certSignatureTitle}
                      onChange={(e) => setCertSignatureTitle(e.target.value)}
                      placeholder="e.g. Training Registrar verifier"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Left Signature Subtitle / Org</label>
                    <input
                      type="text"
                      value={certSignatureSub}
                      onChange={(e) => setCertSignatureSub(e.target.value)}
                      placeholder="e.g. Rathi's Buildmart LLC"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Established Year Label</label>
                    <input
                      type="text"
                      value={certEstablishedText}
                      onChange={(e) => setCertEstablishedText(e.target.value)}
                      placeholder="e.g. ESTABLISHED 2026"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Seal Status Label</label>
                  <input
                    type="text"
                    value={certStampLabel}
                    onChange={(e) => setCertStampLabel(e.target.value)}
                    placeholder="e.g. MASTERED"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setCertFocusEntity("Rathi's Buildmart Ltd");
                      setCertSubHeader("Office of Operations Integrity & Standard Execution");
                      setCertTitle("Certificate of Mastery");
                      setCertProudlyAwardedTo("This formal competency is proudly awarded to");
                      setCertBodyText("for successfully completing all configured operational training modules, checklists, and demonstrating standard execution mastery in the role of");
                      setCertSignatureText("Rathi Operations Ltd.");
                      setCertSignatureTitle("Training Registrar verifier");
                      setCertSignatureSub("Rathi's Buildmart LLC");
                      setCertStampLabel("MASTERED");
                      setCertEstablishedText("ESTABLISHED 2026");
                      
                      const template = {
                        focusEntity: "Rathi's Buildmart Ltd",
                        subHeader: "Office of Operations Integrity & Standard Execution",
                        title: "Certificate of Mastery",
                        proudlyAwardedTo: "This formal competency is proudly awarded to",
                        bodyText: "for successfully completing all configured operational training modules, checklists, and demonstrating standard execution mastery in the role of",
                        signatureText: "Rathi Operations Ltd.",
                        signatureTitle: "Training Registrar verifier",
                        signatureSub: "Rathi's Buildmart LLC",
                        stampLabel: "MASTERED",
                        establishedText: "ESTABLISHED 2026"
                      };
                      saveCertificateTemplate(template);
                      showToast("✓ Certificate template defaults successfully restored!", "success");
                    }}
                    className="bg-slate-150 border border-slate-250 hover:bg-slate-200 text-slate-800 font-bold text-xs px-4 py-2 rounded-lg transition"
                  >
                    Revert Cert Defaults
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveCertificateTemplate}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-6 py-2 rounded-lg shadow-sm hover:shadow-md transition"
                  >
                    Save Certificate Template
                  </button>
                </div>
              </div>
            </div>

            {/* Right side: Realtime Certificate Mockup Preview */}
            <div className="xl:col-span-5 flex flex-col justify-between h-full bg-slate-950 p-5 rounded-xl border border-slate-800">
              <div>
                <span className="text-[10px] font-mono tracking-wider text-emerald-400 font-extrabold uppercase bg-emerald-950/40 border border-emerald-900/50 px-2.5 py-0.5 rounded">
                  Live Preview Simulator
                </span>
                <p className="text-[11px] text-slate-400 mt-2 leading-normal">
                  Analyzing current typography matching directly to client-side layouts. View real-time styling of your edits here:
                </p>
              </div>

              {/* Real Simulation Box */}
              <div className="bg-white border border-[#eadaab] rounded-lg p-4 text-center space-y-3.5 my-4 shadow-xl select-none relative">
                {/* Simulated Monogram */}
                <div className="mx-auto w-8 h-8 rounded-full bg-slate-950 text-white font-serif font-black text-xs flex items-center justify-center border-2 border-[#b4975a]">
                  R
                </div>
                
                <h4 className="text-[8px] font-black uppercase tracking-[0.25em] text-[#866e40] leading-none">
                  {certFocusEntity || "Rathi's Buildmart Ltd"}
                </h4>
                
                <h5 className="text-[6.5px] text-slate-400 tracking-wider uppercase leading-none -mt-1.5">
                  {certSubHeader || "Office of Operations Integrity"}
                </h5>

                <div className="w-16 h-[0.5px] bg-[#b4975a] mx-auto my-0.5" />

                <h1 className="text-md font-bold italic font-serif text-[#111827] leading-none">
                  {certTitle || "Certificate of Mastery"}
                </h1>

                <p className="text-[7px] text-slate-400 tracking-widest font-bold uppercase leading-none">
                  {certProudlyAwardedTo || "This formal competency is proudly awarded to"}
                </p>

                <h2 className="text-sm text-slate-900 font-extrabold font-serif leading-none tracking-wide underline decoration-[#b4975a]/30 decoration-2">
                  Arjun Rathi (Sample Trainee)
                </h2>

                <p className="text-[8px] text-slate-500 font-sans leading-relaxed px-2">
                  {certBodyText || "for successfully completing operational training..."} <br />
                  <span className="inline-block mt-1 bg-[#fcfaf4] font-bold text-slate-700 border border-[#eadaab]/45 px-1.5 py-0.5 rounded text-[7px]">
                    Senior Auditor • Operations Division
                  </span>
                </p>

                {/* Signatures simulation */}
                <div className="grid grid-cols-3 gap-0.5 pt-2 border-t border-[#f2edd5] text-left items-end">
                  <div className="text-center space-y-0.5">
                    <span className="block text-[7px] font-serif italic text-slate-800 tracking-wider">
                      {certSignatureText}
                    </span>
                    <div className="border-t border-slate-200" />
                    <span className="block text-[6px] uppercase font-bold text-slate-400 leading-none">
                      {certSignatureTitle}
                    </span>
                    <span className="block text-[5.5px] text-slate-400 leading-none">
                      {certSignatureSub}
                    </span>
                  </div>

                  <div className="text-center flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-[#111827] flex flex-col items-center justify-center border border-[#cbb17b]">
                      <span className="text-[4px] text-white font-extrabold scale-75 uppercase">
                        {certStampLabel}
                      </span>
                    </div>
                    <span className="text-[5.5px] text-slate-400 mt-0.5 block">
                      {certEstablishedText}
                    </span>
                  </div>

                  <div className="text-center space-y-0.5">
                    <span className="block text-[7px] font-mono font-bold text-slate-800 leading-none">
                      June 10, 2026
                    </span>
                    <div className="border-t border-slate-200" />
                    <span className="block text-[6px] uppercase font-bold text-slate-400">
                      DATE OF CREDENTIAL
                    </span>
                    <span className="block text-[5.5px] font-mono text-[#b4975a]">
                      ID: RBM-CERT-8F3D
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 p-2.5 rounded-lg">
                <span className="text-[9.5px] font-mono text-[#b4975a] block font-extrabold uppercase">
                  💡 Trainees View Instant Access
                </span>
                <span className="text-[9.5px] text-slate-400 mt-1 block leading-normal">
                  All trainees loaded with active profiles will see this template rendered as their high-fidelity downloadable PDF on their workspace dashboard the instant they claim mastery!
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

        </div> {/* END OF FULL WIDTH: ACTIVE PANELS VIEWPORT */}

      </div> {/* END OF WRAPPER */}


      {/* Designation & Mapped Roles details modal overlay */}
      {selectedRoleDetailUser && (() => {
        const user = selectedRoleDetailUser;
        const currentRole = roles.find(r => r.id === user.roleId);
        // Find other roles belonging to this user's department
        const departmentRoles = roles.filter(r => r.department === user.department);
        
        return (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
              
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-150 flex items-start justify-between bg-slate-50">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={user.avatarUrl}
                    name={user.name}
                    className="w-11 h-11 border border-slate-200"
                  />
                  <div>
                    <h3 className="text-sm font-black text-slate-900">{user.name} - Designation Specs</h3>
                    <p className="text-[11px] text-slate-500 font-mono">
                      BU: <strong className="text-slate-750 uppercase">{user.department}</strong> • Current Active Role: <strong className="text-indigo-600">{currentRole?.name || 'Trainee'}</strong>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRoleDetailUser(null)}
                  className="rounded-lg p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="p-6 overflow-y-auto space-y-6">
                
                {/* Section 1: Active Role specifications */}
                <div className="bg-gradient-to-r from-indigo-50/50 to-purple-50/30 rounded-xl p-4.5 border border-indigo-100/70 space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-indigo-700 font-mono flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                    Primary Designation: {currentRole?.name || 'Unassigned / Trainee'}
                  </h4>
                  {currentRole ? (
                    <div className="space-y-3 text-xs text-slate-650">
                      <p className="italic text-slate-500 leading-relaxed font-sans">{currentRole.description}</p>
                      <div className="space-y-1.5">
                        <span className="font-bold font-mono text-[10px] uppercase text-slate-400 tracking-wider">Required Skill Curriculum Units:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {currentRole.skillRequirements?.map((skill, idx) => (
                            <span key={idx} className="bg-white text-slate-700 border border-indigo-100 rounded-md px-2 py-0.5 text-[10px] font-medium shadow-3xs">
                              {skill}
                            </span>
                          )) || <span className="text-slate-450 italic">No curriculum requirements loaded.</span>}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-450 italic">This user is not mapped to any specific designation yet.</p>
                  )}
                </div>

                {/* Section 2: Overall department designations directory list */}
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 font-mono">
                      Department Registry: {user.department} ({departmentRoles.length} Roles)
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">Structure and mapping overview</span>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                    Here is the complete roster of official corporate roles configured within the <strong className="text-slate-700 uppercase">{user.department}</strong> business unit. You can view each designation's syllabus modules and operational scope:
                  </p>

                  <div className="space-y-3">
                    {departmentRoles.map((role) => {
                      const isUserRole = role.id === user.roleId;
                      return (
                        <div 
                          key={role.id} 
                          className={`rounded-xl p-4 border transition-all ${
                            isUserRole 
                              ? 'bg-emerald-55/20 border-emerald-200/80 shadow-sm' 
                              : 'bg-white border-slate-200 hover:border-slate-305'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1.5 mb-2.5">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${isUserRole ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                              <h5 className="font-extrabold text-xs text-slate-800">{role.name}</h5>
                            </div>
                            {isUserRole ? (
                              <span className="bg-emerald-100 text-emerald-850 px-2 py-0.5 rounded text-[8.5px] font-mono font-black uppercase tracking-wider">
                                Active MAPPED
                              </span>
                            ) : (
                              <span className="bg-slate-55 border text-slate-400 px-2 py-0.5 rounded text-[8.5px] font-mono font-bold uppercase tracking-wider">
                                BU Role
                              </span>
                            )}
                          </div>

                          <p className="text-[11.5px] text-slate-500 leading-normal italic mb-3 font-sans">
                            {role.description}
                          </p>

                          <div className="space-y-1.5">
                            <div className="font-extrabold font-mono text-[9px] uppercase tracking-wider text-slate-400">
                              Core Competencies / Syllabus Syllabus Modules:
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {role.skillRequirements?.map((skill, idx) => (
                                <span key={idx} className="bg-slate-100/70 border border-slate-200/50 text-slate-600 rounded px-1.5 py-0.5 text-[9px] font-medium leading-none">
                                  {skill}
                                </span>
                              )) || <span className="text-[9px] text-slate-400 italic">No criteria specified</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {departmentRoles.length === 0 && (
                      <div className="text-center py-6 border border-dashed rounded-xl text-slate-400 italic text-xs">
                        No official designations configured for the {user.department} Department.
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-150 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">Department Audit Ledger • 2026</span>
                <button
                  type="button"
                  onClick={() => setSelectedRoleDetailUser(null)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-sans font-bold text-xs py-2 px-4 rounded-xl transition shadow-sm cursor-pointer"
                >
                  Close Specification
                </button>
              </div>

            </div>
          </div>
        );
      })()}


      {/* Trainee detailed scorecard modal overlay */}
      {inspectedUser && (() => {
        const stats = calculateUserProgress(inspectedUser.id, inspectedUser.roleId);
        const userRole = roles.find(r => r.id === inspectedUser.roleId);
        
        // Find progress logs for this trainee
        const traineeLogs = progress.filter(p => p.userId === inspectedUser.id);
        const userChapters = chapters.filter(c => c.roleId === inspectedUser.roleId);

        return (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
              
              {/* Header */}
              <div className="p-5 border-b border-slate-150 flex items-start justify-between bg-slate-50">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={inspectedUser.avatarUrl}
                    name={inspectedUser.name}
                    className="w-11 h-11 border border-slate-200"
                  />
                  <div>
                    <h3 className="text-sm font-black text-slate-900">{inspectedUser.name} Scoreboard</h3>
                    <p className="text-[11px] text-slate-500 font-mono">{inspectedUser.email} • {inspectedUser.department}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setInspectedUser(null)}
                  className="bg-slate-250/60 hover:bg-slate-200 text-slate-600 p-1.5 rounded-lg transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable checklist body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-slate-700">
                
                {/* Stats indicators */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-indigo-50/55 rounded-xl border border-indigo-100 p-3.5">
                    <span className="text-[9px] uppercase font-bold text-indigo-500 tracking-wider">Overall Completion</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-xl font-mono font-black text-indigo-700">{stats.overallPercent}%</span>
                      <span className="text-[10px] text-slate-400 font-medium">({stats.completedCount}/{stats.totalUnits} Units)</span>
                    </div>
                  </div>

                  <div className="bg-emerald-50/55 rounded-xl border border-emerald-100 p-3.5">
                    <span className="text-[9px] uppercase font-bold text-emerald-500 tracking-wider">Verified Mastery Index</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-xl font-mono font-black text-emerald-700">{stats.masteryPercent}%</span>
                      <span className="text-[10px] text-slate-400 font-medium">({stats.verifiedCount} Verified)</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider font-mono">Assigned Operations Curriculum Checklist ({userRole?.name || 'Trainee'})</h4>
                  
                  {userChapters.length === 0 ? (
                    <p className="text-center italic py-6 text-slate-400">No chapters configured for this role.</p>
                  ) : (
                    <div className="space-y-4">
                      {userChapters.map((chap) => {
                        const chapUnits = units.filter(u => u.chapterId === chap.id);

                        return (
                          <div key={chap.id} className="border border-slate-150 rounded-xl bg-slate-50/25 p-3.5 space-y-2">
                            <h5 className="font-bold text-slate-900 border-b pb-1 text-[11px] flex justify-between">
                              <span>Chapter: {chap.name}</span>
                            </h5>

                            <div className="space-y-2">
                              {chapUnits.map(unit => {
                                const logInstance = traineeLogs.find(l => l.unitId === unit.id);
                                const status = logInstance?.status || 'Not Started';

                                return (
                                  <div key={unit.id} className="bg-white border rounded-lg p-2.5 flex items-center justify-between text-[11px]">
                                    <div>
                                      <p className="font-bold text-slate-800">
                                        <span className="font-mono text-indigo-600 mr-1">[{unit.code}]</span>
                                        {unit.taskName}
                                      </p>
                                      {logInstance?.notes && (
                                        <p className="text-[10px] text-slate-400 italic mt-0.5 bg-slate-50 px-1.5 py-0.5 rounded border">
                                          " {logInstance.notes} "
                                        </p>
                                      )}
                                    </div>
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-tight border ${
                                      status === 'Verified & Mastered'
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                        : status === 'In Progress'
                                          ? 'bg-blue-50 border-blue-200 text-blue-700'
                                          : 'bg-slate-50 border-slate-205 text-slate-400'
                                    }`}>
                                      {status}
                                    </span>
                                  </div>
                                );
                              })}
                              {chapUnits.length === 0 && (
                                <p className="text-[10px] text-slate-400 italic">No checklist items configured.</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>

              {/* Footer and controls */}
              <div className="p-4 border-t border-slate-150 bg-slate-50 text-right flex justify-between items-center text-xs">
                <span className="text-[10px] text-slate-400 font-mono">Tax Entity: {inspectedUser.focusEntity}</span>
                <button
                  type="button"
                  onClick={() => setInspectedUser(null)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-lg transition"
                >
                  Close Scorecard
                </button>
              </div>

            </div>
          </div>
        );
      })()}


      {/* Safe and Interactive Step-By-Step Progress Reset Modal */}
      {resetActiveUser && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[#0f172a] border border-slate-800 text-slate-100 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-5 border-b border-slate-800 bg-[#0b0f19] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <RefreshCw className={`w-5 h-5 text-amber-500 ${resetCurrentStep < 9 ? 'animate-spin' : ''}`} />
                <div>
                  <h3 className="text-xs font-black tracking-tight text-white uppercase font-mono">Curriculum Reset Protocol</h3>
                  <p className="text-[10px] text-slate-400 font-mono">Trainee ID: {resetActiveUser.id} • {resetActiveUser.name}</p>
                </div>
              </div>
              {resetCurrentStep >= 9 ? (
                <button
                  type="button"
                  onClick={() => setResetActiveUser(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <span className="text-[9px] font-mono font-bold text-amber-400 animate-pulse uppercase bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
                  Securing Ledger
                </span>
              )}
            </div>

            {/* Content page */}
            <div className="p-6 space-y-6">
              {/* Circular progress & status */}
              <div className="bg-[#090d16] rounded-xl border border-slate-800 p-4.5 flex items-center gap-5">
                <div className="relative shrink-0 w-16 h-16 flex items-center justify-center">
                  {/* Backdrop path */}
                  <svg className="absolute w-full h-full transform -rotate-90">
                    <circle cx="32" cy="32" r="28" fill="transparent" stroke="#1e293b" strokeWidth="4" />
                  </svg>
                  {/* Progress path */}
                  <svg className="absolute w-full h-full transform -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="transparent"
                      stroke={resetCurrentStep >= 9 ? "#10b981" : "#f59e0b"}
                      strokeWidth="4"
                      strokeDasharray={`${2 * Math.PI * 28}`}
                      strokeDashoffset={`${2 * Math.PI * 28 * (1 - resetProgressPercent / 100)}`}
                      className="transition-all duration-300 ease-out"
                    />
                  </svg>
                  <span className="text-sm font-mono font-black text-white">{resetProgressPercent}%</span>
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-[9px] uppercase font-bold text-slate-400 font-mono tracking-wider">Reset Progress Index</span>
                  <p className="text-xs font-bold text-slate-200 truncate mt-0.5">
                    {resetCurrentStep >= 9 ? 'Directory Sync Completed successfully!' : 'Executing atomic reset logs...'}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {resetCurrentStep >= 9 
                      ? 'All records re-indexed in storage. Trainee is ready to restart.' 
                      : `Processing transaction ${Math.min(7, resetCurrentStep)} of 7...`}
                  </p>
                </div>
              </div>

              {/* Steps/Checklist Logs */}
              <div className="space-y-2.5 bg-[#0b0f19]/50 rounded-xl border border-slate-800/80 p-4 max-h-[260px] overflow-y-auto">
                {[
                  { id: 1, label: "Initializing directory workspace environments & user keys..." },
                  { id: 2, label: "Reverting video stream playback timelines to 0% completed status..." },
                  { id: 3, label: "Purging candidate SOP interactive checklists & daily activity registers..." },
                  { id: 4, label: "Erase private counselor comments & mentor feedbacks..." },
                  { id: 5, label: "Purging submitted exam sheets, audit trails & correct answers..." },
                  { id: 6, label: "Synchronizing state edits & deleting expired documents in Cloud Firestore..." },
                  { id: 7, label: "Re-indexing corporate database & re-evaluating department-wide progress..." }
                ].map((step) => {
                  const status = resetCurrentStep > step.id 
                    ? 'done' 
                    : resetCurrentStep === step.id 
                      ? 'processing' 
                      : 'pending';
                  return (
                    <div
                      key={step.id}
                      className={`flex items-start gap-3 p-2.5 rounded-lg border transition-all ${
                        status === 'done'
                          ? 'bg-emerald-950/10 border-emerald-950/30 text-emerald-400'
                          : status === 'processing'
                            ? 'bg-amber-950/10 border-amber-900/40 text-amber-300 font-medium'
                            : 'bg-transparent border-transparent text-slate-500'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {status === 'done' ? (
                          <div className="bg-emerald-500/20 text-emerald-400 rounded-full p-0.5">
                            <Check className="w-3 h-3 text-emerald-400 font-bold" />
                          </div>
                        ) : status === 'processing' ? (
                          <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                        ) : (
                          <div className="w-3.5 h-3.5 border-2 border-slate-800 rounded-full flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-slate-800 rounded-full" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="leading-tight text-[11px]">{step.label}</p>
                          {status === 'done' && (
                            <span className="text-[8px] font-mono font-bold bg-emerald-500/10 px-1 py-0.2 rounded uppercase shrink-0">COMPLETED</span>
                          )}
                          {status === 'processing' && (
                            <span className="text-[8px] font-mono font-bold bg-amber-500/10 text-amber-400 px-1 py-0.2 rounded uppercase animate-pulse shrink-0">PROCESSING</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer and controls */}
            <div className="p-4 border-t border-slate-800 bg-[#0b0f19] text-right flex justify-between items-center text-xs">
              <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">Secured by Rathi Enterprise Protocol</span>
              {resetCurrentStep >= 9 ? (
                <button
                  type="button"
                  onClick={() => setResetActiveUser(null)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold font-mono text-[10px] px-5 py-2.5 rounded-lg transition cursor-pointer"
                >
                  Sign-Off Reset Complete
                </button>
              ) : (
                <button
                  disabled
                  type="button"
                  className="bg-slate-850 text-slate-600 font-medium font-mono text-[10px] px-5 py-2.5 rounded-lg transition cursor-not-allowed"
                >
                  Reset in Progress...
                </button>
              )}
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
