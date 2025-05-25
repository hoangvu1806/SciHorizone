import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';

export async function POST(
  req: NextRequest,
  context: { params: { sessionId: string } }
) {
  try {
    const sessionId = context.params.sessionId;
    const jsonData = await req.json();

    // Forward the request to the backend API
    const backendUrl = `${API_BASE_URL}${API_ENDPOINTS.GENERATE_EXAM(sessionId)}`;
    
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