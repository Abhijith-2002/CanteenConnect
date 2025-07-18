import React, { useState, useEffect } from 'react';
import axios from 'axios';

// HOC for auth remains the same
function withAdminAuth(Component) {
    // ... (your existing withAdminAuth HOC)
    return Component; // For brevity in this example
}

const statusOptions = ['All', 'Paid', 'Preparing', 'Ready', 'Pending'];

// A simple spinner for loading states
const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-10">
        <div className="w-10 h-10 border-4 border-dashed rounded-full animate-spin border-brand-primary"></div>
    </div>
);

// Style mapping for status badges is now inside the component
const statusStyles = {
  Paid: 'bg-blue-100 text-status-paid',
  Preparing: 'bg-orange-100 text-status-preparing',
  Ready: 'bg-green-100 text-status-ready',
  Pending: 'bg-gray-100 text-status-pending',
};


const AdminDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [filter, setFilter] = useState('All');
    const [loading, setLoading] = useState(true);
    const [ranking, setRanking] = useState([]);
    const [revenue, setRevenue] = useState({ today: 0, month: 0 });

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/orders/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const sortedOrders = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setOrders(sortedOrders);
        } catch (err) {
            console.error("Failed to fetch orders:", err);
            setOrders([]);
        }
        setLoading(false);
    };

    const fetchRanking = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/orders/ranking', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRanking(res.data);
      } catch (err) {
        setRanking([]);
      }
    };

    const fetchRevenue = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/orders/revenue-stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRevenue(res.data);
      } catch (err) {
        setRevenue({ today: 0, month: 0 });
      }
    };

    useEffect(() => {
        fetchOrders();
        fetchRanking();
        fetchRevenue();
        const interval = setInterval(() => {
          fetchOrders();
          fetchRanking();
          fetchRevenue();
        }, 30000); // 30s
        return () => clearInterval(interval);
    }, []);

    const markAsPaid = async (orderId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`/api/orders/${orderId}/pay`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchOrders();
        } catch (err) {
            alert('Failed to mark as paid. Please try again.');
        }
    };

    const filteredOrders = filter === 'All'
        ? orders
        : orders.filter(order => order.status === filter);

    return (
      <div className="min-h-screen bg-brand-light p-4 sm:p-8">
        <h1 className="text-3xl font-extrabold mb-6 text-center text-brand-primary">Admin Dashboard</h1>
        {/* Revenue Stats */}
        <div className="max-w-2xl mx-auto mb-6 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <div className="bg-brand-primary text-white rounded-xl px-6 py-4 shadow text-center w-full sm:w-auto">
            <div className="text-lg font-semibold">Revenue Today</div>
            <div className="text-2xl font-extrabold mt-1">₹{revenue.today}</div>
          </div>
          <div className="bg-brand-secondary text-white rounded-xl px-6 py-4 shadow text-center w-full sm:w-auto">
            <div className="text-lg font-semibold">Revenue This Month</div>
            <div className="text-2xl font-extrabold mt-1">₹{revenue.month}</div>
          </div>
        </div>
        {/* Sales Ranking */}
        <div className="max-w-2xl mx-auto mb-8">
          <h2 className="text-xl font-bold mb-2 text-brand-secondary text-center">Top Selling Items Today</h2>
          {ranking.length === 0 ? (
            <div className="text-center text-brand-secondary/70">No sales yet today.</div>
          ) : (
            <ul className="space-y-2">
              {ranking.map((item, idx) => (
                <li key={item.name} className="flex items-center gap-4">
                  <span className="w-8 text-right font-bold text-brand-primary">#{idx + 1}</span>
                  <span className="flex-1 font-semibold text-brand-secondary">{item.name}</span>
                  <div className="flex-1 h-3 bg-brand-light rounded-full overflow-hidden">
                    <div
                      className="h-3 rounded-full bg-brand-primary transition-all"
                      style={{ width: `${Math.max(10, (item.totalSold / (ranking[0]?.totalSold || 1)) * 100)}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 font-bold text-status-paid">{item.totalSold}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="mb-4 flex flex-col sm:flex-row items-center gap-4 justify-center">
          <label className="font-semibold text-brand-secondary">Filter by Status:</label>
          <select
            className="border rounded px-3 py-1 focus:ring-2 focus:ring-brand-primary"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          >
            {statusOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        {loading ? (
          <div className="text-brand-secondary text-center">Loading orders...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-2xl shadow-xl border border-brand-light">
              <thead className="bg-brand-primary text-white">
                <tr>
                  <th className="py-2 px-4 border-b">Token #</th>
                  <th className="py-2 px-4 border-b">Items</th>
                  <th className="py-2 px-4 border-b">Total Price</th>
                  <th className="py-2 px-4 border-b">Payment</th>
                  <th className="py-2 px-4 border-b">Status</th>
                  <th className="py-2 px-4 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-brand-secondary">No orders found.</td>
                  </tr>
                ) : (
                  filteredOrders.map(order => (
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
                      <td className="py-2 px-4 border-b text-center">₹{order.totalPrice}</td>
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
                      <td className="py-2 px-4 border-b text-center">
                        {order.status === 'Preparing' && (
                          <button
                            className="bg-status-ready text-white px-3 py-1 rounded hover:bg-brand-primary transition font-semibold"
                            onClick={async () => {
                              const token = localStorage.getItem('token');
                              await axios.patch(`/api/orders/${order._id}/ready`, {}, {
                                headers: { Authorization: `Bearer ${token}` }
                              });
                              fetchOrders();
                            }}
                          >
                            Mark as Ready
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
};

export default withAdminAuth(AdminDashboard);