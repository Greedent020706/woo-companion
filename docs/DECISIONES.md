# Decisiones técnicas

Cada decisión con su porqué, en lenguaje sencillo. Si en una entrevista te preguntan «¿por qué hiciste X?», la respuesta corta está aquí.

---

## 1. Arquitectura general

### Monorepo con npm workspaces

**Qué:** un solo repositorio con cuatro paquetes (`apps/api`, `apps/web`, `apps/mobile`, `packages/shared`). Las dependencias se instalan una vez en la raíz.
**Por qué:** la web y el móvil hablan con la misma API y comparten tipos. Con un monorepo, si cambio el tipo `Product`, TypeScript avisa a la vez en la API, en la web y en el móvil. npm workspaces viene con npm, así que no hace falta instalar Nx, Turborepo ni pnpm.

### `packages/shared` se consume como código TypeScript, sin compilar

**Qué:** su `package.json` apunta directamente a `src/index.ts`.
**Por qué:** Vite (web), Metro (móvil), tsx (API) y Vitest saben leer TypeScript. Así nos ahorramos un paso de build y un `watch` extra mientras desarrollamos. Si algún día se publicara en npm, sí habría que compilarlo.

### La API hace de proxy; las claves de WooCommerce solo viven en el servidor

**Qué:** ni la web ni el móvil llaman a WooCommerce. Llaman a nuestra API, y es ella la que llama a WooCommerce.
**Por qué:** una clave de WooCommerce dentro de una app móvil o de un bundle web puede extraerla cualquiera. Además, la API nos deja adaptar los datos de Woo a nuestro propio formato y cambiar de origen de datos sin tocar los clientes.

### Patrón «fuente de datos» intercambiable (`DataSource`)

**Qué:** una interfaz con dos implementaciones, `MockDataSource` (JSON en memoria) y `WooDataSource` (WooCommerce real). La variable `DATA_SOURCE` elige cuál se usa.
**Por qué:** las rutas de Express no saben de dónde salen los datos. El modo mock permite enseñar el proyecto sin tienda, y los tests usan el mock sin red. Es el patrón _Strategy_ con inyección de dependencias: `createApp({ dataSource })` recibe la fuente desde fuera.

---

## 2. Versiones (comprobadas en npm el 05/10/2026)

### React 19.2.3 en todo el monorepo, forzado con `overrides`

**Por qué:** Expo SDK 57 exige React 19.2.3. Si la web usara 19.3, npm instalaría dos copias de React y los hooks fallarían con «Invalid hook call» (nos pasó de verdad durante el desarrollo). El bloque `overrides` del `package.json` raíz obliga a que todo el árbol use la misma versión.

### React Router 7 (no el 8)

**Por qué:** React Router 8 pide React ≥ 19.2.7, incompatible con el punto anterior. La versión 7 tiene la misma API que verás en casi todos los tutoriales.

### TypeScript 6.0 (no el 7)

**Por qué:** typescript-eslint solo admite TypeScript < 6.1. La plantilla de Expo SDK 57 también usa la 6.0.

### `npm audit` muestra avisos

**Por qué no los «arreglamos»:** vienen de dependencias internas de las herramientas de Expo (CLI, Metro), no de código que se ejecute en la app ni en la web. `npm audit fix --force` cambiaría versiones que Expo fija y rompería el SDK. Se resuelven solos al actualizar Expo.

---

## 3. API (Express)

### Express 5

**Por qué:** desde la versión 5, si una ruta `async` lanza un error, Express lo envía solo al middleware de errores. Por eso las rutas no necesitan `try/catch`.

### Validación con zod en la frontera

**Qué:** cada `body` y cada `query` se pasan por un esquema zod (`parseOrThrow`). Si no cumplen, la API devuelve `400` con la lista de campos erróneos.
**Por qué:** nunca hay que fiarse de lo que llega del cliente. Además, el esquema es el mismo que usa el formulario web, así que el frontend y el backend validan con las mismas reglas.

### JWT con usuarios demo fijos

**Qué:** `admin@demo.com` (rol admin) y `cliente@demo.com` (rol cliente), ambos con `demo1234`. El token caduca a las 8 horas.
**Por qué:** es un proyecto de portfolio sin base de datos de usuarios. JWT es _stateless_: el servidor no guarda sesiones, solo verifica la firma con `JWT_SECRET`. El middleware `requireAuth('admin')` protege las rutas por rol.

### El total del pedido se calcula en el servidor

