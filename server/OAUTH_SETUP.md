# Configuração OAuth - Mercado Livre

## 📋 Resposta à sua pergunta

**"Se eu pedir pra ele me colocar como admin da conta, daria certo?"**

**❌ NÃO**, adicionar como admin não resolve. O que importa é:

1. **Quem criou a aplicação** no DevCenter
2. **Quem autoriza a aplicação** (faz login e dá permissão)

## ✅ Solução: Authorization Code Flow

Implementei um servidor OAuth completo. Aqui está como usar:

### Passo 1: Configurar Redirect URI

1. Acesse o [DevCenter do ML](https://developers.mercadolivre.com.br/)
2. Vá em "Minhas aplicações" → Sua aplicação → "Editar"
3. Em "URLs de redirecionamento", adicione:
   ```
   http://localhost:3002/oauth/callback
   ```
   (Para produção, use HTTPS)

4. Adicione no arquivo `.env`:
   ```env
   REDIRECT_URI=http://localhost:3002/oauth/callback
   ```

### Passo 2: Iniciar Servidor OAuth

```bash
cd server
npm run oauth
```

O servidor estará em `http://localhost:3002`

### Passo 3: O Vendedor Autoriza

1. Acesse: `http://localhost:3002/oauth/authorize`
2. Você receberá uma URL
3. **O vendedor (RETROPARTS) deve:**
   - Acessar essa URL
   - Fazer login na conta dele do Mercado Livre
   - Autorizar a aplicação
   - Será redirecionado de volta

### Passo 4: Buscar Produtos

Após autorização, use:
```
GET http://localhost:3002/api/products/authorized
```

Este endpoint retorna os produtos do vendedor autorizado!

## 🔄 Alternativa Mais Simples

Se o vendedor preferir, ele pode:

1. Criar a aplicação na conta dele
2. Obter um token manualmente
3. Compartilhar o token com você
4. Você usa esse token no backend

## 📝 Exemplo de Token Manual

O vendedor pode obter um token usando:

```bash
# 1. Gerar URL de autorização
# 2. Autorizar no navegador
# 3. Pegar o código da URL
# 4. Trocar código por token
```

Ou usar ferramentas como Postman/Insomnia para fazer o fluxo OAuth.

## 🎯 Recomendação

**Opção A (Melhor)**: Vendedor cria aplicação na conta dele
- Mais simples
- Ele controla tudo
- Você só usa o token

**Opção B**: Você implementa OAuth completo
- Mais trabalho
- Mas você controla o fluxo
- Funciona para múltiplos vendedores

Qual você prefere implementar?
