declare module 'lru-cache' {
  class LRUCache<K, V> {
    constructor(options?: { max?: number; maxAge?: number });
    get(key: K): V | undefined;
    set(key: K, value: V, maxAge?: number): boolean;
    reset(): void;
  }

  export = LRUCache;
}
