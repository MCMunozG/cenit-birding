import { Routes } from '@angular/router';
import { PageComponent } from './features/page.component';

const page = (view: string, title: string) => ({ component: PageComponent, data: { view, title } });

export const routes: Routes = [
  { path: '', ...page('home', 'Inicio') },
  { path: 'explorar', ...page('explore', 'Explorar') },
  { path: 'especies', ...page('species', 'Especies') },
  { path: 'especies/:id', ...page('species-detail', 'Detalle de especie') },
  { path: 'mapa', ...page('map', 'Mapa de avistamientos') },
  { path: 'avistamientos/nuevo', ...page('new-sighting', 'Registrar avistamiento') },
  { path: 'avistamientos', ...page('my-sightings', 'Mis avistamientos') },
  { path: 'lugares', ...page('places', 'Lugares para observar') },
  { path: 'rutas', ...page('routes', 'Rutas y recorridos') },
  { path: 'comunidad', ...page('community', 'Comunidad') },
  { path: 'perfil', ...page('profile', 'Mi perfil') },
  { path: 'colecciones', ...page('collections', 'Mis colecciones') },
  { path: 'notificaciones', ...page('notifications', 'Notificaciones') },
  { path: 'administracion', ...page('admin', 'Administración') },
  { path: 'moderacion', ...page('moderation', 'Moderación') },
  { path: 'ingresar', ...page('login', 'Ingresar') },
  { path: 'registro', ...page('register', 'Crear cuenta') },
  { path: '**', redirectTo: '' },
];
