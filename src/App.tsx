import { useEffect } from "react";
import { Settings } from './pages/Settings';
import { Home } from './pages/Home';
import { RootStore } from "./store/root";
import { BaseStore } from "./store/baseStore";
import { AppProvider } from "./store/module/AppProvider";
import { observer } from 'mobx-react-lite';

const AppContent = observer(() => {
  const base = RootStore.Get(BaseStore);

  useEffect(() => {
    const init = async () => {
      try {
        await base.initApp();
      } catch (error) {
        console.error(error);
      }
    };

    init().catch(console.error);
  }, []);

  return (
    <div data-tauri-drag-region className={`${base.theme} h-screen w-screen flex items-center justify-center rounded-2xl overflow-hidden`}>
      {base.currentRoute === 'main' ? <Home /> : <Settings />}
    </div>
  );
});

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
