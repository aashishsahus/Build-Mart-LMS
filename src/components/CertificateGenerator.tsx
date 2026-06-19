/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Download, ShieldCheck, Eye, Sparkles, X, CheckSquare, Trophy, AlertCircle, Play, Lock, ShieldAlert } from 'lucide-react';
import { ProgressStats, UserWithRole, getCertificateTemplate } from '../data/stateManager';
import { Role, ProgressLog } from '../types';

interface CertificateGeneratorProps {
  currentUser: UserWithRole;
  userRole?: Role;
  progress: ProgressLog[];
  stats: ProgressStats;
  onStartFinalExam?: () => void;
}

export default function CertificateGenerator({
  currentUser,
  userRole,
  progress,
  stats,
  onStartFinalExam
}: CertificateGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfError, setPdfError] = useState('');
  const certificateRef = useRef<HTMLDivElement>(null);

  const certTemplate = getCertificateTemplate();

  // Find the overall final exam attempt (where chapterId is null, undefined or empty)
  const getFinalExamAttempt = () => {
    try {
      const allAttemptsStr = localStorage.getItem('lms_exam_attempts_v1') || '[]';
      const allAttempts = JSON.parse(allAttemptsStr);
      // Filter for this user's attempts where chapterId is null/undefined
      const attempts = allAttempts.filter((a: any) => a.userId === currentUser.id && !a.chapterId);
      if (attempts.length > 0) {
        return attempts[attempts.length - 1]; // Return the latest attempt
      }
    } catch (e) {
      console.error("Error reading final exam attempt:", e);
    }
    return null;
  };

  const finalExamAttempt = getFinalExamAttempt();
  const hasPassedFinalExam = finalExamAttempt ? finalExamAttempt.passed : false;
  const hasAttemptedFinalExam = finalExamAttempt !== null;

  // Check if fully verified & mastered
  const hasCompletedLessons = stats.verifiedCount === stats.totalUnits && stats.totalUnits > 0;
  const isEligible = hasCompletedLessons && hasPassedFinalExam;

  // Generate Certificate Unique ID
  const certId = `RBM-CERT-${currentUser.id.substring(0, 4).toUpperCase()}-${(userRole?.id || 'ROLE').substring(0, 4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

  // Find the latest verification date or fall back to today
  const getVerificationDate = () => {
    const verifiedLogs = progress.filter(p => p.userId === currentUser.id && p.status === 'Verified & Mastered');
    if (verifiedLogs.length > 0) {
      const dates = verifiedLogs.map(l => l.verificationDate || l.lastUpdated);
      dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      return new Date(dates[0]).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDownloadPDF = async () => {
    if (!isEligible) return;
    setIsGenerating(true);
    try {
      // Find the printable certificate container in the DOM
      const element = document.getElementById('printable-certificate-element');
      if (!element) {
        throw new Error("Certificate element not found");
      }

      // Temporarily remove hidden classes if any
      const originalStyle = element.getAttribute('style') || '';
      element.setAttribute('style', 'position: relative; left: 0; top: 0; display: block; width: 1000px; height: 700px;');

      // Render html to canvas
      const canvas = await html2canvas(element, {
        scale: 2, // High resolution
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      // Restore original container styles
      element.setAttribute('style', originalStyle);

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      
      // Landscape A4 PDF setup
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      const safeCompName = (certTemplate.focusEntity || 'Company').replace(/\s+/g, '_');
      pdf.save(`${safeCompName}_Mastery_Certificate_${currentUser.name.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      setPdfError("Error occurred while generating high-res PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full">
      {/* Dashboard Promotion Panel */}
      {isEligible ? (
        <div className="relative bg-gradient-to-r from-slate-900 via-[#1e293b] to-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-8 overflow-hidden shadow-xl mb-12">
          {/* Decorative Sparkles & Rings */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/[0.04] rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-500/[0.04] rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <span className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-[10px] font-mono font-semibold tracking-wider uppercase">
                🏆 Program Milestone Achieved
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Claim Your Certificate of Mastery!
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-sans">
                Outstanding work! You have successfully completed and passed the rigorous verification check for all required <span className="text-emerald-400 font-bold">{stats.totalUnits} syllabus units</span> configured for a <span className="text-blue-400 font-bold">{userRole?.name}</span>.
              </p>
            </div>
            
            <div className="shrink-0 flex flex-col gap-2">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(true)}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-black tracking-wider uppercase shadow-lg shadow-emerald-950/30 active:scale-98 transition-all cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  Preview Certificate
                </button>
                
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  disabled={isGenerating}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-755 hover:bg-slate-700 text-slate-100 text-xs font-black tracking-wider uppercase border border-slate-700/80 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isGenerating ? (
                    <span className="animate-spin text-sm">⌛</span>
                  ) : (
                    <Download className="w-4 h-4 text-emerald-400" />
                  )}
                  Download High-Res PDF
                </button>
              </div>
              {pdfError && (
                <div className="text-[10px] text-rose-400 font-bold text-center animate-in fade-in">
                  ⚠️ {pdfError}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : hasCompletedLessons ? (
        /* Progress completed but exam is failed or not taken yet */
        <div className="bg-[#111827] text-slate-300 rounded-3xl border border-slate-800 p-6 sm:p-8 overflow-hidden shadow-xl mb-12 relative">
          <div className="absolute top-1/2 -right-4 w-48 h-48 bg-amber-500/[0.04] rounded-full blur-3xl pointer-events-none transform -translate-y-1/2" />
          
          {!hasAttemptedFinalExam ? (
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div className="space-y-4 max-w-xl">
                <span className="inline-flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-full text-[10px] font-mono font-semibold tracking-wider uppercase">
                  ⚡ Final Gating Step Required
                </span>
                <h4 className="font-display text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Pass the Final Mastery Exam to Unlock Certificate
                </h4>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-sans">
                  You have successfully completed and mastered all <span className="text-emerald-400 font-bold">{stats.totalUnits} checklist chapters</span> configured for your role! To claim your Certificate of Mastery, you must pass the single overall competence exam with a minimum score of <span className="text-amber-400 font-bold">60%</span>.
                </p>
                <p className="text-slate-400 text-[10.5px] italic leading-relaxed">
                  ⚠️ Only ONE attempt is permitted for this exam. If failed, it can only be reset by your system administrator.
                </p>
              </div>
              
              <div className="shrink-0 w-full md:w-auto">
                <button
                  type="button"
                  onClick={onStartFinalExam}
                  className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-black tracking-wider uppercase shadow-lg shadow-emerald-950/30 active:scale-98 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white shrink-0" />
                  <span>Start Final Competency Exam</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div className="space-y-4 max-w-xl">
                <span className="inline-flex items-center gap-1.5 bg-rose-500/15 border border-rose-500/30 text-rose-400 px-3 py-1 rounded-full text-[10px] font-mono font-semibold tracking-wider uppercase">
                  🔒 Attempt Limit Reached
                </span>
                <h4 className="font-display text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Final Exam Failed ({finalExamAttempt.score}% Score)
                </h4>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-sans">
                  Your score of <strong className="text-rose-400 font-mono">{finalExamAttempt.score}%</strong> has been locked in the training server database. In accordance with corporate standards, you have used your single permitted attempt.
                </p>
                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-slate-450 text-slate-400 font-mono leading-relaxed">
                  💡 <strong>Supervisor Recommendation:</strong> Please contact your learning administrator or senior supervisor to reset your progress and permit a new testing session inside the enterprise dashboard.
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Progress Indicator banner shown if incomplete */
        <div className="bg-[#111827] text-slate-300 rounded-2xl border border-slate-850 p-4 sm:p-6 mb-6 lg:mb-12 shadow-md relative overflow-hidden">
          <div className="absolute top-1/2 -right-4 w-32 h-32 bg-slate-800/[0.2] rounded-full blur-2xl pointer-events-none transform -translate-y-1/2" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
            <div className="flex items-start gap-3 sm:gap-4 min-w-0 w-full md:w-auto">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-400 shrink-0 shadow-inner">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500/80 animate-pulse" />
              </div>
              <div className="min-w-0">
                <h4 className="font-display text-xs sm:text-sm font-extrabold text-white uppercase tracking-tight">
                  Certificate of Mastery
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-400 leading-normal max-w-xl font-sans mt-0.5">
                  Master all configured required lessons (<span className="text-emerald-400 font-extrabold">{stats.verifiedCount}</span> of <span className="text-slate-200 font-bold">{stats.totalUnits}</span> completed) to unlock your verified credentials.
                </p>
              </div>
            </div>
            
            <div className="w-full md:w-auto overflow-hidden shrink-0 mt-2 md:mt-0">
              <div className="bg-[#0b101d] rounded-xl border border-slate-800/80 px-3.5 py-2.5 text-center min-w-[140px] sm:min-w-[160px]">
                <span className="block text-[8px] font-mono text-slate-500 uppercase font-black tracking-widest">
                  Unlock Progress
                </span>
                <div className="flex items-center justify-center gap-1.5 mt-1 font-mono text-sm">
                  <span className="text-amber-400 font-black">
                    {stats.verifiedCount}
                  </span>
                  <span className="text-slate-600">/</span>
                  <span className="text-slate-400">
                    {stats.totalUnits}
                  </span>
                </div>
                {/* Horizontal Progress bar inside badge */}
                <div className="w-16 mx-auto h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-300" 
                    style={{ width: `${stats.masteryPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-[#070b13]/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto select-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-4xl max-w-5xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative"
            >
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 hover:bg-slate-800/60 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1 pr-12">
                <h3 className="font-display text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  Performance Mastery Credential Preview
                </h3>
                <p className="text-xs text-slate-400 font-sans">
                  Below is the high-fidelity professional certificate. It will render vector-sharp when compiled into PDF format.
                </p>
              </div>

              {/* Landscape Layout Wrapper holding Responsive Visual Aspect (1.414 aspect ratio) */}
              <div className="w-full overflow-x-auto scrollbar-thin py-2">
                <div className="min-w-[700px] max-w-[900px] mx-auto bg-white border border-slate-300 shadow-xl rounded-lg p-1.5">
                  
                  {/* Real visual container that is downloaded */}
                  <div
                    id="printable-certificate-element"
                    className="relative w-[1000px] h-[700px] bg-white text-slate-900 p-12 overflow-hidden flex flex-col justify-between border-8 border-double border-[#b4975a] select-none"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    {/* Background Certificate Watermark Grid Pattern & Corner Filigrees */}
                    <div className="absolute inset-4 border border-[#e2d4bd] pointer-events-none" />
                    
                    {/* Corner Flourishes */}
                    <div className="absolute top-6 left-6 w-12 h-12 border-t-2 border-l-2 border-[#b4975a]" />
                    <div className="absolute top-6 right-6 w-12 h-12 border-t-2 border-r-2 border-[#b4975a]" />
                    <div className="absolute bottom-6 left-6 w-12 h-12 border-b-2 border-l-2 border-[#b4975a]" />
                    <div className="absolute bottom-6 right-6 w-12 h-12 border-b-2 border-r-2 border-[#b4975a]" />
                    
                    {/* Security stamp pattern background */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#b4975a_1px,transparent_1px)] bg-[size:16px_16px]" />

                    {/* Logo Header */}
                    <div className="text-center space-y-2 mt-4 relative z-10">
                      <div className="flex justify-center items-center gap-2 mb-2">
                        {/* Elegant R monogram circle */}
                        <div className="w-12 h-12 bg-slate-950 text-white rounded-full flex items-center justify-center font-sans font-black text-xl border-4 border-[#b4975a] shadow-md">
                          R
                        </div>
                      </div>
                      <h4 className="text-[12px] uppercase tracking-[0.25em] text-[#866e40] font-sans font-bold">
                        {currentUser.focusEntity || certTemplate.focusEntity}
                      </h4>
                      <p className="text-[10px] uppercase font-sans text-slate-400 tracking-wider">
                        {certTemplate.subHeader}
                      </p>
                    </div>

                    {/* Core Accolades Title */}
                    <div className="text-center space-y-4 my-auto relative z-10">
                      <h1 className="text-3xl font-bold tracking-tight text-[#111827] mt-2 italic font-serif">
                        {certTemplate.title}
                      </h1>
                      
                      <div className="w-32 h-[1px] bg-gradient-to-r from-transparent via-[#b4975a] to-transparent mx-auto my-3" />
                      
                      <p className="text-[11px] font-sans text-slate-500 uppercase tracking-widest font-semibold italic">
                        {certTemplate.proudlyAwardedTo}
                      </p>
                      
                      <h2 className="text-4xl text-[#0b101d] font-bold tracking-wide py-2 font-serif underline decoration-[#b4975a]/40 underline-offset-8">
                        {currentUser.name}
                      </h2>
                      
                      <p className="text-[12px] text-slate-650 max-w-2xl mx-auto leading-relaxed font-sans px-8">
                        {certTemplate.bodyText}
                      </p>

                      <div className="bg-[#fcfaf4] border border-[#eadaab]/50 rounded-xl px-6 py-2.5 inline-block max-w-lg shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                        <span className="text-sm uppercase tracking-wider text-[#b4975a] font-bold font-sans">
                          {userRole?.name}
                        </span>
                        <span className="text-slate-400 text-xs px-2">•</span>
                        <span className="text-slate-650 font-sans text-xs">
                          {currentUser.department} Division
                        </span>
                      </div>
                    </div>

                    {/* Signatures & Certification stamps row */}
                    <div className="flex justify-between items-end border-t border-[#e2d4bd] pt-6 relative z-10">
                      {/* Left Signature Block */}
                      <div className="text-center shrink-0 w-52 space-y-1 font-sans">
                        <div className="text-[#866e40] font-serif italic text-base h-8 select-none flex items-end justify-center pb-1">
                          <span className="font-serif italic font-semibold text-slate-800 tracking-wider">
                            {certTemplate.signatureText}
                          </span>
                        </div>
                        <div className="w-40 border-t border-slate-300 mx-auto" />
                        <span className="block text-[9px] uppercase font-bold text-slate-500 tracking-wider">
                          {certTemplate.signatureTitle}
                        </span>
                        <span className="block text-[8px] text-slate-400">
                          {certTemplate.signatureSub}
                        </span>
                      </div>

                      {/* Center Golden Seal */}
                      <div className="flex flex-col items-center shrink-0 text-center font-sans space-y-1">
                        <div className="relative">
                          {/* Radial golden master design */}
                          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#866e40] via-[#cbb17b] to-[#866e40] flex items-center justify-center p-[2px] shadow-md border-4 border-white relative z-15">
                            <div className="w-full h-full rounded-full bg-[#111827] flex flex-col items-center justify-center select-none text-white border border-[#cbb17b]/40">
                              <ShieldCheck className="w-5 h-5 text-[#cbb17b] animate-pulse" />
                              <span className="text-[7px] font-sans font-black tracking-widest text-[#cbb17b]/90 uppercase mt-0.5">
                                {certTemplate.stampLabel}
                              </span>
                            </div>
                          </div>
                          {/* Golden Ribbon elements styling */}
                          <div className="absolute top-14 left-2 w-4 h-12 bg-[#866e40]/70 transform -rotate-12 rounded-b-sm pointer-events-none z-10"></div>
                          <div className="absolute top-14 right-2 w-4 h-12 bg-[#b4975a]/70 transform rotate-12 rounded-b-sm pointer-events-none z-10"></div>
                        </div>
                        <span className="text-[8px] tracking-wide text-slate-400 font-mono">
                          {certTemplate.establishedText}
                        </span>
                      </div>

                      {/* Right Date & Token Credential check block */}
                      <div className="text-center shrink-0 w-52 space-y-1 font-sans">
                        <div className="text-slate-800 text-xs font-mono font-bold h-8 flex items-end justify-center pb-1">
                          {getVerificationDate()}
                        </div>
                        <div className="w-40 border-t border-slate-300 mx-auto" />
                        <span className="block text-[9px] uppercase font-bold text-slate-500 tracking-wider">
                          DATE OF CREDENTIAL
                        </span>
                        <span className="block text-[8px] font-mono font-bold text-[#b4975a]">
                          ID: {certId}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Modal footer controls */}
              <div className="flex sm:justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800 text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  disabled={isGenerating}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-emerald-900/30 transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  {isGenerating ? (
                    <span className="animate-spin text-sm">⌛</span>
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  {isGenerating ? 'Generating...' : 'Download PDF Certificate'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
