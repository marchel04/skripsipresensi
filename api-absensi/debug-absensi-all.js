const prisma = require('./src/utils/prisma');

(async () => {
  try {
    const start = new Date('2026-02-01T00:00:00Z');
    const end = new Date('2026-03-01T00:00:00Z');

    const count = await prisma.absensi.count({
      where: { tgl_absensi: { gte: start, lt: end } }
    });

    console.log('Total absensi in Feb 2026:', count);

    if (count > 0) {
      const rows = await prisma.absensi.findMany({
        where: { tgl_absensi: { gte: start, lt: end } },
        orderBy: { tgl_absensi: 'asc' },
        take: 20,
      });
      console.log('Sample rows:', rows.map(r => ({ id_absensi: r.id_absensi || r.id, id_pegawai: r.id_pegawai, tgl_absensi: r.tgl_absensi, status: r.status, jam_masuk: r.jam_masuk, jam_pulang: r.jam_pulang })));
    }

    process.exit(0);
  } catch (err) {
    console.error('Error querying absensi:', err);
    process.exit(1);
  }
})();