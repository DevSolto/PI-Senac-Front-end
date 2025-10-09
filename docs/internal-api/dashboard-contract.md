# Contrato interno da API de Dashboard

Este documento descreve os contratos consumidos pelo front-end na área de *dashboard*, detalhando endpoints, métodos, estruturas de payload e como as respostas são normalizadas pelos utilitários atuais.

## Visão geral dos serviços

| Recurso | Método | Caminho | Responsabilidade principal |
| --- | --- | --- | --- |
| Visão geral do dispositivo | `GET` | `/devices/{deviceId}/overview` | Consolidar status do silo, métricas resumidas, alertas críticos e alertas mensais. |
| Histórico do dispositivo | `GET` | `/devices/{deviceId}/history` | Listar leituras temporais de métricas para gráficos e cálculos auxiliares. |
| Alertas críticos | `GET` | `/devices/{deviceId}/alerts` | Recuperar alertas críticos em aberto para o dispositivo. |
| Reconhecer alerta crítico | `PATCH` | `/devices/{deviceId}/alerts/{alertId}` | Atualizar um alerta para o estado "acknowledged". |
| Resolver alerta crítico | `POST` | `/devices/{deviceId}/alerts/{alertId}/resolve` | Marcar um alerta como resolvido, registrando notas e responsáveis. |

A seguir detalhamos cada rota.

## `GET /devices/{deviceId}/overview`

### Request
- **Parâmetros de caminho**: `deviceId` — identificador do dispositivo monitorado.
- **Query**: nenhuma.
- **Body**: não se aplica.

### Estrutura esperada da resposta

A resposta pode trazer variações em *snake_case* ou *camelCase* para a maioria dos campos. O cliente aceita formatos como abaixo:

```jsonc
{
  "farm": {
    "id": "fazenda-01",
    "name": "Fazenda Modelo",
    "location": "Chapecó, SC",
    "harvest_season": "2024/2025",
    "manager": "Maria Silva",
    "last_sync": "2024-02-01T12:00:00Z",
    "timezone": "America/Sao_Paulo"
  },
  "sensor_status": {
    "total_sensors": 42,
    "online": 39,
    "offline": 1,
    "maintenance": 2,
    "battery_critical": 3,
    "average_signal_quality": 78,
    "gateway_status": "online"
  },
  "sensors_status": "OK",
  "metrics": {
    "active_alerts": {
      "label": "Alertas ativos",
      "value": 5,
      "unit": null,
      "trend": {
        "direction": "up",
        "value": 2,
        "value_type": "absolute",
        "compared_to": "semana anterior"
      },
      "description": "Total de alertas nas últimas 24h"
    },
    "silos_ok_percentage": {
      "label": "% Silos OK",
      "value": 92.5,
      "unit": "%",
      "trend": {
        "direction": "down",
        "value": 1.2,
        "value_type": "percentage"
      }
    },
    "average_temperature": {
      "label": "Temperatura média (24h)",
      "value": 26.4,
      "unit": "°C"
    }
  },
  "critical_alerts": [ /* lista de alertas compatíveis com `ApiCriticalAlert` */ ],
  "monthly_alert_breakdown": [
    {
      "month": "2024-01",
      "total": 12,
      "critical": 3,
      "warning": 6,
      "resolved": 9
    }
  ]
}
```

