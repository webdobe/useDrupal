import { useState, useEffect } from 'react';
import { useDrupal } from "./useDrupal";
import axios from "axios";
import { normalize } from "../helpers";

export const useDrupalJsonApi = (clientConfig = {}) => {
  const { client } = useDrupal();

  let config = {
    headers: {
      'Content-Type': 'application/vnd.api+json',
      'Accept': 'application/vnd.api+json',
    }
  };

  if (clientConfig) {
    config = {...config, ...clientConfig};
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

  const fetch = async (endpoint, queryParams = null) => {
    try {
      const url = queryParams ? buildUrl(endpoint, queryParams) : endpoint;
      const response = await client.get(`${url}`, config);
      console.log(response);
      return { data: normalize(response.data), meta: response?.data?.meta, links: response?.data?.links };
    } catch(e) {
      console.log(e);
      return { error: e };
    }
  };

  const post = async (endpoint, postData) => {
    try {
      const { data } = await client.post(`${endpoint}`, postData, config);
      return { data: normalize(data) };
    } catch(e) {
      console.log(e);
      return { error: e };
    }
  };

  const patch = async (endpoint, patchData) => {
    try {
      const { data } = await client.patch(`${endpoint}`, patchData, config);
      return { data: normalize(data) };
    } catch(e) {
      console.log(e);
      return { error: e };
    }
  };

  const deleteResource = async (endpoint, deleteData) => {
    try {
      const { data } = await client.delete(`${endpoint}`, { ...{data: deleteData}, ...config });
      return { data: normalize(data) };
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