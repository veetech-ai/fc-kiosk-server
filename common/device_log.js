// 1=high, 2=low, 3=info

exports.v0_placeholder = (key, message = "Message not defined") => {
  const common = "Device [did] firmware version [fv],";

  const log = {
    heap: `${common} Current Heap is [heap]`,
    heaplow: `${common} Current Heap is low [heaplow]`,
    heaplowota: `${common} Current Heap is low [heaplow] during ota upadate`,

    t_fail: `${common} Thread failed in [file] at line [line]`,
    wififail: `${common} wifi disconnected SSID [ssid] reason [fcode]`,

    t_wdovflow: `${common} watchdog overflow triggered [t_wdovflow]`,
    t_sof: `${common} stackoverflow occur for task [t_sof]`,

    resetC: `${common} devices restarted for [resetC] times`,
    RunT: `${common} Run time of device is [RunT] reset count is [resetC]`,

    INA_f: `${common} there is [INA_f] in I2C Init`,
    INA_r: `${common} there is out of range error, voltage [vbat] V . current [curr] mA`,

    goodby: `${common} Device is went into goodby mode voltage [vbat] V`,

    mqtt_dc: `${common} Mqtt Connection disconnected [mqtt_dc] times`,
    ota_f: `${common} Over the Air firmware failed firmware version[fv] `,
    rs_code: `${common} Device reset reason [rs_code] `,

    sde: `${common} Slave device error (${message})`,
  };

  return log[key] ? log[key] : `${common} Key not found (${key} -> ${message})`;
};

exports.v0_get_type = (key) => {
  const high = [
    "heaplow",
    "T_fail",
    "t_wdovflow",
    "t_sof",
    "INA_f",
    "INA_r",
    "ota_f",
  ]; // 1
  const low = ["resetC", "mqtt_dc"]; // 2
  const info = ["fv", "wififail", "RunT", "goodby", "heap", "rs_code"]; // 3

  let type = 1; // 1=high, 2=low, 3=info

  if (high.indexOf(key) >= 0) {
    type = 1;
  } else if (low.indexOf(key) >= 0) {
    type = 2;
  } else if (info.indexOf(key) >= 0) {
    type = 3;
  }

  return type;
};

exports.fcode = (code) => {
  code = parseInt(code);
  let code_str = "";

  switch (code) {
    case 1: {
      code_str = "WIFI_REASON_UNSPECIFIED";
      break;
    }
    case 2: {
      code_str = "WIFI_REASON_AUTH_EXPIRE";
      break;
    }
    case 3: {
      code_str = "WIFI_REASON_AUTH_LEAVE";
      break;
    }
    case 4: {
      code_str = "WIFI_REASON_ASSOC_EXPIRE";
      break;
    }
    case 5: {
      code_str = "WIFI_REASON_ASSOC_TOOMANY";
      break;
    }
    case 6: {
      code_str = "WIFI_REASON_NOT_AUTHED";
      break;
    }
    case 7: {
      code_str = "WIFI_REASON_NOT_ASSOCED";
      break;
    }
    case 8: {
      code_str = "WIFI_REASON_ASSOC_LEAVE";
      break;
    }
    case 9: {
      code_str = "WIFI_REASON_ASSOC_NOT_AUTHED";
      break;
    }
    case 10: {
      code_str = "WIFI_REASON_DISASSOC_PWRCAP_BAD";
      break;
    }
    case 11: {
      code_str = "WIFI_REASON_DISASSOC_SUPCHAN_BAD";
      break;
    }
    case 13: {
      code_str = "WIFI_REASON_IE_INVALID";
      break;
    }
    case 14: {
      code_str = "WIFI_REASON_MIC_FAILURE";
      break;
    }
    case 15: {
      code_str = "WIFI_REASON_4WAY_HANDSHAKE_TIMEOUT";
      break;
    }
    case 16: {
      code_str = "WIFI_REASON_GROUP_KEY_UPDATE_TIMEOUT";
      break;
    }
    case 17: {
      code_str = "WIFI_REASON_IE_IN_4WAY_DIFFERS";
      break;
    }
    case 18: {
      code_str = "WIFI_REASON_GROUP_CIPHER_INVALID";
      break;
    }
    case 19: {
      code_str = "WIFI_REASON_PAIRWISE_CIPHER_INVALID ";
      break;
    }
    case 20: {
      code_str = "WIFI_REASON_AKMP_INVALID";
      break;
    }
    case 21: {
      code_str = "WIFI_REASON_UNSUPP_RSN_IE_VERSION";
      break;
    }
    case 22: {
      code_str = "WIFI_REASON_INVALID_RSN_IE_CAP";
      break;
    }
    case 23: {
      code_str = "WIFI_REASON_802_1X_AUTH_FAILED";
      break;
    }
    case 24: {
      code_str = "WIFI_REASON_CIPHER_SUITE_REJECTED";
      break;
    }
    case 200: {
      code_str = "WIFI_REASON_BEACON_TIMEOUT";
      break;
    }
    case 201: {
      code_str = "WIFI_REASON_NO_AP_FOUND";
      break;
    }
    case 202: {
      code_str = "WIFI_REASON_AUTH_FAIL";
      break;
    }
    case 203: {
      code_str = "WIFI_REASON_ASSOC_FAIL";
      break;
    }
    case 204: {
      code_str = "WIFI_REASON_HANDSHAKE_TIMEOUT";
      break;
    }
    case 205: {
      code_str = "WIFI_REASON_CONNECTION_FAIL";
      break;
    }
    default: {
      code_str = `Message against Code"${code}" not found`;
      break;
    }
  }

  return code_str;
};

