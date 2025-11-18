# Checklist: Pasos Después de que el Proveedor Agregue el DNS

## ✅ Estado Actual

- [x] Registro DNS solicitado al proveedor
- [ ] DNS propagado
- [ ] Certificado SSL obtenido
- [ ] Backend configurado y corriendo
- [ ] Frontend desplegado
- [ ] Todo funcionando

---

## Paso 1: Verificar Propagación DNS

Una vez que el proveedor confirme que agregó el registro, espera 5-15 minutos y verifica:

```bash
# Verificar desde Google DNS
dig @8.8.8.8 api.codes-labs.com +short
# Debe mostrar: 69.164.244.24

# Verificar desde Cloudflare DNS
dig @1.1.1.1 api.codes-labs.com +short
# Debe mostrar: 69.164.244.24

# Verificar desde el servidor
nslookup api.codes-labs.com
# Debe mostrar: 69.164.244.24
```

**Si aún no resuelve**: Espera más tiempo (puede tardar hasta 1 hora en algunos casos).

---

## Paso 2: Crear Directorio .well-known

```bash
# Crear directorio para Let's Encrypt
mkdir -p /home/admin/domains/api.codes-labs.com.codes-labs.com/public_html/.well-known/acme-challenge
chown -R admin:admin /home/admin/domains/api.codes-labs.com.codes-labs.com/public_html/.well-known
chmod -R 755 /home/admin/domains/api.codes-labs.com.codes-labs.com/public_html/.well-known
```

---

## Paso 3: Verificar Configuración Apache

Asegúrate de que el VirtualHost 80 de `api.codes-labs.com` tenga la configuración correcta:

1. En DirectAdmin: **Apache Configuration** → **Custom HTTPD Configurations**
2. Seleccionar dominio: `api.codes-labs.com`
3. Verificar que el VirtualHost 80 tenga:

```apache
# CRÍTICO: Permitir .well-known para Let's Encrypt (ANTES de redirección)
Alias /.well-known /home/admin/domains/api.codes-labs.com.codes-labs.com/public_html/.well-known
<Directory "/home/admin/domains/api.codes-labs.com.codes-labs.com/public_html/.well-known">
    Options None
    AllowOverride None
    Require all granted
</Directory>

# Redirección HTTP a HTTPS (excepto .well-known)
RewriteEngine On
RewriteCond %{REQUEST_URI} !^/\.well-known
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

Si no está, agregarlo desde el archivo `APACHE_CONFIG_CODES_LABS.conf`.

---

## Paso 4: Reiniciar Apache

```bash
systemctl restart httpd
# O
service httpd restart
```

---

## Paso 5: Verificar Acceso HTTP

```bash
# Probar que Apache responde
curl -I http://api.codes-labs.com
# Debe responder (aunque sea error, significa que Apache funciona)

# Probar .well-known
curl http://api.codes-labs.com/.well-known/test.txt
# Si el archivo existe, debe mostrarlo
```

---

## Paso 6: Obtener Certificado SSL

1. En DirectAdmin: **SSL Certificates**
2. Seleccionar dominio: `api.codes-labs.com`
3. Elegir: **"Get automatic certificate from ACME Provider"**
4. Click en **Save**

**Debería funcionar ahora** ✅

---

## Paso 7: Verificar Certificado SSL

```bash
# Verificar certificado
curl -I https://api.codes-labs.com/health
# Debe responder sin errores SSL

# O desde navegador
# https://api.codes-labs.com/health
# Debe mostrar el candado verde 🔒
```

---

## Paso 8: Configurar Proxy en Apache

Una vez que el SSL esté funcionando, agregar la configuración del proxy en el VirtualHost 443:

```apache
# Configuración de Proxy
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

## Paso 9: Desplegar Backend

1. Construir el backend:
   ```bash
   cd /ruta/al/back-end
   npm install
   npm run build
   ```

2. Configurar `.env` con valores de producción

3. Iniciar con PM2:
   ```bash
   pm2 start dist/index.js --name codes-labs-api
   pm2 save
   ```

4. Verificar que funciona:
   ```bash
   curl https://api.codes-labs.com/health
   # Debe responder: {"status":"OK",...}
   ```

---

## Paso 10: Desplegar Frontend

1. Construir el frontend:
   ```bash
   cd /ruta/al/front-end
   npm install
   ng build --configuration production
   ```

2. Copiar archivos a:
   ```
   /home/admin/domains/codes-labs.com/public_html/
   ```

3. Verificar permisos:
   ```bash
   chown -R admin:admin /home/admin/domains/codes-labs.com/public_html
   chmod -R 755 /home/admin/domains/codes-labs.com/public_html
   ```

---

## Verificación Final

```bash
# 1. Backend responde
curl https://api.codes-labs.com/health
curl https://api.codes-labs.com/api/v1/projects

# 2. Frontend carga
# Abrir en navegador: https://codes-labs.com
# Debe cargar y mostrar proyectos desde la API

# 3. Formulario de contacto funciona
# Enviar un mensaje de prueba desde el frontend
```

---

## Resumen de Orden

1. ✅ Solicitar DNS al proveedor (YA HECHO)
2. ⏳ Esperar confirmación del proveedor
3. ⏳ Verificar propagación DNS
4. ⏳ Crear directorio .well-known
5. ⏳ Verificar/agregar configuración Apache
6. ⏳ Reiniciar Apache
7. ⏳ Obtener certificado SSL
8. ⏳ Configurar proxy en Apache
9. ⏳ Desplegar backend
10. ⏳ Desplegar frontend
11. ⏳ Verificar todo funciona

---

## Notas

- **Tiempo de propagación DNS**: Generalmente 5-15 minutos, puede tardar hasta 1 hora
- **Si el certificado falla**: Verificar que `.well-known` sea accesible vía HTTP
- **Si el proxy no funciona**: Verificar que el backend esté corriendo en puerto 3001
- **Logs útiles**: 
  - Apache: `/var/log/httpd/domains/codes-labs.com.api.error.log`
  - Backend: `pm2 logs codes-labs-api`

