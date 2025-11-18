# Aplicar Configuración Apache Corregida

## Ruta del Archivo

```
/usr/local/directadmin/data/users/admin/httpd.conf
```

## Pasos para Aplicar

### Opción 1: Reemplazar Archivo Completo (Recomendado si tienes backup)

```bash
# 1. Hacer backup del archivo actual
cp /usr/local/directadmin/data/users/admin/httpd.conf /usr/local/directadmin/data/users/admin/httpd.conf.backup.$(date +%Y%m%d_%H%M%S)

# 2. Copiar el archivo corregido
# Desde tu máquina local, copiar httpd.conf.corregido al servidor
# O editar directamente en el servidor

# 3. Verificar sintaxis
httpd -t

# 4. Si la sintaxis es correcta, reiniciar Apache
systemctl restart httpd

# 5. Verificar logs
tail -20 /var/log/httpd/domains/codes-labs.com.femimed.error.log
```

### Opción 2: Editar Manualmente (Más Seguro)

```bash
# 1. Hacer backup
cp /usr/local/directadmin/data/users/admin/httpd.conf /usr/local/directadmin/data/users/admin/httpd.conf.backup

# 2. Editar el archivo
nano /usr/local/directadmin/data/users/admin/httpd.conf

# 3. Buscar y reemplazar las secciones:
#    - VirtualHost 443 de femimed (cambiar certificados SSL)
#    - VirtualHost de api.codes-labs.com (corregir nombres y agregar proxy)
#    - VirtualHost 80 de codes-labs.com (agregar .well-known)

# 4. Guardar (Ctrl+O, Enter, Ctrl+X)

# 5. Verificar sintaxis
httpd -t

# 6. Reiniciar Apache
systemctl restart httpd
```

### Opción 3: Usar sed para Cambios Específicos

```bash
# Hacer backup primero
cp /usr/local/directadmin/data/users/admin/httpd.conf /usr/local/directadmin/data/users/admin/httpd.conf.backup

# Cambiar certificados SSL de femimed
sed -i '/femimed.codes-labs.com/,/<\/VirtualHost>/ {
    s|SSLCertificateFile /etc/httpd/conf/ssl.crt/server.crt.combined|SSLCertificateFile /etc/letsencrypt/live/femimed.codes-labs.com/fullchain.pem|g
    s|SSLCertificateKeyFile /etc/httpd/conf/ssl.key/server.key|SSLCertificateKeyFile /etc/letsencrypt/live/femimed.codes-labs.com/privkey.pem|g
}' /usr/local/directadmin/data/users/admin/httpd.conf

# Verificar sintaxis
httpd -t

# Reiniciar Apache
systemctl restart httpd
```

## Cambios Principales a Aplicar

### 1. femimed.codes-labs.com (VirtualHost 443)

**Cambiar:**
```apache
SSLCertificateFile /etc/httpd/conf/ssl.crt/server.crt.combined
SSLCertificateKeyFile /etc/httpd/conf/ssl.key/server.key
ServerName www.femimed.codes-labs.com
```

**Por:**
```apache
SSLCertificateFile /etc/letsencrypt/live/femimed.codes-labs.com/fullchain.pem
SSLCertificateKeyFile /etc/letsencrypt/live/femimed.codes-labs.com/privkey.pem
ServerName femimed.codes-labs.com
```

### 2. api.codes-labs.com

**Corregir nombres** (de `api.codes-labs.codes-labs.com` a `api.codes-labs.com`)

**Agregar configuración de proxy** en VirtualHost 443

### 3. codes-labs.com (VirtualHost 80)

**Agregar** configuración `.well-known` y redirección HTTPS

## Verificación Post-Aplicación

```bash
# 1. Verificar sintaxis
httpd -t
# Debe mostrar: Syntax OK

# 2. Verificar VirtualHosts
httpd -S 2>&1 | grep -E "(femimed|api.codes-labs|codes-labs.com)"

# 3. Reiniciar Apache
systemctl restart httpd

# 4. Verificar logs de femimed
tail -20 /var/log/httpd/domains/codes-labs.com.femimed.error.log
# No debe mostrar errores AH01909

# 5. Probar acceso
curl -I https://femimed.codes-labs.com
curl -I https://api.codes-labs.com
curl -I https://codes-labs.com
```

## Nota Importante

⚠️ **DirectAdmin puede sobrescribir este archivo** cuando se hacen cambios desde el panel. Si eso pasa, necesitarás reaplicar los cambios o configurar DirectAdmin para que no regenere esas secciones.

## Si Algo Sale Mal

```bash
# Restaurar backup
cp /usr/local/directadmin/data/users/admin/httpd.conf.backup /usr/local/directadmin/data/users/admin/httpd.conf

# Reiniciar Apache
systemctl restart httpd
```

