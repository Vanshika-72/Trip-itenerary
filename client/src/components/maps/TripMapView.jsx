import React, { useMemo, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { createNumberedMarkerIcon } from '../../utils/leafletIcons';
import { MapPin, Navigation, Clock } from 'lucide-react';
import { formatCurrency, getCategoryColor } from '../../utils/formatters';

// Dictionary of fallback coordinates for common destinations
const KNOWN_DESTINATIONS = {
  china: [39.9042, 116.4074],
  beijing: [39.9042, 116.4074],
  shanghai: [31.2304, 121.4737],
  india: [28.6139, 77.2090],
  delhi: [28.6139, 77.2090],
  mumbai: [19.0760, 72.8777],
  goa: [15.2993, 74.1240],
  japan: [35.0116, 135.7681],
  kyoto: [35.0116, 135.7681],
  tokyo: [35.6762, 139.6503],
  paris: [48.8566, 2.3522],
  france: [48.8566, 2.3522],
  italy: [41.9028, 12.4964],
  rome: [41.9028, 12.4964],
  amalfi: [40.6340, 14.6027],
  london: [51.5074, -0.1278],
  uk: [51.5074, -0.1278],
  swiss: [46.6863, 7.8632],
  switzerland: [46.6863, 7.8632],
  usa: [40.7128, -74.0060],
  'new york': [40.7128, -74.0060],
};

const getDestinationCoordinates = (destination = '') => {
  const normalized = destination.toLowerCase().trim();
  for (const [key, coords] of Object.entries(KNOWN_DESTINATIONS)) {
    if (normalized.includes(key)) {
      return coords;
    }
  }
  return null;
};

// Helper component to center and fit bounds
const MapViewController = ({ coordinates, defaultCenter }) => {
  const map = useMap();

  useEffect(() => {
    if (coordinates.length > 0) {
      const bounds = coordinates.map((c) => [c.lat, c.lng]);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    } else if (defaultCenter) {
      map.setView(defaultCenter, 10);
    }
  }, [coordinates, defaultCenter, map]);

  return null;
};

export const TripMapView = ({
  activities = [],
  selectedDay = 'all',
  currency = 'USD',
  destination = '',
}) => {
  const [geocodedCenter, setGeocodedCenter] = useState(null);

  // Dynamic geocoding for destination if no activities have coordinates yet
  useEffect(() => {
    if (!destination) return;

    // First check local dictionary
    const localCoords = getDestinationCoordinates(destination);
    if (localCoords) {
      setGeocodedCenter(localCoords);
      return;
    }

    // Otherwise geocode via OpenStreetMap Nominatim
    let isMounted = true;
    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destination)}&format=json&limit=1`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data && data.length > 0) {
          setGeocodedCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [destination]);

  // Filter activities by day
  const filteredActivities = useMemo(() => {
    if (selectedDay === 'all') return activities;
    return activities.filter((a) => a.dayNumber === Number(selectedDay));
  }, [activities, selectedDay]);

  // Activities with valid lat & lng coordinates
  const mappedActivities = useMemo(() => {
    return filteredActivities.filter(
      (a) =>
        a.location?.lat !== null &&
        a.location?.lat !== undefined &&
        !isNaN(a.location.lat) &&
        a.location?.lng !== null &&
        a.location?.lng !== undefined &&
        !isNaN(a.location.lng)
    );
  }, [filteredActivities]);

  const unmappedActivities = useMemo(() => {
    return filteredActivities.filter(
      (a) =>
        a.location?.lat === null ||
        a.location?.lat === undefined ||
        isNaN(a.location.lat) ||
        a.location?.lng === null ||
        a.location?.lng === undefined ||
        isNaN(a.location.lng)
    );
  }, [filteredActivities]);

  // Priority for center: 1. mapped activities, 2. geocoded destination, 3. Kyoto default
  const center = useMemo(() => {
    if (mappedActivities.length > 0) {
      return [mappedActivities[0].location.lat, mappedActivities[0].location.lng];
    }
    if (geocodedCenter) {
      return geocodedCenter;
    }
    return [35.0116, 135.7681];
  }, [mappedActivities, geocodedCenter]);

  return (
    <div className="space-y-4">
      {/* Interactive Map Box */}
      <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-sand-200 shadow-md bg-sand-100">
        <MapContainer
          center={center}
          zoom={11}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          {/* English Google Maps Tile Layer */}
          <TileLayer
            attribution='&copy; Google Maps'
            url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=en"
            maxZoom={20}
          />

          <MapViewController
            coordinates={mappedActivities.map((a) => ({
              lat: a.location.lat,
              lng: a.location.lng,
            }))}
            defaultCenter={center}
          />

          {mappedActivities.map((activity, index) => (
            <Marker
              key={activity._id || activity.id || index}
              position={[activity.location.lat, activity.location.lng]}
              icon={createNumberedMarkerIcon(index + 1, activity.category)}
            >
              <Popup>
                <div className="p-1 space-y-1.5 max-w-[200px]">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getCategoryColor(
                        activity.category
                      )}`}
                    >
                      {activity.category}
                    </span>
                    {activity.time && (
                      <span className="text-[11px] text-charcoal-500 font-medium flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" /> {activity.time}
                      </span>
                    )}
                  </div>
                  <h5 className="font-bold text-xs text-charcoal-900 leading-snug">
                    {index + 1}. {activity.title}
                  </h5>
                  {activity.location?.name && (
                    <p className="text-[11px] text-charcoal-600 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-forest-700 shrink-0" />
                      {activity.location.name}
                    </p>
                  )}
                  {activity.cost > 0 && (
                    <div className="text-[11px] font-semibold text-forest-800 pt-1 border-t border-sand-200">
                      Cost: {formatCurrency(activity.cost, currency)}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Float Map Counter */}
        <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-md border border-sand-200 text-xs font-semibold text-charcoal-800 flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5 text-forest-800" />
          <span>{mappedActivities.length} Pinned Locations</span>
        </div>
      </div>

      {/* Unmapped Activities notice */}
      {unmappedActivities.length > 0 && (
        <div className="p-4 bg-sand-50 rounded-xl border border-sand-200 text-xs space-y-2">
          <div className="font-semibold text-charcoal-700">
            Activities without map coordinates ({unmappedActivities.length}):
          </div>
          <div className="flex flex-wrap gap-2">
            {unmappedActivities.map((act) => (
              <span
                key={act._id || act.id}
                className="bg-white px-2.5 py-1 rounded-lg border border-sand-200 text-charcoal-600"
              >
                Day {act.dayNumber}: {act.title}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-charcoal-400">
            Tip: Edit an activity and add Latitude & Longitude to display its numbered pin on the map.
          </p>
        </div>
      )}
    </div>
  );
};

export default TripMapView;
