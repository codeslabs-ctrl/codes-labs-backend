# Solución: Error SSL en femimed.codes-labs.com

## Problema

```
AH01909: www.femimed.codes-labs.com:443:0 server certificate does NOT include an ID which matches the server name
```

El certificado SSL no coincide con el nombre del servidor configurado en Apache.

---

## Causas Posibles

1. **Certificado incorrecto**: El certificado es para `femimed.codes-labs.com` pero Apache está configurado para `www.femimed.codes-labs.com`
2. **Certificado desactualizado**: El certificado expiró o fue renovado incorrectamente
3. **Configuración Apache incorrecta**: El `ServerName` o `ServerAlias` no coincide con el certificado

---

## Soluciones

### Solución 1: Verificar Certificado SSL Actual

```bash
# Verificar qué dominios incluye el certificado
openssl x509 -in /etc/letsencrypt/live/femimed.codes-labs.com/fullchain.pem -text -noout | grep -A 1 "Subject Alternative Name"

# O verificar el certificado completo
openssl x509 -in /etc/letsencrypt/live/femimed.codes-labs.com/fullchain.pem -text -noout | grep -E "(Subject:|DNS:)"
```

**Debe mostrar**:
- `femimed.codes-labs.com`
- `www.femimed.codes-labs.com` (si está incluido)

### Solución 2: Verificar Configuración Apache

```bash
# Verificar la configuración de femimed en Apache
grep -A 20 "femimed.codes-labs.com" /usr/local/directadmin/data/users/admin/httpd.conf | grep -E "(ServerName|ServerAlias|SSLCertificate)"
```

**Debe mostrar**:
- `ServerName femimed.codes-labs.com` (o `www.femimed.codes-labs.com`)
- `ServerAlias www.femimed.codes-labs.com` (si usa www)
- `SSLCertificateFile` apuntando al certificado correcto

### Solución 3: Renovar Certificado SSL

Si el certificado no incluye `www.femimed.codes-labs.com`, renovarlo para incluir ambos:

```bash
# Renovar certificado incluyendo www
certbot certonly --webroot \
  -w /home/admin/domains/femimed.codes-labs.com/public_html \
  -d femimed.codes-labs.com \
  -d www.femimed.codes-labs.com \
  --force-renewal
```

**O desde DirectAdmin**:
1. SSL Certificates
2. Seleccionar `femimed.codes-labs.com`
3. "Get automatic certificate from ACME Provider"
4. Asegurarse de que incluye `www.femimed.codes-labs.com` en los dominios

### Solución 4: Ajustar Configuración Apache

Si el certificado es solo para `femimed.codes-labs.com` (sin www), ajustar Apache:

```apache
<VirtualHost 69.164.244.24:443>
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/femimed.codes-labs.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/femimed.codes-labs.com/privkey.pem
    
    # Cambiar ServerName a femimed.codes-labs.com (sin www)
    ServerName femimed.codes-labs.com
    ServerAlias www.femimed.codes-labs.com
    
    # ... resto de configuración
</VirtualHost>
```

**O redirigir www a no-www**:

```apache
<VirtualHost 69.164.244.24:443>
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/femimed.codes-labs.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/femimed.codes-labs.com/privkey.pem
    
    ServerName femimed.codes-labs.com
    ServerAlias www.femimed.codes-labs.com
    
    # Redirigir www a no-www
    RewriteEngine On
    RewriteCond %{HTTP_HOST} ^www\.(.*)$ [NC]
    RewriteRule ^(.*)$ https://%1$1 [R=301,L]
    
    # ... resto de configuración
</VirtualHost>
```

---

## Pasos Recomendados

### Opción A: Renovar Certificado (Recomendado)

1. **Renovar certificado** para incluir ambos dominios:
   ```bash
   certbot certonly --webroot \
     -w /home/admin/domains/femimed.codes-labs.com/public_html \
     -d femimed.codes-labs.com \
     -d www.femimed.codes-labs.com
   ```

2. **Reiniciar Apache**:
   ```bash
   systemctl restart httpd
   ```

3. **Verificar**:
   ```bash
   curl -I https://femimed.codes-labs.com
   curl -I https://www.femimed.codes-labs.com
   ```

### Opción B: Ajustar Apache (Más Rápido)

1. **Editar configuración Apache** en DirectAdmin:
   - Apache Configuration → Custom HTTPD Configurations
   - Seleccionar `femimed.codes-labs.com`
   - Cambiar `ServerName` a `femimed.codes-labs.com` (sin www)
   - O agregar redirección de www a no-www

2. **Reiniciar Apache**:
   ```bash
   systemctl restart httpd
   ```

---

## Verificación Post-Solución

```bash
# 1. Verificar que no hay más errores SSL
tail -f /var/log/httpd/domains/codes-labs.com.femimed.error.log
# No debe mostrar más errores AH01909

# 2. Probar acceso HTTPS
curl -I https://femimed.codes-labs.com
curl -I https://www.femimed.codes-labs.com

# 3. Verificar certificado desde navegador
# Abrir: https://femimed.codes-labs.com
# Debe mostrar candado verde 🔒 sin advertencias
```

---

## Nota Importante

Este error es una **advertencia**, no un error crítico. El sitio puede seguir funcionando, pero los navegadores mostrarán advertencias de seguridad. Es importante corregirlo para mantener la confianza de los usuarios.

---

## Si el Problema Persiste

1. **Verificar que el certificado existe**:
   ```bash
   ls -la /etc/letsencrypt/live/femimed.codes-labs.com/
   ```

2. **Verificar permisos**:
   ```bash
   ls -la /etc/letsencrypt/live/femimed.codes-labs.com/fullchain.pem
   # Debe ser legible por Apache
   ```

3. **Verificar configuración completa de Apache**:
   ```bash
   httpd -S 2>&1 | grep femimed
   ```

