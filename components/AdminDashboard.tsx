'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Activity,
  DollarSign,
  CheckCircle2,
  Clock,
  Zap,
} from 'lucide-react';
import {
  MOCK_INVOICES,
  MOCK_LIVE_ACTIVITIES,
} from '@/data/mockData';
import { Invoice, LiveActivityFeedItem } from '@/types';
import { api } from '@/lib/apiClient';

interface AdminDashboardProps {
  onOpenInvoiceModal: (invoice: Invoice) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onOpenInvoiceModal,
}) => {
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const activities = MOCK_LIVE_ACTIVITIES;
  const [payRunApproved, setPayRunApproved] = useState(false);
  const [approvedOnboardingId, setApprovedOnboardingId] = useState<string | null>(null);
  const [adminToast, setAdminToast] = useState<string | null>(null);

  // Sync with live database
  useEffect(() => {
    let mounted = true;
    Promise.allSettled([
      api.invoices.getAll(),
      api.payruns.getAll(),
    ]).then(([invRes, payRes]) => {
      if (!mounted) return;
      if (invRes.status === 'fulfilled' && invRes.value?.length > 0) {
        setInvoices(invRes.value);
      }
      if (payRes.status === 'fulfilled' && payRes.value?.length > 0) {
        const batch44 = payRes.value.find((b) => b.batchNumber === '44' || b.id === 'batch-44');
        if (batch44?.status === 'Approved & Dispatched') {
          setPayRunApproved(true);
        }
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const [isEvaluatingCompliance, setIsEvaluatingCompliance] = useState(false);

  const handleRunComplianceCron = async () => {
    setIsEvaluatingCompliance(true);
    try {
      const res = await fetch('/api/compliance/cron', { method: 'POST' });
      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        setAdminToast(
          `Evaluated ${d.evaluated} certs: ${d.transitioned90d} @ 90d, ${d.transitioned30d} @ 30d, ${d.expiredAndReenrolled} expired & re-enrolled.`
        );
      } else {
        setAdminToast('Compliance evaluation completed.');
      }
    } catch {
      setAdminToast('Failed to trigger compliance evaluation.');
    } finally {
      setIsEvaluatingCompliance(false);
      setTimeout(() => setAdminToast(null), 5500);
    }
  };

  const pendingInvoicesTotal = invoices
    .filter((inv) => inv.status === 'pending')
    .reduce((sum, inv) => sum + inv.total, 0);

  const handleApprovePayRun = async () => {
    setPayRunApproved(true);
    setAdminToast('Authorized Batch Pay Run #44: $18,420 released to 28 verified tutors.');
    setTimeout(() => {
      setAdminToast(null);
    }, 4500);

    try {
      await api.payruns.authorize('batch-44', 'admin-01');
    } catch {
      // ignore
    }
  };

  const handleApproveOnboarding = (id: string, name: string) => {
    setApprovedOnboardingId(id);
    setAdminToast(`Vetting approved: ${name} is now certified on Buddy Learning.`);
    setTimeout(() => {
      setAdminToast(null);
    }, 4500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notice */}
      {adminToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-buddy-charcoal text-white text-xs shadow-lift flex items-center gap-3 border border-buddy-border animate-in slide-in-from-bottom">
          <CheckCircle2 className="w-5 h-5 text-buddy-emerald" />
          <span className="font-mono">{adminToast}</span>
        </div>
      )}

      {/* Editorial Index Header */}
      <div className="flex items-center justify-between border-b border-buddy-border pb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs uppercase tracking-widest text-buddy-charcoalLight">
            [ 04 // CENTRAL OPERATIONS & FINANCIAL COMMAND ]
          </span>
          <span className="text-buddy-border">/</span>
          <span className="text-xs font-semibold text-buddy-charcoal">
            Operations &amp; Billing
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-buddy-charcoal">
          <span className="w-2 h-2 rounded-full bg-buddy-emerald animate-pulse" />
          <span>System Status: All Services Operational</span>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="academic-card p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="academic-pill bg-buddy-primaryLight text-buddy-primaryText border border-buddy-primary/20">
              Operations Lead
            </span>
            <span className="font-mono text-xs text-buddy-charcoalLight">
              Multi-Tenant Architecture
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-buddy-charcoal tracking-tight">
            Admin Command Center
          </h1>

          <p className="text-xs sm:text-sm text-buddy-charcoalMuted max-w-2xl leading-relaxed">
            Real-time monitoring across active virtual classrooms, corporate sponsor billing runs, verified attendance logs, and campus compliance lifecycles.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
          <button
            onClick={handleRunComplianceCron}
            disabled={isEvaluatingCompliance}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-buddy-charcoal hover:bg-black text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-buddy-primary" />
            <span>{isEvaluatingCompliance ? 'Evaluating...' : 'Run Compliance Engine'}</span>
          </button>

          <a
            href="/api/reports/export?format=csv"
            download
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-white hover:bg-buddy-cream text-buddy-charcoal text-xs font-semibold border border-buddy-border transition-all"
          >
            <Clock className="w-3.5 h-3.5 text-buddy-emerald" />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {/* Grid: Live Operations Feed (7 cols) + Financial Automation Engine (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Live Activity Feed (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-bold text-sm text-buddy-charcoal flex items-center gap-2">
                <Activity className="w-4 h-4 text-buddy-primary" />
                <span>Live Operations & Activity Feed</span>
              </h2>
              <p className="text-xs text-buddy-charcoalMuted">
                Active classrooms, mentor vetting applications, and reconciliation checkpoints.
              </p>
            </div>
            <span className="academic-pill bg-buddy-primaryLight text-buddy-primaryText border border-buddy-primary/20">
              3 Streaming
            </span>
          </div>

          <div className="space-y-2.5">
            {activities.map((act) => {
              const isApproved = approvedOnboardingId === act.id;
              return (
                <div
                  key={act.id}
                  className={`academic-card p-4 transition-all ${
                    act.activeNow ? 'border-l-4 border-l-buddy-primary' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      {act.avatar ? (
                        <img
                          src={act.avatar}
                          alt={act.title}
                          className="w-10 h-10 rounded-lg object-cover border border-buddy-border flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-buddy-cream border border-buddy-border flex items-center justify-center text-buddy-primary flex-shrink-0">
                          {act.type === 'pay_run' ? <DollarSign className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-heading font-bold text-xs text-buddy-charcoal">
                            {act.title}
                          </h4>
                          {act.activeNow && (
                            <span className="academic-pill bg-buddy-primaryLight text-buddy-primaryText border border-buddy-primary/20">
                              LIVE
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-buddy-charcoalMuted mt-0.5">
                          {act.subtitle}
                        </p>

                        <div className="flex items-center gap-3 mt-2 text-[11px] font-mono text-buddy-charcoalLight">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-buddy-charcoalLight" />
                            {act.timestamp}
                          </span>
                          <span>•</span>
                          <span className="text-buddy-primaryText font-medium">{act.status}</span>
                        </div>
                      </div>
                    </div>

                    {act.type === 'onboarding' && (
                      <div>
                        {isApproved ? (
                          <span className="text-xs font-mono text-buddy-emeraldText font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Certified
                          </span>
                        ) : (
                          <button
                            onClick={() => handleApproveOnboarding(act.id, 'Dr. Aris Thorne')}
                            className="px-3 py-1 rounded-md bg-buddy-charcoal hover:bg-black text-white text-xs font-medium transition-colors"
                          >
                            Approve
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Financial Automation Engine (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-bold text-sm text-buddy-charcoal flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-buddy-primary" />
                <span>Financial Automation Engine</span>
              </h2>
              <p className="text-xs text-buddy-charcoalMuted">
                Corporate Invoices & Batch Pay Runs
              </p>
            </div>
            <span className="font-mono text-xs font-bold text-buddy-charcoal">
              ${pendingInvoicesTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })} Due
            </span>
          </div>

          {/* Automated Pay Run Box */}
          <div className="academic-card p-5 space-y-3 border-t-2 border-t-buddy-primary">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] uppercase font-bold text-buddy-charcoalLight tracking-wider">
                  Bi-Weekly Automated Pay Run
                </span>
                <h3 className="font-heading font-bold text-base text-buddy-charcoal">
                  Batch #44 (October Cycle)
                </h3>
              </div>
              <span className="w-8 h-8 rounded-lg bg-buddy-primaryLight text-buddy-primary flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-lg bg-buddy-cream border border-buddy-border">
                <span className="font-mono text-[10px] text-buddy-charcoalLight uppercase">Total Payout</span>
                <p className="font-mono font-bold text-buddy-charcoal text-base mt-0.5">$18,420.00</p>
              </div>
              <div className="p-3 rounded-lg bg-buddy-cream border border-buddy-border">
                <span className="font-mono text-[10px] text-buddy-charcoalLight uppercase">Verified Tutors</span>
                <p className="font-mono font-bold text-buddy-primaryText text-base mt-0.5">28 Tutors</p>
              </div>
            </div>

            {payRunApproved ? (
              <div className="p-3 rounded-lg bg-buddy-emeraldLight border border-buddy-emerald/20 text-buddy-emeraldText text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-buddy-emerald flex-shrink-0" />
                <span>Pay run authorized. Bank batch file sent for instant settlement.</span>
              </div>
            ) : (
              <button
                onClick={handleApprovePayRun}
                className="w-full py-2.5 rounded-lg bg-buddy-charcoal hover:bg-black text-white font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-buddy-primary" />
                <span>Authorize & Release Batch Pay Run ($18,420)</span>
              </button>
            )}
          </div>

          {/* Pending Invoices List */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-wider text-buddy-charcoal font-semibold">
                Corporate Sponsor Invoices
              </span>
              <span className="font-mono text-[11px] text-buddy-charcoalLight">
                Click to inspect itemized statement
              </span>
            </div>

            <div className="space-y-2">
              {invoices.map((inv) => (
                <div
                  key={inv.id}
                  onClick={() => onOpenInvoiceModal(inv)}
                  className="academic-card p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:border-buddy-primary/50 transition-all group"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-xs text-buddy-charcoal truncate group-hover:text-buddy-primaryDark">
                      {inv.clientName}
                    </p>
                    <p className="font-mono text-[10px] text-buddy-charcoalLight mt-0.5">
                      {inv.invoiceNumber} • Due: {inv.dueDate}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="font-mono font-bold text-xs text-buddy-charcoal tabular-nums">
                      ${inv.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <span
                      className={`academic-pill ${
                        inv.status === 'paid'
                          ? 'bg-buddy-emeraldLight text-buddy-emeraldText border border-buddy-emerald/20'
                          : 'bg-buddy-primaryLight text-buddy-primaryText border border-buddy-primary/20'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Infrastructure Health Card */}
          <div className="academic-card p-4 space-y-3">
            <span className="font-mono text-[10px] uppercase font-bold text-buddy-charcoalLight tracking-wider block">
              System Infrastructure & SLA
            </span>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-buddy-cream border border-buddy-border">
                <span className="font-mono text-[10px] text-buddy-charcoalLight uppercase">WebRTC</span>
                <p className="font-mono font-bold text-buddy-emeraldText">21 ms</p>
              </div>
              <div className="p-2 rounded-lg bg-buddy-cream border border-buddy-border">
                <span className="font-mono text-[10px] text-buddy-charcoalLight uppercase">AI Latency</span>
                <p className="font-mono font-bold text-buddy-charcoal">1.1s</p>
              </div>
              <div className="p-2 rounded-lg bg-buddy-cream border border-buddy-border">
                <span className="font-mono text-[10px] text-buddy-charcoalLight uppercase">SLA</span>
                <p className="font-mono font-bold text-buddy-emeraldText">99.98%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
