# Verificar DNS y Obtener Certificado SSL

## ✅ DNS Configurado Correctamente

Tu registro DNS está bien:
```
api.codes-labs.com → 69.164.244.24 (A Record)
```

## Paso 1: Verificar Propagación DNS

Espera unos minutos (5-15 minutos) y luego verifica desde el servidor:

```bash
# Verificar DNS
nslookup api.codes-labs.com

# Debe mostrar:
# Name: api.codes-labs.com
# Address: 69.164.244.24
```

O usando dig:
```bash
dig api.codes-labs.com +short
# Debe mostrar: 69.164.244.24
```

**Si aún muestra NXDOMAIN**: Espera unos minutos más, la propagación puede tardar.

## Paso 2: Verificar que Apache Puede Servir el Dominio

Una vez que el DNS esté propagado, verifica que Apache responde:

```bash
# Probar acceso HTTP
curl -I http://api.codes-labs.com
# Debe responder (aunque sea error 404 o similar, significa que Apache responde)
```

## Paso 3: Crear Directorio .well-known (si no existe)

```bash
# Crear directorio para Let's Encrypt
mkdir -p /home/admin/domains/api.codes-labs.com.codes-labs.com/public_html/.well-known/acme-challenge
chown -R admin:admin /home/admin/domains/api.codes-labs.com.codes-labs.com/public_html/.well-known
chmod -R 755 /home/admin/domains/api.codes-labs.com.codes-labs.com/public_html/.well-known
```

## Paso 4: Verificar Configuración Apache

Asegúrate de que el VirtualHost 80 tenga la configuración para `.well-known`:

```apache
# En el VirtualHost 80 de api.codes-labs.com
Alias /.well-known /home/admin/domains/api.codes-labs.com.codes-labs.com/public_html/.well-known
<Directory "/home/admin/domains/api.codes-labs.com.codes-labs.com/public_html/.well-known">
    Options None
    AllowOverride None
    Require all granted
</Directory>

# Redirección HTTPS (excepto .well-known)
RewriteEngine On
RewriteCond %{REQUEST_URI} !^/\.well-known
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

## Paso 5: Reiniciar Apache

```bash
systemctl restart httpd
# O
service httpd restart
```

## Paso 6: Obtener Certificado SSL en DirectAdmin

1. Ir a **SSL Certificates**
2. Seleccionar dominio: `api.codes-labs.com`
3. Elegir: **"Get automatic certificate from ACME Provider"**
4. Click en **Save**

**Debería funcionar ahora** ✅

---

## Si Aún Falla

### Verificar que el archivo de prueba es accesible:

```bash
# Crear archivo de prueba
echo "test" > /home/admin/domains/api.codes-labs.com.codes-labs.com/public_html/.well-known/test.txt

# Probar acceso
curl http://api.codes-labs.com/.well-known/test.txt
# Debe mostrar: test
```

### Verificar logs de Apache:

```bash
tail -f /var/log/httpd/domains/codes-labs.com.api.error.log
```

### Verificar que el puerto 80 está abierto:

```bash
netstat -tulpn | grep :80
# Debe mostrar que Apache está escuchando
```

---

## Resumen de Verificación

```bash
# 1. Verificar DNS
dig api.codes-labs.com +short
# Debe mostrar: 69.164.244.24

# 2. Verificar HTTP
curl -I http://api.codes-labs.com
# Debe responder

# 3. Verificar .well-known
curl http://api.codes-labs.com/.well-known/test.txt
# Debe funcionar si el archivo existe

# 4. Si todo está bien, obtener certificado en DirectAdmin
```

---

## Orden de Ejecución

1. ✅ DNS configurado (ya hecho)
2. ⏳ Esperar propagación DNS (5-15 min)
3. ✅ Verificar DNS: `nslookup api.codes-labs.com`
4. ✅ Crear directorio `.well-known`
5. ✅ Verificar configuración Apache
6. ✅ Reiniciar Apache
7. ✅ Obtener certificado en DirectAdmin

