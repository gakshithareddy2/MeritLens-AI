import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Student } from '../../types/index';
import { Badge } from '../../components/ui/Badge';
import {
  UserCheck,
  Mail,
  GraduationCap,
  Calendar,
  Phone,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  BookOpen
} from 'lucide-react';

export const StudentProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user?.studentId) return;
    api.getStudentById(user.studentId).then(setStudent).finally(() => setLoading(false));
  }, [user?.studentId]);

  if (loading || !student) {
    return (
      <div className="py-16 text-center text-slate-600">
        <div className="w-8 h-8 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <span>Loading your profile...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#22D3EE]" />
            <span>My Profile</span>
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Official academic registration, enrollment credentials, and learning diagnostics
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700">
          ID: {student.id}
        </span>
      </div>

      {/* Main Profile Identity Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          <div aria-hidden="true" title={student.name} className="w-20 h-20 rounded-2xl border-2 border-[#8B5CF6] shadow-lg shadow-[#8B5CF6]/20 flex-shrink-0 flex items-center justify-center bg-[#202945] text-[#22D3EE] font-bold text-xs">{(student.name || '?').split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h3 className="text-xl font-extrabold text-slate-900">{student.name}</h3>
              <Badge variant={student.performanceCategory} />
              <Badge variant={student.riskLevel} />
            </div>
            <p className="text-xs text-slate-700 flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-600" />
              {student.email}
            </p>
            <p className="text-xs text-slate-600 flex items-center justify-center sm:justify-start gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-slate-600" />
              Enrolled: {student.class} • Term Joined: {student.joinedDate}
            </p>
            <p className="text-xs text-slate-600 flex items-center justify-center sm:justify-start gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-600" />
              Emergency / Parent Contact: {student.parentContact}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-center min-w-[200px]">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-600">Current Marks</span>
            <p className="text-2xl font-black text-[#22D3EE] mt-0.5">{student.currentScore}%</p>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-600">Expected Marks</span>
            <p className="text-2xl font-black text-[#8B5CF6] mt-0.5">{student.predictedScore}%</p>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-600">Attendance</span>
            <p className="text-base font-bold text-emerald-400 mt-0.5">{student.attendance}%</p>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-600">Study Time</span>
            <p className="text-base font-bold text-[#F472B6] mt-0.5">{student.studyHoursWeek}h/wk</p>
          </div>
        </div>
      </div>

      {/* Subject Marks Table */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">Your Subjects and Teachers</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-3">Instructor</th>
                <th className="py-3 px-3">Your Marks</th>
                <th className="py-3 px-3">Attendance</th>
                <th className="py-3 px-3">Assignments</th>
                <th className="py-3 px-3 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {student.subjects.map((sub, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">{sub.subject}</td>
                  <td className="py-3 px-3 text-slate-700">{sub.teacher}</td>
                  <td className="py-3 px-3 font-mono font-extrabold text-sm text-slate-900">{sub.score}%</td>
                  <td className="py-3 px-3 text-slate-700">{sub.attendance}%</td>
                  <td className="py-3 px-3 text-slate-700">{sub.assignments}%</td>
                  <td className="py-3 px-3 text-right">
                    <Badge variant={sub.score >= 85 ? 'Distinction' : sub.score >= 70 ? 'Merit' : sub.score >= 60 ? 'Pass' : 'At Risk'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Strengths & Improvement Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-3">
          <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" />
            Verified Academic Strengths
          </h4>
          <ul className="space-y-2 text-xs text-slate-700">
            {student.strengths.map((str, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/20 space-y-3">
          <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
            <AlertCircle className="w-4 h-4" />
            Target Improvement Opportunities
          </h4>
          <ul className="space-y-2 text-xs text-slate-700">
            {student.improvementAreas.map((area, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>{area}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
