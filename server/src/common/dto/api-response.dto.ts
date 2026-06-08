export class ApiResponseDto<T = any> {
  code: number;
  message: string;
  data: T;

  static success<T>(data: T, message = 'success'): ApiResponseDto<T> {
    const response = new ApiResponseDto<T>();
    response.code = 200;
    response.message = message;
    response.data = data;
    return response;
  }

  static error(message: string, code = 400): ApiResponseDto<null> {
    const response = new ApiResponseDto<null>();
    response.code = code;
    response.message = message;
    response.data = null;
    return response;
  }
}

export class PaginatedResponseDto<T = any> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}
