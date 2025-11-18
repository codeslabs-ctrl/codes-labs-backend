# Solución: Problema con femimed.codes-labs.com

## Problema

El subdominio `femimed.codes-labs.com` dejó de funcionar después de crear `api.codes-labs.com`.

## Posibles Causas

1. **DNS**: El registro DNS de `femimed` podría haberse eliminado o modificado
2. **Apache**: La configuración de Apache podría haberse sobrescrito
3. **DirectAdmin**: Al crear un nuevo subdominio, DirectAdmin podría haber modificado configuraciones

---

## Verificaciones

### 1. Verificar DNS (sin el `/` al final)

```bash
# Correcto (sin /)
nslookup femimed.codes-labs.com

# Verificar desde DNS públicos
dig @8.8.8.8 femimed.codes-labs.com +short
dig @1.1.1.1 femimed.codes-labs.com +short
```

**Si muestra NXDOMAIN**: El registro DNS no existe o fue eliminado.

### 2. Verificar en DirectAdmin

1. Ir a **DNS Management**
2. Seleccionar dominio: `codes-labs.com`
3. Verificar que existe el registro:
   ```
   femimed.codes-labs.com  A  69.164.244.24
   ```

**Si no existe**: Agregarlo nuevamente.

### 3. Verificar Configuración Apache

```bash
# Verificar que Apache tiene la configuración de femimed
grep -r "femimed.codes-labs.com" /etc/httpd/conf/
# O
grep -r "femimed" /usr/local/directadmin/data/users/admin/httpd.conf
```

### 4. Verificar Logs de Apache

```bash
tail -50 /var/log/httpd/domains/codes-labs.com.femimed.error.log
```

---

## Soluciones

### Solución 1: Verificar/Agregar Registro DNS

Si el DNS está gestionado por OrderBox (como el dominio principal):

1. **Contactar al proveedor** para verificar/restaurar el registro:
   ```
   femimed.codes-labs.com  A  69.164.244.24
   ```

2. **O agregarlo en DirectAdmin** (si usa DNS local):
   - DNS Management → `codes-labs.com`
   - Agregar registro A: `femimed` → `69.164.244.24`

### Solución 2: Verificar Configuración Apache

La configuración de `femimed.codes-labs.com` debería estar intacta. Verificar que no se haya modificado:

```apache
<VirtualHost 69.164.244.24:443>
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/femimed.codes-labs.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/femimed.codes-labs.com/privkey.pem
    ServerName femimed.codes-labs.com
    # ... resto de configuración
</VirtualHost>
```

### Solución 3: Reiniciar Apache

```bash
systemctl restart httpd
# O
service httpd restart
```

### Solución 4: Verificar que el Subdominio Existe en DirectAdmin

1. Ir a **Subdomain Management**
2. Verificar que `femimed.codes-labs.com` aparece en la lista
3. Si no aparece, podría haberse eliminado accidentalmente

---

## Comandos de Diagnóstico

```bash
# 1. Verificar DNS
dig femimed.codes-labs.com +short
# Debe mostrar: 69.164.244.24

# 2. Verificar que Apache responde
curl -I http://femimed.codes-labs.com
curl -I https://femimed.codes-labs.com

# 3. Verificar configuración Apache
httpd -S 2>&1 | grep femimed

# 4. Verificar certificado SSL
openssl s_client -connect femimed.codes-labs.com:443 -servername femimed.codes-labs.com < /dev/null 2>/dev/null | grep "subject="
```

---

## Si el DNS Fue Eliminado

Si el registro DNS fue eliminado (en OrderBox o DirectAdmin):

1. **Agregarlo nuevamente**:
   - Si es OrderBox: Contactar al proveedor
   - Si es DirectAdmin: Agregar registro A manualmente

2. **Esperar propagación** (5-15 minutos)

3. **Verificar**:
   ```bash
   dig femimed.codes-labs.com +short
   ```

---

## Prevención

Para evitar que esto vuelva a pasar:

1. **Hacer backup** de la configuración Apache antes de cambios
2. **Documentar** todos los subdominios y sus configuraciones
3. **Verificar** que los cambios no afecten otros subdominios

---

## Nota Importante

El error en el comando original tenía un `/` al final:
```bash
nslookup femimed.codes-labs.com/  # ❌ Incorrecto (tiene /)
nslookup femimed.codes-labs.com   # ✅ Correcto
```

Asegúrate de ejecutar el comando sin el `/` al final.

