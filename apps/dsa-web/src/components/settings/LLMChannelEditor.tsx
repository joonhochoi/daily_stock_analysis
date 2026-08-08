import { useEffect, useMemo, useRef, useState } from 'react';
import type React from 'react';
import type { ParsedApiError } from '../../api/error';
import { getParsedApiError } from '../../api/error';
import { systemConfigApi } from '../../api/systemConfig';
import type { LLMCapabilityCheck, LLMCapabilityCheckResult } from '../../types/systemConfig';
import { ApiErrorAlert, Badge, Button, InlineAlert, Input, Select, StatusDot, Tooltip } from '../common';
import type { ChannelProtocol } from './llmProviderTemplates';
import {
  LLM_PROVIDER_CAPABILITY_LABELS,
  LLM_PROVIDER_TEMPLATES,
  MODEL_PLACEHOLDERS_BY_PROTOCOL,
  getProviderTemplate,
  isKnownProviderTemplate,
} from './llmProviderTemplates';
import { SettingsHelpButton } from './SettingsHelpButton';
import { useUiLanguage } from '../../contexts/UiLanguageContext';
import type { UiLanguage } from '../../i18n/uiText';

interface LlmEditorText {
  title: string;
  channelManagement: string;
  description: string;
  expand: string;
  collapse: string;
  quickAdd: string;
  quickAddDescription: string;
  channelCount: (count: number) => string;
  addChannel: string;
  selectProvider: string;
  channelList: string;
  enabledCount: (enabled: number, total: number) => string;
  noChannels: string;
  noChannelsDescription: string;
  runtimeParameters: string;
  runtimeDescription: string;
  temperatureDescription: string;
  noAvailableModels: string;
  primaryModel: string;
  automaticFirstModel: string;
  agentPrimaryModel: string;
  automaticInheritedModel: string;
  fallbackModels: string;
  fallbackDescription: string;
  visionModel: string;
  automaticVisionModel: string;
  yamlRoutingNotice: string;
  saving: string;
  saveAiConfig: string;
  saveChannelConfig: string;
  noUnsavedChanges: string;
  savedNotice: string;
  invalidChannelName: string;
  invalidPrimaryModel: string;
  invalidAgentPrimaryModel: string;
  invalidFallbackModel: string;
  invalidVisionModel: string;
  aiConfigSaved: string;
  channelConfigSaved: string;
  connectionTesting: string;
  connectionSucceeded: (model?: string | null, latencyMs?: number | null) => string;
  connectionTestFailed: string;
  fetchingModelList: string;
  discoveredModels: (count: number, latencyMs?: number | null) => string;
  fetchModelsFailed: string;
  checkingRuntimeCapabilities: string;
  noCapabilityResults: string;
  capabilityCheckFailed: string;
}

const LLM_EDITOR_TEXT: Record<UiLanguage, LlmEditorText> = {
  zh: {
    title: 'AI 模型配置',
    channelManagement: '渠道管理',
    description: '添加服务商渠道后可自动获取模型列表并多选，也可继续手动填写。配置会自动同步到 .env 文件。',
    expand: '展开',
    collapse: '收起',
    quickAdd: '快速添加渠道',
    quickAddDescription: '先选择预设服务商，再一键创建配置草稿。',
    channelCount: (count) => `${count} 个渠道`,
    addChannel: '添加渠道',
    selectProvider: '选择服务商',
    channelList: '渠道列表',
    enabledCount: (enabled, total) => `${enabled}/${total} 已启用`,
    noChannels: '还没有渠道',
    noChannelsDescription: '选择服务商预设后点击“添加渠道”即可开始配置。',
    runtimeParameters: '运行时参数',
    runtimeDescription: '主模型、备选模型、Vision 与 Temperature 会直接写入运行时配置。',
    temperatureDescription: '控制模型输出随机性，0 为确定性输出，2 为最大随机性，推荐 0.7。',
    noAvailableModels: '先添加至少一个已启用渠道并填写模型，下面的主模型 / 备选模型 / Vision 选项才会出现。',
    primaryModel: '主模型',
    automaticFirstModel: '自动（使用第一个可用模型）',
    agentPrimaryModel: 'Agent 主模型',
    automaticInheritedModel: '自动（继承普通分析主模型）',
    fallbackModels: '备选模型',
    fallbackDescription: '备选模型只会在主模型失败时使用。主模型不会重复加入备选模型。',
    visionModel: 'Vision 模型',
    automaticVisionModel: '自动（跟随 Vision 默认逻辑）',
    yamlRoutingNotice: '检测到已配置高级模型路由 YAML：此处仅管理渠道条目和基础连接信息。运行时主模型 / 备选模型 / Vision / Temperature 仍由下方通用字段决定；若 YAML 解析成功，则以其中的路由与可用模型声明为准，本配置不会覆盖 YAML 文件本身。',
    saving: '保存中...',
    saveAiConfig: '保存 AI 配置',
    saveChannelConfig: '保存渠道配置',
    noUnsavedChanges: '当前没有未保存的改动',
    savedNotice: '保存后提示',
    invalidChannelName: '渠道名称不能为空，且只能包含字母、数字或下划线。', invalidPrimaryModel: '当前主模型不在已启用渠道的模型列表中，请重新选择。', invalidAgentPrimaryModel: '当前 Agent 主模型不在已启用渠道的模型列表中，请重新选择。', invalidFallbackModel: '存在无效的备选模型，请重新选择。', invalidVisionModel: '当前 Vision 模型不在已启用渠道的模型列表中，请重新选择。', aiConfigSaved: 'AI 配置已保存', channelConfigSaved: '渠道配置已保存', connectionTesting: '测试中...', connectionSucceeded: (model, latencyMs) => `连接成功${model ? ` · ${model}` : ''}${latencyMs ? ` · ${latencyMs} ms` : ''}`, connectionTestFailed: '测试失败', fetchingModelList: '正在获取模型列表...', discoveredModels: (count, latencyMs) => `已获取 ${count} 个模型${latencyMs ? ` · ${latencyMs} ms` : ''}`, fetchModelsFailed: '获取模型失败', checkingRuntimeCapabilities: '正在检测运行时能力...', noCapabilityResults: '未返回能力检测结果', capabilityCheckFailed: '能力检测失败',
  },
  en: {
    title: 'AI model configuration',
    channelManagement: 'Channel management',
    description: 'Add provider channels to discover and select models automatically, or enter them manually. Configuration is synchronized to the .env file.',
    expand: 'Expand',
    collapse: 'Collapse',
    quickAdd: 'Quickly add a channel',
    quickAddDescription: 'Choose a provider preset, then create a configuration draft in one step.',
    channelCount: (count) => `${count} channel${count === 1 ? '' : 's'}`,
    addChannel: 'Add channel',
    selectProvider: 'Select provider',
    channelList: 'Channel list',
    enabledCount: (enabled, total) => `${enabled}/${total} enabled`,
    noChannels: 'No channels yet',
    noChannelsDescription: 'Choose a provider preset, then select “Add channel” to begin.',
    runtimeParameters: 'Runtime parameters',
    runtimeDescription: 'Primary, fallback, Vision, and Temperature values are written directly to the runtime configuration.',
    temperatureDescription: 'Controls output randomness: 0 is deterministic and 2 is most random. Recommended: 0.7.',
    noAvailableModels: 'Add at least one enabled channel and a model before the primary, fallback, and Vision options appear.',
    primaryModel: 'Primary model',
    automaticFirstModel: 'Automatic (use the first available model)',
    agentPrimaryModel: 'Agent primary model',
    automaticInheritedModel: 'Automatic (inherit the analysis primary model)',
    fallbackModels: 'Fallback models',
    fallbackDescription: 'Fallback models are used only when the primary model fails. The primary model is not duplicated.',
    visionModel: 'Vision model',
    automaticVisionModel: 'Automatic (follow the Vision default)',
    yamlRoutingNotice: 'Advanced model-routing YAML is configured. This section manages only channel entries and basic connection details. Runtime primary, fallback, Vision, and Temperature values are still controlled by the general fields below. When YAML is valid, its routes and available-model declarations take precedence; this page does not overwrite the YAML file.',
    saving: 'Saving...',
    saveAiConfig: 'Save AI configuration',
    saveChannelConfig: 'Save channel configuration',
    noUnsavedChanges: 'No unsaved changes',
    savedNotice: 'Post-save notice',
    invalidChannelName: 'A channel name is required and may contain only letters, numbers, and underscores.', invalidPrimaryModel: 'The selected primary model is not in an enabled channel. Choose it again.', invalidAgentPrimaryModel: 'The selected Agent primary model is not in an enabled channel. Choose it again.', invalidFallbackModel: 'One or more fallback models are invalid. Choose them again.', invalidVisionModel: 'The selected Vision model is not in an enabled channel. Choose it again.', aiConfigSaved: 'AI configuration saved', channelConfigSaved: 'Channel configuration saved', connectionTesting: 'Testing...', connectionSucceeded: (model, latencyMs) => `Connection succeeded${model ? ` · ${model}` : ''}${latencyMs ? ` · ${latencyMs} ms` : ''}`, connectionTestFailed: 'Connection test failed', fetchingModelList: 'Fetching model list...', discoveredModels: (count, latencyMs) => `${count} model${count === 1 ? '' : 's'} fetched${latencyMs ? ` · ${latencyMs} ms` : ''}`, fetchModelsFailed: 'Could not fetch models', checkingRuntimeCapabilities: 'Checking runtime capabilities...', noCapabilityResults: 'No capability-check results returned', capabilityCheckFailed: 'Capability check failed',
  },
  ko: {
    title: 'AI 모델 설정',
    channelManagement: '채널 관리',
    description: '공급자 채널을 추가하면 모델 목록을 자동으로 가져와 여러 개를 선택하거나 직접 입력할 수 있습니다. 설정은 .env 파일에 자동으로 반영됩니다.',
    expand: '펼치기',
    collapse: '접기',
    quickAdd: '채널 빠르게 추가',
    quickAddDescription: '공급자 사전 설정을 선택한 뒤 설정 초안을 한 번에 만듭니다.',
    channelCount: (count) => `채널 ${count}개`,
    addChannel: '채널 추가',
    selectProvider: '공급자 선택',
    channelList: '채널 목록',
    enabledCount: (enabled, total) => `${enabled}/${total}개 사용`,
    noChannels: '채널이 없습니다',
    noChannelsDescription: '공급자 사전 설정을 고른 후 “채널 추가”를 눌러 설정을 시작하세요.',
    runtimeParameters: '런타임 매개변수',
    runtimeDescription: '기본 모델, 대체 모델, Vision 및 Temperature 값은 런타임 설정에 직접 저장됩니다.',
    temperatureDescription: '모델 출력의 무작위성을 조절합니다. 0은 결정적 출력, 2는 최대 무작위성이며 0.7을 권장합니다.',
    noAvailableModels: '사용 중인 채널을 하나 이상 추가하고 모델을 입력하면 기본 모델 / 대체 모델 / Vision 옵션이 나타납니다.',
    primaryModel: '기본 모델',
    automaticFirstModel: '자동(첫 번째 사용 가능 모델 사용)',
    agentPrimaryModel: 'Agent 기본 모델',
    automaticInheritedModel: '자동(일반 분석 기본 모델 상속)',
    fallbackModels: '대체 모델',
    fallbackDescription: '대체 모델은 기본 모델이 실패할 때만 사용됩니다. 기본 모델은 대체 모델에 중복 추가되지 않습니다.',
    visionModel: 'Vision 모델',
    automaticVisionModel: '자동(Vision 기본 로직 따르기)',
    yamlRoutingNotice: '고급 모델 라우팅 YAML이 설정되어 있습니다. 이 영역에서는 채널 항목과 기본 연결 정보만 관리합니다. 런타임 기본 모델 / 대체 모델 / Vision / Temperature는 아래 일반 필드에서 계속 결정됩니다. YAML 해석에 성공하면 그 안의 라우팅 및 사용 가능 모델 선언이 우선하며, 이 설정은 YAML 파일 자체를 덮어쓰지 않습니다.',
    saving: '저장 중...',
    saveAiConfig: 'AI 설정 저장',
    saveChannelConfig: '채널 설정 저장',
    noUnsavedChanges: '저장하지 않은 변경 사항이 없습니다',
    savedNotice: '저장 후 안내',
    invalidChannelName: '채널 이름은 비워 둘 수 없으며 영문자, 숫자, 밑줄만 사용할 수 있습니다.', invalidPrimaryModel: '선택한 기본 모델이 사용 중인 채널의 모델 목록에 없습니다. 다시 선택하세요.', invalidAgentPrimaryModel: '선택한 Agent 기본 모델이 사용 중인 채널의 모델 목록에 없습니다. 다시 선택하세요.', invalidFallbackModel: '유효하지 않은 대체 모델이 있습니다. 다시 선택하세요.', invalidVisionModel: '선택한 Vision 모델이 사용 중인 채널의 모델 목록에 없습니다. 다시 선택하세요.', aiConfigSaved: 'AI 설정이 저장되었습니다', channelConfigSaved: '채널 설정이 저장되었습니다', connectionTesting: '연결 테스트 중...', connectionSucceeded: (model, latencyMs) => `연결 성공${model ? ` · ${model}` : ''}${latencyMs ? ` · ${latencyMs}ms` : ''}`, connectionTestFailed: '연결 테스트 실패', fetchingModelList: '모델 목록을 가져오는 중...', discoveredModels: (count, latencyMs) => `모델 ${count}개를 가져왔습니다${latencyMs ? ` · ${latencyMs}ms` : ''}`, fetchModelsFailed: '모델을 가져오지 못했습니다', checkingRuntimeCapabilities: '런타임 능력을 검사하는 중...', noCapabilityResults: '능력 검사 결과가 반환되지 않았습니다', capabilityCheckFailed: '능력 검사 실패',
  },
};

