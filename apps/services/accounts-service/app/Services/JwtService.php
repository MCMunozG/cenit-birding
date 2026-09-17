<?php
namespace App\Services;
use App\Models\User;
use DateInterval;
use DateTimeImmutable;
use Lcobucci\JWT\Configuration;
use Lcobucci\JWT\Signer\Key\InMemory;
use Lcobucci\JWT\Signer\Rsa\Sha256;
class JwtService {
    public function issue(User $user): string {
        $now = new DateTimeImmutable();
        $config = Configuration::forAsymmetricSigner(new Sha256(), InMemory::file(config('cenit.private_key')), InMemory::file(config('cenit.public_key')));
        return $config->builder()->issuedBy(config('cenit.issuer'))->relatedTo((string) $user->id)->issuedAt($now)->expiresAt($now->add(new DateInterval('PT'.config('cenit.access_ttl_minutes').'M')))->withClaim('roles', [$user->role])->withClaim('permissions', $user->permissions())->getToken($config->signer(), $config->signingKey())->toString();
    }
}
