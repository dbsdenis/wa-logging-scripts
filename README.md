
---
---
# WhatsApp Web Logger

## Visão Geral

O WhatsApp Web Logger é uma ferramenta de desenvolvimento que intercepta e exibe no console do navegador diferentes tipos de comunicação e eventos que ocorrem no WhatsApp Web. Este script é útil para debug, análise de protocolos ou desenvolvimento de extensões.

## Instalação

Existem duas maneiras de instalar o WhatsApp Web Logger:

### Método 1: Snippet do Console

1. Abra o WhatsApp Web em seu navegador (`https://web.whatsapp.com`)
2. Abra as Ferramentas de Desenvolvedor (F12 ou Ctrl+Shift+I / Cmd+Option+I)
3. Vá para a aba "Console"
4. Cole o código do script e pressione Enter

### Método 2: Extensão do Navegador

1. Crie uma nova extensão com um arquivo `content_script.js` contendo o código fornecido
2. No arquivo `manifest.json`, configure para que o script seja injetado em `https://web.whatsapp.com/*`
3. Carregue a extensão no modo de desenvolvedor do navegador

## Funcionalidades

O script monitora seis aspectos diferentes da comunicação do WhatsApp Web:

| Tipo | Descrição | Cor |
|------|-----------|-----|
| **App State** | Mutações do estado da aplicação | Magenta |
| **Logs** | Logs internos do WhatsApp | Vermelho |
| **Received** | Stanzas (pacotes XML) recebidas do servidor | Vermelho |
| **Sent** | Stanzas enviadas para o servidor | Verde |
| **Decode** | Mensagens decodificadas do formato Protobuf | Amarelo |
| **Encode** | Mensagens codificadas para o formato Protobuf | Amarelo |

## Configuração

O script possui um objeto de configuração que permite habilitar/desabilitar logs específicos:

```javascript
// Visualizar configuração atual
console.log(window.WALogger.getStatus());

// Desabilitar todos os logs
window.WALogger.setEnabled(false);

// Habilitar todos os logs
window.WALogger.setEnabled(true);

// Desabilitar um tipo específico de log
window.WALogger.setLogType('appState', false);

// Habilitar um tipo específico de log
window.WALogger.setLogType('sent', true);
```

## Uso Prático

### Capturando envio de mensagens

Para monitorar o envio de mensagens:

1. Abra o console do navegador
2. Desative todos os logs, exceto os de mensagens enviadas:
   ```javascript
   window.WALogger.setEnabled(true);
   window.WALogger.setLogType('appState', false);
   window.WALogger.setLogType('logs', false);
   window.WALogger.setLogType('received', false);
   window.WALogger.setLogType('decode', false);
   window.WALogger.setLogType('sent', true);
   window.WALogger.setLogType('encode', true);
   ```
3. Envie uma mensagem no WhatsApp Web
4. Observe os logs no console

### Monitorando mudanças de estado

Para detectar mudanças de estado (como marcação de leitura, status online, etc):

1. Ative apenas os logs de estado:
   ```javascript
   window.WALogger.setEnabled(true);
   window.WALogger.setLogType('appState', true);
   window.WALogger.setLogType('logs', false);
   window.WALogger.setLogType('received', false);
   window.WALogger.setLogType('decode', false);
   window.WALogger.setLogType('sent', false);
   window.WALogger.setLogType('encode', false);
   ```
2. Realize ações no WhatsApp Web (abrir conversas, marcar mensagens como lidas, etc)
3. Observe as mutações de estado no console

## Solução de Problemas

| Problema | Solução |
|----------|---------|
| Script não funciona após atualização do WhatsApp Web | O WhatsApp Web pode mudar os nomes dos módulos. Verifique se os nomes dos módulos no script ainda são válidos. |
| Erros no console | Verifique se todos os módulos estão sendo carregados corretamente. A mensagem de erro específica indicará qual módulo falhou. |
| Desempenho lento | Desative os tipos de log que não são necessários para sua análise atual. |

## Observações

* Este script é apenas para fins educacionais e de desenvolvimento.
* O uso deste script pode violar os Termos de Serviço do WhatsApp.
* Não utilize para extrair dados de usuários ou para qualquer atividade maliciosa.
* O script pode parar de funcionar a qualquer momento devido a atualizações no WhatsApp Web.

## Estrutura do Código

O script está organizado em módulos independentes, cada um responsável por um tipo específico de interceptação:

