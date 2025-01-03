import { useEffect } from "react";
import { Switch } from "@nextui-org/react";
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';
import { RootStore } from "@/store/root";
import { BlinkoSnapStore } from "@/store/blinkoSnapStore";

export const Home = observer(() => {
  const { t } = useTranslation();
  const blinkoSnap = RootStore.Get(BlinkoSnapStore);

  useEffect(() => {
    console.log(123)
    blinkoSnap.settings.call();
  }, []);

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        Home
      </div>
    </div>
  );
}); 