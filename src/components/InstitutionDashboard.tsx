import React, { useState, useEffect } from 'react';
import { User, Proposal } from '../types';
import { Landmark, Users, CheckCircle, XCircle, Clock, BookOpen, BarChart3, HelpCircle, FileText, RefreshCw, Send } from 'lucide-react';

interface InstitutionDashboardProps {
  currentUser: User;
}

export default function InstitutionDashboard({ currentUser }: InstitutionDashboardProps) {
  const [students, setStudents] = useState<User[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [activeTab, setActiveTab] = useState<'verification' | 'proposals' | 'reports'>('verification');
  
  // UI states
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchInstitutionData = async () => {
    try {
      // Fetch students of this institution
      const studentRes = await fetch('/api/students', {
        headers: { 'Authorization': `Bearer ${currentUser.id}` }
      });
      if (studentRes.ok) {
        setStudents(await studentRes.json());
      }

      // Fetch proposals of this institution
      const proposalsRes = await fetch('/api/proposals', {
        headers: { 'Authorization': `Bearer ${currentUser.id}` }
      });
      if (proposalsRes.ok) {
        setProposals(await proposalsRes.json());
      }
    } catch (e) {
      console.error('Error fetching coordinator data', e);
    }
  };

  useEffect(() => {
    fetchInstitutionData();
  }, [currentUser, activeTab]);

  const handleVerifyStudent = async (studentId: string, status: 'verified' | 'rejected') => {
    setActionLoading(studentId);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const response = await fetch(`/api/students/${studentId}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.id}`
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Verification action failed');
      }

      setSuccessMsg(`Student profile ${status === 'verified' ? 'verified and unlocked' : 'rejected'} successfully.`);
      await fetchInstitutionData();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Stats calculation
  const totalStudents = students.length;
  const verifiedStudents = students.filter(s => s.studentProfile?.verifiedStatus === 'verified').length;
  const pendingStudents = students.filter(s => s.studentProfile?.verifiedStatus === 'pending').length;
  const rejectedStudents = students.filter(s => s.studentProfile?.verifiedStatus === 'rejected').length;

  const totalProposals = proposals.length;
  const approvedProposals = proposals.filter(p => p.status === 'approved').length;
  const pendingProposals = proposals.filter(p => p.status === 'pending').length;

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Dashboard Subheader */}
      <div className="bg-slate-900 text-white py-6 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-orange-950/25 p-2.5 rounded-xl border border-orange-500/20 text-orange-500">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight font-display">{currentUser.institutionName} Coordinator Desk</h2>
              <p className="text-xs text-slate-400 font-sans">Student enrollment clearance, activity monitoring, and academic-industrial audits</p>
            </div>
          </div>
          <button
            onClick={fetchInstitutionData}
            className="bg-slate-800 hover:bg-orange-600 text-slate-300 hover:text-white font-bold py-2 px-3.5 rounded-lg text-xs flex items-center gap-1.5 transition font-display uppercase tracking-wider cursor-pointer shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Records
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Alerts */}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl p-3.5 mb-6 font-mono font-bold uppercase tracking-wider">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl p-3.5 mb-6 font-mono font-bold uppercase tracking-wider">
            {errorMsg}
          </div>
        )}

        {/* Tab Controls */}
        <div className="flex border-b border-slate-200 mb-8 overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab('verification')}
            className={`py-2.5 px-4 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 border-b-2 transition font-display ${
              activeTab === 'verification'
                ? 'border-orange-500 text-orange-500 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-850'
            }`}
          >
            <Users className="w-4 h-4" /> Student Profiles Clearance ({pendingStudents} Pending)
          </button>
          <button
            onClick={() => setActiveTab('proposals')}
            className={`py-2.5 px-4 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 border-b-2 transition font-display ${
              activeTab === 'proposals'
                ? 'border-orange-500 text-orange-500 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-850'
            }`}
          >
            <BookOpen className="w-4 h-4" /> local Proposals Tracking ({proposals.length})
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`py-2.5 px-4 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 border-b-2 transition font-display ${
              activeTab === 'reports'
                ? 'border-orange-500 text-orange-500 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-850'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> Academic Progress Reports
          </button>
        </div>

        {/* VERIFICATION TAB */}
        {activeTab === 'verification' && (
          <div className="space-y-6">
            {/* Simple stats panel */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Total Local Solvers</div>
                <div className="text-xl font-extrabold text-slate-900">{totalStudents}</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Verified Profile Status</div>
                  <div className="text-xl font-extrabold text-emerald-600">{verifiedStudents}</div>
                </div>
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Pending Authorization</div>
                  <div className="text-xl font-extrabold text-orange-500">{pendingStudents}</div>
                </div>
                <Clock className="w-5 h-5 text-orange-500 animate-pulse" />
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Rejected Profiles</div>
                  <div className="text-xl font-extrabold text-rose-500">{rejectedStudents}</div>
                </div>
                <XCircle className="w-5 h-5 text-rose-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 bg-slate-50 border-b border-slate-150">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-display">CII Student Directory & Verification Queue</h3>
              </div>

              <div className="divide-y divide-slate-200">
                {students.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs font-bold uppercase font-mono">
                    No students have registered under your institution yet.
                  </div>
                ) : (
                  students.map((student) => {
                    const prof = student.studentProfile!;
                    const isPending = prof.verifiedStatus === 'pending';
                    const isVerified = prof.verifiedStatus === 'verified';
                    const isRejected = prof.verifiedStatus === 'rejected';

                    return (
                      <div key={student.id} className="p-5 hover:bg-slate-50 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-xs">
                        {/* Student Info */}
                        <div className="space-y-1.5 max-w-xl">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-slate-900 font-display">{student.name}</h4>
                            <span className="font-mono text-[9px] text-slate-400 font-bold">ID: {student.id}</span>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold tracking-wider uppercase ${
                              isVerified ? 'bg-emerald-50 text-emerald-750 border border-emerald-200' :
                              isRejected ? 'bg-rose-50 text-rose-750 border border-rose-200' :
                              'bg-orange-50 text-orange-750 border border-orange-200 animate-pulse'
                            }`}>
                              {prof.verifiedStatus}
                            </span>
                          </div>
                          
                          <div className="text-slate-600 font-medium grid grid-cols-2 gap-x-4 gap-y-1 font-sans">
                            <div><strong className="text-slate-450 font-normal">Roll No:</strong> {prof.rollNumber}</div>
                            <div><strong className="text-slate-450 font-normal">Branch:</strong> {prof.branch} ({prof.year})</div>
                            <div className="col-span-2 mt-1"><strong className="text-slate-450 font-normal">Registered Email:</strong> {student.email}</div>
                          </div>

                          {prof.bio && (
                            <p className="text-[11px] text-slate-500 italic font-medium mt-1">"{prof.bio}"</p>
                          )}

                          <div className="flex flex-wrap gap-1 mt-2">
                            {prof.skills.map(s => (
                              <span key={s} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-[9px] font-bold font-mono uppercase">{s}</span>
                            ))}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0 font-display">
                          {isPending ? (
                            <>
                              <button
                                disabled={actionLoading !== null}
                                onClick={() => handleVerifyStudent(student.id, 'verified')}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded text-[10px] uppercase tracking-wider transition flex items-center gap-1 cursor-pointer"
                              >
                                {actionLoading === student.id ? 'Working...' : 'Approve Solver'}
                              </button>
                              <button
                                disabled={actionLoading !== null}
                                onClick={() => handleVerifyStudent(student.id, 'rejected')}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold py-1.5 px-3 rounded text-[10px] uppercase tracking-wider border border-rose-200 transition cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <div className="text-slate-400 text-[10px] font-semibold italic flex items-center gap-1">
                              {isVerified ? (
                                <span className="text-emerald-600 font-bold">✓ Account Authorized</span>
                              ) : (
                                <span className="text-rose-600 font-bold">✗ Profile Rejected</span>
                              )}
                              <button
                                onClick={() => handleVerifyStudent(student.id, isVerified ? 'rejected' : 'verified')}
                                className="text-orange-500 hover:underline hover:text-orange-600 ml-2 text-[9px] not-italic font-bold cursor-pointer font-display"
                              >
                                Toggle
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* PROPOSALS TRACKING TAB */}
        {activeTab === 'proposals' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 bg-slate-50 border-b border-slate-150">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-display">Solutions Submitted by local Solvers</h3>
            </div>

            <div className="divide-y divide-slate-150 font-sans">
              {proposals.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs font-bold uppercase font-mono">
                  No active solution proposals have been submitted by your college students yet.
                </div>
              ) : (
                proposals.map((prop) => (
                  <div key={prop.id} className="p-5 hover:bg-slate-50 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
                    <div className="space-y-1 max-w-3xl">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                          prop.status === 'approved' ? 'bg-emerald-50 text-emerald-750 border border-emerald-200' :
                          prop.status === 'rejected' ? 'bg-rose-50 text-rose-750 border border-rose-200' :
                          prop.status === 'revision_requested' ? 'bg-orange-50 text-orange-750 border border-orange-200 animate-pulse font-bold' :
                          'bg-blue-50 text-blue-750 border border-blue-200 font-bold'
                        }`}>
                          {prop.status.replace('_', ' ')}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 font-display">{prop.challengeTitle}</h4>
                      </div>

                      <p className="text-[11px] text-slate-500 font-medium font-sans">
                        Submitted by: <strong className="text-slate-700 font-semibold">{prop.studentName}</strong> (Verification status of students under coordination protects privacy fields).
                      </p>

                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                        {prop.proposalText}
                      </p>

                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-[10px] text-slate-400 font-mono font-semibold">ID: {prop.id}</span>
                        <span className="text-[10px] text-slate-400 font-mono">Last Update: {new Date(prop.updatedAt).toLocaleDateString()}</span>
                        {prop.documents.length > 0 && (
                          <span className="text-[10px] text-slate-600 font-bold font-mono uppercase flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5 text-orange-500" /> {prop.documents.length} Attachment(s)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      {prop.status === 'approved' ? (
                        <span className="text-[10px] font-bold text-emerald-600 font-display uppercase tracking-wider">✓ Industry Approved</span>
                      ) : prop.status === 'revision_requested' ? (
                        <span className="text-[10px] font-bold text-orange-500 font-display uppercase tracking-wider">⚡ Revision Underway</span>
                      ) : prop.status === 'rejected' ? (
                        <span className="text-[10px] font-bold text-rose-500 font-display uppercase tracking-wider">✗ Shelved</span>
                      ) : (
                        <span className="text-[10px] font-bold text-blue-500 font-display uppercase tracking-wider">🕒 Pending Review</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* REPORTS TAB */}
        {activeTab === 'reports' && (
          <div className="space-y-8 font-sans">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">College Success Index</h4>
                <div className="text-2xl font-extrabold text-slate-900 font-mono">
                  {totalProposals > 0 ? Math.round((approvedProposals / totalProposals) * 100) : 0}%
                </div>
                <p className="text-[10px] text-slate-500 mt-2">Ratio of approved projects vs total submissions.</p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">Active Research Pipelines</h4>
                <div className="text-2xl font-extrabold text-slate-900 font-mono">
                  {totalProposals}
                </div>
                <p className="text-[10px] text-slate-500 mt-2">Proposals written by local registered students.</p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">Secured Industry Placements</h4>
                  <div className="text-2xl font-extrabold text-emerald-600 font-mono">
                    {approvedProposals}
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 mt-2">Direct solutions validated and pre-approved by heavy industry partners.</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-1.5 font-display">
                <BarChart3 className="w-4.5 h-4.5 text-orange-500" /> Academic Industry Collaboration Audit
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-6 font-sans">
                This matrix serves as the annual reporting output submitted to the CII board. It demonstrates university researcher capabilities on solving live, non-simulated enterprise roadblocks.
              </p>

              <div className="space-y-4 text-xs font-sans">
                <div className="flex justify-between border-b border-slate-150 py-2">
                  <span className="font-semibold text-slate-700">Participating Department Solver Concentration:</span>
                  <span className="text-slate-950 font-bold font-display">Computer Science & Electronics</span>
                </div>
                <div className="flex justify-between border-b border-slate-150 py-2">
                  <span className="font-semibold text-slate-700">Total Solvers Registered under {currentUser.institutionName}:</span>
                  <span className="text-slate-950 font-bold font-mono">{students.length}</span>
                </div>
                <div className="flex justify-between border-b border-slate-150 py-2">
                  <span className="font-semibold text-slate-700">Proposals Approved:</span>
                  <span className="text-emerald-600 font-extrabold font-mono">{approvedProposals}</span>
                </div>
                <div className="flex justify-between border-b border-slate-150 py-2">
                  <span className="font-semibold text-slate-700">Proposals Pending Feedback:</span>
                  <span className="text-slate-950 font-extrabold font-mono">{pendingProposals}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
