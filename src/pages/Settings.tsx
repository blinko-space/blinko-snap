import { useEffect, useState } from "react";
import { Input, Switch, Button } from "@nextui-org/react";
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';
import { BlinkoSnapStore } from "@/store/blinkoSnapStore";
import { RootStore } from "@/store/root";
import { setSetting } from "@/lib/sql";
import { register, unregister } from '@tauri-apps/plugin-global-shortcut';
import { enable, isEnabled, disable } from '@tauri-apps/plugin-autostart';
import { BaseStore } from "@/store/baseStore";
import { useRecordHotkeys } from 'react-hotkeys-hook';
import { check } from '@tauri-apps/plugin-updater'
import { relaunch } from '@tauri-apps/plugin-process'

import { getVersion } from '@tauri-apps/api/app';
import { getCurrentWindow } from "@tauri-apps/api/window";
import { ScrollArea } from "@/components/Common/ScrollArea";
import { Icon } from "@iconify/react";
import { invoke } from '@tauri-apps/api/core';

const SettingBox = "flex flex-row gap-2 w-full justify-between"
const SettingTitle = "text-md font-bold text-foreground"

export const Settings = observer(() => {
  const { t } = useTranslation();
  const blinkoSnap = RootStore.Get(BlinkoSnapStore);
  const [keys, { start, stop, isRecording }] = useRecordHotkeys();
  const [currentVersion, setCurrentVersion] = useState('');
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    blinkoSnap.settings.call();
    getVersion().then(setCurrentVersion);
  }, []);

  useEffect(() => {
    if (!isRecording && keys.size > 1) {
      const shortcut = Array.from(keys).join('+');
      handleShortcutUpdate(shortcut);
    }
  }, [isRecording]);

  const handleShortcutUpdate = async (shortcut: string) => {
    try {
      if (blinkoSnap.settings.value?.shortcut) {
        await unregister(blinkoSnap.settings.value.shortcut);
        await unregister(shortcut);
      }
    } catch (error) {
    }
    await setSetting('shortcut', shortcut);
    await blinkoSnap.settings.call();
    try {
      await register(shortcut, (event) => {
        if (event.state === 'Pressed') {
          RootStore.Get(BaseStore).toggleVisible()
        }
      });
    } catch (err) {
      console.error('Failed to register shortcut:', err);
    }
  };

  const handleShortcutChange = () => {
    if (isRecording) {
      stop();
    } else {
      start();
    }
  };

  const checkForUpdates = async () => {
    try {
      setChecking(true);
      const update = await check()
      if (update?.available) {
        if (window.confirm(t('newVersionAvailable'))) {
          await update.downloadAndInstall()
          await relaunch()
        }
      } else {
        // alert(t('noUpdatesAvailable'));
      }
    } catch (error) {
      // alert(t('updateCheckFailed'));
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-transparent">
      <div className="p-4 w-full flex-1" data-tauri-drag-region>
        <div className="flex gap-2 items-center mb-4">
          <div className="h-[22px] w-[6px] rounded-full bg-primary"></div>
          <h1 className="text-xl font-bold  select-none text-white">{t('settings')}</h1>
          <div 
            className="ml-auto cursor-pointer hover:bg-hover p-1 rounded-md"
            onClick={() => getCurrentWindow().hide()}
          >
            <Icon icon="material-symbols:close" width="20" height="20" />
          </div>
        </div>

        <ScrollArea className={'h-[270px] p-2'} onBottom={() => {
          console.log('onBottom')
        }}>
          <div className="flex flex-col gap-3">
            <div className={SettingBox}>
              <p className={`${SettingTitle} select-none`}>{t('autoStart')}</p>
              <div className="pointer-events-auto">
                <Switch
                  isSelected={blinkoSnap.settings.value?.autoStart}
                  onValueChange={(checked) => {
                    blinkoSnap.setAutoStart(checked)
                    if (checked) {
                      enable()
                    } else {
                      disable()
                    }
                  }}
                  color="primary"
                  size="lg"
                  className="gap-2"
                />
              </div>
            </div>
            <div className={SettingBox}>
              <p className={`${SettingTitle} select-none`}>{t('hideDockIcon')}</p>
              <div className="pointer-events-auto">
                <Switch
                  isSelected={blinkoSnap.settings.value?.hideDockIcon}
                  onValueChange={async (checked) => {
                    await blinkoSnap.setHideDockIcon(checked)
                    // On macOS, we need to use a Rust command to control dock visibility
                    try {
                      await invoke('set_dock_visibility', { visible: !checked })
                    } catch (error) {
                      console.error('Failed to set dock visibility:', error)
                    }
                  }}
                  color="primary"
                  size="lg"
                  className="gap-2"
                />
              </div>
            </div>
            <div className={SettingBox}>
              <p className={`${SettingTitle} select-none`}>{t('shortcut')}</p>
              <div className="pointer-events-auto flex items-center gap-2">
                <div
                  onClick={handleShortcutChange}
                  className={`cursor-pointer ${isRecording ? 'bg-red-500 text-white' : 'bg-primary text-primary-foreground'}  rounded-xl px-3 py-2`}
                >
                  {isRecording
                    ? (keys.size > 0 ? Array.from(keys).join('+').toUpperCase() : t('recording'))
                    : (blinkoSnap.settings.value?.shortcut.toUpperCase() || 'Control+Space'.toUpperCase())
                  }
                </div>
              </div>
            </div>
            <div className={SettingBox}>
              <p className={`${SettingTitle} select-none`}>{t('blinko-endpoint')}</p>
              <div className="pointer-events-auto">
                <Input
                  className="max-w-[300px]"
                  placeholder="http://127.0.0.1:1111"
                  value={blinkoSnap.settings.value?.blinkoEndpoint}
                  onChange={async (e) => {
                    await setSetting('blinkoEndpoint', e.target.value)
                    blinkoSnap.settings.call()
                  }}
                />
              </div>
            </div>
            <div className={SettingBox}>
              <p className={`${SettingTitle} select-none`}>{t('blinko-token')}</p>
              <div className="pointer-events-auto">
                <Input
                  className="max-w-[300px]"
                  placeholder="eyJhbG..."
                  value={blinkoSnap.settings.value?.blinkoToken}
                  onChange={async (e) => {
                    await setSetting('blinkoToken', e.target.value)
                    blinkoSnap.settings.call()
                  }}
                />
              </div>
            </div>
            <div className={SettingBox}>
              <div className="flex flex-col">
                <p className={`${SettingTitle} select-none`}>{t('version')}</p>
                <p className="text-sm text-gray-400">v{currentVersion}</p>
              </div>
              <div className="pointer-events-auto">
                <Button
                  color="primary"
                  onPress={checkForUpdates}
                  isLoading={checking}
                >
                  {checking ? t('checking') : t('checkForUpdates')}
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}); 