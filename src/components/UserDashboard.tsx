/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { User, Role, Chapter, Unit, ProgressLog, ProgressStatus, UnitFrequency, CompanyBranding, GlobalNotification } from '../types';
import { calculateUserProgress, UserWithRole, getExamConfig } from '../data/stateManager';
import { 
  Play, 
  CheckCircle2, 
  Clock, 
  HelpCircle, 
  Award, 
  BookOpen, 
  Building2, 
  ChevronRight, 
  FileText, 
  Calendar, 
  CheckSquare, 
  ChevronDown, 
  ExternalLink,
  MessageSquare,
  Lock,
  Bell,
  Sparkles,
  Trash2,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import CertificateGenerator from './CertificateGenerator';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: 'approval' | 'system' | 'role' | 'achievement';
}

interface UserDashboardProps {
  currentUser: UserWithRole;
  roles: Role[];
  chapters: Chapter[];
  units: Unit[];
  progress: ProgressLog[];
  onUpdateProgress: (unitId: string, status: ProgressStatus, notes?: string, watchPercent?: number) => void;
  onStartChapterExam?: (chapterId: string) => void;
  branding?: CompanyBranding;
  globalNotifications?: GlobalNotification[];
  onUpdateNotifications?: (updated: GlobalNotification[]) => void;
}

