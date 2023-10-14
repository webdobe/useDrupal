import { useEffect, useState } from "react";
import {isBrowser} from "../helpers";
import useDrupal from "./useDrupal";

export const useDrupalLogoutToken = () => {
  const {storage} = useDrupal();
  const [logoutToken, _setLogoutToken] = useState<string>('');

  const setLogoutToken = (token: string | null | undefined) => {
    const finalToken = token ?? '';
    storage.setItem("logoutToken", finalToken);
    _setLogoutToken(finalToken);
  }

  useEffect(() => {
    if (isBrowser()) {
      let token = storage.getItem("logoutToken");
      setLogoutToken(token);
    }
  }, []);

  return [logoutToken, setLogoutToken] as const;
};

