import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet's default icon paths missing in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const createCustomIcon = (color: string, label?: string) => {
    const html = `
        <div style="
            background-color: ${color};
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 14px;
        ">
            ${label || ''}
        </div>
    `;
    return L.divIcon({
        html,
        className: 'custom-leaflet-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16]
    });
};

const StartIcon = createCustomIcon('#0f172a', 'S');
const StopIcon = (seq: number) => createCustomIcon('#10b981', seq.toString());
const DeliveryIcon = createCustomIcon('#f43f5e', 'D');

interface Stop {
    sequence: number;
    lat: number;
    lon: number;
    name?: string;
    customerName?: string;
    addressText?: string;
    details?: string;
    type?: 'PICKUP' | 'DELIVERY'; // From multi-farm
}

interface RouteMapProps {
    startLocation: { lat: number; lon: number; name?: string };
    stops: Stop[];
}

// Helper to fit bounds when stops change
const MapBoundsFitter: React.FC<{ coords: [number, number][] }> = ({ coords }) => {
    const map = useMap();
    useEffect(() => {
        if (coords.length > 0) {
            const bounds = L.latLngBounds(coords);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [coords, map]);
    return null;
};

export const RouteMap: React.FC<RouteMapProps> = ({ startLocation, stops }) => {
    // Determine the polyline coordinates
    const allCoords: [number, number][] = [
        [startLocation.lat, startLocation.lon],
        ...stops.map(s => [s.lat, s.lon] as [number, number])
    ];

    return (
        <div className="w-full h-[400px] rounded-2xl overflow-hidden border border-slate-200 z-0">
            <MapContainer 
                center={[startLocation.lat, startLocation.lon]} 
                zoom={10} 
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <MapBoundsFitter coords={allCoords} />

                {/* Draw Route Line */}
                <Polyline 
                    positions={allCoords} 
                    pathOptions={{ color: '#3b82f6', weight: 4, opacity: 0.7, dashArray: '8, 8' }} 
                />

                {/* Start Marker */}
                <Marker position={[startLocation.lat, startLocation.lon]} icon={StartIcon}>
                    <Popup>
                        <div className="font-bold text-sm">{startLocation.name || 'Start Point'}</div>
                        <div className="text-xs text-slate-500">Dispatch / Initial Farm</div>
                    </Popup>
                </Marker>

                {/* Stop Markers */}
                {stops.map((stop, idx) => {
                    let icon = StopIcon(stop.sequence);
                    let title = stop.name || stop.customerName || `Stop ${stop.sequence}`;
                    
                    if (stop.type === 'DELIVERY') {
                        icon = DeliveryIcon;
                    } else if (idx === stops.length - 1 && !stop.type) {
                        // In single-farm mode, the last stop is just the last customer, 
                        // but we can color it as Delivery or just keep the number.
                    }

                    return (
                        <Marker 
                            key={`stop-${idx}`} 
                            position={[stop.lat, stop.lon]} 
                            icon={icon}
                        >
                            <Popup>
                                <div className="font-bold text-sm mb-1">{title}</div>
                                {stop.details && <div className="text-xs text-slate-700 mb-1">{stop.details}</div>}
                                {stop.addressText && <div className="text-[10px] text-slate-500">{stop.addressText}</div>}
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
};
