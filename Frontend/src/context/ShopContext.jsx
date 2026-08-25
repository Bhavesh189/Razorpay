import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { productsData } from '../data/products';
import { couponsData } from '../data/coupons';

const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  // Live products loaded from 10,000+ Backend Catalog
  const [products, setProducts] = useState(productsData);
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCatalogCount, setTotalCatalogCount] = useState(productsData.length);

  // Search & Navigation
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubCategory, setSelectedSubCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("home"); // 'home' | 'mall' | 'supplier'

  // Filters
  const [filters, setFilters] = useState({
    gender: "all",
    priceRange: "all", // 'all' | '0-199' | '200-499' | '500-999' | '1000+'
    minRating: 0,
    minDiscount: 0,
    color: "all",
    size: "all",
    onlyInfinityMall: false,
    sortBy: "relevance", // 'relevance' | 'price-low' | 'price-high' | 'rating' | 'discount'
  });

  // Fetch Products dynamically from backend (10k+ catalog)
  const fetchProductsFromBackend = useCallback(async (page = 1, append = false) => {
    setIsProductsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "24",
        category: selectedCategory,
        subCategory: selectedSubCategory,
        search: searchQuery,
        sortBy: filters.sortBy,
        gender: filters.gender,
        priceRange: filters.priceRange,
        minRating: filters.minRating.toString(),
        minDiscount: filters.minDiscount.toString(),
        color: filters.color,
        size: filters.size,
        onlyInfinityMall: filters.onlyInfinityMall ? "true" : "false"
      });

      const res = await fetch(`/api/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.products) {
          if (append) {
            setProducts(prev => [...prev, ...data.products]);
          } else {
            setProducts(data.products);
          }
          setCurrentPage(data.currentPage);
          setTotalPages(data.totalPages);
          setTotalCatalogCount(data.total);
          setIsProductsLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn("Backend connection fallback, using local products cache:", err.message);
    }
    setIsProductsLoading(false);
  }, [selectedCategory, selectedSubCategory, searchQuery, filters]);

  // Refetch when filters or categories change
  useEffect(() => {
    fetchProductsFromBackend(1, false);
  }, [fetchProductsFromBackend]);

  // Load more items from 10k catalog (infinite scroll or button click)
  const loadMoreProducts = () => {
    if (currentPage < totalPages && !isProductsLoading) {
      fetchProductsFromBackend(currentPage + 1, true);
    }
  };

  // Cart & Wishlist with localStorage persistence
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('infinity_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('infinity_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // User & Auth
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('infinity_user');
      return saved ? JSON.parse(saved) : { isLoggedIn: false, phone: "", name: "" };
    } catch {
      return { isLoggedIn: false, phone: "", name: "" };
    }
  });

  // Saved Addresses
  const [addresses, setAddresses] = useState(() => {
    try {
      const saved = localStorage.getItem('infinity_addresses');
      return saved ? JSON.parse(saved) : [
        {
          id: "addr-1",
          name: "Bhavey Sharma",
          phone: "9876543210",
          houseNo: "Flat 402, Sunshine Heights",
          roadName: "MG Road, Near Metro Station",
          city: "New Delhi",
          state: "Delhi",
          pincode: "110001",
          isDefault: true
        }
      ];
    } catch {
      return [];
    }
  });

  const [selectedAddressId, setSelectedAddressId] = useState("addr-1");

  // Orders
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('infinity_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals state
  const [activeModal, setActiveModal] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('infinity_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('infinity_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('infinity_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('infinity_addresses', JSON.stringify(addresses));
  }, [addresses]);

  useEffect(() => {
    localStorage.setItem('infinity_orders', JSON.stringify(orders));
  }, [orders]);

  // Toast helper
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Cart operations
  const addToCart = (product, size = null, color = null, quantity = 1) => {
    const selectedSize = size || (product.sizes && product.sizes[0]) || "Free Size";
    const selectedColor = color || (product.colors && product.colors[0]) || "Default";
    const cartItemId = `${product.id}-${selectedSize}-${selectedColor}`;

    setCart(prev => {
      const existing = prev.find(item => item.cartItemId === cartItemId);
      if (existing) {
        return prev.map(item =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prev, {
          cartItemId,
          product,
          size: selectedSize,
          color: selectedColor,
          quantity
        }];
      }
    });

    showToast(`Added "${product.title.slice(0, 24)}..." to cart!`);
  };

  const updateCartQuantity = (cartItemId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
    } else {
      setCart(prev => prev.map(item =>
        item.cartItemId === cartItemId ? { ...item, quantity: newQty } : item
      ));
    }
  };

  const removeFromCart = (cartItemId) => {
    setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
    showToast("Item removed from cart");
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  // Wishlist operations
  const toggleWishlist = (productId) => {
    setWishlist(prev => {
      const isExist = prev.includes(productId);
      if (isExist) {
        showToast("Removed from Wishlist");
        return prev.filter(id => id !== productId);
      } else {
        showToast("Added to Wishlist ❤️");
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId) => wishlist.includes(productId);

  // Cart Totals Calculation
  const cartSummary = useMemo(() => {
    const totalMRP = cart.reduce((sum, item) => sum + (item.product.originalPrice * item.quantity), 0);
    const totalSellingPrice = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const productDiscount = totalMRP - totalSellingPrice;

    // Coupon discount calculation
    let couponDiscount = 0;
    if (appliedCoupon && totalSellingPrice >= appliedCoupon.minOrder) {
      if (appliedCoupon.flatDiscount) {
        couponDiscount = appliedCoupon.flatDiscount;
      } else if (appliedCoupon.discountPercent) {
        couponDiscount = Math.min(
          Math.round((totalSellingPrice * appliedCoupon.discountPercent) / 100),
          appliedCoupon.maxDiscount || 9999
        );
      }
    }

    const deliveryCharge = 0; // Infinity Store always offers Free Delivery
    const finalAmount = Math.max(0, totalSellingPrice - couponDiscount);
    const totalSavings = productDiscount + couponDiscount;
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    return {
      totalMRP,
      totalSellingPrice,
      productDiscount,
      couponDiscount,
      deliveryCharge,
      finalAmount,
      totalSavings,
      totalItems
    };
  }, [cart, appliedCoupon]);

  // Apply Coupon
  const applyCouponCode = (code) => {
    const cleanCode = code.trim().toUpperCase();
    const found = couponsData.find(c => c.code === cleanCode);
    if (!found) {
      return { success: false, message: "Invalid coupon code" };
    }
    if (cartSummary.totalSellingPrice < found.minOrder) {
      return { success: false, message: `Minimum order value ₹${found.minOrder} required for ${found.code}` };
    }
    setAppliedCoupon(found);
    showToast(`Coupon ${found.code} applied successfully! 🎉`);
    return { success: true, message: `Coupon applied: Saved ₹${found.flatDiscount || (found.discountPercent + '%')}` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast("Coupon removed");
  };

  // Reset Filters
  const resetFilters = () => {
    setFilters({
      gender: "all",
      priceRange: "all",
      minRating: 0,
      minDiscount: 0,
      color: "all",
      size: "all",
      onlyInfinityMall: false,
      sortBy: "relevance",
    });
    setSelectedCategory("all");
    setSelectedSubCategory("all");
    setSearchQuery("");
  };

  // Place Order
  const placeOrder = (paymentMethod, address) => {
    const newOrderId = `INF-${Date.now().toString().slice(-6)}`;
    const newOrder = {
      id: newOrderId,
      items: [...cart],
      summary: { ...cartSummary },
      paymentMethod,
      address,
      placedAt: new Date().toISOString(),
      status: "Order Confirmed",
      estimatedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", {
        weekday: 'short', month: 'short', day: 'numeric'
      }),
      trackingSteps: [
        { label: "Order Placed", date: new Date().toLocaleDateString("en-IN", { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }), done: true },
        { label: "Packed & Shipped", date: "Tomorrow, 11:00 AM", done: false },
        { label: "Out for Delivery", date: "In 3 Days", done: false },
        { label: "Delivered", date: "Expected in 4 Days", done: false }
      ]
    };

    setOrders(prev => [newOrder, ...prev]);
    clearCart();
    return newOrder;
  };

  // Add new address
  const addAddress = (newAddr) => {
    const addrWithId = { ...newAddr, id: `addr-${Date.now()}` };
    setAddresses(prev => [addrWithId, ...prev]);
    setSelectedAddressId(addrWithId.id);
    showToast("Delivery address saved!");
    return addrWithId;
  };

  const selectedAddress = addresses.find(a => a.id === selectedAddressId) || addresses[0];

  return (
    <ShopContext.Provider
      value={{
        products,
        filteredProducts: products,
        isProductsLoading,
        currentPage,
        totalPages,
        totalCatalogCount,
        loadMoreProducts,
        selectedCategory,
        setSelectedCategory,
        selectedSubCategory,
        setSelectedSubCategory,
        searchQuery,
        setSearchQuery,
        activeTab,
        setActiveTab,
        filters,
        setFilters,
        resetFilters,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartSummary,
        appliedCoupon,
        applyCouponCode,
        removeCoupon,
        wishlist,
        toggleWishlist,
        isInWishlist,
        user,
        setUser,
        addresses,
        addAddress,
        selectedAddressId,
        setSelectedAddressId,
        selectedAddress,
        orders,
        placeOrder,
        activeModal,
        setActiveModal,
        selectedProduct,
        setSelectedProduct,
        selectedOrder,
        setSelectedOrder,
        toastMessage,
        showToast
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error("useShop must be used within a ShopProvider");
  }
  return context;
};
