export interface Category {
  id: string;
  name: string;
  categoryId?:string;
  children?: Category[]; // recursion for nested categories
  parent?: Category; // recursion for nested categories
}
