import useDrupal from "./useDrupal";
import { AxiosResponse, AxiosError } from "axios";
import {createUrl, getQueryParams, normalize, parseQueryParams} from "../helpers";
import {useEffect, useState} from "react";
import {useDrupalCsrfToken} from "./useDrupalCsrfToken";

interface ClientConfig {
  headers?: any;
}

export interface JsonApiResponse<T = unknown> {
  data?: T;
  meta?: any;
  links?: any;
  error?: any;
}

export interface JsonApiError extends Omit<AxiosError, 'response'> {
  response?: {
    data?: {
      message: string
    };
  };
}

export type JsonApiPaging = {
  offset: number;
  limit: number;
}

export type FilterValue = { value: string; operator: string };
export type GroupConjunction = { group: { conjunction: string } };
export type Condition = { condition: { operator: string; value: string; path: string; memberOf?: string } };

export type JsonApiFilterObject = {
  [key: string]: number | string | string[] | FilterValue | GroupConjunction | Condition
};

export type JsonApiFieldsObject = {
  [key: string]: string
};

export type JsonApiParams = {
  fields?: string | JsonApiFieldsObject;
  include?: string;
  filter?: JsonApiFilterObject;
  sort?: string;
  page?: JsonApiPaging;
}


const defaultParams: JsonApiParams = {
  filter: {},
  fields: '',
  include: '',
  sort: '',
  page: {
    offset: 0,
    limit: 10,
  }
};

export const setJsonApiUrlParams = (defaultParams: JsonApiParams) => {
  const params = parseQueryParams(getQueryParams());
  return {...defaultParams, ...params};
}

const useDrupalJsonApi = (endpoint: string = '', initialQueryParams: JsonApiParams = defaultParams, clientConfig: ClientConfig = {}) => {
  let controller = {
    [endpoint]: new AbortController()
  };
  const { client } = useDrupal();
  const [csrfToken] = useDrupalCsrfToken();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any>([]);
  const [total, setTotal] = useState<number>(0);
  const [queryParams, setQueryParams] = useState<JsonApiParams>(initialQueryParams);

  let config = {
    headers: {
      'Content-Type': 'application/vnd.api+json',
      'Accept': 'application/vnd.api+json',
      'X-CSRF-Token': csrfToken,
    },
  };

  if (clientConfig) {
    config = { ...config, ...clientConfig };
  }

  const getData = async <T>(ep: string, qp = {}) => {
    const response = await fetch(ep, qp);
    setTotal(response.meta?.count || 0);
    setData(response.data);
  }

  const fetch = async <T>(ep: string, qp = {}, fetchConfig = {}): Promise<JsonApiResponse<T>> => {
    if (controller[ep]) {
      controller[ep].abort();
    }
    controller[ep] = new AbortController();
    try {
      setIsLoading(true);
      const url = Object.keys(qp).length ? createUrl(ep, qp) : ep;
      const getConfig = {...config, ...fetchConfig, ...{signal: controller[ep].signal}};
      const response: AxiosResponse = await client.get(`${url}`, getConfig);
      const normalizedData = response.data ? normalize(response.data) : {};
      setIsLoading(false);
      return { data: normalizedData, meta: response?.data?.meta, links: response?.data?.links };
    } catch(e) {
      throw e;
    }
  };

  const post = async <T>(ep: string, postData: any, postConfig = {}): Promise<JsonApiResponse<T>> => {
    try {
      const response = await client.post(`${ep}`, postData, { ...config, ...postConfig });
      const responseData: T = response.data;
      return { data: normalize(responseData) };
    } catch(e) {
      throw e;
    }
  };

  const patch = async <T>(ep: string, patchData: any, patchConfig = {}): Promise<JsonApiResponse<T>> => {
    try {
      const response = await client.patch(`${ep}`, patchData, { ...config, ...patchConfig });
      const responseData: T = response.data;
      return { data: normalize(responseData) };
    } catch(e) {
      throw e;
    }
  };

  const deleteResource = async <T>(ep: string, deleteData: any, deleteConfig = {}): Promise<JsonApiResponse<T>> => {
    try {
      const response = await client.delete(`${ep}`, { ...{ data: deleteData }, ...{ ...config, ...deleteConfig } });
      const responseData: T = response.data;
      return { data: normalize(responseData) };
    } catch(e) {
      throw e;
    }
  };

  useEffect(() => {
    if (endpoint) {
      getData(endpoint, queryParams);
    }
    return () => {
      controller[endpoint].abort();
    }
  }, [queryParams]);

  return {
    isLoading,
    data,
    total,
    queryParams,
    setQueryParams,
    fetch,
    post,
    patch,
    delete: deleteResource,
  };
};

export default useDrupalJsonApi;
