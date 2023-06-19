// Import necessary dependencies
import React, {createContext, useState, ReactNode, FC} from "react";
import {IUseDrupalConfig} from "./hooks/useDrupal";

// Define an interface for the DrupalState
export interface IDrupalState {
  user?: object | null;
  cart?: object | null;
}

// Set the initial state for the DrupalState
export const initialState: IDrupalState = {
  user: null,
  cart: null,
};

// Create a context for the DrupalState
export const DrupalStateContext = createContext<IDrupalState | any>(initialState);

// Define an interface for the DrupalProviderProps
interface DrupalProviderProps {
  initialState?: any;
  children: ReactNode;
  client: any;
  config: IUseDrupalConfig;
}

// Create a DrupalProvider component using React's Function Component (FC)
const DrupalProvider: FC<DrupalProviderProps> = ({
  initialState,
  children,
  client,
  config,
}) => {
  // Set up the state for the DrupalState and the function to update it
  const [drupalState, _setDrupalState] = useState<IDrupalState>(initialState);

  // Define the setDrupalState function that updates the DrupalState
  const setDrupalState = (newState: IDrupalState) => {
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
      value={{client, config, drupalState, setDrupalState}}
    >
      {children}
    </DrupalStateContext.Provider>
  );
};

export default DrupalProvider;