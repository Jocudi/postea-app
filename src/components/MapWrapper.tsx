"use client"

import dynamic from 'next/dynamic'

interface PlaceProps {
  id: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
}

const DynamicMap = dynamic(() => import('@/components/Map'), { 
  ssr: false, 
  loading: () => <div className="h-[300px] w-full bg-slate-100 animate-pulse rounded-[2rem] mb-6" />
})

export default function MapWrapper({ places }: { places: PlaceProps[] }) {
  return <DynamicMap places={places} />
}
