import { css } from 'carbonyxation/css';
import { useState, useEffect, useRef } from 'react';
import { env } from '~/env.client';

const MapComponent = () => {
  const [libraries, setLibraries] = useState(null);
  const mapRef = useRef(null);
  const routingControlRef = useRef(null);

  // First effect to load all libraries
  useEffect(() => {
    const loadLibraries = async () => {
      try {
        // Import CSS first
        await import('leaflet/dist/leaflet.css');
        await import('leaflet-routing-machine/dist/leaflet-routing-machine.css')

        // Import Leaflet and React-Leaflet
        const leafletModule = await import('leaflet');
        const L = leafletModule.default || leafletModule;
        const reactLeaflet = await import('react-leaflet');

        // Import routing machine AFTER leaflet is loaded
        await import('leaflet-routing-machine');
        await import('@carbonyx/lrm-graphhopper')

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

    // Cleanup function
    return () => {
      if (routingControlRef.current && mapRef.current) {
        routingControlRef.current.remove();
      }
    };
  }, []);

  // Second effect to set up routing when map and libraries are ready
  useEffect(() => {
    console.log(mapRef.current)
    if (!libraries || !mapRef.current) return;

    const { L } = libraries;

    // Verify L.Routing exists before using it
    if (L.Routing) {
      try {
        routingControlRef.current = L.Routing.control({
          router: new L.Routing.GraphHopper(undefined, {
            serviceUrl: env.VITE_GRAPHHOPPER_URL
          }),
          waypoints: [
            L.latLng(13.4510, 99.6341),
            L.latLng(13.7563, 100.5018)
          ]
        }).addTo(mapRef.current);
      } catch (error) {
        console.error("Error creating routing control:", error);
      }
    } else {
      console.error("L.Routing is not available. Make sure leaflet-routing-machine is properly loaded.");
    }
  }, [libraries, mapRef.current]);

  // Don't render anything until libraries are loaded
  if (!libraries) {
    return <div>Loading map...</div>;
  }

  const { MapContainer, TileLayer, Marker, Popup } = libraries;

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <MapContainer
        ref={mapRef}
        center={[13.7563, 100.5018]}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[51.505, -0.09]}>
          <Popup>
            A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
        </Marker>
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
