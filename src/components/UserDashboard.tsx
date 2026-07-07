/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { PremiumBadge } from './PremiumBadge';
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
  ChevronLeft,
  Pin,
  PinOff,
  Eye,
  EyeOff,
  MousePointerClick,
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
  Check,
  Database,
  BarChart3,
  Brain
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import CertificateGenerator from './CertificateGenerator';
import AssessmentCenter from './AssessmentCenter';
import ScreeningTest from './ScreeningTest';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: 'approval' | 'system' | 'role' | 'achievement';
}

export interface SopItem {
  title: string;
  desc: string;
}

export const getSopItemsForUnit = (unit: Unit): SopItem[] => {
  if (!unit) return [];
  if (unit.sopItems && unit.sopItems.length > 0) return unit.sopItems;
  const id = unit.id;
  const code = unit.code || '';
  
  if (id === 'u_tax_001' || code.includes('TAX-001')) {
    return [
      {
        title: "GSTR-2B Statement Download",
        desc: "Download and extract the official GSTR-2B statement from the government GST portal for the target tax period."
      },
      {
        title: "ITC Booking Verification",
        desc: "Compare credited Input Tax Credit (ITC) with internal purchase ledger books and mark matches."
      },
      {
        title: "Missing Vendor Action List",
        desc: "Identify missing seller invoices and flag them to the vendor coordination desk for quick release."
      }
    ];
  }
  
  if (id === 'u_tax_002' || code.includes('TAX-002')) {
    return [
      {
        title: "Sales Liability Assembling",
        desc: "Assemble all tax invoices, credit/debit notes to compute gross outward tax liability accurately."
      },
      {
        title: "ITC Set-off Optimization",
        desc: "Apply correct CGST/SGST/IGST input tax credit set-off rules to legally minimize cash outflows."
      },
      {
        title: "Challan Generation & Submission",
        desc: "Generate the tax challan, perform online bank transfer, and e-file GSTR-3B before the statutory deadline."
      }
    ];
  }
  
  if (id === 'u_tax_003' || code.includes('TAX-003')) {
    return [
      {
        title: "Form 26AS & AIS Download",
        desc: "Extract the latest Form 26AS and Annual Information Statement from the TRACES income tax portal."
      },
      {
        title: "Receipt TDS Reconciliation",
        desc: "Match customer-provided TDS certificates and ledger entries with TDS credits reflecting under Form 26AS."
      },
      {
        title: "Discrepancy Correction Requests",
        desc: "Isolate mismatched or missing credits and submit rectifications to respective clients to revise their filings."
      }
    ];
  }
  
  if (id === 'u_tax_004' || code.includes('TAX-004')) {
    return [
      {
        title: "Quarterly Deductions Consolidation",
        desc: "Consolidate quarterly TDS payment receipts and assign correct sections (e.g., 194C, 194I, 194J)."
      },
      {
        title: "NSDL RPU file compilation",
        desc: "Compile TDS return files using NSDL Return Preparation Utility and perform mandatory PAN validations."
      },
      {
        title: "NSDL FVU Validator Check",
        desc: "Run the output file through the NSDL File Validation Utility (FVU) to correct structural and compliance errors."
      }
    ];
  }
  
  if (id === 'u_jr_031' || code.includes('JR-031')) {
    return [
      {
        title: "Ledger & Bank Statement Extraction",
        desc: "Download complete monthly bank statements and extract the matching ERP cash-at-bank general ledger."
      },
      {
        title: "Float & Timing Diff Tracking",
        desc: "Map all unpresented checks, deposits-in-transit, interest credits, and direct bank debit charges."
      },
      {
        title: "Reconciled BRS Sheet Printing",
        desc: "Pass adjusting entries for bank fees, balance both sheets, and print the reconciled BRS report for verification."
      }
    ];
  }
  
  if (id === 'u_jr_032' || code.includes('JR-032')) {
    return [
      {
        title: "Surprise Cash Box Count",
        desc: "Conduct physical counting of cash notes in the safe box and document immediate balance tallies."
      },
      {
        title: "Voucher and Receipt Audit",
        desc: "Examine all submitted petty expense vouchers for merchant tax invoice receipts and proper employee signatures."
      },
      {
        title: "Imprest Refill Entry & Sign-off",
        desc: "Record validated cash spend entries in the ERP and forward the reimbursement proposal to the branch manager."
      }
    ];
  }
  
  if (id === 'u_jr_033' || code.includes('JR-033')) {
    return [
      {
        title: "Acquisition Invoice Review",
        desc: "Check asset purchase invoice details, custom clearance papers, and capitalization approvals."
      },
      {
        title: "Asset Tagging Update",
        desc: "Generate a unique company barcode, complete physical labeling, and update location records in FAR."
      },
      {
        title: "Depreciation Rate Mapping",
        desc: "Set up depreciation schedules in FAR as per SLM/WDV methods in accordance with Companies Act schedules."
      }
    ];
  }
  
  if (id === 'u_sr_041' || code.includes('SR-041')) {
    return [
      {
        title: "Accrual Provision Review",
        desc: "Review vendor purchase patterns, utility bills, and outstanding lease contracts to map unbilled monthly expenses."
      },
      {
        title: "Provisions Posting and Filing",
        desc: "Draft standard accrual journal entries, attach calculation sheets, and post provisions in the GL."
      },
      {
        title: "Auto-Reversal Setup",
        desc: "Configure reversing entries to automatically post on the first day of the subsequent month."
      }
    ];
  }
  
  if (id === 'u_sr_042' || code.includes('SR-042')) {
    return [
      {
        title: "Inter-Entity Statement Pulling",
        desc: "Request ledger balance sheets from the parent entity and all registered Build Mart logistics divisions."
      },
      {
        title: "Variance Investigation",
        desc: "Identify outstanding inter-entity variances caused by goods-in-transit, pricing differences, or timing."
      },
      {
        title: "Consolidated Elimination Setup",
        desc: "Issue eliminating contra-journal postings to clear matched outstanding balances in consolidated financials."
      }
    ];
  }
  
  if (id === 'u_sr_043' || code.includes('SR-043')) {
    return [
      {
        title: "Trial Balance Tally",
        desc: "Ensure the complete trial balance is in perfect equilibrium and matches with primary ledgers."
      },
      {
        title: "Lead Schedule Preparation",
        desc: "Draft detailed Lead Schedules for equity, provisions, and taxation accounts showing opening and closing audits."
      },
      {
        title: "Audit Query Logs Maintenance",
        desc: "Set up a shared tracking sheet to log auditor queries, assign task owners, and manage document submissions."
      }
    ];
  }
  
  if (id === 'u_cand_001' || code.includes('CAND-001')) {
    return [
      {
        title: "Account Type Classification",
        desc: "Classify general ledger accounts into Real, Personal, or Nominal classes."
      },
      {
        title: "Golden Rules Application",
        desc: "Apply: Debit what comes in / Credit what goes out; Debit receiver / Credit giver; Debit expense / Credit income."
      },
      {
        title: "Dual Entry Balance Tally",
        desc: "Verify that total debit amount matches total credit amount for the mock ledger balances."
      }
    ];
  }
  
  if (id === 'u_cand_002' || code.includes('CAND-002')) {
    return [
      {
        title: "GSTR-2B and GSTR-3B Mapping",
        desc: "Identify how purchases logged in 2B correspond to input tax credits claimed in GSTR-3B."
      },
      {
        title: "ITC Eligibility Audit",
        desc: "Review mock invoices to flag ineligible ITC claims under blocked credit sections."
      },
      {
        title: "Basic Vendor Match Execution",
        desc: "Run a simple comparison drill of purchase vouchers with vendor compliance listings."
      }
    ];
  }

  const chapterId = unit.chapterId || '';
  if (chapterId.includes('gst') || chapterId.includes('tax')) {
    return [
      {
        title: "Tax Legislation Matching",
        desc: "Check local GST or Income Tax sections to ensure current tax rates are correctly applied."
      },
      {
        title: "Challan and Ledger Double-Check",
        desc: "Reconcile tax cash ledger deposits with bank transfer receipts and online challans."
      },
      {
        title: "Tax Return Draft Proofing",
        desc: "Prepare and proofread draft tax returns for compliance before forwarding to the senior tax manager."
      }
    ];
  }

  if (chapterId.includes('asset') || chapterId.includes('jr')) {
    return [
      {
        title: "Ledger Reconciliation",
        desc: "Reconcile general ledger balances with subsidiary ledger records or physical counts."
      },
      {
        title: "Voucher and Document Check",
        desc: "Verify that all transactions have appropriate receipts, vouchers, and authorizing signatures."
      },
      {
        title: "Control Account Verification",
        desc: "Compare control accounts with sub-ledgers and resolve discrepancies."
      }
    ];
  }

  return [
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
  ];
};


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
  
  // Sidebar tab routing
  activeTab?: string;
  onChangeTab?: (tab: string) => void;
  selectedExamChapterId?: string | null;
  setSelectedExamChapterId?: (id: string | null) => void;
  onAttemptSaved?: () => void;
  certUserRole?: Role | null;
  certProgressStats?: any;
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
  onUpdateNotifications = () => {},
  
  // Destructured sidebar routing
  activeTab = 'learning',
  onChangeTab,
  selectedExamChapterId = null,
  setSelectedExamChapterId,
  onAttemptSaved,
  certUserRole = null,
  certProgressStats = null
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

  // Tab switch for active Lesson Player: 'video' (Tutorial Video) vs 'pdf' (SOP document)
  const [lessonPlayerTab, setLessonPlayerTab] = useState<'video' | 'pdf'>('video');

  useEffect(() => {
    if (selectedUnit && selectedUnit.pdfUrl && (!selectedUnit.videoUrl || selectedUnit.videoUrl.trim() === '' || selectedUnit.videoUrl === 'none')) {
      setLessonPlayerTab('pdf');
    } else {
      setLessonPlayerTab('video');
    }
  }, [selectedUnitId, selectedUnit]);

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
  const [isStatsExpanded, setIsStatsExpanded] = useState(false);

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
  const isAdminUser = currentUser.isSuperAdmin || 
                      currentUser.isAdmin || 
                      currentUser.roleId === 'role_sr_acc' || 
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
  const [activeMediaTab, setActiveMediaTab] = useState<'pdf' | 'video'>('pdf');

  useEffect(() => {
    if (selectedUnit) {
      const prog = getUnitProgress(selectedUnit.id);
      setSubmissionNotes(prog?.notes || '');
      setSubmittingStatus(prog?.status || 'Not Started');

      // Set default media tab according to the rules:
      const hasPdf = !!(selectedUnit.pdfUrl && selectedUnit.pdfUrl.trim() !== '');
      const hasVideo = !!(selectedUnit.videoUrl && selectedUnit.videoUrl.trim() !== '');
      if (hasPdf && hasVideo) {
        setActiveMediaTab('pdf');
      } else if (!hasPdf && hasVideo) {
        setActiveMediaTab('video');
      } else {
        setActiveMediaTab('pdf');
      }
    }
  }, [selectedUnitId]);

  // Search and frequency filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFreqFilter, setSelectedFreqFilter] = useState<'All' | 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Ad-hoc'>('All');

  // Mobile sub-tab responsive control ('syllabus' | 'player')
  const [mobileTab, setMobileTab] = useState<'syllabus' | 'player'>('syllabus');

  // Main navigation tab ('workspace' | 'audit')
  const [userActiveTab, setUserActiveTab] = useState<'workspace' | 'audit'>('workspace');

  // PDF Reader configuration states
  const [pdfUrl, setPdfUrl] = useState<string>(() => {
    return localStorage.getItem('lms_corporate_curriculum_pdf') || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
  });
  const [isEditingPdf, setIsEditingPdf] = useState(false);
  const [customPdfInput, setCustomPdfInput] = useState(pdfUrl);
  const [pdfReaderCollapsed, setPdfReaderCollapsed] = useState(false);

  // Trainee Sidebar States
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarLocked, setSidebarLocked] = useState(false);
  const [autoHideEnabled, setAutoHideEnabled] = useState(true);

  // Helper: check if chapter is unlocked
  const checkIsChapterUnlocked = (idx: number) => {
    return true; // Chapter locking is disabled, progress is fully open.
  };

  // Trainee data analyzer for smart training pathways
  const getSyllabusInsights = () => {
    // Next unit that needs work: Not Started or In Progress
    const nextUnit = userUnits.find(u => {
      const p = progress.find(log => log.userId === currentUser.id && log.unitId === u.id);
      return !p || (p.status !== 'Verified & Mastered' && p.status !== 'Completed (Pending Review)');
    });

    // Group units by Chapter to analyze mastery rate per chapter
    const chapterAnalyses = userChapters.map(chap => {
      const chapUnits = userUnits.filter(u => u.chapterId === chap.id);
      const chapDone = chapUnits.filter(u => {
        const p = progress.find(log => log.userId === currentUser.id && log.unitId === u.id);
        return p && p.status === 'Verified & Mastered';
      }).length;
      const masteryRate = chapUnits.length > 0 ? Math.round((chapDone / chapUnits.length) * 100) : 0;
      return {
        id: chap.id,
        name: chap.name,
        masteryRate,
        total: chapUnits.length,
        done: chapDone
      };
    });

    // Lowest mastery chapter (where masteryRate < 100 and total > 0)
    const inProgressChapters = chapterAnalyses.filter(c => c.total > 0 && c.masteryRate < 100);
    const lowestChapter = inProgressChapters.length > 0 
      ? [...inProgressChapters].sort((a, b) => a.masteryRate - b.masteryRate)[0]
      : null;

    // Highest mastery chapter
    const highestChapter = chapterAnalyses.length > 0
      ? [...chapterAnalyses].sort((a, b) => b.masteryRate - a.masteryRate)[0]
      : null;

    return {
      nextUnit,
      lowestChapter,
      highestChapter,
      chapterAnalyses
    };
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
  }  // Centralised Combined Media Stage (PDF SOP Viewer & Video Player Switcher)
  const renderCombinedMediaStage = (isMobile: boolean) => {
    if (!selectedUnit) return null;

    // Resolve PDF URL
    const activePdfUrl = (selectedUnit && selectedUnit.pdfUrl && selectedUnit.pdfUrl.trim() !== '') 
      ? selectedUnit.pdfUrl.trim() 
      : pdfUrl.trim();
    
    let resolvedPdfUrl = activePdfUrl;
    if (activePdfUrl.includes('drive.google.com')) {
      const match = activePdfUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        resolvedPdfUrl = `https://drive.google.com/file/d/${match[1]}/preview`;
      }
    }

    // Resolve Video Source
    const { type, url } = resolveVideoSource(selectedUnit.videoUrl);

    // Determine presence of both
    const unitHasPdf = !!(selectedUnit && selectedUnit.pdfUrl && selectedUnit.pdfUrl.trim() !== '');
    const unitHasVideo = !!(selectedUnit && selectedUnit.videoUrl && selectedUnit.videoUrl.trim() !== '');

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
          return <span className="bg-slate-100 text-slate-500 text-[9px] font-mono px-2 py-0.5 rounded-full uppercase">SOP Guide</span>;
      }
    };

    return (
      <div 
        id={isMobile ? "mobile-combined-player" : "desktop-combined-player"}
        className={`bg-white rounded-3xl border-2 shadow-sm overflow-hidden transition-all duration-200 ${
          activeMediaTab === 'pdf' ? 'border-indigo-200' : 'border-slate-200/90'
        } ${
          isMobile ? 'mb-6 block lg:hidden ring-4 ring-slate-100/60' : 'mb-6 hidden lg:block'
        }`}
      >
        {/* Dynamic Header */}
        <div className={`px-5 py-3.5 border-b flex flex-col md:flex-row md:items-center justify-between gap-3 ${
          activeMediaTab === 'pdf' ? 'border-indigo-100 bg-indigo-50/30' : 'border-slate-150 bg-slate-50/50'
        }`}>
          {/* Active Tab Branding Header Info */}
          {activeMediaTab === 'pdf' ? (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl shrink-0">
                <FileText className="w-4 h-4 shrink-0" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] text-indigo-500 font-mono tracking-wider font-extrabold uppercase block leading-none mb-0.5">
                  Corporate Curriculum Architecture
                </span>
                <span className="font-display text-xs sm:text-sm font-black text-slate-900 tracking-tight block truncate max-w-[180px] sm:max-w-md md:max-w-xl">
                  📄 Lesson SOP Document (PDF)
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse shrink-0"></span>
              <div className="min-w-0">
                <span className="text-[9px] sm:text-[10px] text-rose-500 font-mono tracking-wider font-extrabold uppercase block leading-none mb-0.5">
                  NOW STREAMING LESSON
                </span>
                <span className="font-display text-xs sm:text-sm font-black text-slate-900 tracking-tight block truncate max-w-[180px] sm:max-w-md md:max-w-xl">
                  {selectedUnit.videoTitle || "Standard Walkthrough Demonstration"}
                </span>
              </div>
            </div>
          )}

          {/* Combined Switch Tabs inside Header */}
          {unitHasPdf && unitHasVideo && (
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/60 shadow-3xs gap-0.5 select-none shrink-0 mx-auto md:mx-0">
              <button
                type="button"
                onClick={() => setActiveMediaTab('pdf')}
                className={`flex items-center gap-1.5 py-1 px-3 rounded-md text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                  activeMediaTab === 'pdf'
                    ? 'bg-white text-indigo-700 shadow-3xs font-black border border-slate-200/20'
                    : 'text-slate-500 hover:text-slate-850'
                }`}
              >
                <FileText className="w-2.5 h-2.5 shrink-0 text-indigo-600" />
                <span>SOP PDF</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveMediaTab('video')}
                className={`flex items-center gap-1.5 py-1 px-3 rounded-md text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                  activeMediaTab === 'video'
                    ? 'bg-white text-rose-700 shadow-3xs font-black border border-slate-200/20'
                    : 'text-slate-500 hover:text-slate-850'
                }`}
              >
                <Play className="w-2.5 h-2.5 shrink-0 text-rose-600 fill-rose-600" />
                <span>Video</span>
              </button>
            </div>
          )}

          {/* Context Actions (Presets dropdown, watch links, collapse button) */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 justify-end md:justify-start">
            {activeMediaTab === 'pdf' ? (
              <>
                {/* PDF Presets & Admin Tools */}
                {isAdminUser && (
                  <select
                    value={activePdfUrl}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPdfUrl(val);
                      setCustomPdfInput(val);
                      localStorage.setItem('lms_corporate_curriculum_pdf', val);
                    }}
                    className="bg-white border border-indigo-200 rounded-xl px-2.5 py-1 text-[10px] font-bold text-slate-700 outline-none focus:border-indigo-500 cursor-pointer max-w-[150px] md:max-w-[170px]"
                  >
                    <option value="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf">Preset: Operations Manual</option>
                    <option value="https://unstats.un.org/unsd/nationalaccount/docs/SNA2008.pdf">Preset: Ledger Audits</option>
                    <option value="https://www.mca.gov.in/Ministry/pdf/CompaniesAct2013.pdf">Preset: Compliance Act</option>
                  </select>
                )}

                {isAdminUser && (
                  <button
                    type="button"
                    onClick={() => setIsEditingPdf(!isEditingPdf)}
                    className="text-[10px] font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1 rounded-xl transition cursor-pointer shrink-0"
                  >
                    {isEditingPdf ? 'Close Editor' : 'Edit PDF Link'}
                  </button>
                )}
              </>
            ) : (
              <>
                {/* Video Badges & Direct Watch External Link */}
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
              </>
            )}

            <button
              type="button"
              onClick={() => setPdfReaderCollapsed(!pdfReaderCollapsed)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              title={pdfReaderCollapsed ? "Expand Media Frame" : "Collapse Media Frame"}
            >
              <ChevronDown className={`w-4 h-4 transform transition-transform duration-200 ${pdfReaderCollapsed ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Custom Input for PDF URL (visible only if isEditingPdf is active and we are currently on the PDF tab) */}
        {activeMediaTab === 'pdf' && isEditingPdf && (
          <div className="p-4 bg-slate-50 border-b border-indigo-100 flex flex-col gap-2.5 text-left">
            <span className="text-[9px] font-bold text-slate-505 text-slate-500 uppercase font-mono tracking-wider">
              Configure Corporate Curriculum PDF Link (Direct PDF, Google Drive Link, OneDrive link):
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Paste corporate curriculum PDF URL here (Google Drive share link, OneDrive, or any web PDF URL)"
                value={customPdfInput}
                onChange={(e) => setCustomPdfInput(e.target.value)}
                className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-sans focus:border-indigo-500 outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  const targetUrl = customPdfInput.trim() || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
                  setPdfUrl(targetUrl);
                  localStorage.setItem('lms_corporate_curriculum_pdf', targetUrl);
                  setIsEditingPdf(false);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-3xs"
              >
                Apply Link
              </button>
            </div>
            <p className="text-[9px] text-slate-400 font-medium">
              💡 <strong>Google Drive Tip:</strong> Google Drive standard viewer links will automatically convert to clean, responsive embedded preview frames.
            </p>
          </div>
        )}

        {/* Media Frame Main Canvas Content Body */}
        {!pdfReaderCollapsed && (
          <div>
            {activeMediaTab === 'pdf' ? (
              /* PDF iframe stage */
              <div className="w-full bg-slate-900 relative shadow-inner h-[260px] lg:h-[330px]">
                <iframe
                  src={resolvedPdfUrl}
                  title="Corporate Curriculum Architecture PDF Frame"
                  className="absolute inset-0 w-full h-full border-none bg-slate-800"
                  referrerPolicy="no-referrer"
                  allow="autoplay"
                ></iframe>
              </div>
            ) : (
              /* Video stage */
              <>
                <div className="aspect-video w-full max-h-[330px] bg-slate-950 relative shadow-inner">
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
                    <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 font-mono text-xs bg-slate-950">
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
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-slate-50/50 relative w-full">
      {/* Backdrop overlay for floating sidebar to auto hide when clicking outside / side */}
      {autoHideEnabled && !sidebarLocked && sidebarVisible && !sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-transparent z-[80] cursor-pointer"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* PREMIUM LIGHT LEFT SIDEBAR CONSOLE (Trainee version) */}
      {sidebarVisible && (
        <aside 
          id="trainee-sidebar"
          className={`bg-white/95 border-r-2 border-slate-200 transition-all duration-300 z-[85] flex flex-col shrink-0 select-none bg-gradient-to-b from-white via-slate-50/50 to-slate-100/20 backdrop-blur-md shadow-[4px_0_24px_rgba(148,163,184,0.04)] ${
            sidebarCollapsed ? 'w-16' : 'w-[265px]'
          } ${
            sidebarLocked ? 'sticky top-14 lg:top-16 h-[calc(100vh-152px)] lg:h-[calc(100vh-104px)] font-sans' : 'fixed top-14 lg:top-16 left-0 bottom-[96px] lg:bottom-10 shadow-[0_10px_35px_rgba(148,163,184,0.12)] z-[90]'
          }`}
        >
          {/* Header area of sidebar */}
          <div className="p-3 border-b border-slate-200 flex items-center justify-between gap-2 bg-gradient-to-r from-emerald-50/20 via-teal-50/10 to-transparent">
            {!sidebarCollapsed ? (
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100 shrink-0">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                </span>
                <div className="min-w-0">
                  <h4 className="font-display text-[10.5px] font-black uppercase tracking-wider text-slate-800 truncate leading-tight">
                    Trainee Console
                  </h4>
                  <p className="text-[7.5px] text-slate-500 font-mono font-bold mt-0.5 truncate leading-none">
                    WORKSPACE PANEL
                  </p>
                </div>
              </div>
            ) : (
              <div className="mx-auto">
                <BookOpen className="w-4.5 h-4.5 text-emerald-500 animate-pulse" />
              </div>
            )}
            
            <div className={`flex items-center gap-0.5 shrink-0 ${sidebarCollapsed ? 'mx-auto hidden' : ''}`}>
              {/* Collapse Button */}
              <button
                type="button"
                onClick={() => setSidebarCollapsed(true)}
                title="Collapse Panel (Icons Mode)"
                className="text-slate-400 hover:text-emerald-650 hover:bg-emerald-50/60 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {/* Lock/Unlock Toggle */}
              <button
                type="button"
                onClick={() => {
                  setSidebarLocked(!sidebarLocked);
                }}
                title={sidebarLocked ? "Unlock/Float Sidebar" : "Lock Sidebar (Fixed Column)"}
                className={`p-1 rounded-lg transition-colors cursor-pointer ${
                  sidebarLocked ? 'text-emerald-650 text-emerald-600 bg-emerald-50' : 'text-slate-400 hover:text-emerald-650 hover:bg-emerald-50/60'
                }`}
              >
                {sidebarLocked ? <Pin className="w-3 h-3" /> : <PinOff className="w-3 h-3" />}
              </button>

              {/* Auto-Hide Toggle */}
              <button
                type="button"
                onClick={() => {
                  setAutoHideEnabled(!autoHideEnabled);
                  setToastMsg(autoHideEnabled ? "Auto-hide on outside click disabled" : "Auto-hide on outside click enabled");
                  setTimeout(() => setToastMsg(null), 3000);
                }}
                title={autoHideEnabled ? "Disable Auto-Hide on Outside Click" : "Enable Auto-Hide on Outside Click"}
                className={`p-1 rounded-lg transition-colors cursor-pointer ${
                  autoHideEnabled ? 'text-teal-650 text-teal-600 bg-teal-50 border border-teal-100' : 'text-slate-400 hover:text-teal-650 hover:bg-teal-50/60'
                }`}
              >
                <MousePointerClick className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Collapsed state Expand trigger */}
          {sidebarCollapsed && (
            <div className="py-2 flex justify-center border-b border-slate-100 bg-slate-50/20">
              <button
                type="button"
                onClick={() => setSidebarCollapsed(false)}
                title="Expand Panel"
                className="text-slate-400 hover:text-emerald-650 bg-white hover:bg-emerald-50 p-1.5 rounded-lg transition duration-200 cursor-pointer border border-slate-200"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Sidebar Nav Items List */}
          <div className="flex-1 p-3 space-y-2 overflow-y-auto custom-scrollbar">
            {[
              { id: 'learning', label: 'My Learning Path', icon: BookOpen, colorClass: 'text-emerald-600', bgClass: 'bg-emerald-50' },
              { id: 'exams', label: 'Final Competency Test', icon: Award, colorClass: 'text-indigo-600', bgClass: 'bg-indigo-50' },
              { id: 'testing', label: 'Only Testing', icon: Brain, colorClass: 'text-violet-600', bgClass: 'bg-violet-50' },
              { id: 'certificate', label: 'Mastery Certificate', icon: Award, colorClass: 'text-amber-600', bgClass: 'bg-amber-50' },
            ].map((t) => {
              const isTabActive = activeTab === t.id;
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    if (onChangeTab) onChangeTab(t.id);
                    if (!sidebarLocked) {
                      setSidebarCollapsed(true);
                    }
                  }}
                  className={`w-full group relative flex items-center gap-2.5 p-2 rounded-lg transition-all duration-200 text-left cursor-pointer border border-transparent ${
                    isTabActive 
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/15 font-bold scale-[1.01]' 
                      : 'hover:bg-slate-100/70 hover:text-slate-900 text-slate-655'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg shrink-0 transition-colors duration-200 ${
                    isTabActive ? 'bg-white/20 text-white' : `${t.bgClass} ${t.colorClass} border border-slate-100 group-hover:bg-white`
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {!sidebarCollapsed && (
                    <span className="text-[11px] font-extrabold tracking-wide truncate">
                      {t.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer of Sidebar */}
          {!sidebarCollapsed && (
            <div className="p-3 border-t border-slate-200 bg-slate-50/50 text-[8.5px] text-slate-500 font-mono space-y-1">
              <div className="flex justify-between gap-1.5">
                <span className="text-slate-400 font-semibold uppercase">TRAINEE:</span>
                <span className="text-slate-800 font-bold truncate max-w-[130px]">{currentUser.name}</span>
              </div>
              <div className="flex justify-between gap-1.5">
                <span className="text-slate-400 font-semibold uppercase">POSITION:</span>
                <span className="text-emerald-700 font-black truncate max-w-[130px]">{userRole?.name || 'Trainee'}</span>
              </div>
            </div>
          )}
        </aside>
      )}

      {/* Sleek Floating Toggle Button when Trainee Sidebar is fully hidden */}
      {!sidebarVisible && (
        <button 
          type="button"
          onClick={() => {
            setSidebarVisible(true);
          }}
          className="fixed left-5 top-24 z-50 bg-white hover:bg-emerald-50 border border-slate-200/80 p-3 rounded-2xl shadow-[0_12px_40px_rgba(148,163,184,0.18)] hover:scale-105 transition-all duration-300 cursor-pointer flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-800 hover:text-emerald-600"
        >
          <BookOpen className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
          <span>Open Workspace Panel</span>
        </button>
      )}

      {/* MAIN CONTENT AREA */}
      <div className={`flex-grow min-w-0 flex flex-col relative transition-all duration-300 lg:h-full lg:max-h-full lg:min-h-0 ${
        !sidebarLocked && sidebarVisible 
          ? (sidebarCollapsed ? 'pl-16' : 'pl-[265px]') 
          : ''
      }`}>
        <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-3 lg:py-4 lg:h-full lg:max-h-full lg:flex lg:flex-col lg:min-h-0 animate-in fade-in duration-350">
        
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

        {/* Modern, Highly Compact Welcome Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-3 pb-2.5 border-b border-slate-200/80">
          <div className="shrink-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h1 className="font-display text-base sm:text-lg lg:text-xl font-black text-slate-900 tracking-tight leading-none">
                Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-emerald-700">{currentUser.name}</span>
              </h1>
              <PremiumBadge userId={currentUser.id} userName={currentUser.name} roleId={currentUser.roleId} department={currentUser.department} size="sm" className="py-0.2 px-1 text-[7.5px]" />
            </div>
            
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">
              <span className="font-bold text-slate-700">{activeRoleView === 'all' ? 'All Assigned Roles' : userRole?.name}</span>
              <span className="mx-1 text-slate-300">|</span>
              <span>{currentUser.department}</span>
              <span className="mx-1 text-slate-300">|</span>
              <span className="text-emerald-600 font-bold bg-emerald-50 px-1 py-0.2 rounded text-[8.5px]">{currentUser.focusEntity}</span>
            </p>
          </div>

          {/* Unified Compact Scorecard Row aligned next to user details on the left */}
          <div className="flex flex-wrap items-center gap-2 flex-grow justify-start lg:justify-start lg:ml-5 lg:pl-5 lg:border-l lg:border-slate-200/80">
            {/* 1. Mastery Rate */}
            <div className="bg-white border border-slate-200/80 rounded-lg py-1 px-2.5 flex items-center gap-2 shadow-3xs transition-all duration-150 hover:border-emerald-200 hover:shadow-2xs h-9.5">
              <span className="p-1 bg-emerald-50 text-emerald-600 rounded-md shrink-0">
                <Award className="w-3.5 h-3.5" />
              </span>
              <div className="leading-tight">
                <div className="text-[7.5px] font-black text-slate-400 uppercase tracking-wider leading-none">MASTERY</div>
                <div className="text-[11px] font-black text-slate-900 font-mono mt-0.5 leading-none">{stats.masteryPercent}%</div>
              </div>
            </div>

            {/* 2. Overall Progress */}
            <div className="bg-white border border-slate-200/80 rounded-lg py-1 px-2.5 flex items-center gap-2 shadow-3xs transition-all duration-150 hover:border-indigo-200 hover:shadow-2xs h-9.5">
              <span className="p-1 bg-indigo-50 text-indigo-600 rounded-md shrink-0">
                <BookOpen className="w-3.5 h-3.5" />
              </span>
              <div className="leading-tight">
                <div className="text-[7.5px] font-black text-slate-400 uppercase tracking-wider leading-none">PROGRESS</div>
                <div className="text-[11px] font-black text-slate-900 font-mono mt-0.5 leading-none">{stats.overallPercent}%</div>
              </div>
            </div>

            {/* 3. Mastered Units */}
            <div className="bg-white border border-slate-200/80 rounded-lg py-1 px-2.5 flex items-center gap-2 shadow-3xs transition-all duration-150 hover:border-teal-200 hover:shadow-2xs h-9.5">
              <span className="p-1 bg-teal-50 text-teal-600 rounded-md shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
              <div className="leading-tight">
                <div className="text-[7.5px] font-black text-slate-400 uppercase tracking-wider leading-none">MASTERED</div>
                <div className="text-[11px] font-black text-slate-900 font-mono mt-0.5 leading-none">
                  {stats.verifiedCount}<span className="text-[9px] text-slate-450 font-semibold">/{stats.totalUnits}</span>
                </div>
              </div>
            </div>

            {/* 4. Pending Review */}
            <div className="bg-white border border-slate-200/80 rounded-lg py-1 px-2.5 flex items-center gap-2 shadow-3xs transition-all duration-150 hover:border-amber-200 hover:shadow-2xs h-9.5">
              <span className="p-1 bg-amber-50 text-amber-600 rounded-md shrink-0">
                <Clock className="w-3.5 h-3.5" />
              </span>
              <div className="leading-tight">
                <div className="text-[7.5px] font-black text-slate-400 uppercase tracking-wider leading-none">PENDING</div>
                <div className="text-[11px] font-black text-slate-900 font-mono mt-0.5 leading-none">{stats.completedCount}</div>
              </div>
            </div>

            {/* 5. In Progress */}
            <div className="bg-white border border-slate-200/80 rounded-lg py-1 px-2.5 flex items-center gap-2 shadow-3xs transition-all duration-150 hover:border-cyan-200 hover:shadow-2xs h-9.5">
              <span className="p-1 bg-cyan-50 text-cyan-600 rounded-md shrink-0">
                <Play className="w-3.5 h-3.5" />
              </span>
              <div className="leading-tight">
                <div className="text-[7.5px] font-black text-slate-400 uppercase tracking-wider leading-none">ACTIVE</div>
                <div className="text-[11px] font-black text-slate-900 font-mono mt-0.5 leading-none">{stats.inProgressCount}</div>
              </div>
            </div>

            {/* 6. Not Started */}
            <div className="bg-white border border-slate-200/80 rounded-lg py-1 px-2.5 flex items-center gap-2 shadow-3xs transition-all duration-150 hover:border-slate-300 hover:shadow-2xs h-9.5">
              <span className="p-1 bg-slate-50 text-slate-500 rounded-md shrink-0">
                <HelpCircle className="w-3.5 h-3.5" />
              </span>
              <div className="leading-tight">
                <div className="text-[7.5px] font-black text-slate-400 uppercase tracking-wider leading-none">LEFT</div>
                <div className="text-[11px] font-black text-slate-900 font-mono mt-0.5 leading-none">{stats.notStartedCount}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 select-none lg:self-center self-end">
            {/* Advanced Interactive Notification Center */}
            <div className="relative">
              <button
                type="button"
                id="notifications-bell-btn"
                onClick={() => setShowNotificationCenter(!showNotificationCenter)}
                className={`p-1.5 rounded-lg border transition-all duration-200 relative cursor-pointer flex items-center justify-center ${
                  showNotificationCenter
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-650 hover:text-slate-900'
                }`}
                aria-label="Notification Center"
                title="Notification Center"
              >
                <Bell className="w-3.5 h-3.5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[12px] h-[12px] bg-rose-600 text-[7px] font-black text-white rounded-full flex items-center justify-center border border-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Panel Box */}
              {showNotificationCenter && (
                <div className="absolute right-0 mt-2 z-40 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl p-0 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Header */}
                  <div className="bg-slate-50 border-b border-slate-100 px-4 py-2.5 flex items-center justify-between">
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
                            className={`p-2.5 transition flex gap-2.5 ${!isRead ? 'bg-emerald-50/30' : 'bg-white hover:bg-slate-50/40'}`}
                          >
                            <span className="text-xs shrink-0 mt-0.5 select-none">
                              {icon}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-1.5">
                                <p className={`text-[11px] font-bold leading-tight ${!isRead ? 'text-slate-900 font-extrabold' : 'text-slate-700'}`}>
                                  {notif.title}
                                </p>
                                <span className="text-[7.5px] font-mono font-bold text-slate-400 shrink-0">
                                  {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-[9.5px] text-slate-500 leading-normal mt-0.5">
                                {notif.message}
                              </p>
                              <div className="flex items-center gap-2 mt-1.5">
                                {!isRead && (
                                  <button
                                    type="button"
                                    onClick={() => handleMarkAsRead(notif.id)}
                                    className="text-[7.5px] font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-wider bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.2 rounded flex items-center gap-0.5 cursor-pointer"
                                  >
                                    <Check className="w-1.5 h-1.5" />
                                    Mark Read
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteNotif(notif.id)}
                                  className="text-[7.5px] font-black text-slate-400 hover:text-rose-600 uppercase tracking-wider hover:bg-rose-50 px-1.5 py-0.2 rounded flex items-center gap-0.5 cursor-pointer ml-auto"
                                >
                                  <Trash2 className="w-1.5 h-1.5" />
                                  Dismiss
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="bg-slate-50 border-t border-slate-100 px-3 py-1.5 text-center">
                    <p className="text-[8px] font-mono text-slate-400 uppercase">
                      Rathi's Build Mart • Training Compliance Console
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Syllabus Workspace & Compliance Audit Trail tab switcher integrated next to bell icon */}
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/60 shadow-3xs gap-0.5">
              <button
                type="button"
                onClick={() => setUserActiveTab('workspace')}
                className={`flex items-center gap-1.5 py-1 px-3 rounded-md text-[9px] font-black uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                  userActiveTab === 'workspace'
                    ? 'bg-white text-emerald-700 shadow-3xs border border-slate-200/10 font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <BookOpen className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                <span>Syllabus Workspace</span>
              </button>
              <button
                type="button"
                onClick={() => setUserActiveTab('audit')}
                className={`flex items-center gap-1.5 py-1 px-3 rounded-md text-[9px] font-black uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                  userActiveTab === 'audit'
                    ? 'bg-white text-indigo-700 shadow-3xs border border-slate-200/10 font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Database className="w-2.5 h-2.5 text-indigo-600 shrink-0" />
                <span>Compliance Audit Trail</span>
                <span className="px-1 py-0.2 text-[7.5px] bg-slate-200 text-slate-600 rounded font-mono font-bold">
                  {userUnits.length}
                </span>
              </button>
            </div>
          </div>
        </div>

        {userActiveTab === 'workspace' ? (
          <>
            {/* Super Compact Collapsible Dashboard Stats, Profile Switcher & Certificate Panel */}
            <div className="mb-3 bg-white hover:bg-slate-50/50 border border-slate-200 rounded-xl p-1.5 shadow-3xs transition duration-150">
              <div 
                onClick={() => setIsStatsExpanded(!isStatsExpanded)}
                className="flex items-center justify-between cursor-pointer select-none px-1"
              >
                <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                  <span className="p-1 bg-indigo-50 text-indigo-700 rounded-md shrink-0">
                    <BarChart3 className="w-3.5 h-3.5 text-indigo-650" />
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-700">
                    📊 Trainee Insights & Custom Profiles Console
                  </span>
                  {/* Quick summary badges to prevent scrolling but keep data visible */}
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-[8.5px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-100/60 px-1.5 py-0.2 rounded font-bold">
                      Mastery: {stats.masteryPercent}%
                    </span>
                    <span className="text-[8.5px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-100/50 px-1.5 py-0.2 rounded font-bold">
                      Units: {stats.completedCount + stats.verifiedCount}/{stats.totalUnits} Done
                    </span>
                    {assignedRoleIds.length > 1 && (
                      <span className="text-[8.5px] font-mono bg-amber-50 text-amber-700 border border-amber-100/50 px-1.5 py-0.2 rounded font-bold">
                        {activeRoleView === 'all' ? 'All Roles Combined' : `${userRole?.name}`}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <span className="text-[8.5px] font-bold uppercase tracking-wide text-indigo-600 hover:underline">
                    {isStatsExpanded ? 'Hide Console' : 'Expand Console'}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transform transition-transform duration-200 ${isStatsExpanded ? 'rotate-180' : ''}`} />
                </div>
              </div>

              <AnimatePresence>
                {isStatsExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden border-t border-slate-100 mt-1.5 pt-2 space-y-2.5"
                  >
                    {/* Unified Multi-Role Switcher Bar */}
                    <div className="p-2 bg-slate-50/50 border border-slate-150 rounded-lg flex flex-col justify-center w-full">
                      <div className="flex items-center gap-1 text-[7.5px] uppercase tracking-wider font-mono font-black text-indigo-650">
                        <span>🔄 CUSTOM MULTI-ROLE HUB SWITCHER</span>
                      </div>
                      {assignedRoleIds.length > 1 ? (
                        <div className="flex flex-wrap items-center gap-1 pt-1">
                          <button
                            onClick={() => setActiveRoleView('all')}
                            className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold transition duration-150 border cursor-pointer ${
                              activeRoleView === 'all'
                                ? 'bg-slate-900 text-white border-slate-900 shadow-3xs'
                                : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            All Roles Combined 🌐
                          </button>
                          {assignedRoles.map((role) => (
                            <button
                              key={role.id}
                              onClick={() => setActiveRoleView(role.id)}
                              className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold transition duration-150 border cursor-pointer ${
                                activeRoleView === role.id
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-3xs'
                                  : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                              }`}
                            >
                              {role.name}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Standard Assigned Profile: <strong className="text-slate-800">{userRole?.name || 'Trainee'}</strong>
                        </p>
                      )}
                    </div>

                    {/* Switcher details display inside console */}

                    {/* Analytics Insights (3 small cards) */}
                    {(() => {
                      const { nextUnit, lowestChapter, highestChapter } = getSyllabusInsights();
                      return (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-left">
                          {/* Next Recommended Task */}
                          <div className="bg-gradient-to-tr from-emerald-50/60 to-teal-50/20 border border-emerald-100 rounded-lg p-2 flex items-center justify-between shadow-3xs gap-2 min-h-[44px]">
                            <div className="min-w-0">
                              <span className="text-[7px] font-mono font-black uppercase bg-emerald-100 text-emerald-700 border border-emerald-200 px-1 py-0.2 rounded tracking-wider">
                                Next Recommended Task
                              </span>
                              {nextUnit ? (
                                <div className="mt-0.5">
                                  <h5 className="font-bold text-slate-900 text-[10px] leading-tight truncate">
                                    {nextUnit.code}: {nextUnit.taskName}
                                  </h5>
                                  <p className="text-[8px] text-slate-500 mt-0.5 leading-none">
                                    Freq: <strong>{nextUnit.frequency}</strong> · Diff: <strong>{nextUnit.skillRequired}</strong>
                                  </p>
                                </div>
                              ) : (
                                <p className="text-[8.5px] text-emerald-700 font-bold mt-0.5">
                                  🎉 All tasks fully mastered!
                                </p>
                              )}
                            </div>
                            {nextUnit && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedUnitId(nextUnit.id);
                                  setExpandedChapters(prev => ({ ...prev, [nextUnit.chapterId]: true }));
                                  if (window.innerWidth < 1024) {
                                    setMobileTab('player');
                                  }
                                  if (onChangeTab) onChangeTab('learning');
                                  setToastMsg(`🎯 Selected: ${nextUnit.code} to continue your workspace journey.`);
                                }}
                                className="bg-slate-900 hover:bg-slate-800 text-white font-black text-[8px] py-1 px-2 rounded transition-all uppercase tracking-wider flex items-center justify-center gap-0.5 cursor-pointer shrink-0 shadow-3xs"
                              >
                                <span>Start</span>
                                <span>➔</span>
                              </button>
                            )}
                          </div>

                          {/* Focus Area */}
                          <div className="bg-gradient-to-tr from-rose-50/60 to-amber-50/10 border border-rose-100 rounded-lg p-2 flex items-center justify-between shadow-3xs gap-2 min-h-[44px]">
                            <div className="min-w-0">
                              <span className="text-[7px] font-mono font-black uppercase bg-rose-100 text-rose-700 border border-rose-200 px-1 py-0.2 rounded tracking-wider">
                                Recommended Focus Area
                              </span>
                              {lowestChapter ? (
                                <div className="mt-0.5">
                                  <h5 className="font-bold text-slate-900 text-[10px] leading-tight truncate">
                                    {lowestChapter.name}
                                  </h5>
                                  <p className="text-[8px] text-slate-500 mt-0.5 leading-none">
                                    Mastery: <strong className="text-rose-650 font-mono">{lowestChapter.masteryRate}%</strong>
                                  </p>
                                </div>
                              ) : (
                                <p className="text-[8.5px] text-emerald-700 font-bold mt-0.5">
                                  ✨ 100% mastery rate achieved!
                                </p>
                              )}
                            </div>
                            {lowestChapter && (
                              <div className="w-12 shrink-0 text-right">
                                <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                                  <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${lowestChapter.masteryRate}%` }} />
                                </div>
                                <p className="text-[6px] text-slate-400 mt-0.5 font-mono leading-none">Target</p>
                              </div>
                            )}
                          </div>

                          {/* Highest Mastery */}
                          <div className="bg-gradient-to-tr from-indigo-50/60 to-blue-50/10 border border-indigo-100 rounded-lg p-2 flex items-center justify-between shadow-3xs gap-2 min-h-[44px]">
                            <div className="min-w-0">
                              <span className="text-[7px] font-mono font-black uppercase bg-indigo-100 text-indigo-700 border border-indigo-200 px-1 py-0.2 rounded tracking-wider">
                                Highest Mastery Chapter
                              </span>
                              {highestChapter ? (
                                <div className="mt-0.5">
                                  <h5 className="font-bold text-slate-900 text-[10px] leading-tight truncate">
                                    {highestChapter.name}
                                  </h5>
                                  <p className="text-[8px] text-slate-500 mt-0.5 leading-none">
                                    Mastery: <strong className="text-indigo-650 font-mono">{highestChapter.masteryRate}%</strong>
                                  </p>
                                </div>
                              ) : (
                                <p className="text-[8.5px] text-slate-400 italic mt-0.5">No chapters found.</p>
                              )}
                            </div>
                            {highestChapter && (
                              <div className="w-12 shrink-0 text-right">
                                <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                                  <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${highestChapter.masteryRate}%` }} />
                                </div>
                                <p className="text-[6px] text-indigo-600 font-bold mt-0.5 font-mono leading-none">Excellent!</p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Certificate Generator */}
                    <div className="bg-slate-50/30 p-1 rounded-lg border border-slate-150">
                      <CertificateGenerator
                        currentUser={currentUser}
                        userRole={userRole}
                        progress={progress}
                        stats={stats}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Combined Media Stage (PDF SOP Viewer & Video Player Switcher) */}
            {mobileTab === 'player' && renderCombinedMediaStage(true)}

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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:flex-1 lg:min-h-0">
          {/* Left Column: Premium Soft Light Curriculum Sidebar */}
          <div className={`lg:col-span-4 lg:h-full lg:max-h-full lg:flex lg:flex-col gap-3 min-h-0 ${mobileTab === 'syllabus' ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white text-slate-800 rounded-2xl border border-slate-200 shadow-3xs overflow-hidden select-none lg:flex lg:flex-col lg:flex-1 lg:min-h-0">
            {/* Sidebar Brand Header */}
            <div className="p-3.5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center font-display text-sm font-black text-white shadow-sm border border-emerald-400/20">
                  {branding?.companyName ? branding.companyName.charAt(0).toUpperCase() : 'B'}
                </div>
                <div>
                  <h3 className="font-display text-xs font-black text-slate-900 tracking-tight leading-tight">
                    {currentUser.focusEntity || branding?.companyName || "Rathi's Build Mart"}
                  </h3>
                  <p className="text-[9px] text-slate-500 font-mono font-semibold tracking-wider uppercase leading-none">
                    Learning Path Workspace
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse"></span>
                <span className="text-[8px] font-mono font-bold text-slate-600">{userChapters.length} Ch</span>
              </div>
            </div>

            {/* Sidebar Search & Schedule Filters */}
            <div className="p-4 border-b border-slate-200 bg-gradient-to-b from-slate-50/80 to-white space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search syllabus tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-7 py-2 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 outline-none transition-all duration-300 placeholder:text-slate-400 shadow-2xs hover:border-slate-350"
                />
                <span className="absolute left-2.5 top-2.5 text-xs text-slate-400">🔍</span>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1.5 text-slate-400 hover:text-slate-600 text-lg font-bold transition-colors cursor-pointer"
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
                    className={`px-3 py-1.5 text-[8.5px] uppercase tracking-wider font-extrabold rounded-lg border transition-all duration-200 shrink-0 cursor-pointer active:scale-95 ${
                      selectedFreqFilter === freq
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs shadow-emerald-600/20'
                        : 'bg-slate-50/50 hover:bg-slate-100/80 text-slate-500 hover:text-slate-800 border-slate-250/50'
                    }`}
                  >
                    {freq}
                  </button>
                ))}
              </div>
            </div>

            {/* Chapters and Stepper Timelines - Styled Sidebar List */}
            <div className="divide-y divide-slate-100 max-h-[380px] lg:max-h-none lg:flex-1 overflow-y-auto scrollbar-thin">
              {userChapters.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs italic p-6 font-mono">
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
                  
                  // Calculate chapter mastery percentage based on verified units
                  const verifiedUnitsInChapter = chapUnits.filter(u => {
                    const prog = getUnitProgress(u.id);
                    return prog && prog.status === 'Verified & Mastered';
                  }).length;
                  const chapMasteryPercent = chapUnits.length ? Math.round((verifiedUnitsInChapter / chapUnits.length) * 100) : 0;
                  const isUnlocked = checkIsChapterUnlocked(chapIdx);

                  // Cycle through nice sidebar icons for each chapter category
                  const getChapterIcon = () => {
                    if (!isUnlocked) return <Lock className="w-3.5 h-3.5" />;
                    switch (chapIdx % 4) {
                      case 0: return <BookOpen className="w-3.5 h-3.5 text-emerald-600" />;
                      case 1: return <FileText className="w-3.5 h-3.5 text-purple-500" />;
                      case 2: return <Award className="w-3.5 h-3.5 text-amber-500" />;
                      default: return <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />;
                    }
                  };

                  return (
                    <div key={chap.id} className="transition-all duration-300">
                      {/* Sidebar Chapter Accordion Title */}
                      <button
                        onClick={() => toggleChapter(chap.id, isUnlocked)}
                        type="button"
                        className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between transition-all duration-300 ${
                          isUnlocked 
                            ? isExpanded 
                              ? 'bg-slate-50/60 text-slate-850 cursor-pointer' 
                              : 'hover:bg-slate-50/50 cursor-pointer bg-transparent text-slate-700' 
                            : 'cursor-not-allowed bg-slate-50/30 text-slate-400'
                        }`}
                        id={`chapter-header-${chap.id}`}
                      >
                        <div className="flex items-start gap-2.5 min-w-0 flex-1 pr-2">
                          <div className={`mt-0.5 shrink-0 p-1 rounded-lg transition-all duration-350 ${
                            isUnlocked 
                              ? isExpanded 
                                ? 'bg-white shadow-3xs border border-slate-150 text-emerald-600'
                                : 'bg-slate-50 border border-transparent text-slate-600'
                              : 'text-slate-350 bg-slate-100'
                          }`}>
                            {getChapterIcon()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className={`text-[6.5px] font-mono font-black tracking-wider uppercase block leading-none mb-0.5 ${
                              isUnlocked ? 'text-emerald-700' : 'text-slate-400'
                            }`}>
                              CHAPTER {chapIdx + 1}
                              {!isUnlocked && " (LOCKED)"}
                            </span>
                            <h4 className="font-sans text-[9.5px] font-black text-slate-800 tracking-tight truncate leading-tight group-hover:text-slate-905">
                              {chap.name}
                            </h4>
                            
                            {isUnlocked && (
                              <div className="mt-0.5">
                                <div className="flex items-center justify-between text-[7.5px] font-mono text-emerald-700 font-bold mb-0.5">
                                  <span>{chapMasteryPercent}% Completed</span>
                                  <span className="text-slate-450 font-medium">{chapUnits.length} tasks</span>
                                </div>
                                <div className="w-full bg-slate-150 h-0.5 rounded-full overflow-hidden">
                                  <div 
                                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-700 ease-out"
                                    style={{ width: `${chapMasteryPercent}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-slate-400 hover:text-slate-600 transition-colors shrink-0 pl-1">
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
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className="bg-slate-50/20 border-t border-slate-100 overflow-hidden"
                          >
                            <div className="py-1 px-1.5 space-y-0.5 bg-gradient-to-b from-slate-50/30 to-white">
                              {chapUnits.map((unit) => {
                                const prog = getUnitProgress(unit.id);
                                const isSelected = selectedUnit?.id === unit.id;
                                
                                 return (
                                  <div
                                    key={unit.id}
                                    id={`unit-item-${unit.id}`}
                                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-all duration-300 border-l-[3px] outline-none select-none relative group cursor-pointer ${
                                      isSelected
                                        ? 'bg-gradient-to-r from-emerald-50/95 via-teal-50/20 to-white text-emerald-950 font-extrabold border-l-emerald-600 shadow-3xs border border-emerald-100/50'
                                        : 'hover:bg-slate-50 hover:-translate-y-[0.5px] hover:shadow-3xs text-slate-600 hover:text-slate-900 border-l-transparent border border-transparent'
                                    }`}
                                    onClick={() => {
                                      setSelectedUnitId(unit.id);
                                      setMobileTab('player');
                                      if (onChangeTab) onChangeTab('learning');
                                    }}
                                  >
                                    {/* Main info area */}
                                    <div className="flex items-center min-w-0 flex-1 pr-2">
                                      {/* Beautiful Indicators */}
                                      {isSelected ? (
                                        <div className="w-3.5 h-3.5 rounded-full border-2 border-emerald-600 flex items-center justify-center mr-2 shrink-0 bg-white shadow-2xs">
                                          <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 animate-pulse"></div>
                                        </div>
                                      ) : prog?.status === 'Verified & Mastered' ? (
                                        <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center mr-2 shrink-0 shadow-3xs">
                                          <Check className="w-2 h-2 stroke-[4px]" />
                                        </div>
                                      ) : prog?.status === 'Completed (Pending Review)' ? (
                                        <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center mr-2 shrink-0 shadow-3xs text-[7px] animate-pulse">
                                          ⏳
                                        </div>
                                      ) : prog?.status === 'In Progress' ? (
                                        <div className="w-3.5 h-3.5 rounded-full bg-blue-500 text-white flex items-center justify-center mr-2 shrink-0 text-[8px] font-black shadow-3xs">
                                          •
                                        </div>
                                      ) : (
                                        <div className="w-3.5 h-3.5 rounded-full border border-slate-300 group-hover:border-slate-450 mr-2 shrink-0 transition-all flex items-center justify-center bg-white" />
                                      )}

                                      <div className="min-w-0">
                                        <span className={`text-[7px] font-mono tracking-wider block mb-0.5 ${
                                          isSelected ? 'text-emerald-700 font-extrabold' : 'text-slate-400'
                                        }`}>
                                          {unit.code} · {unit.frequency}
                                        </span>
                                        <h5 className="text-[10px] font-bold leading-tight truncate">
                                          {unit.taskName}
                                        </h5>
                                      </div>
                                    </div>

                                    {/* Inline Status Badge */}
                                    {(() => {
                                      const statusVal = prog?.status || 'Not Started';
                                      return (
                                        <div className="shrink-0 flex items-center gap-1.5 z-10">
                                          <span
                                            className={`text-[7px] font-mono font-extrabold rounded px-1.5 py-0.2 border transition-all uppercase tracking-wide ${
                                              statusVal === 'Verified & Mastered'
                                                ? 'bg-emerald-50 border-emerald-100 text-emerald-800 shadow-3xs'
                                                : statusVal === 'Completed (Pending Review)'
                                                ? 'bg-amber-50 border-amber-150 text-amber-800 shadow-3xs'
                                                : statusVal === 'In Progress'
                                                ? 'bg-blue-50 border-blue-100 text-blue-800'
                                                : 'bg-slate-50 border-slate-200/60 text-slate-500'
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
                                <p className="px-5 py-3 text-[11px] text-slate-400 italic text-center font-mono">
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
          <div className="bg-white text-slate-600 rounded-2xl border border-slate-200 shadow-3xs p-3.5 space-y-2.5">
            <div className="flex items-center gap-2 text-slate-800">
              <CheckSquare className="w-4 h-4 text-emerald-600" />
              <h3 className="font-display text-xs font-extrabold uppercase tracking-tight">
                Execution Standings
              </h3>
            </div>
            <p className="text-[10px] text-slate-500 leading-normal font-sans">
              Complete each nested lesson sequentially to unlock subsequent workspace chapters. Keep track of your verification statuses.
            </p>

             <div className="grid grid-cols-2 gap-2.5 pt-1">
               <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-center">
                 <span className="block text-[7.5px] font-mono text-slate-400 uppercase tracking-wider">Mastered</span>
                 <span className="text-xs font-mono font-bold text-emerald-700">{stats.verifiedCount} / {stats.totalUnits}</span>
               </div>
               <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-center">
                 <span className="block text-[7.5px] font-mono text-slate-400 uppercase tracking-wider">Pending Review</span>
                 <span className="text-xs font-mono font-bold text-amber-600">{stats.completedCount}</span>
               </div>
             </div>
          </div>
        </div>

        {/* Right Column: Player & Active Details (8/12 cols) */}
        <div className={`lg:col-span-8 lg:h-full lg:max-h-full lg:flex lg:flex-col gap-3 min-h-0 ${mobileTab === 'player' ? 'block' : 'hidden lg:block'}`}>
          {activeTab === 'learning' ? (
            selectedUnit ? (
            <div className="lg:flex-1 lg:min-h-0 lg:flex lg:flex-col gap-3 animate-in fade-in duration-200">
              
              {/* Core Unit Workspace Header Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-2.5 shadow-3xs shrink-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-100 pb-1.5 mb-1.5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="inline-block text-[7px] font-mono font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.2 rounded uppercase tracking-wider">
                        {selectedUnit.code}
                      </span>
                    </div>
                    <h3 className="font-display text-xs sm:text-sm font-black text-slate-900 tracking-tight leading-tight truncate">
                      {selectedUnit.taskName}
                    </h3>
                  </div>
                  
                  {/* Modern Status Pill */}
                  <div className="shrink-0 self-start sm:self-auto">
                    <span className={`px-2 py-0.5 rounded-md text-[8.5px] sm:text-[9px] font-mono font-extrabold tracking-wide border ${
                      getStatusColor(getUnitProgress(selectedUnit.id)?.status)
                    }`}>
                      {getStatusLabelText(getUnitProgress(selectedUnit.id)?.status)}
                    </span>
                  </div>
                </div>

                {/* Highly Compact Metadata Row (1 single line) */}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 py-0.5 text-[8.5px] text-slate-500 border-b border-slate-100 pb-1 mb-1">
                  <div className="flex items-center gap-1">
                    <span className="text-[7px] text-slate-400 font-mono uppercase font-bold tracking-wider">Schedule:</span>
                    <span className="font-bold text-slate-800">{selectedUnit.frequency}</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                  <div className="flex items-center gap-1">
                    <span className="text-[7px] text-slate-400 font-mono uppercase font-bold tracking-wider">Required Skill:</span>
                    <span className="font-bold text-slate-800 block truncate max-w-[120px]">{selectedUnit.skillRequired}</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                  <div className="flex items-center gap-1">
                    <span className="text-[7px] text-slate-400 font-mono uppercase font-bold tracking-wider">Standard:</span>
                    <span className="font-bold text-slate-800">Dual Verification</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                  <div className="flex items-center gap-1">
                    <span className="text-[7px] text-slate-400 font-mono uppercase font-bold tracking-wider">Scope:</span>
                    <span className="font-bold text-emerald-600">Active Master</span>
                  </div>
                </div>

                <p className="text-[9.5px] text-slate-500 leading-tight font-sans font-medium">
                  {selectedUnit.description}
                </p>
              </div>

              {/* Desktop Combined Media Stage (PDF SOP Viewer & Video Player Switcher) */}
              <div className="shrink-0">
                {renderCombinedMediaStage(false)}
              </div>

              {/* Unified SOP Checklist & Progress Sign-Off Panel */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-3xs p-3 lg:flex-1 lg:min-h-0 lg:flex lg:flex-col justify-between">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 divide-y md:divide-y-0 md:divide-x divide-slate-150 lg:flex-1 lg:min-h-0">
                  
                  {/* Left Column: SOP Checklist (7/12 cols) */}
                  <div className="md:col-span-7 pr-0 md:pr-3.5 space-y-2 lg:flex lg:flex-col lg:min-h-0">
                    <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-100 shrink-0">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <h4 className="text-[10px] font-sans font-extrabold text-slate-900 uppercase tracking-tight">
                          SOP Checklist & Best Practices
                        </h4>
                      </div>
                      <span className="text-[7.5px] font-sans text-slate-400 italic">
                        (Check items to confirm audit compliance)
                      </span>
                    </div>

                    <ul className="text-[10px] text-slate-600 space-y-1 max-h-[140px] lg:max-h-none lg:flex-1 overflow-y-auto scrollbar-thin pr-1">
                      {getSopItemsForUnit(selectedUnit).map((item, index) => {
                        const isItemChecked = getSopStatus(selectedUnit.id)[index];
                        return (
                          <li 
                            key={index}
                            onClick={() => handleToggleSop(index)}
                            className={`flex items-start gap-2 leading-tight cursor-pointer p-1.5 rounded-lg border transition-all duration-150 select-none ${
                              isItemChecked 
                                ? 'bg-emerald-50/20 border-emerald-100/70 text-slate-700' 
                                : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 text-slate-600'
                            }`}
                          >
                            <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-all duration-150 ${
                              isItemChecked 
                                ? 'bg-emerald-500 border-emerald-600 text-white' 
                                : 'bg-white border-slate-300 text-transparent hover:border-emerald-400'
                            }`}>
                              <span className="text-[8px] font-black">✓</span>
                            </span>
                            <span className="flex-1 min-w-0">
                              <strong className={`font-bold font-sans ${isItemChecked ? 'text-emerald-800' : 'text-slate-800'}`}>
                                {item.title}:
                              </strong>{" "}
                              <span className={`text-[9.5px] ${isItemChecked ? 'text-slate-400 line-through' : 'text-slate-500'}`}>
                                {item.desc}
                              </span>
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* Right Column: Sign-Off Workflow (5/12 cols) */}
                  <div className="md:col-span-5 pt-3 md:pt-0 pl-0 md:pl-3.5 flex flex-col justify-between space-y-2 lg:min-h-0">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 shrink-0">
                        <div className="flex items-center gap-1">
                          <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                          <h4 className="font-display text-[10px] font-extrabold text-slate-900 uppercase tracking-tight">
                            Sign-Off Workflow
                          </h4>
                        </div>
                      </div>

                      {toastMsg && (
                        <div className="p-1 px-2 bg-emerald-50 rounded-md border border-emerald-100 text-[8.5px] text-emerald-800 font-bold flex items-center gap-1.5 animate-in slide-in-from-top-1 duration-150 shrink-0">
                          <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>{toastMsg}</span>
                        </div>
                      )}

                      {getUnitProgress(selectedUnit.id)?.status === 'Verified & Mastered' ? (
                        <div className="bg-emerald-50/30 rounded-lg p-1 border border-emerald-100/50 text-[8.5px] text-emerald-800 shrink-0">
                          <p className="font-bold flex items-center gap-1 text-emerald-800">
                            ✓ Task Verified & Mastered!
                          </p>
                        </div>
                      ) : getUnitProgress(selectedUnit.id)?.status === 'Completed (Pending Review)' ? (
                        <div className="bg-amber-50/30 rounded-lg p-1 border border-amber-100/50 text-[8.5px] text-amber-800 shrink-0">
                          <p className="font-bold flex items-center gap-1 text-amber-800">
                            ⏳ Completed (Pending Review)
                          </p>
                        </div>
                      ) : null}

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-1">
                          <label className="block text-[8px] text-slate-400 uppercase font-mono font-bold tracking-wider">
                            Status
                          </label>
                          <select
                            value={submittingStatus}
                            onChange={(e) => setSubmittingStatus(e.target.value as ProgressStatus)}
                            className="bg-slate-50 border border-slate-200 rounded py-0.5 px-1.5 text-[9.5px] text-slate-700 font-bold focus:bg-white focus:border-emerald-500 outline-none transition-all cursor-pointer"
                          >
                            <option value="Not Started">Not Started</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed (Pending Review)">Completed (Review)</option>
                            <option value="Verified & Mastered">Verified & Mastered</option>
                          </select>
                        </div>

                        <div className="space-y-0.5">
                          <label className="block text-[8px] text-slate-400 uppercase font-mono font-bold tracking-wider">
                            Compliance Observations / Notes
                          </label>
                          <textarea
                            placeholder="Observations or bookkeeping details..."
                            value={submissionNotes}
                            onChange={(e) => setSubmissionNotes(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded p-1 px-1.5 text-[9.5px] text-slate-700 outline-none focus:bg-white focus:border-emerald-500 min-h-[30px] lg:min-h-[40px] max-h-[50px] transition-all leading-snug"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleSubmitProgress}
                      id="user-submit-progress-btn"
                      className="w-full bg-slate-900 hover:bg-slate-950 text-white font-extrabold py-1.5 px-3 rounded-lg shadow-3xs transition-all text-[10px] flex items-center justify-center gap-1 cursor-pointer shrink-0"
                    >
                      Update Progress Record
                    </button>
                  </div>

                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 font-sans shadow-sm">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-bold">No Unit Selected</p>
              <p className="text-xs text-slate-400 mt-1">Please select an accounting training unit from the curriculum path on the left.</p>
            </div>
          )) : activeTab === 'exams' ? (
          <AssessmentCenter
            currentUser={currentUser}
            chapterId={selectedExamChapterId}
            onBackToDashboard={() => {
              if (setSelectedExamChapterId) setSelectedExamChapterId(null);
              if (onChangeTab) onChangeTab('learning');
            }}
            onAttemptSaved={onAttemptSaved || (() => {})}
          />
        ) : activeTab === 'testing' ? (
          <ScreeningTest
            currentUser={currentUser}
            onAttemptSaved={onAttemptSaved || (() => {})}
          />
        ) : activeTab === 'certificate' ? (
          <div id="standalone-certificate-tab" className="flex flex-col gap-6 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <h3 className="font-display text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2 mb-2">
                <span className="text-2xl">📜</span>
                Mastery Certificate Workspace
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mb-8 font-sans">
                Track your completion progress and download your official {branding?.companyName || 'Rathi Buildmart'} Corporate Learning Academy Certificate of Mastery.
              </p>

              {certProgressStats && (
                <CertificateGenerator
                  currentUser={currentUser}
                  userRole={certUserRole}
                  progress={progress}
                  stats={certProgressStats}
                  onStartFinalExam={() => {
                    if (setSelectedExamChapterId) setSelectedExamChapterId(null);
                    if (onChangeTab) onChangeTab('exams');
                  }}
                />
              )}
            </div>
          </div>
        ) : null}
      </div>

      </div>
          </>
        ) : (
          /* 📊 ENTERPRISE TRAINING COMPLIANCE LOGBOOK & SUMMARY REPORT */
          <div className="mt-4 bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 animate-in fade-in duration-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 text-[8.5px] uppercase font-mono font-bold tracking-wider">
                Audit Trail
              </span>
              <p className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-widest">
                Real-time Sync
              </p>
            </div>
            <h4 className="font-display text-base sm:text-lg font-bold text-slate-950 mt-1">
              📋 Syllabus Compliance & Progress Summary Report
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed font-sans">
              Complete chronological ledger of task interactions, start dates, and master verifications.
            </p>
          </div>

          {/* Filter pills inside report */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-1">
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
                  className={`px-2 py-1 rounded-md border text-[9px] font-bold font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    reportStatusFilter === statusFilter
                      ? 'bg-slate-900 border-slate-900 text-white shadow-3xs'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100'
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
            <div className="overflow-hidden border border-slate-150 rounded-xl bg-white shadow-3xs">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-150">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th scope="col" className="px-3.5 py-2 text-left text-[9.5px] font-display font-extrabold uppercase tracking-wider text-slate-800">
                        Task / Syllabus Unit
                      </th>
                      <th scope="col" className="px-3.5 py-2 text-left text-[9.5px] font-display font-extrabold uppercase tracking-wider text-slate-800">
                        Started On
                      </th>
                      <th scope="col" className="px-3.5 py-2 text-left text-[9.5px] font-display font-extrabold uppercase tracking-wider text-slate-800">
                        Completed On
                      </th>
                      <th scope="col" className="px-3.5 py-2 text-left text-[9.5px] font-display font-extrabold uppercase tracking-wider text-slate-800">
                        Current Status
                      </th>
                      <th scope="col" className="px-3.5 py-2 text-center text-[9.5px] font-display font-extrabold uppercase tracking-wider text-slate-800 w-32">
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
                            <td className="px-3.5 py-1.5">
                              <div className="flex items-center gap-2.5">
                                <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold font-mono ${
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
                                  <p className="text-[9.5px] mt-0.5 text-slate-400">
                                    Category: Chapter {chapters.find(c => c.id === u.chapterId)?.name || '—'} · {u.frequency} Schedule
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-3.5 py-1.5 text-xs font-mono text-slate-600">
                              {p?.startedAt ? (
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-blue-500 shrink-0" />
                                  <span>{formatDate(p.startedAt)}</span>
                                </div>
                              ) : (
                                <span className="text-slate-350">—</span>
                              )}
                            </td>
                            <td className="px-3.5 py-1.5 text-xs font-mono text-slate-600">
                              {p?.completedAt ? (
                                <div className="flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                                  <span>{formatDate(p.completedAt)}</span>
                                </div>
                              ) : (
                                <span className="text-slate-350">—</span>
                              )}
                            </td>
                            <td className="px-3.5 py-1.5">
                              <span className={`inline-block px-1.5 py-0.2 rounded text-[8px] font-bold font-mono tracking-wide border uppercase ${
                                getStatusColor(status)
                              }`}>
                                {getStatusLabelText(status)}
                              </span>
                            </td>
                            <td className="px-3.5 py-1.5 text-center">
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
                              <td colSpan={5} className="px-3.5 py-3.5 bg-slate-50/70 border-t border-slate-150">
                                <div className="max-w-4xl mx-auto space-y-2.5">
                                  <h6 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                    <span>📜 Action Log & Audit History trail for {u.code}</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                                  </h6>
                                  
                                  {p?.history && p.history.length > 0 ? (
                                    <div className="relative border-l border-slate-200 ml-3 mt-2.5 space-y-3.5">
                                      {p.history.map((h, hIdx) => (
                                        <div key={hIdx} className="relative pl-6">
                                          {/* Colored bullet reflecting historical status transition page */}
                                          <div className={`absolute -left-1.5 top-1 w-2.5 h-2.5 rounded-full border border-white ${
                                            h.status === 'Verified & Mastered'
                                              ? 'bg-emerald-500 shadow-[0_0_6px_#10b981]'
                                              : h.status === 'Completed (Pending Review)'
                                              ? 'bg-amber-500 shadow-[0_0_6px_#f59e0b]'
                                              : h.status === 'In Progress'
                                              ? 'bg-blue-500 shadow-[0_0_6px_#3b82f6]'
                                              : 'bg-slate-400'
                                          }`} />
                                          
                                          <div className="text-xs bg-white border border-slate-200/85 rounded-xl p-2.5 shadow-3xs max-w-2xl">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-1.5 mb-1.5">
                                              <div className="flex items-center gap-2">
                                                <span className="font-bold text-slate-800 text-[10px]">
                                                  {h.changedBy} updated Status to:
                                                </span>
                                                <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold font-mono tracking-wide ${
                                                  getStatusColor(h.status)
                                                }`}>
                                                  {getStatusLabelText(h.status)}
                                                </span>
                                              </div>
                                              <span className="text-[9px] text-slate-400 font-mono">
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
        )}

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
    </div>
  );
}
