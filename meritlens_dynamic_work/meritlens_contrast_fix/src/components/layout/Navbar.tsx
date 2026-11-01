import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../ui/Badge';
import {
  Menu,
  Sparkles,
  Cpu,
  UserCheck,
  ChevronDown,
  LogOut,
  Bell,
  RefreshCw,
  GraduationCap
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onMenuToggle: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onMenuToggle }) => {
  const { user, role, logout, quickDemoLogin } = useAuth();
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);

  const formatTabTitle = (tab: string) => {
    return tab
      .replace(/-/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-slate-50/80 backdrop-blur-md px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              {formatTabTitle(currentTab)}
            </h1>
            <span className="hidden sm:inline-block">
              <Badge variant={role === 'teacher' ? 'purple' : 'cyan'}>
                {role === 'teacher' ? 'Faculty Portal' : 'Student Login'}
              </Badge>
            </span>
          </div>
          <p className="text-[11px] text-slate-600 hidden md:block">
            MeritLens AI • See Beyond the Score
          </p>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* ML & Engine Status Pill */}
        <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#151C30] border border-white/10 text-[11px] text-slate-200">
          <span className="flex items-center gap-1 text-[#22D3EE]">
            <Cpu className="w-3.5 h-3.5" />
            <span className="font-semibold">ML Engine</span>
          </span>
          <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-slate-600">R²: 0.94</span>
        </div>

        {/* Demo Account Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDemoMenuOpen(!demoMenuOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#151C30] border border-white/10 text-xs text-slate-200 hover:border-white/20 hover:text-slate-900 transition-all"
            title="Switch demo account"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span className="hidden sm:inline">Switch Role</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
          </button>

          {demoMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-64 rounded-xl bg-[#151C30] border border-white/10 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95"
              onClick={() => setDemoMenuOpen(false)}
            >
              <div className="px-2 py-1.5 border-b border-slate-200 mb-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Quick Demo Switcher</p>
              </div>
              <button
                onClick={() => quickDemoLogin('teacher')}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                  role === 'teacher' ? 'bg-[#8B5CF6]/20 text-[#8B5CF6] font-semibold' : 'text-slate-200 hover:bg-white/10'
                }`}
              >
                <div>
                  <p className="font-semibold">Dr. Evelyn Vance</p>
                  <p className="text-[10px] text-slate-300">Teacher • STEM Lead</p>
                </div>
                <Badge variant="purple" size="sm">Teacher</Badge>
              </button>

              <button
                onClick={() => quickDemoLogin('student', 'mahitha@student.edu')}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors mt-1 ${
                  user?.email === 'mahitha@student.edu' ? 'bg-[#22D3EE]/20 text-[#22D3EE] font-semibold' : 'text-slate-200 hover:bg-white/10'
                }`}
              >
                <div>
                  <p className="font-semibold">Mahitha</p>
                  <p className="text-[10px] text-slate-300">Student • Distinction (90.5%)</p>
                </div>
                <Badge variant="Distinction" size="sm">Top</Badge>
              </button>

              <button
                onClick={() => quickDemoLogin('student', 'akshitha@student.edu')}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors mt-1 ${
                  user?.email === 'akshitha@student.edu' ? 'bg-[#F472B6]/20 text-[#F472B6] font-semibold' : 'text-slate-200 hover:bg-white/10'
                }`}
              >
                <div>
                  <p className="font-semibold">Akshitha</p>
                  <p className="text-[10px] text-slate-300">Student • Moderate Risk (65%)</p>
                </div>
                <Badge variant="Pass" size="sm">Action</Badge>
              </button>

              <button
                onClick={() => quickDemoLogin('student', 'bhommi@student.edu')}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors mt-1 ${
                  user?.email === 'bhommi@student.edu' ? 'bg-rose-500/20 text-rose-300 font-semibold' : 'text-slate-200 hover:bg-white/10'
                }`}
              >
                <div>
                  <p className="font-semibold">Bhommi</p>
                  <p className="text-[10px] text-slate-300">Student • High Risk (54%)</p>
                </div>
                <Badge variant="At Risk" size="sm">At Risk</Badge>
              </button>
            </div>
          )}
        </div>

        {/* User profile pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div aria-hidden="true" title={user?.name || 'User'} className="w-8 h-8 rounded-full border border-white/15 flex-shrink-0 flex items-center justify-center bg-[#202945] text-[#22D3EE] font-bold text-xs">{(user?.name || 'User' || '?').split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-[#F1F5F9] truncate max-w-[120px]">{user?.name}</p>
            <p className="text-[10px] text-slate-300 capitalize">{role}</p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors ml-1"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
