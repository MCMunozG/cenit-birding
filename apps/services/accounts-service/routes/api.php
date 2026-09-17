<?php
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
Route::prefix('accounts/v1')->group(function () {
 Route::get('health', fn()=>response()->json(['status'=>'ok','service'=>'accounts-service']));
 Route::middleware('throttle:6,1')->group(function(){ Route::post('auth/register',[AuthController::class,'register']); Route::post('auth/login',[AuthController::class,'login']); Route::post('auth/refresh',[AuthController::class,'refresh']); });
 Route::post('auth/logout',[AuthController::class,'logout'])->middleware('jwt');
 Route::middleware('jwt')->group(function(){ Route::get('me',[ProfileController::class,'show']); Route::patch('me',[ProfileController::class,'update']); });
});
