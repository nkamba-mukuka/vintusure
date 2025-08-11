# Development Setup for Document Upload

## CORS Issue Resolution

The document upload feature has been configured to work in both development and production environments.

### Development Mode (Localhost)

When running in development mode (`npm run dev`), the application uses a **local storage-based document service** that:

- ✅ **No CORS issues** - Files are stored locally in the browser
- ✅ **Persistent storage** - Documents are saved in localStorage
- ✅ **Full functionality** - Upload, view, download, and delete work
- ✅ **Progress tracking** - Simulated upload progress
- ✅ **No Firebase deployment required** - Works immediately

### Production Mode

In production, the application uses **Firebase Storage** for document management.

## How It Works

### Development Service (`documentServiceDev.ts`)
- Stores files in browser's localStorage
- Creates local URLs for file access
- Simulates upload progress
- Persists documents across browser sessions

### Production Service (`documentService.ts`)
- Uploads to Firebase Storage
- Uses Firebase authentication
- Real upload progress tracking
- Cloud-based file storage

## Usage

1. **Start Development Server**:
   ```bash
   npm run dev
   ```

2. **Access Documents Tab**: Navigate to Dashboard → Documents

3. **Upload Documents**: Use the "Upload Document" button
   - Files are stored locally in development
   - No CORS errors occur
   - Documents persist across page refreshes

4. **Manage Documents**: View, download, and delete uploaded files

## Firebase Storage Setup (For Production)

To deploy the Firebase Storage rules:

```bash
# 1. Authenticate with Firebase
firebase login --reauth

# 2. Deploy storage rules
firebase deploy --only storage
```

## Storage Rules

The updated storage rules allow:
- **Authenticated users** to upload their own documents
- **File types**: PDF, images, Word documents
- **File size**: Up to 5MB
- **User isolation**: Each user can only access their own files

## Environment Detection

The application automatically detects the environment:
- **Development**: Uses `documentServiceDev`
- **Production**: Uses `documentService`

No configuration changes needed!
