'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  TrendingUp,
  Users,
  Clock,
  CheckCircle2,
  Download,
  Search,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import {
  MOCK_SPONSOR_COHORT,
  MOCK_SPONSOR_STUDENTS,
} from '@/data/mockData';
import { SponsorStudent } from '@/types';
import { api } from '@/lib/apiClient';

interface SponsorDashboardProps {
  onOpenReportModal: () => void;
  onOpenBuddyInsightModal?: (learnerId?: string) => void;
}

export const SponsorDashboard: React.FC<SponsorDashboardProps> = ({
  onOpenReportModal,
  onOpenBuddyInsightModal,
}) => {
  const [students, setStudents] = useState<SponsorStudent[]>(MOCK_SPONSOR_STUDENTS);
  const [cohort, setCohort] = useState(MOCK_SPONSOR_COHORT);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<SponsorStudent | null>(null);

  // Sync with live backend
  useEffect(() => {
    let mounted = true;
    Promise.allSettled([
      api.sponsors.getCohort(),
      api.learners.getAll(),
    ]).then(([cohortRes, learnersRes]) => {
      if (!mounted) return;
      if (cohortRes.status === 'fulfilled' && cohortRes.value) {
        setCohort((prev) => ({
          ...prev,
          sponsoredHoursCompleted: cohortRes.value.totalSponsoredHoursCompleted ?? prev.sponsoredHoursCompleted,
          attendanceRate: cohortRes.value.avgAttendanceRate ?? prev.attendanceRate,
          avgGradeImprovement: cohortRes.value.avgGradeJumpPercent ?? prev.avgGradeImprovement,
          totalLearners: cohortRes.value.totalScholars ?? prev.totalLearners,
        }));
      }
      if (learnersRes.status === 'fulfilled' && learnersRes.value?.length > 0) {
        setStudents(learnersRes.value);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  // Filter logic
  const filteredStudents = students.filter((stu) => {
    const matchesSearch =
      stu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stu.school.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGrade =
      selectedGrade === 'all' || stu.grade.toString() === selectedGrade;

    const matchesStatus =
      selectedStatus === 'all' || stu.status === selectedStatus;

    return matchesSearch && matchesGrade && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Editorial Index Header */}
      <div className="flex items-center justify-between border-b border-buddy-border pb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs uppercase tracking-widest text-buddy-charcoalLight">
            [ 03 // SCHOLARSHIP & INSTITUTIONAL SUITE ]
          </span>
          <span className="text-buddy-border">/</span>
          <span className="text-xs font-semibold text-buddy-charcoal">
            {cohort.organization}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="academic-pill bg-buddy-emeraldLight text-buddy-emeraldText border border-buddy-emerald/20">
            Audit Compliant (ZA-AA-2026)
          </span>
        </div>
      </div>

      {/* Top Banner */}
      <div className="academic-card p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="academic-pill bg-buddy-primaryLight text-buddy-primaryText border border-buddy-primary/20">
              Institutional Bursary Oversight
            </span>
            <span className="font-mono text-xs text-buddy-charcoalLight">
              Contract #{cohort.contractId}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-buddy-charcoal tracking-tight">
            {cohort.organization}
          </h1>

          <p className="text-xs sm:text-sm text-buddy-charcoalMuted max-w-2xl leading-relaxed">
            Active tracking for <strong className="text-buddy-charcoal">{cohort.totalLearners} sponsored STEM scholars</strong> across 6 regional feeder academies. All session timestamps are verified with completed lesson notes and past papers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-buddy-charcoal hover:bg-black text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5 text-buddy-primary" />
            <span>Audit Report (PDF)</span>
          </button>

          <a
            href="/api/reports/export?format=csv"
            download
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white hover:bg-buddy-cream text-buddy-charcoal text-xs font-semibold border border-buddy-border transition-all shadow-subtle"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-buddy-emerald" />
            <span>Stream Compliance (CSV)</span>
          </a>
        </div>
      </div>

      {/* 4 High-Level Institutional KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance Rate */}
        <div className="academic-card p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-buddy-charcoalLight">
            <span className="uppercase tracking-wider">Cohort Attendance</span>
            <CheckCircle2 className="w-4 h-4 text-buddy-emerald" />
          </div>
          <p className="text-3xl font-heading font-extrabold text-buddy-emeraldText tabular-nums">
            {cohort.attendanceRate}%
          </p>
          <p className="text-[11px] text-buddy-charcoalMuted">
            <strong className="text-buddy-emeraldText">+4.8%</strong> above {cohort.targetAttendanceRate}% institutional benchmark
          </p>
        </div>

        {/* Grade Jump */}
        <div className="academic-card p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-buddy-charcoalLight">
            <span className="uppercase tracking-wider">Mean Grade Jump</span>
            <TrendingUp className="w-4 h-4 text-buddy-primary" />
          </div>
          <p className="text-3xl font-heading font-extrabold text-buddy-charcoal tabular-nums">
            +{cohort.avgGradeImprovement}%
          </p>
          <p className="text-[11px] text-buddy-charcoalMuted">
            Measured across pure STEM subjects (Baseline to Oct 2026)
          </p>
        </div>

        {/* Sponsored Hours */}
        <div className="academic-card p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-buddy-charcoalLight">
            <span className="uppercase tracking-wider">Sponsored Hours</span>
            <Clock className="w-4 h-4 text-buddy-charcoalLight" />
          </div>
          <p className="text-3xl font-heading font-extrabold text-buddy-charcoal tabular-nums">
            {cohort.sponsoredHoursCompleted}h
          </p>
          <p className="text-[11px] text-buddy-charcoalMuted">
            <span className="font-mono text-buddy-charcoal font-semibold">78.9%</span> of {cohort.sponsoredHoursAllocated}h target completed
          </p>
        </div>

        {/* Budget Deployed */}
        <div className="academic-card p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-buddy-charcoalLight">
            <span className="uppercase tracking-wider">Budget Deployed</span>
            <ShieldCheck className="w-4 h-4 text-buddy-charcoalLight" />
          </div>
          <p className="text-3xl font-heading font-extrabold text-buddy-charcoal tabular-nums">
            ${cohort.budgetUtilized.toLocaleString()}
          </p>
          <p className="text-[11px] text-buddy-charcoalMuted">
            Total Fund: <strong className="text-buddy-charcoal">${cohort.totalBudget.toLocaleString()}</strong> (On Track)
          </p>
        </div>
      </div>

      {/* Subject-by-Subject Academic Uplift Bento */}
      <div className="academic-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-buddy-border pb-3">
          <h2 className="font-heading font-bold text-xs uppercase tracking-wider text-buddy-charcoal flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-buddy-primary" />
            <span>Curriculum Module Uplift Analysis (Pre vs Post Tutoring)</span>
          </h2>
          <span className="font-mono text-xs text-buddy-charcoalLight">
            Cohort Sample Size: N = 42
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-buddy-cream border border-buddy-border space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-buddy-charcoal">Pure Mathematics</span>
              <span className="font-mono font-bold text-buddy-primaryText">+21.3%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-buddy-creamMuted overflow-hidden border border-buddy-border">
              <div className="h-full rounded-full bg-buddy-primary" style={{ width: '84%' }} />
            </div>
            <div className="flex justify-between text-[11px] font-mono text-buddy-charcoalLight">
              <span>Baseline: 58%</span>
              <span className="text-buddy-charcoal font-semibold">Current: 79.3%</span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-buddy-cream border border-buddy-border space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-buddy-charcoal">Physical Sciences</span>
              <span className="font-mono font-bold text-buddy-primaryText">+17.8%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-buddy-creamMuted overflow-hidden border border-buddy-border">
              <div className="h-full rounded-full bg-buddy-primary" style={{ width: '78%' }} />
            </div>
            <div className="flex justify-between text-[11px] font-mono text-buddy-charcoalLight">
              <span>Baseline: 54%</span>
              <span className="text-buddy-charcoal font-semibold">Current: 71.8%</span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-buddy-cream border border-buddy-border space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-buddy-charcoal">Information Technology</span>
              <span className="font-mono font-bold text-buddy-primaryText">+16.1%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-buddy-creamMuted overflow-hidden border border-buddy-border">
              <div className="h-full rounded-full bg-buddy-primary" style={{ width: '82%' }} />
            </div>
            <div className="flex justify-between text-[11px] font-mono text-buddy-charcoalLight">
              <span>Baseline: 66%</span>
              <span className="text-buddy-charcoal font-semibold">Current: 82.1%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sponsored Scholar Directory Table */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-heading font-extrabold text-lg text-buddy-charcoal flex items-center gap-2">
              <Users className="w-4 h-4 text-buddy-primary" />
              <span>Sponsored Scholar Directory</span>
            </h2>
            <p className="text-xs text-buddy-charcoalMuted">
              Individual attendance records, grade baselines, and allocated mentor pairings.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-buddy-charcoalLight absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search scholar or academy..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white border border-buddy-border text-xs text-buddy-charcoal placeholder-buddy-charcoalLight focus:outline-none focus:border-buddy-primary"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs text-buddy-charcoalLight">Grade:</span>
            {['all', '10', '11', '12'].map((grade) => (
              <button
                key={grade}
                onClick={() => setSelectedGrade(grade)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors ${
                  selectedGrade === grade
                    ? 'bg-buddy-charcoal text-white font-semibold'
                    : 'bg-white text-buddy-charcoalMuted hover:text-buddy-charcoal border border-buddy-border'
                }`}
              >
                {grade === 'all' ? 'All' : `Gr ${grade}`}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs text-buddy-charcoalLight">Status:</span>
            {[
              { id: 'all', label: 'All' },
              { id: 'excelling', label: 'Excelling' },
              { id: 'on_track', label: 'On Track' },
              { id: 'needs_support', label: 'Needs Support' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setSelectedStatus(st.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors ${
                  selectedStatus === st.id
                    ? 'bg-buddy-charcoal text-white font-semibold'
                    : 'bg-white text-buddy-charcoalMuted hover:text-buddy-charcoal border border-buddy-border'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Directory Ledger */}
        <div className="academic-card overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-buddy-cream border-b border-buddy-border text-buddy-charcoal font-semibold">
              <tr>
                <th className="py-2.5 px-4 font-mono text-[11px] uppercase">Scholar</th>
                <th className="py-2.5 px-4 font-mono text-[11px] uppercase">School & Grade</th>
                <th className="py-2.5 px-4 font-mono text-[11px] uppercase">Tutor Mentor</th>
                <th className="py-2.5 px-4 text-center font-mono text-[11px] uppercase">Attendance</th>
                <th className="py-2.5 px-4 text-center font-mono text-[11px] uppercase">Baseline</th>
                <th className="py-2.5 px-4 text-center font-mono text-[11px] uppercase">Current</th>
                <th className="py-2.5 px-4 text-center font-mono text-[11px] uppercase">Delta</th>
                <th className="py-2.5 px-4 font-mono text-[11px] uppercase">Status</th>
                <th className="py-2.5 px-4 text-right font-mono text-[11px] uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-buddy-border">
              {filteredStudents.map((stu) => {
                const delta = stu.currentScore - stu.baselineScore;
                return (
                  <tr key={stu.id} className="hover:bg-buddy-cream/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={stu.avatar}
                          alt={stu.name}
                          className="w-7 h-7 rounded-full object-cover border border-buddy-border"
                        />
                        <div>
                          <p className="font-semibold text-buddy-charcoal">{stu.name}</p>
                          <p className="font-mono text-[10px] text-buddy-charcoalLight">{stu.hoursCompleted}h completed</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-buddy-charcoalMuted">
                      <div>{stu.school}</div>
                      <div className="font-mono text-[10px] text-buddy-charcoalLight">Grade {stu.grade}</div>
                    </td>
                    <td className="py-3 px-4 text-buddy-charcoal font-medium">
                      {stu.tutorAssigned}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-buddy-charcoal tabular-nums">
                      {stu.attendanceRate}%
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-buddy-charcoalLight tabular-nums">
                      {stu.baselineScore}%
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-buddy-charcoal tabular-nums">
                      {stu.currentScore}%
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-buddy-emeraldText tabular-nums">
                      +{delta}%
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`academic-pill ${
                          stu.status === 'excelling'
                            ? 'bg-buddy-emeraldLight text-buddy-emeraldText border border-buddy-emerald/20'
                            : stu.status === 'on_track'
                            ? 'bg-buddy-creamMuted text-buddy-charcoal border border-buddy-border'
                            : 'bg-buddy-coralLight text-buddy-coralText border border-buddy-coral/20'
                        }`}
                      >
                        {stu.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {onOpenBuddyInsightModal && (
                          <button
                            onClick={() => onOpenBuddyInsightModal('69ef398b6f7864ef23dd98e9')}
                            className="px-2 py-0.5 rounded-md bg-buddy-primaryLight text-buddy-primaryText border border-buddy-primary/30 hover:bg-buddy-primary hover:text-white font-mono text-[10px] font-semibold transition-colors"
                          >
                            Buddy Insight
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedStudentDetail(stu)}
                          className="px-2 py-0.5 rounded-md bg-white border border-buddy-border text-buddy-charcoal hover:bg-buddy-cream text-xs font-medium transition-colors"
                        >
                          Profile
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Profile Quick View Modal */}
      {selectedStudentDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-buddy-charcoal/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-xl bg-white border border-buddy-border shadow-lift space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-buddy-border">
              <h3 className="font-heading font-bold text-sm text-buddy-charcoal uppercase tracking-wider">
                Scholar Academic Dossier
              </h3>
              <button
                onClick={() => setSelectedStudentDetail(null)}
                className="text-xs font-mono text-buddy-charcoalLight hover:text-buddy-charcoal"
              >
                [Close]
              </button>
            </div>

            <div className="flex items-center gap-3">
              <img
                src={selectedStudentDetail.avatar}
                alt={selectedStudentDetail.name}
                className="w-12 h-12 rounded-xl object-cover border border-buddy-border"
              />
              <div>
                <h4 className="font-heading font-bold text-buddy-charcoal text-base">
                  {selectedStudentDetail.name}
                </h4>
                <p className="text-xs text-buddy-charcoalMuted">
                  {selectedStudentDetail.school} • Grade {selectedStudentDetail.grade}
                </p>
                <p className="text-xs text-buddy-primaryText font-medium mt-0.5">
                  Mentor: {selectedStudentDetail.tutorAssigned}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-lg bg-buddy-cream border border-buddy-border">
                <span className="font-mono text-[10px] text-buddy-charcoalLight uppercase">Baseline</span>
                <p className="font-mono font-bold text-buddy-charcoal mt-0.5">{selectedStudentDetail.baselineScore}%</p>
              </div>
              <div className="p-2.5 rounded-lg bg-buddy-cream border border-buddy-border">
                <span className="font-mono text-[10px] text-buddy-charcoalLight uppercase">Current</span>
                <p className="font-mono font-bold text-buddy-primaryText mt-0.5">{selectedStudentDetail.currentScore}%</p>
              </div>
              <div className="p-2.5 rounded-lg bg-buddy-cream border border-buddy-border">
                <span className="font-mono text-[10px] text-buddy-charcoalLight uppercase">Attendance</span>
                <p className="font-mono font-bold text-buddy-emeraldText mt-0.5">{selectedStudentDetail.attendanceRate}%</p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-buddy-cream border border-buddy-border text-xs">
              <span className="font-mono text-[10px] font-bold text-buddy-charcoal uppercase block mb-1">
                Pedagogical Highlight
              </span>
              <p className="text-buddy-charcoalMuted italic">
                &quot;{selectedStudentDetail.recentHighlight}&quot;
              </p>
            </div>

            <button
              onClick={() => setSelectedStudentDetail(null)}
              className="w-full py-2 rounded-lg bg-buddy-charcoal hover:bg-black text-white text-xs font-semibold transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
