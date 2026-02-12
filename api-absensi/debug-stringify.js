const { getRekapPegawai } = require('./src/services/rekap.service');

(async () => {
  try {
    const start = new Date('2026-02-01T00:00:00Z');
    const end = new Date('2026-03-01T00:00:00Z');
    const res = await getRekapPegawai(1, start, end);
    console.log('Raw:', res[0]);
    console.log('Stringify attempt:');
    console.log(JSON.stringify(res[0]));
  } catch (err) {
    console.error('Stringify Error:', err);
  }
})();