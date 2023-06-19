// Import necessary dependencies
import React, {useContext, ContextType} from "react";
import {DrupalStateContext} from "../DrupalProvider";
import {JsonApiParams} from "./useDrupalJsonApi";

export interface IUseDrupalConfig {
  baseUrl: string;
  jsonApiPath: string;
  defaultCartQueryParams: JsonApiParams;
}

// Create a custom hook to access the DrupalStateContext easily in other components
const useDrupal = () => useContext(DrupalStateContext);

export default useDrupal;