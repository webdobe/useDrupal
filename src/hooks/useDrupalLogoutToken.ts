import { useEffect, useState } from "react";
import {isBrowser} from "../helpers";

export const useDrupalLogoutToken = () => {
  const [logoutToken, _setLogoutToken] = useState<string>('');

  const setLogoutToken = (token: string | null | undefined) => {
    const finalToken = token ?? '';
    localStorage.setItem("logoutToken", finalToken);
    _setLogoutToken(finalToken);
  }

  useEffect(() => {
    if (isBrowser()) {
      let token = localStorage.getItem("logoutToken");
      setLogoutToken(token);
    }
  }, []);

  return [logoutToken, setLogoutToken] as const;
};

