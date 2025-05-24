#!/usr/bin/env python3
import os
import sys
import requests
import urllib.parse
import re
from typing import Optional, Dict, Any, Union

class PDFExtractor:
    """
    Class thực hiện việc chuyển đổi PDF thành Markdown thông qua docling-serve.
    Cung cấp các phương thức để trích xuất, làm sạch và lưu nội dung.
    """
    
    DEFAULT_DOCLING_URL = "http://localhost:5001/v1alpha/convert/file"
    
    def __init__(self, docling_url: str = None):
        """
        Khởi tạo đối tượng PDFExtractor.
        
        Args:
            docling_url: URL của docling-serve, mặc định là http://localhost:5001/v1alpha/convert/file
        """
        self.docling_url = docling_url or self.DEFAULT_DOCLING_URL
        self.markdown_content = None
        self.source_path = None
        self.clean_images = True
        self.use_fallback = False  # Sử dụng phương thức dự phòng nếu docling-serve không khả dụng
    
    def extract_from_file(self, file_path: str) -> str:
        self.source_path = file_path
        if not os.path.isfile(file_path):
            raise FileNotFoundError(f"Không tìm thấy file: {file_path}")
        
        with open(file_path, "rb") as f:
            files = {
                "files": (os.path.basename(file_path), f, "application/pdf")
            }
            try:
                print("pdf_extractor: Đang trích xuất nội dung từ PDF...")
                self.markdown_content = self._send_request(files)
            except RuntimeError as e:
                print("pdf_extractor: " + str(e))
                if "Lỗi kết nối đến docling-serve" in str(e) and not self.use_fallback:
                    print("pdf_extractor: Docling-serve không khả dụng, đang sử dụng phương thức dự phòng...")
                    self.use_fallback = True
                    self.markdown_content = self._extract_text_fallback(file_path)
                else:
                    raise e
            
        return self.markdown_content
    
    def _extract_text_fallback(self, file_path: str) -> str:
        extracted_text = ""
        
        try:
            import PyPDF2
            with open(file_path, 'rb') as f:
                pdf_reader = PyPDF2.PdfReader(f)
                for page_num in range(len(pdf_reader.pages)):
                    page = pdf_reader.pages[page_num]
                    extracted_text += page.extract_text() + "\n\n"
                
                if extracted_text:
                    return f"# Extracted content\n\n{extracted_text}"
        except ImportError:
            pass
        except Exception as e:
            print(f"PyPDF2 extraction failed: {str(e)}")
        
        # Thử với pdfplumber
        try:
            import pdfplumber
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    text = page.extract_text()
                    if text:
                        extracted_text += text + "\n\n"
                
                if extracted_text:
                    return f"# Extracted content\n\n{extracted_text}"
        except ImportError:
            pass
        except Exception as e:
            print(f"pdfplumber extraction failed: {str(e)}")
        
        try:
            import textract
            extracted_text = textract.process(file_path, method='pdfminer').decode('utf-8')
            if extracted_text:
                return f"# Extracted content\n\n{extracted_text}"
        except ImportError:
            pass
        except Exception as e:
            print(f"textract extraction failed: {str(e)}")
        
        # Nếu tất cả phương pháp đều thất bại
        if not extracted_text:
            raise RuntimeError("Không thể trích xuất nội dung từ PDF. docling-serve không khả dụng và các phương pháp dự phòng đều thất bại.")
            
        return extracted_text
    
    def extract_from_url(self, url: str) -> str:
        self.source_path = url
        files = {
            "url": (None, url)
        }
        
        try:
            self.markdown_content = self._send_request(files)
        except RuntimeError as e:
            if "Lỗi kết nối đến docling-serve" in str(e) and not self.use_fallback:
                print("Docling-serve không khả dụng, đang tải PDF từ URL và sử dụng phương thức dự phòng...")
                self.use_fallback = True
                
                # Tải PDF từ URL
                try:
                    temp_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "temp_download.pdf")
                    r = requests.get(url, stream=True)
                    r.raise_for_status()
                    
                    with open(temp_file, 'wb') as f:
                        for chunk in r.iter_content(chunk_size=8192):
                            f.write(chunk)
                    
                    # Trích xuất nội dung từ file tạm
                    self.markdown_content = self._extract_text_fallback(temp_file)
                    
                    # Xóa file tạm
                    if os.path.exists(temp_file):
                        os.remove(temp_file)
                    
                except Exception as dl_error:
                    raise RuntimeError(f"Không thể tải PDF từ URL: {str(dl_error)}")
            else:
                raise e
        
        return self.markdown_content
    
    def _send_request(self, files: Dict[str, Any]) -> str:
        data = {
            "output_formats": "md"
        }
        try:
            resp = requests.post(self.docling_url, files=files, data=data, timeout=180)  # Thêm timeout
            resp.raise_for_status()
            result = resp.json()

            md = None
            if "document" in result:
                md = result["document"].get("md_content")
            else:
                md = result.get("md_content")
            
            if not md:
                raise RuntimeError("pdf_extractor: Không nhận được nội dung Markdown từ server. Response keys: {list(result.keys())}")
            
            return md
        except requests.RequestException as e:
            raise RuntimeError(f"pdf_extractor: Lỗi kết nối đến docling-serve: {str(e)}")
    
    def clean_base64_images(self, min_length: int = 100) -> str:
        if not self.markdown_content:
            raise ValueError("pdf_extractor: Chưa có nội dung Markdown để làm sạch. Hãy trích xuất nội dung trước.")
        
        pattern = rf'!\[.*?\]\(data:image\/[^;]+;base64,[a-zA-Z0-9+/=]{{{min_length},}}\)'
        self.markdown_content = re.sub(pattern, '![Ảnh đã được loại bỏ để giảm kích thước file]', self.markdown_content)
        
        return self.markdown_content
    
    def set_clean_images(self, clean: bool) -> None:
        self.clean_images = clean
    
    def get_output_filename(self) -> str:
        if not self.source_path:
            raise ValueError("pdf_extractor: Chưa có nguồn dữ liệu. Hãy gọi extract_from_file hoặc extract_from_url trước.")
        
        if self.source_path.startswith(("http://", "https://")):
            parsed_url = urllib.parse.urlparse(self.source_path)
            file_name = os.path.basename(parsed_url.path)
            if not file_name or "." not in file_name:
                file_name = parsed_url.hostname.replace(".", "_") + ".pdf"
        else:
            file_name = os.path.basename(self.source_path)
        base_name, _ = os.path.splitext(file_name)
        return f"{base_name}.md"
    
    def save_markdown(self, output_path: Optional[str] = None) -> str:
        if not self.markdown_content:
            raise ValueError("Chưa có nội dung Markdown để lưu. Hãy trích xuất nội dung trước.")
        
        # Nếu không chỉ định output_path, sử dụng tên file mặc định
        if not output_path:
            output_path = self.get_output_filename()
        
        # Làm sạch ảnh base64 nếu tùy chọn được bật
        if self.clean_images:
            self.clean_base64_images()
        
        # Lưu nội dung Markdown vào file
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(self.markdown_content)
        
        return output_path
    
    def process(self, source: str, output_path: Optional[str] = None, clean_images: bool = True) -> str:
        self.set_clean_images(clean_images)
        
        if source.startswith(("http://", "https://")):
            self.extract_from_url(source)
        else:
            self.extract_from_file(source)
        
        return self.save_markdown(output_path)


def main():
    """Hàm main để chạy từ dòng lệnh"""
    if len(sys.argv) < 2:
        print("Usage: python pdf_extractor.py <file_path_or_url> [output_path]")
        sys.exit(1)

    try:
        source = sys.argv[1]
        output_path = sys.argv[2] if len(sys.argv) > 2 else None
        
        extractor = PDFExtractor()
        saved_path = extractor.process(source, output_path)
        
        print(f"Đã lưu nội dung Markdown vào file: {saved_path}")
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main()
