/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Role, User, Chapter, Unit, ProgressLog, ProgressStatus, CertificateTemplate, CompanyBranding, ExamQuestion, ExamConfig, GlobalNotification } from '../types';
import { initialRoles, initialUsers, initialChapters, initialUnits, initialProgress, initialDepartments } from './initialRecords';
import { setCollectionData, setDocumentData, getCollectionData, isFirebasePlaceholder, deleteDocumentsBatch } from './firebase';

// Keys for LocalStorage
const KEYS = {
  ROLES: 'lms_roles_v1',
  USERS: 'lms_users_v1',
  CHAPTERS: 'lms_chapters_v1',
  UNITS: 'lms_units_v1',
  PROGRESS: 'lms_progress_v1',
  CURRENT_USER_ID: 'lms_current_user_id_v1',
  DEPARTMENTS: 'lms_departments_v1',
  CERT_TEMPLATE: 'lms_cert_template_v1',
  COMPANY_BRANDING: 'lms_company_branding_v1',
  QUESTIONS: 'lms_questions_v1',
  EXAM_CONFIG: 'lms_exam_config_v1',
  NOTIFICATIONS: 'lms_notifications_v1'
};

export const defaultCertificateTemplate: CertificateTemplate = {
  focusEntity: "Rathi's Buildmart Ltd",
  subHeader: "Office of Operations Integrity & Standard Execution",
  title: "Certificate of Mastery",
  proudlyAwardedTo: "This formal competency is proudly awarded to",
  bodyText: "for successfully completing all configured operational training modules, checklists, and demonstrating standard execution mastery in the role of",
  signatureText: "Rathi Operations Ltd.",
  signatureTitle: "Training Registrar verifier",
  signatureSub: "Rathi's Buildmart LLC",
  stampLabel: "MASTERED",
  establishedText: "ESTABLISHED 2026"
};

export const defaultCompanyBranding: CompanyBranding = {
  companyName: "Build Mart",
  companyAbbreviation: "LMS",
  companyTagline: "MEMBER OF RATHI BUILDMART PLC",
  logoType: 'icon',
  logoValue: 'BookOpen'
};

