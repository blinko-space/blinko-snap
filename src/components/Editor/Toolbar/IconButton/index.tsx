import { Icon } from "@iconify/react";
import { Tooltip } from "@nextui-org/react";
import { motion } from "motion/react";
import { observer } from "mobx-react-lite";

export const IconButton = observer(({ tooltip, icon, onClick, classNames, children }: {
  tooltip: string,
  icon: string | any,
  onClick?: (e) => void,
  classNames?: {
    base?: string,
    icon?: string,
  },
  children?: any
}) => {
  return <Tooltip content={tooltip} placement="bottom" delay={1000}>
    <motion.div whileTap={{ y: 1 }} className={`p-[2px] hover:bg-hover cursor-pointer rounded-md flex items-center justify-center ${classNames?.base}`} onClick={e => {
      onClick?.(e)
    }}>
      <Icon icon={icon} className={classNames?.icon} width="20" height="20" />
      {children}
    </motion.div>
  </Tooltip>
})