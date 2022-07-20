import Stencil from './stencil';
import { UnifiedFormat } from '../types/query';

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
        structure[key] = Stencil.api.flatten({ data: structure[key] }, true);
        continue;
      }

      if (this.isNull(structure, key)) {
        structure[key] = null;
        continue;
      }

      structure[key] = Stencil.api.flatten(structure[key]);
    }
    return structure;
  }
}

export default StencilInternals.getInstance();
