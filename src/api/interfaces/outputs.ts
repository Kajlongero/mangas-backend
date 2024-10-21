export interface PaginatedOutput<T> {
  page: number;
  limit: number;
  elements: T;
  totalElements: number;
  originalUrl: string;
}
