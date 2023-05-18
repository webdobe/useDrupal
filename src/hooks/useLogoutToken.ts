//----------Libraries-----------//
import {useEffect, useState} from "react";

export const useLogoutToken = () => {
  const [logoutToken, _setLogoutToken] = useState<string>('');

  const setLogoutToken = (token: string | null | undefined) => {
    localStorage.setItem("logoutToken", token);
    _setLogoutToken(token);
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      let token = localStorage.getItem("logoutToken");
      setLogoutToken(token);
    }
  }, []);

  return [logoutToken, setLogoutToken] as const;
};
