import { useEffect, useState, useRef } from "react";
import { useDrupalJsonApi } from "./useDrupalJsonApi";
import { isUuid } from "../helpers";
import DrupalEntity from "../service/DrupalEntity";

export const useDrupalProduct = (path, includes = []) => {
  const jsonapi = useDrupalJsonApi();
  const [bundle, setBundle] = useState();
  const [entity, setEntity] = useState(null)
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const createUrl = () => {
    let url = `/jsonapi/products/${bundle}`

    if (isUuid(path[1])) {
      url += `/${path[1]}${includes.length ? `?include=${includes.join(",")}` : ''}`;
    } else {
      const parts = [...path];
      parts.shift();
      const fullPath = parts.join('/');
      url += `?filter[${process.env.NEXT_PUBLIC_FIELDABLE_PATH}]=/${fullPath}${includes.length ? `&include=${includes.join(",")}` : ''}`;
    }

    return url;
  }

  const load = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const url = createUrl();
      const response = await jsonapi.fetch(url);
      setEntity(new DrupalEntity('', `product--${bundle}`, response.data));
      setIsLoading(false);
    } catch (err) {
      setError(err);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (bundle) {
      load();
    }
  }, [bundle])

  useEffect(() => {
    if (path && path[0]) {
      setBundle(path[0]);
    }
  }, [path])

  return {
    isLoading,
    product: entity,
    error
  }
};