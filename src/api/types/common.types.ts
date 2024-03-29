export interface PaginationQuery {
  sort: string;
  skip: number;
  limit: number;
}

export interface ResponsePagination<T> {
  items: T[];
  totalCount: number;
}

export interface ResponseSuccess {
  message?: string;
}

export interface NetworkAddress {
  ip: string;
  port: string;
}
