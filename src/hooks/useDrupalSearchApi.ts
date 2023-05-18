import { useEffect, useState } from "react";
import { useDrupalJsonApi } from "./useDrupalJsonApi";

export const useDrupalSearchApi = (index, includes = [], sortBy: string = '', paging = {
  offset: 0,
  limit: 10,
}) => {
  const jsonapi = useDrupalJsonApi();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState({});
  const [filters, setFilters] = useState();
  const [sort, setSort] = useState(sortBy);
  const [page, setPage] = useState(paging);
  const [total, setTotal] = useState(0);

  const search = async () => {
    setIsLoading(true);

    let params = {};

    if (includes && includes.length) {
      params['include'] = includes.join(",");
    }

    if (filters) {
      params['filter'] = filters;
    }

    if (sort) {
      params['sort'] = sort;
    }

    if (page) {
      params['page'] = page;
    }

    const response = await jsonapi.fetch(jsonapi.buildUrl(`/jsonapi/index/${index}`, params));
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