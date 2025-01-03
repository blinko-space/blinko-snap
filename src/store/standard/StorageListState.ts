import { makeAutoObservable } from "mobx";

import { helper } from "../../lib/helper";
import { _ } from "../../lib/lodash";

export class StorageListState<T = any> {
  key: string;
  list: T[] = [];

  static safeParse(val: any) {
    try {
      return JSON.parse(val);
    } catch (error) {
      return val;
    }
  }

  constructor(args: { key: string; }) {
    Object.assign(this, args);
    makeAutoObservable(this);
    this.load();
  }


  load() {
    try {
      const value = localStorage.getItem(this.key);
      if (value) {
        this.list = StorageListState.safeParse(value);
      }
      return StorageListState.safeParse(value)
    } catch (error) {
      console.error(error);
      return null;
    }
  }


  push(value: T) {
    this.list.push(value);
    this.save();
  }

  remove(index: number) {
    this.list.splice(index, 1);
    this.save();
  }

  save() {
    try {
      localStorage.setItem(this.key, JSON.stringify(this.list));
    } catch (error) {
    }
  }

  clear() {
    try {
      localStorage.removeItem(this.key);
      this.list = [];
    } catch (error) {
    }
  }
}