1. **Configuração** - Definições centralizadas para controle dos logs
2. **Logger** - Função central para exibição formatada de mensagens
3. **Interceptor** - Função genérica para substituir funções originais
4. **Módulos de Log** - Um para cada tipo de dado interceptado
5. **API Global** - Interface para controle em tempo de execução

## Exemplos de Análise

### Exemplo 1: Verificar estrutura de uma mensagem

```javascript
// Ativar apenas logs de mensagens
window.WALogger.setLogType('encode', true);
window.WALogger.setLogType('decode', true);

// Enviar uma mensagem e analisar a estrutura no console
```

### Exemplo 2: Monitorar conexão com servidor

```javascript
// Ativar logs de comunicação com servidor
window.WALogger.setLogType('sent', true);
window.WALogger.setLogType('received', true);

// Observar tráfego de rede no console
```

---
---

# Guia Detalhado: WhatsApp Web Logger como Extensão de Navegador

## Introdução

Este guia detalha o processo completo de implementação do WhatsApp Web Logger como uma extensão de navegador. Este método é mais conveniente do que usar o console, pois:

- Carrega automaticamente o script sempre que você abrir o WhatsApp Web
- Não requer inserção manual do código a cada sessão
- Persistirá mesmo após atualizações da página ou reinicializações do navegador

## Pré-requisitos

- Conhecimento básico de desenvolvimento web
- Editor de código (VS Code, Sublime Text, etc.)
- Google Chrome, Mozilla Firefox, ou outro navegador compatível com extensões baseadas em WebExtensions

## Estrutura de Arquivos

Crie uma pasta para seu projeto com a seguinte estrutura:

```
whatsapp-web-logger/
│
├── manifest.json              # Arquivo de configuração da extensão
├── background.js              # Script de fundo (opcional)
├── content_script.js          # Script de conteúdo (nosso logger)
├── icons/                     # Pasta para ícones
│   ├── icon16.png             # Ícone 16x16
│   ├── icon48.png             # Ícone 48x48
│   └── icon128.png            # Ícone 128x128
└── popup/                     # Interface do usuário (opcional)
    ├── popup.html
    ├── popup.css
    └── popup.js
```

## Passo 1: Configurar o manifest.json

O `manifest.json` é o arquivo que define as configurações e permissões da extensão:

```json
{
  "manifest_version": 3,
  "name": "WhatsApp Web Logger",
  "version": "1.0.0",
  "description": "Ferramenta para interceptar e registrar comunicações do WhatsApp Web",
  "author": "Seu Nome",
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "action": {
    "default_popup": "popup/popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "content_scripts": [
    {
      "matches": ["https://web.whatsapp.com/*"],
      "js": ["content_script.js"],
      "run_at": "document_idle"
    }
  ],
  "permissions": [
    "storage"
  ],
  "host_permissions": [
    "https://web.whatsapp.com/*"
  ]
}
```

### Explicação dos campos principais:

- **manifest_version**: Use 3 para Chrome moderno, 2 para Firefox e versões anteriores do Chrome
- **matches**: URLs onde o script será injetado
- **run_at**: Quando o script será executado (document_idle garante que a página já está carregada)
- **permissions**: Permissões necessárias para a extensão funcionar
- **host_permissions**: Domínios que a extensão pode acessar

## Passo 2: Criar o Content Script

O `content_script.js` conterá o código do WhatsApp Web Logger. Copie todo o código do script unificado para este arquivo.

> **Importante**: Para uma extensão, é recomendável fazer algumas adaptações:

1. Adicione uma verificação para garantir que o script só seja executado quando todos os módulos do WhatsApp Web estiverem carregados:

```javascript
// No início do script
function checkWAModulesLoaded() {
  try {
    return (
      typeof require !== 'undefined' &&
      require("WAWebSyncdRequestBuilderBuild") &&
      require("WALogger") &&
      require("WAWap") &&
      require("decodeProtobuf") &&
      require("WAWebSendMsgCommonApi")
    );
  } catch (e) {
    return false;
  }
}

// Esperar até que os módulos estejam carregados
function waitForWAModules(callback, maxAttempts = 30) {
  let attempts = 0;
  const interval = setInterval(() => {
    attempts++;
    if (checkWAModulesLoaded()) {
      clearInterval(interval);
      console.log("WhatsApp Web modules loaded. Initializing logger...");
      callback();
    } else if (attempts >= maxAttempts) {
      clearInterval(interval);
      console.error("Failed to load WhatsApp Web modules after multiple attempts");
    }
  }, 1000);
}

// Iniciar após garantir que os módulos estão carregados
waitForWAModules(() => {
  // Todo o código principal do script aqui
});
```