export const initialQuestions: ExamQuestion[] = [
  {
    id: 'q1',
    chapterId: 'ch_ap_workflow',
    type: 'mcq',
    topic: 'Accounts Payable & 3-Way Match',
    question: 'Which of the following documents is NOT required for completing a standard Three-Way Match in Accounts Payable (AP)?',
    options: [
      'Goods Receipt Note (GRN)',
      'Purchase Order (PO)',
      'Vendor Bill / Supplier Invoice',
      'Sales Quotation Offer (from competing vendors)'
    ],
    correctAnswerIndex: 3,
    explanation: 'A standard three-way match reconciles the Purchase Order (PO), Goods Receipt Note (GRN), and the actual Supplier Invoice. A sales quotation is a preliminary offer and plays no role in matching booked bills.',
    isActive: true
  },
  {
    id: 'q2',
    chapterId: 'ch_tax_gst',
    type: 'mcq',
    topic: 'GST Compliance & Taxation',
    question: 'What is the primary operational utility of looking up GSTR-2B logs on the Government GST Portal?',
    options: [
      'To file annual corporate vehicle asset depreciation filings',
      'To verify and claim Input Tax Credit (ITC) by matching seller-reported invoices against internal ERP bookings',
      'To calculate employee provident fund deduction slab systems',
      'To register international remittance declarations for logistics branches'
    ],
    correctAnswerIndex: 1,
    explanation: 'GSTR-2B is an auto-drafted, static Input Tax Credit (ITC) statement that displays GST reported by suppliers. Matching it with our purchase ledger ensures we do not claim incorrect credits and helps spot missing invoices.',
    isActive: true
  },
  {
    id: 'q3',
    chapterId: 'ch_jr_gl_ctl',
    type: 'mcq',
    topic: 'General Ledger Imprests',
    question: 'Under a petty cash imprest system, if a floating reserve of Rs. 5,000 is established and Rs. 4,200 is verified spent during the month, what reimbursement should be paid?',
    options: [
      'Rs. 5,000 to double the floating reserves',
      'Rs. 800 representing the residual ledger reserves',
      'Rs. 4,200 to restore the float back to its baseline of Rs. 5,000',
      'Rs. 9,200 cumulative valuation of assets'
    ],
    correctAnswerIndex: 2,
    explanation: 'An imprest system reimburses the exact sum expended during the period, restoring the petty cash chest cash balance back to its original established float level.',
    isActive: true
  },
  {
    id: 'q4',
    chapterId: 'ch_cand_screening',
    type: 'mcq',
    topic: 'Double-Entry Accounting principles',
    question: 'What is the golden accounting entry rule for Nominal Accounts (Expenses, Salaries, Rent, Commission, etc.)?',
    options: [
      'Debit what comes in, credit what goes out',
      'Debit the receiver, credit the giver',
      'Debit all expenses and losses, credit all income and gains',
      'Debit asset expansions, credit liability settlements'
    ],
    correctAnswerIndex: 2,
    explanation: 'The nominal account rule is "Debit all expenses and losses; Credit all incomes and gains". Real accounts relate to "Debit what comes in..." and Personal accounts relate to "Debit the receiver...".',
    isActive: true
  },
  {
    id: 'q5',
    chapterId: 'ch_jr_gl_ctl',
    type: 'mcq',
    topic: 'Bank Reconciliation (BRS)',
    question: 'While preparing a monthly BRS, starting with "Debit Balance as per Cash Book", how should "Cheques issued by us but not yet presented for payment" be adjusted?',
    options: [
      'Added (Credit adjust cash balance since bank hasn\'t cleared it yet)',
      'Subtracted from the starting Cash Book ledger value',
      'Ignored completely since payment transaction is already completed on our side',
      'Charged as bank penalty interest charges'
    ],
    correctAnswerIndex: 0,
    explanation: 'Cheques issued but not presented reduce our Cash Book balance, but have not yet reduced our actual bank statement balance. Therefore, to reconcile starting with the Cash Book balance, we must Add them back.',
    isActive: true
  },
  {
    id: 'q6',
    chapterId: 'ch_sr_close',
    type: 'mcq',
    topic: 'Corporate Financial Consolidation',
    question: 'When consolidating financial summaries for Rathi Buildmart branches and parent holds, what is the primary purpose of Inter-company Transaction Eliminations?',
    options: [
      'To artificially scale down net statutory tax obligations across entities',
      'To eliminate double-counting of sales, costs, and outstanding debt balances occurring inside the single economic entity',
      'To ensure columns match comfortably in automated spreadsheet software templates',
      'To comply with GSTR-3B monthly offset restrictions'
    ],
    correctAnswerIndex: 1,
    explanation: 'Intercompany allocations represent internal movements of goods or obligations. If not eliminated, the consolidated results would exaggerate the true sales, payables, and receivables of the unified group to external partners.',
    isActive: true
  },
  {
    id: 'q7',
    chapterId: 'ch_sr_close',
    type: 'mcq',
    topic: 'Monthly Financial Closing Accruals',
    question: 'An office telephone invoice of Rs. 12,000 is received on June 5th for billing consumption during the month of May. What adjusting entry must be logged as of May 31st under standard GAAP?',
    options: [
      'Debit Telephone Expense, Credit Cash/Bank on receipt date',
      'Debit Telephone Expense Rs. 12,000, Credit Outstanding/Accrued Liability accounts on May 31st',
      'Debit Prepaid Telephone Expense, Credit Telephone Expense',
      'No journal entry is needed until the payment clears the bank statement next month'
    ],
    correctAnswerIndex: 1,
    explanation: 'The matching and accrual concepts dictate that expenses are recognized when incurred, regardless of payment timing. Crediting outstanding accrued liabilities on May 31st registers this expense in the correct month.',
    isActive: true
  },
  {
    id: 'q8',
    chapterId: 'ch_jr_assets',
    type: 'mcq',
    topic: 'Fixed Asset capitalization standards',
    question: 'Which of the following expenditures of an industrial machinery purchased should NOT be capitalized into the Fixed Asset Register (FAR)?',
    options: [
      'Ocean freight transport insurance and site delivery costs',
      'Specialized engineering consulting charges for initial installation & assembly testing',
      'The cost of routine periodic filter replacements and maintenance labor after 1 year of active service',
      'State customs duty tax payments charged during initial port clearance'
    ],
    correctAnswerIndex: 2,
    explanation: 'Any cost vital to bringing a fixed asset to its working condition is capitalized. Routine repairs, cleaning, and replacement parts occurring post-operation are revenue expenditures charged to profit & loss, not capitalized.',
    isActive: true
  },
  {
    id: 'q9',
    chapterId: 'ch_sr_audit',
    type: 'mcq',
    topic: 'Statutory Audits',
    question: 'What is the structural intention of formulating a statutory audit "Lead Schedule"?',
    options: [
      'To detail the flight logistics and accommodation calendars for international auditors',
      'To outline a specific balance sheet or transaction class showing opening data, period additions, disposals, and closing counts backed by evidence verification sheets',
      'To rank employees based on how fast they complete general ledger journals',
      'To file automatic GST input tax credit matching on TRACES servers'
    ],
    correctAnswerIndex: 1,
    explanation: 'A Lead Schedule is an audit control document. It bridges general ledger entries and trial balances to supporting proof schedules, reconciling starting balances, active period changes, and final end auditing sums.',
    isActive: true
  },
  {
    id: 'q10',
    chapterId: 'ch_ar_debt',
    type: 'mcq',
    topic: 'Credit Controls & Aging Reports',
    question: 'A weekly Accounts Receivable Ageing report reveals that a key client has crossed their credit line with Rs. 3,50,000 outstanding under "90+ Days Past Due". What is the ideal credit control policy?',
    options: [
      'Approve an immediate emergency credit limit expansion to maintain buyer relationship goodwill',
      'Place a security hold blocking subsequent material dispatch bills and trigger formal dunning letter escalations',
      'Write off the entire outstanding ledger balance immediately as a corporate tax write-off loss',
      'Reconcile with GSTR-2B to adjust outward tax credits'
    ],
    correctAnswerIndex: 1,
    explanation: 'Accounts showing large balances past 90 days represent severe default risk. Locking shipping balances prevents further exposure while formal dunning reminds the customer of payment schedules without causing total writing loss.',
    isActive: true
  },
  {
    id: 'q11',
    chapterId: 'ch_jr_gl_ctl',
    type: 'text',
    topic: 'Ledger Accounting Calculations',
    question: 'In General Ledger accounting, if we have a starting debit cash balance of Rs. 15,000, and we spend Rs. 3,500 on office stationery, what is the exact remaining ledger cash balance? (Provide response in format: Rs. X,XXX)',
    correctAnswerText: 'Rs. 11,500',
    explanation: 'An initial cash balance of Rs. 15,000 is credited by Rs. 3,500, resulting in a remaining debit balance of Rs. 11,500 (15,000 - 3,500).',
    isActive: true
  }
];

