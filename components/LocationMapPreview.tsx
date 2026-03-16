"use client"

import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api"

interface LocationMapPreviewProps {
    lat: number
    lng: number
    displayName: string
    isValid: boolean
}

const containerStyle = { width: "100%", height: "220px" }

export default function LocationMapPreview({ lat, lng, displayName, isValid }: LocationMapPreviewProps) {
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    })

    if (!isLoaded) {
        return (
            <div className="w-full h-[220px] rounded-xl border border-sky-200 bg-sky-50/50 flex items-center justify-center mt-2">
                <div className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="relative w-full h-[220px] rounded-xl overflow-hidden border border-sky-200 shadow-sm mt-2">
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={{ lat, lng }}
                zoom={14}
                options={{ disableDefaultUI: true, zoomControl: true }}
            >
                <Marker position={{ lat, lng }} title={displayName} />
            </GoogleMap>
            {!isValid && (
                <div className="absolute inset-x-0 bottom-0 z-10 bg-red-500/90 backdrop-blur-sm text-white text-xs font-semibold px-3 py-2 text-center">
                    This address is not in Ontario — please use an Ontario address
                </div>
            )}
        </div>
    )
}
