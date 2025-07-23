import React, { useEffect, useState } from 'react';

const API_URL = 'https://food-delivery-app-backend-0kez.onrender.com';

function App() {
  const [foodItems, setFoodItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState('');
  const [orders, setOrders] = useState([]);

  // Fetch food from backend
  useEffect(() => {
    fetch(`${API_URL}/food`)
      .then(res => res.json())
      .then(data => setFoodItems(data))
      .catch(err => console.error('Failed to load food items:', err));
  }, []);

  // Add item to cart
  const addToCart = (item) => {
    const existing = cart.find(ci => ci.foodId === item._id);
    if (existing) {
      setCart(cart.map(ci => ci.foodId === item._id ? { ...ci, quantity: ci.quantity + 1 } : ci));
    } else {
      setCart([...cart, { foodId: item._id, quantity: 1, name: item.name }]);
    }
  };

  // Remove item from cart
  const removeFromCart = (foodId) => {
    setCart(cart.filter(item => item.foodId !== foodId));
  };

  // Submit order
  const submitOrder = () => {
    if (cart.length === 0) return;

    fetch(`${API_URL}/order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart })
    })
    .then(res => res.json())
    .then(data => {
      setMessage(data.message);
      setCart([]);
    })
    .catch(err => {
      console.error('Order failed:', err);
      setMessage('Failed to submit order.');
    });
  };

  // Fetch saved orders
  const fetchOrders = () => {
    fetch(`${API_URL}/orders`)
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(err => console.error('Failed to fetch orders:', err));
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>🍽️ Food Delivery App</h1>

      <h2>📋 Menu</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {foodItems.map(item => (
          <div key={item._id} style={{ border: '1px solid #ccc', padding: 10, margin: 10, width: 200 }}>
            <img src={item.image} alt={item.name} width="100%" />
            <h3>{item.name}</h3>
            <p>${item.price}</p>
            <button onClick={() => addToCart(item)}>➕ Add to Cart</button>
          </div>
        ))}
      </div>

      <h2>🛒 Cart</h2>
      {cart.length === 0 ? <p>No items in cart.</p> : (
        <ul>
          {cart.map((item, i) => (
            <li key={i}>
              {item.name} x {item.quantity}
              <button onClick={() => removeFromCart(item.foodId)} style={{ marginLeft: 10 }}>❌ Remove</button>
            </li>
          ))}
        </ul>
      )}
      <button onClick={submitOrder} disabled={cart.length === 0}>✅ Place Order</button>
      {message && <p style={{ color: 'green' }}>{message}</p>}

      <hr />

      <h2>📦 View Orders</h2>
      <button onClick={fetchOrders}>🔄 Load Saved Orders</button>

      {orders.length > 0 && (
        <div style={{ marginTop: 20 }}>
          {orders.map((order, index) => (
            <div key={order._id} style={{ border: '1px solid #888', padding: 10, marginBottom: 10 }}>
              <strong>Order #{index + 1}</strong> - {new Date(order.createdAt).toLocaleString()}
              <ul>
                {order.items.map((item, i) => (
                  <li key={i}>🧾 Item ID: {item.foodId} | Qty: {item.quantity}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
