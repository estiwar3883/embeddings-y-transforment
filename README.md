# Vector Lab — Gemini vs Transformers.js

> Compara embeddings semánticos generados por **Gemini en la nube** contra **MiniLM-L6-v2 corriendo localmente en tu navegador** con Transformers.js.

---

## ¿Qué es este proyecto?

Un laboratorio web interactivo que convierte texto humano en vectores numéricos (embeddings) usando dos modelos de IA completamente distintos y los compara en tiempo real:

- **Gemini Embedding 001** (Google AI) — modelo de nube que genera vectores de 768 dimensiones
- **all-MiniLM-L6-v2** (Hugging Face) — modelo liviano que corre 100% en tu navegador sin internet, genera vectores de 384 dimensiones

La comparativa muestra un **mapa de calor visual** de cada vector y calcula la **similitud coseno** entre ambos modelos para la misma frase.

---

## ¿Para qué sirve?

- Entender visualmente qué son los embeddings semánticos
- Comparar cómo distintos modelos de IA "representan" el lenguaje
- Experimentar con búsqueda semántica por significado (no por palabras exactas)
- Aprender la diferencia entre IA en la nube vs IA local en el navegador

---

## Tecnologías

| Tecnología | Uso |
|---|---|
| Next.js 16 | Framework fullstack con App Router |
| React 19 | UI del dashboard |
| TypeScript | Tipado estático |
| Prisma 5 + PostgreSQL | ORM y base de datos |
| Neon | PostgreSQL serverless en la nube |
| Google Generative AI | Embeddings con Gemini |
| @huggingface/transformers | Modelo MiniLM local en el navegador |
| Web Workers | Inferencia local sin bloquear la UI |
| bcryptjs | Hash seguro de contraseñas |
| Tailwind CSS v4 | Estilos |

---

## Requisitos previos

- [Node.js 18+](https://nodejs.org/)
- Cuenta en [Neon](https://neon.tech) (PostgreSQL serverless gratis)
- API Key de [Google AI Studio](https://aistudio.google.com)

---

## Instalación

### 1. Clona el repositorio

```bash
git clone https://github.com/estiwar3883/vector-lab.git
cd vector-EST
```

### 2. Instala las dependencias

```bash
npm install
```

### 3. Configura las variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
GOOGLE_API_KEY="tu_google_api_key"
```

**¿Dónde conseguir cada variable?**

- `DATABASE_URL` → [neon.tech](https://neon.tech) → tu proyecto → **Connection Details** → copia el string que empieza con `postgresql://`
- `GOOGLE_API_KEY` → [aistudio.google.com](https://aistudio.google.com) → **Get API Key** → **Create API key**

### 4. Crea las tablas en la base de datos

```bash
npx prisma generate
npx prisma db push
```

Esto crea automáticamente las tablas `User` y `VectorData` en tu base de datos de Neon.

### 5. Corre el proyecto

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## Estructura del proyecto

```
embeddings-mejorado/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/        # POST — autenticación con bcrypt
│   │   │   ├── register/     # POST — registro con hash de contraseña
│   │   │   └── logout/       # POST — elimina cookie de sesión
│   │   └── vectors/
│   │       └── route.ts      # POST — genera embedding con Gemini
│   │                         # PATCH — guarda vector local en Neon
│   ├── components/
│   │   └── navbar.tsx        # Barra de navegación
│   ├── dashboard/
│   │   ├── page.tsx          # Dashboard principal con visualización
│   │   ├── layout.tsx        # Layout del dashboard (incluye navbar)
│   │   └── worker.ts         # Web Worker — inferencia local MiniLM
│   ├── login/
│   │   └── page.tsx          # Página de inicio de sesión
│   ├── register/
│   │   └── page.tsx          # Página de registro
│   ├── lib/
│   │   └── prisma.ts         # Cliente de Prisma (singleton)
│   ├── middleware.ts          # Protección de rutas — redirige al login
│   ├── layout.tsx            # Layout raíz
│   ├── page.tsx              # Landing page
│   └── globals.css           # Estilos globales
├── prisma/
│   └── schema.prisma         # Modelos de base de datos
├── public/                   # Archivos estáticos
├── .env                      # Variables de entorno (NO subir a git)
├── next.config.ts            # Configuración de Next.js
├── package.json
└── tsconfig.json
```

---

## Cómo funciona

### Autenticación
1. El usuario se registra — la contraseña se encripta con `bcrypt` (salt rounds = 10) antes de guardarse en Neon
2. Al iniciar sesión, `bcrypt.compare()` valida la contraseña contra el hash guardado
3. Se genera una cookie `httpOnly` con el `userId` para mantener la sesión
4. El middleware de Next.js protege `/dashboard` — redirige al login si no hay sesión

### Generación de embeddings
1. El usuario escribe una frase en el dashboard
2. Se hace un `POST /api/vectors` → el servidor llama a **Gemini Embedding 001** y obtiene un vector de 768 dimensiones → se guarda en Neon
3. Simultáneamente, un **Web Worker** en el navegador carga **all-MiniLM-L6-v2** (se descarga ~23MB la primera vez, luego se cachea) y genera un vector de 384 dimensiones localmente
4. Se calcula la **similitud coseno** entre ambos vectores
5. El vector local se guarda en Neon via `PATCH /api/vectors`

### Base de datos
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // Hash bcrypt, nunca texto plano
  createdAt DateTime @default(now())
}

model VectorData {
  id              String   @id @default(cuid())
  phrase          String
  geminiVector    Float[]  // 768 dimensiones
  textEmbedVector Float[]  // 384 dimensiones
  createdAt       DateTime @default(now())
}
```

---

## Scripts disponibles

```bash
npm run dev        # Servidor de desarrollo
npm run build      # Build de producción
npm run start      # Servidor de producción
npx prisma studio  # Interfaz visual de la base de datos
npx prisma db push # Sincronizar schema con la base de datos
```

---

## Autor

**Estiven Andrés Mosquera Rivas**  
GitHub: [@estiwar3883](https://github.com/estiwar3883)

---

## Licencia

MIT
