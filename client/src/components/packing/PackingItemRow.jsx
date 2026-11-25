import React from 'react';
import { Check, Trash2 } from 'lucide-react';

export const PackingItemRow = ({ item, canEdit = false, onToggle, onDelete }) => {
  return (
    <div
      className={`group flex items-center justify-between p-3.5 rounded-xl border transition-all duration-150 ${
        item.isPacked
          ? 'bg-sand-50/50 border-sand-200 text-charcoal-400'
          : 'bg-white border-sand-200 text-charcoal-800 shadow-sm hover:border-sand-300'
      }`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Custom Checkbox */}
        <button
          type="button"
          disabled={!canEdit}
          onClick={() => onToggle(item._id || item.id, !item.isPacked)}
          className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
            item.isPacked
              ? 'bg-forest-800 border-forest-800 text-white'
              : 'border-sand-400 bg-white hover:border-forest-700'
          } ${!canEdit ? 'cursor-default' : 'cursor-pointer'}`}
        >
          {item.isPacked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        {/* Label */}
        <span
          className={`text-sm truncate font-medium ${
            item.isPacked ? 'line-through text-charcoal-400' : 'text-charcoal-800'
          }`}
        >
          {item.label}
        </span>

        {/* Category tag */}
        {item.category && item.category !== 'General' && (
          <span className="text-[10px] bg-sand-100 text-charcoal-600 px-2 py-0.5 rounded-md font-medium shrink-0">
            {item.category}
          </span>
        )}
      </div>

      {/* Delete button */}
      {canEdit && (
        <button
          type="button"
          onClick={() => onDelete(item._id || item.id)}
          className="opacity-0 group-hover:opacity-100 text-charcoal-400 hover:text-red-600 p-1 rounded transition"
          title="Delete item"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export default PackingItemRow;
