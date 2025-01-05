import { RootStore } from "@/store"
import { Icon } from "@iconify/react"
import { observer } from "mobx-react-lite"
import { useTranslation } from "react-i18next"
import { Popover, PopoverTrigger, PopoverContent, Button } from "@nextui-org/react";

export const TipsPopover = observer((props: { children: React.ReactNode, content, onConfirm, onCancel?, isLoading?: boolean }) => {
  const { t } = useTranslation()
  const { isLoading = false } = props
  return <Popover placement="bottom" showArrow={true}>
    <PopoverTrigger>
      {props.children}
    </PopoverTrigger>
    <PopoverContent>
      <div className="px-1 py-2 flex flex-col">
        <div className='text-yellow-500 '>
          <div className="font-bold mb-2">{props.content}</div>
        </div>
        <div className='flex my-1 gap-2'>
          <Button startContent={<Icon icon="iconoir:cancel" width="20" height="20" />} variant="flat" size="sm" className="ml-auto" color='default' onPress={e => {
            // RootStore.Get(DialogStandaloneStore).close()
            props.onCancel?.()
          }}>{t('cancel')}</Button>
          <Button startContent={<Icon icon="cil:check-alt" width="20" height="20" />} isLoading={isLoading}  size="sm" color='danger' onPress={async e => {
            props.onConfirm?.()
          }}>{t('confirm')}</Button>
        </div>
      </div>
    </PopoverContent>
  </Popover>
})