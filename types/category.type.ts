export interface Category {
  id: string;
  name: string;
  children?: Category[]; // recursion for nested categories
  parent?: Category; // recursion for nested categories
}
