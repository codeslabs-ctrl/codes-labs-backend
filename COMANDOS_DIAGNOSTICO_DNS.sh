#!/bin/bash
# Script de diagnóstico DNS para api.codes-labs.com

echo "🔍 Diagnóstico DNS para api.codes-labs.com"
echo "=========================================="
echo ""

# 1. Verificar desde diferentes servidores DNS
echo "1. Verificando desde diferentes servidores DNS:"
echo ""
echo "   Google DNS (8.8.8.8):"
dig @8.8.8.8 api.codes-labs.com +short
echo ""
echo "   Cloudflare DNS (1.1.1.1):"
dig @1.1.1.1 api.codes-labs.com +short
echo ""
echo "   DNS del servidor (69.10.54.252):"
dig @69.10.54.252 api.codes-labs.com +short
echo ""

# 2. Verificar nameservers del dominio
echo "2. Nameservers de codes-labs.com:"
dig codes-labs.com NS +short
echo ""

# 3. Verificar todos los registros A
echo "3. Registros A del dominio:"
echo "   codes-labs.com:"
dig codes-labs.com A +short
echo "   www.codes-labs.com:"
dig www.codes-labs.com A +short
echo "   api.codes-labs.com:"
dig api.codes-labs.com A +short
echo ""

# 4. Verificar servicio DNS local
echo "4. Verificando servicio DNS local:"
if systemctl is-active --quiet named 2>/dev/null || systemctl is-active --quiet bind9 2>/dev/null; then
    echo "   ✅ Servicio DNS local está corriendo"
    systemctl status named 2>/dev/null | head -3 || systemctl status bind9 2>/dev/null | head -3
else
    echo "   ⚠️  Servicio DNS local NO está corriendo (puede ser normal si usas DNS externo)"
fi
echo ""

# 5. Verificar puerto 53
echo "5. Verificando puerto 53 (DNS):"
if netstat -tulpn 2>/dev/null | grep -q ":53 "; then
    echo "   ✅ Puerto 53 está escuchando"
    netstat -tulpn 2>/dev/null | grep ":53 "
else
    echo "   ⚠️  Puerto 53 NO está escuchando (puede ser normal si usas DNS externo)"
fi
echo ""

# 6. Verificar archivos de zona DNS (si existen)
echo "6. Verificando archivos de zona DNS:"
if [ -d "/var/named" ] || [ -d "/etc/bind" ]; then
    echo "   Directorio DNS encontrado"
    if [ -f "/var/named/codes-labs.com.db" ] || [ -f "/etc/bind/db.codes-labs.com" ]; then
        echo "   ✅ Archivo de zona encontrado"
        echo "   Buscando registro 'api':"
        grep -i "api" /var/named/codes-labs.com.db 2>/dev/null || grep -i "api" /etc/bind/db.codes-labs.com 2>/dev/null || echo "   No encontrado en archivos de zona"
    else
        echo "   ⚠️  Archivo de zona no encontrado (puede usar DNS externo)"
    fi
else
    echo "   ⚠️  Directorio DNS no encontrado (probablemente usa DNS externo)"
fi
echo ""

# 7. Resumen y recomendaciones
echo "=========================================="
echo "📋 RESUMEN Y RECOMENDACIONES:"
echo ""

# Verificar si algún DNS público resuelve
if dig @8.8.8.8 api.codes-labs.com +short | grep -q "69.164.244.24"; then
    echo "✅ DNS está propagado (resuelve desde Google DNS)"
    echo "   Puedes intentar obtener el certificado SSL"
elif dig @1.1.1.1 api.codes-labs.com +short | grep -q "69.164.244.24"; then
    echo "✅ DNS está propagado (resuelve desde Cloudflare DNS)"
    echo "   Puedes intentar obtener el certificado SSL"
else
    echo "❌ DNS NO está propagado aún"
    echo ""
    echo "   Posibles causas:"
    echo "   1. El registro se agregó recientemente (esperar 5-15 min más)"
    echo "   2. El dominio usa DNS externo (agregar registro ahí)"
    echo "   3. Los nameservers no apuntan al servidor"
    echo ""
    echo "   Verificar nameservers:"
    dig codes-labs.com NS +short
    echo ""
    echo "   Si los nameservers son externos (ej: ns1.cloudflare.com),"
    echo "   debes agregar el registro A en ese proveedor DNS."
fi

echo ""
echo "=========================================="

