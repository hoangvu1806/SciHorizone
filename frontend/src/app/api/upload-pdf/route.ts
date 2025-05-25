import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';

export async function POST(req: NextRequest) {
  try {
    // Forward the request to the backend API
    const formData = await req.formData();
    
    // Kiểm tra và log các trường dữ liệu để debug
    console.log('FormData keys:', Array.from(formData.keys()));
    
    // Sử dụng localhost vì container sẽ chạy với tùy chọn --network=host
    const backendUrl = `http://localhost:8088${API_ENDPOINTS.UPLOAD_PDF}`;
    
    // Không thay đổi formData, chuyển tiếp nguyên vẹn
    const response = await fetch(backendUrl, {
      method: 'POST',
      body: formData,
    });
    
    // Forward the response from the backend
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error from backend:', errorData);
      return NextResponse.json(
        { success: false, message: errorData.detail || 'Failed to process PDF upload' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error processing PDF upload:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process PDF upload' },
      { status: 500 }
    );
  }
} 