# Troubleshooting DNS - api.codes-labs.com

## Verificaciones Antes de Contactar al Proveedor

### 1. Verificar desde Diferentes Servidores DNS

El servidor local puede estar usando un DNS cacheado. Prueba con DNS públicos:

```bash
# Usar Google DNS
nslookup api.codes-labs.com 8.8.8.8

# Usar Cloudflare DNS
nslookup api.codes-labs.com 1.1.1.1

# Usar dig con servidor específico
dig @8.8.8.8 api.codes-labs.com +short
```

### 2. Verificar que el Registro se Guardó Correctamente en DirectAdmin

1. En DirectAdmin: **DNS Management**
2. Seleccionar dominio: `codes-labs.com`
3. Verificar que existe el registro:
   ```
   api.codes-labs.com  A  69.164.244.24
   ```
4. Si no aparece, crearlo nuevamente
5. Si aparece, verificar que no haya errores de sintaxis

### 3. Verificar Configuración DNS en DirectAdmin

En DirectAdmin:
1. **DNS Administration** → **DNS Settings**
2. Verificar:
   - ¿Está usando DNS local o externo?
   - ¿Hay algún servidor DNS externo configurado?
   - ¿El dominio está delegado correctamente?

### 4. Verificar Delegación DNS del Dominio

El dominio `codes-labs.com` debe estar delegado a los nameservers correctos:

```bash
# Verificar nameservers del dominio
dig codes-labs.com NS +short

# Verificar si los nameservers son del servidor o externos
```

### 5. Probar con www (para comparar)

```bash
# Verificar que www funciona
nslookup www.codes-labs.com

# Comparar con api
nslookup api.codes-labs.com
```

---

## Posibles Causas

### Causa 1: DNS Externo (No Local)

Si DirectAdmin está usando DNS externo (como Cloudflare, GoDaddy DNS, etc.), el registro en DirectAdmin puede no tener efecto. Necesitas agregar el registro en el proveedor DNS externo.

**Solución**: Agregar el registro A en el proveedor DNS externo (Cloudflare, GoDaddy, etc.)

### Causa 2: Nameservers Externos

Si `codes-labs.com` usa nameservers externos, los registros en DirectAdmin no se publican.

**Verificar**:
```bash
dig codes-labs.com NS +short
```

Si muestra nameservers externos (como ns1.cloudflare.com), debes agregar el registro ahí.

### Causa 3: TTL Muy Alto o Cache

El DNS puede estar cacheado. Esperar más tiempo o limpiar cache.

**Solución**: Esperar hasta 48 horas (aunque generalmente es 5-15 minutos)

### Causa 4: Error en el Nombre del Registro

Verificar que el registro se llamó exactamente `api` (no `api.codes-labs.com` completo).

---

## Soluciones Según el Caso

### Si usas DNS Externo (Cloudflare, GoDaddy, etc.)

**NO uses DirectAdmin DNS**, agrega el registro directamente en tu proveedor:

1. **Cloudflare**:
   - DNS → Records
   - Add record: `A`, Name: `api`, Content: `69.164.244.24`

2. **GoDaddy/Namecheap**:
   - DNS Management
   - Add: `A Record`, Host: `api`, Points to: `69.164.244.24`

### Si usas DNS Local de DirectAdmin

1. Verificar que el registro esté guardado
2. Verificar que el servicio DNS esté corriendo:
   ```bash
   systemctl status named
   # O
   systemctl status bind9
   ```
3. Reiniciar servicio DNS si es necesario:
   ```bash
   systemctl restart named
   ```

---

## Comandos de Diagnóstico

```bash
# 1. Verificar desde múltiples DNS
dig @8.8.8.8 api.codes-labs.com +short
dig @1.1.1.1 api.codes-labs.com +short
dig @69.10.54.252 api.codes-labs.com +short

# 2. Verificar nameservers del dominio
dig codes-labs.com NS +short

# 3. Verificar todos los registros A del dominio
dig codes-labs.com A +short
dig api.codes-labs.com A +short

# 4. Verificar si hay servidor DNS local corriendo
systemctl status named
netstat -tulpn | grep :53
```

---

## ¿Cuándo Contactar al Proveedor?

Contacta al proveedor de hosting si:

1. ✅ Verificaste con múltiples DNS públicos y ninguno resuelve
2. ✅ El registro está correctamente configurado en DirectAdmin
3. ✅ Esperaste más de 1 hora
4. ✅ Los nameservers apuntan al servidor (no son externos)
5. ✅ El servicio DNS local está corriendo

**Información para el proveedor:**
- Dominio: `codes-labs.com`
- Subdominio a crear: `api.codes-labs.com`
- IP: `69.164.244.24`
- Tipo: Registro A
- Ya está configurado en DirectAdmin pero no se propaga

---

## Alternativa: Usar Certbot Manualmente (Standalone)

Si el DNS tarda mucho, puedes obtener el certificado usando el método standalone (requiere detener Apache temporalmente):

```bash
# Detener Apache
systemctl stop httpd

# Obtener certificado
certbot certonly --standalone -d api.codes-labs.com -d www.api.codes-labs.com

# Reiniciar Apache
systemctl start httpd

# Luego configurar Apache para usar el certificado
```

**Nota**: Este método no requiere validación HTTP, solo que el dominio resuelva.

