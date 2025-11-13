/**
 * InventoryForm Component
 * Form for creating/editing inventory items
 */

import React, { useState, useEffect } from 'react';
import type { InventoryItem, Category, InventoryUnit } from '../../types';
import { validateInventoryItem } from '../../features/inventory/utils/validators';
import { generateNextSKU } from '../../features/inventory/utils/helpers';

interface InventoryFormProps {
  item?: InventoryItem; // undefined = create mode, defined = edit mode
  categories: Category[];
  existingItems: InventoryItem[];
  onSubmit: (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const UNITS: InventoryUnit[] = ['stuk', 'meter', 'kg', 'liter', 'm²', 'doos'];

export const InventoryForm: React.FC<InventoryFormProps> = ({
  item,
  categories,
  existingItems,
  onSubmit,
  onCancel
}) => {
  const isEditMode = !!item;

  const [formData, setFormData] = useState({
    name: item?.name || '',
    skuSupplier: item?.skuSupplier || '',
    skuCustom: item?.skuCustom || '',
    quantity: item?.quantity || 0,
    unit: item?.unit || 'stuk' as InventoryUnit,
    location: item?.location || '',
    supplier: item?.supplier || '',
    categoryId: item?.categoryId || '',
    unitPrice: item?.unitPrice || 0,
    costPrice: item?.costPrice || 0,
    reorderLevel: item?.reorderLevel || 10,
    reorderQuantity: item?.reorderQuantity || 0,
    posAlertNote: item?.posAlertNote || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Generate SKU for new items
    if (!isEditMode && !item) {
      const nextSKU = generateNextSKU(existingItems);
      setFormData(prev => ({ ...prev, skuAutomatic: nextSKU }));
    }
  }, [isEditMode, item, existingItems]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]:
        name === 'quantity' ||
        name === 'unitPrice' ||
        name === 'costPrice' ||
        name === 'reorderLevel' ||
        name === 'reorderQuantity'
          ? parseFloat(value) || 0
          : value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const validation = validateInventoryItem({
      ...formData,
      skuAutomatic: item?.skuAutomatic || generateNextSKU(existingItems)
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Submit
    onSubmit({
      ...formData,
      skuAutomatic: item?.skuAutomatic || generateNextSKU(existingItems)
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {isEditMode ? 'Item Bewerken' : 'Nieuw Item Toevoegen'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Naam *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Bijv. Schr oef M6x20"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        {/* SKUs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Leveranciers SKU *
            </label>
            <input
              type="text"
              name="skuSupplier"
              value={formData.skuSupplier}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.skuSupplier ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Bijv. ABC-123"
            />
            {errors.skuSupplier && (
              <p className="text-red-500 text-sm mt-1">{errors.skuSupplier}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Eigen SKU (optioneel)
            </label>
            <input
              type="text"
              name="skuCustom"
              value={formData.skuCustom}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Bijv. CUSTOM-001"
            />
          </div>
        </div>

        {/* Quantity & Unit */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Aantal *
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="0"
              step="1"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.quantity ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.quantity && (
              <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Eenheid *
            </label>
            <select
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {UNITS.map(unit => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Location & Supplier */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Locatie *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.location ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Bijv. Schap A12"
            />
            {errors.location && (
              <p className="text-red-500 text-sm mt-1">{errors.location}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Leverancier
            </label>
            <input
              type="text"
              name="supplier"
              value={formData.supplier}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Bijv. Acme Corp"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categorie
          </label>
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Geen categorie</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Prices */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Verkoopprijs (€) *
            </label>
            <input
              type="number"
              name="unitPrice"
              value={formData.unitPrice}
              onChange={handleChange}
              min="0"
              step="0.01"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.unitPrice ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.unitPrice && (
              <p className="text-red-500 text-sm mt-1">{errors.unitPrice}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Inkoopprijs (€)
            </label>
            <input
              type="number"
              name="costPrice"
              value={formData.costPrice}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Reorder settings */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bestel drempel *
            </label>
            <input
              type="number"
              name="reorderLevel"
              value={formData.reorderLevel}
              onChange={handleChange}
              min="0"
              step="1"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.reorderLevel ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.reorderLevel && (
              <p className="text-red-500 text-sm mt-1">{errors.reorderLevel}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bestel hoeveelheid
            </label>
            <input
              type="number"
              name="reorderQuantity"
              value={formData.reorderQuantity}
              onChange={handleChange}
              min="0"
              step="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* POS Alert Note */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            POS Notitie
          </label>
          <textarea
            name="posAlertNote"
            value={formData.posAlertNote}
            onChange={handleChange}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Notitie die verschijnt bij POS verkoop..."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {isEditMode ? 'Opslaan' : 'Toevoegen'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Annuleren
          </button>
        </div>
      </form>
    </div>
  );
};
