# Renovar Certificado SSL con Certbot - femimed.codes-labs.com

## Ventajas de Usar Certbot

✅ **Actualiza automáticamente la configuración de Apache**  
✅ **No necesitas editar archivos manualmente**  
✅ **Mantiene la configuración correcta**  
✅ **Renueva el certificado si es necesario**

---

## Renovar Certificado

### Opción 1: Renovación Automática (Recomendada)

```bash
# Renovar certificado (certbot actualizará Apache automáticamente)
certbot renew --cert-name femimed.codes-labs.com

# O renovar todos los certificados
certbot renew
```

### Opción 2: Renovación Forzada (Si la anterior no funciona)

```bash
# Renovar forzando la renovación
certbot certonly --webroot \
  -w /home/admin/domains/femimed.codes-labs.com/public_html \
  -d femimed.codes-labs.com \
  -d www.femimed.codes-labs.com \
  --force-renewal

# Luego actualizar Apache
certbot renew --cert-name femimed.codes-labs.com
```

### Opción 3: Renovación con Apache Plugin (Actualiza Config Automáticamente)

```bash
# Usar plugin de Apache para actualizar configuración automáticamente
certbot --apache -d femimed.codes-labs.com -d www.femimed.codes-labs.com --force-renewal
```

**Nota**: El plugin `--apache` actualiza automáticamente la configuración de Apache, pero puede no funcionar bien con DirectAdmin.

---

## Verificar Después de Renovar

```bash
# 1. Verificar que el certificado se renovó
certbot certificates | grep femimed

# 2. Verificar sintaxis de Apache
httpd -t

# 3. Reiniciar Apache (si certbot no lo hizo automáticamente)
systemctl restart httpd

# 4. Verificar logs
tail -20 /var/log/httpd/domains/codes-labs.com.femimed.error.log
# No debe mostrar más errores AH01909

# 5. Probar acceso
curl -I https://femimed.codes-labs.com
```

---

## Si Certbot No Actualiza Apache Automáticamente

Si certbot renueva el certificado pero Apache sigue mostrando el error, puedes forzar la recarga:

```bash
# Recargar configuración SSL de Apache
systemctl reload httpd
# O
apachectl graceful
```

---

## Comando Completo Recomendado

```bash
# 1. Renovar certificado
certbot renew --cert-name femimed.codes-labs.com

# 2. Verificar sintaxis
httpd -t

# 3. Reiniciar Apache
systemctl restart httpd

# 4. Verificar que funciona
curl -I https://femimed.codes-labs.com
tail -10 /var/log/httpd/domains/codes-labs.com.femimed.error.log
```

---

## Nota sobre DirectAdmin

Si DirectAdmin regenera la configuración después, puede sobrescribir los cambios de certbot. En ese caso:

1. **Renovar con certbot** primero
2. **Verificar que funciona**
3. **Si DirectAdmin lo sobrescribe**, contactar soporte o configurar DirectAdmin para que no regenere esa sección

---

## Verificación Final

```bash
# Ver certificados instalados
certbot certificates

# Ver detalles del certificado de femimed
certbot certificates | grep -A 10 femimed

# Verificar que Apache está usando el certificado correcto
openssl s_client -connect femimed.codes-labs.com:443 -servername femimed.codes-labs.com < /dev/null 2>/dev/null | grep "subject="
```

