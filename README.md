# Fundación Shakira — Sitio Web

Página web **mobile-first** para solicitar ayuda. Frontend listo para subir a **GitHub Pages**. Backend y base de datos en **Supabase**.

---

## 📁 Estructura del proyecto

```
fundacion-shakira/
├── index.html          # Página principal
├── css/
│   └── style.css       # Estilos mobile-first
├── js/
│   ├── i18n.js         # Traducciones (ES Latino, ES España, EN)
│   └── app.js          # Lógica + conexión Supabase
├── assets/
│   ├── logo.png        # ← PON TU LOGO AQUÍ
│   ├── favicon.png     # ← PON TU FAVICON AQUÍ
│   └── gallery/        # ← PON LAS FOTOS DE AYUDA AQUÍ
│       ├── ayuda-1.jpg
│       ├── ayuda-2.jpg
│       ├── ayuda-3.jpg
│       └── ayuda-4.jpg
└── README.md
```

---

## 🚀 Cómo subir el frontend a GitHub

1. Crea un repositorio nuevo en GitHub (ej: `fundacion-shakira`).
2. Sube todos estos archivos.
3. Ve a **Settings → Pages**.
4. Source: **Deploy from a branch** → Branch `main` → `/ (root)`.
5. En unos minutos tendrás: `https://tu-usuario.github.io/fundacion-shakira/`

> Tip: Si quieres un dominio propio (fundacionshakira.org), configúralo en Settings → Pages → Custom domain.

---

## 🗄️ Backend: Supabase (recomendado)

### Por qué Supabase
- Gratuito hasta cierto uso (perfecto para empezar).
- Base de datos PostgreSQL real.
- API lista en segundos.
- Panel para ver las solicitudes.

### Pasos para configurar

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta / proyecto.
2. En el proyecto ve a **SQL Editor** y ejecuta esto:

```sql
-- Tabla de solicitudes de ayuda
CREATE TABLE solicitudes (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  edad INTEGER NOT NULL,
  telefono TEXT NOT NULL,
  cantidad_ayuda TEXT NOT NULL,
  motivo TEXT NOT NULL,
  metodo_pago TEXT NOT NULL,
  dato_pago TEXT NOT NULL,
  idioma TEXT DEFAULT 'es-latam',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de mensajes al agente
CREATE TABLE mensajes (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  tipo TEXT DEFAULT 'contacto_agente',
  idioma TEXT DEFAULT 'es-latam',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de reseñas
CREATE TABLE resenas (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  estrellas INTEGER NOT NULL DEFAULT 5,
  comentario TEXT NOT NULL,
  idioma TEXT DEFAULT 'es-latam',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Permitir insertar desde el frontend (anon key)
ALTER TABLE solicitudes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensajes ENABLE ROW LEVEL SECURITY;
ALTER TABLE resenas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir insertar solicitudes"
ON solicitudes FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Permitir insertar mensajes"
ON mensajes FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Permitir insertar resenas"
ON resenas FOR INSERT TO anon WITH CHECK (true);

-- Permitir leer desde el panel admin (ajusta según seguridad)
CREATE POLICY "Permitir leer solicitudes"
ON solicitudes FOR SELECT TO anon USING (true);

CREATE POLICY "Permitir leer mensajes"
ON mensajes FOR SELECT TO anon USING (true);

CREATE POLICY "Permitir leer resenas"
ON resenas FOR SELECT TO anon USING (true);
```

3. Ve a **Settings → API**:
   - Copia **Project URL**
   - Copia **anon public** key

4. Abre `js/app.js` y `js/admin.js` y reemplaza URL y KEY en ambos.

5. **Panel admin**: abre `admin.html`  
   - Contraseña por defecto: `shakira2026` (cámbiala en `js/admin.js`)  
   - Ahí ves solicitudes, reseñas y mensajes.

6. Abre `js/app.js` y reemplaza:

```js
const SUPABASE_URL = 'https://xxxxxxxx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

5. ¡Listo! Las solicitudes llegarán a la tabla `solicitudes` en Supabase.

### Ver las solicitudes
En Supabase → **Table Editor** → `solicitudes`.

---

## 🖼️ Imágenes y branding

| Archivo | Descripción |
|---------|-------------|
| `assets/logo.png` | Logo de la fundación (recomendado 200×200 px o más) |
| `assets/favicon.png` | Favicon (32×32 o 64×64 px) |
| `assets/gallery/ayuda-1.jpg` … `ayuda-4.jpg` | Fotos de ustedes ayudando (horizontal, ~800px de ancho) |

Si no pones las imágenes, se muestran placeholders temporales.

---

## 🌐 Idiomas

Selector en la esquina superior derecha:
- **Español (Latino)** — por defecto
- **Español (España)**
- **English**

Se guarda la preferencia en el navegador del usuario.

---

## 📱 WhatsApp del agente

En `index.html` busca:

```html
href="https://wa.me/573001234567?text=..."
```

Cambia `573001234567` por el número real (código de país + número, sin + ni espacios).  
Ejemplo México: `525512345678`  
Ejemplo España: `34600123456`

---

## 🧪 Probar sin Supabase

Si aún no configuras Supabase, el formulario **funciona en modo simulación**:  
abre la consola del navegador (F12) y verás los datos que se habrían enviado.

---

## 📱 Diseño mobile-first

- Pensado primero para celular (botones grandes, formularios fáciles de tocar).
- Se ve bien también en tablet y escritorio.
- Fuentes legibles, contraste bueno, sin zoom forzado en iOS.

---

## ✅ Checklist antes de publicar

- [ ] Poner logo y favicon en `assets/`
- [ ] Poner fotos reales en `assets/gallery/`
- [ ] Configurar URL y ANON KEY de Supabase en `js/app.js`
- [ ] Crear las tablas en Supabase (SQL de arriba)
- [ ] Cambiar el número de WhatsApp
- [ ] Subir a GitHub y activar Pages
- [ ] Probar el formulario desde el celular

---

¿Necesitas cambios? Dime y lo ajustamos.
