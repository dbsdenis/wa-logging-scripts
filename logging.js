/**
 * WhatsApp Web Logger
 * 
 * Este script adiciona funcionalidades de logging para auxiliar no debug e monitoramento
 * do WhatsApp Web, interceptando e registrando diferentes tipos de comunicação.
 * 
 * Autor: Denilson Silva
 * Data: 24/04/2025
 */

// Configurações
const CONFIG = {
  enabled: true,         // Habilita/desabilita todos os logs
  colorize: true,        // Habilita/desabilita cores nos logs
  logTypes: {
    appState: true,      // Mutações de estado da aplicação
    logs: true,          // Logs internos do WhatsApp
    received: true,      // Stanzas recebidas
    sent: true,          // Stanzas enviadas
    decode: true,        // Mensagens decodificadas
    encode: true,        // Mensagens codificadas
  }
};

// Cores ANSI para o console
const COLORS = {
  reset: '\u001B[0m',
  red: '\u001B[31m',
  green: '\u001B[32m',
  yellow: '\u001B[33m',
  blue: '\u001B[34m',
  magenta: '\u001B[35m',
  cyan: '\u001B[36m',
};

// Prefixos para diferentes tipos de logs
const PREFIXES = {
  appState: `${COLORS.magenta}[APP STATE MUTATION]${COLORS.reset}`,
  logs: `${COLORS.red}[LOG]${COLORS.reset}`,
  received: `${COLORS.red}[RECEIVED]${COLORS.reset}`,
  decode: `${COLORS.yellow}[DECODE]${COLORS.reset}`,
  sent: `${COLORS.green}[SENT]${COLORS.reset}`,
  encode: `${COLORS.yellow}[ENCODE]${COLORS.reset}`,
};

/**
 * Registra mensagens no console com formatação colorida
 * @param {string} type - Tipo do log (appState, logs, received, etc)
 * @param {...any} args - Argumentos para serem registrados
 * @returns {void}
 */
function logger(type, ...args) {
  if (!CONFIG.enabled || !CONFIG.logTypes[type]) return;
  console.log(PREFIXES[type], ...args);
}

/**
 * Intercepta e substitui uma função, preservando a função original
 * @param {Object} module - Módulo que contém a função a ser substituída
 * @param {string} funcName - Nome da função a ser substituída
 * @param {Function} newFunc - Nova função que substituirá a original
 * @param {string} backupName - Nome da propriedade onde a função original será armazenada
 * @returns {void}
 */
function interceptFunction(module, funcName, newFunc, backupName) {
  if (!window[backupName]) {
    window[backupName] = module[funcName];
  }
  
  module[funcName] = newFunc;
}

// ===== HOOKS DE LOGGING =====

/**
 * Módulo 1: Registro de mutações de estado da aplicação
 */
(function setupAppStateLogger() {
  try {
    const WAWebSyncdRequestBuilderBuild = require("WAWebSyncdRequestBuilderBuild");
    const decodeProtobuf = require("decodeProtobuf");
    const WASyncAction = require("WASyncAction.pb");
    
    interceptFunction(
      WAWebSyncdRequestBuilderBuild, 
      "buildSyncIqNode", 
      (a) => {
        const result = window.syncIqBack(a);
        
        if (CONFIG.logTypes.appState) {
          const values = Array.from(a.values()).flat();
          const decodedValues = values.map(v => ({
            ...v,
            binarySyncAction: decodeProtobuf.decodeProtobuf(
              WASyncAction.SyncActionValueSpec, 
              v.binarySyncAction
            )
          }));
          
          logger('appState', decodedValues);
        }
        
        return result;
      }, 
      "syncIqBack"
    );
    
    console.log("✅ App State Logger configurado com sucesso");
  } catch (error) {
    console.error("❌ Erro ao configurar App State Logger:", error);
  }
})();

/**
 * Módulo 2: Registro de logs internos do WhatsApp
 */
