export interface PagePagination {
  page?: number;
  pageSize?: number;
}

export interface OffsetPagination {
  limit?: number;
  start?: number;
}

export interface FilterOperator<T, K extends keyof T> {
  $eq?: T[K];
  $ne?: T[K];
  $lt?: number | string;
  $lte?: number | string;
  $gt?: number | string;
  $gte?: number | string;
  $in?: Array<T[K]>;
  $notIn?: T[K];
  $contains?: T[K];
  $notContains?: T[K];
  $containsi?: T[K];
  $notContainsi?: T[K];
  $null?: boolean;
  $notNull?: boolean;
  $between?: [T[K], T[K]];
  $startsWith?: string;
  $endsWith?: string;
}

export type NullGuard<T> = {
  [K in keyof NonNullable<T>]: NonNullable<NonNullable<T>[K]>;
};

export interface ArrayFilterOperator<T> {
  $or?: Array<Filter<T>>;
  $and?: Array<Filter<T>>;
}

export type PopulationMap<T> = {
  [K in keyof T]?: boolean;
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
  select?: Array<keyof T>;
  filters?: Filter<NullGuard<T>>;
  publicationState?: 'preview' | 'live';
  pagination?: PagePagination | OffsetPagination;
  populate?: Array<keyof T> | PopulationMap<T> | Array<string>;
}
