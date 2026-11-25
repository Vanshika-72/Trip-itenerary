import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Wallet } from 'lucide-react';
import { formatDateRange, formatCurrency } from '../../utils/formatters';
import Badge from '../common/Badge';

export const TripCard = ({ trip }) => {
  const roleBadge = () => {
    switch (trip.userRole) {
      case 'owner':
        return <Badge variant="forest">Owner</Badge>;
      case 'editor':
        return <Badge variant="amber">Editor</Badge>;
      default:
        return <Badge variant="default">Viewer</Badge>;
    }
  };

  const defaultCover =
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop';

  return (
    <Link
      to={`/trips/${trip._id || trip.id}`}
      className="group block bg-white rounded-2xl overflow-hidden border border-sand-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      {/* Cover Image */}
      <div className="relative h-48 w-full overflow-hidden bg-sand-200">
        <img
          src={trip.coverUrl || defaultCover}
          alt={trip.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = defaultCover;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {roleBadge()}
          {trip.isPublic && <Badge variant="purple">Public</Badge>}
        </div>

        {/* Days Count */}
        <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-full font-medium">
          {trip.totalDays || 1} {trip.totalDays === 1 ? 'Day' : 'Days'}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        <div>
          <h3 className="font-serif font-bold text-lg text-forest-900 group-hover:text-forest-700 transition line-clamp-1">
            {trip.title}
          </h3>
          <div className="flex items-center text-xs text-charcoal-600 gap-1.5 mt-1 font-medium">
            <MapPin className="w-3.5 h-3.5 text-forest-700 shrink-0" />
            <span className="line-clamp-1">{trip.destination}</span>
          </div>
        </div>

        <div className="pt-2 border-t border-sand-100 flex items-center justify-between text-xs text-charcoal-500">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-charcoal-400" />
            <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-charcoal-800">
            <Wallet className="w-3.5 h-3.5 text-sage-600" />
            <span>{formatCurrency(trip.budget, trip.currency)}</span>
          </div>

          <div className="flex items-center gap-1 text-charcoal-500">
            <Users className="w-3.5 h-3.5" />
            <span>
              {1 + (trip.collaborators?.length || 0)}{' '}
              {1 + (trip.collaborators?.length || 0) === 1 ? 'member' : 'members'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TripCard;
