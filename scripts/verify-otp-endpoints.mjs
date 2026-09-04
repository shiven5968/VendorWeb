// Verify OTP endpoints across all MessMates production domains
const urls = [
  'https://messmatesrepo.vercel.app/api/send-otp',
  'https://messmates10.vercel.app/api/send-otp',
  'https://messmates-eight.vercel.app/api/send-otp'
];

async function checkUrl(url) {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'parth.25b15310212@abes.ac.in',
        admissionNumber: '2025b15310212',
        name: 'Parth Sharma'
      })
    });
    const status = res.status;
    const body = await res.text();
    console.log(`[${status}] ${url}`);
    console.log('Response body:', body.slice(0, 150) + (body.length > 150 ? '...' : ''));
    return { url, status, ok: status === 200 || status === 429 }; // 429 means 30s cooldown is working!
  } catch (err) {
    console.error(`[FAIL] ${url}:`, err.message);
    return { url, status: 0, ok: false };
  }
}

async function run() {
  console.log('--- Testing OTP Endpoints Across Domains ---');
  for (const url of urls) {
    await checkUrl(url);
    // 1 second pause between tests
    await new Promise(r => setTimeout(r, 1000));
  }
  console.log('--- Testing Completed ---');
}

run();
