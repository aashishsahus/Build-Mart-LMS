/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from 'react';
import { User, Role, Chapter, Unit, ProgressLog, ProgressStatus, CompanyBranding, GlobalNotification } from './types';
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
  syncAllWithCloud,
  calculateUserProgress,
  getGlobalNotifications,
  saveGlobalNotifications,
  addGlobalNotification
} from './data/stateManager';
import Header from './components/Header';
import LoginScreen from './components/LoginScreen';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import AssessmentCenter from './components/AssessmentCenter';
import ScreeningTest from './components/ScreeningTest';
import CertificateGenerator from './components/CertificateGenerator';
import { Activity, BookOpen, Layers, Database } from 'lucide-react';
import { isFirebasePlaceholder } from './data/firebase';

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
  const [selectedExamChapterId, setSelectedExamChapterId] = useState<string | null>(null);
  const [globalNotifications, setGlobalNotifications] = useState<GlobalNotification[]>([]);

  // Active Routing/Tab
  const [activeTab, setActiveTab] = useState<string>('learning'); // ('learning' | 'admin')

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
    setUsers(getUsers());
    setRoles(getRoles());
    setChapters(getChapters());
    setUnits(getUnits());
    setProgress(getProgress());
    setDepartments(getDepartments());
    setBranding(getCompanyBranding());
    setGlobalNotifications(getGlobalNotifications());
    
    // Auto-login on mount/refresh is not required; keep it clean and let users sign in manually.
    setUserId(null);
    setSimulatedUserId(null);
  };

  // Switch/Simulate users
  const handleSwitchUser = (userId: string) => {
    const isHRRole = (role?: string, dept?: string) => {
      if (!role) return false;
      const r = role.toLowerCase();
      const d = (dept || '').toLowerCase();
      return r === 'role_hr_mgr' || r === 'role_ta_exec' || r === 'role_training_mgr' || d.includes('hr') || d.includes('talent');
    };

    // If not logged in originally, this handles the main login
    if (!currentUserId) {
      setUserId(userId);
      setSimulatedUserId(null);
      const user = getUsers().find(u => u.id === userId);
      const userRole = user?.roleId;
      const isDirectorOrOwner = userRole === 'role_md' || userRole === 'role_ceo' || userRole === 'role_coo' || user?.department === 'Director';
      const isAuthorizedAdmin = userRole === 'role_sr_acc' || isDirectorOrOwner || isHRRole(userRole, user?.department);
      if (isAuthorizedAdmin) {
        setActiveTab('admin-reports');
      } else {
        setActiveTab(userRole === 'role_candidate' ? 'testing' : 'learning');
      }
    } else {
      // Already logged in!
      // Check if original logged-in user is privileged (Sr Accountant or Director/CEO/COO/MD or HR)
      const principalUser = getUsers().find(u => u.id === currentUserId);
      const principalRole = principalUser?.roleId;
      const isPrincipalAdmin = principalRole === 'role_sr_acc' || principalRole === 'role_md' || principalRole === 'role_ceo' || principalRole === 'role_coo' || principalUser?.department === 'Director' || isHRRole(principalRole, principalUser?.department);
      
      if (isPrincipalAdmin) {
        // Simulating the user!
        setSimulatedUserId(userId);
        const targetUser = getUsers().find(u => u.id === userId);
        const targetRole = targetUser?.roleId;
        const isTargetDirectorOrOwner = targetRole === 'role_md' || targetRole === 'role_ceo' || targetRole === 'role_coo' || targetUser?.department === 'Director';
        const isTargetAdmin = targetRole === 'role_sr_acc' || isTargetDirectorOrOwner || isHRRole(targetRole, targetUser?.department);
        
        if (isTargetAdmin) {
          setActiveTab('admin-reports');
        } else {
          setActiveTab(targetRole === 'role_candidate' ? 'testing' : 'learning');
        }
      } else {
        // Not admin/director originally; shouldn't be simulating, but if login is called, allow re-login
        setUserId(userId);
        setSimulatedUserId(null);
        const user = getUsers().find(u => u.id === userId);
        const userRole = user?.roleId;
        const isUserAdmin = userRole === 'role_sr_acc' || userRole === 'role_md' || userRole === 'role_ceo' || userRole === 'role_coo' || user?.department === 'Director' || isHRRole(userRole, user?.department);
        if (isUserAdmin) {
          setActiveTab('admin-reports');
        } else {
          setActiveTab(userRole === 'role_candidate' ? 'testing' : 'learning');
        }
      }
    }
  };

  const handleExitSimulation = () => {
    setSimulatedUserId(null);
    const user = getUsers().find(u => u.id === currentUserId);
    const userRole = user?.roleId;
    const isDirectorOrOwner = userRole === 'role_md' || userRole === 'role_ceo' || userRole === 'role_coo' || user?.department === 'Director';
    const isHRRole = (role?: string, dept?: string) => {
      if (!role) return false;
      const r = role.toLowerCase();
      const d = (dept || '').toLowerCase();
      return r === 'role_hr_mgr' || r === 'role_ta_exec' || r === 'role_training_mgr' || d.includes('hr') || d.includes('talent');
    };
    const isUserAdmin = userRole === 'role_sr_acc' || isDirectorOrOwner || isHRRole(userRole, user?.department);
    if (isUserAdmin) {
      setActiveTab('admin-reports');
    } else {
      setActiveTab(userRole === 'role_candidate' ? 'testing' : 'learning');
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
    setSimulatedUserId(null);
    localStorage.removeItem('lms_current_user_id_v1');
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
    <div className="min-h-screen bg-[#fafbfc] flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-900 relative overflow-hidden">
      {/* Premium Stylish Background Grid & Radial Light Accents */}
      <div className="absolute inset-x-0 top-0 h-[800px] bg-gradient-to-b from-blue-50/30 via-emerald-50/15 to-transparent pointer-events-none z-0" />
      <div className="absolute top-[10%] left-[-15%] w-[600px] h-[600px] rounded-full bg-blue-300/[0.12] blur-[130px] pointer-events-none z-0" />
      <div className="absolute top-[25%] right-[-15%] w-[600px] h-[600px] rounded-full bg-emerald-300/[0.08] blur-[130px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] left-[10%] w-[500px] h-[500px] rounded-full bg-indigo-300/[0.06] blur-[150px] pointer-events-none z-0" />
      
      {/* Modern micro-grid mesh layout pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_20%,#000_75%,transparent_100%)] pointer-events-none opacity-[0.4] z-0" />

      {currentUserId && currentUserDetail ? (
        <div className="flex flex-col min-h-screen relative z-10 flex-grow">
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
          <main className="flex-grow pt-14 lg:pt-16 pb-32 lg:pb-20">
            {activeTab === 'learning' ? (
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
              />
            ) : activeTab === 'exams' ? (
              <AssessmentCenter
                currentUser={currentUserDetail}
                chapterId={selectedExamChapterId}
                onBackToDashboard={() => {
                  setSelectedExamChapterId(null);
                  setActiveTab('learning');
                }}
                onAttemptSaved={() => {
                  const updatedProgress = getProgress();
                  setProgress(updatedProgress);
                }}
              />
            ) : activeTab === 'testing' ? (
              <ScreeningTest
                currentUser={currentUserDetail}
                onAttemptSaved={() => {
                  // Synchronize assessments if necessary
                }}
              />
            ) : activeTab === 'certificate' ? (
              <div id="standalone-certificate-tab" className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 flex flex-col gap-6">
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                  <h3 className="font-display text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2 mb-2">
                    <span className="text-2xl">📜</span>
                    Mastery Certificate Workspace
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-505 text-slate-500 max-w-2xl mb-8 font-sans">
                    Track your completion progress and download your official {branding?.companyName || 'Rathi Buildmart'} Corporate Learning Academy Certificate of Mastery.
                  </p>

                  {certProgressStats && (
                    <CertificateGenerator
                      currentUser={currentUserDetail}
                      userRole={certUserRole}
                      progress={progress}
                      stats={certProgressStats}
                      onStartFinalExam={() => {
                        setSelectedExamChapterId(null);
                        setActiveTab('exams');
                      }}
                    />
                  )}
                </div>
              </div>
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
                selectedTab={activeTab.startsWith('admin-') ? (activeTab.replace('admin-', '') as any) : undefined}
                onTabChange={(tab) => setActiveTab('admin-' + tab)}
              />
            )}
          </main>

          {/* Modern & Stylish Fixed Status Footer bar */}
          <footer className="bg-white/85 backdrop-blur-lg border-t border-slate-200/60 py-3 text-center text-[10px] font-sans shrink-0 fixed bottom-0 left-0 right-0 z-40 shadow-[0_-8px_24px_rgba(15,23,42,0.04)] lg:pb-3 pb-[calc(3.5rem+10px)] transition-all duration-300">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-6">
              
              {/* Compliance Indicator Badge */}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50/70 text-emerald-700 rounded-full border border-emerald-100/80 text-[9px] font-mono tracking-wider uppercase font-bold shadow-3xs">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Security Matrix Compliant
              </span>
              
              {/* Central Title */}
              <span className="text-[10px] text-slate-500 hover:text-slate-700 font-sans tracking-tight font-medium transition duration-150">
                Rathi's Build Mart LMS <span className="text-slate-300 mx-1">•</span> Enterprise Training & Compliance Platform
              </span>

              {/* Server/Database Cloud telemetry */}
              <div className="flex items-center gap-3 sm:gap-4 text-[9px] font-mono">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border ${
                  isFirebasePlaceholder 
                    ? 'bg-amber-50/70 text-amber-700 border-amber-100/80' 
                    : 'bg-indigo-50/70 text-indigo-700 border-indigo-100/80'
                } font-bold shadow-3xs`}>
                  <Database className={`w-3 h-3 ${isFirebasePlaceholder ? 'text-amber-500' : 'text-indigo-500'}`} />
                  <span>Cloud DB: {isFirebasePlaceholder ? 'Local Sandbox' : 'Firebase Active'}</span>
                </span>
                
                <span className="text-slate-200 hidden xs:inline">|</span>
                
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-50/70 text-slate-500 rounded-md border border-slate-200/50">
                  <Activity className="w-3 h-3 text-slate-400" />
                  <span>UTC: 2026-06-25</span>
                </span>
              </div>
            </div>
          </footer>
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
