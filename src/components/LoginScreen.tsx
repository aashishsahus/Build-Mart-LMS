/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Role, CompanyBranding } from '../types';
import { Avatar } from './Avatar';
import { getCompanyBranding, getSmtpConfig } from '../data/stateManager';
import { Shield, BookOpen, UserPlus, Building, Briefcase, Mail, Key, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, UserCheck, Send, Smartphone, RefreshCw, Inbox, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LoginScreenProps {
  roles: Role[];
  users: User[];
  departments?: string[];
  onLogin: (userId: string) => void;
  onAddUser: (user: Omit<User, 'id'>) => void;
  branding?: CompanyBranding;
}

export default function LoginScreen({
  roles,
  users,
  departments = [],
  onLogin,
  onAddUser,
  branding
}: LoginScreenProps) {
  const activeBranding = branding || getCompanyBranding();
  // Tabs: 'credentials' (Google & User/PW), 'quick' (Sandbox list), 'register' (New Enrollment)
  const [activeTab, setActiveTab] = useState<'credentials' | 'quick' | 'register'>('credentials');
  const [showSandbox, setShowSandbox] = useState(false);
  
  // Forgot Password States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotError, setForgotError] = useState('');
  
  // Custom Registration Form States
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('rathi123');
  const [newUserRole, setNewUserRole] = useState(roles[0]?.id || 'role_jr_acc');
  const [newUserDept, setNewUserDept] = useState(() => departments[0] || 'Build Mart');
  const [newUserFocus, setNewUserFocus] = useState(() => (activeBranding?.companyName || "Rathi Buildmart") + " Pvt Ltd");

  // User ID + Password Form States
  const [credEmail, setCredEmail] = useState('');
  const [credPassword, setCredPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [credError, setCredError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [regError, setRegError] = useState('');
  const [googleError, setGoogleError] = useState('');

  // Google OAuth Simulation States
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleCustomEmail, setGoogleCustomEmail] = useState('');
  const [googleCustomName, setGoogleCustomName] = useState('');
  const [googleCustomRole, setGoogleCustomRole] = useState(roles[0]?.id || 'role_jr_acc');
  const [googleCustomDept, setGoogleCustomDept] = useState(() => departments[0] || 'Build Mart');
  const [googleCustomFocus, setGoogleCustomFocus] = useState(() => (activeBranding?.companyName || "Rathi Buildmart") + " (Google Entitled)");
  const [googleTab, setGoogleTab] = useState<'choose' | 'signup'>('choose');
  const [selectedGoogleUser, setSelectedGoogleUser] = useState<User | null>(null);
  const [googlePassword, setGooglePassword] = useState('');
  const [showGooglePassword, setShowGooglePassword] = useState(false);

  // Secure Gmail OTP State Managers
  const [otpTargetUser, setOtpTargetUser] = useState<User | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpMode, setOtpMode] = useState<'forgot' | 'google_2fa'>('forgot');
  const [otpMethod, setOtpMethod] = useState<'password' | 'otp'>('password'); // 'password' or 'otp'
  const [simulatedMailPopup, setSimulatedMailPopup] = useState<{
    id: string;
    sender: string;
    receiver: string;
    subject: string;
    otp: string;
    body: string;
    time: string;
  } | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  // Secure Lock Screen and Live Email state managers
  const [isRealEmailSent, setIsRealEmailSent] = useState(false);
  const [lockScreenPrivacy, setLockScreenPrivacy] = useState(true);
  const [gmailAppOpen, setGmailAppOpen] = useState(false);
  const [gmailPasswordInput, setGmailPasswordInput] = useState('');
  const [gmailAuthenticated, setGmailAuthenticated] = useState(false);
  const [gmailAuthError, setGmailAuthError] = useState('');

  // OTP Countdown timer effect
  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [otpTimer]);

  // Copy code handler
  const handleCopyOtp = (code: string) => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Dispatch OTP helper with real SMTP dispatch & fallback simulation
  const triggerOtpDispatch = async (targetUser: User, mode: 'forgot' | 'google_2fa') => {
    setIsSendingOtp(true);
    setIsOtpSent(false);
    setOtpVerified(false);
    setOtpInput('');
    setOtpTargetUser(targetUser);
    setOtpMode(mode);

    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    setOtpCode(generatedCode);

    const smtpConfig = getSmtpConfig();
    const mockSender = smtpConfig.fromName 
      ? `"${smtpConfig.fromName}" <${smtpConfig.fromEmail || 'security@rathibuildmart.com'}>` 
      : 'Rathi Build Mart LMS Security <security@rathibuildmart.com>';

    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetUser.email,
          otp: generatedCode,
          name: targetUser.name,
          mode: mode,
          smtpConfig: smtpConfig
        })
      });

      const data = await response.json();
      setIsSendingOtp(false);
      setIsOtpSent(true);
      setOtpTimer(60);

      if (data.sent) {
        setIsRealEmailSent(true);
        setSimulatedMailPopup(null); // No need to pop up mock since a real email has been sent!
      } else {
        // Fall back to secured, private simulated mail popup
        setIsRealEmailSent(false);
        setSimulatedMailPopup({
          id: Math.random().toString(),
          sender: mockSender,
          receiver: targetUser.email,
          subject: `🔐 LMS OTP Security Verification: ${generatedCode}`,
          otp: generatedCode,
          body: `Dear ${targetUser.name},\n\nA security request has generated a 2-Step Verification One-Time Password (OTP) for your account.\n\nYour 6-Digit Secure Code is: ${generatedCode}\n\nThis OTP is valid for 5 minutes. If you did not make this request, please contact the Rathi IT and HR department immediately to lock your account.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        });
      }
    } catch (err) {
      console.error('Failed to connect to SMTP API endpoint:', err);
      setIsSendingOtp(false);
      setIsOtpSent(true);
      setOtpTimer(60);
      setIsRealEmailSent(false);
      setSimulatedMailPopup({
        id: Math.random().toString(),
        sender: mockSender,
        receiver: targetUser.email,
        subject: `🔐 LMS OTP Security Verification: ${generatedCode}`,
        otp: generatedCode,
        body: `Dear ${targetUser.name},\n\nA security request has generated a 2-Step Verification One-Time Password (OTP) for your account.\n\nYour 6-Digit Secure Code is: ${generatedCode}\n\nThis OTP is valid for 5 minutes. If you did not make this request, please contact the Rathi IT and HR department immediately to lock your account.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    if (!newUserName.trim() || !newUserEmail.trim()) {
      setRegError('Please fill out all required fields.');
      return;
    }
    
    const regName = newUserName;
    const regEmail = newUserEmail;
    const regRole = newUserRole;
    const regDept = newUserDept;
    const regFocus = newUserFocus;
    const regPass = newUserPassword || 'rathi123';

    // Create new profile with password
    onAddUser({
      name: regName,
      email: regEmail,
      roleId: regRole,
      department: regDept,
      focusEntity: regFocus,
      password: regPass,
      avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 500000)}?w=120&auto=format&fit=crop&q=80`,
      status: 'Pending Approval'
    });

    const roleName = roles.find(r => r.id === regRole)?.name || 'Trainee';

    // Send Welcome Email
    try {
      const smtpConfig = getSmtpConfig();
      fetch('/api/send-welcome-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: regEmail,
          name: regName,
          roleName: roleName,
          department: regDept,
          smtpConfig: smtpConfig
        })
      }).then(res => res.json()).then(data => {
        console.log('Welcome email API response:', data);
      }).catch(err => {
        console.error('Failed welcome email API:', err);
      });

      // Always show simulation notification in sandbox environment so user is notified visually
      setSimulatedMailPopup({
        id: Math.random().toString(),
        sender: smtpConfig.fromName ? `"${smtpConfig.fromName}" <${smtpConfig.fromEmail || 'lms@rathibuildmart.com'}>` : '"Rathi LMS Support" <lms@rathibuildmart.com>',
        receiver: regEmail,
        subject: `🚀 Welcome to Rathi's LMS - Registration Received`,
        otp: '',
        body: `Dear ${regName},\n\nWelcome to Rathi Build Mart's Learning Management System (LMS)!\n\nYour enrollment request has been successfully registered under the "${regDept || 'General'}" department for the role of "${roleName}".\n\nOur Admin and HR team will review your profile shortly. Once approved, you will receive another email containing your access passkey and portal link.\n\nBest regards,\nRathi Build Mart Administration & HR Team`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });
    } catch (err) {
      console.error('Welcome email handler error:', err);
    }

    // Provide user feedback and redirect to credentials tab without auto-logging in
    setCredEmail(regEmail);
    setCredPassword(regPass);
    setCredError('');
    setSuccessMsg(`✓ Registration Submitted Successfully for ${regName}! Your enrollment is now awaiting job role verification and approval by HR or Admin. A welcome email has been sent to ${regEmail}.`);
    setActiveTab('credentials');

    // Clear registration fields
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPassword('rathi123');
  };

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCredError('');
    setSuccessMsg('');

    const formattedQuery = credEmail.trim().toLowerCase();
    if (!formattedQuery) {
      setCredError('Please enter your Corporate User ID or Email Address.');
      return;
    }

    if (!credPassword) {
      setCredError('Please enter your accounting system password.');
      return;
    }

    // Try finding by email or by user ID
    const matchedUser = users.find(
      u => u.email.toLowerCase() === formattedQuery || u.id.toLowerCase() === formattedQuery
    );

    if (matchedUser) {
      if (matchedUser.status === 'Pending Approval') {
        setCredError(`Access Denied: Your enrollment is currently pending approval. Admin or HR must verify and approve your main job role before you can start working.`);
        return;
      }
      if (matchedUser.status === 'Deactivated') {
        setCredError(`Access Denied: The account for "${matchedUser.name}" has been suspended/deactivated. Please contact Aashish Sahu (Director/CFO) or the Learning Admin.`);
        return;
      }
      if (matchedUser.status === 'Left') {
        setCredError(`Access Denied: "${matchedUser.name}" has left/resigned and is no longer permitted to access the corporate training workspace.`);
        return;
      }

      const userPass = matchedUser.password || 'rathi123';
      if (credPassword !== userPass) {
        setCredError('Incorrect credentials or corporate password. Please try again or contact Aashish Sahu (Director/CFO) to reset.');
        return;
      }
      setSuccessMsg('Authentication secret matches. Authorizing session...');
      setTimeout(() => {
        onLogin(matchedUser.id);
      }, 800);
    } else {
      // Auto enroll assistant/fallback to avoid locking out the user
      setCredError('User ID or corporate email not recognized. Please use a pre-seeded account (e.g., misrpr@rathibuildmart.com with password "rathi123"), or register a new one under the "New Enrollment" tab.');
    }
  };

  // Google OAuth account selection handler
  const handleGoogleAccountSelect = (user: User) => {
    setGoogleError('');
    if (user.status === 'Pending Approval') {
      setGoogleError(`Access Denied: The Google Account for "${user.name}" is pending approval from Admin or HR.`);
      return;
    }
    // Set selected user to prompt for their password to enforce safety and privacy
    setSelectedGoogleUser(user);
    setGooglePassword('');
    setShowGooglePassword(false);
    setOtpMethod('password');
    setIsOtpSent(false);
    setIsSendingOtp(false);
    setOtpInput('');
  };

  const handleGooglePasswordVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGoogleError('');
    if (!selectedGoogleUser) return;

    const correctPass = selectedGoogleUser.password || 'rathi123';
    if (googlePassword !== correctPass) {
      setGoogleError('Access Denied: Incorrect Google Account password. Please verify your credentials.');
      return;
    }

    // Passwords match! Complete login
    setShowGoogleModal(false);
    setSelectedGoogleUser(null);
    setGooglePassword('');
    onLogin(selectedGoogleUser.id);
  };

  // Google OAuth new sign up handler
  const handleGoogleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGoogleError('');
    if (!googleCustomName.trim() || !googleCustomEmail.trim()) {
      setGoogleError('Please enter correct name & email.');
      return;
    }

    setShowGoogleModal(false);
    onAddUser({
      name: googleCustomName,
      email: googleCustomEmail,
      roleId: googleCustomRole,
      department: googleCustomDept,
      focusEntity: googleCustomFocus,
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80`, // Google default elegant avatar
      status: 'Pending Approval'
    });

    // Bring them back to credentials sign-in screen
    setCredEmail(googleCustomEmail);
    setCredPassword('');
    setCredError('');
    setSuccessMsg(`✓ Google Sign-Up submitted cleanly for ${googleCustomName}! Your enrollment is now pending HR / Admin approval before accessing corporate modules.`);
    setActiveTab('credentials');
  };

  // Forgot Password submission handler (Enhanced with secure OTP verification)
  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotMsg('');

    const formattedQuery = forgotEmail.trim().toLowerCase();
    if (!formattedQuery) {
      setForgotError('Please enter your Corporate User ID or Email Address.');
      return;
    }

    const matchedUser = users.find(
      u => u.email.toLowerCase() === formattedQuery || u.id.toLowerCase() === formattedQuery
    );

    if (matchedUser) {
      if (matchedUser.status === 'Deactivated' || matchedUser.status === 'Left') {
        setForgotError(`Access Denied: The account for "${matchedUser.name}" has been disabled or marked inactive. Cannot retrieve credentials.`);
        return;
      }
      
      // Safe, compliant verification via Simulated Gmail OTP instead of instant leakage!
      triggerOtpDispatch(matchedUser, 'forgot');
    } else {
      setForgotError('No registered corporate account found matching that email/ID. Please verify or use "New Enrollment" to register.');
    }
  };

  // Handler for OTP Code Verification
  const handleOtpVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setGoogleError('');

    if (otpInput.trim() !== otpCode) {
      const errorText = '⚠️ Invalid 6-digit OTP code. Please check the simulated Gmail notification popup at the top right of your screen.';
      if (otpMode === 'forgot') {
        setForgotError(errorText);
      } else {
        setGoogleError(errorText);
      }
      return;
    }

    // Correct OTP code!
    setOtpVerified(true);
    
    if (otpMode === 'forgot' && otpTargetUser) {
      const userPass = otpTargetUser.password || 'rathi123';
      setForgotMsg(`✓ Identity Verified! The system-registered passkey for "${otpTargetUser.name}" is: "${userPass}".`);
      setCredEmail(otpTargetUser.email);
    } else if (otpMode === 'google_2fa' && otpTargetUser) {
      // 2FA login completes!
      setShowGoogleModal(false);
      setOtpTargetUser(null);
      setOtpCode('');
      setOtpInput('');
      setOtpVerified(false);
      onLogin(otpTargetUser.id);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Premium Stylish Background Grid & Radial Light Accents */}
      <div className="absolute inset-x-0 top-0 h-[800px] bg-gradient-to-b from-blue-50/30 via-emerald-50/15 to-transparent pointer-events-none z-0" />
      <div className="absolute top-[10%] left-[-15%] w-[600px] h-[600px] rounded-full bg-blue-300/[0.12] blur-[130px] pointer-events-none z-0" />
      <div className="absolute bottom-[10%] right-[-15%] w-[600px] h-[600px] rounded-full bg-emerald-300/[0.08] blur-[130px] pointer-events-none z-0" />
      
      {/* Modern micro-grid mesh layout pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_20%,#000_75%,transparent_100%)] pointer-events-none opacity-[0.4] z-0" />

      <div className="max-w-md w-full space-y-6 z-10 relative">
        
        {/* Branding header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/15">
            <BookOpen className="h-5 w-5 text-white animate-pulse" />
          </div>
          <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-900 font-display">
            {activeBranding?.companyName || 'Build Mart'}
          </h2>
          <p className="mt-1.5 text-xs text-slate-550 text-slate-500 font-medium font-sans">
            {activeBranding?.companyTagline || 'Corporate Learning Management System'}
          </p>
          <div className="mt-3.5 inline-flex items-center gap-2">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-[10px] font-sans text-slate-800 font-bold uppercase tracking-wider">Active Security Matrix</span>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex shadow-inner gap-1">
          <button
            onClick={() => setActiveTab('credentials')}
            className={`flex-1 py-1.5 px-2 text-[11px] sm:text-xs font-bold rounded-lg transition-all duration-200 ${
              activeTab === 'credentials'
                ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            id="tab-credentials"
          >
            Corporate ID
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-1.5 px-2 text-[11px] sm:text-xs font-bold rounded-lg transition-all duration-200 ${
              activeTab === 'register'
                ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            id="tab-register"
          >
            New Enrollment
          </button>
        </div>

        {/* Card Body */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-6 sm:p-8">
          {credError && (
            <div className="p-3 bg-red-50 rounded-xl border border-red-200 flex gap-2 text-xs text-red-800 mb-4 animate-in fade-in zoom-in-95">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{credError}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex gap-2 text-xs text-emerald-800 mb-4 animate-in fade-in zoom-in-95">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}
          
          {/* Main Credentials Tab (User/PW and Google Login Options) */}
          {activeTab === 'credentials' && (
            <div className="space-y-5">
              <div className="text-center pb-2">
                <h3 className="text-sm font-bold text-slate-800 font-display">Authenticate Organization Identity</h3>
                <p className="text-[11px] text-slate-500 mt-1">Please sign in with Google or enter your password credentials</p>
              </div>

              {/* GOOGLE SIGN IN BUTTON */}
              <div>
                <button
                  type="button"
                  onClick={() => {
                    // Populate email and name with current active user state if available to be polite
                    setGoogleCustomEmail('misrpr@rathibuildmart.com');
                    setGoogleCustomName('Aashish Sahu');
                    setGoogleTab('choose');
                    setShowGoogleModal(true);
                  }}
                  className="w-full h-11 bg-white hover:bg-slate-50 text-slate-800 font-bold px-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-150 text-xs flex items-center justify-center border border-slate-200 gap-2.5 active:scale-[0.98] cursor-pointer"
                  id="btn-google-login"
                >
                  <svg className="w-4.5 h-4.5 flex-shrink-0" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                  </svg>
                  <span>Sign in with Google Account</span>
                </button>
              </div>

              {/* Decorative separator */}
              <div className="flex items-center my-4">
                <div className="flex-1 border-t border-slate-200"></div>
                <span className="px-3 text-[10px] text-slate-400 font-mono tracking-widest uppercase font-medium">Or Corporate Credentials</span>
                <div className="flex-1 border-t border-slate-200"></div>
              </div>

              {/* USER ID / PASSWORD FORM */}
              <form onSubmit={handleCredentialsSubmit} className="space-y-4">

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-emerald-600" />
                    Corporate User ID or Email
                  </label>
                  <input
                    type="text"
                    required
                    value={credEmail}
                    onChange={(e) => { setCredEmail(e.target.value); setCredError(''); }}
                    placeholder="e.g. misrpr@rathibuildmart.com"
                    id="cred-email"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl py-2 px-3 text-xs text-slate-800 focus:ring-1 focus:ring-emerald-500 outline-none transition"
                  />
                  <div className="mt-2 flex justify-between items-center text-[10px]">
                    <button
                      type="button"
                      onClick={() => setCredEmail('misrpr@rathibuildmart.com')}
                      className="text-emerald-600 hover:text-emerald-800 font-mono font-bold cursor-pointer"
                    >
                      💡 Use Owner ID
                    </button>
                    <span className="text-slate-400 font-sans">Password verifies automatically</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-emerald-600" />
                      Security Passkey
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(credEmail);
                        setForgotMsg('');
                        setForgotError('');
                        setShowForgotModal(true);
                      }}
                      className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer transition hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={credPassword}
                      onChange={(e) => { setCredPassword(e.target.value); setCredError(''); }}
                      placeholder="••••••••"
                      id="cred-password"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl py-2 px-3 pr-10 text-xs text-slate-800 focus:ring-1 focus:ring-emerald-500 outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  id="btn-cred-login"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-md hover:shadow-emerald-900/10 transition-all text-xs mt-3 flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  Sign In with Credentials
                </button>
              </form>
            </div>
          )}

          {/* Quick Sandbox Selector (Simulate organizacional members) */}
          {activeTab === 'quick' && (
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 mb-3 font-semibold uppercase tracking-wider">
                  Select a pre-seeded account:
                </p>
                <div className="space-y-3">
                  {users.map((u) => {
                    const r = roles.find(role => role.id === u.roleId);
                    const isAdmin = u.roleId === 'role_sr_acc' || u.isSuperAdmin || u.isAdmin;
                    const isDirector = u.roleId === 'role_md' || u.roleId === 'role_ceo' || u.roleId === 'role_coo' || u.department === 'Director';
                    
                    const statusDot = (!u.status || u.status === 'Active') 
                      ? 'bg-emerald-500 animate-pulse'
                      : u.status === 'Deactivated'
                        ? 'bg-amber-500'
                        : 'bg-slate-400';
                    const statusLabel = (!u.status || u.status === 'Active')
                      ? ''
                      : u.status === 'Deactivated'
                        ? ' (Suspended)'
                        : ' (Left Group)';

                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          if (u.status === 'Deactivated') {
                            setCredError(`Access Denied: The account for "${u.name}" has been suspended/deactivated. Please contact Aashish Sahu (Director/CFO).`);
                            setSuccessMsg('');
                            setActiveTab('credentials');
                            return;
                          }
                          if (u.status === 'Left') {
                            setCredError(`Access Denied: "${u.name}" is marked as Left/Resigned and cannot access the corporate training workspace.`);
                            setSuccessMsg('');
                            setActiveTab('credentials');
                            return;
                          }
                          onLogin(u.id);
                        }}
                        className={`w-full text-left flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 transition-all duration-205 group relative text-xs ${
                          u.status === 'Deactivated' || u.status === 'Left'
                            ? 'opacity-60 border-slate-200 bg-slate-100 hover:border-red-500/20'
                            : 'hover:border-emerald-500/50 hover:bg-emerald-50/50'
                        }`}
                        id={`btn-login-${u.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={u.avatarUrl}
                            name={u.name}
                            className={`w-9 h-9 border border-slate-200 ${
                              u.status === 'Deactivated' || u.status === 'Left' ? 'grayscale' : 'group-hover:border-emerald-500'
                            }`}
                          />
                          <div>
                            <p className="font-bold text-slate-800 group-hover:text-emerald-700 transition flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`}></span>
                              {u.name}
                              <span className="text-[9px] font-medium text-slate-500 font-mono italic">{statusLabel}</span>
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono">
                              {r?.name || 'Unassigned Role'}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] uppercase font-mono tracking-wide ${
                            isDirector 
                              ? 'bg-amber-100 text-amber-800 border border-amber-200 font-bold'
                              : isAdmin 
                                ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}>
                            {isDirector ? 'Director' : isAdmin ? 'Admin' : 'Employee'}
                          </span>
                          <span className="block text-[9px] text-slate-500 mt-0.5 font-mono truncate max-w-[100px]">
                            {u.focusEntity}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-150 text-slate-500 text-[11px] text-center font-mono">
                💡 Sandbox selection bypasses credentials passwords for training managers to audit paths cleanly.
              </div>
            </div>
          )}

          {/* New Enrollment (custom user signup / register) */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="text-center pb-2">
                <h3 className="text-sm font-bold text-slate-800 font-display">New Employee Enrollment</h3>
                <p className="text-xs text-slate-500 mt-0.5">Register a custom corporate profile in {activeBranding?.companyName || 'Rathi'} {activeBranding?.companyAbbreviation || 'LMS'}</p>
              </div>

              {regError && (
                <div id="reg-error-msg" className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-850 text-rose-800 text-xs font-semibold text-center animate-in fade-in duration-250">
                  ⚠️ {regError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Aashish Sahu"
                  id="reg-name"
                  className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg py-2 px-3 text-sm text-slate-800 focus:ring-1 focus:ring-emerald-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-emerald-600" />
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="e.g. misrpr@rathibuildmart.com"
                  id="reg-email"
                  className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg py-2 px-3 text-sm text-slate-800 focus:ring-1 focus:ring-emerald-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                  Job Role
                </label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  id="reg-role"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg py-2 pl-3 pr-8 text-sm text-slate-800 focus:ring-1 focus:ring-emerald-500 outline-none transition"
                >
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-emerald-600" />
                  Department
                </label>
                {departments && departments.length > 0 ? (
                  <select
                    value={newUserDept}
                    onChange={(e) => setNewUserDept(e.target.value)}
                    id="reg-dept"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg py-2 pl-3 pr-8 text-sm text-slate-800 focus:ring-1 focus:ring-emerald-500 outline-none transition"
                  >
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={newUserDept}
                    onChange={(e) => setNewUserDept(e.target.value)}
                    placeholder="e.g. Internal Audit"
                    id="reg-dept"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg py-2 px-3 text-sm text-slate-800 focus:ring-1 focus:ring-emerald-500 outline-none transition"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Assigned Entity / Branch
                </label>
                <input
                  type="text"
                  value={newUserFocus}
                  onChange={(e) => setNewUserFocus(e.target.value)}
                  placeholder="e.g. Mumbai Logistics Matrix"
                  id="reg-focus"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg py-2 px-3 text-sm text-slate-800 focus:ring-1 focus:ring-emerald-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-emerald-600" />
                  Security Password / Passkey <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="Default password is rathi123"
                  id="reg-password"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg py-2 px-3 text-sm text-slate-800 focus:ring-1 focus:ring-emerald-500 outline-none transition font-sans"
                />
              </div>

              <button
                type="submit"
                id="btn-register-submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 text-sm mt-2 flex items-center justify-center gap-1.5"
              >
                Register & Initialize Path
              </button>
            </form>
          )}

        </div>

        {/* Footer branding */}
        <div className="text-center font-mono text-[9px] text-slate-400 uppercase tracking-wider">
          {activeBranding?.companyTagline || 'RATHI BUILDMART PLC GENERAL LEDGER DIVISION'} SECURITY ACT © 2026
        </div>

      </div>

      {/* SECURE HIGH-FIDELITY SIMULATED GOOGLE OAUTH POPUP MODAL */}
      <AnimatePresence>
        {showGoogleModal && (
          <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden text-slate-800 border border-slate-200"
            >
              {/* Google top branding */}
              <div className="px-6 pt-7 pb-4 text-center border-b border-slate-100">
                <div className="flex justify-center mb-3">
                  <svg className="w-8 h-8" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                  </svg>
                </div>
                {selectedGoogleUser ? (
                  <>
                    <h3 className="text-base font-bold text-slate-900 font-sans">Verify Account Password</h3>
                    <p className="text-xs text-slate-500 mt-1">To protect your privacy, please enter password to log in as <strong>{selectedGoogleUser.name}</strong></p>
                  </>
                ) : (
                  <>
                    <h3 className="text-base font-bold text-slate-900 font-sans">Sign in with Google</h3>
                    <p className="text-xs text-slate-500 mt-1">to continue to <strong className="text-emerald-750 text-emerald-700">{activeBranding?.companyName || 'Rathi Build Mart'} {activeBranding?.companyAbbreviation || 'LMS'}</strong></p>
                    
                    {/* Simulated Google Tab Bar */}
                    <div className="flex mt-4 border-t border-slate-100 pt-3 text-xs gap-4 justify-center">
                      <button 
                        onClick={() => setGoogleTab('choose')}
                        className={`pb-1 font-semibold ${googleTab === 'choose' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}
                      >
                        Select Account
                      </button>
                      <button 
                        onClick={() => {
                          setGoogleTab('signup');
                          setGoogleCustomEmail('misrpr@rathibuildmart.com');
                          setGoogleCustomName('Aashish Sahu');
                        }}
                        className={`pb-1 font-semibold ${googleTab === 'signup' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}
                      >
                        Google Sign Up
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Simulated Google Tab Content */}
              <div className="p-5 max-h-[340px] overflow-y-auto">
                {googleError && (
                  <div className="mb-3.5 p-2.5 bg-rose-50 text-rose-700 text-[11px] font-bold rounded-lg border border-rose-200 animate-in fade-in flex gap-2">
                    <span>⚠️</span>
                    <span>{googleError}</span>
                  </div>
                )}
                {selectedGoogleUser ? (
                  /* Double verification panel */
                  <div className="space-y-4 animate-in fade-in duration-200">
                    {/* User Profile Header */}
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                      <Avatar
                        src={selectedGoogleUser.avatarUrl}
                        name={selectedGoogleUser.name}
                        className="w-10 h-10 border border-slate-200"
                      />
                      <div className="truncate text-left">
                        <p className="text-xs font-bold text-slate-900 leading-tight">{selectedGoogleUser.name}</p>
                        <p className="text-[10px] text-slate-500 truncate leading-snug">{selectedGoogleUser.email}</p>
                      </div>
                    </div>

                    {/* Method Selector Tabs */}
                    <div className="flex bg-slate-100 p-1 rounded-xl text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => { setOtpMethod('password'); setGoogleError(''); }}
                        className={`flex-1 py-1.5 rounded-lg text-center transition cursor-pointer ${otpMethod === 'password' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        🔑 Use Passkey
                      </button>
                      <button
                        type="button"
                        onClick={() => { 
                          setOtpMethod('otp'); 
                          setGoogleError('');
                          if (selectedGoogleUser) {
                            triggerOtpDispatch(selectedGoogleUser, 'google_2fa');
                          }
                        }}
                        className={`flex-1 py-1.5 rounded-lg text-center transition cursor-pointer ${otpMethod === 'otp' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        ✉️ 2-Step OTP Code
                      </button>
                    </div>

                    {otpMethod === 'password' ? (
                      /* Password Form */
                      <form onSubmit={handleGooglePasswordVerifySubmit} className="space-y-4">
                        <div className="text-left">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 text-blue-600" />
                            Account Passkey
                          </label>
                          <div className="relative">
                            <input
                              type={showGooglePassword ? 'text' : 'password'}
                              required
                              value={googlePassword}
                              onChange={(e) => { setGooglePassword(e.target.value); setGoogleError(''); }}
                              placeholder="••••••••"
                              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl py-2 px-3 pr-10 text-xs text-slate-800 focus:ring-1 focus:ring-blue-500 outline-none transition"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => setShowGooglePassword(!showGooglePassword)}
                              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                              tabIndex={-1}
                            >
                              {showGooglePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="flex gap-2.5 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedGoogleUser(null);
                              setGooglePassword('');
                              setGoogleError('');
                            }}
                            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl text-xs transition cursor-pointer border border-slate-200"
                          >
                            Back
                          </button>
                          <button
                            type="submit"
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl text-xs transition flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                          >
                            Verify & Login
                          </button>
                        </div>
                      </form>
                    ) : (
                      /* OTP 2FA Form */
                      <div className="space-y-4">
                        {isSendingOtp ? (
                          <div className="py-6 text-center space-y-3">
                            <RefreshCw className="w-6.5 h-6.5 text-blue-600 animate-spin mx-auto" />
                            <p className="text-[10px] font-mono text-slate-400 animate-pulse">Delivering 2FA Token to Gmail Inbox...</p>
                          </div>
                        ) : (
                          <form onSubmit={handleOtpVerifySubmit} className="space-y-4 text-left">
                            {isRealEmailSent ? (
                              <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl text-[10px] text-emerald-800 leading-normal space-y-1">
                                <p className="font-bold">🚀 SMTP Live Delivery Dispatched!</p>
                                <p>We successfully dispatched a real security 2FA OTP code to <strong>{selectedGoogleUser.email}</strong> via SMTP. Please open your real email client to retrieve it.</p>
                              </div>
                            ) : (
                              <div className="bg-blue-50/50 border border-blue-100 p-2.5 rounded-xl text-[10px] text-blue-800 leading-normal space-y-1.5 text-left">
                                <div className="flex items-center justify-between">
                                  <p className="font-bold flex items-center gap-1"><Lock className="w-3 h-3 text-blue-600" /> Screen Privacy Active</p>
                                  <span className="bg-blue-100 text-blue-800 text-[8px] font-bold px-1 py-0.5 rounded uppercase font-mono">Sandbox Fallback</span>
                                </div>
                                <p>To prevent shoulder-surfing, 2FA notifications are masked on the lock screen. Open your private simulated workspace inbox or disable the privacy mask below:</p>
                                <div className="pt-2 flex items-center justify-between border-t border-blue-200/30">
                                  <button
                                    type="button"
                                    onClick={() => { setGmailAppOpen(true); setGmailAuthenticated(false); }}
                                    className="text-blue-700 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer bg-blue-100 px-1.5 py-0.5 rounded transition"
                                  >
                                    <Inbox className="w-3 h-3" /> 🌐 Open Webmail
                                  </button>
                                  <label className="flex items-center gap-1 cursor-pointer text-slate-500 font-bold select-none">
                                    <input
                                      type="checkbox"
                                      checked={!lockScreenPrivacy}
                                      onChange={(e) => setLockScreenPrivacy(!e.target.checked)}
                                      className="rounded text-blue-600 h-2.5 w-2.5"
                                    />
                                    Unmask OTP
                                  </label>
                                </div>
                              </div>
                            )}

                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">
                                Enter 6-Digit OTP Code
                              </label>
                              <input
                                type="text"
                                required
                                maxLength={6}
                                value={otpInput}
                                onChange={(e) => {
                                  setOtpInput(e.target.value.replace(/\D/g, ''));
                                  setGoogleError('');
                                }}
                                placeholder="e.g. 123456"
                                className="w-full text-center tracking-widest text-base font-bold py-2 px-3 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl focus:border-blue-500 outline-none transition"
                                autoFocus
                              />
                            </div>

                            <div className="flex gap-2.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedGoogleUser(null);
                                  setGoogleError('');
                                }}
                                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl text-xs transition border border-slate-200"
                              >
                                Back
                              </button>
                              <button
                                type="submit"
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl text-xs transition shadow-sm"
                              >
                                Secure Verify & Login
                              </button>
                            </div>

                            <div className="text-center pt-1 border-t border-slate-100">
                              {otpTimer > 0 ? (
                                <span className="text-[9px] text-slate-400 font-mono">
                                  Resend 2FA code in <strong className="text-slate-600">{otpTimer}s</strong>
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => triggerOtpDispatch(selectedGoogleUser, 'google_2fa')}
                                  className="text-[9px] text-blue-600 hover:text-blue-700 hover:underline font-bold transition flex items-center gap-1 mx-auto"
                                >
                                  <RefreshCw className="w-3 h-3" /> Resend OTP Code
                                </button>
                              )}
                            </div>
                          </form>
                        )}
                      </div>
                    )}
                  </div>
                ) : googleTab === 'choose' ? (
                  <div className="space-y-2">
                    <p className="text-[11px] text-slate-400 uppercase font-mono tracking-wider font-semibold mb-2">Google Accounts on this Device</p>
                    {users.map((u) => (
                      <button
                        key={`google-${u.id}`}
                        onClick={() => handleGoogleAccountSelect(u)}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all flex items-center gap-3"
                      >
                        <Avatar
                          src={u.avatarUrl}
                          name={u.name}
                          className="w-8 h-8 border border-slate-200"
                        />
                        <div className="flex-1 truncate">
                          <p className="text-xs font-bold text-slate-900 leading-tight">{u.name}</p>
                          <p className="text-[10px] text-slate-500 truncate leading-snug">{u.email}</p>
                        </div>
                      </button>
                    ))}
                    
                    <button
                      onClick={() => {
                        setGoogleTab('signup');
                        setGoogleCustomEmail('');
                        setGoogleCustomName('');
                      }}
                      className="w-full p-2.5 rounded-xl hover:bg-slate-50 border border-dashed border-slate-200 text-left text-xs text-blue-600 font-semibold flex items-center justify-center gap-2 mt-2"
                    >
                      <span>➕ Use another / custom Google Account</span>
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleGoogleSignUpSubmit} className="space-y-3">
                    {googleError && (
                      <div className="p-2.5 bg-rose-50 text-rose-700 text-[11px] font-bold rounded-lg border border-rose-200 animate-in fade-in">
                        ⚠️ {googleError}
                      </div>
                    )}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Your Google Name</label>
                      <input
                        type="text"
                        required
                        value={googleCustomName}
                        onChange={(e) => setGoogleCustomName(e.target.value)}
                        placeholder="e.g. Aashish Sahu"
                        className="w-full text-xs p-2 border border-slate-300 rounded focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Google Email / Gmail Address</label>
                      <input
                        type="email"
                        required
                        value={googleCustomEmail}
                        onChange={(e) => setGoogleCustomEmail(e.target.value)}
                        placeholder="e.g. misrpr@rathibuildmart.com"
                        className="w-full text-xs p-2 border border-slate-300 rounded focus:border-blue-500 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Assigned Role</label>
                        <select
                          value={googleCustomRole}
                          onChange={(e) => setGoogleCustomRole(e.target.value)}
                          className="w-full text-[11px] p-2 border border-slate-300 rounded focus:border-blue-500 outline-none bg-white"
                        >
                          {roles.map(r => (
                            <option key={`gr-${r.id}`} value={r.id}>{r.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Department</label>
                        {departments && departments.length > 0 ? (
                          <select
                            value={googleCustomDept}
                            onChange={(e) => setGoogleCustomDept(e.target.value)}
                            className="w-full text-xs p-2 border border-slate-300 rounded focus:border-blue-500 bg-white outline-none"
                          >
                            {departments.map(dept => (
                              <option key={dept} value={dept}>{dept}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={googleCustomDept}
                            onChange={(e) => setGoogleCustomDept(e.target.value)}
                            placeholder="e.g. Finance"
                            className="w-full text-xs p-2 border border-slate-300 rounded focus:border-blue-500 outline-none"
                          />
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Assigned Entity</label>
                      <input
                        type="text"
                        value={googleCustomFocus}
                        onChange={(e) => setGoogleCustomFocus(e.target.value)}
                        placeholder="e.g. Rathi Buildmart HQ"
                        className="w-full text-xs p-2 border border-slate-300 rounded focus:border-blue-500 outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded text-xs transition duration-150 flex items-center justify-center gap-1.5"
                    >
                      Authenticate Google Token
                    </button>
                  </form>
                )}
              </div>

              {/* Popup footer */}
              <div className="bg-slate-50 px-6 py-4 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100">
                <span>To continue, Google shares your profile details.</span>
                <button
                  type="button"
                  onClick={() => {
                    setShowGoogleModal(false);
                    setSelectedGoogleUser(null);
                    setGooglePassword('');
                    setGoogleError('');
                  }}
                  className="text-slate-800 hover:text-black font-semibold font-sans uppercase cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showForgotModal && (
          <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden text-slate-800 border border-slate-200"
            >
              <div className="px-6 pt-7 pb-4 text-center border-b border-slate-100">
                <div className="mx-auto h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-3">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-base font-bold text-slate-900 font-sans">Secure Passkey Recovery</h3>
                <p className="text-xs text-slate-500 mt-1">Verify identity via Gmail OTP to retrieve your passkey</p>
              </div>

              <div className="p-6">
                {isSendingOtp ? (
                  /* Loading / Sending Handshake state */
                  <div className="py-8 text-center space-y-4">
                    <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-700">Initiating Safe Handshake...</p>
                      <p className="text-[10px] text-slate-400 font-mono animate-pulse">Contacting Google SMTP Node & dispatching security token...</p>
                    </div>
                  </div>
                ) : isOtpSent ? (
                  /* OTP Code input state */
                  <div className="space-y-4">
                    {forgotError && (
                      <div className="p-2.5 bg-rose-50 text-rose-700 text-[11px] font-bold rounded-lg border border-rose-100 text-center leading-normal">
                        ⚠️ {forgotError}
                      </div>
                    )}

                    {forgotMsg && (
                      <div className="p-3 bg-emerald-50 text-emerald-800 text-[11px] font-medium rounded-xl border border-emerald-100 leading-normal text-center space-y-3">
                        <div className="flex justify-center">
                          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                        </div>
                        <p>{forgotMsg}</p>
                        
                        {otpTargetUser && (
                          <button
                            type="button"
                            onClick={() => {
                              setCredEmail(otpTargetUser.email);
                              setCredPassword(otpTargetUser.password || 'rathi123');
                              setShowForgotModal(false);
                              setOtpTargetUser(null);
                              setIsOtpSent(false);
                              setOtpVerified(false);
                              setForgotMsg('');
                              setSuccessMsg('✓ Credentials pre-filled! Click "Sign in" below to enter.');
                            }}
                            className="w-full bg-slate-900 hover:bg-black text-white text-xs font-bold py-2 rounded-lg transition"
                          >
                            Pre-fill & Close Recovery
                          </button>
                        )}
                      </div>
                    )}

                    {!otpVerified && (
                      <form onSubmit={handleOtpVerifySubmit} className="space-y-4">
                        {isRealEmailSent ? (
                          <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-100 text-left space-y-2">
                            <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                              <Send className="w-4 h-4 text-emerald-600 animate-pulse" />
                              SMTP Live Delivery Dispatched!
                            </div>
                            <p className="text-[10px] text-emerald-700 leading-normal">
                              We successfully dispatched a real security OTP to <strong>{otpTargetUser?.email}</strong> via SMTP. Please check your actual mail inbox (or spam folder) to grab the code.
                            </p>
                          </div>
                        ) : (
                          <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200/50 text-left space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-amber-800 font-bold flex items-center gap-1.5">
                                <Lock className="w-3.5 h-3.5 text-amber-600" />
                                Screen Privacy Mask Active
                              </p>
                              <span className="bg-amber-100 text-amber-800 text-[8px] font-bold px-1.5 py-0.5 rounded-md uppercase font-mono">Sandbox Fallback</span>
                            </div>
                            <p className="text-[10px] text-slate-600 leading-normal">
                              To prevent shoulder-surfing, sensitive verification popups are hidden on the public lock screen. You can access the OTP privately by opening the Simulated Workspace Inbox:
                            </p>
                            <div className="pt-2 flex items-center justify-between border-t border-amber-200/40 text-[10px]">
                              <button
                                type="button"
                                onClick={() => { setGmailAppOpen(true); setGmailAuthenticated(false); }}
                                className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer bg-amber-100/50 hover:bg-amber-100 px-2 py-1 rounded-md transition"
                              >
                                <Inbox className="w-3.5 h-3.5" /> 🌐 Open Private Inbox App
                              </button>
                              <label className="flex items-center gap-1.5 cursor-pointer text-slate-500 font-medium select-none">
                                <input
                                  type="checkbox"
                                  checked={!lockScreenPrivacy}
                                  onChange={(e) => setLockScreenPrivacy(!e.target.checked)}
                                  className="rounded text-blue-600 focus:ring-blue-500 h-3 w-3"
                                />
                                Disable Privacy Mask
                              </label>
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">
                            Enter 6-Digit OTP Code
                          </label>
                          <input
                            type="text"
                            required
                            maxLength={6}
                            value={otpInput}
                            onChange={(e) => {
                              setOtpInput(e.target.value.replace(/\D/g, ''));
                              setForgotError('');
                            }}
                            placeholder="e.g. 123456"
                            className="w-full text-center tracking-widest text-lg font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none transition"
                            autoFocus
                          />
                        </div>

                        <div className="flex gap-2.5">
                          <button
                            type="button"
                            onClick={() => {
                              setIsOtpSent(false);
                              setOtpVerified(false);
                              setOtpInput('');
                              setForgotError('');
                            }}
                            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl text-xs transition border border-slate-200"
                          >
                            Back
                          </button>
                          <button
                            type="submit"
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl text-xs transition shadow-sm"
                          >
                            Verify Code
                          </button>
                        </div>

                        {/* Resend button */}
                        <div className="text-center pt-1.5 border-t border-slate-100">
                          {otpTimer > 0 ? (
                            <span className="text-[10px] text-slate-400 font-mono">
                              Resend code in <strong className="text-slate-600">{otpTimer}s</strong>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => otpTargetUser && triggerOtpDispatch(otpTargetUser, 'forgot')}
                              className="text-[10px] text-blue-600 hover:text-blue-700 hover:underline font-bold transition flex items-center gap-1 mx-auto"
                            >
                              <RefreshCw className="w-3 h-3" /> Resend Verification Code
                            </button>
                          )}
                        </div>
                      </form>
                    )}
                  </div>
                ) : (
                  /* Initial email query state */
                  <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                    {forgotError && (
                      <div className="p-2.5 bg-rose-50 text-rose-700 text-[11px] font-bold rounded-lg border border-rose-100 text-center">
                        ⚠️ {forgotError}
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">
                        Enter Employee Corporate Email / User ID
                      </label>
                      <input
                        type="text"
                        required
                        value={forgotEmail}
                        onChange={(e) => {
                          setForgotEmail(e.target.value);
                          setForgotError('');
                          setForgotMsg('');
                        }}
                        placeholder="e.g. misrpr@rathibuildmart.com"
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none transition"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Request Authentication OTP
                    </button>
                  </form>
                )}
              </div>

              <div className="bg-slate-50 px-6 py-4 flex items-center justify-end text-[11px] text-slate-500 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setOtpTargetUser(null);
                    setIsOtpSent(false);
                    setOtpVerified(false);
                    setForgotMsg('');
                    setForgotError('');
                  }}
                  className="text-slate-800 hover:text-black font-semibold font-sans uppercase cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Simulated Gmail Notification Toast with Lock Screen Privacy */}
      <AnimatePresence>
        {simulatedMailPopup && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-4 right-4 z-[9999] max-w-sm w-full bg-slate-950 text-white rounded-2xl shadow-2xl overflow-hidden border border-slate-800 font-sans"
          >
            <div className="bg-slate-900 px-4 py-3 border-b border-slate-850 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-red-600 text-white rounded-md p-1 font-black text-[9px] w-5 h-5 flex items-center justify-center shadow-xs">
                  M
                </div>
                <span className="text-[10px] font-bold tracking-wider text-slate-300 uppercase">Gmail Inbox Simulator</span>
              </div>
              <div className="flex items-center gap-2">
                {lockScreenPrivacy ? (
                  <span className="text-[8px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" /> Masked
                  </span>
                ) : (
                  <span className="text-[8px] bg-rose-500/20 text-rose-300 font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                    ⚠️ Exposed
                  </span>
                )}
                <span className="text-[9px] text-slate-500 font-mono">{simulatedMailPopup.time}</span>
              </div>
            </div>
            
            <div className="p-4 text-left">
              <p className="text-[11px] text-emerald-400 font-semibold mb-1 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                New Security Email Delivered
              </p>

              {lockScreenPrivacy && simulatedMailPopup.subject.includes('OTP') ? (
                /* Privacy Mode Enabled - REDACTED Notification */
                <div className="space-y-3">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-500" />
                      LMS OTP Security Verification: <span className="text-amber-500 font-mono">******</span>
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">From: security@rathibuildmart.com</p>
                    <p className="text-[10px] text-slate-400 truncate">To: {simulatedMailPopup.receiver}</p>
                  </div>

                  <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 text-[10px] text-amber-300/90 font-mono leading-normal">
                    <p className="font-bold mb-1 text-amber-400">🔒 LOCK SCREEN PRIVACY ACTIVE</p>
                    Sensitive security keys are masked on the lock screen. Open your private workspace inbox, or click 'Unlock Code' to bypass privacy filters.
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => { setGmailAppOpen(true); setGmailAuthenticated(false); }}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold py-2 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Inbox className="w-3.5 h-3.5" /> Open Webmail App
                    </button>
                    <button
                      type="button"
                      onClick={() => setLockScreenPrivacy(false)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold px-3 py-2 rounded-lg transition cursor-pointer"
                    >
                      Unlock Code
                    </button>
                  </div>
                </div>
              ) : (
                /* Privacy Mode Disabled - UNMASKED Notification */
                <div className="space-y-3">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-white">{simulatedMailPopup.subject}</p>
                    <p className="text-[10px] text-slate-400 truncate">From: {simulatedMailPopup.sender}</p>
                    <p className="text-[10px] text-slate-400 truncate">To: {simulatedMailPopup.receiver}</p>
                  </div>
                  
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-850 text-[10px] text-slate-300 font-mono whitespace-pre-line leading-relaxed">
                    {simulatedMailPopup.body}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyOtp(simulatedMailPopup.otp)}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold py-1.5 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer active:scale-[0.98]"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-300" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setLockScreenPrivacy(true)}
                      className="bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-slate-200 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                    >
                      Mask
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-3 pt-2.5 border-t border-slate-900 flex justify-between items-center text-[9px] text-slate-500 font-sans">
                <span>Prevent unauthorized access</span>
                <button 
                  type="button"
                  onClick={() => setSimulatedMailPopup(null)}
                  className="hover:text-slate-300 transition"
                >
                  Close Alert
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Private Google Workspace Simulated Gmail Portal Modal */}
      <AnimatePresence>
        {gmailAppOpen && (
          <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full h-[520px] overflow-hidden text-slate-800 border border-slate-200 flex flex-col font-sans"
            >
              {/* Header */}
              <div className="bg-red-600 text-white px-5 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="bg-white text-red-600 font-black rounded p-1 text-xs w-6 h-6 flex items-center justify-center shadow-xs">
                    M
                  </div>
                  <div>
                    <h3 className="text-sm font-bold tracking-tight">Rathi Google Workspace Mail</h3>
                    <p className="text-[10px] text-red-100 font-medium">Secure Employee Communications Portal</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setGmailAppOpen(false);
                    setGmailAuthenticated(false);
                    setGmailPasswordInput('');
                    setGmailAuthError('');
                  }}
                  className="bg-red-700/50 hover:bg-red-700 text-red-100 hover:text-white px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  Exit Mail Client
                </button>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 bg-slate-50 overflow-y-auto flex">
                {!gmailAuthenticated ? (
                  /* Gmail Authentication Portal */
                  <div className="m-auto max-w-sm w-full p-8 bg-white rounded-2xl border border-slate-200/80 shadow-md text-center space-y-5 animate-in fade-in zoom-in-95 duration-250">
                    <div className="mx-auto w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Identify Account Ownership</h4>
                      <p className="text-xs text-slate-400 mt-1">To view sensitive verification emails, sign in to your corporate mailbox.</p>
                    </div>

                    <div className="space-y-4 text-left">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Corporate Email Address</label>
                        <input
                          type="text"
                          disabled
                          value={otpTargetUser?.email || selectedGoogleUser?.email || 'misrpr@rathibuildmart.com'}
                          className="w-full text-xs p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed outline-none"
                        />
                      </div>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          setGmailAuthError('');
                          if (gmailPasswordInput.trim() === 'gmail123') {
                            setGmailAuthenticated(true);
                          } else {
                            setGmailAuthError('Invalid email password. (Security notice: Use demo credentials "gmail123" to simulate private email client access).');
                          }
                        }}
                        className="space-y-3"
                      >
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Enter Gmail Password</label>
                          <input
                            type="password"
                            required
                            value={gmailPasswordInput}
                            onChange={(e) => {
                              setGmailPasswordInput(e.target.value);
                              setGmailAuthError('');
                            }}
                            placeholder="••••••••"
                            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 focus:border-red-500 focus:bg-white rounded-xl outline-none transition"
                            autoFocus
                          />
                        </div>

                        {gmailAuthError && (
                          <p className="text-[10px] text-rose-600 font-medium leading-normal bg-rose-50 p-2 rounded-lg border border-rose-100">
                            {gmailAuthError}
                          </p>
                        )}

                        <button
                          type="submit"
                          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-xl text-xs transition duration-150 cursor-pointer shadow-xs"
                        >
                          Verify & Access Inbox
                        </button>
                      </form>
                    </div>

                    <p className="text-[9px] text-slate-400 font-medium">
                      🔒 Secured via corporate SSO token policy.
                    </p>
                  </div>
                ) : (
                  /* Gmail Mailbox View */
                  <div className="flex-1 flex animate-in fade-in duration-200">
                    {/* Sidebar */}
                    <div className="w-44 border-r border-slate-200 bg-white p-3 space-y-1 flex flex-col justify-between">
                      <div className="space-y-0.5">
                        <button type="button" className="w-full bg-red-50 text-red-600 font-bold text-xs py-2 px-3 rounded-lg flex items-center gap-2 text-left">
                          <Inbox className="w-3.5 h-3.5" /> Inbox <span className="ml-auto bg-red-100 text-red-800 text-[9px] px-1.5 py-0.5 rounded-full font-black">1</span>
                        </button>
                        <button type="button" className="w-full text-slate-500 hover:bg-slate-50 font-bold text-xs py-2 px-3 rounded-lg flex items-center gap-2 text-left transition">
                          <Send className="w-3.5 h-3.5" /> Sent Mail
                        </button>
                        <button type="button" className="w-full text-slate-500 hover:bg-slate-50 font-bold text-xs py-2 px-3 rounded-lg flex items-center gap-2 text-left transition">
                          <AlertCircle className="w-3.5 h-3.5" /> Spam
                        </button>
                      </div>
                      <div className="p-2 border-t border-slate-100 text-[10px] text-slate-400 leading-normal">
                        Logged in as:<br />
                        <strong className="text-slate-600 truncate block">{otpTargetUser?.email || selectedGoogleUser?.email || 'employee@rathibuildmart.com'}</strong>
                      </div>
                    </div>

                    {/* Email List or Reading Pane */}
                    <div className="flex-1 flex flex-col bg-white">
                      {/* Search Bar mock */}
                      <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                        <input
                          type="text"
                          disabled
                          placeholder="Search mail..."
                          className="flex-1 bg-white border border-slate-200 text-xs px-3 py-1.5 rounded-lg cursor-not-allowed outline-none"
                        />
                      </div>

                      {/* Active Email Reading Pane */}
                      <div className="flex-1 p-5 overflow-y-auto space-y-4">
                        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                          <div>
                            <h4 className="text-sm font-bold text-slate-800">🔐 LMS Security Alert: Passkey Recovery Token</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">From: <strong>Rathi Build Mart LMS Security</strong> &lt;security@rathibuildmart.com&gt;</p>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">Today, 2FA System</span>
                        </div>

                        <div className="space-y-3 text-xs text-slate-600 leading-relaxed font-sans">
                          <p>Dear <strong>{otpTargetUser?.name || selectedGoogleUser?.name || 'Employee'}</strong>,</p>
                          <p>A secure identity verification request was received for your Rathi Build Mart Learning Management System account.</p>
                          
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 my-4 text-center max-w-sm mx-auto">
                            <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">Your 6-Digit Verification Code</span>
                            <span className="text-2xl font-black text-blue-600 tracking-widest font-mono">{otpCode}</span>
                          </div>

                          <p className="text-[10px] text-amber-600 bg-amber-50 p-2.5 rounded-lg border border-amber-100">
                            ⚠️ <strong>Corporate Security Warning:</strong> This code is valid for 5 minutes. Never share this code with anyone. Rathi IT support will never ask for your security verification PIN.
                          </p>
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopyOtp(otpCode)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-4 rounded-xl text-xs transition duration-150 flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-300" />
                                <span>Copied Code!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Code to Clipboard</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 text-center text-[10px] text-slate-400 font-sans flex items-center justify-between">
                <span>© 2026 Rathi Build Mart Pvt Ltd. All corporate rights reserved.</span>
                <span className="font-semibold text-slate-500">Workspace Verification Module</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
