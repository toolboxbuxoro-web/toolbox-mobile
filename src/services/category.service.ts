const MEDUSA_API_URL = process.env.EXPO_PUBLIC_MEDUSA_API_URL || 'http://localhost:9000';
const PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_PUBLISHABLE_KEY || '';

export interface ProductCategory {
  id: string;
  name: string;
  handle: string;
  parent_category_id: string | null;
  parent_category?: ProductCategory | null;
  category_children?: ProductCategory[];
  metadata?: {
    icon_url?: string;
    image_url?: string;
    name_uz?: string;
    [key: string]: any;
  };
}

interface StoreCategoriesRes {
  product_categories: ProductCategory[];
  count: number;
}

class CategoryService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${MEDUSA_API_URL}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...(PUBLISHABLE_KEY && { 'x-publishable-api-key': PUBLISHABLE_KEY }),
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(`Medusa API Error: ${response.status} ${JSON.stringify(errorBody)}`);
    }

    return response.json();
  }

  async getCategories(queryParams: string = ''): Promise<ProductCategory[]> {
    // Fetch only root categories (parent_category_id is null) with their children
    const params = queryParams 
      ? `${queryParams}&include_descendants_tree=true` 
      : 'include_descendants_tree=true';
    const data = await this.request<StoreCategoriesRes>(`/store/product-categories?${params}`);
    // Filter to only root categories (will contain nested children)
    return data.product_categories.filter(cat => !cat.parent_category_id);
  }

  async getCategoryByHandle(handle: string): Promise<ProductCategory | null> {
    const data = await this.request<StoreCategoriesRes>(`/store/product-categories?handle=${handle}&include_descendants_tree=true`);
    return data.product_categories.length > 0 ? data.product_categories[0] : null;
  }
}

export const categoryService = new CategoryService();
