// Import necessary libraries
import {useEffect, useState} from "react";

// Import custom hooks and utilities
import {useCartToken} from "./useCartToken";
import {useDrupal} from "./useDrupal";
import {useDrupalJsonApi} from "./useDrupalJsonApi";

// Define the useDrupalCheckout hook with an optional orderType parameter
export const useDrupalCustomerProfiles = () => {
  const cartToken = useCartToken();
  const {drupalState, setDrupalState} = useDrupal();
  const [isLoading, setIsLoading] = useState(false);
  const jsonApi = useDrupalJsonApi({
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      "Commerce-Cart-Token": cartToken,
    },
  });

  // Function to get customer profiles
  const getCustomerProfiles = async () => {
    try {
      setIsLoading(true);
      const {data} = await jsonApi.fetch(`/jsonapi/profile/customer`);
      const profiles = (Object.values(data["profile--customer"])).map((profile) => {
        return profile;
      });
      setDrupalState({customerProfiles: profiles});
      setIsLoading(false);
      return data;
    } catch (error) {
      console.error("Error getting customer profiles data:", error);

      if (error && error?.response?.data?.message) {
        return {error: error?.response?.data?.message};
      }

      return null;
    }
  };

  useEffect(() => {
    getCustomerProfiles();
  }, []);

  return [isLoading, drupalState.customerProfiles];
}