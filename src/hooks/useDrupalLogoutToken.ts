import { useEffect, useState } from "react";
import { isBrowser } from "../helpers";
import useDrupal from "./useDrupal";

export const useDrupalLogoutToken = () => {
  const { storage } = useDrupal();
  const [logoutToken, _setLogoutToken] = useState<string>('');

  const setLogoutToken = async (token: string | null | undefined) => {
    const finalToken = token ?? '';
    await storage.setItem("logoutToken", finalToken); // Await here
    _setLogoutToken(finalToken);
  }

  useEffect(() => {
    const getLogoutToken = async () => {
      if (isBrowser()) {
        let token = await storage.getItem("logoutToken"); // Await here
        await setLogoutToken(token); // Await here
      }
    };

    getLogoutToken();
  }, [storage]);

  return [logoutToken, setLogoutToken] as const;
};



