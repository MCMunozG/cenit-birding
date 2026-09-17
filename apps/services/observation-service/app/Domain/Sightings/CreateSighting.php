<?php

namespace App\Domain\Sightings;

use App\Domain\Catalog\CatalogSensitivityClient;
use App\Models\Sighting;
use App\Services\LocationPrivacy;

/** Caso de uso que conserva la ubicación privada y decide si existe una proyección pública. */
class CreateSighting
{
    public function __construct(
        private readonly CatalogSensitivityClient $catalog,
        private readonly LocationPrivacy $privacy,
    ) {}

    /**
     * Crea un registro privado y, sólo si se permite publicar, su proyección pública.
     *
     * @return array{created: Sighting|null, catalogUnavailable: bool}
     */
    public function handle(array $data, string $userId, ?string $correlationId = null): array
    {
        $speciesId = $data['species_id'] ?? null;
        $publish = (bool) ($data['publish'] ?? false);
        $sensitivity = 'HIDDEN';

        if ($speciesId) {
            $sensitivity = $this->catalog->sensitivityFor($speciesId, $correlationId);
            if ($publish && !$sensitivity) {
                return ['created' => null, 'catalogUnavailable' => true];
            }

            $sensitivity ??= 'HIDDEN';
        }

        $status = !$publish
            ? 'DRAFT'
            : ($speciesId ? 'PUBLISHED' : 'NEEDS_IDENTIFICATION');

        $publicLocation = $status === 'DRAFT'
            ? ['public_lat' => null, 'public_lng' => null, 'public_region' => null]
            : $this->privacy->sanitize(
                (float) $data['latitude'],
                (float) $data['longitude'],
                $sensitivity,
                $data['region'] ?? null,
            );

        $sighting = Sighting::create([
            'user_id' => $userId,
            'species_id' => $speciesId,
            'observed_at' => $data['observed_at'],
            'individuals' => $data['individuals'] ?? 1,
            'behavior' => $data['behavior'] ?? null,
            'notes' => $data['notes'] ?? null,
            'status' => $status,
            'sensitivity' => $sensitivity,
            'private_lat' => $data['latitude'],
            'private_lng' => $data['longitude'],
            ...$publicLocation,
        ]);

        return ['created' => $sighting, 'catalogUnavailable' => false];
    }
}
