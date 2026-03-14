const os = require('os');
const fs = require('fs');
const path = require('path');

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const ip = getLocalIp();
console.log(`📡 Local IP detected: ${ip}`);

const envPath = path.join(__dirname, '.env');
let envContent = '';

if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('EXPO_PUBLIC_API_BASE_URL=')) {
    // Only update if it's currently pointing to a local-ish address or if explicitly asked
    // For now, let's just log it so the user can see it
  }
}

console.log(`\nTo test on your physical device via Expo Go:`);
console.log(`1. Ensure your phone is on the same WiFi as this PC: ${ip}`);
console.log(`2. If connection fails, try running: npx expo start --tunnel`);
console.log(`3. Current API URL in .env:`);
const apiUrlMatch = envContent.match(/EXPO_PUBLIC_API_BASE_URL=(.*)/);
if (apiUrlMatch) {
    console.log(`   ${apiUrlMatch[1]}`);
} else {
    console.log(`   Not set (defaulting to auto-detection)`);
}
