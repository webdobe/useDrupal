import React, {FC, Fragment, ReactNode, useEffect} from "react";
import useDrupal from "./hooks/useDrupal";
import {useDrupalUser} from "./hooks/useDrupalUser";
import {useDrupalCarts} from "./hooks/useDrupalCarts";

interface DrupalDefaultsProps {
  children: ReactNode;
}

// Create a component wrapper to load default data.
const DrupalLoadDefaults: FC<DrupalDefaultsProps> = ({children}) => {
  const {drupalState: {user, cart}} = useDrupal();
  const {currentUser} = useDrupalUser();
  const {getCart} = useDrupalCarts();

  useEffect(() => {
    if (!user) {
      currentUser();
    }
    if (!cart) {
      getCart();
    }
  }, []);

  return (
    <Fragment>{children}</Fragment>
  )
}

export default DrupalLoadDefaults;