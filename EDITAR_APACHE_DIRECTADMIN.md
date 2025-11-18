# Editar Configuración Apache en DirectAdmin

## Opciones para Editar Apache

### Opción 1: Editar Archivo Directamente (Recomendado)

DirectAdmin guarda las configuraciones en:

```bash
# Archivo principal de configuración del usuario
/usr/local/directadmin/data/users/admin/httpd.conf

# O archivos de configuración por dominio
/usr/local/directadmin/data/users/admin/domains/femimed.codes-labs.com.conf
```

**Pasos**:

1. **Hacer backup primero**:
   ```bash
   cp /usr/local/directadmin/data/users/admin/httpd.conf /usr/local/directadmin/data/users/admin/httpd.conf.backup
   ```

2. **Editar el archivo**:
   ```bash
   nano /usr/local/directadmin/data/users/admin/httpd.conf
   # O
   vi /usr/local/directadmin/data/users/admin/httpd.conf
   ```

3. **Buscar el VirtualHost de femimed** (puerto 443):
   ```bash
   # Buscar la sección
   /femimed.codes-labs.com
   # Buscar puerto 443
   /:443
   ```

4. **Verificar/Corregir**:
   ```apache
   <VirtualHost 69.164.244.24:443>
       SSLEngine on
       SSLCertificateFile /etc/letsencrypt/live/femimed.codes-labs.com/fullchain.pem
       SSLCertificateKeyFile /etc/letsencrypt/live/femimed.codes-labs.com/privkey.pem
       
       # Asegurar que ServerName sea femimed.codes-labs.com (sin www)
       ServerName femimed.codes-labs.com
       ServerAlias www.femimed.codes-labs.com
       
       # ... resto de configuración
   </VirtualHost>
   ```

5. **Verificar sintaxis**:
   ```bash
   httpd -t
   ```

6. **Reiniciar Apache**:
   ```bash
   systemctl restart httpd
   ```

### Opción 2: Usar DirectAdmin File Manager

1. En DirectAdmin: **File Manager**
2. Navegar a: `/usr/local/directadmin/data/users/admin/`
3. Editar: `httpd.conf`
4. Buscar y corregir la configuración de femimed
5. Guardar

### Opción 3: Regenerar Configuración desde DirectAdmin

1. **Domain Setup** → Seleccionar `femimed.codes-labs.com`
2. **Modify** o **Edit**
3. Verificar configuración SSL
4. **Save**

DirectAdmin regenerará la configuración automáticamente.

### Opción 4: Usar SSH y Editor de Texto

```bash
# Conectar por SSH
ssh root@69.164.244.24

# Editar configuración
nano /usr/local/directadmin/data/users/admin/httpd.conf

# Buscar femimed (Ctrl+W en nano)
# Editar ServerName si es necesario
# Guardar (Ctrl+O, Enter, Ctrl+X)

# Verificar sintaxis
httpd -t

# Reiniciar Apache
systemctl restart httpd
```

---

## Comandos Útiles para Encontrar la Configuración

```bash
# 1. Ver dónde está la configuración de femimed
grep -r "femimed.codes-labs.com" /usr/local/directadmin/data/users/admin/

# 2. Ver el VirtualHost completo
grep -A 30 "femimed.codes-labs.com" /usr/local/directadmin/data/users/admin/httpd.conf | grep -A 30 ":443"

# 3. Ver solo ServerName y ServerAlias
grep -A 5 "ServerName.*femimed\|ServerAlias.*femimed" /usr/local/directadmin/data/users/admin/httpd.conf
```

---

## Qué Buscar y Corregir

### Configuración Correcta del VirtualHost 443:

```apache
<VirtualHost 69.164.244.24:443>
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/femimed.codes-labs.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/femimed.codes-labs.com/privkey.pem
    
    # IMPORTANTE: ServerName debe ser femimed.codes-labs.com (sin www)
    ServerName femimed.codes-labs.com
    ServerAlias www.femimed.codes-labs.com
    
    ServerAdmin webmaster@codes-labs.com
    DocumentRoot "/home/admin/domains/femimed.codes-labs.com/public_html"
    
    # ... resto de configuración (proxy, etc.)
</VirtualHost>
```

### Si el ServerName está como www.femimed.codes-labs.com:

**Cambiar a**:
```apache
ServerName femimed.codes-labs.com
ServerAlias www.femimed.codes-labs.com
```

---

## Nota Importante

Después de editar manualmente, DirectAdmin puede sobrescribir los cambios si modificas algo desde el panel. Para evitar esto:

1. **Hacer cambios desde DirectAdmin** cuando sea posible
2. **O documentar los cambios** para reaplicarlos si es necesario
3. **O usar archivos de configuración personalizados** si DirectAdmin lo permite

---

## Verificación Post-Edición

```bash
# 1. Verificar sintaxis
httpd -t
# Debe mostrar: Syntax OK

# 2. Reiniciar Apache
systemctl restart httpd

# 3. Verificar logs
tail -20 /var/log/httpd/domains/codes-labs.com.femimed.error.log
# No debe mostrar más errores AH01909

# 4. Probar acceso
curl -I https://femimed.codes-labs.com
```

