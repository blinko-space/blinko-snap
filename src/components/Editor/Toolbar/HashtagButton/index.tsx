import { IconButton } from '../IconButton';
import { useTranslation } from 'react-i18next';
import { EditorStore } from '../../editorStore';
import { Input } from '@nextui-org/react';
import { Popover, PopoverContent, PopoverTrigger } from '@nextui-org/react';
import { BlinkoStore } from '@/store/blinkoStore';
import { RootStore } from '@/store/root';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { ScrollArea } from '@/components/Common/ScrollArea';

interface Props {
  store: EditorStore;
  content: string;
}

export const HashtagButton = observer(({ store, content }: Props) => {
  const { t } = useTranslation();
  const blinko = RootStore.Get(BlinkoStore)
  const localStore = RootStore.Local(() => ({
    show: false,
    setShow: (show: boolean) => {
      localStore.show = show
    },
    isSearchMode: true,
    searchText: '',
    selectedIndex: 0,
    get tagList() {
      if (!localStore.searchText) {
        return blinko.tagList?.value?.pathTags
      }
      return blinko.tagList?.value?.pathTags.filter(i =>
        i.toLowerCase().includes(localStore.searchText.toLowerCase().replace("#", ''))
      )
    },
  }))

  useEffect(() => {
    localStore.searchText = ''
  }, [])

  return (
    <Popover
      placement="bottom"
      isOpen={localStore.show}
      onOpenChange={localStore.setShow}
    >
      <PopoverTrigger>
        <div
          onClick={e => {
            e.preventDefault()
            e.stopPropagation()
            localStore.setShow(true)
          }}>
          <IconButton
            tooltip={t('insert-hashtag')}
            icon="mdi:hashtag"
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className='flex flex-col max-w-[300px] p-2'>
        <ScrollArea className={'max-h-[300px]'} onBottom={() => { }}>
          <Input
            className='mb-2'
            placeholder={t('search-tags')}
            size='sm'
            autoFocus
            value={localStore.searchText} onChange={e => {
              localStore.searchText = e.target.value
            }} />

          {localStore.tagList?.map((i, index) => (
            <div
              key={i}
              data-index={index}
              className={`cursor-pointer hover:bg-hover transition-all px-2 py-1 rounded-lg
            ${index === localStore.selectedIndex ? 'bg-hover' : ''}`}
              onClick={e => {
                localStore.setShow(false)
                store.vditor?.insertValue(`#${i}&nbsp;`, true)
                store.onChange?.(store.vditor?.getValue() ?? '')
                setTimeout(() => {
                  store.focus()
                }, 300)
              }}
            >
              #{i}
            </div>
          ))}
          {localStore.tagList?.length == 0 && (
            <div className='text-ignore font-bold text-sm'>
              {t('no-tag-found')}
            </div>
          )}
        </ScrollArea>

      </PopoverContent>
    </Popover >

  );
}); 