export const defaultExamConfig: ExamConfig = {
  examEnabled: true,
  requirePassToUnlockNext: false
};

// Initializer function to seed storage
export function initializeStorage() {
  if (typeof window === 'undefined') return;
  
  if (!localStorage.getItem(KEYS.ROLES)) {
    localStorage.setItem(KEYS.ROLES, JSON.stringify(initialRoles));
  }
  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(initialUsers));
  }
  if (!localStorage.getItem(KEYS.CHAPTERS)) {
    localStorage.setItem(KEYS.CHAPTERS, JSON.stringify(initialChapters));
  }
  if (!localStorage.getItem(KEYS.UNITS)) {
    localStorage.setItem(KEYS.UNITS, JSON.stringify(initialUnits));
  }
  if (!localStorage.getItem(KEYS.PROGRESS)) {
    localStorage.setItem(KEYS.PROGRESS, JSON.stringify(initialProgress));
  }
  if (!localStorage.getItem(KEYS.DEPARTMENTS)) {
    localStorage.setItem(KEYS.DEPARTMENTS, JSON.stringify(initialDepartments));
  }
  if (!localStorage.getItem(KEYS.CERT_TEMPLATE)) {
    localStorage.setItem(KEYS.CERT_TEMPLATE, JSON.stringify(defaultCertificateTemplate));
  }
  if (!localStorage.getItem(KEYS.COMPANY_BRANDING)) {
    localStorage.setItem(KEYS.COMPANY_BRANDING, JSON.stringify(defaultCompanyBranding));
  }
  if (!localStorage.getItem(KEYS.QUESTIONS)) {
    localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(initialQuestions));
  }
  if (!localStorage.getItem(KEYS.EXAM_CONFIG)) {
    localStorage.setItem(KEYS.EXAM_CONFIG, JSON.stringify(defaultExamConfig));
  }
  if (!localStorage.getItem(KEYS.NOTIFICATIONS)) {
    const initialNotifs: GlobalNotification[] = [
      {
        id: 'notif_init_1',
        title: 'Master LMS Platform Live 🚀',
        message: 'The standard operative learning portal (LMS) has launched for Aashish Sahu Group. All training workflows are synchronized.',
        timestamp: new Date().toISOString(),
        isReadBy: [],
        type: 'system',
        isAdminOnly: false,
        creatorName: 'Aashish Sahu'
      }
    ];
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(initialNotifs));
  }
}

