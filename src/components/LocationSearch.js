import React, { useEffect, useRef, useState } from 'react';
import Select from 'react-select';
import { Circle, MapContainer, TileLayer, Marker, Popup, useMap, useMapEvent } from 'react-leaflet';
import { Box, Button, Typography } from '@mui/material';
import { MyLocation } from '@mui/icons-material';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet icon bug (marker icons)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

function MapAutoCenter({ center, zoom = 13 }) {
  const map = useMap();

  React.useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);

  return null;
}

function LocationMarker({ onLocationSelect }) {
  useMapEvent('click', (e) => {
    const { lat, lng } = e.latlng;
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
      .then(res => res.json())
      .then(data => {
        onLocationSelect({
          value: {
            lat,
            lon: lng,
            name: data.address?.city || data.address?.town || data.address?.village || data.display_name || `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`
          },
          label: data.address?.city || data.address?.town || data.address?.village || data.display_name || `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`
        });
      })
      .catch(() => {
        onLocationSelect({
          value: {
            lat,
            lon: lng,
            name: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`
          },
          label: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`
        });
      });
  });
  return null;
}

const getGeolocationErrorMessage = (error) => {
  if (!error) {
    return 'Unable to determine your location.';
  }

  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'Location permission was denied.';
    case error.POSITION_UNAVAILABLE:
      return 'Location information is unavailable on this device.';
    case error.TIMEOUT:
      return 'Timed out while fetching a high-accuracy location.';
    default:
      return 'Unable to determine your location.';
  }
};

const LocationSearch = () => {
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [geoAccuracy, setGeoAccuracy] = useState(null);
  const [geoPosition, setGeoPosition] = useState(null);
  const watchIdRef = useRef(null);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by this browser.');
      return;
    }

    setGeoLoading(true);
    setGeoError('');

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const nextCoordinates = {
          lat: latitude,
          lon: longitude,
          name: `Current location (±${Math.round(accuracy)} m)`,
        };

        setGeoPosition({ lat: latitude, lon: longitude });
        setGeoAccuracy(accuracy);
        setSelected({ value: nextCoordinates, label: nextCoordinates.name });
        setGeoLoading(false);

        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
      },
      (error) => {
        setGeoError(getGeolocationErrorMessage(error));
        setGeoLoading(false);

        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const handleInputChange = async (inputValue) => {
    if (!inputValue || typeof inputValue !== 'string') return;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(inputValue)}&countrycodes=in&limit=10`
      );
      const data = await res.json();

      const formattedOptions = data.map((place) => ({
        label: String(place.display_name || ''),
        value: {
          lat: parseFloat(place.lat),
          lon: parseFloat(place.lon),
          name: String(place.display_name || ''),
        },
      }));

      setOptions(formattedOptions);
    } catch (err) {
      console.error("Error fetching location:", err);
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h3 style={{ textAlign: 'center' }}>Search a Location</h3>

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Button
          type="button"
          variant="outlined"
          startIcon={<MyLocation />}
          onClick={handleUseCurrentLocation}
          disabled={geoLoading}
        >
          {geoLoading ? 'Locating...' : 'Use My Current Location'}
        </Button>
      </Box>

      {geoError ? (
        <Typography variant="body2" color="error" sx={{ mb: 2, textAlign: 'center' }}>
          {geoError}
        </Typography>
      ) : null}

      <Select
        options={options}
        onInputChange={(inputValue, { action }) => {
          if (action === 'input-change') {
            handleInputChange(inputValue);
          }
        }}
        onChange={setSelected}
        placeholder="Enter a location..."
        noOptionsMessage={() => "Start typing to search..."}
        getOptionLabel={(e) => e.label?.toString() || ''}
        getOptionValue={(e) => e.label?.toString() || ''}
      />

      {selected && (
        <MapContainer
          center={[selected.value.lat, selected.value.lon]}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: '400px', width: '100%', marginTop: '1rem' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          />
          <MapAutoCenter center={[selected.value.lat, selected.value.lon]} zoom={13} />
          <LocationMarker onLocationSelect={setSelected} />
          <Marker position={[selected.value.lat, selected.value.lon]}>
            <Popup>{selected.value.name}</Popup>
          </Marker>
          {geoPosition && geoAccuracy ? (
            <Circle
              center={[geoPosition.lat, geoPosition.lon]}
              radius={geoAccuracy}
              pathOptions={{ color: '#1976d2', fillColor: '#1976d2', fillOpacity: 0.18 }}
            />
          ) : null}
        </MapContainer>
      )}
    </div>
  );
};

export default LocationSearch;
