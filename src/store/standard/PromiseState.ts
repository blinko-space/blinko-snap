import { makeAutoObservable } from "mobx";
import { RootStore } from "../root";
import { BaseState, BooleanState, NumberState } from "./base";
import { ToastPlugin } from "../module/Toast/Toast";
import { StorageState } from "./StorageState";
import { BaseStore } from "../baseStore";
import i18next from "i18next";
import { eventBus } from "@/lib/event";

export interface Events {
  data: (data: any) => void;
  error: (error: any) => void;
  select: (index: number) => void;
  update: () => void;
  finally: () => void;
  wait: () => void;
}

export const PromiseCall = async (f: Promise<any>, { autoAlert = true }: { autoAlert?: boolean, successMsg?: string } = {}) => {
  try {
    const r = await (new PromiseState({
      autoAlert,
      successMsg: i18next.t('operation-success'),
      function: async () => {
        return await f;
      }
    })).call()
    return r
  } catch (error) {
    //@ts-ignore
    RootStore.Get(ToastPlugin).error(error.message);
  }
}

export class PromiseState<T extends (...args: any[]) => Promise<any>, U = ReturnType<T>> {
  sid = "PromiseState";
  key?: string;
  loading = new BooleanState();
  //@ts-ignore
  value?: Awaited<U> = null;
  defaultValue: any = null;
  //@ts-ignore
  function: T;
  autoAlert = true;
  autoUpdate = false;
  context: any = undefined;
  autoInit = false;
  autoClean = false;
  successMsg: string = "";
  errMsg: string = "";
  loadingLock = true;
  currentIndex: BaseState = new NumberState({ value: 0 });
  get current() {
    if (Array.isArray(this.value) && this.value.length > 0 && !this.value[this.currentIndex.value]) {
      this.currentIndex.setValue(0);
    }
    //@ts-ignore
    return this.value[this.currentIndex.value];
  }

  async wait({ call = false } = {}): Promise<Awaited<U>> {
    return new Promise<Awaited<U>>((res, rej) => {
      if (this.value) {
        if (Array.isArray(this.value)) {
          if (this.value.length > 0) {
            res(this.value);
          }
        } else {
          res(this.value);
        }
      }

      //@ts-ignore
      if (call && !this.loading.value) this.call();
    });
  }

  constructor(args: Partial<PromiseState<T, U>> = {}) {
    Object.assign(this, args);
    if (this.defaultValue) {
      this.value = this.defaultValue;
    }
    if (this.key) {
      RootStore.init().add(this, { sid: this.key });
    } else {
      makeAutoObservable(this);
    }
  }
  //@ts-ignore
  async setValue(val) {
    let _val = val;
    this.value = _val;
  }

  async getOrCall(...args: Parameters<T>): Promise<Awaited<U> | undefined> {
    if (this.value) {
      if (Array.isArray(this.value)) {
        if (this.value.length > 0) {
          return this.value;
        } else {
          return this.call(...args);
        }
      } else {
        return this.value;
      }
    } else {
      return this.call(...args);
    }
  }

  async call(...args: Parameters<T>): Promise<Awaited<U> | undefined> {
    const toast = RootStore.Get(ToastPlugin);
    const base = RootStore.Get(BaseStore);



    try {
      if (this.loadingLock && this.loading.value == true) return;
      this.loading.setValue(true);
      const res = await this.function.apply(this.context, args);
      this.setValue(res);
      if (this.autoAlert && this.successMsg && res) {
        toast.success(this.successMsg);
      }
      return res;
    } catch (error) {
      if (this.autoAlert) {
        //@ts-ignore
        const message = error.message;
        if (message.includes("Unauthorized")) {
          toast.dismiss();
          eventBus.emit('user:signout')
        } else {
          this.errMsg = message;
          toast.error(message);
        }
      } else {
        throw error;
      }
    } finally {
      this.loading.setValue(false);
    }
  }
}


export const PageSize = new StorageState<number>({ key: "pageSize", value: 30, default: 30 })
export class PromisePageState<T extends (...args: any) => Promise<any>, U = ReturnType<T>> {
  page: number = 1;
  size = PageSize
  sid = "PromisePageState";
  key?: string;
  loading = new BooleanState();
  isLoadAll: boolean = false;
  get isEmpty() {
    if (this.loading.value) return false
    if (this.value == null) return true
    //@ts-ignore
    return this.value?.length == 0
  }
  get isLoading() {
    return this.loading.value
  }
  //@ts-ignore
  value?: Awaited<U> = [];
  defaultValue: any = [];
  //@ts-ignore
  function: T;

  autoAlert = true;
  autoUpdate = false;
  autoInit = false;
  autoClean = false;
  context: any = undefined;

  successMsg: string = "";
  errMsg: string = "";

  loadingLock = true;

  toJSON() {
    return {
      value: this.value,
    };
  }

  constructor(args: Partial<PromisePageState<T, U>> = {}) {
    Object.assign(this, args);
    if (this.defaultValue) {
      this.value = this.defaultValue;
    }
    if (this.key) {
      RootStore.init().add(this, { sid: this.key });
    } else {
      makeAutoObservable(this);
    }
  }
  //@ts-ignore
  async setValue(val) {
    let _val = val;
    this.value = _val;
  }

  private async call(...args: Parameters<T>): Promise<Awaited<U> | undefined> {
    const toast = RootStore.Get(ToastPlugin);
    const base = RootStore.Get(BaseStore);

    try {
      if (this.loadingLock && this.loading.value == true) return;
      this.loading.setValue(true);
      if (args?.[0]) {
        Object.assign(args?.[0], { page: this.page, size: Number(this.size.value) })
      } else {
        args[0] = { page: this.page, size: Number(this.size.value) }
      }
      if (this.isLoadAll) return this.value
      const res = await this.function.apply(this.context, args);
      if (!Array.isArray(res)) throw new Error("PromisePageState function must return array")
      if (res.length == 0) {
        this.isLoadAll = true
        if (this.page == 1) {
          this.setValue(null);
        }
        //@ts-ignore
        return this.value
      }
      if (res.length == Number(this.size.value)) {
        if (this.page == 1) {
          this.setValue(res);
        } else {
          //@ts-ignore
          this.setValue(this.value!.concat(res));
        }
      } else {
        if (this.page == 1) {
          this.setValue(res);
          this.isLoadAll = true
        } else {
          //@ts-ignore
          this.setValue(this.value!.concat(res));
          this.isLoadAll = true
        }
      }

      if (this.autoAlert && this.successMsg && res) {
        toast.success(this.successMsg);
      }
      return this.value;
    } catch (error) {
      //@ts-ignore
      if (this.autoAlert) {
        //@ts-ignore
        const message = error.message;
        if (message.includes("Unauthorized")) {
          toast.dismiss();
          eventBus.emit('user:signout')
        } else {
          this.errMsg = message;
          toast.error(message);
        }
      } else {
        throw error;
      }
    } finally {
      this.loading.setValue(false);
    }
  }

  async resetAndCall(...args: Parameters<T>): Promise<Awaited<U> | undefined> {
    this.isLoadAll = false
    this.page = 1
    //@ts-ignore
    return await this.call(...args)
  }
  async callNextPage(...args: Parameters<T>): Promise<Awaited<U> | undefined> {
    if (this.loading.value) return
    this.page++
    //@ts-ignore
    return await this.call(...args)
  }
}