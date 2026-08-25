import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  Sparkles,
  MapPin,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  Tractor,
  ShoppingCart,
  Heart,
  Share2,
  ArrowLeft,
  ChevronRight,
  Plus,
  Minus,
  MessageSquare,
} from 'lucide-react';
import { productApi, reviewApi, userApi } from '../../services/api';
import { Product, Review } from '../../types';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { Modal } from '../../components/common/Modal';
import { ProductCard } from '../../components/products/ProductCard';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const data = await productApi.getProductById(id);
        setProduct(data);
        setQuantity(data.minimumOrderQuantity || 1);
      } catch (err) {
        console.error('Failed to load product:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) return <Loader fullPage message="Fetching direct farm produce details..." />;
  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Produce not found</h2>
        <Link to="/shop" className="text-brand-600 font-bold mt-4 inline-block">
          ← Return to Marketplace
        </Link>
      </div>
    );
  }

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await addToCart(product.id, quantity);
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await userApi.toggleWishlist(product.id);
      setInWishlist(res.inWishlist);
    } catch (err) {
      console.error('Wishlist error:', err);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmittingReview(true);
    try {
      const newRev = await reviewApi.createReview({
        productId: product.id,
        rating,
        comment,
      });
      setProduct((prev) =>
        prev
          ? {
              ...prev,
              reviews: [newRev, ...(prev.reviews || [])],
              totalReviews: (prev.totalReviews || 0) + 1,
            }
          : prev
      );
      setReviewModalOpen(false);
      setComment('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const estimatedMarketPrice = product.estimatedMarketPrice || Math.round(product.price * 1.45);
  const savingsAmount = Math.round(estimatedMarketPrice - product.price);
  const farmerShare = product.farmerSharePercentage || Math.round((product.price / estimatedMarketPrice) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400">
        <Link to="/" className="hover:text-slate-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/shop" className="hover:text-slate-600">Marketplace</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-700 truncate">{product.name}</span>
      </nav>

      {/* Main Product Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
        {/* Left Image Section */}
        <div className="space-y-4">
          <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 relative shadow-md">
            <img
              src={
                product.image ||
                'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800'
              }
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.organic && (
              <div className="absolute top-4 left-4">
                <Badge variant="organic" size="md">
                  <Sparkles className="w-3.5 h-3.5" /> 100% Certified Organic
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Right Info & Actions */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between gap-4 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-3 py-1 rounded-full">
                {product.category?.name || 'Produce'}
              </span>
              <button
                onClick={handleToggleWishlist}
                className={`p-2.5 rounded-2xl border transition ${
                  inWishlist
                    ? 'bg-red-50 text-red-600 border-red-200'
                    : 'bg-white text-slate-400 border-slate-200 hover:text-slate-700'
                }`}
                title="Save to Wishlist"
              >
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-red-600' : ''}`} />
              </button>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight">
              {product.name}
            </h1>

            {/* Ratings & Harvest stats */}
            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500">
              <div className="flex items-center gap-1 bg-amber-50 text-amber-900 px-2.5 py-1 rounded-lg font-bold">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{product.avgRating || 4.9}</span>
                <span className="text-amber-700 font-normal">({product.totalReviews || 0} reviews)</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-4 h-4 text-brand-600" />
                <span>Harvested: Dawn today</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>In Stock: {product.availableQuantity} {product.unit}</span>
              </div>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="bg-brand-50/60 border border-brand-200 rounded-3xl p-6">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-800 block">
                  Direct Farm Price
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-brand-900">₹{product.price}</span>
                  <span className="text-sm font-bold text-slate-500">/{product.unit}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 line-through block">
                  Mandi Retail: ₹{estimatedMarketPrice}/{product.unit}
                </span>
                <span className="inline-block bg-amber-500 text-slate-950 text-xs font-black px-2.5 py-1 rounded-full mt-0.5">
                  Save ₹{savingsAmount}/{product.unit}
                </span>
              </div>
            </div>

            {/* Quantity Stepper & Add to Cart */}
            <div className="mt-6 flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center bg-white rounded-2xl border border-slate-200 p-1 shadow-sm w-full sm:w-auto justify-between">
                <button
                  onClick={() => setQuantity((q) => Math.max(product.minimumOrderQuantity || 1, q - 1))}
                  className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                  disabled={quantity <= (product.minimumOrderQuantity || 1)}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-bold text-slate-900 px-4 text-sm">
                  {quantity} {product.unit}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.availableQuantity, q + 1))}
                  className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                  disabled={quantity >= product.availableQuantity}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <Button
                onClick={handleAddToCart}
                loading={isAdding}
                disabled={product.availableQuantity <= 0}
                size="lg"
                variant="primary"
                className="w-full sm:flex-1 font-bold shadow-lg shadow-brand-600/30"
                icon={<ShoppingCart className="w-5 h-5" />}
              >
                {product.availableQuantity > 0 ? `Add ${quantity} ${product.unit} to Cart` : 'Sold Out'}
              </Button>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Produce Details</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{product.description}</p>
          </div>

          {/* Farmer Card */}
          {product.farmer && (
            <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <img
                  src={
                    product.farmer.avatar ||
                    product.farmer.user?.avatar ||
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'
                  }
                  alt={product.farmer.farmName}
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-brand-500"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-white text-sm">{product.farmer.farmName}</h4>
                    <ShieldCheck className="w-4 h-4 text-brand-400" />
                  </div>
                  <p className="text-xs text-slate-400">{product.farmer.location}</p>
                </div>
              </div>

              <Link to={`/farmers/${product.farmer.id}`}>
                <Button size="sm" variant="outline" className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700">
                  Visit Farm
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Price Transparency Breakdown for this product */}
      <section className="pt-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-3 py-1 rounded-full">
              Full Financial Disclosure
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
              Price Breakdown & Middlemen Elimination
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              On FarmDirect, <span className="font-bold text-brand-700">{farmerShare}% of your ₹{product.price} payment</span> goes straight to the grower.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <span className="text-xs text-emerald-800 font-semibold block">Farmer Direct Payout</span>
              <span className="text-2xl font-black text-emerald-950">₹{product.price}/{product.unit}</span>
              <span className="text-[11px] text-emerald-700 block mt-1">100% of farm listed price</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 font-semibold block">Estimated Mandi Middlemen Cut</span>
              <span className="text-2xl font-black text-red-600">₹{savingsAmount}/{product.unit}</span>
              <span className="text-[11px] text-slate-400 block mt-1">Eliminated by direct model</span>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
              <span className="text-xs text-blue-800 font-semibold block">Platform Service Fee (5%)</span>
              <span className="text-2xl font-black text-blue-950">₹{Math.round(product.price * 0.05)}/{product.unit}</span>
              <span className="text-[11px] text-blue-700 block mt-1">Quality verification & software</span>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="pt-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Verified Customer Reviews</h3>
              <p className="text-xs text-slate-500 mt-0.5">Real feedback from consumers who ordered this harvest.</p>
            </div>

            {isAuthenticated && (
              <Button
                onClick={() => setReviewModalOpen(true)}
                size="sm"
                variant="outline"
                icon={<MessageSquare className="w-4 h-4" />}
              >
                Write a Review
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {!product.reviews || product.reviews.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No reviews yet for this harvest item.</p>
            ) : (
              product.reviews.map((rev) => (
                <div key={rev.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">
                        {rev.user?.name || 'Verified Customer'}
                      </span>
                      <div className="flex text-amber-400">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Related Products */}
      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <section className="space-y-6 pt-6">
          <h3 className="text-xl font-bold text-slate-900">More From This Category</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {product.relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Add Review Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title={`Review ${product.name}`}
      >
        <form onSubmit={handleSubmitReview} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Rating (1 to 5 Stars)
            </label>
            <div className="flex gap-2 text-2xl">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className={`transition ${star <= rating ? 'text-amber-400' : 'text-slate-200'}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Your Review & Produce Quality Comments
            </label>
            <textarea
              required
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell others about freshness, taste, packaging, and delivery condition..."
              className="w-full p-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setReviewModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submittingReview}>
              Submit Review
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
