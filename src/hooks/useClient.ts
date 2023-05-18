// Import required libraries
import axios, { AxiosRequestConfig } from "axios";
import { normalize } from "../helpers";
import { useDrupal } from "./useDrupal";

// Define custom hook for API client
export const useClient = () => {
  const {config} = useDrupal();

  // Initialize client object
  let client: {
    fetch: (url: string, config?: AxiosRequestConfig) => Promise<any>;
    patch: (url: string, data?: any, config?: AxiosRequestConfig) => Promise<any>;
    post: (url: string, data?: any, config?: AxiosRequestConfig) => Promise<any>;
    delete: (url: string, data?: any, config?: AxiosRequestConfig) => Promise<any>;
  } = {
    fetch: function (url: string, config?: AxiosRequestConfig<any>): Promise<any> {
      throw new Error("Function not implemented.");
    },
    patch: function (url: string, data?: any, config?: AxiosRequestConfig<any>): Promise<any> {
      throw new Error("Function not implemented.");
    },
    post: function (url: string, data?: any, config?: AxiosRequestConfig<any>): Promise<any> {
      throw new Error("Function not implemented.");
    },
    delete: function (url: string, data?: any, config?: AxiosRequestConfig<any>): Promise<any> {
      throw new Error("Function not implemented.");
    }
  };

  /**
   * Fetch data from the given URL using axios GET request
   * @param {string} url - The URL to fetch data from
   * @param {AxiosRequestConfig} [config] - Optional axios request configuration
   * @returns {Promise<any>} - The response data
   */
  client.fetch = async (url: string, RequestConfig?: AxiosRequestConfig) => {
    try {
      const { data } = await axios.get(`${config.baseUrl}${url}`, RequestConfig);
      return { data: normalize(data) };
    } catch(e) {
      console.log(e);
      return { error: e };
    }
  };

  /**
   * Update data at the given URL using axios PATCH request
   * @param {string} url - The URL to update data at
   * @param {any} [patchData] - The data to update
   * @param {AxiosRequestConfig} [config] - Optional axios request configuration
   * @returns {Promise<any>} - The response data
   */
  client.patch = async (url: string, patchData?: any, RequestConfig?: AxiosRequestConfig) => {
    try {
      const { data } = await axios.patch(`${config.baseUrl}${url}`, patchData, RequestConfig);
      return { data: normalize(data) };
    } catch(e) {
      console.log(e);
      return { error: e };
    }
  };

  /**
   * Create new data at the given URL using axios POST request
   * @param {string} url - The URL to create data at
   * @param {any} [postData] - The data to create
   * @param {AxiosRequestConfig} [config] - Optional axios request configuration
   * @returns {Promise<any>} - The response data
   */
  client.post = async (url: string, postData?: any, RequestConfig?: AxiosRequestConfig) => {
    try {
      const { data } = await axios.post(`${config.baseUrl}${url}`, postData, RequestConfig);
      return { data: normalize(data) };
    } catch(e) {
      console.log(e);
      return { error: e };
    }
  };

  /**
   * Delete data at the given URL using axios DELETE request
   * @param {string} url - The URL to delete data at
   * @param {any} [deleteData] - Optional data to include in the request
   * @param {AxiosRequestConfig} [config] - Optional axios request configuration
   * @returns {Promise<any>} - The response data
   */
  client.delete = async (url: string, deleteData?: any, RequestConfig?: AxiosRequestConfig) => {
    try {
      const { data } = await axios.delete(`${config.baseUrl}${url}`, { ...{data: deleteData}, ...RequestConfig });
      return { data: normalize(data) };
    } catch(e) {
      console.log(e);
      return { error: e };
    }
  };

  // Return the client object
  return client;
};