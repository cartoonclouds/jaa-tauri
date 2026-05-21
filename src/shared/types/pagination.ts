export interface DatatablePageQuery {
  page: number;
  rows: number;
  search?: string;
}

export interface DatatablePageResult<TItem> {
  items: TItem[];
  total: number;
}
