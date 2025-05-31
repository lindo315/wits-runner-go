
export interface NotificationPreferences {
  enabled: boolean;
  soundEnabled: boolean;
}

export class NotificationService {
  private static instance: NotificationService;
  private serviceWorker: ServiceWorkerRegistration | null = null;
  private notificationSound: HTMLAudioElement | null = null;

  private constructor() {
    this.initializeSound();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private initializeSound() {
    // Create a notification sound using the Web Audio API with a simple beep
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create a simple notification sound
    const createBeepSound = () => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    };

    this.notificationSound = {
      play: () => {
        if (audioContext.state === 'suspended') {
          audioContext.resume().then(() => createBeepSound());
        } else {
          createBeepSound();
        }
      }
    } as HTMLAudioElement;
  }

  async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        this.serviceWorker = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        throw new Error('Failed to register service worker');
      }
    } else {
      throw new Error('Service Workers not supported');
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications');
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission;
    }

    return Notification.permission;
  }

  getPermissionStatus(): NotificationPermission {
    if (!('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  getPreferences(): NotificationPreferences {
    const stored = localStorage.getItem('notificationPreferences');
    if (stored) {
      return JSON.parse(stored);
    }
    return { enabled: false, soundEnabled: true };
  }

  savePreferences(preferences: NotificationPreferences): void {
    localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
  }

  async showNotification(title: string, body: string, tag?: string): Promise<void> {
    const preferences = this.getPreferences();
    
    if (!preferences.enabled || this.getPermissionStatus() !== 'granted') {
      return;
    }

    // Play sound if enabled
    if (preferences.soundEnabled && this.notificationSound) {
      try {
        await this.notificationSound.play();
      } catch (error) {
        console.log('Could not play notification sound:', error);
      }
    }

    // Show notification via service worker
    if (this.serviceWorker && this.serviceWorker.active) {
      this.serviceWorker.active.postMessage({
        type: 'SHOW_NOTIFICATION',
        title,
        body,
        tag: tag || `notification-${Date.now()}`
      });
    } else {
      // Fallback to direct notification
      new Notification(title, {
        body,
        icon: '/lovable-uploads/7fa491aa-0c1b-4b64-a399-eb37394c4c0f.png',
        tag: tag || `notification-${Date.now()}`
      });
    }
  }

  async sendTestNotification(): Promise<void> {
    await this.showNotification(
      'Test Notification',
      'This is a test notification to verify your settings are working correctly.',
      'test-notification'
    );
  }
}

export const notificationService = NotificationService.getInstance();
