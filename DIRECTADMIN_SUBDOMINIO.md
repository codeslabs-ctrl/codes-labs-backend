# Configuración del Subdominio en DirectAdmin

## Crear Subdominio: api.codes-labs.com

### Opciones en DirectAdmin

Cuando DirectAdmin pregunta por el Document Root, **selecciona:**

✅ **Default**
```
/domains/api.codes-labs.com.codes-labs.com/public_html
```

### ¿Por qué Default?

1. **Estructura estándar**: Crea la estructura de carpetas que DirectAdmin espera
2. **SSL funciona mejor**: Let's Encrypt necesita la estructura estándar
3. **Logs organizados**: Los logs se organizan correctamente
4. **No importa el contenido**: Como todo va por proxy, el contenido de `public_html` no se usa
5. **Más limpio**: Mantiene la organización estándar de DirectAdmin

### ¿Qué NO elegir?

❌ **Legacy**: Crea una subcarpeta dentro del dominio principal, no es lo que necesitamos

❌ **Custom**: Solo si tienes una razón específica, pero Default es mejor

---

## Pasos Completos

### 1. Crear el Subdominio

1. En DirectAdmin: **Subdomain Management**
2. Dominio: `codes-labs.com`
3. Subdomain: `api`
4. **Document Root: Default** ✅
5. Crear

### 2. Verificar Estructura Creada

Después de crear, deberías tener:

```
/home/admin/domains/
├── codes-labs.com/
│   └── public_html/          # Frontend Angular
└── api.codes-labs.com.codes-labs.com/
    └── public_html/          # Vacío (no se usa, todo va por proxy)
```

**Nota**: DirectAdmin crea la carpeta con el nombre completo `api.codes-labs.com.codes-labs.com`, esto es normal.

### 3. Obtener Certificado SSL

Desde DirectAdmin:
1. Ir a **SSL Certificates**
2. Seleccionar dominio: `api.codes-labs.com`
3. **Let's Encrypt** → **Save**
4. Esto creará el certificado automáticamente

O desde línea de comandos:
```bash
certbot certonly --webroot -w /home/admin/domains/api.codes-labs.com.codes-labs.com/public_html -d api.codes-labs.com -d www.api.codes-labs.com
```

### 4. Agregar Configuración de Proxy

En DirectAdmin:
1. Ir a **Apache Configuration** → **Custom HTTPD Configurations**
2. Seleccionar dominio: `api.codes-labs.com`
3. Agregar la configuración del VirtualHost 443 (solo la parte del proxy)

O editar directamente el archivo de configuración.

---

## Configuración del VirtualHost para Proxy

Una vez creado el subdominio, agrega esta configuración en el VirtualHost 443 de `api.codes-labs.com`:

```apache
# Configuración de Proxy - DEBE IR ANTES del Directory
ProxyPreserveHost On
ProxyRequests Off

# Proxy para /health
ProxyPass /health http://localhost:3001/health nocanon
ProxyPassReverse /health http://localhost:3001/health

# Proxy para /api
ProxyPass /api http://localhost:3001/api nocanon
ProxyPassReverse /api http://localhost:3001/api

# Headers CORS
Header always set Access-Control-Allow-Origin "https://codes-labs.com"
Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
Header always set Access-Control-Allow-Credentials "true"

# Manejar preflight OPTIONS
RewriteEngine On
RewriteCond %{REQUEST_METHOD} OPTIONS
RewriteRule ^(.*)$ $1 [R=200,L]
```

---

## Verificación

Después de configurar:

```bash
# Verificar que el subdominio responde
curl https://api.codes-labs.com/health

# Debe responder: {"status":"OK",...}
```

---

## Nota Importante

El `public_html` del subdominio API puede estar vacío, no importa. Todo el tráfico se redirige al backend en el puerto 3001 mediante el proxy.