(function setupInternalLogger() {
  try {
    const WALogger = require("WALogger");
    
    interceptFunction(
      WALogger, 
      "LOG", 
      (...args) => {
        const result = window.logBack(...args);
        logger('logs', ...args);
        return result;
      }, 
      "logBack"
    );
    
    console.log("✅ Internal Logger configurado com sucesso");
  } catch (error) {
    console.error("❌ Erro ao configurar Internal Logger:", error);
  }
})();

/**
 * Módulo 3: Registro de stanzas recebidas
 */
(function setupReceivedStanzaLogger() {
  try {
    const WAWap = require("WAWap");
    
    interceptFunction(
      WAWap, 
      "decodeStanza", 
      async (e, t) => {
        const result = await window.decodeBackStanza(e, t);
        logger('received', result);
        return result;
      }, 
      "decodeBackStanza"
    );
    
    console.log("✅ Received Stanza Logger configurado com sucesso");
  } catch (error) {
    console.error("❌ Erro ao configurar Received Stanza Logger:", error);
  }
})();

/**
 * Módulo 4: Registro de mensagens decodificadas
 */
(function setupDecodeLogger() {
  try {
    const decodeProtobuf = require("decodeProtobuf");
    
    interceptFunction(
      decodeProtobuf, 
      "decodeProtobuf", 
      (a, b) => {
        const result = window.decodeBack(a, b);
        logger('decode', result);
        return result;
      }, 
      "decodeBack"
    );
    
    console.log("✅ Decode Message Logger configurado com sucesso");
  } catch (error) {
    console.error("❌ Erro ao configurar Decode Message Logger:", error);
  }
})();

/**
 * Módulo 5: Registro de stanzas enviadas
 */
(function setupSentStanzaLogger() {
  try {
    const WAWap = require("WAWap");
    
    interceptFunction(
      WAWap, 
      "encodeStanza", 
      (...args) => {
        const result = window.encodeBackStanza(...args);
        logger('sent', args[0]);
        return result;
      }, 
      "encodeBackStanza"
    );
    
    console.log("✅ Sent Stanza Logger configurado com sucesso");
  } catch (error) {
    console.error("❌ Erro ao configurar Sent Stanza Logger:", error);
  }
})();

/**
 * Módulo 6: Registro de mensagens codificadas
 */
(function setupEncodeLogger() {
  try {
    const WAWebSendMsgCommonApi = require("WAWebSendMsgCommonApi");
    
    interceptFunction(
      WAWebSendMsgCommonApi, 
      "encodeAndPad", 
      (a) => {
        const result = window.encodeBack(a);
        logger('encode', a);
        return result;
      }, 
      "encodeBack"
    );
    
    console.log("✅ Encode Message Logger configurado com sucesso");
  } catch (error) {
    console.error("❌ Erro ao configurar Encode Message Logger:", error);
  }
})();

/**
 * Utilitários para controle dos logs em tempo de execução
 */
window.WALogger = {
  // Habilita/desabilita todos os logs
  setEnabled: (enabled) => {
    CONFIG.enabled = !!enabled;
    console.log(`Logs ${CONFIG.enabled ? 'habilitados' : 'desabilitados'}`);
  },
  
  // Habilita/desabilita tipos específicos de logs
  setLogType: (type, enabled) => {
    if (CONFIG.logTypes.hasOwnProperty(type)) {
      CONFIG.logTypes[type] = !!enabled;
      console.log(`Log tipo '${type}' ${CONFIG.logTypes[type] ? 'habilitado' : 'desabilitado'}`);
    } else {
      console.error(`Tipo de log '${type}' não encontrado`);
    }
  },
  
  // Retorna o status atual da configuração
  getStatus: () => {
    return {
      enabled: CONFIG.enabled,
      colorize: CONFIG.colorize,
      logTypes: {...CONFIG.logTypes}
    };
  }
};

console.log("✅ WhatsApp Web Logger iniciado com sucesso!");