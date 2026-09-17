<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();
        $people = [
            ['Mariana Torres', 'mariana.torres@cenit.local', 'user', 'Bogotá, Colombia', 'Observadora de bosque andino y aprendiz de fotografía de naturaleza.'],
            ['Tomás Rojas', 'tomas.rojas@cenit.local', 'user', 'Chingaza, Colombia', 'Guía local interesado en aves altoandinas y restauración ecológica.'],
            ['Elena Cárdenas', 'elena.cardenas@cenit.local', 'curator', 'Medellín, Colombia', 'Bióloga y curadora de registros para la comunidad de Cénit.'],
            ['Samuel Pardo', 'samuel.pardo@cenit.local', 'moderator', 'Cali, Colombia', 'Moderador comunitario y observador de humedales urbanos.'],
            ['Lucía Herrera', 'lucia.herrera@cenit.local', 'user', 'Manizales, Colombia', 'Exploro senderos de niebla, especialmente al amanecer.'],
            ['David Salazar', 'david.salazar@cenit.local', 'user', 'Pereira, Colombia', 'Aficionado a los colibríes y a registrar cantos de aves.'],
            ['Natalia Vélez', 'natalia.velez@cenit.local', 'user', 'Ibagué, Colombia', 'Naturalista de fin de semana y amante de las caminatas lentas.'],
            ['Camilo Duarte', 'camilo.duarte@cenit.local', 'user', 'Tunja, Colombia', 'Registro aves de páramo y participo en salidas de ciencia ciudadana.'],
            ['Sara Molina', 'sara.molina@cenit.local', 'user', 'Villa de Leyva, Colombia', 'Interesada en migratorias y conservación de paisajes secos.'],
            ['Juan Esteban Gil', 'juan.gil@cenit.local', 'admin', 'Bogotá, Colombia', 'Administrador de la comunidad y responsable de operaciones.'],
            ['Valeria Muñoz', 'valeria.munoz@cenit.local', 'user', 'Santander, Colombia', 'Aves, ilustración naturalista y recorridos de río.'],
            ['Andrés Nieto', 'andres.nieto@cenit.local', 'user', 'Leticia, Colombia', 'Observador amazónico y defensor de la observación responsable.'],
        ];

        foreach ($people as $index => [$name, $email, $role, $location, $bio]) {
            User::updateOrCreate(
                ['email' => $email],
                [
                    'id' => $this->externalId($index + 1),
                    'name' => $name,
                    'password' => Hash::make('CenitPass2026!'),
                    'role' => $role,
                    'bio' => $bio,
                    'general_location' => $location,
                    'privacy_settings' => ['show_general_location' => true, 'share_activity' => true],
                    'preferences' => ['language' => 'es-CO', 'units' => 'metric', 'weekly_digest' => true],
                    'email_verified_at' => $now,
                    'updated_at' => $now,
                ],
            );
        }

        $email = env('SUPERADMIN_EMAIL');
        $password = env('SUPERADMIN_PASSWORD');
        if ($email && $password) {
            User::updateOrCreate(
                ['email' => $email],
                ['name' => env('SUPERADMIN_NAME', 'Cénit Superadmin'), 'password' => Hash::make($password), 'role' => 'superadmin', 'email_verified_at' => $now],
            );
        }
    }

    private function externalId(int $number): string
    {
        return '01J' . str_pad((string) $number, 23, '0', STR_PAD_LEFT);
    }
}
