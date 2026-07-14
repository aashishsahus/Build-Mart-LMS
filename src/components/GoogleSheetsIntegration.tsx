/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '../data/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { 
  FileSpreadsheet, 
  RefreshCw, 
  ArrowUpRight, 
  Check, 
  AlertCircle, 
  HelpCircle, 
  Download, 
  Upload, 
  Database, 
  UserCheck, 
  LogOut, 
  Layers 
} from 'lucide-react';
import { User, Role, Chapter, Unit, ProgressLog } from '../types';
import { calculateUserProgress } from '../data/stateManager';

interface GoogleSheetsIntegrationProps {
  users: User[];
  roles: Role[];
  chapters: Chapter[];
  units: Unit[];
  progress: ProgressLog[];
  onUpdateChapters: (updatedChapters: Chapter[]) => void;
  onUpdateUnits: (updatedUnits: Unit[]) => void;
  showToast: (text: string, type: 'success' | 'info' | 'error') => void;
}

export default function GoogleSheetsIntegration({
  users,
  roles,
  chapters,
  units,
  progress,
  onUpdateChapters,
  onUpdateUnits,
  showToast
}: GoogleSheetsIntegrationProps) {
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Sheet creation states
  const [isExportingLedger, setIsExportingLedger] = useState(false);
  const [isExportingTimeline, setIsExportingTimeline] = useState(false);
  const [createdSpreadsheetId, setCreatedSpreadsheetId] = useState<string | null>(null);
  const [createdSpreadsheetUrl, setCreatedSpreadsheetUrl] = useState<string | null>(null);
  
  // Sheet import states
  const [importUrl, setImportUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [showFaq, setShowFaq] = useState(false);

  // Restore session token if user is signed into Firebase with Google Provider
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = auth.onAuthStateChanged(async (user: any) => {
      if (user) {
        // If logged in via Google, fetch current cached token if available
        const providerData = user.providerData || [];
        const isGoogle = providerData.some((p: any) => p.providerId === 'google.com');
        if (isGoogle) {
          setGoogleUser({
            name: user.displayName || user.email || 'Google User',
            email: user.email,
            avatarUrl: user.photoURL || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80`
          });
          // Access token will require popup sign-in first or we can get it from session
          const savedToken = sessionStorage.getItem('g_sheets_token');
          if (savedToken) {
            setAccessToken(savedToken);
          }
        }
      } else {
        setGoogleUser(null);
        setAccessToken(null);
        sessionStorage.removeItem('g_sheets_token');
      }
    });
    return () => unsubscribe();
  }, []);

  const handleConnect = async () => {
    if (!auth) {
      showToast("Firebase Authentication is not initialized or operates in placeholder mode.", "error");
      return;
    }
    setIsConnecting(true);
    try {
      const provider = new GoogleAuthProvider();
      // Add the requested Google Sheets and Drive file scopes
      provider.addScope('https://www.googleapis.com/auth/spreadsheets');
      provider.addScope('https://www.googleapis.com/auth/drive.file');
      
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      
      if (!token) {
        throw new Error("Could not acquire Google Sheets access token from login.");
      }
      
      setAccessToken(token);
      sessionStorage.setItem('g_sheets_token', token);
      
      setGoogleUser({
        name: result.user.displayName || result.user.email || 'Google User',
        email: result.user.email,
        avatarUrl: result.user.photoURL || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80`
      });
      
      showToast("✓ Successfully connected to your Google Workspace Account!", "success");
    } catch (err: any) {
      console.error(err);
      showToast(`Connection failed: ${err.message || err}`, "error");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      if (auth) {
        await signOut(auth);
      }
      setAccessToken(null);
      setGoogleUser(null);
      setCreatedSpreadsheetId(null);
      setCreatedSpreadsheetUrl(null);
      sessionStorage.removeItem('g_sheets_token');
      showToast("Disconnected Google Sheets Workspace session cleanly.", "info");
    } catch (err: any) {
      showToast("Error during disconnect: " + err.message, "error");
    }
  };

  // 1. Export Compliance Ledger to Google Sheet
  const handleExportComplianceLedger = async () => {
    if (!accessToken) {
      showToast("Please connect your Google Workspace Account first.", "error");
      return;
    }
    
    const confirmExport = window.confirm("Create a live Google Spreadsheet with the Compliance Audit Ledger?");
    if (!confirmExport) return;

    setIsExportingLedger(true);
    setCreatedSpreadsheetId(null);
    setCreatedSpreadsheetUrl(null);

    try {
      // Map rows exactly like the high quality table mapping
      const mappedRows = users.map(u => {
        const stats = calculateUserProgress(u.id, u.roleId);
        const r = roles.find(rl => rl.id === u.roleId);
        return [
          u.name,
          u.email,
          r ? r.name : 'Unknown Position',
          u.department,
          stats.totalUnits,
          stats.verifiedCount,
          stats.inProgressCount,
          `${stats.overallPercent}%`,
          `${stats.masteryPercent}%`,
          stats.masteryPercent === 100 ? 'Certified Compliant' : 'In Training'
        ];
      });

      const headers = [
        "Staffer Name", 
        "Email Address", 
        "Designation / Role", 
        "Department / Division", 
        "Assigned Total Units", 
        "Verified & Mastered Units", 
        "In Progress Units", 
        "Overall Lesson Progress", 
        "Curriculum Mastery Percent", 
        "Group Compliance Status"
      ];

      const sheetData = [headers, ...mappedRows];

      // Step A: Create a brand new Spreadsheet via Google Sheets API
      const timestamp = new Date().toLocaleDateString();
      const createRes = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          properties: {
            title: `Rathi Build Mart - LMS Compliance Report (${timestamp})`
          }
        })
      });

      if (!createRes.ok) {
        const errorData = await createRes.json();
        throw new Error(errorData?.error?.message || "Failed to create Google Spreadsheet.");
      }

      const spreadsheet = await createRes.json();
      const spreadsheetId = spreadsheet.spreadsheetId;
      const spreadsheetUrl = spreadsheet.spreadsheetUrl;

      // Step B: Write rows into Sheet1
      const writeRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1?valueInputOption=USER_ENTERED`, 
        {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            range: "Sheet1!A1",
            majorDimension: "ROWS",
            values: sheetData
          })
        }
      );

      if (!writeRes.ok) {
        const errorData = await writeRes.json();
        throw new Error(errorData?.error?.message || "Failed to populate Spreadsheet values.");
      }

      setCreatedSpreadsheetId(spreadsheetId);
      setCreatedSpreadsheetUrl(spreadsheetUrl);
      showToast("🟢 Live Google Sheet exported and formatted cleanly!", "success");
    } catch (err: any) {
      console.error(err);
      showToast(`Export failed: ${err.message || err}`, "error");
    } finally {
      setIsExportingLedger(false);
    }
  };

  // 2. Export Curriculum / Units list to Google Sheet
  const handleExportCurriculum = async () => {
    if (!accessToken) {
      showToast("Please connect your Google Workspace Account first.", "error");
      return;
    }

    const confirmExport = window.confirm("Export the current active curriculum database to a Google Spreadsheet?");
    if (!confirmExport) return;

    setIsExportingTimeline(true);

    try {
      const mappedRows = units.map((u, idx) => {
        const ch = chapters.find(c => c.id === u.chapterId);
        const r = roles.find(rl => rl.id === ch?.roleId);
        return [
          idx + 1,
          r ? r.name : 'All Roles',
          ch ? ch.name : 'General Walkthroughs',
          u.code,
          u.taskName,
          u.frequency,
          u.skillRequired,
          u.videoTitle,
          u.videoUrl,
          u.description
        ];
      });

      const headers = [
        "S.No",
        "Target Role Designation",
        "SOP Curriculum Chapter",
        "Task Unit Code",
        "walkthrough Task Name",
        "Frequency Rate",
        "Skill Difficulty Level",
        "walkthrough video Title",
        "Walkthrough YouTube Embed link",
        "SOP Core Description Summary"
      ];

      const sheetData = [headers, ...mappedRows];

      const createRes = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          properties: {
            title: `Rathi Build Mart - SOP Curriculum Database`
          }
        })
      });

      if (!createRes.ok) {
        throw new Error("Failed to create Google Spreadsheet for Curriculum.");
      }

      const spreadsheet = await createRes.json();
      const spreadsheetId = spreadsheet.spreadsheetId;
      const spreadsheetUrl = spreadsheet.spreadsheetUrl;

      const writeRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1?valueInputOption=USER_ENTERED`, 
        {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            range: "Sheet1!A1",
            majorDimension: "ROWS",
            values: sheetData
          })
        }
      );

      if (!writeRes.ok) {
        throw new Error("Failed to populate curriculum values.");
      }

      setCreatedSpreadsheetId(spreadsheetId);
      setCreatedSpreadsheetUrl(spreadsheetUrl);
      showToast("🟢 Live Google Sheet exported for SOP Curriculum Database!", "success");
    } catch (err: any) {
      console.error(err);
      showToast(`Export failed: ${err.message || err}`, "error");
    } finally {
      setIsExportingTimeline(false);
    }
  };

  // 3. Import & Synchronize Curriculum chapters / units from a live Google Sheet
  const handleImportCurriculum = async () => {
    if (!accessToken) {
      showToast("Please connect your Google Workspace Account first.", "error");
      return;
    }
    if (!importUrl.trim()) {
      showToast("Please enter a valid Google Spreadsheet URL.", "error");
      return;
    }

    // Extract spreadsheetId from URL
    const idRegex = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
    const match = importUrl.match(idRegex);
    if (!match || !match[1]) {
      showToast("Unable to extract Spreadsheet ID. Check the URL format.", "error");
      return;
    }

    const spreadsheetId = match[1];
    
    const confirmImport = window.confirm(
      "Warning: Importing a curriculum sheet will parse and integrate chapters and units into your workspace database. Proceed?"
    );
    if (!confirmImport) return;

    setIsImporting(true);

    try {
      // Fetch sheet A1:J100
      const fetchRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:J100`, 
        {
          headers: {
            "Authorization": `Bearer ${accessToken}`
          }
        }
      );

      if (!fetchRes.ok) {
        throw new Error("Could not find or read 'Sheet1' in this spreadsheet. Check sharing permissions and ensure sheet is named 'Sheet1'.");
      }

      const data = await fetchRes.ok ? await fetchRes.json() : null;
      if (!data || !data.values || data.values.length < 2) {
        throw new Error("Spreadsheet is empty or lacks rows under headers.");
      }

      const rows = data.values;
      const headers = rows[0].map((h: string) => h.toLowerCase().trim());

      // Find column indices dynamically
      const roleIndex = headers.findIndex((h: string) => h.includes("role") || h.includes("designation"));
      const chapterIndex = headers.findIndex((h: string) => h.includes("chapter") || h.includes("sop"));
      const codeIndex = headers.findIndex((h: string) => h.includes("code") || h.includes("unit"));
      const taskIndex = headers.findIndex((h: string) => h.includes("task") || h.includes("name"));
      const freqIndex = headers.findIndex((h: string) => h.includes("frequency") || h.includes("rate"));
      const skillIndex = headers.findIndex((h: string) => h.includes("skill") || h.includes("level"));
      const videoTitleIndex = headers.findIndex((h: string) => h.includes("video") || h.includes("title"));
      const videoUrlIndex = headers.findIndex((h: string) => h.includes("url") || h.includes("embed") || h.includes("link"));
      const descIndex = headers.findIndex((h: string) => h.includes("description") || h.includes("summary"));

      if (chapterIndex === -1 || taskIndex === -1) {
        throw new Error("Syllabus import requires at least 'Chapter' and 'Task Name' columns.");
      }

      // Arrays to accumulate new chapters and units
      const importedChapters: Chapter[] = [...chapters];
      const importedUnits: Unit[] = [...units];

      let addedChaptersCount = 0;
      let addedUnitsCount = 0;

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;

        const chapterName = row[chapterIndex]?.trim();
        const taskName = row[taskIndex]?.trim();
        if (!chapterName || !taskName) continue;

        // Extract values
        const targetRoleName = roleIndex !== -1 ? row[roleIndex]?.trim() : 'All Roles';
        const unitCode = codeIndex !== -1 ? row[codeIndex]?.trim() : `SOP-CH-${i}`;
        const freq = freqIndex !== -1 ? row[freqIndex]?.trim() : 'Weekly';
        const skill = skillIndex !== -1 ? row[skillIndex]?.trim() : 'Intermediate';
        const videoTitle = videoTitleIndex !== -1 ? row[videoTitleIndex]?.trim() : `${taskName} Walkthrough`;
        const videoUrl = videoUrlIndex !== -1 ? row[videoUrlIndex]?.trim() : 'https://www.youtube.com/embed/dQw4w9WgXcQ';
        const description = descIndex !== -1 ? row[descIndex]?.trim() : `Standard operational walkthrough for mastering ${taskName}.`;

        // Resolve matching role
        let mappedRoleId = 'role_jr_acc'; // Fallback
        const matchedRole = roles.find(rl => rl.name.toLowerCase().includes(targetRoleName.toLowerCase()) || rl.id.toLowerCase() === targetRoleName.toLowerCase());
        if (matchedRole) {
          mappedRoleId = matchedRole.id;
        }

        // 1. Ensure chapter exists
        let existingChapter = importedChapters.find(ch => ch.name.toLowerCase() === chapterName.toLowerCase() && ch.roleId === mappedRoleId);
        if (!existingChapter) {
          existingChapter = {
            id: `chapter_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            roleId: mappedRoleId,
            name: chapterName,
            order: importedChapters.filter(ch => ch.roleId === mappedRoleId).length + 1
          };
          importedChapters.push(existingChapter);
          addedChaptersCount++;
        }

        // 2. Ensure unit doesn't duplicate code
        const existingUnit = importedUnits.find(un => un.code.toLowerCase() === unitCode.toLowerCase() && un.chapterId === existingChapter!.id);
        if (!existingUnit) {
          importedUnits.push({
            id: `unit_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            chapterId: existingChapter.id,
            code: unitCode,
            taskName: taskName,
            frequency: (freq === 'Daily' || freq === 'Weekly' || freq === 'Monthly' || freq === 'Quarterly' || freq === 'Ad-hoc') ? freq : 'Weekly',
            skillRequired: (skill === 'Beginner' || skill === 'Intermediate' || skill === 'Advanced') ? skill : 'Intermediate',
            videoTitle: videoTitle,
            videoUrl: videoUrl,
            description: description,
            sopItems: [
              { title: "Review Standard Formats", desc: "Always confirm documentation format layout before signing off." },
              { title: "Verify Trial Balances", desc: "Cross reference ledger records with local enterprise summaries." }
            ]
          });
          addedUnitsCount++;
        }
      }

      onUpdateChapters(importedChapters);
      onUpdateUnits(importedUnits);
      setImportUrl('');

      showToast(`🏆 Successfully synchronized! Added ${addedChaptersCount} Chapters & ${addedUnitsCount} Units into local databases.`, "success");
    } catch (err: any) {
      console.error(err);
      showToast(`Import failed: ${err.message || err}`, "error");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-emerald-950/20 to-slate-900/40 border border-emerald-500/15 rounded-2xl p-5 shadow-xs">
      {/* Header and Branding */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-emerald-500/10 pb-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 rounded-xl border border-emerald-500/20 shadow-3xs">
            <FileSpreadsheet className="w-5 h-5 animate-pulse" />
          </div>
          <div className="text-left">
            <h3 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5 font-sans uppercase tracking-wider">
              <span>Google Sheets & Sync Hub</span>
              <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 text-[8px] font-mono px-1.5 py-0.2 rounded font-black tracking-wide">OAuth Enabled</span>
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">Connect live spreadsheets to automate compliance tracking and syllabus imports</p>
          </div>
        </div>

        {googleUser ? (
          <div className="flex items-center gap-2.5 bg-white border border-emerald-200 p-1.5 pl-2.5 pr-2.5 rounded-xl text-xs shadow-3xs animate-in fade-in duration-200">
            <div className="text-right">
              <p className="font-bold text-slate-800 text-[10px] sm:text-xs">{googleUser.name}</p>
              <p className="text-[9px] text-slate-400 font-mono">{googleUser.email}</p>
            </div>
            <img 
              referrerPolicy="no-referrer"
              src={googleUser.avatarUrl} 
              alt={googleUser.name} 
              className="w-8 h-8 rounded-full border border-emerald-300 shadow-3xs"
            />
            <button
              onClick={handleDisconnect}
              title="Disconnect Google Drive/Sheets"
              className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="gsi-material-button text-[11px] font-bold shadow-3xs hover:shadow-xs border border-slate-200 rounded-xl hover:bg-slate-50 transition active:scale-98 cursor-pointer shrink-0"
          >
            <div className="gsi-material-button-state"></div>
            <div className="gsi-material-button-content-wrapper p-2 px-3 flex items-center gap-2">
              {isConnecting ? (
                <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin" />
              ) : (
                <div className="gsi-material-button-icon">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4.5 h-4.5" style={{ display: "block" }}>
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                  </svg>
                </div>
              )}
              <span className="gsi-material-button-contents">
                {isConnecting ? "Signing you in..." : "Connect Google Workspace"}
              </span>
            </div>
          </button>
        )}
      </div>

      {/* Main Dashboard Interaction Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* PANEL A: LIVE EXPORT WORKSPACE */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-3xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="p-1 bg-emerald-50 text-emerald-700 rounded border border-emerald-100">
                <Download className="w-3.5 h-3.5" />
              </span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Export Real-Time Metrics</h4>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
              Write live datasets directly to your Google Drive as beautiful formatted spreadsheets. Perfect for board audits, executive presentations, and CFO reviews.
            </p>

            {createdSpreadsheetUrl && (
              <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs animate-in zoom-in-95 duration-200">
                <p className="text-emerald-900 font-bold flex items-center gap-1">
                  <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                  Spreadsheet generated successfully!
                </p>
                <p className="text-[10px] text-emerald-700 mt-0.5">Click the link below to open and edit your sheet.</p>
                <a 
                  href={createdSpreadsheetUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="mt-2.5 inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg shadow-3xs transition cursor-pointer"
                >
                  <span>Open Google Spreadsheet</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>

          <div className="space-y-2 mt-4">
            <button
              onClick={handleExportComplianceLedger}
              disabled={!accessToken || isExportingLedger}
              className={`w-full py-2 px-3.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                accessToken 
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-3xs active:scale-[0.99]' 
                  : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
              }`}
            >
              {isExportingLedger ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-3.5 h-3.5" />
              )}
              <span>{isExportingLedger ? "Creating Spreadsheet..." : "Export Compliance Audit Ledger"}</span>
            </button>

            <button
              onClick={handleExportCurriculum}
              disabled={!accessToken || isExportingTimeline}
              className={`w-full py-2 px-3.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border cursor-pointer ${
                accessToken 
                  ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-3xs active:scale-[0.99]' 
                  : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
              }`}
            >
              {isExportingTimeline ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Layers className="w-3.5 h-3.5" />
              )}
              <span>{isExportingTimeline ? "Exporting database..." : "Export active SOP Curriculum"}</span>
            </button>

            {!accessToken && (
              <p className="text-[9px] text-center text-slate-400 font-mono">
                🔒 Connect Google Workspace above to authorize direct exports.
              </p>
            )}
          </div>
        </div>

        {/* PANEL B: INTEGRATED IMPORT WORKSPACE */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-3xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-1.5 mb-2">
              <div className="flex items-center gap-1.5">
                <span className="p-1 bg-indigo-50 text-indigo-700 rounded border border-indigo-100">
                  <Upload className="w-3.5 h-3.5" />
                </span>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Sync & Import Syllabus</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowFaq(!showFaq)}
                className="text-slate-400 hover:text-indigo-600 transition flex items-center gap-1 text-[10px] cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Format?</span>
              </button>
            </div>
            
            <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
              Paste a shared Google Spreadsheet URL to dynamically synchronize, re-populate, or import custom syllabus curriculum chapters and operational tasks.
            </p>

            {/* Template Format Instructions inside modal view */}
            <AnimatePresence>
              {showFaq && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-indigo-50 border border-indigo-150 rounded-xl p-3 text-[10px] text-indigo-900 leading-snug space-y-1.5 mb-3"
                >
                  <p className="font-bold uppercase tracking-wider">Required Column Headers on 'Sheet1':</p>
                  <ul className="list-disc pl-4 space-y-1 text-[9px] font-mono">
                    <li><strong>Target Role Designation</strong>: matching designation</li>
                    <li><strong>SOP Curriculum Chapter</strong>: chapter name</li>
                    <li><strong>Task Unit Code</strong>: e.g. SOP-ACC-101</li>
                    <li><strong>Walkthrough Task Name</strong>: task title</li>
                    <li><strong>Frequency Rate</strong>: Daily/Weekly/Monthly...</li>
                    <li><strong>Skill Difficulty Level</strong>: Beginner/Intermediate/Advanced</li>
                    <li><strong>SOP Core Description Summary</strong>: description</li>
                  </ul>
                  <p className="text-[8.5px] text-indigo-600 italic">Make sure the spreadsheet is set to "Anyone with the link can view".</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase">Google Sheet URL / Link</label>
              <input
                type="text"
                placeholder="https://docs.google.com/spreadsheets/d/SpreadsheetID/edit"
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={handleImportCurriculum}
              disabled={!accessToken || isImporting || !importUrl.trim()}
              className={`w-full py-2 px-3.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                accessToken && importUrl.trim()
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-3xs active:scale-[0.99]' 
                  : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
              }`}
            >
              {isImporting ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Database className="w-3.5 h-3.5" />
              )}
              <span>{isImporting ? "Importing values..." : "Sync Syllabus Database"}</span>
            </button>
          </div>
        </div>

      </div>

      {/* Decorative tagline */}
      <div className="mt-4 flex items-center justify-between text-[9px] text-slate-400 font-mono uppercase tracking-wider pl-1 border-t border-slate-200/40 pt-3">
        <span>Designed for Executive CDO Office and Directors</span>
        <span>Secure Secure SSL Transport 🛡️</span>
      </div>
    </div>
  );
}
