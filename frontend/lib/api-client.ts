const API_BASE_URL = "https://www.codingwithdox.com:8080/app"

export interface ApiResponse {
  response: string
  reason: string
}

export interface User {
  name: string
  email: string
  session_id: string
  user_location_lat: string
  user_location_mag: string
  user_availability: string
}

export interface DistressSignal {
  user_location_lat: string
  user_location_mag: string
  got_help: number
  name: string
  session_id: string
}

class ApiClient {
  private async makeRequest(params: Record<string, any>): Promise<ApiResponse> {
    try {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
      const queryParams = new URLSearchParams(params).toString()
      const response = await fetch(`${API_BASE_URL}?${queryParams}`)

      // if (!response.ok) {
      //   throw new Error(`HTTP error! status: ${response.status}`)
      // }
      const data = await response.json()
      return data
    } catch (error) {
      console.error("API request failed:", error)
      return {
        response: "false",
        reason: "Network error or server unavailable",
      }
    }
  }

  async signUp(email: string, password: string, name?: string): Promise<ApiResponse> {
    const params: Record<string, any> = {
      request_type: "sign_up",
      email,
      password,
    }

    if (name) {
      params.name = name
    }

    return this.makeRequest(params)
  }

  async login(email: string, password: string): Promise<ApiResponse> {
    return this.makeRequest({
      request_type: "login",
      email,
      password,
    })
  }

  async updateLocation(email: string, sessionId: string, latitude: string, longitude: string): Promise<ApiResponse> {
    return this.makeRequest({
      request_type: "update_location",
      email,
      session_id: sessionId,
      user_location_lat: latitude,
      user_location_mag: longitude,
    })
  }

  async updateAvailability(email: string, sessionId: string, availability: string): Promise<ApiResponse> {
    return this.makeRequest({
      request_type: "update_availability",
      email,
      session_id: sessionId,
      user_availability: availability,
    })
  }
  async answerToDistress(sessionId: string):  Promise<ApiResponse> {
    return this.makeRequest({
      request_type: "answer_distress",
      session_id: sessionId,
    })
  }
  async checkRequestStatus(sessionId: string):  Promise<ApiResponse> {
    return this.makeRequest({
      request_type: "check_status",
      session_id: sessionId,
    })
  }
  async checkForDistress(): Promise<ApiResponse> {
    return this.makeRequest({
      request_type: "check_distress",
    })
  }

  async sendDistressSignal(
    email: string,
    sessionId: string,
    latitude: string,
    longitude: string,
    name: string,
  ): Promise<ApiResponse> {
    return this.makeRequest({
      request_type: "signal",
      email,
      session_id: sessionId,
      user_location_lat: latitude,
      user_location_mag: longitude,
      name,
    })
  }

  async removeDistressSignal(email: string, sessionId: string): Promise<ApiResponse> {
    return this.makeRequest({
      request_type: "remove_signal",
      email,
      session_id: sessionId,
    })
  }

  async respondToSignal(email: string, sessionId: string, signalSessionId: string): Promise<ApiResponse> {
    return this.makeRequest({
      request_type: "respond_signal",
      email,
      session_id: sessionId,
      signal_session_id: signalSessionId,
    })
  }
}

export const apiClient = new ApiClient()
