export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export async function handleApiResponse<T>(response: Response): Promise<{
  success: boolean;
  data?: T;
  pagination?: Pagination;
  error?: string;
}> {
  const data = await response.json();
  
  if (!response.ok) {
    return {
      success: false,
      error: data.error || `Request failed with status ${response.status}`
    };  
  }

  return {
    success: data.success,
    data: data.data,
    pagination: data.pagination,
    error: data.error
  };
}