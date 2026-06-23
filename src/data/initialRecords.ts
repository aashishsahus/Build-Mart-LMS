/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Role, User, Chapter, Unit, ProgressLog } from '../types';

export const initialRoles: Role[] = [
  {
    id: 'role_md',
    name: 'Managing Director (MD)',
    department: 'Director',
    description: 'Responsible for general corporate governance, group business performance, and strategic direction of Build Mart.',
    skillRequirements: ['Executive Board Leadership', 'Corporate Finance Strategy', 'Global Business Operations', 'Strategic Decision Making']
  },
  {
    id: 'role_ceo',
    name: 'Chief Executive Officer (CEO)',
    department: 'Director',
    description: 'Responsible for key corporate initiatives, executive management oversight, and overall growth strategy of Build Mart.',
    skillRequirements: ['Strategic Execution', 'Public Relations Management', 'Portfolio Risk Governance', 'Capital Allocation']
  },
  {
    id: 'role_coo',
    name: 'Chief Operating Officer (COO)',
    department: 'Director',
    description: 'Directs the active business operations, logistics, dispatch lines, customer interfaces, and delivery efficiency standards.',
    skillRequirements: ['Operations Optimization', 'Supply Chain Coordination', 'SOP Governance', 'KPI Performance Monitoring']
  },
  {
    id: 'role_vp',
    name: 'Vice President (VP)',
    department: 'Director',
    description: 'Provides divisional leadership, corporate governance, and oversees key strategic relationships across regions.',
    skillRequirements: ['Executive Communication', 'Strategic Scaling', 'Large Scale Project Audits', 'Divisional Profitability']
  },
  {
    id: 'role_reg_mgr',
    name: 'Regional Manager',
    department: 'HO',
    description: 'Oversees branch networks, logistical hubs, area sales targets, and statutory compliance within a defined territory.',
    skillRequirements: ['Multi-branch Leadership', 'P&L Optimization', 'Area Sales Deployment', 'SOP Compliance Audit']
  },
  {
    id: 'role_area_mgr',
    name: 'Area Manager',
    department: 'HO',
    description: 'Responsible for local sales tracking, operational metrics, and branch supervision in the designated area.',
    skillRequirements: ['Area Sales Tracking', 'Branch Training Matrix', 'Inventory Control Audits', 'Customer Service SLA']
  },
  {
    id: 'role_branch_mgr',
    name: 'Branch Manager',
    department: 'Build Mart',
    description: 'Supervises daily operations, cashier desks, walk-in sales, physical inventories, and customer satisfaction at the store.',
    skillRequirements: ['Store Operations Coordination', 'Staff Rostering', 'POS Cash Controls', 'Customer Relation Focus']
  },
  {
    id: 'role_ops_mgr',
    name: 'Operations Manager',
    department: 'HO',
    description: 'Supervises operational processes, supply parameters, dispatch efficiency metrics, and internal process compliance.',
    skillRequirements: ['Process Optimization', 'Supply Flow Auditing', 'Logistics SLA Monitoring', 'Resource Optimization']
  },
  {
    id: 'role_bdm',
    name: 'Business Development Manager (BDM)',
    department: 'Sales',
    description: 'Secures high-value business contracts, architectural alliances, bulk client accounts, and handles project negotiations.',
    skillRequirements: ['Corporate Outreach Strategy', 'Deal Negotiations', 'Architect Agreements', 'Market Positioning']
  },
  {
    id: 'role_bde',
    name: 'Business Development Executive (BDE)',
    department: 'Sales',
    description: 'Sources prospective customer lists, completes initial client pitches, and schedules dealer meetings across regions.',
    skillRequirements: ['Lead Generation Methods', 'Dynamic Sales Pitches', 'Client Follow-ups', 'CRM Logging Accuracy']
  },
  {
    id: 'role_mktg_mgr',
    name: 'Marketing Manager',
    department: 'HO',
    description: 'Designs national campaigns, coordinates digital advertisements, oversees local banners, and tracks branding effectiveness.',
    skillRequirements: ['Multi-channel Marketing Plans', 'ROI Analytics', 'Agency Team Management', 'Corporate Slogans Planning']
  },
  {
    id: 'role_mktg_exec',
    name: 'Marketing Executive',
    department: 'Sales',
    description: 'Creates digital content, arranges regional in-store mockups, prints product catalogs, and manages social announcements.',
    skillRequirements: ['Social Media Design', 'Event Supervision', 'Brochures Coordination', 'Customer Outreach Forms']
  },
  {
    id: 'role_digi_mktg_exec',
    name: 'Digital Marketing Executive',
    department: 'Sales',
    description: 'Handles online advertisement dashboards, SEO keywords optimization, email catalogs, and lead generation campaigns.',
    skillRequirements: ['Google Ads Analytics', 'SEO Techniques', 'E-commerce Management', 'A/B Performance Reviews']
  },
  {
    id: 'role_cust_supp',
    name: 'Customer Support Executive',
    department: 'CRM',
    description: 'Answers customer hotlines, registers post-delivery complaints, issues replacement reviews, and handles helpdesk entries.',
    skillRequirements: ['Call Ticket Registrations', 'Troubleshooting Workflows', 'Customer Empathy SOP', 'Direct Chat Response']
  },
  {
    id: 'role_cust_srv_mgr',
    name: 'Customer Service Manager',
    department: 'CRM',
    description: 'Analyzes NPS metrics, coordinates ticket resolutions, and handles high-priority escalations across CRM centers.',
    skillRequirements: ['NPS Auditing Procedures', 'Ticket SLA Resolutions', 'Client Incident Management', 'Support Team Training']
  },
  {
    id: 'role_rel_mgr',
    name: 'Relationship Manager',
    department: 'CRM',
    description: 'Directs account communications with premium architects, commercial contractors, and builders.',
    skillRequirements: ['Client Account Cultivation', 'B2B Services Allocation', 'Customer Churn Prevention', 'Custom Pricing Models']
  },
  {
    id: 'role_key_acc_mgr',
    name: 'Key Account Manager',
    department: 'CRM',
    description: 'Responsible for key commercial builders accounts, custom credit limit validations, and key contractual compliance reviews.',
    skillRequirements: ['Key Account Strategy', 'Contract Negotiating', 'Enterprise Supply SLA', 'Cross-functional Coordination']
  },
  {
    id: 'role_proj_mgr',
    name: 'Project Manager',
    department: 'MDO',
    description: 'Oversees localized construction supplies deployments, coordinates batch setups, and monitors site schedules.',
    skillRequirements: ['Critical Path Analysis', 'Project Cost Forecasts', 'Cross-site Logistics', 'Milestone Tracking']
  },
  {
    id: 'role_admin_mgr',
    name: 'Admin Manager',
    department: 'Admin',
    description: 'Ensures facilities maintenance, manages vehicle lists, oversees secure protocols, and holds inventory control reviews.',
    skillRequirements: ['Facilities Management SOP', 'Vendor Contract Control', 'Asset Tagging & Auditing', 'Office Safety Rules']
  },
  {
    id: 'role_admin_exec',
    name: 'Admin Executive',
    department: 'Admin',
    description: 'Schedules general utility bills, books corporate lodging, files registrations, and holds inventory log audits.',
    skillRequirements: ['Expense Log Management', 'Lodging and Travel Books', 'Inward Register Controls', 'Asset Ledger Updates']
  },
  {
    id: 'role_office_mgr',
    name: 'Office Manager',
    department: 'Admin',
    description: 'Processes shift logs, handles cleaning and security checklists, and maintains workplace standards.',
    skillRequirements: ['Office Roster Systems', 'Sanitization Checklist Reviews', 'Stationery Stock Inventories', 'Filing Structuring']
  },
  {
    id: 'role_front_off_exec',
    name: 'Front Office Executive',
    department: 'Admin',
    description: 'Receives corporate guests, routes telephone directories, files incoming registers, and controls reception schedules.',
    skillRequirements: ['Visitor Management Systems', 'Call Directory Routing', 'Docket Receipt Logs', 'Executive Mail Allocation']
  },
  {
    id: 'role_receptionist',
    name: 'Receptionist',
    department: 'Admin',
    description: 'Manages incoming call switchboards, welcomes walk-ins, logs dockets, and maintains clean workspace reception.',
    skillRequirements: ['Switchboard Procedures', 'Visitor Registration SOP', 'Mail Sorting Protocols', 'Communication Basics']
  },
  {
    id: 'role_team_leader',
    name: 'Team Leader',
    department: 'MDO',
    description: 'Provides direct operational coordination to field sales assistants, cashiers, and stock helpers.',
    skillRequirements: ['Team Management', 'Daily KPI Tracking', 'Conflict Resolution Methods', 'Employee Training Basics']
  },
  {
    id: 'role_sales_mgr',
    name: 'Sales Manager',
    department: 'Sales',
    description: 'Drives overall channel profitability, establishes outlet targets, and designs sales incentive programs.',
    skillRequirements: ['Revenue Close Strategy', 'Incentive Scheme Designs', 'Account Expansion Plans', 'Team Sales Audits']
  },
  {
    id: 'role_terr_sales_mgr',
    name: 'Territory Sales Manager',
    department: 'Sales',
    description: 'Coordinates dealer networks, maintains distributor relationships, and reviews competitor offerings in the territory.',
    skillRequirements: ['Territory Mapping Methods', 'Distributor Network Systems', 'Dealer Performance Auditing', 'Regional Sales SOP']
  },
  {
    id: 'role_sr_sales_exec',
    name: 'Senior Sales Executive',
    department: 'Sales',
    description: 'Focuses on direct B2B corporate sales, custom client quotations, and finalizes major procurement contracts.',
    skillRequirements: ['B2B Pitching Systems', 'Quotation Preparation', 'Large Contract Closings', 'CRM Funnel Tracking']
  },
  {
    id: 'role_retail_sales_exec',
    name: 'Retail Sales Executive',
    department: 'Sales',
    description: 'Assists walk-in store customers, explains product features, lists lead entries, and completes bill generation.',
    skillRequirements: ['Customer Support SOP', 'Product Feature Matches', 'CRM Leads Entry', 'Point of Sales (POS)']
  },
  {
    id: 'role_telecaller',
    name: 'Telecaller',
    department: 'Sales',
    description: 'Performs outbound cold calling campaigns, registers incoming phone leads, and gathers feedback.',
    skillRequirements: ['Phone Pitch Delivery', 'Lead Categorization', 'Objection Handling', 'Call Logs Maintenance']
  },
  {
    id: 'role_tele_sales_exec',
    name: 'Tele Sales Executive',
    department: 'Sales',
    description: 'Focuses on phone-based sales conversions, processes digital catalog payouts, and manages client follow-ups.',
    skillRequirements: ['Phone Sales Close', 'Digital Invoicing Setups', 'Customer Lead Qualification', 'SLA Call Targets']
  },
  {
    id: 'role_inv_mgr',
    name: 'Inventory Manager',
    department: 'Warehouse',
    description: 'Maintains stock accuracy, conducts regular reconciliation audits, calculates safety stocks, and monitors shrinkage.',
    skillRequirements: ['Stock Reconciliations', 'Safety Reorder Algorithms', 'Shrinkage Auditing Systems', 'ERP Stock Database']
  },
  {
    id: 'role_inv_exec',
    name: 'Inventory Executive',
    department: 'Warehouse',
    description: 'Executes physical counting audits, labels bin structures, and logs damage returns at the warehouse.',
    skillRequirements: ['Stock Audit Protocols', 'Bin Tags Maintenance', 'Defective Returns Classification', 'Barcode Scanners']
  },
  {
    id: 'role_log_mgr',
    name: 'Logistics Manager',
    department: 'Warehouse',
    description: 'Manages delivery fleets, negotiates third-party logistics (3PL) contracts, and monitors dispatch TAT metrics.',
    skillRequirements: ['Logistics Fleet Routing', '3PL Cost Negotiator', 'Turn-around Time (TAT) SLA', 'Freight Cost Analysis']
  },
  {
    id: 'role_log_exec',
    name: 'Logistics Executive',
    department: 'Warehouse',
    description: 'Coordinates vehicle loading manifests, tracks active delivery vehicles, and inspects proof of delivery (POD) logs.',
    skillRequirements: ['Loading Manifest Drafts', 'Active Vehicle Tracking', 'POD Register Reconciles', 'E-Way Bill Compliance']
  },
  {
    id: 'role_scm_mgr',
    name: 'Supply Chain Manager',
    department: 'Warehouse',
    description: 'Optimizes procurement cycles, monitors inventory levels, and tracks logistical supply chains.',
    skillRequirements: ['Lead Time Optimizing', 'Safety Stock Calculations', 'Multi-channel Distribution Plans', 'Logistics Performance Track']
  },
  {
    id: 'role_proc_mgr',
    name: 'Procurement Manager',
    department: 'Purchase',
    description: 'Structures purchase agreements, approves supplier invoices, and analyzes vendor performance.',
    skillRequirements: ['Corporate Sourcing Models', 'RFP Structure Reviews', 'Vendor Appraisals Standard', 'Purchase Escalation Control']
  },
  {
    id: 'role_proc_exec',
    name: 'Procurement Executive',
    department: 'Purchase',
    description: 'Schedules daily purchase orders, collects vendor quotes, and tracks delivery dates.',
    skillRequirements: ['Purchase Order Drafting', 'Quotations Reconciliations', 'Supplier Lead Track', 'Item Sourcing Master']
  },
  {
    id: 'role_qual_mgr',
    name: 'Quality Manager',
    department: 'Admin',
    description: 'Establishes testing SOP standards, oversees laboratory metrics, and coordinates ISO compliance audits.',
    skillRequirements: ['QA SOP Specifications', 'ISO Auditor Systems', 'Inspection Lead Control', 'Defect Analysis']
  },
  {
    id: 'role_qual_exec',
    name: 'Quality Executive',
    department: 'Admin',
    description: 'Carries out physical product testing, logs sample reports, and registers rejection items.',
    skillRequirements: ['Material Strength Testing', 'SOP Logging Formats', 'Rejection Tags Control', 'Safety Audits']
  },
  {
    id: 'role_audit_exec',
    name: 'Audit Executive',
    department: 'Billing',
    description: 'Audits outward bill collections, identifies transaction discrepancies, and prepares audit reports.',
    skillRequirements: ['Voucher Audit Controls', 'Daily Invoice Verification', 'E-Way Bill Matches', 'Audit Report Frameworks']
  },
  {
    id: 'role_internal_auditor',
    name: 'Internal Auditor',
    department: 'Account',
    description: 'Evaluates system internal controls, investigates record leaks, and presents monthly risk reports.',
    skillRequirements: ['Internal Control Mapping', 'Risk Register Auditing', 'Fraud Diagnostics', 'Compliance Assurances']
  },
  {
    id: 'role_fin_mgr',
    name: 'Finance Manager',
    department: 'Account',
    description: 'Oversees working capital, monitors cash flows, negotiates credit setups, and presents consolidated financials.',
    skillRequirements: ['Cash Flow Reconcile Systems', 'Working Capital Ratios', 'Financing Facility Controls', 'Consolidation Formats']
  },
  {
    id: 'role_fin_exec',
    name: 'Finance Executive',
    department: 'Account',
    description: 'Schedules bank ledger transfers, updates LC tracker entries, and registers capital asset changes.',
    skillRequirements: ['Payment Gatework Systems', 'LC Validation Tracking', 'Bank Interest Accruals', 'Treasury Ledger Logs']
  },
  {
    id: 'role_sr_acc',
    name: 'Senior Accountant',
    department: 'Account',
    description: 'Responsible for general ledger reconciliations, final accounts consolidation, audit compliance, and supervision of junior staffs.',
    skillRequirements: ['Financial Closure', 'Auditing Controls', 'GAAP Compliance', 'Intercompany Balances']
  },
  {
    id: 'role_jr_acc',
    name: 'Junior Accountant',
    department: 'Account',
    description: 'Responsible for recording day-to-day books, physical petty cash, bank reconciliations, and posting asset changes.',
    skillRequirements: ['Double-Entry Ledger', 'BRS Preparation', 'Fixed Asset Tagging', 'Excel Pivot Tables']
  },
  {
    id: 'role_hr_mgr',
    name: 'HR Manager',
    department: 'MDO',
    description: 'Administers organization policies, reviews appraisals registers, and schedules labor dispute resolutions.',
    skillRequirements: ['Appraisals System Execution', 'Grievance Resolution Procedures', 'Labor Law Compliances', 'Employee Welfare Policies']
  },
  {
    id: 'role_ta_exec',
    name: 'Talent Acquisition Executive',
    department: 'MDO',
    description: 'Schedules candidate pipelines, posts job profiles, and screens applicant résumés.',
    skillRequirements: ['Resume Sourcing Strategy', 'Employment Portal Sourcing', 'Candidate Phone Screenings', 'Interview Schedules Control']
  },
  {
    id: 'role_training_mgr',
    name: 'Training Manager',
    department: 'MDO',
    description: 'Identifies staff skill deficits, launches custom training modules, and runs LMS platforms.',
    skillRequirements: ['Needs Deficit Mapping', 'LMS Course Management', 'Post-evaluation Analytics', 'Workplace Workshops Design']
  },
  {
    id: 'role_it_mgr',
    name: 'IT Manager',
    department: 'Admin',
    description: 'Responsible for network configurations, hardware deployment setups, and software contract validations.',
    skillRequirements: ['Firewall Setup Auditing', 'IT Asset Inventory Control', 'Disaster Plan Execution', 'Socio-technical Integrity']
  },
  {
    id: 'role_it_exec',
    name: 'IT Executive',
    department: 'Admin',
    description: 'Coordinates helpdesk tick offices, monitors local PC setups, and checks server logs.',
    skillRequirements: ['Active Directory Deployments', 'PC System Diagnostics', 'Local Reconciliations Checks', 'Printer Hardware Fixes']
  },
  {
    id: 'role_sys_admin',
    name: 'System Administrator',
    department: 'Admin',
    description: 'Coordinates virtualization databases, manages storage allocations, and validates access levels.',
    skillRequirements: ['Linux Bash Scripting', 'Virtual Machine Control', 'User Policy Auditing', 'Cybersecurity Best Practices']
  },
  {
    id: 'role_deo',
    name: 'Data Entry Operator (DEO)',
    department: 'CRM',
    description: 'Transcribes customer directories from physical dispatch receipts, and formats simple product catalog items.',
    skillRequirements: ['High Speed Text Typing', 'Accuracy Audits Logs', 'Excel Cell Customizations', 'Data Fields Verification']
  },
  {
    id: 'role_mis_exec',
    name: 'MIS Executive',
    department: 'CRM',
    description: 'Collates sales trackers, runs weekly spreadsheet pivots, and designs dashboard graphs.',
    skillRequirements: ['Spreadsheet Key Formulas', 'Pivot Charts Reconciling', 'Data Sorting Formulations', 'Error Log Identification']
  },
  {
    id: 'role_mis_mgr',
    name: 'MIS Manager',
    department: 'CRM',
    description: 'Directs data warehouses, develops metrics reports, and guides MIS analyst teams.',
    skillRequirements: ['Database Scripting (SQL)', 'Dashboard Flow Designs', 'Executive Presentations Standard', 'Data Security SOP']
  },
  {
    id: 'role_crm_exec',
    name: 'CRM Executive',
    department: 'CRM',
    description: 'Funnels new leads, logs interaction notes, and coordinates customer greetings.',
    skillRequirements: ['Client Data Processing', 'CRM App Controls', 'Direct Communication Basics', 'Follow-up Email Campaigns']
  },
  {
    id: 'role_crm_mgr',
    name: 'CRM Manager',
    department: 'CRM',
    description: 'Optimizes client lifespans, standardizes CRM modules, and guides customer outreach rosters.',
    skillRequirements: ['NPS Standard Mapping', 'CRM Workflow Configuration', 'Staff Operations Rostering', 'Retention Metrics Planning']
  },
  {
    id: 'role_coll_exec',
    name: 'Collection Executive',
    department: 'Account',
    description: 'Initiates payment reminder calls, tracks pending invoices, and audits customer ledgers.',
    skillRequirements: ['Dunning Notification Protocols', 'Aging Ledger Reconciling', 'Disputed Balance Resolution', 'Out-of-office Collections']
  },
  {
    id: 'role_recovery_mgr',
    name: 'Recovery Manager',
    department: 'Account',
    description: 'Manages sub-standard accounts, prepares legal documents, and controls debt collection partnerships.',
    skillRequirements: ['Legal Notice Procedures', 'Bad Debt Risk Evaluation', 'Agency Performance Audits', 'Asset Recoveries Governance']
  },
  {
    id: 'role_wh_exec',
    name: 'Warehouse Executive',
    department: 'Warehouse',
    description: 'Assistors unloading operations, matches bin catalog codes, and fulfills dispatch rosters.',
    skillRequirements: ['Forklift Procedures SOP', 'Bin Location Identification', 'Pick & Order Counting', 'Physical Inventory Logs']
  },
  {
    id: 'role_ast_store_mgr',
    name: 'Assistant Store Manager',
    department: 'Build Mart',
    description: 'Monitors staff floor layouts, completes stock checklists, and matches invoice logs.',
    skillRequirements: ['Retail Operations SOP', 'Shift Timing Co-ordination', 'Stock Shortage Tracking', 'Customer Support Handling']
  },
  {
    id: 'role_store_mgr',
    name: 'Store Manager',
    department: 'Build Mart',
    description: 'Maximizes store operating margins, processes audits records, and leads branch teams.',
    skillRequirements: ['Retail Outlet P&L Plans', 'Regulatory Compliance Check', 'Store Visual Layouts SOP', 'Staff Productivity Audits']
  },
  {
    id: 'role_dispatch_coord',
    name: 'Dispatch Coordinator',
    department: 'Warehouse',
    description: 'Schedules gate permits, prepares delivery slip registers, and logs loading manifests.',
    skillRequirements: ['Outward Delivery Registrations', 'Loading bay manifest logs', 'Gate-Pass Validations', 'Courier Vehicles Allocations']
  },
  {
    id: 'role_billing_mgr',
    name: 'Billing Manager',
    department: 'Billing',
    description: 'Processes outlet bill runs, certifies ledger transactions, and reviews item pricing profiles.',
    skillRequirements: ['Systematic Outlet Invoicing', 'Voucher Matches Standard', 'Item Rates Database Check', 'Billing Team SLA oversight']
  },
  {
    id: 'role_ap_ar',
    name: 'Accounts Executive (AP/AR)',
    department: 'Billing',
    description: 'Responsible for invoice collection, 3-way purchase match, customer outstanding dunning, and credit limits oversight.',
    skillRequirements: ['Purchase Invoice Verification', 'Ageing Analysis', 'Dunning Escalation', 'Creditors Ledger Reconciliation']
  },
  {
    id: 'role_tax_assoc',
    name: 'Tax Associate',
    department: 'Account',
    description: 'Responsible for direct and indirect tax returns, GST matching (GSTR-2B), TDS reconciliations, and filing quarterly tax forms.',
    skillRequirements: ['GST Portal Navigation', 'ITC Matching (2B)', 'TDS Deduction Rules', 'Form 16/26AS Verification']
  },
  {
    id: 'role_candidate',
    name: 'Interview Candidate (Job Applicant)',
    department: 'HR & Talent Evaluation',
    description: 'Job applicant undergoing skill screening, debit/credit evaluations, and core tax-accounting aptitude tests.',
    skillRequirements: ['Basic Debit/Credit Rules', 'Three-way Voucher Match', 'B&R Statement Reconciles', 'TDS/GST Portal Navigation Basics']
  }
];