Campos aceitos:
- `farm`: qualquer campo ausente recebe valores vazios, `lastSync` cai em `new Date().toISOString()` e `timezone` cai para `"UTC"` na normalização. 【F:src/features/dashboard/api/get-dashboard-overview.ts†L90-L117】【F:src/features/dashboard/api/get-dashboard-overview.ts†L137-L158】
- `sensor_status`/`sensorStatus`: aceita contagens numéricas e `gateway_status` nos estados `online`, `degraded` ou `offline`. Valores ausentes resultam em `0` ou `"online"`. 【F:src/features/dashboard/api/get-dashboard-overview.ts†L124-L156】
- `sensors_status`/`sensorsStatus`: tratado como enum `"OK"` ou `"ISSUE"`; o fallback padrão é `"OK"`. 【F:src/features/dashboard/types.ts†L45-L55】【F:src/features/dashboard/api/get-dashboard-overview.ts†L120-L126】
- `metrics`: os campos aceitam `snake_case` ou `camelCase`. Valores numéricos são convertidos via `Number(...)` e tendências possuem direções limitadas a `"up"`, `"down"` ou `"stable"`. `value_type` diferente de `"percentage"` vira `"absolute"`. `compared_to` recebe fallback `"período anterior"`. 【F:src/features/dashboard/api/get-dashboard-overview.ts†L47-L104】【F:src/features/dashboard/api/get-dashboard-overview.ts†L158-L184】
- `critical_alerts`: cada item é normalizado por `normalizeCriticalAlert` (ver seção de alertas). 【F:src/features/dashboard/api/get-dashboard-overview.ts†L14-L17】【F:src/features/dashboard/api/get-dashboard-overview.ts†L187-L194】
- `monthly_alert_breakdown`: aceita lista com `month`, `total`, `critical`, `warning` e `resolved`, caindo para `0` quando ausente. Totais agregados são calculados pelo cliente. 【F:src/features/dashboard/api/get-dashboard-overview.ts†L69-L88】【F:src/features/dashboard/transformers/history.ts†L56-L101】

### Normalização e derivação
- `averageTemperature`: se a API não fornecer o bloco, o cliente calcula a média com base no histórico (`getDeviceHistory`). Apenas valores numéricos finitos dos campos `temperature`, `temp` ou `Temperature` são considerados. O resultado é arredondado para uma casa decimal. 【F:src/features/dashboard/api/get-dashboard-overview.ts†L186-L199】【F:src/features/dashboard/api/get-dashboard-overview.ts†L199-L224】
- `historyDatasets`: séries de temperatura, umidade e CO₂ são derivadas das entradas do histórico, considerando chaves configuradas nos transformers. Datas são ordenadas cronologicamente. 【F:src/features/dashboard/transformers/history.ts†L1-L75】
- `monthlyAlertTotals`: somatório feito no cliente somando `critical`, `warning` e `resolved`. Se `total` for ausente, é recalculado a partir das parcelas. 【F:src/features/dashboard/transformers/history.ts†L77-L123】

### Exemplo de resposta normalizada (`DashboardOverview`)

```jsonc
{
  "farm": {
    "id": "fazenda-01",
    "name": "Fazenda Modelo",
    "location": "Chapecó, SC",
    "harvestSeason": "2024/2025",
    "manager": "Maria Silva",
    "lastSync": "2024-02-01T12:00:00.000Z",
    "timezone": "America/Sao_Paulo"
  },
  "sensorsStatus": "OK",
  "sensorStatus": {
    "totalSensors": 42,
    "online": 39,
    "offline": 1,
    "maintenance": 2,
    "batteryCritical": 3,
    "averageSignalQuality": 78,
    "gatewayStatus": "online"
  },
  "metrics": {
    "activeAlerts": {
      "label": "Alertas ativos",
      "value": 5,
      "trend": {
        "direction": "up",
        "value": 2,
        "valueType": "absolute",
        "comparedTo": "semana anterior"
      }
    },
    "silosOkPercentage": {
      "label": "% Silos OK",
      "value": 92.5,
      "unit": "%",
      "trend": {
        "direction": "down",
        "value": 1.2,
        "valueType": "percentage",
        "comparedTo": "período anterior"
      }
    },
    "averageTemperature": {
      "label": "Temperatura média (24h)",
      "value": 26.4,
      "unit": "°C",
      "trend": {
        "direction": "stable",
        "value": 0,
        "valueType": "absolute",
        "comparedTo": "período anterior"
      }
    }
  },
  "criticalAlerts": [ /* lista de CriticalAlert normalizados */ ],
  "monthlyAlertBreakdown": [
    {
      "month": "2024-01",
      "total": 12,
      "critical": 3,
      "warning": 6,
      "resolved": 9
    }
  ],
  "monthlyAlertTotals": {
    "total": 12,
    "critical": 3,
    "warning": 6,
    "resolved": 9
  },
  "historyDatasets": {
    "temperature": [
      { "timestamp": "2024-02-01T11:00:00.000Z", "value": 25.1 }
    ],
    "humidity": [],
    "co2": []
  }
}
```

