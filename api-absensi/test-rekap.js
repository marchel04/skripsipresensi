// Quick test script for rekap endpoint
const fetch = require('node-fetch');

async function test() {
  try {
    const response = await fetch('http://localhost:4000/api/rekap/pegawai?bulan=2026-02', {
      headers: {
        'Cookie': 'authToken=test'
      }
    });
    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