**Por qué:** el cliente solo envía `productId` y `quantity`. Si el cliente enviara el precio, cualquiera podría comprar a 0 €.

### Autenticación con WooCommerce: Basic Auth

**Qué:** se envía `Authorization: Basic base64(WOO_KEY:WOO_SECRET)`.
**Por qué:** es lo que recomienda WooCommerce sobre HTTPS. En una tienda local por HTTP, WooCommerce rechaza sus claves REST. Para ese caso se puede usar una _contraseña de aplicación_ de WordPress con el mismo mecanismo (está explicado en el README).

### Estadísticas en modo woo: aproximación

**Qué:** el dashboard calcula las métricas con los 100 productos y pedidos más recientes, aunque los totales sí salen de las cabeceras `X-WP-Total`.
**Por qué:** es simple y basta para una demo. En producción se usarían los endpoints `/reports` de WooCommerce o una caché.

### Nombres de archivo pensados para Vercel

**Qué:** el servidor local se llama `dev-server.ts` y la factoría `create-app.ts`. Solo `src/index.ts` exporta la app por defecto.
**Por qué:** Vercel busca el punto de entrada en una lista fija (`src/app.ts`, `src/index.ts`, `src/server.ts`…). Con estos nombres solo encuentra uno, el correcto.

---

## 4. Web (panel de administración)

### TanStack Query para los datos del servidor

**Por qué:** gestiona caché, estados de carga y error, reintentos e invalidación tras una mutación. Sin él necesitaríamos un `useEffect` + `useState` por cada petición, con _race conditions_ incluidas. Las _query keys_ están centralizadas en `query-keys.ts` para invalidar por grupos (`['products']` invalida listados y detalles).

### Los filtros viven en la URL (`?search=&category=&page=`)

**Por qué:** si recargas la página o compartes el enlace, ves lo mismo. El botón «atrás» funciona. Es estado derivado de la URL, no duplicado en `useState`.

### Buscador con estado local y debounce

**Qué:** el input tiene su propio estado (`useDebouncedSearchParam`) y la URL se actualiza 350 ms después de dejar de escribir.
**Por qué:** la primera versión ataba el input directamente a la URL y, al escribir rápido, se perdían letras. Lo detectamos en una prueba automatizada con un navegador real. El debounce evita además una petición por cada tecla.

### react-hook-form + zod

**Por qué:** react-hook-form usa inputs no controlados (pocos re-renders) y zod reutiliza el esquema de `shared`. Los campos opcionales numéricos convierten `''` a `null` con `setValueAs`, para que «vacío» signifique «sin oferta» o «sin gestionar stock».

### react-bootstrap con tema propio en Sass

**Qué:** `theme.scss` redefine variables de Bootstrap (colores, tipografía Manrope, radios, pesos) **antes** de importarlo.
**Por qué:** así cambia todo Bootstrap de forma coherente, no solo un par de clases. Se silencian los avisos de deprecación de Sass porque Bootstrap 5.3 todavía usa `@import`.

### Layout hecho a mano SIN Bootstrap

**Qué:** `AdminLayout`, el dashboard, las tarjetas y los badges usan CSS Modules, Grid, Flexbox y variables CSS (`tokens.css`).
**Por qué:** demuestra CSS sin depender de un framework. CSS Modules genera nombres de clase únicos, así que no hay colisiones.

### Modo oscuro con una sola fuente de verdad

**Qué:** el atributo `data-bs-theme="dark"` en `<html>` activa a la vez el modo oscuro de Bootstrap y nuestras variables `--wc-*`. Un script en `index.html` lo aplica antes del primer pintado.
**Por qué:** sin ese script la página parpadea en claro antes de pasar a oscuro. El tema se guarda en `localStorage` y, la primera vez, respeta `prefers-color-scheme`. Es un Context (`ThemeProvider`) porque hay dos botones de tema (móvil y escritorio) que deben estar sincronizados.

### Estados que no dependen solo del color

**Qué:** cada estado de pedido o de stock lleva icono + texto («Agotado», «Quedan 3»…) además de color.
**Por qué:** accesibilidad (WCAG 1.4.1): una persona daltónica o que use un lector de pantalla también tiene que entenderlo. Los iconos llevan `aria-hidden` y el texto es lo que se lee.

### Otras decisiones de accesibilidad

Enlace «Saltar al contenido», `<caption>` oculto en las tablas, `aria-live` en el contador de resultados y en los mensajes, `aria-current` en la paginación y el menú, `:focus-visible` bien visible, y `prefers-reduced-motion` respetado.

