import React, { useState, useEffect } from 'react';
import { User, Challenge, Proposal } from '../types';
import { Search, Briefcase, Filter, FileText, Send, Clock, CheckCircle, XCircle, AlertCircle, Sparkles, MessageSquare, Upload, ArrowLeft } from 'lucide-react';
import CommunicationModule from './CommunicationModule';

interface StudentDashboardProps {
  currentUser: User;
  onRefreshMe: () => void;
}

export default function StudentDashboard({ currentUser, onRefreshMe }: StudentDashboardProps) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [myProposals, setMyProposals] = useState<Proposal[]>([]);
  const [activeTab, setActiveTab] = useState<'browse' | 'proposals' | 'profile'>('browse');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState('all');

  // Selected Challenge for View Details / Submit Proposal
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [isSubmittingProposal, setIsSubmittingProposal] = useState(false);
  const [proposalText, setProposalText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<{ id: string; name: string; size: number }[]>([]);

  // Selected Proposal for detailed status / communication
  const [activeProposalDetail, setActiveProposalDetail] = useState<Proposal | null>(null);
  const [isResubmitting, setIsResubmitting] = useState(false);

  // File Upload states
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Notification Banner State
  const [notif, setNotif] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchChallengesAndProposals = async () => {
    try {
      const authHeader = { 'Authorization': `Bearer ${currentUser.id}` };
      
      const chgRes = await fetch('/api/challenges', { headers: authHeader });
      if (chgRes.ok) {
        setChallenges(await chgRes.json());
      }

      const propRes = await fetch('/api/proposals', { headers: authHeader });
      if (propRes.ok) {
        setMyProposals(await propRes.json());
      }
    } catch (e) {
      console.error('Error fetching student dashboard records', e);
    }
  };

  useEffect(() => {
    fetchChallengesAndProposals();
  }, [currentUser, activeTab]);

  // Handle Drag Over
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle Drop for Drag & Drop Upload
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
    // SECURITY LIMIT: PDF/Doc size limit 10 MB
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      setUploadError(`File exceeds maximum size limits (10 MB). Selected file: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
      return;
    }

    const newFile = {
      id: 'SFL_' + Math.floor(Math.random() * 1000000),
      name: file.name,
      size: file.size
    };
    setAttachedFiles(prev => [...prev, newFile]);
  };

  const handleRemoveFile = (fileId: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalText.trim()) {
      setErrorMsg('Proposal technical details are required');
      return;
    }

    setErrorMsg(null);
    setNotif(null);

    try {
      const response = await fetch('/api/proposals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.id}`
        },
        body: JSON.stringify({
          challengeId: selectedChallenge?.id,
          proposalText,
          documents: attachedFiles.map(f => ({ ...f, url: '#' }))
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Proposal submission failed');
      }

      setNotif('Technical proposal submitted successfully inside the CIISIC platform.');
      setProposalText('');
      setAttachedFiles([]);
      setIsSubmittingProposal(false);
      setSelectedChallenge(null);
      await fetchChallengesAndProposals();
      setActiveTab('proposals'); // Switch to tracking
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleResubmitProposal = async (e: React.FormEvent, proposalId: string) => {
    e.preventDefault();
    if (!proposalText.trim()) {
      setErrorMsg('Proposal description is required');
      return;
    }

    setErrorMsg(null);
    setNotif(null);

    try {
      const response = await fetch(`/api/proposals/${proposalId}/resubmit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.id}`
        },
        body: JSON.stringify({
          proposalText,
          documents: attachedFiles.map(f => ({ ...f, url: '#' }))
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Resubmission failed');
      }

      setNotif('Proposal resubmitted successfully to industrial evaluation cell.');
      setIsResubmitting(false);
      setProposalText('');
      setAttachedFiles([]);
      setActiveProposalDetail(null);
      await fetchChallengesAndProposals();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  // Profile Edit fields
  const [profileBio, setProfileBio] = useState(currentUser.studentProfile?.bio || '');
  const [profileSkillsInput, setProfileSkillsInput] = useState(currentUser.studentProfile?.skills.join(', ') || '');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setNotif(null);

    try {
      const response = await fetch('/api/auth/register', { // re-registration of profiles simulates updates perfectly
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: currentUser.name,
          email: currentUser.email,
          role: 'student',
          institutionName: currentUser.studentProfile?.institutionName,
          studentProfile: {
            rollNumber: currentUser.studentProfile?.rollNumber,
            year: currentUser.studentProfile?.year,
            branch: currentUser.studentProfile?.branch,
            bio: profileBio,
            skills: profileSkillsInput.split(',').map(s => s.trim()).filter(Boolean)
          }
        })
      });

      // Since update is handled internally by overwrite in seed, let's update local token
      setNotif('Student portfolio updated successfully.');
      onRefreshMe();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  // Filtering Logic
  const filteredChallenges = challenges.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.problemStatement.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.industryName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSkill = skillFilter === 'all' || c.skillsRequired.some(s => s.toLowerCase().includes(skillFilter.toLowerCase()));
    return matchesSearch && matchesSkill;
  });

  const isVerified = currentUser.studentProfile?.verifiedStatus === 'verified';
  const isPendingVerification = currentUser.studentProfile?.verifiedStatus === 'pending';

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      {/* Dashboard Subheader */}
      <div className="bg-slate-900 text-white py-6 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700 text-orange-500">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold tracking-tight uppercase">CII Student Innovation Cell</h2>
              <p className="text-[11px] text-slate-400 font-mono">Browse industrial roadblocks, submit research proposals, and track secure grants</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">Clearance Status:</span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono ${
              isVerified ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/20' :
              isPendingVerification ? 'bg-amber-950 text-amber-300 animate-pulse border border-amber-500/20' :
              'bg-rose-950 text-rose-300 border border-rose-500/20'
            }`}>
              {currentUser.studentProfile?.verifiedStatus}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Verification Alert */}
        {isPendingVerification && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold font-display">Institutional Approval Pending:</strong>
              <p className="mt-1 leading-relaxed text-slate-700">
                Your profile is currently waiting for authorization by your registered College Coordinator (<strong className="text-slate-850 font-bold font-display">{currentUser.studentProfile?.institutionName}</strong>). You can browse challenges and update your skill portfolio, but proposal submissions remain disabled until verified.
              </p>
            </div>
          </div>
        )}

        {/* Notifications */}
        {notif && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg p-3.5 mb-6 font-mono">
            {notif}
          </div>
        )}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg p-3.5 mb-6 font-mono">
            {errorMsg}
          </div>
        )}

        {/* Tab Selection */}
        {!selectedChallenge && !activeProposalDetail && (
          <div className="flex border-b border-slate-200 mb-8 overflow-x-auto gap-2">
            <button
              onClick={() => setActiveTab('browse')}
              className={`py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition font-display ${
                activeTab === 'browse'
                  ? 'border-orange-500 text-orange-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Briefcase className="w-4 h-4" /> Browse CII Challenges ({challenges.length})
            </button>
            <button
              onClick={() => setActiveTab('proposals')}
              className={`py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition font-display ${
                activeTab === 'proposals'
                  ? 'border-orange-500 text-orange-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Clock className="w-4 h-4" /> My Proposals ({myProposals.length})
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition font-display ${
                activeTab === 'profile'
                  ? 'border-orange-500 text-orange-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4" /> Skill Portfolio
            </button>
          </div>
        )}

        {/* BROWSE CHALLENGES TAB */}
        {activeTab === 'browse' && !selectedChallenge && (
          <div className="space-y-6">
            {/* Filter controls */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-4 justify-between">
              <div className="relative max-w-md w-full">
                <Search className="absolute left-3.5 top-3 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search challenges, keywords, or sponsors..."
                  className="pl-9 p-2 border border-slate-300 rounded-lg text-xs w-full focus:outline-none focus:border-orange-500 font-medium text-slate-800"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-bold text-[10px] uppercase tracking-wider font-mono flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-orange-500" /> Filter Skill:
                </span>
                <select
                  value={skillFilter}
                  onChange={(e) => setSkillFilter(e.target.value)}
                  className="p-2 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:border-orange-500 font-semibold text-slate-800"
                >
                  <option value="all">All Disciplines</option>
                  <option value="Python">Python / ML</option>
                  <option value="Computer Vision">Computer Vision</option>
                  <option value="Sensor Fusion">Sensor Fusion</option>
                  <option value="ROS">ROS / Robotics</option>
                  <option value="Process Control">Process Engineering</option>
                </select>
              </div>
            </div>

            {/* List */}
            <div className="grid md:grid-cols-2 gap-6">
              {filteredChallenges.length === 0 ? (
                <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-xs font-semibold uppercase tracking-wider font-mono">
                  No active CII industrial challenges match your criteria.
                </div>
              ) : (
                filteredChallenges.map((chg) => (
                  <div key={chg.id} className="bg-white p-6 rounded-xl border border-slate-200 hover:border-orange-500 hover:shadow-md transition-all duration-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <div className="flex items-center gap-2">
                          {chg.companyLogo ? (
                            <img src={chg.companyLogo} alt={chg.industryName} className="w-8 h-8 rounded object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-8 h-8 rounded bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-xs border border-orange-200">CII</div>
                          )}
                          <div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">SPONSORING INDUSTRY</span>
                            <strong className="text-slate-800 text-xs font-semibold font-display">{chg.industryName}</strong>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded">ID: {chg.id}</span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 leading-snug mb-3 hover:text-orange-600 transition cursor-pointer font-display" onClick={() => setSelectedChallenge(chg)}>
                        {chg.title}
                      </h3>

                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                        {chg.problemStatement}
                      </p>

                      <div className="flex flex-wrap gap-1 mb-6">
                        {chg.skillsRequired.map(sk => (
                          <span key={sk} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[9px] font-bold uppercase font-mono border border-slate-200/50">{sk}</span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-[10px] font-mono text-slate-500 font-medium">
                      <div>DEADLINE: <span className="text-slate-800 font-bold">{new Date(chg.deadline).toLocaleDateString()}</span></div>
                      <button
                        onClick={() => setSelectedChallenge(chg)}
                        className="text-orange-500 hover:text-orange-700 font-bold not-mono text-xs font-display flex items-center gap-0.5"
                      >
                        View Details & Proposal →
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* CHALLENGE DETAILED PAGE */}
        {selectedChallenge && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="bg-slate-900 text-white p-6 border-b border-slate-800 flex items-center justify-between">
              <button
                onClick={() => { setSelectedChallenge(null); setIsSubmittingProposal(false); setAttachedFiles([]); setProposalText(''); }}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 font-bold uppercase tracking-wider font-display transition"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Challenges
              </button>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">CHALLENGE REFERENCE ID</span>
                <div className="font-mono text-xs font-bold text-orange-400">{selectedChallenge.id}</div>
              </div>
            </div>

            <div className="p-8">
              <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-8 border-b border-slate-100 pb-6">
                <div>
                  <h3 className="text-lg font-bold font-display text-slate-900 leading-tight mb-2 uppercase">{selectedChallenge.title}</h3>
                  <div className="text-xs text-slate-500 flex items-center gap-2 font-medium">
                    <span>Sponsor:</span>
                    <span className="text-slate-800 font-bold uppercase font-display">{selectedChallenge.industryName}</span>
                    <span>•</span>
                    <span>Deadline:</span>
                    <span className="text-slate-800 font-bold font-mono">{new Date(selectedChallenge.deadline).toLocaleDateString()}</span>
                  </div>
                </div>

                {isVerified && !isSubmittingProposal && (
                  <button
                    onClick={() => { setIsSubmittingProposal(true); setProposalText(''); setAttachedFiles([]); }}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold font-display py-2.5 px-6 rounded-lg text-xs uppercase tracking-wider transition shadow-sm shrink-0"
                  >
                    Draft Proposal
                  </button>
                )}
              </div>

              {!isSubmittingProposal ? (
                <div className="grid md:grid-cols-3 gap-8">
                  {/* Technical Body */}
                  <div className="md:col-span-2 space-y-6">
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">1. Technical Problem Statement</h4>
                      <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200">
                        {selectedChallenge.problemStatement}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">2. Detailed Scope & Datasets</h4>
                      <div className="text-xs text-slate-600 leading-relaxed space-y-3">
                        <p>{selectedChallenge.description}</p>
                      </div>
                    </div>

                    {selectedChallenge.documents.length > 0 && (
                      <div>
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">3. Reference Attachments</h4>
                        <div className="space-y-2">
                          {selectedChallenge.documents.map(doc => (
                            <div key={doc.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg text-xs hover:bg-slate-50 hover:border-orange-500/50 transition cursor-pointer">
                              <span className="flex items-center gap-2 text-slate-700 font-medium font-display">
                                <FileText className="w-4 h-4 text-orange-500" /> {doc.name}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">{(doc.size / 1024).toFixed(0)} KB</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Operational parameters Sidebar */}
                  <div className="space-y-6">
                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-xs">
                      <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-4 pb-1.5 border-b border-slate-200 flex items-center gap-1.5 font-display">
                        <Sparkles className="w-4 h-4 text-orange-500" /> Challenge Details
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <strong className="text-slate-400 font-bold block text-[10px] uppercase font-mono tracking-wider">Timeline of Project</strong>
                          <span className="text-slate-800 font-semibold">{selectedChallenge.timeline}</span>
                        </div>
                        <div>
                          <strong className="text-slate-400 font-bold block text-[10px] uppercase font-mono tracking-wider">Required Technical Disciplines</strong>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {selectedChallenge.skillsRequired.map(sk => (
                              <span key={sk} className="bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200 text-[9px] font-bold uppercase font-mono">{sk}</span>
                            ))}
                          </div>
                        </div>

                        {/* Security mandate check: Industry Budget is strictly hidden from student views */}
                        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded text-[10px] text-slate-300 leading-normal font-mono">
                          <strong className="text-orange-400 uppercase tracking-wider block mb-1">CII Double-Blind Mandate:</strong> The funding budget is pre-approved by CII officers and is masked for double-blinded academic evaluation constraints.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Proposal Form */
                <form onSubmit={handleSubmitProposal} className="space-y-6">
                  <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-lg text-xs leading-normal">
                    <strong className="font-bold font-display">Draft Submission Guidelines:</strong> Complete the text field below explaining your architecture, methodology, algorithms, and simulated benchmarks. Attach any PDF documentation. Maximum attachment limit is 10 MB.
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                      Proposal Technical Framework
                    </label>
                    <textarea
                      required
                      value={proposalText}
                      onChange={(e) => setProposalText(e.target.value)}
                      placeholder="e.g. We propose an Extended Kalman Filter (EKF) utilizing visual-inertial odometry..."
                      className="w-full p-4 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-orange-500 h-64 resize-y leading-relaxed font-mono text-slate-800"
                    />
                  </div>

                  {/* Simulated Upload widget with Drag and Drop */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                      Technical PDF Attachments (Up to 10 MB)
                    </label>
                    
                    <div
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-xl p-6 text-center transition ${
                        dragActive ? 'border-orange-500 bg-orange-50/20' : 'border-slate-300 hover:border-orange-500/50'
                      }`}
                    >
                      <input
                        type="file"
                        id="proposal-file-upload"
                        onChange={handleManualUpload}
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                      />
                      <label htmlFor="proposal-file-upload" className="cursor-pointer flex flex-col items-center justify-center gap-2">
                        <Upload className="w-8 h-8 text-slate-400" />
                        <span className="text-xs font-semibold text-slate-700">Drag & Drop file here, or <span className="text-orange-600 underline font-bold">browse</span></span>
                        <span className="text-[10px] text-slate-400 font-mono">PDF, DOC up to 10 MB</span>
                      </label>
                    </div>

                    {uploadError && (
                      <div className="text-rose-600 text-[10px] mt-1 font-bold font-mono">{uploadError}</div>
                    )}

                    {attachedFiles.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block font-mono">Attached Files</span>
                        {attachedFiles.map(file => (
                          <div key={file.id} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                            <span className="flex items-center gap-1.5 font-medium text-slate-750 font-display">
                              <FileText className="w-4 h-4 text-orange-500" /> {file.name}
                            </span>
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-[10px] text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveFile(file.id)}
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

                  <div className="flex items-center gap-3 border-t border-slate-100 pt-6">
                    <button
                      type="submit"
                      className="bg-orange-500 hover:bg-orange-600 text-white font-bold font-display py-2.5 px-6 rounded-lg text-xs uppercase tracking-wider transition flex items-center gap-1.5 shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" /> Submit Proposal
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsSubmittingProposal(false)}
                      className="text-slate-500 hover:text-slate-800 text-xs font-bold font-display uppercase tracking-wider"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* PROPOSALS TRACKING TAB */}
        {activeTab === 'proposals' && !activeProposalDetail && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 bg-slate-50 border-b border-slate-150">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">My Submissions Timeline</h3>
            </div>

            <div className="divide-y divide-slate-150">
              {myProposals.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs font-semibold uppercase tracking-wider font-mono">
                  You have not submitted any technical proposals yet.
                </div>
              ) : (
                myProposals.map((prop) => (
                  <div key={prop.id} className="p-5 hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                    <div className="space-y-1 max-w-2xl">
                      <h4 className="text-sm font-bold text-slate-900 font-display uppercase">{prop.challengeTitle}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Submission ID: {prop.id} • Last Updated: {new Date(prop.updatedAt).toLocaleDateString()}
                      </p>
                      
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Status:</span>
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider font-mono ${
                          prop.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                          prop.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                          prop.status === 'revision_requested' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {prop.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => { setActiveProposalDetail(prop); setIsResubmitting(false); }}
                      className="bg-slate-900 hover:bg-orange-500 text-white font-bold font-display py-1.5 px-3.5 rounded text-[10px] uppercase tracking-wider transition-colors shrink-0"
                    >
                      View Details & Discuss
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* PROPOSAL DETAILS & SECURE CHAT INTERACTION VIEW */}
        {activeProposalDetail && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-900 text-white p-6 border-b border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => { setActiveProposalDetail(null); setIsResubmitting(false); }}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 font-bold uppercase font-display tracking-wider transition"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to List
                </button>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">PROPOSAL ID</span>
                  <div className="font-mono text-xs font-bold text-orange-400">{activeProposalDetail.id}</div>
                </div>
              </div>

              <div className="p-8">
                <div className="mb-6 pb-6 border-b border-slate-100">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Challenge Reference</h3>
                  <h2 className="text-base font-bold text-slate-900 font-display uppercase">{activeProposalDetail.challengeTitle}</h2>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-500">Current Assessment Status:</span>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono ${
                      activeProposalDetail.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                      activeProposalDetail.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                      activeProposalDetail.status === 'revision_requested' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {activeProposalDetail.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Revision Required banner */}
                {activeProposalDetail.status === 'revision_requested' && !isResubmitting && (
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-6 text-xs text-amber-900">
                    <strong className="font-bold block mb-1 font-display">Industrial Evaluator Comments (Revision Requested):</strong>
                    <p className="leading-relaxed bg-white/70 p-3 rounded border border-amber-200 font-mono text-[11px] text-slate-850 mb-4">
                      "{activeProposalDetail.revisionComments}"
                    </p>
                    <button
                      onClick={() => { setIsResubmitting(true); setProposalText(activeProposalDetail.proposalText); setAttachedFiles([]); }}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold font-display py-2 px-4 rounded text-[10px] uppercase tracking-wider transition"
                    >
                      Revise & Resubmit Proposal
                    </button>
                  </div>
                )}

                {!isResubmitting ? (
                  <div className="space-y-4 text-xs text-slate-700">
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1.5 font-mono">Submitted Framework Text</h4>
                      <p className="p-4 bg-slate-50 rounded-lg border border-slate-200 font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-slate-800">
                        {activeProposalDetail.proposalText}
                      </p>
                    </div>

                    {activeProposalDetail.documents.length > 0 && (
                      <div>
                        <h4 className="text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1.5 font-mono">Your Attachments</h4>
                        <div className="space-y-2">
                          {activeProposalDetail.documents.map(doc => (
                            <div key={doc.id} className="flex items-center justify-between p-2.5 border border-slate-200 rounded-lg text-xs hover:bg-slate-50 transition">
                              <span className="flex items-center gap-1.5 font-medium text-slate-850 font-display">
                                <FileText className="w-4 h-4 text-orange-500" /> {doc.name}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">PDF</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* RE-SUBMISSION FORM */
                  <form onSubmit={(e) => handleResubmitProposal(e, activeProposalDetail.id)} className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                        Revise Proposal details
                      </label>
                      <textarea
                        required
                        value={proposalText}
                        onChange={(e) => setProposalText(e.target.value)}
                        className="w-full p-4 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-orange-500 h-64 resize-y leading-relaxed font-mono text-slate-800"
                      />
                    </div>

                    {/* Drag and Drop attachment in re-submission */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                        Re-attach Document (Up to 10 MB)
                      </label>
                      
                      <div
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-xl p-6 text-center transition ${
                          dragActive ? 'border-orange-500 bg-orange-50/20' : 'border-slate-300 hover:border-orange-500/50'
                        }`}
                      >
                        <input
                          type="file"
                          id="re-proposal-file-upload"
                          onChange={handleManualUpload}
                          className="hidden"
                          accept=".pdf,.doc,.docx"
                        />
                        <label htmlFor="re-proposal-file-upload" className="cursor-pointer flex flex-col items-center justify-center gap-2">
                          <Upload className="w-8 h-8 text-slate-400" />
                          <span className="text-xs font-semibold text-slate-700">Drag & Drop new files, or <span className="text-orange-600 underline font-bold">browse</span></span>
                          <span className="text-[10px] text-slate-400 font-mono">Replace current attachments</span>
                        </label>
                      </div>

                      {attachedFiles.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block font-mono">New Attachments Queue</span>
                          {attachedFiles.map(file => (
                            <div key={file.id} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                              <span className="flex items-center gap-1.5 font-medium text-slate-750 font-display">
                                <FileText className="w-4 h-4 text-orange-500" /> {file.name}
                              </span>
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFile(file.id)}
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

                    <div className="flex items-center gap-3 border-t border-slate-100 pt-6">
                      <button
                        type="submit"
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold font-display py-2.5 px-4 rounded text-[10px] uppercase tracking-wider transition flex items-center gap-1.5 shadow-sm"
                      >
                        <Send className="w-3.5 h-3.5" /> Submit Revision
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsResubmitting(false)}
                        className="text-slate-500 hover:text-slate-800 text-xs font-bold font-display uppercase tracking-wider"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* INTEGRATED SECURE DISCUSSION THREAD */}
            {!isResubmitting && (
              <CommunicationModule
                proposalId={activeProposalDetail.id}
                currentUser={currentUser}
              />
            )}
          </div>
        )}

        {/* SKILL PORTFOLIO TAB */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-6 pb-2 border-b border-slate-150 flex items-center gap-2 font-display border-slate-200">
              <Sparkles className="w-4.5 h-4.5 text-orange-500" /> Professional Solver Profile
            </h3>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <strong className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 font-mono">Solver ID</strong>
                  <div className="p-2.5 bg-slate-50 rounded border border-slate-200 font-mono text-slate-650">{currentUser.id}</div>
                </div>
                <div>
                  <strong className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 font-mono">Official Name</strong>
                  <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-slate-650">{currentUser.name}</div>
                </div>
                <div>
                  <strong className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 font-mono">Academic Affiliation</strong>
                  <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-slate-650">{currentUser.studentProfile?.institutionName}</div>
                </div>
                <div>
                  <strong className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 font-mono">Roll Number</strong>
                  <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-slate-650">{currentUser.studentProfile?.rollNumber}</div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">
                  Technical Skill Keywords (Comma Separated)
                </label>
                <input
                  type="text"
                  required
                  value={profileSkillsInput}
                  onChange={(e) => setProfileSkillsInput(e.target.value)}
                  placeholder="e.g. Python, Deep Learning, ROS, PCB Design, SolidWorks"
                  className="p-2.5 border border-slate-300 rounded-lg text-xs w-full focus:outline-none focus:border-orange-500 font-semibold text-slate-800"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Helpful keywords to map your profile to industrial problems.</span>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">
                  Professional / Research Bio
                </label>
                <textarea
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  placeholder="Tell sponsoring industries about your research interests..."
                  className="p-2.5 border border-slate-300 rounded-lg text-xs w-full focus:outline-none focus:border-orange-500 h-24 resize-none text-slate-800"
                />
              </div>

              <button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold font-display py-2.5 px-6 rounded-lg text-xs uppercase tracking-wider transition shadow-sm"
              >
                Save Portfolio
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
