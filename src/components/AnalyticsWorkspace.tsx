import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  ScatterChart, 
  Scatter, 
  ZAxis,
  ReferenceLine
} from 'recharts';
import { 
  TrendingUp, 
  Award, 
  Zap, 
  Target, 
  Users, 
  Building, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  Search, 
  Mail, 
  ChevronRight, 
  RefreshCw, 
  AlertCircle, 
  ThumbsUp, 
  Sparkles, 
  Activity, 
  Sliders,
  CheckSquare,
  HelpCircle,
  FileText
} from 'lucide-react';
import { User, Role, Chapter, Unit, ProgressLog } from '../types';
import { calculateUserProgress } from '../data/stateManager';

interface AnalyticsWorkspaceProps {
  users: User[];
  roles: Role[];
  departments: string[];
  progress: ProgressLog[];
  chapters: Chapter[];
  attemptsList: any[];
  showToast: (text: string, type: 'success' | 'error' | 'info') => void;
}

export default function AnalyticsWorkspace({
  users,
  roles,
  departments,
  progress,
  chapters,
  attemptsList,
  showToast
}: AnalyticsWorkspaceProps) {
  const parsedDepartments = useMemo(() => {
    return departments.map((deptName, idx) => ({
      id: `dept_${idx}`,
      name: deptName,
      code: deptName.toUpperCase().substring(0, 4)
    }));
  }, [departments]);

  // Sub-tabs: overview, leaderboard, matrix
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'leaderboard' | 'matrix'>('overview');
  
  // Interactive Filters
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [matrixQuadrant, setMatrixQuadrant] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Triggering visual refresh simulation
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast("✓ Analytics Engine synched successfully with the main ledger!", "success");
    }, 600);
  };

  // Pre-calculate user progress metrics once
  const userStats = useMemo(() => {
    return users.map(user => {
      const stats = calculateUserProgress(user.id, user.roleId);
      const userAttempts = attemptsList.filter((att: any) => att.userEmail.toLowerCase() === user.email.toLowerCase());
      const avgExamScore = userAttempts.length > 0
        ? Math.round(userAttempts.reduce((sum: number, att: any) => sum + att.score, 0) / userAttempts.length)
        : null;

      return {
        ...user,
        stats,
        avgExamScore,
        attemptsCount: userAttempts.length,
        passedExam: userAttempts.some((att: any) => att.passed)
      };
    });
  }, [users, attemptsList]);

  // Global aggregate metrics
  const aggregateMetrics = useMemo(() => {
    const totalStaff = userStats.length;
    if (totalStaff === 0) return { avgProgress: 0, avgMastery: 0, certifiedCount: 0, certifiedRate: 0 };

    const sumProgress = userStats.reduce((sum, u) => sum + u.stats.overallPercent, 0);
    const sumMastery = userStats.reduce((sum, u) => sum + u.stats.masteryPercent, 0);
    const certified = userStats.filter(u => u.stats.masteryPercent === 100).length;

    return {
      avgProgress: Math.round(sumProgress / totalStaff),
      avgMastery: Math.round(sumMastery / totalStaff),
      certifiedCount: certified,
      certifiedRate: Math.round((certified / totalStaff) * 100)
    };
  }, [userStats]);

  // 1. Department Leaderboard Calculations
  const departmentStats = useMemo(() => {
    return parsedDepartments.map(dept => {
      const deptUsers = userStats.filter(u => u.department.toLowerCase() === dept.name.toLowerCase());
      const totalStaff = deptUsers.length;

      if (totalStaff === 0) {
        return {
          ...dept,
          totalStaff: 0,
          avgProgress: 0,
          avgMastery: 0,
          certifiedCount: 0,
          certifiedRate: 0,
          complianceIndex: 0,
          totalSopCompleted: 0
        };
      }

      const sumProgress = deptUsers.reduce((sum, u) => sum + u.stats.overallPercent, 0);
      const sumMastery = deptUsers.reduce((sum, u) => sum + u.stats.masteryPercent, 0);
      const certified = deptUsers.filter(u => u.stats.masteryPercent === 100).length;
      
      const avgProgress = Math.round(sumProgress / totalStaff);
      const avgMastery = Math.round(sumMastery / totalStaff);
      const certifiedRate = Math.round((certified / totalStaff) * 100);

      // Average compliance score index formula (weighted: 50% Mastery, 30% Progress Rate, 20% Certified Rate)
      const complianceIndex = Math.round((avgMastery * 0.5) + (avgProgress * 0.3) + (certifiedRate * 0.2));

      // Count total Verified & Mastered lessons for dept
      const totalSopCompleted = deptUsers.reduce((sum, u) => sum + u.stats.verifiedCount, 0);

      return {
        ...dept,
        totalStaff,
        avgProgress,
        avgMastery,
        certifiedCount: certified,
        certifiedRate,
        complianceIndex,
        totalSopCompleted
      };
    }).sort((a, b) => b.complianceIndex - a.complianceIndex);
  }, [parsedDepartments, userStats]);

  // 2. Trainee Performance Matrix Quadrants
  // Axes: X = Lesson Mastery % (stats.masteryPercent), Y = Avg Exam Score %
  // Quadrants definition:
  // - "Expert" (Mastery >= 70, Score >= 70) -> High Mastery, High Knowledge
  // - "Knowledgeable" (Mastery < 70, Score >= 70) -> High Knowledge, Low Practical Application
  // - "Hands-on" (Mastery >= 70, Score < 70) -> High Practical Application, Low Exam Mastery
  // - "Needs Focus" (Mastery < 70, Score < 70) -> Low Practical, Low Knowledge
  const matrixUsers = useMemo(() => {
    return userStats.map(u => {
      const score = u.avgExamScore !== null ? u.avgExamScore : 0; // Default to 0 for plotting if no exams
      const mastery = u.stats.masteryPercent;

      let quadrant = 'needs_focus';
      let quadrantLabel = 'Needs Training & Review';
      let color = '#ef4444'; // red

      if (mastery >= 70 && score >= 75) {
        quadrant = 'expert';
        quadrantLabel = 'Expert Performer';
        color = '#10b981'; // emerald
      } else if (mastery < 70 && score >= 75) {
        quadrant = 'knowledgeable';
        quadrantLabel = 'Theory Rich (Apply SOP)';
        color = '#3b82f6'; // indigo/blue
      } else if (mastery >= 70 && score < 75) {
        quadrant = 'hands_on';
        quadrantLabel = 'Practical Rich (Take Exam)';
        color = '#f59e0b'; // amber
      }

      return {
        ...u,
        x: mastery,
        y: score,
        quadrant,
        quadrantLabel,
        quadrantColor: color
      };
    });
  }, [userStats]);

  // Filtered matrix users for the list
  const filteredMatrixUsers = useMemo(() => {
    return matrixUsers.filter(u => {
      const matchesSearch = searchQuery.trim() === '' || 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDept = selectedDeptFilter === 'all' || 
        u.department.toLowerCase() === selectedDeptFilter.toLowerCase();
        
      const matchesQuadrant = matrixQuadrant === 'all' || u.quadrant === matrixQuadrant;

      return matchesSearch && matchesDept && matchesQuadrant;
    });
  }, [matrixUsers, searchQuery, selectedDeptFilter, matrixQuadrant]);

  // Scatter chart data (exclude people with no exams unless we want to show them at score 0)
  const scatterPlotData = useMemo(() => {
    return matrixUsers
      .filter(u => u.avgExamScore !== null) // Only plot people who actually took exams
      .map(u => ({
        name: u.name,
        x: u.x, // mastery percentage
        y: u.y, // avg score
        dept: u.department,
        quadrant: u.quadrantLabel,
        role: roles.find(r => r.id === u.roleId)?.name || 'Trainee',
        z: 10 // Bubble size placeholder
      }));
  }, [matrixUsers, roles]);

  // 3. Recharts Visual Data: Mastery distribution by Role
  const roleChartData = useMemo(() => {
    return roles.map(role => {
      const roleUsers = userStats.filter(u => u.roleId === role.id);
      if (roleUsers.length === 0) return null;
      const avgMastery = Math.round(roleUsers.reduce((sum, u) => sum + u.stats.masteryPercent, 0) / roleUsers.length);
      return {
        roleName: role.name.replace("Accountant", "Acc.").replace("Assistant", "Asst."),
        avgMastery
      };
    }).filter(Boolean);
  }, [roles, userStats]);

  // Interactive mail action simulation
  const sendReminderMail = (email: string, name: string, type: 'exam' | 'sop' | 'compliance') => {
    let subject = "";
    let body = "";

    if (type === 'exam') {
      subject = "⚠️ Action Required: Pending SOP Competency Exam Checklist";
      body = `Dear ${name},\n\nOur system registers high practical mastery on your SOP tasks but your core exam is still pending or needs review. Please log in to your dashboard to complete the Exam.`;
    } else if (type === 'sop') {
      subject = "📚 Notice: Complete Assigned SOP Practical Lessons";
      body = `Dear ${name},\n\nThis is a notification to prioritize completion of your assigned SOP tasks. Please review video materials and submit checkpoints for audit approval.`;
    } else {
      subject = "⭐ Congratulations: SOP Compliance Certified!";
      body = `Dear ${name},\n\nExcellent work! You have achieved 100% mastery and been successfully certified. Your certificate is active and registered on the blockchain audit ledger.`;
    }

    showToast(`Reminding ${name} via Outbound SMTP System... ✉️`, "info");
    setTimeout(() => {
      showToast(`✓ Email successfully sent to ${email} (Subject: ${subject})`, "success");
    }, 1200);
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* SECTION 1: HEADER & CENTRAL STATS PANEL */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-6 rounded-2xl border border-slate-800 text-white shadow-xl relative overflow-hidden">
        {/* Subtle decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-emerald-600/5 rounded-full filter blur-2xl pointer-events-none" />

        <div className="space-y-1.5 relative z-10">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-500/15 text-indigo-400 rounded-lg border border-indigo-500/20 shrink-0">
              <Activity className="w-5 h-5" />
            </span>
            <h2 className="text-lg md:text-xl font-black tracking-tight flex items-center gap-1.5 font-sans">
              Operational Analytics Cockpit
              <span className="bg-emerald-500/20 text-emerald-300 text-[9px] font-mono font-black px-1.5 py-0.5 rounded border border-emerald-500/30 uppercase tracking-widest animate-pulse">
                Online
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Audit live organizational training progress, compliance indexes, and identify employee knowledge gaps with multi-dimensional performance scatter plots.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            id="analytics-refresh-btn"
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition flex items-center gap-2 text-xs font-bold cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            <span>{isRefreshing ? "Synching..." : "Sync Engine"}</span>
          </button>
        </div>
      </div>

      {/* STAT CARDS - GRID ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total staff */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-3xs flex items-center justify-between"
          id="stat-card-staff"
        >
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Staff Coverage</span>
            <h3 className="text-2xl font-black font-mono text-slate-900 leading-none">{userStats.length}</h3>
            <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Across {departments.length} Business Units
            </span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100/50">
            <Users className="w-5 h-5" />
          </div>
        </motion.div>

        {/* SOP Mastery */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-3xs flex items-center justify-between"
          id="stat-card-sop"
        >
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">SOP Practical Mastery</span>
            <h3 className="text-2xl font-black font-mono text-emerald-600 leading-none">{aggregateMetrics.avgMastery}%</h3>
            <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              Verified & Verified/Mastered Chapters
            </span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100/50">
            <Target className="w-5 h-5" />
          </div>
        </motion.div>

        {/* Global Progress */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-3xs flex items-center justify-between"
          id="stat-card-progress"
        >
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Overall Training Index</span>
            <h3 className="text-2xl font-black font-mono text-indigo-600 leading-none">{aggregateMetrics.avgProgress}%</h3>
            <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
              <Clock className="w-3 h-3 text-indigo-500" />
              Includes Pending Verification
            </span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100/50">
            <Sliders className="w-5 h-5" />
          </div>
        </motion.div>

        {/* Certification count */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-3xs flex items-center justify-between"
          id="stat-card-certified"
        >
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Certified Workforce</span>
            <h3 className="text-2xl font-black font-mono text-purple-600 leading-none">{aggregateMetrics.certifiedCount}</h3>
            <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
              <Award className="w-3 h-3 text-purple-500" />
              {aggregateMetrics.certifiedRate}% Complete Compliance
            </span>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl border border-purple-100/50">
            <Award className="w-5 h-5" />
          </div>
        </motion.div>
      </div>

      {/* TABS CONTROLLERS */}
      <div className="flex border-b border-slate-200/80 gap-1 select-none">
        <button
          id="analytics-tab-overview"
          onClick={() => setActiveSubTab('overview')}
          className={`px-4 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'overview'
              ? 'border-indigo-600 text-indigo-650'
              : 'border-transparent text-slate-450 text-slate-400 hover:text-slate-700'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Interactive Charts & Distribution</span>
        </button>
        <button
          id="analytics-tab-leaderboard"
          onClick={() => setActiveSubTab('leaderboard')}
          className={`px-4 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'leaderboard'
              ? 'border-indigo-600 text-indigo-650'
              : 'border-transparent text-slate-450 text-slate-400 hover:text-slate-700'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Department Leaderboard</span>
        </button>
        <button
          id="analytics-tab-matrix"
          onClick={() => setActiveSubTab('matrix')}
          className={`px-4 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'matrix'
              ? 'border-indigo-600 text-indigo-650'
              : 'border-transparent text-slate-450 text-slate-400 hover:text-slate-700'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Trainee Performance Matrix</span>
        </button>
      </div>

      {/* SECTION 2: SUB-TAB CONTENTS */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25 }}
        >
          {/* TAB 1: OVERVIEW METRICS & RECHARTS */}
          {activeSubTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Charts grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* CHART 1: Department Progress vs Mastery */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-3xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5 font-sans">
                        <Building className="w-4 h-4 text-indigo-500" />
                        SOP Compliance Index by Business Unit
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium">Weighted index measuring overall departmental syllabus completed</p>
                    </div>
                  </div>
                  
                  <div className="h-64 w-full">
                    {departmentStats.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-xs text-slate-400 font-mono">
                        No Department logs found to display
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={departmentStats}
                          margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="name" 
                            tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'bold' }} 
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis 
                            domain={[0, 100]} 
                            tick={{ fontSize: 9, fill: '#64748b' }} 
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip 
                            contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #cbd5e1', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} 
                            labelClassName="font-extrabold text-slate-900"
                          />
                          <Legend wrapperStyle={{ fontSize: 10 }} />
                          <Bar 
                            name="Compliance Index %" 
                            dataKey="complianceIndex" 
                            fill="#4f46e5" 
                            radius={[6, 6, 0, 0]} 
                            barSize={32}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* CHART 2: Average Mastery Rate per Role */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-3xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5 font-sans">
                        <Award className="w-4 h-4 text-emerald-500" />
                        SOP Mastery by Standard Designation
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium">Average verified mastery % among all staffers registered in each role</p>
                    </div>
                  </div>

                  <div className="h-64 w-full">
                    {roleChartData.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-xs text-slate-400 font-mono">
                        No Role mastery distributions computed
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={roleChartData}
                          layout="vertical"
                          margin={{ top: 10, right: 15, left: 15, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                          <XAxis 
                            type="number" 
                            domain={[0, 100]} 
                            tick={{ fontSize: 9, fill: '#64748b' }} 
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis 
                            dataKey="roleName" 
                            type="category" 
                            tick={{ fontSize: 9, fill: '#475569', fontWeight: 'bold' }} 
                            width={110}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip 
                            contentStyle={{ fontSize: 11, borderRadius: 8 }} 
                            labelClassName="font-extrabold text-slate-900"
                          />
                          <Bar 
                            name="Avg Mastery Rate (%)" 
                            dataKey="avgMastery" 
                            fill="#10b981" 
                            radius={[0, 6, 6, 0]} 
                            barSize={18}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* CHART 3: Exam Passing Trend vs Volume */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-3xs space-y-4 lg:col-span-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5 font-sans">
                        <CheckSquare className="w-4 h-4 text-indigo-500" />
                        Executive Assessment & Passing Trend Log
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium">Trend plot of chronologically logged competency test scores</p>
                    </div>
                  </div>

                  <div className="h-72 w-full">
                    {attemptsList.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-xs text-slate-400 font-mono py-8 bg-slate-50 rounded-xl border border-slate-100">
                        <AlertCircle className="w-8 h-8 text-slate-300 mb-1.5" />
                        No exam logs captured yet in lms_exam_attempts_v1.
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={attemptsList.slice(-15).map((att, index) => ({
                            index: index + 1,
                            name: att.userName.split(' ')[0],
                            score: att.score,
                            date: new Date(att.date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
                            passMark: 60
                          }))}
                          margin={{ top: 10, right: 15, left: -20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="date" 
                            tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'bold' }} 
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis 
                            domain={[0, 100]} 
                            tick={{ fontSize: 9, fill: '#64748b' }} 
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip 
                            contentStyle={{ fontSize: 11, borderRadius: 8 }} 
                            labelClassName="font-extrabold text-slate-900"
                          />
                          <Legend wrapperStyle={{ fontSize: 10 }} />
                          <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Pass (60%)', position: 'top', fill: '#d97706', fontSize: 9, fontWeight: 'bold' }} />
                          <Line 
                            name="Trainee Score %" 
                            type="monotone" 
                            dataKey="score" 
                            stroke="#4f46e5" 
                            strokeWidth={3} 
                            activeDot={{ r: 6 }} 
                            dot={{ stroke: '#4f46e5', strokeWidth: 2, r: 4, fill: '#ffffff' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: DEPARTMENT LEADERBOARD */}
          {activeSubTab === 'leaderboard' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-100 pb-3">
                <div className="space-y-0.5">
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-1.5 font-sans">
                    <Award className="w-4.5 h-4.5 text-indigo-500" />
                    Corporate SOP Division Leaderboard
                  </h3>
                  <p className="text-[10px] text-slate-450 text-slate-400 font-medium">
                    Leaderboard rankings based on unified Compliance Index metrics across active business units.
                  </p>
                </div>

                <div className="bg-indigo-50/50 text-indigo-800 text-[9.5px] font-mono px-3 py-1.5 rounded-lg border border-indigo-100/50 flex items-center gap-1.5 font-semibold shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-bounce" />
                  <span>Formula: 50% Mastery + 30% Progress + 20% Certified Rate</span>
                </div>
              </div>

              {/* Table ledger for rankings */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50 border-y border-slate-200 text-slate-400 font-mono text-[9px] uppercase tracking-wider font-black">
                      <th className="py-3 px-4 text-center w-12">Rank</th>
                      <th className="py-3 px-4">Business Unit Department</th>
                      <th className="py-3 px-4 text-center">Trainees Enrolled</th>
                      <th className="py-3 px-4">Core Progress Index</th>
                      <th className="py-3 px-4">SOP Verified Mastery</th>
                      <th className="py-3 px-4 text-center">Certified Compliant</th>
                      <th className="py-3 px-4 text-right pr-6">Compliance Index</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {departmentStats.map((dept, index) => {
                      const rank = index + 1;
                      let rankBadge = null;
                      let rowBg = "hover:bg-slate-50/25 transition";
                      
                      if (rank === 1) {
                        rankBadge = <span className="inline-flex w-7 h-7 bg-amber-100 text-amber-700 rounded-full items-center justify-center font-black border border-amber-200 shadow-3xs">🏆</span>;
                        rowBg = "bg-amber-50/10 hover:bg-amber-50/20 transition";
                      } else if (rank === 2) {
                        rankBadge = <span className="inline-flex w-7 h-7 bg-slate-100 text-slate-650 rounded-full items-center justify-center font-black border border-slate-200 shadow-3xs">🥈</span>;
                        rowBg = "bg-slate-100/5 hover:bg-slate-100/10 transition";
                      } else if (rank === 3) {
                        rankBadge = <span className="inline-flex w-7 h-7 bg-orange-100 text-orange-700 rounded-full items-center justify-center font-black border border-orange-200 shadow-3xs">🥉</span>;
                        rowBg = "bg-orange-50/5 hover:bg-orange-50/10 transition";
                      } else {
                        rankBadge = <span className="inline-flex w-7 h-7 bg-slate-50 text-slate-500 rounded-full items-center justify-center font-bold border border-slate-100 font-mono text-xs">{rank}</span>;
                      }

                      return (
                        <tr key={dept.id} className={rowBg}>
                          <td className="py-3 px-4 text-center font-bold">
                            {rankBadge}
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-left">
                              <h4 className="font-extrabold text-slate-900 font-sans text-[12px]">{dept.name}</h4>
                              <p className="text-[10px] text-slate-400 font-medium">Code: <span className="font-mono font-semibold text-slate-500 uppercase">{dept.code || dept.id}</span></p>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-slate-700">
                            {dept.totalStaff} staff
                          </td>
                          <td className="py-3 px-4">
                            <div className="space-y-1 w-28 text-left">
                              <div className="flex justify-between items-center text-[10px]">
                                <span className="text-slate-400">Progression</span>
                                <span className="font-black text-slate-700 font-mono">{dept.avgProgress}%</span>
                              </div>
                              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${dept.avgProgress}%` }}></div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="space-y-1 w-28 text-left">
                              <div className="flex justify-between items-center text-[10px]">
                                <span className="text-slate-400">Mastery</span>
                                <span className="font-black text-emerald-600 font-mono">{dept.avgMastery}%</span>
                              </div>
                              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${dept.avgMastery}%` }}></div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="inline-flex items-center gap-1.5">
                              <span className="font-mono font-black text-slate-800 text-xs">
                                {dept.certifiedCount}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                ({dept.certifiedRate}%)
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right pr-6">
                            <span className="inline-flex items-center justify-center font-mono font-black text-sm text-indigo-750 bg-indigo-50/65 px-2.5 py-1 rounded-lg border border-indigo-100/60 shadow-3xs min-w-14 text-center">
                              {dept.complianceIndex}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: TRAINEE PERFORMANCE MATRIX */}
          {activeSubTab === 'matrix' && (
            <div className="space-y-6">
              
              {/* Performance Scatter Matrix Section */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-100 pb-3">
                  <div className="space-y-0.5">
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-1.5 font-sans">
                      <Target className="w-4.5 h-4.5 text-rose-500 animate-pulse" />
                      Two-Dimensional Competency Performance Scatter Matrix
                    </h3>
                    <p className="text-[10px] text-slate-450 text-slate-400 font-medium">
                      Plotted analysis of Staffers based on SOP mastery (X-axis) vs. Average Exam Score (Y-axis).
                    </p>
                  </div>
                </div>

                {/* Matrix Scatter Plot */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  
                  {/* Left Column: Recharts Scatter plot */}
                  <div className="lg:col-span-8 bg-slate-50/50 p-4 rounded-xl border border-slate-100 h-80">
                    {scatterPlotData.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-xs text-slate-400 font-mono">
                        <AlertCircle className="w-8 h-8 text-slate-300 mb-1.5" />
                        No exam records captured yet to generate matrix coordinates.
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart
                          margin={{ top: 15, right: 25, bottom: 10, left: -20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis 
                            type="number" 
                            dataKey="x" 
                            name="SOP Mastery" 
                            unit="%" 
                            domain={[0, 100]}
                            label={{ value: 'Practical SOP Mastery (%)', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#64748b', fontWeight: 'bold' }}
                            tick={{ fontSize: 9, fill: '#64748b' }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis 
                            type="number" 
                            dataKey="y" 
                            name="Avg Exam Score" 
                            unit="%" 
                            domain={[0, 100]}
                            label={{ value: 'Average Exam Score (%)', angle: -90, position: 'insideLeft', offset: 10, fontSize: 10, fill: '#64748b', fontWeight: 'bold' }}
                            tick={{ fontSize: 9, fill: '#64748b' }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <ZAxis type="number" dataKey="z" range={[80, 80]} />
                          <Tooltip 
                            cursor={{ strokeDasharray: '3 3' }} 
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-white p-3.5 border border-slate-200 rounded-xl shadow-xl space-y-1.5 text-xs text-left max-w-xs">
                                    <h5 className="font-extrabold text-slate-900 border-b border-slate-100 pb-1 flex items-center justify-between gap-2">
                                      <span>{data.name}</span>
                                      <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded font-mono text-[9px] uppercase font-bold">{data.dept}</span>
                                    </h5>
                                    <p className="text-slate-500 font-medium">Role: <span className="font-bold text-slate-700">{data.role}</span></p>
                                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1">
                                      <div>
                                        <span className="text-slate-400 block uppercase">SOP Mastery:</span>
                                        <span className="font-black text-emerald-600">{data.x}%</span>
                                      </div>
                                      <div>
                                        <span className="text-slate-400 block uppercase">Exam Score:</span>
                                        <span className="font-black text-indigo-600">{data.y}%</span>
                                      </div>
                                    </div>
                                    <p className="text-[10px] font-semibold text-slate-500 pt-1 border-t border-slate-50">
                                      Classification: <span className="font-bold text-indigo-650">{data.quadrant}</span>
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          {/* Crosshairs to define Quadrants at X=70, Y=75 */}
                          <ReferenceLine x={70} stroke="#cbd5e1" strokeWidth={1.5} strokeDasharray="3 3" />
                          <ReferenceLine y={75} stroke="#cbd5e1" strokeWidth={1.5} strokeDasharray="3 3" />
                          <Scatter name="Staff Performance Matrix" data={scatterPlotData} fill="#4f46e5">
                            {scatterPlotData.map((entry, index) => {
                              let cellColor = '#3b82f6'; // theory
                              if (entry.x >= 70 && entry.y >= 75) cellColor = '#10b981'; // expert
                              if (entry.x >= 70 && entry.y < 75) cellColor = '#f59e0b'; // hands on
                              if (entry.x < 70 && entry.y < 75) cellColor = '#ef4444'; // focus
                              return <Cell key={`cell-${index}`} fill={cellColor} />;
                            })}
                          </Scatter>
                        </ScatterChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  {/* Right Column: Visual Guide / Legend */}
                  <div className="lg:col-span-4 space-y-3 font-sans text-xs">
                    <span className="text-[9.5px] font-black tracking-widest text-slate-400 uppercase font-mono block">Quadrant Classifications</span>
                    
                    {/* Quadrant 1 */}
                    <button 
                      onClick={() => setMatrixQuadrant(matrixQuadrant === 'expert' ? 'all' : 'expert')}
                      className={`w-full text-left p-2.5 rounded-xl border transition flex items-center gap-3 cursor-pointer ${
                        matrixQuadrant === 'expert' ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-200' : 'bg-white hover:bg-slate-50 border-slate-200/80'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h5 className="font-extrabold text-slate-900 text-[11px] flex items-center justify-between">
                          <span>Expert Performers</span>
                          <span className="text-[10px] font-mono text-slate-400 font-bold">
                            {matrixUsers.filter(u => u.quadrant === 'expert').length}
                          </span>
                        </h5>
                        <p className="text-[10px] text-slate-450 text-slate-400">SOP Mastery ≥ 70% & Exam Score ≥ 75%</p>
                      </div>
                    </button>

                    {/* Quadrant 2 */}
                    <button 
                      onClick={() => setMatrixQuadrant(matrixQuadrant === 'knowledgeable' ? 'all' : 'knowledgeable')}
                      className={`w-full text-left p-2.5 rounded-xl border transition flex items-center gap-3 cursor-pointer ${
                        matrixQuadrant === 'knowledgeable' ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200' : 'bg-white hover:bg-slate-50 border-slate-200/80'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h5 className="font-extrabold text-slate-900 text-[11px] flex items-center justify-between">
                          <span>Theory Rich (Apply SOP)</span>
                          <span className="text-[10px] font-mono text-slate-400 font-bold">
                            {matrixUsers.filter(u => u.quadrant === 'knowledgeable').length}
                          </span>
                        </h5>
                        <p className="text-[10px] text-slate-450 text-slate-400">Exam Score ≥ 75%, but Practical SOP &lt; 70%</p>
                      </div>
                    </button>

                    {/* Quadrant 3 */}
                    <button 
                      onClick={() => setMatrixQuadrant(matrixQuadrant === 'hands_on' ? 'all' : 'hands_on')}
                      className={`w-full text-left p-2.5 rounded-xl border transition flex items-center gap-3 cursor-pointer ${
                        matrixQuadrant === 'hands_on' ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-200' : 'bg-white hover:bg-slate-50 border-slate-200/80'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h5 className="font-extrabold text-slate-900 text-[11px] flex items-center justify-between">
                          <span>Practical Rich (Take Exam)</span>
                          <span className="text-[10px] font-mono text-slate-400 font-bold">
                            {matrixUsers.filter(u => u.quadrant === 'hands_on').length}
                          </span>
                        </h5>
                        <p className="text-[10px] text-slate-450 text-slate-400">SOP Mastery ≥ 70%, but Exam Score &lt; 75%</p>
                      </div>
                    </button>

                    {/* Quadrant 4 */}
                    <button 
                      onClick={() => setMatrixQuadrant(matrixQuadrant === 'needs_focus' ? 'all' : 'needs_focus')}
                      className={`w-full text-left p-2.5 rounded-xl border transition flex items-center gap-3 cursor-pointer ${
                        matrixQuadrant === 'needs_focus' ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-200' : 'bg-white hover:bg-slate-50 border-slate-200/80'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h5 className="font-extrabold text-slate-900 text-[11px] flex items-center justify-between">
                          <span>Needs Training & Review</span>
                          <span className="text-[10px] font-mono text-slate-400 font-bold">
                            {matrixUsers.filter(u => u.quadrant === 'needs_focus').length}
                          </span>
                        </h5>
                        <p className="text-[10px] text-slate-450 text-slate-400">SOP Mastery &lt; 70% & Exam Score &lt; 75%</p>
                      </div>
                    </button>
                  </div>

                </div>
              </div>

              {/* Trainee performance Matrix Interactive List Grid */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                
                {/* Interactive Filtering Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5 font-sans">
                      <Sliders className="w-4 h-4 text-slate-500" />
                      Interactive Action Ledger
                    </h4>
                    <p className="text-[10px] text-slate-400 font-medium">Search and deploy Outbound email reminders to specific cohorts based on matrix quadrant filters.</p>
                  </div>

                  {/* Filters inputs */}
                  <div className="flex flex-wrap items-center gap-2 text-[11px] w-full md:w-auto">
                    
                    {/* Search query */}
                    <div className="relative flex-1 sm:flex-initial">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text"
                        placeholder="Search trainee name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 pr-3 py-1.5 bg-slate-50 hover:bg-slate-100 focus:bg-white text-slate-850 font-medium rounded-lg border border-slate-200 text-xs w-full sm:w-48 transition outline-none focus:border-indigo-500"
                      />
                    </div>

                    {/* Department filter */}
                    <select
                      value={selectedDeptFilter}
                      onChange={(e) => setSelectedDeptFilter(e.target.value)}
                      className="p-1.5 bg-slate-50 hover:bg-slate-100 font-bold text-slate-700 border border-slate-200 rounded-lg outline-none text-[11px]"
                    >
                      <option value="all">All Departments</option>
                      {parsedDepartments.map(d => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>

                    {/* Quadrant filter */}
                    <select
                      value={matrixQuadrant}
                      onChange={(e) => setMatrixQuadrant(e.target.value)}
                      className="p-1.5 bg-slate-50 hover:bg-slate-100 font-bold text-slate-700 border border-slate-200 rounded-lg outline-none text-[11px]"
                    >
                      <option value="all">All Quadrants</option>
                      <option value="expert">Expert Performers</option>
                      <option value="knowledgeable">Theory Rich</option>
                      <option value="hands_on">Practical Rich</option>
                      <option value="needs_focus">Needs Focus</option>
                    </select>

                  </div>
                </div>

                {/* Trainee Ledger List */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-slate-50 border-y border-slate-200 text-slate-400 font-mono text-[9px] uppercase tracking-wider font-black">
                        <th className="py-2.5 px-3">Trainee Name</th>
                        <th className="py-2.5 px-3">Department</th>
                        <th className="py-2.5 px-3">Designation Role</th>
                        <th className="py-2.5 px-3 text-center">SOP Mastery</th>
                        <th className="py-2.5 px-3 text-center">Avg Exam Score</th>
                        <th className="py-2.5 px-3 text-center">Quadrant Rating</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredMatrixUsers.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                            No trainees matched your exact filtering criteria
                          </td>
                        </tr>
                      ) : (
                        filteredMatrixUsers.map(u => {
                          return (
                            <tr key={u.id} className="hover:bg-slate-50/25 transition">
                              <td className="py-2.5 px-3">
                                <div className="text-left">
                                  <h5 className="font-extrabold text-slate-900">{u.name}</h5>
                                  <p className="text-[10px] font-mono text-slate-400 font-medium">{u.email}</p>
                                </div>
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-bold text-[9px] uppercase">
                                  {u.department}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 font-semibold text-slate-700">
                                {roles.find(r => r.id === u.roleId)?.name || 'Trainee'}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <div className="inline-flex flex-col items-center">
                                  <span className="font-mono font-black text-slate-800 text-xs">
                                    {u.stats.masteryPercent}%
                                  </span>
                                  <span className="text-[9px] text-slate-400">
                                    ({u.stats.verifiedCount}/{u.stats.totalUnits} units)
                                  </span>
                                </div>
                              </td>
                              <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-800">
                                {u.avgExamScore !== null ? (
                                  <span className={u.avgExamScore >= 60 ? 'text-emerald-600 font-black' : 'text-rose-600 font-black'}>
                                    {u.avgExamScore}%
                                  </span>
                                ) : (
                                  <span className="text-slate-400 italic">No Exams</span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <span 
                                  className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border"
                                  style={{ 
                                    backgroundColor: `${u.quadrantColor}15`, 
                                    color: u.quadrantColor, 
                                    borderColor: `${u.quadrantColor}40` 
                                  }}
                                >
                                  {u.quadrantLabel.replace("Performer", "").replace("Practical ", "")}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {u.quadrant === 'needs_focus' && (
                                    <button
                                      onClick={() => sendReminderMail(u.email, u.name, 'sop')}
                                      className="p-1 px-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold font-mono text-[9px] rounded uppercase transition cursor-pointer"
                                      title="SOP Focus Reminder"
                                    >
                                      SOP Focus
                                    </button>
                                  )}
                                  {u.quadrant === 'hands_on' && (
                                    <button
                                      onClick={() => sendReminderMail(u.email, u.name, 'exam')}
                                      className="p-1 px-2 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold font-mono text-[9px] rounded uppercase transition cursor-pointer"
                                      title="Take Exam Alert"
                                    >
                                      Exam Alert
                                    </button>
                                  )}
                                  {u.quadrant === 'knowledgeable' && (
                                    <button
                                      onClick={() => sendReminderMail(u.email, u.name, 'sop')}
                                      className="p-1 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold font-mono text-[9px] rounded uppercase transition cursor-pointer"
                                      title="Apply SOP Notification"
                                    >
                                      Apply SOP
                                    </button>
                                  )}
                                  {u.quadrant === 'expert' && (
                                    <button
                                      onClick={() => sendReminderMail(u.email, u.name, 'compliance')}
                                      className="p-1 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold font-mono text-[9px] rounded uppercase transition cursor-pointer"
                                      title="Send Congratulatory Certificate Mail"
                                    >
                                      Certified
                                    </button>
                                  )}
                                  <button
                                    onClick={() => sendReminderMail(u.email, u.name, u.stats.masteryPercent === 100 ? 'compliance' : 'sop')}
                                    className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-650 rounded cursor-pointer transition"
                                    title="General Ping"
                                  >
                                    <Mail className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

              </div>

            </div>
          )}
        </motion.div>
      </AnimatePresence>

    </div>
  );
}