export const initialDepartments: string[] = [
  'Build Mart',
  'MDO',
  'Warehouse',
  'Account',
  'Director',
  'CRM',
  'Admin',
  'HO',
  'Sales',
  'Billing',
  'Purchase',
  'Sales Assistant',
  'Corporate Accounts & Auditing',
  'General Ledger Team',
  'Vendors and Billings Division',
  'Direct & Indirect Taxation',
  'HR & Talent Evaluation'
];

export const initialUsers: User[] = [
  {
    id: 'usr_owner_harish',
    name: 'Harish Rathi (Director)',
    email: 'harish@rathibuildmart.com',
    roleId: 'role_md',
    department: 'Director',
    focusEntity: 'Rathi Buildmart Group HQ',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120&auto=format&fit=crop&q=80',
    password: 'rathi123'
  },
  {
    id: 'usr_cfo_suresh',
    name: 'Aashish Sahu',
    email: 'misrpr@rathibuildmart.com', // Matches user email from metadata
    roleId: 'role_sr_acc',
    department: 'Accounts & Corporate Fin',
    focusEntity: 'Rathi Buildmart Head Office',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
    password: 'rathi123'
  },
  {
    id: 'usr_sr_rahul',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@rathibuildmart.com',
    roleId: 'role_sr_acc',
    department: 'Build Mart',
    focusEntity: 'Rathi Buildmart Pvt Ltd (Central)',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
    password: 'rathi123'
  },
  {
    id: 'usr_jr_simran',
    name: 'Simran Kaur',
    email: 'simran.kaur@rathibuildmart.com',
    roleId: 'role_jr_acc',
    department: 'General Ledger Team',
    focusEntity: 'Rathi Buildmart Pvt Ltd (Central)',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    password: 'rathi123'
  },
  {
    id: 'usr_exec_amit',
    name: 'Amit Patel',
    email: 'amit.patel@rathibuildmart.com',
    roleId: 'role_ap_ar',
    department: 'Vendors & Billings',
    focusEntity: 'Rathi Buildmart Logistics Wing',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    password: 'rathi123'
  },
  {
    id: 'usr_tax_priya',
    name: 'Priya Iyer',
    email: 'priya.iyer@rathibuildmart.com',
    roleId: 'role_tax_assoc',
    department: 'Direct & Indirect Taxation',
    focusEntity: 'Rathi Buildmart (Holding Co.)',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    password: 'rathi123'
  },
  {
    id: 'usr_cand_vikram',
    name: 'Vikram Malhotra',
    email: 'vikram.malhotra@gmail.com',
    roleId: 'role_candidate',
    department: 'Accounts Recruitment Division',
    focusEntity: 'Rathi Buildmart (Evaluation Wing)',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    password: 'rathi123'
  }
];

