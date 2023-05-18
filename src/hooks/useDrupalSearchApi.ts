import { useEffect, useState } from "react";
import { useDrupalJsonApi } from "./useDrupalJsonApi";

type Paging = {
  offset: number;
  limit: number;
}

type Params = {
  include?: string;
  filter?: any;
  sort?: string;
  page?: Paging;
}

export const useDrupalSearchApi = (index: string, includes: string[] = [], sortBy: string = '', paging: Paging = {
  offset: 0,
  limit: 10,
}) => {
  const jsonapi = useDrupalJsonApi();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any>({});
  const [filters, setFilters] = useState<any>();
  const [sort, setSort] = useState<string>(sortBy);
  const [page, setPage] = useState<Paging>(paging);
  const [total, setTotal] = useState<number>(0);

  const search = async () => {
    setIsLoading(true);

    let params: Params = {};

    if (includes && includes.length) {
      params.include = includes.join(",");
    }

    if (filters) {
      params.filter = filters;
    }

    if (sort) {
      params.sort = sort;
    }

    if (page) {
      params.page = page;
    }

    const response: any = await jsonapi.fetch(jsonapi.buildUrl(`/jsonapi/index/${index}`, params));
    setTotal(response?.meta?.count || 0);
    setData(response.data);
    setIsLoading(false);
  }

  useEffect(() => {
    search();
  }, [filters, sort, page]);

  return {
    data,
    page,
    setPage,
    total,
    isLoading,
    sort,
    setSort,
    filters,
    setFilters
  }
};
