import os
from typing import Dict, List, Any, Optional, Union, TypeVar
import json
from langchain_google_genai import GoogleGenerativeAI
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain_google_genai import HarmBlockThreshold, HarmCategory
from dotenv import load_dotenv
import re

# Tải biến môi trường từ file .env
load_dotenv()

T = TypeVar("T")


class LLM:
    """Class đơn giản để làm việc với Google Gemini."""

    def __init__(
        self,
        model_name: str = None,
        temperature: float = None,
        max_output_tokens: int = None,
        top_p: float = None,
        top_k: int = None,
        api_key: str = None,
        system_prompt: str = None,
        system_prompt_file: str = None,
    ):
        # Lấy giá trị từ tham số hoặc biến môi trường
        self.model_name = model_name or os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
        self.temperature = temperature or float(os.getenv("GEMINI_TEMPERATURE", "0.7"))
        self.max_output_tokens = max_output_tokens or int(
            os.getenv("GEMINI_MAX_OUTPUT_TOKENS", "8192")
        )
        self.top_p = top_p or float(os.getenv("GEMINI_TOP_P", "0.95"))
        self.top_k = top_k or int(os.getenv("GEMINI_TOP_K", "40"))
        self.api_key = api_key or os.getenv("GOOGLE_API_KEY")

        # Xử lý system prompt
        if system_prompt:
            self.system_prompt = system_prompt
        elif system_prompt_file:
            self.system_prompt = self._load_system_prompt(system_prompt_file)
        elif os.getenv("GEMINI_SYSTEM_PROMPT_FILE"):
            self.system_prompt = self._load_system_prompt(
                os.getenv("GEMINI_SYSTEM_PROMPT_FILE")
            )
        else:
            self.system_prompt = os.getenv("GEMINI_SYSTEM_PROMPT")

        # Initialize model
        self._llm = self._initialize_llm()

    def _load_system_prompt(self, file_path: str) -> Optional[str]:
        """Đọc system prompt từ file."""
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return f.read()
        except Exception as e:
            print(f"Không thể đọc file system prompt: {e}")
            return None

    def _initialize_llm(self) -> GoogleGenerativeAI:
        """Initialize Google Gemini model."""
        if not self.api_key:
            raise ValueError(
                "API key không được cung cấp và không tìm thấy trong biến môi trường GOOGLE_API_KEY"
            )

        # Configure safety_settings with the correct format
        safety_settings = {
            HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
        }

        return GoogleGenerativeAI(
            model=self.model_name,
            temperature=self.temperature,
            max_output_tokens=self.max_output_tokens,
            top_p=self.top_p,
            top_k=self.top_k,
            google_api_key=self.api_key,
            safety_settings=safety_settings,
        )

    def invoke(
        self, prompt: str, stop: Optional[List[str]] = None, **kwargs: Any
    ) -> str:
        """Gọi model với prompt."""
        if self.system_prompt:
            prompt = f"{self.system_prompt}\n\n{prompt}"

        return self._llm.invoke(prompt, stop=stop, **kwargs)

    def invoke_json(
        self,
        prompt: str,
        schema: Optional[Dict[str, Any]] = None,
        type_hint: Optional[type] = None,
        max_retries: int = 2,
        **kwargs: Any,
    ) -> Union[Dict[str, Any], T]:

        # Create prompt requesting JSON format response
        json_prompt = prompt
        if schema:
            json_prompt = f"""
Trả lời câu hỏi sau và đảm bảo kết quả trả về là một đối tượng JSON hợp lệ.
Tuân thủ chính xác schema sau:
{json.dumps(schema, indent=2, ensure_ascii=False)}

Câu hỏi: {prompt}

LƯU Ý QUAN TRỌNG: 
1. Chỉ trả về JSON, không kèm theo giải thích hoặc giới thiệu.
2. KHÔNG thêm comments (ghi chú) vào JSON.
3. Each field should appear only once in each object.
4. Đảm bảo JSON hợp lệ để có thể parse.
5. FOR IELTS READING EXAMS:
   - Mỗi passage PHẢI có CHÍNH XÁC 14 câu hỏi (5-4-5), không được ít hơn
   - Tính toán số từ chính xác cho mỗi passage (word_count)
   - Passage 1: 700-1000 từ (KHÔNG ĐƯỢC DƯỚI 700 từ)
   - Passage 2: 700-1200 từ (KHÔNG ĐƯỢC DƯỚI 700 từ)
   - Passage 3: 750-1500 từ (KHÔNG ĐƯỢC DƯỚI 750 từ)
   - Only create passages that the user specifically requests
"""
        else:
            json_prompt = f"""
Trả lời câu hỏi sau và đảm bảo kết quả trả về là một đối tượng JSON hợp lệ.

Câu hỏi: {prompt}

LƯU Ý QUAN TRỌNG: 
1. Chỉ trả về JSON, không kèm theo giải thích hoặc giới thiệu.
2. KHÔNG thêm comments (ghi chú) vào JSON.
3. Đảm bảo JSON hợp lệ để có thể parse.
"""

        retry_count = 0
        last_error = None
        result_text = ""

        while retry_count <= max_retries:
            try:
                # Gọi model
                response = self.invoke(json_prompt, **kwargs)
                
                # Xử lý kết quả, đảm bảo lấy phần JSON
                result_text = response.strip()

                # Xóa các ký tự markdown JSON nếu có
                if result_text.startswith("```json"):
                    result_text = result_text[7:]
                elif result_text.startswith("```"):
                    result_text = result_text[3:]
                if result_text.endswith("```"):
                    result_text = result_text[:-3]

                result_text = result_text.strip()

                # Xóa các comments nếu có
                result_text = re.sub(r"//.*", "", result_text)
                result_text = re.sub(r"/\*.*?\*/", "", result_text, flags=re.DOTALL)

                # Thử parse JSON
                json_result = json.loads(result_text)
                
                # Nếu thành công, trả về kết quả
                if type_hint:
                    from pydantic import parse_obj_as
                    return parse_obj_as(type_hint, json_result)
                return json_result
                
            except json.JSONDecodeError as e:
                last_error = e
                retry_count += 1
                
                # If error and retries remaining, simplify the prompt
                if retry_count <= max_retries:
                    print(f"JSON error, retrying {retry_count}/{max_retries}: {str(e)}")
                    
                    # Create a simpler prompt with clearer requirements about JSON syntax
                    json_prompt = f"""
I NEED YOU TO RETURN VALID JSON. Last time you created invalid JSON.

Specific error: {str(e)}

Please fix the error and return completely valid JSON. MAKE SURE TO CHECK JSON SYNTAX before responding.

Follow the schema:
{json.dumps(schema, indent=2, ensure_ascii=False) if schema else "Object JSON of your choice, as long as it is valid"}

Question: {prompt}

CHÚ Ý:
- CHỈ TRẢ VỀ JSON, không kèm theo lời giải thích
- KHÔNG thêm comment
- Kiểm tra CẨN THẬN cú pháp JSON
- All keys and values must have the correct format
- Đối với mảng và object, phải đóng mở ngoặc đúng cú pháp
- Các phần tử trong mảng phải phân tách bằng dấu phẩy
- Các cặp key-value phải phân tách bằng dấu phẩy
"""
                else:
                    raise ValueError(
                        f"Không thể parse JSON sau {max_retries} lần thử: {str(last_error)}\nNội dung trả về: {result_text}"
                    )
                    
        # If all retries have been used
        raise ValueError(
            f"Không thể parse JSON sau {max_retries} lần thử: {str(last_error)}\nNội dung trả về: {result_text}"
        )

    def create_chain(self, prompt_template: str, output_key: str = "text") -> LLMChain:
        """Create LLMChain with prompt template."""
        prompt = PromptTemplate.from_template(prompt_template)
        return LLMChain(llm=self._llm, prompt=prompt, output_key=output_key)

    def batch_predict(
        self,
        inputs: List[Dict[str, Any]],
        prompt_template: str,
        output_key: str = "text",
    ) -> List[str]:
        """Dự đoán hàng loạt với danh sách input."""
        chain = self.create_chain(prompt_template, output_key)
        results = []

        for input_data in inputs:
            try:
                result = chain.invoke(input_data)
                results.append(result[output_key])
            except Exception as e:
                results.append(f"Error: {str(e)}")

        return results

    @classmethod
    def from_defaults(cls):
        """Create instance with default configuration."""
        return cls()

    @classmethod
    def creative(cls, api_key: str = None):
        """Create instance with high creativity configuration."""
        return cls(temperature=0.9, top_p=0.98, top_k=50, api_key=api_key)

    @classmethod
    def precise(cls, api_key: str = None):
        """Create instance with high precision configuration."""
        return cls(temperature=0.2, top_p=0.85, top_k=20, api_key=api_key)

    @classmethod
    def with_system_prompt(
        cls, system_prompt_file: str = "system_prompt.md", api_key: str = None
    ):
        """Create instance with system prompt from file."""
        return cls(system_prompt_file=system_prompt_file, api_key=api_key)