export default function UserDashboard({
  currentUser,
  roles,
  chapters,
  units,
  progress,
  onUpdateProgress,
  onStartChapterExam,
  branding,
  globalNotifications = [],
  onUpdateNotifications = () => {}
}: UserDashboardProps) {
  // Get all assigned role IDs for the user (always fallback/include currentUser.roleId)
  const assignedRoleIds = Array.from(new Set([
    currentUser.roleId,
    ...(currentUser.roleIds || [])
  ])).filter(Boolean);

  const assignedRoles = roles.filter(r => assignedRoleIds.includes(r.id));

  // State to filter view to a specific role, or "all" for Combined View
  const [activeRoleView, setActiveRoleView] = useState<string>('all');

  // Filter based on active role view
  const currentRoleIds = activeRoleView === 'all' ? assignedRoleIds : [activeRoleView];

  const userRole = roles.find(r => r.id === (activeRoleView === 'all' ? currentUser.roleId : activeRoleView)) || currentUser.role || roles[0];
  const userChapters = chapters.filter(c => currentRoleIds.includes(c.roleId)).sort((a, b) => (a.order || 0) - (b.order || 0));
  const userChapterIds = userChapters.map(c => c.id);
  const userUnits = units.filter(u => userChapterIds.includes(u.chapterId));

  // Active unit selection
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  const selectedUnit = userUnits.find(u => u.id === selectedUnitId) || userUnits[0];

  // Auto-set first unit whenever selected role view or available units changes
  useEffect(() => {
    if (userUnits.length > 0) {
      // Find first incomplete or default to first unit
      const incomplete = userUnits.find(u => {
        const prog = progress.find(p => p.userId === currentUser.id && p.unitId === u.id);
        return !prog || prog.status !== 'Verified & Mastered';
      });
      setSelectedUnitId(incomplete?.id || userUnits[0].id);
    } else {
      setSelectedUnitId('');
    }
  }, [activeRoleView, progress.length]);

  // SOP checklist state per unitId (storing checked state for 3 SOP items)
  const [sopChecked, setSopChecked] = useState<Record<string, boolean[]>>({});

  const handleToggleSop = (index: number) => {
    if (!selectedUnit) return;
    const current = sopChecked[selectedUnit.id] || [false, false, false];
    const updated = [...current];
    updated[index] = !updated[index];
    setSopChecked(prev => ({
      ...prev,
      [selectedUnit.id]: updated
    }));
  };

  const getSopStatus = (unitId: string) => {
    return sopChecked[unitId] || [false, false, false];
  };

  // Submission form state
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [submittingStatus, setSubmittingStatus] = useState<ProgressStatus>('Verified & Mastered');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [expandedUnitIdForHistory, setExpandedUnitIdForHistory] = useState<string | null>(null);
  const [reportStatusFilter, setReportStatusFilter] = useState<string>('All');

  // Notification system states
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [showApprovalBanner, setShowApprovalBanner] = useState(true);
  const [dismissedNotifIds, setDismissedNotifIds] = useState<string[]>([]);

  // Check if current user is Admin / Director / HR
  const isHR = (role?: string, dept?: string) => {
    if (!role) return false;
    const r = role.toLowerCase();
    const d = (dept || '').toLowerCase();
    return r === 'role_hr_mgr' || r === 'role_ta_exec' || r === 'role_training_mgr' || d.includes('hr') || d.includes('talent');
  };
  const isAdminUser = currentUser.roleId === 'role_sr_acc' || 
                      currentUser.roleId === 'role_md' || 
                      currentUser.roleId === 'role_ceo' || 
                      currentUser.roleId === 'role_coo' || 
                      currentUser.department === 'Director' ||
                      isHR(currentUser.roleId, currentUser.department);

  // Filter global notifications for the current user
  const notifications = (globalNotifications || []).filter(notif => {
    if (dismissedNotifIds.includes(notif.id)) {
      return false;
    }
    if (isAdminUser) {
      return true;
    }
    if (notif.isAdminOnly) {
      return false;
    }
    if (notif.targetUserId && notif.targetUserId !== currentUser.id) {
      return false;
    }
    if (notif.targetRoleId && notif.targetRoleId !== currentUser.roleId && !currentUser.roleIds?.includes(notif.targetRoleId)) {
      return false;
    }
    if (notif.targetDept && notif.targetDept.toLowerCase() !== (currentUser.department || '').toLowerCase()) {
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

  // Synchronously update form input values when user changes active video unit
  const [isTrackingActive, setIsTrackingActive] = useState(true);

  useEffect(() => {
    if (selectedUnit) {
      const prog = getUnitProgress(selectedUnit.id);
      setSubmissionNotes(prog?.notes || '');
      setSubmittingStatus(prog?.status || 'Not Started');
      setIsTrackingActive(true); // Auto track starts on new unit load
    }
  }, [selectedUnitId]);

  // Listen to YouTube Player Play/Pause events to automatically match actual watching status
  useEffect(() => {
    const handleYoutubeMessage = (event: MessageEvent) => {
      if (!event.origin || typeof event.origin !== 'string' || !event.origin.includes('youtube.com')) return;

      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (!data) return;

        let playerState: number | undefined;

        // Extract playerState if it is sent in infoDelivery or onStateChange format
        if (data.event === 'infoDelivery' && data.info && typeof data.info.playerState !== 'undefined') {
          playerState = data.info.playerState;
        } else if (data.event === 'onStateChange' && typeof data.info !== 'undefined') {
          playerState = data.info;
        }

        if (typeof playerState !== 'undefined') {
          if (playerState === 1) { // 1 = Playing
            setIsTrackingActive(true);
          } else if (playerState === 2 || playerState === 0 || playerState === -1 || playerState === 3) {
            // 2 = Paused, 0 = Ended, -1 = Unstarted, 3 = Buffering
            setIsTrackingActive(false);
          }
        }
      } catch (e) {
        // Safe to ignore non-JSON or unrelated messages
      }
    };

    window.addEventListener('message', handleYoutubeMessage);
    return () => {
      window.removeEventListener('message', handleYoutubeMessage);
    };
  }, []);

  // Search and frequency filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFreqFilter, setSelectedFreqFilter] = useState<'All' | 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Ad-hoc'>('All');

  // Mobile sub-tab responsive control ('syllabus' | 'player')
  const [mobileTab, setMobileTab] = useState<'syllabus' | 'player'>('syllabus');

  // Automatic watch progress tracker simulation state & effect
  const progressRef = useRef(progress);
  
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    if (!selectedUnit) return;
    const { type } = resolveVideoSource(selectedUnit.videoUrl);
    if (type === 'none') return; // Only run automatic tracking simulator for actual video units

    if (!isTrackingActive) return; // If paused by user/simulator, do not tick progress

    // Get the initial progress log
    const getUnitLog = () => progressRef.current.find(p => p.userId === currentUser.id && p.unitId === selectedUnit.id);
    const initialLog = getUnitLog();
    const initialWatch = (initialLog && initialLog.status === 'Verified & Mastered') ? 100 : (initialLog?.watchPercent || 0);

    if (initialWatch >= 100) return;

    // Tick every 2.5 seconds to advance the progress bar
    const interval = setInterval(() => {
      const activeLog = getUnitLog();
      const currentPercent = (activeLog && activeLog.status === 'Verified & Mastered') ? 100 : (activeLog?.watchPercent || 0);
      
      if (currentPercent < 100) {
        const nextPercent = Math.min(currentPercent + 4, 100);
        // Do not automatically change status to Verified & Mastered or Completed when watch ends.
        // It stays whatever manual status has been selected (fallback to 'In Progress' if 'Not Started')
        const nextStatus = (activeLog?.status && activeLog.status !== 'Not Started') ? activeLog.status : 'In Progress';
        
        onUpdateProgress(selectedUnit.id, nextStatus, activeLog?.notes || '', nextPercent);
      } else {
        clearInterval(interval);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [selectedUnitId, currentUser.id, isTrackingActive]);

  // Helper: check if chapter is unlocked
  const checkIsChapterUnlocked = (idx: number) => {
    return true; // Chapter locking is disabled, progress is fully open.
  };

  // Track accordion state for chapters
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});

  // Auto-expand unlocked chapters and contract locked chapters
  useEffect(() => {
    const updated: Record<string, boolean> = {};
    userChapters.forEach((chap, idx) => {
      updated[chap.id] = checkIsChapterUnlocked(idx);
    });
    setExpandedChapters(updated);
  }, [progress, currentUser.id, activeRoleView, chapters]);

  // Auto-select first incomplete unit in the highest unlocked chapter on mount
  useEffect(() => {
    if (userUnits.length === 0) return;
    
    let foundUnitId: string | null = null;
    
    for (let idx = 0; idx < userChapters.length; idx++) {
      const chap = userChapters[idx];
      const isUnlocked = checkIsChapterUnlocked(idx);
      
      if (isUnlocked) {
        const chapUnits = userUnits.filter(u => u.chapterId === chap.id);
        const incomplete = chapUnits.find(u => {
          const prog = progress.find(p => p.userId === currentUser.id && p.unitId === u.id);
          return !prog || prog.status !== 'Verified & Mastered';
        });
        if (incomplete) {
          foundUnitId = incomplete.id;
          break;
        }
      }
    }
    
    if (!foundUnitId) {
      const firstIncomplete = userUnits.find(u => {
        const prog = progress.find(p => p.userId === currentUser.id && p.unitId === u.id);
        return !prog || prog.status !== 'Verified & Mastered';
      });
      if (firstIncomplete) {
        foundUnitId = firstIncomplete.id;
      }
    }
    
    if (foundUnitId) {
      setSelectedUnitId(foundUnitId);
    }
  }, [currentUser.id, activeRoleView, chapters]);

  const toggleChapter = (chapterId: string, isUnlocked: boolean) => {
    if (!isUnlocked) {
      setToastMsg("🔒 Section Locked: Complete previous chapter lessons to unlock this milestone.");
      setTimeout(() => setToastMsg(null), 4000);
      return;
    }
    setExpandedChapters(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }));
  };

  // Helper: Get user's progress for a single unit
  const getUnitProgress = (unitId: string) => {
    return progress.find(p => p.userId === currentUser.id && p.unitId === unitId);
  };

  const getStatusColor = (status?: ProgressStatus) => {
    switch (status) {
      case 'Verified & Mastered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200/60';
      case 'Completed (Pending Review)':
        return 'bg-amber-100 text-amber-800 border-amber-200/60';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200/60';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200/60';
    }
  };

  const getStatusLabelText = (status?: ProgressStatus) => {
    switch (status) {
      case 'Verified & Mastered':
        return 'Verified & Mastered';
      case 'Completed (Pending Review)':
        return 'Pending Review';
      case 'In Progress':
        return 'In Progress';
      default:
        return 'Not Started';
    }
  };

  // Stats
  const stats = calculateUserProgress(currentUser.id, currentRoleIds);

  // Frequency categorization
  const frequencies: UnitFrequency[] = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Ad-hoc'];

  const handleSubmitProgress = () => {
    if (!selectedUnit) return;
    onUpdateProgress(selectedUnit.id, submittingStatus, submissionNotes);
    setToastMsg(`Feedback Logged: ${selectedUnit.code} updated to "${submittingStatus}". Verification request submitted.`);
    setTimeout(() => {
      setToastMsg(null);
    }, 5000);
    setSubmissionNotes('');
  };

  // Robust Video URL Normaliser for 'all type' tube streaming (YouTube, YouTube Shorts, Vimeo, direct MP4/raw stream)
  const resolveVideoSource = (url: string) => {
    if (!url) return { type: 'none', url: '' };
    const cleanUrl = url.trim();

    // Google Drive URL check (resolves sharing or view link to direct interactive iframe embed)
    const driveMatch = cleanUrl.match(/(?:drive|docs)\.google\.com\/(?:file\/d\/|open\?id=)([^/?#&\s]+)/);
    if (driveMatch && driveMatch[1]) {
      return { type: 'embed', url: `https://drive.google.com/file/d/${driveMatch[1]}/preview` };
    }

    // Check for direct video formats (mp4, webm, ogg, mov, etc.)
    if (/\.(mp4|webm|ogg|mov|m4v)(?:\?|$)/i.test(cleanUrl)) {
      return { type: 'direct', url: cleanUrl };
    }

    // Embed links
    if (cleanUrl.includes('youtube.com/embed/')) {
      const glue = cleanUrl.includes('?') ? '&' : '?';
      return { type: 'embed', url: `${cleanUrl}${glue}enablejsapi=1` };
    }
    if (cleanUrl.includes('player.vimeo.com/video/')) {
      return { type: 'embed', url: cleanUrl };
    }

    // Standard YouTube watch link (youtube.com/watch?v=...) OR YouTube short links / shares
    const ytWatchRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const ytWatchMatch = cleanUrl.match(ytWatchRegex);
    if (ytWatchMatch && ytWatchMatch[1]) {
      return { type: 'embed', url: `https://www.youtube.com/embed/${ytWatchMatch[1]}?autoplay=0&rel=0&enablejsapi=1` };
    }

    // Vimeo Watch link
    const vimeoRegex = /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)/;
    const vimeoMatch = cleanUrl.match(vimeoRegex);
    if (vimeoMatch && vimeoMatch[3]) {
      return { type: 'embed', url: `https://player.vimeo.com/video/${vimeoMatch[3]}?badge=0&autopause=0` };
    }

    // Fallback direct URL helper (could be custom servers or other links)
    if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
      return { type: 'custom', url: cleanUrl };
    }

    return { type: 'none', url: '' };
  };

  // Centralised Tube Video rendering engine
  const renderVideoStage = (isMobile: boolean) => {
    if (!selectedUnit) return null;
    const { type, url } = resolveVideoSource(selectedUnit.videoUrl);

    // Dynamic stream type badges
    const getStreamBadge = () => {
      switch (type) {
        case 'embed':
          if (url.includes('drive.google.com')) {
            return <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase">Drive Stream</span>;
          }
          return <span className="bg-rose-50 text-rose-700 border border-rose-100 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase">Tube Embed</span>;
        case 'direct':
          return <span className="bg-blue-50 text-blue-700 border border-blue-100 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase">Direct MP4 Stream</span>;
        case 'custom':
          return <span className="bg-amber-50 text-amber-700 border border-amber-100 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase font-medium">External Stream</span>;
        default:
          return <span className="bg-slate-100 text-slate-500 text-[9px] font-mono  px-2 py-0.5 rounded-full uppercase">SOP Guide</span>;
      }
    };

    return (
      <div 
        id={isMobile ? "mobile-tube-player" : "desktop-tube-player"}
        className={`bg-white rounded-3xl border-2 border-slate-200/90 shadow-sm overflow-hidden transition-all duration-200 ${
          isMobile ? 'mb-6 block lg:hidden ring-4 ring-slate-100/60' : 'mb-0 hidden lg:block'
        }`}
      >
        <div className="px-5 py-4 border-b border-slate-150 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse shrink-0"></span>
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 font-mono tracking-wider font-extrabold uppercase block leading-none mb-0.5">NOW STREAMING LESSON</span>
              <span className="font-display text-xs font-black text-slate-800 tracking-tight block truncate max-w-[200px] sm:max-w-md md:max-w-xl">
                {selectedUnit.videoTitle || "Standard Walkthrough Demonstration"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            {getStreamBadge()}
            {type !== 'none' && (
              <a 
                href={selectedUnit.videoUrl} 
                target="_blank" 
                rel="noreferrer"
                className="text-slate-400 hover:text-rose-600 flex items-center gap-1.5 text-[10px] font-mono hover:underline tracking-tight transition-all shrink-0"
              >
                Watch Link <ExternalLink className="w-3 h-3 text-rose-500" />
              </a>
            )}
          </div>
        </div>

        {/* Video Player Main Canvas */}
        <div className="aspect-video w-full bg-slate-950 relative shadow-inner">
          {type === 'embed' ? (
            <iframe
              src={url}
              title={selectedUnit.videoTitle}
              className="absolute inset-0 w-full h-full border-none"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="no-referrer"
            ></iframe>
          ) : type === 'direct' ? (
            <video
              src={url}
              controls
              className="absolute inset-0 w-full h-full object-contain"
              preload="metadata"
              playsInline
            />
          ) : type === 'custom' ? (
            <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 font-mono text-xs">
              <Play className="w-12 h-12 text-rose-500 mb-3 animate-pulse" />
              <span className="font-bold text-slate-200 text-sm">Custom Platform Stream Ready</span>
              <p className="text-[10px] text-slate-500 max-w-xs mt-1 leading-relaxed">This streaming media is hosted on a secure cloud network. Click below to play in full screen dashboard.</p>
              <a 
                href={url} 
                target="_blank" 
                rel="noreferrer"
                className="bg-rose-600 px-4 py-2 rounded-xl text-white font-bold shrink-0 mt-3.5 hover:bg-rose-500 transition-all antialiased text-xs shadow-md shadow-rose-950/40 tracking-wider"
              >
                🎥 LAUNCH STREAM PLAYER
              </a>
            </div>
          ) : (
            <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 font-mono text-xs bg-[#0b0f19]">
              <Play className="w-10 h-10 text-slate-700 mb-3" />
              <span className="font-bold text-slate-400">Compliance Lesson SOP Guide</span>
              <p className="text-[10px] text-slate-500 mt-1 max-w-xs">There is no additional training model content for this checklist unit. Read the action layout steps below.</p>
            </div>
          )}
        </div>

        {/* Stream Progress Console Widget */}
        {type !== 'none' && (
          <div id="video-stream-tracker-console" className="border-t border-slate-150 bg-slate-50/70 p-4 sm:p-5 flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-150 shadow-sm">
              <div className="space-y-1">
                <span className="text-[9px] font-mono font-bold text-slate-400 block uppercase tracking-wider">Stream Duration & Progress Engine</span>
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-800">
                    Video Watch Progress: <span className="text-emerald-600 font-mono font-black">{(getUnitProgress(selectedUnit.id)?.watchPercent || 0)}%</span>
                  </h4>
                  {(getUnitProgress(selectedUnit.id)?.watchPercent || 0) >= 100 ? (
                    <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-emerald-750 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full uppercase">
                      ✓ Completed
                    </span>
                  ) : isTrackingActive ? (
                    <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-blue-700 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-full animate-pulse uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span>
                      Auto-tracking active (+4%/2.5s)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-amber-700 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-full uppercase">
                      ⏱ Tracker Paused
                    </span>
                  )}
                </div>
              </div>

              {/* Elegant Toggle Switch */}
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-150 px-3 py-2 rounded-xl">
                <span className="text-[10px] font-bold text-slate-650 text-slate-600">🎥 Active Watch Tracker:</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isTrackingActive} 
                    onChange={(e) => setIsTrackingActive(e.target.checked)} 
                    className="sr-only peer"
                    disabled={(getUnitProgress(selectedUnit.id)?.watchPercent || 0) >= 100}
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 disabled:opacity-50"></div>
                </label>
                <span className={`text-[10px] font-mono font-bold ${isTrackingActive && (getUnitProgress(selectedUnit.id)?.watchPercent || 0) < 100 ? 'text-emerald-600 animate-pulse' : 'text-slate-400'}`}>
                  {isTrackingActive && (getUnitProgress(selectedUnit.id)?.watchPercent || 0) < 100 ? 'Active' : 'Paused'}
                </span>
              </div>
            </div>

            {/* Premium Progress Bar */}
            <div className="space-y-1">
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden relative shadow-inner">
                <div 
                  className="bg-gradient-to-r from-teal-500 via-emerald-505 to-emerald-600 h-full rounded-full transition-all duration-500 ease-out shadow-sm"
                  style={{ width: `${(getUnitProgress(selectedUnit.id)?.watchPercent || 0)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[9px] font-mono font-bold text-slate-400">
                <span>0% Start</span>
                <span>25% Complete</span>
                <span>50% Mid</span>
                <span>75% Audit Ready</span>
                <span>100% Mastered</span>
              </div>
            </div>

            {/* Quick Segment Jump Options */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-150/50">
              <span className="text-[10px] font-bold text-slate-505 text-slate-500">Manual Segment Override:</span>
              <div className="flex flex-wrap gap-1.5">
                {[0, 25, 50, 75, 100].map(pct => {
                  const log = getUnitProgress(selectedUnit.id);
                  const isCurrent = (log?.watchPercent || 0) === pct;
                  return (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => {
                        const status = pct === 100 ? 'Verified & Mastered' : (log?.status || 'In Progress');
                        onUpdateProgress(selectedUnit.id, status, log?.notes || '', pct);
                      }}
                      className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                        isCurrent
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm font-extrabold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-none'
                      }`}
                    >
                      {pct}%
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="text-[10px] text-slate-500 bg-white border border-slate-150 rounded-xl p-3 space-y-1.5 leading-snug">
              <p className="font-bold text-slate-700">⏱ YouTube Video Play/Pause Auto-Sync:</p>
              <p>
                ✅ <strong>Fully Automated Tracking:</strong> The tracker is fully integrated with the video player. When you click <strong>Play</strong> on the YouTube video, the tracker starts automatically. When you <strong>Pause</strong> the video, the tracking is instantly paused to match your exact speed.
              </p>
              <p className="text-slate-450 text-[9.5px] border-t border-slate-100 pt-1.5 italic">
                ✅ <strong>पूरी तरह से स्वचालित ट्रैकिंग:</strong> जब आप YouTube वीडियो पर <strong>Play</strong> दबाएंगे, टाइमर अपने आप चालू हो जाएगा। वीडियो को <strong>Pause</strong> करने पर टाइमर भी रुक जाएगा ताकि सटीक प्रोग्रेस दर्ज हो सके।
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-transparent">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-5 lg:py-10 animate-in fade-in duration-350">
        
        {/* Trainee Enrollment Approved Banner */}
        <AnimatePresence>
          {showApprovalBanner && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden mb-6"
            >
              <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 p-0.5 rounded-2xl shadow-lg">
                <div className="bg-white/95 backdrop-blur-xs p-5 rounded-[14px] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 bg-emerald-50 text-emerald-650 border border-emerald-100 rounded-xl flex items-center justify-center shrink-0 text-xl font-bold animate-bounce mt-0.5">
                      🎉
                    </div>
                    <div>
                      <span className="text-[9px] font-mono font-black uppercase bg-emerald-100/60 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full tracking-wider">
                        Enrollment Status Updated
                      </span>
                      <h3 className="font-display text-sm font-black text-slate-900 mt-1">
                        Aashish Sahu Group: Trainee Verification Complete!
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 max-w-2xl leading-relaxed">
                        Excellent news, <strong>{currentUser.name}</strong>! Your training enrollment status has been updated and approved to <span className="text-emerald-600 font-bold">ACTIVE</span> by <strong>Aashish Sahu (Director/CFO)</strong>. All mapped chapters are fully authorized for your learning footprint.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-stretch md:self-auto justify-end border-t border-slate-100 md:border-t-0 pt-3 md:pt-0 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setShowApprovalBanner(false);
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black uppercase tracking-wider rounded-xl transition cursor-pointer active:scale-95 shadow-sm shadow-emerald-100"
                    >
                      Acknowledge & Sync
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowApprovalBanner(false)}
                      className="p-2 border border-slate-200 hover:border-slate-300 text-slate-400 hover:text-slate-650 rounded-xl transition cursor-pointer text-lg font-bold"
                      title="Dismiss"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modern, Aesthetic Welcome Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-8 mb-6 lg:mb-12">
          <div className="space-y-3.5">
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-100/50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-emerald-600">
                Active Training Pathway
              </span>
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-none">
                Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-emerald-700">{currentUser.name}</span>
              </h1>

              {/* Advanced Interactive Notification Center */}
              <div className="relative">
                <button
                  type="button"
                  id="notifications-bell-btn"
                  onClick={() => setShowNotificationCenter(!showNotificationCenter)}
                  className={`p-2 rounded-xl border transition-all duration-200 relative cursor-pointer flex items-center justify-center ${
                    showNotificationCenter
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-200'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                  aria-label="Notification Center"
                  title="Notification Center"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] bg-rose-600 text-[8px] font-black text-white rounded-full flex items-center justify-center border border-white animate-bounce">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Panel Box */}
                {showNotificationCenter && (
                  <div className="absolute left-0 mt-2 z-40 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl p-0 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Header */}
                    <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Corporate Notifications Center</span>
                      </div>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkAllRead}
                          className="text-[10px] text-emerald-600 hover:text-emerald-700 font-black hover:underline cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    {/* Notification List */}
                    <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-xs">
                          <p className="text-xl mb-1">📭</p>
                          <p className="font-medium text-slate-500">All clear! No current updates.</p>
                          <p className="text-[10px] text-slate-400 mt-1">Admin alerts or enrollment approvals will appear inside this feed.</p>
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
                              className={`p-3 transition flex gap-3 ${!isRead ? 'bg-emerald-50/30' : 'bg-white hover:bg-slate-50/40'}`}
                            >
                              <span className="text-base shrink-0 mt-0.5 select-none">
                                {icon}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <p className={`text-xs font-bold leading-tight ${!isRead ? 'text-slate-900 font-extrabold' : 'text-slate-700'}`}>
                                    {notif.title}
                                  </p>
                                  <span className="text-[8px] font-mono font-bold text-slate-400 shrink-0">
                                    {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-500 leading-relaxed mt-1">
                                  {notif.message}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  {!isRead && (
                                    <button
                                      type="button"
                                      onClick={() => handleMarkAsRead(notif.id)}
                                      className="text-[8px] font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-wider bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-0.5 cursor-pointer"
                                    >
                                      <Check className="w-2 h-2" />
                                      Mark Read
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteNotif(notif.id)}
                                    className="text-[8px] font-black text-slate-400 hover:text-rose-600 uppercase tracking-wider hover:bg-rose-50 px-2 py-0.5 rounded flex items-center gap-0.5 cursor-pointer ml-auto"
                                  >
                                    <Trash2 className="w-2 h-2" />
                                    Dismiss
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    <div className="bg-slate-50 border-t border-slate-100 px-4 py-2 text-center">
                      <p className="text-[9px] font-mono text-slate-400 uppercase">
                        Aashish Sahu Buildmart • Training Compliance Console
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-y-1.5 gap-x-3 text-xs lg:text-sm text-slate-500 font-medium">
              <span className="flex items-center gap-1.5 text-slate-750">
                <span className="inline-block w-2 h-2 rounded-sm bg-emerald-600"></span>
                <span className="font-bold text-slate-800 text-[11px] lg:text-xs">
                  {activeRoleView === 'all' ? 'All Assigned Roles' : userRole?.name}
                </span>
                {assignedRoleIds.length > 1 && (
                  <span className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-100 font-mono px-1.5 py-0.5 rounded-full font-bold ml-1">
                    {assignedRoleIds.length} Profiles
                  </span>
                )}
              </span>
              <span className="text-slate-300">|</span>
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] lg:text-xs">{currentUser.department}</span>
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-emerald-600 font-bold tracking-tight bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] lg:text-xs">
                {currentUser.focusEntity}
              </span>
            </div>

            {/* Multiple Job Profiles switcher for Trainee */}
            {assignedRoleIds.length > 1 && (
              <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 space-y-1.5 max-w-2xl mt-2 animate-in slide-in-from-top-1 duration-200">
                <div className="flex items-center gap-1 text-[9px] uppercase tracking-wider font-mono font-black text-indigo-600">
                  <span>🔄 CUSTOM MULTI-ROLE HUB SWITCHER</span>
                </div>
                <div className="flex flex-wrap items-center gap-1 pt-0.5">
                  <button
                    onClick={() => setActiveRoleView('all')}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition duration-150 border cursor-pointer ${
                      activeRoleView === 'all'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    All Roles Combined 🌐
                  </button>
                  {assignedRoles.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => setActiveRoleView(role.id)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold transition duration-150 border cursor-pointer ${
                        activeRoleView === role.id
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-205'
                      }`}
                    >
                      {role.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Minimalist Visual Milestone Progress Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 lg:p-6 shadow-sm flex items-center gap-4 lg:gap-6 min-w-0 sm:min-w-[280px]">
            <div className="relative flex items-center justify-center shrink-0">
              {/* Circular progress path */}
              <svg className="w-14 h-14 lg:w-16 lg:h-16 transform -rotate-90">
                <circle
                  cx="28"
                  cy="28"
                  r="22"
                  className="stroke-slate-100 lg:cx-32 lg:cy-32 lg:r-26"
                  strokeWidth="4"
                  fill="transparent"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="22"
                  className="stroke-emerald-500 transition-all duration-500 lg:cx-32 lg:cy-32 lg:r-26"
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 22}
                  strokeDashoffset={2 * Math.PI * 22 * (1 - stats.overallPercent / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-xs lg:text-sm font-mono font-black text-slate-900">
                {stats.overallPercent}%
              </span>
            </div>
            <div className="space-y-0.5">
              <h4 className="font-display text-[9px] lg:text-xs font-extrabold uppercase tracking-wider text-slate-400">
                CURRICULUM SYLLABUS
              </h4>
              <p className="text-[11px] lg:text-sm font-bold text-slate-800">
                Verified Mastery: <span className="text-emerald-600 font-mono font-extrabold">{stats.masteryPercent}%</span>
              </p>
              <p className="text-xs text-slate-500 font-mono">
                {stats.completedCount + stats.verifiedCount} of {stats.totalUnits} Units Done
              </p>
              {userUnits.length > 0 && (
                <p className="text-[10px] text-emerald-600 font-mono font-bold mt-1 block">
                  🎥 Overall Stream Progress: {Math.round(userUnits.reduce((sum, u) => {
                    const p = getUnitProgress(u.id);
                    const isDone = p && (p.status === 'Verified & Mastered' || p.status === 'Completed (Pending Review)');
                    return sum + (isDone ? 100 : (p?.watchPercent || 0));
                  }, 0) / userUnits.length)}% Finished
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Certificate Section for mastery claims */}
        <CertificateGenerator
          currentUser={currentUser}
          userRole={userRole}
          progress={progress}
          stats={stats}
        />

        {/* Mobile Persistent Video Stream Player ("All-Type Tube Player") */}
        {mobileTab === 'player' && renderVideoStage(true)}

        {/* Mobile-Friendly Sub-Tab Selector (only visible on mobile/tablet screens to prevent scrolling fatigue) */}
        <div className="lg:hidden flex bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1 mb-4 select-none">
          <button
            type="button"
            onClick={() => setMobileTab('syllabus')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-bold transition-all duration-200 cursor-pointer ${
              mobileTab === 'syllabus'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            📋 Syllabus Checklist
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('player')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-bold transition-all duration-200 cursor-pointer ${
              mobileTab === 'player'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            📺 Video & Submit
            {selectedUnit && (
              <span className="text-[9px] bg-slate-900/10 px-1 py-0.5 rounded font-mono font-extrabold">
                {selectedUnit.code}
              </span>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Premium Soft Light Curriculum Sidebar */}
          <div className={`lg:col-span-5 space-y-6 ${mobileTab === 'syllabus' ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white text-slate-800 rounded-3xl border-2 border-slate-200/90 shadow-sm overflow-hidden select-none">
            {/* Sidebar Brand Header */}
            <div className="p-5 border-b border-slate-205 border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center font-display text-base font-black text-white shadow-sm border border-emerald-400/20">
                  {branding?.companyName ? branding.companyName.charAt(0).toUpperCase() : 'B'}
                </div>
                <div>
                  <h3 className="font-display text-sm font-black text-slate-900 tracking-tight">
                    {currentUser.focusEntity || branding?.companyName || "Rathi's Build Mart"}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono font-semibold tracking-wider uppercase">
                    Learning Path Workspace
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse"></span>
                <span className="text-[9px] font-mono font-bold text-slate-650 text-slate-600">{userChapters.length} Ch</span>
              </div>
            </div>

            {/* Sidebar Search & Schedule Filters */}
            <div className="p-5 border-b border-slate-200 bg-slate-50/20 space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search syllabus tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 text-xs text-slate-850 text-slate-800 bg-white border border-slate-250 border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 outline-none transition-all placeholder:text-slate-400"
                />
                <span className="absolute left-3 top-3.5 text-xs text-slate-400">🔍</span>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 text-lg font-bold transition-colors"
                  >
                    ×
                  </button>
                )}
              </div>
              
              {/* Frequency Filtering Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none select-none pb-0.5">
                {(['All', 'Daily', 'Weekly', 'Monthly'] as const).map((freq) => (
                  <button
                    key={freq}
                    type="button"
                    onClick={() => setSelectedFreqFilter(freq as any)}
                    className={`px-3 py-1.5 text-[9px] uppercase tracking-wider font-extrabold rounded-lg border transition-all duration-150 shrink-0 cursor-pointer ${
                      selectedFreqFilter === freq
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-705 border-slate-200/90'
                    }`}
                  >
                    {freq}
                  </button>
                ))}
              </div>
            </div>

            {/* Chapters and Stepper Timelines - Styled Sidebar List */}
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto scrollbar-thin">
              {userChapters.length === 0 ? (
                <div className="text-center py-12 text-slate-405 text-slate-400 text-xs italic p-6 font-mono">
                  No chapters added for this training track yet.
                </div>
              ) : (
                userChapters.map((chap, chapIdx) => {
                  const chapUnits = userUnits.filter(u => u.chapterId === chap.id).filter(u => {
                    const q = searchQuery.toLowerCase().trim();
                    const matchesSearch = q === '' ||
                      u.taskName.toLowerCase().includes(q) ||
                      u.code.toLowerCase().includes(q) ||
                      u.description.toLowerCase().includes(q);
                    const matchesFreq = selectedFreqFilter === 'All' || u.frequency === selectedFreqFilter;
                    return matchesSearch && matchesFreq;
                  });

                  if (searchQuery !== '' || selectedFreqFilter !== 'All') {
                    if (chapUnits.length === 0) return null;
                  }

                  const isExpanded = expandedChapters[chap.id];
                  
                  // Calculate chapter progress based on active watch percentage average
                  const totalWatchPercentForChapter = chapUnits.reduce((sum, u) => {
                    const prog = getUnitProgress(u.id);
                    // Explicitly count 'Verified & Mastered' as 100% watched, otherwise check progress watch percent
                    const unitWatch = (prog && prog.status === 'Verified & Mastered') ? 100 : (prog?.watchPercent || 0);
                    return sum + unitWatch;
                  }, 0);
                  const chapPercent = chapUnits.length ? Math.round(totalWatchPercentForChapter / chapUnits.length) : 0;
                  const isUnlocked = checkIsChapterUnlocked(chapIdx);

                  // Cycle through nice sidebar icons for each chapter category
                  const getChapterIcon = () => {
                    if (!isUnlocked) return <Lock className="w-4 h-4" />;
                    switch (chapIdx % 4) {
                      case 0: return <BookOpen className="w-4 h-4 text-emerald-650 text-emerald-600" />;
                      case 1: return <FileText className="w-4 h-4 text-purple-650 text-purple-500" />;
                      case 2: return <Award className="w-4 h-4 text-amber-655 text-amber-500" />;
                      default: return <CheckSquare className="w-4 h-4 text-emerald-655 text-emerald-600" />;
                    }
                  };

                  return (
                    <div key={chap.id} className="transition-all duration-200">
                      {/* Sidebar Chapter Accordion Title */}
                      <button
                        onClick={() => toggleChapter(chap.id, isUnlocked)}
                        type="button"
                        className={`w-full text-left px-5 py-4 flex items-center justify-between transition-colors ${
                          isUnlocked 
                            ? 'hover:bg-slate-50 cursor-pointer bg-transparent text-slate-700' 
                            : 'cursor-not-allowed bg-slate-50/50 text-slate-400'
                        }`}
                        id={`chapter-header-${chap.id}`}
                      >
                        <div className="flex items-start gap-3 min-w-0 flex-1 pr-2">
                          <div className={`mt-0.5 shrink-0 ${isUnlocked ? 'text-emerald-600' : 'text-slate-350'}`}>
                            {getChapterIcon()}
                          </div>
                          <div className="min-w-0">
                            <span className={`text-[8px] font-mono font-bold tracking-wider uppercase block ${
                              isUnlocked ? 'text-emerald-700' : 'text-slate-400'
                            }`}>
                              CHAPTER {chapIdx + 1}
                              {!isUnlocked && " (LOCKED)"}
                            </span>
                            <h4 className="font-sans text-[12px] font-extrabold text-slate-800 tracking-tight truncate">
                              {chap.name}
                            </h4>
                            {isUnlocked && (
                              <span className="text-[10px] font-mono text-emerald-700 font-bold block mt-0.5">
                                {chapPercent}% Core Mastery · {chapUnits.length} tasks
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-slate-400 hover:text-slate-600 transition-colors shrink-0">
                          {isUnlocked ? (
                            isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-slate-500" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-slate-400" />
                            )
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-slate-300" />
                          )}
                        </div>
                      </button>

                      {/* Nesting Lessons inside Category Container */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-slate-50/30 border-t border-slate-100 overflow-hidden"
                          >
                            <div className="py-2.5 space-y-1">
                              {chapUnits.map((unit) => {
                                const prog = getUnitProgress(unit.id);
                                const isSelected = selectedUnit?.id === unit.id;
                                
                                 return (
                                  <div
                                    key={unit.id}
                                    id={`unit-item-${unit.id}`}
                                    className={`w-full flex items-center justify-between px-5 py-2.5 transition-all duration-200 border-l-4 outline-none select-none relative group ${
                                      isSelected
                                        ? 'bg-emerald-50/90 text-emerald-950 font-extrabold border-l-emerald-600'
                                        : 'hover:bg-slate-100/70 text-slate-600 hover:text-slate-800 border-l-transparent'
                                    }`}
                                  >
                                    {/* Main info area (clicking selects unit) */}
                                    <div
                                      onClick={() => {
                                        setSelectedUnitId(unit.id);
                                        setMobileTab('player');
                                      }}
                                      className="flex items-center min-w-0 flex-1 pr-2 cursor-pointer"
                                    >
                                      {/* Beautiful Screenshot-Style Ring Bullet Indicators */}
                                      {isSelected ? (
                                        <div className="w-4 h-4 rounded-full border-2 border-emerald-600 flex items-center justify-center mr-2.5 shrink-0 bg-transparent">
                                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></div>
                                        </div>
                                      ) : prog?.status === 'Verified & Mastered' ? (
                                        <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center mr-2.5 shrink-0 text-[8px] font-black shadow-2xs">
                                          ✓
                                        </div>
                                      ) : prog?.status === 'Completed (Pending Review)' ? (
                                        <div className="w-4 h-4 rounded-full bg-amber-550 bg-amber-500 text-white flex items-center justify-center mr-2.5 shrink-0 text-[8px] font-black shadow-2xs">
                                          ⏳
                                        </div>
                                      ) : prog?.status === 'In Progress' ? (
                                        <div className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center mr-2.5 shrink-0 text-[8px] font-bold">
                                          •
                                        </div>
                                      ) : (
                                        <div className="w-4 h-4 rounded-full border border-slate-300 group-hover:border-slate-400 mr-2.5 shrink-0 transition-colors flex items-center justify-center" />
                                      )}

                                      <div className="min-w-0">
                                        <span className={`text-[8px] font-mono tracking-wider block ${
                                          isSelected ? 'text-emerald-700 font-extrabold' : 'text-slate-400'
                                        }`}>
                                          {unit.code} · {unit.frequency}
                                        </span>
                                        <h5 className="text-[11px] font-bold leading-snug truncate">
                                          {unit.taskName}
                                        </h5>
                                        {prog?.watchPercent && prog.watchPercent > 0 ? (
                                          <span className={`text-[9px] font-mono font-bold block mt-0.5 ${
                                            isSelected ? 'text-emerald-800' : 'text-emerald-600'
                                          }`}>
                                            🎥 Watched {prog.watchPercent}%
                                          </span>
                                        ) : null}
                                      </div>
                                    </div>

                                    {/* Inline Status Badge (Read-only as per request, no inline dropdown) */}
                                    {(() => {
                                      const statusVal = prog?.status || 'Not Started';
                                      return (
                                        <div className="shrink-0 flex items-center gap-1.5 z-10">
                                          <span
                                            className={`text-[9.5px] font-mono font-bold rounded-lg px-2.5 py-1 border transition-all uppercase ${
                                              statusVal === 'Verified & Mastered'
                                                ? 'bg-emerald-100 border-emerald-200 text-emerald-850 text-emerald-850 text-emerald-800'
                                                : statusVal === 'Completed (Pending Review)'
                                                ? 'bg-amber-100 border-amber-200 text-amber-850 text-amber-800'
                                                : statusVal === 'In Progress'
                                                ? 'bg-blue-105 bg-blue-100 border-blue-200 text-blue-800'
                                                : 'bg-slate-100 border-slate-200 text-slate-500'
                                            }`}
                                          >
                                            {statusVal === 'Verified & Mastered' 
                                              ? 'Verified' 
                                              : statusVal === 'Completed (Pending Review)' 
                                              ? 'Pending' 
                                              : statusVal === 'In Progress' 
                                              ? 'In Progress' 
                                              : 'Not Started'}
                                          </span>
                                        </div>
                                      );
                                    })()}
                                  </div>
                                );
                              })}
                              
                              {chapUnits.length === 0 && (
                                <p className="px-5 py-3 text-[11px] text-slate-405 text-slate-400 italic text-center font-mono">
                                  No tasks match schedule filters.
                                </p>
                              )}


                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Sidebar Navigation Footer Helper block (matching bottom panel) */}
          <div className="bg-white text-slate-655 text-slate-600 rounded-3xl border-2 border-slate-205 border-slate-205 border-slate-200 shadow-sm p-5 space-y-3">
            <div className="flex items-center gap-2 text-slate-805 text-slate-800">
              <CheckSquare className="w-4 h-4 text-emerald-600" />
              <h3 className="font-display text-xs font-extrabold uppercase tracking-tight">
                Execution Standings
              </h3>
            </div>
            <p className="text-[11px] text-slate-505 text-slate-500 leading-normal font-sans">
              Complete each nested lesson sequentially to unlock subsequent workspace chapters. Keep track of your verification statuses.
            </p>

             <div className="grid grid-cols-2 gap-3 pt-1">
               <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
                 <span className="block text-[8px] font-mono text-slate-400 uppercase tracking-wider">Mastered</span>
                 <span className="text-sm font-mono font-bold text-emerald-700">{stats.verifiedCount} / {stats.totalUnits}</span>
               </div>
               <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
                 <span className="block text-[8px] font-mono text-slate-400 uppercase tracking-wider">Stream Watched</span>
                 <span className="text-sm font-mono font-bold text-blue-600">
                   {userUnits.length ? Math.round(userUnits.reduce((sum, u) => {
                     const p = getUnitProgress(u.id);
                     return sum + ((p && p.status === 'Verified & Mastered') ? 100 : (p?.watchPercent || 0));
                   }, 0) / userUnits.length) : 0}%
                 </span>
               </div>
             </div>
          </div>
        </div>

        {/* Right Column: Player & Active Details (7/12 cols) */}
        <div className={`lg:col-span-7 space-y-6 ${mobileTab === 'player' ? 'block' : 'hidden lg:block'}`}>
          {selectedUnit ? (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Core Unit Workspace Header Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6 border-b border-slate-100 pb-4 sm:pb-5">
                  <div className="space-y-1.5 min-w-0">
                    <span className="inline-block text-[9px] font-mono font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                      Unit Code: {selectedUnit.code}
                    </span>
                    <h3 className="font-display text-base sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-none truncate">
                      {selectedUnit.taskName}
                    </h3>
                  </div>
                  
                  {/* Modern Status Pill */}
                  <div className="shrink-0 self-start sm:self-auto">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-mono font-extrabold tracking-wide shadow-2xs border ${
                      getStatusColor(getUnitProgress(selectedUnit.id)?.status)
                    }`}>
                      {getStatusLabelText(getUnitProgress(selectedUnit.id)?.status)}
                    </span>
                  </div>
                </div>

                {/* Highly Spacious Metadata Grid (Removing cluttered box-in-box wraps) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 py-1 border-b border-slate-100 pb-4 sm:pb-5 text-[11px] sm:text-xs text-slate-500 mb-4 sm:mb-6">
                  <div>
                    <span className="text-[9px] text-slate-400 font-mono uppercase font-bold tracking-wider block mb-0.5">Schedule</span>
                    <span className="font-bold text-slate-800 text-xs sm:text-sm">{selectedUnit.frequency}</span>
                  </div>
                  <div className="border-l border-slate-200/60 pl-3 sm:pl-5">
                    <span className="text-[9px] text-slate-400 font-mono uppercase font-bold tracking-wider block mb-0.5">Required Skill</span>
                    <span className="font-bold text-slate-800 text-xs sm:text-sm block truncate">{selectedUnit.skillRequired}</span>
                  </div>
                  <div className="border-l border-slate-200/60 pl-3 sm:pl-5">
                    <span className="text-[9px] text-slate-400 font-mono uppercase font-bold tracking-wider block mb-0.5">Standard</span>
                    <span className="font-bold text-slate-800 text-xs sm:text-sm">Dual Verification</span>
                  </div>
                  <div className="border-l border-slate-200/60 pl-3 sm:pl-5">
                    <span className="text-[9px] text-slate-400 font-mono uppercase font-bold tracking-wider block mb-0.5">Lesson Scope</span>
                    <span className="font-bold text-emerald-600 text-xs sm:text-sm block truncate">Active Master</span>
                  </div>
                </div>

                <p className="text-[11px] sm:text-sm text-slate-400 leading-relaxed font-sans font-medium">
                  {selectedUnit.description}
                </p>
              </div>

              {/* Desktop Theater Mode Video Lesson Panel */}
              {renderVideoStage(false)}

              {/* SOP Checklist Card Wrapper */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">

                {/* SOP Best Practices Block (Interactive Checklist) */}
                <div className="p-4 sm:p-7 border-t border-slate-100 bg-slate-50/25">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-3 sm:mb-4">
                    <h4 className="text-[10px] sm:text-xs font-mono font-extrabold text-slate-900 uppercase tracking-widest flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-emerald-600" />
                      Essential Best Practices & SOP Checklist
                    </h4>
                    <span className="text-[9px] font-sans font-semibold text-slate-400 italic">
                      (Click items to complete standard audit checklist)
                    </span>
                  </div>
                  
                  <ul className="text-xs text-slate-600 space-y-2.5">
                    {[
                      {
                        title: "Mandatory Lesson Review",
                        desc: "Analyze standardized video training modules entirely before submitting logs."
                      },
                      {
                        title: "Dual Validation",
                        desc: "Crosscheck ledger entries and business vouchers with corporate standards."
                      },
                      {
                        title: "Audit Logs",
                        desc: "Always document robust observation notes to fast-track checker verification and sign-off."
                      }
                    ].map((item, index) => {
                      const isItemChecked = getSopStatus(selectedUnit.id)[index];
                      return (
                        <li 
                          key={index}
                          onClick={() => handleToggleSop(index)}
                          className={`flex items-start gap-3 leading-relaxed cursor-pointer p-2.5 sm:p-3 rounded-xl border transition-all duration-200 select-none ${
                            isItemChecked 
                              ? 'bg-emerald-50/30 border-emerald-100 text-slate-705 shadow-3xs' 
                              : 'bg-white/40 border-slate-100 hover:border-slate-200 hover:bg-slate-50/70 text-slate-600'
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all duration-200 ${
                            isItemChecked 
                              ? 'bg-emerald-500 border-emerald-600 text-white shadow-3xs scale-105' 
                              : 'bg-white border-slate-300 text-transparent hover:border-emerald-400 hover:scale-[1.03]'
                          }`}>
                            <span className="text-[10px] font-black">✓</span>
                          </span>
                          <span className="flex-1 text-[11px] sm:text-xs">
                            <strong className={`font-bold font-sans transition-colors ${isItemChecked ? 'text-emerald-800' : 'text-slate-800'}`}>
                              {item.title}:
                            </strong>{" "}
                            <span className={isItemChecked ? 'text-slate-500 line-through decoration-slate-300' : 'text-slate-600'}>
                              {item.desc}
                            </span>
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>

              {/* Clean Trainee Submission Form */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b border-slate-100 pb-4">
                  <h4 className="font-display text-sm sm:text-base font-extrabold text-slate-900 uppercase tracking-tight flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                    Update Progress & Sign-Off
                  </h4>
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                    Audit Sign-Off Workflow
                  </span>
                </div>

                {toastMsg && (
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100/80 text-xs text-emerald-800 font-semibold mb-6 flex items-center gap-2.5 animate-in slide-in-from-top-2 duration-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>{toastMsg}</span>
                  </div>
                )}

                {getUnitProgress(selectedUnit.id)?.status === 'Verified & Mastered' ? (
                  <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100 text-xs text-emerald-800 space-y-2 mb-4 animate-in fade-in duration-150">
                    <p className="font-extrabold flex items-center gap-1.5 text-emerald-800 text-sm">
                      <Award className="w-5 h-5 text-emerald-600" />
                      Task Verified & Mastered!
                    </p>
                    <p className="font-mono text-[10px] text-emerald-700">
                      Standard execution mastery marked successfully. You can still adjust status below.
                    </p>
                  </div>
                ) : getUnitProgress(selectedUnit.id)?.status === 'Completed (Pending Review)' ? (
                  <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-100 text-xs text-amber-800 space-y-2 mb-4 animate-in fade-in duration-150">
                    <p className="font-extrabold flex items-center gap-1.5 text-amber-800 text-sm">
                      <CheckCircle2 className="w-5 h-5 text-amber-600" />
                      Completed (Pending Review)
                    </p>
                    <p className="font-mono text-[10px] text-amber-700">
                      Task has been submitted and is currently pending verification sign-off.
                    </p>
                  </div>
                ) : null}

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] text-slate-400 uppercase font-mono font-bold tracking-wider">
                        Training Action Status
                      </label>
                      <select
                        value={submittingStatus}
                        onChange={(e) => setSubmittingStatus(e.target.value as ProgressStatus)}
                        className="w-full bg-slate-50/60 border border-slate-200 rounded-xl py-2.5 px-4 text-xs text-slate-700 font-bold focus:bg-white focus:border-emerald-500 outline-none transition-all"
                      >
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress (Active Training)</option>
                        <option value="Completed (Pending Review)">Completed (Pending Review)</option>
                        <option value="Verified & Mastered">Verified & Mastered</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] text-slate-400 uppercase font-mono font-bold tracking-wider flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        Compliance Observations
                      </label>
                      <textarea
                        placeholder="Summarize lessons or observations (e.g., matching bookkeeping tools)..."
                        value={submissionNotes}
                        onChange={(e) => setSubmissionNotes(e.target.value)}
                        className="w-full bg-slate-50/60 border border-slate-200 rounded-xl py-2 px-4 text-xs text-slate-700 outline-none focus:bg-white focus:border-emerald-500 min-h-[45px] max-h-[90px] transition-all leading-relaxed"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSubmitProgress}
                    id="user-submit-progress-btn"
                    className="w-full bg-slate-900 hover:bg-slate-950 text-white font-extrabold py-3 px-4 rounded-xl shadow-xs transition-all text-xs flex items-center justify-center gap-1.5"
                  >
                    Update My Progress Record
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 font-sans shadow-sm">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-bold">No Unit Selected</p>
              <p className="text-xs text-slate-400 mt-1">Please select an accounting training unit from the curriculum path on the left.</p>
            </div>
          )}
        </div>

      </div>

      {/* 📊 ENTERPRISE TRAINING COMPLIANCE LOGBOOK & SUMMARY REPORT */}
      <div className="mt-12 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 text-[10px] uppercase font-mono font-bold tracking-wider">
                Audit Trail
              </span>
              <p className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-widest">
                Real-time Sync
              </p>
            </div>
            <h4 className="font-display text-lg sm:text-xl font-bold text-slate-950 mt-1">
              📋 Syllabus Compliance & Progress Summary Report
            </h4>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed font-sans">
              Complete chronological ledger of task interactions, start dates, and master verifications.
            </p>
          </div>

          {/* Filter pills inside report */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
            {(['All', 'Not Started', 'In Progress', 'Completed (Pending Review)', 'Verified & Mastered'] as const).map(statusFilter => {
              const label = statusFilter === 'All' ? 'All' : statusFilter === 'Completed (Pending Review)' ? 'Pending' : statusFilter === 'Verified & Mastered' ? 'Verified' : statusFilter;
              const count = userUnits.filter(u => {
                const p = progress.find(log => log.userId === currentUser.id && log.unitId === u.id);
                const stat = p ? p.status : 'Not Started';
                return statusFilter === 'All' || stat === statusFilter;
              }).length;

              return (
                <button
                  key={statusFilter}
                  type="button"
                  onClick={() => setReportStatusFilter(statusFilter)}
                  className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    reportStatusFilter === statusFilter
                      ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                      : 'bg-slate-50 border-slate-150 text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  {label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Report table / ledger view */}
        {(() => {
          const filteredUnitsForReport = userUnits.filter(u => {
            const p = progress.find(log => log.userId === currentUser.id && log.unitId === u.id);
            const status = p ? p.status : 'Not Started';
            if (reportStatusFilter === 'All') return true;
            return status === reportStatusFilter;
          });

          const formatDate = (isoStr?: string) => {
            if (!isoStr) return '—';
            try {
              const date = new Date(isoStr);
              return date.toLocaleDateString(undefined, {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });
            } catch {
              return isoStr;
            }
          };

          if (filteredUnitsForReport.length === 0) {
            return (
              <div className="text-center py-12 text-slate-400 font-mono text-xs border border-dashed border-slate-200 rounded-2xl">
                🔍 No tasks matching "{reportStatusFilter}" were found.
              </div>
            );
          }

          return (
            <div className="overflow-hidden border border-slate-150 rounded-2xl bg-white shadow-3xs">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-150">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th scope="col" className="px-5 py-3.5 text-left text-[10px] font-display font-extrabold uppercase tracking-wider text-slate-800">
                        Task / Syllabus Unit
                      </th>
                      <th scope="col" className="px-5 py-3.5 text-left text-[10px] font-display font-extrabold uppercase tracking-wider text-slate-800">
                        Started On
                      </th>
                      <th scope="col" className="px-5 py-3.5 text-left text-[10px] font-display font-extrabold uppercase tracking-wider text-slate-800">
                        Completed On
                      </th>
                      <th scope="col" className="px-5 py-3.5 text-left text-[10px] font-display font-extrabold uppercase tracking-wider text-slate-800">
                        Current Status
                      </th>
                      <th scope="col" className="px-5 py-3.5 text-center text-[10px] font-display font-extrabold uppercase tracking-wider text-slate-800 w-36">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 bg-white">
                    {filteredUnitsForReport.map((u) => {
                      const p = progress.find(log => log.userId === currentUser.id && log.unitId === u.id);
                      const status = p ? p.status : 'Not Started';
                      const isHistoryExpanded = expandedUnitIdForHistory === u.id;

                      return (
                        <React.Fragment key={u.id}>
                          <tr className={`hover:bg-slate-50/50 transition-all ${isHistoryExpanded ? 'bg-slate-50/40' : ''}`}>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <span className={`px-2 py-1 rounded-lg text-[10px] font-bold font-mono ${
                                  status === 'Verified & Mastered'
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                                    : status === 'Completed (Pending Review)'
                                    ? 'bg-amber-50 text-amber-800 border border-amber-100'
                                    : status === 'In Progress'
                                    ? 'bg-blue-50 text-blue-800 border border-blue-100'
                                    : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {u.code}
                                </span>
                                <div className="min-w-0">
                                  <h6 className="font-semibold text-xs text-slate-900 truncate">
                                    {u.taskName}
                                  </h6>
                                  <p className="text-[10px] mt-0.5 text-slate-400">
                                    Category: Chapter {chapters.find(c => c.id === u.chapterId)?.name || '—'} · {u.frequency} Schedule
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-xs font-mono text-slate-600">
                              {p?.startedAt ? (
                                <div className="flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                  <span>{formatDate(p.startedAt)}</span>
                                </div>
                              ) : (
                                <span className="text-slate-350">—</span>
                              )}
                            </td>
                            <td className="px-5 py-4 text-xs font-mono text-slate-600">
                              {p?.completedAt ? (
                                <div className="flex items-center gap-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                  <span>{formatDate(p.completedAt)}</span>
                                </div>
                              ) : (
                                <span className="text-slate-350">—</span>
                              )}
                            </td>
                            <td className="px-5 py-4">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold font-mono tracking-wide border uppercase ${
                                getStatusColor(status)
                              }`}>
                                {getStatusLabelText(status)}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-center">
                              <button
                                type="button"
                                onClick={() => setExpandedUnitIdForHistory(isHistoryExpanded ? null : u.id)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold tracking-wider uppercase transition-all duration-150 cursor-pointer whitespace-nowrap ${
                                  isHistoryExpanded
                                    ? 'bg-slate-900 text-white hover:bg-slate-800'
                                    : 'bg-slate-100 text-slate-650 hover:bg-slate-200 hover:text-slate-900 border border-slate-200'
                                }`}
                              >
                                {isHistoryExpanded ? '▼ Hide Logs' : '👁 View Logs'}
                              </button>
                            </td>
                          </tr>

                          {/* Extended chronological audit timeline */}
                          {isHistoryExpanded && (
                            <tr>
                              <td colSpan={5} className="px-5 py-5 bg-slate-50/70 border-t border-slate-150">
                                <div className="max-w-4xl mx-auto space-y-4">
                                  <h6 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                    <span>📜 Action Log & Audit History trail for {u.code}</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                                  </h6>
                                  
                                  {p?.history && p.history.length > 0 ? (
                                    <div className="relative border-l border-slate-200 ml-3 mt-4 space-y-5">
                                      {p.history.map((h, hIdx) => (
                                        <div key={hIdx} className="relative pl-6">
                                          {/* Colored bullet reflecting historical status transition page */}
                                          <div className={`absolute -left-1.5 top-1 w-3 h-3 rounded-full border border-white ${
                                            h.status === 'Verified & Mastered'
                                              ? 'bg-emerald-500 shadow-[0_0_6px_#10b981]'
                                              : h.status === 'Completed (Pending Review)'
                                              ? 'bg-amber-500 shadow-[0_0_6px_#f59e0b]'
                                              : h.status === 'In Progress'
                                              ? 'bg-blue-500 shadow-[0_0_6px_#3b82f6]'
                                              : 'bg-slate-400'
                                          }`} />
                                          
                                          <div className="text-xs bg-white border border-slate-200/85 rounded-xl p-3.5 shadow-3xs max-w-2xl">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-1.5 mb-1.5">
                                              <div className="flex items-center gap-2">
                                                <span className="font-bold text-slate-800 text-[11px]">
                                                  {h.changedBy} updated Status to:
                                                </span>
                                                <span className={`px-2 py-0.5 rounded text-[8.5px] font-bold font-mono tracking-wide ${
                                                  getStatusColor(h.status)
                                                }`}>
                                                  {getStatusLabelText(h.status)}
                                                </span>
                                              </div>
                                              <span className="text-[10px] text-slate-400 font-mono">
                                                {formatDate(h.timestamp)}
                                              </span>
                                            </div>
                                            
                                            {h.notes ? (
                                              <p className="text-slate-600 italic text-[11px] leading-relaxed">
                                                " {h.notes} "
                                              </p>
                                            ) : (
                                              <p className="text-slate-400 text-[10.5px] italic">
                                                No compliance notes written for this log step.
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="p-4 bg-white border border-slate-200 rounded-xl text-xs text-slate-500">
                                      <p className="font-bold">No transition history currently recorded.</p>
                                      <p className="text-[10px] mt-0.5 text-slate-400">
                                        This task is currently in <strong className="text-slate-650">{getStatusLabelText(status)}</strong> status (last updated on {formatDate(p?.lastUpdated || new Date().toISOString())}). Modifying standard progress via checkboxes or inline dropdowns will append detailed chronological logs here.
                                      </p>
                                    </div>
                                  )}
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
          );
        })()}
      </div>

      {/* Floating System Notification overlay for superior visual polish */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-900 border border-slate-950 text-white rounded-2xl shadow-xl p-4 flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm shrink-0 font-bold">
              🔔
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-mono tracking-wider text-slate-400 uppercase font-black">Training Hub</p>
              <p className="text-[11px] sm:text-xs text-slate-100 leading-snug mt-0.5 font-medium">{toastMsg}</p>
            </div>
            <button 
              type="button"
              onClick={() => setToastMsg(null)} 
              className="text-slate-400 hover:text-white font-bold text-base px-1.5 py-0.5"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </div>
  );
}
