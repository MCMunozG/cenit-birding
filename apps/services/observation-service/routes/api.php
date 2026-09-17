<?php

use App\Http\Controllers\SightingController;
use Illuminate\Support\Facades\Route;

// Contrato HTTP de Observation: el mapa es público y las proyecciones privadas requieren JWT.
Route::prefix('observations/v1')->group(function () {
    Route::get('health', fn() => ['status' => 'ok', 'service' => 'observation-service']);
    Route::get('map/sightings', [SightingController::class, 'map']);
    Route::middleware('jwt')->group(function () {
        Route::post('sightings', [SightingController::class, 'store']);
        Route::get('sightings/mine', [SightingController::class, 'mine']);
        Route::get('sightings/{s}', [SightingController::class, 'show']);
    });
});
