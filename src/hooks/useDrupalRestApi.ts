import useDrupal from "./useDrupal";

type ClientConfig = {
  headers?: {
    'Content-Type'?: string;
    'Accept'?: string;
  };
};

type User = any; // Please replace 'any' with the correct User type

type DrupalClient = {
  fetch: (url: string, config: ClientConfig) => Promise<any>;  // Replace Promise<any> with the appropriate type
  post: (url: string, data: any, config: ClientConfig) => Promise<any>;  // Replace Promise<any> and data: any with the appropriate type
  patch: (url: string, data: any, config: ClientConfig) => Promise<any>;  // Replace Promise<any> and data: any with the appropriate type
  delete: (url: string, config: ClientConfig) => Promise<void>;
};

type UseDrupalReturnType = {
  client: DrupalClient;
};

export const useDrupalRestApi = (clientConfig?: ClientConfig) => {
  const { client } : UseDrupalReturnType = useDrupal();

  let config: ClientConfig = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  };

  if (clientConfig) {
    config = {...config, ...clientConfig};
  }

  const getUser = async (userId: string) => {
    try {
      const response = await client.fetch(`/user/${userId}`, config);
      return response.data as User;  // Consider defining a specific type for the user data
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  const createUser = async (userData: User) => {
    try {
      const response = await client.post(`/user/register`, userData, config);
      return response.data as User;  // Consider defining a specific type for the user data
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  };

  const updateUser = async (userId: string, userData: User) => {
    try {
      const response = await client.patch(`/user/${userId}`, userData, config);
      return response.data as User;  // Consider defining a specific type for the user data
    } catch (error) {
      console.error('Error updating user data:', error);
      return null;
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await client.delete(`/user/${userId}`, config);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return {
    getUser,
    createUser,
    updateUser,
    deleteUser,
  };
};
