<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration { public function up(): void { Schema::table('users',function(Blueprint $t){ $t->string('role')->default('user'); $t->text('bio')->nullable(); $t->string('general_location')->nullable(); $t->json('privacy_settings')->nullable(); $t->json('preferences')->nullable(); $t->string('avatar_path')->nullable(); }); } public function down(): void { Schema::table('users',fn(Blueprint $t)=>$t->dropColumn(['role','bio','general_location','privacy_settings','preferences','avatar_path'])); } };
