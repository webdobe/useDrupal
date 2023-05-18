//----------Libraries-----------//
import {useEffect, useState} from "react";

export const useCartToken = (): string | null | undefined => {
  const [cartToken, setCartToken] = useState('');

  useEffect(() => {
    if (typeof window !== "undefined") {
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
