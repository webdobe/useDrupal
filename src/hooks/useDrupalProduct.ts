import { useEffect, useState, useRef } from "react";
import { useDrupalJsonApi } from "./useDrupalJsonApi";
import { isUuid } from "../helpers";
import DrupalEntity, {IEntityData} from "../service/DrupalEntity";

type ProductPath = string[];
type Includes = string[];

interface Product {
  isLoading: boolean;
  product: DrupalEntity | null;
  error: Error | null;
}

export const useDrupalProduct = (path: ProductPath, includes: Includes = []): Product => {
  const jsonapi = useDrupalJsonApi();
  const [bundle, setBundle] = useState<string | null>(null);
  const [entity, setEntity] = useState<DrupalEntity | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createUrl = (): string => {
    let url = `/jsonapi/products/${bundle}`;

    if (isUuid(path[1])) {
      url += `/${path[1]}${includes.length ? `?include=${includes.join(",")}` : ''}`;
    } else {
      const parts = [...path];
      parts.shift();
      const fullPath = parts.join('/');
      url += `?filter[${process.env.NEXT_PUBLIC_FIELDABLE_PATH}]=/${fullPath}${includes.length ? `&include=${includes.join(",")}` : ''}`;
    }

    return url;
  };

  const load = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const url = createUrl();
      const {data} = await jsonapi.fetch(url);

      setEntity(new DrupalEntity('', `product--${bundle}`, data as IEntityData));
      setIsLoading(false);
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (bundle) {
      load();
    }
  }, [bundle]);

  useEffect(() => {
    if (path && path[0]) {
      setBundle(path[0]);
    }
  }, [path]);

  return {
    isLoading,
    product: entity,
    error
  }
};