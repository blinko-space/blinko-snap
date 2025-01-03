import { makeAutoObservable } from "mobx";

export class StorageState<T> {
  key: string;
  value: T | any = null;
  default: T | any = null;
  validate?: (value: T) => T;

  constructor(args: Partial<StorageState<T>>) {
    Object.assign(this, args);
    makeAutoObservable(this);
    this.load();
  }

  static safeParse(val: any) {
    try {
      return JSON.parse(val);
    } catch (error) {
      return val;
    }
  }

  load() {
    try {
      if (typeof window == 'undefined') return
      const value = window?.localStorage?.getItem(this.key);
      this.value = StorageState.safeParse(value);
      if (this.value == null) {
        this.value = this.default;
      }
      return this.value;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  save(value?: T) {
    try {
      if (typeof window == 'undefined') return
      if (value !== null || value !== undefined) {
        this.value = this.validate ? this.validate(value!) : value;
      }
      window?.localStorage.setItem(this.key, JSON.stringify(this.value));
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  setValue(value?: T) {
    this.save(value);
  }

  clear() {
    try {
      if (typeof window == 'undefined') return
      window?.localStorage.removeItem(this.key);
    } catch (error) {
      return null;
    }
  }
}
