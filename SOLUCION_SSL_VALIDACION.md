# Solución: Error de Validación SSL Let's Encrypt

## Problema

Let's Encrypt no puede acceder a los archivos de validación en:
- `http://codes-labs.com/.well-known/acme-challenge/`
- `http://api.codes-labs.com/.well-known/acme-challenge/`

## Causas Posibles

1. **DNS no configurado**: Los dominios no apuntan al servidor
2. **Puerto 80 bloqueado**: Firewall bloqueando HTTP
3. **Apache no sirve .well-known**: Configuración incorrecta
4. **Redirección HTTPS**: Redirige HTTP antes de validar

---

## Soluciones

### Solución 1: Verificar DNS

Verificar que los dominios apunten al servidor:

```bash
# Verificar DNS
nslookup codes-labs.com
nslookup api.codes-labs.com

# Deben apuntar a: 69.164.244.24
```

Si no apuntan correctamente:
1. Ir a tu proveedor de DNS
2. Crear registro A:
   - `codes-labs.com` → `69.164.244.24`
   - `api.codes-labs.com` → `69.164.244.24`
3. Esperar propagación (puede tardar minutos u horas)

---

### Solución 2: Asegurar que Apache Sirva .well-known

Agregar esta configuración en el VirtualHost 80 (HTTP) de cada dominio:

```apache
# Permitir acceso a .well-known para Let's Encrypt
<Directory "/home/admin/domains/codes-labs.com/public_html/.well-known">
    Options None
    AllowOverride None
    Require all granted
</Directory>

# O más genérico, permitir .well-known en cualquier ubicación
Alias /.well-known /home/admin/domains/codes-labs.com/public_html/.well-known
<Directory "/home/admin/domains/codes-labs.com/public_html/.well-known">
    Options None
    AllowOverride None
    Require all granted
</Directory>
```

**IMPORTANTE**: Esta configuración debe ir ANTES de la redirección HTTPS.

---

### Solución 3: Modificar Redirección HTTP → HTTPS

La redirección debe permitir que Let's Encrypt valide primero. Modificar el VirtualHost 80:

```apache
<VirtualHost 69.164.244.24:80>
    ServerName api.codes-labs.com
    ServerAlias www.api.codes-labs.com api.codes-labs.com
    
    # Permitir .well-known ANTES de redirigir
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
    
    DocumentRoot "/home/admin/domains/api.codes-labs.com.codes-labs.com/public_html"
    # ... resto de configuración
</VirtualHost>
```

---

### Solución 4: Verificar Puerto 80

```bash
# Verificar que Apache escuche en puerto 80
netstat -tulpn | grep :80

# Verificar firewall
iptables -L -n | grep 80
# O
firewall-cmd --list-all

# Si está bloqueado, abrir puerto 80
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
# O
firewall-cmd --permanent --add-service=http
firewall-cmd --reload
```

---

### Solución 5: Crear Directorio .well-known Manualmente

```bash
# Crear directorio para codes-labs.com
mkdir -p /home/admin/domains/codes-labs.com/public_html/.well-known/acme-challenge
chown -R admin:admin /home/admin/domains/codes-labs.com/public_html/.well-known
chmod -R 755 /home/admin/domains/codes-labs.com/public_html/.well-known

# Crear directorio para api.codes-labs.com
mkdir -p /home/admin/domains/api.codes-labs.com.codes-labs.com/public_html/.well-known/acme-challenge
chown -R admin:admin /home/admin/domains/api.codes-labs.com.codes-labs.com/public_html/.well-known
chmod -R 755 /home/admin/domains/api.codes-labs.com.codes-labs.com/public_html/.well-known
```

---

### Solución 6: Usar Certbot Manualmente (Alternativa)

Si DirectAdmin no funciona, usar Certbot directamente:

```bash
# Detener Apache temporalmente (si es necesario)
systemctl stop httpd

# Obtener certificado manualmente
certbot certonly --standalone -d api.codes-labs.com -d www.api.codes-labs.com

# Reiniciar Apache
systemctl start httpd

# Luego configurar Apache para usar el certificado
```

---

## Configuración Completa del VirtualHost 80 (Corregida)

```apache
<VirtualHost 69.164.244.24:80>
    ServerName api.codes-labs.com
    ServerAlias www.api.codes-labs.com api.codes-labs.com
    ServerAdmin webmaster@codes-labs.com
    DocumentRoot "/home/admin/domains/api.codes-labs.com.codes-labs.com/public_html"
    
    # CRÍTICO: Permitir .well-known para Let's Encrypt
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
    
    ScriptAlias /cgi-bin/ "/home/admin/domains/api.codes-labs.com.codes-labs.com/public_html/cgi-bin/"
    UseCanonicalName OFF
    SuexecUserGroup admin admin
    CustomLog /var/log/httpd/domains/codes-labs.com.api.bytes bytes
    CustomLog /var/log/httpd/domains/codes-labs.com.api.log combined
    ErrorLog /var/log/httpd/domains/codes-labs.com.api.error.log

    <Directory "/home/admin/domains/api.codes-labs.com.codes-labs.com/public_html">
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

---

## Verificación Paso a Paso

### 1. Verificar DNS
```bash
dig codes-labs.com +short
dig api.codes-labs.com +short
# Debe mostrar: 69.164.244.24
```

### 2. Verificar Puerto 80
```bash
curl -I http://api.codes-labs.com/.well-known/test
# Debe responder (aunque sea 404, significa que Apache responde)
```

### 3. Crear Archivo de Prueba
```bash
# Crear directorio
mkdir -p /home/admin/domains/api.codes-labs.com.codes-labs.com/public_html/.well-known/test

# Crear archivo de prueba
echo "test" > /home/admin/domains/api.codes-labs.com.codes-labs.com/public_html/.well-known/test/file.txt

# Probar acceso
curl http://api.codes-labs.com/.well-known/test/file.txt
# Debe mostrar: test
```

### 4. Verificar Permisos
```bash
ls -la /home/admin/domains/api.codes-labs.com.codes-labs.com/public_html/.well-known
# Debe ser accesible por Apache
```

---

## Orden de Prioridad para Resolver

1. ✅ **Verificar DNS** (más común)
2. ✅ **Agregar configuración .well-known** en VirtualHost 80
3. ✅ **Modificar redirección** para excluir .well-known
4. ✅ **Verificar puerto 80** y firewall
5. ✅ **Crear directorios manualmente**

---

## Después de Corregir

1. Reiniciar Apache:
   ```bash
   systemctl restart httpd
   ```

2. Intentar obtener certificado nuevamente en DirectAdmin

3. O usar Certbot manualmente:
   ```bash
   certbot certonly --webroot -w /home/admin/domains/api.codes-labs.com.codes-labs.com/public_html -d api.codes-labs.com
   ```

