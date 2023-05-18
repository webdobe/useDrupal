import { useDrupal } from "./useDrupal";

export const useDrupalRestApi = (clientConfig) => {
  const { client } = useDrupal();

  let config = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  };

  if (clientConfig) {
    config = {...config, ...clientConfig};
  }

  const getUser = async (userId) => {
    try {
      const response = await client.fetch(`/user/${userId}`, config);
      return response.data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  const createUser = async (userData) => {
    try {
      const response = await client.post(`/user/register`, userData, config);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  };

  const updateUser = async (userId, userData) => {
    try {
      const response = await client.patch(`/user/${userId}`, userData, config);
      return response.data;
    } catch (error) {
      console.error('Error updating user data:', error);
      return null;
    }
  };

  const deleteUser = async (userId) => {
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