import { injectorFactory } from '../utils/injections';

import type {
  Injection,
  UnifiedFormat,
  WithEntityID,
  LocalizedResponse,
} from '../types/query';

class StencilInternals {
  private static instance: StencilInternals;

  private constructor() {}

  /**
   * The static method that controls the access to the stencil internals
   * instance.
   *
   * This implementation let you subclass the StencilInternals class while
   * keeping just one instance of each subclass around.
   */
  public static getInstance(): StencilInternals {
    if (!StencilInternals.instance) {
      StencilInternals.instance = new StencilInternals();
    }

    return StencilInternals.instance;
  }

  /**
   * Determines if the property is null.
   *
   * @param obj The object to check
   * @param key The key to check
   * @returns {Boolean} If the property is null
   */
  isNull(obj: Record<string, any>, key: string): boolean {
    return obj[key]?.data === null;
  }

  /**
   * Determines if the property is a simple field like a number or a string
   *
   * @param obj The object to check
   * @param key The key to check
   * @returns {Boolean} If the property is a property
   */
  isProperty(obj: Record<string, any>, key: string) {
    return (
      (obj[key] === null || obj[key]?.data === undefined) &&
      !(obj[key] instanceof Object) && // is not instance of object
      !Array.isArray(obj[key]) // is not array
    );
  }

  /**
   * Determines if the property is a component or not. Components need to
   * be distinguished from relations because they do not contain a `data`
   * property.
   *
   * @param obj The object to check
   * @param key The key to check
   * @returns {Boolean} If the property is a property
   */
  isComponent(obj: Record<string, any>, key: string): boolean {
    return (
      (obj[key] instanceof Object &&
        !obj[key].data &&
        obj[key].data !== null) ||
      Array.isArray(obj[key])
    );
  }

  /**
   * Takes in an object and returns a new object with the same properties but
   * without the attributes key by using the spread operator.
   *
   * @param obj The object to sanitize
   * @param isComponent If the response is a component
   * @returns The sanitized object
   */
  struct(obj: Record<string, any>, isComponent?: boolean): any {
    if (isComponent) return { ...obj };
    return { id: obj.id, ...obj.attributes };
  }

  /**
   * This is the function that recursively reformats the response from the API
   * by calling `sanitize` and thus itself on each property of the response if
   * required.
   *
   * #### Notice
   *
   * Usually this function is called by the `sanitize` function, than calling this
   * function directly, it will call it with the `isComponent` flag set to `true` to
   * indicate that the response is a component.
   *
   * @param {Object} obj - Property of the response from the API
   * @param {Boolean} component - If the response is a component
   * @returns {Object} The reformatted response
   */
  reformatResponse<T>(obj: UnifiedFormat, component?: boolean): T {
    const structure = this.struct(obj, component);
    for (const key of Object.keys(structure)) {
      if (this.isProperty(structure, key)) {
        continue;
      }

      if (this.isComponent(structure, key)) {
        structure[key] = this.flatten({ data: structure[key] }, true);
        continue;
      }

      if (this.isNull(structure, key)) {
        structure[key] = null;
        continue;
      }

      structure[key] = this.flatten(structure[key]);
    }
    return structure;
  }

  /**
   * This is the function that recursively localizes the response from the API
   * by calling `localize` and thus itself on each property of the response if
   * required.
   *
   * #### Notice
   *
   * Usually this function is called by the `localize` function, rather than calling this
   * function directly, use the `localize` function.
   *
   * @param {Object} obj - Property of the response from the API
   * @param {Boolean} component - If the response is a component
   * @returns {Object} The reformatted response
   */
  localizeResponse<K extends string, T = any>(
    sanitized: LocalizedResponse<T>,
    inject?: Injection<K, T>,
  ): Record<K, T> {
    // If the response does not contain a localizations key, error
    if (!sanitized?.localizations?.length) {
      throw Error('No localizations found for this content type');
    }

    // If the response does not contain a locale key, error
    if (!(sanitized as any)?.locale) {
      throw Error('No locale found for this content type');
    }

    const localMap: Record<K, T> = {
      [(sanitized as any).locale]: sanitized as T,
    } as any;

    for (const localization of sanitized.localizations) {
      const { locale, ...rest } = localization as any;
      (localMap as any)[locale as K] = { ...rest, locale } as any;
    }

    const injector: Injection<K, WithEntityID<T>> = injectorFactory<K, T>(
      inject,
    );

    for (const key of Object.keys(localMap)) {
      localMap[key as K] = injector(
        localMap[key as K] as WithEntityID<T>,
        sanitized as WithEntityID<LocalizedResponse<T>>,
        key as K,
      );
    }

    delete (localMap as any)[(sanitized as any).locale].localizations;
    return localMap;
  }

