import { css } from 'carbonyxation/css';
import { useState, useEffect } from 'react';
import { env } from '~/env.client';

// Separate component to handle routing that uses useMap hook
const RoutingMachine = ({ libraries }) => {
  const { useMap } = libraries;
  const map = useMap(); // Get direct access to the map instance

  useEffect(() => {
    if (!map || !libraries) return;

    const { L } = libraries;

    if (!L.Routing) {
      console.error("L.Routing is not available");
      return;
    }

    // Create routing control
    const routingControl = L.Routing.control({
      router: new L.Routing.GraphHopper(undefined, {
        useCustomModel: true,
        alternativeRoute: true,
        serviceUrl: env.VITE_GRAPHHOPPER_URL
      }),
      waypoints: [
        L.latLng(13.4510, 99.6341),
        L.latLng(13.7563, 100.5018)
      ]
    }).addTo(map);

    // Clean up on unmount
    return () => {
      routingControl.remove();
    };
  }, [map, libraries]);

  return null; // This component doesn't render anything visible
};

const MapComponent = () => {
  const [libraries, setLibraries] = useState(null);

  // Load all required libraries
  useEffect(() => {
    const loadLibraries = async () => {
      try {
        // Import CSS first
        await import('leaflet/dist/leaflet.css');
        await import('leaflet-routing-machine/dist/leaflet-routing-machine.css');

        // Import Leaflet and React-Leaflet
        const leafletModule = await import('leaflet');
        const L = leafletModule.default || leafletModule;
        const reactLeaflet = await import('react-leaflet');

        // Import routing machine AFTER leaflet is loaded
        await import('leaflet-routing-machine');
        await import('@carbonyx/lrm-graphhopper');

        // Fix the icon issue
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
          iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
          shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
        });

        // Set libraries to be used in rendering
        setLibraries({
          L,
          ...reactLeaflet,
        });
      } catch (error) {
        console.error("Failed to load map libraries:", error);
      }
    };

    loadLibraries();
  }, []);

  // Don't render until libraries are loaded
  if (!libraries) {
    return <div>Loading map...</div>;
  }

  const { MapContainer, TileLayer, Marker, Popup } = libraries;

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <MapContainer
        center={[13.7563, 100.5018]}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[13.7563, 100.5018]}>
          <Popup>
            Bangkok
          </Popup>
        </Marker>

        {/* Add the routing component which uses useMap internally */}
        <RoutingMachine libraries={libraries} />
      </MapContainer>
    </div>
  );
};

export default function Navigation() {
  const [routingType, setRoutingType] = useState<'ab' | 'optim'>('ab');

  return (
    <div className={css({
      height: '100%',
    })}>
      <MapComponent />
    </div>
  );
}
