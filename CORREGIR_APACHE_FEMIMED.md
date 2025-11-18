# Corregir Configuración Apache - femimed.codes-labs.com

## Problema Identificado

El VirtualHost 443 está usando certificados **genéricos del servidor** en lugar del certificado de Let's Encrypt:

**❌ Incorrecto (actual):**
```apache
SSLCertificateFile /etc/httpd/conf/ssl.crt/server.crt.combined
SSLCertificateKeyFile /etc/httpd/conf/ssl.key/server.key
```

**✅ Correcto (debe ser):**
```apache
SSLCertificateFile /etc/letsencrypt/live/femimed.codes-labs.com/fullchain.pem
SSLCertificateKeyFile /etc/letsencrypt/live/femimed.codes-labs.com/privkey.pem
```

---

## Solución: Editar Configuración Apache

### Paso 1: Hacer Backup

```bash
cp /usr/local/directadmin/data/users/admin/httpd.conf /usr/local/directadmin/data/users/admin/httpd.conf.backup.$(date +%Y%m%d_%H%M%S)
```

### Paso 2: Editar Archivo

```bash
nano /usr/local/directadmin/data/users/admin/httpd.conf
```

### Paso 3: Buscar y Corregir

Buscar la sección del VirtualHost 443 de femimed (línea ~177) y cambiar:

**Buscar:**
```apache
<VirtualHost 69.164.244.24:443 >
        SSLEngine on
        SSLCertificateFile /etc/httpd/conf/ssl.crt/server.crt.combined
        SSLCertificateKeyFile /etc/httpd/conf/ssl.key/server.key
        ServerName www.femimed.codes-labs.com
```

**Reemplazar por:**
```apache
<VirtualHost 69.164.244.24:443 >
        SSLEngine on
        SSLCertificateFile /etc/letsencrypt/live/femimed.codes-labs.com/fullchain.pem
        SSLCertificateKeyFile /etc/letsencrypt/live/femimed.codes-labs.com/privkey.pem
        ServerName femimed.codes-labs.com
        ServerAlias www.femimed.codes-labs.com
```

**Nota**: También cambié `ServerName` a `femimed.codes-labs.com` (sin www) y moví `www.femimed.codes-labs.com` a `ServerAlias`, que es la práctica recomendada.

### Paso 4: Guardar y Verificar

```bash
# Guardar (Ctrl+O, Enter, Ctrl+X en nano)

# Verificar sintaxis
httpd -t
# Debe mostrar: Syntax OK

# Si hay errores, corregirlos antes de continuar
```

### Paso 5: Reiniciar Apache

```bash
systemctl restart httpd
```

### Paso 6: Verificar

```bash
# Verificar logs (no debe haber más errores AH01909)
tail -20 /var/log/httpd/domains/codes-labs.com.femimed.error.log

# Probar acceso
curl -I https://femimed.codes-labs.com
curl -I https://www.femimed.codes-labs.com
```

---

## Comando Rápido (sed - Edición Automática)

Si prefieres hacerlo automáticamente:

```bash
# Hacer backup primero
cp /usr/local/directadmin/data/users/admin/httpd.conf /usr/local/directadmin/data/users/admin/httpd.conf.backup

# Reemplazar certificados en el VirtualHost 443 de femimed
sed -i '/femimed.codes-labs.com/,/<\/VirtualHost>/ {
    s|SSLCertificateFile /etc/httpd/conf/ssl.crt/server.crt.combined|SSLCertificateFile /etc/letsencrypt/live/femimed.codes-labs.com/fullchain.pem|g
    s|SSLCertificateKeyFile /etc/httpd/conf/ssl.key/server.key|SSLCertificateKeyFile /etc/letsencrypt/live/femimed.codes-labs.com/privkey.pem|g
    /ServerName www.femimed.codes-labs.com/ {
        N
        s|ServerName www.femimed.codes-labs.com\n        ServerAlias www.femimed.codes-labs.com femimed.codes-labs.com|ServerName femimed.codes-labs.com\n        ServerAlias www.femimed.codes-labs.com|g
    }
}' /usr/local/directadmin/data/users/admin/httpd.conf

# Verificar sintaxis
httpd -t

# Reiniciar Apache
systemctl restart httpd
```

**⚠️ Nota**: El comando sed es más complejo. Es más seguro editar manualmente.

---

## Configuración Final Correcta

El VirtualHost 443 debe quedar así:

```apache
<VirtualHost 69.164.244.24:443 >
        SSLEngine on
        SSLCertificateFile /etc/letsencrypt/live/femimed.codes-labs.com/fullchain.pem
        SSLCertificateKeyFile /etc/letsencrypt/live/femimed.codes-labs.com/privkey.pem
        ServerName femimed.codes-labs.com
        ServerAlias www.femimed.codes-labs.com
        ServerAdmin webmaster@codes-labs.com
        DocumentRoot "/home/admin/domains/femimed.codes-labs.com/public_html"
        ScriptAlias /cgi-bin/ "/home/admin/domains/femimed.codes-labs.com/public_html/cgi-bin/"
        UseCanonicalName OFF
        SuexecUserGroup admin admin
        CustomLog /var/log/httpd/domains/codes-labs.com.femimed.bytes bytes
        CustomLog /var/log/httpd/domains/codes-labs.com.femimed.log combined
        ErrorLog /var/log/httpd/domains/codes-labs.com.femimed.error.log
        
        # ... resto de configuración (proxy, etc.)
        
        <Directory "/home/admin/domains/femimed.codes-labs.com/public_html">
        </Directory>
</VirtualHost>
```

---

## Verificación Post-Corrección

```bash
# 1. Verificar que Apache está usando el certificado correcto
openssl s_client -connect femimed.codes-labs.com:443 -servername femimed.codes-labs.com < /dev/null 2>/dev/null | grep "subject="

# 2. Verificar logs
tail -f /var/log/httpd/domains/codes-labs.com.femimed.error.log
# No debe mostrar más errores AH01909

# 3. Probar desde navegador
# https://femimed.codes-labs.com
# Debe mostrar candado verde 🔒 sin advertencias
```

