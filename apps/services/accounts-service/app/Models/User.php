<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasUlids;

    public $incrementing = false;
    protected $keyType = 'string';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'bio',
        'general_location',
        'privacy_settings',
        'preferences',
        'avatar_path',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'privacy_settings' => 'array',
            'preferences' => 'array',
        ];
    }

    public function permissions(): array
    {
        return match ($this->role) {
            'superadmin' => ['platform.manage', 'user.manage', 'catalog.manage', 'moderation.manage', 'sighting.review'],
            'admin' => ['user.manage', 'catalog.manage', 'moderation.manage', 'sighting.review'],
            'moderator' => ['report.review', 'content.hide', 'sighting.review'],
            'curator' => ['species.create', 'species.update', 'species.media.manage'],
            default => ['profile.self', 'sighting.create', 'post.create', 'comment.create'],
        };
    }
}
