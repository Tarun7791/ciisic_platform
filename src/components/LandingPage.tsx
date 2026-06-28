import React from 'react';
import { ArrowRight, ShieldCheck, Cpu, Users, GraduationCap, Building2, Landmark, HelpCircle } from 'lucide-react';

interface LandingPageProps {
  onLoginClick: () => void;
  onQuickLogin: (email: string) => void;
}

export default function LandingPage({ onLoginClick, onQuickLogin }: LandingPageProps) {
  const rolesInfo = [
    {
      title: 'Industry Partners',
      icon: Building2,
      desc: 'Post real-world technical hurdles, operational challenges, or R&D goals as structured problem statements. Gain access to elite vetted student talent across India\'s premier colleges.',
      benefits: ['Post Challenges & Track Progress', 'Strict Student Privacy Protection', 'Structured Discussion Threads', 'Review and Fund Winning Solutions'],
      email: 'tata@industry.com',
      btnLabel: 'Explore as Industry SPOC'
    },
    {
      title: 'Students & Startups',
      icon: GraduationCap,
      desc: 'Browse published challenges, download datasets, submit technical proposals, and secure funding or incubation. Collaborate with industry mentors directly in a closed portal.',
      benefits: ['Access Live Industrial Problems', 'Submit PDF Proposals', 'Receive Mentorship and Revisions', 'Secure Seed Funding and CII recognition'],
      email: 'student@ciisic.org',
      btnLabel: 'Explore as Student'
    },
    {
      title: 'Academic Institutions',
      icon: Landmark,
      desc: 'Register as college coordinators, verify your students\' official profiles, track project progression, and generate comprehensive industry collaboration reports.',
      benefits: ['Authorize Student Enrollment', 'Monitor Live Student Solutions', 'Oversee Academic Progress', 'Verify Local IP & Submissions'],
      email: 'iitb@edu.in',
      btnLabel: 'Explore as Institution SPOC'
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans">
      {/* Top Corporate Banner */}
      <div className="bg-slate-950 text-white py-2 px-4 text-center text-[10px] font-semibold tracking-widest border-b border-slate-900 uppercase">
        CONFEDERATION OF INDIAN INDUSTRY • INNOVATION & STARTUP INTERFACE CELL (CIISIC)
      </div>

      {/* Hero Section */}
      <header className="relative bg-white border-b border-slate-250/85 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#0f172a_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-28 flex flex-col lg:flex-row items-center justify-between gap-12 relative">
          <div className="max-w-2xl text-left">
            <div className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-700 px-3 py-1 rounded-md text-xs font-semibold tracking-wide uppercase mb-6 border border-orange-100 font-mono">
              <Cpu className="w-3.5 h-3.5 text-orange-500" /> Bridging Industry & Academia
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-slate-900 leading-tight mb-6">
              Co-Creating the Future of <span className="text-orange-500">Indian Innovation</span>
            </h1>
            <p className="text-base text-slate-600 leading-relaxed mb-8">
              The CII Innovation & Startup Interface Cell (CIISIC) is India's premier digital platform connecting heavy enterprise hurdles with academic solvers. Solve actual production bottlenecks, access seed grants, and drive localized technology sovereignty.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                id="landing-login-btn"
                onClick={onLoginClick}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold font-display px-6 py-3.5 rounded-lg shadow-sm hover:shadow-orange-200 transition-all flex items-center justify-center gap-2 text-sm"
              >
                Sign In to Platform <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="#how-it-works"
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-6 py-3.5 rounded-lg transition-all text-center text-sm font-display"
              >
                Learn More
              </a>
            </div>
          </div>

          <div className="bg-slate-900 text-white p-8 rounded-xl shadow-xl w-full max-w-md relative border border-slate-800">
            <div className="absolute -top-3.5 -right-3.5 bg-orange-500 text-white px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider shadow">
              Interactive Sandbox
            </div>
            <h3 className="text-base font-display font-bold mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-orange-500" /> Live Simulation Entrance
            </h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              For testing convenience, bypass credentials by choosing a stakeholder role below to load pre-seeded workflows.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => onQuickLogin('student@ciisic.org')}
                className="w-full text-left bg-slate-800/80 hover:bg-slate-850 p-3 rounded-lg border border-slate-700/60 hover:border-orange-500 transition-all group flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-orange-400 font-display">Student Portal</div>
                  <div className="text-[11px] text-slate-400 font-mono">Rahul Sharma • Student (IIT Bombay CSE)</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-orange-400 transition" />
              </button>

              <button
                onClick={() => onQuickLogin('tata@industry.com')}
                className="w-full text-left bg-slate-800/80 hover:bg-slate-850 p-3 rounded-lg border border-slate-700/60 hover:border-orange-500 transition-all group flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-orange-400 font-display">Industry SPOC Portal</div>
                  <div className="text-[11px] text-slate-400 font-mono">Sanjeev Nair • Industry SPOC (Tata Steel)</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-orange-400 transition" />
              </button>

              <button
                onClick={() => onQuickLogin('iitb@edu.in')}
                className="w-full text-left bg-slate-800/80 hover:bg-slate-850 p-3 rounded-lg border border-slate-700/60 hover:border-orange-500 transition-all group flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-orange-400 font-display">Institution SPOC Portal</div>
                  <div className="text-[11px] text-slate-400 font-mono">Prof. Anil • Institution SPOC (IIT Bombay Coordinator)</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-orange-400 transition" />
              </button>

              <button
                onClick={() => onQuickLogin('admin@ciisic.org')}
                className="w-full text-left bg-slate-800/80 hover:bg-slate-850 p-3 rounded-lg border border-slate-700/60 hover:border-orange-500 transition-all group flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-orange-400 font-display">Platform Admin Portal</div>
                  <div className="text-[11px] text-slate-400 font-mono">Dr. Ramesh Kumar • Platform Admin (CII Executive)</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-orange-400 transition" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mission & Vision */}
      <section className="py-16 bg-slate-100/50" id="how-it-works">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-10">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200/80">
            <h2 className="text-lg font-display font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center text-sm font-bold font-mono">1</span>
              Our Core Mission
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              To institutionalize collaborative synergy between heavy industrial groups, technology manufacturers, and elite research laboratories with top academic brains. We create localized sovereign technology answers, reducing imported supply chain dependencies and encouraging indigenous startup launches within universities.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200/80">
            <h2 className="text-lg font-display font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center text-sm font-bold font-mono">2</span>
              Our Strategic Vision
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              To position Indian engineering departments as direct incubators of practical solutions for world-class enterprises. Through zero-friction IP sharing, closed-gate proposal evaluation, and an immutable audit trail, we serve as the absolute digital bridge of mutual development.
            </p>
          </div>
        </div>
      </section>

      {/* Roles & Workflows */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-900 mb-4">Unified Stakeholder Portal</h2>
          <p className="text-xs text-slate-500">
            Each role interacts with absolute clarity, under strict privacy fences and verified institutional controls.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {rolesInfo.map((role) => {
            const Icon = role.icon;
            return (
              <div key={role.title} className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-sm flex flex-col justify-between hover:border-orange-500/30 transition-all group">
                <div>
                  <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center mb-6 transition-all group-hover:bg-orange-100">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-display font-bold text-slate-900 mb-2">{role.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-6">{role.desc}</p>
                  
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 font-mono">Key Capabilities</h4>
                  <ul className="space-y-2 mb-8">
                    {role.benefits.map((benefit, i) => (
                      <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                        <span className="text-orange-500 font-bold mt-0.5 font-mono">✓</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => onQuickLogin(role.email)}
                  className="w-full bg-slate-950 hover:bg-orange-500 text-white font-medium font-display py-2.5 rounded-lg text-xs transition"
                >
                  {role.btnLabel}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Key Architectural Fences */}
      <section className="bg-[#0F172A] text-white py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <h3 className="text-orange-400 font-mono text-[10px] tracking-wider uppercase mb-2">✦ PRIVACY GUARANTEE</h3>
              <h4 className="text-base font-display font-semibold mb-2">Double-Blinded Integrity</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Students submit proposals anonymized (e.g. Student #ST-RAHUL). Industries review solely on technical feasibility. Budget parameters remain entirely confidential from student search views.
              </p>
            </div>
            <div>
              <h3 className="text-orange-400 font-mono text-[10px] tracking-wider uppercase mb-2">✦ AUDIT TRAIL</h3>
              <h4 className="text-base font-display font-semibold mb-2">Immutable Platform Log</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                All major updates—from challenge creation, proposal submissions, revisions, to final review decisions—are written to a strict audit database. Entries are immutable and cannot be deleted or bypassed.
              </p>
            </div>
            <div>
              <h3 className="text-orange-400 font-mono text-[10px] tracking-wider uppercase mb-2">✦ DIRECT INTERACTION</h3>
              <h4 className="text-base font-display font-semibold mb-2">Siloed Communication</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Discussion happens only through platform threads linked directly to proposals. External contact exchange (email, phone) is strictly forbidden inside the portal to guarantee process fairness.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-500 py-8 text-center text-xs border-t border-slate-900">
        <p>© 2026 Confederation of Indian Industry (CII). All Rights Reserved.</p>
        <p className="mt-1 text-slate-600">CIISIC Platform Prototype • For Demonstration & Audit Purposes Only</p>
      </footer>
    </div>
  );
}
