import { useDrupal } from "./useDrupal";
import { useCsrfToken } from "./useCsrfToken";
import { useLogoutToken } from "./useLogoutToken";
import { useEffect } from "react";
import { useDrupalJsonApi } from "./useDrupalJsonApi";

const defaultUser = {}

export const useDrupalUser = (clientConfig = {}, includes = ['roles', 'customer_profiles']) => {
  const [, setCsrfToken] = useCsrfToken();
  const [logoutToken, setLogoutToken] = useLogoutToken();
  const {client, setDrupalState} = useDrupal();
  const jsonapi = useDrupalJsonApi();

  let config = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  };

  if (clientConfig) {
    config = {...config, ...clientConfig};
  }

  const setUserProfile = async (id) => {
    try {
      const include = includes.join(',');
      const { data } = await jsonapi.fetch(`/jsonapi/user/user/${id}?include=${include}`);

      if (data && data["user--user"]) {
        setDrupalState({user: data["user--user"][id]});
      }

      return data;
    } catch (error) {
      console.error('Error setting user profile:', error);
      return null;
    }
  };

  const currentUser = async () => {
    try {
      const { data: { meta }} = await client.get(`/jsonapi`);
      if (meta) {
        await setUserProfile(meta?.links?.me?.meta?.id);
      } else {
        setDrupalState({user: defaultUser});
      }
      return meta;
    } catch (error) {
      console.error('Error fetching current user data:', error);
      return null;
    }
  };

  const login = async (loginData) => {
    try {
      const response = await client.post(`/user/login?_format=json`, loginData, config);
      setCsrfToken(response?.data?.csrf_token);
      setLogoutToken(response?.data?.logout_token);
      await currentUser();
      return response;
    } catch (error) {
      console.error('Error fetching user data:', error);

      if (error && error?.response?.data?.message) {
        return { error: error?.response?.data?.message}
      }

      return null;
    }
  };

  const logout = async (token) => {
    try {
      const response = await client.post(`/user/logout?_format=json&token=${token}`);
    } catch (error) {
      console.error('Error during logout: ', error);
    }

    // Logout regardless on frontend.
    setCsrfToken(null);
    setLogoutToken(null);
    setDrupalState({user: null, cart: null});
  }

  const createUser = async (userData) => {
    try {
      const response = await client.post(`/user/register?_format=json`, userData, config);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  };

  const resetPassword = async (userData) => {
    try {
      const response = await client.post(`/user/password?_format=json`, userData, config);
      return response.data;
    } catch (error) {
      console.error('Error resetting user password:', error);
      return null;
    }
  };

  const updateUser = async (userId, userData) => {
    try {
      const response = await client.patch(`/user/${userId}?_format=json`, userData, config);
      return response.data;
    } catch (error) {
      console.error('Error updating user data:', error);
      return null;
    }
  };

  const deleteUser = async (userId) => {
    try {
      await client.delete(`/user/${userId}?_format=json`, config);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return {
    currentUser,
    login,
    logout,
    logoutToken,
    createUser,
    updateUser,
    resetPassword,
    deleteUser,
  };
};