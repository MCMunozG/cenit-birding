<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Concerns\HasUlids;use Illuminate\Database\Eloquent\Model;
class Sighting extends Model {use HasUlids;public $incrementing=false;protected $keyType='string';protected $fillable=['user_id','species_id','observed_at','individuals','behavior','notes','status','sensitivity','private_lat','private_lng','public_lat','public_lng','public_region'];protected function casts():array{return ['observed_at'=>'datetime'];}}
