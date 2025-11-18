# Configuración para Producción

## Opciones de Despliegue

### Opción 1: Subdominio API (Recomendado) ⭐

**Configuración:**
- Frontend: `https://codes-labs.com`
- Backend: `https://api.codes-labs.com`

**Ventajas:**
- ✅ Separación clara entre frontend y backend
- ✅ Escalabilidad independiente
- ✅ SSL independiente para cada servicio
- ✅ CORS más simple de configurar
- ✅ Mejor para CDN y caché

**Configuración DNS:**
```
A     api.codes-labs.com    →  IP del servidor (69.164.244.24)
A     codes-labs.com        →  IP del servidor o CDN
```

**Variables de entorno (.env):**
```env
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://codes-labs.com
CORS_CREDENTIALS=true
```

---

### Opción 2: Mismo Dominio con Rutas

**Configuración:**
- Frontend: `https://codes-labs.com`
- Backend: `https://codes-labs.com/api` (proxy reverso)

**Ventajas:**
- ✅ Un solo dominio y certificado SSL
- ✅ No requiere subdominio adicional
- ✅ Más simple para algunos casos

**Configuración Nginx (ejemplo):**
```nginx
server {
    listen 443 ssl;
    server_name codes-labs.com;

    # Frontend (Angular)
    location / {
        root /var/www/codes-labs-frontend;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Variables de entorno (.env):**
```env
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://codes-labs.com
CORS_CREDENTIALS=true
```

**Frontend environment.prod.ts:**
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://codes-labs.com/api/v1'
};
```

---

## Configuración Recomendada: Subdominio API

### 1. Configuración DNS

Agregar registro A en tu DNS:
```
Tipo: A
Nombre: api
Valor: 69.164.244.24
TTL: 3600
```

### 2. Configuración SSL (Let's Encrypt)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado para el subdominio
sudo certbot --nginx -d api.codes-labs.com
```

### 3. Configuración Nginx para API

```nginx
server {
    listen 80;
    server_name api.codes-labs.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.codes-labs.com;

    ssl_certificate /etc/letsencrypt/live/api.codes-labs.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.codes-labs.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to Node.js backend
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

### 4. Variables de Entorno del Backend

Archivo `.env` en producción:
```env
# Server Configuration
PORT=3001
NODE_ENV=production

# PostgreSQL
POSTGRES_HOST=69.164.244.24
POSTGRES_PORT=5432
POSTGRES_DB=codeslabs_db
POSTGRES_USER=codeslabs_user
POSTGRES_PASSWORD=C0d3sL@bs_2024_S3cur3_P@ssw0rd!
POSTGRES_SSL=false

# API Configuration
API_VERSION=v1

# CORS Configuration
CORS_ORIGIN=https://codes-labs.com
CORS_CREDENTIALS=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Email Configuration
EMAIL_USER=codes.labs.rc@gmail.com
EMAIL_PASSWORD=erkt jazp avno zcui
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_FROM=Codes-Labs <codes.labs.rc@gmail.com>
EMAIL_TO=codes.labs.rc@gmail.com
```

### 5. Frontend - environment.prod.ts

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.codes-labs.com/api/v1'
};
```

---

## Proceso de Despliegue

### Backend

1. **Construir el proyecto:**
   ```bash
   cd back-end
   npm install
   npm run build
   ```

2. **Configurar variables de entorno:**
   ```bash
   cp env.config.example .env
   # Editar .env con valores de producción
   ```

3. **Iniciar con PM2 (recomendado):**
   ```bash
   npm install -g pm2
   pm2 start dist/index.js --name codes-labs-api
   pm2 save
   pm2 startup
   ```

### Frontend

1. **Construir para producción:**
   ```bash
   cd front-end
   npm install
   ng build --configuration production
   ```

2. **Desplegar archivos:**
   ```bash
   # Los archivos estarán en dist/codes-labs/
   # Copiar a tu servidor web (Nginx, Apache, etc.)
   ```

---

## Verificación

### Probar endpoints:

```bash
# Health check
curl https://api.codes-labs.com/health

# Proyectos
curl https://api.codes-labs.com/api/v1/projects

# Desde el frontend
# Debe cargar proyectos desde la API automáticamente
```

---

## Notas Importantes

1. **Firewall**: Asegúrate de que el puerto 3001 esté abierto solo localmente (no expuesto públicamente)
2. **SSL**: Siempre usa HTTPS en producción
3. **Variables de entorno**: Nunca subas el archivo `.env` al repositorio
4. **PM2**: Usa PM2 o similar para mantener el proceso corriendo
5. **Logs**: Configura rotación de logs para producción

---

## Resumen

**Recomendación: Usar subdominio `api.codes-labs.com`**

- Más profesional
- Mejor separación de responsabilidades
- Más fácil de escalar
- Mejor para SEO (el frontend no tiene rutas /api)