export function getQuestions(): ExamQuestion[] {
  initializeStorage();
  const data = localStorage.getItem(KEYS.QUESTIONS);
  try {
    return data ? JSON.parse(data) : initialQuestions;
  } catch (e) {
    return initialQuestions;
  }
}

export function saveQuestions(data: ExamQuestion[]) {
  localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(data));
  setCollectionData('questions', data);
}

export function getExamConfig(): ExamConfig {
  initializeStorage();
  const data = localStorage.getItem(KEYS.EXAM_CONFIG);
  try {
    return data ? JSON.parse(data) : defaultExamConfig;
  } catch (e) {
    return defaultExamConfig;
  }
}

export function saveExamConfig(config: ExamConfig) {
  localStorage.setItem(KEYS.EXAM_CONFIG, JSON.stringify(config));
  setDocumentData('configs', 'exam_config', config);
}

export function getDepartments(): string[] {
  initializeStorage();
  const data = localStorage.getItem(KEYS.DEPARTMENTS);
  try {
    return data ? JSON.parse(data) : initialDepartments;
  } catch (e) {
    return initialDepartments;
  }
}

export function saveDepartments(data: string[]) {
  localStorage.setItem(KEYS.DEPARTMENTS, JSON.stringify(data));
  setDocumentData('configs', 'departments', { list: data });
}

// Getters
export function getRoles(): Role[] {
  initializeStorage();
  const data = localStorage.getItem(KEYS.ROLES);
  try {
    return data ? JSON.parse(data) : initialRoles;
  } catch (e) {
    return initialRoles;
  }
}

export function getUsers(): User[] {
  initializeStorage();
  const data = localStorage.getItem(KEYS.USERS);
  if (!data) return initialUsers;
  try {
    let users = JSON.parse(data) as User[];
    let changed = false;
    users = users.map(u => {
      // If the avatarUrl is a massive base64 string, reset it so that Firestore doesn't fail.
      if (u.avatarUrl && u.avatarUrl.startsWith('data:image/') && u.avatarUrl.length > 50000) {
        changed = true;
        return { ...u, avatarUrl: '' }; // remove the huge avatar
      }
      return u;
    });
    if (changed) {
      localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    }
    return users;
  } catch (e) {
    return initialUsers;
  }
}

export function getChapters(): Chapter[] {
  initializeStorage();
  const data = localStorage.getItem(KEYS.CHAPTERS);
  try {
    return data ? JSON.parse(data) : initialChapters;
  } catch (e) {
    return initialChapters;
  }
}

export function getUnits(): Unit[] {
  initializeStorage();
  const data = localStorage.getItem(KEYS.UNITS);
  try {
    return data ? JSON.parse(data) : initialUnits;
  } catch (e) {
    return initialUnits;
  }
}

export function getProgress(): ProgressLog[] {
  initializeStorage();
  const data = localStorage.getItem(KEYS.PROGRESS);
  try {
    const logs: ProgressLog[] = data ? JSON.parse(data) : initialProgress;
    return logs;
  } catch (e) {
    return initialProgress;
  }
}

export function getCurrentUserId(): string | null {
  initializeStorage();
  return localStorage.getItem(KEYS.CURRENT_USER_ID);
}

