#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const logWithTimestamp = (message) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
};

const checkFileExists = (filePath) => {
  return fs.existsSync(filePath);
};

const createEnvFile = () => {
  const envContent = `# VintuSure Test Configuration
# Update these values with your actual Firebase configuration

FIREBASE_PROJECT_ID=vintusure
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json

# Optional: Firebase config overrides
# FIREBASE_API_KEY=your-api-key
# FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
# FIREBASE_STORAGE_BUCKET=your-project.appspot.com
# FIREBASE_MESSAGING_SENDER_ID=your-sender-id
# FIREBASE_APP_ID=your-app-id
`;

  if (!checkFileExists('.env')) {
    fs.writeFileSync('.env', envContent);
    logWithTimestamp('✅ Created .env file with template configuration');
    logWithTimestamp('⚠️  Please update .env with your actual Firebase configuration');
  } else {
    logWithTimestamp('ℹ️  .env file already exists');
  }
};

const updateFirebaseConfig = () => {
  const testFile = 'test-indexing-rag-system.js';
  
  if (!checkFileExists(testFile)) {
    logWithTimestamp('❌ test-indexing-rag-system.js not found');
    return false;
  }

  let content = fs.readFileSync(testFile, 'utf8');
  
  // Check if config is still placeholder
  if (content.includes('BXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX')) {
    logWithTimestamp('⚠️  Firebase configuration needs to be updated');
    logWithTimestamp('📝 Please update the firebaseConfig object in test-indexing-rag-system.js');
    logWithTimestamp('🔗 Get your config from: https://console.firebase.google.com/project/_/settings/general/');
    return false;
  } else {
    logWithTimestamp('✅ Firebase configuration appears to be set');
    return true;
  }
};

const installDependencies = () => {
  logWithTimestamp('📦 Checking dependencies...');
  
  if (!checkFileExists('package.json')) {
    logWithTimestamp('📋 Creating package.json...');
    const packageJson = fs.readFileSync('test-package.json', 'utf8');
    fs.writeFileSync('package.json', packageJson);
  }
  
  logWithTimestamp('📦 Installing dependencies...');
  logWithTimestamp('💡 Run: npm install');
};

const showNextSteps = () => {
  console.log(`
🎉 Setup Complete! Next Steps:

1. 📝 Update Firebase Configuration:
   - Edit test-indexing-rag-system.js and update firebaseConfig
   - Or create .env file with your Firebase settings

2. 📦 Install Dependencies:
   npm install

3. 🧪 Run Tests:
   # Complete test suite
   npm test
   
   # Individual tests
   npm run test:customer
   npm run test:claims
   npm run test:policies
   npm run test:documents
   npm run test:rag
   
   # Using test runner
   node run-tests.js --help

4. 📊 Check Results:
   - Monitor console output for test results
   - Check Firebase Console for function logs
   - Verify Vector Search indexes are active

📚 For more information, see TEST_README.md
`);
};

const main = () => {
  logWithTimestamp('🚀 VintuSure Test Setup');
  
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    VintuSure Test Setup                     ║
║                                                              ║
║  This script will help you set up the indexing and RAG     ║
║  test suite for the VintuSure insurance system.            ║
╚══════════════════════════════════════════════════════════════╝
`);

  // Check required files
  logWithTimestamp('📋 Checking required files...');
  
  const requiredFiles = [
    'test-indexing-rag-system.js',
    'run-tests.js',
    'test-package.json',
    'TEST_README.md'
  ];
  
  let allFilesExist = true;
  requiredFiles.forEach(file => {
    if (checkFileExists(file)) {
      logWithTimestamp(`✅ ${file} found`);
    } else {
      logWithTimestamp(`❌ ${file} missing`);
      allFilesExist = false;
    }
  });
  
  if (!allFilesExist) {
    logWithTimestamp('❌ Some required files are missing. Please ensure all test files are present.');
    return;
  }
  
  // Create .env file
  createEnvFile();
  
  // Check Firebase config
  updateFirebaseConfig();
  
  // Install dependencies
  installDependencies();
  
  // Show next steps
  showNextSteps();
  
  logWithTimestamp('✅ Setup completed successfully!');
};

// Run setup
if (require.main === module) {
  main();
}

module.exports = { main };
