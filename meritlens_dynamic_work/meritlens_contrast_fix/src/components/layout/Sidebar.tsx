import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  LineChart,
  Cpu,
  BookOpenCheck,
  TrendingUp,
  BrainCircuit,
  Settings,
  LogOut,
  Sparkles,
  UserCheck,
  Award,
  BookMarked
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  teacherOnly?: boolean;
}

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  isOpen,
  onClose
}) => {
  const { role, logout, user } = useAuth();

  const teacherNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'students', label: 'Students', icon: <Users className="w-4 h-4" /> },
    { id: 'performance-analysis', label: 'Performance Analysis', icon: <LineChart className="w-4 h-4" /> },
    { id: 'ml-predictions', label: 'ML Predictions', icon: <Cpu className="w-4 h-4" /> },
    { id: 'progress-tracking', label: 'Progress Tracking', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'learning-memory', label: 'Learning Memory', icon: <BrainCircuit className="w-4 h-4" />, teacherOnly: true },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const studentNavItems: NavItem[] = [
    { id: 'my-dashboard', label: 'My Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'my-recommendations', label: 'My Study Tips', icon: <BookOpenCheck className="w-4 h-4" />, badge: 'Priority' },
    { id: 'my-progress', label: 'My Progress', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'my-profile', label: 'My Profile', icon: <UserCheck className="w-4 h-4" /> },
  ];

  const navItems = role === 'teacher' ? teacherNavItems : studentNavItems;

  const handleItemClick = (id: string) => {
    onTabChange(id);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#070B18]/80 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0E1428] border-r border-white/10 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Logo & Tagline */}
          <div className="h-16 flex items-center px-6 border-b border-white/10 gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#8B5CF6] via-[#22D3EE] to-[#F472B6] p-0.5 flex items-center justify-center shadow-lg shadow-[#8B5CF6]/20">
              <div className="w-full h-full bg-[#0E1428] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#22D3EE]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-[#F1F5F9]">
                  Merit<span className="text-[#8B5CF6]">Lens</span>
                </span>
                <span className="text-[10px] font-mono px-1 rounded bg-[#8B5CF6]/20 text-[#8B5CF6] font-bold">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-300 font-medium tracking-wide">
                See Beyond the Score
              </p>
            </div>
          </div>

          {/* User Role Card */}
          <div className="mx-4 my-4 p-3 rounded-xl bg-[#171F36] border border-white/10">
            <div className="flex items-center gap-2.5">
              <div aria-hidden="true" title={user?.name} className="w-9 h-9 rounded-full border border-[#8B5CF6]/30 flex-shrink-0 flex items-center justify-center bg-[#202945] text-[#22D3EE] font-bold text-xs">{(user?.name || '?').split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${role === 'teacher' ? 'bg-[#8B5CF6]' : 'bg-[#22D3EE]'}`} />
                  <p className="text-[10px] font-medium text-slate-300 capitalize">
                    {role === 'teacher' ? 'Lead Faculty' : 'Active Student'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="px-3 space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              {role === 'teacher' ? 'Instructor Suite' : 'Student Workspace'}
            </p>
            {navItems.map((item) => {
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group ${
                    active
                      ? 'bg-gradient-to-r from-[#8B5CF6]/30 to-[#22D3EE]/15 text-white font-semibold border-l-2 border-[#8B5CF6] shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`transition-colors ${active ? 'text-[#22D3EE]' : 'text-slate-400 group-hover:text-white'}`}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-md bg-[#F472B6]/20 text-[#F472B6]">
                      {item.badge}
                    </span>
                  )}
                  {item.teacherOnly && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-md bg-[#8B5CF6]/20 text-[#8B5CF6]">
                      Staff
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions: Logout & System Info */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
          <div className="px-3 pt-1 text-[10px] text-slate-400">
            MeritLens Platform v2.4 • ML + GenAI
          </div>
        </div>
      </aside>
    </>
  );
};
