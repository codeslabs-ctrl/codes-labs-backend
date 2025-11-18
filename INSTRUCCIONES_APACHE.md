# Instrucciones para Configurar Apache en DirectAdmin - Codes-Labs

## Pasos para Configurar

### 1. Crear el Subdominio en DirectAdmin

1. Acceder a DirectAdmin como admin
2. Ir a **Subdomain Management**
3. Crear subdominio: `api.codes-labs.com`
4. Esto creará automáticamente la estructura de carpetas

### 2. Obtener Certificado SSL para el Subdominio

```bash
# Conectarse al servidor como root
ssh root@69.164.244.24

# Obtener certificado SSL para api.codes-labs.com
certbot certonly --webroot -w /home/admin/domains/api.codes-labs.com/public_html -d api.codes-labs.com -d www.api.codes-labs.com
```

O desde DirectAdmin:
- Ir a **SSL Certificates**
- Seleccionar el dominio `api.codes-labs.com`
- Generar certificado Let's Encrypt

### 3. Habilitar Módulos de Apache (si no están habilitados)

```bash
# Verificar módulos instalados
httpd -M | grep proxy

# Si no están habilitados, editar httpd.conf o usar DirectAdmin
# En DirectAdmin: Apache Configuration → Loaded Modules
```

Módulos necesarios:
- `mod_proxy`
- `mod_proxy_http`
- `mod_headers`
- `mod_rewrite`

### 4. Agregar Configuración en DirectAdmin

**Opción A: Desde DirectAdmin (Recomendado)**

1. Ir a **Apache Configuration** → **Custom HTTPD Configurations**
2. Seleccionar dominio: `api.codes-labs.com`
3. Agregar la configuración del VirtualHost 443 (la parte del proxy)
4. Guardar y reiniciar Apache

**Opción B: Editar Archivo Directamente**

1. El archivo de configuración está en:
   ```
   /usr/local/directadmin/data/users/admin/httpd.conf
   ```
2. O en:
   ```
   /etc/httpd/conf/extra/httpd-vhosts.conf
   ```
3. Agregar la configuración del archivo `APACHE_CONFIG_CODES_LABS.conf`
4. Reiniciar Apache:
   ```bash
   systemctl restart httpd
   # o
   service httpd restart
   ```

### 5. Verificar que el Backend esté Corriendo

```bash
# Verificar que el backend esté en el puerto 3001
netstat -tulpn | grep 3001

# O usar PM2 para iniciarlo
cd /ruta/al/back-end
pm2 start dist/index.js --name codes-labs-api
pm2 save
```

### 6. Probar la Configuración

```bash
# Health check
curl https://api.codes-labs.com/health

# Proyectos
curl https://api.codes-labs.com/api/v1/projects

# Desde el navegador
# https://api.codes-labs.com/health
```

---

## Estructura de Carpetas en DirectAdmin

Después de crear el subdominio, las carpetas serán:

```
/home/admin/domains/
├── codes-labs.com/
│   └── public_html/          # Frontend Angular (copiar aquí)
└── api.codes-labs.com/
    └── public_html/           # No se usa (todo va por proxy)
```

---

## Desplegar el Frontend

1. **Construir el frontend:**
   ```bash
   cd front-end
   npm install
   ng build --configuration production
   ```

2. **Copiar archivos al servidor:**
   ```bash
   # Los archivos estarán en dist/codes-labs/
   # Copiar todo el contenido a:
   scp -r dist/codes-labs/* admin@69.164.244.24:/home/admin/domains/codes-labs.com/public_html/
   ```

3. **Asegurar permisos:**
   ```bash
   chown -R admin:admin /home/admin/domains/codes-labs.com/public_html
   chmod -R 755 /home/admin/domains/codes-labs.com/public_html
   ```

---

## Desplegar el Backend

1. **Construir el backend:**
   ```bash
   cd back-end
   npm install
   npm run build
   ```

2. **Copiar al servidor:**
   ```bash
   scp -r dist admin@69.164.244.24:/home/admin/domains/api.codes-labs.com/
   scp .env admin@69.164.244.24:/home/admin/domains/api.codes-labs.com/
   ```

3. **Configurar PM2:**
   ```bash
   # En el servidor
   cd /home/admin/domains/api.codes-labs.com
   npm install --production
   pm2 start dist/index.js --name codes-labs-api
   pm2 save
   pm2 startup
   ```

---

## Configuración del Archivo .env en Producción

Asegúrate de que el archivo `.env` tenga:

```env
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://codes-labs.com
CORS_CREDENTIALS=true
POSTGRES_HOST=69.164.244.24
POSTGRES_PORT=5432
POSTGRES_DB=codeslabs_db
POSTGRES_USER=codeslabs_user
POSTGRES_PASSWORD=C0d3sL@bs_2024_S3cur3_P@ssw0rd!
# ... resto de configuración
```

---

## Verificación Final

### 1. Verificar Backend
```bash
curl https://api.codes-labs.com/health
# Debe responder: {"status":"OK",...}
```

### 2. Verificar Frontend
- Abrir en navegador: `https://codes-labs.com`
- Debe cargar el dashboard
- Los proyectos deben cargarse desde la API

### 3. Verificar CORS
- Abrir consola del navegador en `codes-labs.com`
- No debe haber errores de CORS
- Las peticiones a `api.codes-labs.com` deben funcionar

---

## Troubleshooting

### Error: Proxy no funciona
- Verificar que los módulos de Apache estén habilitados
- Verificar que el backend esté corriendo en puerto 3001
- Revisar logs: `/var/log/httpd/domains/codes-labs.com.api.error.log`

### Error: CORS
- Verificar `CORS_ORIGIN` en `.env` del backend
- Verificar headers en Apache
- Verificar que el frontend use la URL correcta

### Error: SSL
- Verificar que el certificado esté instalado
- Renovar si es necesario: `certbot renew`

---

## Notas Importantes

1. **DirectAdmin**: Si editas manualmente, DirectAdmin puede sobrescribir cambios. Usa "Custom HTTPD Configurations" cuando sea posible.

2. **Reiniciar Apache**: Después de cambios, siempre reiniciar:
   ```bash
   systemctl restart httpd
   ```

3. **Logs**: Revisar logs regularmente:
   - Apache: `/var/log/httpd/domains/codes-labs.com.api.error.log`
   - Backend: `pm2 logs codes-labs-api`

4. **Firewall**: Asegurar que el puerto 3001 solo sea accesible localmente (no expuesto públicamente)