// Setters
export function saveRoles(data: Role[]) {
  localStorage.setItem(KEYS.ROLES, JSON.stringify(data));
  setCollectionData('roles', data);
}

export function saveUsers(data: User[]) {
  const previousDataStr = localStorage.getItem(KEYS.USERS);
  let idsToDelete: string[] = [];
  if (previousDataStr) {
    try {
      const previousData = JSON.parse(previousDataStr) as User[];
      const newIds = new Set(data.map(item => item.id));
      previousData.forEach(item => {
        if (!newIds.has(item.id)) {
          idsToDelete.push(item.id);
        }
      });
    } catch (e) {
      console.error("Error parsing previous users for sync:", e);
    }
  }

  localStorage.setItem(KEYS.USERS, JSON.stringify(data));
  setCollectionData('users', data);

  if (idsToDelete.length > 0) {
    deleteDocumentsBatch('users', idsToDelete).catch(err => {
      console.error("Failed to delete removed users in cloud:", err);
    });
  }
}

export function saveChapters(data: Chapter[]) {
  const previousDataStr = localStorage.getItem(KEYS.CHAPTERS);
  let idsToDelete: string[] = [];
  if (previousDataStr) {
    try {
      const previousData = JSON.parse(previousDataStr) as Chapter[];
      const newIds = new Set(data.map(item => item.id));
      previousData.forEach(item => {
        if (!newIds.has(item.id)) {
          idsToDelete.push(item.id);
        }
      });
    } catch (e) {
      console.error("Error parsing previous chapters for sync:", e);
    }
  }

  localStorage.setItem(KEYS.CHAPTERS, JSON.stringify(data));
  setCollectionData('chapters', data);

  if (idsToDelete.length > 0) {
    deleteDocumentsBatch('chapters', idsToDelete).catch(err => {
      console.error("Failed to delete removed chapters in cloud:", err);
    });
  }
}

export function saveUnits(data: Unit[]) {
  const previousDataStr = localStorage.getItem(KEYS.UNITS);
  let idsToDelete: string[] = [];
  if (previousDataStr) {
    try {
      const previousData = JSON.parse(previousDataStr) as Unit[];
      const newIds = new Set(data.map(item => item.id));
      previousData.forEach(item => {
        if (!newIds.has(item.id)) {
          idsToDelete.push(item.id);
        }
      });
    } catch (e) {
      console.error("Error parsing previous units for sync:", e);
    }
  }

  localStorage.setItem(KEYS.UNITS, JSON.stringify(data));
  setCollectionData('units', data);

  if (idsToDelete.length > 0) {
    deleteDocumentsBatch('units', idsToDelete).catch(err => {
      console.error("Failed to delete removed units in cloud:", err);
    });
  }
}

export function saveProgress(data: ProgressLog[]) {
  const previousDataStr = localStorage.getItem(KEYS.PROGRESS);
  let idsToDelete: string[] = [];
  if (previousDataStr) {
    try {
      const previousData = JSON.parse(previousDataStr) as ProgressLog[];
      const newIds = new Set(data.map(item => item.id));
      previousData.forEach(item => {
        if (!newIds.has(item.id)) {
          idsToDelete.push(item.id);
        }
      });
    } catch (e) {
      console.error("Error parsing previous progress for sync:", e);
    }
  }

  localStorage.setItem(KEYS.PROGRESS, JSON.stringify(data));
  setCollectionData('progress', data);

  if (idsToDelete.length > 0) {
    deleteDocumentsBatch('progress', idsToDelete).catch(err => {
      console.error("Failed to delete removed progress items in cloud:", err);
    });
  }
}

export function resetUserMastery(userId: string) {
  // 1. Reset progress log entries
  const currentLogs = getProgress();
  const updatedLogs = currentLogs.filter(log => log.userId !== userId);
  saveProgress(updatedLogs);

  // 2. Reset exam attempts from local storage
  try {
    const allAttemptsStr = localStorage.getItem('lms_exam_attempts_v1') || '[]';
    const allAttempts = JSON.parse(allAttemptsStr);
    const updatedAttempts = allAttempts.filter((att: any) => att.userId !== userId);
    localStorage.setItem('lms_exam_attempts_v1', JSON.stringify(updatedAttempts));
  } catch (e) {
    console.error("Error resetting user exam attempts:", e);
  }
}

