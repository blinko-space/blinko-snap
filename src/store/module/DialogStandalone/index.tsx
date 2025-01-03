import React from "react";
import Provider from "./Provider";
import { ModalSlots, SlotsToClasses } from "@nextui-org/react";
import { Store } from "@/store/standard/base";
import { RootStore } from "@/store/root";
import { makeAutoObservable } from "mobx";

export class DialogStandaloneStore implements Store {
  sid = "DialogStandaloneStore";
  provider = () => <Provider />;
  isOpen = false;
  preventClose = false;
  placement: "center" | "auto" | "top" | "bottom" | "top-center" | "bottom-center";
  title = "";
  noPadding = false;
  size: "sm" | "md" | "lg" | "xl" | "2xl" | "full" | "xs" | "3xl" | "4xl" | "5xl" | 'full' = "md";
  onlyContent = false;
  showOnlyContentCloseButton = false;
  className: string = "";
  transparent = false;
  classNames?: SlotsToClasses<ModalSlots>;
  theme = "default";
  content: React.ReactNode | ((props: any) => React.ReactNode) = "";
  isDismissable = true;

  constructor(args?: Partial<DialogStandaloneStore>) {
    const classNames = {
      ...args?.classNames
    }
    Object.assign(this, args, { classNames });
    makeAutoObservable(this)
  }


  setData(v: Partial<DialogStandaloneStore>) {
    this.showOnlyContentCloseButton = false
    Object.assign(this, v);
  }

  close() {
    this.isOpen = false;
    this.title = "";
    this.content = "";
    this.size = "md";
    this.isDismissable = true;
    this.onlyContent = false
    this.showOnlyContentCloseButton = false
  }

  static show(v: Partial<DialogStandaloneStore>) {
    const classNames = {
      ...v?.classNames
    }
    RootStore.Get(DialogStandaloneStore).setData({
      ...v,
      classNames,
      isOpen: true,
    });
  }

  static close() {
    RootStore.Get(DialogStandaloneStore).close();
  }
}
