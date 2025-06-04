"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Home() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <main className="min-h-screen">
            {/* Header */}
            <header
                className={`fixed w-full z-50 transition-all duration-300 ${
                    isScrolled
                        ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100"
                        : "bg-white/80 backdrop-blur-sm"
                }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <img
                                    src="/logo_sci.png"
                                    alt="SCI Logo"
                                    className="w-10 h-10 object-contain"
                                />
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full animate-pulse"></div>
                            </div>
                            <div>
                                <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 bg-clip-text text-transparent">
                                    SciHorizone
                                </span>
                                <div className="text-xs text-gray-500 font-medium">
                                    AI Exam Generator
                                </div>
                            </div>
                        </div>

                        <nav className="hidden lg:flex items-center gap-8">
                            <a
                                href="#features"
                                className="text-gray-600 hover:text-primary-600 transition-colors font-medium"
                            >
                                Features
                            </a>
                            <a
                                href="#how-it-works"
                                className="text-gray-600 hover:text-primary-600 transition-colors font-medium"
                            >
                                How it works
                            </a>
                            <a
                                href="#testimonials"
                                className="text-gray-600 hover:text-primary-600 transition-colors font-medium"
                            >
                                Testimonials
                            </a>
                            <a
                                href="#pricing"
                                className="text-gray-600 hover:text-primary-600 transition-colors font-medium"
                            >
                                Pricing
                            </a>
                            <a
                                href="#about"
                                className="text-gray-600 hover:text-primary-600 transition-colors font-medium"
                            >
                                About
                            </a>
                        </nav>

                        <div className="flex items-center gap-4">
                            <Link
                                href="/create"
                                className="btn btn-primary btn-md shadow-lg hover:shadow-xl transition-all duration-300"
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
                                        d="M12 4v16m8-8H4"
                                    />
                                </svg>
                                Create Exam
                            </Link>

                            {/* Mobile menu button */}
                            <button
                                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                onClick={() =>
                                    setMobileMenuOpen(!mobileMenuOpen)
                                }
                            >
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
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Mobile menu */}
                    {mobileMenuOpen && (
                        <div className="lg:hidden border-t border-gray-100 py-4">
                            <nav className="flex flex-col gap-4">
                                <a
                                    href="#features"
                                    className="text-gray-600 hover:text-primary-600 transition-colors font-medium"
                                >
                                    Features
                                </a>
                                <a
                                    href="#how-it-works"
                                    className="text-gray-600 hover:text-primary-600 transition-colors font-medium"
                                >
                                    How it works
                                </a>
                                <a
                                    href="#testimonials"
                                    className="text-gray-600 hover:text-primary-600 transition-colors font-medium"
                                >
                                    Testimonials
                                </a>
                                <a
                                    href="#pricing"
                                    className="text-gray-600 hover:text-primary-600 transition-colors font-medium"
                                >
                                    Pricing
                                </a>
                                <a
                                    href="#about"
                                    className="text-gray-600 hover:text-primary-600 transition-colors font-medium"
                                >
                                    About
                                </a>
                            </nav>
                        </div>
                    )}
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
                {/* Background with animated gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-blue-50">
                    <div className="absolute top-0 left-0 w-full h-full">
                        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
                    </div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left content */}
                        <div className="text-center lg:text-left">
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
                                AI-Powered Exam Generation
                            </div>

                            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900 leading-tight">
                                Transform
                                <span className="bg-gradient-to-r from-primary-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                                    {" "}
                                    Scientific Papers
                                </span>
                                <br />
                                into Professional Exams
                            </h1>

                            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                                Convert academic papers into IELTS/TOEIC reading
                                comprehension exams with advanced AI technology.
                                Perfect for educators, language trainers, and
                                test preparation professionals.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <Link
                                    href="/create"
                                    className="btn btn-primary btn-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                                >
                                    <svg
                                        className="w-5 h-5 mr-2"
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
                                    Start Creating Now
                                </Link>

                                <button className="btn btn-outline btn-lg group">
                                    <svg
                                        className="w-5 h-5 mr-2 group-hover:animate-pulse"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9-4V8a3 3 0 016 0v2M7 16a3 3 0 006 0v-2"
                                        />
                                    </svg>
                                    Watch Demo
                                </button>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-gray-200">
                                <div className="text-center lg:text-left">
                                    <div className="text-2xl font-bold text-gray-900">
                                        1000+
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Exams Generated
                                    </div>
                                </div>
                                <div className="text-center lg:text-left">
                                    <div className="text-2xl font-bold text-gray-900">
                                        50+
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Institutions
                                    </div>
                                </div>
                                <div className="text-center lg:text-left">
                                    <div className="text-2xl font-bold text-gray-900">
                                        99%
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Accuracy Rate
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right content - Visual */}
                        <div className="relative">
                            <div className="relative z-10">
                                {/* Main dashboard mockup */}
                                <div className="bg-white rounded-2xl shadow-2xl p-6 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-4 bg-primary-200 rounded w-1/2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                        <div className="grid grid-cols-2 gap-3 mt-4">
                                            <div className="h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg"></div>
                                            <div className="h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg"></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating elements */}
                                <div className="absolute -top-4 -right-4 bg-primary-500 text-white p-3 rounded-xl shadow-lg animate-bounce">
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
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>

                                <div className="absolute -bottom-4 -left-4 bg-purple-500 text-white p-3 rounded-xl shadow-lg animate-pulse">
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
                                            d="M13 10V3L4 14h7v7l9-11h-7z"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section
                id="features"
                className="py-24 bg-gradient-to-b from-white to-gray-50"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <div className="inline-flex items-center px-4 py-2 bg-primary-100 rounded-full text-primary-700 text-sm font-medium mb-6">
                            <svg
                                className="w-4 h-4 mr-2"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            Powerful Features
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                            Everything you need to create
                            <span className="bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                                {" "}
                                perfect exams
                            </span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Our AI-powered platform provides comprehensive tools
                            for converting scientific papers into
                            professional-grade exams
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-primary-200 transform hover:-translate-y-2">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative">
                                <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <svg
                                        className="w-8 h-8 text-white"
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
                                <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-primary-600 transition-colors">
                                    Smart PDF Processing
                                </h3>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    Advanced AI extracts and analyzes content
                                    from scientific papers, maintaining context
                                    and structure for optimal exam generation.
                                </p>
                                <div className="flex items-center text-primary-600 font-medium group-hover:translate-x-2 transition-transform duration-300">
                                    Learn more
                                    <svg
                                        className="w-4 h-4 ml-2"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-primary-200 transform hover:-translate-y-2">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative">
                                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <svg
                                        className="w-8 h-8 text-white"
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
                                <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-purple-600 transition-colors">
                                    Multiple Exam Formats
                                </h3>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    Generate IELTS and TOEIC format exams with
                                    customizable difficulty levels, question
                                    types, and assessment criteria.
                                </p>
                                <div className="flex items-center text-purple-600 font-medium group-hover:translate-x-2 transition-transform duration-300">
                                    Explore formats
                                    <svg
                                        className="w-4 h-4 ml-2"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Feature 3 */}
                        <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-primary-200 transform hover:-translate-y-2">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative">
                                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <svg
                                        className="w-8 h-8 text-white"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-blue-600 transition-colors">
                                    Flexible Export Options
                                </h3>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    Download exams as beautifully formatted
                                    PDFs, editable Word documents, or structured
                                    JSON for integration with your systems.
                                </p>
                                <div className="flex items-center text-blue-600 font-medium group-hover:translate-x-2 transition-transform duration-300">
                                    View exports
                                    <svg
                                        className="w-4 h-4 ml-2"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Feature 4 */}
                        <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-primary-200 transform hover:-translate-y-2">
                            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative">
                                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <svg
                                        className="w-8 h-8 text-white"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-green-600 transition-colors">
                                    Quality Assurance
                                </h3>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    Built-in validation ensures grammatical
                                    accuracy, appropriate difficulty levels, and
                                    adherence to official exam standards.
                                </p>
                                <div className="flex items-center text-green-600 font-medium group-hover:translate-x-2 transition-transform duration-300">
                                    Quality metrics
                                    <svg
                                        className="w-4 h-4 ml-2"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Feature 5 */}
                        <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-primary-200 transform hover:-translate-y-2">
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative">
                                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <svg
                                        className="w-8 h-8 text-white"
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
                                <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-orange-600 transition-colors">
                                    Lightning Fast
                                </h3>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    Generate comprehensive exams in minutes, not
                                    hours. Our optimized AI processes documents
                                    efficiently without compromising quality.
                                </p>
                                <div className="flex items-center text-orange-600 font-medium group-hover:translate-x-2 transition-transform duration-300">
                                    Speed test
                                    <svg
                                        className="w-4 h-4 ml-2"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Feature 6 */}
                        <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-primary-200 transform hover:-translate-y-2">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative">
                                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <svg
                                        className="w-8 h-8 text-white"
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
                                <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-indigo-600 transition-colors">
                                    Advanced Customization
                                </h3>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    Fine-tune question types, difficulty
                                    distribution, passage length, and assessment
                                    criteria to match your specific
                                    requirements.
                                </p>
                                <div className="flex items-center text-indigo-600 font-medium group-hover:translate-x-2 transition-transform duration-300">
                                    Customize now
                                    <svg
                                        className="w-4 h-4 ml-2"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section
                id="how-it-works"
                className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden"
            >
                {/* Background decoration */}
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                    <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
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
                            Simple Process
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                            How it works in
                            <span className="bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                                {" "}
                                3 simple steps
                            </span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Transform your scientific papers into professional
                            exams in minutes with our streamlined AI-powered
                            process
                        </p>
                    </div>

                    <div className="relative">
                        {/* Connection lines */}
                        <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-200 via-purple-200 to-primary-200 transform -translate-y-1/2"></div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8">
                            {/* Step 1 */}
                            <div className="relative group">
                                <div className="text-center">
                                    <div className="relative mx-auto mb-8">
                                        <div className="w-24 h-24 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl group-hover:shadow-2xl transition-all duration-300 transform group-hover:scale-110">
                                            <svg
                                                className="w-12 h-12 text-white"
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
                                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-primary-500">
                                            <span className="text-primary-600 font-bold text-sm">
                                                1
                                            </span>
                                        </div>
                                    </div>

                                    <h3 className="text-2xl font-bold mb-4 text-gray-900">
                                        Upload Your Document
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed mb-6">
                                        Simply drag and drop your scientific
                                        paper in PDF format, or paste a URL. Our
                                        system supports various academic
                                        document formats.
                                    </p>

                                    <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
                                        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                                            <svg
                                                className="w-4 h-4"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            <span>PDF, DOC, URL supported</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="relative group">
                                <div className="text-center">
                                    <div className="relative mx-auto mb-8">
                                        <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl group-hover:shadow-2xl transition-all duration-300 transform group-hover:scale-110">
                                            <svg
                                                className="w-12 h-12 text-white"
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
                                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-purple-500">
                                            <span className="text-purple-600 font-bold text-sm">
                                                2
                                            </span>
                                        </div>
                                    </div>

                                    <h3 className="text-2xl font-bold mb-4 text-gray-900">
                                        Customize Settings
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed mb-6">
                                        Choose your exam format (IELTS/TOEIC),
                                        set difficulty level, select question
                                        types, and configure other parameters to
                                        match your needs.
                                    </p>

                                    <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
                                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                                            <div className="flex items-center space-x-1">
                                                <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                                                <span>IELTS Format</span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                                                <span>TOEIC Format</span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                                <span>Difficulty Levels</span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                                <span>Question Types</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="relative group">
                                <div className="text-center">
                                    <div className="relative mx-auto mb-8">
                                        <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl group-hover:shadow-2xl transition-all duration-300 transform group-hover:scale-110">
                                            <svg
                                                className="w-12 h-12 text-white"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                />
                                            </svg>
                                        </div>
                                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-green-500">
                                            <span className="text-green-600 font-bold text-sm">
                                                3
                                            </span>
                                        </div>
                                    </div>

                                    <h3 className="text-2xl font-bold mb-4 text-gray-900">
                                        Generate & Export
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed mb-6">
                                        Our AI processes your document and
                                        generates a professional exam. Download
                                        it as PDF, Word document, or JSON
                                        format.
                                    </p>

                                    <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
                                        <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                                            <div className="flex items-center space-x-1">
                                                <svg
                                                    className="w-4 h-4 text-red-500"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                                <span>PDF</span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <svg
                                                    className="w-4 h-4 text-blue-500"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                                <span>DOCX</span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <svg
                                                    className="w-4 h-4 text-green-500"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                                <span>JSON</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="text-center mt-16">
                        <Link
                            href="/create"
                            className="btn btn-primary btn-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                        >
                            <svg
                                className="w-5 h-5 mr-2"
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
                            Try It Now - It's Free!
                        </Link>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <div className="inline-flex items-center px-4 py-2 bg-primary-100 rounded-full text-primary-700 text-sm font-medium mb-6">
                            <svg
                                className="w-4 h-4 mr-2"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            What Our Users Say
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                            Trusted by educators
                            <span className="bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                                {" "}
                                worldwide
                            </span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Join thousands of educators and institutions who are
                            already using SciHorizone to create professional
                            exams
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Testimonial 1 */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center mb-6">
                                <div className="flex text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                        <svg
                                            key={i}
                                            className="w-5 h-5 fill-current"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                            </div>
                            <blockquote className="text-gray-700 mb-6 leading-relaxed">
                                "SciHorizone has helped me prepare for IELTS
                                much more effectively. Converting scientific
                                papers into practice tests is really useful for
                                my study preparation."
                            </blockquote>
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                                    H
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900">
                                        Hoang Vu
                                    </div>
                                    <div className="text-gray-600 text-sm">
                                        Student
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Testimonial 2 */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center mb-6">
                                <div className="flex text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                        <svg
                                            key={i}
                                            className="w-5 h-5 fill-current"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                            </div>
                            <blockquote className="text-gray-700 mb-6 leading-relaxed">
                                "I really love the feature that creates TOEIC
                                tests from scientific papers. The quality of
                                questions is excellent and has significantly
                                improved my reading comprehension skills."
                            </blockquote>
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                                    T
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900">
                                        Thien An
                                    </div>
                                    <div className="text-gray-600 text-sm">
                                        Student
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Testimonial 3 */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center mb-6">
                                <div className="flex text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                        <svg
                                            key={i}
                                            className="w-5 h-5 fill-current"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                            </div>
                            <blockquote className="text-gray-700 mb-6 leading-relaxed">
                                "This platform is incredibly convenient! I can
                                create reading comprehension tests from research
                                papers that interest me. It's very helpful for
                                my studies."
                            </blockquote>
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                                    T
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900">
                                        Thanh Tu
                                    </div>
                                    <div className="text-gray-600 text-sm">
                                        Student
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-primary-600 mb-2">
                                1000+
                            </div>
                            <div className="text-gray-600">Exams Created</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-purple-600 mb-2">
                                50+
                            </div>
                            <div className="text-gray-600">Universities</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-green-600 mb-2">
                                25+
                            </div>
                            <div className="text-gray-600">Countries</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-blue-600 mb-2">
                                99%
                            </div>
                            <div className="text-gray-600">Satisfaction</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section
                id="pricing"
                className="py-24 bg-gradient-to-b from-gray-50 to-white"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <div className="inline-flex items-center px-4 py-2 bg-primary-100 rounded-full text-primary-700 text-sm font-medium mb-6">
                            <svg
                                className="w-4 h-4 mr-2"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            Simple Pricing
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                            Choose your
                            <span className="bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                                {" "}
                                perfect plan
                            </span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Start free and upgrade as you grow. All plans
                            include our core AI-powered exam generation
                            features.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {/* Free Plan */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
                            <div className="text-center">
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                    Free
                                </h3>
                                <div className="text-4xl font-bold text-gray-900 mb-2">
                                    $0
                                </div>
                                <div className="text-gray-600 mb-8">
                                    Perfect for trying out
                                </div>

                                <ul className="text-left space-y-4 mb-8">
                                    <li className="flex items-center">
                                        <svg
                                            className="w-5 h-5 text-green-500 mr-3"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <span>30 exams per month</span>
                                    </li>
                                    <li className="flex items-center">
                                        <svg
                                            className="w-5 h-5 text-green-500 mr-3"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <span>IELTS & TOEIC formats</span>
                                    </li>
                                    <li className="flex items-center">
                                        <svg
                                            className="w-5 h-5 text-green-500 mr-3"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <span>PDF export</span>
                                    </li>
                                </ul>

                                <Link
                                    href="/create"
                                    className="btn btn-outline btn-lg w-full"
                                >
                                    Get Started Free
                                </Link>
                            </div>
                        </div>

                        {/* Pro Plan */}
                        <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-primary-500 hover:shadow-2xl transition-all duration-300 relative">
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                <span className="bg-primary-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                                    Most Popular
                                </span>
                            </div>
                            <div className="text-center">
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                    Pro
                                </h3>
                                <div className="text-4xl font-bold text-gray-900 mb-2">
                                    $29
                                </div>
                                <div className="text-gray-600 mb-8">
                                    per month
                                </div>

                                <ul className="text-left space-y-4 mb-8">
                                    <li className="flex items-center">
                                        <svg
                                            className="w-5 h-5 text-green-500 mr-3"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <span>200 exams per month</span>
                                    </li>
                                    <li className="flex items-center">
                                        <svg
                                            className="w-5 h-5 text-green-500 mr-3"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <span>All exam formats</span>
                                    </li>
                                    <li className="flex items-center">
                                        <svg
                                            className="w-5 h-5 text-green-500 mr-3"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <span>PDF, DOCX, JSON export</span>
                                    </li>
                                    <li className="flex items-center">
                                        <svg
                                            className="w-5 h-5 text-green-500 mr-3"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <span>Priority support</span>
                                    </li>
                                    <li className="flex items-center">
                                        <svg
                                            className="w-5 h-5 text-green-500 mr-3"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <span>Advanced customization</span>
                                    </li>
                                </ul>

                                <Link
                                    href="/create"
                                    className="btn btn-primary btn-lg w-full"
                                >
                                    Start Pro Trial
                                </Link>
                            </div>
                        </div>

                        {/* Enterprise Plan */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
                            <div className="text-center">
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                    Enterprise
                                </h3>
                                <div className="text-4xl font-bold text-gray-900 mb-2">
                                    Custom
                                </div>
                                <div className="text-gray-600 mb-8">
                                    For institutions
                                </div>

                                <ul className="text-left space-y-4 mb-8">
                                    <li className="flex items-center">
                                        <svg
                                            className="w-5 h-5 text-green-500 mr-3"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <span>Unlimited exams</span>
                                    </li>
                                    <li className="flex items-center">
                                        <svg
                                            className="w-5 h-5 text-green-500 mr-3"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <span>Team collaboration</span>
                                    </li>
                                    <li className="flex items-center">
                                        <svg
                                            className="w-5 h-5 text-green-500 mr-3"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <span>API access</span>
                                    </li>
                                    <li className="flex items-center">
                                        <svg
                                            className="w-5 h-5 text-green-500 mr-3"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <span>Dedicated support</span>
                                    </li>
                                    <li className="flex items-center">
                                        <svg
                                            className="w-5 h-5 text-green-500 mr-3"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <span>Custom integrations</span>
                                    </li>
                                </ul>

                                <button className="btn btn-outline btn-lg w-full">
                                    Contact Sales
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-primary-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold mb-6">
                        Ready to create your exam?
                    </h2>
                    <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
                        Start converting your scientific papers into
                        professional exams today.
                    </p>
                    <Link
                        href="/create"
                        className="btn bg-white text-primary-600 hover:bg-primary-50 focus-visible:ring-white btn-lg"
                    >
                        Get Started Now
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Company Info */}
                        <div className="lg:col-span-2">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="relative">
                                    <img
                                        src="/logo_sci.png"
                                        alt="SCI Logo"
                                        className="w-10 h-10 object-contain"
                                    />
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full animate-pulse"></div>
                                </div>
                                <div>
                                    <span className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
                                        SciHorizone
                                    </span>
                                    <div className="text-xs text-gray-400 font-medium">
                                        AI Exam Generator
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-300 mb-6 leading-relaxed max-w-md">
                                Transform scientific papers into professional
                                IELTS/TOEIC exams with cutting-edge AI
                                technology. Trusted by educators worldwide for
                                creating high-quality assessments.
                            </p>

                            {/* Social Links */}
                            <div className="flex space-x-4">
                                <a
                                    href="#"
                                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors group"
                                >
                                    <svg
                                        className="w-5 h-5 text-gray-400 group-hover:text-white"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                                    </svg>
                                </a>
                                <a
                                    href="#"
                                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors group"
                                >
                                    <svg
                                        className="w-5 h-5 text-gray-400 group-hover:text-white"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                                    </svg>
                                </a>
                                <a
                                    href="#"
                                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors group"
                                >
                                    <svg
                                        className="w-5 h-5 text-gray-400 group-hover:text-white"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                    </svg>
                                </a>
                                <a
                                    href="#"
                                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors group"
                                >
                                    <svg
                                        className="w-5 h-5 text-gray-400 group-hover:text-white"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z" />
                                    </svg>
                                </a>
                            </div>
                        </div>

                        {/* Product */}
                        <div>
                            <h3 className="font-bold text-lg mb-6 text-white">
                                Product
                            </h3>
                            <ul className="space-y-3">
                                <li>
                                    <a
                                        href="#features"
                                        className="text-gray-300 hover:text-primary-400 transition-colors"
                                    >
                                        Features
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#how-it-works"
                                        className="text-gray-300 hover:text-primary-400 transition-colors"
                                    >
                                        How it works
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#pricing"
                                        className="text-gray-300 hover:text-primary-400 transition-colors"
                                    >
                                        Pricing
                                    </a>
                                </li>
                                <li>
                                    <Link
                                        href="/create"
                                        className="text-gray-300 hover:text-primary-400 transition-colors"
                                    >
                                        Create Exam
                                    </Link>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="text-gray-300 hover:text-primary-400 transition-colors"
                                    >
                                        API Documentation
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Company */}
                        <div>
                            <h3 className="font-bold text-lg mb-6 text-white">
                                Company
                            </h3>
                            <ul className="space-y-3">
                                <li>
                                    <a
                                        href="#about"
                                        className="text-gray-300 hover:text-primary-400 transition-colors"
                                    >
                                        About Us
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#testimonials"
                                        className="text-gray-300 hover:text-primary-400 transition-colors"
                                    >
                                        Testimonials
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="text-gray-300 hover:text-primary-400 transition-colors"
                                    >
                                        Blog
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="text-gray-300 hover:text-primary-400 transition-colors"
                                    >
                                        Careers
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="text-gray-300 hover:text-primary-400 transition-colors"
                                    >
                                        Contact
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Section */}
                    <div className="border-t border-gray-800 mt-12 pt-8">
                        <div className="flex flex-col md:flex-row justify-between items-center">
                            <div className="text-gray-400 text-sm mb-4 md:mb-0">
                                © {new Date().getFullYear()} SciHorizone. All
                                rights reserved. Made with ❤️ for educators
                                worldwide.
                            </div>
                            <div className="flex space-x-6 text-sm">
                                <a
                                    href="#"
                                    className="text-gray-400 hover:text-primary-400 transition-colors"
                                >
                                    Privacy Policy
                                </a>
                                <a
                                    href="#"
                                    className="text-gray-400 hover:text-primary-400 transition-colors"
                                >
                                    Terms of Service
                                </a>
                                <a
                                    href="#"
                                    className="text-gray-400 hover:text-primary-400 transition-colors"
                                >
                                    Cookie Policy
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </main>
    );
}
