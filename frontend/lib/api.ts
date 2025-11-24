export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  ENDPOINTS: {
    CHAT: '/ai-chat',
  },
  TIMEOUT: 30000, // 30 seconds
};

export interface ChatRequest {
  session_id: string;
  message: string;
}

export interface ChatResponse {
  session_id: string;
  reply: string;
  city: string | null;
  kids: number | null;
  housing: string | null;
  cars: number | null;
  score: number | null;
  monthly_estimate: number | null;
  range_low: number | null;
  range_high: number | null;
}

export async function sendChatMessage(
  sessionId: string,
  message: string
): Promise<ChatResponse> {
  const requestBody = {
    session_id: sessionId,
    message,
  };

  console.log('🚀 API Request:', {
    url: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHAT}`,
    method: 'POST',
    body: requestBody,
  });

  const startTime = Date.now();

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHAT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const duration = Date.now() - startTime;

    console.log('📡 API Response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      duration: `${duration}ms`,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:', errorText);
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log('✅ API Success:', {
      city: data.city,
      monthly_estimate: data.monthly_estimate,
      score: data.score,
      reply: data.reply?.substring(0, 100) + '...',
    });

    return data;
  } catch (error) {
    console.error('💥 API Error:', error);
    throw error;
  }
}
