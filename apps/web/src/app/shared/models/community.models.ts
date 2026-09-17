/** Publicación pública de Community; los objetos referenciados son ids opacos de otro contexto. */
export interface FeedPost {
  id: string;
  author_id: string;
  body?: string | null;
  reference_type: string;
  reference_id: string;
  created_at: string;
}

/** Notificación persistida por Community para el usuario autenticado actual. */
export interface Notification {
  id: string;
  type: string;
  body: string;
  read_at?: string | null;
  created_at: string;
}
