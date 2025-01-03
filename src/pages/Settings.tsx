import { useEffect } from "react";
import { Switch } from "@nextui-org/react";
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';
import { BlinkoSnapStore } from "@/store/blinkoSnapStore";
import { RootStore } from "@/store/root";

export const Settings = observer(() => {
  const { t } = useTranslation();
  const blinkoSnap = RootStore.Get(BlinkoSnapStore);

  useEffect(() => {
    blinkoSnap.settings.call();
  }, []);

  return (
    <div className="p-6 w-full h-full">
      <h1 className="text-2xl font-bold mb-6">{t('settings')}</h1>
      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-2">
          <p>{t('autoStart')}</p>
          <Switch
            isSelected={blinkoSnap.settings.value?.autoStart}
            onValueChange={(checked) => blinkoSnap.setAutoStart(checked)}
            color="primary"
            size="lg"
            className="gap-2"
          />
        </div>
      </div>
    </div>
  );
}); 