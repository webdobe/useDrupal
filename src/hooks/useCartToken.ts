//----------Libraries-----------//
import {useEffect, useState} from "react";
import {isBrowser} from "../helpers";

export const useCartToken = (): string | null | undefined => {
  const [cartToken, setCartToken] = useState('');

  useEffect(() => {
    if (isBrowser()) {
      let token = localStorage.getItem("cartToken");
      if (!token) {
        token = Math.random().toString(36).substr(2);
        localStorage.setItem("cartToken", token);
      }
      setCartToken(token);
    }
  }, []);

  return cartToken;
};
