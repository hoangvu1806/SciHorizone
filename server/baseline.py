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
        # IELTS passage types
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
        # TOEIC part types - return the part number directly
        elif passage_type in ["5", "6", "7"]:
            return passage_type

        return ""

    def _create_prompt(
        self, exam_type: str, difficulty: str, passage_instruction: str
    ) -> str:
        """Create prompt for LLM."""
        if exam_type == "IELTS":
            return self._create_ielts_prompt(difficulty, passage_instruction)
        elif exam_type == "TOEIC":
            return self._create_toeic_prompt(difficulty, passage_instruction)
        else:
            raise ValueError(f"Unsupported exam type: {exam_type}")

    def _create_ielts_prompt(self, difficulty: str, passage_instruction: str) -> str:
        """Create prompt for IELTS exam."""
        return f"""
Exam type: IELTS
Difficulty: {difficulty}

Your task is to create an IELTS Reading exam with ONE PASSAGE based on the provided article content.
Specifically, you need to:

1. Create a reading passage based on the provided article content
2. Follow the standard IELTS exam format

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
   - Matching sentence endings (must always include options field listing matching options)
   - Sentence completion
   - Summary/note/table/flow-chart completion
   - Multiple choice
   - List selection
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

    def _create_toeic_prompt(self, difficulty: str, passage_instruction: str) -> str:
        """Create prompt for TOEIC exam."""
        part_number = passage_instruction.strip() if passage_instruction.strip().isdigit() else "5"
        # Add special emphasis for Part 7
        part_emphasis = ""
        if part_number == "7":
            part_emphasis = """
CRITICAL REMINDER FOR PART 7:
- You MUST create EXACTLY 20 questions numbered 147-166
- You MUST create EXACTLY 7 passages (5 single + 2 double)
- This is not optional - it is a strict requirement
- Do not create fewer or more questions or passages
"""

        return f"""
Exam type: TOEIC
Part: {part_number}
Difficulty: {difficulty}

Your task is to create ONLY ONE PART of a TOEIC Reading exam based on the provided article content.
You will create Part {part_number} following the standard TOEIC Reading format.

IMPORTANT: Create ONLY Part {part_number}, not all parts.
{part_emphasis}

GENERAL REQUIREMENTS:
1. Adapt the content to be business/workplace-oriented as appropriate for TOEIC
2. Ensure all content is accurate according to the article, without fabrication
3. Use professional vocabulary and business contexts
4. All questions must have exactly 4 options (A, B, C, D)
5. Each question must have a detailed explanation for the correct answer

{self._get_part_specific_instructions(part_number, difficulty)}

ANALYSIS REQUIREMENTS:
- Provide analysis specific to Part {part_number} as specified in the schema
- Include grammar focus areas (for Part 5 and 6)
- Assess vocabulary level and challenging areas
- Estimate correct answers based on difficulty level {difficulty}
- Provide improvement suggestions specific to this part

FORMAT REQUIREMENTS:
1. Follow the TOEIC JSON schema structure precisely
2. Set "part_number" field to {part_number}
3. Set "exam_type" to "TOEIC"
4. Include all required fields for Part {part_number}
5. Do not add comments or notes to the JSON result
6. The returned result must be valid JSON according to the provided schema
7. IMPORTANT: Each question MUST have a detailed explanation field that explains why the answer is correct

Original text:

{self.markdown_content}
"""

    def _get_part_specific_instructions(self, part_number: str, difficulty: str) -> str:
        """Get specific instructions for each TOEIC part."""
        if part_number == "5":
            return f"""
PART 5 (Incomplete Sentences) REQUIREMENTS:
- Create exactly 30 standalone sentences related to business and professional contexts
- Each sentence should have one blank (___) with 4 options (A, B, C, D)
- Test a variety of grammar points appropriate for TOEIC level {difficulty}
- Include common TOEIC grammar points: verb tenses, prepositions, articles, word forms, etc.
- Sentences should be independent and not require reading passages
- Focus on workplace vocabulary and business scenarios
- Each question must test only ONE grammar point clearly
- Difficulty should match TOEIC score level {difficulty}

Example format:
"The quarterly report will be ___ to all department heads by Friday."
A) distribute  B) distributed  C) distributing  D) distribution

IMPORTANT: reading_passages array should be EMPTY for Part 5.
"""
        elif part_number == "6":
            return f"""
PART 6 (Text Completion) REQUIREMENTS:
- Create exactly 4 short business texts (50-100 words each)
- Each text should have exactly 4 blanks (16 questions total)
- Use appropriate business document formats: emails, memos, notices, letters, etc.
- Each blank should have 4 options (A, B, C, D)
- Test both grammar and discourse cohesion
- Questions should test: grammar, vocabulary, transitions, and text organization
- Texts should be realistic business communications
- Difficulty should match TOEIC score level {difficulty}

Text types to use:
- Business emails
- Company memos
- Meeting notices
- Product announcements
- Policy updates

IMPORTANT: Create exactly 4 passages in reading_passages array, each with part=6.
"""
        elif part_number == "7":
            return f"""
PART 7 (Reading Comprehension) REQUIREMENTS:
Create EXACTLY 20 questions numbered 147-166 (optimized for LLM processing).

EXACT STRUCTURE REQUIRED:

SECTION 1 - SINGLE PASSAGES (Questions 147-161): 15 questions total
Create exactly 5 single passages with the following distribution:
- Passage 1: 3 questions (147-149)
- Passage 2: 3 questions (150-152)
- Passage 3: 3 questions (153-155)
- Passage 4: 3 questions (156-158)
- Passage 5: 3 questions (159-161)
Each passage: 100-200 words, business documents (emails, memos, ads, etc.)