interface LlmChannelRowText {
  modelConfigured: (count: number) => string;
  noModelConfigured: string;
  connectionHealthy: string;
  connectionFailed: string;
  testing: string;
  keyMissing: string;
  deleteChannel: string;
  channelName: string;
  protocol: string;
  selectProtocol: string;
  officialApiCanBeBlank: string;
  configurationReference: string;
  officialSources: string;
  capabilityNotice: string;
  localOllamaCanBeBlank: string;
  multipleKeys: string;
  fetchingModels: string;
  fetchModels: string;
  discoveryDefault: string;
  selectableModels: string;
  manualModelsWithDiscovery: string;
  manualModels: string;
  discoveredModelHint: string;
  manualModelHint: string;
  extraManualModels: (models: string) => string;
  testConnection: string;
  firstModelNotice: (model: string) => string;
  runtimeCapabilityTesting: string;
  runtimeCapabilityTitle: string;
  runtimeCapabilityDescription: string;
  checking: string;
  checkCapabilities: string;
}

const LLM_CHANNEL_ROW_TEXT: Record<UiLanguage, LlmChannelRowText> = {
  zh: {
    modelConfigured: (count) => `${count} 个模型已配置`, noModelConfigured: '未配置模型', connectionHealthy: '连接正常', connectionFailed: '连接失败', testing: '测试中', keyMissing: '未填 Key', deleteChannel: '删除渠道', channelName: '渠道名称', protocol: '协议', selectProtocol: '选择协议', officialApiCanBeBlank: '官方接口可留空', configurationReference: '配置参考', officialSources: '官方来源：', capabilityNotice: '能力标签仅用于配置参考，不代表运行时能力已验证通过。', localOllamaCanBeBlank: '本地 Ollama 可留空', multipleKeys: '支持多个 Key 逗号分隔', fetchingModels: '获取中...', fetchModels: '获取模型', discoveryDefault: '支持 `/models` 的 OpenAI Compatible 渠道可自动拉取模型。', selectableModels: '可选模型（可多选）', manualModelsWithDiscovery: '手动模型（逗号分隔）', manualModels: '模型（逗号分隔）', discoveredModelHint: '如有自定义模型名未出现在列表中，可继续手动补充，保存格式仍为逗号分隔。', manualModelHint: '若渠道不支持自动发现或请求失败，可直接手动填写模型列表。', extraManualModels: (models) => `额外手动模型：${models}`, testConnection: '测试连接', firstModelNotice: (model) => `基础连接测试默认使用模型列表首项：${model}`, runtimeCapabilityTesting: '运行时能力检测（可选）', runtimeCapabilityTitle: '运行时能力检测', runtimeCapabilityDescription: '仅在手动触发时发起真实 LLM 请求；多选可能需要 20-40 秒。', checking: '检测中...', checkCapabilities: '检测能力',
  },
  en: {
    modelConfigured: (count) => `${count} model${count === 1 ? '' : 's'} configured`, noModelConfigured: 'No model configured', connectionHealthy: 'Connection healthy', connectionFailed: 'Connection failed', testing: 'Testing', keyMissing: 'Key missing', deleteChannel: 'Delete channel', channelName: 'Channel name', protocol: 'Protocol', selectProtocol: 'Select protocol', officialApiCanBeBlank: 'Leave blank for the official API', configurationReference: 'Configuration reference', officialSources: 'Official sources:', capabilityNotice: 'Capability labels are configuration references only; they do not confirm runtime support.', localOllamaCanBeBlank: 'Leave blank for local Ollama', multipleKeys: 'Separate multiple keys with commas', fetchingModels: 'Fetching...', fetchModels: 'Fetch models', discoveryDefault: 'OpenAI Compatible channels that support `/models` can fetch models automatically.', selectableModels: 'Available models (multiple selection)', manualModelsWithDiscovery: 'Manual models (comma-separated)', manualModels: 'Models (comma-separated)', discoveredModelHint: 'Add custom models manually when they are not in the discovered list; the saved format remains comma-separated.', manualModelHint: 'Enter models manually when automatic discovery is unavailable or fails.', extraManualModels: (models) => `Additional manual models: ${models}`, testConnection: 'Test connection', firstModelNotice: (model) => `The basic connection test uses the first model: ${model}`, runtimeCapabilityTesting: 'Runtime capability checks (optional)', runtimeCapabilityTitle: 'Runtime capability checks', runtimeCapabilityDescription: 'Real LLM requests are sent only when manually triggered; multiple checks can take 20–40 seconds.', checking: 'Checking...', checkCapabilities: 'Check capabilities',
  },
  ko: {
    modelConfigured: (count) => `모델 ${count}개 설정됨`, noModelConfigured: '설정된 모델 없음', connectionHealthy: '연결 정상', connectionFailed: '연결 실패', testing: '테스트 중', keyMissing: 'Key 미입력', deleteChannel: '채널 삭제', channelName: '채널 이름', protocol: '프로토콜', selectProtocol: '프로토콜 선택', officialApiCanBeBlank: '공식 API는 비워 둘 수 있음', configurationReference: '설정 참고', officialSources: '공식 출처:', capabilityNotice: '능력 라벨은 설정 참고용이며, 런타임 능력이 검증되었음을 뜻하지 않습니다.', localOllamaCanBeBlank: '로컬 Ollama는 비워 둘 수 있음', multipleKeys: '여러 Key는 쉼표로 구분', fetchingModels: '가져오는 중...', fetchModels: '모델 가져오기', discoveryDefault: '`/models`를 지원하는 OpenAI Compatible 채널은 모델을 자동으로 가져올 수 있습니다.', selectableModels: '선택 가능한 모델(복수 선택)', manualModelsWithDiscovery: '직접 입력 모델(쉼표 구분)', manualModels: '모델(쉼표 구분)', discoveredModelHint: '목록에 없는 사용자 지정 모델은 직접 추가할 수 있으며 저장 형식은 계속 쉼표 구분입니다.', manualModelHint: '자동 검색을 지원하지 않거나 요청에 실패한 채널은 모델 목록을 직접 입력하세요.', extraManualModels: (models) => `추가 직접 입력 모델: ${models}`, testConnection: '연결 테스트', firstModelNotice: (model) => `기본 연결 테스트는 모델 목록의 첫 모델을 사용합니다: ${model}`, runtimeCapabilityTesting: '런타임 능력 검사(선택 사항)', runtimeCapabilityTitle: '런타임 능력 검사', runtimeCapabilityDescription: '수동으로 실행할 때만 실제 LLM 요청을 보냅니다. 여러 항목을 선택하면 20~40초가 걸릴 수 있습니다.', checking: '검사 중...', checkCapabilities: '능력 검사',
  },
};

const KOREAN_PROVIDER_LABELS: Record<string, string> = {
  aihubmix: 'AIHubmix(통합 플랫폼)',
  anspire: 'Anspire Open(모델·검색 통합)',
  deepseek: 'DeepSeek 공식',
  dashscope: '퉁이쳰원(Dashscope)',
  zhipu: '즈푸 GLM',
  moonshot: 'Moonshot(달의 어두운 면)',
  minimax: 'MiniMax 공식',
  volcengine: '화산 방주(더우바오)',
  siliconflow: '실리콘플로우(SiliconFlow)',
  openrouter: 'OpenRouter',
  gemini: 'Gemini 공식',
  anthropic: 'Anthropic 공식',
  openai: 'OpenAI 공식',
  ollama: 'Ollama(로컬)',
  custom: '사용자 지정 채널',
};

function getProviderDisplayLabel(channelId: string, defaultLabel: string, language: UiLanguage): string {
  return language === 'ko' ? KOREAN_PROVIDER_LABELS[channelId] || defaultLabel : defaultLabel;
}

const PROTOCOL_OPTIONS: Array<{ value: ChannelProtocol; label: string }> = [
  { value: 'openai', label: 'OpenAI Compatible' },
  { value: 'deepseek', label: 'DeepSeek' },
  { value: 'gemini', label: 'Gemini' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'vertex_ai', label: 'Vertex AI' },
  { value: 'ollama', label: 'Ollama' },
];

const KNOWN_MODEL_PREFIXES = new Set([
  'openai',
  'anthropic',
  'gemini',
  'vertex_ai',
  'deepseek',
  'minimax',
  'ollama',
  'cohere',
  'huggingface',
  'bedrock',
  'sagemaker',
  'azure',
  'replicate',
  'together_ai',
  'palm',
  'text-completion-openai',
  'command-r',
  'groq',
  'cerebras',
  'fireworks_ai',
  'friendliai',
]);

const CHANNEL_FIELD_SUFFIXES = ['PROTOCOL', 'BASE_URL', 'API_KEY', 'API_KEYS', 'MODELS', 'EXTRA_HEADERS', 'ENABLED'] as const;
const CHANNEL_FIELD_KEY_PATTERN = /^LLM_([A-Z0-9_]+)_(PROTOCOL|BASE_URL|API_KEY|API_KEYS|MODELS|EXTRA_HEADERS|ENABLED)$/;
const FALSEY_VALUES = new Set(['0', 'false', 'no', 'off']);

const RUNTIME_CAPABILITY_OPTIONS: Array<{ value: LLMCapabilityCheck; label: string; hint: string }> = [
  { value: 'json', label: 'JSON', hint: '检测 response_format JSON 输出是否可用。' },
  { value: 'tools', label: 'Tools', hint: '检测 function/tool calling 是否可用。' },
  { value: 'stream', label: 'Stream', hint: '检测流式输出是否能返回有效 chunk。' },
  { value: 'vision', label: 'Vision', hint: '检测当前模型是否接受 image_url 输入。' },
];

const CAPABILITY_STATUS_LABELS: Record<LLMCapabilityCheckResult['status'], string> = {
  passed: '通过',
  failed: '失败',
  skipped: '跳过',
};

interface ChannelConfig {
  id: string;
  name: string;
  protocol: ChannelProtocol;
  baseUrl: string;
  apiKey: string;
  models: string;
  enabled: boolean;
}

interface ChannelTestState {
  status: 'idle' | 'loading' | 'success' | 'error';
  text?: string;
  hint?: string;
}

interface ChannelDiscoveryState {
  status: 'idle' | 'loading' | 'success' | 'error';
  text?: string;
  hint?: string;
  models: string[];
}

interface ChannelCapabilityState {
  selected: LLMCapabilityCheck[];
  status: 'idle' | 'loading' | 'success' | 'error';
  text?: string;
  hint?: string;
  results: Partial<Record<LLMCapabilityCheck, LLMCapabilityCheckResult>>;
}

interface RuntimeConfig {
  primaryModel: string;
  agentPrimaryModel: string;
  fallbackModels: string[];
  visionModel: string;
  temperature: string;
}

interface LLMChannelEditorProps {
  items: Array<{ key: string; value: string; rawValueExists?: boolean }>;
  configVersion: string;
  maskToken: string;
  onSaved: (updatedItems: Array<{ key: string; value: string }>) => void | Promise<void>;
  disabled?: boolean;
}

