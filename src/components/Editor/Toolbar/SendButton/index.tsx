import { Button } from '@nextui-org/react';
import { Icon } from '@iconify/react';
import { EditorStore } from '../../editorStore';
import { observer } from 'mobx-react-lite';

interface Props {
  store: EditorStore;
  isSendLoading?: boolean;
}

export const SendButton = observer(({ store, isSendLoading }: Props) => {
  return (
    <div
      onClick={
        (e) => {
          if (isSendLoading) return
          store.handleSend()
        }
      }
    >
      <div
        className='w-[60px] group ml-2 bg-primary text-foreground flex items-center justify-center rounded-[11px] cursor-pointer h-[28px]'
      >
        {(store.files?.some(i => i.uploadPromise?.loading?.value) || isSendLoading) ? (
          <Icon icon="eos-icons:three-dots-loading" width="24" height="24" className='text-[#F5A524]' />
        ) : (
          <Icon icon="iconamoon:send" width="14" height="14" className='primary-foreground !text-primary-foreground group-hover:rotate-[-35deg] transition-all' />
        )}
      </div>
    </div>
  );
})