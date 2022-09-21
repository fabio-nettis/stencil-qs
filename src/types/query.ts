export type NullGuard<T> = {
  [K in keyof NonNullable<T>]: NonNullable<NonNullable<T>[K]>;
};

export interface PagePagination {
  page?: number;
  pageSize?: number;
}

export interface OffsetPagination {
  limit?: number;
  start?: number;
}

export interface FilterOperator<T, K extends keyof T> {
  /**
   * Description: Equal (case-sensitive)
   */
  $eq?: T[K];
  /**
   * Description: Equal
   */
  $eqi?: T[K];
  /**
   * Description: Not equal
   */
  $ne?: T[K];
  /**
   * Description: Less than
   */
  $lt?: number | string;
  /**
   * Description: Less than or equal to
   */
  $lte?: number | string;
  /**
   * Description: Greater than
   */
  $gt?: number | string;
  /**
   * Description: Greater than or equal to
   */
  $gte?: number | string;
  /**
   * Description: Included in an array
   */
  $in?: Array<T[K]>;
  /**
   * Description: Not included in an array
   */
  $notIn?: Array<T[K]>;
  /**
   * Description: Contains (case-sensitive)
   */
  $contains?: T[K];
  /**
   * Description: Does not contain (case-sensitive)
   */
  $notContains?: T[K];
  /**
   * Description: Contains
   */
  $containsi?: T[K];
  /**
   * Description: Does not contain
   */
  $notContainsi?: T[K];
  /**
   * Description: Is null
   */
  $null?: boolean;
  /**
   * Description: Is not null
   */
  $notNull?: boolean;
  /**
   * Description: Is between
   */
  $between?: [T[K], T[K]];
  /**
   * Description: Starts with
   */
  $startsWith?: string;
  /**
   * Description: Ends with
   */
  $endsWith?: string;
}

export interface ArrayFilterOperator<T> {
  /**
   * Description: Joins the filters in an "or" expression
   */
  $or?: Array<Filter<T>>;
  /**
   * Description: Joins the filters in an "and" expression
   */
  $and?: Array<Filter<T>>;
}

export type PopulationMap<T> = {
  [K in keyof T]?: T[K] extends object
    ? T[K] extends Array<any>
      ? // @ts-ignore
        PopulationMap<T[K][0]> | boolean
      : PopulationMap<T[K]> | boolean
    : boolean;
};

export type Field<T, K extends keyof T> = {
  [OP in keyof FilterOperator<T, K>]?: FilterOperator<T, K>[OP];
};

export type NestedField<T, K extends keyof T> = {
  [P in keyof T[K]]?: T[K][P] extends object ? Filter<T[K][P]> : Field<T[K], P>;
};

export type Filter<T> =
  | {
      [K in keyof T]?: T[K] extends object
        ? T[K] extends Array<any> // @ts-ignore
          ? NestedField<T, K>[0]
          : NestedField<T, K>
        : Field<T, K>;
    }
  | ArrayFilterOperator<T>;

export interface QueryOptions<T> {
  /**
   * Sort the response
   *
   * [Reference](https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/rest/sort-pagination.html#sorting)
   */
  sort?: Array<keyof T> | Array<string> | keyof T | string;
  /**
   * Select only specific fields to display
   *
   * [Reference](https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/rest/populating-fields.html#field-selection)
   */
  fields?: Array<keyof T> | Array<string>;
  /**
   * Filter the response
   *
   * [Reference](https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/rest/filtering-locale-publication.html#filtering)
   */
  filters?: Filter<NullGuard<T>>;
  /**
   * Select the Draft & Publish state
   *
   * Only accepts the following values:
   *
   * - `live`
   * - `preview`
   *
   * [Reference](https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/rest/filtering-locale-publication.html#publication-state)
   */
  publicationState?: 'preview' | 'live';
  /**
   * Page through entries
   *
   * [Reference](https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/rest/sort-pagination.html#pagination)
   */
  pagination?: PagePagination | OffsetPagination;
  /**
   * String or Object	Populate relations, components, or dynamic zones
   *
   * [Reference](https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/rest/populating-fields.html#population)
   */
  populate?: Array<keyof T> | PopulationMap<T> | Array<string>;
  /**
   * Select one ore multiple locales
   *
   * [Reference](https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/rest/filtering-locale-publication.html#locale)
   */
  locale?: Array<string> | string;
}

export interface UnifiedFormat {
  id?: string;
  attributes?: Record<string, any>;
}

export type WithEntityID<T> = T & { id: string };

export type LocalizedResponse<T> = T & { localizations: Array<T> };

export type Injection<K, T> = (current: T, main: T, locale: K) => T;

export type ExecutionType = 'single' | 'array';
