"use client";

import { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import Link from 'next/link';

const containerStyle = {
  width: '100%',
  height: '100%'
};

export default function Map({ places }: { places: any[] }) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: ['places']
  })

  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [nearbyPlaces, setNearbyPlaces] = useState<any[]>([])
  const [selectedPlace, setSelectedPlace] = useState<any>(null)
  
  // Coordenadas por defecto a la Minerva
  const [userLocation, setUserLocation] = useState({ lat: 20.6736, lng: -103.3874 })

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      })
    }
  }, [])

  const onLoad = useCallback(function callback(mapInstance: google.maps.Map) {
    setMap(mapInstance)
  }, [])

  const onUnmount = useCallback(function callback() {
    setMap(null)
  }, [])

  useEffect(() => {
    if (!map || !window.google) return;

    const service = new google.maps.places.PlacesService(map);
    service.nearbySearch(
      {
        location: userLocation,
        radius: 1200,
        type: 'restaurant',
      },
      (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const formatted = results.map(p => ({
            id: p.place_id,
            name: p.name,
            category: p.types?.[0]?.replace('_', ' ') || 'Local',
            latitude: p.geometry?.location?.lat(),
            longitude: p.geometry?.location?.lng()
          }))
          setNearbyPlaces(formatted)
        }
      }
    );
  }, [map, userLocation])

  // Mezclar los places propios de DB y los descubiertos por Google Maps
  const allPins = [
    ...places, 
    ...nearbyPlaces.filter(np => !places.find(p => p.googlePlaceId === np.id || p.id === np.id))
  ]

  return isLoaded ? (
    <div className="h-[300px] w-full rounded-[2rem] overflow-hidden shadow-xl shadow-purple-900/5 mb-6 relative z-0">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={userLocation}
        zoom={15}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          mapId: 'DEMO_MAP_ID' // Para usar cloud styling si existiera
        }}
      >
        {allPins.map((place, i) => (
          <Marker
            key={place.id || `pin-${i}`}
            position={{ lat: place.latitude, lng: place.longitude }}
            onClick={() => setSelectedPlace(place)}
          />
        ))}

        {selectedPlace && (
          <InfoWindow
            position={{ lat: selectedPlace.latitude, lng: selectedPlace.longitude }}
            onCloseClick={() => setSelectedPlace(null)}
          >
            <div className="text-center py-2 px-1 text-slate-900 min-w-32">
              <h4 className="font-extrabold text-sm mb-1 leading-tight">{selectedPlace.name}</h4>
              <p className="text-[10px] text-purple-600 font-bold mb-3 uppercase tracking-widest">{selectedPlace.category}</p>
              <Link 
                href={`/locales/${selectedPlace.id}`}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-2 rounded-full text-xs font-bold shadow-lg shadow-purple-600/30 hover:opacity-90 active:scale-95 transition-all inline-block"
              >
                Visitar Local
              </Link>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  ) : (
    <div className="h-[300px] w-full bg-slate-100/50 animate-pulse rounded-[2rem] mb-6 flex flex-col items-center justify-center border border-slate-200/50">
      <div className="w-8 h-8 rounded-full border-4 border-purple-500/30 border-t-purple-600 animate-spin mb-3"></div>
      <span className="text-sm font-bold text-slate-400">Iniciando SDK...</span>
    </div>
  )
}
