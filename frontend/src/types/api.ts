export type ApiSuccess<T> = {
  success: true;
  data: T;
  message?: string;
};

export type ApiListSuccess<T> = {
  success: true;
  data: T[];
  pagination: Pagination;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type ApiErrorBody = {
  success?: false;
  message?: string;
};
