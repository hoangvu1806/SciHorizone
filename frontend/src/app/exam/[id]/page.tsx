"use client";

import { useState, useEffect, useRef, useLayoutEffect, ReactNode } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { API_BASE_URL, API_ENDPOINTS } from "@/config/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
// MatchingInformationQuestion component has been removed

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

type Passage = {
    id: number;
    title: string;
    content: string;
    wordCount: number;
    passageType: string;
    passageNumber: number;
};

type PassageAnalysis = {
    id: number;
    passageNumber: number;
    difficultyLevel: string;
    mainTopic: string;
    questionTypes: string[];
    vocabularyLevel: string;
    suggestedTime: number;
    targetWordCount?: {
        min: number;
        max: number;
    };
};

type QuestionOption = {
    id: string;
    text: string;
};

// Định nghĩa các loại câu hỏi IELTS
type QuestionType =
    | "true_false_not_given"
    | "yes_no_not_given"
    | "matching_headings"
    | "matching_information"
    | "matching_features"
    | "matching_sentence_endings"
    | "sentence_completion"
    | "summary_completion"
    | "note_completion"
    | "table_completion"
    | "flow_chart_completion"
    | "diagram_label_completion"
    | "multiple_choice"
    | "list_selection"
    | "short_answer";

type Question = {
    id: number;
    text: string;
    type: QuestionType;
    options?: QuestionOption[] | string[] | Record<string, string>; // Added Record<string, string> for TOEIC format
    answer: string;
    explanation?: string;
    passageId: number | null;
    questionCategory: number;
    questionNumber: number;
    grammarPoint?: string; // For TOEIC
    questionType?: string; // For TOEIC (Grammar/Vocabulary)
};

type Exam = {
    id: string;
    title: string;
    examType: "IELTS" | "TOEIC";
    difficulty: string;
    passages: Passage[];
    passageAnalysis: PassageAnalysis[];
    questions: Question[];
    totalWordCount: number;
    createdAt: string;
    overallScore: number;
    strengths: string[];
    weaknesses: string[];
    improvementSuggestions: string[];
};

