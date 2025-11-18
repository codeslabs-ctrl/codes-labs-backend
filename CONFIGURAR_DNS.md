# Configuración DNS para api.codes-labs.com

## Problema Detectado

```
api.codes-labs.com: NXDOMAIN (no existe en DNS)
codes-labs.com: ✅ Apunta a 69.164.244.24
```

## Solución: Crear Registro DNS

### Paso 1: Acceder a tu Proveedor de DNS

Ve a donde gestionas los DNS de `codes-labs.com` (puede ser):
- Tu proveedor de dominio (GoDaddy, Namecheap, etc.)
- Cloudflare
- DirectAdmin (si gestionas DNS desde ahí)
- Otro panel de DNS

### Paso 2: Crear Registro A para el Subdominio

Agregar un nuevo registro:

**Tipo**: `A`  
**Nombre/Host**: `api` (o `api.codes-labs.com` dependiendo del panel)  
**Valor/IP**: `69.164.244.24`  
**TTL**: `3600` (o el valor por defecto)

### Paso 3: Ejemplos según Panel

#### Si usas Cloudflare:
1. Ir a DNS → Records
2. Click "Add record"
3. Tipo: `A`
4. Name: `api`
5. IPv4 address: `69.164.244.24`
6. Proxy status: DNS only (naranja apagado)
7. Save

#### Si usas GoDaddy/Namecheap:
1. Ir a DNS Management
2. Agregar nuevo registro
3. Tipo: `A Record`
4. Host: `api`
5. Points to: `69.164.244.24`
6. TTL: `1 Hour`
7. Save

#### Si usas DirectAdmin para DNS:
1. Ir a **DNS Management**
2. Seleccionar dominio: `codes-labs.com`
3. Agregar registro:
   - **Name**: `api`
   - **Type**: `A`
   - **Value**: `69.164.244.24`
   - **TTL**: `3600`
4. Save

### Paso 4: Verificar Propagación DNS

Después de crear el registro, verificar:

```bash
# Esperar unos minutos (propagación DNS)
nslookup api.codes-labs.com

# Debe mostrar:
# Name: api.codes-labs.com
# Address: 69.164.244.24
```

**Tiempo de propagación**: 
- Generalmente: 5-15 minutos
- Máximo: hasta 48 horas (raro)

### Paso 5: Verificar desde Múltiples Ubicaciones

```bash
# Desde el servidor
nslookup api.codes-labs.com

# Desde tu máquina local
nslookup api.codes-labs.com 8.8.8.8

# Usando dig
dig api.codes-labs.com +short
# Debe mostrar: 69.164.244.24
```

### Paso 6: Una vez Propagado, Obtener SSL

Cuando el DNS esté propagado:

1. Verificar que responde:
   ```bash
   curl -I http://api.codes-labs.com
   # Debe responder (aunque sea error, significa que DNS funciona)
   ```

2. Intentar obtener certificado nuevamente en DirectAdmin:
   - SSL Certificates
   - Seleccionar `api.codes-labs.com`
   - "Get automatic certificate from ACME Provider"
   - Save

---

## Verificación Rápida

### Comando para verificar DNS:

```bash
# Verificar DNS
dig api.codes-labs.com +short
# Debe mostrar: 69.164.244.24

# Si muestra ";; connection timed out" o no responde, el DNS aún no está propagado
```

### Verificar que Apache puede servir el dominio:

```bash
# Probar acceso HTTP
curl -I http://api.codes-labs.com/.well-known/test
# Debe responder (aunque sea 404, significa que Apache responde)
```

---

## Resumen

**Problema**: `api.codes-labs.com` no existe en DNS  
**Solución**: Crear registro A: `api` → `69.164.244.24`  
**Después**: Esperar propagación (5-15 min)  
**Luego**: Obtener certificado SSL en DirectAdmin

---

## Nota Importante

No puedes obtener un certificado SSL para un dominio que no existe en DNS. Let's Encrypt necesita poder resolver el dominio para validarlo.

