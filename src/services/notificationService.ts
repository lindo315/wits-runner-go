
// Notification service for managing browser notifications
export interface NotificationPreferences {
  enabled: boolean;
  soundEnabled: boolean;
  permission: NotificationPermission;
}

class NotificationService {
  private static instance: NotificationService;
  private audio: HTMLAudioElement | null = null;
  
  private constructor() {
    this.initializeAudio();
  }
  
  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }
  
  private initializeAudio() {
    // Create a simple notification sound using Web Audio API
    try {
      this.audio = new Audio();
      // Use a data URI for a simple beep sound
      this.audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmIdCjOJ1fDOeSsFJXnN7tyNOggWZrjq45ZKDwxOqOL0t2QdDDyS2v';
    } catch (error) {
      console.warn('Audio initialization failed:', error);
    }
  }
  
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications');
    }
    
    const permission = await Notification.requestPermission();
    this.savePreferences({ 
      ...this.getPreferences(), 
      permission 
    });
    
    return permission;
  }
  
  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully:', registration);
        return registration;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        return null;
      }
    }
    return null;
  }
  
  getPreferences(): NotificationPreferences {
    const stored = localStorage.getItem('notificationPreferences');
    const defaults: NotificationPreferences = {
      enabled: false,
      soundEnabled: true,
      permission: Notification.permission || 'default'
    };
    
    if (stored) {
      try {
        return { ...defaults, ...JSON.parse(stored) };
      } catch (error) {
        console.error('Error parsing notification preferences:', error);
      }
    }
    
    return defaults;
  }
  
  savePreferences(preferences: NotificationPreferences): void {
    localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
  }
  
  async showNotification(title: string, body: string, options: NotificationOptions = {}): Promise<void> {
    const preferences = this.getPreferences();
    
    if (!preferences.enabled || preferences.permission !== 'granted') {
      return;
    }
    
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications');
    }
    
    // Play sound if enabled
    if (preferences.soundEnabled && this.audio) {
      try {
        this.audio.currentTime = 0;
        await this.audio.play();
      } catch (error) {
        console.warn('Failed to play notification sound:', error);
      }
    }
    
    // Show notification
    const notification = new Notification(title, {
      body,
      icon: '/lovable-uploads/7fa491aa-0c1b-4b64-a399-eb37394c4c0f.png',
      badge: '/lovable-uploads/7fa491aa-0c1b-4b64-a399-eb37394c4c0f.png',
      requireInteraction: true,
      ...options
    });
    
    // Auto-close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);
    
    // Handle click
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }
  
  async sendTestNotification(): Promise<void> {
    await this.showNotification(
      'Test Notification',
      'This is a test notification from your delivery app!'
    );
  }
  
  isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }
}

export const notificationService = NotificationService.getInstance();
