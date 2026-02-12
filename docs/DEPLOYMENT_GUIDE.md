# 🚀 VintuSure Firebase Deployment Guide

This guide will help you deploy the VintuSure application to Firebase Hosting.

## 📋 Prerequisites

1. **Node.js** (v18 or higher)
2. **Firebase CLI** installed globally
3. **Firebase Project** set up
4. **Git** for version control

## 🔧 Setup Instructions

### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Login to Firebase

```bash
firebase login
```

### 3. Verify Project Configuration

The project is already configured to use the `vintusure` Firebase project. You can verify this in the `.firebaserc` file.

## 🏗️ Build and Deploy

### Option 1: Using Deployment Scripts (Recommended)

#### For Windows:
```bash
deploy.bat
```

#### For macOS/Linux:
```bash
chmod +x deploy.sh
./deploy.sh
```

### Option 2: Manual Deployment

1. **Navigate to the web app directory:**
   ```bash
   cd apps/web
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run tests:**
   ```bash
   npm test -- --run
   ```

4. **Build for production:**
   ```bash
   npm run build:prod
   ```

5. **Deploy to Firebase:**
   ```bash
   cd ../..
   firebase deploy
   ```

### Option 3: Using NPM Scripts

From the `apps/web` directory:

```bash
# Deploy only hosting
npm run deploy

# Deploy everything (hosting, functions, firestore, storage)
npm run deploy:all

# Deploy specific services
npm run deploy:functions
npm run deploy:firestore
npm run deploy:storage
```

## 🌐 Deployment URLs

After successful deployment, your app will be available at:

- **Primary URL**: https://vintusure.web.app
- **Alternative URL**: https://vintusure.firebaseapp.com

## 📁 Project Structure

```
vintusure/
├── apps/
│   └── web/                 # React application
│       ├── src/            # Source code
│       ├── dist/           # Build output (generated)
│       ├── public/         # Static assets
│       └── package.json    # Dependencies and scripts
├── functions/              # Firebase Functions
├── firebase.json          # Firebase configuration
├── .firebaserc           # Firebase project settings
├── firestore.rules       # Firestore security rules
├── firestore.indexes.json # Firestore indexes
├── storage.rules         # Storage security rules
├── deploy.sh             # Linux/macOS deployment script
└── deploy.bat            # Windows deployment script
```

## ⚙️ Configuration Files

### Firebase Configuration (`firebase.json`)
- **Hosting**: Serves the built React app from `apps/web/dist`
- **Functions**: Cloud Functions for backend logic
- **Firestore**: Database configuration
- **Storage**: File storage configuration
- **Emulators**: Local development setup

### Vite Configuration (`apps/web/vite.config.ts`)
- **Build Optimization**: Code splitting and minification
- **Production Settings**: Disabled sourcemaps, console logs removed
- **Chunk Splitting**: Vendor, Firebase, UI, and form libraries separated

## 🔍 Troubleshooting

### Common Issues

1. **Build Fails**
   - Check for TypeScript errors: `npm run build`
   - Verify all dependencies are installed: `npm install`

2. **Deployment Fails**
   - Ensure you're logged in: `firebase login`
   - Check project configuration: `firebase projects:list`
   - Verify build output exists: `ls apps/web/dist`

3. **App Not Loading**
   - Check Firebase Hosting logs: `firebase hosting:channel:list`
   - Verify routing configuration in `firebase.json`

4. **Authentication Issues**
   - Verify Firebase config in `src/lib/firebase/config.ts`
   - Check authentication domain settings in Firebase Console

### Debug Commands

```bash
# Check Firebase project status
firebase projects:list

# View deployment history
firebase hosting:releases:list

# Test locally
firebase emulators:start

# Check hosting configuration
firebase hosting:channel:list
```

## 🔒 Security Considerations

1. **Environment Variables**: Ensure sensitive data is not exposed in client-side code
2. **Firestore Rules**: Review and update security rules as needed
3. **Storage Rules**: Configure appropriate access controls
4. **API Keys**: Use Firebase App Check for additional security

## 📊 Performance Optimization

The build configuration includes:

- **Code Splitting**: Automatic chunk splitting for better loading performance
- **Minification**: Terser for JavaScript minification
- **Caching**: Proper cache headers for static assets
- **Compression**: Gzip compression for faster loading

## 🔄 Continuous Deployment

For automated deployments, consider setting up:

1. **GitHub Actions** for CI/CD
2. **Firebase CLI** in your CI pipeline
3. **Environment-specific deployments** (staging/production)

## 📞 Support

If you encounter issues:

1. Check the Firebase Console for deployment status
2. Review Firebase Hosting logs
3. Verify your Firebase project configuration
4. Check the VintuSure documentation

---

**Happy Deploying! 🚀**
