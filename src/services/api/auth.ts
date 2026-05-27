import api from './client';

export const authAPI = {
  loginEmail: async (dto: any) => {
    const response = await api.post('/auth/login', dto);
    return response.data;
  },
  registerEmail: async (dto: any) => {
    const response = await api.post('/auth/register', dto);
    return response.data;
  },
  loginPhone: async (phone: string, fullName?: string) => {
    // Clean phone number: remove spaces, dashes
    const cleanPhone = phone.replace(/[\s-]/g, '');
    // Standardize to Vietnam phone format or keep as is if it starts with +
    let formattedPhone = cleanPhone;
    if (!cleanPhone.startsWith('+')) {
      formattedPhone = cleanPhone.startsWith('0')
        ? `+84${cleanPhone.slice(1)}`
        : `+84${cleanPhone}`;
    }
    
    // Generate the mock token for testing
    const mockToken = `mock_firebase_otp_token_${formattedPhone}`;
    
    const response = await api.post('/auth/firebase-phone', {
      token: mockToken,
      fullName: fullName || 'New User',
    });
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};
