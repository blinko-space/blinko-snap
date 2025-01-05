import { helper } from '@/lib/helper';
import { Icon } from '@iconify/react';
import { observer } from 'mobx-react-lite';
//@ts-ignore
import { FileIcon, defaultStyles } from 'react-file-icon';

export const FileIcons = observer(({ path, size = 15, className, isLoading = false }: { path: string, size?: number, className?: string, isLoading?: boolean }) => {
  const extension = helper.getFileExtension(path)
  return <div style={{ width: size + 'px', minWidth: size + 'px' }} className={`${className ?? ''}`}>
    <div className='w-full h-full relative'>
      {isLoading && <div className='absolute inset-0 flex items-center justify-center w-full h-full'>
        <Icon icon="line-md:uploading-loop" width="24" height="24" className='!text-green-500' />
      </div>}
      <div className={`${isLoading ? 'opactiy-10 ' : ''}`}><FileIcon extension={extension} {...defaultStyles[extension ?? '']} /></div>
    </div>
  </div>
})