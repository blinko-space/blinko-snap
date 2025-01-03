

export class ObjectPool {
  static pool: { [key: string]: any } = {};

  static get<T extends (...args: any[]) => any, U = ReturnType<T>>(key: string, func: T): U {
    if (!ObjectPool.pool[key]) {
      ObjectPool.pool[key] = func();
    }
    return ObjectPool.pool[key];
  }
}