SECTION 2 - DOUBLE PASSAGES (Questions 162-166): 5 questions total
Create exactly 1 set of double passages:
- Set 1: Passages 6a & 6b with 5 questions (162-166)
Each document: 150-250 words, related business documents

MANDATORY REQUIREMENTS:
1. EXACTLY 20 questions numbered 147-166
2. EXACTLY 7 passages total (5 single + 2 double)
3. Each question MUST have exactly 4 options (A, B, C, D)
4. Use passage_number: integers for single (1-5), strings for double ("6a", "6b")
5. All passages must be business-oriented and realistic
6. Include various question types: main idea, detail, inference, vocabulary, application
7. Difficulty level: {difficulty}

DOCUMENT TYPES:
- Business emails, memos, announcements
- Job postings, applications, resumes
- Product ads, reviews, specifications
- Meeting agendas, minutes, schedules
- Financial reports, invoices, receipts
- News articles, policy documents

QUESTION TYPES TO INCLUDE:
- Main idea/purpose questions
- Specific detail questions
- Inference questions ("What is suggested/implied?")
- Vocabulary in context
- Reference questions ("What does 'it' refer to?")
- Application questions ("What should X do next?")
- Multiple document questions (for double passages)

CREATE EXACTLY 20 questions - no more, no less.
"""
        else:
            return "Invalid part number. Must be 5, 6, or 7."

    def _validate_result(self, result: Dict[str, Any], passage_type: str) -> None:
        """Check results from LLM."""
        # Determine exam type
        exam_type = result.get("exam_type", "IELTS")
        
        if exam_type == "IELTS":
            self._validate_ielts_result(result, passage_type)
        elif exam_type == "TOEIC":
            self._validate_toeic_result(result)
        else:
            print(f"WARNING: Unknown exam type: {exam_type}")
            
    def _validate_ielts_result(self, result: Dict[str, Any], passage_type: str) -> None:
        """Validate IELTS exam result."""
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

    def _validate_toeic_result(self, result: Dict[str, Any]) -> None:
        # Check part number
        part_number = result.get("part_number")
        # Check estimated score
        if "estimated_score" in result:
            score = result["estimated_score"]
        else:
            print("WARNING: Missing estimated score")

        # Check reading passages based on part
        if "reading_passages" in result:
            passages = result["reading_passages"]
            if not isinstance(passages, list):
                print("WARNING: Reading passages data is not a list")
            else:
                if part_number == 5:
                    if len(passages) != 0:
                        print(f"WARNING: Part 5 should have 0 passages, found {len(passages)}")
                    else:
                        print("OK: Part 5 has no passages")
                elif part_number == 6:
                    if len(passages) != 4:
                        print(f"WARNING: Part 6 should have 4 passages, found {len(passages)}")
                    else:
                        print("OK: Part 6 has 4 passages")
                elif part_number == 7:
                    # Part 7 should have: 5 single + 2 double = 7 passages total
                    expected_passages = 7
                    if len(passages) != expected_passages:
                        print(f"WARNING: Part 7 should have {expected_passages} passages (5 single + 2 double), found {len(passages)}")
                    else:
                        print(f"OK: Part 7 has {len(passages)} passages")
        else:
            print("WARNING: Missing reading passages")

        # Check questions
        if "questions" in result:
            questions = result["questions"]
            if not isinstance(questions, list):
                print("WARNING: Question data is not a list")
                return

            question_count = len(questions)

            # Validate question count based on part
            if part_number == 5:
                expected_count = 30
            elif part_number == 6:
                expected_count = 16
            elif part_number == 7:
                expected_count = 20  # Optimized TOEIC Part 7 for LLM processing
            else:
                expected_count = 0

            if part_number in [5, 6, 7]:
                if question_count != expected_count:
                    print(f"WARNING: Part {part_number} should have {expected_count} questions, found {question_count}")
                else:
                    print(f"OK: Part {part_number} has {question_count} questions")

            # Check all questions have correct part number
            for q in questions:
                if q.get("part") != part_number:
                    print(f"WARNING: Question {q.get('question_number', '?')} has wrong part number")

            # Check options format
            for q in questions:
                if "options" in q:
                    options = q["options"]
                    if not isinstance(options, dict) or len(options) != 4:
                        print(f"WARNING: Question {q.get('question_number', '?')} does not have exactly 4 options")
                    elif not all(key in options for key in ["A", "B", "C", "D"]):
                        print(f"WARNING: Question {q.get('question_number', '?')} missing A, B, C, or D options")
        else:
            print("WARNING: Missing questions")

        # Check part analysis
        if "part_analysis" not in result:
            print("WARNING: Missing part_analysis")
        else:
            analysis = result["part_analysis"]
            if not isinstance(analysis, dict):
                print("WARNING: part_analysis is not a dict")
            else:
                required_fields = ["vocabulary_level", "estimated_correct", "challenging_areas"]
                for field in required_fields:
                    if field not in analysis:
                        print(f"WARNING: Missing {field} in part_analysis")

        # Check improvement suggestions
        if "improvement_suggestions" not in result:
            print("WARNING: Missing improvement suggestions")
        elif not isinstance(result["improvement_suggestions"], list):
            print("WARNING: Improvement suggestions is not a list")
        else:
            print(f"OK: Found {len(result['improvement_suggestions'])} improvement suggestions")

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

