// types/category/category.types.ts
// Category related types

import type { BaseEntity, Timestamps } from "../common/primitives";

export interface Category extends BaseEntity {
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  isActive?: boolean;
  parent?: Category | null;
  children?: Category[];
  categoryId?: string; // Alias for id, used in some places
}

