<?php

namespace App\Http\Middleware;

use Closure;
use DateTimeImmutable;
use Illuminate\Http\Request;
use Lcobucci\JWT\Configuration;
use Lcobucci\JWT\Signer\Key\InMemory;
use Lcobucci\JWT\Signer\Rsa\Sha256;
use Lcobucci\JWT\Validation\Constraint\SignedWith;

/**
 * Verifies an Accounts-issued JWT and exposes only its identity claims to the request.
 * Catalog uses the public key; it cannot issue tokens.
 */
class AuthenticateJwt
{
    public function handle(Request $request, Closure $next)
    {
        $raw = $request->bearerToken();
        if (!$raw) return response()->json(['code' => 'UNAUTHENTICATED', 'message' => 'Bearer token required', 'requestId' => $request->attributes->get('requestId')], 401);
        try {
            $config = Configuration::forAsymmetricSigner(new Sha256(), InMemory::file(config('cenit.private_key')), InMemory::file(config('cenit.public_key')));
            $token = $config->parser()->parse($raw);
            if (!$config->validator()->validate($token, new SignedWith(new Sha256(), InMemory::file(config('cenit.public_key')))) || $token->claims()->get('iss') !== config('cenit.issuer') || $token->isExpired(new DateTimeImmutable())) throw new \RuntimeException('Invalid token');
            $request->attributes->set('identity', ['id' => $token->claims()->get('sub'), 'roles' => $token->claims()->get('roles', []), 'permissions' => $token->claims()->get('permissions', [])]);
        } catch (\Throwable) {
            return response()->json(['code' => 'UNAUTHENTICATED', 'message' => 'Invalid or expired token', 'requestId' => $request->attributes->get('requestId')], 401);
        }
        return $next($request);
    }
}
