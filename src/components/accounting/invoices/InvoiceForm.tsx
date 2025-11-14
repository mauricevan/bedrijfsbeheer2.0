/**
 * InvoiceForm Component
 * Create and edit invoices
 */

import React from 'react';
import type { Invoice, Customer, InventoryItem, User } from '../../../types';
import { useInvoiceForm } from '../../../features/accounting/hooks';
import { formatCurrency } from '../../../features/accounting/utils';

interface InvoiceFormProps {
  invoice?: Invoice;
  customers: Customer[];
  inventory: InventoryItem[];
  users: User[];
  currentUser: User;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({
  invoice,
  customers,
  inventory,
  users,
  currentUser,
  onSubmit,
  onCancel,
}) => {
  const form = useInvoiceForm(invoice);
  const totals = form.calculateTotals();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = form.validate();
    if (!validation.isValid) {
      alert(validation.errors.map(e => e.message).join('\n'));
      return;
    }
    onSubmit(form.formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Klant *</label>
        <select
          value={form.formData.customerId}
          onChange={(e) => {
            const customer = customers.find(c => c.id === e.target.value);
            form.setFields({
              customerId: e.target.value,
              customerName: customer?.name || '',
            });
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Selecteer klant...</option>
          {customers.map(customer => (
            <option key={customer.id} value={customer.id}>
              {customer.name} - {customer.email}
            </option>
          ))}
        </select>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Factuurdatum *</label>
          <input
            type="date"
            value={form.formData.date}
            onChange={(e) => form.handleChange('date', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Vervaldag *</label>
          <input
            type="date"
            value={form.formData.dueDate}
            onChange={(e) => form.handleChange('dueDate', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      {/* Items */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Items</label>
        <div className="space-y-2 mb-4">
          {form.formData.items.map((item, index) => (
            <div key={item.id} className="flex gap-2 items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{item.description}</p>
                <p className="text-xs text-gray-600">
                  {item.quantity} x {formatCurrency(item.unitPrice)} = {formatCurrency(item.total)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => form.handleRemoveItem(item.id)}
                className="text-red-600 hover:text-red-700"
              >
                Verwijder
              </button>
            </div>
          ))}
        </div>

        {/* Add item from inventory */}
        <select
          onChange={(e) => {
            const inventoryItem = inventory.find(i => i.id === e.target.value);
            if (inventoryItem) {
              form.handleAddInventoryItem(inventoryItem, 1);
              e.target.value = '';
            }
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">+ Voeg item toe uit voorraad...</option>
          {inventory.map(item => (
            <option key={item.id} value={item.id}>
              {item.name} - {formatCurrency(item.unitPrice)}
            </option>
          ))}
        </select>
      </div>

      {/* Labor */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Arbeidsuren</label>
          <input
            type="number"
            value={form.formData.laborHours}
            onChange={(e) => form.handleChange('laborHours', parseFloat(e.target.value) || 0)}
            min="0"
            step="0.5"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Uurtarief</label>
          <input
            type="number"
            value={form.formData.hourlyRate}
            onChange={(e) => form.handleChange('hourlyRate', parseFloat(e.target.value) || 0)}
            min="0"
            step="1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* VAT */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">BTW %</label>
        <input
          type="number"
          value={form.formData.vatRate}
          onChange={(e) => form.handleChange('vatRate', parseFloat(e.target.value) || 0)}
          min="0"
          max="100"
          step="1"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Notities</label>
        <textarea
          value={form.formData.notes}
          onChange={(e) => form.handleChange('notes', e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Totals */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotaal:</span>
          <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">BTW ({form.formData.vatRate}%):</span>
          <span className="font-medium">{formatCurrency(totals.vatAmount)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
          <span>Totaal:</span>
          <span>{formatCurrency(totals.total)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Annuleren
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          {invoice ? 'Bijwerken' : 'Aanmaken'}
        </button>
      </div>
    </form>
  );
};
