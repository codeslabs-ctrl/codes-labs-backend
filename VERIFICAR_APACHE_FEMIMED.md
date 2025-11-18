# Verificar Configuración Apache - femimed.codes-labs.com

## ✅ Certificado SSL Correcto

El certificado incluye ambos dominios:
- `femimed.codes-labs.com`
- `www.femimed.codes-labs.com`

## Problema: Configuración Apache

El error indica que Apache está usando un `ServerName` que no coincide. Necesitamos verificar la configuración.

---

## Comandos de Verificación

### 1. Verificar Configuración Apache de femimed

```bash
# Ver todos los VirtualHosts de femimed
httpd -S 2>&1 | grep femimed

# Ver configuración completa
grep -A 30 "femimed.codes-labs.com" /usr/local/directadmin/data/users/admin/httpd.conf | head -40

# O buscar en todos los archivos de configuración
grep -r "femimed" /etc/httpd/conf/ 2>/dev/null
```

### 2. Verificar ServerName y ServerAlias

```bash
# Buscar ServerName y ServerAlias de femimed
grep -A 5 "ServerName.*femimed" /usr/local/directadmin/data/users/admin/httpd.conf
grep -A 5 "ServerAlias.*femimed" /usr/local/directadmin/data/users/admin/httpd.conf
```

### 3. Verificar Ruta del Certificado SSL

```bash
# Ver qué certificado está configurado
grep -A 2 "SSLCertificateFile.*femimed" /usr/local/directadmin/data/users/admin/httpd.conf
```

---

## Posibles Problemas

### Problema 1: ServerName Incorrecto

Si el `ServerName` está configurado como algo diferente a `femimed.codes-labs.com` o `www.femimed.codes-labs.com`, Apache mostrará el error.

**Solución**: Asegurar que el `ServerName` sea uno de los dominios incluidos en el certificado.

### Problema 2: Orden de VirtualHosts

Si hay múltiples VirtualHosts para el mismo puerto/IP, Apache usa el primero que encuentra. Si hay un VirtualHost genérico antes del específico, puede causar problemas.

**Solución**: Verificar el orden de los VirtualHosts.

### Problema 3: Certificado Apuntando a Ruta Incorrecta

Aunque el certificado existe y es correcto, Apache podría estar apuntando a una ruta diferente.

**Solución**: Verificar que `SSLCertificateFile` apunta a:
```
/etc/letsencrypt/live/femimed.codes-labs.com/fullchain.pem
```

---

## Solución Recomendada

### Verificar y Corregir en DirectAdmin

1. **Apache Configuration** → **Custom HTTPD Configurations**
2. Seleccionar dominio: `femimed.codes-labs.com`
3. Verificar el VirtualHost 443 tiene:

```apache
<VirtualHost 69.164.244.24:443>
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/femimed.codes-labs.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/femimed.codes-labs.com/privkey.pem
    
    # IMPORTANTE: ServerName debe ser uno de los dominios del certificado
    ServerName femimed.codes-labs.com
    ServerAlias www.femimed.codes-labs.com
    
    # ... resto de configuración
</VirtualHost>
```

### Si el ServerName está como www.femimed.codes-labs.com

Cambiar a:
```apache
ServerName femimed.codes-labs.com
ServerAlias www.femimed.codes-labs.com
```

O mantener www pero asegurar que el certificado lo incluye (ya lo hace ✅).

---

## Reiniciar Apache Después de Cambios

```bash
# Verificar sintaxis antes de reiniciar
httpd -t

# Si no hay errores, reiniciar
systemctl restart httpd
```

---

## Verificación Post-Corrección

```bash
# 1. Verificar que no hay más errores
tail -20 /var/log/httpd/domains/codes-labs.com.femimed.error.log

# 2. Probar acceso
curl -I https://femimed.codes-labs.com
curl -I https://www.femimed.codes-labs.com

# 3. Verificar desde navegador
# https://femimed.codes-labs.com
# Debe mostrar candado verde sin advertencias
```

---

## Si el Problema Persiste

1. **Verificar orden de VirtualHosts**:
   ```bash
   httpd -S
   # Ver qué VirtualHost se está usando para femimed
   ```

2. **Verificar que no hay conflictos**:
   ```bash
   # Ver si hay múltiples VirtualHosts para el mismo dominio
   grep -c "femimed.codes-labs.com" /usr/local/directadmin/data/users/admin/httpd.conf
   ```

3. **Revisar logs en tiempo real**:
   ```bash
   tail -f /var/log/httpd/domains/codes-labs.com.femimed.error.log
   # Hacer una petición y ver qué error aparece
   ```

