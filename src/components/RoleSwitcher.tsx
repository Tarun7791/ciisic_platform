import React from 'react';
import { User } from '../types';
import { Shield, Briefcase, GraduationCap, UserCheck, RefreshCw } from 'lucide-react';

interface RoleSwitcherProps {
  currentUser: User | null;
  onSwitchUser: (email: string) => void;
  onLogout: () => void;
}

export default function RoleSwitcher({ currentUser, onSwitchUser, onLogout }: RoleSwitcherProps) {
  const testAccounts = [
    {
      role: 'student',
      name: 'Rahul (Student)',
      label: 'Student',
      email: 'student@ciisic.org',
      icon: GraduationCap,
      color: 'bg-emerald-500 hover:bg-emerald-600',
    },
    {
      role: 'industry',
      name: 'Sanjeev (Tata Steel)',
      label: 'Industry SPOC',
      email: 'tata@industry.com',
      icon: Briefcase,
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      role: 'institution',
      name: 'Prof. Anil (IIT Bombay)',
      label: 'Institution SPOC',
      email: 'iitb@edu.in',
      icon: UserCheck,
      color: 'bg-amber-600 hover:bg-amber-700',
    },
    {
      role: 'admin',
      name: 'Dr. Ramesh (Admin)',
      label: 'Admin',
      email: 'admin@ciisic.org',
      icon: Shield,
      color: 'bg-purple-600 hover:bg-purple-700',
    },
  ];

  return (
    <div className="bg-slate-950 text-white border-b border-slate-900 text-xs py-1.5 px-4 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap justify-center lg:justify-start">
          <span className="inline-flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded text-[9px] font-mono tracking-wider text-orange-400 uppercase font-bold border border-orange-500/20">
            <RefreshCw className="w-2.5 h-2.5 text-orange-500 animate-spin" /> Prototype Controller
          </span>
          {currentUser ? (
            <span className="text-slate-400 text-[10px]">
              Active Workspace: <strong className="text-white font-semibold font-display">{currentUser.name}</strong> (<span className="text-orange-400 font-mono font-bold text-[9px]">{currentUser.role.toUpperCase()}</span>)
            </span>
          ) : (
            <span className="text-slate-400 text-[10.5px] font-medium">Bypass authentication by selecting a pre-seeded workspace:</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 justify-center">
          <span className="text-slate-500 font-bold text-[9px] uppercase tracking-wider font-mono">Bypass Access:</span>
          {testAccounts.map((account) => {
            const Icon = account.icon;
            const isActive = currentUser?.email === account.email;
            return (
              <button
                key={account.email}
                id={`btn-switch-${account.role}`}
                onClick={() => onSwitchUser(account.email)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-semibold text-white transition-all font-display ${
                  isActive 
                    ? 'ring-2 ring-orange-500 ring-offset-1 ring-offset-slate-950 font-bold scale-105 bg-orange-500'
                    : 'opacity-70 hover:opacity-100 bg-slate-800 hover:bg-slate-700'
                }`}
              >
                <Icon className="w-3 h-3 text-orange-400" />
                <span>{account.label}</span>
              </button>
            );
          })}
          {currentUser && (
            <button
              id="btn-switch-logout"
              onClick={onLogout}
              className="bg-slate-900 hover:bg-rose-900/50 hover:text-rose-200 border border-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10.5px] font-semibold transition font-display"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
