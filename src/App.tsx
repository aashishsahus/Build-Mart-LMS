/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from 'react';
import { User, Role, Chapter, Unit, ProgressLog, ProgressStatus, CompanyBranding } from './types';
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
  calculateUserProgress
} from './data/stateManager';
import Header from './components/Header';
import LoginScreen from './components/LoginScreen';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import AssessmentCenter from './components/AssessmentCenter';
import ScreeningTest from './components/ScreeningTest';
import CertificateGenerator from './components/CertificateGenerator';
import { Activity, BookOpen, Layers } from 'lucide-react';

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
    
    // Auto-login on mount/refresh is not required; keep it clean and let users sign in manually.
    setUserId(null);
    setSimulatedUserId(null);
  };

  // Switch/Simulate users
  const handleSwitchUser = (userId: string) => {
    // If not logged in originally, this handles the main login
    if (!currentUserId) {
      setUserId(userId);
      setSimulatedUserId(null);
      const user = getUsers().find(u => u.id === userId);
      const userRole = user?.roleId;
      const isDirectorOrOwner = userRole === 'role_md' || userRole === 'role_ceo' || userRole === 'role_coo' || user?.department === 'Director';
      if (userRole === 'role_sr_acc' || isDirectorOrOwner) {
        setActiveTab('admin-reports');
      } else {
        setActiveTab(userRole === 'role_candidate' ? 'testing' : 'learning');
      }
    } else {
      // Already logged in!
      // Check if original logged-in user is privileged (Sr Accountant or Director/CEO/COO/MD)
      const principalUser = getUsers().find(u => u.id === currentUserId);
      const principalRole = principalUser?.roleId;
      const isPrincipalAdmin = principalRole === 'role_sr_acc' || principalRole === 'role_md' || principalRole === 'role_ceo' || principalRole === 'role_coo' || principalUser?.department === 'Director';
      
      if (isPrincipalAdmin) {
        // Simulating the user!
        setSimulatedUserId(userId);
        const targetUser = getUsers().find(u => u.id === userId);
        const targetRole = targetUser?.roleId;
        const isTargetDirectorOrOwner = targetRole === 'role_md' || targetRole === 'role_ceo' || targetRole === 'role_coo' || targetUser?.department === 'Director';
        
        if (targetRole === 'role_sr_acc' || isTargetDirectorOrOwner) {
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
        if (userRole === 'role_sr_acc' || userRole === 'role_md' || userRole === 'role_ceo' || userRole === 'role_coo' || user?.department === 'Director') {
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
    if (userRole === 'role_sr_acc' || isDirectorOrOwner) {
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

  // Administrator verification of submitted learning units
  const handleSettleVerification = (empId: string, unitId: string, action: 'verify' | 'reject') => {
    if (!currentUserId) return;
    const status: ProgressStatus = action === 'verify' ? 'Verified & Mastered' : 'In Progress';
    const updated = updateUnitProgress(empId, unitId, status, undefined, currentUserId);
    setProgress([...updated]);
  };

  // Registration callback
  const handleRegisterUser = (newUser: Omit<User, 'id'>) => {
    const freshId = `usr_${Date.now()}`;
    const created: User = { ...newUser, id: freshId };
    
    const updatedUsers = [...users, created];
    saveUsers(updatedUsers);
    setUsers(updatedUsers);
    
    // Auto login is not required. The LoginScreen handles user feedback and switching tabs cleanly.
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
          />

          {/* Core Content Area */}
          <main className="flex-grow pb-16 lg:pb-0">
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
                onUpdateUsers={(updated) => { saveUsers(updated); setUsers(updated); }}
                onUpdateRoles={(updated) => { saveRoles(updated); setRoles(updated); }}
                onUpdateChapters={(updated) => { saveChapters(updated); setChapters(updated); }}
                onUpdateUnits={(updated) => { saveUnits(updated); setUnits(updated); }}
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

          {/* Footer bar */}
          <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-400 font-medium font-sans">
            <div className="max-w-[1600px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-[11px] font-mono tracking-wider">
                <Activity className="w-3.5 h-3.5 text-emerald-600" />
                SECURITY MATRIX COMPLIANCE IN FORCE
              </span>
              <span>
                Build Training Program  Learning Platform  Rathi's Build Mart
              </span>
              <p className="font-mono text-[10px] text-slate-400">
                System Time Check: UTC 2026-06-05
              </p>
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
