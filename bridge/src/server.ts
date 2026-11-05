import Fastify from 'fastify';
import { Queue } from 'bullmq';
import Redis from 'ioredis';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
const PORT = parseInt(process.env.BRIDGE_PORT || '8081', 10);

let isRedisConnected = false;

// Create resilient Redis connection
const redisConnection = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  maxRetriesPerRequest: null,
  enableOfflineQueue: false,
  retryStrategy: (times) => {
    return Math.min(times * 1000, 5000);
  }
});

redisConnection.on('connect', () => {
  isRedisConnected = true;
  console.log('[Bridge] Connected to Redis queue server successfully.');
});

redisConnection.on('error', (err) => {
  if (isRedisConnected) {
    console.warn('[Bridge] Redis connection lost. Falling back to local buffer.');
  }
  isRedisConnected = false;
});

// Queue for uncoupled processing
let punchQueue: Queue | null = null;
try {
  punchQueue = new Queue('biometric-punches', {
    connection: redisConnection
  });
  punchQueue.on('error', () => {
    // Suppress unhandled queue connection errors when redis is offline
  });
} catch (e) {
  console.warn('[Bridge] Queue initialized in fallback mode');
}

const app = Fastify({
  logger: true
});

// Content parser for raw text sent by ADMS push protocols
app.addContentTypeParser('text/plain', { parseAs: 'string' }, (req, body, done) => {
  done(null, body);
});

// Fallback buffer writer when Redis is down
function logPunchFallback(record: Record<string, any>) {
  try {
    const logLine = JSON.stringify(record) + '\n';
    const filePath = path.resolve(__dirname, '../punches_fallback.log');
    fs.appendFileSync(filePath, logLine, 'utf8');
  } catch (err) {
    console.error('[Bridge] Failed to write to local fallback punch log:', err);
  }
}

/**
 * 1. ZKTeco ADMS Device Handshake & Configuration
 * When a ZKTeco device starts, it requests server parameters via GET /iclock/cdata
 */
app.get('/iclock/cdata', async (request, reply) => {
  const query = request.query as { SN?: string; options?: string; pushver?: string };
  const serialNumber = query.SN || 'UNKNOWN';

  app.log.info({ serialNumber }, 'Handshake request received from biometric terminal');

  const responsePayload = [
    `GET OPTION FROM: ${serialNumber}`,
    'ATTLOGStamp=None',
    'OPERLOGStamp=None',
    'ErrorDelay=30',
    'Delay=10',
    'TransTimes=00:00;14:05',
    'TransInterval=1',
    'TransFlag=1111000000',
    'TimeZone=2',
    'Realtime=1',
    'Encrypt=0'
  ].join('\n');

  return reply.type('text/plain').send(responsePayload);
});

/**
 * 2. ZKTeco Real-time Punch Ingestion (POST /iclock/cdata?SN=...&table=ATTLOG)
 */
app.post('/iclock/cdata', async (request, reply) => {
  const query = request.query as { SN?: string; table?: string };
  const rawBody = (request.body as string) || '';
  const serialNumber = query.SN || 'UNKNOWN';

  if (query.table === 'ATTLOG') {
    const lines = rawBody.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    app.log.info({ serialNumber, count: lines.length }, 'Processing ATTLOG punches from terminal');

    for (const line of lines) {
      const parts = line.split('\t');
      if (parts.length >= 2) {
        const [deviceUserId, punchTime, punchState] = parts;
        const punchData = {
          deviceSerial: serialNumber,
          deviceUserId: deviceUserId.trim(),
          punchTime: punchTime.trim(),
          punchState: punchState ? punchState.trim() : '0',
          receivedAt: new Date().toISOString()
        };

        if (isRedisConnected && punchQueue) {
          try {
            await punchQueue.add('adms-punch', punchData);
          } catch (err) {
            logPunchFallback(punchData);
          }
        } else {
          logPunchFallback(punchData);
        }
      }
    }
  }

  return reply.type('text/plain').send('OK');
});

/**
 * 3. Hikvision Terminal HTTP Event Notification Endpoint
 */
app.post('/api/hikvision/event', async (request, reply) => {
  const payload = request.body as any;
  app.log.info({ payload }, 'Hikvision terminal event received');

  if (payload?.AccessControllerEvent) {
    const event = payload.AccessControllerEvent;
    const employeeNo = event.employeeNoString || event.cardNo;
    const punchTime = event.attendanceStatus ? event.dateTime : new Date().toISOString();

    const punchData = {
      deviceSerial: payload.ipAddress || 'HIKVISION_TERMINAL',
      deviceUserId: String(employeeNo),
      punchTime: punchTime,
      punchState: event.attendanceStatus === 'checkIn' ? '0' : '1',
      receivedAt: new Date().toISOString()
    };

    if (isRedisConnected && punchQueue) {
      try {
        await punchQueue.add('hikvision-punch', punchData);
      } catch (err) {
        logPunchFallback(punchData);
      }
    } else {
      logPunchFallback(punchData);
    }
  }

  return reply.status(200).send({ status: 'success' });
});

/**
 * Health check endpoint
 */
app.get('/health', async () => {
  return {
    status: 'healthy',
    redis: isRedisConnected ? 'connected' : 'offline_fallback',
    timestamp: new Date().toISOString()
  };
});

const start = async () => {
  try {
    await app.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`🚀 Biometric Hardware Bridge listening on http://0.0.0.0:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
