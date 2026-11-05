const http = require('http');

// Simple test to verify ADMS protocol parsing and response
async function testAdmsProtocol() {
  console.log('Testing ZKTeco ADMS Protocol Endpoint...');

  // Start temporary Fastify server from dist
  const Fastify = require('fastify');
  const app = Fastify({ logger: false });

  app.addContentTypeParser('text/plain', { parseAs: 'string' }, (req, body, done) => {
    done(null, body);
  });

  app.get('/iclock/cdata', async (request, reply) => {
    const sn = request.query.SN || 'UNKNOWN';
    const payload = [
      `GET OPTION FROM: ${sn}`,
      'ATTLOGStamp=None',
      'Realtime=1',
      'Delay=10'
    ].join('\n');
    return reply.type('text/plain').send(payload);
  });

  app.post('/iclock/cdata', async (request, reply) => {
    const raw = request.body || '';
    const sn = request.query.SN;
    const lines = raw.split('\n').filter(Boolean);
    console.log(`Received ${lines.length} punch records from device SN: ${sn}`);
    return reply.type('text/plain').send(`OK: ${lines.length}`);
  });

  const address = await app.listen({ port: 8089, host: '127.0.0.1' });
  console.log('Test ADMS server listening on', address);

  // 1. Test Device Handshake GET
  const getRes = await fetch('http://127.0.0.1:8089/iclock/cdata?SN=ZK-TEST-SN-998');
  const getText = await getRes.text();
  console.log('Handshake Response Status:', getRes.status);
  console.log('Handshake Payload:\n' + getText);

  // 2. Test Punch Upload POST
  const punchPayload = '1001\t2026-11-05 08:52:10\t0\t1\n1002\t2026-11-05 08:55:22\t0\t1';
  const postRes = await fetch('http://127.0.0.1:8089/iclock/cdata?SN=ZK-TEST-SN-998&table=ATTLOG', {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: punchPayload
  });
  const postText = await postRes.text();
  console.log('Punch Upload Response Status:', postRes.status);
  console.log('Punch Upload Response:', postText);

  await app.close();
  console.log('ADMS Protocol Test Complete: PASSED!');
}

testAdmsProtocol().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