exports.rs_code = (code) => {
  code = parseInt(code);
  let code_str = "";

  switch (code) {
    case 0: {
      code_str = "ESP_RST_UNKNOWN";
      break;
    }
    case 1: {
      code_str = "ESP_RST_POWERON";
      break;
    }
    case 2: {
      code_str = "ESP_RST_EXT";
      break;
    }
    case 3: {
      code_str = "ESP_RST_SW";
      break;
    }
    case 4: {
      code_str = "ESP_RST_PANIC";
      break;
    }
    case 5: {
      code_str = "ESP_RST_INT_WDT";
      break;
    }
    case 6: {
      code_str = "ESP_RST_TASK_WDT";
      break;
    }
    case 7: {
      code_str = "ESP_RST_WDT";
      break;
    }
    case 8: {
      code_str = "ESP_RST_DEEPSLEEP";
      break;
    }
    case 9: {
      code_str = "ESP_RST_BROWNOUT";
      break;
    }
    case 10: {
      code_str = "ESP_RST_SDIO";
      break;
    }
    default: {
      code_str = `ESP_RST unkown Code"${code}" `;
      break;
    }
  }

  return code_str;
};
exports.vp_esp = (code) => {
  code = code.toString();
  const common = "Device [did] firmware version [fv],";

  const log = {
    ffff: `${common} Generic esp_err_t code indicating failure`,
    101: `${common} Out of memory`,
    102: `${common} Invalid argument`,
    103: `${common} Invalid state`,
    104: `${common} Invalid size`,
    105: `${common} Requested resource not found`,
    106: `${common} Operation or feature not supported`,
    107: `${common} Operation timed out`,
    108: `${common} Received response was invalid`,
    109: `${common} CRC or checksum was invalid`,
    "10a": `${common} Version was invalid`,
    "10b": `${common} MAC address was invalid`,
    1100: `${common} Starting number of error codes`,
    1101: `${common} The storage driver is not initialized`,
    1102: `${common} Id namespace doesn’t exist yet and mode is NVS_READONLY`,
    1103: `${common} The type of set or get operation doesn’t match the type of value stored in NVS`,
    1104: `${common} Storage handle was opened as read only`,
    1105: `${common} There is not enough space in the underlying storage to save the value`,
    1106: `${common} Namespace name doesn’t satisfy constraints`,
    1107: `${common} Handle has been closed or is NULL`,
    1108: `${common} The value wasn’t updated because flash write operation has failed. The value was written however, and update will be finished after re-initialization of nvs, provided that flash operation doesn’t fail again.`,
    1109: `${common} Key name is too long`,
    "110a": `${common} Internal error; never returned by nvs API functions`,
    "110b": `${common} NVS is in an inconsistent state due to a previous error. Call nvs_flash_init and nvs_open again, then retry.`,
    "110c": `${common} String or blob length is not sufficient to store data`,
    "110d": `${common} NVS partition doesn’t contain any empty pages. This may happen if NVS partition was truncated. Erase the whole partition and call nvs_flash_init again.`,
    "110e": `${common} String or blob length is longer than supported by the implementation`,
    "110f": `${common} Partition with specified name is not found in the partition table`,
    1110: `${common} NVS partition contains data in new format and cannot be recognized by this version of code`,
    1111: `${common} XTS encryption failed while writing NVS entry`,
    1112: `${common} XTS decryption failed while reading NVS entry`,
    1113: `${common} XTS configuration setting failed`,
    1114: `${common} XTS configuration not found`,
    1115: `${common} NVS encryption is not supported in this version`,
    1116: `${common} NVS key partition is uninitialized`,
    1117: `${common} NVS key partition is corrupt`,
    1200: `${common} Offset for ULP-related error codes`,
    1201: `${common} Program doesn’t fit into RTC memory reserved for the ULP`,
    1202: `${common} Load address is outside of RTC memory reserved for the ULP`,
    1203: `${common} More than one label with the same number was defined`,
    1204: `${common} Branch instructions references an undefined label`,
    1205: `${common} Branch target is out of range of B instruction (try replacing with BX)`,
    1500: `${common} Base error code for ota_ops api`,
    1501: `${common} Error if request was to write or erase the current running partition`,
    1502: `${common} Error if OTA data partition contains invalid content`,
    1503: `${common} Error if OTA app image is invalid`,
    1504: `${common} Error if the firmware has a secure version less than the running firmware.`,
    1505: `${common} Error if flash does not have valid firmware in passive partition and hence rollback is not possible`,
    1506: `${common} Error if current active firmware is still marked in pending validation state (ESP_OTA_IMG_PENDING_VERIFY), essentially first boot of firmware image post upgrade and hence firmware upgrade is not possible`,
    1600: `${common} Base error code for efuse api.`,
    1601: `${common} OK the required number of bits is set.`,
    1602: `${common} Error field is full.`,
    1603: `${common} Error repeated programming of programmed bits is strictly forbidden.`,
    1604: `${common} Error while a encoding operation.`,
    2000: `${common} ESP_ERR_IMAGE_BASE`,
    2001: `${common} ESP_ERR_IMAGE_FLASH_FAIL`,
    2002: `${common} ESP_ERR_IMAGE_INVALID`,
    3000: `${common} Starting number of WiFi error codes`,
    3001: `${common} WiFi driver was not installed by esp_wifi_init`,
    3002: `${common} WiFi driver was not started by esp_wifi_start`,
    3003: `${common} WiFi driver was not stopped by esp_wifi_stop`,
    3004: `${common} WiFi interface error`,
    3005: `${common} WiFi mode error`,
    3006: `${common} WiFi internal state error`,
    3007: `${common} WiFi internal control block of station or soft-AP error`,
    3008: `${common} WiFi internal NVS module error`,
    3009: `${common} MAC address is invalid`,
    "300a": `${common} SSID is invalid`,
    "300b": `${common} Password is invalid`,
    "300c": `${common} Timeout error`,
    "300d": `${common} WiFi is in sleep state(RF closed) and wakeup fail`,
    "300e": `${common} The caller would block`,
    "300f": `${common} Station still in disconnect status`,
    3033: `${common} WPS registrar is not supported`,
    3034: `${common} WPS type error`,
    3035: `${common} WPS state machine is not initialized`,
    3064: `${common} ESPNOW error number base.`,
    3065: `${common} ESPNOW is not initialized.`,
    3066: `${common} Invalid argument`,
    3067: `${common} Out of memory`,
    3068: `${common} ESPNOW peer list is full`,
    3069: `${common} ESPNOW peer is not found`,
    "306a": `${common} Internal error`,
    "306b": `${common} ESPNOW peer has existed`,
    "306c": `${common} Interface error`,
    4000: `${common} Starting number of MESH error codes`,
    4001: `${common} ESP_ERR_MESH_WIFI_NOT_START`,
    4002: `${common} ESP_ERR_MESH_NOT_INIT`,
    4003: `${common} ESP_ERR_MESH_NOT_CONFIG`,
    4004: `${common} ESP_ERR_MESH_NOT_START`,
    4005: `${common} ESP_ERR_MESH_NOT_SUPPORT`,
    4006: `${common} ESP_ERR_MESH_NOT_ALLOWED`,
    4007: `${common} ESP_ERR_MESH_NO_MEMORY`,
    4008: `${common} ESP_ERR_MESH_ARGUMENT`,
    4009: `${common} ESP_ERR_MESH_EXCEED_MTU`,
    "400a": `${common} ESP_ERR_MESH_TIMEOUT`,
    "400b": `${common} ESP_ERR_MESH_DISCONNECTED`,
    "400c": `${common} ESP_ERR_MESH_QUEUE_FAIL`,
    "400d": `${common} ESP_ERR_MESH_QUEUE_FULL`,
    "400e": `${common} ESP_ERR_MESH_NO_PARENT_FOUND`,
    "400f": `${common} ESP_ERR_MESH_NO_ROUTE_FOUND`,
    4010: `${common} ESP_ERR_MESH_OPTION_NULL`,
    4011: `${common} ESP_ERR_MESH_OPTION_UNKNOWN`,
    4012: `${common} ESP_ERR_MESH_XON_NO_WINDOW`,
    4013: `${common} ESP_ERR_MESH_INTERFACE`,
    4014: `${common} ESP_ERR_MESH_DISCARD_DUPLICATE`,
    4015: `${common} ESP_ERR_MESH_DISCARD`,
    4016: `${common} ESP_ERR_MESH_VOTING`,
    5000: `${common} ESP_ERR_TCPIP_ADAPTER_BASE`,
    5001: `${common} ESP_ERR_TCPIP_ADAPTER_INVALID_PARAMS`,
    5002: `${common} ESP_ERR_TCPIP_ADAPTER_IF_NOT_READY`,
    5003: `${common} ESP_ERR_TCPIP_ADAPTER_DHCPC_START_FAILED`,
    5004: `${common} ESP_ERR_TCPIP_ADAPTER_DHCP_ALREADY_STARTED`,
    5005: `${common} ESP_ERR_TCPIP_ADAPTER_DHCP_ALREADY_STOPPED`,
    5006: `${common} ESP_ERR_TCPIP_ADAPTER_NO_MEM`,
    5007: `${common} ESP_ERR_TCPIP_ADAPTER_DHCP_NOT_STOPPED`,
    6000: `${common} ESP_ERR_PING_BASE`,
    6001: `${common} ESP_ERR_PING_INVALID_PARAMS`,
    6002: `${common} ESP_ERR_PING_NO_MEM`,
    7000: `${common} Starting number of HTTP error codes`,
    7001: `${common} The error exceeds the number of HTTP redirects`,
    7002: `${common} Error open the HTTP connection`,
    7003: `${common} Error write HTTP data`,
    7004: `${common} Error read HTTP header from server`,
    7005: `${common} There are no transport support for the input scheme`,
    7006: `${common} HTTP connection hasn’t been established yet`,
    7007: `${common} Mapping of errno EAGAIN to esp_err_t`,
    8000: `${common} Starting number of HTTPD error codes`,
    8001: `${common} All slots for registering URI handlers have been consumed`,
    8002: `${common} URI handler with same method and target URI already registered`,
    8003: `${common} Invalid request pointer`,
    8004: `${common} Result string truncated`,
    8005: `${common} Response header field larger than supported`,
    8006: `${common} Error occured while sending response packet`,
    8007: `${common} Failed to dynamically allocate memory for resource`,
    8008: `${common} Failed to launch server task/thread`,
    10010: `${common} ESP_ERR_FLASH_BASE`,
    10011: `${common} ESP_ERR_FLASH_OP_FAIL`,
    10012: `${common} ESP_ERR_FLASH_OP_TIMEOUT`,
  };

  return log[code] ? log[code] : `${common} Not defined (${code})`;
};

