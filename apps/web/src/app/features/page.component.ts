import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService, FeedPost, Sighting, Species, UserProfile } from '../core/api.service';
import { SessionService } from '../core/session.service';
import { GoogleMapComponent } from '../shared/google-map.component';

type View = 'home' | 'explore' | 'species' | 'species-detail' | 'map' | 'new-sighting' | 'my-sightings' | 'places' | 'routes' | 'community' | 'profile' | 'collections' | 'notifications' | 'admin' | 'moderation' | 'login' | 'register';

@Component({
  standalone: true,
  imports: [FormsModule, RouterLink, GoogleMapComponent],
  template: `
    <section class="page-shell">
      @if (view() === 'home') {
        <section class="home-hero"><div class="container hero-grid"><div class="py-5">
          <p class="eyebrow">OBSERVA · REGISTRA · CONSERVA</p>
          <h1>Las aves te muestran<br />otro modo de habitar el territorio.</h1>
          <p class="hero-copy">Descubre especies, planifica salidas y convierte cada observación en conocimiento útil, sin comprometer la fauna sensible.</p>
          <div class="d-flex flex-wrap gap-3 mt-4"><a class="btn btn-light btn-lg" routerLink="/explorar">Explorar ahora →</a><a class="btn btn-ghost-light btn-lg" routerLink="/registro">Crear mi bitácora</a></div>
          <div class="hero-metrics"><div><b>4</b><span>contextos conectados</span></div><div><b>3</b><span>niveles de privacidad</span></div><div><b>1</b><span>bitácora para ti</span></div></div>
        </div><div class="hero-orbit"><div class="sun"></div><div class="bird">⌁</div><span class="orbit-tag tag-one">Especies</span><span class="orbit-tag tag-two">Avistamientos</span><span class="orbit-tag tag-three">Comunidad</span></div></div></section>
        <section class="container section-space"><div class="section-heading"><div><p class="eyebrow text-forest">EMPIEZA POR AQUÍ</p><h2>Una plataforma para salir con los ojos abiertos.</h2></div><a routerLink="/explorar" class="text-link">Ver exploración →</a></div>
          <div class="row g-4 mt-1">@for (item of journey; track item.title) { <div class="col-md-4"><a class="journey-card" [class]="item.color" [routerLink]="item.link"><span class="card-index">{{ item.index }}</span><h3>{{ item.title }}</h3><p>{{ item.text }}</p><span class="card-arrow">↗</span></a></div> }</div>
        </section>
        <section class="container section-space"><div class="row align-items-center g-5"><div class="col-lg-6"><p class="eyebrow text-forest">PRIVACIDAD POR DISEÑO</p><h2>El dato útil no tiene que poner en riesgo a un ave.</h2><p class="lead text-secondary">Cada avistamiento separa la ubicación privada de la vista pública. La sensibilidad editorial de la especie siempre tiene prioridad.</p>
          <div class="privacy-row"><i class="exact">●</i><div><b>Exacta</b><p>Solo cuando la especie y el contexto lo permiten.</p></div></div><div class="privacy-row"><i class="approx">◌</i><div><b>Aproximada</b><p>Se publica una cuadrícula amplia, no el punto de encuentro.</p></div></div><div class="privacy-row"><i class="hidden">—</i><div><b>Oculta</b><p>La observación conserva una referencia general sin coordenadas.</p></div></div>
        </div><div class="col-lg-6"><div class="privacy-map"><div class="map-grid"></div><span class="map-dot dot-a"></span><span class="map-ring"></span><span class="map-dot dot-b"></span><div class="map-note"><b>La precisión importa.</b><br />También importa cuándo no mostrarla.</div></div></div></div></section>
      }

      @if (view() === 'explore') {
        <section class="page-hero compact"><div class="container"><p class="eyebrow">EXPLORACIÓN</p><h1>¿Qué quieres encontrar hoy?</h1><p>Consulta especies, lugares y señales públicas con cuidado por el territorio.</p></div></section>
        <section class="container section-space pt-4"><div class="filter-panel"><div><label>Buscar por especie</label><input class="form-control" [(ngModel)]="searchText" placeholder="Ej. colibrí, tángara…" /></div><div><label>Momento</label><select class="form-select"><option>Esta semana</option><option>Este mes</option></select></div><div><label>Hábitat</label><select class="form-select"><option>Todos los hábitats</option><option>Bosque</option><option>Humedal</option></select></div><button class="btn btn-forest align-self-end" (click)="loadSpecies(searchText)">Explorar</button></div>
        <div class="row g-4 mt-3">@for (item of highlights; track item.title) { <div class="col-md-4"><article class="explore-card"><span class="emoji">{{ item.icon }}</span><p class="mini-label">{{ item.label }}</p><h3>{{ item.title }}</h3><p>{{ item.text }}</p><a [routerLink]="item.link">Ver detalle →</a></article></div> }</div></section>
      }

      @if (view() === 'species') {
        <section class="page-hero compact"><div class="container"><p class="eyebrow">CATÁLOGO</p><h1>Especies para aprender a mirar.</h1><p>Un catálogo curado que también indica cuándo es necesario proteger una ubicación.</p></div></section>
        <section class="container section-space pt-4"><div class="d-flex gap-2 mb-4"><input class="form-control form-control-lg" [(ngModel)]="searchText" placeholder="Busca por nombre común o científico" (keyup.enter)="loadSpecies(searchText)" /><button class="btn btn-forest px-4" (click)="loadSpecies(searchText)">Buscar</button></div>
        @if (catalogError()) { <div class="alert alert-warning">No fue posible actualizar el catálogo en este momento. Intenta de nuevo cuando Catalog esté disponible.</div> }
        <div class="row g-4">@for (s of species(); track s.id) { <div class="col-md-6 col-xl-4"><a class="species-card" [routerLink]="['/especies', s.id]"><div class="species-art"><span>⌁</span><small>{{ s.sensitivity }}</small></div><div class="p-4"><p class="mini-label">{{ s.habitat || 'Catálogo Cénit' }}</p><h3>{{ s.common_name }}</h3><em>{{ s.scientific_name }}</em><p class="mt-3 mb-0 text-secondary">{{ s.description }}</p></div></a></div> }</div></section>
      }

      @if (view() === 'species-detail') {
        <section class="container section-space"><a routerLink="/especies" class="back-link">← Volver al catálogo</a><div class="row g-5 mt-1 align-items-center"><div class="col-lg-5"><div class="species-detail-art"><span>⌁</span><p>Ficha de especie</p></div></div><div class="col-lg-7"><p class="eyebrow text-forest">CATÁLOGO CURADO</p><h1>{{ selectedSpecies().common_name }}</h1><em class="fs-5">{{ selectedSpecies().scientific_name }}</em><p class="lead mt-4">{{ selectedSpecies().description }}</p><div class="fact-grid"><div><small>Hábitat</small><b>{{ selectedSpecies().habitat || 'Por documentar' }}</b></div><div><small>Conservación</small><b>{{ selectedSpecies().conservation_status || 'Sin clasificar' }}</b></div><div><small>Ubicación pública</small><b>{{ selectedSpecies().sensitivity }}</b></div></div><a routerLink="/avistamientos/nuevo" class="btn btn-forest mt-4">Registrar un encuentro</a></div></div></section>
      }

      @if (view() === 'map') {
        <section class="page-hero compact"><div class="container"><p class="eyebrow">MAPA PÚBLICO</p><h1>Observaciones que cuidan el territorio.</h1><p>Este mapa usa solo las coordenadas públicas autorizadas por Observation.</p></div></section>
        <section class="container section-space pt-4"><div class="map-layout"><aside class="map-sidebar"><p class="eyebrow text-forest">FILTROS</p><h3>Avistamientos públicos</h3><label>Especie</label><select class="form-select mb-3"><option>Todas las especies</option>@for (s of species(); track s.id) { <option>{{ s.common_name }}</option> }</select><label>Fecha</label><select class="form-select mb-4"><option>Últimos 30 días</option><option>Este año</option></select><div class="map-legend"><span><i class="legend-dot exact"></i> Punto autorizado</span><span><i class="legend-dot approx"></i> Zona aproximada</span><span><i class="legend-dot hidden"></i> Ubicación reservada</span></div><hr /><label for="map-key">Google Maps API key</label><input id="map-key" class="form-control form-control-sm" type="password" [ngModel]="googleMapsKey()" (ngModelChange)="setGoogleMapsKey($event)" placeholder="Pega tu clave" /><small class="text-muted d-block mt-2">Se guarda solo en esta sesión del navegador.</small></aside><div class="live-map">@if (googleMapsKey()) { <app-google-map [apiKey]="googleMapsKey()" [sightings]="mapSightings()" (mapError)="googleMapError.set($event)"></app-google-map> } @else { <div class="map-empty">Agrega tu clave de Google Maps para cargar el mapa.<br /><small>La API muestra exclusivamente puntos públicos.</small></div> } @if (mapError() || googleMapError()) { <div class="map-warning">{{ googleMapError() || 'Observation no está disponible para cargar puntos.' }}</div> }</div></div></section>
      }

      @if (view() === 'new-sighting') {
        <section class="container section-space"><div class="form-page"><div class="form-intro"><p class="eyebrow text-forest">NUEVA ENTRADA</p><h1>Registra lo que viste.</h1><p>Tu ubicación exacta se guarda de forma privada. La publicación depende de la sensibilidad de la especie.</p><div class="info-callout"><b>Consejo de campo</b><br />Mantén distancia de nidos, dormideros y zonas de cría.</div></div><form class="sighting-form" #sightingForm="ngForm" (ngSubmit)="submitSighting(sightingForm.valid)"><div class="form-step"><span>1</span><div><h3>¿Qué observaste?</h3><label>Especie <small>(puede quedar sin identificar)</small></label><select class="form-select" name="species_id" [(ngModel)]="draft.species_id"><option value="">Aún no la identifico</option>@for (s of species(); track s.id) { <option [value]="s.id">{{ s.common_name }} · {{ s.scientific_name }}</option> }</select><div class="row g-3 mt-1"><div class="col-sm-7"><label>Fecha y hora</label><input class="form-control" type="datetime-local" required name="observed_at" [(ngModel)]="draft.observed_at" /></div><div class="col-sm-5"><label>Individuos</label><input class="form-control" type="number" min="1" required name="individuals" [(ngModel)]="draft.individuals" /></div></div></div></div><div class="form-step"><span>2</span><div><h3>¿Dónde fue?</h3><div class="row g-3"><div class="col-sm-6"><label>Latitud</label><input class="form-control" type="number" step="any" required name="latitude" [(ngModel)]="draft.latitude" /></div><div class="col-sm-6"><label>Longitud</label><input class="form-control" type="number" step="any" required name="longitude" [(ngModel)]="draft.longitude" /></div></div><label class="mt-3">Referencia general</label><input class="form-control" name="region" [(ngModel)]="draft.region" placeholder="Ej. sendero principal, reserva…" /><label class="mt-3">Google Maps API key</label><input class="form-control" type="password" [ngModel]="googleMapsKey()" (ngModelChange)="setGoogleMapsKey($event)" name="sighting-map-key" placeholder="Pega tu clave para seleccionar el punto" />@if (googleMapsKey()) { <div class="sighting-picker mt-3"><app-google-map [apiKey]="googleMapsKey()" mode="picker" [latitude]="draft.latitude" [longitude]="draft.longitude" (locationChange)="selectMapLocation($event)" (mapError)="googleMapError.set($event)"></app-google-map></div><small class="text-muted">Haz clic en el mapa o arrastra el marcador para seleccionar la ubicación privada.</small> } @else { <p class="small text-muted mt-2 mb-0">Agrega una clave para habilitar la selección desde Google Maps.</p> }</div></div><div class="form-step"><span>3</span><div><h3>Completa tu nota</h3><label>Comportamiento</label><input class="form-control" name="behavior" [(ngModel)]="draft.behavior" placeholder="Ej. alimentándose, vocalizando…" /><label class="mt-3">Notas</label><textarea class="form-control" rows="3" name="notes" [(ngModel)]="draft.notes"></textarea><div class="form-check form-switch mt-3"><input id="publish" class="form-check-input" type="checkbox" name="publish" [(ngModel)]="draft.publish" /><label class="form-check-label" for="publish">Publicar cuando la privacidad lo permita</label></div></div></div>@if (formMessage()) { <div class="alert" [class.alert-success]="formSuccess()" [class.alert-danger]="!formSuccess()">{{ formMessage() }}</div> }<button class="btn btn-forest btn-lg w-100" [disabled]="submitting()">{{ submitting() ? 'Guardando…' : 'Guardar avistamiento' }}</button></form></div></section>
      }

      @if (view() === 'my-sightings') {
        <section class="container section-space"><div class="section-heading"><div><p class="eyebrow text-forest">MI BITÁCORA</p><h1>Mis avistamientos</h1></div><a class="btn btn-forest" routerLink="/avistamientos/nuevo">+ Nuevo registro</a></div>@if (!hasSession()) { <div class="empty-state"><span>⌁</span><h3>Tu bitácora empieza con una cuenta.</h3><p>Ingresa para conservar tus registros privados y compartir los que autorices.</p><a routerLink="/ingresar" class="btn btn-forest">Ingresar</a></div> } @else { <div class="record-list">@for (s of mySightings(); track s.id) { <article><span class="record-date">{{ s.observed_at.slice(0, 10) }}</span><div><b>{{ s.species_id || 'Sin identificar' }}</b><p>{{ s.behavior || 'Sin nota de comportamiento' }}</p></div><span class="status-pill">{{ s.status }}</span></article> } @empty { <div class="empty-state"><span>◌</span><h3>Aún no hay registros.</h3><p>Tu próxima salida puede ser el inicio de tu bitácora.</p><a routerLink="/avistamientos/nuevo" class="btn btn-forest">Registrar avistamiento</a></div> }</div> }</section>
      }

      @if (view() === 'places' || view() === 'routes') {
        <section class="page-hero compact"><div class="container"><p class="eyebrow">{{ view() === 'places' ? 'LUGARES' : 'RUTAS' }}</p><h1>{{ view() === 'places' ? 'El territorio también tiene memoria.' : 'Camina con una intención.' }}</h1><p>Guarda puntos de interés y planea salidas con información útil de observación.</p></div></section><section class="container section-space pt-4"><div class="row g-4">@for (card of planningCards; track card.title) { <div class="col-md-4"><article class="planning-card"><div class="planning-image">{{ card.icon }}</div><p class="mini-label">{{ card.meta }}</p><h3>{{ card.title }}</h3><p>{{ card.text }}</p><button class="btn btn-outline-forest" disabled>Próxima iteración</button></article></div> }</div><div class="feature-notice"><b>En construcción con datos reales.</b> Lugares, rutas y recorridos tienen su frontera definida en Observation; esta interfaz queda preparada mientras se completa el módulo.</div></section>
      }

      @if (view() === 'community') {
        <section class="page-hero compact"><div class="container"><p class="eyebrow">COMUNIDAD</p><h1>Comparte lo que el campo te enseñó.</h1><p>Las publicaciones conectan observaciones, especies, rutas y lugares.</p></div></section><section class="container section-space pt-4"><div class="community-layout"><aside class="community-side"><h3>En Cénit</h3><a routerLink="/avistamientos/nuevo">Registrar encuentro</a><a routerLink="/especies">Consultar especies</a><a routerLink="/notificaciones">Mis notificaciones</a><hr /><p class="small text-muted">Comparte con respeto: no expongas señales que puedan poner en riesgo a la fauna.</p></aside><div><div class="composer"><div class="avatar">C</div><div><b>¿Qué aprendiste hoy?</b><p>Comparte una observación, una ruta o una pregunta.</p></div><a routerLink="/ingresar" class="btn btn-outline-forest">Publicar</a></div>@if (communityError()) { <div class="alert alert-warning mt-3">No fue posible actualizar el feed. Vuelve a intentar cuando Community esté disponible.</div> }<div class="feed mt-3">@for (post of feed(); track post.id) { <article class="post-card"><div class="d-flex gap-3"><div class="avatar">{{ post.author_id.slice(0, 1).toUpperCase() }}</div><div><b>Miembro de Cénit</b><p class="small text-muted mb-2">Actividad de campo · {{ post.created_at || 'recién' }}</p><p>{{ post.body || 'Compartió una referencia de ' + post.reference_type + '.' }}</p><div class="post-actions"><button>♡ Me interesa</button><button>◌ Comentar</button><button>↗ Compartir</button></div></div></div></article> } @empty { @for (post of seededPosts; track post.title) { <article class="post-card"><div class="d-flex gap-3"><div class="avatar">{{ post.initial }}</div><div><b>{{ post.author }}</b><p class="small text-muted mb-2">{{ post.time }}</p><p>{{ post.title }}</p><div class="post-reference">⌁ {{ post.reference }}</div><div class="post-actions"><button>♡ Me interesa</button><button>◌ Comentar</button><button>↗ Compartir</button></div></div></div></article> } }</div></div></div></section>
      }

      @if (view() === 'login' || view() === 'register') {
        <section class="auth-wrap"><div class="auth-aside"><p class="eyebrow">TU BITÁCORA PERSONAL</p><h1>Observa con calma.<br />Recuerda mejor.</h1><p>Una cuenta te permite guardar tus registros, seguir objetivos y decidir qué compartir.</p><div class="auth-quote">“Lo que aprendemos al observar con cuidado también protege el lugar que observamos.”</div></div><form class="auth-card" #authForm="ngForm" (ngSubmit)="submitAuth(authForm.valid)"><p class="eyebrow text-forest">{{ view() === 'login' ? 'BIENVENIDO DE VUELTA' : 'CREA TU CUENTA' }}</p><h2>{{ view() === 'login' ? 'Ingresa a Cénit' : 'Empieza tu bitácora' }}</h2>@if (view() === 'register') { <label>Nombre</label><input class="form-control" required name="name" [(ngModel)]="auth.name" /> }<label>Correo electrónico</label><input class="form-control" required type="email" name="email" [(ngModel)]="auth.email" /><label>Contraseña</label><input class="form-control" required minlength="12" type="password" name="password" [(ngModel)]="auth.password" />@if (view() === 'register') { <label>Confirma la contraseña</label><input class="form-control" required type="password" name="password_confirmation" [(ngModel)]="auth.password_confirmation" /> }@if (authMessage()) { <div class="alert alert-danger mt-3">{{ authMessage() }}</div> }<button class="btn btn-forest w-100 mt-4" [disabled]="submitting()">{{ view() === 'login' ? 'Ingresar' : 'Crear cuenta' }}</button><p class="text-center mt-3 mb-0">{{ view() === 'login' ? '¿Aún no tienes cuenta?' : '¿Ya tienes una cuenta?' }} <a [routerLink]="view() === 'login' ? '/registro' : '/ingresar'">{{ view() === 'login' ? 'Crear cuenta' : 'Ingresar' }}</a></p></form></section>
      }

      @if (view() === 'profile') {
        <section class="container section-space"><p class="eyebrow text-forest">ESPACIO PERSONAL</p><div class="section-heading"><div><h1>Mi perfil</h1><p class="text-secondary mb-0">Tu identidad y preferencias para observar con calma.</p></div><a routerLink="/avistamientos" class="btn btn-forest">Ver mi bitácora</a></div>
          @if (!hasSession()) { <div class="empty-state"><span>⌁</span><h3>Ingresa para ver tu perfil.</h3><p>Tu perfil reúne tu bitácora, preferencias y actividad.</p><a routerLink="/ingresar" class="btn btn-forest">Ingresar</a></div> }
          @else if (profileLoading()) { <div class="profile-loading">Cargando tu perfil…</div> }
          @else if (profileError()) { <div class="alert alert-danger mt-4">No pudimos cargar tu perfil. Confirma que Accounts esté iniciado y vuelve a intentar.</div> }
          @else { <div class="profile-grid mt-4"><aside class="profile-summary"><div class="profile-avatar">{{ profileForm.name.slice(0, 1).toUpperCase() }}</div><h2>{{ profileForm.name }}</h2><p>{{ profileForm.general_location || 'Ubicación general no indicada' }}</p><span class="role-badge">{{ profileRole() }}</span><hr /><div class="profile-stat"><b>{{ mySightings().length }}</b><span>avistamientos recientes</span></div><div class="profile-stat"><b>{{ notifications().length }}</b><span>notificaciones</span></div></aside><form class="profile-editor" #profileFormRef="ngForm" (ngSubmit)="saveProfile(profileFormRef.valid)"><h3>Información pública</h3><label>Nombre</label><input class="form-control" required name="profile_name" [(ngModel)]="profileForm.name" /><label>Biografía</label><textarea class="form-control" rows="4" name="profile_bio" [(ngModel)]="profileForm.bio" placeholder="Cuéntale a la comunidad qué te interesa observar."></textarea><label>Ubicación general</label><input class="form-control" name="profile_location" [(ngModel)]="profileForm.general_location" placeholder="Ej. Bogotá, Colombia" /><h3 class="mt-4">Preferencias</h3><div class="form-check form-switch"><input id="show-location" class="form-check-input" type="checkbox" name="show_location" [(ngModel)]="profileForm.show_general_location" /><label class="form-check-label" for="show-location">Mostrar mi ubicación general en mi perfil</label></div><div class="form-check form-switch mt-2"><input id="digest" class="form-check-input" type="checkbox" name="digest" [(ngModel)]="profileForm.weekly_digest" /><label class="form-check-label" for="digest">Recibir resumen semanal de actividad</label></div>@if (profileMessage()) { <div class="alert alert-success mt-3">{{ profileMessage() }}</div> }<button class="btn btn-forest mt-4" [disabled]="profileSaving()">Guardar cambios</button></form></div> }
        </section>
      }

      @if (view() === 'notifications') {
        <section class="container section-space"><p class="eyebrow text-forest">ACTIVIDAD</p><h1>Notificaciones</h1>@if (!hasSession()) { <div class="empty-state"><span>◌</span><h3>Ingresa para consultar tu actividad.</h3><a routerLink="/ingresar" class="btn btn-forest">Ingresar</a></div> } @else { <div class="notification-list mt-4">@for (item of notifications(); track item.id) { <article [class.unread]="!item.read_at"><span class="notification-icon">⌁</span><div><b>{{ item.type.replace('_', ' ') }}</b><p>{{ item.body }}</p><small>{{ item.created_at }}</small></div></article> } @empty { <div class="empty-state"><span>◌</span><h3>No tienes notificaciones pendientes.</h3><p>La actividad de tu comunidad aparecerá aquí.</p></div> }</div> }</section>
      }

      @if (view() === 'collections' || view() === 'admin' || view() === 'moderation') {
        <section class="container section-space"><p class="eyebrow text-forest">HERRAMIENTAS CÉNIT</p><h1>{{ title() }}</h1><div class="row g-4 mt-2"><div class="col-md-4"><article class="utility-card"><span>⌁</span><h3>{{ view() === 'collections' ? 'Especies objetivo' : 'Actividad reciente' }}</h3><p>{{ view() === 'collections' ? 'Guarda las especies que quieres encontrar y acompaña tus salidas con intención.' : 'Consulta el estado del contenido y sus revisiones desde las APIs habilitadas.' }}</p></article></div><div class="col-md-4"><article class="utility-card"><span>◌</span><h3>{{ view() === 'collections' ? 'Lugares guardados' : 'Acciones cuidadosas' }}</h3><p>{{ view() === 'collections' ? 'Reúne senderos, humedales y parques para planear tu próxima ruta.' : 'Toda acción sensible queda registrada para proteger a la comunidad y a la fauna.' }}</p></article></div><div class="col-md-4"><article class="utility-card"><span>↗</span><h3>{{ view() === 'collections' ? 'Rutas favoritas' : 'Roles y permisos' }}</h3><p>{{ view() === 'collections' ? 'Conserva recorridos a los que quieres volver cuando cambie la temporada.' : 'Las funciones aparecen según los permisos emitidos por Accounts.' }}</p></article></div></div></section>
      }
    </section>
  `,
})
export class PageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ApiService);
  private readonly session = inject(SessionService);
  readonly view = signal<View>('home');
  readonly title = signal('Inicio');
  private readonly seedSpecies: Species[] = [
    { id: 'seed-tangara', common_name: 'Tángara azuleja', scientific_name: 'Thraupis episcopus', sensitivity: 'EXACT', habitat: 'Bordes de bosque y jardines', conservation_status: 'Preocupación menor (LC)', description: 'Tángara azul grisácea frecuente en paisajes intervenidos.' },
    { id: 'seed-colibri', common_name: 'Colibrí colirrufo', scientific_name: 'Amazilia tzacatl', sensitivity: 'APPROXIMATE', habitat: 'Jardines y claros', conservation_status: 'Preocupación menor (LC)', description: 'Colibrí verde de cola rojiza, activo alrededor de flores.' },
    { id: 'seed-condor', common_name: 'Cóndor andino', scientific_name: 'Vultur gryphus', sensitivity: 'HIDDEN', habitat: 'Páramo y alta montaña', conservation_status: 'Vulnerable (VU)', description: 'Rapaz planeadora de gran tamaño asociada a paisajes andinos abiertos.' },
  ];
  readonly species = signal<Species[]>(this.seedSpecies);
  readonly selectedSpecies = signal<Species>(this.seedSpecies[0]);
  readonly mapSightings = signal<Sighting[]>([]);
  readonly mySightings = signal<Sighting[]>([]);
  readonly feed = signal<FeedPost[]>([]);
  readonly catalogError = signal(false);
  readonly mapError = signal(false);
  readonly googleMapError = signal('');
  readonly googleMapsKey = signal(sessionStorage.getItem('cenit_google_maps_key') || '');
  readonly communityError = signal(false);
  readonly submitting = signal(false);
  readonly formMessage = signal('');
  readonly formSuccess = signal(false);
  readonly authMessage = signal('');
  readonly profileLoading = signal(false);
  readonly profileError = signal(false);
  readonly profileSaving = signal(false);
  readonly profileMessage = signal('');
  readonly notifications = signal<Array<{ id: string; type: string; body: string; read_at?: string | null; created_at: string }>>([]);
  readonly profileRole = signal('');
  profileForm = { name: '', bio: '', general_location: '', show_general_location: true, weekly_digest: true };
  searchText = '';
  draft = { species_id: '', observed_at: this.nowForInput(), individuals: 1, latitude: 4.711, longitude: -74.072, region: '', behavior: '', notes: '', publish: false };
  auth = { name: '', email: '', password: '', password_confirmation: '' };
  readonly journey = [
    { index: '01', title: 'Descubre', text: 'Consulta especies y reconoce las señales que las distinguen.', color: 'card-green', link: '/especies' },
    { index: '02', title: 'Planea', text: 'Encuentra lugares, rutas y momentos para salir a observar.', color: 'card-sand', link: '/rutas' },
    { index: '03', title: 'Registra', text: 'Guarda tus encuentros y protege las ubicaciones delicadas.', color: 'card-blue', link: '/avistamientos/nuevo' },
  ];
  readonly highlights = [
    { icon: '◒', label: 'OBSERVA', title: 'Especies del día', text: 'Repasa fichas y recomendaciones antes de salir.', link: '/especies' },
    { icon: '⌖', label: 'EXPLORA', title: 'Mapa con cuidado', text: 'Consulta patrones públicos sin comprometer ubicaciones.', link: '/mapa' },
    { icon: '↗', label: 'COMPARTE', title: 'Aprende en comunidad', text: 'Convierte una salida en una conversación útil.', link: '/comunidad' },
  ];
  readonly planningCards = [
    { icon: '⌖', meta: 'HUMEDAL · 4,5 KM', title: 'Humedal de la sabana', text: 'Mira mejores momentos y especies registradas públicamente.' },
    { icon: '⌁', meta: 'BOSQUE · FÁCIL', title: 'Sendero del bosque alto', text: 'Un recorrido corto para reconocer cantos y estratos.' },
    { icon: '◒', meta: 'PARQUE · URBANO', title: 'Mañana de parque', text: 'Una ruta para comenzar a registrar aves cerca de casa.' },
  ];
  readonly seededPosts = [
    { initial: 'A', author: 'Andrea M.', time: 'Hace 2 horas', title: 'Esta mañana aprendí a quedarme quieta antes de buscar con los ojos. El canto llegó primero.', reference: 'Observación compartida' },
    { initial: 'J', author: 'Julián R.', time: 'Ayer', title: '¿Qué detalles usan para separar especies similares cuando la luz está baja?', reference: 'Consulta de identificación' },
  ];

  constructor() {
    this.route.data.subscribe((data) => { this.view.set(data['view'] as View); this.title.set(data['title'] as string); this.loadForView(); });
  }
  loadSpecies(query = ''): void {
    this.api.species(query).subscribe({ next: (r) => { this.species.set(r.data); this.catalogError.set(false); }, error: () => { this.species.set(this.seedSpecies.filter((s) => s.common_name.toLowerCase().includes(query.toLowerCase()) || s.scientific_name.toLowerCase().includes(query.toLowerCase()))); this.catalogError.set(true); } });
  }
  submitSighting(valid: boolean | null): void {
    if (!valid) { this.formSuccess.set(false); this.formMessage.set('Completa los campos obligatorios y verifica las coordenadas.'); return; }
    if (!this.hasSession()) { this.formSuccess.set(false); this.formMessage.set('Inicia sesión antes de guardar un avistamiento.'); return; }
    this.submitting.set(true); this.api.createSighting({ ...this.draft, observed_at: new Date(this.draft.observed_at).toISOString() }).subscribe({ next: () => { this.formSuccess.set(true); this.formMessage.set('Avistamiento guardado. La privacidad se aplicó antes de publicar.'); this.submitting.set(false); }, error: () => { this.formSuccess.set(false); this.formMessage.set('No fue posible guardar. Verifica que los micros estén iniciados.'); this.submitting.set(false); } });
  }
  submitAuth(valid: boolean | null): void {
    if (!valid) { this.authMessage.set('Revisa los datos. La contraseña debe tener al menos 12 caracteres.'); return; }
    this.submitting.set(true); this.authMessage.set('');
    const request = this.view() === 'login' ? this.api.login(this.auth.email, this.auth.password) : this.api.register(this.auth.name, this.auth.email, this.auth.password, this.auth.password_confirmation);
    request.subscribe({ next: (s) => { this.session.start(s); this.submitting.set(false); this.router.navigateByUrl('/perfil'); }, error: () => { this.authMessage.set('No fue posible completar la operación. Revisa tus datos y Accounts.'); this.submitting.set(false); } });
  }
  hasSession(): boolean { return this.session.hasToken(); }
  setGoogleMapsKey(key: string): void {
    this.googleMapError.set('');
    this.googleMapsKey.set(key.trim());
    sessionStorage.setItem('cenit_google_maps_key', key.trim());
  }
  selectMapLocation(location: { latitude: number; longitude: number }): void {
    this.draft.latitude = location.latitude;
    this.draft.longitude = location.longitude;
  }
  saveProfile(valid: boolean | null): void {
    if (!valid) return;
    this.profileSaving.set(true);
    this.profileMessage.set('');
    this.api.updateMe({ name: this.profileForm.name, bio: this.profileForm.bio, general_location: this.profileForm.general_location, privacy_settings: { show_general_location: this.profileForm.show_general_location }, preferences: { weekly_digest: this.profileForm.weekly_digest } }).subscribe({
      next: (profile) => { this.setProfile(profile); this.profileSaving.set(false); this.profileMessage.set('Tus cambios se guardaron correctamente.'); },
      error: () => { this.profileSaving.set(false); this.profileError.set(true); },
    });
  }
  private loadForView(): void {
    if (['species', 'species-detail', 'new-sighting', 'map'].includes(this.view())) this.loadSpecies();
    if (this.view() === 'species-detail') { const id = this.route.snapshot.paramMap.get('id'); if (id) this.api.speciesById(id).subscribe({ next: (s) => this.selectedSpecies.set(s), error: () => this.selectedSpecies.set(this.seedSpecies.find((s) => s.id === id) || this.seedSpecies[0]) }); }
    if (this.view() === 'map') this.api.map().subscribe({ next: (r) => { this.mapSightings.set(r.data); this.mapError.set(false); }, error: () => { this.mapSightings.set([]); this.mapError.set(true); } });
    if (this.view() === 'community') this.api.feed().subscribe({ next: (r) => { this.feed.set(r.data); this.communityError.set(false); }, error: () => { this.feed.set([]); this.communityError.set(true); } });
    if (['my-sightings', 'profile'].includes(this.view()) && this.hasSession()) this.api.mine().subscribe({ next: (r) => this.mySightings.set(r.data), error: () => this.mySightings.set([]) });
    if (this.view() === 'profile' && this.hasSession()) this.loadProfile();
    if (['notifications', 'profile'].includes(this.view()) && this.hasSession()) this.api.notifications().subscribe({ next: (r) => this.notifications.set(r.data), error: () => this.notifications.set([]) });
  }
  private loadProfile(): void {
    this.profileLoading.set(true);
    this.profileError.set(false);
    this.api.me().subscribe({ next: (profile) => { this.setProfile(profile); this.profileLoading.set(false); }, error: () => { this.profileLoading.set(false); this.profileError.set(true); } });
  }
  private setProfile(profile: UserProfile): void {
    this.profileForm = { name: profile.name, bio: profile.bio || '', general_location: profile.general_location || '', show_general_location: profile.privacy_settings?.show_general_location ?? true, weekly_digest: profile.preferences?.weekly_digest ?? true };
    this.profileRole.set(profile.role);
  }
  private nowForInput(): string { return new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16); }
}
