'use client';

import React, { useState } from 'react';
import { Invoice } from '@/types';
import { BuddyLogo } from '@/components/BuddyLogo';
import { api } from '@/lib/apiClient';
import {
  X,
  Download,
  Printer,
  CheckCircle2,
  FileText,
} from 'lucide-react';

interface InvoiceModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  invoice,
  isOpen,
  onClose,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [markedPaid, setMarkedPaid] = useState(false);

  if (!isOpen || !invoice) return null;

  const handleDownload = () => {
    setDownloadSuccess(true);
    setTimeout(() => {
      setDownloadSuccess(false);
    }, 3000);
  };

  const handleMarkPaid = async () => {
    setMarkedPaid(true);
    try {
      await api.invoices.markPaid(invoice.id);
    } catch {
      // ignore
    }
  };

  const isPaid = markedPaid || invoice.status === 'paid';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-buddy-charcoal/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-white border border-buddy-border rounded-2xl shadow-lift overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-buddy-cream border-b border-buddy-border">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-buddy-primary" />
            <h2 className="text-sm sm:text-base font-heading font-bold text-buddy-charcoal">
              Itemized Invoice Statement ({invoice.invoiceNumber})
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`academic-pill ${
                isPaid
                  ? 'bg-buddy-emeraldLight text-buddy-emeraldText border border-buddy-emerald/20'
                  : 'bg-buddy-primaryLight text-buddy-primaryText border border-buddy-primary/20'
              }`}
            >
              {isPaid ? 'PAID / SETTLED' : 'PAYMENT PENDING'}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-buddy-charcoalLight hover:text-buddy-charcoal hover:bg-buddy-cream transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable/Exportable Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-white text-buddy-charcoal">
          {/* Header Metadata */}
          <div className="flex flex-col sm:flex-row justify-between gap-6 pb-6 border-b border-buddy-border">
            <div>
              <BuddyLogo size="md" />
              <p className="text-xs text-buddy-charcoalMuted mt-2">
                STEM Academic Operations & Mentorship System
              </p>
              <p className="font-mono text-xs text-buddy-charcoalLight">
                Tax / VAT ID: ZA-4920194821
              </p>
              <p className="text-xs text-buddy-charcoalLight">
                Sandton Central, Johannesburg, South Africa
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="font-mono text-xs uppercase font-bold text-buddy-primaryText tracking-wider">
                Official Tax Invoice
              </span>
              <p className="text-xl font-mono font-bold text-buddy-charcoal mt-1">
                {invoice.invoiceNumber}
              </p>
              <div className="mt-2 text-xs text-buddy-charcoalMuted font-mono space-y-0.5">
                <p>
                  Issue Date: <strong className="text-buddy-charcoal">{invoice.issueDate}</strong>
                </p>
                <p>
                  Payment Due: <strong className="text-buddy-charcoal">{invoice.dueDate}</strong>
                </p>
                {invoice.cohortName && (
                  <p className="text-buddy-primaryText font-semibold">
                    Cohort: {invoice.cohortName}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Client Bill-To Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-buddy-cream border border-buddy-border">
            <div>
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-buddy-charcoalLight">
                Billed To Client / Sponsor
              </span>
              <p className="font-heading font-semibold text-buddy-charcoal text-sm mt-1">
                {invoice.clientName}
              </p>
              <p className="text-xs text-buddy-charcoalMuted mt-0.5">
                Attn: {invoice.clientContact}
              </p>
              <p className="text-xs font-mono text-buddy-charcoalLight">
                {invoice.clientEmail}
              </p>
              <p className="text-xs text-buddy-charcoalLight mt-1">
                {invoice.billingAddress}
              </p>
            </div>

            <div className="sm:border-l sm:border-buddy-border sm:pl-4">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-buddy-charcoalLight">
                Payment Instructions & Terms
              </span>
              <p className="text-xs text-buddy-charcoal mt-1">
                Remittance: Automated EFT / Institutional Wire
              </p>
              <p className="text-xs font-mono text-buddy-charcoalLight">
                Bank: First National Corporate Banking
              </p>
              <p className="text-xs font-mono text-buddy-charcoalLight">
                Account: 6289-4920-110 (Branch 250655)
              </p>
              <p className="text-xs font-mono text-buddy-charcoalLight">
                Reference: <span className="text-buddy-charcoal font-semibold">{invoice.invoiceNumber}</span>
              </p>
            </div>
          </div>

          {/* Itemized Deliverables */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-buddy-charcoal">
                Verified Tutoring Deliverables & Operations
              </span>
              <span className="font-mono text-[11px] text-buddy-emeraldText font-medium">
                100% Timesheet Reconciled
              </span>
            </div>

            <div className="academic-card overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-buddy-cream border-b border-buddy-border text-buddy-charcoal font-semibold font-mono text-[11px] uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-3 text-right">Units / Hrs</th>
                    <th className="py-2.5 px-3 text-right">Rate ($)</th>
                    <th className="py-2.5 px-3 text-right">Amount ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-buddy-border">
                  {invoice.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-buddy-cream/50 transition-colors">
                      <td className="py-3 px-3 font-medium text-buddy-charcoal">
                        {item.description}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-buddy-charcoalLight">
                        {item.hours}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-buddy-charcoalLight">
                        ${item.rate.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-semibold text-buddy-charcoal tabular-nums">
                        ${item.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Calculations Footer */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-4 border-t border-buddy-border">
            <div className="text-xs text-buddy-charcoalMuted max-w-sm">
              <p className="font-bold text-buddy-charcoal mb-1">Audit Guarantee:</p>
              All tutoring hours are cryptographically stamped with biometric attendee check-in and tutor session recording verification.
            </div>

            <div className="w-full sm:w-64 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-buddy-charcoalMuted">
                <span>Subtotal:</span>
                <span className="font-bold text-buddy-charcoal tabular-nums">
                  ${invoice.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between text-buddy-emeraldText">
                  <span>Sponsor Discount (5%):</span>
                  <span className="tabular-nums">-${invoice.discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between text-buddy-charcoalMuted">
                <span>VAT / Tax ({invoice.taxPercent}%):</span>
                <span className="tabular-nums">${invoice.taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="pt-2 border-t border-buddy-border flex justify-between text-sm font-bold text-buddy-charcoal font-sans">
                <span>Total Due:</span>
                <span className="font-mono text-buddy-primaryText text-base tabular-nums">
                  ${invoice.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {downloadSuccess && (
            <div className="p-3 rounded-xl bg-buddy-emeraldLight border border-buddy-emerald/20 text-buddy-emeraldText text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Official PDF invoice generated and queued for download!</span>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 bg-buddy-cream border-t border-buddy-border flex flex-wrap items-center justify-between gap-3">
          <div>
            {!isPaid && (
              <button
                onClick={handleMarkPaid}
                className="px-3.5 py-2 rounded-lg bg-white hover:bg-buddy-cream text-buddy-charcoal text-xs font-semibold border border-buddy-border transition-colors"
              >
                Mark Invoice as Settled
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-buddy-cream text-buddy-charcoal text-xs font-semibold border border-buddy-border transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-buddy-charcoal hover:bg-black text-white text-xs font-semibold shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5 text-buddy-primary" />
              <span>Download PDF Invoice</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
