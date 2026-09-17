<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('sightings', function (Blueprint $t) {
            $t->ulid('id')->primary();
            $t->ulid('user_id')->index();
            $t->ulid('species_id')->nullable()->index();
            $t->timestamp('observed_at')->index();
            $t->unsignedInteger('individuals')->default(1);
            $t->string('behavior')->nullable();
            $t->text('notes')->nullable();
            $t->string('status')->index();
            $t->string('sensitivity')->default('HIDDEN');
            $t->decimal('private_lat', 10, 7);
            $t->decimal('private_lng', 10, 7);
            $t->decimal('public_lat', 10, 7)->nullable()->index();
            $t->decimal('public_lng', 10, 7)->nullable()->index();
            $t->string('public_region')->nullable();
            $t->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('sightings');
    }
};
