<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Defines the API projection of a sighting. Private coordinates require an explicit opt-in
 * by the owner/moderation endpoint, making accidental exposure in map responses impossible.
 */
class SightingResource extends JsonResource
{
    /** Keep single-resource responses compatible with the existing REST contract. */
    public static $wrap = null;

    public function __construct(mixed $resource, private readonly bool $includePrivateLocation = false)
    {
        parent::__construct($resource);
    }

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'species_id' => $this->species_id,
            'observed_at' => $this->observed_at,
            'individuals' => $this->individuals,
            'behavior' => $this->behavior,
            'status' => $this->status,
            'sensitivity' => $this->sensitivity,
            'latitude' => $this->public_lat,
            'longitude' => $this->public_lng,
            'region' => $this->public_region,
            'private_location' => $this->when($this->includePrivateLocation, [
                'latitude' => $this->private_lat,
                'longitude' => $this->private_lng,
            ]),
        ];
    }
}
