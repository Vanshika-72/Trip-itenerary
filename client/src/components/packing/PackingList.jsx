import React, { useState } from 'react';
import PackingItemRow from './PackingItemRow';
import Button from '../common/Button';
import Input from '../common/Input';
import { Plus, CheckSquare, Sparkles } from 'lucide-react';

const PACKING_CATEGORIES = ['All', 'General', 'Clothing', 'Documents', 'Electronics', 'Toiletries', 'Other'];

export const PackingList = ({
  items = [],
  stats = { total: 0, packed: 0, percentage: 0 },
  canEdit = false,
  onAddItem,
  onToggleItem,
  onDeleteItem,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [newItemLabel, setNewItemLabel] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('General');

  const filteredItems = items.filter((item) => {
    if (selectedCategory === 'All') return true;
    return item.category === selectedCategory;
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newItemLabel.trim()) return;
    onAddItem({
      label: newItemLabel.trim(),
      category: newItemCategory,
    });
    setNewItemLabel('');
  };

  return (
    <div className="space-y-6">
      {/* Progress Box */}
      <div className="bg-white p-6 rounded-2xl border border-sand-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-forest-800" />
            <h3 className="font-serif font-bold text-base text-forest-900">
              Packing Checklist
            </h3>
          </div>
          <span className="text-xs font-semibold text-charcoal-700">
            {stats.packed} of {stats.total} packed ({stats.percentage}%)
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-sand-200 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-forest-800 h-full rounded-full transition-all duration-300"
            style={{ width: `${stats.percentage}%` }}
          />
        </div>
      </div>

      {/* Add New Item Form (Editors / Owners) */}
      {canEdit && (
        <form
          onSubmit={handleAddSubmit}
          className="flex flex-col sm:flex-row gap-3 p-4 bg-sand-50 rounded-2xl border border-sand-200 shadow-sm"
        >
          <div className="flex-1">
            <Input
              placeholder="e.g. Passport, Camera, Sunscreen..."
              value={newItemLabel}
              onChange={(e) => setNewItemLabel(e.target.value)}
              required
            />
          </div>
          <div className="w-full sm:w-36">
            <select
              value={newItemCategory}
              onChange={(e) => setNewItemCategory(e.target.value)}
              className="w-full rounded-lg border border-sand-300 bg-white py-2.5 px-3 text-sm text-charcoal-800"
            >
              {PACKING_CATEGORIES.filter((c) => c !== 'All').map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" icon={Plus} className="shrink-0">
            Add Item
          </Button>
        </form>
      )}

      {/* Category Pills Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {PACKING_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
              selectedCategory === cat
                ? 'bg-forest-800 text-white'
                : 'bg-white text-charcoal-600 hover:bg-sand-100 border border-sand-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Checklist Items */}
      {filteredItems.length > 0 ? (
        <div className="space-y-2">
          {filteredItems.map((item) => (
            <PackingItemRow
              key={item._id || item.id}
              item={item}
              canEdit={canEdit}
              onToggle={onToggleItem}
              onDelete={onDeleteItem}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 border border-dashed border-sand-300 rounded-2xl bg-white/70 space-y-2">
          <Sparkles className="w-6 h-6 text-sand-400 mx-auto" />
          <p className="text-xs text-charcoal-500">
            {selectedCategory === 'All'
              ? 'No packing items yet. Add travel essentials above!'
              : `No items found under ${selectedCategory}.`}
          </p>
        </div>
      )}
    </div>
  );
};

export default PackingList;