if __name__ == "__main__":
    try:
        # Create LLM with system prompt from file
        llm = LLM.with_system_prompt()

        # SCHEMA 1: IELTS Reading Analysis
        ielts_reading_schema = {
            "type": "object",
            "properties": {
                "overall_score": {
                    "type": "number",
                    "description": "Điểm IELTS Reading dự đoán (thang điểm 0-9)",
                },
                "strengths": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Điểm mạnh của bài viết",
                },
                "weaknesses": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Điểm yếu của bài viết",
                },
                "passage_analysis": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "passage_number": {
                                "type": "integer",
                                "description": "Số thứ tự đoạn văn (1-3)",
                            },
                            "difficulty_level": {
                                "type": "string",
                                "enum": ["Dễ", "Trung bình", "Khó"],
                                "description": "Difficulty level",
                            },
                            "main_topic": {
                                "type": "string",
                                "description": "Main topic of the passage",
                            },
                            "question_types": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "Question types that may appear",
                            },
                            "vocabulary_level": {
                                "type": "string",
                                "enum": ["Cơ bản", "Trung cấp", "Nâng cao"],
                                "description": "Vocabulary level",
                            },
                            "suggested_time": {
                                "type": "integer",
                                "description": "Suggested time to complete (minutes)",
                            },
                        },
                    },
                },
                "improvement_suggestions": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Đề xuất cải thiện",
                },
            },
            "required": [
                "overall_score",
                "strengths",
                "weaknesses",
                "passage_analysis",
                "improvement_suggestions",
            ],
        }

        # SCHEMA 2: TOEIC Reading Analysis
        toeic_reading_schema = {
            "type": "object",
            "properties": {
                "estimated_score": {
                    "type": "integer",
                    "description": "Điểm TOEIC Reading dự đoán (thang điểm 5-495)",
                },
                "part5_analysis": {
                    "type": "object",
                    "properties": {
                        "grammar_focus": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Điểm ngữ pháp trọng tâm",
                        },
                        "vocabulary_level": {
                            "type": "string",
                            "enum": ["Cơ bản", "Trung cấp", "Nâng cao"],
                            "description": "Mức độ từ vựng",
                        },
                        "estimated_correct": {
                            "type": "integer",
                            "description": "Số câu dự đoán đúng (trên 30 câu)",
                        },
                        "challenging_areas": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Các lĩnh vực thách thức",
                        },
                    },
                },
                "part6_analysis": {
                    "type": "object",
                    "properties": {
                        "passage_types": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Các loại đoạn văn xuất hiện",
                        },
                        "grammar_focus": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Điểm ngữ pháp trọng tâm",
                        },
                        "estimated_correct": {
                            "type": "integer",
                            "description": "Số câu dự đoán đúng (trên 16 câu)",
                        },
                        "challenging_questions": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Các câu hỏi thách thức",
                        },
                    },
                },
                "part7_analysis": {
                    "type": "object",
                    "properties": {
                        "passage_types": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Các loại đoạn văn xuất hiện",
                        },
                        "question_types": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Question types that appear",
                        },
                        "estimated_correct": {
                            "type": "integer",
                            "description": "Số câu dự đoán đúng (trên 54 câu)",
                        },
                        "challenging_passages": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Các đoạn văn thách thức",
                        },
                    },
                },
                "improvement_suggestions": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Đề xuất cải thiện",
                },
            },
            "required": [
                "estimated_score",
                "part5_analysis",
                "part6_analysis",
                "part7_analysis",
                "improvement_suggestions",
            ],
        }

        # SCHEMA 3: General Paper to Exam Conversion
        paper_to_exam_schema = {
            "type": "object",
            "properties": {
                "exam_type": {
                    "type": "string",
                    "enum": ["IELTS", "TOEIC"],
                    "description": "Loại kỳ thi",
                },
                "input_text_analysis": {
                    "type": "object",
                    "properties": {
                        "word_count": {
                            "type": "integer",
                            "description": "Số từ trong văn bản",
                        },
                        "academic_level": {
                            "type": "string",
                            "enum": ["Cơ bản", "Trung cấp", "Nâng cao", "Học thuật"],
                            "description": "Cấp độ học thuật",
                        },
                        "main_topics": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Chủ đề chính",
                        },
                        "text_complexity": {
                            "type": "string",
                            "enum": ["Thấp", "Trung bình", "Cao"],
                            "description": "Độ phức tạp của văn bản",
                        },
                    },
                },
                "suitable_exam_parts": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "exam_part": {
                                "type": "string",
                                "description": "Phần thi phù hợp (vd: IELTS Reading Passage 2, TOEIC Part 7)",
                            },
                            "suitability_score": {
                                "type": "integer",
                                "minimum": 1,
                                "maximum": 10,
                                "description": "Điểm đánh giá sự phù hợp (1-10)",
                            },
                            "reason": {
                                "type": "string",
                                "description": "Lý do đánh giá sự phù hợp",
                            },
                        },
                    },
                },
                "suggested_questions": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "question_type": {
                                "type": "string",
                                "description": "Loại câu hỏi",
                            },
                            "sample_question": {
                                "type": "string",
                                "description": "Ví dụ câu hỏi",
                            },
                            "expected_difficulty": {
                                "type": "string",
                                "enum": ["Dễ", "Trung bình", "Khó"],
                                "description": "Độ khó dự kiến",
                            },
                        },
                    },
                },
                "conversion_recommendations": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Khuyến nghị chuyển đổi",
                },
            },
            "required": [
                "exam_type",
                "input_text_analysis",
                "suitable_exam_parts",
                "suggested_questions",
                "conversion_recommendations",
            ],
        }

        # Ví dụ sử dụng schema
        print("Ví dụ 1: Phân tích IELTS Reading:")

        ielts_result = llm.invoke_json(
            "Loại đề: IELTS Reading\nĐoạn văn: Global energy consumption has doubled since 1990. This trend is expected to continue as emerging economies develop further. Meanwhile, concerns about climate change have prompted a shift toward renewable energy sources. Wind and solar power have seen dramatic price decreases, making them competitive with fossil fuels in many markets. However, challenges remain in energy storage and grid integration. Some countries have made ambitious commitments to carbon neutrality, while others argue that economic development should take precedence over environmental concerns.",
            schema=ielts_reading_schema,
        )

        print(json.dumps(ielts_result, indent=2, ensure_ascii=False))

        print("\n\nVí dụ 2: Phân tích TOEIC Reading:")

        toeic_result = llm.invoke_json(
            "Loại đề: TOEIC Reading\nĐoạn văn: Attention all employees: The quarterly budget meeting scheduled for Friday, March 15, has been postponed until Monday, March 18, due to the CEO's unexpected business trip. Department heads are required to submit their financial reports to Ms. Johnson by Thursday at 5 PM. These reports should include current expenditures, projected costs for the next quarter, and any requests for additional funding. The meeting will be held in Conference Room A and is expected to last approximately two hours. Lunch will be provided. Contact the HR department if you have any questions regarding this matter.",
            schema=toeic_reading_schema,
        )

        print(json.dumps(toeic_result, indent=2, ensure_ascii=False))

        print("\n\nVí dụ 3: Chuyển đổi văn bản thành đề thi:")

        conversion_result = llm.invoke_json(
            "Loại đề: Chuyển đổi văn bản thành đề thi\nĐoạn văn: The automotive industry is undergoing a significant transformation with the rise of electric vehicles (EVs). Traditional automakers are investing billions in EV technology to compete with newer companies like Tesla. This shift is driven by environmental regulations, consumer preferences, and technological advancements in battery capacity. Meanwhile, infrastructure challenges remain, including the need for more charging stations and grid capacity upgrades. Governments worldwide are implementing incentives to accelerate EV adoption, such as tax credits and subsidies. Industry analysts predict that by 2030, electric vehicles could represent up to 40% of new car sales in major markets, signaling a fundamental change in transportation technology.",
            schema=paper_to_exam_schema,
        )

        print(json.dumps(conversion_result, indent=2, ensure_ascii=False))

    except Exception as e:
        print(f"Lỗi: {e}")
