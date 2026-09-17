<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(Request $r)
    {
        return User::findOrFail($r->attributes->get('identity')['id'])->only(['id', 'name', 'email', 'role', 'bio', 'general_location', 'privacy_settings', 'preferences', 'avatar_path']);
    }
    public function update(Request $r)
    {
        $user = User::findOrFail($r->attributes->get('identity')['id']);
        $user->update($r->validate(['name' => 'sometimes|string|max:120', 'bio' => 'nullable|string|max:1000', 'general_location' => 'nullable|string|max:120', 'privacy_settings' => 'sometimes|array', 'preferences' => 'sometimes|array']));
        return $this->show($r);
    }
}