export const initialChapters: Chapter[] = [
  // Candidate / Job Applicant Screening Practice
  { id: 'ch_cand_screening', roleId: 'role_candidate', name: 'Pre-Employment Skill Screening & Practice', order: 1 },
  
  // Tax Associate
  { id: 'ch_tax_gst', roleId: 'role_tax_assoc', name: 'GST Compliance & Filings', order: 1 },
  { id: 'ch_tax_tds', roleId: 'role_tax_assoc', name: 'Income Tax TDS/TCS Compliances', order: 2 },
  
  // AP/AR
  { id: 'ch_ap_workflow', roleId: 'role_ap_ar', name: 'Accounts Payable Workflow', order: 1 },
  { id: 'ch_ar_debt', roleId: 'role_ap_ar', name: 'Accounts Receivable & Credit Control', order: 2 },
  
  // Junior Account
  { id: 'ch_jr_gl_ctl', roleId: 'role_jr_acc', name: 'General Ledger Controls & Reconciliations', order: 1 },
  { id: 'ch_jr_assets', roleId: 'role_jr_acc', name: 'Fixed Asset Register Maintenance', order: 2 },
  
  // Senior Accountant
  { id: 'ch_sr_close', roleId: 'role_sr_acc', name: 'Financial Close & Consolidation Accounting', order: 1 },
  { id: 'ch_sr_audit', roleId: 'role_sr_acc', name: 'Statutory Audit Readiness & Lead Schedules', order: 2 }
];

