const { getRekapPegawai } = require('./src/services/rekap.service');

(async () => {
  try {
    const start = new Date('2026-02-01T00:00:00Z');
    const end = new Date('2026-03-01T00:00:00Z');
    const id = 1; // try with 1
    console.log('Calling getRekapPegawai with', { id, start: start.toISOString(), end: end.toISOString() });
    const res = await getRekapPegawai(id, start, end);
    console.log('Result:', res);
    process.exit(0);
  } catch (err) {
    console.error('Error in debug script:', err);
    process.exit(1);
  }
})();