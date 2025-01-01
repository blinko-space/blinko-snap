import { Button } from "./components/ui/button";
import { TrayIcon } from '@tauri-apps/api/tray';
import { Menu, MenuItem } from '@tauri-apps/api/menu';
import { getCurrentWindow, Window } from '@tauri-apps/api/window';
import { Image } from '@tauri-apps/api/image';
import { useEffect } from "react";
import { exit } from '@tauri-apps/plugin-process';

function App() {
  useEffect(() => {
    async function setupTray() {
      const existingTray = await TrayIcon.getById("test");
      if (existingTray) return

      const mainWindow = Window.getCurrent();
      const menu = await Menu.new({
        items: [
          await MenuItem.new({
            id: 'show',
            text: 'Show Window',
            action: () => mainWindow.show(),
          }),
          await MenuItem.new({
            id: 'hide',
            text: 'Hide Window',
            action: () => getCurrentWindow().hide(),
          }),
          await MenuItem.new({
            id: 'quit',
            text: '退出',
            action: () => {
              console.log('退出')
              exit(1)
            }
          })
        ]
      });

      const icon = await Image.fromPath('../src-tauri/icons/icon.png');

      await TrayIcon.new({
        id: 'test',
        menu,
        icon,
        menuOnLeftClick: false,
        // action: async (event) => {
        //   if (event.type === 'Click' && event.button === 'Left') {
        //     await mainWindow.show();
        //     await mainWindow.center();
        //   }
        // }
      });
    }

    setupTray().catch(console.error);
  }, []);

  return (
    <div data-tauri-drag-region className="h-screen w-screen flex items-center justify-center">
      <div className="p-4 flex flex-col gap-4">
        <Button variant="default">Default Button</Button>
        <Button variant="destructive">Destructive Button</Button>
        <Button variant="outline">Outline Button</Button>
      </div>
    </div>
  );
}

export default App;
