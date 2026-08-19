-- ============================================
-- AGENTE SEO — Esquema multi-cliente (v1)
-- ============================================

CREATE TABLE IF NOT EXISTS cuentas (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  nombre TEXT,
  plan TEXT NOT NULL DEFAULT 'inicial',
  max_sitios INTEGER NOT NULL DEFAULT 1,
  estado TEXT NOT NULL DEFAULT 'activo',
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sitios (
  id SERIAL PRIMARY KEY,
  cuenta_id INTEGER NOT NULL REFERENCES cuentas(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  dominio TEXT NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT true,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS credenciales_publicacion (
  id SERIAL PRIMARY KEY,
  sitio_id INTEGER NOT NULL UNIQUE REFERENCES sitios(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  host TEXT,
  usuario TEXT,
  password_cifrado TEXT,
  ruta_raiz TEXT,
  site_url TEXT,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gsc_conexiones (
  id SERIAL PRIMARY KEY,
  sitio_id INTEGER NOT NULL UNIQUE REFERENCES sitios(id) ON DELETE CASCADE,
  propiedad_gsc TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expira_en TIMESTAMPTZ,
  conectado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS planes_estrategia (
  id SERIAL PRIMARY KEY,
  sitio_id INTEGER NOT NULL UNIQUE REFERENCES sitios(id) ON DELETE CASCADE,
  items JSONB NOT NULL,
  arreglos JSONB,
  generado_automaticamente BOOLEAN DEFAULT false,
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS historial_ciclos (
  id SERIAL PRIMARY KEY,
  sitio_id INTEGER NOT NULL REFERENCES sitios(id) ON DELETE CASCADE,
  items JSONB NOT NULL,
  arreglos JSONB,
  snapshot_completo JSONB,
  proyeccion_30 NUMERIC,
  proyeccion_60 NUMERIC,
  proyeccion_90 NUMERIC,
  cerrado BOOLEAN NOT NULL DEFAULT false,
  fecha_guardado TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_cierre TIMESTAMPTZ,
  resultado_final JSONB
);

CREATE TABLE IF NOT EXISTS cola_articulos (
  id SERIAL PRIMARY KEY,
  sitio_id INTEGER NOT NULL REFERENCES sitios(id) ON DELETE CASCADE,
  tema TEXT NOT NULL,
  marca TEXT,
  carpeta TEXT DEFAULT 'blog',
  fecha_programada DATE,
  estado TEXT NOT NULL DEFAULT 'pendiente',
  contenido_html TEXT,
  canonical TEXT,
  enlazar_a TEXT,
  enlazar_potencial NUMERIC,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS temas_usados (
  id SERIAL PRIMARY KEY,
  sitio_id INTEGER NOT NULL REFERENCES sitios(id) ON DELETE CASCADE,
  tema TEXT NOT NULL,
  usado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sitios_cuenta ON sitios(cuenta_id);
CREATE INDEX IF NOT EXISTS idx_cola_sitio_fecha ON cola_articulos(sitio_id, fecha_programada);
CREATE INDEX IF NOT EXISTS idx_historial_sitio ON historial_ciclos(sitio_id);
CREATE INDEX IF NOT EXISTS idx_temas_sitio ON temas_usados(sitio_id);

-- Ajustes (2026-08-19): historial_ciclos.id pasa a TEXT porque la app genera
-- sus propios ids (timestamps), no se usa autoincremental. planes_estrategia
-- gana historial_id para saber a que ciclo del historial pertenece el plan activo.
ALTER TABLE historial_ciclos ALTER COLUMN id DROP DEFAULT;
ALTER TABLE historial_ciclos ALTER COLUMN id TYPE TEXT USING id::text;
ALTER TABLE planes_estrategia ADD COLUMN IF NOT EXISTS historial_id TEXT;

-- Ajuste (2026-08-19): historial_ciclos guarda un RESUMEN del ciclo, no la
-- lista completa de articulos (eso vive solo en planes_estrategia). items/arreglos
-- quedan nullable y sin uso real; se agregan las columnas que la app usa de verdad.
ALTER TABLE historial_ciclos ALTER COLUMN items DROP NOT NULL;
ALTER TABLE historial_ciclos ADD COLUMN IF NOT EXISTS articulos_count INTEGER;
ALTER TABLE historial_ciclos ADD COLUMN IF NOT EXISTS total_clics_base NUMERIC;
ALTER TABLE historial_ciclos ADD COLUMN IF NOT EXISTS paginas_base JSONB;
