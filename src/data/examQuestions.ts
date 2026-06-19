/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ExamQuestion {
  id: string;
  topic: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export const examQuestions: ExamQuestion[] = [
  {
    id: 'q1',
    topic: 'Accounts Payable & 3-Way Match',
    question: 'Which of the following documents is NOT required for completing a standard Three-Way Match in Accounts Payable (AP)?',
    options: [
      'Goods Receipt Note (GRN)',
      'Purchase Order (PO)',
      'Vendor Bill / Supplier Invoice',
      'Sales Quotation Offer (from competing vendors)'
    ],
    correctAnswerIndex: 3,
    explanation: 'A standard three-way match reconciles the Purchase Order (PO), Goods Receipt Note (GRN), and the actual Supplier Invoice. A sales quotation is a preliminary offer and plays no role in matching booked bills.'
  },
  {
    id: 'q2',
    topic: 'GST Compliance & Taxation',
    question: 'What is the primary operational utility of looking up GSTR-2B logs on the Government GST Portal?',
    options: [
      'To file annual corporate vehicle asset depreciation filings',
      'To verify and claim Input Tax Credit (ITC) by matching seller-reported invoices against internal ERP bookings',
      'To calculate employee provident fund deduction slab systems',
      'To register international remittance declarations for logistics branches'
    ],
    correctAnswerIndex: 1,
    explanation: 'GSTR-2B is an auto-drafted, static Input Tax Credit (ITC) statement that displays GST reported by suppliers. Matching it with our purchase ledger ensures we do not claim incorrect credits and helps spot missing invoices.'
  },
  {
    id: 'q3',
    topic: 'General Ledger Imprests',
    question: 'Under a petty cash imprest system, if a floating reserve of Rs. 5,000 is established and Rs. 4,200 is verified spent during the month, what reimbursement should be paid?',
    options: [
      'Rs. 5,000 to double the floating reserves',
      'Rs. 800 representing the residual ledger reserves',
      'Rs. 4,200 to restore the float back to its baseline of Rs. 5,000',
      'Rs. 9,200 cumulative valuation of assets'
    ],
    correctAnswerIndex: 2,
    explanation: 'An imprest system reimburses the exact sum expended during the period, restoring the petty cash chest cash balance back to its original established float level.'
  },
  {
    id: 'q4',
    topic: 'Double-Entry Accounting principles',
    question: 'What is the golden accounting entry rule for Nominal Accounts (Expenses, Salaries, Rent, Commission, etc.)?',
    options: [
      'Debit what comes in, credit what goes out',
      'Debit the receiver, credit the giver',
      'Debit all expenses and losses, credit all income and gains',
      'Debit asset expansions, credit liability settlements'
    ],
    correctAnswerIndex: 2,
    explanation: 'The nominal account rule is "Debit all expenses and losses; Credit all incomes and gains". Real accounts relate to "Debit what comes in..." and Personal accounts relate to "Debit the receiver...".'
  },
  {
    id: 'q5',
    topic: 'Bank Reconciliation (BRS)',
    question: 'While preparing a monthly BRS, starting with "Debit Balance as per Cash Book", how should "Cheques issued by us but not yet presented for payment" be adjusted?',
    options: [
      'Added (Credit adjust cash balance since bank hasn\'t cleared it yet)',
      'Subtracted from the starting Cash Book ledger value',
      'Ignored completely since payment transaction is already completed on our side',
      'Charged as bank penalty interest charges'
    ],
    correctAnswerIndex: 0,
    explanation: 'Cheques issued but not presented reduce our Cash Book balance, but have not yet reduced our actual bank statement balance. Therefore, to reconcile starting with the Cash Book balance, we must Add them back.'
  },
  {
    id: 'q6',
    topic: 'Corporate Financial Consolidation',
    question: 'When consolidating financial summaries for Rathi Buildmart branches and parent holds, what is the primary purpose of Inter-company Transaction Eliminations?',
    options: [
      'To artificially scale down net statutory tax obligations across entities',
      'To eliminate double-counting of sales, costs, and outstanding debt balances occurring inside the single economic entity',
      'To ensure columns match comfortably in automated spreadsheet software templates',
      'To comply with GSTR-3B monthly offset restrictions'
    ],
    correctAnswerIndex: 1,
    explanation: 'Intercompany allocations represent internal movements of goods or obligations. If not eliminated, the consolidated results would exaggerate the true sales, payables, and receivables of the unified group to external partners.'
  },
  {
    id: 'q7',
    topic: 'Monthly Financial Closing Accruals',
    question: 'An office telephone invoice of Rs. 12,000 is received on June 5th for billing consumption during the month of May. What adjusting entry must be logged as of May 31st under standard GAAP?',
    options: [
      'Debit Telephone Expense, Credit Cash/Bank on receipt date',
      'Debit Telephone Expense Rs. 12,000, Credit Outstanding/Accrued Liability accounts on May 31st',
      'Debit Prepaid Telephone Expense, Credit Telephone Expense',
      'No journal entry is needed until the payment clears the bank statement next month'
    ],
    correctAnswerIndex: 1,
    explanation: 'The matching and accrual concepts dictate that expenses are recognized when incurred, regardless of payment timing. Crediting outstanding accrued liabilities on May 31st registers this expense in the correct month.'
  },
  {
    id: 'q8',
    topic: 'Fixed Asset capitalization standards',
    question: 'Which of the following expenditures of an industrial machinery purchased should NOT be capitalized into the Fixed Asset Register (FAR)?',
    options: [
      'Ocean freight transport insurance and site delivery costs',
      'Specialized engineering consulting charges for initial installation & assembly testing',
      'The cost of routine periodic filter replacements and maintenance labor after 1 year of active service',
      'State customs duty tax payments charged during initial port clearance'
    ],
    correctAnswerIndex: 2,
    explanation: 'Any cost vital to bringing a fixed asset to its working condition is capitalized. Routine repairs, cleaning, and replacement parts occurring post-operation are revenue expenditures charged to profit & loss, not capitalized.'
  },
  {
    id: 'q9',
    topic: 'Statutory Audits',
    question: 'What is the structural intention of formulating a statutory audit "Lead Schedule"?',
    options: [
      'To detail the flight logistics and accommodation calendars for international auditors',
      'To outline a specific balance sheet or transaction class showing opening data, period additions, disposals, and closing counts backed by evidence verification sheets',
      'To rank employees based on how fast they complete general ledger journals',
      'To file automatic GST input tax credit matching on TRACES servers'
    ],
    correctAnswerIndex: 1,
    explanation: 'A Lead Schedule is an audit control document. It bridges general ledger entries and trial balances to supporting proof schedules, reconciling starting balances, active period changes, and final end auditing sums.'
  },
  {
    id: 'q10',
    topic: 'Credit Controls & Aging Reports',
    question: 'A weekly Accounts Receivable Ageing report reveals that a key client has crossed their credit line with Rs. 3,50,000 outstanding under "90+ Days Past Due". What is the ideal credit control policy?',
    options: [
      'Approve an immediate emergency credit limit expansion to maintain buyer relationship goodwill',
      'Place a security hold blocking subsequent material dispatch bills and trigger formal dunning letter escalations',
      'Write off the entire outstanding ledger balance immediately as a corporate tax write-off loss',
      'Reconcile with GSTR-2B to adjust outward tax credits'
    ],
    correctAnswerIndex: 1,
    explanation: 'Accounts showing large balances past 90 days represent severe default risk. Locking shipping balances prevents further exposure while formal dunning reminds the customer of payment schedules without causing total writing loss.'
  }
];
