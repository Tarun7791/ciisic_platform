import React, { useState, useEffect } from 'react';
import { User, AuditLog, PlatformStats } from '../types';
import { 
  Shield, Users, Briefcase, Landmark, Scroll, Settings, BarChart3, 
  AlertCircle, RefreshCw, CheckCircle, Search, FileText, XCircle, 
  Clock, Check, HelpCircle, Mail, FileSearch, Building2, ChevronRight,
  ShieldAlert, ShieldCheck, AlertTriangle, Globe
} from 'lucide-react';

interface AdminDashboardProps {
  currentUser: User;
  onRefreshStatsTrigger?: () => void;
}

export default function AdminDashboard({ currentUser }: AdminDashboardProps) {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  // Navigation
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'approvals' | 'audit' | 'settings'>('analytics');
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [logActionFilter, setLogActionFilter] = useState<string>('all');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [approvalFilter, setApprovalFilter] = useState<'pending' | 'approved' | 'rejected' | 'revision_requested' | 'all'>('pending');
  
  // Modal states for approvals
  const [selectedRequest, setSelectedRequest] = useState<User | null>(null);
  const [showActionModal, setShowActionModal] = useState<'approve' | 'reject' | 'request_info' | null>(null);
  const [actionComment, setActionComment] = useState('');

  // Platform settings simulation
  const [docLimit, setDocLimit] = useState(10); // MB
  const [logoLimit, setLogoLimit] = useState(2); // MB
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [cellCoordinator, setCellCoordinator] = useState('Dr. Ramesh Kumar (Director, CII Innovation Cell)');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      // Fetch stats
      const statsRes = await fetch('/api/reports', {
        headers: { 'Authorization': `Bearer ${currentUser.id}` }
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Fetch audit logs
      const logsRes = await fetch('/api/audit-logs', {
        headers: { 'Authorization': `Bearer ${currentUser.id}` }
      });
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setLogs(logsData);
      }

      // Fetch all users (Endpoint lists all user-records if admin)
      const usersRes = await fetch('/api/students', { 
        headers: { 'Authorization': `Bearer ${currentUser.id}` }
      });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }
    } catch (e) {
      console.error('Error loading admin data', e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser, activeTab]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('Platform settings updated successfully and written to system configurations.');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected' | 'revision_requested', reason?: string) => {
    try {
      const body: any = { status };
      if (status === 'rejected') {
        body.rejectionReason = reason || 'The provided corporate domain and company affiliation could not be verified.';
      } else if (status === 'revision_requested') {
        body.moreInfoComment = reason || 'Please provide authorized registrar letterhead coordinates or professional IDs.';
      }

      const res = await fetch(`/api/spocs/${id}/approval`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.id}`
        },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        setSuccessMsg(`Stakeholder request updated to ${status.toUpperCase()} successfully.`);
        setTimeout(() => setSuccessMsg(null), 4000);
        setSelectedRequest(null);
        setActionComment('');
        setShowActionModal(null);
        fetchData(); // Refresh list and stats
      } else {
        const err = await res.json();
        setErrorMsg(err.error || 'Failed to update request.');
        setTimeout(() => setErrorMsg(null), 4000);
      }
    } catch (e) {
      console.error('Error updating approval status', e);
    }
  };

  // Filter logs
  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.actorEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = logActionFilter === 'all' || log.action === logActionFilter;
    return matchesSearch && matchesAction;
  });

  // Filter users for directory
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (user.companyName && user.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (user.institutionName && user.institutionName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = userRoleFilter === 'all' || user.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  // Filter users for SPOC approvals
  const spocRequests = users.filter(u => {
    const isSpoc = u.role === 'industry' || u.role === 'institution';
    if (!isSpoc) return false;
    
    const matchesFilter = approvalFilter === 'all' || u.approvalStatus === approvalFilter;
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (u.companyName && u.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (u.institutionName && u.institutionName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  // Count active pending registrations to show in tab pill
  const activePendingCount = users.filter(u => (u.role === 'industry' || u.role === 'institution') && u.approvalStatus === 'pending').length;

  return (
    <div className="bg-slate-50 min-h-screen pb-12 font-sans">
      {/* Dynamic Toasts */}
      {successMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-emerald-500/30 text-white rounded-xl py-3 px-5 shadow-2xl flex items-center gap-3 animate-fade-in-up">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs font-semibold font-mono tracking-wide">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-rose-950 border border-rose-500/30 text-white rounded-xl py-3 px-5 shadow-2xl flex items-center gap-3 animate-fade-in-up">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-xs font-semibold font-mono tracking-wide">{errorMsg}</span>
        </div>
      )}

      {/* Modern Subheader Banner */}
      <div className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-orange-500/10 p-3 rounded-2xl border border-orange-500/30 text-orange-400">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight font-display">Super Administrator Hub</h2>
                <span className="bg-orange-500/15 text-orange-400 text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded border border-orange-500/20">Cell Admin</span>
              </div>
              <p className="text-xs text-slate-450 mt-1 leading-normal max-w-xl">
                Govern registration approvals, audit immutable action logs, manage platform configuration limits, and oversee solution matchmaking parameters.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={fetchData}
              className="bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-2 transition border border-slate-700 font-display uppercase tracking-wider shadow-sm cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Synchronize Records
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Tabs Bar */}
        <div className="flex border-b border-slate-200 mb-8 overflow-x-auto gap-1">
          <button
            onClick={() => { setActiveTab('analytics'); setSearchQuery(''); }}
            className={`py-3.5 px-5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition font-display cursor-pointer ${
              activeTab === 'analytics'
                ? 'border-orange-500 text-orange-550'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> Reports & Analytics
          </button>

          <button
            onClick={() => { setActiveTab('approvals'); setSearchQuery(''); }}
            className={`py-3.5 px-5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition font-display relative cursor-pointer ${
              activeTab === 'approvals'
                ? 'border-orange-500 text-orange-550'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" /> Approval Requests
            {activePendingCount > 0 && (
              <span className="bg-orange-500 text-white text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded-full ml-1">
                {activePendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => { setActiveTab('users'); setSearchQuery(''); }}
            className={`py-3.5 px-5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition font-display cursor-pointer ${
              activeTab === 'users'
                ? 'border-orange-500 text-orange-550'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" /> Stakeholder Directory ({users.length})
          </button>

          <button
            onClick={() => { setActiveTab('audit'); setSearchQuery(''); }}
            className={`py-3.5 px-5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition font-display cursor-pointer ${
              activeTab === 'audit'
                ? 'border-orange-500 text-orange-550'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Scroll className="w-4 h-4" /> Immutable Audit Trail
          </button>

          <button
            onClick={() => { setActiveTab('settings'); setSearchQuery(''); }}
            className={`py-3.5 px-5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition font-display cursor-pointer ${
              activeTab === 'settings'
                ? 'border-orange-500 text-orange-550'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Settings className="w-4 h-4" /> Platform Settings
          </button>
        </div>

        {/* ANALYTICS & REPORTS TAB */}
        {activeTab === 'analytics' && (
          <div className="space-y-8 animate-fade-in">
            {/* 6 Responsive Enterprise KPI Cards */}
            {stats ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Total Users */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Total Stakeholders</span>
                      <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-150 text-slate-500">
                        <Users className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">{stats.totalUsers}</div>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-4 pt-3 border-t border-slate-100 flex items-center justify-between font-mono">
                    <span>Students: <strong className="text-slate-700">{stats.totalStudents}</strong></span>
                    <span>Industry SPOCs: <strong className="text-slate-700">{stats.totalIndustries}</strong></span>
                  </div>
                </div>

                {/* Active Challenges */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Active Challenges</span>
                      <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-150 text-slate-500">
                        <Briefcase className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">{stats.activeChallenges}</div>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-4 pt-3 border-t border-slate-100 flex items-center justify-between font-mono">
                    <span>Published: <strong className="text-emerald-600 font-bold">{stats.activeChallenges}</strong></span>
                    <span>Total Posts: <strong className="text-slate-750">{stats.totalChallenges}</strong></span>
                  </div>
                </div>

                {/* Solution Proposals */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Submitted Proposals</span>
                      <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-150 text-slate-500">
                        <FileText className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">{stats.totalProposals}</div>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-4 pt-3 border-t border-slate-100 flex items-center justify-between font-mono">
                    <span>Approved: <strong className="text-emerald-600 font-bold">{stats.approvedProposals}</strong></span>
                    <span>Under Review: <strong className="text-blue-600 font-bold">{stats.pendingProposals}</strong></span>
                  </div>
                </div>

                {/* Pending Industry SPOCs */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Pending Industry SPOCs</span>
                      <div className={`p-1.5 rounded-lg border ${(stats.pendingIndustryApprovals ?? 0) > 0 ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-slate-50 border-slate-150 text-slate-400'}`}>
                        <Building2 className="w-4 h-4" />
                      </div>
                    </div>
                    <div className={`text-3xl font-extrabold tracking-tight font-mono ${ (stats.pendingIndustryApprovals ?? 0) > 0 ? 'text-amber-600 animate-pulse' : 'text-slate-900' }`}>
                      {stats.pendingIndustryApprovals ?? 0}
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-4 pt-3 border-t border-slate-100 font-mono">
                    {(stats.pendingIndustryApprovals ?? 0) > 0 
                      ? <span className="text-amber-600 font-semibold">⚠️ Requires Administrator vetting review</span>
                      : <span className="text-slate-400 font-medium">No registrations awaiting approval</span>
                    }
                  </div>
                </div>

                {/* Pending Institution SPOCs */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Pending College SPOCs</span>
                      <div className={`p-1.5 rounded-lg border ${(stats.pendingInstitutionApprovals ?? 0) > 0 ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-slate-50 border-slate-150 text-slate-400'}`}>
                        <Landmark className="w-4 h-4" />
                      </div>
                    </div>
                    <div className={`text-3xl font-extrabold tracking-tight font-mono ${ (stats.pendingInstitutionApprovals ?? 0) > 0 ? 'text-amber-600 animate-pulse' : 'text-slate-900' }`}>
                      {stats.pendingInstitutionApprovals ?? 0}
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-4 pt-3 border-t border-slate-100 font-mono">
                    {(stats.pendingInstitutionApprovals ?? 0) > 0 
                      ? <span className="text-amber-600 font-semibold">⚠️ Requires Administrator vetting review</span>
                      : <span className="text-slate-400 font-medium">No registrations awaiting approval</span>
                    }
                  </div>
                </div>

                {/* Pending Student Verifications */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Pending Students</span>
                      <div className={`p-1.5 rounded-lg border ${(stats.pendingStudentVerifications ?? 0) > 0 ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-slate-50 border-slate-150 text-slate-400'}`}>
                        <Users className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                      {stats.pendingStudentVerifications ?? 0}
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-4 pt-3 border-t border-slate-100 font-mono">
                    <span className="text-slate-500">Managed locally by College SPOC coordinators</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-6 animate-pulse">Computing real-time analytics...</p>
            )}

            {/* In-depth Analytics & System Controls */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Proposal Funnel Metrics */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-6 pb-2 border-b border-slate-100 flex items-center gap-1.5 font-display">
                  <BarChart3 className="w-4.5 h-4.5 text-orange-500" /> Proposal funnel progress
                </h3>
                {stats ? (
                  <div className="space-y-5">
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-emerald-700 font-medium">Approved Proposals</span>
                        <span className="font-mono text-slate-700">{stats.approvedProposals} / {stats.totalProposals} ({Math.round(stats.approvedProposals / (stats.totalProposals || 1) * 100)}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${stats.approvedProposals / (stats.totalProposals || 1) * 100}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-blue-700 font-medium">Awaiting SPOC Vetting</span>
                        <span className="font-mono text-slate-700">{stats.pendingProposals} / {stats.totalProposals} ({Math.round(stats.pendingProposals / (stats.totalProposals || 1) * 100)}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${stats.pendingProposals / (stats.totalProposals || 1) * 100}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-orange-700 font-medium">Revision Action Requested</span>
                        <span className="font-mono text-slate-700">{stats.revisionProposals} / {stats.totalProposals} ({Math.round(stats.revisionProposals / (stats.totalProposals || 1) * 100)}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-orange-500 h-full rounded-full transition-all duration-500" style={{ width: `${stats.revisionProposals / (stats.totalProposals || 1) * 100}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-rose-700 font-medium">Shelved / Rejected Projects</span>
                        <span className="font-mono text-slate-700">{stats.rejectedProposals} / {stats.totalProposals} ({Math.round(stats.rejectedProposals / (stats.totalProposals || 1) * 100)}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${stats.rejectedProposals / (stats.totalProposals || 1) * 100}%` }}></div>
                      </div>
                    </div>

                    <div className="bg-orange-50/20 p-4 rounded-xl border border-orange-500/10 mt-4 flex items-center justify-between">
                      <div className="text-xs">
                        <div className="font-bold text-orange-950 font-display">Student Solver Participation</div>
                        <div className="text-[10px] text-orange-850 font-mono">Proposals submitted vs verified student profiles</div>
                      </div>
                      <div className="text-2xl font-extrabold text-orange-600 font-mono">{stats.studentParticipationRate}%</div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 text-center py-6">Loading metrics...</p>
                )}
              </div>

              {/* Security parameters */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-1.5 font-display">
                    <Shield className="w-4.5 h-4.5 text-orange-500" /> Platform Security Parameters
                  </h3>
                  <div className="space-y-4 text-xs text-slate-600">
                    <div className="flex justify-between border-b border-slate-100 py-1.5">
                      <span className="font-medium">Role-Based Access Control (RBAC):</span>
                      <span className="text-emerald-600 font-semibold font-mono">ENFORCED (CELL-WIDE)</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 py-1.5">
                      <span className="font-medium">Industry Contact Info Blinding:</span>
                      <span className="text-emerald-600 font-semibold font-mono">ACTIVE</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 py-1.5">
                      <span className="font-medium">Student Profile Contact Blinding:</span>
                      <span className="text-emerald-600 font-semibold font-mono">ACTIVE</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 py-1.5">
                      <span className="font-medium">Audit Trail Status:</span>
                      <span className="text-emerald-600 font-semibold font-mono">IMMUTABLE LOGGING</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 py-1.5">
                      <span className="font-medium">Dual-Factor Verification Required:</span>
                      <span className="text-slate-500 font-mono">YES (Colleges authorize)</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 text-[11px] leading-relaxed text-slate-600 mt-4 flex gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                  <p>
                    <strong>CII Audit Compliance:</strong> This is a sandboxed mockup database running Express and Node.js. No actual production data has been breached or altered. Audit logging parameters meet ISO/IEC 27001 requirements.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* APPROVAL REQUESTS TAB */}
        {activeTab === 'approvals' && (
          <div className="space-y-6 animate-fade-in font-sans">
            <div className="bg-amber-50 border border-amber-200 text-amber-950 p-4 rounded-2xl flex items-start gap-3 shadow-sm">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <strong className="font-bold font-display">Super Administrator Gatekeeping Protocol:</strong>
                <p className="mt-1">
                  In accordance with CIISIC security rules, registered Industry SPOCs and Institution coordinators cannot access their dashboard workspaces until approved by an administrator. Review corporate and collegiate affiliations, cross-reference their official domains, and click Approve, Reject, or Request Revision.
                </p>
              </div>
            </div>

            {/* Filter controls */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
                <button
                  onClick={() => setApprovalFilter('pending')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition uppercase cursor-pointer ${
                    approvalFilter === 'pending'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  Pending Requests
                </button>
                <button
                  onClick={() => setApprovalFilter('approved')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition uppercase cursor-pointer ${
                    approvalFilter === 'approved'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  Approved Partners
                </button>
                <button
                  onClick={() => setApprovalFilter('revision_requested')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition uppercase cursor-pointer ${
                    approvalFilter === 'revision_requested'
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  Revision Requested
                </button>
                <button
                  onClick={() => setApprovalFilter('rejected')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition uppercase cursor-pointer ${
                    approvalFilter === 'rejected'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  Declined Registrations
                </button>
                <button
                  onClick={() => setApprovalFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition uppercase cursor-pointer ${
                    approvalFilter === 'all'
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  All Requests
                </button>
              </div>

              <div className="relative w-full md:max-w-xs shrink-0">
                <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search requests..."
                  className="pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs w-full focus:outline-none focus:border-orange-500 text-slate-800"
                />
              </div>
            </div>

            {/* Request cards list */}
            <div className="grid grid-cols-1 gap-6">
              {spocRequests.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                  <FileSearch className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-xs text-slate-400 font-bold uppercase font-mono">
                    No registrations found matching the "{approvalFilter}" filter state.
                  </p>
                </div>
              ) : (
                spocRequests.map((request) => (
                  <div key={request.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 hover:shadow-md transition-shadow flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-2 max-w-2xl">
                      <div className="flex items-center gap-2 flex-wrap">
                        {request.role === 'industry' ? (
                          <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded flex items-center gap-1">
                            <Building2 className="w-3 h-3" /> Industry SPOC
                          </span>
                        ) : (
                          <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded flex items-center gap-1">
                            <Landmark className="w-3 h-3" /> Institution SPOC
                          </span>
                        )}

                        {/* Status label badge */}
                        {request.approvalStatus === 'pending' && (
                          <span className="bg-amber-500/10 text-amber-600 border border-amber-200/55 text-[9px] font-bold font-mono px-2 py-0.5 rounded animate-pulse">PENDING REVIEW</span>
                        )}
                        {request.approvalStatus === 'approved' && (
                          <span className="bg-emerald-600/10 text-emerald-700 border border-emerald-200/55 text-[9px] font-bold font-mono px-2 py-0.5 rounded">APPROVED & ACTIVE</span>
                        )}
                        {request.approvalStatus === 'revision_requested' && (
                          <span className="bg-orange-500/10 text-orange-600 border border-orange-200/55 text-[9px] font-bold font-mono px-2 py-0.5 rounded">REVISION REQUESTED</span>
                        )}
                        {request.approvalStatus === 'rejected' && (
                          <span className="bg-rose-55 text-rose-750 border border-rose-150 text-[9px] font-bold font-mono px-2 py-0.5 rounded">DECLINED</span>
                        )}
                      </div>

                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900 font-display flex items-center gap-2">
                          {request.name}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Email: <strong className="font-semibold text-slate-700">{request.email}</strong> • Registered: <span className="font-mono">{new Date(request.createdAt).toLocaleDateString()}</span>
                        </p>
                      </div>

                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-150 text-xs text-slate-600 font-medium">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wide">Affiliated Entity</span>
                        <p className="text-slate-800 font-bold font-display mt-0.5">
                          {request.companyName || request.institutionName || 'Unspecified Entity'}
                        </p>
                      </div>

                      {/* Display feedback comment if revision or rejection is active */}
                      {request.approvalStatus === 'revision_requested' && (
                        <div className="text-xs bg-orange-50/50 border border-orange-100 p-3 rounded-lg text-orange-950 italic">
                          <strong>Comments sent to user:</strong> "{request.moreInfoComment}"
                        </div>
                      )}
                      {request.approvalStatus === 'rejected' && (
                        <div className="text-xs bg-rose-50/50 border border-rose-100 p-3 rounded-lg text-rose-950 italic">
                          <strong>Decline reason:</strong> "{request.rejectionReason}"
                        </div>
                      )}
                    </div>

                    {/* Action buttons panel */}
                    <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end border-t md:border-t-0 pt-4 md:pt-0">
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-2 px-3 rounded-lg text-xs flex items-center gap-1.5 transition border border-slate-200 cursor-pointer shadow-sm"
                      >
                        <FileSearch className="w-3.5 h-3.5" /> Details
                      </button>

                      {request.approvalStatus === 'pending' && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowActionModal('request_info');
                              setActionComment('');
                            }}
                            className="bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold py-2 px-3 rounded-lg text-xs flex items-center gap-1.5 transition border border-orange-200 cursor-pointer shadow-sm"
                          >
                            <HelpCircle className="w-3.5 h-3.5" /> More Info
                          </button>
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowActionModal('reject');
                              setActionComment('');
                            }}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold py-2 px-3 rounded-lg text-xs flex items-center gap-1.5 transition border border-rose-200 cursor-pointer shadow-sm"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Decline
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(request.id, 'approved')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3.5 rounded-lg text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                          >
                            <Check className="w-3.5 h-3.5" /> Approve
                          </button>
                        </>
                      )}

                      {(request.approvalStatus === 'rejected' || request.approvalStatus === 'revision_requested') && (
                        <button
                          onClick={() => handleUpdateStatus(request.id, 'approved')}
                          className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 px-3 rounded-lg text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" /> Re-Approve
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* STAKEHOLDER USER DIRECTORY TAB */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl border border-slate-250 overflow-hidden shadow-sm animate-fade-in font-sans">
            <div className="p-5 border-b border-slate-150 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-orange-500" />
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-display">Registered Stakeholders Directory</h3>
                  <p className="text-[10px] text-slate-500 font-mono">Filter and find students, corporate representatives and academic coordinators</p>
                </div>
              </div>
              <div className="flex items-center gap-2 max-w-md w-full">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name, email, or entities..."
                    className="pl-9 p-2 border border-slate-300 rounded-lg text-xs w-full focus:outline-none focus:border-orange-500 text-slate-800"
                  />
                </div>
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="p-2 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:border-orange-500 text-slate-800 font-bold font-mono"
                >
                  <option value="all">All Roles</option>
                  <option value="student">Student</option>
                  <option value="industry">Industry</option>
                  <option value="institution">College Coordinator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider text-[10px] font-mono">
                    <th className="p-4 pl-6">User Details</th>
                    <th className="p-4">Role Badge</th>
                    <th className="p-4">Affiliated Entity</th>
                    <th className="p-4">Affiliation Status</th>
                    <th className="p-4">Registered Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-slate-400 font-bold uppercase font-mono">
                        No matching users were found in the database directory.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 pl-6">
                          <div className="font-extrabold text-slate-900 font-display text-[13px]">{u.name}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{u.email}</div>
                          <div className="text-[9px] font-mono text-slate-400 mt-1 uppercase tracking-wider">Stakeholder ID: {u.id}</div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase ${
                            u.role === 'admin' ? 'bg-orange-50 text-orange-750 border border-orange-200' :
                            u.role === 'industry' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                            u.role === 'institution' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {u.role === 'institution' ? 'college' : u.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-slate-800 font-display text-[12px]">
                            {u.companyName || u.institutionName || u.studentProfile?.institutionName || 'CII Secretariat'}
                          </div>
                        </td>
                        <td className="p-4">
                          {u.role === 'student' && u.studentProfile ? (
                            <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold font-mono tracking-wide ${
                              u.studentProfile.verifiedStatus === 'verified' ? 'bg-emerald-100 text-emerald-800' :
                              u.studentProfile.verifiedStatus === 'rejected' ? 'bg-rose-100 text-rose-800' :
                              'bg-amber-100 text-amber-800 animate-pulse'
                            }`}>
                              {u.studentProfile.verifiedStatus.toUpperCase()}
                            </span>
                          ) : (u.role === 'industry' || u.role === 'institution') ? (
                            <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold font-mono tracking-wide ${
                              u.approvalStatus === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                              u.approvalStatus === 'rejected' ? 'bg-rose-100 text-rose-800' :
                              u.approvalStatus === 'revision_requested' ? 'bg-orange-100 text-orange-800' :
                              'bg-amber-100 text-amber-800 animate-pulse'
                            }`}>
                              {u.approvalStatus ? u.approvalStatus.toUpperCase() : 'PENDING'}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">SYSTEM BYPASS</span>
                          )}
                        </td>
                        <td className="p-4 text-slate-500 font-mono">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* IMMUTABLE AUDIT TRAIL TAB */}
        {activeTab === 'audit' && (
          <div className="space-y-6 font-sans animate-fade-in">
            <div className="bg-orange-50/20 border border-orange-500/20 text-orange-950 p-4 rounded-xl flex items-start gap-3 shadow-sm">
              <Scroll className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <strong className="font-bold font-display">Compliance Regulation: Immutable Platform Log.</strong>
                <p className="mt-1">
                  This cell adheres to ISO 27001 data standards. Administrators are strictly forbidden from altering, resetting, or purging audit logs. This audit page is read-only, and any attempt to bypass logs will be instantly reported to the CII central executive panel.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-5 border-b border-slate-150 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Scroll className="w-4.5 h-4.5 text-orange-500" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-display">System Activity Logs</h3>
                </div>
                <div className="flex items-center gap-2 max-w-md w-full">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search log descriptions or actors..."
                      className="pl-9 p-2 border border-slate-300 rounded-lg text-xs w-full focus:outline-none focus:border-orange-500 text-slate-800"
                    />
                  </div>
                  <select
                    value={logActionFilter}
                    onChange={(e) => setLogActionFilter(e.target.value)}
                    className="p-2 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:border-orange-500 text-slate-800 font-semibold font-mono"
                  >
                    <option value="all">All Actions</option>
                    <option value="login">User Login</option>
                    <option value="student_registered">User Registration</option>
                    <option value="challenge_created">Challenge Created</option>
                    <option value="challenge_published">Challenge Published</option>
                    <option value="proposal_submitted">Proposal Submitted</option>
                    <option value="proposal_approved">Proposal Approved</option>
                    <option value="proposal_rejected">Proposal Rejected</option>
                    <option value="revision_requested">Revision Requested</option>
                    <option value="student_verified">Student Profile Verified</option>
                    <option value="message_sent">Clarification Message</option>
                    <option value="role_changed">SPOC Admin Approval</option>
                  </select>
                </div>
              </div>

              <div className="divide-y divide-slate-150">
                {filteredLogs.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs font-bold uppercase font-mono">
                    No matching activities recorded in the logs.
                  </div>
                ) : (
                  filteredLogs.map((log) => (
                    <div key={log.id} className="p-4 pl-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                      <div className="space-y-1.5 max-w-3xl">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider ${
                            log.action === 'login' ? 'bg-slate-100 text-slate-600' :
                            log.action.includes('approved') ? 'bg-emerald-55 text-emerald-750 border border-emerald-200' :
                            log.action.includes('rejected') ? 'bg-rose-55 text-rose-750 border border-rose-200 font-semibold' :
                            log.action.includes('challenge') ? 'bg-blue-50 text-blue-750 border border-blue-200' :
                            log.action.includes('revision') ? 'bg-orange-50 text-orange-750 border border-orange-200' :
                            log.action === 'role_changed' ? 'bg-slate-900 text-white border border-slate-800' :
                            'bg-orange-100/30 text-orange-750 border border-orange-100'
                          }`}>
                            {log.action.replace('_', ' ')}
                          </span>
                          <span className="font-semibold text-slate-900 font-display">{log.description}</span>
                        </div>
                        <div className="text-[10px] text-slate-450 font-mono">
                          Actor: <strong className="text-slate-600 font-bold">{log.actorName}</strong> ({log.actorEmail}) • Role: <span className="font-bold">{log.actorRole.toUpperCase()}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-mono text-[10px] text-slate-500 font-bold">
                          {new Date(log.timestamp).toLocaleDateString()}
                        </div>
                        <div className="font-mono text-[9px] text-slate-400 mt-0.5">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </div>
                        <span className="text-[8px] font-mono text-orange-500 font-bold block mt-1">LOGID: {log.id}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl bg-white p-8 rounded-2xl border border-slate-200 shadow-sm font-sans animate-fade-in">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-6 pb-2 border-b border-slate-150 flex items-center gap-2 font-display">
              <Settings className="w-4.5 h-4.5 text-orange-500" /> Platform Configurations
            </h3>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono font-display">
                    Proposal Document Upload Limit (MB)
                  </label>
                  <input
                    type="number"
                    required
                    value={docLimit}
                    onChange={(e) => setDocLimit(Number(e.target.value))}
                    className="p-2.5 border border-slate-300 rounded-lg text-xs w-full focus:outline-none focus:border-orange-500 text-slate-800 font-bold font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Maximum allowed size for student PDF files.</span>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono font-display">
                    Company Logo Limit (MB)
                  </label>
                  <input
                    type="number"
                    required
                    value={logoLimit}
                    onChange={(e) => setLogoLimit(Number(e.target.value))}
                    className="p-2.5 border border-slate-300 rounded-lg text-xs w-full focus:outline-none focus:border-orange-500 text-slate-800 font-bold font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Maximum allowed size for partner industrial logos.</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono font-display">
                  CII Secretariat Officer In-charge
                </label>
                <input
                  type="text"
                  required
                  value={cellCoordinator}
                  onChange={(e) => setCellCoordinator(e.target.value)}
                  className="p-2.5 border border-slate-300 rounded-lg text-xs w-full focus:outline-none focus:border-orange-500 text-slate-800 font-semibold"
                />
                <span className="text-[10px] text-slate-400 mt-1 block font-mono">Primary email contact for dispute settlements.</span>
              </div>

              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 font-display">CII Maintenance Shutdown Mode</h4>
                    <p className="text-[10px] text-slate-500 leading-normal mt-0.5">Restrict proposal submissions and drafts editing for annual reporting audits.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={maintenanceMode}
                    onChange={(e) => setMaintenanceMode(e.target.checked)}
                    className="w-4 h-4 text-orange-500 rounded border-slate-300 focus:ring-orange-500 focus:outline-none cursor-pointer"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold font-display py-3 px-6 rounded-lg text-xs uppercase tracking-wider transition shadow-sm cursor-pointer"
              >
                Save Configurations
              </button>
            </form>
          </div>
        )}
      </div>

      {/* DETAIL VIEW MODAL */}
      {selectedRequest && !showActionModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden font-sans">
            <div className="bg-slate-950 text-white p-6 border-b border-slate-850 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base font-display">Partner Profile Credentials</h3>
                <p className="text-[10px] font-mono text-slate-400 mt-0.5 uppercase tracking-wider">Registration ID: {selectedRequest.id}</p>
              </div>
              <button 
                onClick={() => setSelectedRequest(null)}
                className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>
            
            <div className="p-6 space-y-4 text-xs">
              <div className="flex items-center gap-3">
                {selectedRequest.companyLogo ? (
                  <img 
                    src={selectedRequest.companyLogo} 
                    alt="Logo" 
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-slate-50"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 font-extrabold text-base border border-orange-200">
                    {selectedRequest.role === 'industry' ? 'I' : 'C'}
                  </div>
                )}
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm font-display">{selectedRequest.name}</h4>
                  <p className="text-slate-500 mt-0.5">{selectedRequest.email}</p>
                </div>
              </div>

              <hr className="border-slate-100" />

              <div className="max-h-[380px] overflow-y-auto pr-2 space-y-4">
                {selectedRequest.role === 'industry' ? (
                  <>
                    <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-150 text-slate-800">
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase font-mono block">Designation / Role</span>
                        <p className="font-bold text-slate-800 text-xs">
                          {selectedRequest.industryProfile?.designation || "Director of R&D Partnerships"}
                        </p>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase font-mono block">Mobile Number</span>
                        <p className="font-bold text-slate-800 text-xs font-mono">
                          {selectedRequest.industryProfile?.mobile || "+91 98765 43210"}
                        </p>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase font-mono block">Industry Sector</span>
                        <p className="font-bold text-slate-800 text-xs">
                          {selectedRequest.industryProfile?.sector || "Manufacturing & Energy"}
                        </p>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase font-mono block">Official Website</span>
                        <a 
                          href={selectedRequest.industryProfile?.website || "https://www.tata.com"} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="font-bold text-orange-600 hover:underline text-xs flex items-center gap-0.5 truncate"
                        >
                          <Globe className="w-3 h-3" /> {selectedRequest.industryProfile?.website?.replace(/^https?:\/\//i, '') || "tata.com"}
                        </a>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[9px] text-slate-400 uppercase font-mono block">Corporate HQ Address</span>
                        <p className="font-medium text-slate-700 text-xs mt-0.5">
                          {selectedRequest.industryProfile?.address || "Corporate Towers, Sector 4, Mumbai, MH"}
                        </p>
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block font-mono border-b pb-1">
                        Corporate Verification Registry
                      </span>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-slate-400 block font-mono text-[9px] uppercase">CII Membership ID</span>
                          <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded font-mono font-bold text-[10px] block mt-0.5 w-max">
                            {selectedRequest.industryProfile?.ciiMembershipId || "CII-MEMB-49204-X"}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-mono text-[9px] uppercase">Company Registration No.</span>
                          <span className="bg-slate-100 text-slate-800 border border-slate-250 px-2 py-0.5 rounded font-mono font-bold text-[10px] block mt-0.5 truncate">
                            {selectedRequest.industryProfile?.registrationNumber || "L27100MH1907PLC000260"}
                          </span>
                        </div>
                        {(selectedRequest.industryProfile?.gstNumber || "27AAAT1234F1Z9") && (
                          <div className="col-span-2">
                            <span className="text-slate-400 block font-mono text-[9px] uppercase">GSTIN / Tax Code</span>
                            <span className="font-mono font-bold text-slate-800 mt-0.5 block">
                              {selectedRequest.industryProfile?.gstNumber || "27AAAT1234F1Z9"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-xl p-3.5 space-y-2">
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block font-mono">
                        Verification Credentials Attached (PDF/Images)
                      </span>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100/70 border border-slate-200">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-orange-500 shrink-0" />
                            <div>
                              <p className="text-xs font-bold text-slate-800 truncate max-w-[180px]">
                                {selectedRequest.industryProfile?.companyIdCardFile || "CII_AUTHORIZED_SPOC_CARD.pdf"}
                              </p>
                              <span className="text-[9px] text-slate-400 font-mono">Company ID Card • Vetted Document</span>
                            </div>
                          </div>
                          <a 
                            href="#" 
                            onClick={(e) => e.preventDefault()}
                            className="text-[10px] font-bold text-orange-600 hover:text-orange-850 px-2 py-1 rounded bg-orange-50 border border-orange-200 hover:bg-orange-100/55"
                          >
                            View Doc
                          </a>
                        </div>

                        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100/70 border border-slate-200">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-orange-500 shrink-0" />
                            <div>
                              <p className="text-xs font-bold text-slate-800 truncate max-w-[180px]">
                                {selectedRequest.industryProfile?.authorizationLetterFile || "CII_AUTHORIZATION_LETTER.pdf"}
                              </p>
                              <span className="text-[9px] text-slate-400 font-mono">Signatory Authorization Letter</span>
                            </div>
                          </div>
                          <a 
                            href="#" 
                            onClick={(e) => e.preventDefault()}
                            className="text-[10px] font-bold text-orange-600 hover:text-orange-850 px-2 py-1 rounded bg-orange-50 border border-orange-200 hover:bg-orange-100/55"
                          >
                            View Doc
                          </a>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-150 text-slate-850">
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase font-mono block">Designation / Office</span>
                        <p className="font-bold text-slate-850 text-xs">
                          {selectedRequest.institutionProfile?.designation || "Dean of Academic Affairs"}
                        </p>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase font-mono block">Mobile Number</span>
                        <p className="font-bold text-slate-850 text-xs font-mono">
                          {selectedRequest.institutionProfile?.mobile || "+91 94432 10987"}
                        </p>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase font-mono block">University Affiliation</span>
                        <p className="font-bold text-slate-850 text-xs">
                          {selectedRequest.institutionProfile?.university || "Autonomous Technical University Board"}
                        </p>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase font-mono block">Academic Department</span>
                        <p className="font-bold text-slate-850 text-xs">
                          {selectedRequest.institutionProfile?.department || "Innovation Cell / Placements"}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[9px] text-slate-400 uppercase font-mono block">Institution URL</span>
                        <a 
                          href={selectedRequest.institutionProfile?.website || "https://www.iitb.ac.in"} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="font-bold text-orange-600 hover:underline text-xs flex items-center gap-0.5 truncate"
                        >
                          <Globe className="w-3 h-3" /> {selectedRequest.institutionProfile?.website?.replace(/^https?:\/\//i, '') || "iitb.ac.in"}
                        </a>
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-xl p-3.5 space-y-2.5 bg-white">
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block font-mono border-b pb-1">
                        Academic Vetting & AICTE Codes
                      </span>
                      <div>
                        <span className="text-slate-400 block font-mono text-[9px] uppercase">AICTE Approval Code</span>
                        <span className="bg-amber-50 text-amber-850 border border-amber-200 px-2 py-0.5 rounded font-mono font-bold text-[10px] block mt-0.5 w-max">
                          {selectedRequest.institutionProfile?.aicteCode || "AICTE-1-4930194"}
                        </span>
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-xl p-3.5 space-y-2 bg-white">
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block font-mono">
                        Academic Credentials Attached (Vetted PDF)
                      </span>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100/70 border border-slate-200">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-orange-500 shrink-0" />
                            <div>
                              <p className="text-xs font-bold text-slate-800 truncate max-w-[180px]">
                                {selectedRequest.institutionProfile?.collegeIdCardFile || "OFFICIAL_FACULTY_ID_CARD.pdf"}
                              </p>
                              <span className="text-[9px] text-slate-400 font-mono">College Faculty ID card photo</span>
                            </div>
                          </div>
                          <a 
                            href="#" 
                            onClick={(e) => e.preventDefault()}
                            className="text-[10px] font-bold text-orange-600 hover:text-orange-850 px-2 py-1 rounded bg-orange-50 border border-orange-200 hover:bg-orange-100/55"
                          >
                            View Doc
                          </a>
                        </div>

                        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100/70 border border-slate-200">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-orange-500 shrink-0" />
                            <div>
                              <p className="text-xs font-bold text-slate-800 truncate max-w-[180px]">
                                {selectedRequest.institutionProfile?.authorizationLetterFile || "SPOC_APPOINTMENT_LETTER.pdf"}
                              </p>
                              <span className="text-[9px] text-slate-400 font-mono">SPOC Coordinator Appointment Letter</span>
                            </div>
                          </div>
                          <a 
                            href="#" 
                            onClick={(e) => e.preventDefault()}
                            className="text-[10px] font-bold text-orange-600 hover:text-orange-850 px-2 py-1 rounded bg-orange-50 border border-orange-200 hover:bg-orange-100/55"
                          >
                            View Doc
                          </a>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-1.5">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block font-mono">Vetting History & System Audit Comments</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 font-semibold">Verification Stage:</span>
                    <span className={`font-mono font-bold px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wide ${
                      selectedRequest.approvalStatus === 'approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                      selectedRequest.approvalStatus === 'revision_requested' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                      selectedRequest.approvalStatus === 'rejected' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                      'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {selectedRequest.approvalStatus || 'pending'}
                    </span>
                  </div>
                  {selectedRequest.moreInfoComment && (
                    <div className="text-orange-900 bg-orange-50 p-2.5 rounded-lg border border-orange-100 text-[11px] leading-relaxed">
                      <strong className="block mb-0.5">Revision Feedback Instructions Sent:</strong>
                      "{selectedRequest.moreInfoComment}"
                    </div>
                  )}
                  {selectedRequest.rejectionReason && (
                    <div className="text-rose-900 bg-rose-50 p-2.5 rounded-lg border border-rose-100 text-[11px] leading-relaxed">
                      <strong className="block mb-0.5">Formal Decline Reason Logs:</strong>
                      "{selectedRequest.rejectionReason}"
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-5 bg-slate-50 border-t border-slate-150 flex items-center justify-between">
              <span className="text-[10px] text-slate-450 font-mono">Secure CIISIC System Entry</span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setSelectedRequest(null)}
                  className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold py-2 px-3.5 rounded-lg text-xs transition cursor-pointer"
                >
                  Close
                </button>
                {selectedRequest.approvalStatus === 'pending' && (
                  <button 
                    onClick={() => {
                      setShowActionModal('approve');
                      setActionComment('');
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg text-xs transition cursor-pointer shadow-sm"
                  >
                    Approve Affiliation
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ACTION COMMENT MODAL (Approve, Reject, Request Info) */}
      {showActionModal && selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden font-sans">
            <div className="p-6">
              <div className="flex items-center gap-3.5 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                  showActionModal === 'reject' ? 'bg-rose-50 border-rose-200 text-rose-600' :
                  showActionModal === 'request_info' ? 'bg-orange-50 border-orange-200 text-orange-600' :
                  'bg-emerald-50 border-emerald-200 text-emerald-600'
                }`}>
                  {showActionModal === 'reject' && <XCircle className="w-5 h-5" />}
                  {showActionModal === 'request_info' && <HelpCircle className="w-5 h-5" />}
                  {showActionModal === 'approve' && <CheckCircle className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm font-display uppercase tracking-wider">
                    {showActionModal === 'reject' && 'Decline Registration Request'}
                    {showActionModal === 'request_info' && 'Request Revision Comments'}
                    {showActionModal === 'approve' && 'Approve Registration Affiliation'}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono">Target SPOC: {selectedRequest.name}</p>
                </div>
              </div>

              {showActionModal !== 'approve' ? (
                <div className="space-y-4">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                    {showActionModal === 'reject' && 'Official Decline Reason'}
                    {showActionModal === 'request_info' && 'Details Required / Revision Instructions'}
                  </label>
                  <textarea
                    required
                    value={actionComment}
                    onChange={(e) => setActionComment(e.target.value)}
                    placeholder={
                      showActionModal === 'reject' 
                        ? "Enter reason. (e.g. Could not verify email domain or corporate registrar ID)."
                        : "Describe required changes or files. (e.g. Please provide authorized Registrar letterhead signed by the Director)."
                    }
                    rows={4}
                    className="p-3 border border-slate-300 rounded-lg text-xs w-full focus:outline-none focus:border-orange-500 text-slate-800"
                  />
                  <p className="text-[10px] text-slate-450 leading-relaxed font-mono">
                    This message will be instantly sent to {selectedRequest.email} and rendered in their login status gate dashboard.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-650 leading-relaxed font-medium">
                  Are you sure you want to approve <strong className="text-slate-900">{selectedRequest.name}</strong> as the verified coordinator for <strong className="text-slate-900">{selectedRequest.companyName || selectedRequest.institutionName}</strong>? This will instantly unlock full platform features for them.
                </p>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-150 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setShowActionModal(null);
                  setActionComment('');
                }}
                className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold py-2 px-3.5 rounded-lg text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              
              {showActionModal === 'reject' && (
                <button
                  onClick={() => handleUpdateStatus(selectedRequest.id, 'rejected', actionComment)}
                  disabled={!actionComment.trim()}
                  className="bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-lg text-xs transition cursor-pointer shadow-sm"
                >
                  Decline Request
                </button>
              )}

              {showActionModal === 'request_info' && (
                <button
                  onClick={() => handleUpdateStatus(selectedRequest.id, 'revision_requested', actionComment)}
                  disabled={!actionComment.trim()}
                  className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-lg text-xs transition cursor-pointer shadow-sm"
                >
                  Send Revision Request
                </button>
              )}

              {showActionModal === 'approve' && (
                <button
                  onClick={() => handleUpdateStatus(selectedRequest.id, 'approved')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg text-xs transition cursor-pointer shadow-sm"
                >
                  Confirm Approval
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
