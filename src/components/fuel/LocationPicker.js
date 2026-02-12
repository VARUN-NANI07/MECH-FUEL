import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { TextField, Box, Typography, Paper, Autocomplete, CircularProgress } from '@mui/material';
import { LocationOn } from '@mui/icons-material';
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

function LocationMarker({ onLocationSelect, position }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onLocationSelect({
        coordinates: { lat, lng },
        address: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`
      });
    },
  });

  return position ? <Marker position={[position.lat, position.lng]} /> : null;
}

export default function LocationPicker({ onLocationSelect, selectedLocation }) {
  const [searchOptions, setSearchOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState([17.3850, 78.4867]); // Hyderabad default
  
  const defaultCenter = mapCenter;

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
          <LocationMarker 
            onLocationSelect={onLocationSelect}
            position={selectedLocation?.coordinates}
          />
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