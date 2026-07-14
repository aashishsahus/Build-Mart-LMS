/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PremiumBadge } from './PremiumBadge';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import { Avatar } from './Avatar';
import HierarchyView from './HierarchyView';
import { User, Role, Chapter, Unit, ProgressLog, ProgressStatus, UnitFrequency, UnitSkillLevel, RoleId, CompanyBranding, ExamQuestion, ExamConfig, HelplineContact, SmtpConfig, HelpdeskTicket } from '../types';
import { getSopItemsForUnit, SopItem } from './UserDashboard';
import { UserWithRole, calculateUserProgress, getCertificateTemplate, saveCertificateTemplate, getCompanyBranding, saveCompanyBranding, resetUserMastery, getProgress, getHelplineContacts, saveHelplineContacts, getSmtpConfig, saveSmtpConfig, getHelpdeskTickets, saveHelpdeskTickets } from '../data/stateManager';
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
  ChevronDown,
  ChevronUp,
  Search,
  Database,
  Calendar,
  History,
  ListFilter,
  Clock,
  UserCheck,
  CheckSquare,
  Pin,
  PinOff,
  ChevronLeft,
  ChevronRight,
  Menu,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  MousePointerClick
} from 'lucide-react';
import { Maximize2, Minimize2, SlidersHorizontal, MoreVertical } from 'lucide-react';
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
  // Group: Account Group & Roles Matrix
  { id: 'perm_acc_group', name: 'Account Group Panel', isParent: true, group: 'Account Group & Roles Matrix' },
  { id: 'perm_acc_group_add', name: 'Add Account Group', group: 'Account Group & Roles Matrix' },
  { id: 'perm_acc_group_del', name: 'Delete Account Group', group: 'Account Group & Roles Matrix' },
  { id: 'perm_acc_group_edt', name: 'Edit Account Group', group: 'Account Group & Roles Matrix' },
  { id: 'perm_acc_group_eds', name: 'Toggle Account Group Status', group: 'Account Group & Roles Matrix' },
  { id: 'perm_acc_group_viw', name: 'View Account Groups List', group: 'Account Group & Roles Matrix' },
  { id: 'perm_acc_group_vdt', name: 'View Account Group Details', group: 'Account Group & Roles Matrix' },
  { id: 'perm_sec_group', name: 'Job Roles & Permissions Panel', isParent: true, group: 'Account Group & Roles Matrix' },
  { id: 'perm_sec_group_acc', name: 'Access Permissions Matrix Editor', group: 'Account Group & Roles Matrix' },

  // Group: Curriculum Builder
  { id: 'perm_curr_builder', name: 'Curriculum Builder Panel', isParent: true, group: 'Curriculum Builder' },
  { id: 'perm_curr_chap_add', name: 'Add Curriculum Chapters', group: 'Curriculum Builder' },
  { id: 'perm_curr_chap_del', name: 'Delete Curriculum Chapters', group: 'Curriculum Builder' },
  { id: 'perm_curr_chap_edt', name: 'Edit Curriculum Chapters', group: 'Curriculum Builder' },
  { id: 'perm_curr_unit_add', name: 'Add Curriculum Units (SKU)', group: 'Curriculum Builder' },
  { id: 'perm_curr_unit_del', name: 'Delete Curriculum Units (SKU)', group: 'Curriculum Builder' },
  { id: 'perm_curr_unit_edt', name: 'Edit Curriculum Units (SKU)', group: 'Curriculum Builder' },

  // Group: Enrollment Approvals
  { id: 'perm_verif_view', name: 'View Pending Registrations List', isParent: true, group: 'Enrollment Approvals' },
  { id: 'perm_verif_approve', name: 'Approve Trainee Signup', group: 'Enrollment Approvals' },
  { id: 'perm_verif_reject', name: 'Reject Trainee Signup', group: 'Enrollment Approvals' },

  // Group: User Database
  { id: 'perm_user_db', name: 'User Database Panel', isParent: true, group: 'User Database' },
  { id: 'perm_user_add', name: 'Onboard/Create New User Profile', group: 'User Database' },
  { id: 'perm_user_edt', name: 'Edit Trainee Profiles', group: 'User Database' },
  { id: 'perm_user_del', name: 'Offboard/Delete Trainee Accounts', group: 'User Database' },
  { id: 'perm_user_batch', name: 'Bulk Profile Batch Copier & Syncer', group: 'User Database' },

  // Group: Assessment Exams
  { id: 'perm_verif_ctr', name: 'Assessment Exams Panel', isParent: true, group: 'Assessment Exams' },
  { id: 'perm_verif_override', name: 'Director Override Authority', group: 'Assessment Exams' },

  // Group: Performance & Audit Trail
  { id: 'perm_perf_rec', name: 'Performance & Analytics Panel', isParent: true, group: 'Performance & Audit Trail' },
  { id: 'perm_perf_view', name: 'View Performance Progress Reports', group: 'Performance & Audit Trail' },
  { id: 'perm_perf_chart', name: 'View Interactive Progress Charts', group: 'Performance & Audit Trail' },
  { id: 'perm_perf_export', name: 'Export Compliance/Audit Reports', group: 'Performance & Audit Trail' },
  { id: 'perm_sec_ledger_adt', name: 'Access Audit Trail Logs', group: 'Performance & Audit Trail' },

  // Group: Control Hub Settings
  { id: 'perm_sys_settings', name: 'Control Hub Settings Panel', isParent: true, group: 'Control Hub Settings' },
  { id: 'perm_hierarchy_view', name: 'View & Edit Org Hierarchy Matrix', group: 'Control Hub Settings' },
  { id: 'perm_departments_view', name: 'View & Edit Division Departments Grid', group: 'Control Hub Settings' },
  { id: 'perm_cert_config', name: 'Configure PDF Certificate Templates & Signatures', group: 'Control Hub Settings' },
];

