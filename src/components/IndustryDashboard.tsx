import React, { useState, useEffect } from 'react';
import { User, Challenge, Proposal } from '../types';
import { Plus, Briefcase, FileText, CheckCircle, XCircle, AlertCircle, RefreshCw, Send, Sparkles, MessageSquare, ArrowLeft, Upload, Lock, ShieldAlert } from 'lucide-react';
import CommunicationModule from './CommunicationModule';

interface IndustryDashboardProps {
  currentUser: User;
}

export default function IndustryDashboard({ currentUser }: IndustryDashboardProps) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [activeTab, setActiveTab] = useState<'challenges' | 'proposals' | 'create'>('challenges');

  // Selected entities
  const [selectedChallengeDetail, setSelectedChallengeDetail] = useState<Challenge | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);

  // Create/Edit Challenge Form
  const [title, setTitle] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [description, setDescription] = useState('');
  const [timeline, setTimeline] = useState('3 Months');
  const [skillsRequired, setSkillsRequired] = useState('');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('2026-08-15');
  const [published, setPublished] = useState(true);
  const [documents, setDocuments] = useState<{ id: string; name: string; size: number }[]>([]);

  // Revision comments
  const [revisionComments, setRevisionComments] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // File Upload states
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Notification states
  const [notif, setNotif] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchIndustryData = async () => {
    try {
      const authHeader = { 'Authorization': `Bearer ${currentUser.id}` };

      const chgRes = await fetch('/api/challenges', { headers: authHeader });
      if (chgRes.ok) {
        setChallenges(await chgRes.json());
      }

      const propRes = await fetch('/api/proposals', { headers: authHeader });
      if (propRes.ok) {
        setProposals(await propRes.json());
      }
    } catch (e) {
      console.error('Error loading industrial datasets', e);
    }
  };

  useEffect(() => {
    fetchIndustryData();
  }, [currentUser, activeTab]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setUploadError(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleManualUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    // SECURITY LIMIT: Tech specification sheet up to 10 MB
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      setUploadError(`Technical specifications exceed limit (10 MB). Selected: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
      return;
    }

    const newDoc = {
      id: 'IDOC_' + Math.floor(Math.random() * 1000000),
      name: file.name,
      size: file.size
    };
    setDocuments(prev => [...prev, newDoc]);
  };

  const handleRemoveDoc = (docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
  };

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setNotif(null);

    if (!title || !problemStatement || !description || !deadline) {
      setErrorMsg('Please complete all mandatory challenge details.');
      return;
    }

    try {
      const response = await fetch('/api/challenges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.id}`
        },
        body: JSON.stringify({
          title,
          problemStatement,
          description,
          timeline,
          skillsRequired: skillsRequired.split(',').map(s => s.trim()).filter(Boolean),
          budget: budget ? Number(budget) : undefined,
          deadline,
          published,
          documents: documents.map(d => ({ ...d, url: '#' }))
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit challenge details.');
      }

      setNotif(`Challenge "${title}" registered successfully inside the CIISIC portal.`);
      setTitle('');
      setProblemStatement('');
      setDescription('');
      setSkillsRequired('');
      setBudget('');
      setDocuments([]);
      setActiveTab('challenges'); // Switch to tracking
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleUpdateProposalStatus = async (proposalId: string, status: 'approved' | 'rejected' | 'revision_requested') => {
    setActionLoading(true);
    setErrorMsg(null);
    setNotif(null);

    if (status === 'revision_requested' && !revisionComments.trim()) {
      setErrorMsg('Revision request comments are required.');
      setActionLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/proposals/${proposalId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.id}`
        },
        body: JSON.stringify({
          status,
          comments: status === 'revision_requested' ? revisionComments : undefined
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update proposal status.');
      }

      setNotif(`Proposal status successfully updated to "${status}".`);
      setRevisionComments('');
      setSelectedProposal(null); // Return to list
      await fetchIndustryData();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Stats calculation
  const totalChallengesCreated = challenges.length;
  const publishedChallenges = challenges.filter(c => c.published).length;
  const draftChallenges = challenges.filter(c => !c.published).length;

  const totalProposalsReceived = proposals.length;
  const pendingReviews = proposals.filter(p => p.status === 'pending').length;
  const approvedProposals = proposals.filter(p => p.status === 'approved').length;

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Dashboard Subheader */}
      <div className="bg-slate-900 text-white py-6 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500/10 p-2.5 rounded-xl border border-orange-500/20 text-orange-500">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight font-display uppercase">{currentUser.companyName} Industrial Portal</h2>
              <p className="text-xs text-slate-400">Post R&D hurdles, audit student solution bids, and approve research grants</p>
            </div>
          </div>
          <button
            onClick={fetchIndustryData}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2 px-4 rounded-lg text-xs flex items-center gap-1.5 transition font-display uppercase tracking-wider"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Records
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Alerts */}
        {notif && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg p-3.5 mb-6 font-mono font-bold uppercase tracking-wider">
            {notif}
          </div>
        )}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg p-3.5 mb-6 font-mono font-bold uppercase tracking-wider">
            {errorMsg}
          </div>
        )}

        {/* Tab Selection */}
        {!selectedChallengeDetail && !selectedProposal && (
          <div className="flex border-b border-slate-200 mb-8 overflow-x-auto gap-2">
            <button
              onClick={() => setActiveTab('challenges')}
              className={`py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition font-display ${
                activeTab === 'challenges'
                  ? 'border-orange-500 text-orange-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Briefcase className="w-4 h-4" /> Posted Challenges ({challenges.length})
            </button>
            <button
              onClick={() => setActiveTab('proposals')}
              className={`py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition font-display ${
                activeTab === 'proposals'
                  ? 'border-orange-500 text-orange-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <MessageSquare className="w-4 h-4" /> Received Proposals ({proposals.length})
            </button>
            <button
              onClick={() => { setActiveTab('create'); setTitle(''); setProblemStatement(''); setDescription(''); setBudget(''); setDocuments([]); }}
              className={`py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition font-display ${
                activeTab === 'create'
                  ? 'border-orange-500 text-orange-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Plus className="w-4 h-4" /> Post New Problem Statement
            </button>
          </div>
        )}

        {/* POSTED CHALLENGES TAB */}
        {activeTab === 'challenges' && !selectedChallengeDetail && (
          <div className="space-y-6">
            {/* Stat counts */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 font-mono">Total Problems Lodged</div>
                <div className="text-xl font-extrabold text-slate-900 font-display">{totalChallengesCreated}</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 font-mono">Published Solver Feeds</div>
                  <div className="text-xl font-extrabold text-orange-600 font-display">{publishedChallenges}</div>
                </div>
                <CheckCircle className="w-5 h-5 text-orange-500" />
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 font-mono font-mono">Draft Spec sheets</div>
                  <div className="text-xl font-extrabold text-slate-600 font-display">{draftChallenges}</div>
                </div>
                <AlertCircle className="w-5 h-5 text-slate-400" />
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 font-mono">Pending Proposals Assessment</div>
                  <div className="text-xl font-extrabold text-orange-600 animate-pulse font-display">{pendingReviews}</div>
                </div>
                <MessageSquare className="w-5 h-5 text-orange-500" />
              </div>
            </div>

            {/* List */}
            <div className="grid md:grid-cols-2 gap-6">
              {challenges.length === 0 ? (
                <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-xs font-semibold uppercase tracking-wider font-mono">
                  You have not created any technical challenges yet. Click the "Post New Problem" tab to start.
                </div>
              ) : (
                challenges.map((chg) => (
                  <div key={chg.id} className="bg-white p-6 rounded-xl border border-slate-200 hover:border-orange-500/50 transition-all duration-250 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4 gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wider uppercase ${
                          chg.published ? 'bg-orange-50 text-orange-700 border border-orange-100' : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {chg.published ? 'Published' : 'Draft'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 font-bold">ID: {chg.id}</span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 leading-snug mb-3 font-display">{chg.title}</h3>
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">{chg.problemStatement}</p>

                      <div className="flex flex-wrap gap-1 mb-6">
                        {chg.skillsRequired.map(sk => (
                          <span key={sk} className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[9px] font-semibold font-mono">{sk}</span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-[10px] font-mono text-slate-500 font-medium">
                      <div>Secret Budget: <span className="text-slate-800 font-bold font-mono">₹{chg.budget?.toLocaleString() || 'Not set'}</span></div>
                      <button
                        onClick={() => setSelectedChallengeDetail(chg)}
                        className="text-orange-500 hover:text-orange-600 font-bold not-mono text-xs font-display uppercase tracking-wider"
                      >
                        Review Specifications →
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* CHALLENGE SPEC REVIEW SUBPAGE */}
        {selectedChallengeDetail && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="bg-slate-900 text-white p-6 border-b border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setSelectedChallengeDetail(null)}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 font-bold transition font-display uppercase tracking-wider"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Challenges
              </button>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide font-mono">CHALLENGE REF ID</span>
                <div className="font-mono text-xs font-bold text-orange-400">{selectedChallengeDetail.id}</div>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase mb-2 inline-block ${
                  selectedChallengeDetail.published ? 'bg-orange-50 text-orange-700 border border-orange-100' : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  {selectedChallengeDetail.published ? 'Published' : 'Draft'}
                </span>
                <h2 className="text-lg font-bold text-slate-900 font-display">{selectedChallengeDetail.title}</h2>
                <p className="text-[10px] font-mono text-slate-400 mt-0.5">CREATED: {new Date(selectedChallengeDetail.createdAt).toLocaleDateString()}</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-4 text-xs text-slate-755">
                  <div>
                    <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono text-[10px]">Problem Statement</h4>
                    <p className="p-4 bg-slate-50 rounded-lg border border-slate-200 leading-relaxed font-semibold text-slate-800">{selectedChallengeDetail.problemStatement}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono text-[10px]">Scope description</h4>
                    <p className="leading-relaxed whitespace-pre-wrap text-slate-700 p-2">{selectedChallengeDetail.description}</p>
                  </div>
                </div>

                <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200 text-xs text-slate-600">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider pb-1.5 border-b border-slate-200 flex items-center gap-1 font-display">
                    <Lock className="w-4 h-4 text-orange-500" /> Administrative Metrics
                  </h4>
                  <div className="space-y-2.5">
                    <div>
                      <strong className="block text-[10px] text-slate-400 uppercase font-mono">Secret Research Budget</strong>
                      <span className="font-mono text-slate-900 font-bold text-sm">₹{selectedChallengeDetail.budget?.toLocaleString() || 'Not set'}</span>
                      <span className="text-[9px] text-slate-400 block mt-0.5 leading-tight italic">(Strict Privacy Constraint: Budget is hidden from all Student searches)</span>
                    </div>
                    <div>
                      <strong className="block text-[10px] text-slate-400 uppercase font-mono">Project Timeline</strong>
                      <span className="text-slate-800 font-bold">{selectedChallengeDetail.timeline}</span>
                    </div>
                    <div>
                      <strong className="block text-[10px] text-slate-400 uppercase font-mono">Skills Required</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedChallengeDetail.skillsRequired.map(sk => (
                          <span key={sk} className="bg-white text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 text-[9px] font-medium font-mono">{sk}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <strong className="block text-[10px] text-slate-400 uppercase font-mono">Solver Deadline</strong>
                      <span className="text-slate-800 font-bold">{new Date(selectedChallengeDetail.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RECEIVED PROPOSALS TAB */}
        {activeTab === 'proposals' && !selectedProposal && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 bg-slate-50 border-b border-slate-150">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-display">Solution Proposals Inbox</h3>
            </div>

            <div className="divide-y divide-slate-150 text-xs">
              {proposals.length === 0 ? (
                <div className="p-8 text-center text-slate-400 font-bold uppercase tracking-wider font-mono">
                  No student proposals have been submitted for your challenges yet.
                </div>
              ) : (
                proposals.map((prop) => (
                  <div key={prop.id} className="p-5 hover:bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider font-mono ${
                          prop.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          prop.status === 'rejected' ? 'bg-rose-50 text-rose-750 border border-rose-200' :
                          prop.status === 'revision_requested' ? 'bg-orange-50 text-orange-750 border border-orange-200' :
                          'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {prop.status.replace('_', ' ')}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 font-display">{prop.challengeTitle}</h4>
                      </div>

                      <div className="text-[10px] text-slate-400 font-bold font-mono flex items-center gap-2.5 flex-wrap">
                        <span>LODGED BY: <strong className="text-slate-700 font-bold">{prop.studentName}</strong></span>
                        <span>•</span>
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded text-[9px] font-bold flex items-center gap-0.5">
                          Status: Institution Verified ✓
                        </span>
                      </div>

                      <p className="text-slate-600 line-clamp-2 leading-relaxed">
                        {prop.proposalText}
                      </p>
                    </div>

                    <button
                      onClick={() => { setSelectedProposal(prop); setRevisionComments(''); }}
                      className="bg-slate-900 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded text-[10px] uppercase tracking-wider font-display transition shadow-sm shrink-0"
                    >
                      Audit Proposal & Interact
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* PROPOSAL DETAILED AUDIT AND MESSAGING MODULE */}
        {selectedProposal && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="bg-slate-900 text-white p-6 border-b border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => { setSelectedProposal(null); setRevisionComments(''); }}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 font-bold transition font-display uppercase tracking-wider"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Inbox
                </button>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide font-mono">PROPOSAL ID</span>
                  <div className="font-mono text-xs font-bold text-orange-400">{selectedProposal.id}</div>
                </div>
              </div>

              <div className="p-8">
                {/* Proposal Metadata */}
                <div className="mb-6 pb-6 border-b border-slate-100 grid md:grid-cols-3 gap-4 items-center">
                  <div className="md:col-span-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block font-mono">Challenge Targeted</span>
                    <h3 className="text-sm font-bold text-slate-900 font-display">{selectedProposal.challengeTitle}</h3>
                    
                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 mt-1.5 font-mono">
                      <span>LODGED BY: <strong className="text-slate-700 font-bold">{selectedProposal.studentName}</strong></span>
                      <span>•</span>
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded text-[9px] font-bold flex items-center gap-0.5">
                        Status: Institution Verified ✓
                      </span>
                    </div>
                  </div>

                  {/* Security Fences Reminder */}
                  <div className="bg-orange-50/20 border border-orange-500/20 rounded-xl p-4 text-[9px] text-orange-950 leading-normal flex items-start gap-2 shadow-sm">
                    <ShieldAlert className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                    <p>
                      <strong>Double-Blinded Integrity:</strong> Real student email addresses, telephone numbers, and profile photos are locked to secure academic-industrial compliance.
                    </p>
                  </div>
                </div>

                {/* Technical Proposal Body */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">Technical Feasibility Framework</h4>
                    <p className="p-4 bg-slate-50 rounded-lg border border-slate-200 font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-slate-800">
                      {selectedProposal.proposalText}
                    </p>
                  </div>

                  {selectedProposal.documents.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">Technical Attachments</h4>
                      <div className="space-y-2">
                        {selectedProposal.documents.map(doc => (
                          <div key={doc.id} className="flex items-center justify-between p-2.5 border border-slate-200 rounded-lg text-xs hover:bg-slate-50 transition">
                            <span className="flex items-center gap-1.5 font-semibold text-slate-800 font-display">
                              <FileText className="w-4 h-4 text-orange-500" /> {doc.name}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">PDF</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Decision Slider / Form */}
                  <div className="border-t border-slate-200 pt-6 space-y-4">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Evaluation Decisions</h4>

                    <div className="flex flex-wrap gap-2.5">
                      <button
                        onClick={() => handleUpdateProposalStatus(selectedProposal.id, 'approved')}
                        disabled={actionLoading}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold font-display py-2.5 px-5 rounded text-[10px] uppercase tracking-wider transition flex items-center gap-1.5 shadow-sm"
                      >
                        ✓ Approve and Fund Proposal
                      </button>
                      <button
                        onClick={() => handleUpdateProposalStatus(selectedProposal.id, 'rejected')}
                        disabled={actionLoading}
                        className="bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-200 font-bold py-2.5 px-5 rounded text-[10px] uppercase transition font-display tracking-wider"
                      >
                        Shelve Proposal
                      </button>
                    </div>

                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3.5">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">
                          Request Structured Revisions (Requires comments below)
                        </label>
                        <textarea
                          value={revisionComments}
                          onChange={(e) => setRevisionComments(e.target.value)}
                          placeholder="Please articulate details of technical updates or sensor fault redundancy questions..."
                          className="w-full p-2.5 border border-slate-300 bg-white rounded-lg text-xs focus:outline-none focus:border-orange-500 h-20 resize-none font-mono text-slate-800"
                        />
                      </div>
                      <button
                        onClick={() => handleUpdateProposalStatus(selectedProposal.id, 'revision_requested')}
                        disabled={actionLoading || !revisionComments.trim()}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold font-display py-2.5 px-5 rounded text-[10px] uppercase tracking-wider transition shadow-sm"
                      >
                        Request Technical Revision
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* INTEGRATED SECURE MESSAGE DISCUSSION WINDOW */}
            <CommunicationModule
              proposalId={selectedProposal.id}
              currentUser={currentUser}
            />
          </div>
        )}

        {/* CREATE CHALLENGE TAB */}
        {activeTab === 'create' && (
          <div className="max-w-3xl bg-white p-8 rounded-xl border border-slate-200 shadow-sm font-sans">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-6 pb-2 border-b border-slate-150 flex items-center gap-2 font-display">
              <Plus className="w-5 h-5 text-orange-500" /> Lodging Industrial Problem Statement
            </h3>

            <form onSubmit={handleCreateChallenge} className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                  Challenge Title (Mandatory)
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. AI-Based Blast Furnace Fuel/Air Mixture Optimization"
                  className="p-2.5 border border-slate-300 rounded-lg text-xs w-full focus:outline-none focus:border-orange-500 font-semibold text-slate-800 font-display"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                  1. Technical Problem Statement (Brief Summary - Mandatory)
                </label>
                <textarea
                  required
                  value={problemStatement}
                  onChange={(e) => setProblemStatement(e.target.value)}
                  placeholder="Summarize the core industrial challenge and the immediate roadblock..."
                  className="p-2.5 border border-slate-300 rounded-lg text-xs w-full focus:outline-none focus:border-orange-500 h-20 resize-none text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                  2. Detailed Scope & Expected Solver Deliverables (Mandatory)
                </label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please elaborate on technical parameters, parameters variables, reference equations..."
                  className="p-2.5 border border-slate-300 rounded-lg text-xs w-full focus:outline-none focus:border-orange-500 h-44 resize-y leading-relaxed text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                    Project Working Timeline
                  </label>
                  <select
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    className="p-2.5 border border-slate-300 rounded-lg bg-white w-full focus:outline-none focus:border-orange-500 font-semibold text-slate-800"
                  >
                    <option>1 Month</option>
                    <option>2 Months</option>
                    <option>3 Months</option>
                    <option>4 Months</option>
                    <option>6 Months</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                    Solver Submission Deadline (Mandatory)
                  </label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="p-2.5 border border-slate-300 rounded-lg w-full focus:outline-none focus:border-orange-500 font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                    Required Student Disciplines (Comma Separated)
                  </label>
                  <input
                    type="text"
                    required
                    value={skillsRequired}
                    onChange={(e) => setSkillsRequired(e.target.value)}
                    placeholder="e.g. Python, ROS, Computer Vision, Process Control"
                    className="p-2.5 border border-slate-300 rounded-lg w-full focus:outline-none focus:border-orange-500 font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                    Industrial Research Budget (INR - Confidential)
                  </label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="e.g. 600000"
                    className="p-2.5 border border-slate-300 rounded-lg w-full focus:outline-none focus:border-orange-500 font-mono text-slate-800 font-bold"
                  />
                  <span className="text-[9px] text-orange-650 font-bold font-mono mt-1 block">CONFIDENTIAL: Stripped on student challenge lookups.</span>
                </div>
              </div>

              {/* Specification manuals Upload */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                  Specification Manuals or Datasets description PDFs (Up to 10 MB)
                </label>
                
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-5 text-center transition ${
                    dragActive ? 'border-orange-500 bg-orange-50/20' : 'border-slate-300 hover:border-orange-500/50'
                  }`}
                >
                  <input
                    type="file"
                    id="spec-file-upload"
                    onChange={handleManualUpload}
                    className="hidden"
                    accept=".pdf,.csv,.xlsx"
                  />
                  <label htmlFor="spec-file-upload" className="cursor-pointer flex flex-col items-center justify-center gap-1.5">
                    <Upload className="w-7 h-7 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-700">Drag & Drop specification sheet, or <span className="text-orange-600 underline font-bold">browse</span></span>
                    <span className="text-[10px] text-slate-400 font-mono">PDF, CSV up to 10 MB</span>
                  </label>
                </div>

                {uploadError && (
                  <div className="text-rose-650 text-[10px] mt-1 font-mono font-bold uppercase">{uploadError}</div>
                )}

                {documents.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block font-mono">Attached Documents Specs</span>
                    {documents.map(file => (
                      <div key={file.id} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                        <span className="flex items-center gap-1.5 font-medium text-slate-750 font-display">
                          <FileText className="w-4 h-4 text-orange-500" /> {file.name}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-[10px] text-slate-400">{(file.size / 1024).toFixed(0)} KB</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveDoc(file.id)}
                            className="text-rose-600 hover:text-rose-800 text-[10px] font-bold uppercase font-mono"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Publish Options */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 font-display">Publish Immediately on Feed</h4>
                    <p className="text-[10px] text-slate-500 leading-normal mt-0.5">Toggle off to save challenge details as a Draft specification sheet.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                    className="w-4 h-4 text-orange-500 rounded border-slate-300 focus:ring-orange-500 focus:outline-none cursor-pointer"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold font-display py-3 px-6 rounded-lg text-xs uppercase tracking-wider transition shadow-sm cursor-pointer"
              >
                Register Challenge Specs
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
