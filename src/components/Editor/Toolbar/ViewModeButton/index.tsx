import { IconButton } from '../IconButton';
import { useTranslation } from 'react-i18next';
import { eventBus } from '@/lib/event';

interface Props {
  viewMode: "wysiwyg" | "sv" | "ir";
}

export const ViewModeButton = ({ viewMode }: Props) => {
  const { t } = useTranslation();


  const getNextMode = () => {
    return viewMode === 'wysiwyg' ? 'sv' : 'wysiwyg';
  };

  const getButtonIcon = () => {
    return viewMode === 'wysiwyg' ? 'grommet-icons:form-view' : 'tabler:source-code';
  };

  const getTooltipText = () => {
    return viewMode === 'wysiwyg' ? t('preview-mode') : t('source-code');
  };

  return (
    <div className=''
      onClick={() => {
        const nextMode = getNextMode();
        eventBus.emit('editor:setViewMode', nextMode);
      }}
    >
      <IconButton
        tooltip={getTooltipText()}
        icon={getButtonIcon()}
      />
    </div>
  );
}; 