export function setCurrentUserId(userId: string | null) {
  if (userId) {
    localStorage.setItem(KEYS.CURRENT_USER_ID, userId);
  } else {
    localStorage.removeItem(KEYS.CURRENT_USER_ID);
  }
}

// Reset store to default
export function resetToDefaults() {
  localStorage.removeItem(KEYS.ROLES);
  localStorage.removeItem(KEYS.USERS);
  localStorage.removeItem(KEYS.CHAPTERS);
  localStorage.removeItem(KEYS.UNITS);
  localStorage.removeItem(KEYS.PROGRESS);
  localStorage.removeItem(KEYS.CURRENT_USER_ID);
  localStorage.removeItem(KEYS.DEPARTMENTS);
  localStorage.removeItem(KEYS.CERT_TEMPLATE);
  localStorage.removeItem(KEYS.COMPANY_BRANDING);
  localStorage.removeItem(KEYS.QUESTIONS);
  localStorage.removeItem(KEYS.EXAM_CONFIG);
  initializeStorage();
  
  if (!isFirebasePlaceholder) {
    setCollectionData('roles', initialRoles);
    setCollectionData('users', initialUsers);
    setCollectionData('chapters', initialChapters);
    setCollectionData('units', initialUnits);
    setCollectionData('progress', initialProgress);
    setCollectionData('questions', initialQuestions);
    setDocumentData('configs', 'departments', { list: initialDepartments });
    setDocumentData('configs', 'branding', defaultCompanyBranding);
    setDocumentData('configs', 'cert_template', defaultCertificateTemplate);
    setDocumentData('configs', 'exam_config', defaultExamConfig);
  }
}

// Helper: Get user details with their matching Role object
export interface UserWithRole extends User {
  role?: Role;
}

export function getUserWithRole(userId: string): UserWithRole | null {
  const users = getUsers();
  const roles = getRoles();
  const user = users.find(u => u.id === userId);
  if (!user) return null;
  const role = roles.find(r => r.id === user.roleId);
  return { ...user, role };
}

// Helper: Calculate progress statistics for a user
export interface ProgressStats {
  totalUnits: number;
  completedCount: number;
  verifiedCount: number;
  inProgressCount: number;
  notStartedCount: number;
  overallPercent: number; // Verified + Completed under review
  masteryPercent: number; // Only Verified & Mastered
}

export function calculateUserProgress(userId: string, roleId: string | string[]): ProgressStats {
  const targetRoleIds = Array.isArray(roleId) ? roleId : [roleId];
  const chapters = getChapters().filter(c => targetRoleIds.includes(c.roleId));
  const chapterIds = chapters.map(c => c.id);
  const units = getUnits().filter(u => chapterIds.includes(u.chapterId));
  const progressLogs = getProgress().filter(p => p.userId === userId);

  const totalUnits = units.length;
  if (totalUnits === 0) {
    return {
      totalUnits: 0,
      completedCount: 0,
      verifiedCount: 0,
      inProgressCount: 0,
      notStartedCount: 0,
      overallPercent: 0,
      masteryPercent: 0
    };
  }

  let verifiedCount = 0;
  let completedCount = 0;
  let inProgressCount = 0;
  let notStartedCount = 0;

  units.forEach(unit => {
    const log = progressLogs.find(l => l.unitId === unit.id);
    const status = log ? log.status : 'Not Started';
    
    if (status === 'Verified & Mastered') {
      verifiedCount++;
    } else if (status === 'Completed (Pending Review)') {
      completedCount++;
    } else if (status === 'In Progress') {
      inProgressCount++;
    } else {
      notStartedCount++;
    }
  });

  const overallPercent = Math.round(((verifiedCount + completedCount) / totalUnits) * 100);
  const masteryPercent = Math.round((verifiedCount / totalUnits) * 100);

  return {
    totalUnits,
    completedCount,
    verifiedCount,
    inProgressCount,
    notStartedCount,
    overallPercent,
    masteryPercent
  };
}

