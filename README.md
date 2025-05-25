<p align="center">
  <a href="" rel="noopener">
 <img width=200px height=200px src="logo.png" alt="IELTS Exam Generator"></a>
</p>

<h3 align="center">IELTS Exam Generator</h3>

<div align="center">

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](/LICENSE)

</div>

---

<p align="center">
  An AI-powered application that converts scientific papers into IELTS/TOEIC reading comprehension exams.
  <br>
</p>

## 📝 Table of Contents

- [About](#about)
- [Features](#features)
- [System Architecture](#architecture)
- [Getting Started](#getting_started)
- [Usage](#usage)
- [Built Using](#built_using)
- [Authors](#authors)

## 🧐 About <a name = "about"></a>

The IELTS Exam Generator is an innovative application that leverages AI to transform scientific papers and academic articles into standardized IELTS or TOEIC reading comprehension exams. This tool helps educators, language instructors, and students create high-quality practice materials that closely mimic official exams, providing a valuable resource for test preparation.

By automating the exam creation process, our application saves hours of manual work while ensuring consistent quality and adherence to exam standards. The system extracts content from PDF files, analyzes the text, and generates appropriate questions with detailed explanations for each answer.

## ✨ Features <a name = "features"></a>

- **PDF Processing**: Upload and extract content from scientific papers and academic articles
- **AI-Powered Exam Generation**: Create reading comprehension exams with various question types
- **Customizable Parameters**: Select exam type (IELTS/TOEIC), difficulty level, and passage type
- **Interactive Exam Interface**: Take exams with a user-friendly interface that simulates the real testing experience
- **Detailed Answer Explanations**: Learn from comprehensive explanations for each correct answer
- **Performance Analysis**: Review strengths and weaknesses after completing an exam

## 🛠️ System Architecture <a name = "architecture"></a>

The application consists of two main components:

1. **Backend Server**: A FastAPI-based Python server that handles PDF extraction, AI processing with Google Gemini, and exam generation. Được triển khai tại domain `apisci.hoangvu.id.vn`.
2. **Frontend Application**: A Next.js web application that provides the user interface for uploading PDFs, configuring exams, and taking the generated tests. Được triển khai trong Docker container và có thể truy cập tại domain `scihorizone.hoangvu.id.vn`.

### Communication Flow

- Frontend gọi API đến `/api/*` sẽ được Next.js proxy đến `apisci.hoangvu.id.vn`
- Backend xử lý yêu cầu và trả về kết quả cho frontend
- Cấu hình CORS đã được thiết lập để cho phép các domain `scihorizone.hoangvu.id.vn` và `apisci.hoangvu.id.vn`

## 🏁 Getting Started <a name = "getting_started"></a>

These instructions will help you set up the project on your local machine for development and testing purposes.

### Prerequisites

- Node.js 18+ and npm/yarn for the frontend
- Python 3.8+ for the backend
- Google API key for Gemini AI
- docling-serve for PDF extraction (or use the fallback extraction method)

### Installing

1. Clone the repository

```bash
git clone https://github.com/yourusername/ielts-exam-generator.git
cd ielts-exam-generator
```

2. Set up the server (see server/README.md for detailed instructions)

```bash
cd server
pip install -r requirements.txt
# Configure your .env file with API keys
```

3. Set up the frontend (see frontend/README.md for detailed instructions)

```bash
cd frontend
npm install
# Configure your .env.local file if needed
```

4. Start both applications

```bash
# In the server directory
python server.py

# In the frontend directory
npm run dev
```

Visit http://localhost:3000 to access the application.

## 🎈 Usage <a name = "usage"></a>

1. **Upload a PDF**: Select a scientific paper or academic article to upload
2. **Configure Exam Settings**: Choose exam type, difficulty level, and other parameters
3. **Generate Exam**: Process the PDF and create a reading comprehension exam
4. **Take the Exam**: Complete the generated exam with the interactive interface
5. **Review Results**: Analyze your performance and learn from the answer explanations

## ⛏️ Built Using <a name = "built_using"></a>

- [Next.js](https://nextjs.org/) - Frontend Framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS Framework
- [FastAPI](https://fastapi.tiangolo.com/) - Server Framework
- [Google Gemini AI](https://ai.google.dev/) - AI Model for Exam Generation
- [docling-serve](https://github.com/docling-serve) - PDF Extraction Service

## ✍️ Authors <a name = "authors"></a>

- [@yourusername](https://github.com/yourusername) - Project Lead# SciHorizone
