import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, registerStudent, quickDemoLogin, isLoading } = useAuth();
  const [email, setEmail] = useState('teacher@meritlens.edu');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeRoleTab, setActiveRoleTab] = useState<'teacher' | 'student'>('teacher');
  const [isRegistering, setIsRegistering] = useState(false);
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    if (isRegistering) {
      if (!fullName.trim()) {
        setError('Please enter your name.');
        return;
      }
      if (password.length < 8) {
        setError('Please use a password with at least 8 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      try {
        await registerStudent({ name: fullName.trim(), email: email.trim(), password });
      } catch (err: any) {
        setError(err.message || 'Could not create your account.');
      }
      return;
    }
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your email and password.');
    }
  };

  const handleRoleTabChange = (role: 'teacher' | 'student') => {
    // Always leave registration mode when switching roles. Otherwise the
    // teacher tab can accidentally keep showing the student-registration form.
    setActiveRoleTab(role);
    setIsRegistering(false);
    setFullName('');
    setConfirmPassword('');
    setError(null);
    if (role === 'teacher') {
      setEmail('teacher@meritlens.edu');
      setPassword('admin123');
    } else {
      setEmail('mahitha@student.edu');
      setPassword('student123');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-[#F1F5F9] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Decorative ambient gradients */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#8B5CF6]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#22D3EE]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#8B5CF6] via-[#22D3EE] to-[#F472B6] p-0.5 shadow-xl shadow-[#8B5CF6]/20 mb-4">
            <div className="w-full h-full bg-slate-50 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-[#22D3EE]" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Merit<span className="text-[#8B5CF6]">Lens</span> AI
          </h1>
          <p className="text-sm text-slate-600 mt-1 font-medium">See Beyond the Score</p>
          <p className="text-xs text-slate-600 mt-2 max-w-xs mx-auto">
            Easy-to-understand student progress and study tips
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
          {/* Role Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-50 border border-slate-200 mb-6">
            <button
              type="button"
              onClick={() => handleRoleTabChange('teacher')}
              className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeRoleTab === 'teacher'
                  ? 'bg-[#8B5CF6] text-slate-900 shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Teacher Login
            </button>
            <button
              type="button"
              onClick={() => handleRoleTabChange('student')}
              className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeRoleTab === 'student'
                  ? 'bg-[#22D3EE] text-[#0B1020] shadow font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              Student Login
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && activeRoleTab === 'student' && <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Your name</label>
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter your full name" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-[#8B5CF6]" required />
              </div>
            </>}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-600 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@institution.edu"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-[#8B5CF6] transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-600 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-[#8B5CF6] transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-600 hover:text-slate-900 absolute right-3 top-2.5"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isRegistering && activeRoleTab === 'student' && <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Confirm password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Type your password again" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-[#8B5CF6]" required />
            </div>}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] text-slate-900 text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#8B5CF6]/25 hover:opacity-95 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>{isRegistering ? 'Create student account' : `Sign in as ${activeRoleTab === 'teacher' ? 'Teacher' : 'Student'}`}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {activeRoleTab === 'student' && <button type="button" onClick={() => { setIsRegistering(!isRegistering); setError(null); setPassword(''); setConfirmPassword(''); }} className="w-full mt-4 text-xs font-semibold text-[#22D3EE] hover:text-slate-900 transition-colors">
            {isRegistering ? 'Already have an account? Sign in' : 'New student? Create an account'}
          </button>}

          {/* Quick Demo Credentials */}
          {!isRegistering && <div className="mt-6 pt-5 border-t border-slate-200">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-2.5 text-center">
              Try a demo account
            </p>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => quickDemoLogin('teacher')}
                className="w-full text-left px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-semibold text-[#8B5CF6]">Dr. Evelyn Vance</p>
                  <p className="text-[10px] text-slate-600">Teacher • Manage students and marks</p>
                </div>
                <span className="text-[10px] text-slate-600 font-mono">admin123</span>
              </button>

              <button
                type="button"
                onClick={() => quickDemoLogin('student', 'mahitha@student.edu')}
                className="w-full text-left px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-semibold text-[#22D3EE]">Mahitha</p>
                  <p className="text-[10px] text-slate-600">Student • Distinction (90.5%)</p>
                </div>
                <span className="text-[10px] text-slate-600 font-mono">student123</span>
              </button>

              <button
                type="button"
                onClick={() => quickDemoLogin('student', 'akshitha@student.edu')}
                className="w-full text-left px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-semibold text-[#F472B6]">Akshitha</p>
                  <p className="text-[10px] text-slate-600">Student • Needs Support (65%)</p>
                </div>
                <span className="text-[10px] text-slate-600 font-mono">student123</span>
              </button>
            </div>
            <p className="mt-3 text-[10px] text-center text-slate-600 leading-relaxed">
              Demonstration environment. Role-based isolation is enforced on both frontend and backend REST API endpoints.
            </p>
          </div>}
        </div>
      </div>
    </div>
  );
};
