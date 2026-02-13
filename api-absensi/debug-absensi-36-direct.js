const prisma = require('./src/utils/prisma');

(async () => {
  try {
    const id = 36;
    const start = new Date('2026-02-01T00:00:00Z');
    const end = new Date('2026-03-01T00:00:00Z');
    console.log('Querying absensi for', { id, start: start.toISOString(), end: end.toISOString() });
    const rows = await prisma.absensi.findMany({ where: { id_pegawai: id, tgl_absensi: { gte: start, lt: end } } });
    console.log('Rows length:', rows.length);
    console.log(rows);
    process.exit(0);
  } catch (err) {
    console.error('Err', err);
    process.exit(1);
  }
})();