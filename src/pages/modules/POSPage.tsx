/**
 * POSPage - Kassasysteem (Point of Sale)
 * Directe verkopen met real-time voorraad controle
 */

import React, { useState } from 'react';
import type {
  User,
  InventoryItem,
  Customer,
  Invoice,
  PaymentMethod,
} from '../../types';
import { usePOS } from '../../features/pos';

type POSPageProps = {
  currentUser: User;
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  customers: Customer[];
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
};

export const POSPage: React.FC<POSPageProps> = ({
  currentUser,
  inventory,
  setInventory,
  customers,
  invoices,
  setInvoices,
}) => {
  const {
    cart,
    cartTotals,
    availableInventory,
    selectedCustomerId,
    setSelectedCustomerId,
    paymentMethod,
    setPaymentMethod,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    completeSale,
  } = usePOS(inventory, setInventory, customers, invoices, setInvoices, currentUser.id);

  const [searchTerm, setSearchTerm] = useState('');

  // Filter inventory by search
  const filteredInventory = availableInventory.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.skuSupplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.skuAutomatic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.skuCustom && item.skuCustom.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCompleteSale = () => {
    const sale = completeSale();
    if (sale) {
      setSearchTerm(''); // Reset search after sale
    }
  };

  const paymentMethods: { value: PaymentMethod; label: string }[] = [
    { value: 'cash', label: 'Contant' },
    { value: 'pin', label: 'PIN' },
    { value: 'ideal', label: 'iDEAL' },
    { value: 'creditcard', label: 'Creditcard' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Kassasysteem (POS)</h1>
        <p className="text-gray-600 mt-2">
          Directe verkopen met automatische voorraad updates
        </p>
      </div>

      {/* Main POS Layout - Split view */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Product Selection */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            {/* Search Bar */}
            <div className="p-4 border-b border-gray-200">
              <input
                type="text"
                placeholder="🔍 Zoek producten (naam, SKU)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Products Grid */}
            <div className="p-4 max-h-[600px] overflow-y-auto">
              {filteredInventory.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Geen producten gevonden</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredInventory.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => addToCart(item, 1)}
                      className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition text-left"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                          {item.name}
                        </h3>
                        <span className="text-xs text-gray-500 ml-2">{item.quantity} {item.unit}</span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{item.skuAutomatic}</p>
                      <p className="text-lg font-bold text-green-600">€{item.unitPrice.toFixed(2)}</p>
                      {item.quantity <= item.reorderLevel && (
                        <span className="inline-block mt-2 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                          ⚠️ Laag
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Cart & Checkout */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow sticky top-6">
            {/* Cart Header */}
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">
                🛒 Winkelwagen ({cart.length})
              </h2>
            </div>

            {/* Cart Items */}
            <div className="p-4 max-h-[300px] overflow-y-auto border-b border-gray-200">
              {cart.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Winkelwagen is leeg</p>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.inventoryItemId}
                      className="flex items-start justify-between gap-2 pb-3 border-b border-gray-100 last:border-0"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">
                          {item.inventoryItem.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          €{item.unitPrice.toFixed(2)} × {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              updateCartItemQuantity(item.inventoryItemId, item.quantity - 1)
                            }
                            className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300 text-sm"
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateCartItemQuantity(item.inventoryItemId, item.quantity + 1)
                            }
                            className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300 text-sm"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.inventoryItemId)}
                          className="text-red-600 hover:text-red-800 text-sm"
                          title="Verwijder"
                        >
                          ✕
                        </button>
                      </div>
                      <p className="font-semibold text-sm text-gray-900 whitespace-nowrap">
                        €{item.total.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Customer Selection */}
            <div className="p-4 border-b border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Klant (optioneel)
              </label>
              <select
                value={selectedCustomerId || ''}
                onChange={(e) => setSelectedCustomerId(e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Particulier (Kassa)</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} {customer.company ? `- ${customer.company}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Method */}
            <div className="p-4 border-b border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Betaalmethode
              </label>
              <div className="grid grid-cols-2 gap-2">
                {paymentMethods.map((method) => (
                  <button
                    key={method.value}
                    onClick={() => setPaymentMethod(method.value)}
                    className={`px-3 py-2 text-sm rounded-lg border-2 transition ${
                      paymentMethod === method.value
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {method.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotaal</span>
                  <span className="font-medium">€{cartTotals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">BTW (21%)</span>
                  <span className="font-medium">€{cartTotals.vatAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-300">
                  <span>Totaal</span>
                  <span className="text-green-600">€{cartTotals.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 space-y-2">
              <button
                onClick={handleCompleteSale}
                disabled={cart.length === 0}
                className="w-full px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
              >
                ✓ Verkoop Afronden
              </button>
              <button
                onClick={clearCart}
                disabled={cart.length === 0}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
              >
                Wis Winkelwagen
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
