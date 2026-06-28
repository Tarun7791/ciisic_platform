import React, { useState } from 'react';
import { 
  Mail, Lock, UserCheck, Landmark, Building2, GraduationCap, 
  ShieldAlert, ShieldCheck, Clock, Check, ArrowLeft, ArrowRight, 
  Briefcase, MapPin, Globe, FileText, Upload, ChevronRight, Hash, Phone, Sparkles
} from 'lucide-react';

interface LoginFormProps {
  onLoginSuccess: (token: string, user: any) => void;
  onBackToLanding: () => void;
}

export default function LoginForm({ onLoginSuccess, onBackToLanding }: LoginFormProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<'student' | 'industry' | 'institution'>('student');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  
  // Student fields
  const [rollNumber, setRollNumber] = useState('');
  const [year, setYear] = useState('3rd Year');
  const [branch, setBranch] = useState('Computer Science & Engineering');
  const [institutionName, setInstitutionName] = useState('IIT Bombay');
  const [bio, setBio] = useState('');

  // Industry SPOC multi-step fields
  const [companyName, setCompanyName] = useState('');
  const [designation, setDesignation] = useState('');
  const [mobile, setMobile] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [sector, setSector] = useState('');
  const [ciiMembershipId, setCiiMembershipId] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [companyIdCardFile, setCompanyIdCardFile] = useState('');
  const [authorizationLetterFile, setAuthorizationLetterFile] = useState('');
  const [logoFile, setLogoFile] = useState('');

  // Institution SPOC multi-step fields
  const [instDesignation, setInstDesignation] = useState('');
  const [instMobile, setInstMobile] = useState('');
  const [university, setUniversity] = useState('');
  const [department, setDepartment] = useState('');
  const [instWebsite, setInstWebsite] = useState('');
  const [aicteCode, setAicteCode] = useState('');
  const [instIdCardFile, setInstIdCardFile] = useState('');
  const [instAuthLetterFile, setInstAuthLetterFile] = useState('');

  // Multi-step registration flow state
  const [step, setStep] = useState(1);

  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Success state
  const [registrationSubmitted, setRegistrationSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);

  const fillDemoData = () => {
    setError(null);
    if (role === 'student') {
      setName('Rohit Sharma');
      setEmail('rohit.sharma@student.iitb.ac.in');
      setRollNumber('22B030045');
      setYear('3rd Year');
      setBranch('Computer Science & Engineering');
      setInstitutionName('IIT Bombay');
      setBio('Enthusiastic student developer with a passion for machine learning, artificial intelligence, and building scalable full-stack applications.');
    } else if (role === 'industry') {
      setName('Vikram Aditya');
      setEmail('v.aditya@tatamotors.com');
      setDesignation('VP of Corporate Innovation & Alliances');
      setMobile('9812345678');
      setCompanyName('Tata Motors');
      setSector('Automobile & Aerospace');
      setWebsite('https://www.tatamotors.com');
      setAddress('Bombay House, Homi Mody Street, Mumbai, Maharashtra 400001');
      setCiiMembershipId('CII-IND-48201-T');
      setRegistrationNumber('L28920MH1945PLC004520');
      setGstNumber('27AAACT2714F1Z5');
      setCompanyIdCardFile('vikram_aditya_corporate_id.pdf');
      setAuthorizationLetterFile('tata_motors_signing_authority.pdf');
      setLogoFile('tata_motors_logo.png');
    } else if (role === 'institution') {
      setName('Dr. Sunita Deshmukh');
      setEmail('s.deshmukh@iitb.ac.in');
      setInstDesignation('Dean of Research & Development');
      setInstMobile('9423456781');
      setInstitutionName('IIT Bombay');
      setUniversity('Indian Institute of Technology Bombay');
      setDepartment('Office of Dean R&D');
      setInstWebsite('https://www.iitb.ac.in');
      setAicteCode('AICTE-1-4930194');
      setInstIdCardFile('sunita_faculty_id_card.pdf');
      setInstAuthLetterFile('iitb_coordination_appointment.pdf');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      onLoginSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const validateStep = (): boolean => {
    setError(null);
    if (role === 'industry') {
      if (step === 1) {
        if (!name.trim()) { setError('Full Name is required'); return false; }
        if (!designation.trim()) { setError('Designation is required'); return false; }
        if (!email.trim()) { setError('Official Email is required'); return false; }
        if (!mobile.trim()) { setError('Mobile Number is required'); return false; }
        if (!/^\+?[0-9\s\-()]{10,20}$/.test(mobile)) { setError('Please enter a valid mobile number'); return false; }
      } else if (step === 2) {
        if (!companyName.trim()) { setError('Company Name is required'); return false; }
        if (!sector.trim()) { setError('Industry Sector is required'); return false; }
        if (!website.trim()) { setError('Company Website URL is required'); return false; }
        if (!address.trim()) { setError('Corporate Headquarters Address is required'); return false; }
      } else if (step === 3) {
        // Step 3 is optional verification details. No validation required.
        return true;
      } else if (step === 4) {
        if (!companyIdCardFile) { setError('Company ID Card document is required'); return false; }
        if (!authorizationLetterFile) { setError('Authorization Letter is required'); return false; }
      }
    } else if (role === 'institution') {
      if (step === 1) {
        if (!name.trim()) { setError('Full Name is required'); return false; }
        if (!instDesignation.trim()) { setError('Designation is required'); return false; }
        if (!email.trim()) { setError('Official Institution Email is required'); return false; }
        if (!instMobile.trim()) { setError('Mobile Number is required'); return false; }
        if (!/^\+?[0-9\s\-()]{10,20}$/.test(instMobile)) { setError('Please enter a valid mobile number'); return false; }
      } else if (step === 2) {
        if (!institutionName.trim()) { setError('Institution Name is required'); return false; }
        if (!university.trim()) { setError('Affiliated University is required'); return false; }
        if (!department.trim()) { setError('Academic Department is required'); return false; }
        if (!instWebsite.trim()) { setError('Institution Website URL is required'); return false; }
      } else if (step === 3) {
        // Step 3 is optional verification details. No validation required.
        return true;
      } else if (step === 4) {
        if (!instIdCardFile) { setError('College ID Card document is required'); return false; }
        if (!instAuthLetterFile) { setError('Appointment/Authorization Letter is required'); return false; }
      }
    }
    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Stepper logic
    const totalSteps = role === 'student' ? 1 : 5;
    if (role !== 'student' && step < totalSteps) {
      if (validateStep()) {
        setStep(step + 1);
      }
      return;
    }

    // Final checks
    if (role === 'student') {
      if (!name || !email) {
        setError('Name and email are required');
        return;
      }
    } else {
      if (!validateStep()) return;
    }

    setLoading(true);
    setError(null);

    const payload: any = {
      name,
      email,
      role,
    };

    if (role === 'student') {
      payload.institutionName = institutionName;
      payload.studentProfile = {
        rollNumber,
        year,
        branch,
        institutionName,
        bio,
        skills: ['Python', 'React', 'TypeScript'] // default seed skills
      };
    } else if (role === 'industry') {
      payload.companyName = companyName;
      payload.industryProfile = {
        designation,
        mobile,
        website,
        address,
        sector,
        ciiMembershipId,
        registrationNumber,
        gstNumber,
        companyIdCardFile,
        authorizationLetterFile,
        logoFile
      };
    } else if (role === 'institution') {
      payload.institutionName = institutionName;
      payload.institutionProfile = {
        designation: instDesignation,
        mobile: instMobile,
        university,
        department,
        website: instWebsite,
        aicteCode,
        collegeIdCardFile: instIdCardFile,
        authorizationLetterFile: instAuthLetterFile
      };
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      if (role === 'student') {
        onLoginSuccess(data.token, data.user);
      } else {
        setSubmittedData({
          ...data.user,
          industryProfile: payload.industryProfile,
          institutionProfile: payload.institutionProfile
        });
        setRegistrationSubmitted(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const prefill = (emailValue: string) => {
    setEmail(emailValue);
    setError(null);
  };

  const FileUploadField = ({ 
    label, 
    required = true, 
    value, 
    onChange 
  }: { 
    label: string; 
    required?: boolean; 
    value: string; 
    onChange: (filename: string) => void; 
  }) => {
    return (
      <div>
        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
          {label} {required && <span className="text-orange-500">*</span>}
        </label>
        <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-orange-500 transition-colors bg-slate-50 relative group">
          <input
            type="file"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                onChange(e.target.files[0].name);
              }
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1 group-hover:text-orange-500 transition-colors" />
          {value ? (
            <div className="text-xs font-mono font-bold text-emerald-600 flex items-center justify-center gap-1">
              <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" /> {value}
            </div>
          ) : (
            <div className="text-[11px] text-slate-500">
              <span className="text-orange-600 font-bold">Choose a file</span> or drag it here
              <span className="block text-[9px] text-slate-400 mt-0.5">PDF, PNG, JPG (Max 5MB)</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Stepper elements based on role
  const stepsList = role === 'student' 
    ? [] 
    : ['Personal', role === 'industry' ? 'Organization' : 'Institution', 'Verification', 'Documents', 'Review'];

  // Render Success Screen
  if (registrationSubmitted && submittedData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 font-sans">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Header Banner */}
          <div className="bg-slate-900 text-white p-8 text-center flex flex-col items-center gap-3">
            <div className="bg-emerald-500/15 border border-emerald-500/30 p-3 rounded-full text-emerald-400 shadow-inner">
              <ShieldCheck className="w-9 h-9" />
            </div>
            <div>
              <h2 className="text-xl font-display font-extrabold tracking-tight text-white">Registration Submitted</h2>
              <p className="text-[10px] text-slate-400 uppercase font-mono tracking-widest mt-1">CII Innovation & Startup Interface Cell</p>
            </div>
          </div>

          <div className="p-8 space-y-6">
            {/* Minimal Info Badges */}
            <div className="grid grid-cols-2 gap-4 border border-slate-150 rounded-xl p-4 bg-slate-50">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">Status</span>
                <span className="inline-flex items-center gap-1.5 mt-1 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Pending Approval
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">Request ID</span>
                <span className="block text-xs font-mono font-bold text-slate-800 mt-1 truncate">
                  {submittedData.id || "REQ-CIISIC-4902"}
                </span>
              </div>
              <div className="col-span-2 border-t border-slate-200/60 pt-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">Expected Review Time</span>
                <p className="text-xs font-semibold text-slate-700 mt-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-orange-500" />
                  24–48 Hours (Monday to Friday)
                </p>
              </div>
            </div>

            {/* Minimal Simple Progress Tracker */}
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-4">
                Vetting Pipeline Progress
              </span>
              <div className="space-y-5">
                {[
                  { label: 'Submitted', desc: 'Captured in secure database registry', status: 'completed' },
                  { label: 'Admin Review', desc: 'Credential audit & signatory verification', status: 'active' },
                  { label: 'Approved', desc: 'Official CIISIC access grant issued', status: 'pending' },
                  { label: 'Dashboard Access', desc: 'Access portal matches and challenges', status: 'pending' }
                ].map((track, idx) => {
                  const isCompleted = track.status === 'completed';
                  const isActive = track.status === 'active';
                  return (
                    <div key={track.label} className="flex gap-3 relative">
                      {idx < 3 && (
                        <div className={`absolute left-3 top-6 bottom-[-20px] w-[2px] ${
                          isCompleted ? 'bg-emerald-500' : 'bg-slate-200'
                        }`} />
                      )}
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border text-[10px] font-bold font-mono ${
                        isCompleted ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm' :
                        isActive ? 'bg-amber-100 border-amber-300 text-amber-800 scale-105 font-black' :
                        'bg-white border-slate-200 text-slate-400'
                      }`}>
                        {isCompleted ? (
                          <Check className="w-3 h-3 stroke-[3]" />
                        ) : isActive ? (
                          <Clock className="w-3 h-3 animate-pulse" />
                        ) : (
                          idx + 1
                        )}
                      </div>
                      <div className="flex-1">
                        <span className={`block text-xs font-bold font-display leading-tight ${
                          isCompleted ? 'text-slate-800' : isActive ? 'text-amber-900 font-extrabold' : 'text-slate-400'
                        }`}>
                          {track.label}
                        </span>
                        <span className={`block text-[10px] mt-0.5 ${
                          isActive ? 'text-amber-850/80 font-medium' : 'text-slate-400'
                        }`}>
                          {track.desc}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Back buttons */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
              <button
                onClick={onBackToLanding}
                className="text-xs text-slate-500 hover:text-slate-800 font-bold font-display transition duration-200 flex items-center gap-1 cursor-pointer"
              >
                ← Public Website
              </button>
              <button
                onClick={() => {
                  setRegistrationSubmitted(false);
                  setSubmittedData(null);
                  setActiveTab('login');
                  setStep(1);
                  setName('');
                  setEmail('');
                  setCompanyName('');
                  setInstitutionName('IIT Bombay');
                  setDesignation('');
                  setMobile('');
                  setWebsite('');
                  setAddress('');
                  setSector('');
                  setCiiMembershipId('');
                  setRegistrationNumber('');
                  setGstNumber('');
                  setCompanyIdCardFile('');
                  setAuthorizationLetterFile('');
                  setLogoFile('');
                  setInstDesignation('');
                  setInstMobile('');
                  setUniversity('');
                  setDepartment('');
                  setInstWebsite('');
                  setAicteCode('');
                  setInstIdCardFile('');
                  setInstAuthLetterFile('');
                }}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold font-display px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all duration-200 shadow-sm cursor-pointer"
              >
                Go to Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 font-sans">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Title and Branding */}
        <div className="bg-slate-900 text-white p-6 text-center">
          <h2 className="text-lg font-display font-bold tracking-tight uppercase">CIISIC Portal Access</h2>
          <p className="text-[11px] text-slate-400 mt-1 uppercase font-mono tracking-widest">CII Innovation & Startup Interface Cell</p>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => { setActiveTab('login'); setError(null); }}
            className={`w-1/2 py-3.5 text-xs font-bold uppercase tracking-wider text-center transition font-display ${
              activeTab === 'login' ? 'border-b-2 border-orange-500 text-orange-600 font-extrabold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setActiveTab('register'); setError(null); setStep(1); }}
            className={`w-1/2 py-3.5 text-xs font-bold uppercase tracking-wider text-center transition font-display ${
              activeTab === 'register' ? 'border-b-2 border-orange-500 text-orange-600 font-extrabold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Create Account
          </button>
        </div>

        <div className="p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl p-4 mb-6 flex items-start gap-2.5">
              <ShieldAlert className="w-4.5 h-4.5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block font-display">Authentication Block:</strong>
                <p className="mt-0.5 text-[11px] font-mono leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {activeTab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-[18px] text-slate-450 w-4 h-4" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    className="pl-10 w-full p-3.5 rounded-lg border border-slate-300 focus:border-orange-500 focus:outline-none text-sm font-semibold text-slate-850"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                  Password (Disabled for Prototype)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-[18px] text-slate-300 w-4 h-4" />
                  <input
                    type="password"
                    disabled
                    value="••••••••••••••"
                    className="pl-10 w-full p-3.5 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-400 select-none cursor-not-allowed font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold font-display p-3.5 rounded-xl text-xs uppercase tracking-wider transition mt-6 disabled:opacity-50 shadow-sm cursor-pointer"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>

              <div className="pt-6 border-t border-slate-100">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 font-mono">
                  Pre-seeded Prototype Accounts (Click to Fill)
                </span>
                <div className="grid grid-cols-2 gap-2 text-left">
                  <button
                    type="button"
                    onClick={() => prefill('student@ciisic.org')}
                    className="p-2.5 border border-slate-200 rounded-lg text-sm hover:border-orange-500 hover:bg-orange-50/40 transition-all text-left cursor-pointer"
                  >
                    <div className="font-semibold text-slate-800 font-display text-[11px]">Student Solver</div>
                    <div className="text-[10px] text-slate-500 font-mono">student@ciisic.org</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => prefill('tata@industry.com')}
                    className="p-2.5 border border-slate-200 rounded-lg text-sm hover:border-orange-500 hover:bg-orange-50/40 transition-all text-left cursor-pointer"
                  >
                    <div className="font-semibold text-slate-800 font-display text-[11px]">Tata Steel SPOC</div>
                    <div className="text-[10px] text-slate-500 font-mono">tata@industry.com</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => prefill('iitb@edu.in')}
                    className="p-2.5 border border-slate-200 rounded-lg text-sm hover:border-orange-500 hover:bg-orange-50/40 transition-all text-left cursor-pointer"
                  >
                    <div className="font-semibold text-slate-800 font-display text-[11px]">IIT Bombay SPOC</div>
                    <div className="text-[10px] text-slate-500 font-mono">iitb@edu.in</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => prefill('admin@ciisic.org')}
                    className="p-2.5 border border-slate-200 rounded-lg text-sm hover:border-orange-500 hover:bg-orange-50/40 transition-all text-left cursor-pointer"
                  >
                    <div className="font-semibold text-slate-800 font-display text-[11px]">CIISIC Admin</div>
                    <div className="text-[10px] text-slate-500 font-mono">admin@ciisic.org</div>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-6">
              {/* Subtle Demo Fill Trigger */}
              <div className="flex justify-end -mb-3">
                <button
                  type="button"
                  onClick={fillDemoData}
                  className="text-[10px] font-bold text-orange-600 hover:text-orange-700 active:text-orange-800 flex items-center gap-1 transition-colors font-mono uppercase tracking-wider cursor-pointer bg-orange-50 hover:bg-orange-100/50 px-2.5 py-1 rounded border border-orange-200/50"
                >
                  <Sparkles className="w-3 h-3" /> Auto-Fill Demo Data
                </button>
              </div>

              {/* Role Select - Only visible in Step 1 or for Students */}
              {(role === 'student' || step === 1) && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                    Select Portal Role
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => { setRole('student'); setStep(1); setError(null); }}
                      className={`p-2.5 border rounded-xl flex flex-col items-center justify-center gap-1 transition font-display cursor-pointer ${
                        role === 'student' ? 'border-orange-500 bg-orange-50 text-orange-950 font-bold' : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <GraduationCap className="w-5 h-5 text-orange-500" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Student</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setRole('industry'); setStep(1); setError(null); }}
                      className={`p-2.5 border rounded-xl flex flex-col items-center justify-center gap-1 transition font-display cursor-pointer ${
                        role === 'industry' ? 'border-orange-500 bg-orange-50 text-orange-950 font-bold' : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <Building2 className="w-5 h-5 text-orange-500" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Industry</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setRole('institution'); setStep(1); setError(null); }}
                      className={`p-2.5 border rounded-xl flex flex-col items-center justify-center gap-1 transition font-display cursor-pointer ${
                        role === 'institution' ? 'border-orange-500 bg-orange-50 text-orange-950 font-bold' : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <Landmark className="w-5 h-5 text-orange-500" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Institution</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Progress Stepper for Multi-Step registrations */}
              {role !== 'student' && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    {stepsList.map((stepName, idx) => {
                      const currentStepIdx = idx + 1;
                      const isCompleted = step > currentStepIdx;
                      const isActive = step === currentStepIdx;
                      return (
                        <React.Fragment key={stepName}>
                          <div className="flex flex-col items-center flex-1 relative">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold font-mono border transition-all duration-300 ${
                              isCompleted ? 'bg-emerald-600 border-emerald-600 text-white' :
                              isActive ? 'bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/20 scale-110' :
                              'bg-white border-slate-300 text-slate-400'
                            }`}>
                              {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : currentStepIdx}
                            </div>
                            <span className={`text-[8px] font-bold uppercase tracking-wider mt-1.5 text-center transition-colors truncate max-w-[80px] ${
                              isActive ? 'text-orange-600 font-extrabold' : 'text-slate-400'
                            }`}>
                              {stepName}
                            </span>
                          </div>
                          {idx < stepsList.length - 1 && (
                            <div className={`h-0.5 flex-1 -mt-4 transition-all duration-500 ${
                              isCompleted ? 'bg-emerald-600' : 'bg-slate-200'
                            }`} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STUDENT FORM (Unchanged Schema) */}
              {role === 'student' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Priyesh Patel"
                      className="w-full p-2.5 rounded-lg border border-slate-300 focus:border-orange-500 focus:outline-none text-xs font-semibold text-slate-850"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. priyesh@student.in"
                      className="w-full p-2.5 rounded-lg border border-slate-300 focus:border-orange-500 focus:outline-none text-xs font-semibold text-slate-850"
                    />
                  </div>

                  <div className="space-y-3.5 bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">
                          Roll Number
                        </label>
                        <input
                          type="text"
                          required
                          value={rollNumber}
                          onChange={(e) => setRollNumber(e.target.value)}
                          placeholder="e.g. 23B030045"
                          className="w-full p-2 rounded border border-slate-300 text-xs font-mono focus:outline-none focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">
                          Year of Study
                        </label>
                        <select
                          value={year}
                          onChange={(e) => setYear(e.target.value)}
                          className="w-full p-2 rounded border border-slate-300 text-xs focus:outline-none focus:border-orange-500 bg-white"
                        >
                          <option>1st Year</option>
                          <option>2nd Year</option>
                          <option>3rd Year</option>
                          <option>4th Year</option>
                          <option>Postgraduate</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">
                        Academic Branch
                      </label>
                      <input
                        type="text"
                        required
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        placeholder="e.g. Mechanical Engineering"
                        className="w-full p-2 rounded border border-slate-300 text-xs focus:outline-none focus:border-orange-500 font-semibold text-slate-850"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">
                        Select Institution
                      </label>
                      <select
                        value={institutionName}
                        onChange={(e) => setInstitutionName(e.target.value)}
                        className="w-full p-2 rounded border border-slate-300 text-xs focus:outline-none focus:border-orange-500 bg-white font-semibold text-slate-850"
                      >
                        <option>IIT Bombay</option>
                        <option>BITS Pilani</option>
                        <option>IIT Delhi</option>
                        <option>IISc Bangalore</option>
                      </select>
                      <span className="text-[9px] text-amber-700 block mt-1.5 leading-normal">
                        * Student accounts require verification by the selected Institution coordinator before proposals can be submitted.
                      </span>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">
                        Bio / Areas of Interest
                      </label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="e.g. Specialized in machine vision..."
                        className="w-full p-2 rounded border border-slate-300 text-xs focus:outline-none focus:border-orange-500 h-16 resize-none text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* INDUSTRY SPOC MULTI-STEP FLOW */}
              {role === 'industry' && (
                <div className="space-y-4">
                  {step === 1 && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="bg-orange-50/30 p-3 rounded-lg border border-orange-500/10 text-[11px] text-slate-600 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-orange-500 shrink-0" />
                        <span>Step 1: Complete representative SPOC personal credentials.</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                            Full Name <span className="text-orange-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Priyesh Patel"
                            className="w-full p-2.5 rounded-lg border border-slate-300 focus:border-orange-500 focus:outline-none text-xs font-semibold text-slate-850"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                            Official Designation <span className="text-orange-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={designation}
                            onChange={(e) => setDesignation(e.target.value)}
                            placeholder="e.g. Chief R&D Coordinator"
                            className="w-full p-2.5 rounded-lg border border-slate-300 focus:border-orange-500 focus:outline-none text-xs font-semibold text-slate-850"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                            Corporate Official Email <span className="text-orange-500">*</span>
                          </label>
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="e.g. patel@tatasteel.com"
                            className="w-full p-2.5 rounded-lg border border-slate-300 focus:border-orange-500 focus:outline-none text-xs font-semibold text-slate-850"
                          />
                          <p className="text-[9px] text-slate-400 mt-1">Must be an official company domain email.</p>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                            Mobile Number <span className="text-orange-500">*</span>
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                            <input
                              type="text"
                              required
                              value={mobile}
                              onChange={(e) => setMobile(e.target.value)}
                              placeholder="e.g. 9876543210"
                              className="pl-9 w-full p-2.5 rounded-lg border border-slate-300 focus:border-orange-500 focus:outline-none text-xs font-semibold text-slate-850 font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="bg-orange-50/30 p-3 rounded-lg border border-orange-500/10 text-[11px] text-slate-600 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-orange-500 shrink-0" />
                        <span>Step 2: Define your company & industry affiliation parameters.</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                            Company / Corporate Name <span className="text-orange-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="e.g. Tata Steel"
                            className="w-full p-2.5 rounded-lg border border-slate-300 focus:border-orange-500 focus:outline-none text-xs font-semibold text-slate-850"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                            Industry Sector <span className="text-orange-500">*</span>
                          </label>
                          <select
                            value={sector}
                            onChange={(e) => setSector(e.target.value)}
                            className="w-full p-2.5 rounded-lg border border-slate-300 focus:border-orange-500 focus:outline-none text-xs font-semibold text-slate-850 bg-white"
                          >
                            <option value="">Select industry sector</option>
                            <option>Information Technology & Software</option>
                            <option>Manufacturing & Metallurgy</option>
                            <option>Automobile & Aerospace</option>
                            <option>Energy, CleanTech & Utilities</option>
                            <option>Healthcare, Pharma & Biotech</option>
                            <option>Finance, Banking & InsurTech</option>
                            <option>Other Enterprise Sector</option>
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                            Company Website URL <span className="text-orange-500">*</span>
                          </label>
                          <div className="relative">
                            <Globe className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                            <input
                              type="url"
                              required
                              value={website}
                              onChange={(e) => setWebsite(e.target.value)}
                              placeholder="e.g. https://www.tatasteel.com"
                              className="pl-9 w-full p-2.5 rounded-lg border border-slate-300 focus:border-orange-500 focus:outline-none text-xs font-semibold text-slate-850 font-mono"
                            />
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                            Corporate Headquarters Address <span className="text-orange-500">*</span>
                          </label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                            <textarea
                              required
                              value={address}
                              onChange={(e) => setAddress(e.target.value)}
                              placeholder="e.g. Jamshedpur, Jharkhand, India"
                              className="pl-9 w-full p-2.5 rounded-lg border border-slate-300 focus:border-orange-500 focus:outline-none text-xs font-semibold text-slate-850 h-16 resize-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="bg-orange-50/30 p-3 rounded-lg border border-orange-500/10 text-[11px] text-slate-600 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-orange-500 shrink-0" />
                        <span>Step 3: Provide optional corporate identifiers to accelerate verification vetting.</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                            CII Membership Identification Number <span className="text-slate-400">(Optional)</span>
                          </label>
                          <input
                            type="text"
                            value={ciiMembershipId}
                            onChange={(e) => setCiiMembershipId(e.target.value)}
                            placeholder="e.g. CII-IND-93821-M"
                            className="w-full p-2.5 rounded-lg border border-slate-300 focus:border-orange-500 focus:outline-none text-xs font-semibold text-slate-850 font-mono uppercase"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                            Company Registration Number (CIN / CRN) <span className="text-slate-400">(Optional)</span>
                          </label>
                          <input
                            type="text"
                            value={registrationNumber}
                            onChange={(e) => setRegistrationNumber(e.target.value)}
                            placeholder="e.g. L27100MH1907PLC000260"
                            className="w-full p-2.5 rounded-lg border border-slate-300 focus:border-orange-500 focus:outline-none text-xs font-semibold text-slate-850 font-mono uppercase"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                            GST Registration Number <span className="text-slate-400">(Optional)</span>
                          </label>
                          <input
                            type="text"
                            value={gstNumber}
                            onChange={(e) => setGstNumber(e.target.value)}
                            placeholder="e.g. 24AAAAT3024R1Z3"
                            className="w-full p-2.5 rounded-lg border border-slate-300 focus:border-orange-500 focus:outline-none text-xs font-semibold text-slate-850 font-mono uppercase"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 4 && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="bg-orange-50/30 p-3 rounded-lg border border-orange-500/10 text-[11px] text-slate-600 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-orange-500 shrink-0" />
                        <span>Step 4: Upload official corporate credentials for validation auditing.</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FileUploadField
                          label="Official Company ID Card / Professional ID"
                          value={companyIdCardFile}
                          onChange={setCompanyIdCardFile}
                        />

                        <FileUploadField
                          label="Authorized Signatory / Empowerment Letter"
                          value={authorizationLetterFile}
                          onChange={setAuthorizationLetterFile}
                        />

                        <div className="md:col-span-2">
                          <FileUploadField
                            label="Company Corporate Brand Logo"
                            required={false}
                            value={logoFile}
                            onChange={setLogoFile}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 5 && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-500/10 text-[11px] text-emerald-800 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Step 5: Review your Industry SPOC details before submission.</span>
                      </div>
                      
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-150 space-y-3.5 text-xs">
                        <div className="border-b border-slate-200 pb-2">
                          <h4 className="font-bold text-slate-800">1. Representative Profile</h4>
                          <div className="grid grid-cols-2 gap-2 mt-1.5 text-slate-600">
                            <div><span className="text-slate-400 text-[10px] block font-mono">NAME</span>{name}</div>
                            <div><span className="text-slate-400 text-[10px] block font-mono">DESIGNATION</span>{designation}</div>
                            <div className="col-span-2"><span className="text-slate-400 text-[10px] block font-mono">OFFICIAL EMAIL</span>{email}</div>
                            <div><span className="text-slate-400 text-[10px] block font-mono">MOBILE</span>{mobile}</div>
                          </div>
                        </div>
                        <div className="border-b border-slate-200 pb-2">
                          <h4 className="font-bold text-slate-800">2. Company Information</h4>
                          <div className="grid grid-cols-2 gap-2 mt-1.5 text-slate-600">
                            <div><span className="text-slate-400 text-[10px] block font-mono">COMPANY</span>{companyName}</div>
                            <div><span className="text-slate-400 text-[10px] block font-mono">SECTOR</span>{sector}</div>
                            <div className="col-span-2"><span className="text-slate-400 text-[10px] block font-mono">WEBSITE</span>{website}</div>
                            <div className="col-span-2"><span className="text-slate-400 text-[10px] block font-mono">ADDRESS</span>{address}</div>
                          </div>
                        </div>
                        <div className="border-b border-slate-200 pb-2">
                          <h4 className="font-bold text-slate-800">3. Verification Identifiers</h4>
                          <div className="grid grid-cols-2 gap-2 mt-1.5 text-slate-600">
                            <div><span className="text-slate-400 text-[10px] block font-mono">CII MEMBERSHIP ID</span>{ciiMembershipId || <span className="text-slate-300 italic">Not Provided</span>}</div>
                            <div><span className="text-slate-400 text-[10px] block font-mono">CIN / CRN</span>{registrationNumber || <span className="text-slate-300 italic">Not Provided</span>}</div>
                            <div className="col-span-2"><span className="text-slate-400 text-[10px] block font-mono">GST NUMBER</span>{gstNumber || <span className="text-slate-300 italic">Not Provided</span>}</div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800">4. Uploaded Credentials</h4>
                          <div className="grid grid-cols-2 gap-2 mt-1.5 text-[10px] text-slate-600 font-mono">
                            <div><span className="text-slate-400 block">COMPANY ID</span>{companyIdCardFile}</div>
                            <div><span className="text-slate-400 block">AUTH LETTER</span>{authorizationLetterFile}</div>
                            {logoFile && <div className="col-span-2"><span className="text-slate-400 block">BRAND LOGO</span>{logoFile}</div>}
                          </div>
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-500 leading-normal bg-orange-50/20 p-2.5 rounded border border-orange-500/10">
                        * By clicking submit, you authorize the CIISIC administrators to verify your credentials. Safe corporate TLS/SSL standards secure this transmission.
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* INSTITUTION SPOC MULTI-STEP FLOW */}
              {role === 'institution' && (
                <div className="space-y-4">
                  {step === 1 && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="bg-orange-50/30 p-3 rounded-lg border border-orange-500/10 text-[11px] text-slate-600 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-orange-500 shrink-0" />
                        <span>Step 1: Academic SPOC coordinator personal details.</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                            Full Name <span className="text-orange-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Prof. Anil Sahasrabudhe"
                            className="w-full p-2.5 rounded-lg border border-slate-300 focus:border-orange-500 focus:outline-none text-xs font-semibold text-slate-850"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                            Academic Designation <span className="text-orange-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={instDesignation}
                            onChange={(e) => setInstDesignation(e.target.value)}
                            placeholder="e.g. Dean of R&D / Coordinator"
                            className="w-full p-2.5 rounded-lg border border-slate-300 focus:border-orange-500 focus:outline-none text-xs font-semibold text-slate-850"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                            Official Institution Email <span className="text-orange-500">*</span>
                          </label>
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="e.g. dean.rd@iitb.ac.in"
                            className="w-full p-2.5 rounded-lg border border-slate-300 focus:border-orange-500 focus:outline-none text-xs font-semibold text-slate-850"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                            Mobile Number <span className="text-orange-500">*</span>
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                            <input
                              type="text"
                              required
                              value={instMobile}
                              onChange={(e) => setInstMobile(e.target.value)}
                              placeholder="e.g. 9876543210"
                              className="pl-9 w-full p-2.5 rounded-lg border border-slate-300 focus:border-orange-500 focus:outline-none text-xs font-semibold text-slate-850 font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="bg-orange-50/30 p-3 rounded-lg border border-orange-500/10 text-[11px] text-slate-600 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-orange-500 shrink-0" />
                        <span>Step 2: Declare institution affiliation and website parameters.</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                            CII Member College / Institution Name <span className="text-orange-500">*</span>
                          </label>
                          <select
                            value={institutionName}
                            onChange={(e) => setInstitutionName(e.target.value)}
                            className="w-full p-2.5 rounded-lg border border-slate-300 focus:border-orange-500 focus:outline-none text-xs font-semibold text-slate-850 bg-white"
                          >
                            <option>IIT Bombay</option>
                            <option>BITS Pilani</option>
                            <option>IIT Delhi</option>
                            <option>IISc Bangalore</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                            Affiliated University <span className="text-orange-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={university}
                            onChange={(e) => setUniversity(e.target.value)}
                            placeholder="e.g. Autonomous University Board"
                            className="w-full p-2.5 rounded-lg border border-slate-300 focus:border-orange-500 focus:outline-none text-xs font-semibold text-slate-850"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                            Academic Office / Department Name <span className="text-orange-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            placeholder="e.g. Innovation Cell & Startups"
                            className="w-full p-2.5 rounded-lg border border-slate-300 focus:border-orange-500 focus:outline-none text-xs font-semibold text-slate-850"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                            Institution Website URL <span className="text-orange-500">*</span>
                          </label>
                          <div className="relative">
                            <Globe className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                            <input
                              type="url"
                              required
                              value={instWebsite}
                              onChange={(e) => setInstWebsite(e.target.value)}
                              placeholder="e.g. https://www.iitb.ac.in"
                              className="pl-9 w-full p-2.5 rounded-lg border border-slate-300 focus:border-orange-500 focus:outline-none text-xs font-semibold text-slate-850 font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="bg-orange-50/30 p-3 rounded-lg border border-orange-500/10 text-[11px] text-slate-600 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-orange-500 shrink-0" />
                        <span>Step 3: Provide optional academic approval and regulation codes.</span>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                          AICTE Approval Code / Institution ID <span className="text-slate-400">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          value={aicteCode}
                          onChange={(e) => setAicteCode(e.target.value)}
                          placeholder="e.g. AICTE-1-4930194"
                          className="w-full p-2.5 rounded-lg border border-slate-300 focus:border-orange-500 focus:outline-none text-xs font-semibold text-slate-850 font-mono uppercase"
                        />
                      </div>
                    </div>
                  )}

                  {step === 4 && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="bg-orange-50/30 p-3 rounded-lg border border-orange-500/10 text-[11px] text-slate-600 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-orange-500 shrink-0" />
                        <span>Step 4: Upload official academic authorization documents.</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FileUploadField
                          label="Official Faculty ID Card"
                          value={instIdCardFile}
                          onChange={setInstIdCardFile}
                        />

                        <FileUploadField
                          label="College Appointment / SPOC Authorization Letter"
                          value={instAuthLetterFile}
                          onChange={setInstAuthLetterFile}
                        />
                      </div>
                    </div>
                  )}

                  {step === 5 && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-500/10 text-[11px] text-emerald-800 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Step 5: Review your Institution SPOC details before submission.</span>
                      </div>
                      
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-150 space-y-3.5 text-xs">
                        <div className="border-b border-slate-200 pb-2">
                          <h4 className="font-bold text-slate-800">1. Coordinator Profile</h4>
                          <div className="grid grid-cols-2 gap-2 mt-1.5 text-slate-600">
                            <div><span className="text-slate-400 text-[10px] block font-mono">NAME</span>{name}</div>
                            <div><span className="text-slate-400 text-[10px] block font-mono">DESIGNATION</span>{instDesignation}</div>
                            <div className="col-span-2"><span className="text-slate-400 text-[10px] block font-mono">OFFICIAL EMAIL</span>{email}</div>
                            <div><span className="text-slate-400 text-[10px] block font-mono">MOBILE</span>{instMobile}</div>
                          </div>
                        </div>
                        <div className="border-b border-slate-200 pb-2">
                          <h4 className="font-bold text-slate-800">2. Institution Information</h4>
                          <div className="grid grid-cols-2 gap-2 mt-1.5 text-slate-600">
                            <div><span className="text-slate-400 text-[10px] block font-mono">INSTITUTION</span>{institutionName}</div>
                            <div><span className="text-slate-400 text-[10px] block font-mono">UNIVERSITY</span>{university}</div>
                            <div><span className="text-slate-400 text-[10px] block font-mono">DEPARTMENT</span>{department}</div>
                            <div><span className="text-slate-400 text-[10px] block font-mono">WEBSITE</span>{instWebsite}</div>
                          </div>
                        </div>
                        <div className="border-b border-slate-200 pb-2">
                          <h4 className="font-bold text-slate-800">3. Verification Identifiers</h4>
                          <div className="grid grid-cols-2 gap-2 mt-1.5 text-slate-600">
                            <div className="col-span-2"><span className="text-slate-400 text-[10px] block font-mono">AICTE APPROVAL CODE / INST ID</span>{aicteCode || <span className="text-slate-300 italic">Not Provided</span>}</div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800">4. Uploaded Credentials</h4>
                          <div className="grid grid-cols-2 gap-2 mt-1.5 text-[10px] text-slate-600 font-mono">
                            <div><span className="text-slate-400 block">FACULTY ID CARD</span>{instIdCardFile}</div>
                            <div><span className="text-slate-400 block">APPOINTMENT/AUTH LETTER</span>{instAuthLetterFile}</div>
                          </div>
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-500 leading-normal bg-orange-50/20 p-2.5 rounded border border-orange-500/10">
                        * By clicking submit, you authorize the CIISIC administrators to verify your credentials. Safe educational TLS/SSL standards secure this transmission.
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action buttons with previous / next navigation */}
              <div className="flex gap-2 pt-4">
                {role !== 'student' && step > 1 && (
                  <button
                    type="button"
                    onClick={() => { setStep(step - 1); setError(null); }}
                    className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold font-display p-3.5 rounded-xl text-xs uppercase tracking-wider transition flex items-center justify-center gap-1 cursor-pointer border border-slate-200"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`font-semibold font-display p-3.5 rounded-xl text-xs uppercase tracking-wider transition disabled:opacity-50 shadow-sm cursor-pointer flex items-center justify-center gap-1.5 ${
                    role !== 'student' && step < 5
                      ? 'w-full bg-slate-900 hover:bg-slate-800 text-white'
                      : 'w-full bg-orange-500 hover:bg-orange-600 text-white'
                  }`}
                >
                  {loading ? 'Processing...' : 
                    role !== 'student' && step < 5 ? (
                      <>Next Step <ArrowRight className="w-3.5 h-3.5" /></>
                    ) : (
                      'Submit Verification Request'
                    )
                  }
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Back navigation */}
        <div className="bg-slate-50 py-4 px-8 border-t border-slate-100 text-center">
          <button
            onClick={onBackToLanding}
            className="text-xs text-orange-600 hover:text-orange-800 font-bold font-display cursor-pointer"
          >
            ← Back to Public Website
          </button>
        </div>
      </div>
    </div>
  );
}
