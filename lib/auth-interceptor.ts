import { toast } from 'sonner';

class AuthInterceptor {
  private static hasShownExpiredToast = false;

  static handleTokenExpired(): void {
    // Only show toast once to avoid spam
    if (!this.hasShownExpiredToast) {
      this.hasShownExpiredToast = true;

      if (typeof window !== 'undefined') {
        toast.error('Session Expired', {
          description: 'Your session has expired. Please login again.',
          duration: 3000,
        });
      }

      // Reset flag after redirect
      setTimeout(() => {
        this.hasShownExpiredToast = false;
      }, 3000);
    }
  }

  static clearExpiredFlag(): void {
    this.hasShownExpiredToast = false;
  }
}

export default AuthInterceptor;
