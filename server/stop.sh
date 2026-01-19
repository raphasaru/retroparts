#!/bin/bash
# Script para parar o servidor na porta 3001

echo "🛑 Parando servidor na porta 3001..."

PIDS=$(lsof -ti:3001)

if [ -z "$PIDS" ]; then
  echo "✅ Nenhum processo rodando na porta 3001"
else
  echo "🔍 Encontrados processos: $PIDS"
  kill -9 $PIDS 2>/dev/null
  echo "✅ Processos encerrados"
fi
