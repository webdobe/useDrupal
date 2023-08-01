import useDrupal from "./useDrupal";
import { AxiosResponse, AxiosError } from "axios";
import {createUrl, getQueryParams, normalize, parseQueryParams} from "../helpers";
import {useEffect, useState} from "react";
import {useDrupalCsrfToken} from "./useDrupalCsrfToken";

interface ClientConfig {
  headers?: any;
}

export interface RestApiResponse<T = unknown> {
  data?: any;
  error?: any;
}

export interface RestApiError extends Omit<AxiosError, 'response'> {
  response?: {
    data?: {
      message: string
    };
  };
}

export type RestApiPaging = {
  offset: number;
  limit: number;
}


export type FilterValue = { value: string; operator: string };

export type RestApiFilterObject = {
  [key: string]: number | string | string[] | FilterValue
};

export type RestApiParams = {
  fields?: string;
  include?: string;
  filter?: RestApiFilterObject;
  sort?: string;
  page?: RestApiPaging;
}


const defaultParams: RestApiParams = {

};

export const setRestApiUrlParams = (defaultParams: RestApiParams) => {
  const params = parseQueryParams(getQueryParams());
  return {...defaultParams, ...params};
}

const useDrupalRestApi = (endpoint: string = '', initialQueryParams: RestApiParams = defaultParams, clientConfig: ClientConfig = {}) => {
  let controller = {
    [endpoint]: new AbortController()
  };
  const { client } = useDrupal();
  const [csrfToken] = useDrupalCsrfToken();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any>([]);
  const [total, setTotal] = useState<number>(0);
  const [queryParams, setQueryParams] = useState<RestApiParams>(initialQueryParams);

  let config: any = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  };

  if (csrfToken) {
    config.headers['X-CSRF-Token'] = csrfToken;
  }

  if (clientConfig) {
    config = { ...config, ...clientConfig };
  }

  const getData = async <T>(ep: string, qp = {}) => {
    const response = await fetch(ep, qp);
    setData(response.data);
  }

  const fetch = async <T>(ep: string, qp = {}, fetchConfig = {}): Promise<RestApiResponse<T>> => {
    if (controller[ep]) {
      controller[ep].abort();
    }
    controller[ep] = new AbortController();
    try {
      setIsLoading(true);
      const url = Object.keys(qp).length ? createUrl(ep, qp) : ep;
      const getConfig = {...config, ...fetchConfig, ...{signal: controller[ep].signal}};
      const response: AxiosResponse = await client.get(`${url}`, getConfig);
      setIsLoading(false);
      return { data: response.data };
    } catch(e) {
      throw e;
    }
  };

  const post = async <T>(ep: string, postData: any, postConfig = {}): Promise<RestApiResponse<T>> => {
    try {
      const response = await client.post(`${ep}`, postData, { ...config, ...postConfig });
      const responseData: T = response.data;
      return { data: responseData };
    } catch(e) {
      throw e;
    }
  };

  const patch = async <T>(ep: string, patchData: any, patchConfig = {}): Promise<RestApiResponse<T>> => {
    try {
      const response = await client.patch(`${ep}`, patchData, { ...config, ...patchConfig });
      const responseData: T = response.data;
      return { data: responseData };
    } catch(e) {
      throw e;
    }
  };

  const deleteResource = async <T>(ep: string, deleteData: any, deleteConfig = {}): Promise<RestApiResponse<T>> => {
    try {
      const response = await client.delete(`${ep}`, { ...{ data: deleteData }, ...{ ...config, ...deleteConfig } });
      const responseData: T = response.data;
      return { data: responseData };
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

export default useDrupalRestApi;
