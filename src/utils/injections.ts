import type { Injection, WithEntityID } from '../types/query';

export function injectorFactory<K, T>(
  inject?: Injection<K, T>,
): Injection<K, WithEntityID<T>> {
  if (!inject) {
    const defaultInjector: Injection<K, WithEntityID<T>> = current => current;
    return defaultInjector;
  } else {
    return inject as any as Injection<K, WithEntityID<T>>;
  }
}