exports.vp_dc = (code) => {
  code = code.toString();
  const common = "Device [did] firmware version [fv],";

  const log = {
    0: { msg: `${common} -`, p: 3 },
    1: { msg: `${common} UART fail`, p: 1 },
    2: { msg: `${common} Secondary comm channel down`, p: 3 }, //
    3: { msg: `${common} INA out of range readings`, p: 3 }, //
    4: { msg: `${common} I2C not working`, p: 1 },
    5: { msg: `${common} SPI not working`, p: 1 },
    6: { msg: `${common} Pwm not working`, p: 1 },
    7: { msg: `${common} Memory fail `, p: 3 }, //
    8: { msg: `${common} Battery critically low`, p: 1 },
    9: { msg: `${common} OTA failed alarm`, p: 1 },
    10: { msg: `${common} Buffer 1 about to overflow warning`, p: 3 }, //
    11: { msg: `${common} Buffer 1 has overflowed `, p: 3 }, //
    12: { msg: `${common} Heaplow critical low`, p: 1 },
    13: { msg: `${common} Watchdog triggered`, p: 1 },
    14: { msg: `${common} Thread failed`, p: 1 },
    15: { msg: `${common} Stackoverflow`, p: 1 },
    16: { msg: `${common} MQTT message overflow`, p: 1 },
    31: { msg: `${common} -`, p: 3 }, //
  };

  return log[code]
    ? log[code]
    : { msg: `${common} Not defined (${code})`, p: 2 };
};

exports.vp_ac = (code) => {
  code = code.toString();
  const common = "Device [did] firmware version [fv],";

  const log = {
    0: { msg: `${common} -`, p: 3 },
    1: { msg: `${common} Battery Charging`, p: 2 },
    2: { msg: `${common} Battery Charged`, p: 2 },
    3: { msg: `${common} Encoder Miss`, p: 2 },
    4: { msg: `${common} H-Bridge Fault`, p: 2 },
    5: { msg: `${common} Over Current`, p: 2 },
    6: { msg: `${common} VBAT Alert`, p: 2 },
    7: { msg: `${common} Home Miss`, p: 2 },
    8: { msg: `${common} Encoder Time Out`, p: 2 },
    9: { msg: `${common} Motor Missing`, p: 2 },
    10: { msg: `${common} No charging`, p: 2 },
  };

  return log[code]
    ? log[code]
    : { msg: `${common} Not defined (${code})`, p: 2 };
};
