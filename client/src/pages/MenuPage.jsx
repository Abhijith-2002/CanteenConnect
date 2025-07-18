import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import { Link } from 'react-router-dom';

const MenuPage = () => {
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [paying, setPaying] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastToken, setLastToken] = useState(null);
  const [payOption, setPayOption] = useState('Paid');
  const [showAddCartToast, setShowAddCartToast] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);

  useEffect(() => {
    axios.get('/api/menu')
      .then(res => {
        if (Array.isArray(res.data)) {
          setMenu(res.data);
        } else if (res.data && Array.isArray(res.data.menu)) {
          setMenu(res.data.menu);
        } else {
          setMenu([]);
        }
      })
      .catch(() => setMenu([]));
  }, []);

  const addToCart = (item) => {
    setCart(prev => {
      const found = prev.find(ci => ci._id === item._id);
      if (found) {
        return prev.map(ci => ci._id === item._id ? { ...ci, quantity: ci.quantity + 1 } : ci);
      } else {
        return [...prev, { ...item, quantity: 1 }];
      }
    });
    setShowAddCartToast(true);
    setTimeout(() => setShowAddCartToast(false), 1500);
  };

  const removeFromCart = (itemId) => {
    setCart(prev => prev.filter(ci => ci._id !== itemId));
  };

  const updateQuantity = (itemId, qty) => {
    setCart(prev => prev.map(ci => ci._id === itemId ? { ...ci, quantity: qty } : ci));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Helper to get cart item by id
  const getCartItem = (id) => cart.find(ci => ci._id === id);

  // Helper: get max items allowed for Pay Later
  const getPayLaterLimit = () => {
    const now = new Date();
    const hour = now.getHours();
    const min = now.getMinutes();
    // Peak hour: 10:30 AM to 1:00 PM
    if ((hour === 10 && min >= 30) || (hour > 10 && hour < 13) || (hour === 13 && min === 0)) {
      return 2;
    }
    return 3;
  };
  const payLaterLimit = getPayLaterLimit();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const payLaterExceeded = payOption === 'Pending' && cartCount > payLaterLimit;

  const handlePay = async () => {
    setPaying(true);
    try {
      const token = localStorage.getItem('token');
      const items = cart.map(item => ({ menuItem: item._id, quantity: item.quantity, name: item.name, price: item.price }));
      const res = await axios.post('/api/orders', { items, paymentStatus: payOption }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLastToken(res.data.tokenNumber);
      setLastOrder({
        tokenNumber: res.data.tokenNumber,
        items: cart.map(item => ({ name: item.name, quantity: item.quantity, price: item.price })),
        total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
        date: new Date().toLocaleString()
      });
      setPaying(false);
      setShowCart(false);
      setShowSuccess(true);
      setCart([]);
      setTimeout(() => setShowSuccess(false), 4000);
    } catch (err) {
      setPaying(false);
      alert(err.response?.data?.message || 'Payment failed. Please try again.');
    }
  };

  useEffect(() => {
    if (showSuccess && lastOrder) {
      // Auto-generate and download bill PDF
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text('CanteenConnect Bill', 20, 20);
      doc.setFontSize(12);
      doc.text(`Token Number: ${lastOrder.tokenNumber}`, 20, 35);
      doc.text(`Date: ${lastOrder.date}`, 20, 43);
      doc.text('----------------------------------------', 20, 50);
      let y = 60;
      doc.text('Item', 20, y);
      doc.text('Qty', 90, y);
      doc.text('Price', 120, y);
      y += 8;
      lastOrder.items.forEach(item => {
        doc.text(item.name, 20, y);
        doc.text(String(item.quantity), 90, y);
        doc.text(`₹${item.price * item.quantity}`, 120, y);
        y += 8;
      });
      doc.text('----------------------------------------', 20, y);
      y += 8;
      doc.setFontSize(14);
      doc.text(`Total: ₹${lastOrder.total}`, 20, y);
      y += 10;
      doc.setFontSize(12);
      doc.text('Show this bill and your token number at the counter.', 20, y);
      doc.save(`Canteen_Bill_Token_${lastOrder.tokenNumber}.pdf`);
    }
  }, [showSuccess, lastOrder]);

  return (
    <div className="min-h-screen bg-brand-light flex flex-col">
      {/* Top Nav */}
      <nav className="w-full flex justify-end items-center px-6 py-4">
        <Link
          to="/my-orders"
          className="bg-brand-primary text-white px-5 py-2 rounded-full font-semibold shadow hover:bg-brand-secondary hover:text-brand-primary transition"
        >
          My Orders
        </Link>
      </nav>
      {/* Hero Section */}
      <header className="w-full bg-brand-primary py-8 sm:py-12 shadow-lg mb-8 sm:mb-10">
        <div className="max-w-4xl mx-auto px-4 flex flex-col items-center text-center">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-2 drop-shadow-lg tracking-tight">CanteenConnect</h1>
          <p className="text-base sm:text-xl text-white mb-4">Order your favorite meals, snacks, and chai with ease!</p>
          <button
            className="mt-2 px-6 sm:px-8 py-2 sm:py-3 bg-white text-brand-primary font-bold rounded-full shadow-lg hover:bg-brand-light transition text-sm sm:text-base"
            onClick={() => window.scrollTo({ top: 400, behavior: 'smooth' })}
          >
            View Menu
          </button>
        </div>
      </header>

      {/* Menu Section */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-2 sm:px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-brand-primary mb-6 sm:mb-8 text-center">Today's Menu</h2>
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-8">
          {menu.map(item => (
            <div
              key={item._id}
              className="relative bg-white rounded-3xl shadow-xl overflow-hidden group hover:scale-105 transition-transform duration-300 border border-brand-light"
            >
              <div className="absolute top-0 right-0 m-2 sm:m-3 bg-brand-primary text-white px-2 sm:px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                ₹{item.price}
              </div>
              <div className="p-4 sm:p-6 flex flex-col h-48 sm:h-60">
                <h3 className="text-lg sm:text-2xl font-bold text-brand-secondary mb-1 sm:mb-2 group-hover:text-brand-primary transition">{item.name}</h3>
                <p className="text-brand-secondary/70 mb-2 sm:mb-4 flex-1 text-sm sm:text-base">{item.description}</p>
                {/* Add to Cart or Counter */}
                {getCartItem(item._id) ? (
                  <div className="flex items-center gap-2 mt-auto">
                    <button
                      className="bg-brand-secondary text-white w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold hover:bg-brand-primary transition"
                      onClick={() => updateQuantity(item._id, Math.max(1, getCartItem(item._id).quantity - 1))}
                      disabled={getCartItem(item._id).quantity === 1}
                    >
                      -
                    </button>
                    <span className="font-bold text-brand-primary text-lg min-w-[2ch] text-center">{getCartItem(item._id).quantity}</span>
                    <button
                      className="bg-brand-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold hover:bg-brand-secondary hover:text-brand-primary transition"
                      onClick={() => updateQuantity(item._id, getCartItem(item._id).quantity + 1)}
                    >
                      +
                    </button>
                    <span className="ml-2 text-brand-secondary font-semibold">Added to Cart</span>
                  </div>
                ) : (
                  <button
                    className="mt-auto bg-brand-primary text-white px-3 sm:px-4 py-2 rounded-xl font-semibold shadow hover:bg-brand-secondary hover:text-brand-primary transition text-sm sm:text-base"
                    onClick={() => addToCart(item)}
                  >
                    Add to Cart
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Floating Cart Button */}
      <button
        className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 bg-brand-primary text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full shadow-2xl font-bold text-base sm:text-lg hover:bg-brand-secondary hover:text-brand-primary transition z-50 border-4 border-white"
        style={{ maxWidth: '90vw', whiteSpace: 'nowrap' }}
        onClick={() => setShowCart(true)}
      >
        <span className="mr-2">🛒</span> View Cart ({cart.length})
      </button>

      {/* Cart Modal Overlay */}
      {showCart && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 animate-fadeIn px-2 sm:px-0"
          style={{ backgroundColor: '#1E293B' }}
        >
          <div className="bg-white rounded-3xl shadow-2xl p-4 sm:p-8 w-full max-w-xs sm:max-w-lg relative animate-slideInUp">
            <button
              className="absolute top-2 sm:top-4 right-2 sm:right-4 text-gray-400 hover:text-blue-600 text-2xl sm:text-3xl font-bold focus:outline-none"
              onClick={() => setShowCart(false)}
              aria-label="Close cart"
            >
              ×
            </button>
            <h2 className="text-xl sm:text-3xl font-extrabold mb-4 sm:mb-8 text-center text-blue-700">Your Cart</h2>
            {cart.length === 0 ? (
              <p className="text-gray-500 text-center">Your cart is empty.</p>
            ) : (
              <ul className="mb-4 sm:mb-8 divide-y divide-gray-200">
                {cart.map(item => (
                  <li key={item._id} className="flex items-center justify-between py-3 sm:py-4">
                    <span className="font-medium text-base sm:text-lg">{item.name} <span className="text-gray-400">(₹{item.price})</span></span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={e => updateQuantity(item._id, Math.max(1, Number(e.target.value)))}
                        className="w-12 sm:w-16 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 text-center text-sm sm:text-base"
                      />
                      <button
                        className="text-red-500 hover:text-red-700 text-xs sm:text-sm font-semibold"
                        onClick={() => removeFromCart(item._id)}
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="font-bold text-lg sm:text-2xl mb-4 sm:mb-8 text-right text-blue-700">Total: ₹{total}</div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="payOption" value="Paid" checked={payOption === 'Paid'} onChange={() => setPayOption('Paid')} />
                Pay Now
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="payOption" value="Pending" checked={payOption === 'Pending'} onChange={() => setPayOption('Pending')} />
                Pay Later
              </label>
            </div>
            {payOption === 'Pending' && (
              <div className="mb-2 p-3 bg-brand-light border-l-4 border-brand-primary text-brand-secondary text-sm rounded">
                <div className="font-bold mb-1 text-brand-primary">Pay Later Rules:</div>
                <ul className="list-disc pl-5">
                  <li>Maximum {payLaterLimit} items per order ({payLaterLimit === 2 ? 'Peak Hour (10:30 AM - 1:00 PM)' : 'Normal Hours'}).</li>
                  <li>If payment is not done within 30 minutes after food is ready, the order will be cancelled.</li>
                  <li>Pay at the counter before collecting your food.</li>
                </ul>
              </div>
            )}
            <button
              className="w-full bg-brand-primary text-white py-2 sm:py-3 rounded-xl font-bold text-base sm:text-lg hover:bg-brand-secondary hover:text-brand-primary transition disabled:opacity-50 shadow-lg flex items-center justify-center gap-2"
              disabled={cart.length === 0 || paying || payLaterExceeded}
              onClick={handlePay}
            >
              {paying ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                  Processing...
                </span>
              ) : (
                payOption === 'Paid' ? 'Pay Now' : 'Place Order (Pay Later)'
              )}
            </button>
            {payLaterExceeded && (
              <div className="text-red-500 text-center mt-2 text-sm font-semibold">
                You can only order up to {payLaterLimit} items with Pay Later {payLaterLimit === 2 ? '(Peak Hour)' : ''}.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Success Toast */}
      {showSuccess && lastToken && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-brand-primary text-white px-6 py-3 rounded-full shadow-lg z-50 text-lg font-semibold animate-fadeIn">
          Payment Successful! Your token number is <span className="font-bold">{lastToken}</span>.<br/>Show this at the counter to collect your order.
        </div>
      )}

      {/* Add to Cart Toast */}
      {showAddCartToast && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-brand-primary text-white px-6 py-3 rounded-full shadow-lg z-50 text-base font-semibold animate-fadeIn">
          Added to cart!
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease; }
        @keyframes slideInUp {
          from { transform: translateY(40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slideInUp { animation: slideInUp 0.4s cubic-bezier(.4,2,.6,1) }
      `}</style>
    </div>
  );
};

export default MenuPage; 