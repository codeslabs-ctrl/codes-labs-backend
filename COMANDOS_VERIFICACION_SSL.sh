#!/bin/bash
# Script para verificar y solucionar problemas de SSL/Let's Encrypt

echo "🔍 Verificando configuración para Let's Encrypt..."

# 1. Verificar DNS
echo ""
echo "1. Verificando DNS..."
echo "codes-labs.com:"
dig +short codes-labs.com
echo "api.codes-labs.com:"
dig +short api.codes-labs.com

# 2. Verificar que los directorios .well-known existan
echo ""
echo "2. Verificando directorios .well-known..."

# codes-labs.com
if [ ! -d "/home/admin/domains/codes-labs.com/public_html/.well-known" ]; then
    echo "⚠️  Creando directorio para codes-labs.com..."
    mkdir -p /home/admin/domains/codes-labs.com/public_html/.well-known/acme-challenge
    chown -R admin:admin /home/admin/domains/codes-labs.com/public_html/.well-known
    chmod -R 755 /home/admin/domains/codes-labs.com/public_html/.well-known
    echo "✅ Directorio creado"
else
    echo "✅ Directorio existe para codes-labs.com"
fi

# api.codes-labs.com
if [ ! -d "/home/admin/domains/api.codes-labs.com.codes-labs.com/public_html/.well-known" ]; then
    echo "⚠️  Creando directorio para api.codes-labs.com..."
    mkdir -p /home/admin/domains/api.codes-labs.com.codes-labs.com/public_html/.well-known/acme-challenge
    chown -R admin:admin /home/admin/domains/api.codes-labs.com.codes-labs.com/public_html/.well-known
    chmod -R 755 /home/admin/domains/api.codes-labs.com.codes-labs.com/public_html/.well-known
    echo "✅ Directorio creado"
else
    echo "✅ Directorio existe para api.codes-labs.com"
fi

# 3. Verificar puerto 80
echo ""
echo "3. Verificando puerto 80..."
if netstat -tulpn | grep -q ":80 "; then
    echo "✅ Puerto 80 está escuchando"
else
    echo "❌ Puerto 80 NO está escuchando"
fi

# 4. Verificar firewall
echo ""
echo "4. Verificando firewall..."
if command -v firewall-cmd &> /dev/null; then
    firewall-cmd --list-all | grep -q "http" && echo "✅ HTTP permitido en firewall" || echo "⚠️  HTTP puede estar bloqueado"
elif command -v iptables &> /dev/null; then
    iptables -L -n | grep -q "80" && echo "✅ Regla encontrada para puerto 80" || echo "⚠️  Verificar reglas de iptables"
fi

# 5. Probar acceso HTTP
echo ""
echo "5. Probando acceso HTTP..."
echo "Probando codes-labs.com..."
curl -I http://codes-labs.com/.well-known/test 2>&1 | head -1
echo "Probando api.codes-labs.com..."
curl -I http://api.codes-labs.com/.well-known/test 2>&1 | head -1

echo ""
echo "✅ Verificación completada"
echo ""
echo "📝 Próximos pasos:"
echo "1. Verificar que DNS apunte a 69.164.244.24"
echo "2. Agregar configuración .well-known en VirtualHost 80"
echo "3. Modificar redirección para excluir .well-known"
echo "4. Reiniciar Apache: systemctl restart httpd"
echo "5. Intentar obtener certificado nuevamente"