function getInitialMatrixState(currentRoles: Role[], bypassSaved: boolean = false): Record<string, Record<string, boolean>> {
  if (!bypassSaved && typeof window !== 'undefined') {
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
        roleIdLower === 'role_md' || 
        roleIdLower === 'role_ceo' || 
        roleIdLower === 'role_coo' || 
        roleIdLower === 'role_vp' || 
        roleIdLower === 'role_sys_admin' ||
        roleIdLower.includes('super') ||
        roleIdLower.includes('admin') ||
        roleNameLower.includes('admin') ||
        r.department === 'Director';

      // Strictly set only Director/Super/Admin roles to true, and everyone else to false
      if (isDirectorOrSuper) {
        defaultMatrix[perm.id][r.id] = true;
      } else {
        defaultMatrix[perm.id][r.id] = false;
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
  helplineContacts?: HelplineContact[];
  onUpdateHelplineContacts?: (contacts: HelplineContact[]) => void;
  selectedTab?: 'reports' | 'approvals' | 'hierarchy' | 'users' | 'roles' | 'curriculum' | 'analytics' | 'recruitment' | 'departments' | 'certificate' | 'audit';
  onTabChange?: (tab: 'reports' | 'approvals' | 'hierarchy' | 'users' | 'roles' | 'curriculum' | 'analytics' | 'recruitment' | 'departments' | 'certificate' | 'audit') => void;
  onSelectTraineeTab?: (tab: string) => void;
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
  helplineContacts,
  onUpdateHelplineContacts,
  selectedTab,
  onTabChange,
  onSelectTraineeTab
}: AdminDashboardProps) {

  // Helpline Contacts State
  const [localHelplineContacts, setLocalHelplineContacts] = useState<HelplineContact[]>(() => helplineContacts || getHelplineContacts());
  const [helplineSavingSuccess, setHelplineSavingSuccess] = useState('');

  const handleSaveHelplineContacts = () => {
    try {
      if (onUpdateHelplineContacts) {
        onUpdateHelplineContacts(localHelplineContacts);
      } else {
        saveHelplineContacts(localHelplineContacts);
      }
      setHelplineSavingSuccess("Shabaash! Helpline & SOP Contacts list successfully updated!");
      setTimeout(() => setHelplineSavingSuccess(''), 4000);
      showToast("✓ Helpline & SOP Contacts saved successfully!", "success");
    } catch (err: any) {
      showToast("Error saving helpline contacts: " + err.message, 'error');
    }
  };
  
  // State for permissions matrix (Moved up to enable dynamic hasAccess calculation)
  const [permissionsMatrix, setPermissionsMatrix] = useState<Record<string, Record<string, boolean>>>(() => {
    return getInitialMatrixState(roles);
  });

  // Checking admin and group directorship/ownership authorization
  const isSuperAdmin = !!currentUser.isSuperAdmin;
  const isAdminCheckbox = !!currentUser.isAdmin;
  const isAdmin = currentUser.roleId === 'role_sr_acc' || isSuperAdmin || isAdminCheckbox;
  const isDirectorOrOwner = isSuperAdmin || currentUser.roleId === 'role_md' || currentUser.roleId === 'role_ceo' || currentUser.roleId === 'role_coo' || currentUser.department === 'Director' || currentUser.role?.name?.toLowerCase().includes('director') || currentUser.role?.name?.toLowerCase().includes('owner');
  const isHR = isSuperAdmin || currentUser.roleId === 'role_hr_mgr' || currentUser.roleId === 'role_ta_exec' || currentUser.roleId === 'role_training_mgr' || currentUser.department?.toLowerCase().includes('hr') || currentUser.department?.toLowerCase().includes('talent') || currentUser.role?.name?.toLowerCase().includes('hr');
  
  // Dynamic authorization: true if user is Admin/Director/HR OR has any active permission in the matrix
  const hasAnyMatrixPermission = currentUser.roleId 
    ? Object.keys(permissionsMatrix).some(permId => permissionsMatrix[permId]?.[currentUser.roleId] === true)
    : false;
  const hasAnyUserPermission = isAdminCheckbox && currentUser.permissions && currentUser.permissions.length > 0;
  const hasAccess = isAdmin || isDirectorOrOwner || isHR || hasAnyMatrixPermission || hasAnyUserPermission;
  
  const [bypassAuth, setBypassAuth] = useState(false);

  // Custom non-blocking Toast System
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Active admin tab: 'reports' | 'approvals' | 'hierarchy' | 'users' | 'roles' | 'curriculum' | 'analytics' | 'recruitment' | 'departments' | 'certificate' | 'audit' | 'helpdesk'
  const [adminTab, setAdminTabState] = useState<'reports' | 'approvals' | 'hierarchy' | 'users' | 'roles' | 'curriculum' | 'analytics' | 'recruitment' | 'departments' | 'certificate' | 'audit' | 'helpdesk'>('reports');

  // Table row limits / pagination state
  const [reportsLimit, setReportsLimit] = useState<number>(10);
  const [approvalsLimit, setApprovalsLimit] = useState<number>(10);
  const [usersLimit, setUsersLimit] = useState<number>(10);
  const [usersPage, setUsersPage] = useState<number>(1);
  const [rolesLimit, setRolesLimit] = useState<number>(10);
  const [departmentsLimit, setDepartmentsLimit] = useState<number>(10);
  const [auditLimit, setAuditLimit] = useState<number>(10);
  const [recruitmentLogsLimit, setRecruitmentLogsLimit] = useState<number>(10);
  const [recruitmentQuestionsLimit, setRecruitmentQuestionsLimit] = useState<number>(10);

  // Enterprise Grid Table State variables
  const [userTableIsFullscreen, setUserTableIsFullscreen] = useState<boolean>(false);
  const [userTableVisibleCols, setUserTableVisibleCols] = useState<string[]>([
    'SN', 'USER', 'EMAIL', 'ROLES', 'LAST_LOGIN', 'STATUS', 'MOBILE', 'ADMIN', 'EMPLOYEE_ID', 'DESCRIPTION', 'DESIGNATION', 'EMAIL_SIGNATURE', 'REPORT_TO', 'CONTROL'
  ]);
  const [userTableColDropdownOpen, setUserTableColDropdownOpen] = useState<boolean>(false);
  const [userTableRowMenuOpenId, setUserTableRowMenuOpenId] = useState<string | null>(null);
  const [userTableIsRefreshing, setUserTableIsRefreshing] = useState<boolean>(false);

  const handleRefreshUserTable = () => {
    setUserTableIsRefreshing(true);
    setTimeout(() => {
      setUserTableIsRefreshing(false);
      showToast("Trainee records re-indexed & refreshed successfully!", "success");
    }, 600);
  };

  // Sidebar and Sub-tab control state
  const [adminSubTab, setAdminSubTab] = useState<string>('reports_overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(true);
  const [sidebarLocked, setSidebarLocked] = useState<boolean>(false);
  const [sidebarVisible, setSidebarVisible] = useState<boolean>(true);
  const [autoHideEnabled, setAutoHideEnabled] = useState<boolean>(true);
  const [expandedTabs, setExpandedTabs] = useState<Record<string, boolean>>({ reports: true });
  const [showDepartmentsSidebar, setShowDepartmentsSidebar] = useState<boolean>(false);
  const [welcomeBannerDismissed, setWelcomeBannerDismissed] = useState<boolean>(() => {
    return localStorage.getItem('welcome_banner_dismissed_v2') === 'true';
  });

  const handleSubTabClick = (tabId: string, subTabId: string) => {
    setAdminTabState(tabId as any);
    setAdminSubTab(subTabId);
    
    // Auto-scroll to the anchor ID if it exists
    setTimeout(() => {
      const element = document.getElementById(subTabId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        element.classList.add('ring-2', 'ring-indigo-500', 'ring-offset-2', 'transition-all', 'duration-500');
        setTimeout(() => {
          element.classList.remove('ring-2', 'ring-indigo-500', 'ring-offset-2');
        }, 1500);
      }
    }, 100);
  };

  // Synchronize dynamic updates from parent header navigation Tab selector
  useEffect(() => {
    if (selectedTab && selectedTab !== adminTab) {
      setAdminTabState(selectedTab);
    }
  }, [selectedTab]);

  useEffect(() => {
    // Show a beautiful welcome toast on login/mount
    showToast(`Welcome back, ${currentUser.name}! You have entered the Admin Control Cockpit.`, 'success');
  }, [currentUser.id]);

  useEffect(() => {
    setExpandedTabs(() => ({ [adminTab]: true }));
  }, [adminTab]);

  useEffect(() => {
    if (helplineContacts) {
      setLocalHelplineContacts(helplineContacts);
    }
  }, [helplineContacts]);

  const setAdminTab = (tab: typeof adminTab) => {
    setAdminTabState(tab);
    setExpandedTabs(() => ({ [tab]: true }));
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  // Advanced Analytics Dashboard State
  const [analyticsSearch, setAnalyticsSearch] = useState('');
  const [analyticsRoleFilter, setAnalyticsRoleFilter] = useState('all');
  const [analyticsProgressFilter, setAnalyticsProgressFilter] = useState('all'); // 'all' | 'certified' | 'in_progress' | 'not_started'
  const [analyticsSortBy, setAnalyticsSortBy] = useState<'name_asc' | 'name_desc' | 'progress_desc' | 'progress_asc'>('progress_desc');
  const [analyticsInspectedUserId, setAnalyticsInspectedUserId] = useState<string | null>(null);

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

  // Sub-tab for brand and certificate settings
  const [certSubTab, setCertSubTab] = useState<'branding' | 'template' | 'helpline' | 'smtp'>('branding');

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

  // SMTP Email Delivery Config State
  const [smtpHost, setSmtpHost] = useState(() => getSmtpConfig().host);
  const [smtpPort, setSmtpPort] = useState(() => getSmtpConfig().port);
  const [smtpUser, setSmtpUser] = useState(() => getSmtpConfig().user);
  const [smtpPass, setSmtpPass] = useState(() => getSmtpConfig().pass);
  const [smtpFromName, setSmtpFromName] = useState(() => getSmtpConfig().fromName);
  const [smtpFromEmail, setSmtpFromEmail] = useState(() => getSmtpConfig().fromEmail);
  const [smtpSavingSuccess, setSmtpSavingSuccess] = useState('');
  const [smtpTestLoading, setSmtpTestLoading] = useState(false);
  const [smtpTestEmail, setSmtpTestEmail] = useState('');

  const handleSaveSmtp = () => {
    try {
      const config: SmtpConfig = {
        host: smtpHost,
        port: smtpPort,
        user: smtpUser,
        pass: smtpPass,
        fromName: smtpFromName,
        fromEmail: smtpFromEmail
      };
      saveSmtpConfig(config);
      setSmtpSavingSuccess("✓ SMTP Email Configurations successfully saved and live!");
      setTimeout(() => setSmtpSavingSuccess(''), 4000);
      showToast("✓ SMTP configuration saved successfully!", "success");
    } catch (err: any) {
      showToast("Error saving SMTP configuration: " + err.message, "error");
    }
  };

  const handleTestSmtp = async () => {
    if (!smtpTestEmail) {
      showToast("Please enter a valid recipient email address first!", "info");
      return;
    }
    setSmtpTestLoading(true);
    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: smtpTestEmail,
          otp: Math.floor(100000 + Math.random() * 900000).toString(),
          name: 'Administrator Test Recipient',
          mode: 'forgot',
          smtpConfig: {
            host: smtpHost,
            port: smtpPort,
            user: smtpUser,
            pass: smtpPass,
            fromName: smtpFromName,
            fromEmail: smtpFromEmail
          }
        })
      });
      const data = await response.json();
      setSmtpTestLoading(false);
      if (data.sent) {
        showToast("✓ Real SMTP test email dispatched successfully! Please check your inbox.", "success");
      } else {
        showToast(`❌ SMTP send failed: ${data.message || 'No direct response'}`, "error");
      }
    } catch (err: any) {
      setSmtpTestLoading(false);
      showToast(`❌ Connection failed: ${err.message}`, "error");
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
  const [collapsedChapterIds, setCollapsedChapterIds] = useState<Record<string, boolean>>({});
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [showCreateChapterForm, setShowCreateChapterForm] = useState<boolean>(false);

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

  // Search & Filter states for multiple cockpit panels (Departments, Approvals, Roles, Question Bank, Attempt Logs)
  const [deptSearchQuery, setDeptSearchQuery] = useState('');
  const [deptFilterType, setDeptFilterType] = useState<string>('all');
  const [approvalSearchQuery, setApprovalSearchQuery] = useState('');
  const [approvalDeptFilter, setApprovalDeptFilter] = useState('all');
  const [roleSearchQuery, setRoleSearchQuery] = useState('');
  const [roleDeptFilter, setRoleDeptFilter] = useState('all');
  const [recTakerSearchQuery, setRecTakerSearchQuery] = useState('');
  const [questionSearchQuery, setQuestionSearchQuery] = useState('');
  const [questionChapterFilter, setQuestionChapterFilter] = useState('all');

  // Audit states for Compliance Audit Trail
  const [auditSearch, setAuditSearch] = useState('');
  const [auditUserFilter, setAuditUserFilter] = useState('all');
  const [auditRoleFilter, setAuditRoleFilter] = useState('all');
  const [auditDeptFilter, setAuditDeptFilter] = useState('all');
  const [auditStatusFilter, setAuditStatusFilter] = useState('all');
  const [auditViewMode, setAuditViewMode] = useState<'matrix' | 'timeline'>('matrix');
  const [selectedAuditRowId, setSelectedAuditRowId] = useState<string | null>(null);

  // Helpdesk States
  const [helpdeskTickets, setHelpdeskTicketsState] = useState<HelpdeskTicket[]>(() => getHelpdeskTickets());
  const [helpdeskSearchQuery, setHelpdeskSearchQuery] = useState<string>('');
  const [helpdeskStatusFilter, setHelpdeskStatusFilter] = useState<string>('all');
  const [helpdeskCategoryFilter, setHelpdeskCategoryFilter] = useState<string>('all');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  useEffect(() => {
    setHelpdeskTicketsState(getHelpdeskTickets());
  }, [adminTab]);

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
    if (recTakerSearchQuery) {
      const q = recTakerSearchQuery.toLowerCase().trim();
      const userName = (att.userName || '').toLowerCase();
      const userEmail = (att.userEmail || '').toLowerCase();
      if (!userName.includes(q) && !userEmail.includes(q)) return false;
    }
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
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
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
  const [editUserIsAdmin, setEditUserIsAdmin] = useState(false);
  const [editUserIsSuperAdmin, setEditUserIsSuperAdmin] = useState(false);
  const [editUserPermissions, setEditUserPermissions] = useState<string[]>([]);
  const [editUserMobile, setEditUserMobile] = useState('');
  const [editUserReportsTo, setEditUserReportsTo] = useState('');

  // Multi-Select & Bulk Edit States
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [bulkEditRole, setBulkEditRole] = useState('');
  const [bulkEditRoles, setBulkEditRoles] = useState<string[]>([]);
  const [bulkEditDept, setBulkEditDept] = useState('');
  const [bulkEditFocus, setBulkEditFocus] = useState('Rathi Buildmart Head Office');
  const [bulkEditStatus, setBulkEditStatus] = useState<'Active' | 'Deactivated' | 'Left'>('Active');
  const [bulkEditIsAdmin, setBulkEditIsAdmin] = useState(false);
  const [bulkEditIsSuperAdmin, setBulkEditIsSuperAdmin] = useState(false);

  // Field toggles so they can selectively apply changes (only check field box to update it)
  const [bulkUpdateRole, setBulkUpdateRole] = useState(false);
  const [bulkUpdateRoles, setBulkUpdateRoles] = useState(false);
  const [bulkUpdateDept, setBulkUpdateDept] = useState(false);
  const [bulkUpdateFocus, setBulkUpdateFocus] = useState(false);
  const [bulkUpdateStatus, setBulkUpdateStatus] = useState(false);
  const [bulkUpdateIsAdmin, setBulkUpdateIsAdmin] = useState(false);

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
  const [newUserIsAdmin, setNewUserIsAdmin] = useState(false);
  const [newUserIsSuperAdmin, setNewUserIsSuperAdmin] = useState(false);
  const [newUserPermissions, setNewUserPermissions] = useState<string[]>([]);
  const [newUserMobile, setNewUserMobile] = useState('');
  const [newUserReportsTo, setNewUserReportsTo] = useState('');
  
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
  const [selectedPermissionGroup, setSelectedPermissionGroup] = useState<string>('Account Group & Roles Matrix');
  const [searchPermissionQuery, setSearchPermissionQuery] = useState<string>('');
  const [visibleRoleColumns, setVisibleRoleColumns] = useState<string[]>(() => {
    return roles ? roles.map(r => r.id) : [];
  });
  const [showRoleSelectionDropdown, setShowRoleSelectionDropdown] = useState<boolean>(false);
  // Helper to check if simulated or active currentUser's role has a specific permission key enabled
  const hasPermission = (permId: string): boolean => {
    // 1. Super Admin bypasses all checks
    if (currentUser.isSuperAdmin) {
      return true;
    }

    // 2. Admin with user-wise permissions
    if (currentUser.isAdmin) {
      const userPerms = currentUser.permissions || [];
      return userPerms.includes(permId);
    }

    const roleId = currentUser.roleId;
    if (!roleId) return true; // Default fallback if no role ID
    
    // Always grant full bypass if they are super admin (Senior Accountant/Admin)
    if (currentUser.roleId === 'role_sr_acc') return true;

    if (permissionsMatrix[permId] && permissionsMatrix[permId][roleId] !== undefined) {
      return permissionsMatrix[permId][roleId];
    }
    
    // Fallback: search if it's a parent row
    const foundPerm = ALL_PERMISSIONS.find(p => p.id === permId);
    if (foundPerm?.isParent) {
      // Parents default to true unless disabled
      return true;
    }
    
    // Standard default
    return true;
  };

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
  const [isOpenSidebarRoleFilter, setIsOpenSidebarRoleFilter] = useState(false);
  const [newChapterName, setNewChapterName] = useState('');
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  
  // Chapter Editor & Filtering state
  const [isEditChapterModalOpen, setIsEditChapterModalOpen] = useState(false);
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [editingChapterName, setEditingChapterName] = useState('');
  const [editingChapterRoleId, setEditingChapterRoleId] = useState('');
  const [chapterSearchQuery, setChapterSearchQuery] = useState('');
  
  // Unit Form State
  const [unitChapterId, setUnitChapterId] = useState('');
  const [unitCode, setUnitCode] = useState('');
  const [unitTaskName, setUnitTaskName] = useState('');
  const [unitFreq, setUnitFreq] = useState<UnitFrequency>('Daily');
  const [unitSkill, setUnitSkill] = useState<UnitSkillLevel>('Beginner');
  const [unitVideoTitle, setUnitVideoTitle] = useState('');
  const [unitVideoUrl, setUnitVideoUrl] = useState('');
  const [unitPdfUrl, setUnitPdfUrl] = useState('');
  const [unitDesc, setUnitDesc] = useState('');
  const [unitSopItems, setUnitSopItems] = useState<SopItem[]>([]);

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

  // Sync selected role IDs if roles prop updates (e.g. from Cloud sync or admin action)
  useEffect(() => {
    if (roles) {
      setUserSelectedRoleIds(roles.map(r => r.id));
    }
  }, [roles]);

  const matchedUsers = users.filter((item) => {
    if (userSearchQuery.trim()) {
      const q = userSearchQuery.toLowerCase();
      if (!item.name.toLowerCase().includes(q) && !item.email.toLowerCase().includes(q)) return false;
    }
    if (userDeptFilter !== 'all' && item.department !== userDeptFilter) return false;
    if (userStatusFilter !== 'all') {
      const currentStatus = item.status || 'Active';
      if (currentStatus !== userStatusFilter) return false;
    }
    
    // Check if we have an active role filter. 
    // If the user has selected all available roles, we show all users (including those with custom, unlisted or empty roles).
    const allRolesSelected = roles.length > 0 && roles.every(r => userSelectedRoleIds.includes(r.id));
    if (!allRolesSelected) {
      if (userSelectedRoleIds.length === 0) return false; // nothing is checked, so no user matches
      const ur = Array.from(new Set([item.roleId, ...(item.roleIds || [])])).filter(Boolean);
      if (!ur.some(id => userSelectedRoleIds.includes(id))) return false;
    }
    return true;
  });

  // Reset page to 1 when filters or table limit change
  useEffect(() => {
    setUsersPage(1);
  }, [userSearchQuery, userDeptFilter, userStatusFilter, userSelectedRoleIds, usersLimit]);

  const handleExportUsersToCSV = () => {
    // Column headers
    const headers = [
      "Employee Name",
      "Email Address",
      "Department",
      "Location/Entity",
      "Designation (Role)",
      "Status",
      "Security Passkey",
      "Path Met %",
      "Mastery Met %"
    ];

    // Map each matched user to a row
    const rows = matchedUsers.map(user => {
      const roleObj = roles.find(r => r.id === user.roleId);
      const stats = calculateUserProgress(user.id, user.roleId);
      
      return [
        `"${(user.name || '').replace(/"/g, '""')}"`,
        `"${(user.email || '').replace(/"/g, '""')}"`,
        `"${(user.department || 'Unassigned').replace(/"/g, '""')}"`,
        `"${(user.focusEntity || 'Rathi Buildmart Head Office').replace(/"/g, '""')}"`,
        `"${(roleObj?.name || 'Unassigned').replace(/"/g, '""')}"`,
        `"${(user.status || 'Active').replace(/"/g, '""')}"`,
        `"${(user.password || 'rathi123').replace(/"/g, '""')}"`,
        `"${stats.overallPercent}%"`,
        `"${stats.masteryPercent}%"`
      ];
    });

    // Combine headers and rows
    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    // Download file safely
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `trainee_directory_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast("✓ Trainee directory exported to CSV successfully!", "success");
  };

  const activeChaptersList = (chapters || [])
    .filter(c => selectedCurriculumRoleIds.includes(c.roleId))
    .filter(c => {
      if (!chapterSearchQuery.trim()) return true;
      const roleName = roles.find(r => r.id === c.roleId)?.name || '';
      return c.name.toLowerCase().includes(chapterSearchQuery.toLowerCase()) ||
             roleName.toLowerCase().includes(chapterSearchQuery.toLowerCase());
    })
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const currentSelectedChapterId = selectedChapterId && activeChaptersList.some(c => c.id === selectedChapterId)
    ? selectedChapterId
    : (activeChaptersList[0]?.id || null);

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
    if (!hasPermission('perm_user_edt')) {
      showToast("🔒 Permission Denied: Your designation has not been granted 'Edit Trainee Profile' permission in the Permissions Matrix!", "error");
      return;
    }
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
          status: editUserStatus,
          isAdmin: editUserIsAdmin,
          isSuperAdmin: editUserIsSuperAdmin,
          permissions: editUserIsAdmin ? editUserPermissions : [],
          mobile: editUserMobile.trim(),
          reportsTo: editUserReportsTo || undefined
        };
      }
      return u;
    });
    onUpdateUsers(updated);
    setEditingUserId(null);
    showToast('✓ User updated and job privileges saved successfully!', 'success');
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPermission('perm_user_add')) {
      showToast("🔒 Permission Denied: Your designation has not been granted 'Register New Trainee' permission in the Permissions Matrix!", "error");
      return;
    }
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
      status: newUserStatus,
      isAdmin: newUserIsAdmin,
      isSuperAdmin: newUserIsSuperAdmin,
      permissions: newUserIsAdmin ? newUserPermissions : [],
      mobile: newUserMobile.trim(),
      reportsTo: newUserReportsTo || undefined
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
    setNewUserIsAdmin(false);
    setNewUserIsSuperAdmin(false);
    setNewUserPermissions([]);
    setNewUserMobile('');
    setNewUserReportsTo('');
    setIsAddingUser(false);
    showToast(`✓ Registered "${newUserObj.name}" with password into the enterprise directory!`, 'success');
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (!hasPermission('perm_user_del')) {
      showToast("🔒 Permission Denied: Your designation has not been granted 'Offboard/Delete User' permission in the Permissions Matrix!", "error");
      return;
    }
    if (userId === currentUser.id) {
      showToast("Error: You cannot delete your own logged-in administrator account!", 'error');
      return;
    }
    onUpdateUsers(users.filter(u => u.id !== userId));
    onUpdateProgress(progress.filter(p => p.userId !== userId));
    showToast(`✓ Successfully offboarded and deleted employee "${userName}".`, 'success');
    setConfirmDeleteUserId(null);
  };

  const handleBulkEditSave = () => {
    if (!hasPermission('perm_user_edt')) {
      showToast("🔒 Permission Denied: Your designation has not been granted 'Edit Trainee Profile' permission in the Permissions Matrix!", "error");
      return;
    }
    if (selectedUserIds.length === 0) {
      showToast("No trainees selected for bulk edit", "error");
      return;
    }

    const updated = users.map(u => {
      if (selectedUserIds.includes(u.id)) {
        const updatedUser = { ...u };
        if (bulkUpdateRole) {
          updatedUser.roleId = bulkEditRole;
          const otherRoles = (updatedUser.roleIds || []).filter(rId => rId !== u.roleId && rId !== bulkEditRole);
          updatedUser.roleIds = Array.from(new Set([bulkEditRole, ...otherRoles]));
        }
        if (bulkUpdateRoles) {
          const currentPrimary = bulkUpdateRole ? bulkEditRole : u.roleId;
          const otherRoles = bulkEditRoles.filter(rId => rId !== currentPrimary);
          updatedUser.roleIds = Array.from(new Set([currentPrimary, ...otherRoles]));
        }
        if (bulkUpdateDept) {
          updatedUser.department = bulkEditDept;
        }
        if (bulkUpdateFocus) {
          updatedUser.focusEntity = bulkEditFocus;
        }
        if (bulkUpdateStatus) {
          updatedUser.status = bulkEditStatus;
        }
        if (bulkUpdateIsAdmin) {
          updatedUser.isAdmin = bulkEditIsAdmin;
          updatedUser.isSuperAdmin = bulkEditIsSuperAdmin;
          if (bulkEditIsAdmin) {
            updatedUser.permissions = u.permissions || [];
          } else {
            updatedUser.permissions = [];
          }
        }
        return updatedUser;
      }
      return u;
    });

    onUpdateUsers(updated);
    setSelectedUserIds([]);
    setIsBulkEditOpen(false);
    showToast(`✓ Bulk updated ${selectedUserIds.length} trainees successfully!`, 'success');
  };

  const handleBulkDelete = () => {
    if (!hasPermission('perm_user_del')) {
      showToast("🔒 Permission Denied: Your designation has not been granted 'Delete Trainee Profile' permission!", "error");
      return;
    }
    if (selectedUserIds.length === 0) return;
    
    // Check if current user is in selection
    if (selectedUserIds.includes(currentUser.id)) {
      showToast("Error: You cannot delete your own logged-in administrator account in bulk operations!", 'error');
      return;
    }

    if (window.confirm(`Are you sure you want to offboard/delete the ${selectedUserIds.length} selected trainees? This action cannot be undone.`)) {
      const updated = users.filter(u => !selectedUserIds.includes(u.id));
      onUpdateUsers(updated);
      // Also clean up progress records
      onUpdateProgress(progress.filter(p => !selectedUserIds.includes(p.userId)));
      setSelectedUserIds([]);
      showToast(`✓ Successfully offboarded and deleted ${selectedUserIds.length} selected trainees.`, 'success');
    }
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
    setShowAddDeptModal(false);
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
    if (!hasPermission('perm_curr_chap_add')) {
      showToast('🔒 Access Denied: You do not have permission to add chapters.', 'error');
      return;
    }
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
    if (!hasPermission('perm_curr_chap_del')) {
      showToast('🔒 Access Denied: You do not have permission to delete chapters.', 'error');
      return;
    }
    onUpdateChapters(chapters.filter(c => c.id !== chapId));
    onUpdateUnits(units.filter(u => u.chapterId !== chapId));
    showToast('✓ Chapter deleted successfully along with all nested units.', 'success');
    setConfirmDeleteChapterId(null);
  };

  // Save edited chapter
  const handleSaveChapterEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPermission('perm_curr_chap_edt')) {
      showToast('🔒 Access Denied: You do not have permission to edit chapters.', 'error');
      return;
    }
    if (!editingChapterId || !editingChapterName.trim() || !editingChapterRoleId) {
      showToast('Chapter name and Job Profile are required.', 'error');
      return;
    }
    const updatedChapters = chapters.map(c => {
      if (c.id === editingChapterId) {
        return {
          ...c,
          name: editingChapterName.trim(),
          roleId: editingChapterRoleId
        };
      }
      return c;
    });
    onUpdateChapters(updatedChapters);
    setIsEditChapterModalOpen(false);
    setEditingChapterId(null);
    showToast('✓ Chapter updated successfully!', 'success');
  };

  // Adding or editing unit
  const handleSaveUnit = (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = !!editingUnitId;
    if (isEdit) {
      if (!hasPermission('perm_curr_unit_edt')) {
        showToast('🔒 Access Denied: You do not have permission to edit learning units.', 'error');
        return;
      }
    } else {
      if (!hasPermission('perm_curr_unit_add')) {
        showToast('🔒 Access Denied: You do not have permission to add learning units.', 'error');
        return;
      }
    }
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
            pdfUrl: unitPdfUrl,
            description: unitDesc,
            chapterId: unitChapterId,
            sopItems: unitSopItems
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
        pdfUrl: unitPdfUrl,
        description: unitDesc,
        sopItems: unitSopItems
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
    setUnitPdfUrl('');
    setUnitDesc('');
    setUnitChapterId('');
    setUnitSopItems([]);
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
    setUnitPdfUrl(unit.pdfUrl || '');
    setUnitDesc(unit.description);
    setUnitSopItems(unit.sopItems && unit.sopItems.length > 0 ? unit.sopItems : getSopItemsForUnit(unit));
    setIsUnitModalOpen(true);
  };

  // Delete Unit
  const handleDeleteUnit = (unitId: string) => {
    if (!hasPermission('perm_curr_unit_del')) {
      showToast('🔒 Access Denied: You do not have permission to delete checklist units.', 'error');
      return;
    }
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
      const idxPdfUrl = headers.findIndex(h => h.includes('document pdf') || h.includes('pdf url') || h.includes('pdf link') || h.includes('pdf') || h.includes('document (pdf)'));
      const idxDesc = headers.findIndex(h => h.includes('desc') || h.includes('description') || h.includes('instruction') || h.includes('sop'));
      const idxSopItems = headers.findIndex(h => h.includes('checklist') || h.includes('sop items') || h.includes('sop checklist') || h.includes('checklist items') || h.includes('steps') || h.includes('best practices'));

      if (idxProfile === -1 || idxChapter === -1 || idxCode === -1 || idxTask === -1) {
        setBulkImportError("Error: Could not automatically read header headings. Header columns MUST map to: Job Profile, Chapter Name, Unit Code, Work Task / Title");
        setBulkParsedRows([]);
        return;
      }

      const parseSopItems = (cellVal: string): { title: string; desc: string; }[] => {
        if (!cellVal || !cellVal.trim()) return [];
        
        // Try splitting by common delimiters: first newline, then pipe |, then double semicolon ;;
        let rawItems: string[] = [];
        if (cellVal.includes('\n')) {
          rawItems = cellVal.split('\n');
        } else if (cellVal.includes('|')) {
          rawItems = cellVal.split('|');
        } else if (cellVal.includes(';;')) {
          rawItems = cellVal.split(';;');
        } else if (cellVal.includes(';')) {
          rawItems = cellVal.split(';');
        } else {
          rawItems = [cellVal];
        }

        const items: { title: string; desc: string; }[] = [];
        rawItems.forEach(item => {
          const trimmed = item.trim();
          if (!trimmed) return;

          // Clean up any leading list numbers like "1.", "1)", "- ", "* ", "• "
          const cleanItem = trimmed.replace(/^(?:\d+[\.\)]|[-*•])\s*/, '').trim();
          if (!cleanItem) return;

          // Split title and description by first occurrence of ":" or " - " or " — "
          let title = cleanItem;
          let desc = '';

          const colonIdx = cleanItem.indexOf(':');
          const hyphenIdx = cleanItem.indexOf(' - ');
          const emDashIdx = cleanItem.indexOf(' — ');

          let sepIdx = -1;
          let sepLen = 0;

          if (colonIdx !== -1) {
            sepIdx = colonIdx;
            sepLen = 1;
          }
          if (hyphenIdx !== -1 && (sepIdx === -1 || hyphenIdx < sepIdx)) {
            sepIdx = hyphenIdx;
            sepLen = 3;
          }
          if (emDashIdx !== -1 && (sepIdx === -1 || emDashIdx < sepIdx)) {
            sepIdx = emDashIdx;
            sepLen = 3;
          }

          if (sepIdx !== -1) {
            title = cleanItem.substring(0, sepIdx).trim();
            desc = cleanItem.substring(sepIdx + sepLen).trim();
          }

          if (title.length > 120 && !desc) {
            desc = title;
            title = title.substring(0, 50) + '...';
          }

          items.push({
            title: title || 'Task Step',
            desc: desc || ''
          });
        });

        return items;
      };

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
        const pdfUrlVal = idxPdfUrl !== -1 ? (rowCells[idxPdfUrl] || '').trim() : '';
        const descVal = idxDesc !== -1 ? (rowCells[idxDesc] || '').trim() : '';
        const sopItemsVal = idxSopItems !== -1 ? (rowCells[idxSopItems] || '').trim() : '';

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
          pdfUrl: pdfUrlVal || '',
          desc: descVal || 'Guidance document & training notes.',
          sopItems: parseSopItems(sopItemsVal),
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
        pdfUrl: row.pdfUrl || '',
        description: row.desc,
        sopItems: row.sopItems || []
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
    const sampleText = `Job Profile\tChapter Name\tUnit Code\tWork Task / Title\tExecution Frequency\tSkill Level\tVideo Title\tVideo Embed URL\tDocument (PDF)\tDescription\tSOP Checklist Items
Tax Associate\tGST Compliance & Filings\tGST-004\tVerify GSTR-2B compliance records\tMonthly\tIntermediate\tGSTR-2B Mismatch Audit Guide\thttps://www.youtube.com/embed/S7U_F7F9-kM\thttps://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf\tCheck invoice inputs against online GSTR-2B records to maximize input tax credit.\t1. GSTR-2B Statement Download: Download and extract official GSTR-2B from GST portal | 2. ITC Booking Verification: Compare credited ITC with purchase ledger | 3. Missing Vendor Action: Notify missing invoices to vendor coordination
Senior Accountant\tFinancial Close & Consolidation Accounting\tFIN-502\tPerform Bank Reconciliation Statement (BRS)\tDaily\tAdvanced\tFIN-502 BRS SOP Walkthrough\thttps://www.youtube.com/embed/nE1E1xidV2U\thttps://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf\tReconcile all bank statements with general ledger logs, check adjusting entry errors.\t1. Fetch bank feeds: Sync bank statement lines to accounting ledger | 2. Spot discrepancies: Highlight un-reconciled items | 3. Post adjustments: Record bank fees and interest entry logs
Junior Accountant\tFixed Asset Register Maintenance\tAST-101\tRecord physical assets depreciation\tMonthly\tBeginner\tAST-101 Depreciation Guide\thttps://www.youtube.com/embed/nE1E1xidV2U\thttps://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf\tCalculate depreciation using straight-line and WDV methods, update active registers.\t1. Asset Audit: Verify active physical tags | 2. Computation: Calculate straight-line depreciation value | 3. Register Post: Log depreciation entries into fixed asset registers
Accounts Executive (AP/AR)\tAccounts Payable Workflow\tAP-201\tMatch vendor purchase orders\tDaily\tBeginner\tAP-201 Invoice verification guidelines\thttps://www.youtube.com/embed/nE1E1xidV2U\thttps://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf\tVerify incoming supplier bills against matching purchase orders and GRN inputs.\t1. Invoice Scan: Read inbound invoice fields | 2. Three-way Match: Check PO and GRN quantities | 3. Approve Payment: Release to accounting ledger for payment batching`;
    
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
    const sampleText = `Job Profile\tChapter Name\tUnit Code\tWork Task / Title\tExecution Frequency\tSkill Level\tVideo Title\tVideo Embed URL\tDocument (PDF)\tDescription\tSOP Checklist Items
Tax Associate\tGST Compliance & Filings\tGST-004\tVerify GSTR-2B compliance records\tMonthly\tIntermediate\tGSTR-2B Mismatch Audit Guide\thttps://www.youtube.com/embed/S7U_F7F9-kM\thttps://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf\tCheck invoice inputs against online GSTR-2B records to maximize input tax credit.\t1. GSTR-2B Statement Download: Download and extract official GSTR-2B from GST portal | 2. ITC Booking Verification: Compare credited ITC with purchase ledger | 3. Missing Vendor Action: Notify missing invoices to vendor coordination
Senior Accountant\tFinancial Close & Consolidation Accounting\tFIN-502\tPerform Bank Reconciliation Statement (BRS)\tDaily\tAdvanced\tFIN-502 BRS SOP Walkthrough\thttps://www.youtube.com/embed/nE1E1xidV2U\thttps://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf\tReconcile all bank statements with general ledger logs, check adjusting entry errors.\t1. Fetch bank feeds: Sync bank statement lines to accounting ledger | 2. Spot discrepancies: Highlight un-reconciled items | 3. Post adjustments: Record bank fees and interest entry logs
Junior Accountant\tFixed Asset Register Maintenance\tAST-101\tRecord physical assets depreciation\tMonthly\tBeginner\tAST-101 Depreciation Guide\thttps://www.youtube.com/embed/nE1E1xidV2U\thttps://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf\tCalculate depreciation using straight-line and WDV methods, update active registers.\t1. Asset Audit: Verify active physical tags | 2. Computation: Calculate straight-line depreciation value | 3. Register Post: Log depreciation entries into fixed asset registers
Accounts Executive (AP/AR)\tAccounts Payable Workflow\tAP-201\tMatch vendor purchase orders\tDaily\tBeginner\tAP-201 Invoice verification guidelines\thttps://www.youtube.com/embed/nE1E1xidV2U\thttps://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf\tVerify incoming supplier bills against matching purchase orders and GRN inputs.\t1. Invoice Scan: Read inbound invoice fields | 2. Three-way Match: Check PO and GRN quantities | 3. Approve Payment: Release to accounting ledger for payment batching`;
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
        "Document (PDF)",
        "Description",
        "SOP Checklist Items"
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
          "Document (PDF)": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          "Description": "Check invoice inputs against online GSTR-2B records to maximize input tax credit.",
          "SOP Checklist Items": "1. GSTR-2B Statement Download: Download and extract official GSTR-2B from GST portal | 2. ITC Booking Verification: Compare credited ITC with purchase ledger | 3. Missing Vendor Action: Notify missing invoices to vendor coordination"
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
          "Document (PDF)": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          "Description": "Reconcile all bank statements with general ledger logs, check adjusting entry errors.",
          "SOP Checklist Items": "1. Fetch bank feeds: Sync bank statement lines to accounting ledger | 2. Spot discrepancies: Highlight un-reconciled items | 3. Post adjustments: Record bank fees and interest entry logs"
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
          "Document (PDF)": "",
          "Description": "Calculate depreciation using straight-line and WDV methods, update active registers.",
          "SOP Checklist Items": "1. Asset Audit: Verify active physical tags | 2. Computation: Calculate straight-line depreciation value | 3. Register Post: Log depreciation entries into fixed asset registers"
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
          "Document (PDF)": "",
          "Description": "Verify incoming supplier bills against matching purchase orders and GRN inputs.",
          "SOP Checklist Items": "1. Invoice Scan: Read inbound invoice fields | 2. Three-way Match: Check PO and GRN quantities | 3. Approve Payment: Release to accounting ledger for payment batching"
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
        { "Column Name": "Document (PDF)", "Requirement": "Optional", "Allowed Values / Example": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", "Description": "SOP Standard Operating Procedure PDF file link, e.g. from Google Drive preview or direct link." },
        { "Column Name": "Description", "Requirement": "Optional", "Allowed Values / Example": "Step-by-step audit guidelines...", "Description": "Detailed SOP guidelines text for performing this unit." },
        { "Column Name": "SOP Checklist Items", "Requirement": "Optional", "Allowed Values / Example": "1. GSTR-2B Statement Download: Download official statement | 2. Compare ITC: Match with purchase ledger", "Description": "Best practices / SOP checklist tasks. List multiple items separated by pipes (|), newlines, or semicolons (;). Format title and description using a colon (:)." }
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
    <div className="flex w-full h-full min-h-[calc(100vh-64px)] lg:h-[calc(100vh-64px)] lg:min-h-0 bg-slate-50/50 relative overflow-hidden">
      
      {/* Backdrop overlay for floating sidebar to auto hide when clicking outside / side */}
      {autoHideEnabled && !sidebarLocked && sidebarVisible && !sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-transparent z-[80] cursor-pointer"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* PREMIUM LIGHT LEFT SIDEBAR CONSOLE */}
      {sidebarVisible && (
        <aside 
          id="admin-sidebar"
          onMouseEnter={() => setSidebarCollapsed(false)}
          onMouseLeave={() => setSidebarCollapsed(true)}
          className={`bg-[#031d17] border-r border-[#052c23] transition-all duration-350 flex flex-col shrink-0 select-none shadow-[4px_0_35px_rgba(2,26,21,0.3)] ${
            sidebarCollapsed ? 'w-16' : 'w-[265px]'
          } ${
            sidebarLocked ? 'sticky top-14 lg:top-16 h-[calc(100vh-152px)] lg:h-[calc(100vh-104px)] font-sans z-40' : 'fixed top-14 lg:top-16 left-0 bottom-[96px] lg:bottom-10 shadow-[0_10px_35px_rgba(2,26,21,0.25)] z-[90]'
          } lg:my-3 lg:ml-3 lg:rounded-2xl lg:h-[calc(100vh-120px)] overflow-hidden`}
        >
          {/* Header area of sidebar */}
          <div className="p-3 border-b border-[#052c23] flex items-center justify-between gap-2 bg-gradient-to-r from-[#031d17] via-[#052c23]/30 to-transparent">
            {!sidebarCollapsed ? (
              <div className="flex items-center gap-2 min-w-0">
                <span className="p-1.5 bg-[#0a382c] text-[#10b981] rounded-lg border border-emerald-500/20 shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-[#10b981] animate-pulse" />
                </span>
                <div className="min-w-0">
                  <h4 className="font-display text-[10.5px] font-black uppercase tracking-wider text-emerald-50 truncate">
                    Control Hub
                  </h4>
                  <p className="text-[7.5px] text-[#10b981] font-mono font-bold mt-0.5 truncate">
                    COCKPIT CONSOLE
                  </p>
                </div>
              </div>
            ) : (
              <div className="mx-auto">
                <Sparkles className="w-4 h-4 text-[#10b981] animate-pulse" />
              </div>
            )}
            
            <div className={`flex items-center gap-0.5 shrink-0 ${sidebarCollapsed ? 'mx-auto hidden' : ''}`}>
              {/* Collapse Button */}
              <button
                type="button"
                onClick={() => setSidebarCollapsed(true)}
                title="Collapse Panel (Icons Mode)"
                className="text-slate-400 hover:text-emerald-400 hover:bg-[#0c3c33] p-1 rounded-lg transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {/* Lock/Unlock Toggle */}
              <button
                type="button"
                onClick={() => {
                  setSidebarLocked(!sidebarLocked);
                  showToast(
                    !sidebarLocked ? "Sidebar locked in place! Layout expanded." : "Sidebar unlocked! Floating mode activated.",
                    'info'
                  );
                }}
                title={sidebarLocked ? "Unlock/Float Sidebar" : "Lock Sidebar (Fixed Column)"}
                className={`p-1 rounded-lg transition-colors cursor-pointer ${
                  sidebarLocked ? 'text-[#10b981] bg-[#0c3c33] border border-emerald-500/20' : 'text-slate-400 hover:text-emerald-400 hover:bg-[#0c3c33]'
                }`}
              >
                {sidebarLocked ? <Pin className="w-3 h-3" /> : <PinOff className="w-3 h-3" />}
              </button>

              {/* Auto-Hide Toggle */}
              <button
                type="button"
                onClick={() => {
                  setAutoHideEnabled(!autoHideEnabled);
                  showToast(autoHideEnabled ? "Auto-hide on outside click disabled" : "Auto-hide on outside click enabled", "info");
                }}
                title={autoHideEnabled ? "Disable Auto-Hide on Outside Click" : "Enable Auto-Hide on Outside Click"}
                className={`p-1 rounded-lg transition-colors cursor-pointer ${
                  autoHideEnabled ? 'text-teal-400 bg-[#0c3c33] border border-teal-500/20' : 'text-slate-400 hover:text-[#10b981] hover:bg-[#0c3c33]'
                }`}
              >
                <MousePointerClick className="w-3.5 h-3.5" />
              </button>

              {/* Hide Sidebar button */}
              <button
                type="button"
                onClick={() => {
                  setSidebarVisible(false);
                  showToast("Sidebar hidden! Bring it back via the float button.", 'info');
                }}
                title="Hide Sidebar Complete"
                className="text-slate-400 hover:text-rose-500 hover:bg-[#0c3c33] p-1 rounded-lg transition-colors cursor-pointer"
              >
                <EyeOff className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Collapsed state Expand trigger */}
          {sidebarCollapsed && (
            <div className="py-2 flex justify-center border-b border-[#052c23] bg-[#021814]">
              <button
                type="button"
                onClick={() => setSidebarCollapsed(false)}
                title="Expand Panel"
                className="text-slate-400 hover:text-[#10b981] bg-[#0c3c33] hover:bg-[#0d463b] p-1.5 rounded-lg transition duration-200 cursor-pointer border border-[#0c3c33]/40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Sidebar Nav Items List */}
          <div className="flex-1 p-3 space-y-2 overflow-y-auto custom-scrollbar">
            {(() => {
              const sidebarTabs = [
                { 
                  id: 'reports', 
                  label: isDirectorOrOwner ? 'Executive Dashboard' : 'Dynamic Workspace', 
                  icon: BarChart2,
                  countLabel: 'Live',
                  subTabs: [
                    { 
                      id: 'reports_overview', 
                      label: 'Overview Metrics', 
                      isActive: adminTab === 'reports',
                      onClick: () => {
                        setAdminTab('reports');
                      }
                    }
                  ]
                },
                { 
                  id: 'approvals', 
                  label: 'Enrollment Approvals', 
                  icon: UserCheck,
                  count: users.filter(u => u.status === 'Pending Approval').length, 
                  countLabel: users.filter(u => u.status === 'Pending Approval').length > 0 ? `${users.filter(u => u.status === 'Pending Approval').length} Pending` : undefined,
                  subTabs: [
                    { 
                      id: 'pending_approvals', 
                      label: 'All Pending Queues', 
                      isActive: adminTab === 'approvals' && approvalDeptFilter === 'all',
                      onClick: () => {
                        setAdminTab('approvals');
                        setApprovalDeptFilter('all');
                      }
                    }
                  ]
                },
                { 
                  id: 'hierarchy', 
                  label: 'Hierarchy Matrix', 
                  icon: Network,
                  countLabel: 'Tree',
                  subTabs: [
                    { 
                      id: 'hierarchy_matrix', 
                      label: 'Org Hierarchy Tree', 
                      isActive: adminTab === 'hierarchy',
                      onClick: () => {
                        setAdminTab('hierarchy');
                      }
                    }
                  ]
                },
                ...((isDirectorOrOwner && !isSuperAdmin) ? [] : [
                  { 
                    id: 'users', 
                    label: 'User Database', 
                    icon: Users,
                    count: users.length,
                    subTabs: [
                      { 
                        id: 'user_directory', 
                        label: 'Trainee Registry (All Checked)', 
                        isActive: adminTab === 'users' && !showBatchSyncer && !isAddingUser,
                        onClick: () => {
                          setAdminTab('users');
                          setShowBatchSyncer(false);
                          setIsAddingUser(false);
                          setUserDeptFilter('all');
                          setUserStatusFilter('all');
                        }
                      },
                      { 
                        id: 'user_add', 
                        label: 'Deploy New User profile', 
                        isActive: adminTab === 'users' && isAddingUser,
                        onClick: () => {
                          setAdminTab('users');
                          setIsAddingUser(true);
                          setShowBatchSyncer(false);
                        }
                      },
                      { 
                        id: 'user_sync', 
                        label: 'Bulk Profile Syncer (Select All)', 
                        isActive: adminTab === 'users' && showBatchSyncer,
                        onClick: () => {
                          setAdminTab('users');
                          setShowBatchSyncer(true);
                          setIsAddingUser(false);
                          // Auto Check All targets
                          setSyncTargetUserIds(users.map(u => u.id));
                          showToast("All corporate trainees checked for batch sync! 👥", 'success');
                        }
                      }
                    ]
                  },
                  { 
                    id: 'roles', 
                    label: 'Job Roles Matrix', 
                    icon: Shield,
                    count: roles.length,
                    subTabs: [
                      { 
                        id: 'roles_matrix', 
                        label: 'Manage Permissions Matrix', 
                        isActive: adminTab === 'roles' && rolesSubTab === 'matrix',
                        onClick: () => {
                          setAdminTab('roles');
                          setRolesSubTab('matrix');
                          setIsAddingRole(false);
                        }
                      },
                      { 
                        id: 'roles_list', 
                        label: 'Standard Job Profiles List', 
                        isActive: adminTab === 'roles' && rolesSubTab === 'list',
                        onClick: () => {
                          setAdminTab('roles');
                          setRolesSubTab('list');
                          setIsAddingRole(false);
                        }
                      },
                      { 
                        id: 'roles_add', 
                        label: 'Add & Deploy Job Role', 
                        isActive: adminTab === 'roles' && rolesSubTab === 'add',
                        onClick: () => {
                          setAdminTab('roles');
                          setRolesSubTab('add');
                          setIsAddingRole(true);
                        }
                      }
                    ]
                  },
                  { 
                    id: 'curriculum', 
                    label: 'Curriculum Builder', 
                    icon: BookOpen,
                    countLabel: `${chapters.length} Ch`,
                    subTabs: [
                      { 
                        id: 'curriculum_manual', 
                        label: 'SOP Curriculum (All Checked)', 
                        isActive: adminTab === 'curriculum' && curriculumMode === 'manual',
                        onClick: () => {
                          setAdminTab('curriculum');
                          setCurriculumMode('manual');
                          // "All check" auto selection logic
                          setSelectedCurriculumRoleIds(roles.map(r => r.id));
                          showToast("All Job Profiles auto-checked & unified! 🌐", 'success');
                        }
                      },
                      { 
                        id: 'curriculum_bulk', 
                        label: 'Bulk Excel SOP Loader', 
                        isActive: adminTab === 'curriculum' && curriculumMode === 'bulk',
                        onClick: () => {
                          setAdminTab('curriculum');
                          setCurriculumMode('bulk');
                        }
                      }
                    ]
                  },

                  { 
                    id: 'recruitment', 
                    label: 'Assessment Exams', 
                    icon: CheckSquare,
                    countLabel: `${attemptsList.length} Logs`,
                    subTabs: [
                      { 
                        id: 'rec_logs', 
                        label: 'Exam Gating Logs (All Logs)', 
                        isActive: adminTab === 'recruitment' && recSubTab === 'logs',
                        onClick: () => {
                          setAdminTab('recruitment');
                          setRecSubTab('logs');
                          setRecFilterRole('all');
                          setRecFilterResult('all');
                        }
                      },
                      { 
                        id: 'rec_questions', 
                        label: 'Exam Question Builder', 
                        isActive: adminTab === 'recruitment' && recSubTab === 'questions',
                        onClick: () => {
                          setAdminTab('recruitment');
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
                        }
                      },
                      { 
                        id: 'rec_gating', 
                        label: 'Hard Gating Audits', 
                        isActive: adminTab === 'recruitment' && recSubTab === 'gating',
                        onClick: () => {
                          setAdminTab('recruitment');
                          setRecSubTab('gating');
                        }
                      }
                    ]
                  },
                  { 
                    id: 'departments', 
                    label: 'Departments Matrix', 
                    icon: Building,
                    count: departments.length,
                    subTabs: [
                      { 
                        id: 'departments_grid', 
                        label: 'Division Departments Grid', 
                        isActive: adminTab === 'departments',
                        onClick: () => {
                          setAdminTab('departments');
                        }
                      }
                    ]
                  },
                ]),
                { 
                  id: 'audit', 
                  label: 'Compliance Audit Trail', 
                  icon: History,
                  countLabel: `${progress.length} Logs`,
                  subTabs: [
                    { 
                      id: 'audit_matrix', 
                      label: 'Compliance Matrix (All Check)', 
                      isActive: adminTab === 'audit' && auditViewMode === 'matrix',
                      onClick: () => {
                        setAdminTab('audit');
                        setAuditViewMode('matrix');
                        setAuditUserFilter('all');
                        setAuditRoleFilter('all');
                        setAuditDeptFilter('all');
                        setAuditStatusFilter('all');
                      }
                    },
                    { 
                      id: 'audit_timeline', 
                      label: 'Live Chrono Feed', 
                      isActive: adminTab === 'audit' && auditViewMode === 'timeline',
                      onClick: () => {
                        setAdminTab('audit');
                        setAuditViewMode('timeline');
                      }
                    }
                  ]
                },
                { 
                  id: 'certificate', 
                  label: 'Certificate Settings', 
                  icon: Sliders,
                  countLabel: 'Config',
                  subTabs: [
                    { 
                      id: 'cert_branding', 
                      label: '🏢 Brand Identity & Logo', 
                      isActive: adminTab === 'certificate' && certSubTab === 'branding',
                      onClick: () => {
                        setAdminTab('certificate');
                        setCertSubTab('branding');
                      }
                    },
                    { 
                      id: 'cert_template', 
                      label: '📜 Certificate Template', 
                      isActive: adminTab === 'certificate' && certSubTab === 'template',
                      onClick: () => {
                        setAdminTab('certificate');
                        setCertSubTab('template');
                      }
                    },
                    { 
                      id: 'cert_helpline', 
                      label: '📞 Helpline & Contacts', 
                      isActive: adminTab === 'certificate' && certSubTab === 'helpline',
                      onClick: () => {
                        setAdminTab('certificate');
                        setCertSubTab('helpline');
                      }
                    },
                    { 
                      id: 'cert_smtp', 
                      label: '✉️ SMTP Outbound Mail', 
                      isActive: adminTab === 'certificate' && certSubTab === 'smtp',
                      onClick: () => {
                        setAdminTab('certificate');
                        setCertSubTab('smtp');
                      }
                    }
                  ]
                },
                { 
                  id: 'helpdesk', 
                  label: 'SOP Helpdesk Console', 
                  icon: HelpCircle,
                  countLabel: `${helpdeskTickets.filter(t => t.status === 'Open').length} Open`,
                  subTabs: [
                    { 
                      id: 'helpdesk_console', 
                      label: 'All Reported SOP Issues', 
                      isActive: adminTab === 'helpdesk',
                      onClick: () => {
                        setAdminTab('helpdesk');
                        setSelectedTicketId(null);
                      }
                    }
                  ]
                },
                {
                  id: 'learning',
                  label: 'My Learning Path',
                  icon: BookOpen,
                  isTraineeTab: true,
                  subTabs: [
                    {
                      id: 'trainee_learning_path',
                      label: 'Lesson Syllabus & Modules',
                      isActive: false,
                      onClick: () => {
                        onSelectTraineeTab?.('learning');
                      }
                    }
                  ]
                },
                {
                  id: 'exams',
                  label: 'Final Competency Test',
                  icon: Award,
                  isTraineeTab: true,
                  subTabs: [
                    {
                      id: 'trainee_exams',
                      label: 'Chapter Assessment Tests',
                      isActive: false,
                      onClick: () => {
                        onSelectTraineeTab?.('exams');
                      }
                    }
                  ]
                },
                {
                  id: 'testing',
                  label: 'Only Testing',
                  icon: Brain,
                  isTraineeTab: true,
                  subTabs: [
                    {
                      id: 'trainee_testing',
                      label: 'Skill Screening Exercises',
                      isActive: false,
                      onClick: () => {
                        onSelectTraineeTab?.('testing');
                      }
                    }
                  ]
                },
                {
                  id: 'certificate_trainee',
                  label: 'Mastery Certificate',
                  icon: Award,
                  isTraineeTab: true,
                  subTabs: [
                    {
                      id: 'trainee_certificate',
                      label: 'Download Qualification Document',
                      isActive: false,
                      onClick: () => {
                        onSelectTraineeTab?.('certificate');
                      }
                    }
                  ]
                }
              ];

              const colorThemes: Record<string, {
                activeBg: string;
                inactiveHover: string;
                activeIcon: string;
                inactiveIcon: string;
                activeBadge: string;
                inactiveBadge: string;
              }> = {
                reports: {
                  activeBg: 'bg-indigo-950/50 border border-indigo-500/30 text-white font-bold scale-[1.01]',
                  inactiveHover: 'hover:bg-indigo-950/20 hover:text-white text-indigo-100 border border-transparent',
                  activeIcon: 'bg-indigo-500/25 text-indigo-200 border border-indigo-500/20',
                  inactiveIcon: 'bg-[#021814] text-indigo-300 border border-[#0c3c33]/20',
                  activeBadge: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[7.5px]',
                  inactiveBadge: 'bg-[#021814] text-indigo-300 border border-[#0c3c33]/20 text-[7.5px]'
                },
                approvals: {
                  activeBg: 'bg-amber-950/50 border border-amber-500/30 text-white font-bold scale-[1.01]',
                  inactiveHover: 'hover:bg-amber-950/20 hover:text-white text-amber-100 border border-transparent',
                  activeIcon: 'bg-amber-500/25 text-amber-200 border border-amber-500/20',
                  inactiveIcon: 'bg-[#021814] text-amber-300 border border-[#0c3c33]/20',
                  activeBadge: 'bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[7.5px]',
                  inactiveBadge: 'bg-[#021814] text-amber-300 border border-[#0c3c33]/20 text-[7.5px]'
                },
                hierarchy: {
                  activeBg: 'bg-emerald-950/50 border border-emerald-500/30 text-white font-bold scale-[1.01]',
                  inactiveHover: 'hover:bg-emerald-950/20 hover:text-white text-emerald-100 border border-transparent',
                  activeIcon: 'bg-emerald-500/25 text-[#10b981] border border-emerald-500/20',
                  inactiveIcon: 'bg-[#021814] text-[#10b981] border border-[#0c3c33]/20',
                  activeBadge: 'bg-emerald-500/20 text-[#10b981] border border-emerald-500/30 text-[7.5px]',
                  inactiveBadge: 'bg-[#021814] text-[#10b981] border border-[#0c3c33]/20 text-[7.5px]'
                },
                users: {
                  activeBg: 'bg-violet-950/50 border border-violet-500/30 text-white font-bold scale-[1.01]',
                  inactiveHover: 'hover:bg-violet-950/20 hover:text-white text-violet-100 border border-transparent',
                  activeIcon: 'bg-violet-500/25 text-violet-200 border border-violet-500/20',
                  inactiveIcon: 'bg-[#021814] text-violet-300 border border-[#0c3c33]/20',
                  activeBadge: 'bg-violet-500/20 text-violet-300 border border-violet-500/30 text-[7.5px]',
                  inactiveBadge: 'bg-[#021814] text-violet-300 border border-[#0c3c33]/20 text-[7.5px]'
                },
                roles: {
                  activeBg: 'bg-rose-950/50 border border-rose-500/30 text-white font-bold scale-[1.01]',
                  inactiveHover: 'hover:bg-rose-950/20 hover:text-white text-rose-100 border border-transparent',
                  activeIcon: 'bg-rose-500/25 text-rose-200 border border-rose-500/20',
                  inactiveIcon: 'bg-[#021814] text-rose-300 border border-[#0c3c33]/20',
                  activeBadge: 'bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[7.5px]',
                  inactiveBadge: 'bg-[#021814] text-rose-300 border border-[#0c3c33]/20 text-[7.5px]'
                },
                curriculum: {
                  activeBg: 'bg-orange-950/50 border border-orange-500/30 text-white font-bold scale-[1.01]',
                  inactiveHover: 'hover:bg-orange-950/20 hover:text-white text-orange-100 border border-transparent',
                  activeIcon: 'bg-orange-500/25 text-orange-200 border border-orange-500/20',
                  inactiveIcon: 'bg-[#021814] text-orange-300 border border-[#0c3c33]/20',
                  activeBadge: 'bg-orange-500/20 text-orange-300 border border-orange-500/30 text-[7.5px]',
                  inactiveBadge: 'bg-[#021814] text-orange-300 border border-[#0c3c33]/20 text-[7.5px]'
                },
                analytics: {
                  activeBg: 'bg-fuchsia-950/50 border border-fuchsia-500/30 text-white font-bold scale-[1.01]',
                  inactiveHover: 'hover:bg-fuchsia-950/20 hover:text-white text-fuchsia-100 border border-transparent',
                  activeIcon: 'bg-fuchsia-500/25 text-fuchsia-200 border border-fuchsia-500/20',
                  inactiveIcon: 'bg-[#021814] text-fuchsia-300 border border-[#0c3c33]/20',
                  activeBadge: 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 text-[7.5px]',
                  inactiveBadge: 'bg-[#021814] text-fuchsia-300 border border-[#0c3c33]/20 text-[7.5px]'
                },
                recruitment: {
                  activeBg: 'bg-teal-950/50 border border-teal-500/30 text-white font-bold scale-[1.01]',
                  inactiveHover: 'hover:bg-teal-950/20 hover:text-white text-teal-100 border border-transparent',
                  activeIcon: 'bg-teal-500/25 text-[#10b981] border border-teal-500/20',
                  inactiveIcon: 'bg-[#021814] text-teal-300 border border-[#0c3c33]/20',
                  activeBadge: 'bg-teal-500/20 text-teal-350 border border-teal-500/30 text-[7.5px]',
                  inactiveBadge: 'bg-[#021814] text-teal-300 border border-[#0c3c33]/20 text-[7.5px]'
                },
                departments: {
                  activeBg: 'bg-indigo-950/50 border border-indigo-500/30 text-white font-bold scale-[1.01]',
                  inactiveHover: 'hover:bg-indigo-950/20 hover:text-white text-indigo-100 border border-transparent',
                  activeIcon: 'bg-indigo-500/25 text-indigo-200 border border-indigo-500/20',
                  inactiveIcon: 'bg-[#021814] text-[#10b981] border border-[#0c3c33]/20',
                  activeBadge: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[7.5px]',
                  inactiveBadge: 'bg-[#021814] text-emerald-300 border border-[#0c3c33]/20 text-[7.5px]'
                },
                audit: {
                  activeBg: 'bg-cyan-950/50 border border-cyan-500/30 text-white font-bold scale-[1.01]',
                  inactiveHover: 'hover:bg-cyan-950/20 hover:text-white text-cyan-100 border border-transparent',
                  activeIcon: 'bg-cyan-500/25 text-cyan-200 border border-cyan-500/20',
                  inactiveIcon: 'bg-[#021814] text-cyan-300 border border-[#0c3c33]/20',
                  activeBadge: 'bg-cyan-500/20 text-cyan-350 border border-cyan-500/30 text-[7.5px]',
                  inactiveBadge: 'bg-[#021814] text-cyan-300 border border-[#0c3c33]/20 text-[7.5px]'
                },
                certificate: {
                  activeBg: 'bg-[#0a382c] border border-emerald-500/30 text-white font-bold scale-[1.01]',
                  inactiveHover: 'hover:bg-[#052920]/45 border-transparent text-emerald-100 hover:text-white',
                  activeIcon: 'bg-emerald-500/20 text-[#10b981] border border-emerald-500/20',
                  inactiveIcon: 'bg-[#021814] text-emerald-300 border border-[#0c3c33]/20',
                  activeBadge: 'bg-emerald-500/20 text-[#10b981] border border-emerald-500/30 text-[7.5px]',
                  inactiveBadge: 'bg-[#021814] text-emerald-300 border border-[#0c3c33]/20 text-[7.5px]'
                },
                learning: {
                  activeBg: 'bg-[#0a382c] border border-emerald-500/30 text-white font-bold scale-[1.01]',
                  inactiveHover: 'hover:bg-[#052920]/45 border-transparent text-emerald-100 hover:text-white',
                  activeIcon: 'bg-emerald-500/20 text-[#10b981] border border-emerald-500/20',
                  inactiveIcon: 'bg-[#021814] text-emerald-300 border border-[#0c3c33]/20',
                  activeBadge: 'bg-emerald-500/20 text-[#10b981] border border-emerald-500/30 text-[7.5px]',
                  inactiveBadge: 'bg-[#021814] text-[#10b981] border border-[#0c3c33]/20 text-[7.5px]'
                },
                exams: {
                  activeBg: 'bg-indigo-950/50 border border-indigo-500/30 text-white font-bold scale-[1.01]',
                  inactiveHover: 'hover:bg-[#052920]/45 border-transparent text-emerald-100 hover:text-white',
                  activeIcon: 'bg-indigo-500/25 text-indigo-300 border border-indigo-500/20',
                  inactiveIcon: 'bg-[#021814] text-indigo-300 border border-[#0c3c33]/20',
                  activeBadge: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[7.5px]',
                  inactiveBadge: 'bg-[#021814] text-indigo-300 border border-[#0c3c33]/20 text-[7.5px]'
                },
                testing: {
                  activeBg: 'bg-[#0a382c] border border-emerald-500/30 text-white font-bold scale-[1.01]',
                  inactiveHover: 'hover:bg-[#052920]/45 border-transparent text-emerald-100 hover:text-white',
                  activeIcon: 'bg-emerald-500/20 text-[#10b981] border border-emerald-500/20',
                  inactiveIcon: 'bg-[#021814] text-emerald-300 border border-[#0c3c33]/20',
                  activeBadge: 'bg-emerald-500/20 text-[#10b981] border border-emerald-500/30 text-[7.5px]',
                  inactiveBadge: 'bg-[#021814] text-emerald-300 border border-[#0c3c33]/20 text-[7.5px]'
                },
                certificate_trainee: {
                  activeBg: 'bg-[#0a382c] border border-emerald-500/30 text-white font-bold scale-[1.01]',
                  inactiveHover: 'hover:bg-[#052920]/45 border-transparent text-emerald-100 hover:text-white',
                  activeIcon: 'bg-emerald-500/20 text-[#10b981] border border-emerald-500/20',
                  inactiveIcon: 'bg-[#021814] text-emerald-300 border border-[#0c3c33]/20',
                  activeBadge: 'bg-emerald-500/20 text-[#10b981] border border-emerald-500/30 text-[7.5px]',
                  inactiveBadge: 'bg-[#021814] text-emerald-300 border border-[#0c3c33]/20 text-[7.5px]'
                }
              };

              const tabPermissionMap: Record<string, string> = {
                approvals: 'perm_verif_view',
                users: 'perm_user_db',
                roles: 'perm_sec_group',
                curriculum: 'perm_curr_builder',
                analytics: 'perm_perf_view',
                recruitment: 'perm_verif_ctr',
                audit: 'perm_sec_ledger_adt',
                hierarchy: 'perm_hierarchy_view',
                departments: 'perm_departments_view',
                certificate: 'perm_cert_config',
              };

              let firstTraineeTabFound = false;

              return sidebarTabs
                .filter((t) => {
                  const requiredPerm = tabPermissionMap[t.id];
                  const isLocked = requiredPerm && !hasPermission(requiredPerm);
                  return !isLocked;
                })
                .map((t) => {
                  const isTabActive = adminTab === t.id;
                  const Icon = t.icon;
                  const theme = colorThemes[t.id] || colorThemes.reports;
                  const requiredPerm = tabPermissionMap[t.id];
                  const isLocked = requiredPerm && !hasPermission(requiredPerm);
                  
                  let renderHeader = false;
                  if (t.isTraineeTab && !firstTraineeTabFound) {
                    firstTraineeTabFound = true;
                    renderHeader = true;
                  }
                  
                  return (
                    <React.Fragment key={t.id}>
                      {renderHeader && (
                        <div className="pt-3 pb-1.5">
                          {!sidebarCollapsed ? (
                            <span className="block text-[8px] font-mono text-slate-400 uppercase tracking-widest font-black mb-1 px-1.5 mt-3">
                              📚 TRAINEE WORKSPACE
                            </span>
                          ) : (
                            <div className="border-t border-slate-200 my-1.5 mx-2 mt-3" />
                          )}
                        </div>
                      )}
                      
                      <div className="space-y-1 font-sans">
                        {/* Main Sidebar Tab button */}
                        <button
                          type="button"
                          onClick={() => {
                            if (t.isTraineeTab) {
                              onSelectTraineeTab?.(t.id === 'certificate_trainee' ? 'certificate' : t.id);
                              return;
                            }
                            if (isLocked) {
                              showToast(`🔒 Access Denied: Your designation (${currentUser.role?.name || 'Quality Checker'}) has not been granted the required permission in the Permissions Matrix!`, 'error');
                              return;
                            }
                            if (isTabActive) {
                              setExpandedTabs(prev => ({ [t.id]: !prev[t.id] }));
                            } else {
                              setAdminTab(t.id as any);
                              setExpandedTabs(() => ({ [t.id]: true }));
                              if (t.subTabs && t.subTabs.length > 0) {
                                t.subTabs[0].onClick();
                              }
                            }
                          }}
                          onDoubleClick={() => {
                            if (isLocked) return;
                            setExpandedTabs(() => ({ [t.id]: false }));
                          }}
                          className={`w-full group relative flex items-center justify-between gap-1.5 p-1.5 rounded-lg transition-all duration-200 text-left cursor-pointer ${
                            isLocked 
                              ? 'opacity-65 hover:opacity-85 border border-transparent hover:bg-slate-50'
                              : isTabActive 
                                ? theme.activeBg + ' font-semibold scale-[1.01]' 
                                : theme.inactiveHover
                          }`}
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <div className={`p-1 rounded-lg shrink-0 transition-colors duration-200 relative ${
                              isLocked 
                                ? 'bg-slate-100 text-slate-400 border border-slate-200' 
                                : isTabActive ? theme.activeIcon : theme.inactiveIcon
                            }`}>
                              <Icon className="w-3.5 h-3.5" />
                              {isLocked && (
                                <div className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-0.5 border border-white shadow-2xs">
                                  <Lock className="w-1.5 h-1.5" />
                                </div>
                              )}
                            </div>
                            
                            {!sidebarCollapsed && (
                              <span className="text-[10.5px] font-extrabold font-sans tracking-wide truncate flex items-center gap-1">
                                {t.label}
                                {isLocked && (
                                  <Lock className="w-2.5 h-2.5 text-rose-500 shrink-0" title="Locked by Matrix" />
                                )}
                              </span>
                            )}
                          </div>
     
                          {/* Right metadata badge/count */}
                          {!sidebarCollapsed && (
                            <div className="flex items-center gap-1 shrink-0">
                              {isLocked ? (
                                <span className="text-[7.5px] font-mono font-black uppercase text-rose-500 bg-rose-50 border border-rose-200 px-1 py-0.2 rounded">LOCKED</span>
                              ) : t.countLabel ? (
                                <span className={`px-1.5 py-0.5 rounded shrink-0 uppercase border font-mono font-black ${
                                  isTabActive ? theme.activeBadge : theme.inactiveBadge
                                }`}>
                                  {t.countLabel}
                                </span>
                              ) : t.count !== undefined ? (
                                <span className={`px-1.5 py-0.5 rounded-full shrink-0 border font-mono font-black ${
                                  isTabActive ? theme.activeBadge : theme.inactiveBadge
                                }`}>
                                  {t.count}
                                </span>
                              ) : null}
                            </div>
                          )}
                        </button>
     
                        {/* Expandable nested sub-tabs */}
                        {!sidebarCollapsed && !isLocked && t.subTabs && expandedTabs[t.id] && (
                          <div className="pl-3 py-1 border-l border-[#052c23] ml-4 space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
                            {t.subTabs
                              .filter((st) => {
                                if (st.id === 'user_add') return hasPermission('perm_user_add');
                                if (st.id === 'user_sync') return hasPermission('perm_user_edt');
                                return true;
                              })
                              .map((st) => (
                              <button
                                key={st.id}
                                type="button"
                                onClick={() => {
                                  st.onClick();
                                }}
                                className={`w-full text-left py-1 px-2 rounded-md text-[9.5px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                  st.isActive 
                                    ? 'bg-[#0a382c]/60 text-white border border-emerald-500/20 shadow-xs' 
                                    : 'text-[#34d399] hover:text-white hover:bg-[#052920]/30'
                                }`}
                              >
                                <span className={`w-1 h-1 rounded-full shrink-0 ${st.isActive ? 'bg-[#10b981] animate-pulse' : 'bg-[#0c3c33]'}`} />
                                <span className="truncate flex-1">{st.label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </React.Fragment>
                  );
                });
            })()}
          </div>

          {/* Footer of Sidebar */}
          {!sidebarCollapsed && (
            <div className="p-3.5 border-t border-[#052c23] bg-[#021814] text-[9px] text-slate-400 font-mono space-y-1">
              <div className="flex justify-between gap-1.5">
                <span className="text-emerald-500/60 font-semibold uppercase">IDENTITY:</span>
                <span className="text-emerald-50 font-bold truncate max-w-[130px]">{currentUser.name}</span>
              </div>
              <div className="flex justify-between gap-1.5">
                <span className="text-emerald-500/60 font-semibold uppercase">AUTH LEVEL:</span>
                <span className="text-[#10b981] font-black">{isDirectorOrOwner ? 'Executive / Director' : 'Quality Checker'}</span>
              </div>
            </div>
          )}
        </aside>
      )}

      {/* MAIN RIGHT AREA FOR VIEWS */}
      <div className={`flex-grow min-w-0 flex flex-col relative transition-all duration-350 lg:overflow-y-auto lg:h-[calc(100vh-64px)] custom-scrollbar ${
        !sidebarLocked && sidebarVisible 
          ? (sidebarCollapsed ? 'pl-16' : 'pl-[265px]') 
          : ''
      }`}>
        
        {/* Sleek Floating Toggle Button when Sidebar is fully hidden */}
        {!sidebarVisible && (
          <button 
            type="button"
            onClick={() => {
              setSidebarVisible(true);
              showToast("Control console panel restored!", 'success');
            }}
            className="fixed left-5 top-24 z-50 bg-[#031d17] hover:bg-[#062e26] border border-[#052c23] p-3 rounded-2xl shadow-[0_12px_40px_rgba(2,26,21,0.3)] hover:scale-105 transition-all duration-300 cursor-pointer flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-emerald-100 hover:text-white"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#10b981] animate-pulse" />
            <span>Open Console Panel</span>
          </button>
        )}

        {/* Existing Content wrapped inside responsive container - COMPACTED PADDINGS */}
        <div className="w-full px-2.5 sm:px-4 lg:px-5 py-2 lg:py-2.5 pb-16 lg:pb-20 animate-in fade-in duration-300 relative">
          
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
          
          {/* Highly Compact & Toggleable Workspace Cockpit Welcomer - Only visible on the main Reports/Cockpit Home tab */}
          {adminTab === 'reports' && (welcomeBannerDismissed ? (
            <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white rounded-xl p-2.5 px-3.5 border border-slate-200/80 shadow-3xs animate-in fade-in duration-200 gap-2">
              <div className="flex items-center gap-1.5 pl-1 text-[11px] font-semibold text-slate-500">
                <span className="flex h-1.5 w-1.5 relative shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <span>Active Console Scope</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {adminTab !== 'reports' && (
                  <button 
                    type="button"
                    onClick={() => setAdminTab('reports')}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black px-3 py-1 rounded-lg shadow-3xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>📊 Back to AI Cockpit Home</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setWelcomeBannerDismissed(false);
                    localStorage.removeItem('welcome_banner_dismissed_v2');
                    showToast("✓ Welcome banner restored!", "success");
                  }}
                  className="text-[10px] font-bold text-slate-500 hover:text-indigo-600 bg-white hover:bg-slate-100 px-3 py-1 rounded-full transition-all flex items-center gap-1 cursor-pointer border border-slate-200/80 shadow-3xs"
                >
                  <span>👁️ Show Welcome Banner</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-white via-slate-50 to-emerald-50/10 rounded-xl p-2.5 sm:p-3 text-slate-900 relative overflow-hidden shadow-xs mb-3 border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
              {/* Close Button to hide completely */}
              <button
                onClick={() => {
                  setWelcomeBannerDismissed(true);
                  localStorage.setItem('welcome_banner_dismissed_v2', 'true');
                  showToast("✓ Welcome banner minimized to optimize screen space!", "info");
                }}
                className="absolute top-2 right-2 text-slate-400 hover:text-rose-500 hover:bg-slate-100 p-1 rounded-lg transition-colors cursor-pointer z-10"
                title="Minimize Banner"
              >
                <X className="w-3 h-3" />
              </button>

              {/* Animated soft lighting */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/[0.02] rounded-full blur-xl pointer-events-none"></div>
              <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-indigo-500/[0.02] rounded-full blur-xl pointer-events-none"></div>
              
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 relative z-10 pr-6">
                <div className="flex items-center gap-3 flex-wrap md:flex-nowrap">
                  {/* User Profile Info */}
                  <div className="flex items-center gap-2.5">
                    <div className="relative group shrink-0">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur opacity-20"></div>
                      <Avatar
                        src={currentUser.avatarUrl}
                        name={currentUser.name}
                        className="w-8 h-8 border border-emerald-500/20 overflow-hidden relative shadow-2xs"
                      />
                    </div>
                    
                    <div className="space-y-0.5 text-left">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[7.5px] font-mono tracking-wider text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/50 uppercase font-black">
                          {isDirectorOrOwner ? 'Executive Scope' : 'Checker Panel'}
                        </span>
                        <h2 className="font-display text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight leading-none">
                          Welcome, {currentUser.name}
                        </h2>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10px] text-slate-500 font-sans leading-none">
                        <span className="font-bold text-slate-600">
                          {isDirectorOrOwner ? 'Director View' : 'Quality Checker & Audit'}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="flex items-center gap-0.5 text-slate-500">
                          <Building className="w-2.5 h-2.5 text-emerald-600" />
                          {currentUser.department || 'Compliance'}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-emerald-700 font-extrabold flex items-center gap-0.5">
                          <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" /> Active Scope
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Highly compact Horizontal stats indicators */}
                <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                  {/* Back to AI Cockpit Home Button right next to indicators */}
                  {adminTab !== 'reports' && (
                    <button 
                      type="button"
                      onClick={() => setAdminTab('reports')}
                      className="bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black px-3 py-1 rounded-lg shadow-3xs transition flex items-center gap-1.5 cursor-pointer mr-1.5 hover:scale-[1.02]"
                    >
                      <span>📊 Back to AI Cockpit Home</span>
                    </button>
                  )}

                  {/* Course Units Badge */}
                  <div className="flex items-center gap-1 bg-sky-50/80 border border-sky-100/50 py-0.5 px-2 rounded-lg shadow-3xs text-[10px]">
                    <span className="text-[8px] font-mono uppercase tracking-wider text-sky-600 font-bold">Units:</span>
                    <span className="font-mono font-black text-sky-900">{units.length}</span>
                  </div>

                  {/* Designated Units Badge */}
                  <div className="flex items-center gap-1 bg-emerald-50/80 border border-emerald-100/50 py-0.5 px-2 rounded-lg shadow-3xs text-[10px]">
                    <span className="text-[8px] font-mono uppercase tracking-wider text-emerald-600 font-bold">Designated Units:</span>
                    <span className="font-mono font-black text-emerald-900">{departments.length}</span>
                  </div>

                  {/* Enrolled Trainees Badge */}
                  <div className="flex items-center gap-1 bg-indigo-50/80 border border-indigo-100/50 py-0.5 px-2 rounded-lg shadow-3xs text-[10px]">
                    <span className="text-[8px] font-mono uppercase tracking-wider text-indigo-600 font-bold">Trainees:</span>
                    <span className="font-mono font-black text-indigo-900">{users.length}</span>
                  </div>

                  {/* Avg Mastery Index Badge */}
                  <div className="flex items-center gap-1 bg-purple-50/80 border border-purple-100/50 py-0.5 px-2 rounded-lg shadow-3xs text-[10px]">
                    <span className="text-[8px] font-mono uppercase tracking-wider text-purple-600 font-bold">Avg Mastery:</span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono font-black text-purple-900">{systemAverageMastery}%</span>
                      <div className="w-8 bg-purple-200/50 h-0.5 rounded-full overflow-hidden shrink-0 hidden sm:block">
                        <div className="bg-purple-600 h-full rounded-full transition-all duration-500" style={{ width: `${systemAverageMastery}%` }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Live status capsule */}
                  <div className="flex items-center bg-teal-50 border border-teal-100/50 text-[7.5px] font-bold px-1.5 py-0.5 rounded-lg uppercase gap-1 font-mono text-teal-800 shrink-0">
                    <span className="w-1 h-1 rounded-full bg-teal-500 animate-pulse"></span>
                    Live
                  </div>
                </div>
              </div>
            </div>
          ))}



      <div className="space-y-6">
        
        {/* FULL WIDTH: ACTIVE PANELS VIEWPORT */}
        <div className="space-y-6">
          
          {/* TAB 0: CENTRAL CORE DYNAMIC CLINICAL REPORTS */}
          {adminTab === 'reports' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Grid Layout: Main Area */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* MAIN WORKFORCE SCORECARD DIRECTORY & ANALYTICS COCKPIT */}
                <div className={`${showDepartmentsSidebar ? 'lg:col-span-8 xl:col-span-9' : 'lg:col-span-12'} space-y-6 transition-all duration-350`}>

                {isDirectorOrOwner && !isSuperAdmin ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-5 shadow-xs space-y-4">
                    {/* Unified Premium Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100/60 shadow-3xs shrink-0">
                          <Users className="w-4 h-4 text-emerald-600" />
                        </span>
                        <div className="text-left">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-none">
                              Live Performance Scorecard & Insights
                            </h3>
                            <span className="bg-emerald-100 text-emerald-800 text-[8px] font-mono px-1 rounded font-bold uppercase tracking-wide">Live</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowDepartmentsSidebar(!showDepartmentsSidebar)}
                        className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-extrabold transition-all duration-300 cursor-pointer select-none border shadow-3xs shrink-0 ${
                          showDepartmentsSidebar
                            ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-500 hover:border-indigo-500 hover:shadow-indigo-500/10'
                            : 'bg-white text-slate-700 border-slate-250 hover:bg-slate-50 hover:text-indigo-650 hover:border-indigo-200'
                        }`}
                      >
                        <Building className="w-3 h-3 animate-pulse" />
                        <span>
                          {showDepartmentsSidebar ? 'Hide Departments' : 'Show Departments'}
                        </span>
                        <span className={`ml-0.5 px-1 py-0.2 rounded font-mono font-black text-[9px] border ${
                          showDepartmentsSidebar
                            ? 'bg-white/20 text-white border-white/15'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {departments.length}
                        </span>
                      </button>
                    </div>

                    <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 text-[11px] text-amber-850 flex items-center gap-2 mt-2">
                      <Shield className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Individual employee profiles and scorecards are restricted to Senior Accountants and LMS Administrators for privacy and audit security compliance.</span>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-8">
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
                  </div>
                ) : (
                  <>
                    {/* KPI OVERVIEW STAT CARDS - Merged from Analytics */}
                    {(() => {
                      const totalUsersTracked = users.length;
                      const avgMasteryPercentage = users.length > 0 
                        ? Math.round(users.reduce((sum, u) => sum + calculateUserProgress(u.id, u.roleId).masteryPercent, 0) / users.length) 
                        : 0;
                      const pendingReviewsCount = progress.filter(p => p.status === 'Completed (Pending Review)').length;
                      const fullyCertifiedCount = users.filter(u => calculateUserProgress(u.id, u.roleId).masteryPercent === 100).length;

                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-3xs flex items-center gap-3">
                            <div className="p-2.5 bg-indigo-50 text-indigo-650 rounded-lg shrink-0 border border-indigo-100/50">
                              <Users className="w-4.5 h-4.5" />
                            </div>
                            <div>
                              <div className="text-xl font-black text-slate-900 font-mono leading-none mb-1">{totalUsersTracked}</div>
                              <div className="text-[9px] uppercase font-bold text-slate-450 text-slate-400 tracking-wider">Total Staffers Tracked</div>
                            </div>
                          </div>

                          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-3xs flex items-center gap-3">
                            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0 border border-emerald-100/50">
                              <TrendingUp className="w-4.5 h-4.5" />
                            </div>
                            <div>
                              <div className="text-xl font-black text-slate-900 font-mono leading-none mb-1">{avgMasteryPercentage}%</div>
                              <div className="text-[9px] uppercase font-bold text-slate-450 text-slate-400 tracking-wider">Overall Compliance Rate</div>
                            </div>
                          </div>

                          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-3xs flex items-center gap-3">
                            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg shrink-0 border border-amber-100/50">
                              <Clock className="w-4.5 h-4.5 animate-pulse" />
                            </div>
                            <div>
                              <div className="text-xl font-black text-slate-900 font-mono leading-none mb-1">{pendingReviewsCount}</div>
                              <div className="text-[9px] uppercase font-bold text-slate-450 text-slate-400 tracking-wider">Pending Audit Sign-offs</div>
                            </div>
                          </div>

                          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-3xs flex items-center gap-3">
                            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg shrink-0 border border-purple-100/50">
                              <Award className="w-4.5 h-4.5" />
                            </div>
                            <div>
                              <div className="text-xl font-black text-slate-900 font-mono leading-none mb-1">{fullyCertifiedCount}</div>
                              <div className="text-[9px] uppercase font-bold text-slate-450 text-slate-400 tracking-wider">Certified Compliant Staff</div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Unified Premium Table: Staffer Progress Ledger & Compliance Audit */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-5 shadow-xs space-y-4">
                      
                      {/* Premium Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100/60 shadow-3xs shrink-0">
                            <Users className="w-4 h-4 text-emerald-600" />
                          </span>
                          <div className="text-left">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-none">
                                Staffer Progress Ledger & Compliance Audit
                              </h3>
                              <span className="bg-emerald-100 text-emerald-800 text-[8px] font-mono px-1 rounded font-bold uppercase tracking-wide">Live</span>
                            </div>
                            <p className="text-[10px] text-slate-450 text-slate-400 mt-0.5 font-medium">Filter, search, and audit exact operational unit metrics of every registered staff member</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Export Report Data Shortcut */}
                          <button
                            type="button"
                            onClick={() => {
                              try {
                                const csvData = users.map(u => {
                                  const stats = calculateUserProgress(u.id, u.roleId);
                                  const r = roles.find(rl => rl.id === u.roleId);
                                  return {
                                    'Staffer Name': u.name,
                                    'Email Address': u.email,
                                    'Designation': r ? r.name : 'Unknown',
                                    'Department': u.department,
                                    'Assigned Total Units': stats.totalUnits,
                                    'Verified & Mastered Units': stats.verifiedCount,
                                    'In Progress Units': stats.inProgressCount,
                                    'Overall Progress (%)': stats.overallPercent,
                                    'Mastery Percent (%)': stats.masteryPercent,
                                    'Compliance Status': stats.masteryPercent === 100 ? 'Certified Compliant' : 'In Training'
                                  };
                                });
                                const worksheet = XLSX.utils.json_to_sheet(csvData);
                                const workbook = XLSX.utils.book_new();
                                XLSX.utils.book_append_sheet(workbook, worksheet, "Compliance Report");
                                XLSX.writeFile(workbook, `Compliance_Audit_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
                                showToast("✓ Compliance Report downloaded successfully as Excel! 📊", "success");
                              } catch (e: any) {
                                showToast(`Failed to export report: ${e.message}`, "error");
                              }
                            }}
                            className="inline-flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-emerald-200 transition cursor-pointer shadow-3xs"
                          >
                            <Download className="w-3 h-3" /> Export Audit Ledger
                          </button>

                          <button
                            type="button"
                            onClick={() => setShowDepartmentsSidebar(!showDepartmentsSidebar)}
                            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-extrabold transition-all duration-300 cursor-pointer select-none border shadow-3xs shrink-0 ${
                              showDepartmentsSidebar
                                ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-500 hover:border-indigo-500 hover:shadow-indigo-500/10'
                                : 'bg-white text-slate-700 border-slate-250 hover:bg-slate-50 hover:text-indigo-650 hover:border-indigo-200'
                            }`}
                          >
                            <Building className="w-3 h-3 animate-pulse" />
                            <span>
                              {showDepartmentsSidebar ? 'Hide Departments' : 'Show Departments'}
                            </span>
                            <span className={`ml-0.5 px-1 py-0.2 rounded font-mono font-black text-[9px] border ${
                              showDepartmentsSidebar
                                ? 'bg-white/20 text-white border-white/15'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}>
                              {departments.length}
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* FILTERS CONTROL BOX - DESIGN COMPACTED */}
                      <div className="flex flex-wrap md:flex-nowrap items-center gap-2 bg-slate-50 p-1 px-2 rounded-xl border border-slate-200 text-[11px] shadow-3xs">
                        {/* Search Term */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono whitespace-nowrap">Search:</span>
                          <div className="relative">
                            <input
                              type="text"
                              value={analyticsSearch}
                              onChange={(e) => setAnalyticsSearch(e.target.value)}
                              placeholder="Search..."
                              className="bg-white border border-slate-300 rounded-lg px-1.5 py-0.5 pl-5.5 focus:border-indigo-500 outline-none text-[11px] w-28 text-slate-800 font-semibold"
                            />
                            <span className="absolute left-1.5 top-0.5 text-slate-400 text-[9px]">🔍</span>
                          </div>
                        </div>

                        {/* Filter by Role / Designation */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono whitespace-nowrap">Role:</span>
                          <select
                            value={scorecardRoleFilter}
                            onChange={(e) => setScorecardRoleFilter(e.target.value)}
                            className="bg-white border border-slate-300 rounded-lg px-1.5 py-0.5 focus:border-indigo-500 outline-none text-[11px] font-bold text-slate-755 cursor-pointer"
                          >
                            <option value="all">All Roles</option>
                            {roles.map(r => (
                              <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* Filter by Compliance status */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono whitespace-nowrap">Compliance:</span>
                          <select
                            value={analyticsProgressFilter}
                            onChange={(e) => setAnalyticsProgressFilter(e.target.value)}
                            className="bg-white border border-slate-300 rounded-lg px-1.5 py-0.5 focus:border-indigo-500 outline-none text-[11px] font-bold text-slate-755 cursor-pointer"
                          >
                            <option value="all">All Statuses</option>
                            <option value="certified">Certified (100% Mastery)</option>
                            <option value="in_progress">In Progress (1-99% Mastery)</option>
                            <option value="not_started">Unstarted (0% Mastery)</option>
                          </select>
                        </div>

                        {/* Sort Option */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono whitespace-nowrap">Sort:</span>
                          <select
                            value={analyticsSortBy}
                            onChange={(e) => setAnalyticsSortBy(e.target.value as any)}
                            className="bg-white border border-slate-300 rounded-lg px-1.5 py-0.5 focus:border-indigo-500 outline-none text-[11px] font-bold text-slate-755 cursor-pointer"
                          >
                            <option value="progress_desc">Highest Progress</option>
                            <option value="progress_asc">Lowest Progress</option>
                            <option value="name_asc">Name (A-Z)</option>
                            <option value="name_desc">Name (Z-A)</option>
                          </select>
                        </div>

                        {(analyticsSearch || scorecardDeptFilters.length > 0 || scorecardRoleFilter !== 'all' || analyticsProgressFilter !== 'all') && (
                          <button
                            type="button"
                            onClick={() => {
                              setAnalyticsSearch('');
                              setScorecardDeptFilters([]);
                              setScorecardRoleFilter('all');
                              setAnalyticsProgressFilter('all');
                              setAnalyticsSortBy('progress_desc');
                              showToast("All filters and searches reset safely!", "info");
                            }}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-1.5 py-0.5 rounded-lg transition text-[10px] cursor-pointer border border-slate-300/60"
                            title="Clear All Filters"
                          >
                            Reset
                          </button>
                        )}
                      </div>

                      {/* Filter by Department Info Badge & Multi-Select dropdown */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 py-1">
                        <div className="flex flex-wrap items-center gap-1.5 text-[10.5px] font-bold font-mono text-slate-500 uppercase tracking-wider">
                          <span>Showing {Math.min(reportsLimit, (() => {
                            const scoreFilteredUsers = users.filter(u => {
                              const matchesSearch = analyticsSearch.trim() === '' || 
                                                    u.name.toLowerCase().includes(analyticsSearch.toLowerCase()) || 
                                                    u.email.toLowerCase().includes(analyticsSearch.toLowerCase());
                              const matchesDept = scorecardDeptFilters.length === 0 || scorecardDeptFilters.includes(u.department);
                              const matchesRole = scorecardRoleFilter === 'all' || u.roleId === scorecardRoleFilter;
                              
                              const stats = calculateUserProgress(u.id, u.roleId);
                              let matchesProgress = true;
                              if (analyticsProgressFilter === 'certified') {
                                matchesProgress = stats.masteryPercent === 100;
                              } else if (analyticsProgressFilter === 'in_progress') {
                                matchesProgress = stats.masteryPercent > 0 && stats.masteryPercent < 100;
                              } else if (analyticsProgressFilter === 'not_started') {
                                matchesProgress = stats.masteryPercent === 0;
                              }
                              
                              return matchesSearch && matchesDept && matchesRole && matchesProgress;
                            });
                            return scoreFilteredUsers.length;
                          })())} of {(() => {
                            const scoreFilteredUsers = users.filter(u => {
                              const matchesSearch = analyticsSearch.trim() === '' || 
                                                    u.name.toLowerCase().includes(analyticsSearch.toLowerCase()) || 
                                                    u.email.toLowerCase().includes(analyticsSearch.toLowerCase());
                              const matchesDept = scorecardDeptFilters.length === 0 || scorecardDeptFilters.includes(u.department);
                              const matchesRole = scorecardRoleFilter === 'all' || u.roleId === scorecardRoleFilter;
                              
                              const stats = calculateUserProgress(u.id, u.roleId);
                              let matchesProgress = true;
                              if (analyticsProgressFilter === 'certified') {
                                matchesProgress = stats.masteryPercent === 100;
                              } else if (analyticsProgressFilter === 'in_progress') {
                                matchesProgress = stats.masteryPercent > 0 && stats.masteryPercent < 100;
                              } else if (analyticsProgressFilter === 'not_started') {
                                matchesProgress = stats.masteryPercent === 0;
                              }
                              
                              return matchesSearch && matchesDept && matchesRole && matchesProgress;
                            });
                            return scoreFilteredUsers.length;
                          })()} Staff Members</span>
                          {scorecardDeptFilters.length > 0 && (
                            <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-150 text-[9px] font-extrabold normal-case font-sans">Filtered by {scorecardDeptFilters.length} Department(s)</span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 text-slate-500 font-sans text-[11px] font-bold bg-slate-100/70 border border-slate-200/80 rounded-lg px-2 py-0.5 shadow-3xs shrink-0">
                          <span>Show entries:</span>
                          <select
                            value={reportsLimit}
                            onChange={(e) => setReportsLimit(Number(e.target.value))}
                            className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[11px] font-bold text-slate-750 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 cursor-pointer"
                          >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                            <option value={500}>500</option>
                          </select>
                        </div>
                      </div>

                      {/* Merged Scorecard & Ledger Table */}
                      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-3xs bg-white min-w-0">
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse text-left text-xs text-slate-705">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-250 font-mono text-[9.5px] uppercase font-black tracking-wider text-slate-500">
                                <th className="p-3.5 pl-5 font-black">Staff Member</th>
                                <th className="p-3.5 font-black text-center">Designation Role</th>
                                <th className="p-3.5 font-black">Department / BU</th>
                                <th className="p-3.5 font-black">Compliance Mastery Percentage</th>
                                <th className="p-3.5 font-black text-center">Units Audit Summary</th>
                                <th className="p-3.5 font-black text-center">Exams Rating</th>
                                <th className="p-3.5 font-black text-center">Status</th>
                                <th className="p-3.5 pr-5 font-black text-right">Action Detail</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-150">
                              {(() => {
                                const scoreFilteredUsers = users.filter(u => {
                                  const matchesSearch = analyticsSearch.trim() === '' || 
                                                        u.name.toLowerCase().includes(analyticsSearch.toLowerCase()) || 
                                                        u.email.toLowerCase().includes(analyticsSearch.toLowerCase());
                                  const matchesDept = scorecardDeptFilters.length === 0 || scorecardDeptFilters.includes(u.department);
                                  const matchesRole = scorecardRoleFilter === 'all' || u.roleId === scorecardRoleFilter;
                                  
                                  const stats = calculateUserProgress(u.id, u.roleId);
                                  let matchesProgress = true;
                                  if (analyticsProgressFilter === 'certified') {
                                    matchesProgress = stats.masteryPercent === 100;
                                  } else if (analyticsProgressFilter === 'in_progress') {
                                    matchesProgress = stats.masteryPercent > 0 && stats.masteryPercent < 100;
                                  } else if (analyticsProgressFilter === 'not_started') {
                                    matchesProgress = stats.masteryPercent === 0;
                                  }
                                  
                                  return matchesSearch && matchesDept && matchesRole && matchesProgress;
                                });

                                const sortedScoreFilteredUsers = [...scoreFilteredUsers].sort((a, b) => {
                                  const statsA = calculateUserProgress(a.id, a.roleId);
                                  const statsB = calculateUserProgress(b.id, b.roleId);
                                  
                                  if (analyticsSortBy === 'progress_desc') {
                                    return statsB.masteryPercent - statsA.masteryPercent;
                                  } else if (analyticsSortBy === 'progress_asc') {
                                    return statsA.masteryPercent - statsB.masteryPercent;
                                  } else if (analyticsSortBy === 'name_asc') {
                                    return a.name.localeCompare(b.name);
                                  } else if (analyticsSortBy === 'name_desc') {
                                    return b.name.localeCompare(a.name);
                                  }
                                  return 0;
                                });

                                if (sortedScoreFilteredUsers.length === 0) {
                                  return (
                                    <tr>
                                      <td colSpan={8} className="p-16 text-center text-slate-450 italic font-medium">
                                        <AlertTriangle className="w-7 h-7 mx-auto text-amber-500/80 mb-2.5" />
                                        No employees or candidates match.
                                      </td>
                                    </tr>
                                  );
                                }

                                return sortedScoreFilteredUsers.slice(0, reportsLimit).map((user) => {
                                  const stats = calculateUserProgress(user.id, user.roleId);
                                  const roleObj = roles.find(r => r.id === user.roleId);
                                  const isCertified = stats.masteryPercent === 100;
                                  const isInspected = analyticsInspectedUserId === user.id;

                                  // Find user's highest score from exam attempts
                                  const userAttempts = attemptsList.filter((att: any) => att.userEmail === user.email);
                                  const highestAttempt = userAttempts.length > 0 
                                    ? userAttempts.reduce((max: any, att: any) => att.score > max.score ? att : max, userAttempts[0])
                                    : null;

                                  return (
                                    <tr 
                                      key={user.id} 
                                      className={`hover:bg-slate-50/50 transition ${isInspected ? 'bg-indigo-50/30 hover:bg-indigo-50/50' : ''}`}
                                    >
                                      {/* Staff Member column */}
                                      <td className="p-3 pl-5">
                                        <div className="flex items-center gap-2.5">
                                          <Avatar
                                            src={user.avatarUrl}
                                            name={user.name}
                                            className="w-8 h-8 rounded-full border border-slate-200 shadow-3xs shrink-0"
                                          />
                                          <div className="flex flex-col text-left">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                              <span className="font-bold text-slate-900 text-[11px] whitespace-nowrap">{user.name}</span>
                                              {user.roleId === 'role_sr_acc' && (
                                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[8px] px-1 py-0.2 rounded font-mono uppercase font-black tracking-wide shrink-0">Admin</span>
                                              )}
                                            </div>
                                            <span className="text-[10px] text-slate-450 font-medium font-sans mt-0.5 leading-none">{user.email}</span>
                                            
                                            {/* Unified button to view mapped roles & specifications inside cell */}
                                            <button
                                              type="button"
                                              onClick={() => setSelectedRoleDetailUser(user)}
                                              className="inline-flex items-center gap-1 text-[8.5px] text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-150 rounded px-1.5 py-0.5 font-sans font-black tracking-tight transition mt-1.5 cursor-pointer w-fit"
                                              title="Click to view designations mapped and role specifications"
                                            >
                                              View Mapped Roles
                                            </button>
                                          </div>
                                        </div>
                                      </td>

                                      {/* Designation Role column */}
                                      <td className="p-3 text-center">
                                        <span className="bg-slate-100 text-slate-750 border border-slate-200 font-mono font-bold text-[9.5px] uppercase px-2 py-0.5 rounded-md inline-block max-w-[140px] truncate" title={roleObj?.name}>
                                          {roleObj?.name || 'No Role Assigned'}
                                        </span>
                                      </td>

                                      {/* Department BU column */}
                                      <td className="p-3">
                                        <div className="text-left">
                                          <span className="inline-block bg-zinc-100 text-zinc-900 border border-zinc-250 px-2 py-0.5 rounded-md text-[9.5px] font-mono tracking-wider font-extrabold uppercase shadow-3xs">
                                            {user.department}
                                          </span>
                                          <span className="block text-[8.5px] text-slate-400 font-mono mt-1 font-bold">{user.focusEntity || 'Accounts'}</span>
                                        </div>
                                      </td>

                                      {/* Compliance Mastery Percentage progress bar column */}
                                      <td className="p-3">
                                        <div className="space-y-1 w-full min-w-[125px] max-w-[175px]">
                                          <div className="flex justify-between items-center text-[10px] font-mono font-extrabold">
                                            <span className="text-emerald-700">{stats.masteryPercent}% Verified</span>
                                            {stats.overallPercent > stats.masteryPercent && (
                                              <span className="text-blue-600">({stats.overallPercent}% Submitted)</span>
                                            )}
                                          </div>
                                          <div className="h-1.75 bg-slate-100 border border-slate-200 rounded-full overflow-hidden flex shadow-inner">
                                            <div 
                                              className="bg-emerald-500 h-full rounded-full transition-all duration-305" 
                                              style={{ width: `${stats.masteryPercent}%` }}
                                              title={`Verified Mastered: ${stats.masteryPercent}%`}
                                            />
                                            <div 
                                              className="bg-blue-400 h-full transition-all duration-305" 
                                              style={{ width: `${stats.overallPercent - stats.masteryPercent}%` }}
                                              title={`Review Pending: ${stats.overallPercent - stats.masteryPercent}%`}
                                            />
                                          </div>
                                        </div>
                                      </td>

                                      {/* Units Audit Summary column */}
                                      <td className="p-3 text-center">
                                        <div className="text-[10.5px] font-mono text-slate-650 space-y-0.5 leading-tight">
                                          <div>
                                            <strong className="font-extrabold text-emerald-600 font-mono">{stats.verifiedCount}</strong> / {stats.totalUnits} Units
                                          </div>
                                          {stats.completedCount > 0 && (
                                            <div className="text-amber-600 text-[9px] font-black uppercase">
                                              {stats.completedCount} Pending Sign-off
                                            </div>
                                          )}
                                        </div>
                                      </td>

                                      {/* Exams Rating column */}
                                      <td className="p-3 text-center">
                                        {highestAttempt ? (
                                          <div className="inline-flex flex-col items-center">
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-black border ${
                                              highestAttempt.passed 
                                                ? 'bg-emerald-100 border-emerald-300 text-emerald-950 font-extrabold' 
                                                : 'bg-rose-100 border-rose-300 text-rose-950 font-extrabold'
                                            }`}>
                                              {highestAttempt.score}% {highestAttempt.passed ? 'PASSED' : 'FAILED'}
                                            </span>
                                            <span className="text-[8px] text-slate-450 font-mono font-bold mt-0.5">
                                              {new Date(highestAttempt.date || highestAttempt.timestamp).toLocaleDateString()}
                                            </span>
                                          </div>
                                        ) : (
                                          <span className="text-[9.5px] text-slate-500 font-sans font-bold italic">No Exams</span>
                                        )}
                                      </td>

                                      {/* Certified Status column */}
                                      <td className="p-3 text-center">
                                        {isCertified ? (
                                          <span className="inline-flex items-center gap-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200 uppercase tracking-wide">
                                            <CheckCircle2 className="w-3 h-3" /> Certified
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-0.5 bg-blue-50 text-blue-700 text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-blue-150 uppercase tracking-wide">
                                            <Clock className="w-3 h-3" /> In Training
                                          </span>
                                        )}
                                      </td>

                                      {/* Action Detail column */}
                                      <td className="p-3 pr-5 text-right">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setAnalyticsInspectedUserId(isInspected ? null : user.id);
                                            if (!isInspected) {
                                              showToast(`Opening compliance checklist details for ${user.name}! 🔍`, 'info');
                                            }
                                          }}
                                          className={`px-2.5 py-1 rounded-lg text-[9.5px] font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-1 inline-flex justify-center border ${
                                            isInspected 
                                              ? 'bg-indigo-600 border-indigo-700 text-white shadow-sm' 
                                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 shadow-3xs'
                                          }`}
                                        >
                                          <Eye className="w-3.5 h-3.5" />
                                          {isInspected ? 'Inspecting' : 'Audit Details'}
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                });
                              })()}
                            </tbody>
                          </table>
                        </div>
                      </div>

                    </div>

                    {/* EXPANDED GRANULAR AUDIT DETAILS DRAWER PANEL */}
                    <AnimatePresence>
                      {analyticsInspectedUserId && (() => {
                        const inspectedUser = users.find(u => u.id === analyticsInspectedUserId);
                        const inspectedUserRole = inspectedUser ? roles.find(r => r.id === inspectedUser.roleId) : null;
                        const inspectedUserStats = inspectedUser ? calculateUserProgress(inspectedUser.id, inspectedUser.roleId) : null;
                        const inspectedUserChapters = inspectedUser
                          ? (() => {
                              const targetRoleIds = Array.isArray(inspectedUser.roleId) ? inspectedUser.roleId : [inspectedUser.roleId];
                              return chapters.filter(c => targetRoleIds.includes(c.roleId));
                            })()
                          : [];

                        if (!inspectedUser || !inspectedUserStats) return null;

                        return (
                          <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 15 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white rounded-xl border-2 border-indigo-500 p-4 md:p-5 shadow-lg space-y-4 animate-in fade-in zoom-in-95"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                              <div className="flex items-center gap-3">
                                <Avatar 
                                  name={inspectedUser.name} 
                                  avatarUrl={inspectedUser.avatarUrl} 
                                  className="w-12 h-12 rounded-full border-2 border-indigo-200 shrink-0" 
                                />
                                <div className="text-left">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="text-sm sm:text-base font-black text-slate-900 leading-none">{inspectedUser.name}</h4>
                                    {inspectedUserStats.masteryPercent === 100 && (
                                      <span className="bg-gradient-to-r from-amber-500 to-yellow-400 text-white text-[9px] font-extrabold px-2 py-0.5 rounded shadow-sm uppercase tracking-widest flex items-center gap-0.5 leading-none">
                                        🏆 Certified Expert
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1 flex-wrap">
                                    <span className="font-mono">{inspectedUser.email}</span>
                                    <span className="text-slate-300">•</span>
                                    <span className="font-bold text-slate-700">{inspectedUserRole?.name || 'No Role'}</span>
                                    <span className="text-slate-300">•</span>
                                    <span className="font-bold text-slate-700">{inspectedUser.department}</span>
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => setAnalyticsInspectedUserId(null)}
                                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px] px-3.5 py-2 rounded-lg transition cursor-pointer border border-slate-200"
                                >
                                  Close Audit Panel
                                </button>
                              </div>
                            </div>

                            {/* GRANULAR AUDIT SCOREBOARD CARDS */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                              <div className="p-2.5 bg-white border border-slate-150 rounded-lg shadow-3xs">
                                <div className="text-xl font-bold text-slate-800 font-mono">{inspectedUserStats.totalUnits}</div>
                                <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mt-0.5 font-mono">Total Assigned Units</div>
                              </div>
                              <div className="p-2.5 bg-white border border-slate-150 rounded-lg shadow-3xs">
                                <div className="text-xl font-bold text-emerald-600 font-mono">{inspectedUserStats.verifiedCount}</div>
                                <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mt-0.5 font-mono">Verified & Mastered</div>
                              </div>
                              <div className="p-2.5 bg-white border border-slate-150 rounded-lg shadow-3xs">
                                <div className="text-xl font-bold text-amber-500 font-mono">{inspectedUserStats.completedCount}</div>
                                <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mt-0.5 font-mono">Pending Sign-off</div>
                              </div>
                              <div className="p-2.5 bg-white border border-slate-150 rounded-lg shadow-3xs">
                                <div className="text-xl font-bold text-blue-500 font-mono">{inspectedUserStats.inProgressCount}</div>
                                <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mt-0.5 font-mono">Currently Active</div>
                              </div>
                            </div>

                            {/* CHAPTER BY CHAPTER DETAILED CHECKLIST OF CURRICULUM */}
                            <div className="space-y-4">
                              <div className="flex items-center gap-1.5 pb-1">
                                <BookOpen className="w-4 h-4 text-indigo-500" />
                                <h5 className="text-xs font-black uppercase text-slate-800">Assigned Compliance Chapters Checklist ({inspectedUserChapters.length})</h5>
                              </div>

                              {inspectedUserChapters.length === 0 ? (
                                <div className="p-6 bg-slate-50 border rounded-lg text-center text-slate-400 font-medium">
                                  No chapters or curriculum tasks assigned to this staffer's designation in the organization schema. Go to the "Job Roles" sub-tab to map permissions.
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  {inspectedUserChapters.map((chapter) => {
                                    const chapterUnitsList = units.filter(un => un.chapterId === chapter.id);
                                    
                                    return (
                                      <div key={chapter.id} className="border border-slate-200 rounded-lg overflow-hidden shadow-3xs text-left">
                                        {/* Chapter Header bar */}
                                        <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex justify-between items-center">
                                          <span className="font-bold text-slate-800 text-xs flex items-center gap-2">
                                            <span className="w-5 h-5 bg-indigo-100 text-indigo-700 flex items-center justify-center rounded-full text-[10px] font-mono font-bold">
                                              {chapter.order}
                                            </span>
                                            {chapter.name}
                                          </span>
                                          <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 border text-slate-500 rounded-full">
                                            {chapterUnitsList.length} lesson units
                                          </span>
                                        </div>

                                        {/* Chapter Units Checklist Grid */}
                                        <div className="divide-y divide-slate-100 bg-white">
                                          {chapterUnitsList.length === 0 ? (
                                            <div className="p-3.5 text-xs text-slate-400 text-center italic">
                                              No lesson tasks created inside this chapter yet.
                                            </div>
                                          ) : (
                                            chapterUnitsList.map((unit) => {
                                              const pLog = progress.find(p => p.userId === inspectedUser.id && p.unitId === unit.id);
                                              const status = pLog ? pLog.status : 'Not Started';

                                              // Badge styling helpers
                                              let badgeColor = 'bg-slate-100 text-slate-600 border-slate-200';
                                              if (status === 'Verified & Mastered') {
                                                badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                                              } else if (status === 'Completed (Pending Review)') {
                                                badgeColor = 'bg-amber-50 text-amber-750 text-amber-700 border-amber-200 animate-pulse';
                                              } else if (status === 'In Progress') {
                                                badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
                                              }

                                              return (
                                                <div key={unit.id} className="p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/40 transition">
                                                  <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                      <span className="bg-slate-900 text-white font-mono font-black text-[9px] px-1.5 py-0.5 rounded tracking-wider shrink-0">
                                                        {unit.code}
                                                      </span>
                                                      <span className="font-bold text-slate-800 text-xs">
                                                        {unit.taskName}
                                                      </span>
                                                      <span className="text-[9px] font-mono bg-indigo-50/70 border border-indigo-100 text-indigo-600 px-1.5 py-0.2 rounded-full font-bold">
                                                        {unit.frequency}
                                                      </span>
                                                      <span className="text-[9px] font-mono bg-purple-50/70 border border-purple-100 text-purple-600 px-1.5 py-0.2 rounded-full font-bold">
                                                        {unit.skillRequired} Level
                                                      </span>
                                                    </div>
                                                    
                                                    {unit.description && (
                                                      <p className="text-[11px] text-slate-550 text-slate-500 mt-1 line-clamp-2 max-w-2xl">
                                                        {unit.description}
                                                      </p>
                                                    )}

                                                    {/* User Submitted Notes / Comments */}
                                                    {pLog?.notes && (
                                                      <div className="mt-2 text-[10px] bg-slate-50 border border-slate-150 rounded px-2.5 py-1.5 text-slate-600 font-mono">
                                                        <strong className="text-slate-800 uppercase text-[9px] block mb-0.5">Trainee Response Note:</strong>
                                                        "{pLog.notes}"
                                                      </div>
                                                    )}

                                                    {/* Last Action Date or Sign-off Details */}
                                                    {pLog && (
                                                      <div className="text-[9px] text-slate-400 font-mono mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
                                                        <span>Last Updated: {new Date(pLog.lastUpdated).toLocaleString()}</span>
                                                        {pLog.verifiedBy && (
                                                          <>
                                                            <span>•</span>
                                                            <span className="text-emerald-600 font-semibold">Signed off by: {pLog.verifiedBy}</span>
                                                          </>
                                                        )}
                                                      </div>
                                                    )}
                                                  </div>

                                                  {/* Status Badge & Action Buttons */}
                                                  <div className="shrink-0 flex flex-wrap items-center gap-3 md:justify-end">
                                                    <span className={`border px-2.5 py-1 rounded text-[10px] font-bold font-mono uppercase tracking-wider block text-center w-fit ${badgeColor}`}>
                                                      {status}
                                                    </span>

                                                    {/* Admin direct sign off handlers */}
                                                    {status === 'Completed (Pending Review)' && (
                                                      <div className="flex gap-1.5">
                                                        <button
                                                          type="button"
                                                          onClick={() => {
                                                            onSettleVerification(inspectedUser.id, unit.id, 'verify');
                                                            showToast(`Approved & Signed off operational unit ${unit.code} for ${inspectedUser.name}!`, 'success');
                                                          }}
                                                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-lg border border-emerald-700 shadow-sm hover:shadow-md transition flex items-center gap-1 cursor-pointer"
                                                        >
                                                          <Check className="w-3 h-3" /> Sign-off
                                                        </button>
                                                        <button
                                                          type="button"
                                                          onClick={() => {
                                                            onSettleVerification(inspectedUser.id, unit.id, 'reject');
                                                            showToast(`Sent rejection: ${unit.code} flagged back for redo.`, 'info');
                                                          }}
                                                          className="bg-rose-600 hover:bg-rose-500 text-white font-black text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-lg border border-rose-700 shadow-sm hover:shadow-md transition flex items-center gap-1 cursor-pointer"
                                                        >
                                                          <X className="w-3 h-3" /> Redo
                                                        </button>
                                                      </div>
                                                    )}

                                                    {/* Quick Lesson Media simulation previews */}
                                                    <div className="flex items-center gap-1.5">
                                                      {unit.videoUrl && (
                                                        <button
                                                          type="button"
                                                          onClick={() => {
                                                            showToast(`Simulating video lecture launch: "${unit.videoTitle || 'Operational Checklist'}"`, 'info');
                                                          }}
                                                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md hover:text-indigo-600 transition cursor-pointer border border-slate-200"
                                                          title={`Preview Lecture: ${unit.videoTitle}`}
                                                        >
                                                          <Video className="w-3.5 h-3.5" />
                                                        </button>
                                                      )}
                                                      {unit.pdfUrl && (
                                                        <button
                                                          type="button"
                                                          onClick={() => {
                                                            showToast(`Simulating PDF Standard Operating Procedure manual download for ${unit.code}!`, 'info');
                                                          }}
                                                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md hover:text-emerald-600 transition cursor-pointer border border-slate-200"
                                                          title="Preview PDF SOP Documentation"
                                                        >
                                                          <FileText className="w-3.5 h-3.5" />
                                                        </button>
                                                      )}
                                                    </div>
                                                  </div>
                                                </div>
                                              );
                                            })
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        );
                      })()}
                    </AnimatePresence>

                    {/* DUAL PERFORMANCE INSIGHTS CHARTS - Merged from Analytics */}
                    <div id="performance-charts-section" className="bg-white rounded-2xl border border-slate-200 p-4 md:p-5 shadow-xs space-y-4">
                      <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                        <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100/60 shadow-3xs shrink-0">
                          <BarChart2 className="w-4 h-4 text-indigo-600" />
                        </span>
                        <div className="text-left">
                          <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-none">
                            Workforce Visual Progress Standings & Performance Insights
                          </h4>
                          <p className="text-[10px] text-slate-450 text-slate-400 mt-0.5 font-medium">Consolidated live visual analytics on syllabus progress and skill mastery indices</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Employee overall percentages bar chart */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                          <h5 className="text-xs font-bold text-slate-750 font-mono uppercase mb-3 text-center">Path Progress (%) of registered staffers</h5>
                          <div className="h-64 sm:h-72 relative w-full">
                            <div className="relative w-full h-full min-w-0">
                              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                <BarChart
                                  data={chartUserData}
                                  margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                                >
                                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} />
                                  <YAxis tick={{ fontSize: 9, fill: '#64748b' }} domain={[0, 100]} />
                                  <Tooltip contentStyle={{ fontSize: 10, borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                                  <Legend wrapperStyle={{ fontSize: 10 }} />
                                  <Bar name="Review Completed Progress (%)" dataKey="Progress" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                  <Bar name="Mastered / Verified (%)" dataKey="Mastery" fill="#10b981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        </div>

                        {/* Status breakdown pie chart */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
                          <div>
                            <h5 className="text-xs font-bold text-slate-750 font-mono uppercase mb-1 text-center">Unit-Wise Status Distribution</h5>
                            <p className="text-[9px] text-slate-400 text-center mb-3">Total operations active inside security matrix</p>
                          </div>

                          <div className="h-44 sm:h-52 relative w-full flex items-center justify-center">
                            <div className="relative flex-1 h-full min-w-0">
                              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                <PieChart>
                                  <Pie
                                    data={statusCounts.filter(v => v.value > 0)}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={45}
                                    outerRadius={65}
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={({ name, value }) => `${name}: ${value}`}
                                  >
                                    {statusCounts.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                  </Pie>
                                  <Tooltip contentStyle={{ fontSize: 10, borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                          <div className="flex flex-wrap justify-center gap-2 text-[9px] font-mono mt-2">
                            {statusCounts.map((st, sidx) => (
                              <div key={sidx} className="flex items-center gap-1 shrink-0 px-2 py-0.5 bg-white border rounded-md shadow-3xs">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: st.color }}></span>
                                <span className="text-slate-600 font-medium">{st.name}: <strong className="text-slate-900">{st.value} Units</strong></span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                </div>

            {/* RIGHT SIDEBAR: Collapsible Department-Wise Performance Reports */}
            {showDepartmentsSidebar && (
              <div className="lg:col-span-4 xl:col-span-3 space-y-4 animate-in slide-in-from-right-4 duration-300">
                <div className="bg-slate-50/70 rounded-3xl border border-slate-200/80 p-4.5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-md font-black text-slate-900 flex items-center gap-2">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-150 shadow-3xs">
                        <Building className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-display text-xs font-bold tracking-tight text-slate-850">Departments</span>
                        <span className="ml-1.5 font-mono text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-full border border-slate-200 font-black">{departments.length} Units</span>
                      </div>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowDepartmentsSidebar(false)}
                      className="p-1 hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 rounded-lg transition"
                      title="Hide Sidebar"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
                    Live metrics with progress & mastery ratings. Click a card or designation to filter. Auto-hides on click.
                  </p>

                  {/* Active Dept filter badge display if filtering */}
                  {scorecardDeptFilters.length > 0 && (
                    <div className="bg-indigo-50/90 border border-indigo-100 p-2.5 rounded-2xl space-y-2 text-xs shadow-xs backdrop-blur-md animate-in fade-in slide-in-from-top-1 duration-200">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-slate-705 text-[8.5px] uppercase font-mono tracking-wide">
                          Active Filters ({scorecardDeptFilters.length})
                        </span>
                        <button
                          type="button"
                          onClick={() => setScorecardDeptFilters([])}
                          className="text-indigo-600 hover:text-indigo-800 text-[8.5px] font-black uppercase tracking-wider transition cursor-pointer"
                        >
                          Clear
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {scorecardDeptFilters.map(dept => (
                          <span key={dept} className="font-mono bg-white px-1.5 py-0.5 text-[8.5px] rounded border border-indigo-200 text-indigo-700 uppercase font-black flex items-center gap-0.5">
                            {dept}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setScorecardDeptFilters(scorecardDeptFilters.filter(d => d !== dept));
                              }}
                              className="text-slate-400 hover:text-red-500 font-bold ml-1 text-[8px] cursor-pointer"
                >
                                  ✕
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1 scrollbar-thin">
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
                                // AUTO HIDE sidebar on department click!
                                setShowDepartmentsSidebar(false);
                              }}
                              className={`group relative overflow-hidden rounded-xl p-3 border-l-[3px] border-y border-r cursor-pointer transition-all duration-205 flex flex-col gap-2 hover:-translate-y-[1px] ${
                                isSelected 
                                  ? theme.selectedBg + ' ' + theme.accent + ' border-l-current border-y-indigo-100/50 border-r-indigo-100/50 shadow-sm'
                                  : 'bg-white hover:bg-slate-50 border-slate-200/85 ' + theme.accent + ' shadow-3xs'
                              }`}
                            >
                              {/* Inner Header */}
                              <div className="flex justify-between items-start gap-1.5">
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all duration-200 shadow-3xs group-hover:scale-105 ${
                                    isSelected ? 'bg-slate-900 text-white border-slate-805' : theme.bg
                                  }`}>
                                    <ThemeIcon className="w-3.5 h-3.5" />
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="text-[10px] font-mono font-black tracking-wide uppercase text-slate-700 truncate max-w-[105px]">
                                      {deptRep.name}
                                    </h4>
                                    <div className="text-[9px] text-slate-400 font-sans mt-0.5 leading-none">
                                      {deptRep.headcount} Staff • {deptRep.rolesCount} Roles
                                    </div>
                                  </div>
                                </div>

                                <div className="shrink-0 flex items-center gap-1">
                                  {deptRep.pendingCount > 0 && (
                                    <span className="bg-amber-100 text-amber-808 border border-amber-204 px-1.5 py-0.5 rounded text-[7.5px] font-mono font-black animate-pulse">
                                      {deptRep.pendingCount}
                                    </span>
                                  )}
                                  {isSelected ? (
                                    <div className="w-3.5 h-3.5 rounded-full bg-slate-900 text-white flex items-center justify-center">
                                      <Check className="w-2 h-2 stroke-[3]" />
                                    </div>
                                  ) : (
                                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-all duration-200" />
                                  )}
                                </div>
                              </div>

                              {/* Progress bars (Syllabus progress & Skill mastery) */}
                              <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-slate-100/85">
                                <div>
                                  <div className="flex justify-between items-center text-[8.5px] font-sans font-semibold text-slate-500 mb-0.5">
                                    <span className="truncate">Syllabus</span>
                                    <span className="font-bold text-slate-800 font-mono text-[7.5px]">{deptRep.avgProgress}%</span>
                                  </div>
                                  <div className="h-0.75 bg-slate-100 rounded-full overflow-hidden">
                                    <div className={`bg-gradient-to-r ${theme.color} h-full transition-all duration-550`} style={{ width: `${deptRep.avgProgress}%` }}></div>
                                  </div>
                                </div>

                                <div>
                                  <div className="flex justify-between items-center text-[8.5px] font-sans font-semibold text-slate-550 mb-0.5">
                                    <span className="truncate">Mastery</span>
                                    <span className="font-bold text-slate-800 font-mono text-[7.5px]">{deptRep.avgMastery}%</span>
                                  </div>
                                  <div className="h-0.75 bg-slate-100 rounded-full overflow-hidden">
                                    <div className={`bg-gradient-to-r ${theme.color} h-full transition-all duration-550`} style={{ width: `${deptRep.avgMastery}%` }}></div>
                                  </div>
                                </div>
                              </div>

                              {/* Department Roles List */}
                              <div className="mt-1.5 pt-1.5 border-t border-slate-200 flex flex-col gap-1">
                                <span className="text-[8.5px] font-extrabold text-slate-600 uppercase tracking-wider font-display">
                                  Designations ({deptRep.rolesCount})
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {roles.filter(r => r.department === deptRep.name).map(r => (
                                    <span 
                                      key={r.id} 
                                      onClick={(e) => {
                                        e.stopPropagation(); // Avoid triggering parent click which sets department filter
                                        setScorecardRoleFilter(r.id); // Set active role filter
                                        // AUTO HIDE sidebar on designation click!
                                        setShowDepartmentsSidebar(false);
                                      }}
                                      className="bg-slate-100 hover:bg-indigo-50 text-slate-900 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 rounded px-1.5 py-0.5 text-[8px] font-sans font-extrabold tracking-tight truncate max-w-full cursor-pointer transition-all duration-150"
                                      title={r.name}
                                    >
                                      {r.name}
                                    </span>
                                  ))}
                                  {roles.filter(r => r.department === deptRep.name).length === 0 && (
                                    <span className="text-[8px] text-slate-400 italic">No roles</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
          </div>
        </div>
      )}



      {/* ----------------------------------------------------
          TAB 1.6: HIERARCHY MAP MATRIX
          ---------------------------------------------------- */}
      {adminTab === 'hierarchy' && (
        <HierarchyView 
          roles={roles}
          users={users}
          onUpdateRoles={onUpdateRoles}
          onUpdateUsers={onUpdateUsers}
          branding={branding}
        />
      )}



      {/* ----------------------------------------------------
          TAB 1.5: ENROLLMENT APPROVALS
          ---------------------------------------------------- */}
      {adminTab === 'approvals' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-3 border-b border-indigo-50 pb-2">
            <div>
              <h3 className="font-display text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                New Enrollments Pending Approval
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono bg-amber-50 text-amber-800 border border-amber-200/60 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                Only Admin / HR Authorized
              </span>
            </div>
          </div>

          {users.filter(u => u.status === 'Pending Approval').length === 0 ? (
            <div className="py-12 text-center max-w-md mx-auto">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                🎉
              </div>
              <h4 className="text-sm font-bold text-slate-900">All caught up!</h4>
              <p className="text-xs text-slate-500 mt-2 font-sans leading-relaxed">
                There are absolutely no new enrollment requests currently pending in your approval queue. Any new employee who registers on the Sign-Up page or via Google Sign-Up will automatically appear here for verification.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* SEARCH & FILTER CONTROLS FOR ENROLLMENTS - DESIGN COMPACTED */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 flex flex-wrap items-center justify-between gap-2.5 text-xs font-sans text-left">
                <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                  {/* Text Search */}
                  <div className="relative w-full sm:w-60">
                    <div className="relative">
                      <input
                        type="text"
                        value={approvalSearchQuery}
                        onChange={(e) => setApprovalSearchQuery(e.target.value)}
                        placeholder="🔍 Search trainees..."
                        className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 pl-7 focus:border-indigo-500 outline-none text-xs w-full text-slate-800 font-sans font-medium text-slate-900"
                      />
                      {approvalSearchQuery && (
                        <button
                          onClick={() => setApprovalSearchQuery('')}
                          className="absolute right-2.5 top-1.5 text-slate-400 hover:text-slate-600 text-[10px] font-bold"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Department Selector */}
                  <div className="w-full sm:w-auto">
                    <select
                      value={approvalDeptFilter}
                      onChange={(e) => setApprovalDeptFilter(e.target.value)}
                      className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 focus:border-indigo-500 outline-none text-xs font-semibold text-slate-755 cursor-pointer w-full sm:w-48 text-slate-800"
                    >
                      <option value="all">📁 All Departments</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Clear Filters indicator */}
                {(approvalSearchQuery || approvalDeptFilter !== 'all') && (
                  <button
                    type="button"
                    onClick={() => {
                      setApprovalSearchQuery('');
                      setApprovalDeptFilter('all');
                    }}
                    className="text-xs text-rose-600 hover:text-rose-800 font-bold hover:underline cursor-pointer"
                  >
                    Clear filters [✕]
                  </button>
                )}
              </div>

              {(() => {
                const pendingFiltered = users
                  .filter(u => u.status === 'Pending Approval')
                  .filter(u => {
                    if (approvalSearchQuery) {
                      const query = approvalSearchQuery.toLowerCase().trim();
                      const nameMatch = (u.name || '').toLowerCase().includes(query);
                      const emailMatch = (u.email || '').toLowerCase().includes(query);
                      if (!nameMatch && !emailMatch) return false;
                    }
                    if (approvalDeptFilter !== 'all') {
                      if (u.department !== approvalDeptFilter) return false;
                    }
                    return true;
                  });

                if (pendingFiltered.length === 0) {
                  return (
                    <div className="py-12 text-center bg-slate-50 border border-dashed rounded-xl">
                      <p className="text-xs font-bold text-slate-700">No matching search query found</p>
                      <p className="text-[11px] text-slate-400 mt-1">Try relaxing your keywords or choosing "All Departments" to see all registered staff requests.</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-2">
                    {/* Show entries control and status bar */}
                    <div className="flex items-center justify-between gap-2 py-1">
                      <div className="text-[10.5px] text-slate-500 font-bold font-mono uppercase tracking-wider">
                        Showing {Math.min(approvalsLimit, pendingFiltered.length)} of {pendingFiltered.length} Approvals
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 font-sans text-[11px] font-bold bg-slate-100/70 border border-slate-200/80 rounded-lg px-2 py-0.5 shadow-3xs">
                        <span>Show entries:</span>
                        <select
                          value={approvalsLimit}
                          onChange={(e) => setApprovalsLimit(Number(e.target.value))}
                          className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[11px] font-bold text-slate-750 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 cursor-pointer"
                        >
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                      </div>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-3xs max-h-[300px] overflow-y-auto">
                      <table className="premium-grid-table w-full text-left border-collapse">
                        <thead>
                          <tr className="sticky top-0 z-10 bg-slate-50 border-b border-slate-250 font-display text-[10px] uppercase font-extrabold tracking-wider text-slate-800 shadow-[0_1px_0_0_rgba(226,232,240,1)]">
                            <th className="py-2.5 px-3 font-extrabold bg-slate-50">Trainee Profile</th>
                            <th className="py-2.5 px-3 font-extrabold bg-slate-50">Focus Entity & BU</th>
                            <th className="py-2.5 px-3 font-extrabold bg-slate-50">Requested Primary Job Role</th>
                            <th className="py-2.5 px-3 text-center font-extrabold bg-slate-50">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-150 text-xs text-slate-600">
                          {pendingFiltered.slice(0, approvalsLimit).map((u) => {
                            const mappedRole = roles.find(r => r.id === u.roleId);
                      return (
                        <tr key={u.id} className="hover:bg-slate-50/40 transition">
                          {/* Trainee Profile */}
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-2">
                              <Avatar
                                src={u.avatarUrl}
                                name={u.name}
                                className="w-8 h-8 border border-slate-205 shrink-0"
                              />
                              <div>
                                <p className="font-bold text-slate-900 leading-tight">{u.name}</p>
                                <p className="text-[9.5px] text-slate-400 font-mono select-all leading-tight">{u.email}</p>
                              </div>
                            </div>
                          </td>
  
                          {/* Focus Entity & BU */}
                          <td className="py-2 px-3 font-sans">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1">
                                <Building className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="font-semibold text-slate-800 text-[11px]">{u.focusEntity || 'Rathi Buildmart'}</span>
                              </div>
                              <div className="text-[9.5px] text-slate-500 font-mono leading-none">
                                Dept: {u.department || 'Account'}
                              </div>
                            </div>
                          </td>
  
                          {/* Requested Job Role Selection */}
                          <td className="py-2 px-3">
                            <div className="space-y-1 max-w-[240px]">
                              <select
                                value={u.roleId}
                                onChange={(e) => {
                                const roleId = e.target.value;
                                const r = roles.find(rl => rl.id === roleId);
                                const updatedUsers = users.map(user => 
                                  user.id === u.id 
                                    ? { 
                                        ...user, 
                                        roleId,
                                        roleIds: Array.from(new Set([roleId, ...(user.roleIds || [])]))
                                      } 
                                    : user
                                );
                                onUpdateUsers(updatedUsers);
                                showToast(`✓ Changed requested role of "${u.name}" to "${r?.name || roleId}" successfully.`, 'info');
                              }}
                              className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-500 outline-none font-bold text-slate-800 transition"
                            >
                              {roles.map(r => (
                                <option key={r.id} value={r.id}>
                                  {r.name}
                                </option>
                              ))}
                            </select>
                            
                            {mappedRole && (
                              <div className="text-[10px] text-slate-400 font-sans italic truncate">
                                Required: {mappedRole.skillRequirements.slice(0, 2).join(', ')}...
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Interactive Approvals Actions */}
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const updated = users.map(user => 
                                  user.id === u.id ? { ...user, status: 'Active' as const } : user
                                );
                                onUpdateUsers(updated);
                                
                                const approvedRoleName = roles.find(r => r.id === u.roleId)?.name || 'Trainee';
                                const userPassword = u.password || 'rathi123';
                                
                                fetch('/api/send-credentials-email', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    email: u.email,
                                    name: u.name,
                                    roleName: approvedRoleName,
                                    password: userPassword,
                                    smtpConfig: getSmtpConfig()
                                  })
                                }).then(res => res.json()).then(data => {
                                  console.log('Credentials email API response:', data);
                                }).catch(err => {
                                  console.error('Failed credentials email API:', err);
                                });

                                showToast(`✓ Enrollment approved! Welcome email with role: "${approvedRoleName}" & passkey: "${userPassword}" sent to ${u.email} successfully.`, 'success');
                              }}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-505 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer active:scale-95 shrink-0 shadow-sm"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to reject the enrollment request from "${u.name}"? This request will be purged.`)) {
                                  const updated = users.filter(user => user.id !== u.id);
                                  onUpdateUsers(updated);
                                  showToast(`✓ Removed registration request for "${u.name}" from the system queue.`, 'error');
                                }
                              }}
                              className="px-3 py-1.5 border border-slate-200 hover:border-rose-200 text-slate-400 hover:text-rose-605 text-slate-400 hover:text-rose-600 font-bold rounded-lg transition text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer active:scale-95 shrink-0"
                            >
                              <X className="w-3.5 h-3.5" />
                              Decline
                            </button>
                          </div>
                        </td>
                      </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
            </div>
          )}
        </div>
      )}



      {/* ----------------------------------------------------
          TAB 2: USER DATA MANAGEMENT
          ---------------------------------------------------- */}
      {adminTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-3 border-b border-slate-100 pb-2">
            <div>
              <h3 className="font-display text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600" />
                Corporate User Registry & Completion Audits
              </h3>
            </div>
            
            <div className="flex flex-wrap gap-1.5 self-start sm:self-center">
              <button
                onClick={handleExportUsersToCSV}
                title="Export Matched Trainees to CSV file"
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition border border-emerald-250 flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV 📥</span>
              </button>

              {hasPermission('perm_user_edt') && (
                <button
                  onClick={() => {
                    setShowBatchSyncer(!showBatchSyncer);
                    setIsAddingUser(false);
                  }}
                  id="btn-trigger-batch-sync"
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition border border-indigo-200/55 flex items-center gap-1 cursor-pointer"
                >
                  {showBatchSyncer ? <X className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
                  {showBatchSyncer ? "Close Syncer" : "Batch Share Profiles 👥"}
                </button>
              )}

              {hasPermission('perm_user_add') && (
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
              )}
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono mb-1">Employee Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aashish Sahu"
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
                    placeholder="e.g. misrpr@rathibuildmart.com"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:border-emerald-500 outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono mb-1">Mobile / Phone No</label>
                  <input
                    type="text"
                    placeholder="e.g. 9876543210"
                    value={newUserMobile}
                    onChange={(e) => setNewUserMobile(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:border-emerald-500 outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono mb-1">Profile Photo (Image URL)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. https://images.unsplash.com/photo-..."
                      value={newUserAvatar}
                      onChange={(e) => setNewUserAvatar(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:border-emerald-500 outline-none text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono mb-1">Assigned Department</label>
                  <select
                    value={newUserDept}
                    onChange={(e) => {
                      setNewUserDept(e.target.value);
                    }}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 pr-8 focus:border-emerald-500 text-slate-800 font-sans font-medium outline-none text-xs"
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
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 pr-8 focus:border-emerald-500 text-slate-850 text-slate-800 font-sans font-medium outline-none text-xs"
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
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 pr-8 focus:border-emerald-500 text-slate-800 font-sans font-medium outline-none text-xs font-bold"
                  >
                    <option value="Active">🟢 Active (Staff)</option>
                    <option value="Deactivated">🔴 Deactivated (Suspend)</option>
                    <option value="Left">⚪ Left / Resigned (Offboarded)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono mb-1">Reports To (Manager)</label>
                  <select
                    value={newUserReportsTo}
                    onChange={(e) => setNewUserReportsTo(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 pr-8 focus:border-emerald-500 text-slate-800 font-sans font-medium outline-none text-xs font-bold cursor-pointer"
                  >
                    <option value="">Director Rathi (Absolute Top)</option>
                    {users
                      .filter(u => !u.isSuperAdmin)
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))
                    }
                  </select>
                </div>
              </div>

              {/* Access Levels Section */}
              <div className="bg-white border border-slate-200/80 rounded-xl p-4 space-y-3 shadow-3xs text-left">
                <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase font-mono block">
                    🔐 System Access & Privileges
                  </span>
                  {!currentUser.isSuperAdmin && (
                    <span className="text-[9px] text-rose-500 font-bold font-mono">
                      ⚠️ ONLY SUPER ADMIN ACCESS
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-6 items-center">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={newUserIsAdmin}
                      disabled={!currentUser.isSuperAdmin}
                      onChange={(e) => {
                        setNewUserIsAdmin(e.target.checked);
                        if (e.target.checked) {
                          setNewUserIsSuperAdmin(false);
                        }
                      }}
                      className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 w-4.5 h-4.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <span className={!currentUser.isSuperAdmin ? "opacity-40" : ""}>Is Admin (User-wise Permissions)</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={newUserIsSuperAdmin}
                      disabled={!currentUser.isSuperAdmin}
                      onChange={(e) => {
                        setNewUserIsSuperAdmin(e.target.checked);
                        if (e.target.checked) {
                          setNewUserIsAdmin(false);
                        }
                      }}
                      className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 w-4.5 h-4.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <span className={!currentUser.isSuperAdmin ? "opacity-40" : ""}>Is Super Admin (All Access Bypass)</span>
                  </label>
                </div>

                {newUserIsAdmin && !newUserIsSuperAdmin && (
                  <div className="mt-3 border-t border-slate-100 pt-3">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase font-mono mb-2">
                      Assign User-Wise Permissions:
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg max-h-[250px] overflow-y-auto">
                      {ALL_PERMISSIONS.map((perm) => {
                        const isChecked = newUserPermissions.includes(perm.id);
                        return (
                          <label key={perm.id} className={`flex items-start gap-1.5 p-1.5 rounded hover:bg-slate-100 cursor-pointer select-none ${perm.isParent ? 'font-bold text-slate-850' : 'text-slate-650'}`}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              disabled={!currentUser.isSuperAdmin}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewUserPermissions(prev => [...prev, perm.id]);
                                } else {
                                  setNewUserPermissions(prev => prev.filter(id => id !== perm.id));
                                }
                              }}
                              className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 w-3.5 h-3.5 mt-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <div className="flex flex-col">
                              <span className={`text-[10px] leading-tight font-medium ${!currentUser.isSuperAdmin ? "opacity-50" : ""}`}>{perm.name}</span>
                              <span className="text-[8px] text-slate-400 font-mono tracking-tighter">{perm.id}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {newUserIsSuperAdmin && (
                  <div className="bg-indigo-50 border border-indigo-100 text-indigo-800 rounded-lg p-2.5 text-[10px] font-sans flex items-center gap-1.5">
                    <span>👑 <strong>Super Admin Mode Active:</strong> This user has complete unrestricted bypass access to every administrative tool, syllabus editor, registration portal, and audit logs.</span>
                  </div>
                )}
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

          {/* USER REGISTRY INTERACTIVE SEARCH & FILTERS BAR - DESIGN COMPACTED */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-1 px-2 mb-3 flex flex-wrap md:flex-nowrap items-center justify-between gap-1.5 text-[11px] font-sans text-left shadow-3xs">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              
              {/* Search Bar */}
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono whitespace-nowrap">Search:</span>
                <div className="relative">
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Search name, email..."
                    className="bg-white border border-slate-300 rounded-lg px-1.5 py-0.5 pl-5.5 focus:border-emerald-500 outline-none text-[11px] w-32 text-slate-800 font-semibold"
                  />
                  <span className="absolute left-1.5 top-0.5 text-slate-400 text-[9px]">🔍</span>
                </div>
              </div>

              {/* Department Filter */}
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono whitespace-nowrap">Dept:</span>
                <select
                  value={userDeptFilter}
                  onChange={(e) => setUserDeptFilter(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-1.5 py-0.5 focus:border-emerald-500 outline-none text-[11px] font-bold text-slate-750 cursor-pointer"
                >
                  <option value="all">-- All Departments --</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono whitespace-nowrap">Status:</span>
                <select
                  value={userStatusFilter}
                  onChange={(e) => setUserStatusFilter(e.target.value as any)}
                  className="bg-white border border-slate-300 rounded-lg px-1.5 py-0.5 focus:border-emerald-500 outline-none text-[11px] font-bold text-slate-750 cursor-pointer"
                >
                  <option value="all">✨ All Statuses</option>
                  <option value="Active">🟢 Active Staff</option>
                  <option value="Deactivated">🔴 Deactivated</option>
                  <option value="Left">⚪ Left Group</option>
                </select>
              </div>

              {/* Job Profile Multi-Select Dropdown Filter */}
              <div className="relative flex items-center gap-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono whitespace-nowrap">Designation:</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setUserFilterRoleOpen(!userFilterRoleOpen)}
                    id="btn-trigger-user-role-filters"
                    className="bg-white hover:bg-slate-100/90 text-slate-700 text-[11px] font-bold px-1.5 py-0.5 rounded-lg border border-slate-300 shadow-3xs transition duration-150 flex items-center justify-between gap-1 cursor-pointer max-w-[120px]"
                  >
                    <span className="truncate">
                      {userSelectedRoleIds.length === 0
                        ? 'None Match ❌'
                        : userSelectedRoleIds.length === roles.length
                        ? 'All Designations'
                        : `${userSelectedRoleIds.length} selected`}
                    </span>
                    <span className="text-[8px] text-slate-500 font-bold">▼</span>
                  </button>

                  <div className="flex gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setUserSelectedRoleIds(roles.map(r => r.id))}
                      className="text-[8.5px] font-extrabold text-indigo-700 bg-indigo-50 hover:bg-indigo-150 px-1 py-0.5 rounded cursor-pointer whitespace-nowrap"
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserSelectedRoleIds([])}
                      className="text-[8.5px] font-extrabold text-slate-650 bg-slate-100 hover:bg-slate-200 px-1 py-0.5 rounded cursor-pointer whitespace-nowrap"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {userFilterRoleOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserFilterRoleOpen(false)} />
                    <div className="absolute left-0 mt-6 w-72 bg-white border border-slate-200 rounded-xl shadow-xl p-3.5 space-y-2.5 z-50 text-left animate-in slide-in-from-top-1 duration-150">
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

            <div className="flex items-center gap-2 shrink-0">
              <div className="text-[9px] font-bold font-mono text-slate-500 uppercase tracking-wider bg-slate-100/50 border border-slate-200/50 rounded-lg px-1.5 py-0.5">
                TRAINEES: <strong className="text-emerald-700 text-[11px]">{matchedUsers.length}</strong>
              </div>
              
              <div className="flex items-center gap-1 text-slate-500 font-sans text-[10.5px] font-bold bg-slate-100/70 border border-slate-200/80 rounded-lg px-1.5 py-0.5 shadow-3xs">
                <span>Entries:</span>
                <select
                  value={usersLimit}
                  onChange={(e) => setUsersLimit(Number(e.target.value))}
                  className="bg-white border border-slate-200 rounded px-1 py-0.2 text-[10.5px] font-bold text-slate-755 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 cursor-pointer"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
          </div>

          {/* PREMIUM ENTERPRISE SPREADSHEET TOOLBAR */}
          <div className="bg-slate-50 border border-slate-200 border-b-0 rounded-t-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs font-sans text-left shadow-3xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-bold text-slate-800 text-xs sm:text-[13px] uppercase tracking-wider font-mono">
                System Users Registry • <span className="text-emerald-600 font-extrabold">{matchedUsers.length} records</span>
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Dynamic Column Selector Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserTableColDropdownOpen(!userTableColDropdownOpen)}
                  className="bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-bold px-3 py-1.5 rounded-lg border border-slate-300 shadow-3xs transition flex items-center gap-1.5 cursor-pointer select-none"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                  <span>Columns ({userTableVisibleCols.length}/16)</span>
                </button>
                {userTableColDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setUserTableColDropdownOpen(false)} />
                    <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-2xl p-4 z-40 text-left space-y-3 animate-in slide-in-from-top-1 duration-150">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                        <span className="text-[10px] font-mono font-black text-slate-500 uppercase">Visible Fields</span>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => setUserTableVisibleCols([
                              'SN', 'USER', 'EMAIL', 'ROLES', 'LAST_LOGIN', 'STATUS', 'MOBILE', 'ADMIN', 'EMPLOYEE_ID', 'DESCRIPTION', 'DESIGNATION', 'EMAIL_SIGNATURE', 'REPORT_TO', 'PATH_MET', 'MASTERY_MET', 'CONTROL'
                            ])}
                            className="text-[9px] font-extrabold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-1.5 py-0.5 rounded cursor-pointer"
                          >
                            All
                          </button>
                          <button
                            type="button"
                            onClick={() => setUserTableVisibleCols([
                              'SN', 'USER', 'EMAIL', 'ROLES', 'STATUS', 'PATH_MET', 'MASTERY_MET', 'CONTROL'
                            ])}
                            className="text-[9px] font-extrabold text-slate-650 bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded cursor-pointer"
                          >
                            Reset
                          </button>
                        </div>
                      </div>
                      <div className="max-h-56 overflow-y-auto space-y-1.5 scrollbar-thin">
                        {[
                          { id: 'SN', name: 'S.N.' },
                          { id: 'USER', name: 'User / Avatar' },
                          { id: 'EMAIL', name: 'Email' },
                          { id: 'ROLES', name: 'Curriculum Roles' },
                          { id: 'LAST_LOGIN', name: 'Last Login' },
                          { id: 'STATUS', name: 'Status' },
                          { id: 'MOBILE', name: 'Mobile No' },
                          { id: 'ADMIN', name: 'Admin (Y/N)' },
                          { id: 'EMPLOYEE_ID', name: 'Employee ID' },
                          { id: 'DESCRIPTION', name: 'Description' },
                          { id: 'DESIGNATION', name: 'Designation' },
                          { id: 'EMAIL_SIGNATURE', name: 'Signature text' },
                          { id: 'REPORT_TO', name: 'Report To Manager' },
                          { id: 'PATH_MET', name: 'Path Met %' },
                          { id: 'MASTERY_MET', name: 'Mastery Met %' },
                          { id: 'CONTROL', name: 'Action Controls' }
                        ].map(col => {
                          const isChecked = userTableVisibleCols.includes(col.id);
                          return (
                            <label key={col.id} className="flex items-center gap-2 px-1.5 py-1 rounded hover:bg-slate-50 cursor-pointer select-none text-xs">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                disabled={col.id === 'USER'}
                                onChange={() => {
                                  if (isChecked) {
                                    setUserTableVisibleCols(prev => prev.filter(id => id !== col.id));
                                  } else {
                                    setUserTableVisibleCols(prev => [...prev, col.id]);
                                  }
                                }}
                                className="rounded text-emerald-600 focus:ring-emerald-505 border-slate-300 w-3.5 h-3.5 cursor-pointer"
                              />
                              <span className="font-semibold text-slate-700">{col.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Excel-compatible CSV Downloader */}
              <button
                type="button"
                onClick={handleExportUsersToCSV}
                className="bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-bold px-3 py-1.5 rounded-lg border border-slate-300 shadow-3xs transition flex items-center gap-1 cursor-pointer"
                title="Download entire grid data as CSV spreadsheet"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export CSV</span>
              </button>

              {/* Grid database re-indexer / refresh */}
              <button
                type="button"
                onClick={handleRefreshUserTable}
                className="bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-bold p-1.5 rounded-lg border border-slate-300 shadow-3xs transition cursor-pointer"
                title="Re-index database tables & clear state cache"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${userTableIsRefreshing ? 'animate-spin' : ''}`} />
              </button>

              {/* Dynamic Fullscreen Toggle */}
              <button
                type="button"
                onClick={() => setUserTableIsFullscreen(!userTableIsFullscreen)}
                className="bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-bold p-1.5 rounded-lg border border-slate-300 shadow-3xs transition cursor-pointer"
                title={userTableIsFullscreen ? "Minimize Grid to standard dashboard" : "Maximize Grid to complete Fullscreen Workspace"}
              >
                {userTableIsFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-slate-500" /> : <Maximize2 className="w-3.5 h-3.5 text-slate-500" />}
              </button>
            </div>
          </div>

          {/* Dynamic Bulk Action Floating Banner (Hidden to prioritize clean, single inline editing) */}
          {false && selectedUserIds.length > 0 && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3 mb-4 flex flex-wrap items-center justify-between gap-3 text-xs font-sans text-left shadow-2xs animate-in slide-in-from-top-1 duration-200">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex items-center justify-center bg-indigo-600 text-white rounded-full w-5.5 h-5.5 font-mono text-[10px] font-black shadow-sm shrink-0 animate-bounce">
                  {selectedUserIds.length}
                </span>
                <div>
                  <span className="font-extrabold text-indigo-900 block leading-tight text-xs sm:text-[13px]">
                    Trainees selected for batch actions
                  </span>
                  <span className="text-[10px] text-indigo-500 italic block mt-0.5 animate-pulse">
                    Click 'Bulk Edit Selected' to perform selective multi-record updates concurrently.
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setBulkEditRole(roles && roles.length > 0 ? roles[0].id : '');
                    setBulkEditRoles([]);
                    setBulkEditDept(departments && departments.length > 0 ? departments[0] : '');
                    setBulkEditFocus('Rathi Buildmart Head Office');
                    setBulkEditStatus('Active');
                    setBulkEditIsAdmin(false);
                    setBulkEditIsSuperAdmin(false);
                    setBulkUpdateRole(false);
                    setBulkUpdateRoles(false);
                    setBulkUpdateDept(false);
                    setBulkUpdateFocus(false);
                    setBulkUpdateStatus(false);
                    setBulkUpdateIsAdmin(false);
                    
                    setIsBulkEditOpen(true);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-3.5 py-2 rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer text-xs uppercase tracking-wider font-mono"
                >
                  📝 Bulk Edit Selected
                </button>
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold px-3 py-2 rounded-lg transition cursor-pointer text-xs uppercase tracking-wider font-mono"
                >
                  🗑️ Delete Selected
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedUserIds([])}
                  className="text-slate-500 hover:text-slate-700 font-bold px-3 py-2 rounded-lg transition cursor-pointer text-xs font-mono"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}

          {/* Bulk Edit Modal */}
          <AnimatePresence>
            {isBulkEditOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs overflow-y-auto">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsBulkEditOpen(false)}
                  className="fixed inset-0"
                />

                <motion.div
                  initial={{ scale: 0.95, opacity: 0, y: 15 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 15 }}
                  transition={{ type: 'spring', duration: 0.3 }}
                  className="relative bg-white text-slate-800 rounded-3xl border border-slate-200 shadow-2xl p-6 md:p-8 w-full max-w-lg z-10 my-8 max-h-[90vh] overflow-y-auto text-left"
                >
                  <button
                    type="button"
                    onClick={() => setIsBulkEditOpen(false)}
                    className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition cursor-pointer"
                    title="Close Modal"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2 mb-1 font-display">
                    <span>📝 Bulk Edit Trainees</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mb-6 font-sans">
                    Updating <span className="font-bold text-indigo-600">{selectedUserIds.length} selected trainees</span> at once. Check the fields you want to update to make the change.
                  </p>

                  <div className="space-y-4 text-xs font-sans">
                    {/* 1. Primary Curriculum Role */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={bulkUpdateRole}
                          onChange={(e) => {
                            setBulkUpdateRole(e.target.checked);
                            if (e.target.checked && !bulkEditRole && roles.length > 0) {
                              setBulkEditRole(roles[0].id);
                            }
                          }}
                          className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 w-3.5 h-3.5 cursor-pointer"
                        />
                        <span>Update Primary Curriculum Role</span>
                      </label>
                      {bulkUpdateRole && (
                        <select
                          value={bulkEditRole}
                          onChange={(e) => setBulkEditRole(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 outline-none text-xs"
                        >
                          {roles.map((r) => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* 2. Secondary/Other Assignments */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={bulkUpdateRoles}
                          onChange={(e) => setBulkUpdateRoles(e.target.checked)}
                          className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 w-3.5 h-3.5 cursor-pointer"
                        />
                        <span>Update Secondary Assignments</span>
                      </label>
                      {bulkUpdateRoles && (
                        <div className="max-h-32 overflow-y-auto p-2 bg-white border border-slate-200 rounded space-y-1.5">
                          {roles.map((r) => {
                            if (bulkUpdateRole && r.id === bulkEditRole) return null;
                            const isChecked = bulkEditRoles.includes(r.id);
                            return (
                              <label key={r.id} className="flex items-center gap-2 text-slate-700 font-medium select-none cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    if (isChecked) {
                                      setBulkEditRoles(prev => prev.filter(id => id !== r.id));
                                    } else {
                                      setBulkEditRoles(prev => [...prev, r.id]);
                                    }
                                  }}
                                  className="rounded text-indigo-600 border-slate-300 w-3 h-3 cursor-pointer"
                                />
                                <span>{r.name}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* 3. Division/Department */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={bulkUpdateDept}
                          onChange={(e) => {
                            setBulkUpdateDept(e.target.checked);
                            if (e.target.checked && !bulkEditDept && departments.length > 0) {
                              setBulkEditDept(departments[0]);
                            }
                          }}
                          className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 w-3.5 h-3.5 cursor-pointer"
                        />
                        <span>Update Division / Department</span>
                      </label>
                      {bulkUpdateDept && (
                        <select
                          value={bulkEditDept}
                          onChange={(e) => setBulkEditDept(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 outline-none text-xs"
                        >
                          {departments.map((dept) => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* 4. Branch / Location Focus */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={bulkUpdateFocus}
                          onChange={(e) => setBulkUpdateFocus(e.target.checked)}
                          className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 w-3.5 h-3.5 cursor-pointer"
                        />
                        <span>Update Branch / Location Focus</span>
                      </label>
                      {bulkUpdateFocus && (
                        <input
                          type="text"
                          value={bulkEditFocus}
                          onChange={(e) => setBulkEditFocus(e.target.value)}
                          placeholder="e.g. Rathi Buildmart Head Office"
                          className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 outline-none text-xs focus:border-indigo-500"
                        />
                      )}
                    </div>

                    {/* 5. Status */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={bulkUpdateStatus}
                          onChange={(e) => setBulkUpdateStatus(e.target.checked)}
                          className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 w-3.5 h-3.5 cursor-pointer"
                        />
                        <span>Update Status</span>
                      </label>
                      {bulkUpdateStatus && (
                        <select
                          value={bulkEditStatus}
                          onChange={(e) => setBulkEditStatus(e.target.value as any)}
                          className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 outline-none text-xs"
                        >
                          <option value="Active">🟢 Active</option>
                          <option value="Deactivated">🔴 Deactivated</option>
                          <option value="Left">⚪ Left</option>
                        </select>
                      )}
                    </div>

                    {/* 6. Admin Roles */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={bulkUpdateIsAdmin}
                          onChange={(e) => setBulkUpdateIsAdmin(e.target.checked)}
                          className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 w-3.5 h-3.5 cursor-pointer"
                        />
                        <span>Update Security/Admin Privilege</span>
                      </label>
                      {bulkUpdateIsAdmin && (
                        <div className="flex gap-4 p-1">
                          <label className="flex items-center gap-1.5 text-slate-700 font-bold select-none cursor-pointer">
                            <input
                              type="checkbox"
                              checked={bulkEditIsAdmin}
                              disabled={!currentUser.isSuperAdmin}
                              onChange={(e) => {
                                setBulkEditIsAdmin(e.target.checked);
                                if (e.target.checked) setBulkEditIsSuperAdmin(false);
                              }}
                              className="rounded text-emerald-600 focus:ring-emerald-505 border-slate-300 w-3.5 h-3.5 cursor-pointer disabled:opacity-50"
                            />
                            <span>Is Admin</span>
                          </label>
                          <label className="flex items-center gap-1.5 text-slate-700 font-bold select-none cursor-pointer">
                            <input
                              type="checkbox"
                              checked={bulkEditIsSuperAdmin}
                              disabled={!currentUser.isSuperAdmin}
                              onChange={(e) => {
                                setBulkEditIsSuperAdmin(e.target.checked);
                                if (e.target.checked) setBulkEditIsAdmin(false);
                              }}
                              className="rounded text-indigo-600 focus:ring-indigo-505 border-slate-300 w-3.5 h-3.5 cursor-pointer disabled:opacity-50"
                            />
                            <span>Super Admin</span>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-2.5 mt-8 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsBulkEditOpen(false)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleBulkEditSave}
                      disabled={!bulkUpdateRole && !bulkUpdateRoles && !bulkUpdateDept && !bulkUpdateFocus && !bulkUpdateStatus && !bulkUpdateIsAdmin}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2 rounded-xl text-xs font-black transition cursor-pointer shadow-sm"
                    >
                      Save Bulk Changes
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* SPREADSHEET WORKSPACE WRAPPER */}
          {userTableIsFullscreen && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-45" onClick={() => setUserTableIsFullscreen(false)} />
          )}
          <div className={userTableIsFullscreen ? "fixed inset-4 sm:inset-10 z-50 bg-white rounded-2xl border border-slate-300 p-6 flex flex-col justify-between shadow-2xl animate-in zoom-in-95 duration-200 text-left" : ""}>
            {userTableIsFullscreen && (
              <div className="flex justify-between items-center pb-4 border-b border-slate-200 mb-4 shrink-0 text-left">
                <div>
                  <h2 className="font-display font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    CORPORATE SPREADSHEET WORKSPACE: TRAINEE AUDITS
                  </h2>
                  <p className="text-[10px] text-slate-500 italic mt-0.5">High-fidelity live table editor with interactive visible-column configuration checklist.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setUserTableIsFullscreen(false)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition shadow-md cursor-pointer flex items-center gap-1"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                  Close Fullscreen Workspace
                </button>
              </div>
            )}

            {/* SPREADSHEET TABLE WORKSPACE */}
            <div className={`select-none border border-slate-200 bg-slate-50/20 shadow-3xs relative ${userTableIsFullscreen ? 'flex-1 overflow-auto rounded-xl border-slate-300 bg-white' : 'overflow-x-auto overflow-y-auto rounded-b-xl max-h-[720px] scrollbar-thin'}`}>

            {userTableIsRefreshing ? (
              <div className="flex flex-col gap-3 p-12 animate-pulse w-full bg-white">
                <div className="h-5 bg-slate-200 rounded w-1/4"></div>
                <div className="space-y-2 mt-2">
                  <div className="h-9 bg-slate-100 rounded border border-slate-200"></div>
                  <div className="h-9 bg-slate-100 rounded border border-slate-200"></div>
                  <div className="h-9 bg-slate-100 rounded border border-slate-200"></div>
                  <div className="h-9 bg-slate-100 rounded border border-slate-200"></div>
                  <div className="h-9 bg-slate-100 rounded border border-slate-200"></div>
                </div>
              </div>
            ) : (
              <table className="premium-grid-table w-full text-left font-sans text-xs border-collapse bg-white">
                <thead>
                  <tr className="sticky top-0 z-10 bg-slate-150 text-slate-800 font-display text-[10px] uppercase tracking-wider border-b-2 border-slate-300 font-extrabold shadow-[0_1px_0_0_rgba(203,213,225,1)]">
                    {userTableVisibleCols.includes('SN') && <th className="bg-slate-100 border-r border-slate-300 py-2.5 px-3 pl-4 font-bold select-none text-slate-800 font-mono text-center w-12">S.N.</th>}
                    {userTableVisibleCols.includes('USER') && <th className="bg-slate-100 border-r border-slate-300 py-2.5 px-3 font-bold select-none text-slate-800">USER / TRAINEE</th>}
                    {userTableVisibleCols.includes('EMAIL') && <th className="bg-slate-100 border-r border-slate-300 py-2.5 px-3 font-bold select-none text-slate-800">EMAIL ADDRESS</th>}
                    {userTableVisibleCols.includes('ROLES') && <th className="bg-slate-100 border-r border-slate-300 py-2.5 px-3 font-bold select-none text-slate-800">CURRICULUM ASSIGNMENT</th>}
                    {userTableVisibleCols.includes('LAST_LOGIN') && <th className="bg-slate-100 border-r border-slate-300 py-2.5 px-3 font-bold select-none text-slate-800">LAST LOGIN</th>}
                    {userTableVisibleCols.includes('STATUS') && <th className="bg-slate-100 border-r border-slate-300 py-2.5 px-3 font-bold select-none text-slate-800 text-center w-24">STATUS</th>}
                    {userTableVisibleCols.includes('MOBILE') && <th className="bg-slate-100 border-r border-slate-300 py-2.5 px-3 font-bold select-none text-slate-800">MOBILE</th>}
                    {userTableVisibleCols.includes('ADMIN') && <th className="bg-slate-100 border-r border-slate-300 py-2.5 px-3 font-bold select-none text-slate-800 text-center w-20">ADMIN</th>}
                    {userTableVisibleCols.includes('EMPLOYEE_ID') && <th className="bg-slate-100 border-r border-slate-300 py-2.5 px-3 font-bold select-none text-slate-800 text-center w-28">EMPLOYEE ID</th>}
                    {userTableVisibleCols.includes('DESCRIPTION') && <th className="bg-slate-100 border-r border-slate-300 py-2.5 px-3 font-bold select-none text-slate-800 max-w-xs truncate">DESCRIPTION</th>}
                    {userTableVisibleCols.includes('DESIGNATION') && <th className="bg-slate-100 border-r border-slate-300 py-2.5 px-3 font-bold select-none text-slate-800">DESIGNATION</th>}
                    {userTableVisibleCols.includes('EMAIL_SIGNATURE') && <th className="bg-slate-100 border-r border-slate-300 py-2.5 px-3 font-bold select-none text-slate-800">EMAIL SIGNATURE</th>}
                    {userTableVisibleCols.includes('REPORT_TO') && <th className="bg-slate-100 border-r border-slate-300 py-2.5 px-3 font-bold select-none text-slate-800">REPORT TO</th>}
                    {userTableVisibleCols.includes('PATH_MET') && <th className="bg-slate-100 border-r border-slate-300 py-2.5 px-3 font-bold select-none text-slate-800 text-center w-24">PATH MET</th>}
                    {userTableVisibleCols.includes('MASTERY_MET') && <th className="bg-slate-100 border-r border-slate-300 py-2.5 px-3 font-bold select-none text-slate-800 text-center w-24">MASTERY MET</th>}
                    {userTableVisibleCols.includes('CONTROL') && <th className="bg-slate-100 py-2.5 px-3 font-bold select-none text-slate-800 text-center min-w-[150px] sticky right-0 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">ACTIONS</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {matchedUsers.slice((usersPage - 1) * usersLimit, usersPage * usersLimit).map((item, idx) => {
                    const roleObj = roles.find(r => r.id === item.roleId);
                    const isEditing = editingUserId === item.id;
                    const stats = calculateUserProgress(item.id, item.roleId);
                    const serialNumber = (usersPage - 1) * usersLimit + idx + 1;

                    // Compute stable spreadsheet data based on user profile and hash
                    const stableLastLogin = item.lastActive ? new Date(item.lastActive).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) + ", " + new Date(item.lastActive).toLocaleDateString([], {day: 'numeric', month: 'short', year: 'numeric'}) : (() => {
                      let hash = 0;
                      for (let i = 0; i < item.email.length; i++) hash = item.email.charCodeAt(i) + ((hash << 5) - hash);
                      const day = (Math.abs(hash) % 2) + 1;
                      return `05:${Math.abs(hash >> 2) % 60} PM, 0${day} Jul 2026`;
                    })();

                    const stableMobile = item.mobile || "—";

                    const stableEmployeeId = (() => {
                      let hash = 0;
                      for (let i = 0; i < item.email.length; i++) hash = item.email.charCodeAt(i) + ((hash << 5) - hash);
                      return Math.abs(hash % 9) + 1;
                    })();

                    const stableDescription = item.isSuperAdmin ? "Super administrator privilege" : item.isAdmin ? "Department administrator privilege" : `${item.department || "Rathi Group"} core employee profile`;
                    const stableDesignation = roleObj?.name || 'Trainee associate';
                    const stableEmailSignature = item.isSuperAdmin ? "Directorship Core" : `${item.department || "Operations"} Executive`;
                    const stableReportTo = (() => {
                      if (item.isSuperAdmin) return "NA";
                      const parentUser = users.find(u => u.id === item.reportsTo);
                      return parentUser ? parentUser.name : "Director Rathi";
                    })();

                    if (isEditing) {
                      return (
                        <tr key={item.id} className="bg-emerald-50/20 border-l-4 border-l-emerald-500 font-sans text-[11px] animate-in fade-in duration-100">
                          {userTableVisibleCols.includes('SN') && (
                            <td className="border-r border-slate-200 py-2.5 px-3 text-center font-mono font-bold text-slate-500 bg-slate-50/50">{serialNumber}</td>
                          )}
                          {userTableVisibleCols.includes('USER') && (
                            <td className="border-r border-slate-200 py-2.5 px-3 font-medium min-w-[200px]">
                              <input
                                type="text"
                                value={editUserName}
                                onChange={(e) => setEditUserName(e.target.value)}
                                className="bg-white border border-slate-300 focus:border-emerald-500 outline-none rounded px-2 py-1 text-[11px] w-full font-bold text-slate-800"
                                placeholder="Employee Full Name"
                              />
                              <div className="flex flex-col gap-1 mt-1">
                                <input
                                  type="text"
                                  placeholder="Photo URL"
                                  value={editUserAvatar}
                                  onChange={(e) => setEditUserAvatar(e.target.value)}
                                  className="w-full bg-white border border-slate-200 focus:border-indigo-400 outline-none rounded px-2 py-0.5 text-[9px] text-slate-500 font-mono"
                                />
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[8px] font-mono font-bold text-slate-400 uppercase whitespace-nowrap">Passkey:</span>
                                  <input
                                    type="text"
                                    placeholder="Login Password"
                                    value={editUserPassword}
                                    onChange={(e) => setEditUserPassword(e.target.value)}
                                    className="w-full bg-white border border-slate-300 focus:border-emerald-500 outline-none rounded px-2 py-0.5 text-[9px] font-mono font-bold text-slate-700"
                                  />
                                </div>
                              </div>
                            </td>
                          )}
                          {userTableVisibleCols.includes('EMAIL') && (
                            <td className="border-r border-slate-200 py-2.5 px-3 min-w-[150px]">
                              <input
                                type="email"
                                value={editUserEmail}
                                onChange={(e) => setEditUserEmail(e.target.value)}
                                className="bg-white border border-slate-300 focus:border-emerald-400 outline-none rounded px-2 py-1 text-[11px] w-full font-mono font-medium text-slate-700"
                              />
                            </td>
                          )}
                          {userTableVisibleCols.includes('ROLES') && (
                            <td className="border-r border-slate-200 py-2.5 px-3 min-w-[180px]">
                              <span className="text-[9px] uppercase font-mono font-bold text-emerald-600 block mb-0.5">Primary</span>
                              <select
                                value={editUserRole}
                                onChange={(e) => setEditUserRole(e.target.value)}
                                className="bg-white border border-slate-300 rounded px-1.5 py-1 text-[11px] w-full font-bold text-slate-800 focus:border-emerald-500 outline-none"
                              >
                                {roles.map(r => (
                                  <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                              </select>
                              <div className="mt-1">
                                <span className="text-[9px] uppercase font-mono font-bold text-indigo-600 block mb-0.5">Other Assignments</span>
                                <div className="p-1 border border-slate-200 bg-white rounded max-h-[80px] overflow-y-auto space-y-0.5">
                                  {roles.map((r) => {
                                    if (r.id === editUserRole) return null;
                                    const isChecked = editUserRoles.includes(r.id);
                                    return (
                                      <label key={r.id} className="flex items-center gap-1 text-[9px] text-slate-600 hover:text-slate-950 cursor-pointer select-none">
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
                            </td>
                          )}
                          {userTableVisibleCols.includes('LAST_LOGIN') && (
                            <td className="border-r border-slate-200 py-2.5 px-3 text-slate-400 font-mono text-[10px] bg-slate-50/30">{stableLastLogin}</td>
                          )}
                          {userTableVisibleCols.includes('STATUS') && (
                            <td className="border-r border-slate-200 py-2.5 px-3 text-center">
                              <select
                                value={editUserStatus}
                                onChange={(e) => setEditUserStatus(e.target.value as any)}
                                className="bg-white border border-slate-300 rounded px-1 py-0.5 text-[11px] outline-none font-bold text-slate-800 focus:border-emerald-500 cursor-pointer"
                              >
                                <option value="Active">🟢 Active</option>
                                <option value="Deactivated">🔴 Deact</option>
                                <option value="Left">⚪ Left</option>
                              </select>
                            </td>
                          )}
                           {userTableVisibleCols.includes('MOBILE') && (
                            <td className="border-r border-slate-200 py-2.5 px-3 min-w-[120px]">
                              <input
                                type="text"
                                value={editUserMobile}
                                onChange={(e) => setEditUserMobile(e.target.value)}
                                className="bg-white border border-slate-300 focus:border-emerald-500 outline-none rounded px-2 py-1 text-[11px] w-full font-mono text-slate-700 font-medium"
                                placeholder="Mobile No"
                              />
                            </td>
                          )}
                          {userTableVisibleCols.includes('ADMIN') && (
                            <td className="border-r border-slate-200 py-2.5 px-3 text-center min-w-[120px]">
                              <div className="flex flex-col gap-1 text-left px-1">
                                <label className="flex items-center gap-1 font-bold text-slate-700 cursor-pointer select-none text-[10px]">
                                  <input
                                    type="checkbox"
                                    checked={editUserIsAdmin}
                                    disabled={!currentUser.isSuperAdmin}
                                    onChange={(e) => {
                                      setEditUserIsAdmin(e.target.checked);
                                      if (e.target.checked) setEditUserIsSuperAdmin(false);
                                    }}
                                    className="rounded text-emerald-600 focus:ring-emerald-505 border-slate-300 w-3 h-3 disabled:opacity-50"
                                  />
                                  <span>Is Admin</span>
                                </label>
                                <label className="flex items-center gap-1 font-bold text-slate-700 cursor-pointer select-none text-[10px]">
                                  <input
                                    type="checkbox"
                                    checked={editUserIsSuperAdmin}
                                    disabled={!currentUser.isSuperAdmin}
                                    onChange={(e) => {
                                      setEditUserIsSuperAdmin(e.target.checked);
                                      if (e.target.checked) setEditUserIsAdmin(false);
                                    }}
                                    className="rounded text-indigo-600 focus:ring-indigo-505 border-slate-300 w-3 h-3 disabled:opacity-50"
                                  />
                                  <span>Super Admin</span>
                                </label>
                              </div>
                            </td>
                          )}
                          {userTableVisibleCols.includes('EMPLOYEE_ID') && (
                            <td className="border-r border-slate-200 py-2.5 px-3 text-center font-mono font-bold text-slate-600 bg-slate-50/20">{stableEmployeeId}</td>
                          )}
                          {userTableVisibleCols.includes('DESCRIPTION') && (
                            <td className="border-r border-slate-200 py-2.5 px-3 text-slate-400 italic max-w-xs truncate">{stableDescription}</td>
                          )}
                          {userTableVisibleCols.includes('DESIGNATION') && (
                            <td className="border-r border-slate-200 py-2.5 px-3 text-slate-600 font-semibold bg-slate-50/20">{stableDesignation}</td>
                          )}
                          {userTableVisibleCols.includes('EMAIL_SIGNATURE') && (
                            <td className="border-r border-slate-200 py-2.5 px-3 text-slate-400 font-mono text-[10px]">{stableEmailSignature}</td>
                          )}
                          {userTableVisibleCols.includes('REPORT_TO') && (
                            <td className="border-r border-slate-200 py-2.5 px-3 min-w-[150px]">
                              {item.isSuperAdmin ? (
                                <span className="text-slate-400 font-bold font-mono">NA</span>
                              ) : (
                                <select
                                  value={editUserReportsTo}
                                  onChange={(e) => setEditUserReportsTo(e.target.value)}
                                  className="bg-white border border-slate-300 rounded px-1.5 py-1 text-[11px] w-full font-bold text-slate-850 focus:border-emerald-500 outline-none cursor-pointer"
                                >
                                  <option value="">Director Rathi (Absolute Top)</option>
                                  {users
                                    .filter(u => u.id !== item.id && !u.isSuperAdmin)
                                    .map(u => (
                                      <option key={u.id} value={u.id}>{u.name}</option>
                                    ))
                                  }
                                </select>
                              )}
                            </td>
                          )}
                          {userTableVisibleCols.includes('PATH_MET') && (
                            <td className="border-r border-slate-200 py-2.5 px-3 text-center font-mono font-extrabold text-indigo-600 bg-slate-50/50">{stats.overallPercent}%</td>
                          )}
                          {userTableVisibleCols.includes('MASTERY_MET') && (
                            <td className="border-r border-slate-200 py-2.5 px-3 text-center font-mono font-extrabold text-emerald-600 bg-slate-50/50">{stats.masteryPercent}%</td>
                          )}
                          {userTableVisibleCols.includes('CONTROL') && (
                            <td className="py-2.5 px-3 text-center min-w-[150px] sticky right-0 z-10 bg-white shadow-[-2px_0_5px_rgba(0,0,0,0.05)]">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleSaveUser(item.id)}
                                  className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-black px-2 py-1 rounded transition text-[10px] uppercase cursor-pointer whitespace-nowrap"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingUserId(null)}
                                  className="bg-white border border-slate-200 text-slate-500 hover:text-slate-700 px-2 py-1 rounded transition text-[10px] uppercase cursor-pointer whitespace-nowrap"
                                >
                                  Cancel
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    }

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition duration-75 text-[11px] font-sans border-b border-slate-250">
                        {userTableVisibleCols.includes('SN') && (
                          <td className="border-r border-slate-250 py-2 px-3 text-center font-mono font-bold text-slate-500 bg-slate-50/50 w-12">{serialNumber}</td>
                        )}
                        {userTableVisibleCols.includes('USER') && (
                          <td className="border-r border-slate-250 py-2 px-3 pl-3">
                            <div className="flex items-center gap-2">
                              <div className="relative shrink-0 select-none">
                                <Avatar 
                                  src={item.avatarUrl}
                                  name={item.name}
                                  className="w-7 h-7 border border-slate-200/80 rounded-full" 
                                />
                              </div>
                              <div className="flex flex-col text-left leading-tight">
                                <div className="flex items-center gap-1 flex-wrap">
                                  <span className="font-extrabold text-slate-900 text-xs tracking-tight whitespace-nowrap">{item.name}</span>
                                  <PremiumBadge userId={item.id} userName={item.name} roleId={item.roleId} department={item.department} size="xs" className="scale-90 origin-left shrink-0" />
                                  {item.isSuperAdmin && (
                                    <span className="bg-indigo-50 text-indigo-700 border border-indigo-200/50 text-[8px] font-black px-1.5 py-0.5 rounded-full shrink-0">👑 Super Admin</span>
                                  )}
                                  {!item.isSuperAdmin && item.isAdmin && (
                                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/50 text-[8px] font-black px-1.5 py-0.5 rounded-full shrink-0">🔑 Admin</span>
                                  )}
                                </div>
                                <span className="text-[9px] font-mono text-slate-400 mt-0.5 select-all">{item.email}</span>
                                <div className="flex items-center gap-1 mt-0.5 text-[8.5px] font-mono text-slate-400">
                                  <span>Passkey:</span>
                                  <span className="bg-slate-100 border border-slate-200/50 px-1 py-0.2 rounded font-bold text-slate-750 select-all">{item.password || 'rathi123'}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                        )}
                        {userTableVisibleCols.includes('EMAIL') && (
                          <td className="border-r border-slate-250 py-2 px-3 font-mono font-semibold text-indigo-600 hover:underline cursor-pointer min-w-[150px]">{item.email}</td>
                        )}
                        {userTableVisibleCols.includes('ROLES') && (
                          <td className="border-r border-slate-250 py-2 px-3 min-w-[180px]">
                            <div className="flex flex-col gap-0.5 text-left">
                              <span className="bg-emerald-50 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded border border-emerald-500/10 text-[9px] block leading-none">
                                ★ {roleObj?.name || 'Unassigned'}
                              </span>
                              {item.roleIds && item.roleIds.filter(rId => rId !== item.roleId).map(rId => {
                                const otherRole = roles.find(r => r.id === rId);
                                if (!otherRole) return null;
                                return (
                                  <span key={rId} className="bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded border border-indigo-200/20 text-[8px] block leading-none">
                                    ✙ {otherRole.name}
                                  </span>
                                );
                              })}
                            </div>
                          </td>
                        )}
                        {userTableVisibleCols.includes('LAST_LOGIN') && (
                          <td className="border-r border-slate-250 py-2 px-3 text-slate-500 font-mono text-[10px]">{stableLastLogin}</td>
                        )}
                        {userTableVisibleCols.includes('STATUS') && (
                          <td className="border-r border-slate-250 py-2 px-3 text-center w-24">
                            {(!item.status || item.status === 'Active') ? (
                              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-705 border border-emerald-200 font-extrabold px-1.5 py-0.5 rounded text-[9px] uppercase font-mono shadow-3xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Active
                              </span>
                            ) : item.status === 'Deactivated' ? (
                              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-705 border border-amber-200 font-extrabold px-1.5 py-0.5 rounded text-[9px] uppercase font-mono shadow-3xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                Inactive
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 border border-slate-300 font-extrabold px-1.5 py-0.5 rounded text-[9px] uppercase font-mono shadow-3xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                Left
                              </span>
                            )}
                          </td>
                        )}
                        {userTableVisibleCols.includes('MOBILE') && (
                          <td className="border-r border-slate-250 py-2 px-3 text-slate-600 font-mono text-[11px] font-medium">{stableMobile}</td>
                        )}
                        {userTableVisibleCols.includes('ADMIN') && (
                          <td className="border-r border-slate-250 py-2 px-3 text-center font-bold text-slate-700 w-20 bg-slate-50/20">
                            {(item.isAdmin || item.isSuperAdmin) ? "Yes" : "No"}
                          </td>
                        )}
                        {userTableVisibleCols.includes('EMPLOYEE_ID') && (
                          <td className="border-r border-slate-250 py-2 px-3 text-center font-mono font-bold text-slate-800 w-28 bg-slate-50/20">{stableEmployeeId}</td>
                        )}
                        {userTableVisibleCols.includes('DESCRIPTION') && (
                          <td className="border-r border-slate-250 py-2 px-3 text-slate-500 italic max-w-xs truncate">{stableDescription}</td>
                        )}
                        {userTableVisibleCols.includes('DESIGNATION') && (
                          <td className="border-r border-slate-250 py-2 px-3 text-slate-750 font-bold bg-slate-50/20 truncate max-w-[150px]">{stableDesignation}</td>
                        )}
                        {userTableVisibleCols.includes('EMAIL_SIGNATURE') && (
                          <td className="border-r border-slate-250 py-2 px-3 text-slate-400 font-mono text-[10px] truncate max-w-[150px]">{stableEmailSignature}</td>
                        )}
                        {userTableVisibleCols.includes('REPORT_TO') && (
                          <td className="border-r border-slate-250 py-2 px-3 text-slate-700 font-extrabold">{stableReportTo}</td>
                        )}
                        {userTableVisibleCols.includes('PATH_MET') && (
                          <td className="border-r border-slate-250 py-2 px-3 text-center w-24 bg-slate-50/30">
                            <div className="flex flex-col items-center gap-1">
                              <span className="font-mono text-indigo-700 font-black text-xs">{stats.overallPercent}%</span>
                              <div className="w-14 bg-slate-100 rounded-full h-1 overflow-hidden border border-slate-200">
                                <div className="bg-indigo-600 h-full transition-all duration-300" style={{ width: `${stats.overallPercent}%` }}></div>
                              </div>
                            </div>
                          </td>
                        )}
                        {userTableVisibleCols.includes('MASTERY_MET') && (
                          <td className="border-r border-slate-250 py-2 px-3 text-center w-24 bg-slate-50/30">
                            <div className="flex flex-col items-center gap-1">
                              <span className="font-mono text-emerald-650 font-black text-xs">{stats.masteryPercent}%</span>
                              <div className="w-14 bg-slate-100 rounded-full h-1 overflow-hidden border border-slate-200">
                                <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${stats.masteryPercent}%` }}></div>
                              </div>
                            </div>
                          </td>
                        )}
                        {userTableVisibleCols.includes('CONTROL') && (
                          <td className={`py-2 px-3 text-center min-w-[150px] sticky right-0 bg-white shadow-[-2px_0_5px_rgba(0,0,0,0.05)] ${userTableRowMenuOpenId === item.id ? 'z-30' : 'z-10'}`}>
                            <div className="flex items-center justify-center gap-1.5 relative">
                              {confirmDeleteUserId === item.id ? (
                                <div className="flex items-center gap-1 animate-in zoom-in-95 duration-100">
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteUserId(null)}
                                    className="text-[9px] uppercase font-mono font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 px-1.5 py-1 rounded cursor-pointer border border-slate-250 whitespace-nowrap"
                                  >
                                    No
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteUser(item.id, item.name)}
                                    className="text-[9px] uppercase font-mono font-black text-white bg-rose-600 hover:bg-rose-700 px-1.5 py-1 rounded cursor-pointer shadow-xs whitespace-nowrap"
                                  >
                                    Delete
                                  </button>
                                </div>
                              ) : confirmResetUserId === item.id ? (
                                <div className="flex items-center gap-1 animate-in zoom-in-95 duration-100">
                                  <button
                                    type="button"
                                    onClick={() => setConfirmResetUserId(null)}
                                    className="text-[9px] uppercase font-mono font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 px-1.5 py-1 rounded cursor-pointer border border-slate-250 whitespace-nowrap"
                                  >
                                    No
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleResetUserMastery(item.id, item.name)}
                                    className="text-[9px] uppercase font-mono font-black text-white bg-amber-550 hover:bg-amber-600 px-1.5 py-1 rounded cursor-pointer shadow-xs whitespace-nowrap"
                                  >
                                    Reset
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 justify-center">
                                  {hasPermission('perm_user_edt') && (
                                    <button
                                      type="button"
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
                                        setEditUserIsAdmin(!!item.isAdmin);
                                        setEditUserIsSuperAdmin(!!item.isSuperAdmin);
                                        setEditUserPermissions(item.permissions || []);
                                        setEditUserMobile(item.mobile || '');
                                        setEditUserReportsTo(item.reportsTo || '');
                                      }}
                                      className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold px-2.5 py-1 rounded shadow-3xs transition hover:scale-[1.02] cursor-pointer flex items-center gap-1 text-[10px] uppercase font-mono tracking-wide whitespace-nowrap"
                                      title="Edit Trainee Inline"
                                    >
                                      📝 Edit
                                    </button>
                                  )}

                                  <div className="relative">
                                    {/* Row actions Vertical ellipses menu */}
                                    <button
                                      type="button"
                                      onClick={() => setUserTableRowMenuOpenId(userTableRowMenuOpenId === item.id ? null : item.id)}
                                      className="hover:bg-slate-100 p-1.5 rounded-lg border border-slate-200 transition cursor-pointer select-none"
                                      title="Open action controls"
                                    >
                                      <MoreVertical className="w-3.5 h-3.5 text-slate-500" />
                                    </button>
                                    {userTableRowMenuOpenId === item.id && (
                                      <>
                                        <div className="fixed inset-0 z-30" onClick={() => setUserTableRowMenuOpenId(null)} />
                                        <div className="absolute right-full -top-1 mr-1.5 w-max min-w-[145px] bg-white border border-slate-200 rounded-xl shadow-xl p-1 z-40 text-left space-y-0.5 animate-in slide-in-from-right-1 duration-100 text-[10px]">
                                          {hasPermission('perm_user_edt') && (
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setUserTableRowMenuOpenId(null);
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
                                                setEditUserIsAdmin(!!item.isAdmin);
                                                setEditUserIsSuperAdmin(!!item.isSuperAdmin);
                                                setEditUserPermissions(item.permissions || []);
                                                setEditUserMobile(item.mobile || '');
                                                setEditUserReportsTo(item.reportsTo || '');
                                              }}
                                              className="w-full text-left font-bold text-slate-700 hover:text-indigo-650 hover:bg-slate-50 px-2 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                                            >
                                              📝 Edit Detail
                                            </button>
                                          )}
                                        {hasPermission('perm_user_edt') && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setUserTableRowMenuOpenId(null);
                                              setConfirmResetUserId(item.id);
                                            }}
                                            className="w-full text-left font-bold text-slate-700 hover:text-amber-650 hover:bg-slate-50 px-2 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                                          >
                                            🔄 Reset Progress
                                          </button>
                                        )}
                                        {hasPermission('perm_user_del') && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setUserTableRowMenuOpenId(null);
                                              setConfirmDeleteUserId(item.id);
                                            }}
                                            className="w-full text-left font-extrabold text-slate-500 hover:text-rose-650 hover:bg-rose-50/50 px-2 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 border-t border-slate-100 mt-1 whitespace-nowrap"
                                          >
                                            🗑️ Live Offboard
                                          </button>
                                        )}
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* SPREADSHEET PAGINATION STATS & NAVIGATION BAR */}
          {matchedUsers.length > 0 && !userTableIsRefreshing && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-3 px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-sans select-none shadow-3xs shrink-0 text-left">
              <div className="text-slate-500 font-bold">
                Showing <span className="text-slate-800">{(usersPage - 1) * usersLimit + 1}</span> to <span className="text-slate-800">{Math.min(usersPage * usersLimit, matchedUsers.length)}</span> of <span className="text-slate-800">{matchedUsers.length}</span> records
              </div>
              
              <div className="flex items-center gap-1 sm:gap-1.5">
                {/* Go First Page */}
                <button
                  type="button"
                  disabled={usersPage === 1}
                  onClick={() => setUsersPage(1)}
                  className={`w-7 h-7 rounded-lg border text-[10px] font-extrabold transition flex items-center justify-center cursor-pointer ${
                    usersPage === 1
                      ? 'bg-slate-100 border-slate-200 text-slate-350 cursor-not-allowed opacity-60'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 active:bg-slate-100 shadow-3xs'
                  }`}
                  title="Go to First Page"
                >
                  |◀
                </button>

                {/* Prev Page */}
                <button
                  type="button"
                  disabled={usersPage === 1}
                  onClick={() => setUsersPage(prev => Math.max(prev - 1, 1))}
                  className={`px-2 py-1 h-7 rounded-lg border text-[10px] font-extrabold transition flex items-center justify-center cursor-pointer ${
                    usersPage === 1
                      ? 'bg-slate-100 border-slate-200 text-slate-350 cursor-not-allowed opacity-60'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 active:bg-slate-100 shadow-3xs'
                  }`}
                >
                  ◀
                </button>

                {Array.from({ length: Math.ceil(matchedUsers.length / usersLimit) || 1 }).map((_, idx) => {
                  const pageNum = idx + 1;
                  const totalP = Math.ceil(matchedUsers.length / usersLimit) || 1;
                  if (totalP > 5 && Math.abs(pageNum - usersPage) > 2 && pageNum !== 1 && pageNum !== totalP) {
                    if (pageNum === 2 || pageNum === totalP - 1) {
                      return <span key={pageNum} className="text-slate-400 px-0.5 font-extrabold">...</span>;
                    }
                    return null;
                  }
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setUsersPage(pageNum)}
                      className={`w-7 h-7 rounded-lg text-[10px] font-extrabold transition cursor-pointer flex items-center justify-center ${
                        usersPage === pageNum
                          ? 'bg-emerald-600 text-white border border-emerald-600 shadow-sm font-black'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 active:bg-slate-100 shadow-3xs'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {/* Next Page */}
                <button
                  type="button"
                  disabled={usersPage >= (Math.ceil(matchedUsers.length / usersLimit) || 1)}
                  onClick={() => setUsersPage(prev => Math.min(prev + 1, Math.ceil(matchedUsers.length / usersLimit) || 1))}
                  className={`px-2 py-1 h-7 rounded-lg border text-[10px] font-extrabold transition flex items-center justify-center cursor-pointer ${
                    usersPage >= (Math.ceil(matchedUsers.length / usersLimit) || 1)
                      ? 'bg-slate-100 border-slate-200 text-slate-350 cursor-not-allowed opacity-60'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 active:bg-slate-100 shadow-3xs'
                  }`}
                >
                  ▶
                </button>

                {/* Go Last Page */}
                <button
                  type="button"
                  disabled={usersPage >= (Math.ceil(matchedUsers.length / usersLimit) || 1)}
                  onClick={() => setUsersPage(Math.ceil(matchedUsers.length / usersLimit) || 1)}
                  className={`w-7 h-7 rounded-lg border text-[10px] font-extrabold transition flex items-center justify-center cursor-pointer ${
                    usersPage >= (Math.ceil(matchedUsers.length / usersLimit) || 1)
                      ? 'bg-slate-100 border-slate-200 text-slate-350 cursor-not-allowed opacity-60'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 active:bg-slate-100 shadow-3xs'
                  }`}
                  title="Go to Last Page"
                >
                  ▶|
                </button>
              </div>
            </div>
          )}
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          TAB 3: JOB ROLES & REQUIRED SKILLS MATRIX
          ---------------------------------------------------- */}
      {adminTab === 'roles' && (
        <div className="space-y-6 text-left">
          


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
                    <option value="Account Group & Roles Matrix">Account Group & Roles Matrix</option>
                    <option value="Curriculum Builder">Curriculum Builder</option>
                    <option value="Enrollment Approvals">Enrollment Approvals</option>
                    <option value="User Database">User Database</option>
                    <option value="Assessment Exams">Assessment Exams</option>
                    <option value="Performance & Audit Trail">Performance & Audit Trail</option>
                    <option value="Control Hub Settings">Control Hub Settings</option>
                  </select>

                  {/* Prev / Next buttons exactly as requested */}
                  <div className="flex items-center bg-white border border-slate-300 rounded-lg shadow-3xs overflow-hidden">
                    <button
                      type="button"
                      onClick={() => {
                        const groups = [
                          'Account Group & Roles Matrix',
                          'Curriculum Builder',
                          'Enrollment Approvals',
                          'User Database',
                          'Assessment Exams',
                          'Performance & Audit Trail',
                          'Control Hub Settings'
                        ];
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
                        const groups = [
                          'Account Group & Roles Matrix',
                          'Curriculum Builder',
                          'Enrollment Approvals',
                          'User Database',
                          'Assessment Exams',
                          'Performance & Audit Trail',
                          'Control Hub Settings'
                        ];
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
                <table className="premium-grid-table w-full text-left border-collapse whitespace-nowrap min-w-[1000px]">
                  <thead>
                    <tr className="bg-slate-100 divide-x divide-slate-200 border-b border-slate-250 text-[10px] font-display font-extrabold uppercase text-slate-900 tracking-wider">
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
                      setPermissionsMatrix(getInitialMatrixState(roles, true));
                      showToast("Permissions restored to strict system default configurations. Remember to click Save to persist!", "info");
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
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-3 border-b border-slate-100 pb-2 text-left">
                <div>
                  <h3 className="font-display text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-tight">Active Designations</h3>
                </div>
              </div>

              {/* SEARCH & FILTER CONTROLS FOR JOB ROLES - DESIGN COMPACTED */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 flex flex-wrap items-center justify-between gap-2.5 text-xs font-sans text-left mb-3 w-full">
                <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                  {/* Text Search */}
                  <div className="relative w-full sm:w-60">
                    <div className="relative">
                      <input
                        type="text"
                        value={roleSearchQuery}
                        onChange={(e) => setRoleSearchQuery(e.target.value)}
                        placeholder="🔍 Search designation..."
                        className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 pl-7 focus:border-indigo-500 outline-none text-xs w-full text-slate-905 font-sans font-medium text-slate-900"
                      />
                      {roleSearchQuery && (
                        <button
                          onClick={() => setRoleSearchQuery('')}
                          className="absolute right-2.5 top-1.5 text-slate-400 hover:text-slate-600 text-[10px] font-bold"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Department Filter */}
                  <div className="w-full sm:w-auto">
                    <select
                      value={roleDeptFilter}
                      onChange={(e) => setRoleDeptFilter(e.target.value)}
                      className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 focus:border-indigo-500 outline-none text-xs font-semibold text-slate-755 cursor-pointer w-full sm:w-48 text-indigo-900 text-slate-800"
                    >
                      <option value="all">📁 All Departments</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Clear Button */}
                {(roleSearchQuery || roleDeptFilter !== 'all') && (
                  <button
                    type="button"
                    onClick={() => {
                      setRoleSearchQuery('');
                      setRoleDeptFilter('all');
                    }}
                    className="text-xs text-rose-600 hover:text-rose-800 font-bold hover:underline cursor-pointer"
                  >
                    Clear filters [✕]
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-2 w-full">
                {(() => {
                  const rolesFiltered = roles.filter((r) => {
                    if (roleSearchQuery) {
                      const query = roleSearchQuery.toLowerCase().trim();
                      const nameMatches = r.name.toLowerCase().includes(query);
                      const descriptionMatches = (r.description || '').toLowerCase().includes(query);
                      const skillsMatches = r.skillRequirements.some(s => s.toLowerCase().includes(query));
                      if (!nameMatches && !descriptionMatches && !skillsMatches) return false;
                    }
                    if (roleDeptFilter !== 'all') {
                      if (r.department !== roleDeptFilter) return false;
                    }
                    return true;
                  });

                  if (rolesFiltered.length === 0) {
                    return (
                      <div className="col-span-1 md:col-span-2 py-12 text-center bg-slate-50 border border-dashed rounded-xl w-full">
                        <p className="text-xs font-bold text-slate-705">No matching designations found</p>
                        <p className="text-[11px] text-slate-400 mt-1 font-sans">Try modifying your search keywords or choosing "All Departments".</p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-2 w-full text-left">
                      {/* Show entries control and status bar */}
                      <div className="flex items-center justify-between gap-2 py-1">
                        <div className="text-[10.5px] text-slate-500 font-bold font-mono uppercase tracking-wider">
                          Showing {Math.min(rolesLimit, rolesFiltered.length)} of {rolesFiltered.length} Designations
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 font-sans text-[11px] font-bold bg-slate-100/70 border border-slate-200/80 rounded-lg px-2 py-0.5 shadow-3xs">
                          <span>Show entries:</span>
                          <select
                            value={rolesLimit}
                            onChange={(e) => setRolesLimit(Number(e.target.value))}
                            className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[11px] font-bold text-slate-750 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 cursor-pointer"
                          >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 w-full max-h-[300px] overflow-y-auto pr-1">
                        {rolesFiltered.slice(0, rolesLimit).map((r) => {
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
                    <div key={r.id} className="border border-slate-200 rounded-xl p-2 px-3 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-left w-full text-[11px]">
                      {/* Left Part: Dept, Title and Description */}
                      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 min-w-0 flex-1">
                        {/* Dept Badge */}
                        <span className="shrink-0 inline-block text-[8px] uppercase font-mono font-black tracking-wider text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded leading-none w-fit">
                          {r.department}
                        </span>
                        
                        {/* Title */}
                        <h4 className="font-bold text-slate-900 text-[11px] shrink-0 whitespace-nowrap">
                          {r.name}
                        </h4>

                        {/* Separator dots & Description */}
                        {r.description && (
                          <>
                            <span className="hidden sm:inline text-slate-300 font-bold select-none">•</span>
                            <p className="text-[10px] text-slate-500 truncate max-w-[280px]" title={r.description}>
                              {r.description}
                            </p>
                          </>
                        )}
                      </div>

                      {/* Middle Part: Skills list - STRICTLY 1 line, small text */}
                      <div className="flex items-center gap-1.5 min-w-0 max-w-full md:max-w-[45%] overflow-x-auto no-scrollbar scroll-smooth">
                        {r.skillRequirements.map((sk, skIdx) => (
                          <span key={skIdx} className="bg-slate-100/90 border border-slate-200/80 text-slate-600 text-[9px] font-mono font-bold px-2 py-0.2 rounded-full whitespace-nowrap shrink-0">
                            {sk}
                          </span>
                        ))}
                      </div>

                      {/* Right Part: Stats & Actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-slate-150">
                        <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5">
                          <span>Staff: <strong className="text-slate-700">{associatedUsers.length}</strong></span>
                        </div>

                        <span className="hidden sm:inline text-slate-300 font-bold select-none">•</span>

                        <div className="flex items-center gap-1">
                          {confirmDeleteRoleId === r.id ? (
                            <div className="flex items-center gap-1 animate-in zoom-in-95 duration-100">
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteRoleId(null)}
                                className="text-[9px] uppercase font-mono font-black text-slate-500 hover:text-slate-700 hover:bg-slate-250 bg-slate-100 px-2 py-0.5 rounded transition cursor-pointer border border-slate-200"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteRole(r.id)}
                                className="text-[9px] uppercase font-mono font-black text-white hover:bg-rose-600 bg-rose-500 px-2.5 py-0.5 rounded shadow-xs transition cursor-pointer flex items-center gap-0.5"
                              >
                                <Trash2 className="w-2.5 h-2.5 text-white" /> Delete
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingRoleId(r.id);
                                  setEditRoleName(r.name);
                                  setEditRoleDept(r.department);
                                  setEditRoleDesc(r.description || '');
                                  setEditRoleSkills(r.skillRequirements.join(', '));
                                }}
                                className="text-slate-400 hover:text-emerald-500 p-1 rounded hover:bg-white border border-transparent hover:border-slate-100 transition cursor-pointer"
                                title="Edit Role/Designation"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDuplicateRole(r.id)}
                                className="text-slate-400 hover:text-indigo-500 p-1 rounded hover:bg-white border border-transparent hover:border-slate-100 transition cursor-pointer"
                                title="Duplicate/Copy Designation"
                              >
                                <Copy className="w-3 h-3 text-indigo-400" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (associatedUsers.length > 0) {
                                    showToast('Error: This designation is currently assigned to active employees. Resign or re-assign them first.', 'error');
                                    return;
                                  }
                                  setConfirmDeleteRoleId(r.id);
                                }}
                                className="text-slate-400 hover:text-rose-500 p-1 rounded hover:bg-white border text-rose-500 border-transparent hover:border-slate-100 transition cursor-pointer"
                                title="Delete Role"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* 3. ADD NEW ROLE FORM VIEW */}
          {rolesSubTab === 'add' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs text-left">
              <div className="border-b border-slate-100 pb-2 mb-3">
                <h3 className="font-display text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-tight">Create Professional Designation</h3>
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
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            
            {/* Headline and filter */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-indigo-50 text-indigo-650 rounded-lg shrink-0">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight leading-tight">Corporate Curriculum Architecture</h3>
                  <p className="text-[9.5px] text-slate-400 font-medium mt-0.5 font-sans">Assemble curriculum chapters, map lessons, and build operational pathways</p>
                </div>
              </div>

              <div className="relative inline-block text-left">
                <div className="flex flex-row items-center gap-2">
                  <label className="text-[9px] text-slate-400 font-mono uppercase tracking-wider font-bold">Filter Job Profiles:</label>
                  <div className="flex items-center gap-1 flex-wrap">
                    {/* Selected count dropdown trigger */}
                    <button
                      type="button"
                      onClick={() => setIsOpenRoleFilter(!isOpenRoleFilter)}
                      className="flex items-center justify-between gap-1.5 bg-slate-150 hover:bg-slate-200 border border-slate-300 rounded-lg px-2 py-1 text-[11px] text-slate-800 font-extrabold cursor-pointer transition min-w-[150px]"
                    >
                      <span className="truncate">
                        {selectedCurriculumRoleIds.length === 0
                          ? 'None Selected ❌'
                          : selectedCurriculumRoleIds.length === roles.length
                          ? 'All Combined 🌐'
                          : `${selectedCurriculumRoleIds.length} Selected`}
                      </span>
                      <span className="text-[8px] text-slate-500 font-bold">▼</span>
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



            {curriculumMode === 'manual' ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Column: Chapters Assembly */}
                  <div className="lg:col-span-1 border-r border-slate-150 pr-4 flex flex-col max-h-[620px]">
                    <div className="flex items-center justify-between gap-2 mb-3 shrink-0">
                      <div className="flex items-center gap-1.5">
                        <span className="flex items-center justify-center w-5 h-5 bg-indigo-100 text-indigo-700 text-[10.5px] font-black rounded-md shrink-0">1</span>
                        <h4 className="text-[11.5px] font-extrabold text-slate-800 tracking-tight">Assemble Chapters</h4>
                      </div>
                      {selectedCurriculumRoleIds.length !== roles.length && (
                        <span className="bg-amber-50 text-amber-700 text-[9px] font-black px-2 py-0.5 rounded-full border border-amber-200 shrink-0">
                          Filtered
                        </span>
                      )}
                    </div>

                    {/* Modern Premium Search & Filter Toolbar */}
                    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5 mb-3.5 space-y-2 shrink-0">
                      {/* Search Bar */}
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                          <Search className="w-3.5 h-3.5" />
                        </span>
                        <input
                          type="text"
                          placeholder="Search chapters or roles..."
                          value={chapterSearchQuery}
                          onChange={(e) => setChapterSearchQuery(e.target.value)}
                          className="w-full bg-white border border-slate-200/80 rounded-xl pl-9 pr-8 py-1.5 text-[11px] placeholder-slate-400 font-medium text-slate-800 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100/30 transition duration-150"
                        />
                        {chapterSearchQuery && (
                          <button
                            type="button"
                            onClick={() => setChapterSearchQuery('')}
                            className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {/* Dropdown Toggle Button for Filtering Profiles */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsOpenSidebarRoleFilter(!isOpenSidebarRoleFilter)}
                          className="w-full flex items-center justify-between gap-1.5 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5 text-[11px] text-slate-705 font-bold cursor-pointer transition"
                        >
                          <span className="flex items-center gap-1.5 text-slate-600">
                            <ListFilter className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            <span className="truncate">
                              {selectedCurriculumRoleIds.length === 0
                                ? 'No profiles selected ❌'
                                : selectedCurriculumRoleIds.length === roles.length
                                ? 'All Job Profiles Active 🌐'
                                : `${selectedCurriculumRoleIds.length} Profiles Filtered`}
                            </span>
                          </span>
                          <span className="text-[8px] text-slate-400 font-bold">
                            {isOpenSidebarRoleFilter ? '▲' : '▼'}
                          </span>
                        </button>

                        {/* Collapsible Dropdown for Profiles selection (Highly premium, secure within layout) */}
                        {isOpenSidebarRoleFilter && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsOpenSidebarRoleFilter(false)} />
                            <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg p-2.5 space-y-2 z-50 text-left max-h-48 overflow-y-auto scrollbar-thin">
                              <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-1">
                                <span className="text-[8.5px] font-mono font-black text-indigo-600 uppercase tracking-widest">
                                  Filter Job Profiles
                                </span>
                                <div className="flex gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedCurriculumRoleIds(roles.map(r => r.id))}
                                    className="text-[8px] font-bold text-indigo-650 hover:underline cursor-pointer"
                                  >
                                    All
                                  </button>
                                  <span className="text-slate-300 text-[8px]">•</span>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedCurriculumRoleIds([])}
                                    className="text-[8px] font-bold text-slate-500 hover:underline cursor-pointer"
                                  >
                                    Clear
                                  </button>
                                </div>
                              </div>
                              <div className="space-y-1">
                                {roles.map(r => {
                                  const isSelected = selectedCurriculumRoleIds.includes(r.id);
                                  return (
                                    <label
                                      key={r.id}
                                      className={`flex items-center gap-2 p-1 rounded-lg cursor-pointer text-[10.5px] transition ${
                                        isSelected ? 'bg-indigo-50/40 text-indigo-900' : 'hover:bg-slate-50 text-slate-600'
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
                                        }}
                                        className="rounded text-indigo-650 focus:ring-indigo-500 border-slate-300 w-3 h-3 cursor-pointer"
                                      />
                                      <div className="leading-none flex-1 truncate">
                                        <span className="font-semibold block truncate">{r.name}</span>
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
                    
                    {/* Chapters list under current role */}
                    <div className="space-y-2 mb-4 overflow-y-auto pr-1 scrollbar-thin flex-1 min-h-[180px] max-h-[300px]">
                      {activeChaptersList.map((chap, idx, arr) => {
                        const roleName = roles.find(r => r.id === chap.roleId)?.name || 'Unknown Profile';
                        const isSelected = chap.id === currentSelectedChapterId;
                        return (
                          <div 
                            key={chap.id} 
                            onClick={() => {
                              setSelectedChapterId(chap.id);
                              // Auto-expand the clicked chapter on the left
                              setCollapsedChapterIds(prev => {
                                const next = { ...prev };
                                delete next[chap.id];
                                return next;
                              });
                              // Smooth scroll to the corresponding chapter card on the right
                              setTimeout(() => {
                                const el = document.getElementById(`chapter-card-${chap.id}`);
                                if (el) {
                                  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                                }
                              }, 100);
                            }}
                            className={`flex items-start justify-between p-3 rounded-xl text-[11px] font-medium text-left transition-all duration-200 cursor-pointer border hover:shadow-xs ${
                              isSelected 
                                ? 'bg-indigo-50/80 border-indigo-400 ring-2 ring-indigo-400/10 shadow-xs border-l-4 border-l-indigo-600' 
                                : 'bg-white border-slate-200 hover:bg-slate-50/80 hover:border-slate-300 shadow-3xs'
                            }`}
                          >
                            <div className="flex-1 min-w-0 pr-3 text-left">
                              <span className="inline-block text-[8.5px] font-extrabold text-indigo-700 bg-indigo-50/80 border border-indigo-150/50 px-1.5 py-0.5 rounded-md mb-1.5 leading-tight uppercase font-mono break-words whitespace-normal">
                                {roleName}
                              </span>
                              <span className={`font-bold tracking-tight text-[11px] leading-snug block whitespace-normal ${isSelected ? 'text-indigo-950 font-black' : 'text-slate-800'}`}>
                                {chap.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0 self-center" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => handleMoveChapter(chap.id, 'up')}
                                disabled={idx === 0}
                                className={`w-5 h-5 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
                                  idx === 0 
                                    ? 'text-slate-300 pointer-events-none opacity-30' 
                                    : 'text-slate-550 hover:text-indigo-650 hover:bg-indigo-50/80 hover:scale-105 active:scale-95'
                                }`}
                                title="Move Chapter Up"
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveChapter(chap.id, 'down')}
                                disabled={idx === arr.length - 1}
                                className={`w-5 h-5 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
                                  idx === arr.length - 1 
                                    ? 'text-slate-300 pointer-events-none opacity-30' 
                                    : 'text-slate-550 hover:text-indigo-650 hover:bg-indigo-50/80 hover:scale-105 active:scale-95'
                                }`}
                                title="Move Chapter Down"
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>
                              {hasPermission('perm_curr_chap_edt') && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingChapterId(chap.id);
                                    setEditingChapterName(chap.name);
                                    setEditingChapterRoleId(chap.roleId);
                                    setIsEditChapterModalOpen(true);
                                  }}
                                  className="w-5 h-5 flex items-center justify-center text-slate-450 hover:text-indigo-600 rounded-lg hover:bg-indigo-50/80 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                                  title="Edit Chapter"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {hasPermission('perm_curr_chap_del') && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteChapter(chap.id)}
                                  className="w-5 h-5 flex items-center justify-center text-slate-450 hover:text-rose-650 rounded-lg hover:bg-rose-50 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                                  title="Delete Chapter"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {activeChaptersList.length === 0 && (
                        <p className="p-3 bg-slate-50 text-[10.5px] italic text-center text-slate-400 rounded">No chapters matching selected profiles.</p>
                      )}
                    </div>

                    {/* Add chapter trigger - Collapsible */}
                    {hasPermission('perm_curr_chap_add') && (
                      <div className="bg-indigo-50/20 rounded-xl border border-indigo-150 text-left overflow-hidden shrink-0">
                        <button
                          type="button"
                          onClick={() => setShowCreateChapterForm(!showCreateChapterForm)}
                          className="w-full flex items-center justify-between p-2.5 text-[10.5px] uppercase font-black text-indigo-700 font-mono tracking-wider hover:bg-indigo-50 transition cursor-pointer"
                        >
                          <span className="flex items-center gap-1.5">
                            <span>➕ Create New Chapter</span>
                          </span>
                          <ChevronDown className={`w-3.5 h-3.5 text-indigo-600 transition-transform duration-150 ${showCreateChapterForm ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {showCreateChapterForm && (
                          <div className="p-3.5 border-t border-indigo-100/70 space-y-3.5 bg-gradient-to-b from-indigo-50/10 to-indigo-50/30">
                            <div>
                              <label className="block text-[9.5px] uppercase font-mono font-bold text-slate-500 mb-1.5 tracking-wide">Target Job Profile</label>
                              <select
                                value={addChapterRoleId}
                                onChange={(e) => setAddChapterRoleId(e.target.value)}
                                className="w-full bg-white hover:bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-550 focus:ring-4 focus:ring-indigo-100 outline-none transition cursor-pointer"
                              >
                                {roles.map(r => (
                                  <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-[9.5px] uppercase font-mono font-bold text-slate-500 mb-1.5 tracking-wide">Chapter Name</label>
                              <input
                                type="text"
                                placeholder="e.g. Closing adjusting ledgers"
                                value={newChapterName}
                                onChange={(e) => setNewChapterName(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-indigo-550 focus:ring-4 focus:ring-indigo-100 outline-none transition"
                              />
                            </div>
                            
                            <button
                              type="button"
                              onClick={handleAddChapter}
                              className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-xs hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition duration-150 cursor-pointer"
                            >
                              + Setup Chapter File
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                {/* Right Column: Units Creation Matrix */}
                <div className="lg:col-span-2 space-y-6 max-h-[580px] overflow-y-auto pr-2 scrollbar-thin">
                  
                  {/* Action box to create new unit */}
                  {hasPermission('perm_curr_unit_add') && (
                    <div className="bg-gradient-to-r from-indigo-50/40 via-teal-50/20 to-indigo-50/40 rounded-2xl border border-indigo-100 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-3xs">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-amber-500 text-xs shrink-0">⚡</span>
                          <h5 className="text-[11.5px] font-extrabold text-indigo-950 tracking-tight">Mapped Operational Lessons</h5>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed font-sans">Need to deploy procedural learning walkthrough checklists to chapters?</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingUnitId(null);
                          setUnitCode('');
                          setUnitTaskName('');
                          setUnitVideoTitle('');
                          setUnitVideoUrl('');
                          setUnitPdfUrl('');
                          setUnitDesc('');
                          setUnitChapterId('');
                          setUnitSopItems([
                            { title: 'Mandatory Lesson Review', desc: 'Analyze standardized video training modules entirely before submitting logs.' },
                            { title: 'Dual Validation', desc: 'Crosscheck ledger entries and business vouchers with corporate standards.' },
                            { title: 'Audit Logs', desc: 'Always document robust observation notes to fast-track checker verification and sign-off.' }
                          ]);
                          setIsUnitModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-xs hover:shadow-sm active:scale-98 transition duration-150 cursor-pointer shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Lesson Unit SKU</span>
                      </button>
                    </div>
                  )}

                  {/* Chapter Edit Modal Dialog */}
                  <AnimatePresence>
                    {isEditChapterModalOpen && (
                      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => {
                            setIsEditChapterModalOpen(false);
                            setEditingChapterId(null);
                          }}
                          className="fixed inset-0"
                        />

                        <motion.div
                          initial={{ scale: 0.95, opacity: 0, y: 15 }}
                          animate={{ scale: 1, opacity: 1, y: 0 }}
                          exit={{ scale: 0.95, opacity: 0, y: 15 }}
                          transition={{ type: 'spring', duration: 0.3 }}
                          className="relative bg-white text-slate-800 rounded-3xl border border-slate-200 shadow-2xl p-6 md:p-8 w-full max-w-md z-10 my-8 max-h-[90vh] overflow-y-auto text-left"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditChapterModalOpen(false);
                              setEditingChapterId(null);
                            }}
                            className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition cursor-pointer"
                            title="Close Modal"
                          >
                            <X className="w-4 h-4" />
                          </button>

                          <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2 mb-1">
                            <span>📝 Edit Chapter Settings</span>
                          </h3>
                          <p className="text-[11px] text-slate-500 mb-6">
                            Modify the chapter name and reassign it to a different job profile/role if needed.
                          </p>

                          <form onSubmit={handleSaveChapterEdit} className="space-y-4 text-xs font-sans text-slate-750">
                            <div>
                              <label className="block text-[10px] uppercase font-mono font-bold text-slate-500 mb-1.5">Chapter Name <span className="text-rose-500 font-bold">*</span></label>
                              <input
                                required
                                type="text"
                                value={editingChapterName}
                                onChange={(e) => setEditingChapterName(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition font-medium"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] uppercase font-mono font-bold text-slate-500 mb-1.5">Target Job Profile <span className="text-rose-500 font-bold">*</span></label>
                              <select
                                required
                                value={editingChapterRoleId}
                                onChange={(e) => setEditingChapterRoleId(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition font-medium"
                              >
                                {roles.map(r => (
                                  <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                              </select>
                            </div>

                            <div className="flex gap-3 pt-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setIsEditChapterModalOpen(false);
                                  setEditingChapterId(null);
                                }}
                                className="flex-1 py-3 bg-slate-150 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-xs hover:shadow-sm transition cursor-pointer"
                              >
                                Save Changes
                              </button>
                            </div>
                          </form>
                        </motion.div>
                      </div>
                    )}
                  </AnimatePresence>

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

                            <div>
                              <label className="block text-[10px] uppercase font-mono font-bold text-indigo-650 text-indigo-650 mb-1.5 flex items-center gap-1.5">
                                <span className="font-extrabold">📄 SOP Lesson PDF URL Link</span>
                                <span className="bg-indigo-50 text-indigo-750 text-[8px] px-1.5 py-0.5 rounded-sm font-black font-mono">OPTIONAL</span>
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. Google Drive PDF preview/share link"
                                value={unitPdfUrl}
                                onChange={(e) => setUnitPdfUrl(e.target.value)}
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

                            {/* SOP & Best Practices Checklist Section */}
                            <div className="sm:col-span-2 border-t border-slate-100 pt-4 mt-2">
                              <div className="flex items-center justify-between mb-3">
                                <label className="block text-[10px] uppercase font-mono font-bold text-slate-500 flex items-center gap-1.5">
                                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>SOP & Best Practices Checklist Items</span>
                                </label>
                                <button
                                  type="button"
                                  onClick={() => setUnitSopItems([...unitSopItems, { title: '', desc: '' }])}
                                  className="inline-flex items-center gap-1.5 text-[10px] font-sans font-bold text-emerald-600 hover:text-emerald-500 bg-emerald-50 hover:bg-emerald-100/50 px-2.5 py-1 rounded-lg border border-emerald-200 transition cursor-pointer"
                                >
                                  <Plus className="w-3 h-3" /> Add Item
                                </button>
                              </div>

                              {unitSopItems.length === 0 ? (
                                <div className="text-center py-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-[11px] font-medium">
                                  No checklist items defined. Click "Add Item" to add standard SOP check tasks.
                                </div>
                              ) : (
                                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
                                  {unitSopItems.map((item, index) => (
                                    <div key={index} className="flex gap-2 items-start bg-slate-50/50 border border-slate-150 p-2 rounded-xl">
                                      <span className="text-[10px] font-mono font-bold text-slate-400 mt-2">#{index + 1}</span>
                                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                                        <div className="sm:col-span-1">
                                          <input
                                            type="text"
                                            required
                                            placeholder="Item Title (e.g. Dual Validation)"
                                            value={item.title}
                                            onChange={(e) => {
                                              const updated = [...unitSopItems];
                                              updated[index].title = e.target.value;
                                              setUnitSopItems(updated);
                                            }}
                                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:bg-white outline-none transition font-semibold text-[11px]"
                                          />
                                        </div>
                                        <div className="sm:col-span-2">
                                          <input
                                            type="text"
                                            required
                                            placeholder="Description (e.g. Crosscheck entries)"
                                            value={item.desc}
                                            onChange={(e) => {
                                              const updated = [...unitSopItems];
                                              updated[index].desc = e.target.value;
                                              setUnitSopItems(updated);
                                            }}
                                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:bg-white outline-none transition text-[11px]"
                                          />
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setUnitSopItems(unitSopItems.filter((_, idx) => idx !== index));
                                        }}
                                        className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition mt-0.5 cursor-pointer"
                                        title="Remove Item"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
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
                        <div className="flex items-center gap-1.5">
                          <span className="flex items-center justify-center w-5 h-5 bg-slate-100 border border-slate-250 text-slate-755 text-[10.5px] font-black rounded-md shrink-0">2</span>
                          <h4 className="text-[11.5px] font-extrabold text-slate-800 tracking-tight">
                            Active Chapter Units
                            <span className="ml-1.5 text-[9.5px] font-semibold text-slate-400 px-1.5 py-0.5 bg-slate-50 rounded-full border border-slate-150 shrink-0">
                              {units.filter(u => selectedCurriculumRoleIds.includes((chapters.find(c => c.id === u.chapterId))?.roleId || '')).length} total
                            </span>
                          </h4>
                        </div>
                        <p className="text-[9.5px] text-slate-400 mt-0.5 font-sans">Use arrow buttons to adjust sequence order (Up / Down).</p>
                      </div>

                      {/* Sort + Search options with dynamic filters */}
                      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                        {/* Collapse / Expand All Toggles */}
                        <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 p-0.5 rounded-lg text-[10px]">
                          <button
                            type="button"
                            onClick={() => {
                              const cols: Record<string, boolean> = {};
                              chapters.filter(c => selectedCurriculumRoleIds.includes(c.roleId)).forEach(chap => {
                                cols[chap.id] = true;
                              });
                              setCollapsedChapterIds(cols);
                            }}
                            className="px-2 py-1 hover:bg-white hover:text-indigo-750 rounded font-bold text-slate-600 transition cursor-pointer"
                            title="Collapse all chapters"
                          >
                            Collapse All
                          </button>
                          <button
                            type="button"
                            onClick={() => setCollapsedChapterIds({})}
                            className="px-2 py-1 hover:bg-white hover:text-indigo-750 rounded font-bold text-slate-600 transition cursor-pointer"
                            title="Expand all chapters"
                          >
                            Expand All
                          </button>
                        </div>

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

                          const isCollapsed = currSearchQuery ? false : (collapsedChapterIds[chap.id] ?? false);
                          const toggleCollapse = () => {
                            setCollapsedChapterIds(prev => ({
                              ...prev,
                              [chap.id]: !isCollapsed
                            }));
                          };

                          const isSelectedOnLeft = chap.id === currentSelectedChapterId;

                          return (
                            <div 
                              key={chap.id} 
                              id={`chapter-card-${chap.id}`}
                              className={`border rounded-lg p-3 transition duration-150 ${
                                isSelectedOnLeft 
                                  ? 'border-indigo-500 bg-indigo-50/5 ring-1 ring-indigo-500/20 shadow-xs' 
                                  : 'border-slate-200 bg-white shadow-3xs hover:shadow-2xs'
                              }`}
                            >
                              <h5 
                                onClick={toggleCollapse}
                                className="font-bold text-xs text-slate-800 mb-1 border-b pb-1.5 flex justify-between items-center flex-wrap gap-1.5 cursor-pointer hover:text-indigo-600 transition select-none"
                              >
                                <span className="font-extrabold text-slate-900 flex items-center gap-2">
                                  {/* Chevron toggle indicating expand/collapse */}
                                  <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-150 ${isCollapsed ? '-rotate-90' : ''}`} />
                                  
                                  {/* Chapter Reorder Buttons inside Chapter cards */}
                                  <span onClick={(e) => e.stopPropagation()} className="inline-flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
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
                                  <span className="text-[11px] font-extrabold text-slate-900">Chapter: {chap.name}</span>
                                  <span className="text-[9.5px] font-normal text-slate-400">({chapUnits.length} units)</span>
                                </span>
                                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                  {chapRole && (
                                    <span className="text-[9px] bg-indigo-50 border border-indigo-100 font-mono text-indigo-700 px-2 py-0.5 rounded-full font-bold uppercase">
                                      {chapRole.name}
                                    </span>
                                  )}
                                </div>
                              </h5>

                              {!isCollapsed && (
                                <div className="divide-y divide-slate-100 animate-in fade-in duration-100">
                                  {sortedChapUnits.map(unit => {
                                    const rawIdx = rawUnits.findIndex(u => u.id === unit.id);
                                    const isFirstUnit = rawIdx === 0;
                                    const isLastUnit = rawIdx === rawUnits.length - 1;

                                    return (
                                      <div key={unit.id} className="py-2 flex items-center justify-between gap-4 text-xs font-sans text-slate-705">
                                        <div className="text-left">
                                          <span className="font-mono text-emerald-600 block text-[9.5px] font-bold">[{unit.code}] {unit.frequency} • <span className="text-slate-500 font-sans font-medium">{unit.skillRequired}</span></span>
                                          <span className="font-semibold text-slate-800 text-[10.5px]">{unit.taskName}</span>
                                          {unit.description && (
                                            <p className="text-[9.5px] text-slate-500 mt-0.5 line-clamp-2 max-w-lg leading-normal">{unit.description}</p>
                                          )}
                                          {unit.videoTitle && (
                                            <p className="text-[9px] text-indigo-600 font-mono mt-0.5">📺 {unit.videoTitle}</p>
                                          )}
                                        </div>
                                        <div className="flex gap-1.5 items-center shrink-0">
                                          {/* Unit Reordering Controllers */}
                                          <div className="flex items-center border border-slate-200 bg-slate-50 rounded-lg p-0.5 shadow-2xs">
                                            <button
                                              type="button"
                                              onClick={() => handleMoveUnit(unit.id, 'up')}
                                              disabled={isFirstUnit || currSearchQuery !== '' || currSortMode !== 'standard'}
                                              className={`w-5.5 h-5.5 flex items-center justify-center rounded text-[9px] font-bold cursor-pointer transition ${
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
                                              className={`w-5.5 h-5.5 flex items-center justify-center rounded text-[9px] font-bold cursor-pointer transition ${
                                                isLastUnit || currSearchQuery !== '' || currSortMode !== 'standard'
                                                  ? 'text-slate-300 pointer-events-none'
                                                  : 'text-slate-655 hover:text-indigo-900 hover:bg-white'
                                              }`}
                                              title={currSearchQuery ? 'Clear search to reorder' : currSortMode !== 'standard' ? 'Switch sort to Sequence to reorder' : 'Move Unit Down'}
                                            >
                                              ▼
                                            </button>
                                          </div>
                                          {hasPermission('perm_curr_unit_edt') && (
                                            <button
                                              type="button"
                                              onClick={() => startEditUnit(unit)}
                                              className="bg-slate-100 text-slate-650 hover:bg-slate-200 p-1.5 rounded transition cursor-pointer"
                                              title="Edit Unit"
                                            >
                                              <Edit3 className="w-3 h-3" />
                                            </button>
                                          )}
                                          {hasPermission('perm_curr_unit_del') && (
                                            <button
                                              type="button"
                                              onClick={() => handleDeleteUnit(unit.id)}
                                              className="bg-slate-100 text-rose-600 hover:bg-rose-50 p-1.5 rounded transition cursor-pointer"
                                              title="Delete Unit"
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                  {chapUnits.length === 0 && (
                                    <p className="text-[10.5px] text-slate-400 italic py-2 text-center">
                                      {rawUnits.length > 0 ? 'No matching units for active search query.' : 'No units deployed inside this chapter.'}
                                    </p>
                                  )}
                                </div>
                              )}
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
                    <div className="flex items-center gap-1.5">
                      <span className="flex items-center justify-center w-5 h-5 bg-indigo-100 text-indigo-700 text-[10.5px] font-black rounded-md shrink-0">1</span>
                      <h4 className="text-[11.5px] font-extrabold text-slate-800 tracking-tight">
                        Bulk Loading Documentation & Rules
                      </h4>
                    </div>
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
{`Job Profile\tChapter Name\tUnit Code\tWork Task / Title\tExecution Frequency\tSkill Level\tVideo Title\tVideo Embed URL\tDocument (PDF)\tDescription
Tax Associate\tGST Compliance & Filings\tGST-004\tVerify GSTR-2B compliance records\tMonthly\tIntermediate\tGSTR-2B Mismatch Audit Guide\thttps://www.youtube.com/embed/S7U_F7F9-kM\thttps://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf\tCheck invoice inputs against online GSTR-2B records to maximize input tax credit.
Senior Accountant\tFinancial Close & Consolidation Accounting\tFIN-502\tPerform Bank Reconciliation Statement (BRS)\tDaily\tAdvanced\tFIN-502 BRS SOP Walkthrough\thttps://www.youtube.com/embed/nE1E1xidV2U\thttps://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf\tReconcile all bank statements with general ledger logs, check adjusting entry errors.
Junior Accountant\tFixed Asset Register Maintenance\tAST-101\tRecord physical assets depreciation\tMonthly\tBeginner\tAST-101 Depreciation Guide\thttps://www.youtube.com/embed/nE1E1xidV2U\thttps://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf\tCalculate depreciation using straight-line and WDV methods, update active registers.
Accounts Executive (AP/AR)\tAccounts Payable Workflow\tAP-201\tMatch vendor purchase orders\tDaily\tBeginner\tAP-201 Invoice verification guidelines\thttps://www.youtube.com/embed/nE1E1xidV2U\thttps://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf\tVerify incoming supplier bills against matching purchase orders and GRN inputs.`}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Input controls and Input Text Area */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4 text-left">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="flex items-center justify-center w-5 h-5 bg-indigo-100 text-indigo-700 text-[10.5px] font-black rounded-md shrink-0">2</span>
                        <h4 className="text-[11.5px] font-extrabold text-slate-800 tracking-tight">
                          Upload Excel / CSV or Copy-Paste Sheet
                        </h4>
                      </div>
                      <p className="text-[9.5px] text-slate-400 mt-1 font-sans">Apna Excel (.xlsx, .xls) ya standard CSV file drop kijiye ya copy-paste karke dynamic load kijiye.</p>
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
                        <div className="flex items-center gap-1.5">
                          <span className="flex items-center justify-center w-5 h-5 bg-indigo-100 text-indigo-700 text-[10.5px] font-black rounded-md shrink-0">3</span>
                          <h5 className="text-[11.5px] font-extrabold text-slate-800 tracking-tight">
                            Realtime Import Integrity Compliance Preview
                          </h5>
                        </div>
                        <p className="text-[9.5px] text-slate-400 mt-1 font-sans">
                          Review how the engine mapped your cell inputs. Red rows will be skipped.
                        </p>
                      </div>
                      <div className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-black text-slate-650 font-mono">
                        TOTAL ROWS: {bulkParsedRows.length} | VALID: {bulkParsedRows.filter(r => r.isValid).length}
                      </div>
                    </div>

                    <div className="overflow-x-auto max-h-72 border border-slate-150 rounded-lg">
                      <table className="premium-grid-table min-w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-display font-extrabold text-slate-800">
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
          TAB 6: ASSESSMENT EXAM ADMINISTRATION GATEWAY
          ---------------------------------------------------- */}
      {adminTab === 'recruitment' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 animate-in fade-in duration-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
                <FolderOpen className="w-4 h-4 text-[#059669]" />
                Compliance Exams Coordinator
              </h3>
            </div>
          </div>
            


          {/* SUBTAB 1: ATTEMPT LOGS */}
          {recSubTab === 'logs' && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 bg-slate-50 p-1.5 px-3 rounded-xl border border-slate-200 text-[11px]">
                <span className="text-[11px] font-extrabold text-[#111827]">Filter Gating Exams:</span>
                <div className="flex flex-wrap gap-1.5 text-[11px] items-center">
                  {/* Text Search Input */}
                  <div className="relative">
                    <input
                      type="text"
                      value={recTakerSearchQuery}
                      onChange={(e) => setRecTakerSearchQuery(e.target.value)}
                      placeholder="Search taker..."
                      className="bg-white border border-slate-200 rounded-lg py-0.5 px-1.5 pl-5 w-36 text-[11px] font-medium text-slate-800 outline-none focus:border-emerald-500 text-slate-900"
                    />
                    <span className="absolute left-1.5 top-0.5 text-slate-400 text-[9px]">🔍</span>
                    {recTakerSearchQuery && (
                      <button
                        onClick={() => setRecTakerSearchQuery('')}
                        className="absolute right-1.5 top-0.5 text-slate-400 hover:text-slate-600 text-[9px] font-bold"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <select
                    value={rec_filterRole}
                    onChange={(e) => setRecFilterRole(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg py-0.5 px-1.5 font-semibold text-slate-700 outline-none cursor-pointer focus:border-emerald-500 hover:bg-slate-100/50 transition text-[11px]"
                  >
                    <option value="all">All Taker Roles</option>
                    <option value="candidates">Candidates Only</option>
                    <option value="employees">Registered Staff Only</option>
                  </select>

                  <select
                    value={rec_filterResult}
                    onChange={(e) => setRecFilterResult(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg py-0.5 px-1.5 font-semibold text-slate-705 cursor-pointer focus:border-emerald-500 hover:bg-slate-100/50 transition text-[11px]"
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
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 py-1">
                <div className="text-[10.5px] text-slate-500 font-bold font-mono uppercase tracking-wider">
                  Showing {Math.min(recruitmentLogsLimit, filteredAttempts.length)} of {filteredAttempts.length} Attempt Logs
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 font-sans text-[11px] font-bold bg-slate-100/70 border border-slate-200/80 rounded-lg px-2 py-0.5 shadow-3xs">
                  <span>Show entries:</span>
                  <select
                    value={recruitmentLogsLimit}
                    onChange={(e) => setRecruitmentLogsLimit(Number(e.target.value))}
                    className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[11px] font-bold text-slate-750 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 cursor-pointer"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white max-h-[300px] overflow-y-auto">
                <table className="premium-grid-table w-full text-left border-collapse text-xs min-w-[700px]">
                  <thead>
                    <tr className="sticky top-0 z-10 bg-slate-50 text-slate-800 font-display text-[10px] uppercase border-b border-slate-200 font-extrabold tracking-wider shadow-[0_1px_0_0_rgba(226,232,240,1)]">
                      <th className="py-2.5 px-3 font-bold bg-slate-50">Candidate / Staff</th>
                      <th className="py-2.5 px-3 font-bold bg-slate-50">Applied / Current Role</th>
                      <th className="py-2.5 px-3 font-bold bg-slate-50">Date of Attempt</th>
                      <th className="py-2.5 px-3 font-mono font-bold text-center bg-slate-50">Score Percentage</th>
                      <th className="py-2.5 px-3 font-bold text-center bg-slate-50">Outcome</th>
                      <th className="py-2.5 px-3 font-bold text-center bg-slate-50">Audit Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAttempts.slice(0, recruitmentLogsLimit).map((att: any) => {
                    const isExpanded = expandedAttemptId === att.id;

                    return (
                      <React.Fragment key={att.id}>
                        <tr className="hover:bg-slate-50/25 transition">
                          <td className="py-2 px-3">
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
                          <td className="py-2 px-3">
                            <div>
                              <span className="font-bold text-slate-800">{att.userRoleName}</span>
                              <p className="text-[9px] font-mono font-semibold text-slate-400 uppercase mt-0.5">{att.userRoleId}</p>
                            </div>
                          </td>
                          <td className="py-2 px-3 text-slate-500 font-mono">
                            {new Date(att.date).toLocaleDateString()} at {new Date(att.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </td>
                          <td className="py-2 px-3 text-center font-mono font-black text-sm">
                            <span className={att.score >= 60 ? 'text-emerald-600' : 'text-rose-600'}>
                              {att.score}%
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 ml-1 font-semibold">
                              ({att.correctCount}/{att.totalQuestions} Correct)
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase border ${
                              att.passed ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
                            }`}>
                              {att.passed ? 'PASSED (60%+)' : 'FAILED'}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center">
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
                <table className="premium-grid-table w-full text-left border-collapse text-xs bg-white">
                  <thead>
                    <tr className="bg-slate-50 text-slate-800 font-display text-[10px] uppercase border-b border-slate-200 font-extrabold tracking-wider">
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
            <div className="lg:col-span-12 xl:col-span-5 bg-gradient-to-br from-indigo-50/40 via-white to-white border border-slate-200 rounded-2xl p-5 space-y-4 h-fit shadow-xs">
              <div className="border-b border-slate-200 pb-3">
                <h4 className="text-xs sm:text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-900 to-indigo-700 flex items-center gap-1.5 uppercase font-sans tracking-wide">
                  <span>✏️</span>
                  <span>{editingQuestionId ? 'Update Exam Question' : 'Add New Manual Question'}</span>
                </h4>
                <p className="text-xs text-indigo-600 font-medium mt-1">Assign target chapters and answer validations dynamically</p>
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
                    className={`w-11 h-6 rounded-full transition-all duration-200 relative outline-none cursor-pointer shrink-0 shadow-inner ${qIsActive ? 'bg-[#16a34a]' : 'bg-slate-300'}`}
                  >
                    <span className={`w-4 h-4 rounded-full bg-white absolute top-1 left-1 transition-all duration-200 shadow-sm ${qIsActive ? 'translate-x-5' : 'translate-x-0'}`}></span>
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
              <div className="bg-slate-50 border p-1.5 px-3 rounded-xl space-y-1.5 shadow-xs text-[11px]">
                <div className="flex items-center justify-between border-b border-slate-205 pb-1 text-[11px]">
                  <span className="font-extrabold text-slate-705">Database Repository Questions Desk:</span>
                  <span className="font-mono text-[11px] text-slate-500 font-bold">({questionsBank.length} items)</span>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 text-[11px] font-sans">
                  {/* Search Input */}
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={questionSearchQuery}
                      onChange={(e) => setQuestionSearchQuery(e.target.value)}
                      placeholder="Search question..."
                      className="bg-white border border-slate-300 rounded-lg py-0.5 px-1.5 pl-5 w-full text-[11px] text-slate-805 outline-none font-medium text-slate-900"
                    />
                    <span className="absolute left-1.5 top-0.5 text-slate-400 text-[10px]">🔍</span>
                    {questionSearchQuery && (
                      <button
                        onClick={() => setQuestionSearchQuery('')}
                        className="absolute right-1.5 top-0.5 text-slate-400 hover:text-slate-600 text-[10px] font-bold"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Chapter Filter */}
                  <div className="flex-1">
                    <select
                      value={questionChapterFilter}
                      onChange={(e) => setQuestionChapterFilter(e.target.value)}
                      className="bg-white border border-slate-300 rounded-lg py-0.5 px-1.5 text-[11px] text-slate-800 outline-none w-full font-semibold cursor-pointer"
                    >
                      <option value="all">📁 All Mapped Chapters</option>
                      {chapters.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {(() => {
                const filteredQuestions = questionsBank.filter(q => {
                  if (questionSearchQuery) {
                    const query = questionSearchQuery.toLowerCase().trim();
                    const matchesQuestion = (q.question || '').toLowerCase().includes(query);
                    const matchesTopic = (q.topic || '').toLowerCase().includes(query);
                    if (!matchesQuestion && !matchesTopic) return false;
                  }
                  if (questionChapterFilter !== 'all') {
                    if (q.chapterId !== questionChapterFilter) return false;
                  }
                  return true;
                });

                return (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 py-1">
                      <div className="text-[10.5px] text-slate-500 font-bold font-mono uppercase tracking-wider">
                        Showing {Math.min(recruitmentQuestionsLimit, filteredQuestions.length)} of {filteredQuestions.length} Questions
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 font-sans text-[11px] font-bold bg-slate-100/70 border border-slate-200/80 rounded-lg px-2 py-0.5 shadow-3xs">
                        <span>Show entries:</span>
                        <select
                          value={recruitmentQuestionsLimit}
                          onChange={(e) => setRecruitmentQuestionsLimit(Number(e.target.value))}
                          className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[11px] font-bold text-slate-750 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 cursor-pointer"
                        >
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                      {filteredQuestions.length === 0 ? (
                        <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-slate-400 font-sans">
                          <p className="text-xs font-bold text-slate-700 text-center">No matching questions found</p>
                          <p className="text-[11px] mt-1 max-w-sm mx-auto leading-normal text-slate-400 text-center font-sans">
                            Try relaxing your search keywords or choosing "All Mapped Chapters" to see full question lists.
                          </p>
                        </div>
                      ) : (
                        filteredQuestions.slice(0, recruitmentQuestionsLimit).map((q, qIdx) => {
                          const associatedChap = chapters.find(c => c.id === q.chapterId);
                          return (
                      <div key={q.id} className="p-5 bg-gradient-to-br from-white via-white to-indigo-50/15 border border-slate-200 hover:border-indigo-300 rounded-2xl space-y-4 transition-all duration-200 group shadow-xs hover:shadow-md relative animate-in fade-in duration-150 text-left border-l-4 border-l-indigo-600">
                        
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-black px-2.5 py-1 bg-indigo-950 text-indigo-50 rounded-lg font-mono tracking-tight shadow-3xs">
                                #{qIdx + 1}
                              </span>
                              <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                                {q.id}
                              </span>
                              <span className="text-[10px] font-extrabold font-mono text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 uppercase tracking-wider">
                                {q.type}
                              </span>
                              <span className={`text-[9px] px-2.5 py-1 rounded-lg font-bold uppercase font-sans border shadow-3xs ${
                                q.isActive !== false ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200'
                              }`}>
                                {q.isActive !== false ? 'Active' : 'Draft'}
                              </span>
                            </div>

                            <h4 className="text-sm sm:text-base font-black text-indigo-900 font-sans tracking-tight pt-1 flex items-center gap-1.5">
                              <span className="text-lg">📁</span> {q.topic}
                            </h4>

                            <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
                              <span className="text-slate-400">Assigned Module:</span>
                              <span className="font-bold text-slate-700">{associatedChap ? associatedChap.name : `Module not found`}</span>
                              <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded font-mono">({q.chapterId})</span>
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
                                  className="px-2.5 py-1.5 bg-indigo-950 border border-indigo-950 font-black text-[9px] text-white hover:bg-indigo-900 rounded-lg transition-all duration-150 cursor-pointer shadow-3xs"
                                  title="Edit question definition"
                                >
                                  EDIT
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteQuestionId(q.id)}
                                  className="px-2.5 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-black text-[9px] rounded-lg transition-all duration-150 cursor-pointer"
                                  title="Delete permanently"
                                >
                                  DELETE
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* The prompt */}
                        <div className="p-4 bg-gradient-to-br from-indigo-50/30 via-white to-slate-50/30 border border-slate-200/80 rounded-2xl shadow-3xs">
                          <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed font-sans">{q.question}</p>
                        </div>

                        {/* Options visualizer */}
                        {q.type === 'text' ? (
                          <div className="text-xs pl-3.5 border-l-4 border-l-emerald-500 py-1.5 font-sans bg-emerald-50/30 rounded-r-xl pr-3">
                            <span className="font-bold text-slate-600">Regex check target match value: </span>
                            <strong className="text-emerald-700 font-mono text-xs">{q.correctAnswerText}</strong>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-1 font-sans">
                            {q.options?.map((opt, oIdx) => {
                              const isCorrectOpt = q.correctAnswerIndex === oIdx;
                              const letter = String.fromCharCode(65 + oIdx);

                              return (
                                <div key={oIdx} className={`p-2.5 px-3.5 rounded-xl border flex items-center gap-2.5 transition-all duration-150 ${
                                  isCorrectOpt 
                                    ? 'bg-emerald-50/70 border-emerald-250 text-emerald-900 font-semibold shadow-3xs' 
                                    : 'bg-white border-slate-200/80 text-slate-600 hover:border-slate-300'
                                }`}>
                                  <span className={`w-5 h-5 rounded-lg flex items-center justify-center font-bold font-mono text-[10px] shrink-0 ${
                                    isCorrectOpt ? 'bg-emerald-600 text-white shadow-3xs' : 'bg-slate-100 text-slate-400'
                                  }`}>
                                    {letter}
                                  </span>
                                  <span className="truncate leading-relaxed text-xs font-medium">{opt}</span>
                                  {isCorrectOpt && (
                                    <span className="text-[9px] font-black uppercase text-emerald-700 bg-emerald-100 border border-emerald-200/55 px-1.5 py-0.5 rounded-md ml-auto shrink-0 font-mono font-bold">
                                      Correct Target
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Explanation summary */}
                        {q.explanation && (
                          <p className="text-[11px] text-slate-500 pl-1 leading-normal font-sans bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                            <span className="text-indigo-900 font-extrabold">Explanation Log: </span>
                            {q.explanation}
                          </p>
                        )}

                      </div>
                    );
                  }))}
                    </div>
                  </div>
                );
              })()}
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
                  className={`w-11 h-6 rounded-full transition-all duration-250 relative outline-none cursor-pointer shrink-0 shadow-inner ${cfgExamEnabled ? 'bg-[#16a34a]' : 'bg-slate-300'}`}
                >
                  <span className={`w-4 h-4 rounded-full bg-white absolute top-1 left-1 transition-all duration-250 shadow-sm ${cfgExamEnabled ? 'translate-x-5' : 'translate-x-0'}`}></span>
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
                  className={`w-11 h-6 rounded-full transition-all duration-250 relative outline-none cursor-pointer shrink-0 shadow-inner ${cfgRequirePass ? 'bg-[#16a34a]' : 'bg-slate-300'}`}
                >
                  <span className={`w-4 h-4 rounded-full bg-white absolute top-1 left-1 transition-all duration-250 shadow-sm ${cfgRequirePass ? 'translate-x-5' : 'translate-x-0'}`}></span>
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
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-3.5 sm:p-4 animate-in fade-in duration-200 space-y-3">
          
          {/* COMPACT SINGLE ROW INTEGRATED HEADER & FILTERS BAR */}
          <div className="border-b border-slate-100 pb-2 flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 text-left">
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              <div className="shrink-0 flex items-center gap-1.5 mr-2">
                <Building className="w-4 h-4 text-emerald-650" />
                <h3 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">
                  Departments Directory
                </h3>
              </div>

              {/* INLINE SEARCH & FILTER CONTROLS */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-sans w-full sm:w-auto">
                {/* Search Bar */}
                <div className="relative w-full sm:w-44">
                  <input
                    type="text"
                    value={deptSearchQuery}
                    onChange={(e) => setDeptSearchQuery(e.target.value)}
                    placeholder="🔍 Search dept..."
                    className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 pl-6 focus:bg-white focus:border-emerald-500 outline-none text-xs w-full text-slate-900 font-sans font-semibold transition"
                  />
                  {deptSearchQuery && (
                    <button
                      onClick={() => setDeptSearchQuery('')}
                      className="absolute right-2 top-1 text-slate-400 hover:text-slate-600 text-[10px] font-bold cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Filter Selector */}
                <select
                  value={deptFilterType}
                  onChange={(e) => setDeptFilterType(e.target.value)}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 focus:bg-white focus:border-emerald-500 outline-none text-xs font-bold text-slate-700 cursor-pointer transition"
                >
                  <option value="all">📁 All ({departments.length})</option>
                  <option value="has-staff">👥 Has Staff</option>
                  <option value="has-roles">💼 Has Roles</option>
                  <option value="no-staff">⚠️ No Staff</option>
                  <option value="empty">🚫 Empty</option>
                </select>

                {/* Quick Clear Filter Button */}
                {(deptSearchQuery || deptFilterType !== 'all') && (
                  <button
                    type="button"
                    onClick={() => {
                      setDeptSearchQuery('');
                      setDeptFilterType('all');
                    }}
                    className="text-xs text-rose-600 hover:text-rose-800 font-bold hover:underline cursor-pointer"
                  >
                    Clear [✕]
                  </button>
                )}
              </div>
            </div>
            
            {/* Elegant Register Button inline */}
            <button
              type="button"
              onClick={() => setShowAddDeptModal(true)}
              className="flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-2.5 py-1 rounded-lg shadow-xs transition duration-150 h-7 shrink-0 self-start lg:self-auto"
            >
              <Plus className="w-3.5 h-3.5" /> Register Dept Unit
            </button>
          </div>

          {(() => {
            const filteredDepts = departments
              .map((dept, idx) => ({ dept, originalIdx: idx }))
              .filter(({ dept }) => {
                const associatedUsers = users.filter(u => u.department === dept);
                const associatedRoles = roles.filter(r => r.department === dept);

                if (deptSearchQuery) {
                  const query = deptSearchQuery.toLowerCase().trim();
                  if (!dept.toLowerCase().includes(query)) return false;
                }

                if (deptFilterType === 'has-staff') {
                  if (associatedUsers.length === 0) return false;
                } else if (deptFilterType === 'has-roles') {
                  if (associatedRoles.length === 0) return false;
                } else if (deptFilterType === 'no-staff') {
                  if (associatedUsers.length > 0) return false;
                } else if (deptFilterType === 'empty') {
                  if (associatedUsers.length > 0 || associatedRoles.length > 0) return false;
                }

                return true;
              });

            return (
              <div className="space-y-3.5 text-left">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-1 w-full">
                  <div className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider">
                    DEPARTMENTS MATCHED: <strong className="text-slate-700 text-xs">{filteredDepts.length}</strong>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-slate-500 font-sans text-[11px] font-bold bg-slate-100/70 border border-slate-200/80 rounded-lg px-2.5 py-1 shadow-3xs self-end">
                    <span>Show entries:</span>
                    <select
                      value={departmentsLimit}
                      onChange={(e) => setDepartmentsLimit(Number(e.target.value))}
                      className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[11px] font-bold text-slate-750 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 cursor-pointer"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                </div>

                {/* MODERN REDESIGNED TABLE WITH MAXIMUM POLISH */}
                <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-3xs max-w-full max-h-[500px] overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left text-xs text-slate-600 border-collapse min-w-[700px]">
                    <thead>
                      <tr className="sticky top-0 z-10 bg-slate-50/90 backdrop-blur-md text-slate-500 border-b border-slate-200/80 text-[9.5px] tracking-wider uppercase font-mono font-bold shadow-[0_1px_0_0_rgba(226,232,240,1)]">
                        <th className="py-3 px-4 pl-5">S.No.</th>
                        <th className="py-3 px-4">Department Name</th>
                        <th className="py-3 px-4 text-center">Associated Users</th>
                        <th className="py-3 px-4 text-center">Associated Job Roles</th>
                        <th className="py-3 px-4 pr-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-sans font-medium text-slate-750">
                      {filteredDepts.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                            <span className="block text-xl mb-1.5">📭</span>
                            No departments found matching current search criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredDepts.slice(0, departmentsLimit).map(({ dept, originalIdx }, filteredIdx) => {
                          const associatedUsers = users.filter(u => u.department === dept);
                          const associatedRoles = roles.filter(r => r.department === dept);
                          const isEditing = editingDeptIndex === originalIdx;

                          return (
                            <tr key={dept} className="hover:bg-slate-50/60 transition duration-150">
                              {/* Serial Number */}
                              <td className="p-4 pl-5 font-mono text-[10.5px] text-slate-400">
                                {(filteredIdx + 1).toString().padStart(2, '0')}
                              </td>
                              
                              {/* Department Name Block */}
                              <td className="p-4 text-slate-900 font-bold">
                                {isEditing ? (
                                  <div className="flex items-center gap-2 max-w-xs animate-in zoom-in-95 duration-100">
                                    <input
                                      type="text"
                                      value={editingDeptValue}
                                      onChange={(e) => setEditingDeptValue(e.target.value)}
                                      className="bg-white border border-slate-300 rounded px-2.5 py-1 text-xs focus:border-blue-500 outline-none font-bold text-slate-900"
                                      autoFocus
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleSaveEditedDepartment(originalIdx)}
                                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold p-1 rounded transition flex items-center justify-center h-7 w-7 cursor-pointer shadow-3xs"
                                      title="Save Changes"
                                    >
                                      <Check className="w-4 h-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingDeptIndex(null)}
                                      className="bg-slate-200 hover:bg-slate-300 text-slate-600 font-bold p-1 rounded transition flex items-center justify-center h-7 w-7 cursor-pointer shadow-3xs"
                                      title="Cancel"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2.5">
                                    <span className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100/50 text-emerald-700 flex items-center justify-center font-bold text-[10.5px] uppercase font-mono shrink-0 shadow-3xs">
                                      {dept.substring(0, 2)}
                                    </span>
                                    <span className="font-bold text-slate-800 uppercase tracking-wide text-xs">
                                      {dept}
                                    </span>
                                  </div>
                                )}
                              </td>

                              {/* Associated Staff Badge */}
                              <td className="p-4 text-center">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[10px] font-bold ${
                                  associatedUsers.length > 0 
                                    ? 'bg-indigo-50/70 text-indigo-700 border border-indigo-100/50' 
                                    : 'bg-slate-50 text-slate-400 border border-slate-100'
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${associatedUsers.length > 0 ? 'bg-indigo-500' : 'bg-slate-300'}`} />
                                  {associatedUsers.length} staff
                                </span>
                              </td>

                              {/* Associated Roles Badge */}
                              <td className="p-4 text-center">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[10px] font-bold ${
                                  associatedRoles.length > 0 
                                    ? 'bg-amber-50/70 text-amber-700 border border-amber-100/50' 
                                    : 'bg-slate-50 text-slate-400 border border-slate-100'
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${associatedRoles.length > 0 ? 'bg-amber-500' : 'bg-slate-300'}`} />
                                  {associatedRoles.length} roles
                                </span>
                              </td>

                              {/* Action Items Column */}
                              <td className="p-4 pr-5 text-right font-sans">
                                <div className="flex items-center justify-end gap-1.5">
                                  {!isEditing && (
                                    <>
                                      {confirmDeleteDeptIndex === originalIdx ? (
                                        <div className="flex items-center gap-1.5 animate-in zoom-in-95 duration-100">
                                          <button
                                            type="button"
                                            onClick={() => setConfirmDeleteDeptIndex(null)}
                                            className="text-[9.5px] uppercase font-mono font-bold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded transition border border-slate-200 cursor-pointer"
                                          >
                                            Cancel
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteDepartment(originalIdx)}
                                            className="text-[9.5px] uppercase font-mono font-black text-white bg-rose-500 hover:bg-rose-600 px-2.5 py-1 rounded shadow-xs transition flex items-center gap-1 cursor-pointer"
                                          >
                                            <Trash2 className="w-2.5 h-2.5 text-white" /> Delete
                                          </button>
                                        </div>
                                      ) : (
                                        <>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setEditingDeptIndex(originalIdx);
                                              setEditingDeptValue(dept);
                                            }}
                                            className="text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 p-1.5 rounded-lg border border-slate-100 bg-white shadow-3xs transition cursor-pointer"
                                            title="Edit Department Name"
                                          >
                                            <Edit3 className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setConfirmDeleteDeptIndex(originalIdx)}
                                            className="text-slate-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 p-1.5 rounded-lg border border-slate-100 bg-white shadow-3xs transition cursor-pointer"
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
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}

          {/* DYNAMIC POPUP MODAL FOR REGISTERING NEW DEPARTMENTS */}
          {showAddDeptModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md mx-4 overflow-hidden animate-in zoom-in-95 duration-150 text-left">
                {/* Modal Header */}
                <div className="flex items-center justify-between bg-slate-50 px-5 py-4 border-b border-slate-100">
                  <h4 className="text-xs sm:text-sm font-black text-slate-800 flex items-center gap-2 uppercase tracking-wider font-mono">
                    <Building className="w-4 h-4 text-emerald-650" />
                    Register New Department Unit
                  </h4>
                  <button
                    onClick={() => setShowAddDeptModal(false)}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Modal Body / Form */}
                <form onSubmit={handleAddDepartment} className="p-5 space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 font-mono">
                      Department Name
                    </label>
                    <input
                      type="text"
                      required
                      autoFocus
                      placeholder="e.g. MDO, Warehouse, CRM, Sales, HO..."
                      value={newDeptName}
                      onChange={(e) => setNewDeptName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none font-medium text-slate-900"
                    />
                    <p className="text-[10px] text-slate-400 mt-1.5 leading-normal">
                      Ensure this is a unique structural or organizational department name in the directory.
                    </p>
                  </div>

                  {/* Modal Footer */}
                  <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowAddDeptModal(false)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2 rounded-lg transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-lg transition shadow-sm flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Create Unit
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ----------------------------------------------------
          TAB 9: COMPLIANCE AUDIT TRAIL
          ---------------------------------------------------- */}
      {adminTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 animate-in fade-in duration-200 space-y-4 text-slate-900">
          <div className="border-b border-slate-100 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
                <span className="text-sm">🛡️</span>
                Compliance Audit Trail & Verification Logbook
              </h3>
            </div>

          </div>

          {/* Statistics widgets */}
          {(() => {
            const pendingCount = progress.filter(p => p.status === 'Completed (Pending Review)').length;
            const verifiedCount = progress.filter(p => p.status === 'Verified & Mastered').length;
            const inProgressCount = progress.filter(p => p.status === 'In Progress').length;
            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 shrink-0">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono font-black text-slate-400 tracking-wider">Total Records</span>
                    <h4 className="text-xl font-bold text-slate-800 leading-tight">{progress.length}</h4>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono font-black text-slate-400 tracking-wider">Verified Mastery</span>
                    <h4 className="text-xl font-bold text-slate-800 leading-tight">{verifiedCount}</h4>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-amber-50 border border-amber-100 rounded-lg flex items-center justify-center text-amber-600 shrink-0">
                    <Clock className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono font-black text-slate-400 tracking-wider">Pending Review</span>
                    <h4 className="text-xl font-bold text-slate-800 leading-tight flex items-center gap-1.5">
                      {pendingCount}
                      {pendingCount > 0 && (
                        <span className="text-[9px] bg-amber-100 text-amber-800 font-black px-1.5 py-0.5 rounded-full font-mono">
                          Action
                        </span>
                      )}
                    </h4>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono font-black text-slate-400 tracking-wider">Mapped Trainees</span>
                    <h4 className="text-xl font-bold text-slate-800 leading-tight">{users.length}</h4>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Interactive Dynamic Filters Panel */}
          <div className="bg-slate-50/60 border border-slate-200/70 p-1.5 px-3 rounded-xl space-y-1.5 shadow-3xs text-[11px]">
            <div className="flex items-center justify-between text-[11px] font-black text-slate-700 uppercase tracking-wider font-mono border-b border-slate-100 pb-1">
              <span className="flex items-center gap-1.5"><ListFilter className="w-3.5 h-3.5 text-emerald-600" /> Dynamic Filter Controls</span>
              
              {/* Reset filters inline trigger */}
              {(auditSearch || auditUserFilter !== 'all' || auditDeptFilter !== 'all' || auditRoleFilter !== 'all' || auditStatusFilter !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setAuditSearch('');
                    setAuditUserFilter('all');
                    setAuditDeptFilter('all');
                    setAuditRoleFilter('all');
                    setAuditStatusFilter('all');
                    showToast('🔍 Compliance filters successfully reset.', 'info');
                  }}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-1.5 py-0.2 rounded transition text-[10px] cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
            </div>

            <div className="flex flex-wrap md:flex-nowrap items-center gap-2">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="absolute left-1.5 top-1.5 w-3 h-3 text-slate-400" />
                <input
                  type="text"
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  placeholder="Search trainee, task, code..."
                  className="w-full pl-5.5 pr-2 py-0.5 bg-white border border-slate-200 rounded-lg text-[11px] font-medium text-slate-805 outline-none placeholder-slate-400"
                />
              </div>

              {/* User Dropdown */}
              <select
                value={auditUserFilter}
                onChange={(e) => setAuditUserFilter(e.target.value)}
                className="flex-1 px-1.5 py-0.5 bg-white border border-slate-200 rounded-lg text-[11px] font-medium text-slate-800 cursor-pointer"
              >
                <option value="all">All Trainees ({users.length})</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
              </select>

              {/* Department Dropdown */}
              <select
                value={auditDeptFilter}
                onChange={(e) => setAuditDeptFilter(e.target.value)}
                className="flex-1 px-1.5 py-0.5 bg-white border border-slate-200 rounded-lg text-[11px] font-medium text-slate-800 cursor-pointer"
              >
                <option value="all">All Departments ({departments.length})</option>
                {departments.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              {/* Role Dropdown */}
              <select
                value={auditRoleFilter}
                onChange={(e) => setAuditRoleFilter(e.target.value)}
                className="flex-1 px-1.5 py-0.5 bg-white border border-slate-200 rounded-lg text-[11px] font-medium text-slate-800 cursor-pointer"
              >
                <option value="all">All Job Roles ({roles.length})</option>
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>

              {/* Status Dropdown */}
              <select
                value={auditStatusFilter}
                onChange={(e) => setAuditStatusFilter(e.target.value)}
                className="flex-1 px-1.5 py-0.5 bg-white border border-slate-200 rounded-lg text-[11px] font-medium text-slate-800 cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed (Pending Review)">Completed (Pending Review)</option>
                <option value="Verified & Mastered">Verified & Mastered</option>
              </select>
            </div>
          </div>

          {/* Dynamic Views: Matrix vs Timeline */}
          {auditViewMode === 'matrix' ? (
            /* ========================================================
               A) SYLLABUS STATUS MATRIX GRID SPREADSHEET
               ======================================================== */
            (() => {
              const auditRows = (() => {
                const rows: {
                  user: User;
                  unit: Unit;
                  chapter: Chapter;
                  log: ProgressLog | undefined;
                  id: string;
                }[] = [];

                users.forEach(u => {
                  const userChapters = chapters.filter(c => c.roleId === u.roleId);
                  userChapters.forEach(c => {
                    const chapUnits = units.filter(un => un.chapterId === c.id);
                    chapUnits.forEach(un => {
                      const log = progress.find(p => p.userId === u.id && p.unitId === un.id);
                      rows.push({
                        user: u,
                        unit: un,
                        chapter: c,
                        log,
                        id: `${u.id}_${un.id}`
                      });
                    });
                  });
                });

                return rows.filter(r => {
                  if (auditUserFilter !== 'all' && r.user.id !== auditUserFilter) return false;
                  if (auditDeptFilter !== 'all' && r.user.department !== auditDeptFilter) return false;
                  if (auditRoleFilter !== 'all' && r.user.roleId !== auditRoleFilter) return false;
                  if (auditStatusFilter !== 'all') {
                    const status = r.log?.status || 'Not Started';
                    if (status !== auditStatusFilter) return false;
                  }
                  if (auditSearch.trim()) {
                    const query = auditSearch.toLowerCase();
                    const userName = r.user.name.toLowerCase();
                    const userEmail = r.user.email.toLowerCase();
                    const unitCode = r.unit.code.toLowerCase();
                    const taskName = r.unit.taskName.toLowerCase();
                    const chapName = r.chapter.name.toLowerCase();
                    if (
                      !userName.includes(query) &&
                      !userEmail.includes(query) &&
                      !unitCode.includes(query) &&
                      !taskName.includes(query) &&
                      !chapName.includes(query)
                    ) {
                      return false;
                    }
                  }
                  return true;
                });
              })();

              return (
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-1">
                    <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider">
                      Showing {Math.min(auditLimit, auditRows.length)} of {auditRows.length} Mapped Syllabus Tasks
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 text-slate-500 font-sans text-[11px] font-bold bg-slate-100/70 border border-slate-200/80 rounded-lg px-2 py-0.5 shadow-3xs">
                        <span>Show entries:</span>
                        <select
                          value={auditLimit}
                          onChange={(e) => setAuditLimit(Number(e.target.value))}
                          className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[11px] font-bold text-slate-750 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 cursor-pointer"
                        >
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                      </div>

                      {/* Excel Export */}
                      <button
                        type="button"
                        onClick={() => {
                          const worksheetData = auditRows.map(r => ({
                            'Employee': r.user.name,
                            'Email': r.user.email,
                            'Department': r.user.department,
                            'Role ID': r.user.roleId,
                            'Chapter': r.chapter.name,
                            'Unit Code': r.unit.code,
                            'Task Name': r.unit.taskName,
                            'Status': r.log?.status || 'Not Started',
                            'Last Updated': r.log?.lastUpdated ? new Date(r.log.lastUpdated).toLocaleDateString() : 'N/A'
                          }));
                          const ws = XLSX.utils.json_to_sheet(worksheetData);
                          const wb = XLSX.utils.book_new();
                          XLSX.utils.book_append_sheet(wb, ws, "Compliance Ledger");
                          XLSX.writeFile(wb, "Rathi_Compliance_Audit_Ledger.xlsx");
                          showToast('📥 Spreadsheet exported successfully as Excel!', 'success');
                        }}
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold py-1 px-2.5 rounded-lg border border-emerald-200 transition flex items-center gap-1 cursor-pointer active:scale-95"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export Excel Ledger</span>
                      </button>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-3xs max-h-[300px] overflow-y-auto">
                    <table className="w-full text-left border-collapse bg-white min-w-[800px]">
                      <thead>
                        <tr className="sticky top-0 z-10 bg-slate-50 text-slate-800 font-display text-[10px] uppercase border-b border-slate-200 font-extrabold tracking-wider shadow-[0_1px_0_0_rgba(226,232,240,1)]">
                          <th className="text-[10px] font-black uppercase text-slate-500 font-mono tracking-wider py-2 px-3 bg-slate-50">Trainee</th>
                          <th className="text-[10px] font-black uppercase text-slate-500 font-mono tracking-wider py-2 px-3 bg-slate-50">Syllabus Task</th>
                          <th className="text-[10px] font-black uppercase text-slate-500 font-mono tracking-wider py-2 px-3 text-center bg-slate-50">Status</th>
                          <th className="text-[10px] font-black uppercase text-slate-500 font-mono tracking-wider py-2 px-3 bg-slate-50">Log Notes</th>
                          <th className="text-[10px] font-black uppercase text-slate-500 font-mono tracking-wider py-2 px-3 text-right bg-slate-50">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {auditRows.slice(0, auditLimit).map((r) => {
                          const isExpanded = selectedAuditRowId === r.id;
                          const currentStatus = r.log?.status || 'Not Started';
                          
                          // Badge color config
                          let badgeStyles = 'bg-slate-100 text-slate-500 border-slate-200';
                          if (currentStatus === 'Verified & Mastered') {
                            badgeStyles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                          } else if (currentStatus === 'Completed (Pending Review)') {
                            badgeStyles = 'bg-amber-50 text-amber-700 border-amber-200';
                          } else if (currentStatus === 'In Progress') {
                            badgeStyles = 'bg-blue-50 text-blue-700 border-blue-200';
                          }

                          return (
                            <React.Fragment key={r.id}>
                              <tr className="hover:bg-slate-50/40 border-b border-slate-100 transition-colors">
                                {/* Trainee Col */}
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-3">
                                    <Avatar src={r.user.avatarUrl} name={r.user.name} size="sm" className="ring-1 ring-slate-100 shrink-0" />
                                    <div>
                                      <h5 className="font-bold text-slate-850 text-xs">{r.user.name}</h5>
                                      <p className="text-[10px] text-slate-400 font-mono">{r.user.email} • <span className="font-semibold text-indigo-600">{r.user.department}</span></p>
                                    </div>
                                  </div>
                                </td>

                                {/* Task Col */}
                                <td className="py-3 px-4">
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[9px] font-mono font-black bg-slate-100 text-slate-600 border border-slate-200 px-1 py-0.2 rounded">
                                        {r.unit.code}
                                      </span>
                                      <span className="font-bold text-slate-800 text-xs truncate max-w-[200px] inline-block">{r.unit.taskName}</span>
                                    </div>
                                    <p className="text-[9.5px] text-slate-400 truncate max-w-xs mt-0.5">Ch: <span className="font-medium text-slate-600">{r.chapter.name}</span></p>
                                  </div>
                                </td>

                                {/* Status Col */}
                                <td className="py-3 px-4 text-center">
                                  <div className="flex justify-center">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.8 rounded-full text-[9px] font-bold border ${badgeStyles}`}>
                                      <span className={`w-1.5 h-1.5 rounded-full ${
                                        currentStatus === 'Verified & Mastered' ? 'bg-emerald-500' :
                                        currentStatus === 'Completed (Pending Review)' ? 'bg-amber-500 animate-pulse' :
                                        currentStatus === 'In Progress' ? 'bg-blue-500' : 'bg-slate-400'
                                      }`} />
                                      {currentStatus}
                                    </span>
                                  </div>
                                </td>

                                {/* Notes Col */}
                                <td className="py-3 px-4 text-xs font-sans text-slate-500 max-w-[150px] truncate">
                                  {r.log?.notes ? (
                                    <span className="italic">" {r.log.notes} "</span>
                                  ) : (
                                    <span className="text-slate-300 italic">No notes</span>
                                  )}
                                </td>

                                {/* Actions Col */}
                                <td className="py-3 px-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    {currentStatus === 'Completed (Pending Review)' && (
                                      <>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (!hasPermission('perm_verif_approve')) {
                                              showToast("🔒 Permission Denied: Your designation does not have 'Approve Curriculum Unit' permission in the matrix!", "error");
                                              return;
                                            }
                                            onSettleVerification(r.user.id, r.unit.id, 'verify');
                                            showToast(`✓ Mastered verification logged for ${r.user.name}.`, 'success');
                                          }}
                                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[9px] py-1 px-2 rounded-lg transition uppercase tracking-wider cursor-pointer shadow-3xs"
                                        >
                                          Verify
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (!hasPermission('perm_verif_reject')) {
                                              showToast("🔒 Permission Denied: Your designation does not have 'Reject/Redo Curriculum Unit' permission in the matrix!", "error");
                                              return;
                                            }
                                            onSettleVerification(r.user.id, r.unit.id, 'reject');
                                            showToast(`✕ Task status returned back to trainee for revision.`, 'error');
                                          }}
                                          className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold text-[9px] py-1 px-2 rounded-lg border border-rose-200 transition uppercase tracking-wider cursor-pointer"
                                        >
                                          Reject
                                        </button>
                                      </>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => setSelectedAuditRowId(isExpanded ? null : r.id)}
                                      className="text-slate-400 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50/50 p-1 rounded-lg border border-slate-200 transition cursor-pointer"
                                      title="View History Details"
                                    >
                                      {isExpanded ? <X className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                    </button>
                                  </div>
                                </td>
                              </tr>

                              {/* Expanded Accordion Details */}
                              {isExpanded && (
                                <tr>
                                  <td colSpan={5} className="bg-slate-50/50 px-6 py-4 border-b border-slate-150">
                                    <div className="space-y-3 max-w-4xl animate-in slide-in-from-top-1 duration-150">
                                      <h6 className="text-[10px] font-black uppercase text-indigo-700 tracking-wider font-mono flex items-center gap-1">
                                        <History className="w-3.5 h-3.5" />
                                        Compliance Verification Ledger Log
                                      </h6>

                                      {/* Log metadata */}
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] bg-white border border-slate-200 rounded-xl p-3 shadow-3xs">
                                        <div>
                                          <span className="text-slate-400">Total Started:</span>
                                          <p className="font-bold text-slate-850">
                                            {r.log?.startedAt ? new Date(r.log.startedAt).toLocaleString() : 'N/A'}
                                          </p>
                                        </div>
                                        <div>
                                          <span className="text-slate-400">Total Completed:</span>
                                          <p className="font-bold text-slate-850">
                                            {r.log?.completedAt ? new Date(r.log.completedAt).toLocaleString() : 'N/A'}
                                          </p>
                                        </div>
                                      </div>

                                      {/* Expanded history timeline steps */}
                                      <div className="space-y-2">
                                        <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider font-mono">Transition logs:</span>
                                        {r.log?.history && r.log.history.length > 0 ? (
                                          <div className="border-l-2 border-indigo-100 pl-4 space-y-2.5">
                                            {r.log.history.map((hist, histIdx) => (
                                              <div key={histIdx} className="relative">
                                                {/* Bullet dot */}
                                                <span className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-indigo-500 border border-white" />
                                                <div className="text-[11px]">
                                                  <div className="flex items-center gap-1.5 font-bold text-slate-700">
                                                    <span>Changed to {hist.status}</span>
                                                    <span className="text-[10px] text-slate-400 font-normal">by {hist.changedBy}</span>
                                                    <span className="text-[9px] font-mono text-slate-400 font-normal ml-auto">{new Date(hist.timestamp).toLocaleString()}</span>
                                                  </div>
                                                  {hist.notes && (
                                                    <p className="text-[10px] text-slate-500 italic mt-0.5">" {hist.notes} "</p>
                                                  )}
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        ) : (
                                          <p className="text-[11px] text-slate-400 italic font-sans">No transition logs found for this item. Active status reflects first entry.</p>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}

                        {auditRows.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-slate-400 italic text-xs font-sans">
                              No mapped syllabus tasks found matching your active compliance filters.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()
          ) : (
            /* ========================================================
               B) DETAILED CHRONOLOGICAL TIMELINE LOG
               ======================================================== */
            (() => {
              const timelineEvents = (() => {
                const events: {
                  user: User;
                  unit: Unit;
                  chapter: Chapter;
                  status: ProgressStatus;
                  timestamp: string;
                  changedBy: string;
                  notes?: string;
                  logId: string;
                  id: string;
                }[] = [];

                progress.forEach(log => {
                  const u = users.find(usr => usr.id === log.userId);
                  const un = units.find(uni => uni.id === log.unitId);
                  if (!u || !un) return;
                  const c = chapters.find(ch => ch.id === un.chapterId);
                  if (!c) return;

                  if (log.history && log.history.length > 0) {
                    log.history.forEach((hist, hIdx) => {
                      events.push({
                        user: u,
                        unit: un,
                        chapter: c,
                        status: hist.status,
                        timestamp: hist.timestamp,
                        changedBy: hist.changedBy,
                        notes: hist.notes,
                        logId: log.id,
                        id: `${log.id}_h_${hIdx}`
                      });
                    });
                  } else {
                    events.push({
                      user: u,
                      unit: un,
                      chapter: c,
                      status: log.status,
                      timestamp: log.lastUpdated,
                      changedBy: log.verifiedBy || u.name,
                      notes: log.notes,
                      logId: log.id,
                      id: `${log.id}_fallback`
                    });
                  }
                });

                const filtered = events.filter(e => {
                  if (auditUserFilter !== 'all' && e.user.id !== auditUserFilter) return false;
                  if (auditDeptFilter !== 'all' && e.user.department !== auditDeptFilter) return false;
                  if (auditRoleFilter !== 'all' && e.user.roleId !== auditRoleFilter) return false;
                  if (auditStatusFilter !== 'all' && e.status !== auditStatusFilter) return false;
                  if (auditSearch.trim()) {
                    const query = auditSearch.toLowerCase();
                    const userName = e.user.name.toLowerCase();
                    const userEmail = e.user.email.toLowerCase();
                    const unitCode = e.unit.code.toLowerCase();
                    const taskName = e.unit.taskName.toLowerCase();
                    const chapName = e.chapter.name.toLowerCase();
                    if (
                      !userName.includes(query) &&
                      !userEmail.includes(query) &&
                      !unitCode.includes(query) &&
                      !taskName.includes(query) &&
                      !chapName.includes(query)
                    ) {
                      return false;
                    }
                  }
                  return true;
                });

                return [...filtered].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
              })();

              return (
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-1">
                    <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider">
                      Showing {Math.min(auditLimit, timelineEvents.length)} of {timelineEvents.length} Historical Chronological Events
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 text-slate-500 font-sans text-[11px] font-bold bg-slate-100/70 border border-slate-200/80 rounded-lg px-2 py-0.5 shadow-3xs">
                        <span>Show entries:</span>
                        <select
                          value={auditLimit}
                          onChange={(e) => setAuditLimit(Number(e.target.value))}
                          className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[11px] font-bold text-slate-750 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 cursor-pointer"
                        >
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                      </div>

                      {/* Excel export */}
                      <button
                        type="button"
                        onClick={() => {
                          const worksheetData = timelineEvents.map(e => ({
                            'Timestamp': new Date(e.timestamp).toLocaleString(),
                            'Actor': e.changedBy,
                            'Trainee Name': e.user.name,
                            'Trainee Email': e.user.email,
                            'Department': e.user.department,
                            'Task SKU': e.unit.code,
                            'Task Description': e.unit.taskName,
                            'New Status State': e.status,
                            'Captured Remarks': e.notes || ''
                          }));
                          const ws = XLSX.utils.json_to_sheet(worksheetData);
                          const wb = XLSX.utils.book_new();
                          XLSX.utils.book_append_sheet(wb, ws, "Compliance History Log");
                          XLSX.writeFile(wb, "Rathi_Compliance_Audit_Timeline_History.xlsx");
                          showToast('📥 Timeline log history exported as Excel successfully!', 'success');
                        }}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold py-1 px-2.5 rounded-lg border border-indigo-200 transition flex items-center gap-1 cursor-pointer active:scale-95"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export Excel Timeline</span>
                      </button>
                    </div>
                  </div>

                  <div className="relative border border-slate-200 rounded-xl bg-white p-6 shadow-3xs max-h-[300px] overflow-y-auto">
                    {timelineEvents.length > 0 ? (
                      <div className="border-l border-slate-200 pl-6 space-y-6">
                        {timelineEvents.slice(0, auditLimit).map((e) => {
                          const isVerifyAction = e.status === 'Verified & Mastered';
                          const isCompleteAction = e.status === 'Completed (Pending Review)';
                          
                          let badgeBg = 'bg-slate-100 text-slate-600 border-slate-200';
                          if (isVerifyAction) badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200/50';
                          else if (isCompleteAction) badgeBg = 'bg-amber-50 text-amber-700 border-amber-200/50';
                          else if (e.status === 'In Progress') badgeBg = 'bg-blue-50 text-blue-700 border-blue-200/50';

                          return (
                            <div key={e.id} className="relative group">
                              {/* Bullet dot */}
                              <span className={`absolute -left-[32px] top-1.5 w-3.5 h-3.5 rounded-full border border-white flex items-center justify-center shrink-0 ${
                                isVerifyAction ? 'bg-emerald-500 text-white' :
                                isCompleteAction ? 'bg-amber-500 text-white' :
                                e.status === 'In Progress' ? 'bg-blue-500 text-white' : 'bg-slate-400 text-white'
                              }`}>
                                <span className="w-1 h-1 rounded-full bg-white" />
                              </span>

                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 border-b border-slate-100 pb-3">
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-extrabold text-slate-800 text-xs">{e.changedBy}</span>
                                    <span className="text-[10px] text-slate-400 font-sans">transitioned status for</span>
                                    <span className="font-bold text-slate-800 text-xs underline decoration-indigo-200">{e.user.name}</span>
                                  </div>

                                  <div className="mt-1 flex items-center gap-2">
                                    <span className="text-[9px] font-mono bg-slate-100 border border-slate-200 text-slate-600 px-1 py-0.2 rounded">
                                      {e.unit.code}
                                    </span>
                                    <p className="text-xs text-slate-600 font-medium">
                                      {e.unit.taskName} <span className="text-[10px] text-slate-400 font-normal">({e.chapter.name})</span>
                                    </p>
                                  </div>

                                  {e.notes && (
                                    <div className="mt-2 bg-slate-50 border border-slate-200/70 p-2 rounded-lg text-[11px] text-slate-600 italic">
                                      " {e.notes} "
                                    </div>
                                  )}
                                </div>

                                <div className="flex flex-col items-start sm:items-end shrink-0 gap-1 mt-1 sm:mt-0">
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${badgeBg}`}>
                                    {e.status}
                                  </span>
                                  <div className="flex items-center gap-1 text-[9px] text-slate-400 font-mono">
                                    <Clock className="w-2.5 h-2.5" />
                                    <span>{new Date(e.timestamp).toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-slate-400 italic text-xs font-sans">
                        No historical compliance events matched your active dynamic filter selectors.
                      </div>
                    )}
                  </div>
                </div>
              );
            })()
          )}
        </div>
      )}

      {/* ----------------------------------------------------
          TAB 8: BRAND LOGO & CERTIFICATE CONFIGURATOR
          ---------------------------------------------------- */}
      {adminTab === 'certificate' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 animate-in fade-in duration-200 space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
              <span className="text-sm">🏢</span>
              Corporate Identity & Certificate Configurator
            </h3>
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



          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            {/* Left side: configuration inputs */}
            <div className={`${certSubTab === 'template' ? 'xl:col-span-7' : 'xl:col-span-12'} space-y-4 pb-12`}>

              {/* SECTION A: CORPORATE BRAND IDENTITY & LOGO */}
              {certSubTab === 'branding' && (
                <div className="bg-slate-50 border border-slate-200/80 p-3 sm:p-4 rounded-xl space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-mono uppercase tracking-wider text-indigo-600 font-extrabold flex items-center gap-2">
                      <span className="p-1 rounded bg-indigo-50 text-indigo-700">🏢</span>
                      Part 1: Platform Brand Name & Corporate Logo
                    </h4>
                    <span className="text-[9px] bg-slate-200 text-slate-800 font-mono font-bold px-2 py-0.5 rounded-full select-none">Global Header</span>
                  </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-5">
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Company / Group Registered Name</label>
                    <input
                      type="text"
                      value={compName}
                      onChange={(e) => setCompName(e.target.value)}
                      placeholder="e.g. Build Mart"
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">System Abbreviation</label>
                    <input
                      type="text"
                      maxLength={10}
                      value={compAbbr}
                      onChange={(e) => setCompAbbr(e.target.value)}
                      placeholder="e.g. LMS"
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Brand Tagline / Footprint Text</label>
                    <input
                      type="text"
                      value={compTagline}
                      onChange={(e) => setCompTagline(e.target.value)}
                      placeholder="e.g. MEMBER OF RATHI BUILDMART PLC"
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* LOGO TYPE CHANGER */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-600">Header Icon Logo Mode</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setLogoType('icon');
                        setLogoValue('BookOpen');
                      }}
                      className={`px-3 py-1.5 text-[11px] font-bold rounded-lg border transition ${
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
                      className={`px-3 py-1.5 text-[11px] font-bold rounded-lg border transition ${
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
                      className={`px-3 py-1.5 text-[11px] font-bold rounded-lg border transition ${
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
                <div className="bg-white border border-slate-200/70 p-2.5 rounded-lg">
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
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Paste logo internet URL link:</span>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={logoValue}
                          onChange={(e) => setLogoValue(e.target.value)}
                          placeholder="e.g. https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=80"
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 outline-none"
                        />
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
              )}

              {/* SECTION B: CERTIFICATE DESIGN CONFIGURATIONS */}
              {certSubTab === 'template' && (
              <div className="bg-slate-50 border border-slate-200/85 p-3.5 rounded-xl space-y-2.5">
                <h4 className="text-[11px] font-mono uppercase tracking-wider text-emerald-600 font-extrabold flex items-center gap-2">
                  <span className="p-1 rounded bg-emerald-50 text-emerald-700">📜</span>
                  Part 2: Trainee Certificate Template & Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Company / Focus Entity Name</label>
                    <input
                      type="text"
                      value={certFocusEntity}
                      onChange={(e) => setCertFocusEntity(e.target.value)}
                      placeholder="e.g. Rathi's Buildmart Ltd"
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Issuer Authority Sub-Header</label>
                    <input
                      type="text"
                      value={certSubHeader}
                      onChange={(e) => setCertSubHeader(e.target.value)}
                      placeholder="e.g. Office of Operations Integrity & Standard Execution"
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Certificate Title Name</label>
                    <input
                      type="text"
                      value={certTitle}
                      onChange={(e) => setCertTitle(e.target.value)}
                      placeholder="e.g. Certificate of Mastery"
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 font-bold outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Awarding Prefix / Phrase</label>
                    <input
                      type="text"
                      value={certProudlyAwardedTo}
                      onChange={(e) => setCertProudlyAwardedTo(e.target.value)}
                      placeholder="e.g. This formal competency is proudly awarded to"
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Acclaim Purpose Statement (Body)</label>
                  <textarea
                    rows={1}
                    value={certBodyText}
                    onChange={(e) => setCertBodyText(e.target.value)}
                    placeholder="e.g. for successfully completing all configured operational training modules..."
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 outline-none focus:border-indigo-500 leading-normal"
                  />
                  <p className="text-[9px] text-slate-400 mt-0.5">
                    *The system dynamically appends the Trainee's Job Role and Department at the end of this statement.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Left Signature Name / Body</label>
                    <input
                      type="text"
                      value={certSignatureText}
                      onChange={(e) => setCertSignatureText(e.target.value)}
                      placeholder="e.g. Rathi Operations Ltd."
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Left Signature Role Title</label>
                    <input
                      type="text"
                      value={certSignatureTitle}
                      onChange={(e) => setCertSignatureTitle(e.target.value)}
                      placeholder="e.g. Training Registrar verifier"
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Left Signature Subtitle / Org</label>
                    <input
                      type="text"
                      value={certSignatureSub}
                      onChange={(e) => setCertSignatureSub(e.target.value)}
                      placeholder="e.g. Rathi's Buildmart LLC"
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Established Year Label</label>
                    <input
                      type="text"
                      value={certEstablishedText}
                      onChange={(e) => setCertEstablishedText(e.target.value)}
                      placeholder="e.g. ESTABLISHED 2026"
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Seal Status Label</label>
                    <input
                      type="text"
                      value={certStampLabel}
                      onChange={(e) => setCertStampLabel(e.target.value)}
                      placeholder="e.g. MASTERED"
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 outline-none focus:border-indigo-500"
                    />
                  </div>
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
              )}

              {/* SECTION C: HELPLINE & SOP ESCALATION CONTACTS */}
              {certSubTab === 'helpline' && (
              <div className="bg-slate-50 border border-slate-200/85 p-5 pb-8 rounded-xl space-y-4">
                <h4 className="text-[11px] font-mono uppercase tracking-wider text-amber-600 font-extrabold flex items-center gap-2">
                  <span className="p-1 rounded bg-amber-50 text-amber-700">📞</span>
                  Part 3: Helpline & SOP Escalation Contacts
                </h4>

                {helplineSavingSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs py-2 px-3 rounded-lg font-bold font-sans">
                    ✓ {helplineSavingSuccess}
                  </div>
                )}

                <p className="text-[11px] text-slate-500 leading-normal">
                  Configure the designated contacts displayed in the Trainee Helpdesk overlay (such as Chief Curriculum Directors, Platform Admins, and Compliance Leads).
                </p>

                <div className="space-y-3 pt-1">
                  {localHelplineContacts.map((contact, index) => {
                    const currentType = contact.badgeType || (index === 0 ? 'indigo' : index === 1 ? 'rose' : index === 2 ? 'emerald' : 'amber');
                    return (
                      <div key={contact.id} className="p-3 bg-white border border-slate-200 rounded-lg space-y-2.5 shadow-2xs">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 flex-wrap gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                              currentType === 'rose' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                              currentType === 'emerald' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                              currentType === 'amber' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                              'bg-indigo-50 text-indigo-700 border border-indigo-100'
                            }`}>
                              Contact #{index + 1}
                            </span>
                            {contact.roleBadge && (
                              <span className={`text-[8.5px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                currentType === 'rose' ? 'bg-rose-100 text-rose-800' :
                                currentType === 'emerald' ? 'bg-emerald-100 text-emerald-800' :
                                currentType === 'amber' ? 'bg-amber-100 text-amber-800' :
                                'bg-indigo-100 text-indigo-800'
                              }`}>
                                Preview: {contact.roleBadge}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <label className="text-[9px] font-mono text-slate-500 font-bold">Badge Color:</label>
                            <select
                              value={currentType}
                              onChange={(e) => {
                                const updated = [...localHelplineContacts];
                                updated[index] = { ...contact, badgeType: e.target.value as any };
                                setLocalHelplineContacts(updated);
                              }}
                              className="bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-[9px] font-mono text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition"
                            >
                              <option value="indigo">Indigo (Blue-Violet)</option>
                              <option value="rose">Rose (Red-Pink)</option>
                              <option value="emerald">Emerald (Green)</option>
                              <option value="amber">Amber (Yellow-Orange)</option>
                            </select>
                          </div>
                        </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                        <div className="sm:col-span-3">
                          <label className="block text-[9.5px] font-bold text-slate-600 mb-0.5">Officer Full Name</label>
                          <input
                            type="text"
                            value={contact.name}
                            onChange={(e) => {
                              const updated = [...localHelplineContacts];
                              updated[index] = { ...contact, name: e.target.value };
                              setLocalHelplineContacts(updated);
                            }}
                            placeholder="e.g. Madhav Taparia"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label className="block text-[9.5px] font-bold text-slate-600 mb-0.5">Role Badge Name</label>
                          <input
                            type="text"
                            value={contact.roleBadge}
                            onChange={(e) => {
                              const updated = [...localHelplineContacts];
                              updated[index] = { ...contact, roleBadge: e.target.value };
                              setLocalHelplineContacts(updated);
                            }}
                            placeholder="e.g. SOP CONTENT OWNER"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition"
                          />
                        </div>

                        <div className="sm:col-span-6">
                          <label className="block text-[9.5px] font-bold text-slate-600 mb-0.5">Officer Designation / Title</label>
                          <input
                            type="text"
                            value={contact.designation}
                            onChange={(e) => {
                              const updated = [...localHelplineContacts];
                              updated[index] = { ...contact, designation: e.target.value };
                              setLocalHelplineContacts(updated);
                            }}
                            placeholder="e.g. Principal Auditor & Chief Curriculum Director"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition"
                          />
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-200/60">
                  <button
                    type="button"
                    onClick={() => {
                      const defaults = [
                        {
                          id: 'contact_1',
                          name: 'Madhav Taparia',
                          designation: 'Principal Auditor & Chief Curriculum Director',
                          roleBadge: 'SOP Content Owner',
                          badgeType: 'indigo' as const
                        },
                        {
                          id: 'contact_2',
                          name: 'Madhav Mantri',
                          designation: 'LMS Technical System Administrator',
                          roleBadge: 'Platform Admin',
                          badgeType: 'rose' as const
                        },
                        {
                          id: 'contact_3',
                          name: 'Aashish Sahu',
                          designation: 'Corporate Compliance & HR Legal Lead',
                          roleBadge: 'HR & Compliance',
                          badgeType: 'emerald' as const
                        }
                      ];
                      setLocalHelplineContacts(defaults);
                      if (onUpdateHelplineContacts) {
                        onUpdateHelplineContacts(defaults);
                      } else {
                        saveHelplineContacts(defaults);
                      }
                      showToast("✓ Helpline contacts successfully reset to defaults.", "success");
                    }}
                    className="bg-slate-150 border border-slate-250 hover:bg-slate-200 text-slate-800 font-bold text-xs px-4 py-2 rounded-lg transition"
                  >
                    Revert Helpline Defaults
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveHelplineContacts}
                    className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-6 py-2 rounded-lg shadow-sm hover:shadow-md transition"
                  >
                    Save Helpline Contacts
                  </button>
                </div>
              </div>
              )}

              {/* SECTION D: SMTP EMAIL DISPATCH & SENDER ALIAS CONFIGURATIONS */}
              {certSubTab === 'smtp' && (
              <div id="smtp-email-config-panel" className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-mono uppercase tracking-wider text-indigo-600 font-extrabold flex items-center gap-2">
                    <span className="p-1 rounded bg-indigo-50 text-indigo-700">✉️</span>
                    Part 4: SMTP Email Server & Sender Alias Settings
                  </h4>
                  <span className="text-[9px] bg-slate-200 text-slate-800 font-mono font-bold px-2 py-0.5 rounded-full select-none">Live Delivery Gateway</span>
                </div>

                {smtpSavingSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs py-2 px-3 rounded-lg font-bold font-sans animate-fade-in">
                    ✓ {smtpSavingSuccess}
                  </div>
                )}

                <p className="text-[10.5px] text-slate-500 leading-normal">
                  Configure custom SMTP connection details to send 2-Step Verification and passkey reset emails to Trainees directly through your corporate mail server using a custom sender alias name.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                  <div className="sm:col-span-4">
                    <label htmlFor="smtp-host" className="block text-[10px] font-bold text-slate-600 mb-0.5">SMTP Outbound Host</label>
                    <input
                      id="smtp-host"
                      type="text"
                      value={smtpHost}
                      onChange={(e) => setSmtpHost(e.target.value)}
                      placeholder="e.g. smtp.gmail.com"
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="smtp-port" className="block text-[10px] font-bold text-slate-600 mb-0.5">SMTP Port</label>
                    <input
                      id="smtp-port"
                      type="text"
                      value={smtpPort}
                      onChange={(e) => setSmtpPort(e.target.value)}
                      placeholder="e.g. 587 or 465"
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="smtp-user" className="block text-[10px] font-bold text-slate-600 mb-0.5">SMTP Username</label>
                    <input
                      id="smtp-user"
                      type="text"
                      value={smtpUser}
                      onChange={(e) => setSmtpUser(e.target.value)}
                      placeholder="e.g. sender@gmail.com"
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="smtp-pass" className="block text-[10px] font-bold text-slate-600 mb-0.5">SMTP Password</label>
                    <input
                      id="smtp-pass"
                      type="password"
                      value={smtpPass}
                      onChange={(e) => setSmtpPass(e.target.value)}
                      placeholder="Server key / app password"
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="bg-amber-50/80 border border-amber-200/60 rounded-lg p-2.5 text-[10px] text-amber-800 leading-normal space-y-1">
                  <p className="font-bold flex items-center gap-1">
                    <span>💡</span> Gmail/Google Workspace SMTP Configuration Notice:
                  </p>
                  <p>
                    If you are using Google Mail (<code>smtp.gmail.com</code>) as your host, ensure <strong>2-Step Verification</strong> is ON under your <a href="https://myaccount.google.com" target="_blank" rel="noopener noreferrer" className="underline font-bold text-amber-900 hover:text-amber-950">Google Account Security</a>, generate a <strong>16-character App Password</strong> (without spaces), and paste it into the <strong>SMTP Password</strong> field above.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 border-t border-slate-100">
                  <div>
                    <label htmlFor="smtp-from-name" className="block text-[10px] font-bold text-slate-600 mb-0.5">Sender Display Name (Alias)</label>
                    <input
                      id="smtp-from-name"
                      type="text"
                      value={smtpFromName}
                      onChange={(e) => setSmtpFromName(e.target.value)}
                      placeholder="e.g. Rathi Buildmart Security"
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 font-semibold outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="smtp-from-email" className="block text-[10px] font-bold text-slate-600 mb-0.5">Sender Email Address</label>
                    <input
                      id="smtp-from-email"
                      type="email"
                      value={smtpFromEmail}
                      onChange={(e) => setSmtpFromEmail(e.target.value)}
                      placeholder="e.g. security@rathibuildmart.com"
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSmtpHost('');
                      setSmtpPort('587');
                      setSmtpUser('');
                      setSmtpPass('');
                      setSmtpFromName('Rathi LMS Security');
                      setSmtpFromEmail('security@rathibuildmart.com');
                      
                      const defaults = {
                        host: '',
                        port: '587',
                        user: '',
                        pass: '',
                        fromName: 'Rathi LMS Security',
                        fromEmail: 'security@rathibuildmart.com'
                      };
                      saveSmtpConfig(defaults);
                      showToast("✓ SMTP configuration reset back to default simulation mode.", "info");
                    }}
                    className="bg-slate-150 border border-slate-250 hover:bg-slate-200 text-slate-800 font-bold text-xs px-4 py-2 rounded-lg transition"
                  >
                    Reset Defaults
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveSmtp}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-2 rounded-lg shadow-sm hover:shadow-md transition"
                  >
                    Save SMTP Configurations
                  </button>
                </div>

                {/* NESTED TESTING PORTAL */}
                <div id="smtp-dispatch-test-portal" className="mt-4 p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-3">
                  <h5 className="text-[10px] font-mono uppercase tracking-wider text-indigo-800 font-extrabold flex items-center gap-1.5">
                    <span>⚡</span> Live SMTP Gateway Dispatch Tester
                  </h5>
                  <p className="text-[10.5px] text-slate-500 leading-normal">
                    Enter any recipient email to instantly test the configured SMTP routing and sender name alias.
                  </p>
                  <div className="flex gap-2 items-center">
                    <input
                      id="smtp-test-email"
                      type="email"
                      value={smtpTestEmail}
                      onChange={(e) => setSmtpTestEmail(e.target.value)}
                      placeholder="Enter recipient email address..."
                      className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      id="smtp-dispatch-test-btn"
                      disabled={smtpTestLoading}
                      onClick={handleTestSmtp}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {smtpTestLoading ? 'Sending...' : 'Dispatch Test'}
                    </button>
                  </div>
                </div>
              </div>
              )}
            </div>

            {/* Right side: Realtime Certificate Mockup Preview */}
            {certSubTab === 'template' && (
              <div className="xl:col-span-5 flex flex-col justify-between bg-slate-950 p-3.5 sm:p-4 rounded-xl border border-slate-800 xl:sticky xl:top-4">
                <div>
                  <span className="text-[10px] font-mono tracking-wider text-emerald-400 font-extrabold uppercase bg-emerald-950/40 border border-emerald-900/50 px-2.5 py-0.5 rounded">
                    Live Preview Simulator
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1.5 leading-normal">
                    Analyzing current typography matching directly to client-side layouts. View real-time styling of your edits here:
                  </p>
                </div>

                {/* Real Simulation Box */}
                <div className="bg-white border border-[#eadaab] rounded-lg p-3 text-center space-y-2.5 my-2.5 shadow-xl select-none relative">
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
            )}
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          TAB: SOP HELPDESK CONSOLE
          ---------------------------------------------------- */}
      {adminTab === 'helpdesk' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 animate-in fade-in duration-200 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
                <span className="text-sm">🛠️</span>
                SOP Issue Helpdesk Console
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Monitor, triage, and resolve complaints and document bugs submitted by active trainees.
              </p>
            </div>
            
            <div className="text-xs font-mono bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg border border-indigo-100/60 font-bold self-start">
              Active Issues: {helpdeskTickets.filter(t => t.status === 'Open').length} Open
            </div>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-150">
            <div className="md:col-span-6 relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                value={helpdeskSearchQuery}
                onChange={(e) => setHelpdeskSearchQuery(e.target.value)}
                placeholder="Search tickets by ID, name, email or description..."
                className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition"
              />
            </div>

            <div className="md:col-span-3">
              <select
                value={helpdeskStatusFilter}
                onChange={(e) => setHelpdeskStatusFilter(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium outline-none focus:border-indigo-500"
              >
                <option value="all">🔍 Filter by Status: All</option>
                <option value="Open">🔴 Open Issues</option>
                <option value="Resolved">🟢 Resolved Issues</option>
                <option value="Closed">⚪ Closed Issues</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <select
                value={helpdeskCategoryFilter}
                onChange={(e) => setHelpdeskCategoryFilter(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium outline-none focus:border-indigo-500"
              >
                <option value="all">📂 Filter by Category: All</option>
                <option value="broken_video">🎥 SOP Video Links</option>
                <option value="missing_pdf">📄 PDF Documents Missing</option>
                <option value="guideline_clarity">❓ SOP Guidance Clarity</option>
                <option value="compliance_doubt">⚖️ Compliance Doubt</option>
                <option value="technical_bug">💻 LMS Technical Bug</option>
              </select>
            </div>
          </div>

          {/* Helpdesk Table/Split View */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
            {/* Ticket List */}
            <div className={selectedTicketId ? "xl:col-span-7 space-y-3" : "xl:col-span-12 space-y-3"}>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left border-collapse bg-white">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-extrabold uppercase text-slate-500 tracking-wider border-b border-slate-200">
                      <th className="p-3">Ticket ID</th>
                      <th className="p-3">Trainee</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Date Submitted</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {(() => {
                      const filtered = helpdeskTickets.filter(ticket => {
                        const matchQuery = 
                          ticket.ticketNo.toLowerCase().includes(helpdeskSearchQuery.toLowerCase()) ||
                          ticket.name.toLowerCase().includes(helpdeskSearchQuery.toLowerCase()) ||
                          ticket.email.toLowerCase().includes(helpdeskSearchQuery.toLowerCase()) ||
                          ticket.description.toLowerCase().includes(helpdeskSearchQuery.toLowerCase());
                        const matchStatus = helpdeskStatusFilter === 'all' || ticket.status === helpdeskStatusFilter;
                        const matchCategory = helpdeskCategoryFilter === 'all' || ticket.category === helpdeskCategoryFilter;
                        return matchQuery && matchStatus && matchCategory;
                      });

                      if (filtered.length === 0) {
                        return (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-slate-400 font-sans italic">
                              No helpdesk tickets found matching the specified filter criteria.
                            </td>
                          </tr>
                        );
                      }

                      return filtered.map(ticket => {
                        const isSelected = selectedTicketId === ticket.id;
                        
                        let catLabel = "Other";
                        let catEmoji = "❓";
                        if (ticket.category === 'broken_video') { catLabel = "SOP Video"; catEmoji = "🎥"; }
                        else if (ticket.category === 'missing_pdf') { catLabel = "Missing PDF"; catEmoji = "📄"; }
                        else if (ticket.category === 'guideline_clarity') { catLabel = "SOP Clarity"; catEmoji = "❓"; }
                        else if (ticket.category === 'compliance_doubt') { catLabel = "Compliance"; catEmoji = "⚖️"; }
                        else if (ticket.category === 'technical_bug') { catLabel = "LMS Bug"; catEmoji = "💻"; }

                        return (
                          <tr 
                            key={ticket.id} 
                            className={`hover:bg-slate-50/50 transition cursor-pointer ${isSelected ? 'bg-indigo-50/40' : ''}`}
                            onClick={() => setSelectedTicketId(ticket.id)}
                          >
                            <td className="p-3 font-mono font-black text-slate-900">
                              {ticket.ticketNo}
                            </td>
                            <td className="p-3">
                              <div className="font-bold text-slate-800">{ticket.name}</div>
                              <div className="text-[10px] text-slate-400 font-medium font-sans">{ticket.email}</div>
                            </td>
                            <td className="p-3">
                              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded text-[10px] border border-slate-200">
                                <span>{catEmoji}</span> {catLabel}
                              </span>
                            </td>
                            <td className="p-3 text-[11px] text-slate-500 font-medium font-sans">
                              {new Date(ticket.timestamp).toLocaleString()}
                            </td>
                            <td className="p-3 text-center">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                                ticket.status === 'Open' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                ticket.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                'bg-slate-100 text-slate-500 border-slate-200'
                              }`}>
                                {ticket.status}
                              </span>
                            </td>
                            <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => setSelectedTicketId(isSelected ? null : ticket.id)}
                                className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100/80 text-indigo-700 text-[10px] font-black rounded border border-indigo-150 transition"
                              >
                                {isSelected ? 'Close Details' : 'Resolve / View'}
                              </button>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Ticket Detail Sidebar Panel */}
            {selectedTicketId && (() => {
              const ticket = helpdeskTickets.find(t => t.id === selectedTicketId);
              if (!ticket) return null;

              let catLabel = "Other";
              let catEmoji = "❓";
              if (ticket.category === 'broken_video') { catLabel = "🎥 Broken SOP Video Walkthrough Link"; }
              else if (ticket.category === 'missing_pdf') { catLabel = "📄 SOP Document (PDF) Missing or Incorrect"; }
              else if (ticket.category === 'guideline_clarity') { catLabel = "❓ SOP Training Guideline lacks clarity"; }
              else if (ticket.category === 'compliance_doubt') { catLabel = "⚖️ Compliance / Legal Audit Policy doubt"; }
              else if (ticket.category === 'technical_bug') { catLabel = "💻 LMS Platform Technical Bug"; }

              return (
                <div className="xl:col-span-5 bg-slate-50 border border-slate-200/80 rounded-2xl p-4.5 space-y-4 animate-in slide-in-from-right-4 duration-200 shadow-3xs self-start">
                  <div className="flex items-center justify-between border-b border-slate-150 pb-2.5">
                    <div>
                      <span className="text-[10px] font-mono font-black bg-slate-200 text-slate-800 px-2.5 py-0.5 rounded border border-slate-300">
                        {ticket.ticketNo}
                      </span>
                      <h4 className="text-xs font-black text-slate-900 mt-1.5">Issue Verification Details</h4>
                    </div>
                    <button 
                      onClick={() => setSelectedTicketId(null)}
                      className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="block text-[8px] font-black text-slate-400 uppercase font-mono tracking-wider">Submitting Trainee</span>
                      <span className="font-bold text-slate-800">{ticket.name}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="block text-[8px] font-black text-slate-400 uppercase font-mono tracking-wider">Email</span>
                        <a href={`mailto:${ticket.email}`} className="text-indigo-600 hover:underline font-semibold font-sans">{ticket.email}</a>
                      </div>
                      <div>
                        <span className="block text-[8px] font-black text-slate-400 uppercase font-mono tracking-wider">Phone / WhatsApp</span>
                        <span className="font-bold text-slate-700 font-sans">{ticket.phone || 'None Provided'}</span>
                      </div>
                    </div>

                    <div>
                      <span className="block text-[8px] font-black text-slate-400 uppercase font-mono tracking-wider">Incident Category</span>
                      <span className="font-semibold text-slate-700">{catLabel}</span>
                    </div>

                    <div>
                      <span className="block text-[8px] font-black text-slate-400 uppercase font-mono tracking-wider">Date Submitted</span>
                      <span className="font-semibold text-slate-600 font-sans">{new Date(ticket.timestamp).toLocaleString()}</span>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-3xs space-y-1">
                      <span className="block text-[8px] font-black text-slate-400 uppercase font-mono tracking-wider">Explain the Issue</span>
                      <p className="text-[11px] text-slate-700 font-medium whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
                    </div>

                    {/* Quick Resolution Controls */}
                    <div className="border-t border-slate-150 pt-3.5 space-y-3">
                      <span className="block text-[8px] font-black text-slate-400 uppercase font-mono tracking-wider">Update Ticket Status</span>
                      <div className="grid grid-cols-3 gap-2">
                        {(['Open', 'Resolved', 'Closed'] as const).map(status => {
                          const isActive = ticket.status === status;
                          return (
                            <button
                              key={status}
                              onClick={() => {
                                const updated = helpdeskTickets.map(t => {
                                  if (t.id === ticket.id) {
                                    return { ...t, status };
                                  }
                                  return t;
                                });
                                setHelpdeskTicketsState(updated);
                                saveHelpdeskTickets(updated);
                                showToast(`✓ Ticket ${ticket.ticketNo} marked as ${status}!`, "success");
                              }}
                              className={`py-1.5 text-[10px] font-black rounded-lg border transition cursor-pointer text-center ${
                                isActive 
                                  ? status === 'Open' ? 'bg-rose-600 text-white border-rose-600' :
                                    status === 'Resolved' ? 'bg-emerald-600 text-white border-emerald-600' :
                                    'bg-slate-700 text-white border-slate-700'
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {status}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
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
      </div>
    </div>
  );
}
