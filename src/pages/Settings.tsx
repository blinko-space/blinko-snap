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

const SettingBox = "flex flex-row gap-2 w-full justify-between"
const SettingTitle = "text-md font-bold text-foreground"

export const Settings = observer(() => {
  const { t } = useTranslation();
  const blinkoSnap = RootStore.Get(BlinkoSnapStore);
  const [keys, { start, stop, isRecording }] = useRecordHotkeys();

  useEffect(() => {
    blinkoSnap.settings.call();
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

  return (
    <div className="w-full h-full flex flex-col bg-transparent">
      <div className="p-6 w-full flex-1" data-tauri-drag-region>
        <div className="flex gap-2 items-center mb-4">
          <div className="h-[22px] w-[6px] rounded-full bg-primary"></div>
          <h1 className="text-2xl font-bold  select-none text-white">{t('settings')}</h1>
        </div>

        <div className="flex flex-col gap-4">
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
        </div>
      </div>
    </div>
  );
}); 