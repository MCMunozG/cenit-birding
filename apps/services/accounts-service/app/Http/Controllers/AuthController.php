<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\JwtService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Authentication transport. Refresh tokens are hashed before persistence and rotated on use;
 * the raw token only exists in this request/response boundary.
 */
class AuthController extends Controller
{
    public function register(Request $r, JwtService $jwt)
    {
        $data = $r->validate(['name' => 'required|string|max:120', 'email' => 'required|email|unique:users', 'password' => 'required|string|min:12|confirmed']);
        $user = User::create([...$data, 'role' => 'user']);
        return response()->json($this->tokens($user, $jwt), 201);
    }
    public function login(Request $r, JwtService $jwt)
    {
        $data = $r->validate(['email' => 'required|email', 'password' => 'required']);
        $user = User::where('email', $data['email'])->first();
        if (!$user || !Hash::check($data['password'], $user->password)) return response()->json(['code' => 'INVALID_CREDENTIALS', 'message' => 'Invalid credentials'], 422);
        return response()->json($this->tokens($user, $jwt));
    }
    public function refresh(Request $r, JwtService $jwt)
    {
        $data = $r->validate(['refresh_token' => 'required|string']);
        $hash = hash('sha256', $data['refresh_token']);
        $row = DB::table('refresh_tokens')->where('token_hash', $hash)->whereNull('revoked_at')->where('expires_at', '>', now())->first();
        if (!$row) return response()->json(['code' => 'INVALID_REFRESH_TOKEN', 'message' => 'Session expired'], 401);
        DB::table('refresh_tokens')->where('id', $row->id)->update(['revoked_at' => now()]);
        return response()->json($this->tokens(User::findOrFail($row->user_id), $jwt));
    }
    public function logout(Request $r)
    {
        $data = $r->validate(['refresh_token' => 'required|string']);
        DB::table('refresh_tokens')->where('token_hash', hash('sha256', $data['refresh_token']))->update(['revoked_at' => now()]);
        return response()->noContent();
    }
    private function tokens(User $user, JwtService $jwt): array
    {
        $refresh = Str::random(80);
        DB::table('refresh_tokens')->insert(['id' => (string)Str::ulid(), 'user_id' => $user->id, 'token_hash' => hash('sha256', $refresh), 'expires_at' => now()->addDays(30), 'created_at' => now(), 'updated_at' => now()]);
        return ['access_token' => $jwt->issue($user), 'refresh_token' => $refresh, 'token_type' => 'Bearer', 'expires_in' => config('cenit.access_ttl_minutes') * 60, 'user' => ['id' => $user->id, 'name' => $user->name, 'email' => $user->email, 'role' => $user->role]];
    }
}
