<?php

namespace App\Domain\Catalog;

use Illuminate\Support\Facades\Http;

/**
 * Read-only anti-corruption layer for the Catalog contract.
 */
class CatalogSensitivityClient
{
    /**
     * @return string|null A validated sensitivity, or null when Catalog/network/contract cannot be trusted.
     */
    public function sensitivityFor(string $speciesId, ?string $correlationId = null): ?string
    {
        try {
            $request = Http::acceptJson()->timeout((int) config('cenit.catalog_timeout_seconds', 2));

            if ($correlationId) {
                $request = $request->withHeaders(['X-Request-Id' => $correlationId]);
            }

            $response = $request->get(
                rtrim(config('cenit.catalog_url'), '/') . '/api/catalog/v1/species/' . $speciesId,
            );

            $sensitivity = $response->successful() ? $response->json('sensitivity') : null;

            return in_array($sensitivity, ['EXACT', 'APPROXIMATE', 'HIDDEN'], true) ? $sensitivity : null;
        } catch (\Throwable) {
            return null;
        }
    }
}
