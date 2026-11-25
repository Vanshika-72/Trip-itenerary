import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Clock, MapPin, Edit2, Trash2 } from 'lucide-react';
import { getCategoryColor, formatCurrency } from '../../utils/formatters';

export const ActivityCard = ({
  activity,
  currency = 'USD',
  canEdit = false,
  onEdit,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: activity._id || activity.id,
    disabled: !canEdit,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative bg-white border border-sand-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200 ${
        isDragging ? 'ring-2 ring-forest-700 shadow-xl z-30' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        {canEdit && (
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="mt-1 cursor-grab active:cursor-grabbing text-charcoal-300 hover:text-forest-800 p-0.5 rounded touch-none"
            title="Drag to reorder"
          >
            <GripVertical className="w-4 h-4" />
          </button>
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Header Row: Category Badge, Time, and Actions */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${getCategoryColor(
                  activity.category
                )}`}
              >
                {activity.category}
              </span>

              {activity.time && (
                <div className="flex items-center gap-1 text-xs text-charcoal-600 font-medium">
                  <Clock className="w-3 h-3 text-charcoal-400" />
                  <span>{activity.time}</span>
                </div>
              )}
            </div>

            {/* Actions for Editor/Owner */}
            {canEdit && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => onEdit(activity)}
                  className="p-1 text-charcoal-400 hover:text-forest-800 hover:bg-sand-100 rounded transition"
                  title="Edit activity"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(activity._id || activity.id)}
                  className="p-1 text-charcoal-400 hover:text-red-600 hover:bg-sand-100 rounded transition"
                  title="Delete activity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Title */}
          <h4 className="font-bold text-sm text-charcoal-900 leading-snug">
            {activity.title}
          </h4>

          {/* Location */}
          {activity.location?.name && (
            <div className="flex items-center gap-1.5 text-xs text-charcoal-500 font-medium">
              <MapPin className="w-3.5 h-3.5 text-forest-700 shrink-0" />
              <span className="truncate">{activity.location.name}</span>
            </div>
          )}

          {/* Notes */}
          {activity.notes && (
            <p className="text-xs text-charcoal-600 bg-sand-50/70 p-2 rounded-lg border border-sand-100 leading-relaxed line-clamp-2">
              {activity.notes}
            </p>
          )}

          {/* Cost Footer */}
          {activity.cost > 0 && (
            <div className="pt-2 border-t border-sand-100 flex items-center justify-between text-xs">
              <span className="text-charcoal-400">Estimated cost</span>
              <span className="font-semibold text-forest-800">
                {formatCurrency(activity.cost, currency)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;
