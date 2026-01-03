const path = require('path');
const fs = require('fs');

// Simple script to clean .next folder cross-platform
const nextDir = path.join(__dirname, '.next');

if (fs.existsSync(nextDir)) {
  try {
    console.log('Cleaning .next directory...');
    fs.rmSync(nextDir, { recursive: true, force: true });
    console.log('.next directory cleaned successfully.');
  } catch (err) {
    console.error('Error cleaning .next directory:', err.message);
    console.log('You may need to stop the development server first.');
    process.exit(1);
  }
} else {
  console.log('.next directory does not exist, skipping clean.');
}