interface ChannelRowProps {
  channel: ChannelConfig;
  index: number;
  busy: boolean;
  visibleKey: boolean;
  expanded: boolean;
  testState?: ChannelTestState;
  discoveryState?: ChannelDiscoveryState;
  capabilityState?: ChannelCapabilityState;
  onUpdate: (index: number, field: keyof ChannelConfig, value: string | boolean) => void;
  onRemove: (index: number) => void;
  onToggleExpand: (index: number) => void;
  onToggleKeyVisibility: (index: number, nextVisible: boolean) => void;
  onTest: (channel: ChannelConfig, index: number) => void;
  onDiscoverModels: (channel: ChannelConfig) => void;
  onToggleCapability: (channel: ChannelConfig, capability: LLMCapabilityCheck) => void;
  onCheckCapabilities: (channel: ChannelConfig) => void;
}

const LLM_CHANNEL_HELP_DOCS = [
  {
    label: 'LLM 配置指南',
    href: 'https://github.com/ZhuLinsen/daily_stock_analysis/blob/main/docs/LLM_CONFIG_GUIDE.md',
  },
  {
    label: 'LLM 服务商配置速查',
    href: 'https://github.com/ZhuLinsen/daily_stock_analysis/blob/main/docs/llm-providers.md',
  },
];

function HelpLabel({
  htmlFor,
  label,
  fieldKey,
  helpKey,
  examples,
  compact = false,
}: {
  htmlFor?: string;
  label: string;
  fieldKey: string;
  helpKey: string;
  examples?: string[];
  compact?: boolean;
}) {
  return (
    <div className={compact ? 'mb-1 flex items-center gap-1.5' : 'mb-2 flex items-center gap-1.5'}>
      <label
        htmlFor={htmlFor}
        className={compact ? 'text-xs text-muted-text' : 'text-sm font-medium text-foreground'}
      >
        {label}
      </label>
      <SettingsHelpButton
        fieldKey={fieldKey}
        title={label}
        helpKey={helpKey}
        examples={examples}
        docs={LLM_CHANNEL_HELP_DOCS}
      />
    </div>
  );
}

function parseChannelFieldKeys(channel: ChannelConfig): string[] {
  const upperName = channel.name.trim().toUpperCase();
  return [
    `LLM_${upperName}_PROTOCOL`,
    `LLM_${upperName}_BASE_URL`,
    `LLM_${upperName}_ENABLED`,
    `LLM_${upperName}_API_KEY`,
    `LLM_${upperName}_API_KEYS`,
    `LLM_${upperName}_MODELS`,
    `LLM_${upperName}_EXTRA_HEADERS`,
  ];
}

function parseChannelFieldKeysFromName(name: string): string[] {
  const upperName = name.trim().toUpperCase();
  return CHANNEL_FIELD_SUFFIXES.map((suffix) => `LLM_${upperName}_${suffix}`);
}

function isChannelSecretFieldKey(key: string): boolean {
  const match = CHANNEL_FIELD_KEY_PATTERN.exec(key.toUpperCase());
  return match?.[2] === 'API_KEY' || match?.[2] === 'API_KEYS';
}

function resolveInitialChannelApiKeySource(
  channelName: string,
  initialItemValueByKey: Map<string, string>,
  initialItemSourceByKey: Map<string, boolean>,
): boolean | undefined {
  const upperName = channelName.trim().toUpperCase();
  const apiKeysKey = `LLM_${upperName}_API_KEYS`;
  const apiKeyKey = `LLM_${upperName}_API_KEY`;

  const apiKeysValue = (initialItemValueByKey.get(apiKeysKey) || '').trim();
  const apiKeyValue = (initialItemValueByKey.get(apiKeyKey) || '').trim();

  if (apiKeysValue && initialItemSourceByKey.has(apiKeysKey)) {
    return initialItemSourceByKey.get(apiKeysKey);
  }
  if (apiKeyValue && initialItemSourceByKey.has(apiKeyKey)) {
    return initialItemSourceByKey.get(apiKeyKey);
  }

  if (apiKeyValue) {
    return initialItemSourceByKey.get(apiKeyKey);
  }
  if (apiKeysValue) {
    return initialItemSourceByKey.get(apiKeysKey);
  }
  return initialItemSourceByKey.get(apiKeysKey) ?? initialItemSourceByKey.get(apiKeyKey);
}

function resolveInitialChannelApiKeyValue(
  channelName: string,
  itemValueByKey: Map<string, string>,
  itemSourceByKey: Map<string, boolean>,
): string {
  const upperName = channelName.trim().toUpperCase();
  const apiKeysKey = `LLM_${upperName}_API_KEYS`;
  const apiKeyKey = `LLM_${upperName}_API_KEY`;

  const apiKeysValue = (itemValueByKey.get(apiKeysKey) || '').trim();
  const apiKeyValue = (itemValueByKey.get(apiKeyKey) || '').trim();

  if (apiKeysValue && itemSourceByKey.has(apiKeysKey)) {
    return apiKeysValue;
  }
  if (apiKeyValue && itemSourceByKey.has(apiKeyKey)) {
    return apiKeyValue;
  }
  if (apiKeysValue) {
    return apiKeysValue;
  }
  if (apiKeyValue) {
    return apiKeyValue;
  }
  return itemValueByKey.get(apiKeysKey) || itemValueByKey.get(apiKeyKey) || '';
}

function buildChangedItemKeys(
  channels: ChannelConfig[],
  initialChannels: ChannelConfig[],
  initialItemSourceByKey: Map<string, boolean>,
  initialItemValueByKey: Map<string, string>,
): Set<string> {
  const changedKeys = new Set<string>();
  const nextChannelNames = channels.map((channel) => channel.name.trim().toLowerCase()).join(',');
  const previousChannelNames = initialChannels.map((channel) => channel.name.trim().toLowerCase()).join(',');

  if (nextChannelNames !== previousChannelNames) {
    changedKeys.add('LLM_CHANNELS');
  }

  const maxLength = Math.max(channels.length, initialChannels.length);
  for (let index = 0; index < maxLength; index += 1) {
    const current = channels[index];
    const previous = initialChannels[index];
    if (!current && !previous) {
      continue;
    }

    if (!current) {
      const previousKeys = parseChannelFieldKeys(previous);
      for (const key of previousKeys) {
        if (initialItemSourceByKey.get(key.toUpperCase()) !== false) {
          changedKeys.add(key);
        }
      }
      continue;
    }

    if (!previous) {
      for (const key of parseChannelFieldKeys(current)) {
        changedKeys.add(key);
      }
      continue;
    }

    const currentName = current.name.trim().toUpperCase();
    const previousName = previous.name.trim().toUpperCase();
    if (currentName !== previousName) {
      const previousApiKeySource = resolveInitialChannelApiKeySource(
        previous.name,
        initialItemValueByKey,
        initialItemSourceByKey,
      );
      const preserveRuntimeOnlySecret = previousApiKeySource === false && current.apiKey === previous.apiKey;
      const previousKeys = parseChannelFieldKeys(previous);
      for (const key of previousKeys) {
        if (initialItemSourceByKey.get(key.toUpperCase()) !== false) {
          changedKeys.add(key);
        }
      }

      for (const key of parseChannelFieldKeys(current)) {
        if (preserveRuntimeOnlySecret && isChannelSecretFieldKey(key)) {
          continue;
        }
        changedKeys.add(key);
      }
      continue;
    }

    const prefix = `LLM_${currentName}`;
    if (current.protocol !== previous.protocol) {
      changedKeys.add(`${prefix}_PROTOCOL`);
    }
    if (current.baseUrl !== previous.baseUrl) {
      changedKeys.add(`${prefix}_BASE_URL`);
    }
    if (current.enabled !== previous.enabled) {
      changedKeys.add(`${prefix}_ENABLED`);
    }
    if (current.apiKey !== previous.apiKey) {
      changedKeys.add(`${prefix}_API_KEY`);
      changedKeys.add(`${prefix}_API_KEYS`);
    }
    if (current.models !== previous.models) {
      changedKeys.add(`${prefix}_MODELS`);
    }
  }

  return changedKeys;
}

