import { apiRequest } from './apiClient';

export const authService = {
  async sendOTP(email) {
    await apiRequest('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    return { success: true, message: 'If the address can receive email, an OTP has been sent.' };
  },

  async verifyOTP(email, otp) {
    const authentication = await apiRequest('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
    return {
      user: {
        uuid: authentication.user.uuid,
        email: authentication.user.email,
        name: authentication.user.fullName,
        fullName: authentication.user.fullName,
        phone: authentication.user.phone,
        role: authentication.user.role,
        verified: authentication.user.verified,
        active: authentication.user.active,
        accessToken: authentication.accessToken,
        refreshToken: authentication.refreshToken,
        expiresIn: authentication.expiresIn,
        tokenType: authentication.tokenType,
      },
    };
  },

  async logout() {
    const saved = localStorage.getItem('burger_auth_user');
    const user = saved ? JSON.parse(saved) : null;
    if (user?.refreshToken) {
      await apiRequest('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: user.refreshToken }),
      });
    }
    return { success: true };
  },
};

