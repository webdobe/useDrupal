import useDrupal from "./useDrupal";
import { AxiosResponse, AxiosError } from "axios";
import { normalize } from "../helpers";

interface ClientConfig {
  headers?: any;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  meta?: any;
  links?: any;
  error?: any;
}

export interface ApiError extends Omit<AxiosError, 'response'> {
  response?: {
    data?: {
      message: string
    };
  };
}

export const useDrupalJsonApi = (clientConfig: ClientConfig = {}) => {
  const { client } = useDrupal();

  let config = {
    headers: {
      'Content-Type': 'application/vnd.api+json',
      'Accept': 'application/vnd.api+json',
    },
  };

  if (clientConfig && clientConfig.headers) {
    config = { ...config, headers: { ...config.headers, ...clientConfig.headers } };
  }

  const buildUrl = (endpoint: string, queryParams: Record<string, any>): string => {
    let flatParams: string[] = [];

    function encodePart(base: string, obj: Record<string, any>): void {
      Object.entries(obj).forEach(([key, value]) => {
        let newKey = base ? `${base}[${encodeURIComponent(key)}]` : encodeURIComponent(key);

        if (typeof value === 'object' && value !== null) {
          encodePart(newKey, value as Record<string, any>);
        } else {
          flatParams.push(`${newKey}=${encodeURIComponent(value)}`);
        }
      });
    }

    encodePart('', queryParams);

    return `${endpoint}?${flatParams.join('&')}`;
  };

  const fetch = async <T>(endpoint: string, queryParams = {}): Promise<ApiResponse<T>> => {
    try {
      const url = queryParams ? buildUrl(endpoint, queryParams) : endpoint;
      const response: AxiosResponse = await client.get(`${url}`, config);
      const responseData: T = response.data;
      return { data: normalize(responseData), meta: response?.data?.meta, links: response?.data?.links };
    } catch(e) {
      const apiError = e as ApiError;
      return { error: apiError.response?.data || apiError };
    }
  };

  const post = async <T>(endpoint: string, postData: any): Promise<ApiResponse<T>> => {
    try {
      const response = await client.post(`${endpoint}`, postData, config);
      const responseData: T = response.data;
      console.log(response);
      return { data: normalize(responseData) };
    } catch(e) {
      console.log(e);
      return { error: e };
    }
  };

  const patch = async <T>(endpoint: string, patchData: any): Promise<ApiResponse<T>> => {
    try {
      const response = await client.patch(`${endpoint}`, patchData, config);
      const responseData: T = response.data;
      console.log(response);
      return { data: normalize(responseData) };
    } catch(e) {
      console.log(e);
      return { error: e };
    }
  };

  const deleteResource = async <T>(endpoint: string, deleteData: any): Promise<ApiResponse<T>> => {
    try {
      const response = await client.delete(`${endpoint}`, { ...{ data: deleteData }, ...config });
      const responseData: T = response.data;
      console.log(response);
      return { data: normalize(responseData) };
    } catch(e) {
      console.log(e);
      return { error: e };
    }
  };

  return {
    buildUrl,
    fetch,
    post,
    patch,
    delete: deleteResource,
  };
};
