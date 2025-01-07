import { useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';
import { RootStore } from "@/store/root";
import { BlinkoSnapStore } from "@/store/blinkoSnapStore";
import Editor from "@/components/Editor";
import { BlinkoStore } from "@/store/blinkoStore";
import { BaseStore } from "@/store/baseStore";
import { getCurrentWindow } from "@tauri-apps/api/window";

export const Home = observer(() => {
  const { t } = useTranslation();
  const blinkoSnap = RootStore.Get(BlinkoSnapStore);
  const blinko = RootStore.Get(BlinkoStore);
  useEffect(() => {
    try {
      blinkoSnap.settings.call().then(res => {
        console.log(res)
        if (!res?.blinkoEndpoint || !res?.blinkoToken) {
          RootStore.Get(BaseStore).navigate('settings')
        }
      });
    } catch (err) {

    }
  }, []);

  return (
    <div className="w-full h-full flex flex-col gap-4 no-drag">
      <Editor mode="create" content="" onSend={async ({ content, files }) => {
        await blinko.upsertNote.call({
          content,
          // @ts-ignore
          attachments: files.map(i => { return { name: i.name, path: i.uploadPath, size: i.size, type: i.type } })
        })
        setTimeout(() => {
          getCurrentWindow().hide()
        }, 500)
      }} />
    </div>
  );
}); 