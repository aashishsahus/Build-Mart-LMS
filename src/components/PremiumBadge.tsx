import React from 'react';
import { Crown, ShieldCheck, Sparkles, Star, Award, Zap, Gem, Trophy } from 'lucide-react';
import { getRoles } from '../data/stateManager';

interface PremiumBadgeProps {
  userId: string;
  userName: string;
  roleId: string;
  department?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export interface BadgeConfig {
  label: string;
  icon: React.ReactNode;
  styleClass: string;
}

export function getPremiumBadgeConfig(userId: string, userName: string, roleId: string, department: string = ''): BadgeConfig {
  const nameLower = userName.toLowerCase();
  const roleLower = roleId.toLowerCase();
  const deptLower = department.toLowerCase();

  // Dynamically query database roles for the actual label
  let jobRoleLabel = '';
  try {
    const dbRoles = getRoles();
    const foundRole = dbRoles.find(r => r.id === roleId);
    if (foundRole) {
      if (roleId === 'role_sr_acc') {
        if (foundRole.name === 'Senior Accountant' || foundRole.name === 'Admin Accountant') {
          jobRoleLabel = 'Admin';
        } else {
          jobRoleLabel = foundRole.name;
        }
      } else {
        jobRoleLabel = foundRole.name;
      }
    }
  } catch (e) {
    // Fail-safe
  }

  // Fallbacks if role is not fully mapped in the active database list
  if (!jobRoleLabel) {
    if (roleLower === 'role_md' || roleLower === 'role_ceo' || roleLower === 'role_coo') {
      jobRoleLabel = 'Director';
    } else if (roleLower === 'role_sr_acc') {
      jobRoleLabel = 'Admin';
    } else if (roleLower === 'role_jr_acc') {
      jobRoleLabel = 'Junior Accountant';
    } else if (roleLower === 'role_ap_ar') {
      jobRoleLabel = 'Billing & AP/AR';
    } else if (roleLower === 'role_tax_assoc') {
      jobRoleLabel = 'Tax Analyst';
    } else {
      jobRoleLabel = 'Finance Trainee';
    }
  }

  // 1. Board of Directors / CFO / High Executives (Aashish Sahu / Director / CFO / MD)
  if (
    nameLower.includes('aashish') || 
    roleLower === 'role_md' || 
    roleLower === 'role_ceo' || 
    roleLower === 'role_coo' || 
    deptLower.includes('director') || 
    deptLower.includes('executive')
  ) {
    return {
      label: jobRoleLabel,
      icon: <Crown className="w-3.5 h-3.5 animate-bounce" />,
      styleClass: 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-white border-amber-300/40 shadow-amber-500/25'
    };
  }

  // 2. Madhav Mantri (Admin Accountant / Master Auditor)
  if (nameLower.includes('mantri')) {
    return {
      label: jobRoleLabel,
      icon: <Trophy className="w-3.5 h-3.5" />,
      styleClass: 'bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 text-white border-fuchsia-300/40 shadow-fuchsia-500/25'
    };
  }

  // 3. Madhav Taparia (Senior Accountant / Elite Admin)
  if (nameLower.includes('taparia')) {
    return {
      label: jobRoleLabel,
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
      styleClass: 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white border-purple-300/40 shadow-purple-500/25'
    };
  }

  // 4. Dhaneshwari Sahu (Finance Trainee -> Treasury Scholar)
  if (nameLower.includes('dhaneshwari')) {
    return {
      label: jobRoleLabel,
      icon: <Gem className="w-3.5 h-3.5" />,
      styleClass: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white border-emerald-300/40 shadow-emerald-500/25'
    };
  }

  // 5. Lekhram Chakradhari (Finance Trainee -> Strategic Ledger)
  if (nameLower.includes('lekhram')) {
    return {
      label: jobRoleLabel,
      icon: <Zap className="w-3.5 h-3.5" />,
      styleClass: 'bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 text-white border-blue-300/40 shadow-blue-500/25'
    };
  }

  // 6. Saraswati Jangde (Finance Trainee -> Audit Fellow)
  if (nameLower.includes('saraswati')) {
    return {
      label: jobRoleLabel,
      icon: <Award className="w-3.5 h-3.5" />,
      styleClass: 'bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 text-white border-teal-300/40 shadow-teal-500/25'
    };
  }

  // 7. Hemant Sahu (Finance Trainee -> Performance Pioneer)
  if (nameLower.includes('hemant')) {
    return {
      label: jobRoleLabel,
      icon: <Sparkles className="w-3.5 h-3.5" />,
      styleClass: 'bg-gradient-to-r from-rose-500 via-pink-500 to-red-600 text-white border-rose-300/40 shadow-rose-500/25'
    };
  }

  // 8. Ghanshyam D (Finance Trainee -> Wealth Scholar)
  if (nameLower.includes('ghanshyam')) {
    return {
      label: jobRoleLabel,
      icon: <Star className="w-3.5 h-3.5" />,
      styleClass: 'bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 text-white border-purple-300/40 shadow-purple-500/25'
    };
  }

  // 9. Standard Admin role_sr_acc
  if (roleLower === 'role_sr_acc') {
    return {
      label: jobRoleLabel,
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
      styleClass: 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white border-purple-300/40 shadow-purple-500/25'
    };
  }

  // 10. General Defaults
  return {
    label: jobRoleLabel,
    icon: <Zap className="w-3.5 h-3.5" />,
    styleClass: 'bg-gradient-to-r from-slate-700 via-slate-650 to-slate-800 text-white border-slate-600 shadow-slate-700/25'
  };
}

export function PremiumBadge({ userId, userName, roleId, department = '', size = 'sm', className = '' }: PremiumBadgeProps) {
  const badge = getPremiumBadgeConfig(userId, userName, roleId, department);

  const sizeClasses = {
    xs: 'text-[8px] px-1 py-0.2 gap-1 rounded font-black tracking-widest uppercase leading-none',
    sm: 'text-[9px] px-1.5 py-0.5 gap-1 rounded-md font-black tracking-widest uppercase leading-none',
    md: 'text-[10px] px-2 py-0.75 gap-1.5 rounded-lg font-black tracking-widest uppercase leading-none',
    lg: 'text-xs px-2.5 py-1 gap-2 rounded-xl font-black tracking-widest uppercase leading-none'
  };

  const iconSizes = {
    xs: 'scale-75 w-2.5 h-2.5 flex-shrink-0',
    sm: 'w-3 h-3 flex-shrink-0',
    md: 'w-3.5 h-3.5 flex-shrink-0',
    lg: 'w-4 h-4 flex-shrink-0'
  };

  return (
    <span className={`inline-flex items-center select-none font-mono border shadow-xs transition-all duration-300 hover:scale-[1.03] ${sizeClasses[size]} ${badge.styleClass} ${className}`}>
      {React.cloneElement(badge.icon as React.ReactElement, { className: `${iconSizes[size]} ${(badge.icon as React.ReactElement).props.className || ''}` })}
      <span className="font-extrabold whitespace-nowrap">{badge.label}</span>
    </span>
  );
}
