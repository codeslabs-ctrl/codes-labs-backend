# Solución DNS - OrderBox (DNS Externo)

## Problema Identificado

El dominio `codes-labs.com` usa **DNS externo** gestionado por **OrderBox**, no DNS local del servidor.

**Nameservers actuales:**
- tepuynet.mercury.orderbox-dns.com
- tepuynet.mars.orderbox-dns.com
- tepuynet.earth.orderbox-dns.com
- tepuynet.venus.orderbox-dns.com

**Consecuencia**: Los registros agregados en DirectAdmin NO tienen efecto. Debes agregarlos en OrderBox.

---

## Solución: Agregar Registro en OrderBox

### Opción 1: Panel de OrderBox (Si tienes acceso)

1. Acceder al panel de OrderBox/Mumbai
2. Ir a **DNS Management** o **Zone Management**
3. Seleccionar dominio: `codes-labs.com`
4. Agregar nuevo registro:
   - **Tipo**: `A`
   - **Host/Name**: `api`
   - **Value/IP**: `69.164.244.24`
   - **TTL**: `3600` (o por defecto)
5. Guardar

### Opción 2: Contactar al Proveedor de Hosting

Si no tienes acceso directo a OrderBox, contacta a tu proveedor de hosting y solicita:

**Solicitud:**
```
Necesito agregar un registro DNS tipo A para el subdominio api.codes-labs.com

- Dominio: codes-labs.com
- Subdominio: api
- Tipo: A Record
- IP: 69.164.244.24
- TTL: 3600
```

---

## Verificación Después de Agregar

Una vez agregado el registro en OrderBox, espera 5-15 minutos y verifica:

```bash
# Verificar desde Google DNS
dig @8.8.8.8 api.codes-labs.com +short
# Debe mostrar: 69.164.244.24

# Verificar desde Cloudflare DNS
dig @1.1.1.1 api.codes-labs.com +short
# Debe mostrar: 69.164.244.24
```

---

## Alternativa: Cambiar a DNS Local (No Recomendado)

Si prefieres gestionar DNS desde DirectAdmin, necesitarías:

1. Cambiar los nameservers del dominio a los del servidor
2. Esto requiere acceso al registrador del dominio
3. Puede causar problemas si otros servicios dependen del DNS actual

**No recomendado** a menos que tengas una razón específica.

---

## Resumen

✅ **Problema**: DNS gestionado externamente por OrderBox  
✅ **Solución**: Agregar registro A en OrderBox (no en DirectAdmin)  
✅ **Registro necesario**: `api` → `69.164.244.24`  
✅ **Después**: Esperar propagación (5-15 min) y obtener SSL

---

## Información para el Proveedor

Si necesitas contactar al proveedor, proporciona:

```
Solicitud de Registro DNS:

Dominio: codes-labs.com
Subdominio: api.codes-labs.com
Tipo: A Record
IP: 69.164.244.24
TTL: 3600

Propósito: Necesito crear el subdominio api.codes-labs.com 
para el backend de la aplicación. El registro está configurado 
en DirectAdmin pero no tiene efecto porque el DNS está gestionado 
por OrderBox (nameservers: tepuynet.mercury.orderbox-dns.com, etc.)
```

