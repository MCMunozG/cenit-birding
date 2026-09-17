<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * HTTP adapter for the Community context.
 *
 * External identifiers are intentionally stored as opaque values: Community can discuss an
 * observation or species but it never reads or changes another service's database.
 */
class CommunityController extends Controller
{
    public function feed()
    {
        return DB::table('posts')
            ->where('visibility', 'PUBLIC')
            ->orderByDesc('created_at')
            ->paginate(20);
    }

    public function post(Request $request)
    {
        $data = $request->validate([
            'body' => 'nullable|string|max:4000',
            'reference_type' => 'required|in:sighting,route,trip,place,species',
            'reference_id' => 'required|string|max:26',
            'visibility' => 'sometimes|in:PUBLIC,FOLLOWERS,PRIVATE',
        ]);

        $id = (string) Str::ulid();
        DB::table('posts')->insert([
            'id' => $id,
            'author_id' => $request->attributes->get('identity')['id'],
            ...$data,
            'visibility' => $data['visibility'] ?? 'PUBLIC',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(DB::table('posts')->find($id), 201);
    }

    public function comment(Request $request, string $post)
    {
        $data = $request->validate(['body' => 'required|string|max:2000']);
        $id = (string) Str::ulid();

        DB::table('comments')->insert([
            'id' => $id,
            'post_id' => $post,
            'author_id' => $request->attributes->get('identity')['id'],
            'body' => $data['body'],
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->notify($request, $id, 'COMMENT', 'New comment');

        return response()->json(['id' => $id], 201);
    }

    public function react(Request $request, string $post)
    {
        $data = $request->validate(['reaction' => 'required|in:LIKE,LOVE,THANKS']);

        DB::table('reactions')->updateOrInsert(
            ['post_id' => $post, 'user_id' => $request->attributes->get('identity')['id']],
            ['reaction' => $data['reaction'], 'created_at' => now(), 'updated_at' => now()],
        );

        return response()->noContent();
    }

    public function follow(Request $request, string $user)
    {
        DB::table('follows')->updateOrInsert(
            ['follower_id' => $request->attributes->get('identity')['id'], 'followed_id' => $user],
            ['created_at' => now(), 'updated_at' => now()],
        );

        return response()->noContent();
    }

    public function report(Request $request)
    {
        $data = $request->validate([
            'target_type' => 'required|in:post,comment,sighting,identification',
            'target_id' => 'required|string|max:26',
            'reason' => 'required|in:INAPPROPRIATE,SPAM,INCORRECT_SPECIES,INCORRECT_LOCATION,FAUNA_RISK,OTHER',
            'detail' => 'nullable|string|max:1000',
        ]);

        $id = (string) Str::ulid();
        DB::table('reports')->insert([
            'id' => $id,
            'reporter_id' => $request->attributes->get('identity')['id'],
            ...$data,
            'status' => 'OPEN',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['id' => $id, 'status' => 'OPEN'], 201);
    }

    /** Only a role issued by Accounts can close a report and create the audit entry. */
    public function moderation(Request $request, string $report)
    {
        $roles = $request->attributes->get('identity')['roles'];
        abort_unless(array_intersect($roles, ['moderator', 'admin', 'superadmin']), 403);

        $data = $request->validate([
            'action' => 'required|in:APPROVE,HIDE,REJECT,REQUEST_EVIDENCE',
            'reason' => 'required|string|max:1000',
        ]);

        DB::transaction(function () use ($request, $report, $data): void {
            DB::table('reports')->where('id', $report)->update(['status' => 'RESOLVED', 'updated_at' => now()]);
            DB::table('audit_records')->insert([
                'id' => (string) Str::ulid(),
                'actor_id' => $request->attributes->get('identity')['id'],
                'target_type' => 'report',
                'target_id' => $report,
                'action' => $data['action'],
                'reason' => $data['reason'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });

        return response()->noContent();
    }

    public function notifications(Request $request)
    {
        return DB::table('notifications')
            ->where('user_id', $request->attributes->get('identity')['id'])
            ->latest('created_at')
            ->paginate(20);
    }

    /** Notification persistence stays local to Community and never calls another context. */
    private function notify(Request $request, string $reference, string $type, string $body): void
    {
        DB::table('notifications')->insert([
            'id' => (string) Str::ulid(),
            'user_id' => $request->attributes->get('identity')['id'],
            'type' => $type,
            'reference_id' => $reference,
            'body' => $body,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
