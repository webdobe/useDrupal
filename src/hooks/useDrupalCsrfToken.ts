import { useEffect, useState } from "react";
import { isBrowser } from "../helpers";
import useDrupal from "./useDrupal";

export const useDrupalCsrfToken = () => {
  const { storage } = useDrupal();
  const [csrfToken, _setCsrfToken] = useState<string>('');

  const setCsrfToken = async (token: string) => {
    await storage.setItem("csrfToken", token); // Await here
    _setCsrfToken(token);
  };

  useEffect(() => {
    const getCsrfToken = async () => {
      let token: string | null = await storage.getItem("csrfToken"); // Await here
      if (token !== null) {
        await setCsrfToken(token); // Await here
      }
    };

    getCsrfToken();
  }, [storage]);

  return [csrfToken, setCsrfToken] as const;
};