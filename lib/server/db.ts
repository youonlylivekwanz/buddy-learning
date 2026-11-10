import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';
import {
  MOCK_LESSONS,
  MOCK_SESSION_LOGS,
  MOCK_INVOICES,
  MOCK_RESOURCES,
  MOCK_NOTICES,
  MOCK_SPONSOR_STUDENTS,
  INITIAL_LEARNER,
  MOCK_BADGES,
  MOCK_TUTOR_SCHEDULE,
} from '@/data/mockData';

const req = createRequire(import.meta.url);
const { DatabaseSync } = req('node:sqlite');

let dbInstance: any = null;

export function getDb() {
  if (dbInstance) {
    return dbInstance;
  }

  const dbDir = path.join(process.cwd(), 'data', 'db');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dbPath = path.join(dbDir, 'buddy.sqlite');
  dbInstance = new DatabaseSync(dbPath);

  // Initialize Schema
  initSchema(dbInstance);

  return dbInstance;
}

function initSchema(db: any) {
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    -- Lessons Table
    CREATE TABLE IF NOT EXISTS lessons (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      subject TEXT NOT NULL,
      grade TEXT NOT NULL,
      tutor_id TEXT NOT NULL,
      tutor_name TEXT NOT NULL,
      tutor_avatar TEXT,
      learner_id TEXT NOT NULL,
      learner_name TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      status TEXT NOT NULL,
      meeting_url TEXT NOT NULL,
      room_code TEXT NOT NULL,
      ai_summary TEXT,
      recording_url TEXT,
      created_at TEXT NOT NULL
    );

    -- Tutor Session Logs Table
    CREATE TABLE IF NOT EXISTS session_logs (
      id TEXT PRIMARY KEY,
      tutor_id TEXT NOT NULL,
      tutor_name TEXT NOT NULL,
      learner_id TEXT NOT NULL,
      learner_name TEXT NOT NULL,
      subject TEXT NOT NULL,
      date TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      rate_tier TEXT NOT NULL,
      hourly_rate REAL NOT NULL,
      total_earned REAL NOT NULL,
      attendance_status TEXT NOT NULL,
      notes TEXT,
      ai_summary_generated INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'approved',
      created_at TEXT NOT NULL
    );

    -- Invoices Table
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      invoice_number TEXT UNIQUE NOT NULL,
      client_name TEXT NOT NULL,
      client_type TEXT NOT NULL,
      client_contact TEXT NOT NULL,
      client_email TEXT NOT NULL,
      billing_address TEXT NOT NULL,
      issue_date TEXT NOT NULL,
      due_date TEXT NOT NULL,
      items TEXT NOT NULL,
      subtotal REAL NOT NULL,
      discount REAL NOT NULL DEFAULT 0,
      tax_percent REAL NOT NULL DEFAULT 15,
      tax_amount REAL NOT NULL,
      total REAL NOT NULL,
      status TEXT NOT NULL,
      cohort_name TEXT,
      created_at TEXT NOT NULL
    );

    -- Pay Runs Table
    CREATE TABLE IF NOT EXISTS payruns (
      id TEXT PRIMARY KEY,
      batch_number TEXT NOT NULL,
      title TEXT NOT NULL,
      total_tutors INTEGER NOT NULL,
      total_hours INTEGER NOT NULL,
      total_amount REAL NOT NULL,
      status TEXT NOT NULL,
      authorized_at TEXT,
      authorized_by TEXT
    );

    -- Resources / Study Vault Table
    CREATE TABLE IF NOT EXISTS resources (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      subject TEXT NOT NULL,
      type TEXT NOT NULL,
      file_size TEXT NOT NULL,
      format TEXT NOT NULL,
      download_count INTEGER NOT NULL DEFAULT 0,
      upload_date TEXT NOT NULL,
      grade_level TEXT NOT NULL,
      tags TEXT NOT NULL,
      description TEXT
    );

    -- Notice Board Table
    CREATE TABLE IF NOT EXISTS notices (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      date TEXT NOT NULL,
      pinned INTEGER NOT NULL DEFAULT 0,
      priority TEXT NOT NULL,
      summary TEXT NOT NULL,
      author TEXT NOT NULL,
      action_text TEXT,
      action_payload TEXT,
      created_at TEXT NOT NULL
    );

    -- Learners Table
    CREATE TABLE IF NOT EXISTS learners (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      avatar TEXT,
      grade INTEGER NOT NULL,
      school TEXT NOT NULL,
      sponsor_name TEXT NOT NULL,
      tutor_assigned TEXT NOT NULL,
      attendance_rate REAL NOT NULL,
      baseline_score INTEGER NOT NULL,
      current_score INTEGER NOT NULL,
      target_score INTEGER NOT NULL,
      hours_completed REAL NOT NULL,
      status TEXT NOT NULL,
      streak_count INTEGER NOT NULL DEFAULT 0,
      total_xp INTEGER NOT NULL DEFAULT 0,
      level INTEGER NOT NULL DEFAULT 1,
      badges TEXT,
      last_active_date TEXT
    );

    -- Tutor Availability Table
    CREATE TABLE IF NOT EXISTS tutor_availability (
      id TEXT PRIMARY KEY,
      tutor_id TEXT NOT NULL,
      day TEXT NOT NULL,
      slots TEXT NOT NULL
    );
  `);

  // Auto-seed if empty
  seedIfEmpty(db);
}

function seedIfEmpty(db: any) {
  const checkCount = db.prepare('SELECT COUNT(*) as count FROM lessons').get();
  if (checkCount.count > 0) {
    return; // Already seeded
  }

  const now = new Date().toISOString();

  // 1. Seed Lessons
  const insertLesson = db.prepare(`
    INSERT INTO lessons (
      id, title, subject, grade, tutor_id, tutor_name, tutor_avatar,
      learner_id, learner_name, date, time, duration_minutes,
      status, meeting_url, room_code, ai_summary, recording_url, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const l of MOCK_LESSONS) {
    insertLesson.run(
      l.id,
      l.title,
      l.subject,
      l.grade,
      'tut-01',
      l.tutorName,
      l.tutorAvatar || null,
      'learner-01',
      l.learnerName,
      l.date,
      l.time,
      l.durationMinutes,
      l.status,
      l.meetingUrl,
      l.roomCode,
      l.aiSummary ? JSON.stringify(l.aiSummary) : null,
      l.recordingUrl || null,
      now
    );
  }

  // 2. Seed Session Logs
  const insertLog = db.prepare(`
    INSERT INTO session_logs (
      id, tutor_id, tutor_name, learner_id, learner_name, subject,
      date, duration_minutes, rate_tier, hourly_rate, total_earned,
      attendance_status, notes, ai_summary_generated, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const log of MOCK_SESSION_LOGS) {
    insertLog.run(
      log.id,
      log.tutorId,
      log.tutorName,
      log.learnerId,
      log.learnerName,
      log.subject,
      log.date,
      log.durationMinutes,
      log.rateTier,
      log.hourlyRate,
      log.totalEarned,
      log.attendanceStatus,
      log.notes,
      log.aiSummaryGenerated ? 1 : 0,
      log.status,
      now
    );
  }

  // 3. Seed Invoices
  const insertInvoice = db.prepare(`
    INSERT INTO invoices (
      id, invoice_number, client_name, client_type, client_contact,
      client_email, billing_address, issue_date, due_date, items,
      subtotal, discount, tax_percent, tax_amount, total, status,
      cohort_name, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const inv of MOCK_INVOICES) {
    insertInvoice.run(
      inv.id,
      inv.invoiceNumber,
      inv.clientName,
      inv.clientType,
      inv.clientContact,
      inv.clientEmail,
      inv.billingAddress,
      inv.issueDate,
      inv.dueDate,
      JSON.stringify(inv.items),
      inv.subtotal,
      inv.discount,
      inv.taxPercent,
      inv.taxAmount,
      inv.total,
      inv.status,
      inv.cohortName || null,
      now
    );
  }

  // 4. Seed Payruns
  const insertPayrun = db.prepare(`
    INSERT INTO payruns (
      id, batch_number, title, total_tutors, total_hours, total_amount, status, authorized_at, authorized_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertPayrun.run(
    'pr-44',
    'BATCH #44',
    'Bi-Weekly Tutor Pay Run (Oct 15 - Oct 31)',
    28,
    412,
    18420.0,
    'Awaiting Authorization',
    null,
    null
  );
  insertPayrun.run(
    'pr-43',
    'BATCH #43',
    'Bi-Weekly Tutor Pay Run (Oct 01 - Oct 14)',
    26,
    384,
    17280.0,
    'Approved & Dispatched',
    '2026-10-15T09:30:00Z',
    'Chief Operations Officer'
  );

  // 5. Seed Resources
  const insertResource = db.prepare(`
    INSERT INTO resources (
      id, title, subject, type, file_size, format, download_count,
      upload_date, grade_level, tags, description
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const res of MOCK_RESOURCES) {
    insertResource.run(
      res.id,
      res.title,
      res.subject,
      res.type,
      res.fileSize,
      res.format,
      res.downloadCount,
      res.uploadDate,
      res.gradeLevel,
      JSON.stringify(res.tags),
      res.description
    );
  }

  // 6. Seed Notices
  const insertNotice = db.prepare(`
    INSERT INTO notices (
      id, title, category, date, pinned, priority, summary, author, action_text, action_payload, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const not of MOCK_NOTICES) {
    insertNotice.run(
      not.id,
      not.title,
      not.category,
      not.date,
      not.pinned ? 1 : 0,
      not.priority,
      not.summary,
      not.author,
      not.actionText || null,
      not.actionPayload || null,
      now
    );
  }

  // 7. Seed Learners
  const insertLearner = db.prepare(`
    INSERT INTO learners (
      id, name, email, avatar, grade, school, sponsor_name, tutor_assigned,
      attendance_rate, baseline_score, current_score, target_score,
      hours_completed, status, streak_count, total_xp, level, badges, last_active_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Insert initial active learner
  insertLearner.run(
    INITIAL_LEARNER.id,
    INITIAL_LEARNER.name,
    'zanele.khumalo@student.co.za',
    INITIAL_LEARNER.avatar,
    INITIAL_LEARNER.grade,
    INITIAL_LEARNER.school,
    INITIAL_LEARNER.sponsor,
    'Sipho Dlamini, MSc',
    96.4,
    58,
    88,
    92,
    INITIAL_LEARNER.completedHours,
    'excelling',
    INITIAL_LEARNER.streakCount,
    INITIAL_LEARNER.totalXp,
    INITIAL_LEARNER.level,
    JSON.stringify(MOCK_BADGES),
    '2026-10-24'
  );

  // Insert other cohort learners
  for (const st of MOCK_SPONSOR_STUDENTS) {
    if (st.id === INITIAL_LEARNER.id) continue;
    insertLearner.run(
      st.id,
      st.name,
      `${st.name.toLowerCase().replace(/\s+/g, '.')}@student.co.za`,
      st.avatar,
      st.grade,
      st.school,
      st.sponsorName,
      st.tutorAssigned,
      st.attendanceRate,
      st.baselineScore,
      st.currentScore,
      st.targetScore,
      st.hoursCompleted,
      st.status,
      10,
      1800,
      3,
      JSON.stringify([]),
      '2026-10-23'
    );
  }

  // 8. Seed Tutor Availability
  const insertAvail = db.prepare(`
    INSERT INTO tutor_availability (id, tutor_id, day, slots)
    VALUES (?, ?, ?, ?)
  `);

  for (const sched of MOCK_TUTOR_SCHEDULE) {
    insertAvail.run(
      `avail-tut-01-${sched.day}`,
      'tut-01',
      sched.day,
      JSON.stringify(sched.slots)
    );
  }
}
