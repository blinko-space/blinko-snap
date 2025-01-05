import { BlinkoStore } from "@/store/blinkoStore"
import { RootStore } from "@/store/root"

export const Extend: IHintExtend[] = [{
  key: '#',
  hint(value: string) {
    const blinko = RootStore.Get(BlinkoStore)
    return blinko.tagList?.value?.pathTags.filter(i =>
      i.toLowerCase().includes(value.toLowerCase().replace("#", ''))
    ).map(i => {
      return {
        html: `<span class="blinko-tag-hint">#${i}</span>`,
        value:`#${i}&nbsp;`
      }
    }) ?? []
  }
}]