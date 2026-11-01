import React from 'react';

interface BadgeProps {
  variant:
    | 'Distinction'
    | 'Merit'
    | 'Pass'
    | 'At Risk'
    | 'Low'
    | 'Moderate'
    | 'High'
    | 'Critical'
    | 'Pending'
    | 'In Progress'
    | 'Completed'
    | 'Active'
    | 'Behind'
    | 'Academic'
    | 'Attendance'
    | 'Behavioral'
    | 'Counseling'
    | 'Resolved'
    | 'Ongoing'
    | 'Escalated'
    | 'purple'
    | 'cyan'
    | 'pink';
  size?: 'sm' | 'md';
  children?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant, size = 'sm', children, className = '' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs font-semibold';

  let colorClasses = 'bg-slate-100 text-slate-700 border border-slate-200';

  switch (variant) {
    case 'Distinction':
    case 'Completed':
    case 'Resolved':
    case 'Low':
      colorClasses = 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      break;

    case 'Merit':
    case 'cyan':
    case 'Active':
      colorClasses = 'bg-cyan-50 text-cyan-700 border border-cyan-200';
      break;

    case 'Pass':
    case 'Medium':
    case 'Moderate':
    case 'In Progress':
    case 'Ongoing':
      colorClasses = 'bg-amber-50 text-amber-800 border border-amber-200';
      break;

    case 'At Risk':
    case 'High':
    case 'Critical':
    case 'Behind':
    case 'Escalated':
      colorClasses = 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse-slow';
      break;

    case 'purple':
    case 'Pending':
      colorClasses = 'bg-violet-50 text-violet-700 border border-violet-200';
      break;

    case 'pink':
      colorClasses = 'bg-pink-50 text-pink-700 border border-pink-200';
      break;

    case 'Academic':
      colorClasses = 'bg-indigo-50 text-indigo-700 border border-indigo-200';
      break;
    case 'Attendance':
      colorClasses = 'bg-teal-50 text-teal-700 border border-teal-200';
      break;
    case 'Behavioral':
    case 'Counseling':
      colorClasses = 'bg-violet-50 text-violet-700 border border-violet-200';
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full ${sizeClasses} ${colorClasses} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
      {children || variant}
    </span>
  );
};
