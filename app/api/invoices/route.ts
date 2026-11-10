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

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    let sql = 'SELECT * FROM invoices WHERE 1=1';
    const params: any[] = [];

    if (status && status !== 'all') {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY issue_date DESC';

    const rows = db.prepare(sql).all(...params);
    const invoices = rows.map(mapRowToInvoice);

    return NextResponse.json({ success: true, count: invoices.length, data: invoices });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    const body = await req.json();

    const id = `inv-${Date.now().toString(36)}`;
    const invoiceNumber = body.invoiceNumber || `BL-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const clientName = body.clientName || 'Anglo American Educational Trust';
    const clientType = body.clientType || 'corporate_sponsor';
    const clientContact = body.clientContact || 'Dr. Thandiwe Mthembu';
    const clientEmail = body.clientEmail || 'bursaries@angloamerican.com';
    const billingAddress = body.billingAddress || '55 Marshall Street, Johannesburg, 2001';
    const issueDate = body.issueDate || new Date().toISOString().split('T')[0];
    const dueDate = body.dueDate || '2026-11-15';
    const items = body.items || [
      {
        description: 'STEM Mentorship Hours (Grade 12 Cohort)',
        hours: 40,
        rate: 55,
        total: 2200,
      },
    ];

    const subtotal = items.reduce((acc: number, item: any) => acc + (item.total || item.hours * item.rate), 0);
    const discount = body.discount || 0;
    const taxPercent = body.taxPercent || 15;
    const taxable = subtotal - discount;
    const taxAmount = Number(((taxable * taxPercent) / 100).toFixed(2));
    const total = Number((taxable + taxAmount).toFixed(2));
    const status = body.status || 'pending';
    const cohortName = body.cohortName || 'Anglo American STEM Scholars';
    const createdAt = new Date().toISOString();

    db.prepare(`
      INSERT INTO invoices (
        id, invoice_number, client_name, client_type, client_contact,
        client_email, billing_address, issue_date, due_date, items,
        subtotal, discount, tax_percent, tax_amount, total, status,
        cohort_name, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, invoiceNumber, clientName, clientType, clientContact,
      clientEmail, billingAddress, issueDate, dueDate, JSON.stringify(items),
      subtotal, discount, taxPercent, taxAmount, total, status,
      cohortName, createdAt
    );

    const created = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id);
    return NextResponse.json({ success: true, data: mapRowToInvoice(created) }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
