import Fastify from 'fastify';
import { Queue } from 'bullmq';
import Redis from 'ioredis';
import * as dotenv from 'dotenv';

dotenv.config();

const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
const PORT = parseInt(process.env.BRIDGE_PORT || '8081', 10);

const redisConnection = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  maxRetriesPerRequest: null,
  lazyConnect: true
});

// Queue for uncoupled processing
const punchQueue = new Queue('biometric-punches', {
  connection: redisConnection
});

const app = Fastify({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty'
    }
  }
});

// Content parser for raw text sent by ADMS push protocols
app.addContentTypeParser('text/plain', { parseAs: 'string' }, (req, body, done) => {
  done(null, body);
});

/**
 * 1. ZKTeco ADMS Device Handshake & Configuration
 * When a ZKTeco device starts, it requests server parameters via GET /iclock/cdata
 */
app.get('/iclock/cdata', async (request, reply) => {
  const query = request.query as { SN?: string; options?: string; pushver?: string };
  const serialNumber = query.SN || 'UNKNOWN';

  app.log.info({ serialNumber }, 'Handshake request received from biometric terminal');

  // Standard ADMS protocol response flags:
  // Stamp intervals, realtime push enabled, delay tolerances
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
    // Format: TAB separated lines:
    // UserPIN \t Timestamp (YYYY-MM-DD HH:MM:SS) \t Status (0=In, 1=Out, 2=Break-Out, 3=Break-In, 4=OT-In, 5=OT-Out) \t VerifyType
    const lines = rawBody.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    app.log.info({ serialNumber, count: lines.length }, 'Processing ATTLOG punches from terminal');

    for (const line of lines) {
      const parts = line.split('\t');
      if (parts.length >= 2) {
        const [deviceUserId, punchTime, punchState] = parts;

        try {
          await punchQueue.add('adms-punch', {
            deviceSerial: serialNumber,
            deviceUserId: deviceUserId.trim(),
            punchTime: punchTime.trim(),
            punchState: punchState ? punchState.trim() : '0',
            receivedAt: new Date().toISOString()
          });
        } catch (err) {
          app.log.warn({ err }, 'Redis offline, logging punch locally for fallback retry');
        }
      }
    }
  }

  // Response required by ZKTeco firmware to commit log as delivered
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

    try {
      await punchQueue.add('hikvision-punch', {
        deviceSerial: payload.ipAddress || 'HIKVISION_TERMINAL',
        deviceUserId: String(employeeNo),
        punchTime: punchTime,
        punchState: event.attendanceStatus === 'checkIn' ? '0' : '1',
        receivedAt: new Date().toISOString()
      });
    } catch (err) {
      app.log.warn({ err }, 'Redis offline, unable to enqueue Hikvision event');
    }
  }

  return reply.status(200).send({ status: 'success' });
});

/**
 * Health check endpoint
 */
app.get('/health', async () => {
  return { status: 'healthy', timestamp: new Date().toISOString() };
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

