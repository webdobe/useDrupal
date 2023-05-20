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

const defaultParams: Params = {
  include: '',
  filter: {},
  sort: '',
  page: {
    offset: 0,
    limit: 10,
  }
};

export const useDrupalSearchApi = (index: string, initialQueryParams: Params = defaultParams) => {
  const jsonapi = useDrupalJsonApi();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any>({});
  const [total, setTotal] = useState<number>(0);
  const [queryParams, setQueryParams] = useState<Params>(initialQueryParams);

  const search = async () => {
    setIsLoading(true);

    const response: any = await jsonapi.fetch(jsonapi.buildUrl(`/jsonapi/index/${index}`, queryParams));
    setTotal(response?.meta?.count || 0);
    setData(response.data);
    setIsLoading(false);
  }

  useEffect(() => {
    search();
  }, [queryParams]);

  return {
    data,
    isLoading,
    total,
    queryParams,
    setQueryParams,
  }
};
