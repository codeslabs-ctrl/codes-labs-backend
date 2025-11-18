# Generar Certificado SSL para api.codes-labs.com con Certbot

## Comando para Generar Certificado

### Opción 1: Usando webroot (Recomendado)

```bash
# Generar certificado para api.codes-labs.com
certbot certonly --webroot \
  -w /home/admin/domains/api.codes-labs.com.codes-labs.com/public_html \
  -d api.codes-labs.com \
  -d www.api.codes-labs.com
```

### Opción 2: Si el DNS aún no está propagado (Standalone)

```bash
# Detener Apache temporalmente
systemctl stop httpd

# Generar certificado en modo standalone
certbot certonly --standalone \
  -d api.codes-labs.com \
  -d www.api.codes-labs.com

# Reiniciar Apache
systemctl start httpd
```

### Opción 3: Desde DirectAdmin

1. **SSL Certificates**
2. Seleccionar dominio: `api.codes-labs.com`
3. Elegir: **"Get automatic certificate from ACME Provider"**
4. Guardar

---

## Verificar que el Certificado se Generó

```bash
# Ver certificados instalados
certbot certificates

# Verificar que el certificado existe
ls -la /etc/letsencrypt/live/api.codes-labs.com/

# Debe mostrar:
# - fullchain.pem
# - privkey.pem
# - cert.pem
# - chain.pem
```

---

## Verificar que Apache Puede Leer el Certificado

```bash
# Verificar permisos
ls -la /etc/letsencrypt/live/api.codes-labs.com/fullchain.pem
ls -la /etc/letsencrypt/live/api.codes-labs.com/privkey.pem

# Debe ser legible por Apache (generalmente root:root o apache:apache)
```

---

## Después de Generar el Certificado

1. **Verificar que la configuración Apache está correcta** (ya está en `httpd.conf.final`)

2. **Reiniciar Apache**:
   ```bash
   httpd -t  # Verificar sintaxis primero
   systemctl restart httpd
   ```

3. **Verificar que funciona**:
   ```bash
   # Ver logs
   tail -20 /var/log/httpd/domains/codes-labs.com.api.error.log
   
   # Probar acceso
   curl -I https://api.codes-labs.com/health
   ```

---

## Si Hay Problemas

### Error: "Domain validation failed"

- Verificar que el DNS está propagado:
  ```bash
  dig api.codes-labs.com +short
  # Debe mostrar: 69.164.244.24
  ```

- Verificar que `.well-known` es accesible:
  ```bash
  # Crear directorio si no existe
  mkdir -p /home/admin/domains/api.codes-labs.com.codes-labs.com/public_html/.well-known/acme-challenge
  chown -R admin:admin /home/admin/domains/api.codes-labs.com.codes-labs.com/public_html/.well-known
  chmod -R 755 /home/admin/domains/api.codes-labs.com.codes-labs.com/public_html/.well-known
  ```

### Error: "Too many requests"

- Let's Encrypt tiene límite de 5 certificados por semana por dominio
- Esperar o usar certificado existente si es posible

---

## Comando Completo Recomendado

```bash
# 1. Crear directorio .well-known si no existe
mkdir -p /home/admin/domains/api.codes-labs.com.codes-labs.com/public_html/.well-known/acme-challenge
chown -R admin:admin /home/admin/domains/api.codes-labs.com.codes-labs.com/public_html/.well-known
chmod -R 755 /home/admin/domains/api.codes-labs.com.codes-labs.com/public_html/.well-known

# 2. Verificar DNS
dig api.codes-labs.com +short
# Debe mostrar: 69.164.244.24

# 3. Generar certificado
certbot certonly --webroot \
  -w /home/admin/domains/api.codes-labs.com.codes-labs.com/public_html \
  -d api.codes-labs.com \
  -d www.api.codes-labs.com

# 4. Verificar que se generó
certbot certificates | grep api.codes-labs.com

# 5. Verificar sintaxis Apache
httpd -t

# 6. Reiniciar Apache
systemctl restart httpd

# 7. Probar
curl -I https://api.codes-labs.com/health
```

---

## Nota Importante

Si el DNS aún no está propagado (el proveedor aún no ha agregado el registro), certbot fallará con "Domain validation failed". En ese caso:

1. **Esperar** a que el proveedor agregue el DNS
2. **Verificar** que el DNS está propagado
3. **Luego** generar el certificado

Pero si el DNS ya está propagado, certbot debería funcionar perfectamente.

