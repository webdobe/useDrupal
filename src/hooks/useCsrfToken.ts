//----------Libraries-----------//
import {useEffect, useState} from "react";

export const useCsrfToken = () => {
  const [csrfToken, _setCsrfToken] = useState<string>('');

  const setCsrfToken = (token) => {
    _setCsrfToken(() => {
      localStorage.setItem("csrfToken", token);
      return token;
    });
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      let token: string = localStorage.getItem("csrfToken");
      setCsrfToken(token);
    }
  }, []);

  return [csrfToken, setCsrfToken] as const;
};
