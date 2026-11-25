import React from 'react';

export const DayTabList = ({ days = [], selectedDay, onSelectDay }) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-sand-200 no-scrollbar">
      <button
        type="button"
        onClick={() => onSelectDay('all')}
        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition shrink-0 ${
          selectedDay === 'all'
            ? 'bg-forest-800 text-white shadow-sm'
            : 'bg-white text-charcoal-600 hover:bg-sand-100 border border-sand-200'
        }`}
      >
        All Days
      </button>

      {days.map((day) => {
        const isSelected = selectedDay === day.dayNumber;
        return (
          <button
            key={day.dayNumber}
            type="button"
            onClick={() => onSelectDay(day.dayNumber)}
            className={`px-4 py-2 rounded-xl text-left transition shrink-0 border ${
              isSelected
                ? 'bg-forest-800 text-white border-forest-800 shadow-sm'
                : 'bg-white text-charcoal-700 hover:bg-sand-100 border-sand-200'
            }`}
          >
            <div className="text-xs font-bold uppercase tracking-wider">
              Day {day.dayNumber}
            </div>
            <div
              className={`text-[11px] ${
                isSelected ? 'text-sand-200' : 'text-charcoal-400'
              }`}
            >
              {day.formattedDate}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default DayTabList;
