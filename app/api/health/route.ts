import { NextResponse } from 'next/server';
import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';

const req = createRequire(import.meta.url);
const { DatabaseSync } = req('node:sqlite');

export async function GET() {
  try {
    const dbDir = path.join(process.cwd(), 'data', 'db');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    const dbPath = path.join(dbDir, 'buddy.sqlite');
    const db = new DatabaseSync(dbPath);
    
    db.exec('CREATE TABLE IF NOT EXISTS _health (id INTEGER PRIMARY KEY, ping TEXT);');
    const insert = db.prepare('INSERT OR REPLACE INTO _health (id, ping) VALUES (1, ?)');
    insert.run(new Date().toISOString());
    
    const row = db.prepare('SELECT ping FROM _health WHERE id = 1').get() as { ping: string } | undefined;
    
    return NextResponse.json({
      status: 'healthy',
      database: 'node:sqlite',
      path: dbPath,
      lastPing: row?.ping,
      nodeVersion: process.version,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
}
