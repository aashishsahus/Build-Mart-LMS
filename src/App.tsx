/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from 'react';
import { User, Role, Chapter, Unit, ProgressLog, ProgressStatus, CompanyBranding, GlobalNotification, HelplineContact, HelpdeskTicket } from './types';
import { 
  getUsers, 
  getRoles, 
  getChapters, 
  getUnits, 
  getProgress, 
  getCurrentUserId, 
  saveUsers, 
  saveRoles, 
  saveChapters, 
  saveUnits, 
  saveProgress, 
  setCurrentUserId, 
  resetToDefaults, 
  getUserWithRole,
  updateUnitProgress,
  UserWithRole,
  getDepartments,
  saveDepartments,
  getCompanyBranding,
  saveCompanyBranding,
  getHelplineContacts,
  saveHelplineContacts,
  syncAllWithCloud,
  calculateUserProgress,
  getGlobalNotifications,
  saveGlobalNotifications,
  addGlobalNotification,
  updateUserActivity,
  addHelpdeskTicket,
  getHelpdeskTickets
} from './data/stateManager';
import Header from './components/Header';
import LoginScreen from './components/LoginScreen';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import AssessmentCenter from './components/AssessmentCenter';
import ScreeningTest from './components/ScreeningTest';
import CertificateGenerator from './components/CertificateGenerator';
import { Avatar } from './components/Avatar';
import { Activity, BookOpen, Layers, Database, HelpCircle, ShieldCheck, Keyboard, LifeBuoy, AlertTriangle, CheckCircle, RefreshCw, Users, Server } from 'lucide-react';
import { isFirebasePlaceholder } from './data/firebase';

function checkIsAdminUser(role?: string, dept?: string, user?: User): boolean {
  if (user?.isSuperAdmin || user?.isAdmin) return true;
  if (!role) return false;
  const r = role.toLowerCase();
  const d = (dept || '').toLowerCase();
  const isHR = r === 'role_hr_mgr' || r === 'role_ta_exec' || r === 'role_training_mgr' || d.includes('hr') || d.includes('talent');
  const isDirectorOrOwner = r === 'role_md' || r === 'role_ceo' || r === 'role_coo' || d === 'director';
  if (r === 'role_sr_acc' || isDirectorOrOwner || isHR) {
    return true;
  }

  // Dynamic authorization check from the persisted permissions matrix
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('lms_permissions_matrix_v1');
    if (saved) {
      try {
        const matrix = JSON.parse(saved);
        // If this role has any permission set to true in the matrix, grant cockpit/admin dashboard access
        return Object.keys(matrix).some(permId => matrix[permId]?.[role] === true);
      } catch (e) {
        console.error("Error reading permissions matrix in App.tsx:", e);
      }
    }
  }

  return false;
}

