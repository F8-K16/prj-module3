export interface ApiErrorResponse {
  success: boolean;
  message: string;
}

export interface ApiError {
  message: string;
  status?: number;
}
