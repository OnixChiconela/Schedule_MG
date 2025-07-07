import { User } from "@/app/types/back-front";


export const saveTokenAndUserToStorage = async (token: string, user: User, refreshToken: string) => {
  try {
    if (!token || !user || !refreshToken) {
      console.error('Invalid data provided to saveTokenAndUserToStorage:', { token, user, refreshToken });
      throw new Error('Invalid token, user, or refreshToken');
    }

    localStorage.setItem('access_token', token);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('user_data', JSON.stringify(user));

    // Verificar se os dados foram salvos corretamente
    const savedToken = localStorage.getItem('access_token');
    const savedRefreshToken = localStorage.getItem('refresh_token');
    const savedUser = localStorage.getItem('user_data');
    if (!savedToken || !savedRefreshToken || !savedUser) {
      console.error('Failed to save data to localStorage');
      throw new Error('Failed to save authentication data');
    }

    console.log('Data saved to localStorage successfully:', { savedToken, savedRefreshToken, savedUser });
  } catch (error: any) {
    console.error('Error saving to localStorage:', error.message);
    throw new Error(`Failed to save authentication data: ${error.message}`);
  }
};