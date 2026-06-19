/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Role, CompanyBranding } from '../types';
import { getCompanyBranding } from '../data/stateManager';
import { Shield, BookOpen, UserPlus, Building, Briefcase, Mail, Key, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, UserCheck } from 'lucide-react';
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

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    if (!newUserName.trim() || !newUserEmail.trim()) {
      setRegError('Please fill out all required fields.');
      return;
    }
    
    // Create new profile with password
    onAddUser({
      name: newUserName,
      email: newUserEmail,
      roleId: newUserRole,
      department: newUserDept,
      focusEntity: newUserFocus,
      password: newUserPassword || 'rathi123',
      avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 500000)}?w=120&auto=format&fit=crop&q=80`
    });

    // Provide user feedback and redirect to credentials tab without auto-logging in
    setCredEmail(newUserEmail);
    setCredPassword(newUserPassword);
    setCredError('');
    setSuccessMsg(`Registration successful for ${newUserName}! Please use your credentials or corporate password to sign in below.`);
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
      if (matchedUser.status === 'Deactivated') {
        setCredError(`Access Denied: The account for "${matchedUser.name}" has been suspended/deactivated. Please contact Suresh Rathi (Director/CFO) or the Learning Admin.`);
        return;
      }
      if (matchedUser.status === 'Left') {
        setCredError(`Access Denied: "${matchedUser.name}" has left/resigned and is no longer permitted to access the corporate training workspace.`);
        return;
      }

      const userPass = matchedUser.password || 'rathi123';
      if (credPassword !== userPass) {
        setCredError('Incorrect credentials or corporate password. Please try again or contact Suresh Rathi (Director/CFO) to reset.');
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
    setShowGoogleModal(false);
    onLogin(user.id);
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
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80` // Google default elegant avatar
    });

    // Bring them back to credentials sign-in screen
    setCredEmail(googleCustomEmail);
    setCredPassword('');
    setCredError('');
    setSuccessMsg(`Google Account for ${googleCustomName} integrated successfully! Click the "Sign in with Google" button below or use your Email / Password.`);
    setActiveTab('credentials');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Decorative ambient gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-950/20 blur-[130px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-slate-900/40 blur-[130px] pointer-events-none"></div>

      <div className="max-w-md w-full space-y-6 z-10">
        
        {/* Branding header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-900/15">
            <BookOpen className="h-5 w-5 text-white animate-pulse" />
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-white font-sans">
            {activeBranding?.companyName || 'Build Mart'}
          </h2>
          <p className="mt-1.5 text-xs text-slate-400 font-medium">
            {activeBranding?.companyTagline || 'Corporate Learning Management System'}
          </p>
          <div className="mt-3.5 inline-flex items-center gap-1.5 bg-slate-900/70 border border-slate-800/80 rounded-full px-3.5 py-1">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] font-mono text-emerald-450 text-emerald-400 font-semibold tracking-wider uppercase">Active Security Matrix</span>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="bg-slate-900/90 p-1 rounded-xl border border-slate-800/80 flex shadow-inner gap-1">
          <button
            onClick={() => setActiveTab('credentials')}
            className={`flex-1 py-1.5 px-2 text-[11px] sm:text-xs font-bold rounded-lg transition-all duration-200 ${
              activeTab === 'credentials'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
            id="tab-credentials"
          >
            Corporate ID
          </button>
          {showSandbox && (
            <button
              onClick={() => setActiveTab('quick')}
              className={`flex-1 py-1.5 px-2 text-[11px] sm:text-xs font-bold rounded-lg transition-all duration-200 ${
                activeTab === 'quick'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              id="tab-quick"
            >
              Sandbox Profiles
            </button>
          )}
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-1.5 px-2 text-[11px] sm:text-xs font-bold rounded-lg transition-all duration-200 ${
              activeTab === 'register'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
            id="tab-register"
          >
            New Enrollment
          </button>
        </div>

        {/* Card Body */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl shadow-xl backdrop-blur-md p-6 sm:p-8">
          {credError && (
            <div className="p-3 bg-red-950/55 rounded-xl border border-red-800/50 flex gap-2 text-xs text-red-200 mb-4 animate-in fade-in zoom-in-95">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{credError}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-950/50 rounded-xl border border-emerald-800/40 flex gap-2 text-xs text-emerald-200 mb-4 animate-in fade-in zoom-in-95">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}
          
          {/* Main Credentials Tab (User/PW and Google Login Options) */}
          {activeTab === 'credentials' && (
            <div className="space-y-5">
              <div className="text-center pb-2">
                <h3 className="text-sm font-bold text-slate-100">Authenticate Organization Identity</h3>
                <p className="text-[11px] text-slate-400 mt-1">Please sign in with Google or enter your password credentials</p>
              </div>

              {/* GOOGLE SIGN IN BUTTON */}
              <div>
                <button
                  type="button"
                  onClick={() => {
                    // Populate email and name with current active user state if available to be polite
                    setGoogleCustomEmail('misrpr@rathibuildmart.com');
                    setGoogleCustomName('Suresh Rathi');
                    setGoogleTab('choose');
                    setShowGoogleModal(true);
                  }}
                  className="w-full h-11 bg-white hover:bg-slate-50 text-slate-900 font-bold px-4 rounded-xl shadow-md transition-all duration-150 text-xs flex items-center justify-center border border-slate-200 gap-2.5 active:scale-[0.98] cursor-pointer"
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
                <div className="flex-1 border-t border-slate-800/60"></div>
                <span className="px-3 text-[10px] text-slate-500 font-mono tracking-widest uppercase font-medium">Or Corporate Credentials</span>
                <div className="flex-1 border-t border-slate-800/60"></div>
              </div>

              {/* USER ID / PASSWORD FORM */}
              <form onSubmit={handleCredentialsSubmit} className="space-y-4">

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-emerald-500" />
                    Corporate User ID or Email
                  </label>
                  <input
                    type="text"
                    required
                    value={credEmail}
                    onChange={(e) => { setCredEmail(e.target.value); setCredError(''); }}
                    placeholder="e.g. misrpr@rathibuildmart.com"
                    id="cred-email"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl py-2 px-3 text-xs text-slate-200 focus:ring-1 focus:ring-emerald-500 outline-none transition"
                  />
                  <div className="mt-2 flex justify-between items-center text-[10px]">
                    <button
                      type="button"
                      onClick={() => setCredEmail('misrpr@rathibuildmart.com')}
                      className="text-emerald-400 hover:text-emerald-300 font-mono font-bold cursor-pointer"
                    >
                      💡 Use Owner ID
                    </button>
                    <span className="text-slate-500 font-sans">Password verifies automatically</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-500" />
                    Security Passkey
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={credPassword}
                      onChange={(e) => { setCredPassword(e.target.value); setCredError(''); }}
                      placeholder="••••••••"
                      id="cred-password"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl py-2 px-3 pr-10 text-xs text-slate-200 focus:ring-1 focus:ring-emerald-500 outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-305 hover:text-slate-300 transition cursor-pointer"
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
                <p className="text-xs text-slate-400 mb-3 font-semibold uppercase tracking-wider">
                  Select a pre-seeded account:
                </p>
                <div className="space-y-3">
                  {users.map((u) => {
                    const r = roles.find(role => role.id === u.roleId);
                    const isAdmin = u.roleId === 'role_sr_acc';
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
                            setCredError(`Access Denied: The account for "${u.name}" has been suspended/deactivated. Please contact Suresh Rathi (Director/CFO).`);
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
                        className={`w-full text-left flex items-center justify-between p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 transition-all duration-200 group relative text-xs ${
                          u.status === 'Deactivated' || u.status === 'Left'
                            ? 'opacity-60 border-slate-900 hover:border-red-500/20 hover:bg-slate-950/60'
                            : 'hover:border-emerald-500/50 hover:bg-slate-800/80'
                        }`}
                        id={`btn-login-${u.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80'}
                            alt={u.name}
                            className={`w-9 h-9 rounded-full object-cover border border-slate-700 ${
                              u.status === 'Deactivated' || u.status === 'Left' ? 'grayscale' : 'group-hover:border-emerald-500'
                            }`}
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <p className="font-bold text-slate-100 group-hover:text-emerald-300 transition flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`}></span>
                              {u.name}
                              <span className="text-[9px] font-medium text-slate-400 font-mono italic">{statusLabel}</span>
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              {r?.name || 'Unassigned Role'}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] uppercase font-mono tracking-wide ${
                            isDirector 
                              ? 'bg-amber-950/50 text-amber-300 border border-amber-800/40 font-bold'
                              : isAdmin 
                                ? 'bg-rose-950/40 text-rose-300 border border-rose-800/40' 
                                : 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40'
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
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-850 text-slate-400 text-[11px] text-center font-mono">
                💡 Sandbox selection bypasses credentials passwords for training managers to audit paths cleanly.
              </div>
            </div>
          )}

          {/* New Enrollment (custom user signup / register) */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="text-center pb-2">
                <h3 className="text-sm font-bold text-slate-200">New Employee Enrollment</h3>
                <p className="text-xs text-slate-400 mt-0.5">Register a custom corporate profile in {activeBranding?.companyName || 'Rathi'} {activeBranding?.companyAbbreviation || 'LMS'}</p>
              </div>

              {regError && (
                <div id="reg-error-msg" className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs font-semibold text-center animate-in fade-in duration-200">
                  ⚠️ {regError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Anand Rathi"
                  id="reg-name"
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-lg py-2 px-3 text-sm text-slate-100 focus:ring-1 focus:ring-emerald-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-emerald-400" />
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="e.g. anand@rathibuildmart.com"
                  id="reg-email"
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-lg py-2 px-3 text-sm text-slate-100 focus:ring-1 focus:ring-emerald-500 outline-none transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                    Job Role
                  </label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                    id="reg-role"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg py-2 px-2.5 text-sm text-slate-100 focus:ring-1 focus:ring-emerald-500 outline-none transition"
                  >
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-emerald-400" />
                    Department
                  </label>
                  {departments && departments.length > 0 ? (
                    <select
                      value={newUserDept}
                      onChange={(e) => setNewUserDept(e.target.value)}
                      id="reg-dept"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg py-2 px-2.5 text-sm text-slate-100 focus:ring-1 focus:ring-emerald-500 outline-none transition"
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
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg py-2 px-3 text-sm text-slate-100 focus:ring-1 focus:ring-emerald-500 outline-none transition"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Assigned Entity / Branch
                </label>
                <input
                  type="text"
                  value={newUserFocus}
                  onChange={(e) => setNewUserFocus(e.target.value)}
                  placeholder="e.g. Mumbai Logistics Matrix"
                  id="reg-focus"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg py-2 px-3 text-sm text-slate-100 focus:ring-1 focus:ring-emerald-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-emerald-400" />
                  Security Password / Passkey <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="Default password is rathi123"
                  id="reg-password"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg py-2 px-3 text-sm text-slate-100 focus:ring-1 focus:ring-emerald-500 outline-none transition font-sans"
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

        {/* Sandbox Switch / Toggle */}
        <div className="flex items-center justify-center gap-2 py-1 select-none animate-fade-in">
          <label className="inline-flex items-center gap-2 cursor-pointer bg-slate-900/40 hover:bg-slate-900/70 py-1.5 px-3.5 rounded-full border border-slate-800/50 transition duration-150">
            <input
              type="checkbox"
              checked={showSandbox}
              onChange={(e) => {
                const checked = e.target.checked;
                setShowSandbox(checked);
                if (!checked && activeTab === 'quick') {
                  setActiveTab('credentials');
                }
              }}
              className="sr-only peer"
              id="sandbox-toggle-cb"
            />
            <div className="relative w-7 h-4 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600"></div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 hover:text-slate-300 font-semibold transition select-none">
              {showSandbox ? 'Sandbox Profiles: Enabled' : 'Sandbox Profiles: Disabled'}
            </span>
          </label>
        </div>

        {/* Footer branding */}
        <div className="text-center font-mono text-[9px] text-slate-500 uppercase">
          {activeBranding?.companyTagline || 'RATHI BUILDMART PLC GENERAL LEDGER DIVISION'} SECURITY ACT © 2026
        </div>

      </div>

      {/* SECURE HIGH-FIDELITY SIMULATED GOOGLE OAUTH POPUP MODAL */}
      <AnimatePresence>
        {showGoogleModal && (
          <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
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
                <h3 className="text-base font-bold text-slate-900 font-sans">Sign in with Google</h3>
                <p className="text-xs text-slate-500 mt-1">to continue to <strong className="text-emerald-700">{activeBranding?.companyName || 'Rathi Accounts'} {activeBranding?.companyAbbreviation || 'LMS'}</strong></p>
                
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
                      setGoogleCustomName('Suresh Rathi');
                    }}
                    className={`pb-1 font-semibold ${googleTab === 'signup' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}
                  >
                    Google Sign Up
                  </button>
                </div>
              </div>

              {/* Simulated Google Tab Content */}
              <div className="p-5 max-h-[340px] overflow-y-auto">
                {googleTab === 'choose' ? (
                  <div className="space-y-2">
                    <p className="text-[11px] text-slate-400 uppercase font-mono tracking-wider font-semibold mb-2">Google Accounts on this Device</p>
                    {users.map((u) => (
                      <button
                        key={`google-${u.id}`}
                        onClick={() => handleGoogleAccountSelect(u)}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all flex items-center gap-3"
                      >
                        <img
                          src={u.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80'}
                          alt={u.name}
                          className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                          referrerPolicy="no-referrer"
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
                        placeholder="e.g. Suresh Rathi"
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
                        className="w-full text-xs p-2 border border-slate-300 rounded' focus:border-blue-500 outline-none"
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
                  onClick={() => setShowGoogleModal(false)}
                  className="text-slate-800 hover:text-black font-semibold font-sans uppercase"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
