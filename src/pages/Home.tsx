import { useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';
import { RootStore } from "@/store/root";
import { BlinkoSnapStore } from "@/store/blinkoSnapStore";
import Editor from "@/components/Editor";
import { BlinkoStore } from "@/store/blinkoStore";
import { BaseStore } from "@/store/baseStore";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Icon } from "@iconify/react";

export const Home = observer(() => {
  const { t } = useTranslation();
  const blinkoSnap = RootStore.Get(BlinkoSnapStore);
  const blinko = RootStore.Get(BlinkoStore);
  useEffect(() => {
    // try {
    //   blinkoSnap.settings.call().then(res => {
    //     console.log(res)
    //     if (!res) return
    //     if (!res?.blinkoEndpoint || !res?.blinkoToken) {
    //       RootStore.Get(BaseStore).navigate('settings')
    //     }
    //   });
    // } catch (err) {
    // }
  }, []);

  return (
    <div className="w-full h-full flex flex-col p-2">
      <div data-tauri-drag-region className="w-full h-8 flex-shrink-0 cursor-move flex items-center justify-between px-2">
        <div className="w-8"></div>
        <div className="w-10 h-1 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
        <div 
          className="cursor-pointer hover:bg-hover p-1 rounded-md"
          onClick={() => getCurrentWindow().hide()}
        >
          <Icon icon="material-symbols:close" width="16" height="16" className="text-gray-600 dark:text-gray-400" />
        </div>
      </div>
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