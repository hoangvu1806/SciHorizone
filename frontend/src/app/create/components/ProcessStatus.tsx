'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

type Step = {
  id: number;
  title: string;
  description: string;
  status: 'idle' | 'processing' | 'completed' | 'error';
};

interface ProcessStatusProps {
  currentStep: number;
  progress: number;
  statusMessage: string;
  isProcessing: boolean;
}

export function ProcessStatus({ currentStep, progress, statusMessage, isProcessing }: ProcessStatusProps) {
  const [steps, setSteps] = useState<Step[]>([
    {
      id: 1,
      title: 'Document Upload',
      description: 'Upload PDF file or provide URL',
      status: 'idle',
    },
    {
      id: 2,
      title: 'Content Extraction',
      description: 'Extract text content from the document',
      status: 'idle',
    },
    {
      id: 3,
      title: 'Exam Generation',
      description: 'Generate exam questions based on content',
      status: 'idle',
    },
    {
      id: 4,
      title: 'Exam Finalization',
      description: 'Format and prepare the final exam',
      status: 'idle',
    },
  ]);

  // Update step statuses based on currentStep prop
  useEffect(() => {
    if (!isProcessing && currentStep === 0) {
      // Reset all steps to idle if not processing
      setSteps(prevSteps => prevSteps.map(step => ({ ...step, status: 'idle' })));
      return;
    }

    setSteps(prevSteps => 
      prevSteps.map(step => {
        if (step.id < currentStep) {
          return { ...step, status: 'completed' };
        } else if (step.id === currentStep) {
          return { ...step, status: 'processing' };
        } else {
          return { ...step, status: 'idle' };
        }
      })
    );
  }, [currentStep, isProcessing]);

  const getStatusIcon = (status: Step['status']) => {
    switch (status) {
      case 'idle':
        return (
          <div className="w-10 h-10 rounded-full bg-secondary-100 flex items-center justify-center">
            <span className="text-secondary-400 text-sm font-medium"></span>
          </div>
        );
      case 'processing':
        return (
          <motion.div 
            className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center" 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </motion.div>
        );
      case 'completed':
        return (
          <motion.div 
            className="w-10 h-10 rounded-full bg-accent-100 text-accent-600 flex items-center justify-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
        );
      case 'error':
        return (
          <motion.div 
            className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center"
            animate={{ rotate: [0, 5, -5, 5, -5, 0] }}
            transition={{ duration: 0.5 }}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.div>
        );
    }
  };

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="w-full bg-gray-100 rounded-full h-3"
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="bg-gradient-to-r from-primary-500 to-accent-500 h-3 rounded-full"
          style={{ width: `${progress}%` }}
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </motion.div>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        {steps.slice(1, 4).map((step, index) => (
          <motion.div 
            key={step.id}
            className={`p-4 rounded-lg border-2 ${
              step.status === 'completed' ? 'border-accent-500 bg-accent-50' : 
              step.status === 'processing' ? 'border-primary-500 bg-primary-50' : 
              'border-gray-200 bg-white'
            } shadow-sm transition-all duration-300`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="flex items-center mb-3">
              <div className="flex-shrink-0">{getStatusIcon(step.status)}</div>
              <div className="ml-4">
                <h4 className="text-base font-semibold text-secondary-900">{step.title}</h4>
              </div>
            </div>
            <p className="text-sm text-secondary-600 mt-1">{step.description}</p>
            {step.status === 'processing' && (
              <motion.div 
                className="w-full h-1 bg-primary-100 mt-3 overflow-hidden rounded-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div 
                  className="h-1 bg-primary-500 rounded-full"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 1.5,
                    ease: "linear"
                  }}
                />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      <motion.div 
        className="bg-white border border-secondary-200 rounded-lg p-5 shadow-sm"
        animate={{ 
          boxShadow: isProcessing ? 
            '0 4px 14px rgba(0, 0, 0, 0.1)' : 
            '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}
        transition={{ duration: 0.3 }}
      >
        <h4 className="text-sm font-medium text-secondary-900 mb-2">Status Message</h4>
        <p className="text-sm text-secondary-600">{statusMessage || 'Ready to process. Configure your options and click "Generate Exam".'}</p>
      </motion.div>
    </motion.div>
  );
} 