
// Service to communicate with the FastAPI Backend (Python)
const API_BASE_URL = 'http://localhost:8000/api/v1';

export interface BackendStatusResponse {
  status: string;
  progress?: number;
  message?: string;
  manim_code?: string;
  script?: any;
  assets?: {
    math_video_url?: string;
    final_video_url?: string;
  };
  error?: string;
}

export const startBackendPipeline = async (topic: string): Promise<{ taskId: string; status: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/pipeline/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic }),
    });

    if (!response.ok) {
      throw new Error(`Backend API Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to start pipeline:", error);
    throw error;
  }
};

export const getBackendStatus = async (taskId: string): Promise<BackendStatusResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/pipeline/status/${taskId}`);
    
    if (!response.ok) {
      throw new Error(`Backend Status Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to get status:", error);
    throw error;
  }
};
