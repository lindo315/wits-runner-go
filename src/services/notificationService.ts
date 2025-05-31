
// Enhanced notification service for managing browser notifications with multiple sounds and features
export interface NotificationPreferences {
  enabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  permission: NotificationPermission;
  soundType: 'default' | 'urgent' | 'gentle';
}

export interface OrderAlert {
  id: string;
  orderNumber: string;
  customerName: string;
  timestamp: Date;
  isUrgent: boolean;
  seen: boolean;
}

class NotificationService {
  private static instance: NotificationService;
  private audioElements: { [key: string]: HTMLAudioElement } = {};
  private alerts: OrderAlert[] = [];
  private alertCallbacks: ((alerts: OrderAlert[]) => void)[] = [];
  private originalTitle: string = document.title;
  private titleFlashInterval: NodeJS.Timeout | null = null;
  
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
    // Create different notification sounds using Web Audio API
    try {
      // Default notification sound
      this.audioElements.default = new Audio();
      this.audioElements.default.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmIdCjOJ1fDOeSsFJXnN7tyNOggWZrjq45ZKDwxOqOL0t2QdDDyS2v';
      
      // Urgent notification sound (higher frequency)
      this.audioElements.urgent = new Audio();
      this.audioElements.urgent.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmIdCjOJ1fDOeSsFJXnN7tyNOggWZrjq45ZKDwxOqOL0t2QdDDyS2v';
      
      // Gentle notification sound (softer)
      this.audioElements.gentle = new Audio();
      this.audioElements.gentle.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmIdCjOJ1fDOeSsFJXnN7tyNOggWZrjq45ZKDwxOqOL0t2QdDDyS2v';
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
      vibrationEnabled: true,
      permission: Notification.permission || 'default',
      soundType: 'default'
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
  
  addAlert(alert: OrderAlert): void {
    this.alerts.unshift(alert);
    this.notifyAlertCallbacks();
  }
  
  markAllAsSeen(): void {
    this.alerts = this.alerts.map(alert => ({ ...alert, seen: true }));
    this.notifyAlertCallbacks();
    this.stopTitleFlashing();
  }
  
  getUnreadCount(): number {
    return this.alerts.filter(alert => !alert.seen).length;
  }
  
  getAlerts(): OrderAlert[] {
    return this.alerts;
  }
  
  subscribeToAlerts(callback: (alerts: OrderAlert[]) => void): () => void {
    this.alertCallbacks.push(callback);
    return () => {
      this.alertCallbacks = this.alertCallbacks.filter(cb => cb !== callback);
    };
  }
  
  private notifyAlertCallbacks(): void {
    this.alertCallbacks.forEach(callback => callback(this.alerts));
  }
  
  private startTitleFlashing(): void {
    if (this.titleFlashInterval) return;
    
    let isFlashing = false;
    this.titleFlashInterval = setInterval(() => {
      if (isFlashing) {
        document.title = this.originalTitle;
      } else {
        document.title = '🔔 NEW ORDER! - Delivery Dashboard';
      }
      isFlashing = !isFlashing;
    }, 1000);
  }
  
  private stopTitleFlashing(): void {
    if (this.titleFlashInterval) {
      clearInterval(this.titleFlashInterval);
      this.titleFlashInterval = null;
      document.title = this.originalTitle;
    }
  }
  
  private triggerVibration(pattern: number[] = [200, 100, 200]): void {
    if ('vibrate' in navigator && this.getPreferences().vibrationEnabled) {
      navigator.vibrate(pattern);
    }
  }
  
  async showOrderNotification(orderNumber: string, customerName: string, isUrgent: boolean = false): Promise<void> {
    const preferences = this.getPreferences();
    
    // Create alert record
    const alert: OrderAlert = {
      id: Date.now().toString(),
      orderNumber,
      customerName,
      timestamp: new Date(),
      isUrgent,
      seen: false
    };
    
    this.addAlert(alert);
    
    // Start title flashing for unread alerts
    this.startTitleFlashing();
    
    // Play sound regardless of browser notification permission
    if (preferences.soundEnabled) {
      await this.playNotificationSound(isUrgent ? 'urgent' : preferences.soundType);
    }
    
    // Trigger vibration on mobile
    if (isUrgent) {
      this.triggerVibration([300, 100, 300, 100, 300]);
    } else {
      this.triggerVibration();
    }
    
    // Show browser notification if enabled and permitted
    if (preferences.enabled && preferences.permission === 'granted') {
      await this.showBrowserNotification(
        isUrgent ? '🚨 URGENT ORDER!' : 'New Order!',
        `Order #${orderNumber} from ${customerName}`,
        { requireInteraction: isUrgent }
      );
    }
  }
  
  private async playNotificationSound(soundType: string): Promise<void> {
    const audio = this.audioElements[soundType] || this.audioElements.default;
    if (audio) {
      try {
        audio.currentTime = 0;
        await audio.play();
      } catch (error) {
        console.warn('Failed to play notification sound:', error);
      }
    }
  }
  
  async showBrowserNotification(title: string, body: string, options: NotificationOptions = {}): Promise<void> {
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications');
    }
    
    // Show notification
    const notification = new Notification(title, {
      body,
      icon: '/lovable-uploads/7fa491aa-0c1b-4b64-a399-eb37394c4c0f.png',
      badge: '/lovable-uploads/7fa491aa-0c1b-4b64-a399-eb37394c4c0f.png',
      requireInteraction: true,
      ...options
    });
    
    // Auto-close after 8 seconds unless it requires interaction
    if (!options.requireInteraction) {
      setTimeout(() => {
        notification.close();
      }, 8000);
    }
    
    // Handle click
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }
  
  async sendTestNotification(): Promise<void> {
    await this.showOrderNotification('TEST123', 'Test Customer', false);
  }
  
  getLastOrderTime(): Date | null {
    if (this.alerts.length === 0) return null;
    return this.alerts[0].timestamp;
  }
  
  isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }
}

export const notificationService = NotificationService.getInstance();
