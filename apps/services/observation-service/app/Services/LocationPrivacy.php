<?php

namespace App\Services;

/**
 * Produces the persisted public projection once, at publication time.
 * Callers must never use it to turn private database values into a response on demand.
 */
class LocationPrivacy
{
    public function sanitize(float $lat, float $lng, string $sensitivity, ?string $region = null): array
    {
        return match ($sensitivity) {
            'EXACT' => ['public_lat' => $lat, 'public_lng' => $lng, 'public_region' => $region],
            'APPROXIMATE' => ['public_lat' => floor($lat * 20) / 20 + 0.025, 'public_lng' => floor($lng * 20) / 20 + 0.025, 'public_region' => $region],
            default => ['public_lat' => null, 'public_lng' => null, 'public_region' => $region ?: 'Protected location']
        };
    }
}
