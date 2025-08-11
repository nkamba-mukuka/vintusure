# Document Upload Feature

## Overview
The Dashboard now includes a comprehensive document upload and management system that allows users to upload, view, download, and delete insurance-related documents.

## Features

### 1. Document Upload Modal
- **Location**: Dashboard → Documents Tab
- **Trigger**: "Upload Document" button
- **Features**:
  - File selection with drag & drop support
  - Document name and type categorization
  - Optional description field
  - Real-time upload progress bar
  - File size validation (max 5MB)
  - Supported formats: PDF, JPG, PNG, DOC, DOCX

### 2. Document Management
- **Document Display**: Clean card-based layout showing:
  - File icon based on file type
  - Document name and type badge
  - Upload date and file extension
  - Optional description
- **Actions**:
  - **View**: Opens document in new tab
  - **Download**: Downloads file to local device
  - **Delete**: Removes document with confirmation

### 3. Dashboard Integration
- **New Tab**: "Documents" tab added to main dashboard
- **Stats Card**: Total document count displayed in overview
- **Quick Action**: Upload document action in quick actions section

## Components

### DocumentUploadModal.tsx
- Modal dialog for file upload
- Form validation and progress tracking
- Integration with Firebase Storage

### DocumentList.tsx
- Displays uploaded documents
- Handles view, download, and delete operations
- Responsive card layout with file type icons

## Usage

1. **Access Documents Tab**: Navigate to Dashboard → Documents tab
2. **Upload Document**: Click "Upload Document" button
3. **Fill Form**: Select file, enter name, choose type, add description
4. **Monitor Progress**: Watch upload progress bar
5. **Manage Documents**: Use action buttons to view, download, or delete

## Technical Details

### File Storage
- Uses Firebase Storage for file uploads
- Files organized by entity type and user ID
- Unique file names generated using UUID

### State Management
- Documents stored in local state (can be extended to use database)
- Real-time updates on upload/delete operations
- Toast notifications for user feedback

### Security
- File type validation
- File size limits
- User-specific document access

## Future Enhancements
- Database integration for persistent document storage
- Document search and filtering
- Bulk upload functionality
- Document versioning
- Integration with policies and claims
