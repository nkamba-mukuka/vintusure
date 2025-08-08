# Google Cloud Storage Integration via Cloud Functions

This document describes the integration of Google Cloud Storage for document uploads in the VintuSure application using Firebase Cloud Functions.

## Overview

The application now supports uploading documents to Google Cloud Storage with the following features:

- **File Upload**: Documents are uploaded to the `vintusure-gcs-bucket` bucket
- **Custom Metadata**: Each file includes metadata with agent_id, entity information, and upload details
- **Organized Structure**: Files are organized in the `agent documents/` folder structure
- **Progress Tracking**: Upload progress is tracked and displayed to users
- **File Validation**: Files are validated for size and type before upload
- **Signed URLs**: Files are accessed via signed URLs for security

## Architecture

### Frontend (Client-Side)
- Uses Firebase Functions to call the backend upload service
- Converts files to base64 for transmission
- Handles file validation and progress tracking
- Falls back to local storage in development mode

### Backend (Cloud Functions)
- Receives base64 file data from frontend
- Converts back to Buffer for Google Cloud Storage
- Handles authentication and metadata
- Generates signed URLs for file access

## Configuration

### Bucket Configuration

- **Bucket Name**: `vintusure-gcs-bucket`
- **Base Folder**: `agent documents/`
- **Subfolders**: 
  - `policies/{entityId}/` - For policy documents
  - `claims/{entityId}/` - For claim documents

### File Upload Settings

- **Maximum File Size**: 10MB
- **Allowed File Types**:
  - PDF (`.pdf`)
  - Images (`.jpg`, `.jpeg`, `.png`)
  - Word Documents (`.doc`, `.docx`)
  - Text Files (`.txt`)

### URL Settings

- **Signed URL Expiry**: 7 days
- **Access Control**: Files are accessed via signed URLs for security

## File Structure

```
vintusure-gcs-bucket/
└── agent documents/
    ├── policies/
    │   └── {entityId}/
    │       └── {uuid}.{extension}
    └── claims/
        └── {entityId}/
            └── {uuid}.{extension}
```

## Metadata Structure

Each uploaded file includes the following metadata:

```json
{
  "agent_id": "user-uid",
  "uploaded_at": "2024-01-01T00:00:00.000Z",
  "file_size": "1024000",
  "content_type": "application/pdf"
}
```

## Implementation Details

### Services

1. **Google Cloud Storage Service** (`apps/web/src/lib/services/googleCloudStorageService.ts`)
   - Handles file validation
   - Converts files to base64
   - Calls Cloud Function for upload
   - Manages progress tracking

2. **Cloud Function** (`functions/src/index.ts`)
   - Receives base64 file data
   - Converts to Buffer
   - Uploads to Google Cloud Storage
   - Generates signed URLs
   - Returns upload results

### Components

1. **Document Upload Modal** (`apps/web/src/components/documents/DocumentUploadModal.tsx`)
   - Updated to use Google Cloud Storage service
   - Falls back to development service in development mode
   - Shows upload progress and status

### Environment Handling

- **Development Mode**: Uses local storage simulation
- **Production Mode**: Uses Google Cloud Storage via Cloud Functions
- **Authentication**: Handled by Firebase Functions

## Authentication Setup

### For Production

1. **Service Account**: Create a Google Cloud service account
2. **Credentials**: Download the service account key JSON file
3. **Environment Variables**: Set up authentication environment variables
4. **Permissions**: Ensure the service account has proper bucket permissions

### Required Permissions

The service account needs the following permissions on the bucket:

- `storage.objects.create` - Upload files
- `storage.objects.delete` - Delete files
- `storage.objects.get` - Read files and metadata
- `storage.objects.list` - List files

## Usage

### Uploading Documents

1. Navigate to the Dashboard
2. Click "Upload Document" button
3. Select a file (PDF, image, Word document, or text file)
4. Fill in document details (name, type, description)
5. Click "Upload Document"
6. Monitor upload progress
7. Receive confirmation when upload completes

### File Management

- **View**: Files are displayed in the document list
- **Download**: Click on files to download them
- **Delete**: Use the delete button to remove files
- **Metadata**: File metadata is automatically managed

## Error Handling

The system handles various error scenarios:

- **File Size Exceeded**: Shows error for files larger than 10MB
- **Invalid File Type**: Rejects unsupported file types
- **Upload Failures**: Displays error messages for failed uploads
- **Authentication Errors**: Handles credential issues gracefully

## Security Considerations

1. **Signed URLs**: Files are accessed via time-limited signed URLs
2. **User Isolation**: Files are organized by user ID for isolation
3. **Metadata Validation**: All metadata is validated before storage
4. **File Type Validation**: Only allowed file types are accepted
5. **Size Limits**: File size is limited to prevent abuse

## Monitoring and Logging

The system provides comprehensive logging:

- **Upload Success**: Logs successful uploads with metadata
- **Upload Failures**: Logs detailed error information
- **File Operations**: Tracks file creation, deletion, and access
- **Performance**: Monitors upload times and success rates

## Future Enhancements

Potential improvements for the Google Cloud Storage integration:

1. **Resumable Uploads**: Support for large file uploads with resume capability
2. **Image Processing**: Automatic image resizing and optimization
3. **Virus Scanning**: Integration with Google Cloud Security Scanner
4. **Backup Strategy**: Automated backup and retention policies
5. **Analytics**: Upload analytics and usage reporting
6. **Batch Operations**: Support for bulk file operations

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify service account credentials
   - Check environment variables
   - Ensure proper permissions

2. **Upload Failures**
   - Check file size and type
   - Verify network connectivity
   - Review bucket permissions

3. **Access Denied**
   - Verify signed URL generation
   - Check file permissions
   - Review bucket access controls

### Debug Information

Enable debug logging by setting the appropriate environment variables:

```bash
DEBUG=google-cloud-storage
```

This will provide detailed information about upload operations and any errors that occur.

## Deployment

To deploy the Cloud Functions:

```bash
cd functions
npm run deploy
```

This will deploy the `uploadFile` function to Firebase Functions, which will handle the Google Cloud Storage uploads.
