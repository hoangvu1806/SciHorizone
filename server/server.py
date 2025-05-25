#!/usr/bin/env python3
import os
import sys
import json
import uuid
import shutil
import uvicorn
import asyncio
import requests
from typing import Dict, Any, Optional, Union, List
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path

# Import from existing modules
from baseline import PaperToExam


class ExamRequest(BaseModel):
    """Model for exam request."""
    exam_type: str
    difficulty: str
    passage_type: str
    output_format: str = "json"


# Check if docling-serve is available
def check_docling_serve(url: str = "http://localhost:5001/v1alpha/convert/file") -> bool:
    """Check if docling-serve is running."""
    try:
        # Only perform HEAD request to check connection
        response = requests.head(url, timeout=2)
        return True
    except requests.RequestException:
        return False


# FastAPI App
app = FastAPI(
    title="Paper To Exam API",
    description="API to convert scientific papers to reading comprehension exams",
    version="1.0.0",
)


app = FastAPI()

# Thêm CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4040",  # Origin của Next.js local
        "https://scihorizone.hoangvu.id.vn",  # Origin của Next.js production
        "https://apisci.hoangvu.id.vn",  # Domain API mới
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Cho phép tất cả methods (GET, POST, v.v.)
    allow_headers=["*"],  # Cho phép tất cả headers
)

# Temporary directory for uploaded files
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

# Store session states
sessions = {}

# Check if docling-serve is available and print warning if not
docling_serve_available = check_docling_serve()
if not docling_serve_available:
    print("\n*** WARNING: Docling-serve is not available at http://localhost:5001 ***")
    print("*** System will use fallback extraction method with lower quality ***")
    print("*** Please run docling-serve for best results ***\n")


@app.get("/")
async def read_root():
    """Endpoint to check server status."""
    status_info = {
        "status": "ok", 
        "message": "Paper To Exam API is running",
        "docling_serve_available": docling_serve_available
    }
    
    if not docling_serve_available:
        status_info["warning"] = "Docling-serve is not available. Using fallback extraction method."
        
    return status_info


@app.post("/upload-pdf")
async def upload_pdf(pdf_file: UploadFile = File(...)):
    """Upload PDF file and extract content."""
    if not pdf_file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")
    
    # Create new session
    session_id = str(uuid.uuid4())
    
    # Save file to temporary directory
    file_path = os.path.join(UPLOAD_DIR, f"{session_id}_{pdf_file.filename}")
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(pdf_file.file, buffer)
        
        # Close uploaded file to avoid file lock
        await pdf_file.close()
        
        # Create PaperToExam instance and extract content
        paper_to_exam = PaperToExam()
        
        try:
            markdown_content = paper_to_exam.extract_pdf(file_path)
        except RuntimeError as e:
            if "Error connecting to docling-serve" in str(e):
                # Handle error connecting to docling-serve
                raise HTTPException(
                    status_code=503, 
                    detail="PDF extraction service is not available. Please try again later or contact administrator."
                )
            else:
                raise e
        
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
        # Delete file if processing fails and file exists
        try:
            if os.path.exists(file_path):
                # Try to close all handles before deleting on Windows
                import gc
                gc.collect()  # Suggest garbage collection
                os.remove(file_path)
        except Exception as del_error:
            print(f"Failed to delete temporary file: {del_error}")
            
        # Log error for debugging
        import traceback
        print(f"Error: {str(e)}")
        print(traceback.format_exc())
        
        raise HTTPException(status_code=500, detail=f"Error extracting PDF: {str(e)}")


@app.post("/generate-exam/{session_id}")
async def generate_exam(
    session_id: str, 
    request: ExamRequest,
    background_tasks: BackgroundTasks
):
    """Generate exam from extracted content."""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session does not exist or has expired")
    
    session = sessions[session_id]
    paper_to_exam = session["paper_to_exam"]
    
    try:
        # Before calling generate_exam, set output file name to session_id
        filename = f"{session_id}"
        
        result = paper_to_exam.generate_exam(
            exam_type=request.exam_type,
            difficulty=request.difficulty,
            passage_type=request.passage_type,
            output_format=request.output_format,
            output_filename=filename  # Pass file name to generate_exam
        )
        
        # Create result file path
        if request.output_format == "json":
            result_file = os.path.join(paper_to_exam.output_dir, f"{filename}.json")
        else:
            result_file = os.path.join(paper_to_exam.output_dir, f"{filename}.txt")
        
        # Add result information to session
        session["result_file"] = result_file
        
        # Do not delete session to allow reviewing exam at any time
        
        return {
            "session_id": session_id,
            "result": result,
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating exam: {str(e)}")


@app.get("/download-result/{session_id}")
async def download_result(session_id: str):
    """Download result file."""
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
    print(f"Accessing session-info with session_id: {session_id}")
    
    # Default output directory
    output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "output")
    has_result = False
    filename = "unknown.pdf"
    
    # If session exists in sessions
    if session_id in sessions:
        session = sessions[session_id]
        filename = session.get("filename", "unknown.pdf")
        has_result = "result_file" in session
        
        if not has_result and "paper_to_exam" in session:
            # Try to find result file
            paper_to_exam = session["paper_to_exam"]
            result_file = os.path.join(paper_to_exam.output_dir, f"{session_id}.json")
            has_result = os.path.exists(result_file)
    else:
        print(f"Session does not exist in sessions. Searching for result file directly.")
        # Search for result file directly in output directory
        potential_result_file = os.path.join(output_dir, f"{session_id}.json")
        has_result = os.path.exists(potential_result_file)
        
        if not has_result:
            # Search for files containing session_id in name
            for file in os.listdir(output_dir):
                if file.endswith(".json") and session_id in file:
                    has_result = True
                    break
    
    return {
        "session_id": session_id,
        "filename": filename,
        "has_result": has_result,
        "status": "active" if session_id in sessions else "expired",
        "exam_type": "IELTS",  # Default value
        "difficulty": "7.0",    # Default value
        "passage_type": "Academic"  # Default value
    }


