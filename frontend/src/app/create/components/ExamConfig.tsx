'use client';

import { useState, useEffect, useRef } from 'react';

interface ExamConfigProps {
  config: {
    examType: string;
    difficulty: string;
    passageType: string;
    includeAnswers: boolean;
    includeSummary: boolean;
  };
  onChange: (config: Partial<ExamConfigProps['config']>) => void;
  disabled?: boolean;
}

export function ExamConfig({ config, onChange, disabled = false }: ExamConfigProps) {
  const prevExamTypeRef = useRef(config.examType);
  
  const getIeltsDifficultyOptions = () => [
    { value: '5.0', label: 'Band 5.0 (Moderate)' },
    { value: '6.0', label: 'Band 6.0 (Competent)' },
    { value: '7.0', label: 'Band 7.0 (Good)' },
    { value: '8.0', label: 'Band 8.0 (Very Good)' },
    { value: '9.0', label: 'Band 9.0 (Expert)' },
  ];

  const getToeicDifficultyOptions = () => [
    { value: '400', label: '400-500 (Basic)' },
    { value: '550', label: '550-650 (Intermediate)' },
    { value: '700', label: '700-800 (Upper Intermediate)' },
    { value: '850', label: '850-900 (Advanced)' },
    { value: '950', label: '950+ (Proficient)' },
  ];

  const difficultyOptions = config.examType === 'ielts' 
    ? getIeltsDifficultyOptions() 
    : getToeicDifficultyOptions();

  // Reset difficulty value when exam type changes to ensure valid selection
  useEffect(() => {
    // Chỉ reset khi exam type thay đổi
    if (prevExamTypeRef.current !== config.examType) {
      onChange({ difficulty: '' });
      prevExamTypeRef.current = config.examType;
    }
  }, [config.examType]);

  return (
    <div className={`space-y-6 ${disabled ? 'opacity-50' : ''}`}>
      <div className="input-group">
        <label htmlFor="exam-type" className="input-label">
          Exam Type
        </label>
        <div className="mt-2 flex gap-4">
          <div className="flex items-center">
            <input
              id="ielts"
              name="exam-type"
              type="radio"
              className="h-4 w-4 border-secondary-300 text-primary-600 focus:ring-primary-500"
              value="ielts"
              checked={config.examType === 'ielts'}
              onChange={() => onChange({ examType: 'ielts' })}
              disabled={disabled}
            />
            <label htmlFor="ielts" className="ml-2 block text-sm text-secondary-700">
              IELTS Reading
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="toeic"
              name="exam-type"
              type="radio"
              className="h-4 w-4 border-secondary-300 text-primary-600 focus:ring-primary-500"
              value="toeic"
              checked={config.examType === 'toeic'}
              onChange={() => onChange({ examType: 'toeic' })}
              disabled={disabled}
            />
            <label htmlFor="toeic" className="ml-2 block text-sm text-secondary-700">
              TOEIC Reading
            </label>
          </div>
        </div>
      </div>

      <div className="input-group">
        <label htmlFor="difficulty" className="input-label">
          Difficulty Level
        </label>
        <select
          id="difficulty"
          name="difficulty"
          value={config.difficulty}
          onChange={(e) => onChange({ difficulty: e.target.value })}
          className="select"
          disabled={disabled}
        >
          <option value="" disabled>
            Select difficulty level
          </option>
          {difficultyOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="input-group">
        <label htmlFor="passage-type" className="input-label">
          Passage number
        </label>
        <div className="mt-2 flex gap-4">
          <div className="flex items-center">
            <input
              id="passage-1"
              name="passage-type"
              type="radio"
              className="h-4 w-4 border-secondary-300 text-primary-600 focus:ring-primary-500"
              value="1"
              checked={config.passageType === '1'}
              onChange={() => onChange({ passageType: '1' })}
              disabled={disabled}
            />
            <label htmlFor="passage-1" className="ml-2 block text-sm text-secondary-700">
              Passage 1
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="passage-2"
              name="passage-type"
              type="radio"
              className="h-4 w-4 border-secondary-300 text-primary-600 focus:ring-primary-500"
              value="2"
              checked={config.passageType === '2'}
              onChange={() => onChange({ passageType: '2' })}
              disabled={disabled}
            />
            <label htmlFor="passage-2" className="ml-2 block text-sm text-secondary-700">
              Passage 2
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="passage-3"
              name="passage-type"
              type="radio"
              className="h-4 w-4 border-secondary-300 text-primary-600 focus:ring-primary-500"
              value="3"
              checked={config.passageType === '3'}
              onChange={() => onChange({ passageType: '3' })}
              disabled={disabled}
            />
            <label htmlFor="passage-3" className="ml-2 block text-sm text-secondary-700">
               Passage 3
            </label>
          </div>
        </div>
      </div>

      <div className="input-group">
        <label htmlFor="additional-options" className="input-label">
          Additional Options
        </label>
        <div className="mt-2 space-y-2">
          <div className="flex items-center">
            <input
              id="include-answers"
              name="include-answers"
              type="checkbox"
              className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
              checked={config.includeAnswers}
              onChange={(e) => onChange({ includeAnswers: e.target.checked })}
              disabled={disabled}
            />
            <label htmlFor="include-answers" className="ml-2 block text-sm text-secondary-700">
              Include answers and explanations
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="include-summary"
              name="include-summary"
              type="checkbox"
              className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
              checked={config.includeSummary}
              onChange={(e) => onChange({ includeSummary: e.target.checked })}
              disabled={disabled}
            />
            <label htmlFor="include-summary" className="ml-2 block text-sm text-secondary-700">
              Include summary of the text
            </label>
          </div>
        </div>
      </div>
    </div>
  );
} 