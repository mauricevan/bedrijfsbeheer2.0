/**
 * POSPage - Point of Sale / Kassasysteem
 * Volledige winkelwagen en kassa functionaliteit
 */

import React, { useState } from 'react';
import type { User, InventoryItem, Customer } from '../../types';
import { usePOS } from '../../features/pos';

type POSPageProps = {
  currentUser: User;
  inventory: InventoryItem[];
  customers?: Customer[];
};

export const POSPage: React.FC<POSPageProps> = ({
  currentUser,
  inventory,
  customers = [],
}) => {
  const {
    cart,
    cartTotals,
    selectedCustomer,
    availableInventory,
    salesStats,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    selectCustomer,
    completeSale,
  } = usePOS(inventory, customers);

  const [searchTerm, setSearchTerm] = useState('');
  const [showCustomerSelect, setShowCustomerSelect] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'pin'>('card');

  // Filter inventory by search
  const filteredInventory = availableInventory.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.skuAutomatic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle add to cart with error handling
  const handleAddToCart = (item: InventoryItem) => {
    try {
      addToCart(item, 1);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Fout bij toevoegen aan winkelwagen');
    }
  };

  // Handle quantity update with error handling
  const handleQuantityChange = (itemId: string, quantity: number) => {
    try {
      updateCartItemQuantity(itemId, quantity);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Fout bij aanpassen aantal');
    }
  };

  // Handle checkout
  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Winkelwagen is leeg');
      return;
    }

    const confirmed = window.confirm(
      `Weet je zeker dat je deze verkoop wilt afronden?\n\nTotaal: €${cartTotals.total.toFixed(
        2
      )}\nBetaalmethode: ${paymentMethod === 'cash' ? 'Contant' : paymentMethod === 'card' ? 'Creditcard' : 'PIN'}`
    );

    if (confirmed) {
      try {
        const sale = completeSale(paymentMethod);
        alert(
          `Verkoop voltooid!\n\nVerkoop nummer: ${sale.saleNumber}\nTotaal: €${sale.total.toFixed(
            2
          )}`
        );
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Fout bij afronden verkoop');
      }
    }
  };

  // Handle clear cart
  const handleClearCart = () => {
    if (cart.length === 0) return;

    const confirmed = window.confirm('Weet je zeker dat je de winkelwagen wilt legen?');
    if (confirmed) {
      clearCart();
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">💵 POS - Kassasysteem</h1>
        <p className="text-gray-600 mt-2">Verkopen en kassa beheer</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Vandaag Verkocht</div>
          <div className="text-2xl font-bold text-gray-900">{salesStats.todaySales}</div>
          <div className="text-xs text-gray-500">
            €{salesStats.todayRevenue.toFixed(2)}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Totaal Verkocht</div>
          <div className="text-2xl font-bold text-blue-600">{salesStats.totalSales}</div>
          <div className="text-xs text-gray-500">
            €{salesStats.totalRevenue.toFixed(2)}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Beschikbare Producten</div>
          <div className="text-2xl font-bold text-green-600">{availableInventory.length}</div>
          <div className="text-xs text-gray-500">Op voorraad</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">In Winkelwagen</div>
          <div className="text-2xl font-bold text-purple-600">{cartTotals.itemCount}</div>
          <div className="text-xs text-gray-500">{cart.length} producten</div>
        </div>
      </div>

      {/* Main POS Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Grid (Left - 2 columns) */}
        <div className="lg:col-span-2">
          {/* Search */}
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Zoek producten (naam, SKU)..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Products */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-bold mb-4">Producten ({filteredInventory.length})</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto">
              {filteredInventory.map((item) => (
                <div
                  key={item.id}
                  className="border-2 border-gray-200 rounded-lg p-3 hover:border-blue-300 transition cursor-pointer"
                  onClick={() => handleAddToCart(item)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-xs text-gray-500">{item.skuAutomatic}</p>
                      <div className="mt-2">
                        <span className="text-lg font-bold text-gray-900">
                          €{item.unitPrice.toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">per {item.unit}</span>
                      </div>
                    </div>
                    <div className="ml-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          item.quantity > item.reorderLevel
                            ? 'bg-green-100 text-green-800'
                            : item.quantity > 0
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredInventory.length === 0 && (
              <div className="text-center py-12">
                <span className="text-4xl mb-4 block">📦</span>
                <p className="text-gray-600">Geen producten gevonden</p>
              </div>
            )}
          </div>
        </div>

        {/* Cart / Checkout (Right - 1 column) */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-4 sticky top-6">
            <h2 className="text-lg font-bold mb-4">Winkelwagen</h2>

            {/* Customer Selection */}
            <div className="mb-4 pb-4 border-b">
              <button
                onClick={() => setShowCustomerSelect(!showCustomerSelect)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-left hover:bg-gray-50"
              >
                {selectedCustomer ? (
                  <span className="font-medium">{selectedCustomer.name}</span>
                ) : (
                  <span className="text-gray-500">Selecteer klant (optioneel)</span>
                )}
              </button>

              {showCustomerSelect && (
                <div className="mt-2 border border-gray-300 rounded-lg max-h-40 overflow-y-auto">
                  <button
                    onClick={() => {
                      selectCustomer(null);
                      setShowCustomerSelect(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 text-gray-500"
                  >
                    Geen klant (Particulier)
                  </button>
                  {customers.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => {
                        selectCustomer(customer);
                        setShowCustomerSelect(false);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 border-t"
                    >
                      {customer.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Items */}
            <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.inventoryItemId} className="border border-gray-200 rounded-lg p-2">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.name}</h4>
                      <p className="text-xs text-gray-500">
                        €{item.unitPrice.toFixed(2)} × {item.quantity} {item.unit}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.inventoryItemId)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      ✗
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          handleQuantityChange(item.inventoryItemId, item.quantity - 1)
                        }
                        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        -
                      </button>
                      <span className="font-medium">{item.quantity}</span>
                      <button
                        onClick={() =>
                          handleQuantityChange(item.inventoryItemId, item.quantity + 1)
                        }
                        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        +
                      </button>
                    </div>
                    <span className="font-semibold">€{item.total.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            {cart.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <span className="text-3xl mb-2 block">🛒</span>
                <p className="text-sm">Winkelwagen is leeg</p>
              </div>
            )}

            {/* Totals */}
            {cart.length > 0 && (
              <>
                <div className="border-t pt-4 space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Subtotaal:</span>
                    <span>€{cartTotals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>BTW ({cartTotals.vatRate}%):</span>
                    <span>€{cartTotals.vatAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Totaal:</span>
                    <span>€{cartTotals.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Betaalmethode:</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="card">Creditcard</option>
                    <option value="pin">PIN</option>
                    <option value="cash">Contant</option>
                  </select>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <button
                    onClick={handleCheckout}
                    className="w-full px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
                  >
                    ✓ Betaling Afronden
                  </button>
                  <button
                    onClick={handleClearCart}
                    className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    Wis Winkelwagen
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
