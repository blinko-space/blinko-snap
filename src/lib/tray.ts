import { TrayIcon } from '@tauri-apps/api/tray';
import { Menu, MenuItem } from '@tauri-apps/api/menu';
import { Effect, getCurrentWindow, Window } from '@tauri-apps/api/window';
import { Image } from '@tauri-apps/api/image';
import { exit } from '@tauri-apps/plugin-process';
import i18next from 'i18next';
import { BaseStore } from '@/store/baseStore';
import { RootStore } from '@/store/root';
import { resolveResource } from '@tauri-apps/api/path';
import { path as tauriPath } from '@tauri-apps/api'; 

// Unique identifier for the system tray
const TRAY_ID = 'blinko-snap-tray';

// Flag to prevent multiple simultaneous tray setup attempts
let isSettingUp = false;

// Setup the system tray with menu items
export async function setupTray() {
  const base = RootStore.Get(BaseStore);
  if (isSettingUp) return;
  isSettingUp = true;
  try {
    // Check if tray already exists
    const existingTray = await TrayIcon.getById(TRAY_ID);
    if (existingTray) {
      console.log(i18next.t('trayExists'));
      return existingTray;
    }

    const mainWindow = Window.getCurrent();

    // Create tray menu
    const menu = await Menu.new({
      items: [
        await MenuItem.new({
          id: 'show',
          text: i18next.t('showWindow'),
          action: () => {
            mainWindow.show();
            base.navigate('main');
          },
        }),
        await MenuItem.new({
          id: 'hide',
          text: i18next.t('hideWindow'),
          action: () => {
            getCurrentWindow().hide();
          },
        }),
        await MenuItem.new({
          id: 'settings',
          text: i18next.t('settings'),
          action: () => {
            mainWindow.show();
            base.navigate('settings');
          }
        }),
        await MenuItem.new({
          id: 'quit',
          text: i18next.t('quit'),
          action: () => {
            console.log(i18next.t('quit'));
            exit(1);
          }
        })
      ]
    });

    // Load tray icon
    const resolvedPath = await tauriPath.resolveResource('icons/icon.png');
    const icon = await Image.fromPath(resolvedPath);

    // Create new tray instance
    const tray = await TrayIcon.new({
      id: TRAY_ID,
      menu,
      icon,
      menuOnLeftClick: false,
    });

    console.log(i18next.t('trayCreated'));
    return tray;
  } catch (error) {
    console.error(i18next.t('trayError'), error);
    throw error;
  } finally {
    isSettingUp = false;
  }
} 