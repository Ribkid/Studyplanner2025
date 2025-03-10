import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileUp, File, X, Loader, CheckCircle } from 'lucide-react';
import { uploadFile } from '../services/openai-service';

interface FileUploadProps {
  onFileUpload: (fileId: string, filename: string) => void;
  maxFiles?: number;
  allowedFileTypes?: string[];
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileUpload, 
  maxFiles = 5,
  allowedFileTypes = [
    '.pdf', '.txt', '.md', '.docx', '.doc', '.html', 
    '.css', '.js', '.json', '.py', '.java', '.c', '.cpp', 
    '.cs', '.go', '.php', '.rb', '.sh', '.tex', '.ts'
  ]
}) => {
  const [uploadingFiles, setUploadingFiles] = useState<{
    file: File;
    progress: 'uploading' | 'success' | 'error';
    id?: string;
  }[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // Add files to uploading state
    const newFiles = acceptedFiles.map(file => ({
      file,
      progress: 'uploading' as const
    }));
    
    setUploadingFiles(prev => [...prev, ...newFiles]);

    // Upload files one by one
    for (const fileObj of newFiles) {
      try {
        console.log('Uploading file:', fileObj.file.name);
        const fileId = await uploadFile(fileObj.file);
        
        // Update progress to success
        setUploadingFiles(prev => 
          prev.map(f => 
            f.file === fileObj.file 
              ? { ...f, progress: 'success', id: fileId } 
              : f
          )
        );

        console.log('File uploaded successfully:', fileObj.file.name, fileId);
        
        // Call the callback
        onFileUpload(fileId, fileObj.file.name);
      } catch (error) {
        console.error('Error uploading file:', error);
        
        // Update progress to error
        setUploadingFiles(prev => 
          prev.map(f => 
            f.file === fileObj.file 
              ? { ...f, progress: 'error' } 
              : f
          )
        );
      }
    }
  }, [onFileUpload]);

  const removeFile = (fileToRemove: File) => {
    setUploadingFiles(prev => prev.filter(f => f.file !== fileToRemove));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    accept: allowedFileTypes.reduce((acc, type) => {
      // Convert file extensions to MIME types where possible
      const mimeMap: Record<string, string> = {
        '.pdf': 'application/pdf',
        '.txt': 'text/plain',
        '.md': 'text/markdown',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.doc': 'application/msword',
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'text/javascript',
        '.json': 'application/json',
        '.py': 'text/x-python',
        '.java': 'text/x-java',
        '.ts': 'application/typescript'
      };
      
      if (mimeMap[type]) {
        acc[mimeMap[type]] = [];
      } else {
        // For other file types, use wildcard
        acc[`*${type}`] = [];
      }
      return acc;
    }, {} as Record<string, string[]>)
  });

  const isMaxFilesReached = uploadingFiles.length >= maxFiles;

  return (
    <div className="w-full">
      {!isMaxFilesReached && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
            ${isDragActive 
              ? 'border-[var(--matrix-color)] bg-[var(--matrix-color)]/10' 
              : 'border-gray-600 hover:border-gray-500 hover:bg-gray-800'}`}
        >
          <input {...getInputProps()} />
          <FileUp className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-gray-300">
            {isDragActive
              ? 'Drop the files here...'
              : 'Drag & drop files here, or click to select'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Supported formats: PDF, TXT, MD, DOCX, and others
          </p>
        </div>
      )}

      {uploadingFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <h3 className="text-sm font-medium text-gray-300">Files</h3>
          <ul className="space-y-2">
            {uploadingFiles.map((fileObj, index) => (
              <li 
                key={`${fileObj.file.name}-${index}`}
                className="bg-gray-800 rounded-lg p-2 flex items-center justify-between"
              >
                <div className="flex items-center">
                  <File className="h-5 w-5 text-gray-400 mr-2" />
                  <div className="overflow-hidden">
                    <p className="text-sm text-gray-300 truncate" title={fileObj.file.name}>
                      {fileObj.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(fileObj.file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  {fileObj.progress === 'uploading' && (
                    <Loader className="h-4 w-4 text-gray-400 animate-spin" />
                  )}
                  {fileObj.progress === 'success' && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  {fileObj.progress === 'error' && (
                    <span className="text-xs text-red-500 mr-2">Failed</span>
                  )}
                  <button
                    onClick={() => removeFile(fileObj.file)}
                    className="ml-2 text-gray-500 hover:text-gray-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUpload;