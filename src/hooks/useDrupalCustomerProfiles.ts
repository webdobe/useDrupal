import React, { useEffect, useState } from "react";
import useDrupal from "./useDrupal";
import { useDrupalCartToken } from "./useDrupalCartToken";

import { useDrupalJsonApi } from "./useDrupalJsonApi";

interface IProfile {
  // Define your profile structure here
}

interface IApiData {
  "profile--customer": IProfile[]
}

interface IErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const useDrupalCustomerProfiles = () => {
  const cartToken = useDrupalCartToken();
  const { drupalState, setDrupalState } = useDrupal();
  const [isLoading, setIsLoading] = useState(false);
  const jsonApi = useDrupalJsonApi({
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      "Commerce-Cart-Token": cartToken || null,
    },
  });

  const getCustomerProfiles = async (): Promise<IProfile[] | null> => {
    try {
      setIsLoading(true);
      const response: { data?: IApiData } = await jsonApi.fetch(`/jsonapi/profile/customer`);
      if (!response.data) {
        throw new Error("No data received from API");
      }
      const profiles = Object.values(response.data["profile--customer"]).map((profile) => {
        return profile;
      });
      setDrupalState({ customerProfiles: profiles });
      setIsLoading(false);
      return profiles;
    } catch (error) {
      console.error("Error getting customer profiles data:", error);

      const responseError = error as IErrorResponse;
      if (
        responseError &&
        responseError.response &&
        responseError.response.data &&
        responseError.response.data.message
      ) {
        console.error(responseError.response.data.message);
      }
      return null;
    }
  };

  useEffect(() => {
    getCustomerProfiles();
  }, []);

  return [isLoading, drupalState.customerProfiles];
};