export default function ExamPage() {
    const { id } = useParams();
    const [exam, setExam] = useState<Exam | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPassage, setSelectedPassage] = useState<number | null>(null);
    const [showAnswers, setShowAnswers] = useState(false);
    const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState<number | null>(null);
    const [showAnalysis, setShowAnalysis] = useState(false);

    // Thêm state mới
    const [remainingTime, setRemainingTime] = useState<number | null>(null);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [showInstructions, setShowInstructions] = useState(true);
    const [userNotes, setUserNotes] = useState("");
    const [viewMode, setViewMode] = useState<"all" | "passage" | "questions">(
        "all"
    );
    const [questionsByCategory, setQuestionsByCategory] = useState<
        Record<number, Question[]>
    >({});
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const passageContentRef = useRef<HTMLDivElement>(null);

    // Hàm map loại câu hỏi từ API sang enum trong ứng dụng
    const mapQuestionType = (typeFromApi: string): QuestionType => {
        const type = typeFromApi.toLowerCase();

        if (type.includes("true/false") || type.includes("true_false")) {
            return "true_false_not_given";
        } else if (type.includes("yes/no")) {
            return "yes_no_not_given";
        } else if (type.includes("matching headings")) {
            return "matching_headings";
        } else if (type.includes("matching information")) {
            return "matching_information";
        } else if (type.includes("matching features")) {
            return "matching_features";
        } else if (type.includes("matching sentence")) {
            return "matching_sentence_endings";
        } else if (type.includes("sentence completion")) {
            return "sentence_completion";
        } else if (type.includes("summary")) {
            return "summary_completion";
        } else if (type.includes("note")) {
            return "note_completion";
        } else if (type.includes("table")) {
            return "table_completion";
        } else if (type.includes("flow")) {
            return "flow_chart_completion";
        } else if (type.includes("diagram")) {
            return "diagram_label_completion";
        } else if (type.includes("multiple choice")) {
            return "multiple_choice";
        } else if (type.includes("list selection")) {
            return "list_selection";
        } else if (type.includes("short")) {
            return "short_answer";
        } else {
            console.warn(
                `Unknown question type: ${typeFromApi}, defaulting to multiple_choice`
            );
            return "multiple_choice";
        }
    };

    // Function to parse options from text (if any)
    const parseOptions = (
        question: any
    ): QuestionOption[] | string[] | undefined => {
        if (!question.options) return undefined;

        // If options are already an array, return directly or convert to QuestionOption if needed
        if (Array.isArray(question.options)) {
            if (typeof question.options[0] === "string") {
                return question.options;
            } else {
                return question.options.map((opt: any, i: number) => ({
                    id: opt.id || String.fromCharCode(65 + i), // A, B, C, D...
                    text: opt.text || opt,
                }));
            }
        }

        // If options are a string, try to parse into an array (for matching questions)
        if (typeof question.options === "string") {
            try {
                if (question.options.includes("\n")) {
                    return question.options
                        .split("\n")
                        .map((opt: string, i: number) => ({
                            id: String.fromCharCode(65 + i),
                            text: opt.trim(),
                        }));
                }
            } catch (e) {
                console.error("Error parsing options", e);
            }
        }

        return undefined;
    };

    // GSAP effect for displaying passage content
    useLayoutEffect(() => {
        if (passageContentRef.current && selectedPassage) {
            // Create effect for elements in the passage
            const paragraphs = passageContentRef.current.querySelectorAll(
                "p, h1, h2, h3, ul, ol, blockquote"
            );

            gsap.fromTo(
                paragraphs,
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    stagger: 0.05,
                    duration: 0.5,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: passageContentRef.current,
                        start: "top 80%",
                    },
                }
            );

            // Highlight effect for important words
            const strongElements =
                passageContentRef.current.querySelectorAll("strong");
            gsap.fromTo(
                strongElements,
                { backgroundColor: "rgba(56, 189, 248, 0.3)" },
                {
                    backgroundColor: "rgba(56, 189, 248, 0)",
                    duration: 1.5,
                    delay: 1,
                    stagger: 0.1,
                    ease: "power2.out",
                }
            );
        }
    }, [selectedPassage]);

    useEffect(() => {
        const fetchExam = async () => {
            try {
                setLoading(true);

                // First, get session information to know exam type, difficulty, and passage type
                const sessionResponse = await fetch(
                    `${API_BASE_URL}${API_ENDPOINTS.SESSION_INFO(id as string)}`
                );

                if (!sessionResponse.ok) {
                    throw new Error("Failed to fetch session information");
                }

                const sessionData = await sessionResponse.json();

                // Check if session has no result
                if (!sessionData.has_result) {
                    throw new Error(
                        "Exam result is not available yet. Please generate the exam first."
                    );
                }

                // Call API /exam-data/{id} to get the created exam data
                const examResponse = await fetch(
                    `${API_BASE_URL}${API_ENDPOINTS.EXAM_DATA(id as string)}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (!examResponse.ok) {
                    throw new Error("Failed to fetch exam data");
                }

                const responseData = await examResponse.json();
                const resultData = responseData.result;

                // Auto-detect exam type based on data structure
                const hasPartNumber = resultData.part_number !== undefined;
                const hasToeicQuestions =
                    resultData.questions &&
                    resultData.questions.some(
                        (q: any) =>
                            q.options &&
                            typeof q.options === "object" &&
                            !Array.isArray(q.options) &&
                            q.options.A &&
                            q.options.B &&
                            q.options.C &&
                            q.options.D
                    );
                const detectedExamType =
                    sessionData.exam_type === "TOEIC" ||
                    hasPartNumber ||
                    hasToeicQuestions
                        ? "TOEIC"
                        : "IELTS";

                // Convert data from API to a format suitable for the frontend
                const examData: Exam = {
                    id: id as string,
                    title:
                        detectedExamType === "TOEIC"
                            ? `TOEIC Part ${resultData.part_number} Practice Test`
                            : resultData.reading_passages?.[0]?.title || "Exam",
                    examType: detectedExamType,
                    difficulty: sessionData.difficulty || "7.0",
                    overallScore:
                        resultData.estimated_score || resultData.overall_score,
                    strengths: resultData.strengths || [],
                    weaknesses: resultData.weaknesses || [],
                    improvementSuggestions:
                        resultData.improvement_suggestions || [],
                    passages:
                        detectedExamType === "TOEIC"
                            ? (resultData.reading_passages || []).map(
                                  (passage: any, index: number) => ({
                                      id: index + 1,
                                      title:
                                          passage.title ||
                                          `Passage ${index + 1}`,
                                      content: passage.content || "",
                                      wordCount: passage.word_count || 0,
                                      passageType:
                                          passage.passage_type ||
                                          `Passage ${index + 1}`,
                                      passageNumber:
                                          passage.passage_number || index + 1,
                                  })
                              )
                            : (resultData.reading_passages || []).map(
                                  (passage: any, index: number) => ({
                                      id: index + 1,
                                      title:
                                          passage.title ||
                                          `Passage ${index + 1}`,
                                      content: passage.content || "",
                                      wordCount: passage.word_count || 0,
                                      passageType:
                                          passage.passage_type ||
                                          `Passage ${index + 1}`,
                                      passageNumber:
                                          passage.passage_number || index + 1,
                                  })
                              ),
                    passageAnalysis:
                        detectedExamType === "TOEIC"
                            ? [] // TOEIC doesn't have passage analysis in the same way
                            : (resultData.passage_analysis || []).map(
                                  (analysis: any, index: number) => ({
                                      id: index + 1,
                                      passageNumber:
                                          analysis.passage_number || index + 1,
                                      difficultyLevel:
                                          analysis.difficulty_level || "Medium",
                                      mainTopic: analysis.main_topic || "",
                                      questionTypes:
                                          analysis.question_types || [],
                                      vocabularyLevel:
                                          analysis.vocabulary_level ||
                                          "Intermediate",
                                      suggestedTime:
                                          analysis.suggested_time || 20,
                                      targetWordCount:
                                          analysis.target_word_count,
                                  })
                              ),
                    questions: (resultData.questions || []).map(
                        (question: any, index: number) => {
                            // Auto-detect TOEIC format based on data structure
                            const isToeicFormat =
                                detectedExamType === "TOEIC" ||
                                (question.options &&
                                    typeof question.options === "object" &&
                                    !Array.isArray(question.options) &&
                                    question.options.A &&
                                    question.options.B &&
                                    question.options.C &&
                                    question.options.D);

                            // For TOEIC, all questions are multiple choice
                            const questionType = isToeicFormat
                                ? ("multiple_choice" as QuestionType)
                                : mapQuestionType(question.question_type || "");

                            // Process options
                            let options;

                            if (isToeicFormat) {
                                // Use the options object directly from the new API format
                                if (
                                    question.options &&
                                    typeof question.options === "object" &&
                                    !Array.isArray(question.options)
                                ) {
                                    options = question.options; // Should be {A: "text", B: "text", C: "text", D: "text"}
                                } else if (
                                    question.option_a &&
                                    question.option_b &&
                                    question.option_c &&
                                    question.option_d
                                ) {
                                    // Fallback: construct from individual option fields if they exist
                                    options = {
                                        A: question.option_a,
                                        B: question.option_b,
                                        C: question.option_c,
                                        D: question.option_d,
                                    };
                                } else {
                                    console.error(
                                        "No valid options found for TOEIC question:",
                                        question
                                    );
                                    // Don't set to null, keep the original options object
                                    options = question.options || {
                                        A: "Option A",
                                        B: "Option B",
                                        C: "Option C",
                                        D: "Option D",
                                    };
                                }
                            } else {
                                options = parseOptions(question);
                            }

                            return {
                                id: question.question_number || index + 1,
                                text: question.question_text || "",
                                type: questionType,
                                options: options,
                                answer: question.correct_answer || "",
                                explanation: question.explanation || "",
                                passageId: question.passage_reference || null,
                                questionCategory:
                                    question.part ||
                                    question.question_category ||
                                    1,
                                questionNumber:
                                    question.question_number || index + 1,
                                grammarPoint: question.grammar_point || "",
                                questionType: question.question_type || "",
                            };
                        }
                    ),
                    totalWordCount:
                        detectedExamType === "TOEIC"
                            ? 0 // TOEIC Part 5 doesn't have passages
                            : resultData.reading_passages?.reduce(
                                  (total: number, passage: any) =>
                                      total + (passage.word_count || 0),
                                  0
                              ) || 0,
                    createdAt: new Date().toISOString(),
                };

                setExam(examData);

                // Calculate the time to complete the exam
                let totalTime;
                if (detectedExamType === "TOEIC") {
                    // TOEIC timing based on part number
                    const partNumber = resultData.part_number || 5;
                    switch (partNumber) {
                        case 5:
                            totalTime = 30; // 30 minutes for Part 5
                            break;
                        case 6:
                            totalTime = 16; // 16 minutes for Part 6
                            break;
                        case 7:
                            totalTime = 54; // 54 minutes for Part 7
                            break;
                        default:
                            totalTime = 30;
                    }
                } else {
                    // IELTS timing based on passage analysis
                    totalTime = examData.passageAnalysis.reduce(
                        (total, analysis) =>
                            total + (analysis.suggestedTime || 20),
                        0
                    );
                }
                setRemainingTime(totalTime * 60); // Convert to seconds

                // Group questions by category
                const questionGroups: Record<number, Question[]> = {};
                examData.questions.forEach((q) => {
                    if (!questionGroups[q.questionCategory]) {
                        questionGroups[q.questionCategory] = [];
                    }
                    questionGroups[q.questionCategory].push(q);
                });
                setQuestionsByCategory(questionGroups);

                // Set the first passage as selected by default
                if (examData.passages && examData.passages.length > 0) {
                    setSelectedPassage(examData.passages[0].id);
                }
            } catch (err) {
                console.error("Error fetching exam:", err);
                setError(
                    err instanceof Error ? err.message : "Failed to load exam"
                );
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchExam();
        }

        // Cleanup timer on unmount
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [id]);

    const startTimer = () => {
        if (!isTimerRunning && remainingTime && remainingTime > 0) {
            setIsTimerRunning(true);
            timerRef.current = setInterval(() => {
                setRemainingTime((prev) => {
                    if (prev && prev > 0) {
                        return prev - 1;
                    } else {
                        clearInterval(timerRef.current as NodeJS.Timeout);
                        setIsTimerRunning(false);
                        return 0;
                    }
                });
            }, 1000);
        }
    };

    const pauseTimer = () => {
        if (isTimerRunning && timerRef.current) {
            clearInterval(timerRef.current);
            setIsTimerRunning(false);
        }
    };

    const resetTimer = () => {
        pauseTimer();
        if (exam) {
            const totalTime = exam.passageAnalysis.reduce(
                (total, analysis) => total + (analysis.suggestedTime || 20),
                0
            );
            setRemainingTime(totalTime * 60);
        }
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${
            remainingSeconds < 10 ? "0" : ""
        }${remainingSeconds}`;
    };

    // Function to render matching questions based on different formats
    const renderMatchingQuestion = (
        question: Question,
        userAnswers: Record<number, string>,
        handleAnswerChange: Function,
        isSubmitted: boolean,
        showAnswers: boolean
    ) => {
        // Special handling for Matching Headings
        if (question.type === "matching_headings") {
            return renderMatchingHeadingsQuestion(
                question,
                userAnswers,
                handleAnswerChange,
                isSubmitted,
                showAnswers
            );
        }

        // Special handling for Matching Sentence Endings
        if (question.type === "matching_sentence_endings") {
            return renderMatchingSentenceEndingsQuestion(
                question,
                userAnswers,
                handleAnswerChange,
                isSubmitted,
                showAnswers
            );
        }

        // Process text question and separate options if possible
        let questionText = question.text;
        let matchingItems: { id: string; text: string }[] = [];
        let matchingOptions: { id: string; text: string }[] = [];

        // Try to analyze the matching question content
        try {
            // For matching information questions, usually has format A, B, C... and options 1, 2, 3...
            if (
                question.type === "matching_information" &&
                question.options &&
                Array.isArray(question.options)
            ) {
                if (typeof question.options[0] === "string") {
                    // Create standard options from string array
                    matchingOptions = (question.options as string[]).map(
                        (opt: string, i: number) => ({
                            id: String.fromCharCode(65 + i), // A, B, C...
                            text: opt,
                        })
                    );
                } else if (typeof question.options[0] === "object") {
                    matchingOptions = question.options as unknown as {
                        id: string;
                        text: string;
                    }[];
                }

                // Analyze text to find parts that need matching
                // Usually matching_information questions have format like:
                // "A. Information1\nB. Information2\nC. Information3"
                const lines = questionText.split("\n");
                questionText = lines[0] || ""; // Main question

                // Create a list of items that need to be matched
                for (let i = 1; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (line) {
                        const match = line.match(/^([A-Z1-9][.)]?)\s+(.*)/);
                        if (match) {
                            matchingItems.push({
                                id: match[1].replace(/[.)]/, ""),
                                text: match[2],
                            });
                        } else {
                            matchingItems.push({
                                id: String(i),
                                text: line,
                            });
                        }
                    }
                }

                // Use default UI for Matching Information questions
                if (matchingItems.length > 0 && matchingOptions.length > 0) {
                    return (
                        <div className="p-4 bg-secondary-50 rounded-lg">
                            <h3 className="font-medium text-lg mb-4">
                                {questionText}
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <h4 className="font-medium text-secondary-800 mb-2">
                                        Information:
                                    </h4>
                                    <ul className="space-y-2">
                                        {matchingItems.map((item) => (
                                            <li
                                                key={item.id}
                                                className="flex items-start"
                                            >
                                                <span className="inline-flex items-center justify-center w-6 h-6 mr-2 rounded-full bg-primary-100 text-primary-800 text-xs font-bold flex-shrink-0 mt-0.5">
                                                    {item.id}
                                                </span>
                                                <span>{item.text}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <h4 className="font-medium text-secondary-800 mb-2">
                                        Options:
                                    </h4>
                                    <ul className="space-y-2">
                                        {matchingOptions.map((option) => (
                                            <li
                                                key={option.id}
                                                className="flex items-start"
                                            >
                                                <span className="inline-flex items-center justify-center w-6 h-6 mr-2 rounded-full bg-secondary-200 text-secondary-800 text-xs font-bold flex-shrink-0 mt-0.5">
                                                    {option.id}
                                                </span>
                                                <span>{option.text}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor={`answer-${question.id}`}
                                    className="block text-sm font-medium text-secondary-700 mb-1"
                                >
                                    Your answer (e.g.: A-1, B-2, C-3):
                                </label>
                                <input
                                    type="text"
                                    id={`answer-${question.id}`}
                                    value={userAnswers[question.id] || ""}
                                    onChange={(e) =>
                                        handleAnswerChange(
                                            question.id,
                                            e.target.value
                                        )
                                    }
                                    placeholder="e.g. A-1, B-2, C-3"
                                    disabled={isSubmitted}
                                    className="w-full p-2 border border-secondary-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>

                            {isSubmitted && showAnswers && (
                                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                                    <p className="font-medium text-green-800 mb-2">
                                        Correct answer: {question.answer}
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                }
            }
        } catch (e) {
            console.error("Error parsing matching question:", e);
        }

        // If unable to parse, use default UI
        if (matchingItems.length === 0 || matchingOptions.length === 0) {
            // Use default UI when question data cannot be parsed
            return (
                <div className="p-4 bg-secondary-50 rounded-lg">
                    <p className="whitespace-pre-line mb-4">{question.text}</p>

                    {question.options && Array.isArray(question.options) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <h4 className="font-medium text-secondary-800">
                                    Choices:
                                </h4>
                                <ul className="list-none space-y-1">
                                    {question.options.map((option, idx) => {
                                        const optionText =
                                            typeof option === "string"
                                                ? option
                                                : option.text;
                                        const optionId =
                                            typeof option === "string"
                                                ? String(idx + 1)
                                                : option.id;

                                        return (
                                            <li
                                                key={idx}
                                                className="pl-7 relative text-sm"
                                            >
                                                <span className="absolute left-0 top-0 w-5 h-5 flex items-center justify-center bg-primary-100 text-primary-800 rounded-full text-xs font-medium">
                                                    {optionId}
                                                </span>
                                                {optionText}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>

                            <div>
                                <div className="mb-2">
                                    <label
                                        htmlFor={`answer-${question.id}`}
                                        className="block text-sm font-medium text-secondary-700"
                                    >
                                        Your Answer:
                                    </label>
                                    <input
                                        type="text"
                                        id={`answer-${question.id}`}
                                        value={userAnswers[question.id] || ""}
                                        onChange={(e) =>
                                            handleAnswerChange(
                                                question.id,
                                                e.target.value
                                            )
                                        }
                                        placeholder="e.g. A-3, B-1, C-2"
                                        disabled={isSubmitted}
                                        className="mt-1 block w-full rounded-md border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                    />
                                </div>

                                {showAnswers && (
                                    <p className="text-sm mt-2">
                                        <span className="font-medium">
                                            Correct Answer:
                                        </span>{" "}
                                        {question.answer}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        // UI for other types of matching questions based on data analysis
        return (
            <div className="p-6 bg-white rounded-xl shadow-sm border border-secondary-200 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-semibold text-secondary-900 mb-4 pb-2 border-b border-secondary-200">
                    {questionText}
                </h3>

                <div className="mb-6">
                    <div className="flex items-center mb-4">
                        <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center mr-3">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <h4 className="text-base font-semibold text-secondary-900">
                            Match the following items with the correct options
                        </h4>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-secondary-50 p-4 rounded-lg">
                        {/* Items Column */}
                        <div className="space-y-3">
                            <div className="flex items-center mb-2">
                                <span className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs mr-2">
                                    A
                                </span>
                                <h5 className="font-medium text-secondary-800">
                                    Items
                                </h5>
                            </div>
                            <ul className="list-none space-y-3">
                                {matchingItems.map((item, idx) => (
                                    <li
                                        key={idx}
                                        className="p-3 bg-white rounded-lg shadow-sm border border-secondary-200 flex items-center transition-all hover:shadow-md"
                                    >
                                        <span className="inline-flex items-center justify-center w-7 h-7 mr-3 rounded-full bg-primary-100 text-primary-800 text-sm font-bold">
                                            {item.id}
                                        </span>
                                        <span className="text-secondary-800">
                                            {item.text}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Options Column */}
                        <div className="space-y-3">
                            <div className="flex items-center mb-2">
                                <span className="w-6 h-6 rounded-full bg-secondary-700 text-white flex items-center justify-center text-xs mr-2">
                                    B
                                </span>
                                <h5 className="font-medium text-secondary-800">
                                    Options
                                </h5>
                            </div>
                            <ul className="list-none space-y-3">
                                {matchingOptions.map((option, idx) => (
                                    <li
                                        key={idx}
                                        className="p-3 bg-white rounded-lg shadow-sm border border-secondary-200 flex items-center transition-all hover:shadow-md"
                                    >
                                        <span className="inline-flex items-center justify-center w-7 h-7 mr-3 rounded-full bg-secondary-200 text-secondary-800 text-sm font-bold">
                                            {option.id}
                                        </span>
                                        <span className="text-secondary-800">
                                            {option.text}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="mt-6 bg-white p-4 rounded-lg border border-secondary-200 shadow-sm">
                    <div className="flex items-center mb-3">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-primary-600 mr-2"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <span className="text-sm text-secondary-600 italic">
                            Format your answer as: A-3, B-1, C-2 (Item-Option)
                        </span>
                    </div>

                    <label
                        htmlFor={`answer-${question.id}`}
                        className="block text-sm font-medium text-secondary-700 mb-2"
                    >
                        Your Answer:
                    </label>

                    <div className="relative">
                        <input
                            type="text"
                            id={`answer-${question.id}`}
                            value={userAnswers[question.id] || ""}
                            onChange={(e) =>
                                handleAnswerChange(question.id, e.target.value)
                            }
                            placeholder="e.g. A-3, B-1, C-2"
                            disabled={isSubmitted}
                            className="block w-full rounded-lg border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-base py-3 pl-4 pr-12 transition-all duration-200 hover:border-secondary-400"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-secondary-400"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                        </div>
                    </div>

                    {showAnswers && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm flex items-start">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <div>
                                <span className="font-medium text-green-800 block mb-1">
                                    Correct Answer:
                                </span>
                                <span className="text-green-700">
                                    {question.answer}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Add new function to specifically handle Matching Sentence Endings questions
    const renderMatchingSentenceEndingsQuestion = (
        question: Question,
        userAnswers: Record<number, string>,
        handleAnswerChange: Function,
        isSubmitted: boolean,
        showAnswers: boolean
    ) => {
        // For Matching Sentence Endings, the question text is the sentence beginning
        // and the options array contains the possible endings
        let sentenceEndings: { id: string; text: string }[] = [];

        // Extract sentence endings from options
        if (question.options && Array.isArray(question.options)) {
            sentenceEndings = question.options.map((opt, i) => {
                if (typeof opt === "string") {
                    return {
                        id: String.fromCharCode(65 + i), // A, B, C, D...
                        text: opt,
                    };
                } else if (typeof opt === "object" && opt.text) {
                    return {
                        id: opt.id || String.fromCharCode(65 + i),
                        text: opt.text,
                    };
                }
                return {
                    id: String.fromCharCode(65 + i),
                    text: String(opt),
                };
            });
        }

        // If no options found, provide fallback
        if (sentenceEndings.length === 0) {
            console.warn(
                "No options found for Matching Sentence Endings question:",
                question.id
            );
            sentenceEndings = [
                { id: "A", text: "Option A" },
                { id: "B", text: "Option B" },
                { id: "C", text: "Option C" },
                { id: "D", text: "Option D" },
            ];
        }

        return (
            <div className="space-y-4">
                <div className="mb-6">
                    <h4 className="font-medium text-secondary-800 mb-3">
                        Sentence Beginning:
                    </h4>
                    <div className="p-3 bg-blue-50 rounded border border-blue-200">
                        <span className="text-secondary-700">
                            {question.text}
                        </span>
                    </div>
                </div>

                <div className="mb-6">
                    <h4 className="font-medium text-secondary-800 mb-3">
                        Choices:
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                        {sentenceEndings.map((ending) => (
                            <div
                                key={ending.id}
                                className="p-3 bg-white rounded border border-secondary-200"
                            >
                                <span className="font-medium text-secondary-600">
                                    {ending.id}.
                                </span>{" "}
                                {ending.text}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="font-medium text-secondary-800">
                        Your Answer:
                    </h4>
                    <div className="flex items-center space-x-4">
                        <span className="font-medium text-primary-600">
                            Select the correct ending:
                        </span>
                        <select
                            value={userAnswers[question.id] || ""}
                            onChange={(e) =>
                                handleAnswerChange(question.id, e.target.value)
                            }
                            disabled={isSubmitted}
                            className="flex-1 p-2 border border-secondary-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        >
                            <option value="">Select an ending...</option>
                            {sentenceEndings.map((ending) => (
                                <option key={ending.id} value={ending.text}>
                                    {ending.id}. {ending.text}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {isSubmitted && showAnswers && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                        <p className="font-medium text-green-800 mb-2">
                            Correct answer: {question.answer}
                        </p>
                        {question.explanation && (
                            <p className="text-green-700 text-sm">
                                {question.explanation}
                            </p>
                        )}
                    </div>
                )}
            </div>
        );
    };

    // Add new function to specifically handle Matching Headings questions
    const renderMatchingHeadingsQuestion = (
        question: Question,
        userAnswers: Record<number, string>,
        handleAnswerChange: Function,
        isSubmitted: boolean,
        showAnswers: boolean
    ) => {
        // Transform options if needed
        let options: { id: string; text: string }[] = [];

        if (question.options) {
            if (Array.isArray(question.options)) {
                options = question.options.map((opt, i) => {
                    if (typeof opt === "string") {
                        return { id: String(i + 1), text: opt };
                    } else {
                        return opt as unknown as { id: string; text: string };
                    }
                });
            }
        }

        // Analyze question text to find the number of sections to match
        let sections: { id: string; text: string }[] = [];
        const questionText = question.text;

        // Analyze text to find sections
        try {
            const match = questionText.match(/Section\s+(\d+\.\d+)/i);
            if (match) {
                sections.push({
                    id: match[1],
                    text: `Section ${match[1]}`,
                });
            } else {
                // If no specific pattern is found, create default item
                sections.push({
                    id: "1",
                    text: "This paragraph",
                });
            }
        } catch (e) {
            console.error("Error parsing matching headings question:", e);
        }

        // Normalize saved answer
        const normalizeAnswer = (answer: string | string[]): string => {
            // Kiểm tra nếu answer là mảng
            if (Array.isArray(answer)) {
                // Nếu là mảng, trả về phần tử đầu tiên đã được chuẩn hóa
                return answer[0] ? answer[0].toLowerCase().trim() : "";
            }
            // Nếu là chuỗi hoặc giá trị khác
            if (typeof answer === "string") {
                // Remove whitespace, convert to lowercase
                return answer.toLowerCase().trim();
            }
            // Trường hợp khác, trả về chuỗi rỗng
            return "";
        };

        // Check if answer is correct
        const isCorrectAnswer = (
            userAnswer: string,
            correctAnswer: string | string[]
        ): boolean => {
            const normalizedUserAnswer = normalizeAnswer(userAnswer);

            // Kiểm tra nếu correctAnswer là mảng
            if (Array.isArray(correctAnswer)) {
                // Kiểm tra xem userAnswer có khớp với bất kỳ phần tử nào trong mảng không
                return correctAnswer.some((ans) => {
                    if (typeof ans === "string") {
                        return normalizeAnswer(ans) === normalizedUserAnswer;
                    }
                    return false;
                });
            }

            // Xử lý trường hợp correctAnswer là chuỗi
            const normalizedCorrectAnswer = normalizeAnswer(correctAnswer);
            return normalizedUserAnswer === normalizedCorrectAnswer;
        };

        return (
            <div className="p-4 bg-secondary-50 rounded-lg">
                <p className="font-medium mb-4">{questionText}</p>

                <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-4">
                        <h4 className="font-medium text-secondary-800 border-b pb-1">
                            Choose the most appropriate heading:
                        </h4>
                        <div className="space-y-2">
                            {options.map((option, idx) => (
                                <div
                                    key={idx}
                                    className={`
                  p-3 border rounded-lg cursor-pointer transition-colors
                  ${
                      isSubmitted && showAnswers
                          ? isCorrectAnswer(option.text, question.answer)
                              ? "bg-green-50 border-green-300"
                              : userAnswers[question.id] === option.text
                              ? "bg-red-50 border-red-300"
                              : "bg-white border-secondary-200"
                          : userAnswers[question.id] === option.text
                          ? "bg-primary-50 border-primary-300"
                          : "bg-white border-secondary-200 hover:bg-secondary-50"
                  }
                `}
                                    onClick={() =>
                                        !isSubmitted &&
                                        handleAnswerChange(
                                            question.id,
                                            option.text
                                        )
                                    }
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`
                      w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0
                      ${
                          userAnswers[question.id] === option.text
                              ? "bg-primary-500 text-white"
                              : "bg-white border border-secondary-300"
                      }
                    `}
                                        >
                                            {userAnswers[question.id] ===
                                                option.text && (
                                                <svg
                                                    className="w-3 h-3"
                                                    fill="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <span className="font-medium">
                                                {option.id}.
                                            </span>{" "}
                                            {option.text}
                                        </div>
                                        {isSubmitted &&
                                            showAnswers &&
                                            isCorrectAnswer(
                                                option.text,
                                                question.answer
                                            ) && (
                                                <svg
                                                    className="inline-block ml-1 w-4 h-4 text-green-600"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M5 13l4 4L19 7"
                                                    />
                                                </svg>
                                            )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {showAnswers && (
                    <div className="mt-4 p-3 bg-secondary-100 rounded text-sm space-y-2">
                        <div>
                            <span className="font-medium">Correct Answer:</span>{" "}
                            {question.answer}
                        </div>
                        {question.explanation && (
                            <div>
                                <span className="font-medium">
                                    Explanation:
                                </span>{" "}
                                {question.explanation}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    // Function to render question based on its type
    const renderQuestion = (
        question: Question,
        userAnswers: Record<number, string>,
        handleAnswerChange: Function,
        isSubmitted: boolean,
        showAnswers: boolean
    ): ReactNode => {
        // Handle matching questions
        if (
            question.type === "matching_headings" ||
            question.type === "matching_information" ||
            question.type === "matching_features" ||
            question.type === "matching_sentence_endings"
        ) {
            return renderMatchingQuestion(
                question,
                userAnswers,
                handleAnswerChange,
                isSubmitted,
                showAnswers
            );
        }

        // Handle Yes/No/Not Given questions
        else if (question.type === "yes_no_not_given") {
            return (
                <div className="space-y-3">
                    {["Yes", "No", "Not Given"].map((option) => (
                        <div key={option} className="flex items-start">
                            <input
                                type="radio"
                                id={`q${question.id}-${option}`}
                                name={`question-${question.id}`}
                                value={option}
                                checked={userAnswers[question.id] === option}
                                onChange={() =>
                                    handleAnswerChange(question.id, option)
                                }
                                disabled={isSubmitted}
                                className="mt-1 h-4 w-4 border-secondary-300 text-primary-600 focus:ring-primary-500"
                            />
                            <label
                                htmlFor={`q${question.id}-${option}`}
                                className={`ml-2 block text-sm ${
                                    showAnswers
                                        ? isSubmitted
                                            ? userAnswers[question.id] ===
                                              option
                                                ? option === question.answer
                                                    ? "text-green-700 font-medium"
                                                    : "text-red-700 font-medium"
                                                : option === question.answer
                                                ? "text-green-700 font-medium"
                                                : "text-secondary-700"
                                            : option === question.answer
                                            ? "text-green-700 font-medium"
                                            : "text-secondary-700"
                                        : "text-secondary-700"
                                }`}
                            >
                                {option}
                                {showAnswers && option === question.answer && (
                                    <svg
                                        className="inline-block ml-1 w-4 h-4 text-green-600"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                )}
                            </label>
                        </div>
                    ))}

                    {showAnswers &&
                        (question.explanation ||
                            question.grammarPoint ||
                            question.questionType) && (
                            <div className="mt-4 p-3 bg-secondary-50 rounded-lg border border-secondary-100">
                                {question.explanation && (
                                    <p className="text-sm font-medium text-secondary-900 mb-2">
                                        <span className="font-semibold">
                                            Explanation:
                                        </span>{" "}
                                        {question.explanation}
                                    </p>
                                )}
                                {question.grammarPoint && (
                                    <p className="text-sm text-secondary-700 mb-1">
                                        <span className="font-semibold">
                                            Grammar Point:
                                        </span>{" "}
                                        {question.grammarPoint}
                                    </p>
                                )}
                                {question.questionType && (
                                    <p className="text-sm text-secondary-700">
                                        <span className="font-semibold">
                                            Question Type:
                                        </span>{" "}
                                        {question.questionType}
                                    </p>
                                )}
                            </div>
                        )}
                </div>
            );
        }

        // Handle True/False/Not Given questions
        else if (question.type === "true_false_not_given") {
            return (
                <div className="space-y-3">
                    {["True", "False", "Not Given"].map((option) => (
                        <div key={option} className="flex items-start">
                            <input
                                type="radio"
                                id={`q${question.id}-${option}`}
                                name={`question-${question.id}`}
                                value={option}
                                checked={userAnswers[question.id] === option}
                                onChange={() =>
                                    handleAnswerChange(question.id, option)
                                }
                                disabled={isSubmitted}
                                className="mt-1 h-4 w-4 border-secondary-300 text-primary-600 focus:ring-primary-500"
                            />
                            <label
                                htmlFor={`q${question.id}-${option}`}
                                className={`ml-2 block text-sm ${
                                    showAnswers
                                        ? isSubmitted
                                            ? userAnswers[question.id] ===
                                              option
                                                ? option === question.answer
                                                    ? "text-green-700 font-medium"
                                                    : "text-red-700 font-medium"
                                                : option === question.answer
                                                ? "text-green-700 font-medium"
                                                : "text-secondary-700"
                                            : option === question.answer
                                            ? "text-green-700 font-medium"
                                            : "text-secondary-700"
                                        : "text-secondary-700"
                                }`}
                            >
                                {option}
                                {showAnswers && option === question.answer && (
                                    <svg
                                        className="inline-block ml-1 w-4 h-4 text-green-600"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                )}
                            </label>
                        </div>
                    ))}

                    {showAnswers &&
                        (question.explanation ||
                            question.grammarPoint ||
                            question.questionType) && (
                            <div className="mt-4 p-3 bg-secondary-50 rounded-lg border border-secondary-100">
                                {question.explanation && (
                                    <p className="text-sm font-medium text-secondary-900 mb-2">
                                        <span className="font-semibold">
                                            Explanation:
                                        </span>{" "}
                                        {question.explanation}
                                    </p>
                                )}
                                {question.grammarPoint && (
                                    <p className="text-sm text-secondary-700 mb-1">
                                        <span className="font-semibold">
                                            Grammar Point:
                                        </span>{" "}
                                        {question.grammarPoint}
                                    </p>
                                )}
                                {question.questionType && (
                                    <p className="text-sm text-secondary-700">
                                        <span className="font-semibold">
                                            Question Type:
                                        </span>{" "}
                                        {question.questionType}
                                    </p>
                                )}
                            </div>
                        )}
                </div>
            );
        }

        // Handle multiple choice questions
        else if (question.type === "multiple_choice") {
            if (!question.options) {
                // If no options, show debug info and fallback
                return (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-800">
                            Multiple choice question has no options. Question
                            type: {question.type}
                        </p>
                        <p className="text-xs text-red-600 mt-1">
                            Options value: {JSON.stringify(question.options)}
                        </p>
                        <input
                            type="text"
                            id={`q${question.id}-answer`}
                            value={userAnswers[question.id] || ""}
                            onChange={(e) =>
                                handleAnswerChange(question.id, e.target.value)
                            }
                            disabled={isSubmitted}
                            placeholder="Enter your answer..."
                            className="mt-2 w-full p-2 border border-secondary-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                );
            }
            let options: QuestionOption[] = [];

            // Handle TOEIC format: {A: "text", B: "text", C: "text", D: "text"}

            if (
                question.options &&
                typeof question.options === "object" &&
                !Array.isArray(question.options) &&
                question.options !== null
            ) {
                options = Object.entries(question.options).map(
                    ([key, value]) => ({
                        id: key,
                        text: value as string,
                    })
                );
            }
            // Handle array format
            else if (Array.isArray(question.options)) {
                options = question.options.map((opt, i) => {
                    if (typeof opt === "string") {
                        return { id: String.fromCharCode(65 + i), text: opt };
                    }
                    return opt as QuestionOption;
                });
            } else {
                console.warn(
                    "No valid options found for question:",
                    question.id,
                    "options:",
                    question.options
                );
                // Provide fallback options to prevent empty display
                options = [
                    { id: "A", text: "Option A" },
                    { id: "B", text: "Option B" },
                    { id: "C", text: "Option C" },
                    { id: "D", text: "Option D" },
                ];
            }

            return (
                <div className="space-y-3">
                    {options.map((option) => (
                        <div key={option.id} className="flex items-start">
                            <input
                                type="radio"
                                id={`q${question.id}-${option.id}`}
                                name={`question-${question.id}`}
                                value={option.id}
                                checked={userAnswers[question.id] === option.id}
                                onChange={() =>
                                    handleAnswerChange(question.id, option.id)
                                }
                                disabled={isSubmitted}
                                className="mt-1 h-4 w-4 border-secondary-300 text-primary-600 focus:ring-primary-500"
                            />
                            <label
                                htmlFor={`q${question.id}-${option.id}`}
                                className={`ml-2 block text-sm ${
                                    showAnswers && isSubmitted
                                        ? userAnswers[question.id] === option.id
                                            ? option.text === question.answer
                                                ? "text-green-700 font-medium"
                                                : "text-red-700 font-medium"
                                            : option.text === question.answer
                                            ? "text-green-700 font-medium"
                                            : "text-secondary-700"
                                        : "text-secondary-700"
                                }`}
                            >
                                <span className="font-medium">
                                    {option.id}.
                                </span>{" "}
                                {option.text}
                                {showAnswers &&
                                    isSubmitted &&
                                    option.text === question.answer && (
                                        <svg
                                            className="inline-block ml-1 w-4 h-4 text-green-600"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    )}
                            </label>
                        </div>
                    ))}

                    {showAnswers &&
                        (question.explanation ||
                            question.grammarPoint ||
                            question.questionType) && (
                            <div className="mt-4 p-3 bg-secondary-50 rounded-lg border border-secondary-100">
                                {question.explanation && (
                                    <p className="text-sm font-medium text-secondary-900 mb-2">
                                        <span className="font-semibold">
                                            Explanation:
                                        </span>{" "}
                                        {question.explanation}
                                    </p>
                                )}
                                {question.grammarPoint && (
                                    <p className="text-sm text-secondary-700 mb-1">
                                        <span className="font-semibold">
                                            Grammar Point:
                                        </span>{" "}
                                        {question.grammarPoint}
                                    </p>
                                )}
                                {question.questionType && (
                                    <p className="text-sm text-secondary-700">
                                        <span className="font-semibold">
                                            Question Type:
                                        </span>{" "}
                                        {question.questionType}
                                    </p>
                                )}
                            </div>
                        )}
                </div>
            );
        }

        // Handle completion questions
        else if (
            question.type === "sentence_completion" ||
            question.type === "summary_completion" ||
            question.type === "note_completion" ||
            question.type === "table_completion" ||
            question.type === "flow_chart_completion" ||
            question.type === "diagram_label_completion"
        ) {
            return (
                <div>
                    <p className="whitespace-pre-line mb-4">{question.text}</p>
                    <input
                        type="text"
                        id={`q${question.id}-answer`}
                        value={userAnswers[question.id] || ""}
                        onChange={(e) =>
                            handleAnswerChange(question.id, e.target.value)
                        }
                        disabled={isSubmitted}
                        placeholder="Enter your answer..."
                        className="w-full p-2 border border-secondary-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    />
                </div>
            );
        }

        // Handle short answer questions
        else if (question.type === "short_answer") {
            return (
                <div>
                    <input
                        type="text"
                        id={`q${question.id}-answer`}
                        value={userAnswers[question.id] || ""}
                        onChange={(e) =>
                            handleAnswerChange(question.id, e.target.value)
                        }
                        disabled={isSubmitted}
                        placeholder="Enter your answer..."
                        className="w-full p-2 border border-secondary-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    />

                    {showAnswers && (
                        <div className="mt-4 p-3 bg-secondary-50 rounded-lg border border-secondary-100">
                            <p className="text-sm font-medium text-secondary-900">
                                Correct Answer: {question.answer}
                            </p>
                            {question.explanation && (
                                <p className="mt-2 text-sm text-secondary-700">
                                    {question.explanation}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            );
        }

        // Default case (if no matching question type)
        return (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                    This question type ({question.type}) is not fully supported
                    yet. Please input your answer below:
                </p>
                <input
                    type="text"
                    id={`q${question.id}-answer`}
                    value={userAnswers[question.id] || ""}
                    onChange={(e) =>
                        handleAnswerChange(question.id, e.target.value)
                    }
                    disabled={isSubmitted}
                    placeholder="Enter your answer..."
                    className="mt-2 w-full p-2 border border-secondary-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />

                {showAnswers && (
                    <div className="mt-4 p-3 bg-secondary-50 rounded-lg border border-secondary-100">
                        <p className="text-sm font-medium text-secondary-900">
                            Correct Answer: {question.answer}
                        </p>
                        {question.explanation && (
                            <p className="mt-2 text-sm text-secondary-700">
                                {question.explanation}
                            </p>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const handleAnswerChange = (questionId: number, answer: string) => {
        setUserAnswers((prev) => ({
            ...prev,
            [questionId]: answer,
        }));
    };

    const handleSubmit = () => {
        if (!exam) return;

        let correctCount = 0;

        exam.questions.forEach((question) => {
            // Special handling for Matching Headings questions
            if (question.type === "matching_headings") {
                // Compare without case sensitivity and remove whitespace
                const userAnswer = (userAnswers[question.id] || "")
                    .toLowerCase()
                    .trim();

                // Kiểm tra nếu answer là mảng
                if (Array.isArray(question.answer)) {
                    // Nếu là mảng, kiểm tra xem userAnswer có khớp với bất kỳ phần tử nào trong mảng không
                    const isCorrect = question.answer.some((ans) => {
                        return (
                            typeof ans === "string" &&
                            ans.toLowerCase().trim() === userAnswer
                        );
                    });
                    if (isCorrect) {
                        correctCount++;
                    }
                } else if (typeof question.answer === "string") {
                    const correctAnswer = question.answer.toLowerCase().trim();

                    // Kiểm tra xem đáp án có phải chỉ là ký tự (như "A", "B", "C") không
                    if (
                        correctAnswer.length === 1 &&
                        correctAnswer.match(/[a-z]/i)
                    ) {
                        // Nếu đáp án chỉ là một ký tự, kiểm tra xem userAnswer có bắt đầu bằng ký tự đó không
                        // Ví dụ: userAnswer = "b. amphion's supported audio generation tasks"
                        //        correctAnswer = "b"
                        if (
                            userAnswer.startsWith(correctAnswer + ".") ||
                            userAnswer.startsWith(correctAnswer + " ")
                        ) {
                            correctCount++;
                        }
                        // Hoặc nếu userAnswer chính là ký tự đó
                        else if (userAnswer === correctAnswer) {
                            correctCount++;
                        }
                    }
                    // Kiểm tra nếu userAnswer bắt đầu bằng một ký tự và dấu chấm (như "B. text")
                    else if (
                        userAnswer.match(/^[a-z]\./i) &&
                        correctAnswer.length > 2
                    ) {
                        // Trích xuất ký tự đầu tiên từ userAnswer
                        const firstChar = userAnswer.charAt(0).toLowerCase();
                        // Kiểm tra xem correctAnswer có phải là ký tự đó không
                        if (firstChar === correctAnswer) {
                            correctCount++;
                        }
                    }
                    // So sánh bình thường nếu không phải các trường hợp trên
                    else if (userAnswer === correctAnswer) {
                        correctCount++;
                    }
                }
            }
            // Special handling for Multiple Choice questions
            else if (question.type === "multiple_choice") {
                const userAnswerId = userAnswers[question.id] || "";

                // Tìm option được chọn bởi user
                if (question.options && Array.isArray(question.options)) {
                    const options = question.options.map((opt, i) => {
                        if (typeof opt === "string") {
                            return {
                                id: String.fromCharCode(65 + i),
                                text: opt,
                            };
                        }
                        return opt as QuestionOption;
                    });

                    // Tìm option có id khớp với userAnswer
                    const selectedOption = options.find(
                        (opt) => opt.id === userAnswerId
                    );

                    // So sánh text của option được chọn với correct answer
                    if (
                        selectedOption &&
                        selectedOption.text === question.answer
                    ) {
                        correctCount++;
                    }
                }
            } else {
                // Handle other question types
                if (userAnswers[question.id] === question.answer) {
                    correctCount++;
                }
            }
        });

        const scorePercentage = Math.round(
            (correctCount / exam.questions.length) * 100
        );
        setScore(scorePercentage);
        setIsSubmitted(true);
        setShowAnswers(true);
        pauseTimer();
    };

    const handleReset = () => {
        setUserAnswers({});
        setIsSubmitted(false);
        setScore(null);
        setShowAnswers(false);
        resetTimer();
    };

    const handleStartExam = () => {
        setShowInstructions(false);
        startTimer();
    };

    const handleDownloadPDF = async () => {
        if (!exam) return;

        try {
            // Khởi tạo PDF với font Unicode để hỗ trợ tiếng Việt
            const pdf = new jsPDF();

            // Thiết lập các thông số
            const pageWidth = pdf.internal.pageSize.getWidth();
            const margin = 15;
            const contentWidth = pageWidth - 2 * margin;
            let y = margin;

            // Hàm thêm văn bản với tự động xuống dòng
            const addWrappedText = (
                text: string,
                x: number,
                y: number,
                maxWidth: number,
                lineHeight: number,
                options: any = {}
            ) => {
                if (!text) return y;

                // Xử lý các thẻ HTML cơ bản
                text = text
                    .replace(/<br\s*\/?>/gi, "\n")
                    .replace(/<p>(.*?)<\/p>/gi, "$1\n")
                    .replace(/<h[1-6]>(.*?)<\/h[1-6]>/gi, "$1\n")
                    .replace(/<li>(.*?)<\/li>/gi, "• $1\n")
                    .replace(/<[^>]*>/g, "");

                const textLines = pdf.splitTextToSize(text, maxWidth);

                textLines.forEach((line: string) => {
                    if (y > pdf.internal.pageSize.getHeight() - margin) {
                        pdf.addPage();
                        y = margin;
                    }

                    pdf.text(line, x, y, options);
                    y += lineHeight;
                });

                return y;
            };

            // Thêm tiêu đề
            pdf.setFontSize(16);
            pdf.setFont("helvetica", "bold");
            y = addWrappedText(exam.title, margin, y + 10, contentWidth, 8, {
                align: "center",
            });

            // Thêm thông tin tổng quan
            pdf.setFontSize(10);
            pdf.setFont("helvetica", "normal");
            y = addWrappedText(
                `Words: ${exam.totalWordCount} | Questions: ${
                    exam.questions.length
                } | Band Score: ${exam.overallScore || 6}`,
                margin,
                y + 5,
                contentWidth,
                5,
                { align: "center" }
            );

            // Thêm đường kẻ phân cách
            y += 5;
            pdf.setDrawColor(200, 200, 200);
            pdf.line(margin, y, pageWidth - margin, y);
            y += 10;

            // Thêm nội dung đoạn văn
            for (const passage of exam.passages) {
                // Tiêu đề đoạn văn
                pdf.setFontSize(14);
                pdf.setFont("helvetica", "bold");
                y = addWrappedText(passage.title, margin, y, contentWidth, 7);
                y += 3;

                // Nội dung đoạn văn
                pdf.setFontSize(10);
                pdf.setFont("helvetica", "normal");
                y = addWrappedText(passage.content, margin, y, contentWidth, 5);
                y += 10;
            }

            // Thêm đường kẻ phân cách
            pdf.setDrawColor(200, 200, 200);
            pdf.line(margin, y, pageWidth - margin, y);
            y += 10;

            // Tiêu đề phần câu hỏi
            pdf.setFontSize(14);
            pdf.setFont("helvetica", "bold");
            y = addWrappedText("Questions", margin, y, contentWidth, 7, {
                align: "center",
            });
            y += 5;

            // Thêm câu hỏi
            for (let i = 0; i < exam.questions.length; i++) {
                const question = exam.questions[i];

                // Kiểm tra nếu cần thêm trang mới
                if (y > pdf.internal.pageSize.getHeight() - 60) {
                    pdf.addPage();
                    y = margin;
                }

                // Số thứ tự và nội dung câu hỏi
                pdf.setFontSize(11);
                pdf.setFont("helvetica", "bold");
                y = addWrappedText(
                    `${i + 1}. ${question.text}`,
                    margin,
                    y,
                    contentWidth,
                    5
                );
                y += 3;

                // Xử lý các loại câu hỏi khác nhau
                pdf.setFontSize(10);
                pdf.setFont("helvetica", "normal");

                if (question.type === "multiple_choice" && question.options) {
                    const options = Array.isArray(question.options)
                        ? question.options
                        : [];

                    for (let j = 0; j < options.length; j++) {
                        const option = options[j];
                        const optionText =
                            typeof option === "string" ? option : option.text;
                        const optionId =
                            typeof option === "string"
                                ? String.fromCharCode(65 + j)
                                : option.id;

                        y = addWrappedText(
                            `${optionId}. ${optionText}`,
                            margin + 5,
                            y,
                            contentWidth - 5,
                            5
                        );
                        y += 2;
                    }
                } else if (
                    question.type === "matching_headings" &&
                    question.options
                ) {
                    const options = Array.isArray(question.options)
                        ? question.options
                        : [];
                    y = addWrappedText(
                        "Choose the most appropriate heading:",
                        margin + 5,
                        y,
                        contentWidth - 5,
                        5
                    );
                    y += 2;

                    for (let j = 0; j < options.length; j++) {
                        const option = options[j];
                        const optionText =
                            typeof option === "string" ? option : option.text;
                        const optionId =
                            typeof option === "string"
                                ? String.fromCharCode(65 + j)
                                : option.id;

                        y = addWrappedText(
                            `${optionId}. ${optionText}`,
                            margin + 5,
                            y,
                            contentWidth - 5,
                            5
                        );
                        y += 2;
                    }
                } else if (question.type === "true_false_not_given") {
                    y = addWrappedText(
                        "True / False / Not Given",
                        margin + 5,
                        y,
                        contentWidth - 5,
                        5
                    );
                }

                y += 8; // Khoảng cách giữa các câu hỏi
            }

            // Lưu file PDF
            pdf.save(`${exam.title.replace(/\s+/g, "_")}.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Có lỗi xảy ra khi tạo PDF. Vui lòng thử lại sau.");
        }
    };

    const toggleViewMode = (mode: "all" | "passage" | "questions") => {
        setViewMode(mode);
    };

    const getCategoryTitle = (category: number): string => {
        if (!exam) return "";

        // For TOEIC, category represents the part number
        if (exam.examType === "TOEIC") {
            switch (category) {
                case 5:
                    return "Part 5: Incomplete Sentences";
                case 6:
                    return "Part 6: Text Completion";
                case 7:
                    return "Part 7: Reading Comprehension";
                default:
                    return `Part ${category}`;
            }
        }

        // For IELTS, use the original logic
        const firstQuestionInCategory = exam.questions.find(
            (q) => q.questionCategory === category
        );
        if (!firstQuestionInCategory) return `Category ${category}`;

        const questionType = firstQuestionInCategory.type;

        switch (questionType) {
            case "true_false_not_given":
                return "True/False/Not Given Questions";
            case "yes_no_not_given":
                return "Yes/No/Not Given Questions";
            case "matching_headings":
                return "Matching Headings Questions";
            case "matching_information":
                return "Matching Information Questions";
            case "matching_features":
                return "Matching Features Questions";
            case "matching_sentence_endings":
                return "Matching Sentence Endings Questions";
            case "sentence_completion":
                return "Sentence Completion Questions";
            case "summary_completion":
                return "Summary Completion Questions";
            case "note_completion":
                return "Note Completion Questions";
            case "table_completion":
                return "Table Completion Questions";
            case "flow_chart_completion":
                return "Flow Chart Completion Questions";
            case "diagram_label_completion":
                return "Diagram Label Completion Questions";
            case "multiple_choice":
                return "Multiple Choice Questions";
            case "list_selection":
                return "List Selection Questions";
            case "short_answer":
                return "Short Answer Questions";
            default:
                return `Category ${category} Questions`;
        }
    };

    const getCompletionPercentage = (): number => {
        if (!exam) return 0;
        const answeredCount = Object.keys(userAnswers).length;
        return Math.round((answeredCount / exam.questions.length) * 100);
    };

    const getQuestionTypeInstructions = (type: string): string => {
        // For TOEIC, provide specific instructions based on exam type
        if (exam?.examType === "TOEIC") {
            const partNumber = exam.questions[0]?.questionCategory;
            switch (partNumber) {
                case 5:
                    return "Choose the word or phrase that best completes each sentence.";
                case 6:
                    return "Read the text and choose the word or phrase that best completes each blank.";
                case 7:
                    return "Read the passage and choose the best answer to each question.";
                default:
                    return "Choose the best answer from the options given.";
            }
        }

        // For IELTS, use the original logic
        switch (type) {
            case "true_false_not_given":
                return "Choose True if the statement agrees with the information, False if it contradicts, or Not Given if there is no information.";
            case "yes_no_not_given":
                return "Choose Yes if the statement agrees with the information, No if it contradicts, or Not Given if there is no information.";
            case "matching_headings":
                return "Match each heading with the appropriate paragraph or section.";
            case "matching_information":
                return "Match the information in the passage with the correct answer.";
            case "matching_features":
                return "Match the features in the passage with the correct answer.";
            case "matching_sentence_endings":
                return "Match the sentence endings in the passage with the correct answer.";
            case "sentence_completion":
                return "Complete the sentence in the passage with the correct answer.";
            case "summary_completion":
                return "Complete the summary in the passage with the correct answer.";
            case "note_completion":
                return "Complete the note in the passage with the correct answer.";
            case "table_completion":
                return "Complete the table in the passage with the correct answer.";
            case "flow_chart_completion":
                return "Complete the flow chart in the passage with the correct answer.";
            case "diagram_label_completion":
                return "Complete the diagram label in the passage with the correct answer.";
            case "multiple_choice":
                return "Choose the best answer from the options given.";
            case "list_selection":
                return "Select the correct answer from the list given.";
            case "short_answer":
                return "Answer the questions in no more than the specified number of words.";
            default:
                return "";
        }
    };

    // JSX for rendering different sections of the exam
    const renderTimer = () => (
        <div className="fixed bottom-4 right-4 bg-white rounded-xl shadow-soft p-4 z-10 transition-transform hover:scale-105">
            <div className="text-center">
                <div
                    className={`text-2xl font-bold ${
                        remainingTime && remainingTime < 300
                            ? "text-red-600 pulse"
                            : "text-secondary-900"
                    }`}
                >
                    {remainingTime !== null
                        ? formatTime(remainingTime)
                        : "--:--"}
                </div>
                <div className="mt-2 flex justify-center gap-2">
                    {!isTimerRunning ? (
                        <button
                            onClick={startTimer}
                            className="p-2 rounded-full bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 hover:from-primary-100 hover:to-primary-200 transition-all"
                            disabled={isSubmitted}
                        >
                            <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </button>
                    ) : (
                        <button
                            onClick={pauseTimer}
                            className="p-2 rounded-full bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 hover:from-primary-100 hover:to-primary-200 transition-all"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                            </svg>
                        </button>
                    )}
                    <button
                        onClick={resetTimer}
                        className="p-2 rounded-full bg-gradient-to-r from-secondary-50 to-secondary-100 text-secondary-700 hover:from-secondary-100 hover:to-secondary-200 transition-all"
                        disabled={isSubmitted}
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50 flex items-center justify-center">
                <div className="flex flex-col items-center p-8 bg-white rounded-xl shadow-soft max-w-md mx-auto scale-in">
                    <div className="relative w-24 h-24 mb-6">
                        <div className="absolute inset-0 rounded-full border-4 border-primary-200"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-primary-600 animate-spin border-t-transparent"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <img
                                src="/logo_sci.png"
                                alt="SCI Logo"
                                className="w-14 h-14 object-contain"
                            />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-2">
                        Preparing Your Exam
                    </h2>
                    <p className="text-secondary-600 text-center mb-6">
                        We're setting up your{" "}
                        {exam?.examType === "TOEIC" ? "TOEIC" : "IELTS"} Reading
                        Test. This will only take a moment...
                    </p>
                    <div className="w-full h-2 bg-secondary-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary-500 to-primary-600 animate-pulse"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-xl shadow-soft max-w-md w-full scale-in">
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                            <svg
                                className="w-10 h-10 text-red-600"
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
                        <h2 className="text-2xl font-bold text-secondary-900 mb-2">
                            Exam Loading Failed
                        </h2>
                        <p className="text-secondary-600 mb-6">{error}</p>
                        <div className="flex flex-col md:flex-row gap-3 justify-center">
                            <Link href="/create" className="btn btn-primary">
                                Create New Exam
                            </Link>
                            <button
                                onClick={() => window.location.reload()}
                                className="btn btn-secondary"
                            >
                                Retry Loading
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!exam) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-xl shadow-soft max-w-md w-full scale-in">
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary-100 flex items-center justify-center">
                            <img
                                src="/logo_sci.png"
                                alt="SCI Logo"
                                className="w-12 h-12 object-contain"
                            />
                        </div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-2">
                            Exam Not Found
                        </h2>
                        <p className="text-secondary-600 mb-6">
                            We couldn't find the exam you're looking for. It may
                            have been removed or the link is incorrect.
                        </p>
                        <div className="flex justify-center">
                            <Link href="/create" className="btn btn-primary">
                                Create a New Exam
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const currentPassage = exam.passages.find((p) => p.id === selectedPassage);
    const currentPassageAnalysis = exam.passageAnalysis.find(
        (p) => p.passageNumber === currentPassage?.passageNumber
    );

    // Instructions page when starting the exam
    if (showInstructions) {
        return (
            <div className="min-h-screen bg-secondary-50 flex items-center justify-center py-10">
                <div className="bg-white rounded-xl shadow-lg max-w-3xl w-full p-8">
                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-bold text-secondary-900 mb-2">
                            {exam.examType === "TOEIC"
                                ? "TOEIC Reading Test"
                                : "IELTS Reading Test"}
                        </h1>
                        <p className="text-secondary-600">{exam.title}</p>
                    </div>

                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-secondary-900">
                                Exam Overview
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-secondary-50 rounded-lg p-4">
                                <h3 className="font-medium text-secondary-900 mb-1">
                                    Passages
                                </h3>
                                <p className="text-secondary-600">
                                    {exam.passages.length} passage(s)
                                </p>
                            </div>
                            <div className="bg-secondary-50 rounded-lg p-4">
                                <h3 className="font-medium text-secondary-900 mb-1">
                                    Questions
                                </h3>
                                <p className="text-secondary-600">
                                    {exam.questions.length} questions
                                </p>
                            </div>
                            <div className="bg-secondary-50 rounded-lg p-4">
                                <h3 className="font-medium text-secondary-900 mb-1">
                                    Suggested Time
                                </h3>
                                <p className="text-secondary-600">
                                    {exam.examType === "TOEIC"
                                        ? (() => {
                                              const partNumber =
                                                  exam.questions[0]
                                                      ?.questionCategory || 5;
                                              switch (partNumber) {
                                                  case 5:
                                                      return "30";
                                                  case 6:
                                                      return "16";
                                                  case 7:
                                                      return "54";
                                                  default:
                                                      return "30";
                                              }
                                          })()
                                        : exam.passageAnalysis.reduce(
                                              (total, analysis) =>
                                                  total +
                                                  (analysis.suggestedTime ||
                                                      20),
                                              0
                                          )}{" "}
                                    minutes
                                </p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4">
                                <h3 className="font-medium text-green-900 mb-1">
                                    {exam.examType === "TOEIC"
                                        ? "Target Score"
                                        : "Band Score"}
                                </h3>
                                <p className="text-green-600 font-semibold">
                                    {exam.examType === "TOEIC"
                                        ? `${exam.overallScore || "600-700"}`
                                        : `${exam.overallScore || 6}`}
                                </p>
                            </div>
                        </div>

                        <div className="bg-secondary-50 rounded-lg p-4 mb-6">
                            <h3 className="font-medium text-secondary-900 mb-2">
                                Question Types in This Exam:
                            </h3>
                            <ul className="space-y-2">
                                {Object.keys(questionsByCategory).map(
                                    (category) => {
                                        const categoryNum = parseInt(category);
                                        const questions =
                                            questionsByCategory[categoryNum];
                                        if (!questions.length) return null;

                                        return (
                                            <li
                                                key={category}
                                                className="flex items-start"
                                            >
                                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-800 text-xs font-bold mr-2">
                                                    {category}
                                                </span>
                                                <div>
                                                    <p className="font-medium text-secondary-800">
                                                        {getCategoryTitle(
                                                            categoryNum
                                                        )}
                                                    </p>
                                                    <p className="text-sm text-secondary-600">
                                                        {getQuestionTypeInstructions(
                                                            questions[0].type
                                                        )}
                                                    </p>
                                                </div>
                                            </li>
                                        );
                                    }
                                )}
                            </ul>
                        </div>

                        <div className="border-l-4 border-primary-500 bg-primary-50 p-4 rounded-r-lg">
                            <h3 className="font-semibold text-primary-900 mb-1">
                                Instructions
                            </h3>
                            <ul className="list-disc list-inside space-y-1 text-primary-800">
                                {exam.examType === "TOEIC" ? (
                                    <>
                                        <li>
                                            {exam.questions[0]
                                                ?.questionCategory === 5
                                                ? "Choose the word or phrase that best completes each sentence."
                                                : exam.questions[0]
                                                      ?.questionCategory === 6
                                                ? "Read each text and choose the word or phrase that best completes each blank."
                                                : "Read each passage carefully before answering the questions."}
                                        </li>
                                        <li>
                                            You have{" "}
                                            {(() => {
                                                const partNumber =
                                                    exam.questions[0]
                                                        ?.questionCategory || 5;
                                                switch (partNumber) {
                                                    case 5:
                                                        return "30";
                                                    case 6:
                                                        return "16";
                                                    case 7:
                                                        return "54";
                                                    default:
                                                        return "30";
                                                }
                                            })()}{" "}
                                            minutes to complete the test.
                                        </li>
                                        <li>
                                            You can pause the timer at any time
                                            if you need a break.
                                        </li>
                                        <li>
                                            Click "Submit Answers" when you're
                                            ready to see your results.
                                        </li>
                                    </>
                                ) : (
                                    <>
                                        <li>
                                            Read each passage carefully before
                                            answering the questions.
                                        </li>
                                        <li>
                                            You have{" "}
                                            {exam.passageAnalysis.reduce(
                                                (total, analysis) =>
                                                    total +
                                                    (analysis.suggestedTime ||
                                                        20),
                                                0
                                            )}{" "}
                                            minutes to complete the test.
                                        </li>
                                        <li>
                                            You can pause the timer at any time
                                            if you need a break.
                                        </li>
                                        <li>
                                            Click "Submit Answers" when you're
                                            ready to see your results.
                                        </li>
                                    </>
                                )}
                            </ul>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <button
                            onClick={handleStartExam}
                            className="btn btn-primary btn-lg px-8"
                        >
                            Start Exam
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-secondary-50 pb-12">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap justify-between items-center">
                    <Link href="/" className="flex items-center gap-2">
                        <img
                            src="/logo_sci.png"
                            alt="SCI Logo"
                            className="w-8 h-8 object-contain"
                        />
                        <span className="text-lg font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                            SciHorizone
                        </span>
                    </Link>

                    <div className="flex items-center space-x-3 mt-2 sm:mt-0">
                        <div className="badge badge-primary">
                            {exam.examType} Reading
                        </div>
                        <div className="badge badge-secondary">
                            {getCompletionPercentage()}% Completed
                        </div>

                        <div className="hidden md:flex space-x-1">
                            {/* Hide "All View" and "Passage Only" for TOEIC Part 5 */}
                            {!(
                                exam.examType === "TOEIC" &&
                                exam.questions[0]?.questionCategory === 5
                            ) && (
                                <>
                                    <button
                                        onClick={() => toggleViewMode("all")}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                                            viewMode === "all"
                                                ? "bg-secondary-700 text-white shadow-md"
                                                : "bg-white hover:bg-secondary-50"
                                        }`}
                                    >
                                        All View
                                    </button>
                                    <button
                                        onClick={() =>
                                            toggleViewMode("passage")
                                        }
                                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                                            viewMode === "passage"
                                                ? "bg-secondary-700 text-white shadow-md"
                                                : "bg-white hover:bg-secondary-50"
                                        }`}
                                    >
                                        Passage Only
                                    </button>
                                </>
                            )}
                            <button
                                onClick={() => toggleViewMode("questions")}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                                    viewMode === "questions"
                                        ? "bg-secondary-700 text-white shadow-md"
                                        : "bg-white hover:bg-secondary-50"
                                }`}
                            >
                                Questions Only
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                {/* Exam Title and Control Bar */}
                <div className="card card-hover p-5 mb-6 fade-in">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold text-secondary-900 mb-1">
                                {exam.title}
                            </h1>
                            <div className="flex flex-wrap gap-2">
                                {exam.examType === "TOEIC" ? (
                                    <>
                                        <span className="badge badge-secondary">
                                            Part{" "}
                                            {exam.questions[0]
                                                ?.questionCategory || 5}
                                        </span>
                                        <span className="badge badge-secondary">
                                            {exam.questions.length} questions
                                        </span>
                                        <span className="badge badge-accent">
                                            Estimated Score: {exam.overallScore}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <span className="badge badge-secondary">
                                            {exam.totalWordCount} words
                                        </span>
                                        <span className="badge badge-secondary">
                                            {exam.questions.length} questions
                                        </span>
                                        <span className="badge badge-accent">
                                            Band Score: {exam.overallScore}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setShowAnalysis(!showAnalysis)}
                                className="btn btn-outline-primary btn-sm"
                            >
                                {showAnalysis
                                    ? "Hide Analysis"
                                    : "Show Analysis"}
                            </button>
                            <button
                                onClick={() => setShowAnswers(!showAnswers)}
                                className="btn btn-outline-primary btn-sm"
                            >
                                {showAnswers ? "Hide Answers" : "Show Answers"}
                            </button>
                            <button
                                onClick={handleDownloadPDF}
                                className="btn btn-outline-secondary btn-sm flex items-center gap-1"
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                    />
                                </svg>
                                PDF
                            </button>
                        </div>
                    </div>

                    {showAnalysis && (
                        <div className="mt-5 pt-5 border-t border-secondary-100 slide-up">
                            <h3 className="text-lg font-semibold text-secondary-900 mb-3">
                                Exam Analysis
                            </h3>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                                {exam.strengths.length > 0 && (
                                    <div className="p-4 rounded-lg bg-green-50 border border-green-100 hover:shadow-md transition-all">
                                        <h4 className="font-medium text-green-700 flex items-center gap-2 mb-2">
                                            <svg
                                                className="w-5 h-5"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                            Strengths
                                        </h4>
                                        <ul className="space-y-1 text-sm text-green-600">
                                            {exam.strengths.map(
                                                (strength, idx) => (
                                                    <li
                                                        key={idx}
                                                        className="flex items-start"
                                                    >
                                                        <span className="inline-block w-1 h-1 rounded-full bg-green-500 mt-1.5 mr-2"></span>
                                                        {strength}
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    </div>
                                )}

                                {exam.weaknesses.length > 0 && (
                                    <div className="p-4 rounded-lg bg-orange-50 border border-orange-100 hover:shadow-md transition-all">
                                        <h4 className="font-medium text-orange-700 flex items-center gap-2 mb-2">
                                            <svg
                                                className="w-5 h-5"
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
                                            Weaknesses
                                        </h4>
                                        <ul className="space-y-1 text-sm text-orange-600">
                                            {exam.weaknesses.map(
                                                (weakness, idx) => (
                                                    <li
                                                        key={idx}
                                                        className="flex items-start"
                                                    >
                                                        <span className="inline-block w-1 h-1 rounded-full bg-orange-500 mt-1.5 mr-2"></span>
                                                        {weakness}
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    </div>
                                )}

                                {exam.improvementSuggestions.length > 0 && (
                                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-100 hover:shadow-md transition-all">
                                        <h4 className="font-medium text-blue-700 flex items-center gap-2 mb-2">
                                            <svg
                                                className="w-5 h-5"
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
                                            Suggestions
                                        </h4>
                                        <ul className="space-y-1 text-sm text-blue-600">
                                            {exam.improvementSuggestions.map(
                                                (suggestion, idx) => (
                                                    <li
                                                        key={idx}
                                                        className="flex items-start"
                                                    >
                                                        <span className="inline-block w-1 h-1 rounded-full bg-blue-500 mt-1.5 mr-2"></span>
                                                        {suggestion}
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {isSubmitted && score !== null && (
                        <div className="mt-5 pt-5 border-t border-secondary-100 scale-in">
                            <div className="p-4 rounded-lg bg-accent-50 border border-accent-200 hover:shadow-md transition-all">
                                <h3 className="text-lg font-semibold text-accent-800 mb-1">
                                    Your Score: {score}%
                                </h3>
                                <p className="text-accent-700">
                                    You got{" "}
                                    {Math.round(
                                        (score * exam.questions.length) / 100
                                    )}{" "}
                                    out of {exam.questions.length} questions
                                    correct.
                                </p>

                                <div className="mt-3 w-full h-3 bg-secondary-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-accent-600 transition-all duration-1000 ease-out"
                                        style={{ width: `${score}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="lg:flex lg:gap-6">
                    {/* Sidebar - Always show for submit button */}
                    <aside
                        className={`lg:w-64 mb-6 lg:mb-0 ${
                            viewMode === "questions" ? "hidden lg:block" : ""
                        }`}
                    >
                        <div className="bg-white rounded-xl shadow-sm p-4 sticky top-24">
                            {/* Passages Navigation - Hide for TOEIC Part 5 */}
                            {!(
                                exam.examType === "TOEIC" &&
                                exam.questions[0]?.questionCategory === 5
                            ) && (
                                <>
                                    <h2 className="text-lg font-semibold mb-4 text-secondary-900 border-b pb-2">
                                        Passages
                                    </h2>
                                    <nav className="space-y-2 mb-4">
                                        {exam.passages.map((passage) => (
                                            <button
                                                key={passage.id}
                                                onClick={() =>
                                                    setSelectedPassage(
                                                        passage.id
                                                    )
                                                }
                                                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all ${
                                                    selectedPassage ===
                                                    passage.id
                                                        ? "bg-gradient-to-r from-primary-50 to-primary-100 text-primary-800 font-medium border-l-4 border-primary-500 pl-2"
                                                        : "text-secondary-600 hover:bg-secondary-50"
                                                }`}
                                            >
                                                {passage.title ||
                                                    `Passage ${passage.id}`}
                                                <div className="text-xs text-secondary-500 mt-1">
                                                    {passage.wordCount} words ·{" "}
                                                    {passage.passageType}
                                                </div>
                                            </button>
                                        ))}
                                    </nav>
                                </>
                            )}

                            {/* Notes and Submit section - Always show */}
                            <div
                                className={`${
                                    !(
                                        exam.examType === "TOEIC" &&
                                        exam.questions[0]?.questionCategory ===
                                            5
                                    )
                                        ? "border-t border-secondary-100 pt-4"
                                        : ""
                                }`}
                            >
                                <div className="mb-3">
                                    <label
                                        htmlFor="user-notes"
                                        className="block text-sm font-medium text-secondary-700 mb-1"
                                    >
                                        Notes
                                    </label>
                                    <textarea
                                        id="user-notes"
                                        className="input"
                                        rows={4}
                                        placeholder="Take notes while reading..."
                                        value={userNotes}
                                        onChange={(e) =>
                                            setUserNotes(e.target.value)
                                        }
                                    ></textarea>
                                </div>

                                {!isSubmitted ? (
                                    <button
                                        onClick={handleSubmit}
                                        className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 flex items-center justify-center gap-2"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        Submit Answers
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleReset}
                                        className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-secondary-600 to-secondary-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 hover:from-secondary-700 hover:to-secondary-800 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2 flex items-center justify-center gap-2"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        Reset Answers
                                    </button>
                                )}
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Passage - Hide for TOEIC Part 5 */}
                        {viewMode !== "questions" &&
                            currentPassage &&
                            !(
                                exam.examType === "TOEIC" &&
                                exam.questions[0]?.questionCategory === 5
                            ) && (
                                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-5">
                                        <h2 className="text-xl font-semibold text-secondary-900">
                                            {currentPassage.title ||
                                                `Passage ${currentPassage.id}`}
                                        </h2>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-secondary-100 text-secondary-800">
                                                Type:{" "}
                                                {currentPassage.passageType}
                                            </span>
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-secondary-100 text-secondary-800">
                                                Words:{" "}
                                                {currentPassage.wordCount}
                                            </span>
                                        </div>
                                    </div>

                                    {currentPassageAnalysis && (
                                        <div className="mb-5 p-4 bg-secondary-50 rounded-lg border border-secondary-100">
                                            <div className="flex flex-wrap gap-3 text-sm">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-secondary-100 text-secondary-800">
                                                    Difficulty:{" "}
                                                    {
                                                        currentPassageAnalysis.difficultyLevel
                                                    }
                                                </span>
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-secondary-100 text-secondary-800">
                                                    Vocabulary:{" "}
                                                    {
                                                        currentPassageAnalysis.vocabularyLevel
                                                    }
                                                </span>
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-secondary-100 text-secondary-800">
                                                    Time:{" "}
                                                    {
                                                        currentPassageAnalysis.suggestedTime
                                                    }{" "}
                                                    min
                                                </span>
                                            </div>

                                            {currentPassageAnalysis.mainTopic && (
                                                <p className="mt-3 text-sm text-secondary-700">
                                                    <span className="font-medium">
                                                        Topic:
                                                    </span>{" "}
                                                    {
                                                        currentPassageAnalysis.mainTopic
                                                    }
                                                </p>
                                            )}

                                            {currentPassageAnalysis.questionTypes &&
                                                currentPassageAnalysis
                                                    .questionTypes.length >
                                                    0 && (
                                                    <div className="mt-2">
                                                        <p className="text-sm font-medium text-secondary-700">
                                                            Questions:
                                                        </p>
                                                        <div className="flex flex-wrap gap-2 mt-1">
                                                            {currentPassageAnalysis.questionTypes.map(
                                                                (type, idx) => (
                                                                    <span
                                                                        key={
                                                                            idx
                                                                        }
                                                                        className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-primary-50 text-primary-700"
                                                                    >
                                                                        {type}
                                                                    </span>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                        </div>
                                    )}

                                    <div
                                        className="prose prose-lg max-w-none passage-content"
                                        ref={passageContentRef}
                                    >
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            rehypePlugins={[rehypeRaw]}
                                            components={{
                                                p: ({ node, ...props }) => (
                                                    <p
                                                        className="mb-6 text-secondary-800 leading-relaxed text-justify"
                                                        {...props}
                                                    />
                                                ),
                                                h1: ({ node, ...props }) => (
                                                    <h1
                                                        className="text-2xl font-bold mb-4 text-secondary-900"
                                                        {...props}
                                                    />
                                                ),
                                                h2: ({ node, ...props }) => (
                                                    <h2
                                                        className="text-xl font-bold mb-3 text-secondary-900"
                                                        {...props}
                                                    />
                                                ),
                                                h3: ({ node, ...props }) => (
                                                    <h3
                                                        className="text-lg font-bold mb-2 text-secondary-900"
                                                        {...props}
                                                    />
                                                ),
                                                ul: ({ node, ...props }) => (
                                                    <ul
                                                        className="list-disc pl-6 mb-4"
                                                        {...props}
                                                    />
                                                ),
                                                ol: ({ node, ...props }) => (
                                                    <ol
                                                        className="list-decimal pl-6 mb-4"
                                                        {...props}
                                                    />
                                                ),
                                                li: ({ node, ...props }) => (
                                                    <li
                                                        className="mb-2"
                                                        {...props}
                                                    />
                                                ),
                                                blockquote: ({
                                                    node,
                                                    ...props
                                                }) => (
                                                    <blockquote
                                                        className="border-l-4 border-primary-300 pl-4 italic my-4"
                                                        {...props}
                                                    />
                                                ),
                                                a: ({ node, ...props }) => (
                                                    <a
                                                        className="text-primary-600 hover:text-primary-800 underline"
                                                        {...props}
                                                    />
                                                ),
                                                strong: ({
                                                    node,
                                                    ...props
                                                }) => (
                                                    <strong
                                                        className="font-bold text-secondary-900"
                                                        {...props}
                                                    />
                                                ),
                                                em: ({ node, ...props }) => (
                                                    <em
                                                        className="italic"
                                                        {...props}
                                                    />
                                                ),
                                                code: ({
                                                    node,
                                                    className,
                                                    children,
                                                    ...props
                                                }) => {
                                                    return !className ? (
                                                        <code
                                                            className="bg-secondary-100 px-1 py-0.5 rounded text-secondary-800"
                                                            {...props}
                                                        >
                                                            {children}
                                                        </code>
                                                    ) : (
                                                        <code
                                                            className="block bg-secondary-100 p-4 rounded-lg overflow-x-auto my-4"
                                                            {...props}
                                                        >
                                                            {children}
                                                        </code>
                                                    );
                                                },
                                                img: ({ node, ...props }) => (
                                                    <img
                                                        className="rounded-lg shadow-md my-4 max-w-full h-auto"
                                                        {...props}
                                                    />
                                                ),
                                            }}
                                        >
                                            {currentPassage.content}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            )}

                        {/* Questions */}
                        {viewMode !== "passage" && (
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-xl font-semibold mb-6 text-secondary-900 border-b pb-3">
                                    Questions
                                </h2>

                                {Object.keys(questionsByCategory).map(
                                    (category) => {
                                        const categoryNum = parseInt(category);
                                        // Lấy tất cả câu hỏi trong category, không lọc theo passage
                                        const questionsInCategory =
                                            questionsByCategory[categoryNum];

                                        if (
                                            !questionsInCategory ||
                                            !questionsInCategory.length
                                        )
                                            return null;

                                        return (
                                            <div
                                                key={category}
                                                className="mb-8 last:mb-0"
                                            >
                                                <h3 className="text-lg font-medium text-secondary-900 mb-4 flex items-center">
                                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-800 text-xs font-bold mr-2">
                                                        {category}
                                                    </span>
                                                    {getCategoryTitle(
                                                        categoryNum
                                                    )}
                                                </h3>

                                                <p className="text-sm text-secondary-600 mb-4 bg-secondary-50 p-3 rounded-lg border border-secondary-100">
                                                    {getQuestionTypeInstructions(
                                                        questionsInCategory[0]
                                                            .type
                                                    )}
                                                </p>

                                                <div className="space-y-6">
                                                    {questionsInCategory.map(
                                                        (question) => (
                                                            <div
                                                                key={
                                                                    question.id
                                                                }
                                                                className="border border-secondary-200 rounded-lg p-5"
                                                            >
                                                                <div className="flex justify-between mb-4">
                                                                    <h4 className="text-base font-medium text-secondary-900 pr-4">
                                                                        Question{" "}
                                                                        {
                                                                            question.questionNumber
                                                                        }
                                                                        :{" "}
                                                                        {
                                                                            question.text
                                                                        }
                                                                    </h4>
                                                                </div>

                                                                {renderQuestion(
                                                                    question,
                                                                    userAnswers,
                                                                    handleAnswerChange,
                                                                    isSubmitted,
                                                                    showAnswers
                                                                )}
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {renderTimer()}
        </main>
    );
}
