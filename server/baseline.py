#!/usr/bin/env python3
import os
import sys
import json
import argparse
from typing import Dict, Any, Optional, Union, List
from pdf_extractor import PDFExtractor
from llm import LLM
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import uuid
import shutil
from pathlib import Path


class ExamRequest(BaseModel):
    exam_type: str
    difficulty: str
    passage_type: str
    output_format: str = "json"


class PaperToExam:   
    def __init__(
        self,
        api_key: Optional[str] = None,
        system_prompt_file: str = "system_prompt.md",
        output_dir: Optional[str] = None,
    ):
        self.pdf_extractor = PDFExtractor()
        self.llm = LLM.with_system_prompt(
            system_prompt_file=system_prompt_file, api_key=api_key
        )
        self.markdown_content = None

        if output_dir:
            self.output_dir = output_dir
        else:
            self.output_dir = os.path.join(
                os.path.dirname(os.path.abspath(__file__)), "output"
            )

        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)

    def extract_pdf(self, pdf_path: str) -> str:
        print(f"Extracting content from PDF: {pdf_path}")
        md_filename = os.path.basename(pdf_path).replace(".pdf", ".md")
        md_path = os.path.join(self.output_dir, md_filename)
        output_path = self.pdf_extractor.process(
            pdf_path, output_path=md_path, clean_images=True
        )
        self.markdown_content = open(output_path, "r", encoding="utf-8").read()
        word_count = self.count_words(self.markdown_content)
        print(
            f"Extraction successful: {word_count} words, {len(self.markdown_content)} characters"
        )
        return self.markdown_content

    def count_words(self, text: str) -> int:
        words = text.split()
        return len(words)

    def generate_exam(
        self,
        exam_type: str,
        difficulty: str,
        passage_type: str,
        output_format: str = "json",
        output_filename: Optional[str] = None
    ) -> Union[Dict[str, Any], str]:
        """
        Create IELTS Reading exam from PDF content.

        Args:
            exam_type: Exam type (IELTS, TOEIC)
            difficulty: Exam difficulty
            passage_type: Passage type (1, 2, 3)
            output_format: Output format (json, text)
            output_filename: Output filename (without extension)

        Returns:
            Exam result
        """
        if not self.markdown_content:
            raise ValueError(
                "No content available to create exam. Please extract PDF first."
            )

        print(
            f"Creating IELTS exam with difficulty {difficulty}, passage type {passage_type}..."
        )

        # Select schema
        schema = self._get_schema(exam_type)

        # Determine passage instruction
        passage_instruction = self._get_passage_instruction(passage_type)

        # Create prompt for LLM
        prompt = self._create_prompt(exam_type, difficulty, passage_instruction)

        try:
            # Call LLM to create exam
            if output_format == "json":
                result = self.llm.invoke_json(prompt, schema=schema)
                self._validate_result(result, passage_type)
            else:
                result = self.llm.invoke(prompt)

            # Save results
            self._save_result(
                result, exam_type, difficulty, passage_type, output_format, output_filename
            )

            return result

        except Exception as e:
            print(f"Error processing content: {str(e)}")
            raise

    def _get_schema(self, exam_type: str) -> Dict[str, Any]:
        """Return schema for exam type."""
        if exam_type.upper() == "IELTS":
            return self._get_ielts_schema()
        elif exam_type.upper() == "TOEIC":
            return self._get_toeic_schema()
        else:
            return self._get_generic_schema()

    def _get_passage_instruction(self, passage_type: str) -> str:
        """Create passage instruction."""
        if passage_type == "1":
            return """
Create a TYPE 1 PASSAGE:
- This is the easiest passage
- Length: ~700 – 950 words
- Topics: society, education, environment
- Simple sentence structure
- Ideas presented clearly
- Must have EXACTLY 14 questions (5-4-5)
"""
        elif passage_type == "2":
            return """
Create a TYPE 2 PASSAGE:
- This is the medium difficulty passage
- Length: ~700 – 1200 words
- Topics: science, history, economics
- Intermediate vocabulary
- More complex sentence structure
- Must have EXACTLY 14 questions (5-4-5)
"""
        elif passage_type == "3":
            return """
Create a TYPE 3 PASSAGE:
- This is the most difficult passage
- Length: ~700 – 1200 words
- Topics: academic or abstract (philosophy, biology, technology...)
- Advanced academic vocabulary
- Author's viewpoints can be confusing
- Must have EXACTLY 14 questions (5-4-5)
"""
        return ""

    def _create_prompt(
        self, exam_type: str, difficulty: str, passage_instruction: str
    ) -> str:
        """Create prompt for LLM."""
        return f"""
Exam type: {exam_type}
Difficulty: {difficulty}

Your task is to create a {exam_type} Reading exam with ONE PASSAGE based on the provided article content.
Specifically, you need to:

1. Create a reading passage based on the provided article content
2. Follow the standard exam format

{passage_instruction}

3. The passage must be based on the article content, but adjusted to fit the exam format
4. The passage must be accurate according to the article content, without any fabrication
5. CONTENT REQUIREMENTS: The passage must have EXACTLY 3 question types:
   - The first question type has 5 questions
   - The second question type has 4 questions
   - The third question type has 5 questions
   The entire passage will have EXACTLY 14 questions.
   Each question MUST include an explanation field that explains why the answer is correct.
6. Use various question types from the list:
   - True/False/Not Given or Yes/No/Not Given
   - Matching headings (must always include options field listing matching options)
   - Matching information (must always include options field listing matching options)
   - Matching features (must always include options field listing matching options)
   - Matching sentence endings (must always include options field listing matching options)
   - Sentence completion
   - Summary/note/table/flow-chart completion
   - Multiple choice
   - List selection
   - Diagram label completion
   - Short-answer questions
   Ensure that there are reasonable, intelligent options appropriate for band score {difficulty}

FORMAT REQUIREMENTS:
1. The reading passage must include word count (word_count) and clearly indicate passage type (passage_type)
2. Create a set of 14-16 diverse questions about the passage
3. Do not add comments or notes to the JSON result
4. The returned result must be valid JSON according to the provided schema
5. IMPORTANT: Each question MUST have a detailed explanation field that explains why the answer is correct. The explanation should be clear and educational, helping the student understand the reasoning behind the correct answer.

Original text:

{self.markdown_content}
"""

    def _validate_result(self, result: Dict[str, Any], passage_type: str) -> None:
        """Check results from LLM."""
        # Check passage length
        if "reading_passage" in result:
            passage = result["reading_passage"]
            if "content" in passage:
                # Calculate word count if not available
                if "word_count" not in passage or passage["word_count"] == 0:
                    passage["word_count"] = self.count_words(passage["content"])

                # Check passage length
                word_count = passage.get("word_count", 0)
                passage_num = int(passage_type)

                min_words = 700
                if passage_num == 3:
                    min_words = 750

                if word_count < min_words:
                    print(
                        f"WARNING: Passage has {word_count} words, less than the minimum requirement of {min_words} words."
                    )
                else:
                    print(
                        f"OK: Passage has {word_count} words (meets the minimum requirement of {min_words} words)."
                    )

        # Check number of questions
        if "questions" in result:
            questions = result["questions"]
            if not isinstance(questions, list):
                print("WARNING: Question data is not a list.")
                return

            question_count = len(questions)
            if question_count < 14 or question_count > 16:
                print(
                    f"WARNING: There are {question_count} questions, not meeting the requirement of 14-16 questions."
                )
            else:
                print(f"OK: Exam has exactly {question_count} questions.")

            # Check number of questions by type
            question_types = {}
            for q in questions:
                q_type = q.get("type", "unknown")
                if q_type not in question_types:
                    question_types[q_type] = 0
                question_types[q_type] += 1

            print(f"Question distribution by type: {question_types}")

    def _save_result(
        self,
        result: Union[Dict[str, Any], str],
        exam_type: str,
        difficulty: str,
        passage_type: str,
        output_format: str,
        output_filename: Optional[str] = None,
    ) -> None:
        """Save result to file."""
        # Create filename
        if output_filename:
            # Use specified filename
            filename = output_filename
        else:
            # Use default filename
            filename = f"{exam_type.lower()}_p{passage_type}_d{difficulty.replace('.', '')}"
            
        if output_format == "json":
            filepath = os.path.join(self.output_dir, f"{filename}.json")
            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(result, f, ensure_ascii=False, indent=2)
        else:
            filepath = os.path.join(self.output_dir, f"{filename}.txt")
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(result)

        print(f"Results saved to: {filepath}")

    def _get_ielts_schema(self) -> Dict[str, Any]:
        """Return schema for IELTS exam."""
        try:
            schema_path = os.path.join(
                os.path.dirname(os.path.abspath(__file__)), "schema", "ielts_schema.json"
            )
            with open(schema_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"Failed to read IELTS schema: {e}")
            return self._get_generic_schema()

    def _get_toeic_schema(self) -> Dict[str, Any]:
        """Return schema for TOEIC exam."""
        try:
            schema_path = os.path.join(
                os.path.dirname(os.path.abspath(__file__)), "schema", "toeic_schema.json"
            )
            with open(schema_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"Failed to read TOEIC schema: {e}")
            return self._get_generic_schema()

    def _get_generic_schema(self) -> Dict[str, Any]:
        """Return generic schema for exam."""
        return {
            "type": "object",
            "required": ["reading_passage", "questions"],
            "properties": {
                "reading_passage": {
                    "type": "object",
                    "required": ["title", "content", "word_count", "passage_type"],
                    "properties": {
                        "title": {"type": "string"},
                        "content": {"type": "string"},
                        "word_count": {"type": "integer"},
                        "passage_type": {"type": "string"},
                    },
                },
                "questions": {
                    "type": "array",
                    "minItems": 14,
                    "maxItems": 14,
                    "items": {
                        "type": "object",
                        "required": [
                            "question_number",
                            "passage_reference",
                            "question_type",
                            "question_category",
                            "question_text",
                            "correct_answer",
                            "explanation"
                        ],
                        "properties": {
                            "question_number": {"type": "integer"},
                            "passage_reference": {"type": "string"},
                            "question_type": {"type": "string"},
                            "question_category": {"type": "string"},
                            "question_text": {"type": "string"},
                            "correct_answer": {"type": "string"},
                            "options": {
                                "type": "array",
                                "items": {"type": "string"}
                            },
                            "explanation": {"type": "string"}
                        },
                    },
                },
            },
        }


