//----------Libraries-----------//
import {useEffect, useState} from "react";
import {isBrowser} from "../helpers";
import useDrupal from "./useDrupal";

export const useDrupalCartToken = (): string => {
  const {storage} = useDrupal();
  const [cartToken, setCartToken] = useState('');

  useEffect(() => {
    if (isBrowser()) {
      let token = storage.getItem("cartToken");
      if (!token) {
        token = Math.random().toString(36).substr(2);
        storage.setItem("cartToken", token);
      }
      setCartToken(token);
    }
  }, []);

  return cartToken;
};
