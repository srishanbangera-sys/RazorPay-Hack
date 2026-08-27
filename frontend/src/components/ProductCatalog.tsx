import React, { useState } from 'react';
import { Package, Search, Sparkles, Tag, CheckCircle, AlertCircle } from 'lucide-react';
import { Product } from '../types';

interface ProductCatalogProps {
  products: Product[];
  onSelectForAgent: (productName: string) => void;
  isLoading: boolean;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  onSelectForAgent,
  isLoading
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['all', 'footwear', 'electronics', 'fitness', 'accessories', 'clothing'];

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'all' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = searchQuery === '' || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="glass-card rounded-xl p-5 border border-merchant-border">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-slate-800 text-slate-300">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Merchant Product Catalog</h3>
            <p className="text-[11px] text-slate-400">Structured Machine-Readable Inventory</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search catalog..."
            className="bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 w-48"
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-1.5 mb-4 pb-3 border-b border-merchant-border/80">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize transition-colors ${
              selectedCategory === cat
                ? 'bg-brand-600 text-white'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/60'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[380px] overflow-y-auto pr-1">
        {filteredProducts.map((product) => {
          const isOOS = product.stock === 0;
          return (
            <div
              key={product.id}
              className="p-3.5 rounded-xl bg-merchant-surface/90 border border-merchant-border flex flex-col justify-between hover:border-slate-600 transition-all text-xs"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="font-bold text-white leading-snug">{product.name}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                    isOOS ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {product.category}
                  </span>
                </div>

                <p className="text-slate-400 text-[11px] line-clamp-2 mb-2 leading-relaxed">
                  {product.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between mt-1">
                <div>
                  <div className="font-bold text-white font-mono text-sm">₹{product.price.toLocaleString()}</div>
                  <div className={`text-[10px] ${isOOS ? 'text-rose-400 font-semibold' : 'text-slate-400'}`}>
                    {isOOS ? 'Sold Out' : `${product.stock} in stock`}
                  </div>
                </div>

                <button
                  disabled={isLoading}
                  onClick={() => onSelectForAgent(`Buy the ${product.name}`)}
                  className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold text-[11px] transition-colors disabled:opacity-50"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Ask Agent</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
