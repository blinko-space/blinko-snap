import { useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { Settings } from './pages/Settings';
import { Home } from './pages/Home';
import { RootStore } from "./store/root";
import { BaseStore } from "./store/baseStore";
import { AppProvider } from "./store/module/AppProvider";
import { observer } from 'mobx-react-lite';

const AppContent = observer(() => {
  const { t } = useTranslation();
  const base = RootStore.Get(BaseStore);

  useEffect(() => {
    const init = async () => {
      try {
        await base.initApp();
      } catch (error) {
        console.error(t('initError'), error);
      }
    };

    init().catch(console.error);
  }, []);

  return (
    <div data-tauri-drag-region className="h-screen w-screen flex items-center justify-center bg-background">
      {base.currentRoute}
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