## Passo 3: Criar um Popup (Opcional)

Para melhorar a usabilidade, você pode criar uma interface para controlar os logs:

### popup.html
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="popup.css">
  <title>WhatsApp Web Logger</title>
</head>
<body>
  <div class="container">
    <h2>WhatsApp Web Logger</h2>
    
    <div class="toggle-container">
      <label class="switch">
        <input type="checkbox" id="main-toggle" checked>
        <span class="slider round"></span>
      </label>
      <span>Habilitar Todos os Logs</span>
    </div>
    
    <div class="divider"></div>
    
    <h3>Tipos de Log</h3>
    
    <div class="log-types">
      <div class="log-type">
        <label class="switch">
          <input type="checkbox" id="appState" checked>
          <span class="slider round"></span>
        </label>
        <span>App State</span>
      </div>
      
      <div class="log-type">
        <label class="switch">
          <input type="checkbox" id="logs" checked>
          <span class="slider round"></span>
        </label>
        <span>Logs</span>
      </div>
      
      <div class="log-type">
        <label class="switch">
          <input type="checkbox" id="received" checked>
          <span class="slider round"></span>
        </label>
        <span>Received</span>
      </div>
      
      <div class="log-type">
        <label class="switch">
          <input type="checkbox" id="sent" checked>
          <span class="slider round"></span>
        </label>
        <span>Sent</span>
      </div>
      
      <div class="log-type">
        <label class="switch">
          <input type="checkbox" id="decode" checked>
          <span class="slider round"></span>
        </label>
        <span>Decode</span>
      </div>
      
      <div class="log-type">
        <label class="switch">
          <input type="checkbox" id="encode" checked>
          <span class="slider round"></span>
        </label>
        <span>Encode</span>
      </div>
    </div>
    
    <div class="divider"></div>
    
    <div class="footer">
      <button id="save-btn">Salvar Configurações</button>
    </div>
  </div>
  <script src="popup.js"></script>
</body>
</html>
```

### popup.css
```css
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
  width: 300px;
}

.container {
  padding: 15px;
}

h2 {
  margin-top: 0;
  color: #128C7E; /* Cor do WhatsApp */
  text-align: center;
}

h3 {
  margin-bottom: 10px;
  color: #555;
}

.divider {
  border-top: 1px solid #eee;
  margin: 15px 0;
}

.toggle-container {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.log-types {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.log-type {
  display: flex;
  align-items: center;
}

.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  margin-right: 10px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
}

input:checked + .slider {
  background-color: #128C7E;
}

input:focus + .slider {
  box-shadow: 0 0 1px #128C7E;
}

input:checked + .slider:before {
  transform: translateX(20px);
}

.slider.round {
  border-radius: 24px;
}

.slider.round:before {
  border-radius: 50%;
}

.footer {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

button {
  background-color: #128C7E;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

button:hover {
  background-color: #0C695D;
}
```

### popup.js
```javascript
// Carregar configurações salvas
document.addEventListener('DOMContentLoaded', function() {
  // Carregar configurações do storage
  chrome.storage.local.get(['waLoggerConfig'], function(result) {
    const config = result.waLoggerConfig || {
      enabled: true,
      logTypes: {
        appState: true,
        logs: true,
        received: true,
        sent: true,
        decode: true,
        encode: true
      }
    };
    
    // Atualizar UI com as configurações
    document.getElementById('main-toggle').checked = config.enabled;
    
    for (const type in config.logTypes) {
      if (config.logTypes.hasOwnProperty(type)) {
        const checkbox = document.getElementById(type);
        if (checkbox) {
          checkbox.checked = config.logTypes[type];
        }
      }
    }
  });
  
  // Salvar configurações
  document.getElementById('save-btn').addEventListener('click', function() {
    const enabled = document.getElementById('main-toggle').checked;
    
    const logTypes = {
      appState: document.getElementById('appState').checked,
      logs: document.getElementById('logs').checked,
      received: document.getElementById('received').checked,
      sent: document.getElementById('sent').checked,
      decode: document.getElementById('decode').checked,
      encode: document.getElementById('encode').checked
    };
    
    // Salvar no storage
    chrome.storage.local.set({
      waLoggerConfig: {
        enabled: enabled,
        logTypes: logTypes
      }
    }, function() {
      // Enviar configurações para a página
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'updateLoggerConfig',
          config: {
            enabled: enabled,
            logTypes: logTypes
          }
        });
      });
      
      // Feedback de sucesso
      const saveBtn = document.getElementById('save-btn');
      const originalText = saveBtn.textContent;
      saveBtn.textContent = 'Salvo!';
      saveBtn.style.backgroundColor = '#4CAF50';
      
      setTimeout(function() {
        saveBtn.textContent = originalText;
        saveBtn.style.backgroundColor = '#128C7E';
      }, 1500);
    });
  });
});
```

## Passo 4: Modificar o Content Script para Receber Configurações

Adicione o seguinte código ao `content_script.js` para receber mensagens do popup:

```javascript
// Antes da definição do CONFIG
let CONFIG = {
  enabled: true,
  colorize: true,
  logTypes: {
    appState: true,
    logs: true,
    received: true,
    sent: true,
    decode: true,
    encode: true,
  }
};

