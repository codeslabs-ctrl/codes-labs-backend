#!/bin/bash
# Script para verificar configuración Apache de femimed.codes-labs.com

echo "🔍 Verificando configuración Apache para femimed.codes-labs.com"
echo "================================================================"
echo ""

# 1. Ver VirtualHosts de femimed
echo "1. VirtualHosts de femimed:"
httpd -S 2>&1 | grep femimed
echo ""

# 2. Ver configuración del VirtualHost 443
echo "2. Configuración del VirtualHost 443:"
grep -A 30 "femimed.codes-labs.com" /usr/local/directadmin/data/users/admin/httpd.conf | grep -A 30 ":443" | head -40
echo ""

# 3. Ver ServerName y ServerAlias
echo "3. ServerName y ServerAlias:"
grep -A 3 "ServerName.*femimed\|ServerAlias.*femimed" /usr/local/directadmin/data/users/admin/httpd.conf
echo ""

# 4. Ver ruta del certificado SSL
echo "4. Ruta del certificado SSL configurado:"
grep -A 2 "SSLCertificateFile.*femimed\|SSLCertificateFile" /usr/local/directadmin/data/users/admin/httpd.conf | grep -A 2 "femimed"
echo ""

# 5. Verificar que el certificado existe
echo "5. Verificar certificado:"
if [ -f "/etc/letsencrypt/live/femimed.codes-labs.com/fullchain.pem" ]; then
    echo "   ✅ Certificado existe"
    openssl x509 -in /etc/letsencrypt/live/femimed.codes-labs.com/fullchain.pem -text -noout | grep -E "(Subject:|DNS:)" | head -3
else
    echo "   ❌ Certificado NO existe"
fi
echo ""

# 6. Verificar sintaxis de Apache
echo "6. Verificar sintaxis de Apache:"
httpd -t 2>&1
echo ""

echo "================================================================"
echo "📋 RESUMEN:"
echo ""
echo "Si el ServerName es 'www.femimed.codes-labs.com', debería ser 'femimed.codes-labs.com'"
echo "El ServerAlias puede ser 'www.femimed.codes-labs.com'"
echo ""