@app.get("/exam-data/{session_id}")
async def get_exam_data(session_id: str):
    """Get exam data without generating new exam."""
    print(f"Accessing exam-data with session_id: {session_id}")
    
    # Default output directory
    output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "output")
    result_file = None
    
    # If session exists in sessions
    if session_id in sessions:
        session = sessions[session_id]
        print(f"Session information: {list(session.keys())}")
        
        # Check if exam result exists
        if "result_file" in session:
            result_file = session["result_file"]
        else:
            print(f"Result file not found in session")
            
            # Try to recreate result file path
            paper_to_exam = session.get("paper_to_exam")
            if paper_to_exam:
                filename = f"{session_id}"
                result_file = os.path.join(paper_to_exam.output_dir, f"{filename}.json")
    else:
        print(f"Session does not exist in sessions. Searching for result file directly.")
    
    # If result file not found in session, try searching directly
    if not result_file or not os.path.exists(result_file):
        # Search for result file directly in output directory
        potential_result_file = os.path.join(output_dir, f"{session_id}.json")
        
        if os.path.exists(potential_result_file):
            print(f"Found result file directly: {potential_result_file}")
            result_file = potential_result_file
        else:
            # Search for files containing session_id in name
            found_files = []
            for file in os.listdir(output_dir):
                if file.endswith(".json") and session_id in file:
                    found_files.append(os.path.join(output_dir, file))
            
            if found_files:
                print(f"Found files containing session_id: {found_files}")
                result_file = found_files[0]  # Take first found file
    
    # If result file not found
    if not result_file or not os.path.exists(result_file):
        print(f"Result file not found for session_id: {session_id}")
        raise HTTPException(status_code=404, detail="Exam result does not exist. Please generate exam first.")
    
    print(f"Result file path: {result_file}")
    
    try:
        # Read data from result file
        with open(result_file, "r", encoding="utf-8") as f:
            result_data = json.load(f)
        
        print(f"Successfully read data from result file")
        return {
            "session_id": session_id,
            "result": result_data,
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading exam data: {str(e)}")


async def cleanup_session(session_id: str, delay_minutes: int = 30):
    """Clean up session resources after a certain time."""
    # Wait for a certain time
    await asyncio.sleep(delay_minutes * 60)
    
    # Check if session still exists
    if session_id in sessions:
        session = sessions[session_id]
        
        # Delete uploaded PDF file
        if "file_path" in session and os.path.exists(session["file_path"]):
            try:
                # Try to close all handles before deleting on Windows
                # Thử đóng tất cả handle trước khi xóa trên Windows
                import gc
                gc.collect()  # Gợi ý thu gom rác
                
                # Thử tối đa 3 lần
                for _ in range(3):
                    try:
                        os.remove(session["file_path"])
                        print(f"Đã xóa file tạm: {session['file_path']}")
                        break
                    except PermissionError:
                        # Nếu file đang bị sử dụng, đợi và thử lại
                        await asyncio.sleep(2)
                    except Exception as e:
                        print(f"Không thể xóa file tạm: {str(e)}")
                        break
            except Exception as e:
                print(f"Lỗi khi xóa file: {str(e)}")
        
        # Delete session
        del sessions[session_id]
        print(f"Đã xóa phiên làm việc: {session_id}")


def start_server(host: str = "0.0.0.0", port: int = 8000, reload: bool = False):
    """Khởi động FastAPI server."""
    print(f"Khởi động Paper To Exam API tại http://{host}:{port}")
    uvicorn.run("server:app", host=host, port=port, reload=reload)


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Paper To Exam API Server")
    parser.add_argument("--host", default="0.0.0.0", help="Host để bind server (mặc định: 0.0.0.0)")
    parser.add_argument("--port", type=int, default=8000, help="Cổng để bind server (mặc định: 8000)")
    parser.add_argument("--reload", action="store_true", help="Bật chế độ tự động reload khi có thay đổi code")
    
    args = parser.parse_args()
    start_server(host=args.host, port=args.port, reload=args.reload) 