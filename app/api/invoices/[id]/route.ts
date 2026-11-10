import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/server/db';
import { Invoice } from '@/types';

function mapRowToInvoice(r: any): Invoice {
  return {
    id: r.id,
    invoiceNumber: r.invoice_number,
    clientName: r.client_name,
    clientType: r.client_type,
    clientContact: r.client_contact,
    clientEmail: r.client_email,
    billingAddress: r.billing_address,
    issueDate: r.issue_date,
    dueDate: r.due_date,
    items: JSON.parse(r.items),
    subtotal: r.subtotal,
    discount: r.discount,
    taxPercent: r.tax_percent,
    taxAmount: r.tax_amount,
    total: r.total,
    status: r.status,
    cohortName: r.cohort_name || undefined,
  };
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const row = db.prepare('SELECT * FROM invoices WHERE id = ?').get(params.id);
    if (!row) {
      return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: mapRowToInvoice(row) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const body = await req.json();

    const existing = db.prepare('SELECT * FROM invoices WHERE id = ?').get(params.id);
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 });
    }

    if (body.status !== undefined) {
      db.prepare('UPDATE invoices SET status = ? WHERE id = ?').run(body.status, params.id);
    }

    const updated = db.prepare('SELECT * FROM invoices WHERE id = ?').get(params.id);
    return NextResponse.json({ success: true, data: mapRowToInvoice(updated) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
