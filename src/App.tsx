import React, { useState, useEffect } from 'react';
import { User } from './types';
import RoleSwitcher from './components/RoleSwitcher';
import LandingPage from './components/LandingPage';
import LoginForm from './components/LoginForm';
import AdminDashboard from './components/AdminDashboard';
import IndustryDashboard from './components/IndustryDashboard';
import StudentDashboard from './components/StudentDashboard';
import InstitutionDashboard from './components/InstitutionDashboard';
import { LogOut, GraduationCap, Building2, Landmark, Shield, User as UserIcon, Clock, AlertCircle, XCircle, RefreshCcw } from 'lucide-react';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'login' | 'dashboard'>('landing');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Restore session from localStorage on boot
  const restoreSession = async () => {
    setAuthLoading(true);
    const savedUserId = localStorage.getItem('ciisic_userId');
    
    if (savedUserId) {
      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${savedUserId}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setCurrentUser(data.user);
          setCurrentPage('dashboard');
        } else {
          // Stale session
          localStorage.removeItem('ciisic_userId');
        }
      } catch (e) {
        console.error('Session restoration failed', e);
      }
    }
    setAuthLoading(false);
  };

  useEffect(() => {
    restoreSession();
  }, []);

  const handleLoginSuccess = (token: string, user: any) => {
    localStorage.setItem('ciisic_userId', token);
    setCurrentUser(user);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('ciisic_userId');
    setCurrentUser(null);
    setCurrentPage('landing');
  };

  const handleQuickLogin = async (email: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        handleLoginSuccess(data.token, data.user);
      } else {
        alert(data.error || 'Quick Login Failed');
      }
    } catch (e) {
      console.error('Quick Login failure', e);
    }
  };

  const handleRefreshMe = async () => {
    const savedUserId = localStorage.getItem('ciisic_userId');
    if (savedUserId) {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${savedUserId}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      }
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-t-orange-500 border-slate-700 rounded-full animate-spin"></div>
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">Loading CIISIC Platform Secure Portal...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Interactive Role Switcher at the very top */}
      <RoleSwitcher
        currentUser={currentUser}
        onSwitchUser={handleQuickLogin}
        onLogout={handleLogout}
      />

      {/* Main Platform Header */}
      <nav className="bg-white border-b border-slate-200 py-3.5 px-6 shadow-sm sticky top-[41px] z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setCurrentPage('landing')}>
            <div className="bg-slate-900 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm tracking-tight border border-slate-800">
              CII
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 uppercase tracking-wide leading-none font-display">CIISIC Platform</h1>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mt-0.5 font-mono">Innovation & Startup Cell</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {currentPage === 'landing' && (
              <button
                id="header-nav-login"
                onClick={() => setCurrentPage('login')}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-1.5 px-4 rounded text-xs uppercase tracking-wider transition font-display cursor-pointer shadow-sm"
              >
                Platform Sign In
              </button>
            )}

            {currentPage === 'login' && (
              <button
                id="header-nav-landing"
                onClick={() => setCurrentPage('landing')}
                className="text-xs text-slate-600 hover:text-orange-500 transition-colors font-bold uppercase tracking-wider font-display cursor-pointer"
              >
                Back to Website
              </button>
            )}

            {currentUser && currentPage === 'dashboard' && (
              <div className="flex items-center gap-4 text-xs">
                {/* Active Role Label with subtle Icon */}
                <span className="hidden sm:inline-flex items-center gap-1.5 bg-slate-50 border border-slate-250 text-slate-700 font-semibold px-2.5 py-1 rounded">
                  {currentUser.role === 'student' && <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />}
                  {currentUser.role === 'industry' && <Building2 className="w-3.5 h-3.5 text-blue-600" />}
                  {currentUser.role === 'institution' && <Landmark className="w-3.5 h-3.5 text-orange-500" />}
                  {currentUser.role === 'admin' && <Shield className="w-3.5 h-3.5 text-orange-500" />}
                  <span className="text-[9px] uppercase font-bold tracking-wider font-mono">{currentUser.role}</span>
                </span>

                <button
                  id="header-logout-btn"
                  onClick={handleLogout}
                  className="bg-slate-50 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 text-slate-600 font-bold py-1.5 px-3 rounded border border-slate-200 transition flex items-center gap-1.5 text-xs font-display uppercase tracking-wider cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Pages Router */}
      <main className="flex-1">
        {currentPage === 'landing' && (
          <LandingPage
            onLoginClick={() => setCurrentPage('login')}
            onQuickLogin={handleQuickLogin}
          />
        )}

        {currentPage === 'login' && (
          <LoginForm
            onLoginSuccess={handleLoginSuccess}
            onBackToLanding={() => setCurrentPage('landing')}
          />
        )}

        {currentPage === 'dashboard' && currentUser && (
          <div className="animate-fade-in">
            {currentUser.role === 'admin' && (
              <AdminDashboard currentUser={currentUser} />
            )}

            {/* SPOC Registration Verification Gate */}
            {((currentUser.role === 'industry' || currentUser.role === 'institution') && 
              currentUser.approvalStatus !== 'approved') ? (
                <div className="max-w-xl mx-auto px-6 py-12">
                  <div className="bg-white rounded-2xl border border-slate-250 shadow-xl overflow-hidden p-8 text-center font-sans">
                    {/* Status Icons */}
                    {currentUser.approvalStatus === 'pending' && (
                      <div className="mx-auto w-16 h-16 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-center text-amber-600 mb-6 animate-pulse">
                        <Clock className="w-8 h-8 animate-spin-slow" />
                      </div>
                    )}
                    {currentUser.approvalStatus === 'revision_requested' && (
                      <div className="mx-auto w-16 h-16 bg-orange-50 rounded-2xl border border-orange-200 flex items-center justify-center text-orange-600 mb-6">
                        <AlertCircle className="w-8 h-8" />
                      </div>
                    )}
                    {currentUser.approvalStatus === 'rejected' && (
                      <div className="mx-auto w-16 h-16 bg-rose-50 rounded-2xl border border-rose-200 flex items-center justify-center text-rose-600 mb-6">
                        <XCircle className="w-8 h-8" />
                      </div>
                    )}

                    <h2 className="text-xl font-bold text-slate-900 font-display">
                      {currentUser.approvalStatus === 'pending' && 'Registration Under Review'}
                      {currentUser.approvalStatus === 'revision_requested' && 'Information Revision Requested'}
                      {currentUser.approvalStatus === 'rejected' && 'Registration Request Declined'}
                    </h2>

                    <p className="text-xs text-slate-500 font-mono uppercase tracking-wider mt-1">
                      {currentUser.role === 'industry' ? 'Industry SPOC Portal' : 'Institution SPOC Portal'} • ID: {currentUser.id}
                    </p>

                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-150 text-left my-6 text-xs text-slate-600 space-y-3">
                      <div>
                        <span className="font-bold text-slate-800 block mb-0.5">Submitted Affiliation:</span>
                        <p className="font-medium text-slate-700">
                          {currentUser.companyName || currentUser.institutionName || 'CII Member Entity'}
                        </p>
                      </div>

                      {currentUser.approvalStatus === 'pending' && (
                        <div>
                          <span className="font-bold text-slate-800 block mb-0.5">Next Steps:</span>
                          <p className="leading-relaxed">
                            Your account request has been successfully queued for manual verification by the CII Super Administrator. Your email and corporate affiliation are currently being vetted against member cell records.
                          </p>
                        </div>
                      )}

                      {currentUser.approvalStatus === 'revision_requested' && (
                        <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg text-orange-950">
                          <span className="font-bold block mb-1">Feedback from Super Administrator:</span>
                          <p className="italic leading-relaxed font-medium">
                            "{currentUser.moreInfoComment || 'Please provide updated official identification documents.'}"
                          </p>
                          <p className="mt-2.5 text-[11px] leading-relaxed opacity-90">
                            To update your registration or submit requested documents, please reply directly or send them to <strong className="font-bold">secretariat@ciisic.org</strong> mentioning your Email: <span className="font-mono underline">{currentUser.email}</span>.
                          </p>
                        </div>
                      )}

                      {currentUser.approvalStatus === 'rejected' && (
                        <div className="bg-rose-50 border border-rose-150 p-4 rounded-lg text-rose-950 font-medium">
                          <span className="font-bold block mb-1">Decline Reason:</span>
                          <p className="italic leading-relaxed font-medium">
                            "{currentUser.rejectionReason || 'The corporate domain could not be verified in our registry.'}"
                          </p>
                          <p className="mt-2.5 text-[11px] leading-relaxed opacity-90">
                            If you believe this is an error or wish to dispute this evaluation, please contact the CII executive cell at <strong className="font-bold">support@ciisic.org</strong>.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={handleRefreshMe}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-5 rounded-lg text-xs flex items-center gap-2 transition font-display uppercase tracking-wider cursor-pointer shadow-sm"
                      >
                        <RefreshCcw className="w-3.5 h-3.5 animate-spin-hover" /> Check Status
                      </button>
                      <button
                        onClick={handleLogout}
                        className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold py-2.5 px-5 rounded-lg text-xs flex items-center gap-2 transition font-display uppercase tracking-wider cursor-pointer shadow-sm"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Log Out
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {currentUser.role === 'industry' && (
                    <IndustryDashboard currentUser={currentUser} />
                  )}
                  {currentUser.role === 'institution' && (
                    <InstitutionDashboard currentUser={currentUser} />
                  )}
                </>
              )}
            {currentUser.role === 'student' && (
              <StudentDashboard currentUser={currentUser} onRefreshMe={handleRefreshMe} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
