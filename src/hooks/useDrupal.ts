// Import necessary dependencies
import React, {useContext} from "react";
import {DrupalStateContext} from "../DrupalProvider";

// Create a custom hook to access the DrupalStateContext easily in other components
const useDrupal = () => useContext(DrupalStateContext);

export default useDrupal;