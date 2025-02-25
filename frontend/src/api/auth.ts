// src/api/auth.ts
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

export async function login(email: string, password: string) {
  try {
    console.log("Sending login request:", { email, password });
    const response = await axios.post(`${API_URL}/login/`, { email, password });
    return response.data;
  } catch (error: any) {
    console.error("Login error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.detail || "Login failed");
  }
}

export async function register(userData: { username: string; email: string; password: string }) {
  try {
    const response = await axios.post(`${API_URL}/register/`, userData);
    return response.data;
  } catch (error: any) {
    console.error("Registration error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.detail || "Registration failed");
  }
}

export async function getUser(accessToken: string) {
  try {
    const response = await axios.get(`${API_URL}/user/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  } catch (error: any) {
    console.error("Get user error:", error.response?.data || error.message);
    throw new Error("Failed to fetch user data.");
  }
}

export async function logout(accessToken: string, refreshToken: string) {
  try {
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }
    const response = await axios.post(`${API_URL}/logout/`, { refresh: refreshToken }, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    console.log("Logout response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Logout error:", error.response?.data || error.message);
    throw new Error("Logout failed. Please try again.");
  }
}