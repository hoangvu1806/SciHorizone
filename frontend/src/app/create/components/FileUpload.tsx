'use client';

import { useState, useRef } from 'react';

interface FileUploadProps {
  onFileSelected: (file: File | null, url: string, method: 'file' | 'url') => void;
  disabled?: boolean;
}

export function FileUpload({ onFileSelected, disabled = false }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState('');
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
        onFileSelected(droppedFile, '', 'file');
      } else {
        alert('Please upload a PDF file');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        onFileSelected(selectedFile, '', 'file');
      } else {
        alert('Please upload a PDF file');
      }
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const url = e.target.value;
    setFileUrl(url);
    onFileSelected(null, url, 'url');
  };

  const handleMethodChange = (method: 'file' | 'url') => {
    if (disabled) return;
    setUploadMethod(method);
    if (method === 'file') {
      onFileSelected(file, '', 'file');
    } else {
      onFileSelected(null, fileUrl, 'url');
    }
  };

  const openFileSelector = (e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveFile = () => {
    if (disabled) return;
    setFile(null);
    onFileSelected(null, '', 'file');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex space-x-4">
        <button
          type="button"
          className={`btn ${uploadMethod === 'file' ? 'btn-primary' : 'btn-secondary'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => handleMethodChange('file')}
          disabled={disabled}
        >
          Upload File
        </button>
        <button
          type="button"
          className={`btn ${uploadMethod === 'url' ? 'btn-primary' : 'btn-secondary'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => handleMethodChange('url')}
          disabled={disabled}
        >
          Enter URL
        </button>
      </div>

      {uploadMethod === 'file' ? (
        <>
          <div 
            className={`border-2 border-dashed rounded-lg p-6 text-center ${
              dragActive ? 'border-primary-500 bg-primary-50' : 'border-secondary-300'
            } ${file ? 'bg-secondary-50' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileChange}
              disabled={disabled}
            />
            
            {file ? (
              <div>
                <div className="flex items-center justify-center mb-3">
                  <svg className="w-10 h-10 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="font-medium text-secondary-900">{file.name}</p>
                <p className="text-sm text-secondary-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                {!disabled && (
                  <button
                    type="button"
                    className="mt-3 text-sm text-primary-600 hover:text-primary-700"
                    onClick={handleRemoveFile}
                    disabled={disabled}
                  >
                    Remove file
                  </button>
                )}
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-center mb-3">
                  <svg className="w-12 h-12 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="font-medium text-secondary-900">
                  Drag and drop your PDF file here
                </p>
                <p className="text-sm text-secondary-500 mt-1">
                  or <button 
                    type="button" 
                    className={`text-primary-600 hover:text-primary-700 ${disabled ? 'cursor-not-allowed' : ''}`} 
                    onClick={openFileSelector} 
                    disabled={disabled}
                  >
                    browse from your computer
                  </button>
                </p>
                <p className="text-xs text-secondary-500 mt-3">
                  Supports: PDF format only, max 10MB
                </p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="space-y-3">
          <label htmlFor="pdf-url" className="input-label">
            PDF URL
          </label>
          <input
            type="url"
            id="pdf-url"
            value={fileUrl}
            onChange={handleUrlChange}
            placeholder="https://example.com/paper.pdf"
            className={`input ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={disabled}
          />
          <p className="text-xs text-secondary-500">
            Enter a direct link to a PDF file. Make sure the URL ends with .pdf
          </p>
        </div>
      )}
    </div>
  );
} 