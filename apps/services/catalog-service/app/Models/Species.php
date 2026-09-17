<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

class Species extends Model
{
    use HasUlids;
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['common_name', 'scientific_name', 'taxonomy', 'description', 'size', 'habitat', 'feeding', 'distribution', 'typical_hours', 'seasons', 'similar_species', 'distinguishing_features', 'conservation_status', 'sensitivity', 'is_published'];
    protected function casts(): array
    {
        return ['taxonomy' => 'array', 'typical_hours' => 'array', 'seasons' => 'array', 'similar_species' => 'array', 'is_published' => 'boolean'];
    }
}
