import useDrupal from "./useDrupal";
import { useDrupalCsrfToken } from "./useDrupalCsrfToken";
import { useDrupalLogoutToken } from "./useDrupalLogoutToken";
import useDrupalJsonApi, { JsonApiResponse } from "./useDrupalJsonApi";
import JsonApiEntity from "../service/JsonApiEntity";

interface UserResponse {
  "user--user"?: Record<string, any>
}

interface MetaData {
  links?: {
    me?: {
      meta?: {
        id?: string
      }
    }
  }
}

const defaultUser = {};

export const useDrupalUser = (clientConfig = {}, includes = ['roles', 'customer_profiles']) => {
  const [, setCsrfToken] = useDrupalCsrfToken();
  const [logoutToken, setLogoutToken] = useDrupalLogoutToken();
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

  const setUserProfile = async (id: any) => {
    try {
      const include = includes.join(',');
      const response: JsonApiResponse<UserResponse> = await jsonapi.fetch(`/jsonapi/user/user/${id}?include=${include}`);

      if (response.data && response.data["user--user"]) {
        setDrupalState({ user: new JsonApiEntity(id, "user--user", response.data) });
      }

      return response.data;
    } catch (error) {
      console.error('Error setting user profile:', error);
      return null;
    }
  };

  const currentUser = async () => {
    try {
      const response: JsonApiResponse<{ meta: MetaData }> = await client.get(`/jsonapi`);
      if (response.data?.meta?.links?.me?.meta?.id) {
        await setUserProfile(response.data.meta.links.me.meta.id);
      } else {
        setDrupalState({user: defaultUser});
      }
      return response.data?.meta;
    } catch (error) {
      console.error('Error fetching current user data:', error);
      return null;
    }
  };

  const login = async (loginData: any) => {
    try {
      const response = await client.post(`/user/login?_format=json`, loginData, config);
      setCsrfToken(response?.data?.csrf_token);
      setLogoutToken(response?.data?.logout_token);
      await currentUser();
      return response;
    } catch (error: any) {
      console.error('Error fetching user data:', error);

      if (error && error?.response?.data?.message) {
        return { error: error?.response?.data?.message}
      }

      return null;
    }
  };

  const logout = async (token: any) => {
    try {
      const response = await client.post(`/user/logout?_format=json&token=${token}`);
    } catch (error) {
      console.error('Error during logout: ', error);
    }

    // Logout regardless on frontend.
    setCsrfToken(null as unknown as string);
    setLogoutToken(null as unknown as string);
    setDrupalState({ user: null, cart: null });
  }

  const createUser = async (userData: any) => {
    try {
      const response = await client.post(`/user/register?_format=json`, userData, config);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  };

  const resetPassword = async (userData: any) => {
    try {
      const response = await client.post(`/user/password?_format=json`, userData, config);
      return response.data;
    } catch (error) {
      console.error('Error resetting user password:', error);
      return null;
    }
  };

  const updateUser = async (userId: string, userData: any) => {
    try {
      const response = await client.patch(`/user/${userId}?_format=json`, userData, config);
      return response.data;
    } catch (error) {
      console.error('Error updating user data:', error);
      return null;
    }
  };

  const deleteUser = async (userId: string) => {
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