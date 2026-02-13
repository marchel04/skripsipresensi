// Test script untuk trigger /api/absensi/gabungan dan lihat debug
const https = require('http'); // untuk localhost gunakan http, bukan https

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/absensi/gabungan',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    // You may need to add actual auth cookie here if protected
  }
};

const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('Response received');
      if (json.data && json.data.length > 0) {
        console.log('First 3 items:');
        json.data.slice(0, 3).forEach((item, idx) => {
          console.log(`\n[${idx}] ${item.pegawai?.nama_lengkap || item.type}`);
          console.log(`  jam_masuk: ${item.jam_masuk}`);
          console.log(`  jam_pulang: ${item.jam_pulang}`);
          console.log(`  total_jam_kerja: ${item.total_jam_kerja}`);
        });
      }
    } catch (e) {
      console.error('Error parsing response:', e);
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e);
});

req.end();
