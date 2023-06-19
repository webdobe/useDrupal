import { useEffect, useState } from "react";
import useDrupalJsonApi from "./useDrupalJsonApi";
import JsonApiEntity, {IEntityData} from "../service/JsonApiEntity";

interface IEntity {
  isLoading: boolean;
  entity: JsonApiEntity | null;
  error: Error | null;
}

const useDrupalPathAlias = (type: string, queryParams: any = {}, path: string[]): IEntity => {
  const jsonapi = useDrupalJsonApi();
  const [entity, setEntity] = useState<JsonApiEntity | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createUrl = (): string => {
    return `/jsonapi/${type.replace('--', '/')}`;
  };

  const getParams = () => {
    const parts = [...path];
    parts.shift();
    const fullPath = parts.join('/');
    const fieldablePath = process.env.NEXT_PUBLIC_FIELDABLE_PATH as string;
    return {...queryParams, ...{
      filter: {
        [fieldablePath]: `/${fullPath}`,
      }
    }}
  }

  const load = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const url = createUrl();
      const params = getParams();

      const {data} = await jsonapi.fetch(url, params);

      setEntity(new JsonApiEntity('', type, data as IEntityData));
      setIsLoading(false);
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return {
    isLoading,
    entity,
    error
  }
};

export default useDrupalPathAlias;