## `GET /devices/{deviceId}/history`

### Request
- **Parâmetros de caminho**: `deviceId`.
- **Query/Body**: não utilizados.

### Estruturas aceitas de resposta

A API pode responder com um array simples ou com um objeto que contenha os dados em campos diferentes:

```jsonc
// Forma 1 – array direto
[
  {
    "timestamp": 1706773200,
    "metrics": { "temperature": 25.4, "humidity": 62 }
  }
]

// Forma 2 – objeto envelope
{
  "device_id": "fazenda-01",
  "entries": [ { "time": "2024-02-01T11:00:00Z", "values": { "temp": "26.1" } } ]
}
```

Campos suportados em cada item:
- Carimbos de tempo: `timestamp`, `recorded_at`, `recordedAt`, `time`, `createdAt`. Valores em segundos, milissegundos ou strings ISO são convertidos para ISO usando `new Date(...).toISOString()`. 【F:src/features/dashboard/api/get-device-history.ts†L27-L82】
- Métricas: aceitas em `metrics`, `values`, `value`, `payload`, `data` ou `reading`. Cada par chave/valor é convertido para `number` quando o conteúdo for numérico; valores inválidos viram `null` ou são descartados. 【F:src/features/dashboard/api/get-device-history.ts†L84-L123】
- `device_id`/`deviceId`: opcional; quando ausente é substituído pelo `deviceId` da rota. 【F:src/features/dashboard/api/get-device-history.ts†L125-L155】

### Resultado normalizado (`DeviceHistory`)
- Lista de `entries` com `timestamp` em ISO 8601 e `metrics` contendo apenas números ou `null`. 【F:src/features/dashboard/types.ts†L69-L85】
- Utilizado pelos transformers para gerar séries de temperatura (`temperature`, `temp`, `Temperature`, `temp_c`, `tempC`), umidade (`humidity`, `hum`, `Humidity`, `relativeHumidity`, `rh`) e CO₂ (`co2`, `CO2`, `carbon_dioxide`, `carbonDioxide`, `co2_ppm`, `co2ppm`). Valores não finitos são ignorados. 【F:src/features/dashboard/transformers/history.ts†L9-L75】

### Exemplo normalizado

```jsonc
{
  "deviceId": "fazenda-01",
  "entries": [
    {
      "timestamp": "2024-02-01T11:00:00.000Z",
      "metrics": {
        "temperature": 26.1
      }
    }
  ]
}
```

## `GET /devices/{deviceId}/alerts`

### Request
- **Parâmetros de caminho**: `deviceId`.
- **Query/Body**: não utilizados.

### Resposta esperada
A API pode devolver diretamente um array ou um objeto contendo `alerts`, `data` ou `results`:

```jsonc
{
  "alerts": [
    {
      "id": "alert-01",
      "silo_name": "Silo A",
      "alert_type": "Temperatura crítica",
      "severity": "critical",
      "detected_at": "2024-02-01T10:45:00Z",
      "recommended_action": "Verificar ventilação"
    }
  ]
}
```

Cada item precisa ser compatível com `ApiCriticalAlert`. Campos aceitos incluem variações camel/snake para nomes de silo, tipo de alerta, severidade, datas de detecção/resolução, duração, status, descrição, mensagem, recomendação e indicação se já foi reconhecido. 【F:src/features/dashboard/transformers/alerts.ts†L3-L66】

