# CodeChef — Antorcha Restaurante & Inventario

> Sistema de gestión administrativa para restaurante con trazabilidad de maestros, transacciones de inventario con cálculo atómico de saldos, gráficas de evolución diaria, y control de acceso basado en roles (`ADMIN` y `USER`).

Proyecto evaluativo para la asignatura **Ingeniería Web (35%)** — Universidad de Antioquia.

---

## Integrantes del Equipo

| Nombre | Correo Institucional | Rol en el Proyecto |
| --- | --- | --- |
| **Jesus Estiven Torres Quintero** | `jesus.torresq@udea.edu.co` | Desarrollador Fullstack |
| **Daniela Vela** | `daniela.vela@udea.edu.co` | Administradora de Base de Datos & Backend |
| **Isabela Bedoya** | `isabela.bedoya@udea.edu.co` | Desarrolladora Fullstack |

- **Repositorio en la Organización:** [202602-Ingeniria-Web-Udea/CodeChef-Restaurante](https://github.com/202602-Ingeniria-Web-Udea/CodeChef-Restaurante)
- **Repositorio conectado a Vercel:** [Isa-Bedoya-UdeA/CodeChef-Restaurante](https://github.com/Isa-Bedoya-UdeA/CodeChef-Restaurante)
- **Despliegue en Vercel:** [codechef-restaurante.vercel.app](https://codechef-restaurante.vercel.app)

---

## Credenciales de Acceso para Evaluación

La base de datos cuenta con usuarios sembrados con contraseñas hasheadas con `bcryptjs`:

| Rol | Correo Electrónico | Contraseña | Permisos Otorgados |
| --- | --- | --- | --- |
| **`ADMIN`** | `admin@codechef.com` | `admin123` | **Acceso total:** Puede crear Maestros, editar roles de usuarios, gestionar transacciones (entradas/salidas) y ver todas las gráficas. |
| **`USER`** | `laura@codechef.com` | `cliente123` | **Acceso operativo:** Puede consultar Maestros, registrar movimientos (entradas/salidas) y consultar gráficas. **No** puede ver la sección de usuarios ni crear maestros. |
| **`USER`** | `andres@codechef.com` | `cliente123` | **Acceso operativo:** Mismos permisos que usuario estándar. |

> **Nota:** La pantalla de inicio de sesión (`/login`) cuenta con botones de acceso rápido que rellenan automáticamente las credenciales con un solo clic.

---

## Requisitos Previos

- **Node.js:** Versión 22.x LTS (o >= 20.19.43)
- **pnpm:** Versión 10.x / 12.x (`npm install -g pnpm`)
- **Base de Datos:** Instancia PostgreSQL en Supabase

---

## Instalación y Ejecución Local Paso a Paso

### 1. Clonar el repositorio

```bash
git clone https://github.com/202602-Ingeniria-Web-Udea/CodeChef-Restaurante.git
cd CodeChef-Restaurante
```

### 2. Instalar dependencias

```bash
pnpm install
```

### 3. Configurar variables de entorno

Crear un archivo `.env` en la raíz del proyecto basado en `.env.example`:

```dotenv
# Supabase PostgreSQL (modo Transaction pooler o Session)
DATABASE_URL="postgresql://postgres.[TU-PROYECTO]:[TU-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x"

# Secreto de sesión NextAuth / Auth.js
AUTH_SECRET="f6c8d7e9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7"
NEXTAUTH_SECRET="f6c8d7e9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Sincronizar esquema y poblar la base de datos (Seed)

```bash
# Generar cliente de Prisma
pnpm run db:generate

# Aplicar migraciones / esquema
pnpm run db:push

# Poblar datos iniciales (usuarios, maestros, transacciones y pedidos)
pnpm run db:seed
```

### 5. Iniciar el servidor de desarrollo

```bash
pnpm dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

---

## Verificación de Calidad y Pruebas

El proyecto cuenta con una suite completa de pruebas automatizadas y chequeo estático:

```bash
# 1. Ejecutar las 34 pruebas automatizadas con Vitest
pnpm test

# 2. Verificar tipado estático con TypeScript
pnpm typecheck

# 3. Analizar código con ESLint
pnpm lint

# 4. Compilar optimizado para producción con Next.js Turbopack
pnpm build
```

---

## Mocks para Formularios de Prueba

Utiliza estos datos de prueba realistas para evaluar el funcionamiento del sistema:

### 1. Creación de Maestro (Solo ADMIN)
- **Ruta:** `/dashboard/ingredients` -> Botón *"Agregar Maestro"*
- **Mock A (Sólido por peso):**
  - Nombre: `Pechuga de Pollo Marinada`
  - Unidad de Medida: `Kilogramos (KG)`
  - Saldo Inicial: `25.500`
- **Mock B (Líquido):**
  - Nombre: `Salsa BBQ Ahumada Artesanal`
  - Unidad de Medida: `Litros (L)`
  - Saldo Inicial: `10.000`
- **Mock C (Unidades):**
  - Nombre: `Pan Brioche Artesanal`
  - Unidad de Medida: `Unidades (UNITS)`
  - Saldo Inicial: `80.000`

### 2. Registro de Movimiento de Transacción (ADMIN o USER)
- **Ruta:** `/dashboard/transactions` -> Seleccionar Maestro -> Botón *"Agregar movimiento"*
- **Mock Entrada (Reabastecimiento de Proveedor):**
  - Maestro: `Carne de res`
  - Tipo de Movimiento: `Entrada`
  - Cantidad: `12.5`
  - Motivo: `Compra semanal proveedor San Cayetano`
  - *Resultado esperado:* El saldo aumenta inmediatamente en +12.500 KG y se refleja en la tabla y en la gráfica.
- **Mock Salida (Consumo en Cocina):**
  - Maestro: `Carne de res`
  - Tipo de Movimiento: `Salida`
  - Cantidad: `4.2`
  - Motivo: `Preparación servicio de almuerzos`
  - *Resultado esperado:* El saldo disminuye en -4.200 KG con validación de saldo disponible.
- **Mock Salida Inválida (Validación de Error):**
  - Cantidad superior al stock disponible (ej. `999999`).
  - *Resultado esperado:* Modal muestra error de validación en rojo indicando saldo insuficiente sin alterar la base de datos.

### 3. Edición de Rol de Usuario (Solo ADMIN)
- **Ruta:** `/dashboard/users` -> Botón *"Editar usuario"* sobre Laura Gómez
- **Cambio:** Modificar de `USER` a `ADMIN`
- *Resultado esperado:* El badge de Laura cambia inmediatamente a `ADMIN`.
- **Validación de Seguridad:** Intentar quitarse el rol de `ADMIN` al usuario actualmente en sesión muestra el mensaje protector: *"No puedes quitarte el rol de administrador a ti mismo"*.

---

## Despliegue en Vercel Paso a Paso

1. Iniciar sesión en [Vercel](https://vercel.com) e importar el repositorio `CodeChef-Restaurante`.
2. Framework Preset: **Next.js**.
3. Configurar las **Environment Variables** en Vercel:
   - `DATABASE_URL`: String de conexión de Supabase PostgreSQL con SSL.
   - `AUTH_SECRET`: Clave aleatoria segura de 32+ caracteres.
   - `NEXTAUTH_SECRET`: Misma clave que `AUTH_SECRET`.
   - `NEXTAUTH_URL`: URL asignada por Vercel (ej. `https://codechef-restaurante.vercel.app`).
4. Build Command: `pnpm run build`
5. Output Directory: `.next`
6. Hacer clic en **Deploy**. El pipeline compilará el código y desplegará la aplicación en alta disponibilidad.

---

## Arquitectura y Principios de Diseño

- **Next.js App Router (v16):** Separación lógica entre rutas públicas `(public)`, rutas de autenticación `(auth)` y panel protegido `(dashboard)`.
- **SOLID & Capa de Servicios:** Toda la lógica de negocio (inventario, transacciones atómicas, gestión de usuarios) reside en servicios independientes (`src/services/`), desacoplada de los controladores de ruta (`src/app/api/`).
- **Control Atómico de Transacciones:** Las mutaciones de inventario utilizan transacciones atómicas de Prisma (`prisma.$transaction`) con operaciones a nivel de base de datos (`increment`/`decrement`), eliminando condiciones de carrera (*race conditions*).
- **Diseño Responsivo:** Barra de navegación lateral fija en escritorio (`lg:block`), y cabecera compacta con menú desplegable tipo cajón (*drawer*) con fondo translúcido en dispositivos móviles y tabletas.
- **Sistema de Diseño (Antorcha):** Paleta cálida basada en terracota, naranja brasa y tonos tostados inspirados en asador/restaurante, cumpliendo con la directriz de accesibilidad y sin uso de verdes decorativos.
- **Zero Errores Ortográficos:** Textos, botones y modales revisados gramaticalmente con acentuación y puntuación estricta en español.

---

## Licencia

Distribuido bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más información.
