import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Sparkles, MapPin } from 'lucide-react';
import { Product } from '../../types';
import { Badge } from '../common/Badge';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = React.useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    try {
      await addToCart(product.id, 1);
    } finally {
      setIsAdding(false);
    }
  };

  const estimatedMarketPrice = product.estimatedMarketPrice || Math.round(product.price * 1.45);
  const savingsPercent = Math.round(
    ((estimatedMarketPrice - product.price) / estimatedMarketPrice) * 100
  );

  return (
    <Link
      to={`/products/${product.id}`}
      className="group bg-white rounded-3xl border border-slate-200/80 hover:border-brand-400 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
    >
      <div>
        {/* Product Image */}
        <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
          <img
            src={
              product.image ||
              'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600'
            }
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {product.organic && (
              <Badge variant="organic">
                <Sparkles className="w-3 h-3" /> Certified Organic
              </Badge>
            )}
            {savingsPercent > 0 && (
              <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full shadow-sm">
                Save {savingsPercent}% vs Retail
              </span>
            )}
          </div>

          <div className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-semibold px-2 py-1 rounded-lg flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{product.avgRating || 4.9}</span>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4 sm:p-5">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            <span>{product.category?.name || 'Produce'}</span>
          </div>

          <h3 className="font-bold text-slate-900 text-base group-hover:text-brand-700 transition line-clamp-1">
            {product.name}
          </h3>

          {/* Farmer & Location info */}
          {product.farmer && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 mb-3">
              <MapPin className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
              <span className="truncate">
                {product.farmer.farmName} • {product.farmer.location.split(',')[0]}
              </span>
            </div>
          )}

          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>
      </div>

      {/* Pricing & Add to Cart */}
      <div className="p-4 sm:p-5 pt-0 border-t border-slate-50 mt-2">
        <div className="flex items-end justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-brand-700">₹{product.price}</span>
              <span className="text-xs font-semibold text-slate-400">/{product.unit}</span>
            </div>
            <div className="text-[11px] text-slate-400 line-through">
              Mandi Retail: ₹{estimatedMarketPrice}/{product.unit}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isAdding || product.availableQuantity <= 0}
            className="flex items-center justify-center w-10 h-10 rounded-2xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white shadow-md hover:shadow-brand-500/30 transition disabled:opacity-50"
            title={product.availableQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Link>
  );
};
