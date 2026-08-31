import React from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  Tractor,
  Sparkles,
  Plus,
  Minus,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { Badge } from '../common/Badge';

interface ProductCardProps {
  product: Product;
  marketContext?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, marketContext = 'fresh' }) => {
  const { cart, addToCart, updateQuantity } = useCart();

  if (!product) return null;

  const isBulk = marketContext === 'bulk' && product.bulkPricingEnabled;
  const price = isBulk ? (product.bulkPrice || product.price) : product.price;
  const activeMinQty = isBulk ? (product.bulkMinimumQuantity || 1) : (product.minimumOrderQuantity || 1);
  const purchaseType = isBulk ? 'BULK_DEAL' : 'FRESH_MARKET';
  
  // Find if this item is in the cart with the SAME purchaseType
  const cartItem = cart?.items?.find((item) => item?.productId === product?.id && item?.purchaseType === purchaseType);
  const inCartQty = cartItem ? cartItem.quantity : 0;

  const numericPrice = typeof price === 'number' ? price : (Number(price) || 0);
  const estimatedMarketPrice =
    typeof product.estimatedMarketPrice === 'number'
      ? product.estimatedMarketPrice
      : Math.round(numericPrice * 1.45);
  const savings = Math.max(0, estimatedMarketPrice - numericPrice);
  const savingsPercent = estimatedMarketPrice > 0 ? Math.round((savings / estimatedMarketPrice) * 100) : 0;

  const availableQty = (typeof product.availableQuantity === 'number' ? product.availableQuantity : (Number(product.availableQuantity) || 0)) - (typeof product.reservedQuantity === 'number' ? product.reservedQuantity : 0);
  const isLowStock = availableQty <= 15 && availableQty > 0;
  const isOutOfStock = availableQty < activeMinQty;

  const farmerId = product.farmer && typeof product.farmer === 'object' ? product.farmer.id : (product.farmerId || '');
  const farmName = product.farmer && typeof product.farmer === 'object' ? (product.farmer.farmName || 'Verified Farm') : 'Verified Farm';

  return (
    <div className="group bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden relative hover:-translate-y-1">
      {/* Badges on Top of Image */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-50">
        <Link to={`/products/${product.id || ''}`} className="block w-full h-full">
          <img
            src={
              product.image ||
              'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400'
            }
            alt={product.name || 'Farm Produce'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => { e.currentTarget.src = 'https://placehold.co/400x400/f8fafc/94a3b8?text=Product+Image+Unavailable'; }}
          />
        </Link>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex flex-col gap-1.5">
            {product.organic && (
              <span className="bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-200" /> Organic
              </span>
            )}
            {savingsPercent > 0 && (
              <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-md shadow-sm">
                {savingsPercent}% LESS THAN MANDI
              </span>
            )}
          </div>

          <div className="bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 text-[11px] font-bold text-slate-800">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{product.avgRating || 4.9}</span>
          </div>
        </div>

        {/* Stock status overlay if out of stock */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-red-600 text-white font-black text-xs px-3 py-1 rounded-full shadow-lg">
              Depleted for Today
            </span>
          </div>
        )}
      </div>

      {/* Card Content Details */}
      <div className="p-5 flex flex-col justify-between flex-1 space-y-3">
        <div>
          {/* Farmer & Location Origin */}
          <Link
            to={farmerId ? `/farmers/${farmerId}` : '/farmers'}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-700 hover:text-brand-800 transition"
          >
            <Tractor className="w-3.5 h-3.5 text-brand-600" />
            <span className="truncate max-w-[170px]">{farmName}</span>
            <ShieldCheck className="w-3 h-3 text-brand-500" />
          </Link>

          {/* Product Name */}
          <Link to={`/products/${product.id || ''}`} className="block mt-1">
            <h3 className="font-display font-bold text-slate-900 text-base leading-snug group-hover:text-brand-700 transition line-clamp-2">
              {product.name || 'Fresh Harvest'}
            </h3>
          </Link>

          <span className="text-xs text-slate-400 font-medium block mt-0.5">
            Unit: 1 {product.unit || 'KG'} {isBulk && <span className="text-amber-600 font-bold ml-1">(Min {activeMinQty} {product.unit})</span>}
          </span>
        </div>

        {/* Price & Add to Cart Section */}
        <div className="pt-2 border-t border-slate-100/80 flex items-center justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg sm:text-xl font-black text-slate-900">
                ₹{numericPrice}
              </span>
              <span className="text-xs text-slate-400 line-through font-semibold">
                ₹{estimatedMarketPrice}
              </span>
            </div>
            {savings > 0 && (
              <span className="text-[10px] text-emerald-700 font-bold block -mt-0.5">
                Save ₹{savings} direct
              </span>
            )}
          </div>

          {/* Interactive Stepper / ADD Button */}
          {isOutOfStock ? (
            <button
              disabled
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold cursor-not-allowed"
            >
              Sold Out
            </button>
          ) : inCartQty > 0 ? (
            <div className="flex items-center bg-brand-600 text-white rounded-xl shadow-md p-0.5 ring-2 ring-brand-500/20">
              <button
                onClick={() => {
                  if (cartItem?.id) updateQuantity(cartItem.id, inCartQty - 1);
                }}
                className="p-1 hover:bg-brand-700 rounded-lg transition"
                title="Decrease"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-2.5 text-xs font-black min-w-[20px] text-center">
                {inCartQty}
              </span>
              <button
                onClick={() => {
                  if (cartItem?.id) updateQuantity(cartItem.id, inCartQty + 1);
                }}
                className="p-1 hover:bg-brand-700 rounded-lg transition"
                title="Increase"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => addToCart(product.id, activeMinQty, purchaseType)}
              className="px-4 py-2 rounded-xl bg-brand-50 hover:bg-brand-600 text-brand-700 hover:text-white font-black text-xs border border-brand-200 hover:border-brand-600 transition-all duration-200 shadow-sm flex items-center gap-1 group/btn active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 group-hover/btn:rotate-90 transition-transform duration-200" />
              <span>ADD {activeMinQty > 1 ? `${activeMinQty} ${product.unit}` : ''}</span>
            </button>
          )}

        </div>
      </div>
    </div>
  );
};
