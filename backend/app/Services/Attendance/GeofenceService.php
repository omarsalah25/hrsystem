<?php

declare(strict_types=1);

namespace App\Services\Attendance;

class GeofenceService
{
    private const EARTH_RADIUS_METERS = 6371000;

    /**
     * Compute distance in meters between two GPS coordinates using the Haversine formula
     */
    public function calculateDistanceMeters(
        float $lat1,
        float $lon1,
        float $lat2,
        float $lon2
    ): float {
        $latFrom = deg2rad($lat1);
        $lonFrom = deg2rad($lon1);
        $latTo = deg2rad($lat2);
        $lonTo = deg2rad($lon2);

        $latDelta = $latTo - $latFrom;
        $lonDelta = $lonTo - $lonFrom;

        $angle = 2 * asin(sqrt(
            pow(sin($latDelta / 2), 2) +
            cos($latFrom) * cos($latTo) * pow(sin($lonDelta / 2), 2)
        ));

        return round($angle * self::EARTH_RADIUS_METERS, 2);
    }

    /**
     * Check if a given mobile coordinate is within the allowed branch radius
     */
    public function isWithinGeofence(
        float $userLat,
        float $userLon,
        float $branchLat,
        float $branchLon,
        int $allowedRadiusMeters = 200
    ): bool {
        $distance = $this->calculateDistanceMeters($userLat, $userLon, $branchLat, $branchLon);
        return $distance <= $allowedRadiusMeters;
    }
}

