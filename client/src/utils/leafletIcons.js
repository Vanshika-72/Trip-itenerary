import L from 'leaflet';

/**
 * Creates an elegant SVG numbered marker pin for Leaflet
 */
export const createNumberedMarkerIcon = (number, category = 'Sightseeing') => {
  const categoryColors = {
    Sightseeing: '#234638',
    Food: '#bf9868',
    Accommodation: '#46745f',
    Transportation: '#3b82f6',
    Shopping: '#ec4899',
    Entertainment: '#8b5cf6',
    Other: '#64748b',
  };

  const color = categoryColors[category] || '#234638';

  const html = `
    <div style="
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: ${color};
      color: #ffffff;
      border: 2px solid #ffffff;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      cursor: pointer;
    ">
      <span style="
        transform: rotate(45deg);
        font-size: 13px;
        font-weight: 700;
        font-family: system-ui, sans-serif;
      ">${number}</span>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};
