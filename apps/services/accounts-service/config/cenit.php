<?php

$keyPath = static function (?string $path, string $fallback): string {
    $path ??= $fallback;
    return preg_match('/^(?:[A-Za-z]:[\\\\\/]|\/)/', $path) ? $path : base_path($path);
};

return [
    'issuer' => env('JWT_ISSUER', 'cenit-accounts'),
    'private_key' => $keyPath(env('JWT_PRIVATE_KEY_PATH'), storage_path('app/keys/jwt-private.pem')),
    'public_key' => $keyPath(env('JWT_PUBLIC_KEY_PATH'), storage_path('app/keys/jwt-public.pem')),
    'access_ttl_minutes' => (int) env('JWT_ACCESS_TTL_MINUTES', 15),
];