// Update single unit progress
export function updateUnitProgress(
  userId: string,
  unitId: string,
  status: ProgressStatus,
  notes?: string,
  verifierId?: string,
  watchPercent?: number
): ProgressLog[] {
  const currentLogs = getProgress();
  const logId = `${userId}_${unitId}`;
  const existingIndex = currentLogs.findIndex(l => l.id === logId || (l.userId === userId && l.unitId === unitId));
  const existingLog = existingIndex >= 0 ? currentLogs[existingIndex] : null;

  let finalStatus = status;
  // If they have watched some percentage and status is 'Not Started', transition to 'In Progress'
  if (watchPercent && watchPercent > 0 && finalStatus === 'Not Started') {
    finalStatus = 'In Progress';
  }

  let startedAt = existingLog?.startedAt;
  let completedAt = existingLog?.completedAt;

  if (finalStatus === 'In Progress' && !startedAt) {
    startedAt = new Date().toISOString();
  }
  if ((finalStatus === 'Completed (Pending Review)' || finalStatus === 'Verified & Mastered') && !completedAt) {
    completedAt = new Date().toISOString();
  }

  let history = existingLog?.history ? [...existingLog.history] : [];
  
  // If status changed, or history is empty, add a history entry
  if (!existingLog || existingLog.status !== finalStatus || history.length === 0) {
    history.push({
      status: finalStatus,
      timestamp: new Date().toISOString(),
      changedBy: verifierId ? 'Administrator' : 'Employee/Trainee',
      notes: notes ?? ''
    });
  }

  const updatedLog: ProgressLog = {
    id: logId,
    userId,
    unitId,
    status: finalStatus,
    lastUpdated: new Date().toISOString(),
    notes: notes ?? (existingLog ? existingLog.notes : ''),
    verifiedBy: verifierId ?? (existingLog ? existingLog.verifiedBy : undefined),
    verificationDate: verifierId ? new Date().toISOString() : (existingLog ? existingLog.verificationDate : undefined),
    watchPercent: watchPercent ?? (existingLog ? existingLog.watchPercent : 0),
    startedAt,
    completedAt,
    history
  };

  if (existingIndex >= 0) {
    currentLogs[existingIndex] = updatedLog;
  } else {
    currentLogs.push(updatedLog);
  }

  saveProgress(currentLogs);
  return currentLogs;
}

export function getCertificateTemplate(): CertificateTemplate {
  initializeStorage();
  const data = localStorage.getItem(KEYS.CERT_TEMPLATE);
  try {
    return data ? JSON.parse(data) : defaultCertificateTemplate;
  } catch (e) {
    return defaultCertificateTemplate;
  }
}

export function saveCertificateTemplate(template: CertificateTemplate) {
  localStorage.setItem(KEYS.CERT_TEMPLATE, JSON.stringify(template));
  setDocumentData('configs', 'cert_template', template);
}

export function getCompanyBranding(): CompanyBranding {
  initializeStorage();
  const data = localStorage.getItem(KEYS.COMPANY_BRANDING);
  try {
    return data ? JSON.parse(data) : defaultCompanyBranding;
  } catch (e) {
    return defaultCompanyBranding;
  }
}

export function saveCompanyBranding(branding: CompanyBranding) {
  localStorage.setItem(KEYS.COMPANY_BRANDING, JSON.stringify(branding));
  setDocumentData('configs', 'branding', branding);
}

