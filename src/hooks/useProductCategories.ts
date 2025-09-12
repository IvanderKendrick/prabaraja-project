import { useState, useEffect } from 'react';
import { useProducts } from './useProducts';

interface ProductCategory {
  name: string;
  productCount: number;
}

export const useProductCategories = () => {
  const { data: products = [] } = useProducts();
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [customCategories, setCustomCategories] = useState<string[]>([]);

  // Load custom categories from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('productCategories');
    if (saved) {
      setCustomCategories(JSON.parse(saved));
    }
  }, []);

  // Calculate categories with product counts
  useEffect(() => {
    const defaultCategories = ["Electronics", "Office", "Furniture"];
    const allCategoryNames = [...new Set([...defaultCategories, ...customCategories])];
    
    const categoriesWithCounts = allCategoryNames.map(name => {
      const productCount = products.filter(p => p.category === name).length;
      return { name, productCount };
    });

    setCategories(categoriesWithCounts);
  }, [products, customCategories]);

  const addCategory = (categoryName: string) => {
    if (!categoryName.trim()) return false;
    
    const normalizedName = categoryName.trim();
    const allCategories = [...categories.map(c => c.name), ...customCategories];
    
    if (allCategories.includes(normalizedName)) {
      return false; // Category already exists
    }

    const newCustomCategories = [...customCategories, normalizedName];
    setCustomCategories(newCustomCategories);
    localStorage.setItem('productCategories', JSON.stringify(newCustomCategories));
    return true;
  };

  const deleteCategory = (categoryName: string) => {
    const productCount = products.filter(p => p.category === categoryName).length;
    
    if (productCount > 0) {
      return { success: false, message: `Cannot delete category "${categoryName}" because it has ${productCount} product(s) assigned to it.` };
    }

    const newCustomCategories = customCategories.filter(c => c !== categoryName);
    setCustomCategories(newCustomCategories);
    localStorage.setItem('productCategories', JSON.stringify(newCustomCategories));
    return { success: true, message: `Category "${categoryName}" deleted successfully.` };
  };

  const getAllCategoryNames = () => {
    return categories.map(c => c.name);
  };

  return {
    categories,
    addCategory,
    deleteCategory,
    getAllCategoryNames,
  };
};