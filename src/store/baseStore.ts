import { makeAutoObservable } from 'mobx';
import i18next from 'i18next';
import { Store } from './standard/base';
import { StorageState } from './standard/StorageState';
import { setupTray } from '@/lib/tray';
import { initialize, setSetting } from '@/lib/sql';
import { RootStore } from './root';
import { BlinkoSnapStore } from './blinkoSnapStore';
import { BlinkoStore } from './blinkoStore';
import { register, unregister } from '@tauri-apps/plugin-global-shortcut'
import { getCurrentWindow } from '@tauri-apps/api/window';

export interface Route {
  title: string;
  name: 'main' | 'settings';
  icon?: string;
}

export class BaseStore implements Store {
  sid = 'baseStore';
  theme = 'dark';

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

  toggleVisible() {
    console.log('toggleVisible')
    const window = getCurrentWindow();
    window.isVisible().then((visible: boolean) => {
      if (visible) {
        window.hide();
      } else {
        window.show();
        window.setFocus();
      }
    });
  }

  async registerShortcut(shortcut: string) {
    await register(shortcut, (event) => {
      if (event.state === 'Pressed') {
        this.toggleVisible()
      }
    })
  }

  async initTheme() {
    const window = getCurrentWindow();
    window.theme().then((theme: string) => {
      this.theme = theme;
    });
    await getCurrentWindow().onThemeChanged(({ payload: theme }) => {
      this.theme = theme;
    });
  }

  async initApp() {
    try {
      // Initialize all core services in parallel
      await Promise.all([
        this.initTheme(),
        initialize(),  // Database initialization
        setupTray(),     // System tray setup

      ]);

      const settings = await RootStore.Get(BlinkoSnapStore).settings.call();
      if (!settings?.isFirstLoaded) {
        this.navigate('settings');
        await setSetting('isFirstLoaded', 'true');
      }
      if (settings?.shortcut) {
        this.registerShortcut(settings.shortcut)
      } else {
        this.registerShortcut('CommandOrControl+Space')
      }
      RootStore.Get(BlinkoStore).loadAllData()
    } catch (error) {
      console.error('Application initialization failed:', error);
      throw error;
    }
  }
} 