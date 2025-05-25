# Paper To Exam Server

Backend server for converting scientific papers (PDF) into standardized IELTS/TOEIC reading comprehension exams.

## Triển khai

Server được triển khai tại domain `apisci.hoangvu.id.vn` và cung cấp API cho frontend ứng dụng được triển khai tại `scihorizone.hoangvu.id.vn`.

Cấu hình CORS đã được thiết lập để cho phép các domain `scihorizone.hoangvu.id.vn` và `apisci.hoangvu.id.vn` gọi API.

## Overview

The server provides the following functionalities:

- Content extraction from PDF files via `docling-serve` or fallback methods
- Analysis of PDF content and generation of IELTS/TOEIC reading comprehension exams using Google Gemini AI
- Customization of exam type, difficulty level, and passage type
- FastAPI server for integration with frontend applications

## Directory Structure

```
server/
├── baseline.py          # Main PaperToExam class, FastAPI server and CLI
├── server.py            # Standalone FastAPI server
├── data/                # Sample data and resources
├── llm.py               # Google Gemini API integration
├── output/              # Output directory for results
├── pdf_extractor.py     # PDF content extraction
├── playground/          # Experimentation and development
├── schema/              # JSON schema definitions for exams
├── system_prompt.md     # System prompt for LLM guidance
└── __init__.py          # Package initialization
```

## System Requirements

- Python 3.8+
- docling-serve (PDF conversion API) running on port 5001 (optional, fallback available)
- Google API key for Gemini AI

## Installation

1. Install dependencies:

```bash
pip install fastapi uvicorn langchain-google-genai python-dotenv requests
```

Alternatively, use the requirements file:

```bash
pip install -r requirements.txt
```

2. Set up environment variables in a `.env` file:

```
GOOGLE_API_KEY=your_google_api_key
GEMINI_MODEL=gemini-1.5-flash
GEMINI_TEMPERATURE=0.7
GEMINI_MAX_OUTPUT_TOKENS=8192
GEMINI_TOP_P=0.95
GEMINI_TOP_K=40
```

3. Ensure docling-serve is running (default: http://localhost:5001)

## Usage

### Using as an API Server

You have two ways to start the API server:

#### Method 1: Using server.py (Recommended)

```bash
python server.py --host 0.0.0.0 --port 8000 --reload
```

Parameters:
- `--host`: Host to bind the server (default: 0.0.0.0)
- `--port`: Port to bind the server (default: 8000)
- `--reload`: Enable auto-reload when code changes (optional)

#### Method 2: Using baseline.py

```bash
python baseline.py --server --host 0.0.0.0 --port 8000
```

After starting, the server will be available at: http://localhost:8000

#### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Check server status |
| `/upload-pdf` | POST | Upload PDF file and extract content |
| `/generate-exam/{session_id}` | POST | Generate exam from extracted content |
| `/download-result/{session_id}` | GET | Download result file |
| `/session-info/{session_id}` | GET | Get session information |

#### API Usage Examples

1. Upload PDF:
```
POST /upload-pdf
Content-Type: multipart/form-data
file: [PDF file]
```

2. Generate Exam:
```
POST /generate-exam/{session_id}
Content-Type: application/json
{
  "exam_type": "IELTS",
  "difficulty": "7.0",
  "passage_type": "3",
  "output_format": "json"
}
```

3. Download Results:
```
GET /download-result/{session_id}
```

### Using as a Library

```python
from baseline import PaperToExam

# Initialize
paper_to_exam = PaperToExam(api_key="your_google_api_key")

# Extract PDF content
paper_to_exam.extract_pdf("path/to/paper.pdf")

# Generate IELTS exam with band 7 difficulty, passage type 3
result = paper_to_exam.generate_exam(
    exam_type="IELTS",
    difficulty="7.0",
    passage_type="3",
    output_format="json"
)

print(result)
```

### Using from Command Line

```bash
python baseline.py --pdf path/to/paper.pdf --exam-type IELTS --difficulty 7.0 --passage-type 3
```

## Technical Specifications

- **AI Model**: Google Gemini 1.5 Flash (default)
- **Output Format**: JSON or text
- **Exam Types**: IELTS or TOEIC
- **Difficulty**: IELTS band scores (4.0-9.0) or TOEIC scores (400-900)
- **Passage Types**:
  - 1: Easiest (~700-1000 words)
  - 2: Medium difficulty (~700-1200 words)
  - 3: Most difficult (~750-1500 words)

## Session Management

Server API uses a session management system to manage the state:
- Each session has a unique ID (UUID)
- Session is created when uploading PDF
- Session data includes information about the uploaded file and exam results
- Session will be automatically deleted after 30 minutes of inactivity

## Advanced Configuration

You can customize advanced LLM parameters in the `llm.py` file:

- temperature: Adjust creativity level (0.0-1.0)
- max_output_tokens: Limit output length
- top_p/top_k: Sampling parameters

## Common Troubleshooting

- **docling-serve connection error**: Verify docling-serve is running on port 5001
- **API key error**: Ensure GOOGLE_API_KEY is valid and has access to Gemini API
- **PDF extraction error**: Check PDF format and file access permissions