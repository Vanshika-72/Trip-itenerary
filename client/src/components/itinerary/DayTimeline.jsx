import React from 'react';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import ActivityCard from './ActivityCard';
import Button from '../common/Button';
import { Plus, Compass } from 'lucide-react';

export const DayTimeline = ({
  days = [],
  activities = [],
  selectedDay = 'all',
  currency = 'USD',
  canEdit = false,
  onAddActivity,
  onEditActivity,
  onDeleteActivity,
  onReorder,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Avoid intercepting regular clicks
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const displayedDays =
    selectedDay === 'all'
      ? days
      : days.filter((d) => d.dayNumber === Number(selectedDay));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeActivity = activities.find((a) => (a._id || a.id) === active.id);
    if (!activeActivity) return;

    // Check if over target is another activity
    const overActivity = activities.find((a) => (a._id || a.id) === over.id);

    if (overActivity) {
      const targetDay = overActivity.dayNumber;
      const targetDayActivities = activities
        .filter((a) => a.dayNumber === targetDay)
        .sort((a, b) => a.order - b.order);

      const targetIndex = targetDayActivities.findIndex(
        (a) => (a._id || a.id) === over.id
      );

      onReorder({
        activityId: activeActivity._id || activeActivity.id,
        targetDay,
        targetPosition: Math.max(0, targetIndex),
      });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-8">
        {displayedDays.map((day) => {
          const dayActivities = activities
            .filter((a) => a.dayNumber === day.dayNumber)
            .sort((a, b) => a.order - b.order);

          return (
            <div
              key={day.dayNumber}
              className="bg-white/80 rounded-2xl p-6 border border-sand-200 shadow-sm space-y-4"
            >
              {/* Day Header */}
              <div className="flex items-center justify-between border-b border-sand-200 pb-3">
                <div className="flex items-baseline gap-2">
                  <h3 className="text-base font-bold text-forest-900 font-serif">
                    Day {day.dayNumber}
                  </h3>
                  <span className="text-xs text-charcoal-500 font-medium">
                    {day.formattedDate}
                  </span>
                </div>

                {canEdit && (
                  <Button
                    size="sm"
                    variant="outline"
                    icon={Plus}
                    onClick={() => onAddActivity(day.dayNumber)}
                  >
                    Add Activity
                  </Button>
                )}
              </div>

              {/* Activities Sortable List */}
              {dayActivities.length > 0 ? (
                <SortableContext
                  items={dayActivities.map((a) => a._id || a.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {dayActivities.map((activity) => (
                      <ActivityCard
                        key={activity._id || activity.id}
                        activity={activity}
                        currency={currency}
                        canEdit={canEdit}
                        onEdit={onEditActivity}
                        onDelete={onDeleteActivity}
                      />
                    ))}
                  </div>
                </SortableContext>
              ) : (
                <div className="text-center py-8 border border-dashed border-sand-300 rounded-xl bg-sand-50/40 space-y-2">
                  <Compass className="w-6 h-6 text-charcoal-300 mx-auto" />
                  <p className="text-xs text-charcoal-500">
                    No activities planned yet for Day {day.dayNumber}.
                  </p>
                  {canEdit && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onAddActivity(day.dayNumber)}
                      className="text-xs text-forest-800 font-semibold"
                    >
                      + Schedule an activity
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </DndContext>
  );
};

export default DayTimeline;