### Rutas cargadas bajo demanda (`lazy`)

**Por qué:** el bundle inicial pasó de 515 kB (aviso de Vite) a trozos por página. El login se carga sin esperar al código del dashboard.

### `<title>` dentro de los componentes

**Por qué:** React 19 lo sube solo al `<head>`. Ya no hace falta `react-helmet`.

### Vite escucha en `127.0.0.1`

**Por qué:** en Windows, `localhost` puede resolverse solo a IPv6 (`::1`) y algunos navegadores intentan IPv4. Nos pasó durante el desarrollo.

---

## 5. Móvil (Expo)

### Expo SDK 57 + Expo Router, rutas en `src/app`

**Por qué:** es la convención actual de Expo. Cada archivo de `src/app` es una pantalla y los `_layout.tsx` definen la navegación (Stack en la raíz, Tabs en `(tabs)`). El código que no es pantalla (componentes, hooks…) queda fuera de `src/app`.

### Carrito con Context + `useReducer`

**Qué:** `cart-reducer.ts` es una función pura (estado + acción → estado nuevo) en un archivo sin React Native.
**Por qué:** la lógica del carrito (sumar cantidades, no pasar del stock, borrar al llegar a 0) se prueba con Vitest sin emulador. El total se calcula en céntimos para evitar errores de coma flotante (0,1 + 0,2).

### Favoritos en AsyncStorage

**Por qué:** son datos no sensibles que deben sobrevivir al cierre de la app. Se validan con zod al leerlos, porque lo guardado puede venir de una versión antigua de la app.

### Token en expo-secure-store

**Por qué:** SecureStore usa el Keychain de iOS y el Keystore de Android, que van cifrados. AsyncStorage no está cifrado, así que no es sitio para un token. Por eso la app móvil no funciona en navegador: SecureStore no existe en web.

### Sesión restaurada sin llamar a la API

**Qué:** al abrir la app se lee el usuario guardado y se entra directamente. Si el token ha caducado, la primera petición devuelve 401 y se cierra la sesión sola.
**Por qué:** la app abre al instante aunque no haya red. En la web sí se valida con `/auth/me`, porque allí el token está en `localStorage`.

### Catálogo con `useInfiniteQuery` + FlatList

**Por qué:** FlatList solo renderiza lo visible (virtualización). `onEndReached` pide la siguiente página. `keepPreviousData` evita que la lista se vacíe y parpadee al cambiar el filtro. La cabecera con el buscador está fuera de la lista para que el teclado no se cierre al escribir.

### Notificación local tras el checkout

**Por qué:** las notificaciones _push_ ya no funcionan en Expo Go (desde SDK 53), pero las locales sí. En Android se crea un canal, como exige Android 8+. Si el usuario no da permiso, se muestra un `Alert` en su lugar.

### Estilos con `StyleSheet` y `theme.ts`

**Por qué:** los colores, espaciados y tipografía están en un solo sitio. `StyleSheet.create` valida los estilos y es la forma estándar en React Native. Los colores son los mismos que los de la web.

---

## 6. Calidad

### Vitest en todo el monorepo (`projects`)

**Qué:** un único `npm test` ejecuta 40 tests en 4 proyectos: `shared` (cliente de API), `api` (rutas con supertest, mappers y fuente de datos de Woo), `web` (hook `useDebounce`, `StatusBadge` y `ProductForm`) y `mobile` (reducer del carrito).
**Por qué:** una sola herramienta, rápida y compatible con la configuración de Vite. Los componentes de React Native no se testean con Vitest (necesitarían jest-expo); por eso la lógica del móvil está separada en funciones puras.

### Hooks propios

`useAuth`, `useDebounce`, `useTheme`, `useUrlFilters`, `useDebouncedSearchParam`, `useProducts`, `useOrders`, `useCart`, `useFavorites`, `useCatalog`, `useMyOrders` y `usePullToRefresh`. Cada uno encapsula una responsabilidad y lanza un error claro si se usa fuera de su _Provider_.

### Sin comentarios en el código

**Por qué:** el código se explica con nombres claros. Solo hay comentarios de una línea donde algo no es evidente (un workaround o una decisión rara). Las explicaciones están en este documento.

### Imágenes de ejemplo de picsum.photos

**Por qué:** los fixtures necesitan URLs públicas que funcionen también en el móvil. Son fotos aleatorias, no de café. Con una tienda real se usan las imágenes de WooCommerce.
