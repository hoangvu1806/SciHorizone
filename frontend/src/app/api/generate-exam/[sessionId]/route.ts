import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';

export async function POST(request: NextRequest) {
  try {
    // Extract sessionId from URL path
    const url = request.url;
    const sessionId = url.split('/').pop() || '';
    
    const jsonData = await request.json();

    // Forward the request to the backend API
    // Sử dụng URL hoàn chỉnh đến host.docker.internal thay vì đường dẫn tương đối
    const backendUrl = `http://host.docker.internal:8088${API_ENDPOINTS.GENERATE_EXAM(sessionId)}`;
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jsonData),
    });
    
    // Forward the response from the backend
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { success: false, message: errorData.detail || 'Failed to generate exam' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error generating exam:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate exam' },
      { status: 500 }
    );
  }
} 