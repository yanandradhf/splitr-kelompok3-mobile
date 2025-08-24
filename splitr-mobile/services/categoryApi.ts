import api from './api';

export interface Category {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  createdAt: string;
}

export interface CategoriesResponse {
  categories: Category[];
}

export async function getCategories(): Promise<Category[]> {
  const response = await api.get('/api/mobile/categories');
  return response.data.categories;
}