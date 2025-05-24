'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileUpload } from './components/FileUpload';
import { ExamConfig } from './components/ExamConfig';
import { ProcessStatus } from './components/ProcessStatus';
import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';

export default function CreateExam() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState('');
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Exam configuration state
  const [examConfig, setExamConfig] = useState({
    examType: 'ielts',
    difficulty: '',
    passageType: '1',
    includeAnswers: true,
    includeSummary: false
  });

  const handleFileSelected = (selectedFile: File | null, selectedUrl: string, method: 'file' | 'url') => {
    setFile(selectedFile);
    setFileUrl(selectedUrl);
    setUploadMethod(method);
    setError(null);
  };

  const handleConfigChange = (config: Partial<typeof examConfig>) => {
    setExamConfig({ ...examConfig, ...config });
  };

  const handleUpload = async () => {
    if (!file && !fileUrl) {
      setError('Please upload a file or provide a URL');
      return;
    }

    if (examConfig.difficulty === '') {
      setError('Please select a difficulty level');
      return;
    }

    setError(null);
    setIsUploading(true);
    setCurrentStep(1);
    setProgress(25);
    setStatusMessage('Uploading document and extracting content...');

    try {
      // Create form data for file upload
      const formData = new FormData();
      
      if (uploadMethod === 'file' && file) {
        formData.append('pdf_file', file); // Backend chỉ chấp nhận tham số pdf_file
      } else if (uploadMethod === 'url' && fileUrl) {
        formData.append('url', fileUrl);
      }

      // Upload PDF file
      const uploadResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.UPLOAD_PDF}`, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.detail || 'Failed to upload document');
      }

      const uploadData = await uploadResponse.json();
      const { session_id } = uploadData;
      
      setSessionId(session_id);
      setCurrentStep(2);
      setProgress(50);
      setStatusMessage('Content extracted successfully. Generating exam...');
      setIsUploading(false);
      setIsGenerating(true);

      // Generate exam with the sessionId
      const generateResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.GENERATE_EXAM(session_id)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exam_type: examConfig.examType.toUpperCase(),
          difficulty: examConfig.difficulty,
          passage_type: examConfig.passageType,
          output_format: 'json'
        }),
      });

      if (!generateResponse.ok) {
        const errorData = await generateResponse.json();
        throw new Error(errorData.detail || 'Failed to generate exam');
      }

      // Đã có kết quả từ generate-exam, không cần request thêm
      setCurrentStep(3);
        setProgress(100);
        setStatusMessage('Exam ready. Redirecting to exam page...');
        
      // Redirect to the exam page ngay lập tức vì chúng ta đã có dữ liệu exam
        setTimeout(() => {
          router.push(`/exam/${session_id}`);
        }, 1000);

    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setStatusMessage('Error occurred during processing. Please try again.');
      setIsUploading(false);
      setIsGenerating(false);
    }
  };

  return (
    <main className="min-h-screen bg-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo_sci.png" alt="SCI Logo" className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">Paper2Exam</span>
          </Link>
        </div>
      </header>

      <div className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between mb-8">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-secondary-900">Create Exam</h1>
              <p className="mt-2 text-secondary-600">
                Upload a scientific paper and configure your exam settings
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <Link href="/" className="btn btn-secondary btn-md mr-3">
                Cancel
              </Link>
            </div>
          </div>

          {error && (
            <div className="mb-8 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {error}
              </p>
            </div>
          )}

          <div className="mb-8 bg-white shadow-lg rounded-xl overflow-hidden">
            <div className="p-6 border-b border-secondary-200">
              <h2 className="text-xl font-semibold text-secondary-900">Exam Processing Status</h2>
              <p className="mt-1 text-sm text-secondary-500">
                Track the progress of your exam generation
              </p>
            </div>
            <div className="p-6">
              <ProcessStatus 
                currentStep={currentStep}
                progress={progress}
                statusMessage={statusMessage}
                isProcessing={isUploading || isGenerating}
              />
            </div>
          </div>

          <div className="bg-white shadow-soft rounded-lg overflow-hidden">
            <div className="p-6 border-b border-secondary-200">
              <h2 className="text-lg font-semibold text-secondary-900">Upload Document</h2>
              <p className="mt-1 text-sm text-secondary-500">
                Upload a PDF file or provide a URL to a scientific paper
              </p>
            </div>
            <div className="p-6">
              <FileUpload 
                onFileSelected={handleFileSelected}
                disabled={isUploading || isGenerating}
              />
            </div>
          </div>

          <div className="mt-8 bg-white shadow-soft rounded-lg overflow-hidden">
            <div className="p-6 border-b border-secondary-200">
              <h2 className="text-lg font-semibold text-secondary-900">Exam Configuration</h2>
              <p className="mt-1 text-sm text-secondary-500">
                Configure the type and difficulty of your exam
              </p>
            </div>
            <div className="p-6">
              <ExamConfig 
                config={examConfig}
                onChange={handleConfigChange}
                disabled={isUploading || isGenerating}
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button 
              type="button" 
              className="btn btn-primary btn-lg"
              onClick={handleUpload}
              disabled={isUploading || isGenerating}
            >
              {isUploading || isGenerating ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : 'Generate Exam'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
} 