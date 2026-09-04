"use client";

import React from "react";
import { Product } from "@/types";
import { Luggage, ShoppingBag } from "lucide-react";

interface ProductCarouselProps {
  products: Product[];
  currencySymbol?: string;
  onSelectProduct?: (product: Product) => void;
}

export const ProductCarousel: React.FC<ProductCarouselProps> = ({
  products,
  currencySymbol = "$",
  onSelectProduct,
}) => {
  if (!products || products.length === 0) return null;

  // Aesthetic placeholder hues matching Figma (soft slate, soft baby blue, soft warm sand)
  const bgPalette = [
    "bg-slate-100",
    "bg-sky-50/80",
    "bg-amber-50/70",
    "bg-emerald-50/70",
  ];

  return (
    <div className="w-full mt-3 overflow-hidden">
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200">
        {products.map((p, idx) => {
          const bgHue = bgPalette[idx % bgPalette.length];
          const spec = p.sizes_or_capacity || p.specification || "";
          const subtitle = p.brand ? (spec ? `${p.brand} • ${spec}` : p.brand) : spec;

          return (
            <div
              key={p.id}
              onClick={() => onSelectProduct?.(p)}
              className="flex-shrink-0 w-44 rounded-xl border border-slate-200/90 bg-white p-2.5 transition-all duration-200 hover:shadow-md hover:border-slate-300 cursor-pointer group flex flex-col justify-between"
            >
              {/* Product preview box matching Figma */}
              <div
                className={`w-full h-24 rounded-lg ${bgHue} border border-slate-200/40 flex items-center justify-center relative overflow-hidden transition-transform group-hover:scale-[1.01]`}
              >
                <Luggage className="w-8 h-8 text-slate-400/70" />
                {p.stock <= 3 && p.stock > 0 && (
                  <span className="absolute top-1 right-1 text-[9px] font-medium px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                    Low stock
                  </span>
                )}
              </div>

              {/* Details */}
              <div className="mt-2 flex flex-col">
                <h4 className="text-xs font-semibold text-slate-900 truncate leading-snug group-hover:text-emerald-700 transition-colors">
                  {p.name}
                </h4>
                {subtitle && (
                  <p className="text-[11px] text-slate-500 truncate mt-0.5 font-normal">
                    {subtitle}
                  </p>
                )}
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    {currencySymbol}{p.price.toLocaleString()}
                    {currencySymbol === "$" && ".00"}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                    <ShoppingBag className="w-3 h-3" /> Select
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