export const initialUnits: Unit[] = [
  // Tax Associate Units
  {
    id: 'u_tax_001',
    chapterId: 'ch_tax_gst',
    code: 'TAX-001',
    taskName: 'GST Portal Navigation & Ledger Reconciliation',
    frequency: 'Monthly',
    skillRequired: 'Intermediate',
    videoTitle: 'GSTR-2B Input Tax Credit Matching & Reconciliation',
    videoUrl: 'https://www.youtube.com/embed/nE1E1xidV2U',
    description: 'Detailed process of downloading monthly GSTR-2B statements from the official government portal, comparing input tax credit (ITC) with ERP bookings, and identifying missing seller invoices.'
  },
  {
    id: 'u_tax_002',
    chapterId: 'ch_tax_gst',
    code: 'TAX-002',
    taskName: 'Filing GSTR-1 and GSTR-3B Return Forms',
    frequency: 'Monthly',
    skillRequired: 'Advanced',
    videoTitle: 'E-Filing GST Returns Step-By-Step Walkthrough',
    videoUrl: 'https://www.youtube.com/embed/S7U_F7F9-kM',
    description: 'Step-by-step guidance to assemble outward liability parameters, map interstate and intrastate transaction categories, complete tax payouts, and submit forms GSTR-1 and GSTR-3B.'
  },
  {
    id: 'u_tax_003',
    chapterId: 'ch_tax_tds',
    code: 'TAX-003',
    taskName: 'TDS Certificate Verification & Form 26AS matching',
    frequency: 'Monthly',
    skillRequired: 'Intermediate',
    videoTitle: 'Form 26AS & Annual Information Statement (AIS) Matching',
    videoUrl: 'https://www.youtube.com/embed/o3o1eL7fMcs',
    description: 'Cross-reference tax deductions on client receipts against national TRACES tax credits logged under Form 26AS. Spot and request correction lists for mismatched TDS filings.'
  },
  {
    id: 'u_tax_004',
    chapterId: 'ch_tax_tds',
    code: 'TAX-004',
    taskName: 'Quarterly TDS Returns Preparation (Form 26Q & 24Q)',
    frequency: 'Quarterly',
    skillRequired: 'Advanced',
    videoTitle: 'Preparing TDS Returns using e-Filing Utility & FVU Validator',
    videoUrl: 'https://www.youtube.com/embed/MhH5V1oA_sU',
    description: 'Mapping corporate cash payments to correct TDS sections under the income tax act. Validate Challan files and create final .fvu texts using the NSDL Return Preparation Utility (RPU).'
  },

  // AP/AR Units
  {
    id: 'u_ap_011',
    chapterId: 'ch_ap_workflow',
    code: 'AP-011',
    taskName: 'Vendor Invoice Processing & 3-Way Match',
    frequency: 'Daily',
    skillRequired: 'Beginner',
    videoTitle: 'Three Way Match in Accounts Payable (PO, GRN, & Invoice)',
    videoUrl: 'https://www.youtube.com/embed/hO2s7zOnQ-Y',
    description: 'Perform standard check matching physical seller bills against purchase orders (PO) issued by procurement, and Goods Receipts Notes (GRN) logged by storage hubs.'
  },
  {
    id: 'u_ap_012',
    chapterId: 'ch_ap_workflow',
    code: 'AP-012',
    taskName: 'Aged Creditors Analysis & Payment Scheduling',
    frequency: 'Weekly',
    skillRequired: 'Intermediate',
    videoTitle: 'Accounts Payable Aging Reports & Cash Outflow Control',
    videoUrl: 'https://www.youtube.com/embed/vK16pndqVsk',
    description: 'Construct creditor age categories (30, 60, 90+ days), negotiate supplier discount cycles, and structure weekly bank payout batches for approval by the CFO.'
  },
  {
    id: 'u_ar_021',
    chapterId: 'ch_ar_debt',
    code: 'AR-021',
    taskName: 'Customer Invoicing & Credit Limit Controls',
    frequency: 'Daily',
    skillRequired: 'Beginner',
    videoTitle: 'Creating Client Billings & Monitoring Outstanding Balance limits',
    videoUrl: 'https://www.youtube.com/embed/u_Fw8zYmE6o',
    description: 'Setting sales invoice drafts based on completed log sheets. Block delivery of subsequent sales goods if active open balances cross corporate credit threshold allowances.'
  },
  {
    id: 'u_ar_022',
    chapterId: 'ch_ar_debt',
    code: 'AR-022',
    taskName: 'Payment Dunning & Debt Recovery Escalation',
    frequency: 'Weekly',
    skillRequired: 'Beginner',
    videoTitle: 'Effective AR Collections: Dunning Letters & Dispute Management',
    videoUrl: 'https://www.youtube.com/embed/u2mUuY0Iu_M',
    description: 'Send formal notices asking for client balance clearances. Review cash inflow records to apply corresponding credit logs against unresolved customer invoices.'
  },

  // Junior Accountant Units
  {
    id: 'u_jr_031',
    chapterId: 'ch_jr_gl_ctl',
    code: 'JR-031',
    taskName: 'Monthly Bank Reconciliation Statement (BRS) Execution',
    frequency: 'Daily',
    skillRequired: 'Intermediate',
    videoTitle: 'How to Do a Bank Reconciliation Statement',
    videoUrl: 'https://www.youtube.com/embed/uSgY9fofT0I',
    description: 'Determine ledger variance limits by reconciling bank logs with our internal books. Analyze float, outstanding checks, and bank service charges.'
  },
  {
    id: 'u_jr_032',
    chapterId: 'ch_jr_gl_ctl',
    code: 'JR-032',
    taskName: 'Petty Cash Management & Imprest Reimbursements',
    frequency: 'Weekly',
    skillRequired: 'Beginner',
    videoTitle: 'Petty Cash and Imprest Systems Accounting',
    videoUrl: 'https://www.youtube.com/embed/RkG7o7p16rI',
    description: 'Establish internal receipts audits. Perform physical inventory balance reviews of the office locks cash registers and book standard general expense entries.'
  },
  {
    id: 'u_jr_033',
    chapterId: 'ch_jr_assets',
    code: 'JR-033',
    taskName: 'Fixed Asset Register (FAR) Update & Entry Posting',
    frequency: 'Monthly',
    skillRequired: 'Intermediate',
    videoTitle: 'Fixed Assets Accounting & Capitalization Schedules',
    videoUrl: 'https://www.youtube.com/embed/Bf1oR_5LqVw',
    description: 'Assign unique company asset tags, register purchased properties under the FAR ledger database, and maintain accurate location tracking logs.'
  },

  // Senior Accountant Units
  {
    id: 'u_sr_041',
    chapterId: 'ch_sr_close',
    code: 'SR-041',
    taskName: 'Monthly General Ledger Provisions & Adjusting Adjustments',
    frequency: 'Monthly',
    skillRequired: 'Advanced',
    videoTitle: 'Monthly Closing Journal Entries & Accrual Reversals',
    videoUrl: 'https://www.youtube.com/embed/nkiwA5e_vRE',
    description: 'Create provisions for electricity bills, internet costs, auditor compensations, and recurring service contracts. Automate subsequent reversal setups.'
  },
  {
    id: 'u_sr_042',
    chapterId: 'ch_sr_close',
    code: 'SR-042',
    taskName: 'Inter-Entity Outstanding Balance Matches',
    frequency: 'Monthly',
    skillRequired: 'Advanced',
    videoTitle: 'Intercompany Balance Reconciliation & Eliminations',
    videoUrl: 'https://www.youtube.com/embed/T6_mH2QO-74',
    description: 'Analyze receivables/payables balances across parent and logistics divisions. Issue consolidated balance elimination postings for accurate group statements.'
  },
  {
    id: 'u_sr_043',
    chapterId: 'ch_sr_audit',
    code: 'SR-043',
    taskName: 'Statutory Audit Lead Schedule Document Formulations',
    frequency: 'Ad-hoc',
    skillRequired: 'Advanced',
    videoTitle: 'Key Statutory Audit Documentation & Reconciliation Standards',
    videoUrl: 'https://www.youtube.com/embed/G6gJ8nCsc8o',
    description: 'Design comprehensive balance proofs for equity accounts, banking balances, taxing entities, and major accounts receivable listings for annual statutory auditors.'
  },
  {
    id: 'u_cand_001',
    chapterId: 'ch_cand_screening',
    code: 'CAND-001',
    taskName: 'Golden Rules of Accounting & General Ledger Debit/Credit Principles',
    frequency: 'Ad-hoc',
    skillRequired: 'Beginner',
    videoTitle: 'Accounting 101: Understanding Debit and Credit Ledger entries',
    videoUrl: 'https://www.youtube.com/embed/zS9YlyY6eAI',
    description: 'Fundamental refresher session on double entry rules, nominal accounts, real accounts, and personal accounts that forms the core of our Build Mart screening.'
  },
  {
    id: 'u_cand_002',
    chapterId: 'ch_cand_screening',
    code: 'CAND-002',
    taskName: 'Introduction to GST GSTR-3B & 2B Matching Concepts',
    frequency: 'Daily',
    skillRequired: 'Beginner',
    videoTitle: 'How GST works in corporate invoicing and input tax credits',
    videoUrl: 'https://www.youtube.com/embed/nE1E1xidV2U',
    description: 'An overview of input tax credit matches, seller invoice reconcile logs, and simple tax compliance metrics.'
  }
];

