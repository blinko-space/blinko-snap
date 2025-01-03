import { makeAutoObservable } from 'mobx';
import i18next from 'i18next';
import { Store } from './standard/base';
import { StorageState } from './standard/StorageState';
import { setupTray } from '@/lib/tray';
import { initialize, setSetting } from '@/lib/sql';
import { initializeI18n } from '@/lib/i18n';
import { RootStore } from './root';
import { BlinkoSnapStore } from './blinkoSnapStore';

export interface Route {
  title: string;
  name: 'main' | 'settings';
  icon?: string;
}

export class BaseStore implements Store {
  sid = 'baseStore';

  constructor() {
    makeAutoObservable(this);
  }

  // Routes configuration
  routes: Route[] = [
    {
      title: "主页",
      name: 'main',
    },
    {
      title: "设置",
      name: 'settings',
    }
  ];

  // Current route state
  currentRoute: Route['name'] = 'main';

  // Navigate to route
  navigate(route: Route['name']) {
    this.currentRoute = route;
  }

  // Language settings
  locale = new StorageState({ key: 'language', default: 'zh' });
  locales = [
    { value: 'en', label: 'English' },
    { value: 'zh', label: '简体中文' }
  ];

  // Change language
  changeLanguage(locale: string) {
    i18next.changeLanguage(locale);
    this.locale.save(locale);
  }

  // Window state
  isVisible = false;

  setVisible(visible: boolean) {
    this.isVisible = visible;
  }

  toggleVisible() {
    this.isVisible = !this.isVisible;
  }

  async initApp() {
    try {
      // Initialize all core services in parallel
      await Promise.all([
        initialize(),  // Database initialization
        setupTray(),     // System tray setup
        initializeI18n() // Internationalization setup
      ]);

      const settings = await RootStore.Get(BlinkoSnapStore).settings.call();
      console.log(settings, 'settings');
      if (!settings?.isFirstLoaded) {
        this.navigate('settings');
        await setSetting('isFirstLoaded', 'true');
      }
    } catch (error) {
      console.error('Application initialization failed:', error);
      throw error;
    }
  }
} 