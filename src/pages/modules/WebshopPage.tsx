/**
 * WebshopPage - E-commerce Beheer Systeem
 * Product, Categorie en Bestelling management
 */

import React, { useState } from 'react';
import type { User, WebshopProduct, WebshopCategory, WebshopOrder } from '../../types';
import {
  useWebshopProducts,
  useWebshopCategories,
  useWebshopOrders,
} from '../../features/webshop';

type WebshopPageProps = {
  currentUser: User;
  initialProducts: WebshopProduct[];
  initialCategories: WebshopCategory[];
  initialOrders: WebshopOrder[];
};

type Tab = 'dashboard' | 'products' | 'categories' | 'orders';

export const WebshopPage: React.FC<WebshopPageProps> = ({
  currentUser,
  initialProducts,
  initialCategories,
  initialOrders,
}) => {
  // Hooks
  const products = useWebshopProducts(initialProducts);
  const categories = useWebshopCategories(initialCategories, products.products);
  const orders = useWebshopOrders(initialOrders);

  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const isAdmin = currentUser.isAdmin;

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      archived: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-gray-100 text-gray-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-orange-100 text-orange-800',
      paid: 'bg-green-100 text-green-800',
      unpaid: 'bg-red-100 text-red-800',
      failed: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getStockBadge = (product: WebshopProduct) => {
    if (!product.trackInventory) {
      return <span className="text-xs text-gray-500">-</span>;
    }

    if (product.stockQuantity === 0) {
      return <span className="px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-800">Uitverkocht</span>;
    }

    if (product.stockQuantity <= product.lowStockThreshold) {
      return <span className="px-2 py-1 text-xs font-medium rounded bg-yellow-100 text-yellow-800">Laag: {product.stockQuantity}</span>;
    }

    return <span className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800">{product.stockQuantity}</span>;
  };

  // ============================================================================
  // TAB CONTENT
  // ============================================================================

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600">Actieve Producten</div>
                <div className="text-2xl font-bold text-gray-900">{products.stats.active}</div>
                <div className="text-xs text-gray-500">{products.stats.total} totaal</div>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600">Totaal Bestellingen</div>
                <div className="text-2xl font-bold text-blue-600">{orders.stats.total}</div>
                <div className="text-xs text-gray-500">
                  {orders.stats.pending} openstaand
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600">Totale Omzet</div>
                <div className="text-2xl font-bold text-green-600">
                  €{orders.stats.totalRevenue.toLocaleString('nl-NL')}
                </div>
                <div className="text-xs text-gray-500">
                  Vandaag: €{orders.stats.todayRevenue.toFixed(2)}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600">Lage Voorraad</div>
                <div className="text-2xl font-bold text-orange-600">{products.stats.lowStock}</div>
                <div className="text-xs text-gray-500">
                  {products.stats.outOfStock} uitverkocht
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Recente Bestellingen</h2>
              <div className="space-y-2">
                {orders.getRecentOrders(5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div>
                      <span className="font-medium">{order.orderNumber}</span>
                      <span className="text-sm text-gray-600 ml-3">{order.customerName}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(order.status)}
                      <span className="font-semibold">€{order.total.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'products':
        return (
          <div className="space-y-6">
            {/* Search & Filter Bar */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center space-x-4 mb-4">
                <input
                  type="text"
                  value={products.searchTerm}
                  onChange={(e) => products.handleSearch(e.target.value)}
                  placeholder="Zoek producten (naam, SKU, beschrijving, tags)..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {isAdmin && (
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    + Nieuw Product
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <select
                  value={products.filterStatus}
                  onChange={(e) => products.setStatusFilter(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="all">Alle statussen</option>
                  <option value="draft">Concept</option>
                  <option value="active">Actief</option>
                  <option value="archived">Gearchiveerd</option>
                </select>

                <select
                  value={products.filterCategory}
                  onChange={(e) => products.setCategoryFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="all">Alle categorieën</option>
                  {categories.activeCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.productCount})
                    </option>
                  ))}
                </select>

                {(products.searchTerm || products.filterStatus !== 'all' || products.filterCategory !== 'all') && (
                  <button
                    onClick={products.clearFilters}
                    className="px-3 py-2 text-gray-600 hover:text-gray-900"
                  >
                    ✗ Wis filters
                  </button>
                )}
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow p-4 border-2 border-gray-200 hover:border-blue-300 transition cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                      <p className="text-xs text-gray-500">{product.sku}</p>
                    </div>
                    {getStatusBadge(product.status)}
                  </div>

                  <div className="space-y-2 text-sm mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Prijs:</span>
                      <span className="font-semibold">€{product.salePrice.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Voorraad:</span>
                      {getStockBadge(product)}
                    </div>
                    {product.categoryIds.length > 0 && (
                      <div className="text-xs text-gray-500">
                        {product.categoryIds.length} categorie(ën)
                      </div>
                    )}
                  </div>

                  {isAdmin && (
                    <div className="flex items-center space-x-2 pt-3 border-t border-gray-200">
                      {product.status === 'draft' && (
                        <button
                          onClick={() => products.publishProduct(product.id)}
                          className="flex-1 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition"
                        >
                          Publiceer
                        </button>
                      )}
                      {product.status === 'active' && (
                        <button
                          onClick={() => products.archiveProduct(product.id)}
                          className="flex-1 px-2 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 transition"
                        >
                          Archiveer
                        </button>
                      )}
                      <button
                        onClick={() => products.cloneProduct(product.id)}
                        className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition"
                        title="Dupliceer"
                      >
                        📋
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {products.filteredProducts.length === 0 && (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <span className="text-4xl mb-4 block">📦</span>
                <p className="text-gray-600">
                  {products.searchTerm ? 'Geen producten gevonden' : 'Nog geen producten aangemaakt'}
                </p>
              </div>
            )}
          </div>
        );

      case 'categories':
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Categorieën</h2>
                  <p className="text-sm text-gray-600">
                    {categories.stats.total} categorieën • {categories.stats.active} actief
                  </p>
                </div>
                {isAdmin && (
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    + Nieuwe Categorie
                  </button>
                )}
              </div>
            </div>

            {/* Category Tree */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4">Hiërarchische Structuur</h3>
              <div className="space-y-2">
                {categories.flattenedCategories.map((category) => (
                  <div
                    key={category.id}
                    className={`flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 ${
                      category.level > 0 ? `ml-${category.level * 8}` : ''
                    }`}
                    style={{ marginLeft: `${category.level * 2}rem` }}
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <span className="text-gray-400">
                        {category.level > 0 ? '└─' : ''}
                      </span>
                      <div>
                        <h4 className="font-medium text-gray-900">{category.name}</h4>
                        <p className="text-xs text-gray-500">{category.slug}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-600">{category.productCount} producten</span>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          category.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {category.isActive ? 'Actief' : 'Inactief'}
                      </span>
                      {isAdmin && (
                        <button
                          onClick={() => categories.toggleActive(category.id)}
                          className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition"
                        >
                          Toggle
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {categories.categories.length === 0 && (
                <div className="text-center py-12">
                  <span className="text-4xl mb-4 block">🏷️</span>
                  <p className="text-gray-600">Nog geen categorieën aangemaakt</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'orders':
        return (
          <div className="space-y-6">
            {/* Search & Filter Bar */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center space-x-4 mb-4">
                <input
                  type="text"
                  value={orders.searchTerm}
                  onChange={(e) => orders.handleSearch(e.target.value)}
                  placeholder="Zoek bestellingen (ordernummer, klant, email)..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center space-x-4">
                <select
                  value={orders.filterStatus}
                  onChange={(e) => orders.setStatusFilter(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="all">Alle statussen</option>
                  <option value="pending">Openstaand</option>
                  <option value="processing">In Behandeling</option>
                  <option value="shipped">Verzonden</option>
                  <option value="delivered">Afgeleverd</option>
                  <option value="cancelled">Geannuleerd</option>
                  <option value="refunded">Terugbetaald</option>
                </select>

                <select
                  value={orders.filterPaymentStatus}
                  onChange={(e) => orders.setPaymentFilter(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="all">Alle betalingen</option>
                  <option value="paid">Betaald</option>
                  <option value="unpaid">Niet betaald</option>
                  <option value="failed">Mislukt</option>
                </select>

                {(orders.searchTerm || orders.filterStatus !== 'all' || orders.filterPaymentStatus !== 'all') && (
                  <button
                    onClick={orders.clearFilters}
                    className="px-3 py-2 text-gray-600 hover:text-gray-900"
                  >
                    ✗ Wis filters
                  </button>
                )}
              </div>
            </div>

            {/* Orders List */}
            <div className="space-y-3">
              {orders.filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-lg shadow p-4 border-2 border-gray-200 hover:border-blue-300 transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{order.orderNumber}</h3>
                      <p className="text-sm text-gray-600">{order.customerName}</p>
                      <p className="text-xs text-gray-500">{order.customerEmail}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900">€{order.total.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('nl-NL')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 mb-3">
                    {getStatusBadge(order.status)}
                    {getStatusBadge(order.paymentStatus)}
                    <span className="text-xs text-gray-500">{order.items.length} items</span>
                  </div>

                  {isAdmin && order.status !== 'delivered' && order.status !== 'cancelled' && order.status !== 'refunded' && (
                    <div className="flex items-center space-x-2 pt-3 border-t border-gray-200">
                      {order.status === 'pending' && (
                        <button
                          onClick={() => orders.markAsProcessing(order.id)}
                          className="flex-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
                        >
                          → In Behandeling
                        </button>
                      )}
                      {order.status === 'processing' && (
                        <button
                          onClick={() => {
                            const tracking = prompt('Tracking nummer (optioneel):');
                            const carrier = prompt('Vervoerder (optioneel):');
                            orders.markAsShipped(order.id, tracking || undefined, carrier || undefined);
                          }}
                          className="flex-1 px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition"
                        >
                          → Verzonden
                        </button>
                      )}
                      {order.status === 'shipped' && (
                        <button
                          onClick={() => orders.markAsDelivered(order.id)}
                          className="flex-1 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition"
                        >
                          → Afgeleverd
                        </button>
                      )}
                      {order.paymentStatus === 'unpaid' && (
                        <button
                          onClick={() => {
                            const ref = prompt('Betaling referentie (optioneel):');
                            orders.markAsPaid(order.id, ref || undefined);
                          }}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition"
                        >
                          ✓ Betaald
                        </button>
                      )}
                      <button
                        onClick={() => {
                          const reason = prompt('Reden voor annulering:');
                          if (reason) orders.cancelOrder(order.id, reason);
                        }}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
                      >
                        ✗ Annuleer
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {orders.filteredOrders.length === 0 && (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <span className="text-4xl mb-4 block">📋</span>
                <p className="text-gray-600">
                  {orders.searchTerm ? 'Geen bestellingen gevonden' : 'Nog geen bestellingen'}
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">🛒 Webshop Beheer</h1>
        <p className="text-gray-600 mt-2">E-commerce management systeem</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition ${
              activeTab === 'dashboard'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            📊 Dashboard
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition ${
              activeTab === 'products'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            📦 Producten ({products.stats.total})
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition ${
              activeTab === 'categories'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            🏷️ Categorieën ({categories.stats.total})
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition ${
              activeTab === 'orders'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            📋 Bestellingen ({orders.stats.total})
          </button>
        </nav>
      </div>

      {renderTabContent()}
    </div>
  );
};
