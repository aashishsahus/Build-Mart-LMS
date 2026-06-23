import React, { useState, useEffect } from 'react';
import { Avatar } from './Avatar';
import { UserWithRole } from '../data/stateManager';
import { 
  Brain, 
  Award, 
  Plus, 
  Trash2, 
  ShieldAlert, 
  Play, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Settings, 
  User, 
  Building2,
  ListRestart,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  ClipboardList,
  Sparkles,
  HelpCircle,
  Check,
  Search,
  Filter,
  Calendar,
  UserCheck,
  Eye,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ScreeningTestProps {
  currentUser: UserWithRole;
  onAttemptSaved?: () => void;
}

export interface ManualQuestion {
  id: string;
  jobRole: string;
  questionText: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctOption: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
}

interface EvaluationResult {
  userId?: string;
  userName?: string;
  userEmail?: string;
  score: number; // calculated score out of 10
  strengths: string[];
  weaknesses: string[];
  summary: string;
  jobRole: string;
  completedAt: string;
  answersSummary?: { questionText: string; selected: string; correct: string; isCorrect: boolean }[];
}

const defaultManualQuestions: ManualQuestion[] = [
  // Senior Accountant - double entry reconciliation
  {
    id: 'q_acc_1',
    jobRole: 'Senior Accountant - double entry reconciliation',
    questionText: 'Which of the following journal entries is correct for reconciling an unrecorded bank charge on the bank statement?',
    options: {
      A: 'Debit Accounts Payable, Credit Cash',
      B: 'Debit Bank Charges Expense, Credit Bank Account',
      C: 'Debit Bank Account, Credit Bank Charges Expense',
      D: 'Debit Retained Earnings, Credit Cash'
    },
    correctOption: 'B',
    explanation: 'Unrecorded bank charges reduce the cash balance. To record them, debit the Bank Charges expense account and credit the Cash/Bank account.'
  },
  {
    id: 'q_acc_2',
    jobRole: 'Senior Accountant - double entry reconciliation',
    questionText: 'When reconciling subsidiary ledger accounts, which process is standard for detecting fraud or dual-reconciliation errors?',
    options: {
      A: 'Matching control account totals in general ledger with subsidiary ledger balances',
      B: 'Simply restarting the accounting software',
      C: 'Deleting duplicate client ledger records directly',
      D: 'Transferring unbalanced items to miscellaneous business expenses'
    },
    correctOption: 'A',
    explanation: 'Matching the General Ledger control accounts with the individual subsidiary ledger balances guarantees consistency and checks for reconciliation errors.'
  },
  {
    id: 'q_acc_3',
    jobRole: 'Senior Accountant - double entry reconciliation',
    questionText: 'Which of the following holds true under strict accrual accounting principles?',
    options: {
      A: 'Revenue is recognized when cash is received, regardless of when it is earned.',
      B: 'Expenses are recognized when cash is paid, regardless of when they are incurred.',
      C: 'Revenue is recognized when earned, and expenses are matched/recognized when incurred.',
      D: 'Accrual accounting is only used for tax avoidance.'
    },
    correctOption: 'C',
    explanation: 'Accrual accounting recognizes transactions and events when they occur, rather than when cash changes hands.'
  },

  // Tax Auditor & Compliance Lead
  {
    id: 'q_tax_1',
    jobRole: 'Tax Auditor & Compliance Lead',
    questionText: 'Under Indian GST compliance rules, what is the penalty for deliberate tax evasion or utilizing fake input tax credit (ITC)?',
    options: {
      A: '10% of tax evaded',
      B: '100% of the tax evaded or ₹10,000, whichever is higher, along with criminal liability risk',
      C: 'A simple warning without any financial fine',
      D: 'Freezing of company bank accounts forever without a trial'
    },
    correctOption: 'B',
    explanation: 'GST laws prescribe a 100% penalty on deliberate tax evasion, fake ITC claims, or fraudulent transactions to deter tax offenses.'
  },
  {
    id: 'q_tax_2',
    jobRole: 'Tax Auditor & Compliance Lead',
    questionText: 'Which auditing procedure provides the strongest evidence for the physical existence and valuation of assets?',
    options: {
      A: 'Inquiring with the receptionist',
      B: 'Reviewing a letter from the head accountant',
      C: 'Direct physical inventory count, verification, and observation at year-end',
      D: 'Recalculating the previous year tax forms'
    },
    correctOption: 'C',
    explanation: 'Physical verification and inspection provide the most reliable evidence for the actual physical existence and state of physical assets.'
  },

  // Senior Full-Stack Developer
  {
    id: 'q_dev_1',
    jobRole: 'Senior Full-Stack Developer',
    questionText: 'Which database isolation level prevents dirty reads, non-repeatable reads, and phantom reads using strict concurrent serial transaction locks?',
    options: {
      A: 'Read Uncommitted',
      B: 'Read Committed',
      C: 'Repeatable Read',
      D: 'Serializable'
    },
    correctOption: 'D',
    explanation: 'Serializable level offers the highest level of isolation by completely locking datasets to prevent concurrency conflicts like dirty reads or phantoms.'
  },
  {
    id: 'q_dev_2',
    jobRole: 'Senior Full-Stack Developer',
    questionText: 'In React, what is the best hook to optimize performance for a component that must compute a large, filtered dataset only when its dependency changes?',
    options: {
      A: 'useEffect',
      B: 'useMemo',
      C: 'useCallback',
      D: 'useRef'
    },
    correctOption: 'B',
    explanation: 'useMemo memoizes the result of an expensive calculation, preventing unnecessary recalculations on subsequent re-renders unless dependencies change.'
  },

  // Associate Accounts Officer
  {
    id: 'q_assoc_1',
    jobRole: 'Associate Accounts Officer',
    questionText: 'Which financial statement represents a specific point in time snapshot of assets, liabilities, and owners equity?',
    options: {
      A: 'Income Statement',
      B: 'Balance Sheet',
      C: 'Cash Flow Statement',
      D: 'Change in Equity Statement'
    },
    correctOption: 'B',
    explanation: 'The Balance Sheet shows the financial position of a business at a specific point in time, unlike income or cash flow statements which cover a period of time.'
  },

  // GST Tax Filing Assistant
  {
    id: 'q_gst_1',
    jobRole: 'GST Tax Filing Assistant',
    questionText: 'What is the frequency of filing GSTR-1 returns for a taxpayer registered under the QRMP scheme?',
    options: {
      A: 'Monthly',
      B: 'Quarterly',
      C: 'Annually',
      D: 'Weekly'
    },
    correctOption: 'B',
    explanation: 'Taxpayers under the QRMP (Quarterly Return Monthly Payment) scheme are eligible to file GSTR-1 and GSTR-3B on a quarterly basis.'
  }
];

const roleMetadata: Record<string, { desc: string; competencies: string[]; icon: any }> = {
  'Senior Accountant - double entry reconciliation': {
    desc: 'Verify double-entry ledger logs, balance sheets, and strict accrual accounting.',
    competencies: ['FIFO Ledger Auditing', 'reconciliation checks', 'SOP compliance'],
    icon: Building2
  },
  'Tax Auditor & Compliance Lead': {
    desc: 'National tax compliance, audit trails, and penalty code inspections.',
    competencies: ['ITC Verification', 'GST Penalty Auditing', 'Audit Trails'],
    icon: ShieldAlert
  },
  'Senior Full-Stack Developer': {
    desc: 'Database isolations, state memoizations, and enterprise code patterns.',
    competencies: ['ACID serial locks', 'useMemo cache optimization', 'modular code design'],
    icon: Brain
  },
  'Associate Accounts Officer': {
    desc: 'Financial snapshots, trial balances, liabilities, and owners equity checkups.',
    competencies: ['Balance Sheets', 'Asset Snapshots', 'Cash Flow Analysis'],
    icon: Award
  },
  'GST Tax Filing Assistant': {
    desc: 'File GST quarterly forms, GSTR-1 & GSTR-3B filings under specific schemes.',
    competencies: ['QRMP Scheme Rules', 'GSTR matching metrics', 'Filing timelines'],
    icon: ClipboardList
  }
};

export default function ScreeningTest({ currentUser, onAttemptSaved }: ScreeningTestProps) {
  // Preset Job Roles
  const presetRoles = [
    'Senior Accountant - double entry reconciliation',
    'Tax Auditor & Compliance Lead',
    'Senior Full-Stack Developer',
    'Associate Accounts Officer',
    'GST Tax Filing Assistant'
  ];

  // States
  const [selectedRole, setSelectedRole] = useState(presetRoles[0]);
  const [questions, setQuestions] = useState<ManualQuestion[]>([]);
  const [activeTab, setActiveTab] = useState<'testing' | 'admin_builder' | 'admin_reports'>('testing');
  
  // MCQ testing progress states
  const [testActive, setTestActive] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  
  // Evaluation States
  const [isCompleted, setIsCompleted] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [knowledgeScore, setKnowledgeScore] = useState<number | null>(null);
  const [allScreeningEvals, setAllScreeningEvals] = useState<any[]>([]);

  // Search/Filters in Reports Tab
  const [reportSearch, setReportSearch] = useState('');
  const [reportRoleFilter, setReportRoleFilter] = useState('All');
  const [selectedReportDetail, setSelectedReportDetail] = useState<EvaluationResult | null>(null);

  // Admin Custom Question Builder Inputs
  const [newRole, setNewRole] = useState(presetRoles[0]);
  const [newRoleCustom, setNewRoleCustom] = useState('');
  const [newQText, setNewQText] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctOpt, setCorrectOpt] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [explanationText, setExplanationText] = useState('');
  const [errorBuilder, setErrorBuilder] = useState('');
  const [successBuilder, setSuccessBuilder] = useState('');

  // Non-blocking states
  const [screeningToast, setScreeningToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [confirmDeleteQuestionId, setConfirmDeleteQuestionId] = useState<string | null>(null);
  const [confirmWipeLogsOpen, setConfirmWipeLogsOpen] = useState(false);
  const [showUnansweredConfirm, setShowUnansweredConfirm] = useState<number | null>(null);

  const showScreeningToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setScreeningToast({ message, type });
    setTimeout(() => {
      setScreeningToast(null);
    }, 4500);
  };

  // Is Admin Indicator
  const isAdmin = currentUser.roleId === 'role_sr_acc' || 
                  currentUser.roleId === 'role_md' || 
                  currentUser.roleId === 'role_ceo' || 
                  currentUser.roleId === 'role_coo' || 
                  currentUser.department === 'Director';

  // Load Manual Questions and Answers on mount
  useEffect(() => {
    loadQuestions();
    loadLatestScores();
  }, [currentUser]);

  const loadQuestions = () => {
    try {
      const storedQuestions = localStorage.getItem('lms_manual_questions_v1');
      if (storedQuestions) {
        setQuestions(JSON.parse(storedQuestions));
      } else {
        localStorage.setItem('lms_manual_questions_v1', JSON.stringify(defaultManualQuestions));
        setQuestions(defaultManualQuestions);
      }
    } catch (e) {
      console.error('Error loading manual questions:', e);
      setQuestions(defaultManualQuestions);
    }
  };

  const saveQuestionsToStorage = (updatedList: ManualQuestion[]) => {
    try {
      localStorage.setItem('lms_manual_questions_v1', JSON.stringify(updatedList));
      setQuestions(updatedList);
    } catch (e) {
      console.error('Error saving manual questions:', e);
    }
  };

  const loadLatestScores = () => {
    // 1. MCQ Knowledge score from lms_exam_attempts_v1
    try {
      const allAttemptsStr = localStorage.getItem('lms_exam_attempts_v1') || '[]';
      const allAttempts = JSON.parse(allAttemptsStr);
      const userAttempts = allAttempts.filter((a: any) => a.userId === currentUser.id);
      if (userAttempts.length > 0) {
        const latestAttempt = userAttempts[userAttempts.length - 1];
        setKnowledgeScore(latestAttempt.score);
      } else {
        setKnowledgeScore(null);
      }
    } catch (e) {
      console.error('Error loading MCQ attempts score:', e);
    }

    // 2. Chat evaluation score from localstorage
    try {
      const allEvalsStr = localStorage.getItem('lms_screening_evaluations_v1') || '[]';
      const allEvals = JSON.parse(allEvalsStr);
      setAllScreeningEvals(allEvals);
      const userEvals = allEvals.filter((e: any) => e.userId === currentUser.id);
      if (userEvals.length > 0) {
        setEvaluation(userEvals[userEvals.length - 1]);
        setIsCompleted(true);
      } else {
        setEvaluation(null);
        setIsCompleted(false);
      }
    } catch (e) {
      console.error('Error loading screening evaluations:', e);
    }
  };

  // Switch tabs
  const handleTabChange = (tab: 'testing' | 'admin_builder' | 'admin_reports') => {
    setActiveTab(tab);
    loadLatestScores();
    loadQuestions();
  };

  // Filter questions for the selected candidate role
  const activeRoleQuestions = questions.filter(q => q.jobRole === selectedRole);

  const handleStartManualTest = () => {
    if (activeRoleQuestions.length === 0) {
      showScreeningToast(`No screening questions are currently configured for "${selectedRole}". Go to Admin Console or configure default ones.`, "error");
      return;
    }
    setTestActive(true);
    setCurrentQuestionIdx(0);
    setSelectedAnswers({});
    setIsCompleted(false);
    setEvaluation(null);
  };

  const handleAnswerSelect = (option: 'A' | 'B' | 'C' | 'D') => {
    const q = activeRoleQuestions[currentQuestionIdx];
    setSelectedAnswers(prev => ({
      ...prev,
      [q.id]: option
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx < activeRoleQuestions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(prev => prev - 1);
    }
  };

  const executeSubmitManualTest = () => {
    let correctCount = 0;
    const summaryReports: any[] = [];
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    activeRoleQuestions.forEach(q => {
      const selected = selectedAnswers[q.id] || 'None';
      const isCorrect = selected === q.correctOption;
      if (isCorrect) {
        correctCount++;
        strengths.push(`${q.questionText.substring(0, 45)}... (Correct Option: ${q.correctOption})`);
      } else {
        weaknesses.push(`${q.questionText.substring(0, 45)}... (Missed; expected ${q.correctOption})`);
      }

      summaryReports.push({
        questionText: q.questionText,
        selected,
        correct: q.correctOption,
        explanation: q.explanation || '',
        isCorrect
      });
    });

    const finalScoreFloat = activeRoleQuestions.length > 0 ? (correctCount / activeRoleQuestions.length) * 10 : 0;
    const finalScore = Math.round(finalScoreFloat * 10) / 10; // Keep 1 decimal places

    // Generate neat human summary
    let summaryText = '';
    if (finalScore >= 8.5) {
      summaryText = `Outstanding screening performance! Candidate demonstrated masterclass expertise in the specific processes of ${selectedRole}. Highly authorized for immediate dual-reconciliation and independent audit operations.`;
    } else if (finalScore >= 6.0) {
      summaryText = `Competent results. The candidate has solid average working knowledge in standard operational ledger and compliance protocols relating to ${selectedRole}. Fits perfectly into our standard workflows.`;
    } else {
      summaryText = `Baseline score. Suggests gaps in core operational mechanics or compliance protocols for ${selectedRole}. Recommend additional supervision or classroom learning in General Ledger and GST modules before assignment.`;
    }

    if (strengths.length === 0) {
      strengths.push("Shows core motivation and discipline to take the test.");
    }
    if (weaknesses.length === 0) {
      weaknesses.push("None identified under these specific diagnostic questions.");
    }

    const report: EvaluationResult = {
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      score: finalScore,
      strengths,
      weaknesses,
      summary: summaryText,
      jobRole: selectedRole,
      completedAt: new Date().toISOString(),
      answersSummary: summaryReports
    };

    // Save user evaluation in localStorage
    try {
      const allEvalsStr = localStorage.getItem('lms_screening_evaluations_v1') || '[]';
      const allEvals = JSON.parse(allEvalsStr);
      const filteredEvals = allEvals.filter((e: any) => e.userId !== currentUser.id || e.jobRole !== selectedRole);
      filteredEvals.push(report);
      localStorage.setItem('lms_screening_evaluations_v1', JSON.stringify(filteredEvals));
      
      setEvaluation(report);
      setIsCompleted(true);
      setTestActive(false);
      setShowUnansweredConfirm(null);
      
      if (onAttemptSaved) {
        onAttemptSaved();
      }
    } catch (e) {
      console.error('Error saving screening result:', e);
      showScreeningToast('Unfinished save: client storage write failure.', 'error');
    }
  };

  const handleSubmitManualTest = () => {
    // Audit check: make sure all questions are answered
    const unansweredCount = activeRoleQuestions.filter(q => !selectedAnswers[q.id]).length;
    if (unansweredCount > 0) {
      setShowUnansweredConfirm(unansweredCount);
      return;
    }
    executeSubmitManualTest();
  };

  const handleResetTestState = () => {
    setIsCompleted(false);
    setTestActive(false);
    setEvaluation(null);
    setSelectedAnswers({});
    setCurrentQuestionIdx(0);
  };

  const handleAddCustomQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBuilder('');
    setSuccessBuilder('');

    const targetRole = newRoleCustom.trim() ? newRoleCustom.trim() : newRole;

    if (!newQText.trim()) {
      setErrorBuilder('Please provide the main Question text.');
      return;
    }
    if (!optA.trim() || !optB.trim() || !optC.trim() || !optD.trim()) {
      setErrorBuilder('Please provide all 4 multiple-choice options (A, B, C, D).');
      return;
    }

    const newQ: ManualQuestion = {
      id: 'q_custom_' + Date.now(),
      jobRole: targetRole,
      questionText: newQText.trim(),
      options: {
        A: optA.trim(),
        B: optB.trim(),
        C: optC.trim(),
        D: optD.trim()
      },
      correctOption: correctOpt,
      explanation: explanationText.trim() || undefined
    };

    const updated = [...questions, newQ];
    saveQuestionsToStorage(updated);

    setNewQText('');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
    setExplanationText('');
    setNewRoleCustom('');
    setSuccessBuilder(`Question successfully registered for designation: "${targetRole}"!`);
  };

  const handleDeleteQuestion = (id: string) => {
    if (confirm('Are you sure you want to delete this question? This action is immediate.')) {
      const updated = questions.filter(q => q.id !== id);
      saveQuestionsToStorage(updated);
    }
  };

  const handleClearScreeningLogs = () => {
    if (confirm('Are you sure you want to wipe all screening logs? This cannot be undone.')) {
      localStorage.setItem('lms_screening_evaluations_v1', '[]');
      setAllScreeningEvals([]);
      setEvaluation(null);
      setIsCompleted(false);
      alert('Screening logs cleared successfully.');
    }
  };

  const getAptitudeColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'text-indigo-600 bg-indigo-50 border-indigo-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  // Filtered reports
  const filteredReports = allScreeningEvals.filter(e => {
    const matchesSearch = 
      (e.userName || '').toLowerCase().includes(reportSearch.toLowerCase()) ||
      (e.userEmail || '').toLowerCase().includes(reportSearch.toLowerCase());
    const matchesRole = reportRoleFilter === 'All' || e.jobRole === reportRoleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-305" id="screening-test-root">
      
      {/* Upper Title Segment */}
      <div className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-200 pb-6 text-left">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono tracking-widest text-indigo-700 uppercase font-black bg-indigo-50 border border-indigo-150 px-2.5 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-600 animate-pulse" />
              Build Mart • HR recruitment testing standard
            </span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-slate-900 mt-1 flex items-center gap-3 tracking-tight">
            <ClipboardList className="w-8 h-8 text-indigo-600 shrink-0" />
            Recruitment Technical Screening
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl font-medium">
            Strict manual evaluation checklists mapped per designation. Allows the talent acquisition team to verify practical competencies and dual reconciliation skills before on-boarding.
          </p>
        </div>

        {/* Global Tracker showing scorecards */}
        <div className="flex flex-wrap items-center gap-3">
          {/* MCQ Aptitude scorecard */}
          <div className="bg-white border select-none border-slate-200 rounded-2xl p-4 shadow-3xs flex items-center gap-3 text-left">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <div>
              <p className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Aptitude Exam Score</p>
              <p className="text-base font-black text-slate-800 mt-0.5">
                {knowledgeScore !== null ? `${knowledgeScore}%` : 'Not Attempted'}
              </p>
            </div>
            {knowledgeScore !== null && (
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${getAptitudeColor(knowledgeScore)}`}>
                {knowledgeScore >= 60 ? 'Mastered' : 'Low Score'}
              </span>
            )}
          </div>

          {/* screening evaluation score */}
          <div className="bg-white border select-none border-slate-200 rounded-2xl p-4 shadow-3xs flex items-center gap-3 text-left">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
            <div>
              <p className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Screening score</p>
              <p className="text-base font-black text-slate-800 mt-0.5">
                {evaluation ? `${evaluation.score}/10` : 'Not Attempted'}
              </p>
            </div>
            {evaluation && (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border text-indigo-700 bg-indigo-50 border-indigo-150">
                {evaluation.score >= 7.0 ? 'Qualified' : 'Requires review'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Admin Quick Options Tabs */}
      {isAdmin ? (
        <div className="flex border-b border-slate-200 mb-8 font-sans text-xs gap-1 md:gap-2">
          <button
            onClick={() => handleTabChange('testing')}
            className={`pb-4 px-4 font-bold transition flex items-center gap-2 cursor-pointer border-b-2 ${
              activeTab === 'testing' 
                ? 'border-indigo-600 text-indigo-600 font-extrabold' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Play className="w-4 h-4" />
            Candidate Test Player
          </button>
          
          <button
            onClick={() => handleTabChange('admin_builder')}
            className={`pb-4 px-4 font-bold transition flex items-center gap-2 cursor-pointer border-b-2 ${
              activeTab === 'admin_builder' 
                ? 'border-indigo-600 text-indigo-600 font-extrabold' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Settings className="w-4 h-4 text-indigo-500" />
            Questions Architect ({questions.length})
          </button>

          <button
            onClick={() => handleTabChange('admin_reports')}
            className={`pb-4 px-4 font-bold transition flex items-center gap-2 cursor-pointer border-b-2 ${
              activeTab === 'admin_reports' 
                ? 'border-indigo-600 text-indigo-600 font-extrabold' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            Graded Reports ({allScreeningEvals.length})
          </button>
        </div>
      ) : (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-5 py-3 mb-6 text-left flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" />
          <p className="text-xs text-indigo-900 font-semibold">
            You are logged in as candidate <strong>{currentUser.name}</strong>. Accessing candidate verification workflow. Your responses are directly evaluated by official recruiters.
          </p>
        </div>
      )}

      {/* TAB CONTENT 1: TESTING PLAYER FOR CANDIDATES */}
      {activeTab === 'testing' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Assessment Container */}
          <div className="lg:col-span-8">
            
            {/* 1.1 Intro Menu to Choose Role & Start Test */}
            {!testActive && !isCompleted && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 relative overflow-hidden text-left space-y-6">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100/30 rounded-full blur-3xl pointer-events-none"></div>

                <div className="flex items-center gap-4">
                  <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-150 text-indigo-700 flex items-center justify-center shadow-3xs">
                    <Brain className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">Screening Configuration</h3>
                    <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mt-0.5">Build Mart Recruiter Auditing Matrix</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                  Select the target job designation context below. Each designation is compiled of rigorous conceptual questions to measure technical capabilities, risk profiling, compliance, and dual ledger logic.
                </p>

                {/* Role Designation Selector Grid */}
                <div className="space-y-4">
                  <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">Select Designation Profile</label>
                  <div className="grid grid-cols-1 gap-3">
                    {presetRoles.map((role) => {
                      const countForRole = questions.filter(q => q.jobRole === role).length;
                      const roleMeta = roleMetadata[role] || {
                        desc: 'Custom designated operational tasks checklist.',
                        competencies: ['Custom metrics', 'Task audits'],
                        icon: ClipboardList
                      };
                      const RoleIcon = roleMeta.icon;
                      const isSelected = selectedRole === role;

                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setSelectedRole(role)}
                          className={`p-4 sm:p-5 rounded-2xl border text-left transition duration-200 cursor-pointer flex items-start gap-4 ${
                            isSelected 
                              ? 'bg-indigo-600 text-white border-transparent shadow-md' 
                              : 'bg-white text-slate-705 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className={`p-2.5 rounded-xl shrink-0 ${
                            isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-600'
                          }`}>
                            <RoleIcon className="w-5 h-5" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-extrabold text-sm truncate">{role}</span>
                              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                isSelected ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-100 text-slate-550'
                              }`}>
                                {countForRole} Qs
                              </span>
                            </div>
                            <p className={`text-[11px] mt-1 leading-normal font-medium ${
                              isSelected ? 'text-indigo-200' : 'text-slate-500'
                            }`}>
                              {roleMeta.desc}
                            </p>
                            
                            {/* Competency tags */}
                            <div className="flex flex-wrap gap-1 mt-3">
                              {roleMeta.competencies.map((comp) => (
                                <span 
                                  key={comp} 
                                  className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                                    isSelected 
                                      ? 'bg-indigo-700/60 text-indigo-100 border border-indigo-500/30' 
                                      : 'bg-slate-50 text-slate-600 border border-slate-200/60'
                                  }`}
                                >
                                  {comp}
                                </span>
                              ))}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Warn alert box */}
                <div className="border border-amber-150 bg-amber-50/70 text-amber-900 rounded-xl p-4 flex gap-3 text-xs text-left leading-relaxed">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                  <div className="font-semibold">
                    <p className="font-extrabold text-amber-950">Important Notice:</p>
                    Once active, you cannot reset or switch designation profiles until submission. Take your time to carefully review the problem statements before answering.
                  </div>
                </div>

                <div className="pt-5 flex flex-col sm:flex-row gap-4 justify-between items-center border-t border-slate-200">
                  <span className="text-[11px] font-mono text-slate-400 font-semibold uppercase">
                    SELECTED Designation: <strong className="text-indigo-600 font-sans tracking-tight block sm:inline">{selectedRole}</strong>
                  </span>
                  
                  <button
                    onClick={handleStartManualTest}
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer shadow-md"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    Begin Technical Exam
                  </button>
                </div>
              </div>
            )}

            {/* 1.2 THE MCQ PLAYER INTERFACE */}
            {testActive && activeRoleQuestions.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-lg flex flex-col overflow-hidden text-left">
                {/* Status Bar */}
                <div className="bg-slate-900 text-white px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-sm text-indigo-50 border border-indigo-400">
                      Q
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-indigo-50 flex items-center gap-1.5 uppercase tracking-wide">
                        Active Screening Candidate Panel
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      </h4>
                      <p className="text-[10px] font-mono text-indigo-300 tracking-wider">Role Designation: {selectedRole}</p>
                    </div>
                  </div>

                  <div className="bg-indigo-900/40 text-indigo-200 text-[10px] font-mono px-3 py-1.5 rounded-lg border border-indigo-800 font-extrabold flex items-center gap-2 self-start sm:self-auto">
                    <span>PROGRESS CONFIG:</span> 
                    <span className="text-white bg-indigo-600 px-1.5 py-0.5 rounded leading-none">{currentQuestionIdx + 1} / {activeRoleQuestions.length}</span>
                  </div>
                </div>

                {/* Progress bar indicator */}
                <div className="w-full bg-slate-100 h-1.5">
                  <div 
                    className="bg-indigo-600 h-1.5 transition-all duration-300"
                    style={{ width: `${((currentQuestionIdx + 1) / activeRoleQuestions.length) * 100}%` }}
                  ></div>
                </div>

                <div className="p-6 sm:p-8 space-y-6">
                  {/* The Current Question Text */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-indigo-500 font-bold uppercase tracking-widest flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5" />
                      Question Challenge Code
                    </span>
                    <h3 className="text-sm sm:text-base font-black text-slate-900 leading-relaxed font-sans mt-1">
                      {activeRoleQuestions[currentQuestionIdx].questionText}
                    </h3>
                  </div>

                  {/* Options List */}
                  <div className="grid grid-cols-1 gap-3">
                    {Object.entries(activeRoleQuestions[currentQuestionIdx].options).map(([key, value]) => {
                      const isSelected = selectedAnswers[activeRoleQuestions[currentQuestionIdx].id] === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleAnswerSelect(key as any)}
                          className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm font-semibold transition active:scale-[0.99] cursor-pointer flex items-center gap-3 ${
                            isSelected 
                              ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-2xs shadow-indigo-100/40' 
                              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <span className={`w-6.5 h-6.5 rounded-lg text-xs font-mono font-extrabold flex items-center justify-center shrink-0 border ${
                            isSelected ? 'bg-indigo-600 text-white border-transparent' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {key}
                          </span>
                          <span className="font-sans leading-snug">{value}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Dynamic Question Status Navigator Grid */}
                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-[10px] font-mono font-extrabold text-slate-400 uppercase tracking-widest mb-3 text-left">
                      Question Dashboard Navigator
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      {activeRoleQuestions.map((q, idx) => {
                        const isAnswered = !!selectedAnswers[q.id];
                        const isActive = idx === currentQuestionIdx;
                        return (
                          <button
                            key={q.id}
                            type="button"
                            onClick={() => setCurrentQuestionIdx(idx)}
                            className={`w-8 h-8 rounded-xl text-xs font-mono font-bold flex items-center justify-center cursor-pointer transition ${
                              isActive
                                ? 'bg-indigo-600 text-white border-2 border-indigo-300 shadow-sm ring-2 ring-indigo-100'
                                : isAnswered
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                                  : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {idx + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Navigation Controls */}
                <div className="bg-slate-50 border-t border-slate-200 p-4 flex justify-between items-center whitespace-nowrap">
                  <button
                    onClick={handlePrevQuestion}
                    disabled={currentQuestionIdx === 0}
                    className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-white text-slate-700 rounded-xl text-xs font-bold font-sans flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Previous
                  </button>

                  <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest hidden sm:block">
                    {Object.keys(selectedAnswers).length} answered of {activeRoleQuestions.length}
                  </div>

                  {currentQuestionIdx < activeRoleQuestions.length - 1 ? (
                    <button
                      onClick={handleNextQuestion}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold font-sans flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                    >
                      Next
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitManualTest}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold font-sans flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Finish & Submit
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 1.3 ASSESSMENT SCORECARD REPORT */}
            {isCompleted && evaluation && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 sm:p-8 relative overflow-hidden text-left space-y-6">
                
                {/* Header card representing Certification look */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-xl">
                      <Award className="w-6.5 h-6.5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">Screening Performance Certificate</h3>
                      <p className="text-[10px] font-mono text-slate-400 font-semibold uppercase mt-0.5">Job Designation: {evaluation.jobRole}</p>
                    </div>
                  </div>

                  <button
                    onClick={handleResetTestState}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-705 px-3 py-1.5 rounded-lg text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto border hover:border-slate-300"
                  >
                    <ListRestart className="w-4 h-4" />
                    Retake Assessment
                  </button>
                </div>

                {/* Score badge grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Score badge 1: MCQ */}
                  <div className="border rounded-xl p-4 bg-slate-50 flex items-center justify-between border-slate-200">
                    <div className="text-left font-sans">
                      <p className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-widest">Aptitude Exam Score</p>
                      <p className="text-xl font-black text-slate-900 mt-1">
                        {knowledgeScore !== null ? `${knowledgeScore}%` : 'Not Attempted'}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">Passing requirement: 60%</p>
                    </div>
                    <div className={`p-2 rounded-full border shrink-0 ${
                      knowledgeScore !== null && knowledgeScore >= 60 ? 'bg-emerald-105 bg-emerald-100 border-emerald-200 text-emerald-700' : 'bg-rose-100 border-rose-200 text-rose-700'
                    }`}>
                      {knowledgeScore !== null && knowledgeScore >= 60 ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    </div>
                  </div>

                  {/* Score badge 2: Manual screening scorecard */}
                  <div className="border rounded-xl p-4 bg-slate-900 text-white flex items-center justify-between border-slate-800">
                    <div className="text-left font-sans">
                      <p className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-widest">Manual Screening Score</p>
                      <p className="text-2xl font-black text-indigo-400 mt-1">
                        {evaluation.score} <span className="text-slate-450 text-xs">/ 10</span>
                      </p>
                      <p className="text-[10px] text-slate-300 mt-1">Evaluated from questions database</p>
                    </div>
                    <div className="bg-indigo-900/50 p-2 text-indigo-100 rounded-lg text-[9px] font-mono font-black border border-indigo-750 tracking-wider uppercase shrink-0">
                      {evaluation.score >= 7.0 ? 'PASSED ✓' : 'REVIEW'}
                    </div>
                  </div>

                </div>

                {/* Narrative recap */}
                <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-4">
                  <h4 className="text-xs font-mono font-extrabold uppercase text-indigo-800 border-b border-indigo-150 pb-1.5 mb-2.5 tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-indigo-600" />
                    Lead Recruiter Diagnostic Remarks
                  </h4>
                  <p className="text-xs font-semibold leading-relaxed text-slate-700">
                    {evaluation.summary}
                  </p>
                </div>

                {/* In-depth answers summary breakdown */}
                {evaluation.answersSummary && (
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-mono font-extrabold uppercase text-slate-400 tracking-wider">Answer Key Verification Sheet</h4>
                    <div className="space-y-3">
                      {evaluation.answersSummary.map((ans, idx) => (
                        <div key={idx} className="bg-white border hover:shadow-2xs transition rounded-xl p-4 space-y-3 border-slate-200">
                          <div className="flex items-start justify-between gap-3">
                            <p className="font-bold text-slate-800 flex-1 leading-snug">{idx + 1}. {ans.questionText}</p>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase shrink-0 border ${
                              ans.isCorrect ? 'text-emerald-700 bg-emerald-50 border-emerald-150' : 'text-rose-700 bg-rose-50 border-rose-150'
                            }`}>
                              {ans.isCorrect ? 'Correct ✓' : 'Incorrect ✗'}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-medium bg-slate-50 p-3 rounded-lg border">
                            <p className="text-slate-600">Your Selection: <strong className={ans.isCorrect ? 'text-emerald-700 font-extrabold' : 'text-rose-600 font-extrabold'}>{ans.selected}</strong></p>
                            <p className="text-slate-600">Correct Option: <strong className="text-emerald-700 font-extrabold">{ans.correct}</strong></p>
                          </div>
                          {ans.explanation && (
                            <p className="text-[11px] text-slate-500 italic font-medium leading-relaxed bg-slate-50/50 p-2 rounded">
                              💡 Explanation Note: {ans.explanation}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Right Column details */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Simulation identity info card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm text-left">
              <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3.5">
                Active Candidate Session
              </h4>
              
              <div className="flex items-center gap-3 bg-slate-50/70 rounded-xl p-3 border">
                <Avatar 
                  src={currentUser.avatarUrl}
                  name={currentUser.name}
                  className="w-11 h-11 border"
                />
                <div className="overflow-hidden">
                  <h5 className="font-extrabold text-xs text-slate-900 truncate">{currentUser.name}</h5>
                  <p className="text-[10px] font-mono text-slate-400 truncate">{currentUser.email}</p>
                  <div className="text-[9px] font-mono font-extrabold text-indigo-600 uppercase mt-1 tracking-wider bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-150 inline-block">
                    {currentUser.role?.name || 'TRAINEE APPLICANT'}
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 mt-3.5 leading-normal font-sans">
                *The screening evaluation will be bound to this participant record. You can simulate other candidate testers or staff accounts by switching the user in the upper right-hand simulation dropdown.
              </p>
            </div>

            {/* General instruction stats card */}
            <div className="bg-gradient-to-b from-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-sm text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.05] rounded-full blur-2xl pointer-events-none"></div>
              <h4 className="text-xs font-mono font-extrabold text-indigo-300 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Screening Protocol
              </h4>
              <div className="space-y-3.5 text-xs text-indigo-100 font-sans leading-relaxed font-semibold">
                <p>
                  1. <strong>Select Designation:</strong> Make sure you select the correct job designation mapped to your recruitment profile.
                </p>
                <p>
                  2. <strong>Instant Results:</strong> Upon finishing your submission, the results are auto-logged instantly, and visible to recruiters on the graded reports tab.
                </p>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB CONTENT 2: ADMIN QUESTION BUILDER ARCHITECT */}
      {activeTab === 'admin_builder' && isAdmin && (
        <div className="space-y-8 text-left animate-in fade-in duration-150">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Config Form Panel */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-2">
                <Plus className="w-6 h-6 text-indigo-600" />
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Create Manual Technical Question</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Register new multiple choice testing parameters on the fly</p>
                </div>
              </div>

              {errorBuilder && (
                <div className="p-3.5 bg-rose-50 border border-rose-250 text-rose-800 rounded-xl flex items-center gap-2 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorBuilder}</span>
                </div>
              )}

              {successBuilder && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-xl flex items-center gap-2 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successBuilder}</span>
                </div>
              )}

              <form onSubmit={handleAddCustomQuestion} className="space-y-5 font-sans">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase mb-2">Select Designation Preset</label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-205 focus:border-indigo-500 rounded-xl p-3 text-xs font-semibold text-slate-800 transition"
                    >
                      {presetRoles.map((role) => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase mb-2">Or write Custom Designation Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Accounts Supervisor"
                      value={newRoleCustom}
                      onChange={(e) => setNewRoleCustom(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-205 focus:border-indigo-505 rounded-xl p-3 text-xs font-medium text-slate-800 placeholder:text-slate-400 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase mb-2">Question Text Prompt (Case Study/Scenario/Code snippet)</label>
                  <textarea
                    rows={2}
                    value={newQText}
                    onChange={(e) => setNewQText(e.target.value)}
                    placeholder="e.g. What is the standard depreciation entry under the double declining balance method?"
                    className="w-full bg-slate-50 border border-slate-205 focus:border-indigo-505 rounded-xl p-3 text-xs font-medium text-slate-800 placeholder:text-slate-400 transition"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase mb-2">Option A Description</label>
                    <input
                      type="text"
                      required
                      value={optA}
                      onChange={(e) => setOptA(e.target.value)}
                      placeholder="Option A text statement"
                      className="w-full bg-slate-50 border border-slate-205 rounded-xl p-3 text-xs font-medium text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase mb-2">Option B Description</label>
                    <input
                      type="text"
                      required
                      value={optB}
                      onChange={(e) => setOptB(e.target.value)}
                      placeholder="Option B text statement"
                      className="w-full bg-slate-50 border border-slate-205 rounded-xl p-3 text-xs font-medium text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase mb-2">Option C Description</label>
                    <input
                      type="text"
                      required
                      value={optC}
                      onChange={(e) => setOptC(e.target.value)}
                      placeholder="Option C text statement"
                      className="w-full bg-slate-50 border border-slate-205 rounded-xl p-3 text-xs font-medium text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase mb-2">Option D Description</label>
                    <input
                      type="text"
                      required
                      value={optD}
                      onChange={(e) => setOptD(e.target.value)}
                      placeholder="Option D text statement"
                      className="w-full bg-slate-50 border border-slate-205 rounded-xl p-3 text-xs font-medium text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase mb-2">Correct Answer Option</label>
                    <select
                      value={correctOpt}
                      onChange={(e) => setCorrectOpt(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-205 focus:border-indigo-505 rounded-xl p-3 text-xs font-semibold text-slate-800"
                    >
                      <option value="A">Option A</option>
                      <option value="B">Option B</option>
                      <option value="C">Option C</option>
                      <option value="D">Option D</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase mb-2">Explanation or Technical Context (Optional)</label>
                    <input
                      type="text"
                      value={explanationText}
                      onChange={(e) => setExplanationText(e.target.value)}
                      placeholder="Why is this option correct? (shown in reportheet)"
                      className="w-full bg-slate-50 border border-slate-205 rounded-xl p-3 text-xs font-medium text-slate-800"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition cursor-pointer active:scale-95 shadow-sm"
                  >
                    Save Question to Database
                  </button>
                </div>
              </form>
            </div>

            {/* LIVE DYNAMIC PREVIEW CARD FOR REAL-TIME FIDELITY */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-slate-900 text-slate-300 rounded-2xl border border-slate-800 p-5 text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600/10 rounded-full blur-2xl"></div>
                
                <h4 className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                  Live Dynamic Creator Preview
                </h4>
                <p className="text-[11px] text-slate-450 text-slate-400 leading-normal mb-4">
                  Dynamic visual preview of what the candidate will see during their live screening exam.
                </p>

                {/* Draft Quiz box */}
                <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 space-y-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-indigo-400 uppercase font-black">Designation: {newRoleCustom.trim() || newRole}</span>
                    <p className="font-bold text-white leading-relaxed">
                      {newQText.trim() ? newQText : 'Draft Question display prompt will appear here as you type...'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    {[
                      { l: 'A', text: optA },
                      { l: 'B', text: optB },
                      { l: 'C', text: optC },
                      { l: 'D', text: optD }
                    ].map((opt) => (
                      <div 
                        key={opt.l} 
                        className={`p-2.5 rounded-lg border text-left font-semibold text-[11px] flex items-center gap-2 ${
                          correctOpt === opt.l && opt.text
                            ? 'bg-indigo-950/80 border-indigo-500 text-indigo-200'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded text-[9px] font-mono font-black flex items-center justify-center ${
                          correctOpt === opt.l && opt.text ? 'bg-indigo-600 text-white' : 'bg-slate-850 text-slate-500'
                        }`}>
                          {opt.l}
                        </span>
                        <span className="truncate">{opt.text || 'Draft Option Statement...'}</span>
                      </div>
                    ))}
                  </div>

                  {explanationText.trim() && (
                    <div className="text-[10px] text-indigo-300/80 leading-snug italic pt-2 border-t border-slate-850">
                      💡 Notes: {explanationText}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Configuration List */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-md sm:text-lg font-black text-slate-900 tracking-tight">
                Active Question Database Matrix ({questions.length} Questions Registered)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Manage and audit current question banks categorized by designations.</p>
            </div>

            <div className="space-y-4">
              {presetRoles.map((role) => {
                const roleQuestions = questions.filter(q => q.jobRole === role);
                return (
                  <div key={role} className="border border-slate-200 rounded-2xl overflow-hidden shadow-3xs">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-3.5 flex items-center justify-between flex-wrap gap-2 text-left">
                      <span className="text-xs font-black text-slate-900 font-sans">{role}</span>
                      <span className="text-[10px] bg-white text-slate-600 font-mono font-bold px-2 py-0.5 rounded border">
                        {roleQuestions.length} Questions Mapped
                      </span>
                    </div>

                    {roleQuestions.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic py-6 text-center bg-white">No questions configured for this designation.</p>
                    ) : (
                      <div className="divide-y divide-slate-100 bg-white">
                        {roleQuestions.map((q, idx) => (
                          <div key={q.id} className="p-4 sm:p-5 space-y-3 hover:bg-slate-50/40 transition text-left">
                            <div className="flex items-start justify-between gap-4">
                              <p className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">{idx + 1}. {q.questionText}</p>
                              <button
                                onClick={() => handleDeleteQuestion(q.id)}
                                className="text-rose-600 hover:text-rose-800 p-2 rounded-xl hover:bg-rose-50 transition shrink-0 cursor-pointer border border-transparent hover:border-rose-100"
                                title="Delete Question"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-sans text-slate-600 pl-4 border-l-2 border-slate-100">
                              <div><strong className="text-slate-400">A:</strong> {q.options.A}</div>
                              <div><strong className="text-slate-400">B:</strong> {q.options.B}</div>
                              <div><strong className="text-slate-400">C:</strong> {q.options.C}</div>
                              <div><strong className="text-slate-400">D:</strong> {q.options.D}</div>
                            </div>

                            <div className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-150 inline-block font-semibold">
                              Correct: Option <strong className="font-extrabold">{q.correctOption}</strong> {q.explanation && `• ${q.explanation}`}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* TAB CONTENT 3: ADMIN GRADED REPORTS & OVERVIEW */}
      {activeTab === 'admin_reports' && isAdmin && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 text-left animate-in fade-in duration-150 space-y-6">
          <div className="flex justify-between items-center flex-wrap gap-4 border-b border-slate-200 pb-5">
            <div>
              <h3 className="text-md sm:text-lg font-black text-[#1e1b4b] flex items-center gap-2 uppercase font-sans tracking-wide">
                <UserCheck className="w-5.5 h-5.5 text-indigo-600" />
                Screening Results Ledger
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Comprehensive records of MCQ technical candidate performance evaluations mapped by role designations.
              </p>
            </div>

            {allScreeningEvals.length > 0 && (
              <button
                onClick={handleClearScreeningLogs}
                className="bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-extrabold text-[10px] uppercase tracking-wider px-3.5 py-1.5 rounded-lg transition shrink-0 cursor-pointer active:scale-95 shadow-3xs"
              >
                Clear Graded Logs
              </button>
            )}
          </div>

          {/* Interactive Search Tool and Category Filters */}
          <div className="bg-slate-50 border rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <label className="block text-[9px] font-mono font-black text-slate-400 uppercase tracking-widest mb-1">Search Candidate</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter name / email..."
                  value={reportSearch}
                  onChange={(e) => setReportSearch(e.target.value)}
                  className="w-full bg-white border border-slate-250 focus:border-indigo-500 rounded-xl py-2 pl-9 pr-3 text-xs font-semibold text-slate-800 transition shadow-3xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-mono font-black text-slate-400 uppercase tracking-widest mb-1">Designation Filter</label>
              <div className="relative">
                <Filter className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                <select
                  value={reportRoleFilter}
                  onChange={(e) => setReportRoleFilter(e.target.value)}
                  className="w-full bg-white border border-slate-250 focus:border-indigo-505 rounded-xl py-2 pl-9 pr-3 text-xs font-semibold text-slate-800 transition shadow-3xs cursor-pointer"
                >
                  <option value="All">All Designations ({allScreeningEvals.length})</option>
                  {presetRoles.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Total Counters */}
            <div className="flex items-center justify-end bg-white border rounded-xl px-4 py-2 text-right shadow-3xs">
              <div>
                <span className="text-[9px] font-mono text-slate-400 uppercase font-black block leading-none">Graded Match Found</span>
                <span className="text-xl sm:text-2xl font-black text-indigo-950 font-mono tracking-tight mt-1 inline-block">
                  {filteredReports.length} <span className="text-xs text-slate-400 font-sans font-medium">results</span>
                </span>
              </div>
            </div>
          </div>

          {filteredReports.length === 0 ? (
            <div className="text-center py-16 bg-slate-50/50 border border-dashed rounded-xl p-6">
              <ClipboardList className="w-11 h-11 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-black text-slate-850">No Candidate Screening Results Match</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Try loosening your search criteria or have candidates take examinations first!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse text-xs bg-white font-sans">
                <thead>
                  <tr className="bg-slate-50 text-slate-800 font-display text-[10px] uppercase border-b border-slate-200 font-extrabold tracking-wider">
                    <th className="py-3 px-4 font-bold">Candidate Info</th>
                    <th className="py-3 px-4 font-bold">Designation Context</th>
                    <th className="py-3 px-4 font-bold">Score Sheet</th>
                    <th className="py-3 px-4 font-bold">Certified Date</th>
                    <th className="py-3 px-4 font-bold text-right text-indigo-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold font-sans text-slate-700">
                  {filteredReports.map((e, idx) => {
                    const isPassed = e.score >= 7.0;
                    return (
                      <tr key={idx} className="hover:bg-slate-50/40 transition">
                        <td className="py-4 px-4 font-sans">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-100 border text-slate-650 flex items-center justify-center font-bold text-xs">
                              {e.userName?.substring(0, 1) || 'A'}
                            </div>
                            <div>
                              <p className="font-extrabold text-[#111827]">{e.userName || 'Anonymous Applicant'}</p>
                              <p className="text-[10px] font-mono text-slate-400">{e.userEmail || 'no-email@buildmart.com'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-slate-800 font-medium">
                          {e.jobRole}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono font-black text-xs sm:text-sm text-indigo-750 shrink-0">
                              {e.score} <span className="text-slate-400 text-xs">/10</span>
                            </span>
                            
                            {/* Score status pill */}
                            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                              isPassed 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {isPassed ? 'Qualified' : 'Supervise'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-mono text-slate-400 text-[10px]">
                          {e.completedAt ? new Date(e.completedAt).toLocaleDateString() : 'Just Now'}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => setSelectedReportDetail(selectedReportDetail?.userId === e.userId && selectedReportDetail?.jobRole === e.jobRole ? null : e)}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition py-1 px-2.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-150 cursor-pointer flex items-center gap-1 ml-auto"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            {selectedReportDetail?.userId === e.userId && selectedReportDetail?.jobRole === e.jobRole ? 'Close Sheet' : 'Audit Sheet'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Drill-down Answer audit Sheet detail */}
          {selectedReportDetail && (
            <div className="mt-6 border border-indigo-150 bg-indigo-50/20 rounded-2xl p-6 space-y-4 animate-in slide-in-from-top-4 duration-200">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
                <div>
                  <h4 className="font-black text-indigo-950 text-sm">Designation Audit Sheet: <span className="text-indigo-600">{selectedReportDetail.userName}</span></h4>
                  <p className="text-[10px] font-mono text-slate-400">Assessed on Designation: {selectedReportDetail.jobRole}</p>
                </div>
                <button
                  onClick={() => setSelectedReportDetail(null)}
                  className="text-slate-400 hover:text-slate-600 font-extrabold text-sm p-1"
                >
                  ✕
                </button>
              </div>

              <div className="bg-white rounded-xl border p-4 shadow-3xs">
                <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1.5">Remarks Summary</p>
                <p className="text-xs font-semibold text-slate-705 leading-relaxed italic pr-4">
                  "{selectedReportDetail.summary}"
                </p>
              </div>

              {selectedReportDetail.answersSummary ? (
                <div className="space-y-3 pt-2">
                  <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest pl-1">Detailed Answers Breakdown</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedReportDetail.answersSummary.map((ans: any, idx: number) => (
                      <div key={idx} className="bg-white border rounded-xl p-4 space-y-3 text-left">
                        <div className="flex items-start justify-between gap-3">
                          <p className="font-bold text-xs text-slate-800 leading-snug">{idx + 1}. {ans.questionText}</p>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-black uppercase shrink-0 border ${
                            ans.isCorrect ? 'text-emerald-700 bg-emerald-50 border-emerald-250' : 'text-rose-700 bg-rose-50 border-rose-250'
                          }`}>
                            {ans.isCorrect ? 'Correct ✓' : 'Incorrect ✗'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono bg-slate-50 p-2 rounded border">
                          <p className="text-slate-500">Selected: <strong className={ans.isCorrect ? 'text-emerald-700' : 'text-rose-700'}>{ans.selected}</strong></p>
                          <p className="text-slate-500">Correct: <strong className="text-emerald-700">{ans.correct}</strong></p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No detailed selection logs exist for this record.</p>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