export async function syncAllWithCloud(): Promise<boolean> {
  if (isFirebasePlaceholder) {
    return false;
  }
  
  try {
    // 1. Roles
    const cloudRoles = await getCollectionData('roles');
    if (cloudRoles && cloudRoles.length > 0) {
      localStorage.setItem(KEYS.ROLES, JSON.stringify(cloudRoles));
    } else {
      await setCollectionData('roles', getRoles());
    }

    // 2. Users
    const cloudUsers = await getCollectionData('users');
    if (cloudUsers && cloudUsers.length > 0) {
      localStorage.setItem(KEYS.USERS, JSON.stringify(cloudUsers));
    } else {
      await setCollectionData('users', getUsers());
    }

    // 3. Chapters
    const cloudChapters = await getCollectionData('chapters');
    if (cloudChapters && cloudChapters.length > 0) {
      localStorage.setItem(KEYS.CHAPTERS, JSON.stringify(cloudChapters));
    } else {
      await setCollectionData('chapters', getChapters());
    }

    // 4. Units
    const cloudUnits = await getCollectionData('units');
    if (cloudUnits && cloudUnits.length > 0) {
      localStorage.setItem(KEYS.UNITS, JSON.stringify(cloudUnits));
    } else {
      await setCollectionData('units', getUnits());
    }

    // 5. Progress
    const cloudProgress = await getCollectionData('progress');
    if (cloudProgress && cloudProgress.length > 0) {
      localStorage.setItem(KEYS.PROGRESS, JSON.stringify(cloudProgress));
    } else {
      await setCollectionData('progress', getProgress());
    }

    // 6. Questions
    const cloudQuestions = await getCollectionData('questions');
    if (cloudQuestions && cloudQuestions.length > 0) {
      localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(cloudQuestions));
    } else {
      await setCollectionData('questions', getQuestions());
    }

    // 6.5. Notifications
    const cloudNotifs = await getCollectionData('notifications');
    if (cloudNotifs && cloudNotifs.length > 0) {
      localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(cloudNotifs));
    } else {
      await setCollectionData('notifications', getGlobalNotifications());
    }

    // 7. Configs (Departments, Branding, Cert Template, Exam Config)
    const cloudConfigs = await getCollectionData('configs');
    if (cloudConfigs && cloudConfigs.length > 0) {
      const depts = cloudConfigs.find((c: any) => c.id === 'departments');
      if (depts && depts.list) {
        localStorage.setItem(KEYS.DEPARTMENTS, JSON.stringify(depts.list));
      } else {
        await setDocumentData('configs', 'departments', { list: getDepartments() });
      }

      const brand = cloudConfigs.find((c: any) => c.id === 'branding');
      if (brand) {
        localStorage.setItem(KEYS.COMPANY_BRANDING, JSON.stringify(brand));
      } else {
        await setDocumentData('configs', 'branding', getCompanyBranding());
      }

      const cert = cloudConfigs.find((c: any) => c.id === 'cert_template');
      if (cert) {
        localStorage.setItem(KEYS.CERT_TEMPLATE, JSON.stringify(cert));
      } else {
        await setDocumentData('configs', 'cert_template', getCertificateTemplate());
      }

      const examCfg = cloudConfigs.find((c: any) => c.id === 'exam_config');
      if (examCfg) {
        localStorage.setItem(KEYS.EXAM_CONFIG, JSON.stringify(examCfg));
      } else {
        await setDocumentData('configs', 'exam_config', getExamConfig());
      }
    } else {
      await setDocumentData('configs', 'departments', { list: getDepartments() });
      await setDocumentData('configs', 'branding', getCompanyBranding());
      await setDocumentData('configs', 'cert_template', getCertificateTemplate());
      await setDocumentData('configs', 'exam_config', getExamConfig());
    }

    return true;
  } catch (error) {
    console.error("syncAllWithCloud failed to synchronize data: ", error);
    return false;
  }
}

export function getGlobalNotifications(): GlobalNotification[] {
  initializeStorage();
  const data = localStorage.getItem(KEYS.NOTIFICATIONS);
  if (!data) return [];
  try {
    const list = JSON.parse(data) as GlobalNotification[];
    // Auto-migrate any past Suresh Rathi text to Aashish Sahu Group for consistency
    let updated = false;
    const cleaned = list.map(notif => {
      if (notif.message.includes('Suresh Rathi')) {
        updated = true;
        return {
          ...notif,
          message: notif.message.replace(/Suresh Rathi/g, 'Aashish Sahu')
        };
      }
      return notif;
    });
    if (updated) {
      localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch (e) {
    return [];
  }
}

export function saveGlobalNotifications(data: GlobalNotification[]) {
  localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(data));
  setCollectionData('notifications', data);
}

export function addGlobalNotification(
  notification: Omit<GlobalNotification, 'id' | 'timestamp' | 'isReadBy'>
): GlobalNotification {
  const current = getGlobalNotifications();
  const newNotif: GlobalNotification = {
    ...notification,
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    timestamp: new Date().toISOString(),
    isReadBy: []
  };
  const updated = [newNotif, ...current];
  saveGlobalNotifications(updated);
  return newNotif;
}