export default function App() {
  // Application Data States
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [progress, setProgress] = useState<ProgressLog[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [currentUserId, setUserId] = useState<string | null>(null);
  const [simulatedUserId, setSimulatedUserId] = useState<string | null>(null);
  const [branding, setBranding] = useState<CompanyBranding>(() => getCompanyBranding());
  const [helplineContacts, setHelplineContacts] = useState<HelplineContact[]>(() => getHelplineContacts());
  const [selectedExamChapterId, setSelectedExamChapterId] = useState<string | null>(null);
  const [globalNotifications, setGlobalNotifications] = useState<GlobalNotification[]>([]);

  // Active Routing/Tab
  const [activeTab, setActiveTab] = useState<string>('learning'); // ('learning' | 'admin')

  // Interactive Footer Support States
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [modalTab, setModalTab] = useState<'ticket' | 'hotkeys' | 'helpline' | 'online'>('ticket');
  const [reportIssueType, setReportIssueType] = useState<string>('sop_guideline');
  const [reportMessage, setReportMessage] = useState<string>('');
  const [reportContact, setReportContact] = useState<string>('');
  const [reportSuccess, setReportSuccess] = useState<boolean>(false);
  const [reportSubmitting, setReportSubmitting] = useState<boolean>(false);

  // Dynamic Real-time Active Trainees Sync
  useEffect(() => {
    const activeId = simulatedUserId || currentUserId;
    if (!activeId) return;

    // Immediately record activity on load/change
    updateUserActivity(activeId);
    setUsers(getUsers());

    // Set interval to keep updating activity and fetching latest users list
    const interval = setInterval(() => {
      const currentActiveId = simulatedUserId || currentUserId;
      if (currentActiveId) {
        updateUserActivity(currentActiveId);
        setUsers(getUsers());
      }
    }, 15000); // every 15 seconds

    return () => clearInterval(interval);
  }, [currentUserId, simulatedUserId]);

  const activeOnlineUsers = users.filter(u => {
    if (!u.lastActive) return false;
    const diff = Date.now() - new Date(u.lastActive).getTime();
    return diff < 15 * 60 * 1000;
  });

  const sortedUsersWithStatus = [...users].sort((a, b) => {
    const aActive = a.lastActive ? (Date.now() - new Date(a.lastActive).getTime() < 15 * 60 * 1000) : false;
    const bActive = b.lastActive ? (Date.now() - new Date(b.lastActive).getTime() < 15 * 60 * 1000) : false;

    if (aActive && !bActive) return -1;
    if (!aActive && bActive) return 1;

    if (a.lastActive && b.lastActive) {
      return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
    }

    if (a.lastActive && !b.lastActive) return -1;
    if (!a.lastActive && b.lastActive) return 1;

    return a.name.localeCompare(b.name);
  });

  // Load state on mount
  useEffect(() => {
    reloadStoreData();
    // Asynchronously synchronize with Google Cloud Firestore database
    syncAllWithCloud().then((synced) => {
      if (synced) {
        console.log("Synchronized with Google Cloud Firestore database successfully.");
        // Reload React component states with fresh cloud records
        reloadStoreData();
      }
    });
  }, []);

  const reloadStoreData = () => {
    const currentUsers = getUsers();
    setUsers(currentUsers);
    setRoles(getRoles());
    setChapters(getChapters());
    setUnits(getUnits());
    setProgress(getProgress());
    setDepartments(getDepartments());
    setBranding(getCompanyBranding());
    setHelplineContacts(getHelplineContacts());
    setGlobalNotifications(getGlobalNotifications());
    
    // Support persistent session across refreshes and hot-reloads
    const savedUserId = getCurrentUserId();
    if (savedUserId) {
      setUserId(savedUserId);
      const user = currentUsers.find(u => u.id === savedUserId);
      if (user) {
        if (checkIsAdminUser(user.roleId, user.department, user)) {
          setActiveTab('admin-reports');
        } else {
          setActiveTab(user.roleId === 'role_candidate' ? 'testing' : 'learning');
        }
      }
    } else {
      setUserId(null);
    }
    setSimulatedUserId(null);
  };

  // Switch/Simulate users
  const handleSwitchUser = (userId: string) => {
    // If not logged in originally, this handles the main login
    if (!currentUserId) {
      setUserId(userId);
      setCurrentUserId(userId); // Persist session to prevent status deletion
      setSimulatedUserId(null);
      const user = getUsers().find(u => u.id === userId);
      if (user && checkIsAdminUser(user.roleId, user.department, user)) {
        setActiveTab('admin-reports');
      } else if (user) {
        setActiveTab(user.roleId === 'role_candidate' ? 'testing' : 'learning');
      }
    } else {
      // Already logged in!
      // Check if original logged-in user is privileged (Sr Accountant or Director/CEO/COO/MD or HR)
      const principalUser = getUsers().find(u => u.id === currentUserId);
      const isPrincipalAdmin = principalUser && checkIsAdminUser(principalUser.roleId, principalUser.department, principalUser);
      
      if (isPrincipalAdmin) {
        // Simulating the user!
        setSimulatedUserId(userId);
        const targetUser = getUsers().find(u => u.id === userId);
        if (targetUser && checkIsAdminUser(targetUser.roleId, targetUser.department, targetUser)) {
          setActiveTab('admin-reports');
        } else if (targetUser) {
          setActiveTab(targetUser.roleId === 'role_candidate' ? 'testing' : 'learning');
        }
      } else {
        // Not admin/director originally; shouldn't be simulating, but if login is called, allow re-login
        setUserId(userId);
        setCurrentUserId(userId); // Persist session to prevent status deletion
        setSimulatedUserId(null);
        const user = getUsers().find(u => u.id === userId);
        if (user && checkIsAdminUser(user.roleId, user.department, user)) {
          setActiveTab('admin-reports');
        } else if (user) {
          setActiveTab(user.roleId === 'role_candidate' ? 'testing' : 'learning');
        }
      }
    }
  };

  const handleExitSimulation = () => {
    setSimulatedUserId(null);
    const user = getUsers().find(u => u.id === currentUserId);
    if (user && checkIsAdminUser(user.roleId, user.department, user)) {
      setActiveTab('admin-reports');
    } else if (user) {
      setActiveTab(user.roleId === 'role_candidate' ? 'testing' : 'learning');
    }
  };

  // User submits a unit progress
  const handleUpdateUnitProgress = (unitId: string, status: ProgressStatus, notes?: string, watchPercent?: number) => {
    const activeId = simulatedUserId || currentUserId;
    if (!activeId) return;
    const updatedLogs = updateUnitProgress(activeId, unitId, status, notes, undefined, watchPercent);
    setProgress([...updatedLogs]);
  };

  // System Notification dispatch helper
  const sendNotification = (notification: Omit<GlobalNotification, 'id' | 'timestamp' | 'isReadBy'>) => {
    addGlobalNotification(notification);
    setGlobalNotifications(getGlobalNotifications());
  };

  // Administrator verification of submitted learning units
  const handleSettleVerification = (empId: string, unitId: string, action: 'verify' | 'reject') => {
    if (!currentUserId) return;
    const status: ProgressStatus = action === 'verify' ? 'Verified & Mastered' : 'In Progress';
    const updated = updateUnitProgress(empId, unitId, status, undefined, currentUserId);
    setProgress([...updated]);

    // Send targeted notification to the student/trainee
    const trainee = users.find(u => u.id === empId);
    const targetUnit = units.find(un => un.id === unitId);
    if (trainee && targetUnit) {
      sendNotification({
        title: action === 'verify' ? 'Work Walkthrough Approved! ✅' : 'walkthrough Revision Required ✍️',
        message: action === 'verify'
          ? `Your submission for task "${targetUnit.taskName}" (under chapter "${chapters.find(c => c.id === targetUnit.chapterId)?.name || 'General'}") has been approved & verified as mastered by CFO / Admin ${originalUserDetail?.name || 'Aashish Sahu'}.`
          : `Admin ${originalUserDetail?.name || 'Aashish Sahu'} requested revision of "${targetUnit.taskName}". Let's take another look.`,
        type: 'approval',
        targetUserId: empId,
        creatorId: originalUserDetail?.id || currentUserId || undefined,
        creatorName: originalUserDetail?.name || 'Aashish Sahu'
      });
    }
  };

  const handleUpdateUsers = (updatedUsers: User[]) => {
    const curUsers = getUsers();
    if (updatedUsers.length > curUsers.length) {
      // User added
      const added = updatedUsers.find(nu => !curUsers.some(ou => ou.id === nu.id));
      if (added) {
        const roleName = roles.find(r => r.id === added.roleId)?.name || 'Trainee';
        sendNotification({
          title: 'New Member Registered 🤝',
          message: `${added.name} joined the "${added.department}" department as a ${roleName}. Added by Admin ${originalUserDetail?.name || 'Aashish Sahu'}.`,
          type: 'user_add',
          targetDept: added.department,
          creatorId: originalUserDetail?.id || currentUserId || undefined,
          creatorName: originalUserDetail?.name || 'Aashish Sahu'
        });
      }
    } else if (updatedUsers.length < curUsers.length) {
      // User removed
      const removed = curUsers.find(ou => !updatedUsers.some(nu => nu.id === ou.id));
      if (removed) {
        sendNotification({
          title: 'User Profile Removed 🔐',
          message: `The user account for "${removed.name}" (${removed.department}) has been removed/revoked from the LMS workspace by CFO / Admin ${originalUserDetail?.name || 'Aashish Sahu'}.`,
          type: 'user_remove',
          creatorId: originalUserDetail?.id || currentUserId || undefined,
          creatorName: originalUserDetail?.name || 'Aashish Sahu'
        });
      }
    }
    saveUsers(updatedUsers);
    setUsers(updatedUsers);
  };

  const handleUpdateChapters = (updatedChapters: Chapter[]) => {
    const curChapters = getChapters();
    if (updatedChapters.length > curChapters.length) {
      const added = updatedChapters.find(nc => !curChapters.some(oc => oc.id === nc.id));
      if (added) {
        const roleName = roles.find(r => r.id === added.roleId)?.name || 'Mapped Trainee Profile';
        sendNotification({
          title: 'New Lesson Chapter Added 📚',
          message: `A new standard work process chapter "${added.name}" has been mapped to role: "${roleName}" by Admin ${originalUserDetail?.name || 'Aashish Sahu'}.`,
          type: 'chapter_add',
          targetRoleId: added.roleId,
          creatorId: originalUserDetail?.id || currentUserId || undefined,
          creatorName: originalUserDetail?.name || 'Aashish Sahu'
        });
      }
    } else if (updatedChapters.length < curChapters.length) {
      const removed = curChapters.find(oc => !updatedChapters.some(nc => nc.id === oc.id));
      if (removed) {
        sendNotification({
          title: 'SOP Chapter Retired 📁',
          message: `The workflow SOP chapter "${removed.name}" was retired from the active curriculum by CFO / Admin ${originalUserDetail?.name || 'Aashish Sahu'}.`,
          type: 'chapter_remove',
          targetRoleId: removed.roleId,
          creatorId: originalUserDetail?.id || currentUserId || undefined,
          creatorName: originalUserDetail?.name || 'Aashish Sahu'
        });
      }
    }
    saveChapters(updatedChapters);
    setChapters(updatedChapters);
  };

  const handleUpdateUnits = (updatedUnits: Unit[]) => {
    const curUnits = getUnits();
    if (updatedUnits.length > curUnits.length) {
      const added = updatedUnits.find(nu => !curUnits.some(ou => ou.id === nu.id));
      if (added) {
        const chap = chapters.find(c => c.id === added.chapterId);
        sendNotification({
          title: 'New Walkthrough Lesson 🎥',
          message: `Standard walkthrough "${added.videoTitle}" of task "${added.taskName}" was added under chapter "${chap?.name || 'General'}" by Admin ${originalUserDetail?.name || 'Aashish Sahu'}.`,
          type: 'unit_add',
          targetRoleId: chap?.roleId,
          creatorId: originalUserDetail?.id || currentUserId || undefined,
          creatorName: originalUserDetail?.name || 'Aashish Sahu'
        });
      }
    } else if (updatedUnits.length < curUnits.length) {
      const removed = curUnits.find(ou => !updatedUnits.some(nu => nu.id === ou.id));
      if (removed) {
        sendNotification({
          title: 'Task Lesson Retired 🎬',
          message: `SOP walkthrough "${removed.videoTitle}" of task "${removed.taskName}" has been removed from modules by CFO / Admin ${originalUserDetail?.name || 'Aashish Sahu'}.`,
          type: 'unit_remove',
          creatorId: originalUserDetail?.id || currentUserId || undefined,
          creatorName: originalUserDetail?.name || 'Aashish Sahu'
        });
      }
    }
    saveUnits(updatedUnits);
    setUnits(updatedUnits);
  };

  // Registration callback
  const handleRegisterUser = (newUser: Omit<User, 'id'>) => {
    const freshId = `usr_${Date.now()}`;
    const created: User = { ...newUser, id: freshId };
    
    const updatedUsers = [...users, created];
    saveUsers(updatedUsers);
    setUsers(updatedUsers);

    // Send a system registration notification
    const roleName = roles.find(r => r.id === created.roleId)?.name || 'Trainee';
    sendNotification({
      title: 'New Member Self-Registered 🚀',
      message: `${created.name} signed up in "${created.department}" as a ${roleName}. Pending verification validation.`,
      type: 'user_add',
      targetDept: created.department,
      creatorName: created.name
    });
  };
 
  const handleLogout = () => {
    setUserId(null);
    setCurrentUserId(null);
    setSimulatedUserId(null);
  };

  const handleResetToDefaults = () => {
    resetToDefaults();
    reloadStoreData();
    setActiveTab('learning');
  };

  const handleUpdateCompanyBranding = (updated: CompanyBranding) => {
    saveCompanyBranding(updated);
    setBranding(updated);
  };

  const handleUpdateUserAvatar = (userId: string, avatarUrl: string) => {
    const freshUsers = getUsers().map(u => u.id === userId ? { ...u, avatarUrl } : u);
    saveUsers(freshUsers);
    setUsers(freshUsers);
  };

  // Resolved user records
  const activeUserId = simulatedUserId || currentUserId;
  const currentUserDetail: UserWithRole | null = activeUserId ? getUserWithRole(activeUserId) : null;
  const originalUserDetail: UserWithRole | null = currentUserId ? getUserWithRole(currentUserId) : null;
  const isSimulating = !!(simulatedUserId && simulatedUserId !== currentUserId);

  // Stats for the certificate/dashboard calculated at top-level
  const certUserRole = currentUserDetail ? roles.find(r => r.id === currentUserDetail.roleId) : undefined;
  const certAssignedRoleIds = currentUserDetail ? Array.from(new Set([
    currentUserDetail.roleId,
    ...(currentUserDetail.roleIds || [])
  ])) : [];
  const certCanViewAllRoles = currentUserDetail ? (
    currentUserDetail.roleId === 'role_sr_acc' || 
    currentUserDetail.roleId === 'role_md' || 
    currentUserDetail.roleId === 'role_ceo' || 
    currentUserDetail.roleId === 'role_coo' || 
    currentUserDetail.department === 'Director'
  ) : false;
  const certCurrentRoleIds = certCanViewAllRoles ? roles.map(r => r.id) : certAssignedRoleIds;
  const certProgressStats = currentUserDetail ? calculateUserProgress(currentUserDetail.id, certCurrentRoleIds) : null;

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-[#fafbfc] flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-900 relative">
      {/* Premium Stylish Background Grid & Radial Light Accents */}
      <div className="absolute inset-x-0 top-0 h-[800px] bg-gradient-to-b from-blue-50/30 via-emerald-50/15 to-transparent pointer-events-none z-0" />
      <div className="absolute top-[10%] left-[-15%] w-[600px] h-[600px] rounded-full bg-blue-300/[0.12] blur-[130px] pointer-events-none z-0" />
      <div className="absolute top-[25%] right-[-15%] w-[600px] h-[600px] rounded-full bg-emerald-300/[0.08] blur-[130px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] left-[10%] w-[500px] h-[500px] rounded-full bg-indigo-300/[0.06] blur-[150px] pointer-events-none z-0" />
      
      {/* Modern micro-grid mesh layout pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_20%,#000_75%,transparent_100%)] pointer-events-none opacity-[0.4] z-0" />

      {currentUserId && currentUserDetail ? (
        <div className="flex flex-col min-h-screen lg:h-screen lg:overflow-hidden relative z-10 flex-grow">
          {/* Header */}
          <Header
            currentUser={currentUserDetail}
            originalUser={originalUserDetail}
            isSimulating={isSimulating}
            onExitSimulation={handleExitSimulation}
            allUsers={users}
            onSwitchUser={handleSwitchUser}
            onLogout={handleLogout}
            onResetData={handleResetToDefaults}
            currentTab={activeTab}
            onChangeTab={(tab) => {
              setActiveTab(tab);
              if (tab !== 'exams') {
                setSelectedExamChapterId(null);
              }
            }}
            branding={branding}
            onUpdateUserAvatar={handleUpdateUserAvatar}
            globalNotifications={globalNotifications}
            onUpdateNotifications={(updated) => {
              saveGlobalNotifications(updated);
              setGlobalNotifications(updated);
            }}
          />

          {/* Core Content Area */}
          <main className="flex-grow pt-14 lg:pt-16 pb-32 lg:pb-12 lg:h-[calc(100vh-64px)] lg:max-h-[calc(100vh-64px)] lg:overflow-hidden flex flex-col min-h-0">
            {!activeTab.startsWith('admin-') ? (
              <UserDashboard
                currentUser={currentUserDetail}
                roles={roles}
                chapters={chapters}
                units={units}
                progress={progress}
                onUpdateProgress={handleUpdateUnitProgress}
                onStartChapterExam={(chId) => {
                  setSelectedExamChapterId(chId);
                  setActiveTab('exams');
                }}
                branding={branding}
                globalNotifications={globalNotifications}
                onUpdateNotifications={(updated) => {
                  saveGlobalNotifications(updated);
                  setGlobalNotifications(updated);
                }}
                activeTab={activeTab}
                onChangeTab={(tab) => {
                  setActiveTab(tab);
                }}
                selectedExamChapterId={selectedExamChapterId}
                setSelectedExamChapterId={setSelectedExamChapterId}
                onAttemptSaved={() => {
                  const updatedProgress = getProgress();
                  setProgress(updatedProgress);
                }}
                certUserRole={certUserRole}
                certProgressStats={certProgressStats}
              />
            ) : (
              <AdminDashboard
                currentUser={currentUserDetail}
                roles={roles}
                users={users}
                chapters={chapters}
                units={units}
                progress={progress}
                departments={departments}
                onUpdateUsers={handleUpdateUsers}
                onUpdateRoles={(updated) => { saveRoles(updated); setRoles(updated); }}
                onUpdateChapters={handleUpdateChapters}
                onUpdateUnits={handleUpdateUnits}
                onUpdateProgress={(updated) => { saveProgress(updated); setProgress(updated); }}
                onUpdateDepartments={(updated) => { saveDepartments(updated); setDepartments(updated); }}
                onSettleVerification={handleSettleVerification}
                onSwitchUser={handleSwitchUser}
                branding={branding}
                onUpdateBranding={handleUpdateCompanyBranding}
                helplineContacts={helplineContacts}
                onUpdateHelplineContacts={(updated) => { saveHelplineContacts(updated); setHelplineContacts(updated); }}
                selectedTab={activeTab.startsWith('admin-') ? (activeTab.replace('admin-', '') as any) : undefined}
                onTabChange={(tab) => setActiveTab('admin-' + tab)}
                onSelectTraineeTab={(tab) => setActiveTab(tab)}
              />
            )}
          </main>

          {/* Modern & Stylish Fixed Status Footer bar */}
          <footer className="bg-white/85 backdrop-blur-lg border-t border-slate-200/60 py-2.5 text-center text-[10px] font-sans shrink-0 fixed bottom-0 left-0 right-0 z-40 shadow-[0_-8px_24px_rgba(15,23,42,0.04)] lg:pb-2.5 pb-[calc(3.5rem+10px)] transition-all duration-300">
            <div className="w-full px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-6">
              
              {/* Left Side: Compliance & Real-time Live Counters */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <span className="inline-flex items-center gap-2 text-[10px] font-sans text-slate-800 font-semibold transition duration-200">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  Security Matrix Compliant
                </span>

                {activeOnlineUsers.length >= 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      setModalTab('online');
                      setShowHelpModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 text-[10px] font-sans text-slate-800 font-semibold cursor-pointer transition hover:text-slate-900"
                  >
                    <Users className="w-3.5 h-3.5 text-slate-600" />
                    <span>Active Online: {activeOnlineUsers.length} {activeOnlineUsers.length === 1 ? 'Trainee' : 'Trainees'} 🟢</span>
                  </button>
                )}
              </div>
              
              {/* Central Title & Interactive Help Button */}
              <div className="flex items-center gap-2 text-[10px] text-slate-500 hover:text-slate-700 font-sans tracking-tight font-medium transition duration-150">
                <span>Rathi's Build Mart LMS</span>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={() => {
                    setReportSuccess(false);
                    setShowHelpModal(true);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg border border-indigo-100/60 transition font-bold cursor-pointer"
                >
                  <LifeBuoy className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>SOP Helpdesk & Hotkeys 🛎️</span>
                </button>
              </div>

              {/* Server/Database Cloud telemetry */}
              <div className="flex flex-wrap items-center justify-center md:justify-end gap-2.5 sm:gap-4 text-[9px] font-mono">
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${
                  isFirebasePlaceholder 
                    ? 'bg-amber-50/70 text-amber-700 border-amber-100/80' 
                    : 'bg-indigo-50/70 text-indigo-700 border-indigo-100/80'
                } font-bold shadow-3xs`}>
                  <Database className={`w-3 h-3 ${isFirebasePlaceholder ? 'text-amber-500' : 'text-indigo-500'}`} />
                  <span>Cloud DB: {isFirebasePlaceholder ? 'Local Sandbox' : 'Firebase Active'}</span>
                </span>

                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50/70 text-emerald-700 rounded-md border border-emerald-200/50">
                  <Server className="w-3 h-3 text-emerald-500" />
                  <span>SLA: 99.99% Operational</span>
                </span>
                
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-50/70 text-slate-500 rounded-md border border-slate-200/50">
                  <Activity className="w-3 h-3 text-slate-400" />
                  <span>UTC: 2026-06-25</span>
                </span>
              </div>
            </div>
          </footer>

          {/* Interactive Help Desk & Issue reporter modal popup */}
          {showHelpModal && (
            <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in transition duration-250">
              <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-150">
                {/* Header banner */}
                <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-5 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <LifeBuoy className="w-5 h-5 text-indigo-400 animate-pulse" />
                    <div>
                      <h4 className="font-display font-black text-sm tracking-tight">Rathi Build Mart Helpline</h4>
                      <p className="text-[10px] text-slate-300 font-mono">Enterprise Training & SOP Helpdesk Console</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowHelpModal(false)}
                    className="text-slate-400 hover:text-white transition duration-150 font-bold p-1.5 hover:bg-slate-800/50 rounded-lg text-xs"
                  >
                    ✕ Close
                  </button>
                </div>

                {/* Navigation tabs */}
                <div className="bg-slate-50 border-b border-slate-100 flex flex-wrap p-1.5 gap-1 md:gap-1.5 text-[11px] md:text-xs">
                  <button
                    type="button"
                    onClick={() => setModalTab('online')}
                    className={`flex-1 min-w-[110px] py-1.5 md:py-2 px-2 rounded-lg font-bold transition duration-150 flex items-center justify-center gap-1 ${
                      modalTab === 'online'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-850'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                    <span>Who's Online ({activeOnlineUsers.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalTab('ticket')}
                    className={`flex-1 min-w-[110px] py-1.5 md:py-2 px-2 rounded-lg font-bold transition duration-150 flex items-center justify-center gap-1 ${
                      modalTab === 'ticket'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-850'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Report SOP Issue</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalTab('hotkeys')}
                    className={`flex-1 min-w-[110px] py-1.5 md:py-2 px-2 rounded-lg font-bold transition duration-150 flex items-center justify-center gap-1 ${
                      modalTab === 'hotkeys'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-850'
                    }`}
                  >
                    <Keyboard className="w-3.5 h-3.5 shrink-0" />
                    <span>Hotkeys</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalTab('helpline')}
                    className={`flex-1 min-w-[110px] py-1.5 md:py-2 px-2 rounded-lg font-bold transition duration-150 flex items-center justify-center gap-1 ${
                      modalTab === 'helpline'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-850'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span>Contacts</span>
                  </button>
                </div>

                {/* Main Tab content */}
                <div className="p-6 max-h-[360px] overflow-y-auto">
                  
                  {/* TAB: ONLINE TRAINEES */}
                  {modalTab === 'online' && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Trainee status and activity directory. Currently active trainees are marked in green, while others are offline:
                      </p>

                      <div className="space-y-3">
                        {sortedUsersWithStatus.filter(u => u.lastActive || u.id === currentUserId).map((u) => {
                          const isSelf = u.id === currentUserId;
                          
                          let activeText = "Never logged in";
                          let isActive = false;
                          let isNever = true;

                          if (u.lastActive) {
                            isNever = false;
                            const diffMs = Date.now() - new Date(u.lastActive).getTime();
                            const diffMins = Math.floor(diffMs / 60000);
                            
                            if (diffMins < 15) {
                              isActive = true;
                              if (diffMins > 0) {
                                activeText = `Active ${diffMins}m ago`;
                              } else {
                                activeText = "Active now";
                              }
                            } else {
                              const diffHours = Math.floor(diffMins / 60);
                              const diffDays = Math.floor(diffHours / 24);
                              
                              if (diffDays > 0) {
                                activeText = `Offline (Active ${diffDays}d ago)`;
                              } else if (diffHours > 0) {
                                activeText = `Offline (Active ${diffHours}h ago)`;
                              } else {
                                activeText = `Offline (Active ${diffMins}m ago)`;
                              }
                            }
                          }

                          return (
                            <div key={u.id} className={`p-2 px-3 rounded-xl border flex items-center justify-between hover:bg-slate-100/40 transition ${
                              isActive ? 'bg-slate-50/60 border-slate-200/60' : 'bg-slate-50/30 border-slate-100/40'
                            }`}>
                              <div className="flex items-center gap-2.5">
                                <div className="relative">
                                  <Avatar src={u.avatarUrl} name={u.name} className={`w-8 h-8 ${!isActive ? 'opacity-70' : ''}`} />
                                  <span className={`absolute bottom-0 right-0 block h-1.5 w-1.5 rounded-full ring-1 ring-white ${
                                    isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
                                  }`} />
                                </div>
                                <div>
                                  <div className="flex items-center gap-1">
                                    <span className={`text-[11.5px] font-extrabold ${isActive ? 'text-slate-800' : 'text-slate-600'}`}>{u.name}</span>
                                    {isSelf && (
                                      <span className="px-1 py-0.2 bg-indigo-600 text-white text-[7.5px] font-black tracking-wider uppercase rounded">
                                        You
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[9px] text-slate-500 font-medium font-sans">{u.department} • {u.focusEntity || 'Trainee'}</p>
                                </div>
                              </div>
                              <span className={`text-[8.5px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                                isActive 
                                  ? 'text-emerald-700 bg-emerald-50 border-emerald-100' 
                                  : isNever 
                                    ? 'text-slate-400 bg-slate-50 border-slate-100 italic' 
                                    : 'text-slate-500 bg-slate-100/50 border-slate-200'
                              }`}>
                                {activeText}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* TAB 1: SUBMIT REPORT */}
                  {modalTab === 'ticket' && (
                    <div>
                      {reportSuccess ? (
                        <div className="text-center py-6 animate-in zoom-in-95">
                          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3.5 border border-emerald-100 shadow-3xs">
                            <CheckCircle className="w-6 h-6" />
                          </div>
                          <h5 className="font-display font-black text-slate-900 text-base mb-1.5">SOP Ticket Submitted!</h5>
                          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5 leading-relaxed">
                            Thank you! Your feedback has been registered and dispatched directly into the Administration & Compliance alerts matrix.
                          </p>
                          <button
                            type="button"
                            onClick={() => setReportSuccess(false)}
                            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-850 text-white text-xs font-bold rounded-lg transition"
                          >
                            Submit Another Issue
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          if (!reportMessage.trim()) return;
                          setReportSubmitting(true);
                          
                          setTimeout(() => {
                            const ticket = addHelpdeskTicket({
                              userId: currentUserDetail?.id || 'anonymous',
                              name: currentUserDetail?.name || 'Anonymous Employee',
                              email: currentUserDetail?.email || '',
                              phone: reportContact,
                              category: reportIssueType,
                              description: reportMessage
                            });

                            sendNotification({
                              title: `⚠️ Helpdesk Ticket: ${reportIssueType.replace('_', ' ').toUpperCase()}`,
                              message: `Ticket ${ticket.ticketNo}: ${reportMessage} [Submitting contact: ${reportContact || currentUserDetail?.name || 'Anonymous'}]`,
                              type: 'system',
                              isAdminOnly: true
                            });

                            addGlobalNotification({
                              title: `⚠️ SOP Helpdesk Ticket ${ticket.ticketNo}`,
                              message: `New ticket ${ticket.ticketNo} reported by ${currentUserDetail?.name || 'Anonymous'} (${reportIssueType.replace('_', ' ').toUpperCase()})`,
                              type: 'system',
                              isAdminOnly: true
                            });

                            setReportSuccess(true);
                            setReportSubmitting(false);
                            setReportMessage('');
                            setReportContact('');
                          }, 900);
                        }} className="space-y-4">
                          <p className="text-xs text-slate-500 leading-relaxed">
                            Faced an issue with an SOP guide, video walkthrough link, or PDF document? Submit a quick ticket directly to the compliance department below:
                          </p>

                          <div className="grid grid-cols-2 gap-3 bg-slate-100/50 p-2.5 rounded-xl border border-slate-200/60">
                            <div>
                              <span className="block text-[8px] font-black text-slate-400 uppercase font-mono tracking-wider">Your Name (Auto-Filled)</span>
                              <span className="text-[11px] font-bold text-slate-700">{currentUserDetail?.name || 'Anonymous Employee'}</span>
                            </div>
                            <div>
                              <span className="block text-[8px] font-black text-slate-400 uppercase font-mono tracking-wider">Your Email (Auto-Filled)</span>
                              <span className="text-[11px] font-bold text-slate-700 truncate block">{currentUserDetail?.email || 'N/A'}</span>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-[10px] font-extrabold text-slate-700 uppercase font-mono tracking-wider mb-1">Issue Category</label>
                            <select
                              value={reportIssueType}
                              onChange={(e) => setReportIssueType(e.target.value)}
                              className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            >
                              <option value="broken_video">🎥 Broken SOP Video Walkthrough Link</option>
                              <option value="missing_pdf">📄 SOP Document (PDF) Missing or Incorrect</option>
                              <option value="guideline_clarity">❓ SOP Training Guideline lacks clarity</option>
                              <option value="compliance_doubt">⚖️ Compliance / Legal Audit Policy doubt</option>
                              <option value="technical_bug">💻 LMS Platform Technical Bug</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-extrabold text-slate-700 uppercase font-mono tracking-wider mb-1">Explain the Issue</label>
                            <textarea
                              rows={3}
                              required
                              value={reportMessage}
                              onChange={(e) => setReportMessage(e.target.value)}
                              placeholder="Please describe what is wrong (e.g. Video shows unavailable, PDF doesn't match Unit code GST-004)..."
                              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-white text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            ></textarea>
                          </div>

                          <div>
                            <label className="block text-[10px] font-extrabold text-slate-700 uppercase font-mono tracking-wider mb-1">WhatsApp / Contact No. (Optional)</label>
                            <input
                              type="text"
                              value={reportContact}
                              onChange={(e) => setReportContact(e.target.value)}
                              placeholder="Enter Phone/WhatsApp for urgent follow up"
                              className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            />
                          </div>

                          <div className="pt-2">
                            <button
                              type="submit"
                              disabled={reportSubmitting || !reportMessage.trim()}
                              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-xs font-bold rounded-lg transition duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                            >
                              {reportSubmitting ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  Registering Support Ticket...
                                </>
                              ) : (
                                "Disptach Help Ticket to Admin Panel"
                              )}
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}

                  {/* TAB 2: HOTKEYS */}
                  {modalTab === 'hotkeys' && (
                    <div className="space-y-4">
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Navigate Rathi's Build Mart LMS with elite efficiency using these standard keyboard shortcuts and accessibility gestures:
                      </p>
                      
                      <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100">
                        <div className="flex justify-between items-center p-3 text-xs bg-slate-50/50">
                          <span className="font-semibold text-slate-700">Exit / Close active Modal</span>
                          <kbd className="px-2 py-0.5 bg-white border border-slate-200 rounded-md font-mono text-[10px] font-bold text-slate-500 shadow-3xs">Esc</kbd>
                        </div>
                        <div className="flex justify-between items-center p-3 text-xs">
                          <span className="font-semibold text-slate-700">Submit Practice Test Answer</span>
                          <kbd className="px-2 py-0.5 bg-white border border-slate-200 rounded-md font-mono text-[10px] font-bold text-slate-500 shadow-3xs">Enter</kbd>
                        </div>
                        <div className="flex justify-between items-center p-3 text-xs bg-slate-50/50">
                          <span className="font-semibold text-slate-700">Toggle Admin Dashboard</span>
                          <kbd className="px-2 py-0.5 bg-white border border-slate-200 rounded-md font-mono text-[10px] font-bold text-slate-500 shadow-3xs">Ctrl + Shift + A</kbd>
                        </div>
                        <div className="flex justify-between items-center p-3 text-xs">
                          <span className="font-semibold text-slate-700">Play/Pause Walkthrough video</span>
                          <kbd className="px-2 py-0.5 bg-white border border-slate-200 rounded-md font-mono text-[10px] font-bold text-slate-500 shadow-3xs">Spacebar</kbd>
                        </div>
                      </div>

                      <div className="bg-amber-50/50 border border-amber-100 rounded-lg p-3 text-amber-850 flex items-start gap-2.5">
                        <Keyboard className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-extrabold uppercase tracking-wide font-mono mb-0.5">Quick Navigation Note</p>
                          <p className="text-[10px] leading-relaxed">
                            For optimum compliance results, it is highly recommended to follow the SOP steps sequentially before attempting the Final Certification Tests.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: HELPLINE */}
                  {modalTab === 'helpline' && (
                    <div className="space-y-4">
                      <p className="text-xs text-slate-500 leading-relaxed">
                        For institutional training escalations, certification approvals, or curriculum policy changes, feel free to contact the designated officers:
                      </p>

                      <div className="space-y-3">
                        {helplineContacts.map((contact, index) => {
                          // Determine the badge color with fallbacks so even if badgeType is missing/undefined,
                          // we assign a distinct high-contrast color based on index or keywords.
                          let type = (contact.badgeType || '').toLowerCase();
                          if (!type) {
                            // Smart fallback
                            const roleText = (contact.roleBadge || '').toLowerCase();
                            if (roleText.includes('admin') || roleText.includes('platform')) {
                              type = 'rose';
                            } else if (roleText.includes('compliance') || roleText.includes('hr') || roleText.includes('legal')) {
                              type = 'emerald';
                            } else if (roleText.includes('sop') || roleText.includes('content') || roleText.includes('owner')) {
                              type = 'indigo';
                            } else {
                              // Assign distinct colors based on index fallback
                              const fallbackColors = ['indigo', 'rose', 'emerald', 'amber'];
                              type = fallbackColors[index % fallbackColors.length];
                            }
                          }

                          let badgeColors = 'bg-indigo-100 text-indigo-800 border border-indigo-200/80';
                          if (type === 'rose') badgeColors = 'bg-rose-100 text-rose-800 border border-rose-200/80';
                          if (type === 'emerald') badgeColors = 'bg-emerald-100 text-emerald-800 border border-emerald-200/80';
                          if (type === 'amber') badgeColors = 'bg-amber-100 text-amber-800 border border-amber-200/80';
                          if (type === 'indigo') badgeColors = 'bg-indigo-100 text-indigo-800 border border-indigo-200/80';

                          return (
                            <div key={contact.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                              <div>
                                <p className="text-xs font-extrabold text-slate-800">{contact.name}</p>
                                <p className="text-[10px] text-slate-500 font-mono">{contact.designation}</p>
                              </div>
                              <span className={`px-2 py-0.5 ${badgeColors} text-[9px] font-extrabold uppercase rounded-full shadow-3xs`}>
                                {contact.roleBadge}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <p className="text-[10px] text-slate-400 text-center font-medium pt-2">
                        Official Hotline Support active Mon - Sat (9:30 AM to 6:30 PM IST)
                      </p>
                    </div>
                  )}

                </div>

                {/* Footer action bar */}
                <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setShowHelpModal(false)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition"
                  >
                    Got It, Close Help
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Unauthenticated view */
        <LoginScreen
          roles={roles}
          users={users}
          departments={departments}
          onLogin={handleSwitchUser}
          onAddUser={handleRegisterUser}
          branding={branding}
        />
      )}
    </div>
  );
}
