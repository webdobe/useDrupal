//----------Libraries-----------//
import {useEffect, useState} from "react";
import {isBrowser} from "../helpers";
import useDrupal from "./useDrupal";

export const useDrupalCsrfToken = () => {
  const {storage} = useDrupal();
  const [csrfToken, _setCsrfToken] = useState<string>('');

  const setCsrfToken = (token: string) => { // define type for token
    _setCsrfToken(() => {
      storage.setItem("csrfToken", token);
      return token;
    });
  };

  useEffect(() => {
    if (isBrowser()) {
      let token: string | null = storage.getItem("csrfToken"); // assign type string | null
      if (token !== null) { // check if token is not null before setting
        setCsrfToken(token);
      }
    }
  }, []);

  return [csrfToken, setCsrfToken] as const;
};