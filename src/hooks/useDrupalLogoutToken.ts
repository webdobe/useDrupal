import { useEffect, useState } from "react";
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
      let token: string | null = await storage.getItem("logoutToken"); // Await here
      if (token !== null) {
        await setLogoutToken(token); // Await here
      }
    };

    getLogoutToken();
  }, [storage]);

  return [logoutToken, setLogoutToken] as const;
};



