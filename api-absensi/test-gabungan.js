const fetch = require('node-fetch');

async function testEndpoint() {
  try {
    const response = await fetch('http://localhost:4000/api/absensi/gabungan', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'token=...' // You need to provide actual token
      },
      credentials: 'include'
    });

    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
    
    // Check if total_jam_kerja is present
    if (data.data && data.data.length > 0) {
      console.log('\n\nFirst item:', JSON.stringify(data.data[0], null, 2));
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testEndpoint();