# FastAPI App
app = FastAPI(
    title="Paper To Exam API",
    description="API to convert article to reading exam",
    version="1.0.0",
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Temporary storage for uploaded PDF files
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

# Session storage
sessions = {}


@app.get("/")
async def read_root():
    """Endpoint to check server status."""
    return {"status": "ok", "message": "Paper To Exam API is running"}


@app.post("/upload-pdf")
async def upload_pdf(pdf_file: UploadFile = File(...)):
    """Upload PDF file and extract content."""
    if not pdf_file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")
    
    # Create new session
    session_id = str(uuid.uuid4())
    
    # Save file to temporary directory
    file_path = os.path.join(UPLOAD_DIR, f"{session_id}_{pdf_file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(pdf_file.file, buffer)
    
    # Create PaperToExam instance and extract content
    try:
        paper_to_exam = PaperToExam()
        markdown_content = paper_to_exam.extract_pdf(file_path)
        
        # Save session information
        sessions[session_id] = {
            "file_path": file_path,
            "paper_to_exam": paper_to_exam,
            "filename": pdf_file.filename
        }
        
        word_count = paper_to_exam.count_words(markdown_content)
        
        return {
            "session_id": session_id,
            "filename": pdf_file.filename,
            "word_count": word_count,
            "status": "success",
            "message": f"Successfully extracted {word_count} words"
        }
    except Exception as e:
        # Delete file if processing fails
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Error extracting PDF: {str(e)}")


@app.post("/generate-exam/{session_id}")
async def generate_exam(
    session_id: str, 
    request: ExamRequest,
    background_tasks: BackgroundTasks
):
    """Create exam from extracted content."""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session does not exist or has expired")
    
    session = sessions[session_id]
    paper_to_exam = session["paper_to_exam"]
    
    try:
        result = paper_to_exam.generate_exam(
            exam_type=request.exam_type,
            difficulty=request.difficulty,
            passage_type=request.passage_type,
            output_format=request.output_format
        )
        
        # Create result filename
        filename = f"{request.exam_type.lower()}_p{request.passage_type}_d{request.difficulty.replace('.', '')}"
        if request.output_format == "json":
            result_file = os.path.join(paper_to_exam.output_dir, f"{filename}.json")
        else:
            result_file = os.path.join(paper_to_exam.output_dir, f"{filename}.txt")
        
        # Save result to session
        session["result_file"] = result_file
        
        # Delete temporary file after 30 minutes
        background_tasks.add_task(cleanup_session, session_id)
        
        return {
            "session_id": session_id,
            "result": result,
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating exam: {str(e)}")


@app.get("/download-result/{session_id}")
async def download_result(session_id: str):
    """Download exam result."""
    if session_id not in sessions or "result_file" not in sessions[session_id]:
        raise HTTPException(status_code=404, detail="Result does not exist or has expired")
    
    result_file = sessions[session_id]["result_file"]
    if not os.path.exists(result_file):
        raise HTTPException(status_code=404, detail="Result file does not exist")
    
    filename = os.path.basename(result_file)
    return FileResponse(
        path=result_file, 
        filename=filename,
        media_type="application/octet-stream"
    )


@app.get("/session-info/{session_id}")
async def get_session_info(session_id: str):
    """Get session information."""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session does not exist or has expired")
    
    session = sessions[session_id]
    return {
        "session_id": session_id,
        "filename": session["filename"],
        "has_result": "result_file" in session,
        "status": "active"
    }


async def cleanup_session(session_id: str, delay_minutes: int = 30):
    """Delete temporary files after a delay."""
    import asyncio
    
    # Wait for a delay
    await asyncio.sleep(delay_minutes * 60)
    
    # Check if session still exists
    if session_id in sessions:
        session = sessions[session_id]
        
        # Delete uploaded PDF file
        if "file_path" in session and os.path.exists(session["file_path"]):
            try:
                os.remove(session["file_path"])
            except Exception:
                pass
        
        # Delete session
        del sessions[session_id]


def main():
    """Main program."""
    parser = argparse.ArgumentParser(description="Paper To Exam - Convert PDF to reading exam")
    
    # Command line arguments
    cli_mode = parser.add_argument_group("Command line mode")
    cli_mode.add_argument("--pdf", help="Path to PDF file")
    cli_mode.add_argument(
        "--exam-type", choices=["IELTS", "TOEIC"], default="IELTS", help="Exam type (default: IELTS)"
    )
    cli_mode.add_argument(
        "--difficulty", default="7.0", help="Exam difficulty (default: 7.0)"
    )
    cli_mode.add_argument(
        "--passage-type", choices=["1", "2", "3"], default="3", help="Passage type (default: 3)"
    )
    cli_mode.add_argument(
        "--output-format", choices=["json", "text"], default="json", help="Output format (default: json)"
    )
    cli_mode.add_argument(
        "--api-key", help="API key for LLM (if not provided, will use environment variable)"
    )
    
    # Server mode arguments
    server_mode = parser.add_argument_group("Server mode")
    server_mode.add_argument(
        "--server", action="store_true", help="Run in server mode"
    )
    server_mode.add_argument(
        "--host", default="0.0.0.0", help="Host để bind server (mặc định: 0.0.0.0)"
    )
    server_mode.add_argument(
        "--port", type=int, default=8000, help="Cổng để bind server (mặc định: 8000)"
    )
    
    args = parser.parse_args()
    
    # Chế độ server
    if args.server:
        print(f"Khởi động server FastAPI tại http://{args.host}:{args.port}")
        uvicorn.run("baseline:app", host=args.host, port=args.port, reload=False)
        return
    
    # Chế độ command line
    if not args.pdf:
        parser.print_help()
        print("\nLỗi: Cần chỉ định đường dẫn file PDF (--pdf)")
        sys.exit(1)
    
    paper_to_exam = PaperToExam(api_key=args.api_key)
    
    # Trích xuất PDF
    paper_to_exam.extract_pdf(args.pdf)
    
    # Tạo đề thi
    result = paper_to_exam.generate_exam(
        exam_type=args.exam_type,
        difficulty=args.difficulty,
        passage_type=args.passage_type,
        output_format=args.output_format,
    )
    
    if args.output_format == "json":
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        print(result)


if __name__ == "__main__":
    main()
