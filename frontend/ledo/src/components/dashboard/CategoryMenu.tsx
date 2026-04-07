// ============================================
// CATEGORY MENU COMPONENT
// ============================================

import React, { useState } from 'react';
import { useCategoryStore } from '../../stores/categoryStore';
import type { CategoryType } from '../../types';

interface CategoryMenuProps {
  onCategorySelect?: (category: CategoryType) => void;
  onSubcategorySelect?: (subcategory: string) => void;
}

export const CategoryMenu: React.FC<CategoryMenuProps> = ({
  onCategorySelect,
  onSubcategorySelect
}) => {
  const { categories } = useCategoryStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showSubmenu, setShowSubmenu] = useState(false);

  const handleCategoryClick = (categoryId: string, type: CategoryType) => {
    setSelectedCategory(categoryId);
    setShowSubmenu(!showSubmenu);
    onCategorySelect?.(type);
  };

  const handleSubcategoryClick = (subcategory: string) => {
    onSubcategorySelect?.(subcategory);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-gray-600 mr-2">Catégories:</span>
        {categories.map((category) => (
          <div key={category.id} className="relative">
            <button
              onClick={() => handleCategoryClick(category.id, category.type)}
              className={`
                inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                ${selectedCategory === category.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
              style={selectedCategory === category.id ? { backgroundColor: category.color } : {}}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
              {category.subcategories.length > 0 && (
                <svg className={`w-4 h-4 transition-transform ${selectedCategory === category.id && showSubmenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>

            {/* Submenu dropdown */}
            {selectedCategory === category.id && showSubmenu && category.subcategories.length > 0 && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                  Sous-catégories
                </div>
                {category.subcategories.map((subcategory) => (
                  <button
                    key={subcategory}
                    onClick={() => handleSubcategoryClick(subcategory)}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    {subcategory}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
