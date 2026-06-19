/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { UserWithRole, getQuestions, getChapters, getExamConfig, getCertificateTemplate, getCompanyBranding } from '../data/stateManager';
import { ExamQuestion, ExamConfig } from '../types';
import { 
  Play, 
  HelpCircle, 
  Award, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RotateCcw, 
  Printer, 
  ChevronRight, 
  ChevronLeft, 
  AlertCircle, 
  Sparkles,
  CheckCircle2,
  FileCheck2,
  BookmarkCheck,
  ShieldAlert,
  User,
  GraduationCap,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface ExamAttempt {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRoleId: string;
  userRoleName: string;
  score: number; // percentage e.g. 80
  correctCount: number;
  totalQuestions: number;
  passed: boolean;
  date: string;
  chapterId?: string | null;
}

interface AssessmentCenterProps {
  currentUser: UserWithRole;
  onAttemptSaved?: () => void;
  chapterId?: string | null;
  onBackToDashboard?: () => void;
}

export default function AssessmentCenter({
  currentUser,
  onAttemptSaved,
  chapterId,
  onBackToDashboard
}: AssessmentCenterProps) {
  const certTemplate = getCertificateTemplate();
  const branding = getCompanyBranding();

  // Exam states
  const [started, setStarted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);
  
  // Dynamic questions and config
  const [activeQuestions, setActiveQuestions] = useState<ExamQuestion[]>([]);
  const [examConfig, setExamConfig] = useState<ExamConfig>({ examEnabled: true, requirePassToUnlockNext: false });
  const [chapterName, setChapterName] = useState<string | null>(null);

  // Timer state (15 minutes = 900 seconds)
  const [timeLeft, setTimeLeft] = useState(900);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Attempt records state
  const [myAttempts, setMyAttempts] = useState<ExamAttempt[]>([]);
  const [showCertificate, setShowCertificate] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [timeLimitExceeded, setTimeLimitExceeded] = useState(false);

  // Load configuration and filter questions depending on parameters
  useEffect(() => {
    const config = getExamConfig();
    setExamConfig(config);

    const allQuestions = getQuestions().filter(q => q.isActive !== false);
    let list: ExamQuestion[] = [];

    if (chapterId) {
      // Filter strictly to this chapter
      list = allQuestions.filter(q => q.chapterId === chapterId);
      const chaps = getChapters();
      const thisChap = chaps.find(c => c.id === chapterId);
      if (thisChap) {
        setChapterName(thisChap.name);
      }
    } else {
      // Filter by user role or fallback to default
      const chaps = getChapters();
      const userChaps = chaps.filter(c => c.roleId === currentUser.roleId);
      const userChapIds = userChaps.map(c => c.id);
      
      list = allQuestions.filter(q => q.chapterId && userChapIds.includes(q.chapterId));
      if (list.length === 0) {
        list = allQuestions; // fallback to complete list
      }
      setChapterName(null);
    }

    setActiveQuestions(list);
    setAnswers({});
    setCurrentIdx(0);
    setSubmitted(false);
    setStarted(false);
  }, [currentUser, chapterId]);

  // Load user attempts on mount
  useEffect(() => {
    loadMyAttempts();
  }, [currentUser, chapterId]);

  const loadMyAttempts = () => {
    try {
      const allAttemptsStr = localStorage.getItem('lms_exam_attempts_v1') || '[]';
      const allAttempts: ExamAttempt[] = JSON.parse(allAttemptsStr);
      
      // If chapter specific, filter by both userId and chapterId
      const userAttempts = allAttempts.filter(a => {
        const matchesUser = a.userId === currentUser.id;
        if (chapterId) {
          return matchesUser && a.chapterId === chapterId;
        }
        return matchesUser;
      });
      setMyAttempts(userAttempts);
    } catch (e) {
      console.error("Error loading attempts from local storage:", e);
    }
  };

  // Timer loop
  useEffect(() => {
    if (started && !submitted) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [started, submitted]);

  // Handle auto-submit on timeout
  const handleAutoSubmit = () => {
    submitExam(true);
  };

  // Start exam
  const startExam = () => {
    setAnswers({});
    setCurrentIdx(0);
    setTimeLeft(900); // Reset to 15 mins
    setSubmitted(false);
    setStarted(true);
    setShowCertificate(false);
    setShowSubmitConfirm(false);
  };

  // Select option index
  const selectOption = (qId: string, optIdx: number) => {
    if (submitted) return;
    setAnswers(prev => ({
      ...prev,
      [qId]: optIdx
    }));
  };

  // Submit test
  const submitExam = (isTimeout = false) => {
    if (timerRef.current) clearInterval(timerRef.current);

    let correct = 0;
    activeQuestions.forEach(q => {
      const userAns = answers[q.id];
      if (q.type === 'text') {
        if (userAns !== undefined && userAns !== null && userAns !== '') {
          // Robust case-insensitive comparison ignoring spaces and symbols
          const normUser = userAns.toString().trim().toLowerCase().replace(/[^a-z0-9]/g, '');
          const normCorrect = q.correctAnswerText?.trim().toLowerCase().replace(/[^a-z0-9]/g, '') || '';
          if (normUser === normCorrect) {
            correct++;
          }
        }
      } else {
        if (userAns === q.correctAnswerIndex) {
          correct++;
        }
      }
    });

    const totalCount = activeQuestions.length || 1;
    const calculatedScore = Math.round((correct / totalCount) * 100);
    const hasPassed = calculatedScore >= 60; // 60% Passing mark

    setScore(calculatedScore);
    setPassed(hasPassed);
    setSubmitted(true);
    setStarted(false);

    // Save attempt log
    const newAttempt: ExamAttempt = {
      id: `att_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      userRoleId: currentUser.roleId,
      userRoleName: currentUser.role?.name || 'Assigned Division User',
      score: calculatedScore,
      correctCount: correct,
      totalQuestions: totalCount,
      passed: hasPassed,
      date: new Date().toISOString(),
      chapterId: chapterId || null
    };

    try {
      const allAttemptsStr = localStorage.getItem('lms_exam_attempts_v1') || '[]';
      const allAttempts: ExamAttempt[] = JSON.parse(allAttemptsStr);
      allAttempts.push(newAttempt);
      localStorage.setItem('lms_exam_attempts_v1', JSON.stringify(allAttempts));
      
      // Update local view
      setMyAttempts(prev => [...prev, newAttempt]);

      // Call state callbacks so admin panel and unlocked state is synced immediately
      if (onAttemptSaved) {
        onAttemptSaved();
      }
    } catch (e) {
      console.error("Failed saving exam attempt log:", e);
    }

    if (isTimeout) {
      setTimeLimitExceeded(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPercentageColor = (pct: number) => {
    if (pct >= 85) return 'text-emerald-600 dark:text-emerald-400';
    if (pct >= 60) return 'text-sky-600 dark:text-sky-400';
    return 'text-rose-600 dark:text-rose-400';
  };

  if (!examConfig.examEnabled) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center" id="assessment-center-locked">
        <div className="p-8 bg-white border border-slate-200 rounded-3xl max-w-xl mx-auto shadow-sm space-y-4">
          <ShieldAlert className="w-14 h-14 text-rose-500 mx-auto animate-pulse" />
          <h3 className="text-xl font-bold text-slate-900 leading-tight">Assessment Portal Closed</h3>
          <p className="text-xs text-slate-500 leading-relaxed font-sans max-w-md mx-auto">
            The exam assessment center has been temporarily disabled or locked by the Administrator. Please contact your senior trainer or supervisor to activate test metrics.
          </p>
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="mt-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-mono text-[11px] uppercase tracking-wider font-bold rounded-xl flex items-center gap-1.5 mx-auto cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return To Syllabus
            </button>
          )}
        </div>
      </div>
    );
  }

  if (activeQuestions.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center" id="assessment-center-empty">
        <div className="p-8 bg-white border border-slate-200 rounded-3xl max-w-xl mx-auto shadow-sm space-y-4">
          <HelpCircle className="w-14 h-14 text-slate-300 mx-auto" />
          <h3 className="text-xl font-bold text-slate-900 leading-tight">No Questions Available</h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto font-sans">
            No active exam questions have been configured for {chapterName ? `"${chapterName}"` : "your training group"}. Please have an Admin add custom questions in the Admin panel.
          </p>
          <div className="flex justify-center gap-3">
            {onBackToDashboard && (
              <button
                onClick={onBackToDashboard}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-mono text-[11px] uppercase tracking-wider font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Return To Syllabus
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const activeQuestion = activeQuestions[currentIdx];
  const isCandidate = currentUser.roleId === 'role_candidate';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="assessment-center-root">
      
      {/* Back button link */}
      {onBackToDashboard && (
        <button
          onClick={onBackToDashboard}
          className="mb-4 inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-500 font-bold transition flex-wrap cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Learning Dashboard</span>
        </button>
      )}

      {/* Upper Breadcrumb or Segment Details */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-emerald-600 uppercase font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded">
            {chapterId ? `DEDICATED SECTION EXAM` : isCandidate ? 'PRE-EMPLOYMENT RECRUIT EVALUATION' : 'ROLE CREDENTIAL CERTIFICATION MATRIX'}
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2 flex items-center gap-2">
            <GraduationCap className="w-6.5 h-6.5 text-emerald-600" />
            {chapterName ? `Exam: ${chapterName}` : 'Accounting & Tax Aptitude Hub'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {chapterName ? `Strict double-entry compliance and concept evaluation for "${chapterName}".` : 'Reconciliations, Double-Entry verification, Tax Matches (GSTR-2B) and Accounting closing principles verification program.'}
          </p>
        </div>
        
        {/* Statistics or Actions */}
        <div className="flex gap-2">
          {myAttempts.length > 0 && !started && (
            <div className="bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-xl text-center flex items-center gap-3">
              <span className="text-[11px] font-mono font-medium text-slate-500">
                LATEST PERFORMANCE:
              </span>
              <span className={`text-sm font-black font-mono ${getPercentageColor(myAttempts[myAttempts.length - 1].score)}`}>
                {myAttempts[myAttempts.length - 1].score}%
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-sans ${
                myAttempts[myAttempts.length - 1].passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {myAttempts[myAttempts.length - 1].passed ? 'Passed' : 'Under Limit'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Container Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left 8 Columns: Test Area or Landing Information */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* STATE 1: EXAM HAS NOT STARTED AND NOT JUST SUBMITTED */}
          {!started && !submitted && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-100/30 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="flex items-center gap-3.5 mb-5">
                <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Award className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                    {chapterName ? `Section Chapter Exam: ${chapterName}` : isCandidate ? `${branding?.companyName || 'Build Mart'} Recruiter Screening Test` : 'Final Corporate Compliance Certification Exam'}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{(branding?.companyTagline || "Rathi Buildmart PLC").toUpperCase()} Accounts Audit & Verification</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2.5">
                  <p className="font-bold text-slate-800 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    EXAM MATRIX INSTRUCTIONS & RULES:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li>The evaluation consists of <strong className="text-slate-900 font-bold">{activeQuestions.length} comprehensive questions</strong> covering this section.</li>
                    <li>Supports both **Multiple Choice Options** and **Manual Text Answers** dynamically.</li>
                    <li>You have an interactive, synchronized limit of <strong className="text-slate-900">15 Minutes (900 seconds)</strong> to complete all entries.</li>
                    <li>The evaluation requires <strong className="text-emerald-700 font-semibold font-sans">60% Score</strong> to establish structural mastery and certify qualification.</li>
                    <li>Once submitted, a step-by-step audit analysis with complete explanations is made available for evaluation log records.</li>
                  </ul>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-50 border border-slate-200 hover:border-slate-300 p-4 rounded-xl text-center transition">
                    <HelpCircle className="w-5 h-5 text-emerald-600 mx-auto mb-1.5" />
                    <p className="text-xs font-mono font-medium text-slate-400 uppercase">Total Items</p>
                    <p className="text-base font-extrabold text-slate-900 mt-0.5">{activeQuestions.length} Questions</p>
                  </div>
                  
                  <div className="bg-slate-50 border border-slate-200 hover:border-slate-300 p-4 rounded-xl text-center transition">
                    <Clock className="w-5 h-5 text-blue-600 mx-auto mb-1.5" />
                    <p className="text-xs font-mono font-medium text-slate-400 uppercase">Limit Alloted</p>
                    <p className="text-base font-extrabold text-slate-900 mt-0.5">15 Mins</p>
                  </div>
                  
                  <div className="bg-slate-50 border border-slate-200 hover:border-slate-300 p-4 rounded-xl text-center transition">
                    <Award className="w-5 h-5 text-amber-500 mx-auto mb-1.5" />
                    <p className="text-xs font-mono font-medium text-slate-400 uppercase">Mastery Cut</p>
                    <p className="text-base font-extrabold text-slate-900 mt-0.5">&gt;= 60%</p>
                  </div>
                </div>
              </div>

              <div className="text-center sm:text-left">
                {myAttempts.length >= 1 ? (
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-805 font-bold space-y-2 max-w-xl">
                    <p className="flex items-center gap-1.5 uppercase tracking-wide">
                      <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 animate-pulse" />
                      Assessment Attempt Limit Reached (1 Max)
                    </p>
                    <p className="text-[10.5px] font-medium text-amber-700 leading-relaxed font-sans normal-case">
                      You have already completed this exam evaluation once. In accordance with Rathi Build Mart's double-entry training policy, multiple attempts are locked. If you need to re-take this test, please request your System Administrator or Trainer to reset your progress inside the Admin Directory panel.
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={startExam}
                    className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-950/20 text-xs tracking-wider uppercase flex items-center justify-center gap-2 mx-auto sm:mx-0 active:scale-[0.98] transition cursor-pointer"
                    id="btn-start-exam"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Begin Chapter Assessment</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STATE 2: ACTIVE EXAM IN PROGRESS */}
          {started && !submitted && activeQuestion && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
              
              {/* Question Header Status */}
              <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
                <div>
                  <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-2 py-1 rounded border border-slate-200">
                    Question {currentIdx + 1} of {activeQuestions.length}
                  </span>
                  <span className="ml-2.5 text-[10px] uppercase font-mono font-bold text-emerald-600 bg-emerald-50 border border-emerald-100/50 px-2 py-1 rounded">
                    {activeQuestion.topic}
                  </span>
                </div>
                
                {/* Countdown display */}
                <div className="flex items-center gap-2 bg-rose-50 text-rose-800 border-rose-200 border px-3 py-1.5 rounded-lg font-mono text-xs font-black animate-pulse">
                  <Clock className="w-4 h-4 text-rose-600" />
                  <span>{formatTime(timeLeft)}</span>
                </div>
              </div>

              {/* Progress bar visual */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-8">
                <div 
                  className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${((currentIdx + 1) / activeQuestions.length) * 100}%` }}
                ></div>
              </div>

              {/* The Question Text */}
              <div className="mb-8">
                <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  {activeQuestion.question}
                </h4>
              </div>

              {/* INPUT CONTAINER (MCQ VS TEXT TYPE) */}
              {activeQuestion.type === 'text' ? (
                <div className="mb-8 space-y-3">
                  <label className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                    Your Open Text Answer:
                  </label>
                  <input
                    type="text"
                    value={answers[activeQuestion.id] || ''}
                    onChange={(e) => {
                      if (submitted) return;
                      setAnswers(prev => ({
                        ...prev,
                        [activeQuestion.id]: e.target.value
                      }));
                    }}
                    placeholder="Enter short response value..."
                    className="w-full p-4 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-xs sm:text-sm font-semibold tracking-wide bg-slate-50/40 text-slate-800"
                  />
                  <p className="text-[10px] text-slate-400 leading-relaxed pl-1 italic">
                    Note: Complete case-insensitive match (spaces and symbols ignored) will be used to automatically score your answer.
                  </p>
                </div>
              ) : (
                /* MCQ Options Selector */
                <div className="space-y-3.5 mb-8">
                  {activeQuestion.options?.map((option, idx) => {
                    const isSelected = answers[activeQuestion.id] === idx;
                    const letter = String.fromCharCode(65 + idx); // A, B, C, D
                    
                    return (
                      <button
                        key={idx}
                        onClick={() => selectOption(activeQuestion.id, idx)}
                        className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm font-medium flex items-center gap-4 transition-all duration-150 outline-none cursor-pointer ${
                          isSelected 
                            ? 'border-emerald-500 bg-emerald-50/50 text-emerald-800 shadow-sm' 
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/25 text-slate-700'
                        }`}
                      >
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold font-mono text-xs ${
                          isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}>
                          {letter}
                        </span>
                        <span className="flex-grow text-xs sm:text-sm font-medium leading-relaxed">{option}</span>
                        <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'
                        }`}>
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Navigation Actions */}
              <div className="flex justify-between items-center border-t border-slate-100 pt-6">
                <button
                  onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                  disabled={currentIdx === 0}
                  className="px-4 py-2.5 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold text-slate-600 flex items-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                {currentIdx < activeQuestions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIdx(prev => prev + 1)}
                    className="px-4.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setShowSubmitConfirm(true);
                    }}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs tracking-wider uppercase shadow-md shadow-emerald-950/10 flex items-center gap-1.5 transition cursor-pointer"
                    id="btn-submit-exam"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Submit Chapter Exam
                  </button>
                )}
              </div>

              {/* Custom State-Driven Inline Confirmation Overlay */}
              {showSubmitConfirm && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 sm:p-8 max-w-md w-full relative animate-in zoom-in-95 duration-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-600 flex items-center justify-center">
                        <AlertCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-base font-extrabold text-slate-900">
                          Confirm Exam Submission
                        </h4>
                        <p className="text-xs text-slate-400 font-mono">Chapter Competency Testing</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-650 leading-relaxed mb-6">
                      Are you sure you want to finalize and submit your answers? You have selected responses for <strong className="text-slate-800 font-bold">{Object.keys(answers).length} of {activeQuestions.length} questions</strong>. Once submitted, your score will be logged and your certification metrics calculated instantly.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <button
                        onClick={() => {
                          setShowSubmitConfirm(false);
                          submitExam();
                        }}
                        className="flex-grow order-2 sm:order-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition active:scale-95 cursor-pointer text-center"
                        id="btn-confirm-submit"
                      >
                        Yes, Submit Exam
                      </button>
                      <button
                        onClick={() => setShowSubmitConfirm(false)}
                        className="flex-grow order-1 sm:order-2 px-4 py-2.5 border border-slate-250 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs uppercase tracking-wider transition active:scale-95 cursor-pointer text-center"
                        id="btn-cancel-submit"
                      >
                        Cancel & Review
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STATE 3: EXAM JUST SUBMITTED (GRADES & EXPLANATION REPORT) */}
          {submitted && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              
              {/* Performance Summary Banner */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 relative overflow-hidden text-center sm:text-left">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100/20 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="flex flex-col sm:flex-row items-center gap-6 justify-between">
                  <div className="space-y-1.5">
                    <span className={`text-[10px] font-mono tracking-widest uppercase font-bold px-2 py-0.5 rounded border ${
                      passed ? 'bg-emerald-50 border-emerald-250 text-emerald-800' : 'bg-rose-50 border-rose-250 text-rose-800'
                    }`}>
                      {passed ? 'Mastery Confirmed (Passed)' : 'Retake Advice (Score Under Limit)'}
                    </span>
                    <h3 className="text-xl font-black text-slate-900 leading-tight">
                      {passed ? '🎉 Congratulations, You Cleared the Exam!' : '📋 Keep Practicing - Verification Logged'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      We have compiled your double-entry accuracy metrics. Your audit ledger logs are registered successfully.
                    </p>
                    {timeLimitExceeded && (
                      <div className="mt-3 p-3 bg-amber-50 border border-amber-250 text-amber-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                        <span>⚠️ Timeout Notification: This assessment was automatically finalized and submitted as the allotted exam duration has elapsed.</span>
                      </div>
                    )}
                  </div>

                  {/* Circle score chart */}
                  <div className="bg-slate-950/5 border border-slate-200 p-4 rounded-2xl min-w-[150px] text-center">
                    <p className="text-[10px] text-slate-400 font-mono font-bold uppercase mb-1">SCORE CARD</p>
                    <p className={`text-4xl font-mono font-black ${getPercentageColor(score)}`}>
                      {score}%
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1 font-sans">
                      ({activeQuestions.filter(q => {
                        const ans = answers[q.id];
                        if (q.type === 'text') {
                          const normUser = ans?.toString().trim().toLowerCase().replace(/[^a-z0-9]/g, '') || '';
                          const normCorrect = q.correctAnswerText?.trim().toLowerCase().replace(/[^a-z0-9]/g, '') || '';
                          return normUser === normCorrect;
                        }
                        return ans === q.correctAnswerIndex;
                      }).length} of {activeQuestions.length} Correct)
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-100 mt-6 pt-6 flex flex-wrap gap-3 justify-center sm:justify-start">
                  {passed && !chapterId && (
                    <button
                      onClick={() => setShowCertificate(true)}
                      className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition flex items-center gap-1.5 cursor-pointer"
                      id="btn-view-certificate"
                    >
                      <Award className="w-4 h-4" />
                      View Certificate
                    </button>
                  )}
                  
                  <button
                    onClick={startExam}
                    className="px-5 py-3 border border-slate-250 hover:bg-slate-50 text-slate-700 rounded-xl text-xs uppercase tracking-wider font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4 text-slate-400" />
                    Restart Assessment
                  </button>

                  {onBackToDashboard && (
                    <button
                      onClick={onBackToDashboard}
                      className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Return to Learning
                    </button>
                  )}
                </div>
              </div>

              {/* CERTIFICATE LIGHTBOX SHOWCASE */}
              {showCertificate && passed && !chapterId && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-6 sm:p-10 shadow-xl relative animate-in zoom-in-95 duration-200 overflow-hidden" id="print-certificate-box">
                  {/* Elegant decorative background watermarks */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full border-[3px] border-amber-500/10 border-dashed pointer-events-none"></div>
                  <div className="absolute top-5 right-5 text-amber-600/10 pointer-events-none">
                    <GraduationCap className="w-44 h-44" />
                  </div>
                  
                  {/* Frame */}
                  <div className="border border-amber-200 rounded-xl p-4 sm:p-8 bg-white/70 backdrop-blur-sm relative text-center">
                    
                    {/* Seal */}
                    <div className="mx-auto w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center text-white font-mono font-bold border-4 border-amber-200 outline-none shadow-md mb-4">
                      <Award className="w-8 h-8" />
                    </div>

                    <p className="text-[10px] font-mono tracking-widest text-[#866e40] uppercase font-bold">
                      {certTemplate.focusEntity}
                    </p>
                    
                    <h4 className="text-xl sm:text-2xl font-black text-slate-900 mt-2 font-sans tracking-tight">
                      {certTemplate.title}
                    </h4>
                    
                    <p className="text-[11px] text-slate-400 font-sans mt-1">
                      {certTemplate.subHeader}
                    </p>

                    <p className="text-xs text-slate-650 max-w-md mx-auto mt-6 italic font-sans">
                      {certTemplate.proudlyAwardedTo}
                    </p>
                    
                    <h3 className="text-lg sm:text-xl font-bold text-emerald-800 mt-1 uppercase underline decoration-emerald-200 decoration-2 underline-offset-4">
                      {currentUser.name}
                    </h3>

                    <p className="text-xs text-slate-650 max-w-md mx-auto mt-4 font-sans leading-relaxed">
                      {certTemplate.bodyText} demonstrative of standard execution mastery with an authenticated score of <strong className="text-emerald-700 font-mono text-xs">{score}%</strong>.
                    </p>

                    <div className="grid grid-cols-2 gap-8 max-w-sm mx-auto mt-10 text-[10px] border-t border-slate-100 pt-6">
                      <div className="text-center font-sans text-slate-500">
                        <p className="font-bold text-slate-800 font-mono">{new Date().toLocaleDateString()}</p>
                        <p className="border-t border-slate-200 mt-1 pt-1 font-mono uppercase text-[9px]">Date of Evaluation</p>
                      </div>
                      <div className="text-center font-sans text-slate-500">
                        <p className="font-bold text-emerald-800 font-mono">{certTemplate.signatureText}</p>
                        <p className="border-t border-slate-200 mt-1 pt-1 font-mono uppercase text-[9px]">{certTemplate.signatureTitle} • {certTemplate.signatureSub}</p>
                      </div>
                    </div>
                    
                    {/* Print Button action client-side */}
                    <div className="mt-6 flex justify-center">
                      <button
                        onClick={() => window.print()}
                        className="p-1 px-3.5 bg-amber-500 hover:bg-amber-600 text-white hover:text-white rounded-lg text-[10px] font-mono tracking-wide uppercase flex items-center justify-center gap-1 cursor-pointer transition shadow-sm font-bold"
                      >
                        <Printer className="w-3 h-3" />
                        Print Certificate Proof
                      </button>
                    </div>

                  </div>
                </div>
              )}

              {/* Comprehensive Correct Answer Explanations */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-tight mb-4 flex items-center gap-2">
                  <BookmarkCheck className="w-4.5 h-4.5 text-emerald-600" />
                  Your Comprehensive Assessment Review & Audit Log
                </h4>

                <div className="space-y-6 divide-y divide-slate-100">
                  {activeQuestions.map((q, idx) => {
                    const selectedValue = answers[q.id];
                    
                    let isCorrect = false;
                    if (q.type === 'text') {
                      const normUser = selectedValue?.toString().trim().toLowerCase().replace(/[^a-z0-9]/g, '') || '';
                      const normCorrect = q.correctAnswerText?.trim().toLowerCase().replace(/[^a-z0-9]/g, '') || '';
                      isCorrect = normUser === normCorrect;
                    } else {
                      isCorrect = selectedValue === q.correctAnswerIndex;
                    }

                    const letterChosen = (q.type !== 'text' && selectedValue !== undefined) ? String.fromCharCode(65 + selectedValue) : 'None';

                    return (
                      <div key={q.id} className={`pt-5 ${idx === 0 ? 'pt-0' : ''} text-xs sm:text-sm`}>
                        <div className="flex items-start gap-2.5">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] mt-0.5 flex-shrink-0 ${
                            isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {idx + 1}
                          </span>
                          
                          <div className="space-y-1 w-full">
                            <p className="font-semibold text-slate-900 leading-tight">
                              {q.question}
                            </p>
                            
                            <div className="flex flex-wrap gap-2 text-[10px] py-1">
                              <span className="font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded border uppercase">
                                {q.topic}
                              </span>
                              
                              <span className={`font-mono px-2 py-0.5 rounded border uppercase font-medium flex items-center gap-1 ${
                                isCorrect ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
                              }`}>
                                {isCorrect ? 'Correct ✓' : 'Incorrect ✗'}
                              </span>
                            </div>

                            {/* Options review */}
                            {q.type === 'text' ? (
                              <div className="my-2.5 space-y-2 pl-1">
                                <div className={`p-2 rounded-lg text-xs border ${
                                  isCorrect ? 'bg-emerald-50 border-emerald-150 text-emerald-850' : 'bg-rose-50 border-rose-150 text-rose-850'
                                }`}>
                                  <span className="font-bold">Your Entrada: </span>
                                  <span className="font-mono">{selectedValue || '(Empty response)'}</span>
                                </div>
                                <div className="p-2 rounded-lg text-xs border bg-slate-100 border-slate-200 text-slate-700">
                                  <span className="font-bold text-emerald-800">Correct Target: </span>
                                  <span className="font-mono font-bold text-emerald-855">{q.correctAnswerText}</span>
                                </div>
                              </div>
                            ) : (
                              <div className="my-2.5 space-y-1.5 pl-1">
                                {q.options?.map((opt, oIdx) => {
                                  const oLetter = String.fromCharCode(65 + oIdx);
                                  const isThisSelected = selectedValue === oIdx;
                                  const isThisCorrect = q.correctAnswerIndex === oIdx;
                                  
                                  return (
                                    <div 
                                      key={oIdx} 
                                      className={`p-2 rounded-lg text-xs flex items-center gap-2 border ${
                                        isThisCorrect 
                                          ? 'bg-emerald-50 border-emerald-150 text-emerald-850 font-medium' 
                                          : isThisSelected 
                                            ? 'bg-rose-50 border-rose-150 text-rose-850' 
                                            : 'bg-transparent border-slate-100 text-slate-500'
                                      }`}
                                    >
                                      <span className={`w-5 h-5 rounded flex items-center justify-center font-bold font-mono text-[10px] shrink-0 ${
                                        isThisCorrect ? 'bg-emerald-600 text-white' : isThisSelected ? 'bg-rose-600 text-white' : 'bg-slate-50 text-slate-400'
                                      }`}>
                                        {oLetter}
                                      </span>
                                      <span className="leading-snug">{opt}</span>
                                      {isThisCorrect && <span className="ml-auto text-[10px] text-emerald-700 font-bold uppercase font-mono shrink-0">Correct</span>}
                                      {isThisSelected && !isThisCorrect && <span className="ml-auto text-[10px] text-rose-600 font-bold uppercase font-mono shrink-0">Your Choice</span>}
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Explanation box */}
                            <div className="bg-slate-50 text-slate-500 border border-slate-150 text-[11px] p-3 rounded-lg leading-relaxed font-sans">
                              <span className="font-bold text-slate-700">Explanation Log:</span> {q.explanation}
                            </div>
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

        {/* Right 4 Columns: Examination attempts registry list */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              <span>{chapterId ? "Chapter Performance" : "Assessment History"}</span>
            </h3>

            {myAttempts.length === 0 ? (
              <div className="text-center py-10 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <BookmarkCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 leading-normal font-sans">
                  No exam submissions recorded here yet <br />
                  for <strong className="text-slate-700">{currentUser.name}</strong>.
                </p>
                <p className="text-[10px] text-slate-400 font-mono mt-1 text-center">
                  Evaluation reports will register here.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                {myAttempts.map((att, idx) => (
                  <div 
                    key={att.id} 
                    className="p-3 bg-slate-50/75 hover:bg-slate-50 border border-slate-200 rounded-xl transition flex justify-between items-center text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] text-slate-400">
                          #{myAttempts.length - idx}
                        </span>
                        <span className="font-sans font-bold text-slate-700">
                          Score: <span className={getPercentageColor(att.score)}>{att.score}%</span>
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-450 text-slate-400 font-mono">
                        {new Date(att.date).toLocaleDateString()} at {new Date(att.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-bold tracking-wide uppercase ${
                        att.passed ? 'bg-emerald-50 border border-emerald-250 text-emerald-800' : 'bg-rose-50 border border-rose-250 text-rose-800'
                      }`}>
                        {att.passed ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Learning Path Context */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
            <h4 className="text-xs font-mono tracking-widest text-[#10b981] uppercase font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#10b981] animate-pulse" />
              LMS Learning Link
            </h4>
            <p className="text-[11px] text-slate-355 text-slate-300 mt-2 leading-relaxed">
              Before submitting the real certification assessment, candidates and employees can complete practical chapters and watch curriculum video lectures.
            </p>
            <div className="mt-3 text-[10px] font-mono text-slate-400">
              Selected Branch: <br />
              <span className="text-white font-sans font-semibold">{currentUser.focusEntity}</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
