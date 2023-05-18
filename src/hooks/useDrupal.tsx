// Import necessary dependencies
import {createContext, useContext, useState, ReactNode, FC, useEffect} from "react";
import {useDrupalUser} from "./useDrupalUser";
import {useDrupalCarts} from "./useDrupalCarts";

// Define an interface for the DrupalState
interface DrupalState {
  user?: object | null;
  cart?: object | null;
  shippingMethods?: object | null;
  paymentGateways?: object | null;
  customerProfiles?: object | null;
}

// Set the initial state for the DrupalState
const initialState: DrupalState = {
  user: null,
  cart: null,
  shippingMethods: null,
  paymentGateways: null,
  customerProfiles: null,
};

// Create a context for the DrupalState
const DrupalStateContext = createContext<DrupalState | any>(initialState);

// Define an interface for the DrupalProviderProps
interface DrupalProviderProps {
  children: ReactNode;
  client: any;
}

// Create a DrupalProvider component using React's Function Component (FC)
export const DrupalProvider: FC<DrupalProviderProps> = ({
  children,
  client,
}) => {
  // Set up the state for the DrupalState and the function to update it
  const [drupalState, _setDrupalState] = useState<DrupalState>(initialState);

  // Define the setDrupalState function that updates the DrupalState
  const setDrupalState = (newState: DrupalState) => {
    _setDrupalState((oldState) => {
      return {
        ...oldState,
        ...newState,
      };
    });
  };

  // Return the Provider component for the DrupalStateContext
  return (
    <DrupalStateContext.Provider
      value={{client, drupalState, setDrupalState}}
    >
      {children}
    </DrupalStateContext.Provider>
  );
};

interface DrupalDefaultsProps {
  children: ReactNode;
}

// Create a component wrapper to load default data.
export const DrupalLoadDefaults: FC<DrupalDefaultsProps> = ({children}) => {
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
    <>{children}</>
  )
}

// Create a custom hook to access the DrupalStateContext easily in other components
export const useDrupal = () => useContext(DrupalStateContext);