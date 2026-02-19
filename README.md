# 📡 Sistema Rádio PX Digital - Ratonet (PoC)

Fala, Rato Borrachudo! 🐀

Preparei este protótipo funcional do **Rádio PX Digital** com muita vontade de ajudar na implementação das novas funcionalidades da **Ratonet**. 

A ideia aqui é entregar uma base sólida, já arquitetada e separada, para você não ter que começar do zero. É um sistema de comunicação Push-to-Talk (PTT) via WebSockets projetado para a logística, rodando direto no navegador (celular e PC) com foco total na usabilidade do motorista.

---

## 🚀 Principais Funcionalidades

O rádio opera em três frequências (modos) distintas:
* **📡 PX Local (Por GPS):** Utiliza a API de Geolocalização nativa do aparelho e a *Fórmula de Haversine* no backend. O motorista define um raio (ex: 5km) e o áudio só é entregue para quem estiver fisicamente dentro desse perímetro.
* **👥 Grupos / Comboios:** Sistema de salas (Rooms). Os usuários podem criar ou solicitar entrada em grupos sintonizados. O criador do grupo recebe um pedido e aprova a entrada via modal.
* **🔒 Privado (Ponto a Ponto):** Comunicação direta via ID do motorista. Exige um "aperto de mão" (handshake) inicial: o remetente envia o convite, o destinatário aceita e o canal bidirecional seguro é estabelecido e salvo na Agenda.

---

## 🛠️ Arquitetura e Tecnologias

O projeto foi refatorado e dividido em dois microsserviços para facilitar a manutenção e escalabilidade na Ratonet:

* **`/frontend`**: Desenvolvido em **React + TypeScript** utilizando **Vite**. 
  * Interface responsiva para Web e Mobile.
  * Captura de áudio em tempo real via `MediaRecorder API` (formato `.webm`).
  * Estilização completa utilizando **Tailwind CSS**.
* **`/backend`**: Servidor **Node.js + TypeScript**.
  * Gerenciamento de estado, salas e roteamento de áudio via **Socket.io**.
  * Mantém um mapa em memória (`Map`) de usuários online e coordenadas GPS.

---

## 💻 Como Rodar e Testar Localmente

Para testar a comunicação entre o seu PC (Base) e o seu Celular (Caminhão) aí na sua rede, você precisará rodar os dois serviços simultaneamente:

### 1. Iniciar o Backend
Abra um terminal, acesse a pasta do backend e inicie o servidor Node:

    cd backend
    npm install
    npm run dev

> O servidor iniciará na porta 3000.

### 2. Iniciar o Frontend (Dashboard)
Abra um segundo terminal, acesse a pasta do frontend e inicie o Vite permitindo conexões da rede local (`--host`):

    cd frontend
    npm install
    npm run dev -- --host

> O terminal exibirá dois links. Ex: Local: http://localhost:5173/ e Network: http://192.168.1.15:5173/.

### 3. O Teste no Celular (⚠️ Importante)
Navegadores de celular bloqueiam o acesso ao microfone em conexões `http` que não sejam `localhost`. Como você acessará via IP da rede (ex: `192.168.1.15`), é necessário criar uma exceção de segurança para o teste:
1. No Android (Google Chrome), digite na URL: `chrome://flags`.
2. Busque por: `Insecure origins treated as secure`.
3. Digite o IP e porta do frontend (ex: http://192.168.1.15:5173), marque como **Enabled** e reinicie o navegador.
4. Acesse o IP novamente. O microfone e o GPS serão liberados!

---

## ⚙️ Guia de Integração com a Ratonet (Para Produção)

Mano, este código é um protótipo (PoC). Para plugar isso de vez no ecossistema da Ratonet, a gente precisa alinhar os seguintes pontos:

### 1. Autenticação e API de Usuários
Atualmente, o arquivo `backend/server.ts` gera IDs e nomes aleatórios (ex: Motorista 45) ao se conectar. 

**O que precisa ser feito:** * No frontend, o sistema deve receber o Token de autenticação real gerado pela API da Ratonet e passá-lo na conexão do Socket.
* No backend (`server.ts`, bloco `io.use`), interceptamos esse Token, fazemos a validação no banco de dados e retornamos o ID real, Nome e Placa do veículo.

### 2. Origem do GPS
O sistema atual captura o GPS direto da API do navegador do celular.

**O que precisa ser feito:**
* Avaliar se o rádio continuará usando o GPS do celular ou se o backend do rádio vai bater na API de telemetria da Ratonet para pegar a localização real do caminhão.

### 3. Persistência de Dados (Banco de Dados)
Hoje, os Grupos ativos e a Agenda de Contatos vivem na memória RAM do Node.js (`Map`). Se o servidor reiniciar, os grupos somem.

**O que precisa ser feito:**
* Salvar a estrutura de `Grupos` e a `Agenda` no banco de dados (ex: PostgreSQL).
* Ao conectar no Socket, o backend faz um SELECT e já devolve para o motorista a agenda dele salva e os grupos que ele já faz parte.

### 4. Áudio Base64 / Codecs
Para facilitar o nosso teste, o áudio trafega em `Blob` de formato `.webm` nativo do Chrome.

**O que precisa ser feito:**
* Para evitar BO com iPhone antigo (que às vezes chora pro `.webm`), a gente pode converter os *chunks* de áudio para Opus ou base64 comprimido no futuro.

---
*Feito com ☕ e muita vontade de ver a Ratonet voar! Qualquer dúvida na hora de plugar o backend, é só dar o grito.*
