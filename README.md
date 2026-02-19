# 📡 Sistema Rádio PX Digital (PoC)

Bem-vindo ao protótipo funcional do **Rádio PX Digital**, um sistema de comunicação Push-to-Talk (PTT) via WebSockets projetado para logística e frotas. 

Este projeto permite a comunicação de áudio em tempo real simulando o comportamento de rádios físicos, desenhado para rodar diretamente nos navegadores de celulares e desktops.

## 🚀 Principais Funcionalidades

O rádio opera em três frequências (modos) distintas:
* **📡 PX Local (Por GPS):** Utiliza a API de Geolocalização nativa do aparelho e a *Fórmula de Haversine* no backend. O motorista define um raio (ex: 5km) e o áudio só é entregue para quem estiver fisicamente dentro desse perímetro.
* **👥 Grupos / Comboios:** Sistema de salas (Rooms). Os usuários podem criar ou solicitar entrada em grupos sintonizados. O criador do grupo recebe um pedido e aprova a entrada via modal.
* **🔒 Privado (Ponto a Ponto):** Comunicação direta via ID do motorista. Exige um "aperto de mão" (handshake) inicial: o remetente envia o convite, o destinatário aceita e o canal bidirecional seguro é estabelecido e salvo na Agenda.

---

## 🛠️ Arquitetura e Tecnologias

O projeto foi refatorado e dividido em dois microsserviços para facilitar a manutenção e escalabilidade:

* **`/frontend`**: Desenvolvido em **React + TypeScript** utilizando **Vite**. 
  * Interface responsiva para Web e Mobile focada na usabilidade de motoristas.
  * Captura de áudio em tempo real via `MediaRecorder API` (formato `.webm`).
  * Estilização completa utilizando **Tailwind CSS**.
* **`/backend`**: Servidor **Node.js + TypeScript**.
  * Gerenciamento de estado, salas e roteamento de áudio via **Socket.io**.
  * Mantém um mapa em memória (`Map`) de usuários online e coordenadas GPS.

---

## 💻 Como Rodar e Testar Localmente

Para testar a comunicação entre o seu PC (Base) e o seu Celular (Caminhão), você precisará rodar os dois serviços simultaneamente.

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
4. Acesse o IP novamente. O microfone e o GPS serão liberados.

---

## ⚙️ Guia de Integração (Para Produção)

Este código é um protótipo (PoC). Para integrá-lo ao sistema principal de rastreio da transportadora, as seguintes alterações precisam ser implementadas:

### 1. Autenticação e API de Usuários
Atualmente, o arquivo `backend/server.ts` gera IDs e nomes aleatórios (ex: Motorista 45) ao se conectar. 

**O que precisa ser feito:** * No frontend, o sistema deve receber o Token de autenticação real gerado pela API de login e passá-lo na conexão do Socket.
* No backend (`server.ts`, bloco `io.use`), você deve interceptar esse Token, fazer uma requisição (fetch/axios) para a sua API principal validando o token no banco de dados (ex: PostgreSQL) e retornar o ID real, Nome, Foto e Placa do veículo.
* Somente após a validação do Token o Socket permite a conexão.

### 2. Origem do GPS
O sistema atual captura o GPS direto da API do navegador (`navigator.geolocation`) de forma autônoma.

**O que precisa ser feito:**
* Avaliar se o rádio continuará usando o GPS do celular do motorista ou se o backend do rádio irá consumir a localização em tempo real direto do equipamento de telemetria/rastreio do caminhão via API.

### 3. Persistência de Dados (Banco de Dados)
Hoje, os Grupos ativos e os Contatos Privados autorizados vivem na memória RAM do Node.js (usando `Map`). Se o servidor reiniciar, os grupos somem.

**O que precisa ser feito:**
* Salvar a estrutura de `Grupos` e a relação de `Contatos Permitidos` no banco de dados.
* Ao conectar no Socket, o backend deve fazer um SELECT no banco e já enviar para o frontend (via evento `available-groups` e `my-info`) as listas de quem o motorista já tem na agenda e de quais grupos ele já é membro.

### 4. Áudio Base64 / Codecs
Para facilitar o teste, o áudio trafega em `Blob` de formato `.webm` nativo do Chrome.

**O que precisa ser feito:**
* Para máxima compatibilidade com dispositivos iOS mais antigos (que às vezes limitam o `.webm`), recomenda-se converter os *chunks* de áudio para um formato universal de baixa latência como o **Opus** ou base64 comprimido no futuro.
