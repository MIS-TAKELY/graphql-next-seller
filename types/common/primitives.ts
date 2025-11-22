// types/common/primitives.ts
// Common primitive types and utility types

export type ID = string;
export type Timestamp = string | Date;
export type Decimal = number | string;
export type Money = number | string;

export interface Timestamps {
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface BaseEntity extends Timestamps {
  id: ID;
}

export type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
export interface JsonObject {
  [key: string]: JsonValue;
}
export type JsonArray = JsonValue[];

export type Record<K extends string | number | symbol, V> = {
  [P in K]: V;
};

