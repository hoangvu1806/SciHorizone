"use client";

import { useState, useEffect, useRef } from "react";

interface ExamConfigProps {
    config: {
        examType: string;
        difficulty: string;
        passageType: string;
        includeAnswers: boolean;
        includeSummary: boolean;
    };
    onChange: (config: Partial<ExamConfigProps["config"]>) => void;
    disabled?: boolean;
}

export function ExamConfig({
    config,
    onChange,
    disabled = false,
}: ExamConfigProps) {
    // Helper type for keys of config
    type ConfigKeys = keyof ExamConfigProps["config"];
    const prevExamTypeRef = useRef(config.examType);

    const getIeltsDifficultyOptions = () => [
        { value: "5.0", label: "Band 5.0 (Moderate)" },
        { value: "6.0", label: "Band 6.0 (Competent)" },
        { value: "7.0", label: "Band 7.0 (Good)" },
        { value: "8.0", label: "Band 8.0 (Very Good)" },
        { value: "9.0", label: "Band 9.0 (Expert)" },
    ];

    const getToeicDifficultyOptions = () => [
        { value: "400", label: "400-500 (Basic)" },
        { value: "550", label: "550-650 (Intermediate)" },
        { value: "700", label: "700-800 (Upper Intermediate)" },
        { value: "850", label: "850-900 (Advanced)" },
        { value: "950", label: "950+ (Proficient)" },
    ];

    const difficultyOptions =
        config.examType === "ielts"
            ? getIeltsDifficultyOptions()
            : getToeicDifficultyOptions();

    // Reset difficulty value when exam type changes to ensure valid selection
    useEffect(() => {
        // Chỉ reset khi exam type thay đổi
        if (prevExamTypeRef.current !== config.examType) {
            onChange({ difficulty: "" });
            prevExamTypeRef.current = config.examType;
        }
    }, [config.examType]);

    return (
        <div
            className={`w-full transition-all duration-300 ease-in-out ${
                disabled ? "opacity-60 cursor-not-allowed" : ""
            }`}
        >
            <div className="space-y-8">
                {/* Exam Type Section */}
                <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                            <svg
                                className="w-4 h-4 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                        </div>
                        Exam Type
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            {
                                id: "ielts",
                                label: "IELTS Reading",
                                description: "Academic reading comprehension",
                            },
                            {
                                id: "toeic",
                                label: "TOEIC Reading",
                                description: "Business English reading",
                            },
                        ].map((item) => (
                            <div key={item.id}>
                                <input
                                    type="radio"
                                    id={item.id}
                                    name="exam-type"
                                    value={item.id}
                                    checked={config.examType === item.id}
                                    onChange={() =>
                                        onChange({ examType: item.id })
                                    }
                                    className="sr-only peer"
                                    disabled={disabled}
                                />
                                <label
                                    htmlFor={item.id}
                                    className={`block w-full p-6 text-center rounded-2xl border-2 transition-all duration-300 ease-in-out cursor-pointer group hover:shadow-lg transform hover:-translate-y-1
                    ${
                        disabled
                            ? "cursor-not-allowed bg-gray-100 border-gray-200"
                            : "peer-checked:border-primary-500 peer-checked:bg-gradient-to-r peer-checked:from-primary-50 peer-checked:to-purple-50 peer-checked:text-primary-700 peer-checked:shadow-xl hover:border-primary-400 border-gray-200 bg-white"
                    }
                    ${
                        config.examType === item.id
                            ? "border-primary-500 bg-gradient-to-r from-primary-50 to-purple-50 text-primary-700 shadow-xl"
                            : "text-gray-700"
                    }`}
                                >
                                    <div className="font-bold text-lg mb-2">
                                        {item.label}
                                    </div>
                                    <div
                                        className={`text-sm ${
                                            config.examType === item.id
                                                ? "text-primary-600"
                                                : "text-gray-500"
                                        }`}
                                    >
                                        {item.description}
                                    </div>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Difficulty Level Section */}
                <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                            <svg
                                className="w-4 h-4 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                />
                            </svg>
                        </div>
                        Difficulty Level
                    </h3>
                    <div className="relative">
                        <select
                            id="difficulty"
                            name="difficulty"
                            value={config.difficulty}
                            onChange={(e) =>
                                onChange({ difficulty: e.target.value })
                            }
                            className={`block w-full pl-6 pr-12 py-4 border-2 border-gray-200 rounded-2xl leading-5 bg-white text-gray-900 placeholder-gray-400 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg font-medium transition-all duration-300 ease-in-out hover:shadow-lg
                ${
                    disabled
                        ? "bg-gray-100 cursor-not-allowed"
                        : "hover:border-primary-300"
                }`}
                            disabled={disabled}
                        >
                            <option value="" disabled className="text-gray-400">
                                Select difficulty level...
                            </option>
                            {difficultyOptions.map((option) => (
                                <option
                                    key={option.value}
                                    value={option.value}
                                    className="text-gray-900"
                                >
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                            <svg
                                className="h-6 w-6"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                aria-hidden="true"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.23 8.29a.75.75 0 01.02-1.06z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Passage/Part Selection Section */}
                <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mr-3">
                            <svg
                                className="w-4 h-4 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                />
                            </svg>
                        </div>
                        {config.examType === "ielts"
                            ? "Number of Passages"
                            : "TOEIC Part"}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {config.examType === "ielts"
                            ? // IELTS Passages
                              ["1", "2", "3"].map((num) => (
                                  <div key={`passage-${num}`}>
                                      <input
                                          type="radio"
                                          id={`passage-${num}`}
                                          name="passage-type"
                                          value={num}
                                          checked={config.passageType === num}
                                          onChange={() =>
                                              onChange({ passageType: num })
                                          }
                                          className="sr-only peer"
                                          disabled={disabled}
                                      />
                                      <label
                                          htmlFor={`passage-${num}`}
                                          className={`block w-full p-6 text-center rounded-2xl border-2 transition-all duration-300 ease-in-out cursor-pointer group hover:shadow-lg transform hover:-translate-y-1
                      ${
                          disabled
                              ? "cursor-not-allowed bg-gray-100 border-gray-200"
                              : "peer-checked:border-primary-500 peer-checked:bg-gradient-to-r peer-checked:from-primary-500 peer-checked:to-purple-500 peer-checked:text-white peer-checked:shadow-xl hover:border-primary-400 border-gray-200 bg-white"
                      }
                      ${
                          config.passageType === num
                              ? "border-primary-500 bg-gradient-to-r from-primary-500 to-purple-500 text-white shadow-xl"
                              : "text-gray-700"
                      }`}
                                      >
                                          <div className="font-bold text-xl mb-2">
                                              Passage {num}
                                          </div>
                                          <div
                                              className={`text-sm ${
                                                  config.passageType === num
                                                      ? "text-primary-100"
                                                      : "text-gray-500"
                                              }`}
                                          >
                                              Reading comprehension
                                          </div>
                                      </label>
                                  </div>
                              ))
                            : // TOEIC Parts
                              [
                                  {
                                      value: "5",
                                      label: "Part 5",
                                      description:
                                          "Incomplete Sentences (30 questions)",
                                  },
                                  {
                                      value: "6",
                                      label: "Part 6",
                                      description:
                                          "Text Completion (16 questions)",
                                  },
                                  {
                                      value: "7",
                                      label: "Part 7",
                                      description:
                                          "Reading Comprehension (20 questions)",
                                  },
                              ].map((part) => (
                                  <div key={`part-${part.value}`}>
                                      <input
                                          type="radio"
                                          id={`part-${part.value}`}
                                          name="passage-type"
                                          value={part.value}
                                          checked={
                                              config.passageType === part.value
                                          }
                                          onChange={() =>
                                              onChange({
                                                  passageType: part.value,
                                              })
                                          }
                                          className="sr-only peer"
                                          disabled={disabled}
                                      />
                                      <label
                                          htmlFor={`part-${part.value}`}
                                          className={`block w-full p-6 text-center rounded-2xl border-2 transition-all duration-300 ease-in-out cursor-pointer group hover:shadow-lg transform hover:-translate-y-1
                      ${
                          disabled
                              ? "cursor-not-allowed bg-gray-100 border-gray-200"
                              : "peer-checked:border-primary-500 peer-checked:bg-gradient-to-r peer-checked:from-primary-500 peer-checked:to-purple-500 peer-checked:text-white peer-checked:shadow-xl hover:border-primary-400 border-gray-200 bg-white"
                      }
                      ${
                          config.passageType === part.value
                              ? "border-primary-500 bg-gradient-to-r from-primary-500 to-purple-500 text-white shadow-xl"
                              : "text-gray-700"
                      }`}
                                      >
                                          <div className="font-bold text-xl mb-2">
                                              {part.label}
                                          </div>
                                          <div
                                              className={`text-sm ${
                                                  config.passageType ===
                                                  part.value
                                                      ? "text-primary-100"
                                                      : "text-gray-500"
                                              }`}
                                          >
                                              {part.description}
                                          </div>
                                      </label>
                                  </div>
                              ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
