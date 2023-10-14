//----------Libraries-----------//
import { useEffect, useState } from "react";
import { isBrowser } from "../helpers";
import useDrupal from "./useDrupal";

export const useDrupalCartToken = () => {
  const { storage } = useDrupal();
  const [cartToken, setCartToken] = useState('');

  useEffect(() => {
    const getCartToken = async () => {
      if (isBrowser()) {
        let token = await storage.getItem("cartToken"); // Await here
        if (!token) {
          token = Math.random().toString(36).substr(2);
          await storage.setItem("cartToken", token); // Await here
        }
        setCartToken(token);
      }
    };

    getCartToken();
  }, [storage]);

  return cartToken;
};