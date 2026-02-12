const prisma = require('./src/utils/prisma');

(async () => {
  try {
    const id = 1; // change if needed
    const start = new Date('2026-02-01T00:00:00Z');
    const end = new Date('2026-03-01T00:00:00Z');

    console.log('Querying absensi for', { id, start: start.toISOString(), end: end.toISOString() });

    const rows = await prisma.absensi.findMany({
      where: {
        id_pegawai: id,
        tgl_absensi: {
          gte: start,
          lt: end,
        },
      },
      orderBy: { tgl_absensi: 'asc' },
    });

    if (!rows || rows.length === 0) {
      console.log('No absensi rows found for this period.');
      process.exit(0);
    }

    for (const r of rows) {
      const jam_masuk = r.jam_masuk ? new Date(r.jam_masuk) : null;
      const jam_pulang = r.jam_pulang ? new Date(r.jam_pulang) : null;
      let diffMin = null;
      if (jam_masuk && jam_pulang) {
        diffMin = Math.round((jam_pulang - jam_masuk) / 60000);
      }
      console.log({
        id_absensi: r.id_absensi || r.id,
        tgl_absensi: r.tgl_absensi,
        status: r.status,
        jam_masuk: r.jam_masuk,
        jam_pulang: r.jam_pulang,
        diffMin,
      });
    }

    process.exit(0);
  } catch (err) {
    console.error('Error querying absensi:', err);
    process.exit(1);
  }
})();