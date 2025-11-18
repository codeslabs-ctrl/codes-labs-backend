# Esperar Propagación DNS para api.codes-labs.com

## Problema Actual

El error `NXDOMAIN` significa que el registro DNS de `api.codes-labs.com` **aún no existe** o **no se ha propagado**.

```
DNS problem: NXDOMAIN looking up A for api.codes-labs.com
```

## Verificación

### 1. Verificar si el Proveedor ya Agregó el DNS

```bash
# Verificar desde diferentes servidores DNS
dig @8.8.8.8 api.codes-labs.com +short
dig @1.1.1.1 api.codes-labs.com +short
dig @69.10.54.252 api.codes-labs.com +short

# Si alguno muestra 69.164.244.24, el DNS está propagado
# Si todos muestran NXDOMAIN, el proveedor aún no lo agregó
```

### 2. Verificar en DirectAdmin

1. **DNS Management** → `codes-labs.com`
2. Verificar que existe el registro:
   ```
   api.codes-labs.com  A  69.164.244.24
   ```

**Si no existe en DirectAdmin**: El proveedor aún no lo agregó en OrderBox.

## Solución

### Opción 1: Esperar a que el Proveedor Agregue el DNS (Recomendado)

1. **Contactar al proveedor** si aún no lo has hecho
2. **Verificar periódicamente** si el DNS ya está propagado:
   ```bash
   dig api.codes-labs.com +short
   # Cuando muestre: 69.164.244.24, está listo
   ```
3. **Una vez propagado**, generar el certificado:
   ```bash
   certbot certonly --webroot \
     -w /home/admin/domains/api.codes-labs.com.codes-labs.com/public_html \
     -d api.codes-labs.com \
     -d www.api.codes-labs.com
   ```

### Opción 2: Usar Certbot en Modo Standalone (Temporal)

Si necesitas el certificado **ahora mismo** y el DNS está configurado pero aún no propagado:

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

**Nota**: Este método requiere que el DNS esté configurado (aunque no propagado globalmente) y que el servidor pueda resolver su propio dominio.

## Verificación de Propagación DNS

### Script de Verificación

```bash
#!/bin/bash
echo "Verificando propagación DNS de api.codes-labs.com..."
echo ""

# Verificar desde múltiples DNS
for dns in 8.8.8.8 1.1.1.1 69.10.54.252; do
    echo "DNS $dns:"
    result=$(dig @$dns api.codes-labs.com +short)
    if [ -z "$result" ]; then
        echo "  ❌ NXDOMAIN (no resuelve)"
    else
        echo "  ✅ $result"
    fi
    echo ""
done

# Si alguno muestra 69.164.244.24, está propagado
if dig @8.8.8.8 api.codes-labs.com +short | grep -q "69.164.244.24"; then
    echo "✅ DNS está propagado - Puedes generar el certificado SSL"
else
    echo "❌ DNS aún no está propagado - Espera o contacta al proveedor"
fi
```

## Tiempo de Propagación

- **Típico**: 5-15 minutos después de que el proveedor lo agregue
- **Máximo**: Hasta 48 horas (raro)
- **Promedio**: 30 minutos - 2 horas

## Una Vez que el DNS Esté Propagado

```bash
# 1. Verificar que resuelve
dig api.codes-labs.com +short
# Debe mostrar: 69.164.244.24

# 2. Crear directorio .well-known
mkdir -p /home/admin/domains/api.codes-labs.com.codes-labs.com/public_html/.well-known/acme-challenge
chown -R admin:admin /home/admin/domains/api.codes-labs.com.codes-labs.com/public_html/.well-known
chmod -R 755 /home/admin/domains/api.codes-labs.com.codes-labs.com/public_html/.well-known

# 3. Generar certificado
certbot certonly --webroot \
  -w /home/admin/domains/api.codes-labs.com.codes-labs.com/public_html \
  -d api.codes-labs.com \
  -d www.api.codes-labs.com

# 4. Verificar que se generó
certbot certificates | grep api.codes-labs.com

# 5. Reiniciar Apache
systemctl restart httpd

# 6. Probar
curl -I https://api.codes-labs.com/health
```

## Resumen

**Problema**: DNS no propagado (NXDOMAIN)  
**Solución**: Esperar a que el proveedor agregue el registro DNS en OrderBox  
**Tiempo**: 5-15 minutos después de que lo agregue  
**Luego**: Generar certificado SSL con certbot