export const initialProgress: ProgressLog[] = [
  {
    id: 'usr_jr_simran_u_jr_031',
    userId: 'usr_jr_simran',
    unitId: 'u_jr_031',
    status: 'Verified & Mastered',
    lastUpdated: '2026-06-01T10:00:00Z',
    notes: 'Completed the reconciliation for May. Handed over draft to Rahul Sharma.',
    verifiedBy: 'usr_sr_rahul',
    verificationDate: '2026-06-01T15:30:00Z'
  },
  {
    id: 'usr_jr_simran_u_jr_032',
    userId: 'usr_jr_simran',
    unitId: 'u_jr_032',
    status: 'Verified & Mastered',
    lastUpdated: '2026-06-04T12:15:00Z',
    notes: 'Counted physical imprest cash: exactly Rs. 5000 matched. Uploaded vouchers.'
  },
  {
    id: 'usr_jr_simran_u_jr_033',
    userId: 'usr_jr_simran',
    unitId: 'u_jr_033',
    status: 'In Progress',
    lastUpdated: '2026-06-05T08:00:00Z',
    notes: 'Going through asset tracking procedures and video documentation.'
  },
  {
    id: 'usr_tax_priya_u_tax_001',
    userId: 'usr_tax_priya',
    unitId: 'u_tax_001',
    status: 'Verified & Mastered',
    lastUpdated: '2026-05-20T11:00:00Z',
    notes: 'Matched GSTR-2B with Tally ERP ERP Books. Got 100% credit correctness verification.',
    verifiedBy: 'usr_cfo_suresh',
    verificationDate: '2026-05-22T09:00:00Z'
  },
  {
    id: 'usr_tax_priya_u_tax_002',
    userId: 'usr_tax_priya',
    unitId: 'u_tax_002',
    status: 'Verified & Mastered',
    lastUpdated: '2026-06-03T17:00:00Z',
    notes: 'Finalized GSTR-3B filings draft for review. ITC set-off matches correctly.'
  },
  {
    id: 'usr_exec_amit_u_ap_011',
    userId: 'usr_exec_amit',
    unitId: 'u_ap_011',
    status: 'Verified & Mastered',
    lastUpdated: '2026-05-29T16:00:00Z',
    notes: 'Validated invoice PO GRN entries in central ERP for the logistics segment files.',
    verifiedBy: 'usr_sr_rahul',
    verificationDate: '2026-05-30T10:00:00Z'
  }
];