  /**
   * This function is used to flatten any response from the API. The response
   * is usually a deeply nested object (unified response format). This function
   * will iterate over the object and remove all nesting.
   *
   * ### Features
   *
   * - Supports nested objects
   * - Supports arrays
   * - Supports null values
   * - Supports components
   * - Supports dynamic zones
   *
   * ### Keep in mind
   *
   * When using this function, that the response is not always in the
   * unified response format, like in the users-permissions plugin, if no data key
   * is found in the response the function will throw.
   *
   * @param {Object} input The response from the API
   * @param {Boolean} isComponent Determines if the response is a component, you usually do not have to pass this option manually.
   * @returns {Object} The sanitized response
   */
  flatten<T>(input: any, isComponent?: boolean): T {
    if (!input?.data) {
      throw new Error(
        'Input does not contain a data key. Please check your response.',
      );
    }

    // If the input is not an array, call reformat on it
    if (!Array.isArray(input.data)) {
      return StencilInternals.getInstance().reformatResponse<T>(
        input.data,
        isComponent,
      );
    }

    // If the input is a array, call reformat on each element
    return input.data.map((item: any) => {
      return StencilInternals.getInstance().reformatResponse(item, isComponent);
    });
  }

  i18n = {
    /**
     * The `i18n.t` function is used to localize a single or single response object from
     * the API. It will iterate over the response and localize all strings, returning a
     * new object with the locale as key and the flattened response as value.
     *
     * ### Keep in mind
     *
     * When using this function, that the response is not always in the
     * unified response format, like in the users-permissions plugin, if no data key
     * is found in the response the function will throw.
     *
     * Also keep in mind that this function will only localize the response if the
     * locale key is present in the main entity and for each localization.
     *
     * @param {Object} response - The API response to localize
     * @returns The localized entry
     */
    single<
      K extends string = string,
      T extends Record<any, any> = Record<any, any>,
    >(response: any, inject?: Injection<K, T>): Record<K, T> {
      const instance = StencilInternals.getInstance();
      const sanitized: LocalizedResponse<T> = instance.flatten(response);
      return instance.localizeResponse<K, T>(sanitized, inject);
    },

    /**
     * The `i18n.array` function is used to localize a array response object from the API. It
     * will iterate over the response and localize the content type, returning a new object
     * with the locale as key and the flattened response as value.
     *
     * ### Keep in mind
     *
     * When using this function, that the response is not always in the
     * unified response format, like in the users-permissions plugin, if no data key
     * is found in the response the function will throw.
     *
     * Also keep in mind that this function will only localize the response if the
     * locale key is present in the main entity and for each localization.
     *
     * @param {Object} response - The API response to localize
     * @returns The localized entry
     */
    array<
      K extends string = string,
      T extends Record<any, any> = Record<any, any>,
    >(response: any, inject?: Injection<K, T>): Array<Record<K, T>> {
      const instance = StencilInternals.getInstance();
      const sanitized: LocalizedResponse<T> = instance.flatten(response);
      return sanitized.map((item: any) => {
        return instance.localizeResponse<K, T>(
          item as LocalizedResponse<T>,
          inject,
        );
      });
    },
  };
}

export default StencilInternals.getInstance();
