import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    positive: boolean;
  };
  accentColor?: 'purple' | 'cyan' | 'pink' | 'emerald' | 'amber';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  accentColor = 'purple'
}) => {
  const accentStyles = {
    purple: 'from-[#8B5CF6]/15 to-transparent border-[#8B5CF6]/20 text-[#8B5CF6]',
    cyan: 'from-[#22D3EE]/15 to-transparent border-[#22D3EE]/20 text-[#22D3EE]',
    pink: 'from-[#F472B6]/15 to-transparent border-[#F472B6]/20 text-[#F472B6]',
    emerald: 'from-emerald-500/15 to-transparent border-emerald-500/20 text-emerald-400',
    amber: 'from-amber-500/15 to-transparent border-amber-500/20 text-amber-400'
  }[accentColor];

  return (
    <div className="relative overflow-hidden rounded-xl bg-white border border-slate-200 p-5 shadow-lg transition-all duration-300 hover:border-white/15 hover:shadow-xl group">
      {/* Subtle background glow */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${accentStyles} rounded-bl-full pointer-events-none opacity-40 group-hover:opacity-60 transition-opacity`} />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-600">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">{value}</span>
            {trend && (
              <span
                className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                  trend.positive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-rose-50 text-rose-700'
                }`}
              >
                {trend.value}
              </span>
            )}
          </div>
          {subtitle && <p className="mt-1 text-xs text-slate-600 leading-relaxed">{subtitle}</p>}
        </div>

        <div className={`p-2.5 rounded-lg bg-slate-50/70 border border-slate-200 shadow-inner`}>
          {icon}
        </div>
      </div>
    </div>
  );
};
