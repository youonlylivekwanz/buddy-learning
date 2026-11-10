'use client';

import React, { useState } from 'react';
import { MOCK_SPONSOR_COHORT, MOCK_SPONSOR_STUDENTS } from '@/data/mockData';
import { BuddyLogo } from '@/components/BuddyLogo';
import {
  X,
  Download,
  Building,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  FileCheck,
} from 'lucide-react';

interface SponsorReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SponsorReportModal: React.FC<SponsorReportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const cohort = MOCK_SPONSOR_COHORT;
  const students = MOCK_SPONSOR_STUDENTS;

  const handleDownload = () => {
    setDownloadSuccess(true);
    setTimeout(() => {
      setDownloadSuccess(false);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-buddy-charcoal/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white border border-buddy-border rounded-2xl shadow-lift overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-buddy-cream border-b border-buddy-border">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-buddy-primary" />
            <h2 className="text-sm sm:text-base font-heading font-bold text-buddy-charcoal">
              Institutional Executive Progress Report (Certified PDF Preview)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-buddy-charcoalLight hover:text-buddy-charcoal hover:bg-buddy-cream transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-white text-buddy-charcoal">
          {/* Institutional Banner */}
          <div className="p-6 rounded-xl bg-buddy-cream border border-buddy-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <BuddyLogo size="md" />
              <h1 className="text-xl font-heading font-extrabold text-buddy-charcoal mt-3">
                {cohort.organization}
              </h1>
              <p className="text-xs text-buddy-charcoalMuted mt-0.5">
                Cohort: {cohort.name} • Contract #{cohort.contractId}
              </p>
              <p className="text-xs text-buddy-charcoalLight">
                Authorized By: {cohort.contactPerson}
              </p>
            </div>

            <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-buddy-border">
              <span className="academic-pill bg-buddy-emeraldLight text-buddy-emeraldText border border-buddy-emerald/20 font-bold">
                Audit: 100% Reconciled
              </span>
              <p className="font-mono text-xs text-buddy-charcoalLight mt-2">
                Reporting Period: October 2026
              </p>
            </div>
          </div>

          {/* Metric Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="academic-card p-4 space-y-1 bg-white">
              <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase font-bold text-buddy-charcoalLight">
                <Users className="w-3.5 h-3.5 text-buddy-charcoalLight" />
                <span>Scholars</span>
              </div>
              <p className="text-2xl font-heading font-bold text-buddy-charcoal tabular-nums">
                {cohort.totalLearners}
              </p>
              <span className="font-mono text-[11px] text-buddy-emeraldText font-medium">
                100% Active Enrollment
              </span>
            </div>

            <div className="academic-card p-4 space-y-1 bg-white">
              <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase font-bold text-buddy-charcoalLight">
                <CheckCircle className="w-3.5 h-3.5 text-buddy-emerald" />
                <span>Attendance</span>
              </div>
              <p className="text-2xl font-heading font-bold text-buddy-emeraldText tabular-nums">
                {cohort.attendanceRate}%
              </p>
              <span className="font-mono text-[11px] text-buddy-charcoalLight">
                Benchmark: {cohort.targetAttendanceRate}%
              </span>
            </div>

            <div className="academic-card p-4 space-y-1 bg-white">
              <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase font-bold text-buddy-charcoalLight">
                <TrendingUp className="w-3.5 h-3.5 text-buddy-primary" />
                <span>Grade Jump</span>
              </div>
              <p className="text-2xl font-heading font-bold text-buddy-charcoal tabular-nums">
                +{cohort.avgGradeImprovement}%
              </p>
              <span className="font-mono text-[11px] text-buddy-charcoalLight">
                Baseline to Oct 2026
              </span>
            </div>

            <div className="academic-card p-4 space-y-1 bg-white">
              <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase font-bold text-buddy-charcoalLight">
                <Clock className="w-3.5 h-3.5 text-buddy-charcoalLight" />
                <span>Hours Completed</span>
              </div>
              <p className="text-2xl font-heading font-bold text-buddy-charcoal tabular-nums">
                {cohort.sponsoredHoursCompleted}h
              </p>
              <span className="font-mono text-[11px] text-buddy-primaryText font-medium">
                78.9% Target Achieved
              </span>
            </div>
          </div>

          {/* Synthesis */}
          <div className="p-4 rounded-xl bg-buddy-cream border border-buddy-border text-xs text-buddy-charcoalMuted leading-relaxed space-y-2">
            <h3 className="font-heading font-bold text-sm text-buddy-charcoal">
              Executive Synthesis & Pedagogical Highlights
            </h3>
            <p>
              During this academic cycle, the Anglo American STEM Bursary Cohort demonstrated an unprecedented <strong className="text-buddy-charcoal">+18.4% mean grade improvement</strong> across pure Mathematics and Physical Sciences. Targeted interventions focused on high-stakes calculus optimization proofs and electrodynamics.
            </p>
            <p>
              Biometric check-in attendance reached <strong className="text-buddy-charcoal">94.8%</strong>, exceeding the corporate benchmark target of 90.0%. All 42 scholars are currently tracking toward direct university STEM faculty qualification requirements.
            </p>
          </div>

          {/* Directory */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-buddy-charcoal">
                Individual Scholar Cohort Directory
              </span>
              <span className="font-mono text-[11px] text-buddy-charcoalLight">
                Representative Academic Ledger
              </span>
            </div>

            <div className="academic-card overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-buddy-cream border-b border-buddy-border text-buddy-charcoal font-semibold font-mono text-[11px] uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Scholar Name</th>
                    <th className="py-2.5 px-3">School / Grade</th>
                    <th className="py-2.5 px-3">Tutor Mentor</th>
                    <th className="py-2.5 px-3 text-center">Baseline</th>
                    <th className="py-2.5 px-3 text-center">Current</th>
                    <th className="py-2.5 px-3 text-center">Delta</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-buddy-border">
                  {students.map((student) => {
                    const delta = student.currentScore - student.baselineScore;
                    return (
                      <tr key={student.id} className="hover:bg-buddy-cream/50 transition-colors">
                        <td className="py-3 px-3 font-semibold text-buddy-charcoal flex items-center gap-2">
                          <img
                            src={student.avatar}
                            alt={student.name}
                            className="w-6 h-6 rounded-full object-cover border border-buddy-border"
                          />
                          <span>{student.name}</span>
                        </td>
                        <td className="py-3 px-3 text-buddy-charcoalMuted">
                          {student.school} (Gr {student.grade})
                        </td>
                        <td className="py-3 px-3 text-buddy-charcoal font-medium">
                          {student.tutorAssigned}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-buddy-charcoalLight">
                          {student.baselineScore}%
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-buddy-charcoal tabular-nums">
                          {student.currentScore}%
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-buddy-emeraldText font-bold tabular-nums">
                          +{delta}%
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`academic-pill ${
                              student.status === 'excelling'
                                ? 'bg-buddy-emeraldLight text-buddy-emeraldText border border-buddy-emerald/20'
                                : student.status === 'on_track'
                                ? 'bg-buddy-creamMuted text-buddy-charcoal border border-buddy-border'
                                : 'bg-buddy-coralLight text-buddy-coralText border border-buddy-coral/20'
                            }`}
                          >
                            {student.status.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {downloadSuccess && (
            <div className="p-3 rounded-xl bg-buddy-emeraldLight border border-buddy-emerald/20 text-buddy-emeraldText text-xs flex items-center gap-2">
              <FileCheck className="w-4 h-4" />
              <span>Certified institutional report compiled! Download initiated.</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-buddy-cream border-t border-buddy-border flex items-center justify-between">
          <p className="font-mono text-xs text-buddy-charcoalLight">
            Certified by Academic Operations Lead • Hash: #BL-AA-2026-904
          </p>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-buddy-charcoal hover:bg-black text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5 text-buddy-primary" />
            <span>Download Certified PDF Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};
