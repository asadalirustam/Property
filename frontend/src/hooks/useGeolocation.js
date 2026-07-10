import { useState } from 'react';

export const useGeolocation = () => {
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        setError('Geolocation is not supported by your browser.');
        reject('Not supported');
        return;
      }

      setLoading(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCoords(coordinates);
          setLoading(false);
          resolve(coordinates);
        },
        (err) => {
          let msg = 'Failed to retrieve location.';
          if (err.code === 1) msg = 'Location permission denied.';
          else if (err.code === 2) msg = 'Location unavailable.';
          else if (err.code === 3) msg = 'Timeout retrieving location.';

          setError(msg);
          setLoading(false);
          reject(msg);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  };

  return { coords, error, loading, getLocation };
};
export default useGeolocation;
