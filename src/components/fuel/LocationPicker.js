import { useEffect, useRef, useState } from 'react';
import { Circle, MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { TextField, Box, Typography, Paper, Autocomplete, CircularProgress, Button } from '@mui/material';
import { LocationOn, MyLocation } from '@mui/icons-material';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
import L from 'leaflet';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

function MapAutoCenter({ center, zoom = 14 }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);

  return null;
}

function LocationMarker({ onLocationSelect, position, onManualSelect }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      if (onManualSelect) {
        onManualSelect();
      }
      
      // Reverse geocode the clicked coordinates
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        .then(res => res.json())
        .then(data => {
          onLocationSelect({
            coordinates: { lat, lng },
            address: data.address?.city || data.address?.town || data.address?.village || data.display_name || `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`
          });
        })
        .catch(() => {
          onLocationSelect({
            coordinates: { lat, lng },
            address: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`
          });
        });
    },
  });

  return position ? <Marker position={[position.lat, position.lng]} /> : null;
}

export default function LocationPicker({ onLocationSelect, selectedLocation }) {
  const [searchOptions, setSearchOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState([17.3850, 78.4867]); // Hyderabad default
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [geoAccuracy, setGeoAccuracy] = useState(null);
  const [geoPosition, setGeoPosition] = useState(null);
  const watchIdRef = useRef(null);
  
  const defaultCenter = mapCenter;

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const clearGeoResult = () => {
    setGeoPosition(null);
    setGeoAccuracy(null);
    setGeoError('');
  };

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
        const nextCoordinates = { lat: latitude, lng: longitude };

        setGeoPosition(nextCoordinates);
        setGeoAccuracy(accuracy);
        setMapCenter([latitude, longitude]);
        onLocationSelect({
          coordinates: nextCoordinates,
          address: `Current location (±${Math.round(accuracy)} m)`,
        });
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

  const handleSearchInput = async (inputValue) => {
    if (!inputValue || inputValue.length < 2) {
      setSearchOptions([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(inputValue)}&countrycodes=in&limit=10`
      );
      const data = await res.json();

      const formattedOptions = data.map((place) => ({
        label: place.display_name || '',
        lat: parseFloat(place.lat),
        lng: parseFloat(place.lon),
      }));

      setSearchOptions(formattedOptions);
    } catch (err) {
      console.error("Error fetching location:", err);
      setSearchOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLocation = (option) => {
    if (option) {
      clearGeoResult();
      const newLocation = {
        coordinates: { lat: option.lat, lng: option.lng },
        address: option.label
      };
      onLocationSelect(newLocation);
      setMapCenter([option.lat, option.lng]);
      setSearchOptions([]);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="subtitle1" gutterBottom>
        Search for a location or click on the map to select
      </Typography>

      <Button
        type="button"
        variant="outlined"
        startIcon={<MyLocation />}
        onClick={handleUseCurrentLocation}
        disabled={geoLoading}
        sx={{ mb: 2 }}
      >
        {geoLoading ? 'Locating...' : 'Use My Current Location'}
      </Button>

      {geoError && (
        <Typography variant="body2" color="error" sx={{ mb: 2 }}>
          {geoError}
        </Typography>
      )}
      
      <Autocomplete
        options={searchOptions}
        loading={loading}
        getOptionLabel={(option) => option.label}
        onInputChange={(event, value) => {
          handleSearchInput(value);
        }}
        onChange={(event, value) => {
          handleSelectLocation(value);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search Location"
            placeholder="Enter location name..."
            InputProps={{
              ...params.InputProps,
              startAdornment: <LocationOn color="action" sx={{ mr: 1 }} />,
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
            sx={{ mb: 2 }}
          />
        )}
      />

      <Paper elevation={3} sx={{ height: 400, width: '100%', overflow: 'hidden' }}>
        <MapContainer
          center={defaultCenter}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapAutoCenter center={mapCenter} zoom={selectedLocation ? 14 : 12} />
          <LocationMarker 
            onLocationSelect={onLocationSelect}
            position={selectedLocation?.coordinates}
            onManualSelect={clearGeoResult}
          />
          {geoPosition && geoAccuracy ? (
            <Circle
              center={[geoPosition.lat, geoPosition.lng]}
              radius={geoAccuracy}
              pathOptions={{ color: '#1976d2', fillColor: '#1976d2', fillOpacity: 0.18 }}
            />
          ) : null}
        </MapContainer>
      </Paper>
      
      {selectedLocation?.coordinates && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          📍 {selectedLocation.address}
        </Typography>
      )}
    </Box>
  );
}