### Normalização
`normalizeCriticalAlert` converte os dados para o contrato interno `CriticalAlert`:
- **Datas**: `detectedAt`, `detected_at`, `detectedTimestamp` e equivalentes em eventos são convertidos para ISO. `resolvedAt` aceita os mesmos padrões. Datas inválidas caem em `new Date().toISOString()` para detecção e `undefined` para resolução. 【F:src/features/dashboard/transformers/alerts.ts†L68-L122】
- **Duração**: calculada em minutos a partir das datas ou de `durationMinutes`/`duration_minutes` numéricas. Valores negativos viram `0`. 【F:src/features/dashboard/transformers/alerts.ts†L124-L142】
- **Strings**: `description`, `message`, `recommendedAction` recebem *trim* e possuem textos padrão quando vazios. `siloName` aceita `silo`, `silo_name`, `siloName`. O tipo do alerta cai em um rótulo derivado da descrição quando ausente. 【F:src/features/dashboard/transformers/alerts.ts†L144-L166】
- **Severidade**: aceita variações como "critical", "crit", "warning", "alert", "moderate". Valores diferentes com "crit" no texto também viram `"critical"`. Fallback `"warning"`. 【F:src/features/dashboard/transformers/alerts.ts†L90-L108】
- **Status**: interpreta `resolved`, `resolve`, `acknowledged`, `ack`, `open`, `active`. Se o alerta estiver `acknowledged`, o status final reflete isso mesmo sem campo explícito. 【F:src/features/dashboard/transformers/alerts.ts†L110-L122】

### Exemplo normalizado (`CriticalAlert`)

```jsonc
{
  "id": "alert-01",
  "siloName": "Silo A",
  "alertType": "Temperatura crítica",
  "severity": "critical",
  "detectedAt": "2024-02-01T10:45:00.000Z",
  "durationMinutes": 15,
  "status": "active",
  "description": "Verificar ventilação",
  "recommendedAction": "Investigar a causa do alerta e registrar ações corretivas."
}
```

## `PATCH /devices/{deviceId}/alerts/{alertId}` (Acknowledge)

### Request
- **Parâmetros de caminho**: `deviceId`, `alertId`.
- **Body opcional**:

```jsonc
{
  "note": "Contato realizado com a equipe",
  "acknowledgedBy": "Operador João"
}
```

O cliente sempre envia `status: "acknowledged"` além dos campos fornecidos. 【F:src/features/dashboard/api/update-critical-alert.ts†L40-L51】

### Resposta esperada
A API pode retornar o alerta direto ou dentro de `alert` ou `data`.

```jsonc
{
  "alert": {
    "id": "alert-01",
    "status": "acknowledged",
    "acknowledged": true,
    "acknowledged_at": "2024-02-01T11:00:00Z"
  }
}
```

O payload recebido passa por `normalizeCriticalAlert`, aplicando as mesmas regras de datas, severidade, status e textos vistas acima. 【F:src/features/dashboard/api/update-critical-alert.ts†L18-L39】【F:src/features/dashboard/api/update-critical-alert.ts†L40-L60】

## `POST /devices/{deviceId}/alerts/{alertId}/resolve`

### Request
- **Parâmetros de caminho**: `deviceId`, `alertId`.
- **Body opcional**:

```jsonc
{
  "note": "Ventilação ajustada",
  "resolvedBy": "Operador João",
  "resolutionCode": "VENTILACAO_AJUSTADA"
}
```

Os campos são enviados como recebidos; nenhum `status` explícito é adicionado pelo cliente. 【F:src/features/dashboard/api/update-critical-alert.ts†L62-L74】

### Resposta esperada
Semelhante ao endpoint de *acknowledge*, pode ser um objeto simples ou aninhado. O normalizador reaproveita `normalizeCriticalAlert`, utilizando `detectedAt` original como fallback quando a resposta não informar datas ISO. 【F:src/features/dashboard/api/update-critical-alert.ts†L62-L82】

### Exemplo normalizado

```jsonc
{
  "id": "alert-01",
  "siloName": "Silo A",
  "alertType": "Temperatura crítica",
  "severity": "warning",
  "detectedAt": "2024-02-01T10:45:00.000Z",
  "durationMinutes": 45,
  "status": "resolved",
  "description": "Situação detectada pelo monitoramento em tempo real.",
  "recommendedAction": "Investigar a causa do alerta e registrar ações corretivas."
}
```

## Referências de tipos internos
- `DashboardOverview`, `CriticalAlert`, `DeviceHistory` e enums relacionados estão definidos em `src/features/dashboard/types.ts`. 【F:src/features/dashboard/types.ts†L1-L85】
- Transformações de alertas: `src/features/dashboard/transformers/alerts.ts`.
- Transformações de histórico: `src/features/dashboard/transformers/history.ts`.

Essas referências devem ser atualizadas em conjunto com este documento caso novos campos ou regras sejam introduzidos.
