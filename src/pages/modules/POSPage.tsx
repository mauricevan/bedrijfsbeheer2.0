/**
 * POSPage - Point of Sale / Kassasysteem
 * Features: Product verkoop, Winkelwagen, Voorraad check, Betaling
 * Version: MVP 1.0
 */

import React, { useState, useMemo } from 'react';
import type {
  User,
  InventoryItem,
  Category,
  Customer,
  Invoice,
  InvoiceItem,

} from '../../types';

interface POSPageProps {
  currentUser: User | null;
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  categories: Category[];
  customers: Customer[];
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
}

interface CartItem {
  inventoryItem: InventoryItem;
  quantity: number;
  subtotal: number;
}

export const POSPage: React.FC<POSPageProps> = ({
  currentUser,
  inventory,
  setInventory,
  categories,
  customers,
  invoices,
  setInvoices,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'pin'>('pin');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState<Invoice | null>(null);

  // ============================================================================
  // COMPUTED DATA
  // ============================================================================

  // Filter available inventory (only items with stock)
  const availableInventory = useMemo(() => {
    return inventory
      .filter(item => item.quantity > 0)
      .filter(item => {
        const matchesSearch =
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.skuAutomatic.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.skuSupplier && item.skuSupplier.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.skuCustom && item.skuCustom.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesCategory = !selectedCategory || item.categoryId === selectedCategory;

        return matchesSearch && matchesCategory;
      });
  }, [inventory, searchTerm, selectedCategory]);

  // Cart totals
  const cartTotals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const vatAmount = subtotal * 0.21; // 21% BTW
    const total = subtotal + vatAmount;

    return { subtotal, vatAmount, total };
  }, [cart]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleAddToCart = (item: InventoryItem) => {
    // Check if item is already in cart
    const existingCartItem = cart.find(ci => ci.inventoryItem.id === item.id);

    if (existingCartItem) {
      // Check if we can add more
      if (existingCartItem.quantity >= item.quantity) {
        alert(`Maximaal ${item.quantity} stuks beschikbaar`);
        return;
      }

      // Increase quantity
      setCart(prev => prev.map(ci =>
        ci.inventoryItem.id === item.id
          ? {
              ...ci,
              quantity: ci.quantity + 1,
              subtotal: (ci.quantity + 1) * ci.inventoryItem.unitPrice,
            }
          : ci
      ));
    } else {
      // Add new item to cart
      setCart(prev => [
        ...prev,
        {
          inventoryItem: item,
          quantity: 1,
          subtotal: item.unitPrice,
        },
      ]);
    }
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(itemId);
      return;
    }

    const cartItem = cart.find(ci => ci.inventoryItem.id === itemId);
    if (!cartItem) return;

    // Check stock availability
    if (newQuantity > cartItem.inventoryItem.quantity) {
      alert(`Maximaal ${cartItem.inventoryItem.quantity} stuks beschikbaar`);
      return;
    }

    setCart(prev => prev.map(ci =>
      ci.inventoryItem.id === itemId
        ? {
            ...ci,
            quantity: newQuantity,
            subtotal: newQuantity * ci.inventoryItem.unitPrice,
          }
        : ci
    ));
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart(prev => prev.filter(ci => ci.inventoryItem.id !== itemId));
  };

  const handleClearCart = () => {
    if (!confirm('Weet je zeker dat je de winkelwagen wilt legen?')) {
      return;
    }
    setCart([]);
    setSelectedCustomerId('');
  };

  const handleCompleteSale = () => {
    if (cart.length === 0) {
      alert('Winkelwagen is leeg');
      return;
    }

    if (!confirm('Verkoop voltooien?')) {
      return;
    }

    // Get customer info
    const customer = customers.find(c => c.id === selectedCustomerId);
    const customerName = customer ? customer.name : 'Particulier (Kassa)';
    const customerId = customer ? customer.id : 'walk-in';

    // Create invoice items from cart
    const invoiceItems: InvoiceItem[] = cart.map(cartItem => ({
      id: `ii-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      inventoryItemId: cartItem.inventoryItem.id,
      description: cartItem.inventoryItem.name,
      quantity: cartItem.quantity,
      unitPrice: cartItem.inventoryItem.unitPrice,
      total: cartItem.subtotal,
      unit: cartItem.inventoryItem.unit,
    }));

    // Create invoice/sale record
    const newInvoice: Invoice = {
      id: `inv-pos-${Date.now()}`,
      invoiceNumber: `POS-${new Date().getFullYear()}-${String(invoices.filter(inv => inv.invoiceNumber.startsWith('POS')).length + 1).padStart(3, '0')}`,
      customerId,
      customerName,
      items: invoiceItems,
      laborHours: 0,
      hourlyRate: 0,
      subtotal: cartTotals.subtotal,
      vatRate: 21,
      vatAmount: cartTotals.vatAmount,
      total: cartTotals.total,
      status: 'paid',
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0],
      paidDate: new Date().toISOString().split('T')[0],
      notes: `Kassa verkoop - Betaalmethode: ${paymentMethod === 'cash' ? 'Contant' : paymentMethod === 'pin' ? 'PIN' : 'Creditcard'}`,
      createdBy: currentUser!.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Update inventory (reduce quantities)
    setInventory(prev => prev.map(item => {
      const cartItem = cart.find(ci => ci.inventoryItem.id === item.id);
      if (cartItem) {
        return {
          ...item,
          quantity: item.quantity - cartItem.quantity,
          updatedAt: new Date().toISOString(),
        };
      }
      return item;
    }));

    // Add invoice to system
    setInvoices(prev => [...prev, newInvoice]);

    // Show receipt
    setLastSale(newInvoice);
    setShowReceipt(true);

    // Clear cart
    setCart([]);
    setSelectedCustomerId('');
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return '';
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : '';
  };

  const getPaymentMethodIcon = (method: string) => {
    const icons = {
      cash: '💵',
      pin: '💳',
      card: '💳',
    };
    return icons[method as keyof typeof icons] || '💵';
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!currentUser) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Gelieve in te loggen om deze module te gebruiken.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">💰 Kassasysteem (POS)</h1>
        <p className="text-gray-600 mt-1">Directe verkopen met automatische voorraad updates</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Product Selection */}
        <div className="lg:col-span-2">
          {/* Search & Filter */}
          <div className="bg-white rounded-lg shadow mb-4 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zoek product
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Zoek op naam of SKU..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categorie
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Alle categorieën</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Beschikbare Producten ({availableInventory.length})
            </h2>

            {availableInventory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Geen producten beschikbaar
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto">
                {availableInventory.map(item => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg p-3 hover:border-blue-500 hover:shadow-md transition cursor-pointer"
                    onClick={() => handleAddToCart(item)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-xs text-gray-500">{item.skuAutomatic}</p>
                        {item.categoryId && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded mt-1 inline-block">
                            {getCategoryName(item.categoryId)}
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">
                          {formatCurrency(item.unitPrice)}
                        </div>
                        <div className="text-xs text-gray-500">
                          per {item.unit}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className={`${item.quantity < 10 ? 'text-orange-600 font-semibold' : 'text-gray-600'}`}>
                        Voorraad: {item.quantity} {item.unit}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(item);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium"
                      >
                        + Toevoegen
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Cart & Checkout */}
        <div>
          <div className="bg-white rounded-lg shadow p-4 sticky top-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              🛒 Winkelwagen ({cart.length})
            </h2>

            {/* Cart Items */}
            <div className="mb-4 max-h-[300px] overflow-y-auto">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Winkelwagen is leeg
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.inventoryItem.id} className="border-b border-gray-200 py-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">
                          {item.inventoryItem.name}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {formatCurrency(item.inventoryItem.unitPrice)} / {item.inventoryItem.unit}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveFromCart(item.inventoryItem.id)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleUpdateQuantity(item.inventoryItem.id, item.quantity - 1)}
                          className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded text-sm"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleUpdateQuantity(item.inventoryItem.id, parseInt(e.target.value) || 0)}
                          className="w-16 text-center border border-gray-300 rounded px-2 py-1 text-sm"
                          min="1"
                          max={item.inventoryItem.quantity}
                        />
                        <button
                          onClick={() => handleUpdateQuantity(item.inventoryItem.id, item.quantity + 1)}
                          className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded text-sm"
                        >
                          +
                        </button>
                      </div>
                      <div className="font-semibold text-gray-900">
                        {formatCurrency(item.subtotal)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Totals */}
            {cart.length > 0 && (
              <>
                <div className="border-t border-gray-200 pt-4 mb-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotaal (excl. BTW):</span>
                    <span className="font-medium">{formatCurrency(cartTotals.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">BTW (21%):</span>
                    <span className="font-medium">{formatCurrency(cartTotals.vatAmount)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Totaal:</span>
                    <span className="text-blue-600">{formatCurrency(cartTotals.total)}</span>
                  </div>
                </div>

                {/* Customer Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Klant (optioneel)
                  </label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="">Particulier (Kassa)</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} - {customer.email}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Payment Method */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Betaalmethode
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setPaymentMethod('pin')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                        paymentMethod === 'pin'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      💳 PIN
                    </button>
                    <button
                      onClick={() => setPaymentMethod('cash')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                        paymentMethod === 'cash'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      💵 Contant
                    </button>
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                        paymentMethod === 'card'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      💳 Card
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={handleCompleteSale}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold text-lg"
                  >
                    ✓ Verkoop Voltooien
                  </button>
                  <button
                    onClick={handleClearCart}
                    className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    🗑 Wis Winkelwagen
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && lastSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">✓</div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">Verkoop Voltooid!</h2>
              <p className="text-gray-600">Bedankt voor uw aankoop</p>
            </div>

            {/* Receipt Details */}
            <div className="border-t border-b border-gray-200 py-4 mb-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Factuurnummer:</span>
                <span className="font-medium">{lastSale.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Datum:</span>
                <span className="font-medium">{new Date(lastSale.date).toLocaleDateString('nl-NL')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Klant:</span>
                <span className="font-medium">{lastSale.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Betaalmethode:</span>
                <span className="font-medium">
                  {getPaymentMethodIcon(paymentMethod)} {
                    paymentMethod === 'cash' ? 'Contant' :
                    paymentMethod === 'pin' ? 'PIN' : 'Creditcard'
                  }
                </span>
              </div>
            </div>

            {/* Items */}
            <div className="mb-4 max-h-40 overflow-y-auto">
              {lastSale.items.map(item => (
                <div key={item.id} className="flex justify-between text-sm py-1">
                  <span>{item.quantity}x {item.description}</span>
                  <span className="font-medium">{formatCurrency(item.total)}</span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between text-lg font-bold">
                <span>Totaal betaald:</span>
                <span className="text-green-600">{formatCurrency(lastSale.total)}</span>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => {
                setShowReceipt(false);
                setLastSale(null);
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              Sluiten
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
