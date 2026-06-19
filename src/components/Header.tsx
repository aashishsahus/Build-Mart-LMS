/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserWithRole } from '../data/stateManager';
import { CompanyBranding } from '../types';
import { 
  BookOpen, 
  RefreshCw, 
  LogOut, 
  Shield, 
  MapPin, 
  Layers, 
  Clock, 
  Settings, 
  Award, 
  Brain, 
  Camera, 
  X, 
  Globe, 
  Building2, 
  Landmark, 
  Briefcase, 
  Check, 
  Link, 
  Upload 
} from 'lucide-react';

interface HeaderProps {
  currentUser: UserWithRole | null;
  allUsers: any[];
  onSwitchUser: (userId: string) => void;
  onLogout: () => void;
  onResetData: () => void;
  currentTab: string;
  onChangeTab: (tab: string) => void;
  branding?: CompanyBranding;
  onUpdateUserAvatar?: (userId: string, avatarUrl: string) => void;
  originalUser?: UserWithRole | null;
  isSimulating?: boolean;
  onExitSimulation?: () => void;
}

const PRESET_AVATARS = [
  { id: '1', name: 'Executive Leader', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80' },
  { id: '2', name: 'Finance Auditor', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80' },
  { id: '3', name: 'Junior Accountant', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80' },
  { id: '4', name: 'Operations Director', url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120&auto=format&fit=crop&q=80' },
  { id: '5', name: 'Quality Registrar', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80' },
  { id: '6', name: 'Accounts Officer', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80' },
  { id: '7', name: 'Buildmart Architect', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80' },
  { id: '8', name: 'Technical Specialist', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80' },
];

export default function Header({
  currentUser,
  allUsers,
  onSwitchUser,
  onLogout,
  onResetData,
  currentTab,
  onChangeTab,
  branding,
  onUpdateUserAvatar,
  originalUser,
  isSimulating = false,
  onExitSimulation
}: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [dragActive, setDragActive] = useState(false);

  if (!currentUser) return null;

  // Modern non-blocking states
  const [headerToast, setHeaderToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [avatarError, setAvatarError] = useState('');
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);

  const showHeaderToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setHeaderToast({ message, type });
    setTimeout(() => {
      setHeaderToast(null);
    }, 4500);
  };

  const isAdmin = currentUser.roleId === 'role_sr_acc' || 
                  currentUser.roleId === 'role_md' || 
                  currentUser.roleId === 'role_ceo' || 
                  currentUser.roleId === 'role_coo' || 
                  currentUser.department === 'Director';

  const realUser = originalUser || currentUser;
  const isOriginalAdmin = realUser.roleId === 'role_sr_acc' || 
                          realUser.roleId === 'role_md' || 
                          realUser.roleId === 'role_ceo' || 
                          realUser.roleId === 'role_coo' || 
                          realUser.department === 'Director';

  // Custom company logo renderer
  const renderLogo = () => {
    if (!branding) {
      return <BookOpen className="w-5 h-5 text-white" />;
    }
    if (branding.logoType === 'emoji') {
      return <span className="text-xl sm:text-2xl select-none">{branding.logoValue || '🏢'}</span>;
    }
    if (branding.logoType === 'image') {
      return (
        <img 
          src={branding.logoValue} 
          alt="Company Logo" 
          className="w-7 h-7 object-contain rounded select-none shadow-sm bg-white p-0.5"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=80';
          }}
          referrerPolicy="no-referrer"
        />
      );
    }
    // Icon type matches
    switch (branding.logoValue) {
      case 'Building2': return <Building2 className="w-5 h-5 text-white" />;
      case 'Layers': return <Layers className="w-5 h-5 text-white" />;
      case 'Award': return <Award className="w-5 h-5 text-white" />;
      case 'Shield': return <Shield className="w-5 h-5 text-white" />;
      case 'Briefcase': return <Briefcase className="w-5 h-5 text-white" />;
      case 'Landmark': return <Landmark className="w-5 h-5 text-white" />;
      case 'Globe': return <Globe className="w-5 h-5 text-white" />;
      default: return <BookOpen className="w-5 h-5 text-white" />;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onUpdateUserAvatar?.(realUser.id, reader.result);
          showHeaderToast("✓ Profile photo updated successfully from local file!", "success");
          setShowAvatarModal(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onUpdateUserAvatar?.(realUser.id, reader.result);
          showHeaderToast("✓ Profile photo uploaded successfully!", "success");
          setShowAvatarModal(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      {headerToast && (
        <div id="header-notif-toast" className="fixed top-4 right-4 z-[999] flex items-center gap-2.5 px-4 py-3 bg-slate-900 border border-slate-705/80 border-slate-700/80 rounded-2xl shadow-xl hover:shadow-2xl text-xs font-semibold text-slate-100 animate-in slide-in-from-top-3 duration-300">
          <span className="text-emerald-400">✓</span>
          <span>{headerToast.message}</span>
        </div>
      )}

      {showResetConfirmModal && (
        <div id="reset-confirm-modal" className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-200 space-y-5 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto text-xl">
              ⚠️
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-950">Confirm System Reset?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Deploying initial presets will clear all custom employees, chapters, verification logs, and checklist records. This operation is immediate and irreversible.
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirmModal(false)}
                className="flex-grow bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl border border-slate-250 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetData();
                  setShowResetConfirmModal(false);
                  showHeaderToast("✓ Database presets successfully deployed!", "success");
                }}
                className="flex-grow bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-sm hover:shadow cursor-pointer"
              >
                Yes, Reset System
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-slate-950 border-b border-slate-800/80 text-slate-150 sticky top-0 z-50 shadow-sm backdrop-blur-md bg-opacity-95">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 lg:h-16 items-center">
            {/* Brand Logo & Name */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="bg-emerald-600/90 hover:bg-emerald-600 p-2 sm:p-2.5 rounded-xl shadow-lg shadow-emerald-950/20 flex items-center justify-center transition-all duration-200 shrink-0">
                {renderLogo()}
              </div>
              <div className="min-w-0">
                <h1 className="font-display text-xs sm:text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
                  <span className="truncate">{branding?.companyName || 'Build Mart'}</span>
                  <span className="text-[9px] bg-emerald-950/80 text-emerald-300 font-mono font-medium px-1.5 py-0.5 rounded border border-emerald-800/55 tracking-widest shrink-0">
                    {branding?.companyAbbreviation || 'LMS'}
                  </span>
                </h1>
                <p className="hidden sm:block text-[9px] text-slate-400 font-mono tracking-widest uppercase font-semibold">
                  {branding?.companyTagline || 'MEMBER OF RATHI BUILDMART PLC'}
                </p>
              </div>
            </div>

            {/* Navigation/Tabs - Segment Control Design (Hidden on Mobile to avoid horizontal scrollbar) */}
            <nav className="hidden lg:flex items-center bg-slate-900/90 border border-slate-800/80 p-1 rounded-xl gap-1 overflow-x-auto whitespace-nowrap scrollbar-none max-w-[280px] xs:max-w-[340px] sm:max-w-none">
              {isAdmin ? (
                <button
                  onClick={() => onChangeTab('admin-reports')}
                  className={`px-3.5 py-1.5 text-xs font-display font-extrabold rounded-lg transition-all duration-200 h-8 flex items-center justify-center gap-1.5 shrink-0 ${
                    currentTab.startsWith('admin-') || currentTab === 'admin'
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-950/25'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  id="nav-admin-reports"
                >
                  <Building2 className="w-3.5 h-3.5 text-emerald-450" />
                  <span>Workspace Cockpit</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => onChangeTab('learning')}
                    className={`px-3.5 py-1.5 text-xs font-display font-extrabold rounded-lg transition-all duration-200 h-8 flex items-center justify-center shrink-0 ${
                      currentTab === 'learning'
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-950/25'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    id="nav-learning-path"
                  >
                    My Learning Path
                  </button>
                  <button
                    onClick={() => onChangeTab('exams')}
                    className={`px-3.5 py-1.5 text-xs font-display font-extrabold rounded-lg transition-all duration-205 h-8 flex items-center justify-center gap-1.5 shrink-0 ${
                      currentTab === 'exams'
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-950/25'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    id="nav-exam-center"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Final Competency Test</span>
                  </button>
                  <button
                    onClick={() => onChangeTab('testing')}
                    className={`px-3.5 py-1.5 text-xs font-display font-extrabold rounded-lg transition-all duration-205 h-8 flex items-center justify-center gap-1.5 shrink-0 ${
                      currentTab === 'testing'
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-950/25'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    id="nav-only-testing"
                  >
                    <Brain className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Only Testing</span>
                  </button>
                  <button
                    onClick={() => onChangeTab('certificate')}
                    className={`px-3.5 py-1.5 text-xs font-display font-extrabold rounded-lg transition-all duration-200 h-8 flex items-center justify-center gap-1.5 shrink-0 ${
                      currentTab === 'certificate'
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-950/25'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    id="nav-mastery-certificate"
                  >
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>Mastery Certificate</span>
                  </button>
                </>
              )}
            </nav>

            {/* User Section & Quick Switcher */}
            <div className="flex items-center gap-4">
              {/* Quick switcher for testing simulated environments */}
              {isOriginalAdmin && (
                <div className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-300 ${
                  isSimulating 
                    ? 'bg-rose-950/70 border-rose-800/80' 
                    : 'bg-slate-900/80 border-slate-800/80'
                }`}>
                  <span className={`text-[10px] font-mono uppercase tracking-wider font-bold ${
                    isSimulating ? 'text-rose-400 animate-pulse' : 'text-slate-400'
                  }`}>
                    {isSimulating ? 'Simulated View:' : 'Simulate:'}
                  </span>
                  <select
                    value={currentUser.id}
                    onChange={(e) => onSwitchUser(e.target.value)}
                    className={`bg-transparent text-xs border-none font-bold focus:ring-0 cursor-pointer pr-6 py-0 font-sans outline-none ${
                      isSimulating ? 'text-rose-200' : 'text-emerald-400'
                    }`}
                  >
                    {allUsers.map(u => {
                      const getFriendlyRole = (roleId: string) => {
                        if (roleId === 'role_md' || roleId === 'role_ceo' || roleId === 'role_coo') return 'Director Console';
                        if (roleId === 'role_sr_acc') return 'Admin Accountant';
                        if (roleId === 'role_jr_acc') return 'General Ledger Executive';
                        if (roleId === 'role_ap_ar') return 'Billing & AP/AR Executive';
                        if (roleId === 'role_tax_assoc') return 'Taxation Analyst';
                        return 'Finance Trainee';
                      };
                      return (
                        <option key={u.id} value={u.id} className="text-slate-900 bg-white font-medium">
                          {u.name} ({getFriendlyRole(u.roleId)})
                        </option>
                      );
                    })}
                  </select>

                  {isSimulating && (
                    <button
                      onClick={onExitSimulation}
                      className="ml-1.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded transition-all duration-150 flex items-center gap-1.5 shrink-0"
                      title="Return to your authentic Admin/Director profile"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Exit View</span>
                    </button>
                  )}
                </div>
              )}

              {/* Profile Info Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 text-left hover:opacity-90 focus:outline-none transition group p-1 rounded-xl hover:bg-slate-900/40"
                >
                  <img
                    src={realUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                    alt={realUser.name}
                    className="w-9 h-9 rounded-full object-cover border-2 border-emerald-550/45 group-hover:border-emerald-500 shadow-md transition-colors"
                    referrerPolicy="no-referrer"
                  />
                  <div className="hidden md:block">
                    <p className="text-xs font-semibold text-slate-100 group-hover:text-emerald-400 transition-colors leading-tight">{realUser.name}</p>
                    <p className="text-[9px] text-emerald-400 font-mono tracking-tight font-semibold uppercase mt-0.5">
                      {realUser.role?.name || 'No Role'}
                    </p>
                  </div>
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)}></div>
                    <div className="absolute right-0 mt-3 w-64 bg-slate-900 rounded-xl shadow-2xl border border-slate-800 p-2 z-20 text-slate-200 text-xs text-left animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="p-3 border-b border-slate-800 font-medium">
                        <p className="font-bold text-slate-100 text-sm leading-tight">{realUser.name}</p>
                        <p className="text-slate-400 text-[10px] font-mono mt-0.5">{realUser.email}</p>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-2 font-mono bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                          <MapPin className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                          <span className="truncate">{realUser.focusEntity}</span>
                        </div>
                      </div>

                      {/* Quick Sim Mobile Menu */}
                      <div className="py-1">
                        {isOriginalAdmin && (
                          <div className={`lg:hidden p-2.5 rounded-lg m-1 mb-2 border ${
                            isSimulating ? 'bg-rose-950/40 border-rose-900/60' : 'bg-slate-950 border-slate-800'
                          }`}>
                            <span className={`text-[10px] font-mono uppercase tracking-wider block mb-1.5 font-bold ${
                              isSimulating ? 'text-rose-400' : 'text-slate-400'
                            }`}>
                              {isSimulating ? 'Simulate active:' : 'Simulate User:'}
                            </span>
                            <select
                              value={currentUser.id}
                              onChange={(e) => {
                                onSwitchUser(e.target.value);
                                setDropdownOpen(false);
                              }}
                              className="w-full bg-slate-900 text-xs text-emerald-400 font-bold border border-slate-800 rounded-lg p-1.5 outline-none mb-2"
                            >
                              {allUsers.map(u => (
                                <option key={u.id} value={u.id} className="text-slate-950 bg-white">
                                  {u.name}
                                </option>
                              ))}
                            </select>

                            {isSimulating && (
                              <button
                                onClick={() => {
                                  onExitSimulation?.();
                                  setDropdownOpen(false);
                                }}
                                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-mono text-[10px] font-bold uppercase tracking-wider py-1.5 rounded flex items-center justify-center gap-1 transition"
                              >
                                <LogOut className="w-3.5 h-3.5" />
                                <span>Exit Sim Mode</span>
                              </button>
                            )}
                          </div>
                        )}

                        {/* HIGH FIDELITY PIC AVATAR TRIGGERS */}
                        <button
                          type="button"
                          onClick={() => {
                            setShowAvatarModal(true);
                            setDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-emerald-300 text-left transition font-semibold"
                        >
                          <Camera className="w-4 h-4 text-emerald-500" />
                          <span>Change Profile Photo 📷</span>
                        </button>

                        {!isAdmin && (
                          <button
                            onClick={() => {
                              onChangeTab(currentTab === 'learning' ? 'admin' : 'learning');
                              setDropdownOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-800 rounded-lg text-slate-305 text-left transition font-semibold"
                          >
                            <Shield className="w-4 h-4 text-emerald-450" />
                            <span>Toggle: {currentTab === 'learning' ? 'Admin Portal' : 'My Learning'}</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setShowResetConfirmModal(true);
                            setDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-rose-950/20 rounded-lg text-rose-300 text-left transition"
                        >
                          <RefreshCw className="w-4 h-4 text-rose-400" />
                          <span>Reset Data to Default</span>
                        </button>

                        <div className="border-t border-slate-800 my-1"></div>

                        <button
                          onClick={() => {
                            onLogout();
                            setDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-rose-950/40 hover:text-white text-slate-400 rounded-lg text-left transition font-semibold"
                        >
                          <LogOut className="w-4 h-4 text-rose-500" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* PICTURE PROFILE SELECTION MODAL */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full max-h-[90vh] overflow-y-auto flex flex-col p-6 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span className="p-1 px-2 rounded-lg bg-emerald-50 text-emerald-700">🖼️</span>
                  Configure Profile Picture
                </h3>
                <p className="text-xs text-slate-500 mt-1">Select a high-resolution preset, paste a photo URL, or drag and drop a local file!</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="py-4 space-y-5 flex-grow">
              
              {/* CURRENT PROFILE PIC PREVIEW */}
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                <img
                  src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                  alt="Current profile preview"
                  className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md bg-white select-none"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Current Live Photo</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">This picture represents your profile across directories, checklists, and sign-offs.</p>
                </div>
              </div>

              {/* METHOD 1: CURATED TEAM PRESETS */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-extrabold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  Option 1: Professional Team Presets
                </h4>
                <div className="grid grid-cols-4 gap-2.5">
                  {PRESET_AVATARS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        onUpdateUserAvatar?.(currentUser.id, preset.url);
                        showHeaderToast(`✓ Selected ${preset.name} preset!`, "success");
                        setShowAvatarModal(false);
                      }}
                      className="group flex flex-col items-center p-1.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl transition text-center select-none cursor-pointer"
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-10 h-10 rounded-full object-cover shadow-sm group-hover:scale-105 transition duration-150 border border-white"
                        referrerPolicy="no-referrer"
                      />
                      <span className="text-[8.5px] font-semibold text-slate-500 truncate w-full mt-1.5 group-hover:text-emerald-700">
                        {preset.name.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* METHOD 2: LOCAL DEVICE FILE DROP AREA */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-extrabold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Option 2: Upload Device Photo
                </h4>
                
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition flex flex-col items-center justify-center cursor-pointer select-none ${
                    dragActive 
                      ? "border-emerald-500 bg-emerald-50/40" 
                      : "border-slate-200 bg-slate-50/30 hover:bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  <label className="flex flex-col items-center cursor-pointer w-full h-full">
                    <Upload className="w-7 h-7 text-slate-400 mb-2 animate-bounce" />
                    <span className="text-xs font-bold text-slate-700">Drag & Drop profile image file here</span>
                    <span className="text-[10px] text-slate-400 mt-1">Supports PNG, JPG, or GIF. Converted instantly to safe local state!</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <span className="mt-3 text-[10px] inline-block bg-white border border-slate-250 hover:bg-slate-50 text-slate-700 font-bold px-3 py-1 rounded-lg">
                      Choose Device File
                    </span>
                  </label>
                </div>
              </div>

              {/* METHOD 3: COGNITIVE URL LINK */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-extrabold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  Option 3: External Image Link (URL)
                </h4>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customAvatarUrl}
                    onChange={(e) => setCustomAvatarUrl(e.target.value)}
                    placeholder="e.g. https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"
                    className="flex-grow bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarError('');
                      if (!customAvatarUrl) {
                        setAvatarError("Please provide a valid image URL first.");
                        return;
                      }
                      if (!customAvatarUrl.startsWith('http://') && !customAvatarUrl.startsWith('https://') && !customAvatarUrl.startsWith('data:image/')) {
                        setAvatarError("URL must start with http:// or https:// to render correctly.");
                        return;
                      }
                      onUpdateUserAvatar?.(currentUser.id, customAvatarUrl);
                      showHeaderToast("✓ Custom profile photo URL configured!", "success");
                      setShowAvatarModal(false);
                    }}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-1.5 rounded-lg transition"
                  >
                    Apply URL
                  </button>
                </div>
                {avatarError && (
                  <p className="text-[10px] text-rose-500 font-bold mt-1 animate-in fade-in">
                    ⚠️ {avatarError}
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                className="bg-slate-100 hover:bg-slate-150 text-slate-700 font-bold px-4 py-2 rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Bottom Tab Bar for Mobile Devices */}
      <div className="fixed bottom-0 inset-x-0 bg-slate-950/95 border-t border-slate-900/40 backdrop-blur-md z-[45] flex justify-around items-center h-14 lg:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.5)] px-2">
        {isAdmin ? (
          <button
            onClick={() => onChangeTab('admin-reports')}
            className={`flex-1 flex flex-col items-center justify-center h-full transition-all duration-200 ${
              currentTab.startsWith('admin-') || currentTab === 'admin'
                ? 'text-emerald-400 font-bold scale-[1.02]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className={`w-4.5 h-4.5 mb-1 ${currentTab.startsWith('admin-') || currentTab === 'admin' ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span className="text-[9px] tracking-tight font-sans">Cockpit</span>
          </button>
        ) : (
          <>
            <button
              onClick={() => onChangeTab('learning')}
              className={`flex-1 flex flex-col items-center justify-center h-full transition-all duration-200 ${
                currentTab === 'learning'
                  ? 'text-emerald-400 font-bold scale-[1.02]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className={`w-4.5 h-4.5 mb-1 ${currentTab === 'learning' ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span className="text-[9px] tracking-tight font-sans">My Path</span>
            </button>

            <button
              onClick={() => onChangeTab('exams')}
              className={`flex-1 flex flex-col items-center justify-center h-full transition-all duration-200 ${
                currentTab === 'exams'
                  ? 'text-emerald-400 font-bold scale-[1.02]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Award className={`w-4.5 h-4.5 mb-1 ${currentTab === 'exams' ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span className="text-[9px] tracking-tight font-sans">Final Test</span>
            </button>

            <button
              onClick={() => onChangeTab('testing')}
              className={`flex-1 flex flex-col items-center justify-center h-full transition-all duration-200 ${
                currentTab === 'testing'
                  ? 'text-emerald-400 font-bold scale-[1.02]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Brain className={`w-4.5 h-4.5 mb-1 ${currentTab === 'testing' ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span className="text-[9px] tracking-tight font-sans">Practice</span>
            </button>

            <button
              onClick={() => onChangeTab('certificate')}
              className={`flex-1 flex flex-col items-center justify-center h-full transition-all duration-200 ${
                currentTab === 'certificate'
                  ? 'text-emerald-400 font-bold scale-[1.02]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Award className={`w-4.5 h-4.5 mb-1 ${currentTab === 'certificate' ? 'text-amber-400' : 'text-slate-400'}`} />
              <span className="text-[9px] tracking-tight font-sans">Certificate</span>
            </button>
          </>
        )}
      </div>
    </>
  );
}
