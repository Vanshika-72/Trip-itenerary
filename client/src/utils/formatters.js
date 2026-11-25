export const formatCurrency = (amount, currency = 'USD') => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  } catch {
    return `${currency} ${Number(amount || 0).toLocaleString()}`;
  }
};

export const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return '';
  const start = new Date(startDate);
  const end = new Date(endDate);

  const startFormatted = start.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });

  const endFormatted = end.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });

  return `${startFormatted} – ${endFormatted}`;
};

export const getCategoryColor = (category) => {
  const map = {
    Sightseeing: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Food: 'bg-amber-100 text-amber-800 border-amber-200',
    Accommodation: 'bg-teal-100 text-teal-800 border-teal-200',
    Transportation: 'bg-blue-100 text-blue-800 border-blue-200',
    Shopping: 'bg-pink-100 text-pink-800 border-pink-200',
    Entertainment: 'bg-purple-100 text-purple-800 border-purple-200',
    Other: 'bg-gray-100 text-gray-800 border-gray-200',
  };
  return map[category] || map.Other;
};
