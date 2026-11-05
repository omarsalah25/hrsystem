import { Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import puppeteer from 'puppeteer';
import * as fs from 'fs/promises';
import * as path from 'path';
import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config();

const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
const LARAVEL_STORAGE_PRIVATE = process.env.LARAVEL_PRIVATE_STORAGE_PATH ||
  path.resolve(__dirname, '../../backend/storage/app/private');

const redisConn = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  maxRetriesPerRequest: null,
  lazyConnect: true
});

// MySQL connection pool for workers
const dbPool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'hrsystem_db',
  waitForConnections: true,
  connectionLimit: 10
});

console.log('🚀 Initializing HRIS BullMQ Workers...');

// -------------------------------------------------------------
// 1. Payslip PDF Rendering Worker (Puppeteer with Arabic / RTL support)
// -------------------------------------------------------------
export const payslipWorker = new Worker(
  'payslip-pdf-queue',
  async (job: Job) => {
    const { payslipId, tenantId, htmlContent, relativePath } = job.data;
    const targetFilePath = path.join(LARAVEL_STORAGE_PRIVATE, relativePath);

    console.log(`[PayslipWorker] Generating PDF for payslip ${payslipId} -> ${targetFilePath}`);

    // Ensure destination folder exists
    await fs.mkdir(path.dirname(targetFilePath), { recursive: true });

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

      // Generate standard A4 PDF with background graphics enabled
      await page.pdf({
        path: targetFilePath,
        format: 'A4',
        printBackground: true,
        margin: { top: '12mm', right: '12mm', bottom: '12mm', left: '12mm' }
      });

      // Update payslip record in MySQL
      await dbPool.execute(
        'UPDATE payslips SET pdf_file_path = ?, is_published = 1, updated_at = NOW() WHERE id = ?',
        [relativePath, payslipId]
      );

      console.log(`[PayslipWorker] Successfully rendered PDF for payslip ${payslipId}`);
      return { success: true, relativePath };
    } finally {
      await browser.close();
    }
  },
  { connection: redisConn, concurrency: 3 }
);

// -------------------------------------------------------------
// 2. Biometric Punch Ingestion & Pairing Worker
// -------------------------------------------------------------
export const punchWorker = new Worker(
  'biometric-punches',
  async (job: Job) => {
    const { deviceSerial, deviceUserId, punchTime, punchState } = job.data;
    console.log(`[PunchWorker] Processing punch from terminal ${deviceSerial} for user PIN ${deviceUserId} at ${punchTime}`);

    const [rows]: any = await dbPool.execute(
      'SELECT id, tenant_id FROM employees WHERE biometric_device_user_id = ? LIMIT 1',
      [deviceUserId]
    );

    if (!rows || rows.length === 0) {
      console.warn(`[PunchWorker] Unmapped biometric user PIN ${deviceUserId}. Punch logged for manual reconciliation.`);
      return { status: 'unmapped_user' };
    }

    const employee = rows[0];
    const punchDate = punchTime.split(' ')[0]; // YYYY-MM-DD

    // 1. Insert into raw punches table
    await dbPool.execute(
      `INSERT INTO attendance_punches 
       (id, tenant_id, employee_id, punch_time, punch_type, source, device_serial, created_at)
       VALUES (UUID(), ?, ?, ?, ?, 'BIOMETRIC_ADMS', ?, NOW())`,
      [employee.tenant_id, employee.id, punchTime, punchState === '0' ? 'IN' : 'OUT', deviceSerial]
    );

    // 2. Upsert into daily attendance sheet
    await dbPool.execute(
      `INSERT INTO attendance_records 
       (id, tenant_id, employee_id, date, first_punch_in, last_punch_out, status, source, created_at, updated_at)
       VALUES (UUID(), ?, ?, ?, ?, ?, 'PRESENT', 'BIOMETRIC', NOW(), NOW())
       ON DUPLICATE KEY UPDATE
         first_punch_in = LEAST(COALESCE(first_punch_in, VALUES(first_punch_in)), VALUES(first_punch_in)),
         last_punch_out = GREATEST(COALESCE(last_punch_out, VALUES(last_punch_out)), VALUES(last_punch_out)),
         total_hours_worked = ROUND(TIMESTAMPDIFF(MINUTE, first_punch_in, last_punch_out) / 60, 2),
         updated_at = NOW()`,
      [employee.tenant_id, employee.id, punchDate, punchTime, punchTime]
    );

    return { status: 'synced', employeeId: employee.id };
  },
  { connection: redisConn, concurrency: 5 }
);

payslipWorker.on('completed', (job) => {
  console.log(`[PayslipWorker] Job ${job.id} completed successfully.`);
});

punchWorker.on('completed', (job) => {
  console.log(`[PunchWorker] Punch job ${job.id} matched successfully.`);
});

