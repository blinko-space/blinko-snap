import { makeAutoObservable } from "mobx";

import { type RootStore } from "../root";

export abstract class Store {
  sid?: string;
  stype?: string;
  disabled?: boolean;
  autoObservable?: boolean;
  autoAsyncable?: boolean;
  _active?: number;

  stores?: Store[];

  private pannel?: {
    title: string;
    render: any;
  };
  devtools?: {
    enable?: boolean;
    started?: boolean;
    panels: Store["pannel"][];
  };

  private slot?: {
    name?: string;
    input?: Record<string, any>;
    render: React.FC;
  };
  slots?: Record<string, Store["slot"]>;

  events?: Record<string, { name: string; handler(args: { e: MouseEvent; v?: any }): any }>;

  provider?({ rootStore }: { rootStore: RootStore }): any;

  onNewStore?({ rootStore, store }: { rootStore: RootStore; store: Store }): void;
  onAddedStores?({ rootStore }: { rootStore: RootStore }): void;
  onAdded?({ rootStore }: { rootStore: RootStore }): void;

  init?(): void;
  JSONView?: Record<string, { name: string; render: React.FC }>;

  onKeyBindings?: () => { key: string; fn: () => void }[];

  constructor() {
    this._active = this._active ?? 0;
  }
}

export type StoreClass<T extends Store> = new (...args: any[]) => T;

export interface BaseState {
  value: number;
  setValue(value: any): any;
}

export class StringState<T extends string> {
  //@ts-ignore
  value: T = null;
  constructor(args: Partial<StringState<T>> = {}) {
    Object.assign(this, args);
    makeAutoObservable(this);
  }
  setValue(value: T) {
    this.value = value;
  }
}

export class BooleanState {
  value: boolean = false;
  constructor(args: Partial<BooleanState> = {}) {
    Object.assign(this, args);
    makeAutoObservable(this);
  }
  setValue(value: boolean) {
    this.value = value;
  }
}

export class NumberState {
  value: number = 0;
  constructor(args: Partial<NumberState> = {}) {
    Object.assign(this, args);
    makeAutoObservable(this);
  }
  setValue(value: number) {
    this.value = value;
  }
}

export class ValueState<T> {
  //@ts-ignore
  _value: T = null;
  constructor(args: Partial<ValueState<T>> = {}) {
    Object.assign(this, args);
    makeAutoObservable(this);
  }

  get value() {
    return this.getValue ? this.getValue(this._value) : this._value;
  }

  set value(value) {
    this._value = value;
  }

  getValue: (value: T) => T;

  setValue(value: T) {
    this._value = value;
  }
}

// export interface Events {
//   data: (data: any) => void;
//   error: (error: any) => void;
//   update: () => void;
//   wait: () => void;
// }
