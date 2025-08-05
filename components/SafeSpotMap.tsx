'use client'

import { useState, useEffect, useRef } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import { Button } from './ui/Button'
import { SAFE_SPOTS } from '@/lib/constants'

interface SafeSpotMapProps {
  isVisible: boolean
  onClose: () => void
}

export const SafeSpotMap = ({ isVisible, onClose }: SafeSpotMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isVisible || !mapRef.current) return

    const initMap = async () => {
      try {
        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
          version: 'weekly',
        })

        const { Map } = await loader.importLibrary('maps')
        const { Marker } = await loader.importLibrary('marker')

        // Center map on UC Berkeley campus
        const mapInstance = new Map(mapRef.current!, {
          center: { lat: 37.8719, lng: -122.2585 },
          zoom: 16,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'on' }]
            },
            {
              featureType: 'poi.business',
              stylers: [{ visibility: 'off' }]
            }
          ]
        })

        // Add safe spot markers
        SAFE_SPOTS.forEach((spot) => {
          const marker = new Marker({
            position: { lat: spot.lat, lng: spot.lng },
            map: mapInstance,
            title: spot.name,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#003262',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            }
          })

          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div class="p-2">
                <h3 class="font-semibold text-primary">${spot.name}</h3>
                <p class="text-sm text-gray-600">Safe meeting spot</p>
              </div>
            `
          })

          marker.addListener('click', () => {
            infoWindow.open(mapInstance, marker)
          })
        })

        setMap(mapInstance)
        setLoading(false)
      } catch (error) {
        console.error('Error loading map:', error)
        setLoading(false)
      }
    }

    initMap()
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-4xl h-[600px] overflow-hidden">
        {/* Header */}
        <div className="bg-primary text-white p-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Safe Meeting Spots</h2>
            <p className="text-white/80 text-sm">
              Recommended public locations on UC Berkeley campus
            </p>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
          >
            ✕
          </Button>
        </div>

        {/* Map Container */}
        <div className="relative flex-1 h-full">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-gray-600">Loading map...</p>
              </div>
            </div>
          )}
          <div ref={mapRef} className="w-full h-full" />
        </div>

        {/* Legend */}
        <div className="p-4 bg-gray-50 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-primary rounded-full border-2 border-white"></div>
                <span className="text-sm text-gray-700">Safe Meeting Spots</span>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              💡 Always meet during daylight hours when possible
            </div>
          </div>
          
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            {SAFE_SPOTS.map((spot) => (
              <div key={spot.name} className="text-gray-700">
                • {spot.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}