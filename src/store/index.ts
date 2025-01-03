import { configure } from "mobx";
import { RootStore } from "./root";

export const rootStore = RootStore.init();
export const useStore = () => RootStore.init();
configure({
  enforceActions: 'never' 
});
export { RootStore };