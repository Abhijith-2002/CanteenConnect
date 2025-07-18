import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [readyToast, setReadyToast] = useState(null);
  const prevStatuses = useRef({});
  const [expense, setExpense] = useState({ today: 0, month: 0 });

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/orders/mine', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
      // Check for status changes to 'Ready'
      res.data.forEach(order => {
        if (
          order.status === 'Ready' &&
          prevStatuses.current[order._id] !== 'Ready'
        ) {
          setReadyToast(order.tokenNumber);
          setTimeout(() => setReadyToast(null), 4000);
        }
        prevStatuses.current[order._id] = order.status;
      });
    } catch (err) {
      setOrders([]);
    }
  };

  const fetchExpense = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/orders/expense-stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExpense(res.data);
    } catch (err) {
      setExpense({ today: 0, month: 0 });
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchExpense();
    const interval = setInterval(() => {
      fetchOrders();
      fetchExpense();
    }, 10000); // 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-brand-light p-4 sm:p-8">
      <h1 className="text-3xl font-extrabold mb-6 text-center text-brand-primary">My Orders</h1>
      {/* Expense Stats */}
      <div className="max-w-2xl mx-auto mb-6 flex flex-col sm:flex-row gap-4 justify-center items-center">
        <div className="bg-brand-primary text-white rounded-xl px-6 py-4 shadow text-center w-full sm:w-auto">
          <div className="text-lg font-semibold">Expense Today</div>
          <div className="text-2xl font-extrabold mt-1">₹{expense.today}</div>
        </div>
        <div className="bg-brand-secondary text-white rounded-xl px-6 py-4 shadow text-center w-full sm:w-auto">
          <div className="text-lg font-semibold">Expense This Month</div>
          <div className="text-2xl font-extrabold mt-1">₹{expense.month}</div>
        </div>
      </div>
      {orders.length === 0 ? (
        <div className="text-center text-brand-secondary/70">You have no orders yet.</div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <table className="min-w-full bg-white rounded-2xl shadow-xl border border-brand-light">
            <thead className="bg-brand-primary text-white">
              <tr>
                <th className="py-2 px-4 border-b">Token #</th>
                <th className="py-2 px-4 border-b">Items</th>
                <th className="py-2 px-4 border-b">Payment</th>
                <th className="py-2 px-4 border-b">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id} className="hover:bg-brand-light">
                  <td className="py-2 px-4 border-b font-bold text-brand-primary text-lg text-center">{order.tokenNumber}</td>
                  <td className="py-2 px-4 border-b">
                    <ul className="list-disc pl-4">
                      {order.items.map((item, idx) => (
                        <li key={idx}>
                          {item.menuItem?.name || 'Item'} x {item.quantity}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="py-2 px-4 border-b text-center">
                    <span className={
                      order.paymentStatus === 'Paid' ? 'bg-status-paid/10 text-status-paid' : 'bg-status-pending/10 text-status-pending'
                      + ' px-3 py-1 rounded-full font-semibold text-sm'}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="py-2 px-4 border-b text-center">
                    <span className={
                      order.status === 'Ready' ? 'bg-status-ready/10 text-status-ready' : 'bg-status-preparing/10 text-status-preparing'
                      + ' px-3 py-1 rounded-full font-semibold text-sm'}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Ready Toast */}
      {readyToast && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-status-ready text-white px-6 py-3 rounded-full shadow-lg z-50 text-lg font-semibold animate-fadeIn">
          Your order (Token #{readyToast}) is <span className="font-bold">Ready!</span> Please collect it from the counter.
        </div>
      )}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease; }
      `}</style>
    </div>
  );
};

export default MyOrders; 