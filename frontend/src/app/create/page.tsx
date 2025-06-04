"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileUpload } from "./components/FileUpload";
import { ExamConfig } from "./components/ExamConfig";
import { ProcessStatus } from "./components/ProcessStatus";
import { API_BASE_URL, API_ENDPOINTS } from "@/config/api";

export default function CreateExam() {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [fileUrl, setFileUrl] = useState("");
    const [uploadMethod, setUploadMethod] = useState<"file" | "url">("file");
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [progress, setProgress] = useState(0);
    const [statusMessage, setStatusMessage] = useState("");
    const [error, setError] = useState<string | null>(null);

    // Exam configuration state
    const [examConfig, setExamConfig] = useState({
        examType: "ielts",
        difficulty: "",
        passageType: "1",
        includeAnswers: true,
        includeSummary: false,
    });

    const handleFileSelected = (
        selectedFile: File | null,
        selectedUrl: string,
        method: "file" | "url"
    ) => {
        setFile(selectedFile);
        setFileUrl(selectedUrl);
        setUploadMethod(method);
        setError(null);
    };

    const handleConfigChange = (config: Partial<typeof examConfig>) => {
        const newConfig = { ...examConfig, ...config };

        // Auto-adjust passageType when examType changes
        if (config.examType && config.examType !== examConfig.examType) {
            if (config.examType === "toeic") {
                newConfig.passageType = "5"; // Default to Part 5 for TOEIC
            } else if (config.examType === "ielts") {
                newConfig.passageType = "1"; // Default to Passage 1 for IELTS
            }
        }

        setExamConfig(newConfig);
    };

    const handleUpload = async () => {
        if (!file && !fileUrl) {
            setError("Please upload a file or provide a URL");
            return;
        }

        if (examConfig.difficulty === "") {
            setError("Please select a difficulty level");
            return;
        }

        setError(null);
        setIsUploading(true);
        setCurrentStep(1);
        setProgress(25);
        setStatusMessage("Uploading document and extracting content...");

        try {
            // Create form data for file upload
            const formData = new FormData();

            if (uploadMethod === "file" && file) {
                formData.append("pdf_file", file);
            } else if (uploadMethod === "url" && fileUrl) {
                formData.append("url", fileUrl);
            }

            // Upload PDF file
            const uploadResponse = await fetch(
                `${API_BASE_URL}${API_ENDPOINTS.UPLOAD_PDF}`,
                {
                    method: "POST",
                    body: formData,
                }
            );

            if (!uploadResponse.ok) {
                const errorData = await uploadResponse.json();
                throw new Error(
                    errorData.detail || "Failed to upload document"
                );
            }

            const uploadData = await uploadResponse.json();
            const { session_id } = uploadData;

            setSessionId(session_id);
            setCurrentStep(2);
            setProgress(50);
            setStatusMessage(
                "Content extracted successfully. Generating exam..."
            );
            setIsUploading(false);
            setIsGenerating(true);

            // Generate exam with the sessionId
            const requestBody = {
                exam_type: examConfig.examType.toUpperCase(),
                difficulty: examConfig.difficulty,
                passage_type: examConfig.passageType,
                output_format: "json",
            };

            console.log("DEBUG: Sending exam generation request:", requestBody);

            const generateResponse = await fetch(
                `${API_BASE_URL}${API_ENDPOINTS.GENERATE_EXAM(session_id)}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestBody),
                }
            );

            if (!generateResponse.ok) {
                const errorData = await generateResponse.json();
                throw new Error(errorData.detail || "Failed to generate exam");
            }

            // We have results from generate-exam, no need for additional requests
            setCurrentStep(3);
            setProgress(100);
            setStatusMessage("Exam ready. Redirecting to exam page...");

            // Redirect to the exam page immediately since we already have the exam data
            setTimeout(() => {
                router.push(`/exam/${session_id}`);
            }, 1000);
        } catch (err) {
            console.error("Error:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "An unexpected error occurred"
            );
            setStatusMessage(
                "Error occurred during processing. Please try again."
            );
            setIsUploading(false);
            setIsGenerating(false);
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-1/3 w-96 h-96 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
            </div>

            {/* Header */}
            <header className="relative bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative">
                            <img
                                src="/logo_sci.png"
                                alt="SCI Logo"
                                className="w-10 h-10 object-contain transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full animate-pulse"></div>
                        </div>
                        <div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                                SciHorizone
                            </span>
                            <div className="text-xs text-gray-500 font-medium">
                                AI Exam Generator
                            </div>
                        </div>
                    </Link>
                    <Link
                        href="/"
                        className="btn btn-outline-primary btn-md hover:shadow-lg transition-all duration-300"
                    >
                        <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                            />
                        </svg>
                        Back to Home
                    </Link>
                </div>
            </header>

            <div className="relative py-12">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Hero Section */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center px-4 py-2 bg-primary-100 rounded-full text-primary-700 text-sm font-medium mb-6">
                            <svg
                                className="w-4 h-4 mr-2"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            Create Your Exam
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                            Transform Papers into
                            <span className="bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                                {" "}
                                Professional Exams
                            </span>
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Upload your scientific paper and let our AI create
                            high-quality IELTS or TOEIC reading comprehension
                            tests in minutes
                        </p>
                    </div>

                    {error && (
                        <div className="mb-8 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-6 shadow-lg">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                        <svg
                                            className="w-5 h-5 text-red-600"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                            />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-semibold text-red-800">
                                        Error
                                    </h3>
                                    <p className="text-red-700 mt-1">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column - Upload & Generate */}
                        <div className="flex flex-col h-full">
                            {/* Upload Document Card */}
                            <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden border border-white/20 hover:shadow-3xl transition-all duration-500 flex-1">
                                <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-6 text-white">
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mr-4">
                                            <svg
                                                className="w-6 h-6"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold">
                                                Upload Document
                                            </h2>
                                            <p className="text-blue-100">
                                                PDF file or URL to scientific
                                                paper
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-8 flex-1 flex flex-col">
                                    <FileUpload
                                        onFileSelected={handleFileSelected}
                                        disabled={isUploading || isGenerating}
                                    />
                                </div>
                            </div>

                            {/* Generate Button */}
                            <div className="mt-8 flex flex-col items-center justify-center">
                                <div className="relative inline-block group">
                                    {/* Glow effect background */}
                                    <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>

                                    <button
                                        type="button"
                                        className="relative px-16 py-6 bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 rounded-3xl text-white font-bold text-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-500 overflow-hidden"
                                        onClick={handleUpload}
                                        disabled={isUploading || isGenerating}
                                    >
                                        {/* Animated background overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-primary-700 via-purple-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                        {/* Shimmer effect */}
                                        <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-pulse"></div>

                                        <div className="relative flex items-center justify-center">
                                            {isUploading || isGenerating ? (
                                                <>
                                                    <div className="relative mr-4">
                                                        <svg
                                                            className="animate-spin h-8 w-8 text-white"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <circle
                                                                className="opacity-25"
                                                                cx="12"
                                                                cy="12"
                                                                r="10"
                                                                stroke="currentColor"
                                                                strokeWidth="4"
                                                            ></circle>
                                                            <path
                                                                className="opacity-75"
                                                                fill="currentColor"
                                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                            ></path>
                                                        </svg>
                                                        {/* Pulsing ring around spinner */}
                                                        <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping"></div>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-xl font-bold">
                                                            Processing Your Exam
                                                        </span>
                                                        <span className="text-sm text-white/80 animate-pulse">
                                                            AI is working its
                                                            magic...
                                                        </span>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="relative mr-4">
                                                        <svg
                                                            className="w-8 h-8 text-white group-hover:animate-bounce"
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
                                                        {/* Glow effect around icon */}
                                                        <div className="absolute inset-0 bg-white/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-xl font-bold">
                                                            Generate
                                                            Professional Exam
                                                        </span>
                                                        <span className="text-sm text-white/90">
                                                            Powered by Advanced
                                                            AI
                                                        </span>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {/* Particle effects */}
                                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-3xl pointer-events-none">
                                            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/30 rounded-full animate-float"></div>
                                            <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-white/40 rounded-full animate-float animation-delay-2000"></div>
                                            <div className="absolute bottom-1/4 left-3/4 w-1.5 h-1.5 bg-white/20 rounded-full animate-float animation-delay-4000"></div>
                                        </div>
                                    </button>
                                </div>

                                <div className="mt-8 space-y-6">
                                    <p className="text-gray-600 text-lg font-medium text-center">
                                        🚀 Your professional exam will be ready
                                        in minutes
                                    </p>
                                    <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
                                        <div className="flex items-center bg-green-50 px-4 py-2 rounded-full">
                                            <svg
                                                className="w-4 h-4 mr-2 text-green-500"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            <span className="font-medium text-green-700">
                                                AI-Powered
                                            </span>
                                        </div>
                                        <div className="flex items-center bg-blue-50 px-4 py-2 rounded-full">
                                            <svg
                                                className="w-4 h-4 mr-2 text-blue-500"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            <span className="font-medium text-blue-700">
                                                High Quality
                                            </span>
                                        </div>
                                        <div className="flex items-center bg-purple-50 px-4 py-2 rounded-full">
                                            <svg
                                                className="w-4 h-4 mr-2 text-purple-500"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            <span className="font-medium text-purple-700">
                                                Professional
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Exam Configuration */}
                        <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden border border-white/20 hover:shadow-3xl transition-all duration-500 h-full">
                            <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 text-white">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mr-4">
                                        <svg
                                            className="w-6 h-6"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                                            />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">
                                            Exam Configuration
                                        </h2>
                                        <p className="text-purple-100">
                                            Customize your exam settings
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-8 h-full flex flex-col">
                                <ExamConfig
                                    config={examConfig}
                                    onChange={handleConfigChange}
                                    disabled={isUploading || isGenerating}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Processing Status Card */}
                    <div className="mt-16 mb-8 bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden border border-white/20">
                        <div className="bg-gradient-to-r from-primary-500 to-purple-600 p-6 text-white">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mr-4">
                                    <svg
                                        className="w-6 h-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">
                                        Processing Status
                                    </h2>
                                    <p className="text-primary-100">
                                        Track your exam generation progress
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="p-8">
                            <ProcessStatus
                                currentStep={currentStep}
                                progress={progress}
                                statusMessage={statusMessage}
                                isProcessing={isUploading || isGenerating}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