// Carregar configurações salvas
if (typeof chrome !== 'undefined' && chrome.storage) {
  chrome.storage.local.get(['waLoggerConfig'], function(result) {
    if (result.waLoggerConfig) {
      CONFIG = {...CONFIG, ...result.waLoggerConfig};
      console.log('WhatsApp Web Logger: Configurações carregadas', CONFIG);
    }
  });
  
  // Escutar mensagens do popup
  chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === 'updateLoggerConfig') {
      CONFIG = {...CONFIG, ...message.config};
      console.log('WhatsApp Web Logger: Configurações atualizadas', CONFIG);
      sendResponse({success: true});
    }
    return true;
  });
}
```

## Passo 5: Criar Ícones para a Extensão

Para uma aparência profissional, crie ícones nos tamanhos 16x16, 48x48 e 128x128 pixels. Você pode usar ferramentas como:

- Adobe Illustrator/Photoshop
- GIMP
- Canva
- Figma

Salve os ícones na pasta `icons/` do projeto.

## Passo 6: Carregar a Extensão no Navegador

### Google Chrome

1. Abra Chrome e navegue para `chrome://extensions/`
2. Ative o "Modo do desenvolvedor" (toggle no canto superior direito)
3. Clique em "Carregar sem compactação"
4. Selecione a pasta do projeto `whatsapp-web-logger`

### Mozilla Firefox

1. Abra Firefox e navegue para `about:debugging#/runtime/this-firefox`
2. Clique em "Carregar extensão temporária..."
3. Navegue até a pasta do projeto e selecione o arquivo `manifest.json`

## Passo 7: Testar a Extensão

1. Abra o WhatsApp Web (`https://web.whatsapp.com`)
2. Clique no ícone da extensão na barra de ferramentas para abrir o popup
3. Configure quais logs você deseja ver
4. Abra o DevTools (F12) e vá para a aba Console
5. Verifique se os logs estão sendo exibidos conforme configurado

## Resolução de Problemas

### A extensão não carrega

- Verifique se o manifest.json está correto
- Certifique-se de que todos os caminhos de arquivo estão corretos
- No Chrome, verifique erros na página `chrome://extensions/`

### Os logs não aparecem

- Certifique-se de que o WhatsApp Web está totalmente carregado
- Verifique se as configurações estão habilitadas no popup
- Verifique erros no console do navegador
- A estrutura do WhatsApp Web pode ter mudado; verifique se os nomes dos módulos ainda são válidos

### A extensão para de funcionar após atualizações do WhatsApp

O WhatsApp Web é frequentemente atualizado e os nomes dos módulos podem mudar. Se isso acontecer:

1. Analise os módulos disponíveis no contexto global:
   ```javascript
   // Execute no console do navegador quando o WhatsApp Web estiver aberto
   Object.keys(window).filter(k => k.startsWith('WA')).sort();
   ```

2. Use a saída para identificar os novos nomes dos módulos
3. Atualize o script com os novos nomes

## Publicação na Chrome Web Store (Opcional)

Se quiser disponibilizar a extensão para outros usuários:

1. Crie uma conta de desenvolvedor do Chrome Web Store (taxa única de $5)
2. Prepare um arquivo ZIP da pasta do projeto
3. Acesse o [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
4. Clique em "Novo item" e siga as instruções para enviar sua extensão

## Considerações de Segurança e Privacidade

Ao implementar esta extensão, lembre-se:

- Não colete ou transmita dados de usuários
- Seja transparente sobre como a extensão funciona
- Não viole os Termos de Serviço do WhatsApp
- Use a extensão apenas para fins educacionais e de desenvolvimento