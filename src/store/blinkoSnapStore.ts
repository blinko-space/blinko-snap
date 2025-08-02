import { makeAutoObservable } from 'mobx';
import { getSettings, setSetting } from '../lib/sql';
import { Store } from './standard/base';
import { PromiseState } from './standard/PromiseState';

export class BlinkoSnapStore implements Store {
  sid = 'blinkoSnapStore';

  constructor() {
    makeAutoObservable(this);
  }

  settings = new PromiseState({
    function: async () => {
      const results = await getSettings();
      return results;
    },
  })

  // Update autoStart setting
  async setAutoStart(value: boolean) {
    await setSetting('autoStart', value.toString());
    this.settings.call();
  }

  // Update hideDockIcon setting
  async setHideDockIcon(value: boolean) {
    await setSetting('hideDockIcon', value.toString());
    this.settings.call();
  }
}