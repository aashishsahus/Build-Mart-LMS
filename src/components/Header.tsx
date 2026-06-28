/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Avatar } from './Avatar';
import { PremiumBadge } from './PremiumBadge';
import { UserWithRole, getRoles } from '../data/stateManager';
import { CompanyBranding, GlobalNotification } from '../types';
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
  Upload,
  Bell,
  Sparkles
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
  globalNotifications?: GlobalNotification[];
  onUpdateNotifications?: (updated: GlobalNotification[]) => void;
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
  onExitSimulation,
  globalNotifications = [],
  onUpdateNotifications = () => {}
}: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // Notification states
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [dismissedNotifIds, setDismissedNotifIds] = useState<string[]>([]);

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

  const isHRUser = (roleId?: string, dept?: string) => {
    if (!roleId) return false;
    const rId = roleId.toLowerCase();
    const dName = (dept || '').toLowerCase();
    return rId === 'role_hr_mgr' || rId === 'role_ta_exec' || rId === 'role_training_mgr' || dName.includes('hr') || dName.includes('talent');
  };

  const isAdmin = currentUser.roleId === 'role_sr_acc' || 
                  currentUser.roleId === 'role_md' || 
                  currentUser.roleId === 'role_ceo' || 
                  currentUser.roleId === 'role_coo' || 
                  currentUser.department === 'Director' ||
                  isHRUser(currentUser.roleId, currentUser.department);

  const assignedRoleIds = Array.from(new Set([
    currentUser.roleId,
    ...(currentUser.roleIds || [])
  ])).filter(Boolean);

  // Filter global notifications for the current user
  const notifications = (globalNotifications || []).filter(notif => {
    if (dismissedNotifIds.includes(notif.id)) {
      return false;
    }
    if (isAdmin) {
      return true;
    }
    if (notif.isAdminOnly) {
      return false;
    }
    if (notif.targetUserId && notif.targetUserId !== currentUser.id) {
      return false;
    }
    if (notif.targetDept && notif.targetDept.toLowerCase() !== (currentUser.department || '').toLowerCase()) {
      return false;
    }
    if (notif.targetRoleId && notif.targetRoleId !== currentUser.roleId && !currentUser.roleIds?.includes(notif.targetRoleId)) {
      return false;
    }
    return true;
  });

  const unreadCount = notifications.filter(n => !(n.isReadBy || []).includes(currentUser.id)).length;

  const handleMarkAsRead = (notifId: string) => {
    const updated = (globalNotifications || []).map(n => {
      if (n.id === notifId) {
        const currentReadBy = n.isReadBy || [];
        const isReadBy = currentReadBy.includes(currentUser.id) ? currentReadBy : [...currentReadBy, currentUser.id];
        return { ...n, isReadBy };
      }
      return n;
    });
    onUpdateNotifications(updated);
  };

  const handleMarkAllRead = () => {
    const updated = (globalNotifications || []).map(n => {
      const isFiltered = notifications.some(f => f.id === n.id);
      if (isFiltered) {
        const currentReadBy = n.isReadBy || [];
        const isReadBy = currentReadBy.includes(currentUser.id) ? currentReadBy : [...currentReadBy, currentUser.id];
        return { ...n, isReadBy };
      }
      return n;
    });
    onUpdateNotifications(updated);
  };

  const handleDeleteNotif = (notifId: string) => {
    setDismissedNotifIds(prev => [...prev, notifId]);
  };

  const realUser = originalUser || currentUser;
  const isOriginalAdmin = realUser.roleId === 'role_sr_acc' || 
                          realUser.roleId === 'role_md' || 
                          realUser.roleId === 'role_ceo' || 
                          realUser.roleId === 'role_coo' || 
                          realUser.department === 'Director' ||
                          isHRUser(realUser.roleId, realUser.department);

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

  const compressAvatarImage = (base64Str: string, callback: (compressed: string) => void) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 120;
      const MAX_HEIGHT = 120;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        callback(dataUrl);
      } else {
        callback(base64Str);
      }
    };
    img.onerror = () => {
      callback(base64Str);
    };
    img.src = base64Str;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          compressAvatarImage(reader.result, (compressed) => {
            onUpdateUserAvatar?.(realUser.id, compressed);
            showHeaderToast("✓ Profile photo updated and optimized successfully!", "success");
            setShowAvatarModal(false);
          });
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
          compressAvatarImage(reader.result, (compressed) => {
            onUpdateUserAvatar?.(realUser.id, compressed);
            showHeaderToast("✓ Profile photo uploaded and optimized successfully!", "success");
            setShowAvatarModal(false);
          });
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

      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-300 text-slate-700 fixed top-0 left-0 right-0 z-50 shadow-[0_2px_18px_rgba(15,23,42,0.03)] transition-all duration-300">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 lg:h-16 items-center">
            {/* Brand Logo & Name */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              <div className="bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 p-2 sm:p-2.5 rounded-xl shadow-md shadow-emerald-500/10 flex items-center justify-center transition-all duration-300 shrink-0">
                {renderLogo()}
              </div>
              <div className="shrink-0">
                <h1 className="font-display text-xs sm:text-base font-black tracking-tight text-slate-900 flex items-center gap-1.5">
                  <span className="whitespace-nowrap bg-gradient-to-r from-slate-900 to-slate-800 bg-clip-text text-transparent">{branding?.companyName || 'Build Mart'}</span>
                  <span className="text-[9px] bg-emerald-50 text-emerald-700 font-mono font-extrabold px-1.5 py-0.5 rounded border border-emerald-200/60 tracking-widest shrink-0 shadow-3xs uppercase">
                    {branding?.companyAbbreviation || 'LMS'}
                  </span>
                </h1>
                <p className="hidden sm:block text-[8px] text-slate-400 font-mono tracking-widest uppercase font-black">
                  {branding?.companyTagline || 'MEMBER OF RATHI BUILDMART PLC'}
                </p>
              </div>
            </div>

            {/* Navigation/Tabs - Segment Control Design (Hidden on Mobile to avoid horizontal scrollbar) */}
            <nav className="hidden lg:flex items-center bg-slate-100/80 border border-slate-200/50 p-1 rounded-xl gap-1 overflow-x-auto whitespace-nowrap scrollbar-none shadow-3xs">
              {isAdmin ? (
                <button
                  onClick={() => onChangeTab('admin-reports')}
                  className={`px-4 py-1.5 text-xs font-display font-black rounded-lg transition-all duration-350 h-8 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
                    currentTab.startsWith('admin-') || currentTab === 'admin'
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/15'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
                  }`}
                  id="nav-admin-reports"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Workspace Cockpit</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => onChangeTab('learning')}
                    className={`px-4 py-1.5 text-xs font-display font-black rounded-lg transition-all duration-350 h-8 flex items-center justify-center shrink-0 cursor-pointer ${
                      currentTab === 'learning'
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/15'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
                    }`}
                    id="nav-learning-path"
                  >
                    My Learning Path
                  </button>
                  <button
                    onClick={() => onChangeTab('exams')}
                    className={`px-4 py-1.5 text-xs font-display font-black rounded-lg transition-all duration-350 h-8 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
                      currentTab === 'exams'
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/15'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
                    }`}
                    id="nav-exam-center"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Final Competency Test</span>
                  </button>
                  <button
                    onClick={() => onChangeTab('testing')}
                    className={`px-4 py-1.5 text-xs font-display font-black rounded-lg transition-all duration-350 h-8 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
                      currentTab === 'testing'
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/15'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
                    }`}
                    id="nav-only-testing"
                  >
                    <Brain className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Only Testing</span>
                  </button>
                  <button
                    onClick={() => onChangeTab('certificate')}
                    className={`px-4 py-1.5 text-xs font-display font-black rounded-lg transition-all duration-350 h-8 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
                      currentTab === 'certificate'
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/15'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
                    }`}
                    id="nav-mastery-certificate"
                  >
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span>Mastery Certificate</span>
                  </button>
                </>
              )}
            </nav>

            {/* User Section & Quick Switcher */}
            <div className="flex items-center gap-4">
              {/* Quick switcher for testing simulated environments */}
              {isOriginalAdmin && (
                <div className={`hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-xl border transition-all duration-300 shadow-3xs ${
                  isSimulating 
                    ? 'bg-rose-50/60 border-rose-200/80' 
                    : 'bg-slate-50/60 border-slate-200/60'
                }`}>
                  <span className={`text-[9px] font-mono uppercase tracking-wider font-extrabold ${
                    isSimulating ? 'text-rose-600 animate-pulse' : 'text-slate-405 text-slate-400'
                  }`}>
                    {isSimulating ? 'Simulated View:' : 'Simulate:'}
                  </span>
                  <select
                    value={currentUser.id}
                    onChange={(e) => onSwitchUser(e.target.value)}
                    className={`bg-transparent text-xs border-none font-extrabold focus:ring-0 cursor-pointer pr-6 py-0 font-sans outline-none ${
                      isSimulating ? 'text-rose-705 text-rose-700' : 'text-emerald-705 text-emerald-750'
                    }`}
                  >
                    {allUsers.map(u => {
                      const getFriendlyRole = (roleId: string) => {
                        const dbRoles = getRoles();
                        const foundRole = dbRoles.find(r => r.id === roleId);
                        if (foundRole) {
                          if (roleId === 'role_sr_acc') {
                            if (foundRole.name === 'Senior Accountant' || foundRole.name === 'Admin Accountant') {
                              return 'Admin';
                            }
                            return foundRole.name;
                          }
                          return foundRole.name;
                        }
                        if (roleId === 'role_md' || roleId === 'role_ceo' || roleId === 'role_coo') return 'Director Console';
                        if (roleId === 'role_sr_acc') return 'Admin';
                        if (roleId === 'role_jr_acc') return 'General Ledger Executive';
                        if (roleId === 'role_ap_ar') return 'Billing & AP/AR Executive';
                        if (roleId === 'role_tax_assoc') return 'Taxation Analyst';
                        return 'Finance Trainee';
                      };
                      return (
                        <option key={u.id} value={u.id} className="text-slate-950 bg-white font-medium flex">
                          {u.name} ({getFriendlyRole(u.roleId)})
                        </option>
                      );
                    })}
                  </select>

                  {isSimulating && (
                    <button
                      onClick={onExitSimulation}
                      className="ml-1.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded transition-all duration-150 flex items-center gap-1.5 shrink-0 cursor-pointer"
                      title="Return to your authentic Admin/Director profile"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Exit View</span>
                    </button>
                  )}
                </div>
              )}

              {/* Advanced Interactive Notification Center Bell */}
              <div className="relative">
                <button
                  type="button"
                  id="header-notifications-bell-btn"
                  onClick={() => setShowNotificationCenter(!showNotificationCenter)}
                  className={`p-2 rounded-xl border transition-all duration-200 relative cursor-pointer flex items-center justify-center ${
                    showNotificationCenter
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-250'
                      : 'bg-white hover:bg-slate-50 border-slate-205 border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                  aria-label="Notification Center"
                  title="Notification Center"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] bg-rose-605 bg-rose-600 text-[8px] font-black text-white rounded-full flex items-center justify-center border border-white animate-bounce">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Panel Box */}
                {showNotificationCenter && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setShowNotificationCenter(false)}></div>
                    <div className="absolute right-0 mt-2 z-40 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl p-0 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 text-slate-800">
                      {/* Header */}
                      <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-850">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Corporate Notifications Center</span>
                        </div>
                        {unreadCount > 0 && (
                          <button
                            type="button"
                            onClick={handleMarkAllRead}
                            className="text-[10px] text-emerald-600 hover:text-emerald-700 font-bold hover:underline cursor-pointer bg-transparent border-none py-0 px-1"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      {/* Notification list */}
                      <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-slate-400 text-xs">
                            <span className="text-xl mb-1 block">📯</span>
                            No new corporate notifications
                          </div>
                        ) : (
                          notifications.map((notif) => {
                            const isRead = notif.isReadBy ? notif.isReadBy.includes(currentUser.id) : false;
                            // Select icon based on type
                            let icon = '🔔';
                            if (notif.type === 'user_add') icon = '🤝';
                            else if (notif.type === 'user_remove') icon = '🔐';
                            else if (notif.type === 'chapter_add') icon = '📚';
                            else if (notif.type === 'chapter_remove') icon = '📁';
                            else if (notif.type === 'unit_add') icon = '🎥';
                            else if (notif.type === 'unit_remove') icon = '🎬';
                            else if (notif.type === 'approval') icon = '✅';

                            return (
                              <div
                                key={notif.id}
                                className={`p-3 text-left transition relative group ${
                                  isRead ? 'bg-white opacity-70' : 'bg-emerald-50/20 hover:bg-emerald-50/40'
                                }`}
                              >
                                <div className="flex items-start gap-2.5">
                                  <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-sm shrink-0 shadow-sm">
                                    {icon}
                                  </div>
                                  <div className="flex-1 min-w-0 pr-6">
                                    <h4 className="text-[11px] font-bold text-slate-900 leading-snug">
                                      {notif.title}
                                    </h4>
                                    <p className="text-[10px] text-slate-600 leading-normal mt-0.5 whitespace-pre-line">
                                      {notif.message}
                                    </p>
                                    <span className="text-[8px] font-mono font-medium text-slate-400 mt-1 block">
                                      {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                </div>

                                {/* List interaction overlay */}
                                <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {!isRead && (
                                    <button
                                      type="button"
                                      onClick={() => handleMarkAsRead(notif.id)}
                                      className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition cursor-pointer bg-transparent border-none"
                                      title="Mark as read"
                                    >
                                      <Check className="w-3 h-3" />
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteNotif(notif.id)}
                                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer bg-transparent border-none"
                                    title="Dismiss"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Profile Info Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 text-left hover:opacity-90 focus:outline-none transition group p-1 rounded-xl hover:bg-slate-105 hover:bg-slate-100"
                >
                  <Avatar
                    src={realUser.avatarUrl}
                    name={realUser.name}
                    className="w-9 h-9 border border-emerald-500/30 group-hover:border-emerald-600 shadow-sm transition"
                  />
                  <div className="hidden md:flex flex-col items-start gap-0.5">
                    <p className="text-xs font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors leading-tight">{realUser.name}</p>
                    <PremiumBadge userId={realUser.id} userName={realUser.name} roleId={realUser.roleId || ''} department={realUser.department} size="xs" />
                  </div>
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)}></div>
                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-20 text-slate-800 text-xs text-left animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="p-3 border-b border-slate-100 font-medium">
                        <div className="flex flex-col gap-1 mb-1.5">
                          <p className="font-bold text-slate-900 text-sm leading-tight">{realUser.name}</p>
                          <div className="self-start">
                            <PremiumBadge userId={realUser.id} userName={realUser.name} roleId={realUser.roleId || ''} department={realUser.department} size="xs" />
                          </div>
                        </div>
                        <p className="text-slate-500 text-[10px] font-mono mt-0.5">{realUser.email}</p>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-600 mt-2 font-mono bg-slate-50 px-2 py-1 rounded-lg border border-slate-200/80">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <span className="truncate">{realUser.focusEntity}</span>
                        </div>
                      </div>

                      {/* Quick Sim Mobile Menu */}
                      <div className="py-1">
                        {isOriginalAdmin && (
                          <div className={`lg:hidden p-2.5 rounded-lg m-1 mb-2 border ${
                            isSimulating ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'
                          }`}>
                            <span className={`text-[10px] font-mono uppercase tracking-wider block mb-1.5 font-bold ${
                              isSimulating ? 'text-rose-700' : 'text-slate-500'
                            }`}>
                              {isSimulating ? 'Simulate active:' : 'Simulate User:'}
                            </span>
                            <select
                              value={currentUser.id}
                              onChange={(e) => {
                                onSwitchUser(e.target.value);
                                setDropdownOpen(false);
                              }}
                              className="w-full bg-white text-xs text-emerald-700 font-bold border border-slate-200 rounded-lg p-1.5 outline-none mb-2"
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
                            setCustomAvatarUrl(currentUser.avatarUrl || '');
                            setDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 rounded-lg text-slate-700 hover:text-emerald-700 text-left transition font-semibold"
                        >
                          <Camera className="w-4 h-4 text-emerald-600" />
                          <span>Change Profile Photo 📷</span>
                        </button>

                        {!isAdmin && (
                          <button
                            onClick={() => {
                              onChangeTab(currentTab === 'learning' ? 'admin' : 'learning');
                              setDropdownOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 rounded-lg text-slate-700 text-left transition font-semibold"
                          >
                            <Shield className="w-4 h-4 text-emerald-600" />
                            <span>Toggle: {currentTab === 'learning' ? 'Admin Portal' : 'My Learning'}</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setShowResetConfirmModal(true);
                            setDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-rose-50 rounded-lg text-rose-600 text-left transition"
                        >
                          <RefreshCw className="w-4 h-4 text-rose-500" />
                          <span>Reset Data to Default</span>
                        </button>

                        <div className="border-t border-slate-100 my-1"></div>

                        <button
                          onClick={() => {
                            onLogout();
                            setDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-rose-50 hover:text-rose-700 text-slate-500 rounded-lg text-left transition font-semibold"
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
                <Avatar
                  src={currentUser.avatarUrl}
                  name={currentUser.name}
                  className="w-16 h-16 border-4 border-white shadow-md bg-white select-none"
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
                      let url = customAvatarUrl.trim();
                      if (!url) {
                        setAvatarError("Please provide a valid image URL first.");
                        return;
                      }
                      if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('data:image/')) {
                        if (url.includes('.') && !url.includes(' ')) {
                          url = 'https://' + url;
                        } else {
                          setAvatarError("URL must start with http:// or https:// to render correctly.");
                          return;
                        }
                      }
                      onUpdateUserAvatar?.(currentUser.id, url);
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
