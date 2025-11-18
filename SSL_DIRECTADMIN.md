# Configuración SSL en DirectAdmin - api.codes-labs.com

## Opción Recomendada

✅ **"Get automatic certificate from ACME Provider"**

Esta es la opción de Let's Encrypt, que es:
- ✅ Gratuita
- ✅ Automática
- ✅ Se renueva automáticamente
- ✅ Reconocida por todos los navegadores
- ✅ La misma que usas para femimed.codes-labs.com

---

## Pasos para Obtener el Certificado

### 1. Seleccionar la Opción

1. En DirectAdmin: **SSL Certificates**
2. Seleccionar dominio: `api.codes-labs.com`
3. Elegir: **"Get automatic certificate from ACME Provider"**
4. Click en **Save** o **Get Certificate**

### 2. Configuración Automática

DirectAdmin automáticamente:
- Solicitará el certificado a Let's Encrypt
- Validará el dominio
- Instalará el certificado
- Configurará Apache

### 3. Verificar

Después de unos segundos, deberías ver:
- ✅ Certificado instalado
- ✅ Fecha de expiración (90 días, se renueva automáticamente)
- ✅ Estado: "Active" o "Valid"

---

## Otras Opciones (No Recomendadas)

### ❌ "Paste a pre-generated certificate and key"
- Solo si ya tienes un certificado generado manualmente
- No es necesario para Let's Encrypt

### ❌ "Create A Certificate Request"
- Para certificados comerciales (pagados)
- No necesario para Let's Encrypt

### ❌ "Use the best match certificate"
- Usa un certificado existente si hay uno
- Puede no funcionar si no hay certificado previo

### ❌ "Create your own self signed certificate"
- Solo para desarrollo/testing
- Los navegadores mostrarán advertencias de seguridad
- No usar en producción

---

## Verificación Post-Instalación

### 1. Verificar en DirectAdmin
- El certificado debe aparecer como "Active"
- Debe mostrar la fecha de expiración

### 2. Verificar desde Navegador
```
https://api.codes-labs.com/health
```
- Debe mostrar el candado verde 🔒
- Sin advertencias de seguridad

### 3. Verificar desde Terminal
```bash
curl -I https://api.codes-labs.com/health
# Debe responder sin errores SSL
```

---

## Renovación Automática

Let's Encrypt renueva automáticamente los certificados cada 90 días. DirectAdmin generalmente maneja esto automáticamente, pero puedes verificar:

```bash
# Ver certificados instalados
certbot certificates

# Renovar manualmente si es necesario
certbot renew
```

---

## Troubleshooting

### Error: "Domain validation failed"
- Verificar que el DNS apunte correctamente a `69.164.244.24`
- Verificar que el subdominio esté creado correctamente
- Esperar unos minutos para propagación DNS

### Error: "Too many requests"
- Let's Encrypt tiene límite de 5 certificados por semana por dominio
- Esperar o usar certificado existente si es posible

### Certificado no se aplica
- Verificar que Apache esté configurado correctamente
- Reiniciar Apache: `systemctl restart httpd`
- Revisar logs: `/var/log/httpd/domains/codes-labs.com.api.error.log`

---

## Resumen

**Para api.codes-labs.com:**
1. Ir a SSL Certificates
2. Seleccionar `api.codes-labs.com`
3. Elegir: **"Get automatic certificate from ACME Provider"** ✅
4. Click en Save
5. Esperar confirmación
6. Listo! 🎉