const ChannelRow: React.FC<ChannelRowProps> = ({
  channel,
  index,
  busy,
  visibleKey,
  expanded,
  testState,
  discoveryState,
  capabilityState,
  onUpdate,
  onRemove,
  onToggleExpand,
  onToggleKeyVisibility,
  onTest,
  onDiscoverModels,
  onToggleCapability,
  onCheckCapabilities,
}) => {
  const { language } = useUiLanguage();
  const text = LLM_CHANNEL_ROW_TEXT[language];
  const preset = getProviderTemplate(channel.name);
  const showProviderTemplateDetails = isKnownProviderTemplate(channel.name);
  const displayName = preset
    ? getProviderDisplayLabel(preset.channelId, preset.label, language)
    : channel.name;
  const providerCapabilities = showProviderTemplateDetails ? (preset?.capabilities || []) : [];
  const providerSources = showProviderTemplateDetails ? (preset?.officialSources || []) : [];
  const providerHint = showProviderTemplateDetails ? preset?.configHint : undefined;
  const selectedModels = splitModels(channel.models);
  const discoveredModels = discoveryState?.models || [];
  const manualOnlyModels = selectedModels.filter(
    (model) => !discoveredModels.some((discoveredModel) => areModelsEquivalent(model, discoveredModel, channel.protocol)),
  );
  const modelCount = selectedModels.length;
  const hasKey = channel.apiKey.length > 0;
  const statusVariant = testState?.status === 'success'
    ? 'success'
    : testState?.status === 'error'
      ? 'danger'
      : testState?.status === 'loading'
        ? 'warning'
        : 'default';
  const selectedCapabilities = capabilityState?.selected || [];
  const capabilityResults = capabilityState?.results || {};
  const capabilityBusy = capabilityState?.status === 'loading';
  const channelNameInputId = `llm-channel-${channel.id}-name`;
  const protocolInputId = `llm-channel-${channel.id}-protocol`;
  const baseUrlInputId = `llm-channel-${channel.id}-base-url`;
  const apiKeyInputId = `llm-channel-${channel.id}-api-key`;
  const modelsInputId = `llm-channel-${channel.id}-models`;

  return (
    <div className="mb-2 overflow-hidden rounded-xl border border-[var(--settings-border)] bg-[var(--settings-surface)] shadow-soft-card transition-[background-color,border-color,box-shadow] duration-200 hover:border-[var(--settings-border-strong)] hover:bg-[var(--settings-surface-hover)]">
      <div
        className="flex cursor-pointer select-none items-center gap-2.5 px-4 py-3 transition-colors"
        onClick={() => onToggleExpand(index)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggleExpand(index);
          }
        }}
        role="button"
        tabIndex={0}
      >
        <span className={`w-4 shrink-0 text-[11px] text-muted-text transition-transform ${expanded ? 'rotate-90' : ''}`}>▶</span>

        <input
          type="checkbox"
          checked={channel.enabled}
          disabled={busy}
          className="settings-input-checkbox h-4 w-4 shrink-0 rounded border-border/70 bg-base"
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onUpdate(index, 'enabled', e.target.checked)}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-foreground">{displayName}</span>
            <Badge variant="info" className="hidden sm:inline-flex">
              {channel.protocol}
            </Badge>
          </div>
          <p className="mt-0.5 truncate text-[11px] text-secondary-text">
            {modelCount > 0 ? text.modelConfigured(modelCount) : text.noModelConfigured}
          </p>
        </div>

        <span className="flex shrink-0 items-center gap-2">
          {testState?.status === 'success' ? (
            <Tooltip content={text.connectionHealthy}>
              <span className="inline-flex">
                <StatusDot tone="success" />
              </span>
            </Tooltip>
          ) : null}
          {testState?.status === 'error' ? (
            <Tooltip content={text.connectionFailed}>
              <span className="inline-flex">
                <StatusDot tone="danger" />
              </span>
            </Tooltip>
          ) : null}
          {testState?.status === 'loading' ? (
            <Tooltip content={text.testing}>
              <span className="inline-flex">
                <StatusDot tone="warning" pulse />
              </span>
            </Tooltip>
          ) : null}
          {!hasKey && channel.protocol !== 'ollama' ? <Badge variant="warning">{text.keyMissing}</Badge> : null}
          {testState?.status !== 'idle' ? (
            <Badge variant={statusVariant}>
              {testState?.status === 'success' ? text.connectionHealthy : testState?.status === 'error' ? text.connectionFailed : text.testing}
            </Badge>
          ) : null}
        </span>

        <Tooltip content={text.deleteChannel}>
          <span className="inline-flex">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 shrink-0 px-2 text-xs text-muted-text hover:text-rose-300"
              disabled={busy}
              onClick={(e) => {
                e.stopPropagation();
                onRemove(index);
              }}
            >
              ✕
            </Button>
          </span>
        </Tooltip>
      </div>

      {expanded ? (
        <div className="settings-surface-overlay-soft space-y-4 px-4 py-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <HelpLabel
                htmlFor={channelNameInputId}
                label={text.channelName}
                fieldKey="LLM_CHANNEL_NAME"
                helpKey="settings.llm_channel.channel_name"
                examples={['LLM_CHANNELS=deepseek,aihubmix', 'LLM_DEEPSEEK_MODELS=deepseek-v4-flash,deepseek-v4-pro']}
              />
            <Input
              id={channelNameInputId}
              value={channel.name}
              disabled={busy}
              onChange={(e) => onUpdate(index, 'name', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="primary"
            />
            </div>
            <div className="space-y-2">
              <HelpLabel
                htmlFor={protocolInputId}
                label={text.protocol}
                fieldKey="LLM_CHANNEL_PROTOCOL"
                helpKey="settings.llm_channel.protocol"
                examples={['LLM_DEEPSEEK_PROTOCOL=deepseek', 'LLM_OPENROUTER_PROTOCOL=openai']}
              />
              <Select
                id={protocolInputId}
                value={channel.protocol}
                onChange={(v) => onUpdate(index, 'protocol', normalizeProtocol(v))}
                options={PROTOCOL_OPTIONS}
                disabled={busy}
                placeholder={text.selectProtocol}
              />
            </div>
          </div>

          <div>
            <HelpLabel
              htmlFor={baseUrlInputId}
              label="Base URL"
              fieldKey="LLM_CHANNEL_BASE_URL"
              helpKey="settings.llm_channel.base_url"
              examples={['LLM_DEEPSEEK_BASE_URL=https://api.deepseek.com', 'LLM_OPENROUTER_BASE_URL=https://openrouter.ai/api/v1']}
            />
          <Input
            id={baseUrlInputId}
            value={channel.baseUrl}
            disabled={busy}
            onChange={(e) => onUpdate(index, 'baseUrl', e.target.value)}
            placeholder={
              channel.protocol === 'gemini' || channel.protocol === 'anthropic'
                ? text.officialApiCanBeBlank
                : preset?.baseUrl || 'https://api.example.com/v1'
            }
          />
          </div>

          {showProviderTemplateDetails ? (
            <div className="space-y-2 rounded-xl border border-[var(--settings-border)] bg-[var(--settings-surface-hover)] p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-medium text-muted-text">{text.configurationReference}</span>
                {providerCapabilities.map((capability) => {
                  const capabilityMeta = LLM_PROVIDER_CAPABILITY_LABELS[capability];
                  return (
                    <Tooltip key={capability} content={capabilityMeta.hint}>
                      <span className="inline-flex">
                        <Badge variant="default" className="border-[var(--settings-border)] bg-[var(--settings-surface)] text-secondary-text">
                          {capabilityMeta.label}
                        </Badge>
                      </span>
                    </Tooltip>
                  );
                })}
              </div>
              {providerHint ? (
                <p className="text-[11px] leading-5 text-secondary-text">{providerHint}</p>
              ) : null}
              {providerSources.length > 0 ? (
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] leading-5 text-secondary-text">
                  <span>{text.officialSources}</span>
                  {providerSources.map((source) => (
                    <a
                      key={source.url}
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="settings-accent-text underline-offset-2 hover:underline"
                    >
                      {source.label}
                    </a>
                  ))}
                </p>
              ) : null}
              <p className="text-[11px] leading-5 text-muted-text">
                {text.capabilityNotice}
              </p>
            </div>
          ) : null}

          <div>
            <HelpLabel
              htmlFor={apiKeyInputId}
              label="API Key"
              fieldKey="LLM_CHANNEL_API_KEY"
              helpKey="settings.llm_channel.api_key"
              examples={['LLM_DEEPSEEK_API_KEY=sk-xxxx', 'LLM_OPENAI_API_KEYS=sk-key-1,sk-key-2']}
            />
          <Input
            id={apiKeyInputId}
            type="password"
            allowTogglePassword
            iconType="key"
            passwordVisible={visibleKey}
            onPasswordVisibleChange={(nextVisible) => onToggleKeyVisibility(index, nextVisible)}
            value={channel.apiKey}
            disabled={busy}
            onChange={(e) => onUpdate(index, 'apiKey', e.target.value)}
            placeholder={channel.protocol === 'ollama' ? text.localOllamaCanBeBlank : text.multipleKeys}
          />
          </div>

          <div className="space-y-3 rounded-xl border border-[var(--settings-border)] bg-[var(--settings-surface-hover)] p-3">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="settings-secondary"
                size="sm"
                className="px-3 text-[11px] shadow-none"
                disabled={busy}
                onClick={() => onDiscoverModels(channel)}
              >
                {discoveryState?.status === 'loading' ? text.fetchingModels : text.fetchModels}
              </Button>
              <span className={`text-xs ${
                discoveryState?.status === 'success'
                  ? 'text-success'
                  : discoveryState?.status === 'error'
                    ? 'text-danger'
                    : 'text-muted-text'
              }`}
              >
                {discoveryState?.text || text.discoveryDefault}
              </span>
            </div>
            {discoveryState?.hint ? (
              <p className="text-[11px] text-secondary-text">
                {discoveryState.hint}
              </p>
            ) : null}

            {discoveredModels.length > 0 ? (
              <div>
                <HelpLabel
                  label={text.selectableModels}
                  fieldKey="LLM_CHANNEL_DISCOVERED_MODELS"
                  helpKey="settings.llm_channel.models"
                  examples={['LLM_DEEPSEEK_MODELS=deepseek-v4-flash,deepseek-v4-pro']}
                />
                <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl border border-[var(--settings-border)] bg-[var(--settings-surface)] p-3">
                  {discoveredModels.map((model) => (
                    <label key={model} className="flex items-center gap-2 text-sm text-secondary-text">
                      <input
                        type="checkbox"
                        checked={selectedModels.some((selectedModel) => (
                          areModelsEquivalent(selectedModel, model, channel.protocol)
                        ))}
                        disabled={busy}
                        onChange={() => onUpdate(index, 'models', toggleModelSelection(channel.models, model, channel.protocol))}
                        className="settings-input-checkbox h-4 w-4 rounded border-border/70 bg-base"
                      />
                      <span>{model}</span>
                    </label>
                  ))}
                </div>
              </div>
            ) : null}

            <div>
              <HelpLabel
                htmlFor={modelsInputId}
                label={discoveredModels.length > 0 ? text.manualModelsWithDiscovery : text.manualModels}
                fieldKey="LLM_CHANNEL_MODELS"
                helpKey="settings.llm_channel.models"
                examples={['LLM_DEEPSEEK_MODELS=deepseek-v4-flash,deepseek-v4-pro', 'LLM_OLLAMA_MODELS=qwen3:8b,llama3.1:8b']}
              />
            <Input
              id={modelsInputId}
              value={channel.models}
              disabled={busy}
              onChange={(e) => onUpdate(index, 'models', e.target.value)}
              placeholder={preset?.placeholderModels || MODEL_PLACEHOLDERS_BY_PROTOCOL[channel.protocol]}
              hint={
                discoveredModels.length > 0
                  ? text.discoveredModelHint
                  : text.manualModelHint
              }
            />
            </div>

            {manualOnlyModels.length > 0 ? (
              <p className="text-[11px] text-secondary-text">
                {text.extraManualModels(manualOnlyModels.join(', '))}
              </p>
            ) : null}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Button
              type="button"
              variant="settings-secondary"
              size="sm"
              className="px-3 text-[11px] shadow-none"
              disabled={busy}
              onClick={() => onTest(channel, index)}
            >
              {testState?.status === 'loading' ? `${text.testing}...` : text.testConnection}
            </Button>
            {testState?.text ? (
              <div className="space-y-1">
                <span className={`block text-xs ${
                  testState.status === 'success'
                    ? 'text-success'
                    : testState.status === 'error'
                      ? 'text-danger'
                      : 'text-muted-text'
                }`}
                >
                  {testState.text}
                </span>
                {selectedModels[0] ? (
                  <p className="text-[11px] text-secondary-text">
                    {text.firstModelNotice(selectedModels[0])}
                  </p>
                ) : null}
                {testState.hint ? (
                  <p className="text-[11px] text-secondary-text">
                    {testState.hint}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="space-y-3 rounded-xl border border-[var(--settings-border)] bg-[var(--settings-surface-hover)] p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-[11px] font-medium text-muted-text">{text.runtimeCapabilityTesting}</p>
                  <SettingsHelpButton
                    fieldKey="LLM_CHANNEL_CAPABILITY_CHECKS"
                    title={text.runtimeCapabilityTitle}
                    helpKey="settings.llm_channel.capability_checks"
                    examples={['JSON / Tools / Stream / Vision']}
                    docs={LLM_CHANNEL_HELP_DOCS}
                  />
                </div>
                <p className="mt-0.5 text-[11px] text-secondary-text">
                  {text.runtimeCapabilityDescription}
                </p>
              </div>
              <Button
                type="button"
                variant="settings-secondary"
                size="sm"
                className="px-3 text-[11px] shadow-none"
                disabled={busy || capabilityBusy || selectedCapabilities.length === 0}
                onClick={() => onCheckCapabilities(channel)}
              >
                {capabilityBusy ? text.checking : text.checkCapabilities}
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {RUNTIME_CAPABILITY_OPTIONS.map((option) => (
                <Tooltip key={option.value} content={option.hint}>
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--settings-border)] bg-[var(--settings-surface)] px-2 py-1 text-[11px] text-secondary-text">
                    <input
                      type="checkbox"
                      checked={selectedCapabilities.includes(option.value)}
                      disabled={busy || capabilityBusy}
                      onChange={() => onToggleCapability(channel, option.value)}
                      className="settings-input-checkbox h-3.5 w-3.5 rounded border-border/70 bg-base"
                    />
                    <span>{option.label}</span>
                  </label>
                </Tooltip>
              ))}
            </div>

            {capabilityState?.text ? (
              <div className="space-y-1">
                <p className={`text-xs ${
                  capabilityState.status === 'success'
                    ? 'text-success'
                    : capabilityState.status === 'error'
                      ? 'text-danger'
                      : 'text-muted-text'
                }`}
                >
                  {capabilityState.text}
                </p>
                {capabilityState.hint ? (
                  <p className="text-[11px] text-secondary-text">{capabilityState.hint}</p>
                ) : null}
              </div>
            ) : null}

            {Object.keys(capabilityResults).length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {RUNTIME_CAPABILITY_OPTIONS.map((option) => {
                  const result = capabilityResults[option.value];
                  if (!result) return null;
                  return (
                    <Tooltip key={option.value} content={result.message}>
                      <span className="inline-flex">
                        <Badge variant={getCapabilityResultVariant(result.status)}>
                          {option.label} {CAPABILITY_STATUS_LABELS[result.status]}
                        </Badge>
                      </span>
                    </Tooltip>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
};

function normalizeProtocol(value: string): ChannelProtocol {
  const normalized = value.trim().toLowerCase().replace(/-/g, '_');
  if (normalized === 'vertex' || normalized === 'vertexai') {
    return 'vertex_ai';
  }
  if (normalized === 'claude') {
    return 'anthropic';
  }
  if (normalized === 'google') {
    return 'gemini';
  }
  if (normalized === 'deepseek') {
    return 'deepseek';
  }
  if (normalized === 'gemini') {
    return 'gemini';
  }
  if (normalized === 'anthropic') {
    return 'anthropic';
  }
  if (normalized === 'vertex_ai') {
    return 'vertex_ai';
  }
  if (normalized === 'ollama') {
    return 'ollama';
  }
  return 'openai';
}

function inferProtocol(protocol: string, baseUrl: string, models: string[]): ChannelProtocol {
  const explicit = normalizeProtocol(protocol);
  if (protocol.trim()) {
    return explicit;
  }

  const firstPrefixedModel = models.find((model) => model.includes('/'));
  if (firstPrefixedModel) {
    return normalizeProtocol(firstPrefixedModel.split('/', 1)[0]);
  }

  if (baseUrl.includes('127.0.0.1') || baseUrl.includes('localhost')) {
    return 'openai';
  }

  return 'openai';
}

function parseEnabled(value: string | undefined): boolean {
  if (!value) {
    return true;
  }
  return !FALSEY_VALUES.has(value.trim().toLowerCase());
}

function splitModels(models: string): string[] {
  return models
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

interface ParsedModelRef {
  name: string;
  provider: string;
  hasProvider: boolean;
}

function parseModelRef(model: string): ParsedModelRef {
  const trimmed = model.trim();
  if (!trimmed) {
    return { name: '', provider: '', hasProvider: false };
  }

  const delimiterIndex = trimmed.indexOf('/');
  if (delimiterIndex < 0) {
    return { name: trimmed.toLowerCase(), provider: '', hasProvider: false };
  }

  const rawProvider = trimmed.slice(0, delimiterIndex).trim();
  const name = trimmed.slice(delimiterIndex + 1).trim();
  if (!rawProvider || !name) {
    return { name: '', provider: '', hasProvider: false };
  }

  const lowerProvider = rawProvider.toLowerCase();
  return {
    name: name.toLowerCase(),
    provider: PROTOCOL_ALIASES[lowerProvider] || lowerProvider,
    hasProvider: true,
  };
}

function getModelComparisonKey(model: string, protocol: ChannelProtocol): string {
  const normalizedModel = normalizeModelForRuntime(model, protocol).trim();
  const parsed = parseModelRef(normalizedModel);
  if (!parsed.name) {
    return '';
  }
  return `${parsed.provider}/${parsed.name}`;
}

function areModelsEquivalent(a: string, b: string, protocol: ChannelProtocol): boolean {
  const left = getModelComparisonKey(a, protocol);
  const right = getModelComparisonKey(b, protocol);
  return left !== '' && left === right;
}

function toggleModelSelection(models: string, targetModel: string, protocol: ChannelProtocol): string {
  const selectedModels = splitModels(models);
  const index = selectedModels.findIndex((model) => areModelsEquivalent(model, targetModel, protocol));
  if (index >= 0) {
    return selectedModels.filter((_, itemIndex) => itemIndex !== index).join(',');
  }
  return [...selectedModels, targetModel].join(',');
}

const PROTOCOL_ALIASES: Record<string, string> = {
  vertexai: 'vertex_ai',
  vertex: 'vertex_ai',
  claude: 'anthropic',
  google: 'gemini',
  openai_compatible: 'openai',
  openai_compat: 'openai',
};

function normalizeModelForRuntime(model: string, protocol: ChannelProtocol): string {
  const trimmedModel = model.trim();
  if (!trimmedModel) {
    return trimmedModel;
  }

  if (trimmedModel.includes('/')) {
    const rawPrefix = trimmedModel.split('/', 1)[0].trim();
    const lowerPrefix = rawPrefix.toLowerCase();
    const canonicalPrefix = PROTOCOL_ALIASES[lowerPrefix] || lowerPrefix;
    if (KNOWN_MODEL_PREFIXES.has(lowerPrefix) || KNOWN_MODEL_PREFIXES.has(canonicalPrefix)) {
      if (canonicalPrefix !== lowerPrefix && KNOWN_MODEL_PREFIXES.has(canonicalPrefix)) {
        return `${canonicalPrefix}/${trimmedModel.split('/').slice(1).join('/')}`;
      }
      return trimmedModel;
    }
    return `${protocol}/${trimmedModel}`;
  }

  return `${protocol}/${trimmedModel}`;
}

function resolveModelPreview(models: string, protocol: ChannelProtocol): string[] {
  return splitModels(models).map((model) => normalizeModelForRuntime(model, protocol));
}

function buildModelOptions(models: string[], selectedModel: string, autoLabel: string): Array<{ value: string; label: string }> {
  const options: Array<{ value: string; label: string }> = [{ value: '', label: autoLabel }];
  if (selectedModel && !models.includes(selectedModel)) {
    options.push({ value: selectedModel, label: `${selectedModel}（当前配置）` });
  }
  for (const model of models) {
    options.push({ value: model, label: model });
  }
  return options;
}

const LLM_STAGE_LABELS: Record<string, string> = {
  model_discovery: '模型发现',
  chat_completion: '聊天调用',
  response_parse: '响应解析',
  capability_json: 'JSON 能力',
  capability_tools: 'Tools 能力',
  capability_stream: 'Stream 能力',
  capability_vision: 'Vision 能力',
};

const LLM_ERROR_LABELS: Record<string, string> = {
  auth: '鉴权失败',
  timeout: '请求超时',
  quota: '额度或限流',
  model_not_found: '模型不可用',
  request_blocked: '请求被拦截',
  empty_response: '空响应',
  format_error: '格式异常',
  network_error: '网络异常',
  invalid_config: '配置无效',
  unsupported_protocol: '协议暂不支持',
  capability_unsupported: '能力不支持',
  skipped: '已跳过',
};

const LLM_TROUBLESHOOTING_HINTS: Record<string, string> = {
  auth: '请检查 API Key 是否正确、是否有多余空格，以及当前渠道是否需要额外组织/项目权限。',
  timeout: '可重试；若持续超时，请检查 Base URL、网络代理、服务商可用区或本地防火墙。',
  quota: '请检查余额、套餐额度、RPM/TPM 限流或并发设置，必要时稍后重试。',
  model_not_found: '请确认模型名与渠道协议匹配，并先用“获取模型”核对该渠道实际可用模型列表。',
  empty_response: '渠道已连通但未返回正文；可尝试切换兼容模型、关闭额外响应模式后再测试。',
  network_error: '请检查 Base URL、代理、TLS/证书、中转网关或本地网络策略，并可稍后重试。',
  invalid_config: '先补齐协议、Base URL、API Key 和模型配置，再执行一键测试。',
  unsupported_protocol: '当前仅对 OpenAI Compatible / DeepSeek 渠道提供自动模型发现，请改为手动维护模型列表。',
};

const LLM_REASON_HINTS: Record<string, string> = {
  missing_api_key: 'API Key 为空，或逗号分隔后没有任何可用 Key；请填入至少一个有效 Key 后再测试。',
  api_key_rejected: '服务商拒绝了当前 API Key；请检查 Key、组织/项目权限、区域和账号状态。',
  rate_limit: '服务商触发 RPM/TPM 或并发限流；请降低请求频率或稍后重试。',
  insufficient_balance: '服务商返回余额、账单或额度不足；请检查账户余额和套餐状态。',
  quota_exceeded: '服务商返回配额已耗尽；请确认账号套餐、余量和项目额度。',
  provider_blocked: '请求被服务商或中转网关拦截；请检查账号风控、地域限制、模型权限、代理商网关策略、内容安全策略或请求来源限制。',
  dns_error: '域名解析失败；请检查 Base URL 域名、网络代理和 DNS 配置。',
  tls_error: 'TLS/证书握手失败；请检查 HTTPS 证书、中转网关或公司代理策略。',
  connection_refused: '目标服务拒绝连接；请确认 Base URL 端口、服务进程和防火墙配置。',
  model_access_denied: '当前账号无法使用该模型；请确认模型是否已开通、账号是否可见，或模型是否已被禁用。',
  provider_prefix_mismatch: '模型 provider 前缀与当前渠道不匹配；请确认模型名是否应使用该渠道的 OpenAI-compatible 路由。',
  capability_unsupported: '当前模型或兼容层不支持该能力；这不影响基础文本连接，可换模型或关闭该能力依赖。',
};

function getLlmStageLabel(stage?: string | null): string {
  return LLM_STAGE_LABELS[stage || ''] || '连接测试';
}

function getLlmErrorCodeLabel(code?: string | null): string {
  return LLM_ERROR_LABELS[code || ''] || '测试失败';
}

function getLlmTroubleshootingHint(
  code?: string | null,
  stage?: string | null,
  context: 'test' | 'discovery' = 'test',
  details?: Record<string, unknown>,
): string | undefined {
  const reason = typeof details?.reason === 'string' ? details.reason : '';
  if (reason && LLM_REASON_HINTS[reason]) {
    return LLM_REASON_HINTS[reason];
  }
  if (code === 'format_error') {
    return context === 'discovery' || stage === 'model_discovery'
      ? '该渠道返回的 /models 响应格式不兼容，请改为手动填写模型列表。'
      : '返回结构与预期不一致，请确认该渠道兼容 Chat Completions 接口。';
  }
  if (code === 'empty_response' && (context === 'discovery' || stage === 'model_discovery')) {
    return '该渠道的 /models 接口未返回可用模型 ID；请检查 Base URL 是否指向兼容的模型列表接口，或改为手动填写模型列表。';
  }
  return LLM_TROUBLESHOOTING_HINTS[code || ''];
}

function buildLlmTestHint(result: {
  errorCode?: string | null;
  stage?: string | null;
  details?: Record<string, unknown>;
  resolvedModel?: string | null;
}): string | undefined {
  const reason = typeof result.details?.reason === 'string' ? result.details.reason : '';
  const detailsModel = typeof result.details?.model === 'string' ? result.details.model : '';
  const testedModel = result.resolvedModel || detailsModel;
  const modelHint = testedModel ? `本次测试模型：${testedModel}。` : '';
  const scopeInfo = '基础连接测试默认只测试模型列表中的第一个模型。';
  const shouldSuggestModelListChange = reason === 'model_access_denied'
    || reason === 'model_not_found'
    || (result.errorCode === 'model_not_found' && !reason);
  const modelActionHint = shouldSuggestModelListChange
    ? '若该模型不可用，请调整模型顺序或移除不可用模型后重试。'
    : '';
  const troubleshootingHint = getLlmTroubleshootingHint(result.errorCode, result.stage, 'test', result.details);
  return [modelHint, scopeInfo, modelActionHint, troubleshootingHint].filter(Boolean).join(' ') || undefined;
}

function buildLlmFailureText(result: {
  message: string;
  error?: string | null;
  stage?: string | null;
  errorCode?: string | null;
}): string {
  const prefix = `${getLlmStageLabel(result.stage)} · ${getLlmErrorCodeLabel(result.errorCode)}`;
  const summary = result.message || '测试失败';
  if (result.error && result.error !== result.message) {
    return `${prefix}：${summary}（原始摘要：${result.error}）`;
  }
  return `${prefix}：${summary}`;
}

function getCapabilityResultVariant(status: LLMCapabilityCheckResult['status']): 'success' | 'danger' | 'warning' {
  if (status === 'passed') return 'success';
  if (status === 'skipped') return 'warning';
  return 'danger';
}

function summarizeCapabilityResults(results: Partial<Record<LLMCapabilityCheck, LLMCapabilityCheckResult>>): string {
  const values = Object.values(results);
  const passed = values.filter((result) => result?.status === 'passed').length;
  const failed = values.filter((result) => result?.status === 'failed').length;
  const skipped = values.filter((result) => result?.status === 'skipped').length;
  return `能力检测完成：${passed} 通过 / ${failed} 失败 / ${skipped} 跳过`;
}

function getFirstCapabilityHint(
  results: Partial<Record<LLMCapabilityCheck, LLMCapabilityCheckResult>>,
): string | undefined {
  for (const result of Object.values(results)) {
    if (!result || result.status === 'passed') continue;
    const hint = getLlmTroubleshootingHint(result.errorCode, result.stage, 'test', result.details);
    if (hint) return hint;
  }
  return undefined;
}

const MANAGED_PROVIDERS = new Set(['gemini', 'vertex_ai', 'anthropic', 'openai', 'deepseek']);
const LEGACY_PROVIDER_KEYS: Record<string, string[]> = {
  gemini: ['GEMINI_API_KEYS', 'GEMINI_API_KEY'],
  vertex_ai: ['GEMINI_API_KEYS', 'GEMINI_API_KEY'],
  anthropic: ['ANTHROPIC_API_KEYS', 'ANTHROPIC_API_KEY'],
  openai: ['OPENAI_API_KEYS', 'AIHUBMIX_KEY', 'OPENAI_API_KEY'],
  deepseek: ['DEEPSEEK_API_KEYS', 'DEEPSEEK_API_KEY'],
};

function getRuntimeProvider(model: string): string {
  if (!model) return '';
  if (!model.includes('/')) return 'openai';
  return model.split('/', 1)[0].trim().toLowerCase();
}

function usesDirectEnvProvider(model: string): boolean {
  const provider = getRuntimeProvider(model);
  return Boolean(provider) && !MANAGED_PROVIDERS.has(provider);
}

function hasLegacyRuntimeSource(model: string, itemMap: Map<string, string>): boolean {
  const provider = PROTOCOL_ALIASES[getRuntimeProvider(model)] || getRuntimeProvider(model);
  if (!provider || !MANAGED_PROVIDERS.has(provider)) {
    return false;
  }
  return (LEGACY_PROVIDER_KEYS[provider] || []).some((key) => (itemMap.get(key) || '').trim().length > 0);
}

function isRuntimeModelAvailable(model: string, availableModels: string[], itemMap: Map<string, string>): boolean {
  return availableModels.includes(model)
    || usesDirectEnvProvider(model)
    || (availableModels.length === 0 && hasLegacyRuntimeSource(model, itemMap));
}

function sanitizeRuntimeConfigForSave(
  runtimeConfig: RuntimeConfig,
  availableModels: string[],
  itemMap: Map<string, string>,
): RuntimeConfig {
  const primaryModel = runtimeConfig.primaryModel && !isRuntimeModelAvailable(runtimeConfig.primaryModel, availableModels, itemMap)
    ? ''
    : runtimeConfig.primaryModel;
  const agentPrimaryModel = runtimeConfig.agentPrimaryModel && !isRuntimeModelAvailable(runtimeConfig.agentPrimaryModel, availableModels, itemMap)
    ? ''
    : runtimeConfig.agentPrimaryModel;
  const visionModel = runtimeConfig.visionModel && !isRuntimeModelAvailable(runtimeConfig.visionModel, availableModels, itemMap)
    ? ''
    : runtimeConfig.visionModel;
  const fallbackModels = runtimeConfig.fallbackModels.filter((model) => isRuntimeModelAvailable(model, availableModels, itemMap));

  return {
    ...runtimeConfig,
    primaryModel,
    agentPrimaryModel,
    fallbackModels,
    visionModel,
  };
}

function runtimeConfigsAreEqual(left: RuntimeConfig, right: RuntimeConfig): boolean {
  return left.primaryModel === right.primaryModel
    && left.agentPrimaryModel === right.agentPrimaryModel
    && left.visionModel === right.visionModel
    && left.temperature === right.temperature
    && left.fallbackModels.join(',') === right.fallbackModels.join(',');
}

function runtimeConfigChangedKeys(left: RuntimeConfig, right: RuntimeConfig): Set<string> {
  const changed = new Set<string>();
  if (left.primaryModel !== right.primaryModel) {
    changed.add('LITELLM_MODEL');
  }
  if (left.agentPrimaryModel !== right.agentPrimaryModel) {
    changed.add('AGENT_LITELLM_MODEL');
  }
  if (left.fallbackModels.join(',') !== right.fallbackModels.join(',')) {
    changed.add('LITELLM_FALLBACK_MODELS');
  }
  if (left.temperature !== right.temperature) {
    changed.add('LLM_TEMPERATURE');
  }
  if (left.visionModel !== right.visionModel) {
    changed.add('VISION_MODEL');
  }
  return changed;
}

function resolveTemperatureFromItems(itemMap: Map<string, string>): string {
  const unified = itemMap.get('LLM_TEMPERATURE');
  if (unified) return unified;

  const primaryModel = itemMap.get('LITELLM_MODEL') || '';
  const provider = primaryModel.includes('/') ? primaryModel.split('/')[0] : (primaryModel ? 'openai' : '');
  const providerTemperatureEnv: Record<string, string> = {
    gemini: 'GEMINI_TEMPERATURE',
    vertex_ai: 'GEMINI_TEMPERATURE',
    anthropic: 'ANTHROPIC_TEMPERATURE',
    openai: 'OPENAI_TEMPERATURE',
    deepseek: 'OPENAI_TEMPERATURE',
  };
  const preferredEnv = providerTemperatureEnv[provider];
  if (preferredEnv) {
    const val = itemMap.get(preferredEnv);
    if (val) return val;
  }

  for (const envName of ['GEMINI_TEMPERATURE', 'ANTHROPIC_TEMPERATURE', 'OPENAI_TEMPERATURE']) {
    const val = itemMap.get(envName);
    if (val) return val;
  }

  return '0.7';
}

function normalizeAgentPrimaryModel(model: string): string {
  const trimmedModel = model.trim();
  if (!trimmedModel) {
    return '';
  }
  if (trimmedModel.includes('/')) {
    return trimmedModel;
  }
  return `openai/${trimmedModel}`;
}

function parseRuntimeConfigFromItems(items: Array<{ key: string; value: string }>): RuntimeConfig {
  const itemMap = new Map(items.map((item) => [item.key, item.value]));
  return {
    primaryModel: itemMap.get('LITELLM_MODEL') || '',
    agentPrimaryModel: normalizeAgentPrimaryModel(itemMap.get('AGENT_LITELLM_MODEL') || ''),
    fallbackModels: splitModels(itemMap.get('LITELLM_FALLBACK_MODELS') || ''),
    visionModel: itemMap.get('VISION_MODEL') || '',
    temperature: resolveTemperatureFromItems(itemMap),
  };
}

function parseChannelsFromItems(
  items: Array<{ key: string; value: string }>,
  itemSourceByKey: Map<string, boolean> = new Map(),
): ChannelConfig[] {
  const itemMap = new Map(items.map((item) => [item.key.toUpperCase(), item.value]));
  const channelNames = (itemMap.get('LLM_CHANNELS') || '')
    .split(',')
    .map((segment) => segment.trim())
    .filter(Boolean);

  return channelNames.map((name, index) => {
    const upperName = name.toUpperCase();
    const baseUrl = itemMap.get(`LLM_${upperName}_BASE_URL`) || '';
    const rawModels = itemMap.get(`LLM_${upperName}_MODELS`) || '';
    const models = splitModels(rawModels);

    return {
      id: `parsed:${index}:${upperName}`,
      name: name.toLowerCase(),
      protocol: inferProtocol(itemMap.get(`LLM_${upperName}_PROTOCOL`) || '', baseUrl, models),
      baseUrl,
      apiKey: resolveInitialChannelApiKeyValue(name, itemMap, itemSourceByKey),
      models: rawModels,
      enabled: parseEnabled(itemMap.get(`LLM_${upperName}_ENABLED`)),
    };
  });
}

function channelsToUpdateItems(
  channels: ChannelConfig[],
  previousChannelNames: string[],
  runtimeConfig: RuntimeConfig,
  includeRuntimeConfig: boolean,
): Array<{ key: string; value: string }> {
  const updates: Array<{ key: string; value: string }> = [];
  const activeNames = channels.map((channel) => channel.name.toUpperCase());

  updates.push({ key: 'LLM_CHANNELS', value: channels.map((channel) => channel.name).join(',') });
  if (includeRuntimeConfig) {
    updates.push({ key: 'LITELLM_MODEL', value: runtimeConfig.primaryModel });
    updates.push({ key: 'AGENT_LITELLM_MODEL', value: runtimeConfig.agentPrimaryModel });
    updates.push({ key: 'LITELLM_FALLBACK_MODELS', value: runtimeConfig.fallbackModels.join(',') });
    updates.push({ key: 'VISION_MODEL', value: runtimeConfig.visionModel });
    updates.push({ key: 'LLM_TEMPERATURE', value: runtimeConfig.temperature });
  }

  for (const channel of channels) {
    const prefix = `LLM_${channel.name.toUpperCase()}`;
    const isMultiKey = channel.apiKey.includes(',');
    updates.push({ key: `${prefix}_PROTOCOL`, value: channel.protocol });
    updates.push({ key: `${prefix}_BASE_URL`, value: channel.baseUrl });
    updates.push({ key: `${prefix}_ENABLED`, value: channel.enabled ? 'true' : 'false' });
    updates.push({ key: `${prefix}_API_KEY${isMultiKey ? 'S' : ''}`, value: channel.apiKey });
    updates.push({ key: `${prefix}_API_KEY${isMultiKey ? '' : 'S'}`, value: '' });
    updates.push({ key: `${prefix}_MODELS`, value: channel.models });
  }

  for (const oldName of previousChannelNames) {
    const upperName = oldName.toUpperCase();
    if (activeNames.includes(upperName)) {
      continue;
    }

    const prefix = `LLM_${upperName}`;
    updates.push({ key: `${prefix}_PROTOCOL`, value: '' });
    updates.push({ key: `${prefix}_BASE_URL`, value: '' });
    updates.push({ key: `${prefix}_ENABLED`, value: '' });
    updates.push({ key: `${prefix}_API_KEY`, value: '' });
    updates.push({ key: `${prefix}_API_KEYS`, value: '' });
    updates.push({ key: `${prefix}_MODELS`, value: '' });
    updates.push({ key: `${prefix}_EXTRA_HEADERS`, value: '' });
  }

  return updates;
}

function channelsAreEqual(left: ChannelConfig, right: ChannelConfig): boolean {
  return (
    left.name === right.name
    && left.protocol === right.protocol
    && left.baseUrl === right.baseUrl
    && left.apiKey === right.apiKey
    && left.models === right.models
    && left.enabled === right.enabled
  );
}

export const LLMChannelEditor: React.FC<LLMChannelEditorProps> = ({
  items,
  configVersion,
  maskToken,
  onSaved,
  disabled = false,
}) => {
  const { language } = useUiLanguage();
  const text = LLM_EDITOR_TEXT[language];
  const initialItemSourceByKey = useMemo(() => {
    const sourceByKey = new Map<string, boolean>();
    for (const item of items) {
      sourceByKey.set(item.key.toUpperCase(), item.rawValueExists !== false);
    }
    for (const [key, hasSource] of sourceByKey) {
      if (hasSource) {
        continue;
      }
      const match = CHANNEL_FIELD_KEY_PATTERN.exec(key);
      if (!match) {
        continue;
      }
      const channelName = match[1];
      for (const channelKey of parseChannelFieldKeysFromName(channelName)) {
        if (!sourceByKey.has(channelKey)) {
          sourceByKey.set(channelKey, false);
        }
      }
    }
    return sourceByKey;
  }, [items]);
  const initialChannels = useMemo(
    () => parseChannelsFromItems(items, initialItemSourceByKey),
    [items, initialItemSourceByKey],
  );
  const initialNames = useMemo(() => initialChannels.map((channel) => channel.name), [initialChannels]);
  const initialRuntimeConfig = useMemo(() => parseRuntimeConfigFromItems(items), [items]);
  const savedItemMap = useMemo(() => new Map(items.map((item) => [item.key.toUpperCase(), item.value])), [items]);
  const hasLitellmConfig = useMemo(
    () => items.some((item) => item.key === 'LITELLM_CONFIG' && item.value.trim().length > 0),
    [items],
  );
  const managesRuntimeConfig = !hasLitellmConfig;

  const channelsFingerprint = useMemo(() => JSON.stringify(initialChannels), [initialChannels]);
  const runtimeFingerprint = useMemo(() => JSON.stringify(initialRuntimeConfig), [initialRuntimeConfig]);

  const [channels, setChannels] = useState<ChannelConfig[]>(initialChannels);
  const [runtimeConfig, setRuntimeConfig] = useState<RuntimeConfig>(initialRuntimeConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<
    | { type: 'success'; text: string }
    | { type: 'error'; error: ParsedApiError }
    | { type: 'local-error'; text: string }
    | null
  >(null);
  const [saveWarnings, setSaveWarnings] = useState<string[]>([]);
  const [visibleKeys, setVisibleKeys] = useState<Record<number, boolean>>({});
  const [testStates, setTestStates] = useState<Record<number, ChannelTestState>>({});
  const [discoveryStates, setDiscoveryStates] = useState<Record<string, ChannelDiscoveryState>>({});
  const [capabilityStates, setCapabilityStates] = useState<Record<string, ChannelCapabilityState>>({});
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [addPreset, setAddPreset] = useState('aihubmix');
  const addChannelIdRef = useRef(0);

  const prevChannelsRef = useRef(channelsFingerprint);
  const prevRuntimeRef = useRef(runtimeFingerprint);
  const pendingSaveFeedbackFingerprintRef = useRef<{ channels: string; runtime: string } | null>(null);
  const discoveryNonceRef = useRef<Record<string, number>>({});
  const discoveryRequestIdRef = useRef(0);
  const capabilityNonceRef = useRef<Record<string, number>>({});
  const capabilityRequestIdRef = useRef(0);

  useEffect(() => {
    if (prevChannelsRef.current === channelsFingerprint && prevRuntimeRef.current === runtimeFingerprint) {
      return;
    }
    prevChannelsRef.current = channelsFingerprint;
    prevRuntimeRef.current = runtimeFingerprint;
    const pendingSaveFeedbackFingerprint = pendingSaveFeedbackFingerprintRef.current;
    const preserveSaveFeedback = pendingSaveFeedbackFingerprint?.channels === channelsFingerprint
      && pendingSaveFeedbackFingerprint.runtime === runtimeFingerprint;
    pendingSaveFeedbackFingerprintRef.current = null;
    setChannels(initialChannels);
    setRuntimeConfig(initialRuntimeConfig);
    setVisibleKeys({});
    setTestStates({});
    setDiscoveryStates({});
    setCapabilityStates({});
    setExpandedRows({});
    discoveryNonceRef.current = {};
    capabilityNonceRef.current = {};
    if (!preserveSaveFeedback) {
      setSaveMessage(null);
      setSaveWarnings([]);
    }
    setIsCollapsed(false);
  }, [channelsFingerprint, runtimeFingerprint, initialChannels, initialRuntimeConfig]);

  const availableModels = useMemo(() => {
    if (!managesRuntimeConfig) {
      return [];
    }
    const seen = new Set<string>();
    const models: string[] = [];
    for (const channel of channels) {
      if (!channel.enabled || !channel.name.trim()) {
        continue;
      }
      for (const model of resolveModelPreview(channel.models, channel.protocol)) {
        if (!model || seen.has(model)) {
          continue;
        }
        seen.add(model);
        models.push(model);
      }
    }
    return models;
  }, [channels, managesRuntimeConfig]);

  const hasChanges = useMemo(() => {
    const runtimeChanged = (
      runtimeConfig.primaryModel !== initialRuntimeConfig.primaryModel
      || runtimeConfig.agentPrimaryModel !== initialRuntimeConfig.agentPrimaryModel
      || runtimeConfig.visionModel !== initialRuntimeConfig.visionModel
      || runtimeConfig.temperature !== initialRuntimeConfig.temperature
      || runtimeConfig.fallbackModels.join(',') !== initialRuntimeConfig.fallbackModels.join(',')
    );

    if (runtimeChanged || channels.length !== initialChannels.length) {
      return true;
    }
    return channels.some((channel, index) => !channelsAreEqual(channel, initialChannels[index]));
  }, [channels, initialChannels, initialRuntimeConfig, runtimeConfig]);

  const busy = disabled || isSaving;

  const updateChannel = (index: number, field: keyof ChannelConfig, value: string | boolean) => {
    const currentChannel = channels[index];
    setChannels((previous) => previous.map((channel, rowIndex) => {
      if (rowIndex !== index) return channel;
      const updated = { ...channel, [field]: value };

      if (field === 'name' && typeof value === 'string') {
        const newPreset = getProviderTemplate(value);
        if (newPreset) {
          const oldPreset = getProviderTemplate(channel.name);
          if (!updated.baseUrl || updated.baseUrl === (oldPreset?.baseUrl ?? '')) {
            updated.baseUrl = newPreset.baseUrl;
          }
          updated.protocol = newPreset.protocol;
          if (!updated.models || updated.models === (oldPreset?.placeholderModels ?? '')) {
            updated.models = newPreset.placeholderModels;
          }
        }
      }

      return updated;
    }));
    setTestStates((previous) => {
      if (!(index in previous)) {
        return previous;
      }
      const next = { ...previous };
      delete next[index];
      return next;
    });
    if (field !== 'models' && field !== 'enabled') {
      setDiscoveryStates((previous) => {
        const channel = channels.find((_, itemIndex) => itemIndex === index);
        if (!channel || !(channel.id in previous)) {
          return previous;
        }
        const next = { ...previous };
        delete next[channel.id];
        delete discoveryNonceRef.current[channel.id];
        return next;
      });
    }
    if (currentChannel) {
      delete capabilityNonceRef.current[currentChannel.id];
      setCapabilityStates((previous) => {
        const current = previous[currentChannel.id];
        if (!current) {
          return previous;
        }
        return {
          ...previous,
          [currentChannel.id]: {
            ...current,
            status: 'idle',
            text: undefined,
            hint: undefined,
            results: {},
          },
        };
      });
    }
  };

  const removeChannel = (index: number) => {
    const removedChannelId = channels[index]?.id || '';
    setChannels((previous) => previous.filter((_, rowIndex) => rowIndex !== index));
    setVisibleKeys({});
    setTestStates({});
    setDiscoveryStates((previous) => {
      if (!removedChannelId) {
        return previous;
      }
      const next = { ...previous };
      delete next[removedChannelId];
      return next;
    });
    setCapabilityStates((previous) => {
      if (!removedChannelId || !(removedChannelId in previous)) {
        return previous;
      }
      const next = { ...previous };
      delete next[removedChannelId];
      return next;
    });
    if (removedChannelId) {
      const nextNonce = { ...discoveryNonceRef.current };
      delete nextNonce[removedChannelId];
      discoveryNonceRef.current = nextNonce;
      delete capabilityNonceRef.current[removedChannelId];
    }
    setExpandedRows({});
  };

  const addChannel = () => {
    const preset = getProviderTemplate(addPreset) || getProviderTemplate('custom');
    if (!preset) {
      return;
    }
    setChannels((previous) => {
      const existingNames = new Set(previous.map((channel) => channel.name));
      const baseName = addPreset === 'custom' ? 'custom' : addPreset;
      let nextName = baseName;
      let counter = 2;
      while (existingNames.has(nextName)) {
        nextName = `${baseName}${counter}`;
        counter += 1;
      }

      return [
        ...previous,
        {
          id: `added:${addChannelIdRef.current += 1}`,
          name: nextName,
          protocol: preset.protocol,
          baseUrl: preset.baseUrl,
          apiKey: '',
          models: preset.placeholderModels || '',
          enabled: true,
        },
      ];
    });
    setTestStates({});
    setDiscoveryStates({});
    setCapabilityStates({});
    discoveryNonceRef.current = {};
    capabilityNonceRef.current = {};
    setExpandedRows((prev) => ({ ...prev, [channels.length]: true }));
    setIsCollapsed(false);
  };

  const handleSave = async () => {
    const hasEmptyName = channels.some((channel) => !channel.name.trim());
    if (hasEmptyName) {
      setSaveMessage({ type: 'local-error', text: text.invalidChannelName });
      return;
    }

    const runtimeConfigForSave = managesRuntimeConfig
      ? sanitizeRuntimeConfigForSave(runtimeConfig, availableModels, savedItemMap)
      : runtimeConfig;
    if (!runtimeConfigsAreEqual(runtimeConfigForSave, runtimeConfig)) {
      setRuntimeConfig(runtimeConfigForSave);
    }

    if (managesRuntimeConfig) {
      const invalidPrimaryModel = runtimeConfigForSave.primaryModel
        && !isRuntimeModelAvailable(runtimeConfigForSave.primaryModel, availableModels, savedItemMap);
      if (invalidPrimaryModel) {
        setSaveMessage({ type: 'local-error', text: text.invalidPrimaryModel });
        return;
      }

      const invalidAgentPrimaryModel = runtimeConfigForSave.agentPrimaryModel
        && !isRuntimeModelAvailable(runtimeConfigForSave.agentPrimaryModel, availableModels, savedItemMap);
      if (invalidAgentPrimaryModel) {
        setSaveMessage({ type: 'local-error', text: text.invalidAgentPrimaryModel });
        return;
      }

      const invalidFallbackModel = runtimeConfigForSave.fallbackModels.some(
        (model) => !isRuntimeModelAvailable(model, availableModels, savedItemMap),
      );
      if (invalidFallbackModel) {
        setSaveMessage({ type: 'local-error', text: text.invalidFallbackModel });
        return;
      }

      const invalidVisionModel = runtimeConfigForSave.visionModel
        && !isRuntimeModelAvailable(runtimeConfigForSave.visionModel, availableModels, savedItemMap);
      if (invalidVisionModel) {
        setSaveMessage({ type: 'local-error', text: text.invalidVisionModel });
        return;
      }
    }

    setIsSaving(true);
    setSaveMessage(null);
    setSaveWarnings([]);

    try {
      const changedKeys = new Set<string>([
        ...buildChangedItemKeys(channels, initialChannels, initialItemSourceByKey, savedItemMap),
        ...runtimeConfigChangedKeys(runtimeConfigForSave, initialRuntimeConfig),
      ]);
      const updateItems = channelsToUpdateItems(channels, initialNames, runtimeConfigForSave, managesRuntimeConfig).filter(
        (item) => {
          const itemKey = item.key.toUpperCase();
          const initialItemSource = initialItemSourceByKey.get(itemKey);
          if (initialItemSource === false) {
            return changedKeys.has(itemKey);
          }
          if (isChannelSecretFieldKey(itemKey) && initialItemSource === undefined) {
            return changedKeys.has(itemKey);
          }
          return true;
        },
      );
      const response = await systemConfigApi.update({
        configVersion,
        maskToken,
        reloadNow: true,
        items: updateItems,
      });
      const responseWarnings = response.warnings || [];
      await onSaved(updateItems);
      pendingSaveFeedbackFingerprintRef.current = {
        channels: JSON.stringify(parseChannelsFromItems(updateItems)),
        runtime: JSON.stringify(parseRuntimeConfigFromItems(updateItems)),
      };
      setSaveWarnings(responseWarnings);
      setSaveMessage({ type: 'success', text: managesRuntimeConfig ? text.aiConfigSaved : text.channelConfigSaved });
    } catch (error: unknown) {
      setSaveWarnings([]);
      setSaveMessage({ type: 'error', error: getParsedApiError(error) });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async (channel: ChannelConfig, index: number) => {
    setTestStates((previous) => ({
      ...previous,
      [index]: { status: 'loading', text: text.connectionTesting },
    }));

    try {
      const result = await systemConfigApi.testLLMChannel({
        name: channel.name,
        protocol: channel.protocol,
        baseUrl: channel.baseUrl,
        apiKey: channel.apiKey,
        models: splitModels(channel.models),
        enabled: channel.enabled,
      });

      const resultText = result.success
        ? text.connectionSucceeded(result.resolvedModel, result.latencyMs)
        : buildLlmFailureText(result);
      const hint = result.success ? undefined : buildLlmTestHint(result);

      setTestStates((previous) => ({
        ...previous,
        [index]: {
          status: result.success ? 'success' : 'error',
          text: resultText,
          hint,
        },
      }));
    } catch (error: unknown) {
      const parsed = getParsedApiError(error);
      setTestStates((previous) => ({
        ...previous,
        [index]: { status: 'error', text: parsed.message || text.connectionTestFailed },
      }));
    }
  };

  const handleDiscoverModels = async (channel: ChannelConfig) => {
    const requestId = discoveryRequestIdRef.current + 1;
    discoveryRequestIdRef.current = requestId;
    discoveryNonceRef.current[channel.id] = requestId;
    const nonce = requestId;

    setDiscoveryStates((previous) => ({
      ...previous,
      [channel.id]: {
        status: 'loading',
        text: text.fetchingModelList,
        hint: undefined,
        models: previous[channel.id]?.models || [],
      },
    }));

    try {
      const result = await systemConfigApi.discoverLLMChannelModels({
        name: channel.name,
        protocol: channel.protocol,
        baseUrl: channel.baseUrl,
        apiKey: channel.apiKey,
        models: splitModels(channel.models),
      });

      if (discoveryNonceRef.current[channel.id] !== nonce) return;

      setDiscoveryStates((previous) => ({
        ...previous,
        [channel.id]: {
          status: result.success ? 'success' : 'error',
          text: result.success
            ? text.discoveredModels(result.models.length, result.latencyMs)
            : buildLlmFailureText(result),
          hint: result.success ? undefined : getLlmTroubleshootingHint(result.errorCode, result.stage, 'discovery', result.details),
          models: result.success ? result.models : (previous[channel.id]?.models || []),
        },
      }));
    } catch (error: unknown) {
      if (discoveryNonceRef.current[channel.id] !== nonce) return;

      const parsed = getParsedApiError(error);
      setDiscoveryStates((previous) => ({
        ...previous,
        [channel.id]: {
          status: 'error',
          text: parsed.message || text.fetchModelsFailed,
          hint: undefined,
          models: previous[channel.id]?.models || [],
        },
      }));
    }
  };

  const toggleCapability = (channel: ChannelConfig, capability: LLMCapabilityCheck) => {
    setCapabilityStates((previous) => {
      const current = previous[channel.id] || { selected: [], status: 'idle', results: {} };
      const selected = current.selected.includes(capability)
        ? current.selected.filter((item) => item !== capability)
        : [...current.selected, capability];
      return {
        ...previous,
        [channel.id]: {
          ...current,
          selected,
          status: current.status === 'loading' ? current.status : 'idle',
          text: current.status === 'loading' ? current.text : undefined,
          hint: current.status === 'loading' ? current.hint : undefined,
          results: current.status === 'loading' ? current.results : {},
        },
      };
    });
  };

  const handleCapabilityCheck = async (channel: ChannelConfig) => {
    const selected = capabilityStates[channel.id]?.selected || [];
    if (selected.length === 0) return;

    const requestId = capabilityRequestIdRef.current + 1;
    capabilityRequestIdRef.current = requestId;
    capabilityNonceRef.current[channel.id] = requestId;
    const nonce = requestId;

    setCapabilityStates((previous) => ({
      ...previous,
      [channel.id]: {
        selected,
        status: 'loading',
        text: text.checkingRuntimeCapabilities,
        hint: undefined,
        results: {},
      },
    }));

    try {
      const result = await systemConfigApi.testLLMChannel({
        name: channel.name,
        protocol: channel.protocol,
        baseUrl: channel.baseUrl,
        apiKey: channel.apiKey,
        models: splitModels(channel.models),
        enabled: channel.enabled,
        capabilityChecks: selected,
      });

      if (capabilityNonceRef.current[channel.id] !== nonce) return;

      const capabilityResults = result.capabilityResults || {};
      const hasFailure = Object.values(capabilityResults).some((item) => item?.status === 'failed');
      const hasSkipped = Object.values(capabilityResults).some((item) => item?.status === 'skipped');
      setCapabilityStates((previous) => ({
        ...previous,
        [channel.id]: {
          selected,
          status: hasFailure || hasSkipped || !result.success ? 'error' : 'success',
          text: Object.keys(capabilityResults).length > 0
            ? summarizeCapabilityResults(capabilityResults)
            : result.success
              ? text.noCapabilityResults
              : buildLlmFailureText(result),
          hint: getFirstCapabilityHint(capabilityResults)
            || (!result.success ? buildLlmTestHint(result) : undefined),
          results: capabilityResults,
        },
      }));
    } catch (error: unknown) {
      if (capabilityNonceRef.current[channel.id] !== nonce) return;

      const parsed = getParsedApiError(error);
      setCapabilityStates((previous) => ({
        ...previous,
        [channel.id]: {
          selected,
          status: 'error',
          text: parsed.message || text.capabilityCheckFailed,
          hint: undefined,
          results: {},
        },
      }));
    }
  };

  const toggleKeyVisibility = (index: number, nextVisible: boolean) => {
    setVisibleKeys((previous) => ({ ...previous, [index]: nextVisible }));
  };

  const toggleExpand = (index: number) => {
    setExpandedRows((previous) => ({ ...previous, [index]: !previous[index] }));
  };

  const setPrimaryModel = (value: string) => {
    setRuntimeConfig((previous) => ({
      ...previous,
      primaryModel: value,
      fallbackModels: previous.fallbackModels.filter((model) => model !== value),
    }));
  };

  const toggleFallbackModel = (model: string) => {
    setRuntimeConfig((previous) => {
      const alreadySelected = previous.fallbackModels.includes(model);
      return {
        ...previous,
        fallbackModels: alreadySelected
          ? previous.fallbackModels.filter((item) => item !== model)
          : [...previous.fallbackModels, model],
      };
    });
  };

  return (
    <div className="space-y-4">
      <button
        type="button"
        className="flex w-full items-center justify-between rounded-[1.35rem] border border-[var(--settings-border)] bg-[var(--settings-surface)] px-5 py-4 text-left shadow-soft-card transition-[background-color,border-color,box-shadow] duration-200 hover:border-[var(--settings-border-strong)] hover:bg-[var(--settings-surface-hover)]"
        onClick={() => setIsCollapsed((previous) => !previous)}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-foreground">{text.title}</h3>
            <Badge variant="info" className="settings-accent-badge">{text.channelManagement}</Badge>
          </div>
          <p className="text-xs text-muted-text">
            {text.description}
          </p>
        </div>
        <span className="text-xs text-muted-text">{isCollapsed ? `▶ ${text.expand}` : `▼ ${text.collapse}`}</span>
      </button>

      {!isCollapsed ? (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="rounded-[1.35rem] border border-[var(--settings-border)] bg-[var(--settings-surface)] p-4 shadow-soft-card">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-foreground">{text.quickAdd}</h4>
                <p className="mt-1 text-xs text-secondary-text">{text.quickAddDescription}</p>
              </div>
              <Badge variant="default" className="border-[var(--settings-border)] bg-[var(--settings-surface-hover)] text-muted-text">{text.channelCount(channels.length)}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="settings-primary" className="whitespace-nowrap" disabled={busy} onClick={addChannel}>
                + {text.addChannel}
              </Button>
              <Select
                value={addPreset}
                onChange={setAddPreset}
                options={LLM_PROVIDER_TEMPLATES.map((preset) => ({
                  value: preset.channelId,
                  label: getProviderDisplayLabel(preset.channelId, preset.label, language),
                }))}
                disabled={busy}
                placeholder={text.selectProvider}
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-text">{text.channelList}</span>
              {channels.length > 0 ? (
                <span className="text-[10px] text-muted-text">{text.enabledCount(channels.filter((c) => c.enabled).length, channels.length)}</span>
              ) : null}
            </div>

            {channels.length === 0 ? (
              <div className="settings-surface-overlay-muted rounded-[1.35rem] border border-dashed settings-border-strong px-4 py-10 text-center">
                <p className="text-sm font-medium text-secondary-text">{text.noChannels}</p>
                <p className="mt-1 text-xs text-muted-text">{text.noChannelsDescription}</p>
              </div>
            ) : channels.map((channel, index) => (
              <ChannelRow
                key={channel.id}
                channel={channel}
                index={index}
                busy={busy}
                visibleKey={Boolean(visibleKeys[index])}
                expanded={Boolean(expandedRows[index])}
                testState={testStates[index]}
                discoveryState={discoveryStates[channel.id]}
                capabilityState={capabilityStates[channel.id]}
                onUpdate={updateChannel}
                onRemove={removeChannel}
                onToggleExpand={toggleExpand}
                onToggleKeyVisibility={toggleKeyVisibility}
                onTest={(ch, idx) => void handleTest(ch, idx)}
                onDiscoverModels={(channel) => void handleDiscoverModels(channel)}
                onToggleCapability={toggleCapability}
                onCheckCapabilities={(channel) => void handleCapabilityCheck(channel)}
              />
            ))}
          </div>

          {managesRuntimeConfig ? (
            <div className="rounded-[1.35rem] border border-[var(--settings-border)] bg-[var(--settings-surface)] p-4 shadow-soft-card">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <span className="settings-accent-text text-xs font-medium uppercase tracking-wider">{text.runtimeParameters}</span>
                  <p className="mt-1 text-[11px] text-muted-text">{text.runtimeDescription}</p>
                </div>
                <Badge variant="default" className="border-[var(--settings-border)] bg-[var(--settings-surface-hover)] text-muted-text">Runtime</Badge>
              </div>
              <div className="mb-4">
                <HelpLabel
                  label="Temperature"
                  fieldKey="LLM_TEMPERATURE"
                  helpKey="settings.llm_channel.temperature"
                  examples={['LLM_TEMPERATURE=0.2', 'LLM_TEMPERATURE=0.7']}
                  compact
                />
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={runtimeConfig.temperature}
                    disabled={busy}
                    onChange={(event) => setRuntimeConfig((previous) => ({ ...previous, temperature: event.target.value }))}
                    className="settings-input-checkbox h-1.5 flex-1 cursor-pointer rounded-full bg-border/60"
                  />
                  <span className="w-8 text-right text-sm text-secondary-text">{runtimeConfig.temperature}</span>
                </div>
                <p className="mt-1 text-[11px] text-secondary-text">
                  {text.temperatureDescription}
                </p>
              </div>

              {availableModels.length === 0 ? (
                <div className="rounded-xl border border-dashed settings-border-strong settings-surface-overlay-soft px-3 py-2 text-xs text-muted-text">
                  {text.noAvailableModels}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <HelpLabel
                      htmlFor="runtime-primary-model"
                      label={text.primaryModel}
                      fieldKey="LITELLM_MODEL"
                      helpKey="settings.llm_channel.primary_model"
                      examples={['LITELLM_MODEL=deepseek/deepseek-v4-flash']}
                      compact
                    />
                    <Select
                      id="runtime-primary-model"
                      value={runtimeConfig.primaryModel}
                      onChange={setPrimaryModel}
                      options={buildModelOptions(availableModels, runtimeConfig.primaryModel, text.automaticFirstModel)}
                      disabled={busy}
                      placeholder=""
                    />
                  </div>

                  <div>
                    <HelpLabel
                      htmlFor="runtime-agent-primary-model"
                      label={text.agentPrimaryModel}
                      fieldKey="AGENT_LITELLM_MODEL"
                      helpKey="settings.llm_channel.agent_primary_model"
                      examples={['AGENT_LITELLM_MODEL=deepseek/deepseek-v4-pro']}
                      compact
                    />
                    <Select
                      id="runtime-agent-primary-model"
                      value={runtimeConfig.agentPrimaryModel}
                      onChange={(value) => setRuntimeConfig((previous) => ({
                        ...previous,
                        agentPrimaryModel: normalizeAgentPrimaryModel(value),
                      }))}
                      options={buildModelOptions(availableModels, runtimeConfig.agentPrimaryModel, text.automaticInheritedModel)}
                      disabled={busy}
                      placeholder=""
                    />
                  </div>

                  <div>
                    <HelpLabel
                      label={text.fallbackModels}
                      fieldKey="LITELLM_FALLBACK_MODELS"
                      helpKey="settings.llm_channel.fallback_models"
                      examples={['LITELLM_FALLBACK_MODELS=deepseek/deepseek-v4-pro,gemini/gemini-3-flash-preview']}
                      compact
                    />
                    <div className="space-y-2 rounded-xl border settings-border-strong settings-surface-overlay-soft p-3">
                      {availableModels.map((model) => (
                        <label key={model} className="flex items-center gap-2 text-sm text-secondary-text">
                          <input
                            type="checkbox"
                            checked={runtimeConfig.fallbackModels.includes(model)}
                            disabled={busy || model === runtimeConfig.primaryModel}
                            onChange={() => toggleFallbackModel(model)}
                            className="settings-input-checkbox h-4 w-4 rounded border-border/70 bg-base"
                          />
                          <span>{model}</span>
                        </label>
                      ))}
                    </div>
                    <p className="mt-1 text-[11px] text-secondary-text">
                      {text.fallbackDescription}
                    </p>
                  </div>

                  <div>
                    <HelpLabel
                      htmlFor="runtime-vision-model"
                      label={text.visionModel}
                      fieldKey="VISION_MODEL"
                      helpKey="settings.llm_channel.vision_model"
                      examples={['VISION_MODEL=gemini/gemini-3.1-pro-preview']}
                      compact
                    />
                    <Select
                      id="runtime-vision-model"
                      value={runtimeConfig.visionModel}
                      onChange={(value) => setRuntimeConfig((previous) => ({ ...previous, visionModel: value }))}
                      options={buildModelOptions(availableModels, runtimeConfig.visionModel, text.automaticVisionModel)}
                      disabled={busy}
                      placeholder=""
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <InlineAlert
              variant="warning"
              message={text.yamlRoutingNotice}
              className="rounded-[1.35rem] px-4 py-3 text-xs shadow-none"
            />
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="settings-primary"
              glow
              disabled={busy || !hasChanges}
              onClick={() => void handleSave()}
            >
              {isSaving ? text.saving : managesRuntimeConfig ? text.saveAiConfig : text.saveChannelConfig}
            </Button>
            {!hasChanges ? <span className="text-xs text-muted-text">{text.noUnsavedChanges}</span> : null}
          </div>

          {saveMessage?.type === 'success' ? (
            <InlineAlert
              variant="success"
              message={saveMessage.text}
              className="rounded-lg px-3 py-2 text-sm shadow-none"
            />
          ) : null}

          {saveWarnings.length > 0 ? (
            <InlineAlert
              variant="warning"
              title={text.savedNotice}
              message={(
                <div className="space-y-1">
                  {saveWarnings.map((warning) => (
                    <p key={warning}>{warning}</p>
                  ))}
                </div>
              )}
              className="rounded-lg px-3 py-2 text-sm shadow-none"
            />
          ) : null}

          {saveMessage?.type === 'local-error' ? (
            <InlineAlert
              variant="danger"
              message={saveMessage.text}
              className="rounded-lg px-3 py-2 text-sm shadow-none"
            />
          ) : null}

          {saveMessage?.type === 'error' ? <ApiErrorAlert error={saveMessage.error} /> : null}
        </div>
      ) : null}
    </div>
  );
};
