"use client";

import { useState, useRef } from "react";

interface FileUploadProps {
    onFileSelected: (
        file: File | null,
        url: string,
        method: "file" | "url"
    ) => void;
    disabled?: boolean;
}

export function FileUpload({
    onFileSelected,
    disabled = false,
}: FileUploadProps) {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [fileUrl, setFileUrl] = useState("");
    const [uploadMethod, setUploadMethod] = useState<"file" | "url">("file");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        if (disabled) return;
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
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
            if (droppedFile.type === "application/pdf") {
                setFile(droppedFile);
                onFileSelected(droppedFile, "", "file");
            } else {
                alert("Please upload a PDF file");
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled) return;
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.type === "application/pdf") {
                setFile(selectedFile);
                onFileSelected(selectedFile, "", "file");
            } else {
                alert("Please upload a PDF file");
            }
        }
    };

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled) return;
        const url = e.target.value;
        setFileUrl(url);
        onFileSelected(null, url, "url");
    };

    const handleMethodChange = (method: "file" | "url") => {
        if (disabled) return;
        setUploadMethod(method);
        if (method === "file") {
            onFileSelected(file, "", "file");
        } else {
            onFileSelected(null, fileUrl, "url");
        }
    };

    const openFileSelector = (e: React.MouseEvent) => {
        if (disabled) return;
        // e.preventDefault(); // Removed to test if it resolves the click issue
        // e.stopPropagation(); // Removed to test if it resolves the click issue

        if (fileInputRef.current) {
            fileInputRef.current.click();
        } else {
            console.error(
                "FileUpload: fileInputRef.current is null when trying to open file selector."
            );
        }
    };

    const handleRemoveFile = () => {
        if (disabled) return;
        setFile(null);
        onFileSelected(null, "", "file");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="w-full p-4 bg-white rounded-xl shadow-xl transition-all duration-300 ease-in-out">
            {/* Segmented Control for Upload Method */}
            <div className="flex justify-center mb-6 bg-secondary-100 rounded-lg p-1 shadow-sm">
                <button
                    type="button"
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 ease-in-out 
            ${
                uploadMethod === "file"
                    ? "bg-primary-600 text-white shadow-md"
                    : "text-secondary-700 hover:bg-secondary-200"
            } 
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={() => handleMethodChange("file")}
                    disabled={disabled}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="inline-block h-5 w-5 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                        />
                    </svg>
                    Upload File
                </button>
                <button
                    type="button"
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 ease-in-out
            ${
                uploadMethod === "url"
                    ? "bg-primary-600 text-white shadow-md"
                    : "text-secondary-700 hover:bg-secondary-200"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={() => handleMethodChange("url")}
                    disabled={disabled}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="inline-block h-5 w-5 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z"
                            clipRule="evenodd"
                        />
                        <path
                            fillRule="evenodd"
                            d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z"
                            clipRule="evenodd"
                        />
                    </svg>
                    Enter URL
                </button>
            </div>

            {uploadMethod === "file" ? (
                <div
                    className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl 
            transition-all duration-300 ease-in-out cursor-pointer 
            ${
                dragActive
                    ? "border-primary-500 bg-primary-50 scale-105"
                    : "border-secondary-300 hover:border-primary-400"
            } 
            ${file ? "bg-green-50 border-green-500" : ""} 
            ${
                disabled ? "opacity-60 cursor-not-allowed bg-secondary-100" : ""
            }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={openFileSelector} // Allow click to open file dialog
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
                        <div className="text-center p-4">
                            <svg
                                className="w-16 h-16 mx-auto text-green-600 mb-3"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 12.75l3 3m0 0l3-3m-3 3v-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <p className="font-semibold text-lg text-secondary-800">
                                {file.name}
                            </p>
                            <p className="text-sm text-secondary-600 mt-1">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                            {!disabled && (
                                <button
                                    type="button"
                                    className="mt-4 px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-md hover:bg-red-600 transition-colors duration-200 ease-in-out shadow-sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveFile();
                                    }} // Stop propagation to prevent opening file dialog
                                    disabled={disabled}
                                >
                                    Remove File
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="text-center">
                            <svg
                                className={`w-20 h-20 mx-auto mb-4 ${
                                    dragActive
                                        ? "text-primary-500 animate-bounce"
                                        : "text-secondary-400"
                                }`}
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.2}
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 16.5V9.75m0 0l-3.75 3.75M12 9.75l3.75 3.75M3 17.25V6.75A2.25 2.25 0 015.25 4.5h13.5A2.25 2.25 0 0121 6.75v10.5A2.25 2.25 0 0118.75 19.5H5.25A2.25 2.25 0 013 17.25z"
                                />
                            </svg>
                            <p
                                className={`font-semibold text-xl ${
                                    dragActive
                                        ? "text-primary-600"
                                        : "text-secondary-700"
                                }`}
                            >
                                Drag & Drop PDF Here
                            </p>
                            <p className="text-secondary-500 mt-1">
                                or{" "}
                                <span className="text-primary-600 font-medium hover:underline">
                                    click to browse
                                </span>
                            </p>
                            <p className="text-xs text-secondary-400 mt-4">
                                Max file size: 10MB. PDF format only.
                            </p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    <div>
                        <label
                            htmlFor="pdf-url"
                            className="block text-sm font-medium text-secondary-700 mb-1"
                        >
                            PDF Document URL
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg
                                    className="h-5 w-5 text-secondary-400"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z"
                                        clipRule="evenodd"
                                    />
                                    <path
                                        fillRule="evenodd"
                                        d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <input
                                type="url"
                                id="pdf-url"
                                value={fileUrl}
                                onChange={handleUrlChange}
                                placeholder="https://example.com/document.pdf"
                                className={`block w-full pl-10 pr-3 py-2 border border-secondary-300 rounded-md leading-5 bg-white placeholder-secondary-400 
                  focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors duration-200 ease-in-out 
                  ${
                      disabled
                          ? "opacity-60 cursor-not-allowed bg-secondary-100"
                          : ""
                  }`}
                                disabled={disabled}
                            />
                        </div>
                        <p className="mt-2 text-xs text-secondary-500">
                            Enter a direct URL to the PDF document you want to
                            use.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
