import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BellRing } from 'lucide-react';
import { alertsApi } from '../api/alerts';
import type { ParsedApiError } from '../api/error';
import { getParsedApiError } from '../api/error';
import { AlertRuleForm } from '../components/alerts/AlertRuleForm';
import {
  AlertRuleList,
  type AlertRuleBusyState,
  type AlertRuleEnabledFilter,
  type AlertTypeFilter,
} from '../components/alerts/AlertRuleList';
import { AlertTriggerHistory } from '../components/alerts/AlertTriggerHistory';
import { ApiErrorAlert, AppPage, Card, EmptyState, InlineAlert, Loading, PageHeader } from '../components/common';
import type {
  AlertNotificationItem,
  AlertRuleCreateRequest,
  AlertRuleItem,
  AlertRuleTestResponse,
  AlertTriggerItem,
  AlertType,
} from '../types/alerts';
import { formatDateTime } from '../utils/format';
import { useUiLanguage } from '../contexts/UiLanguageContext';
import type { UiLanguage } from '../i18n/uiText';

const PAGE_SIZE = 20;

const ALERTS_PAGE_TEXT: Record<UiLanguage, {
  pageTitle: string; heading: string; description: string; createdRule: (name: string) => string; createSuccess: string; close: string; testResult: string;
  notificationRecords: string; notificationResults: string; loadingNotifications: string; noNotifications: string; noNotificationsDescription: string;
  channel: string; status: string; errorCode: string; latency: string; time: string; diagnostics: string;
  resultStatus: string; triggered: string; yes: string; no: string; observedValue: string; valueSeparator: string; evaluated: (total: number, triggered: number, degraded: number, skipped: number) => string;
  notificationChannel: Record<string, string>; notificationStatus: (notification: AlertNotificationItem) => string;
}> = {
  zh: {
    pageTitle: '告警中心 - DSA', heading: '告警中心', description: '管理事件告警、日线技术指标、自选股、持仓/账户联动和大盘红绿灯规则，执行一次性测试，并查看后台评估任务记录的触发历史。', createdRule: (name) => `已创建告警规则「${name}」`, createSuccess: '创建成功', close: '关闭', testResult: '测试结果', notificationRecords: '通知尝试记录', notificationResults: '通知结果', loadingNotifications: '正在加载通知尝试记录', noNotifications: '暂无通知尝试记录', noNotificationsDescription: '当前没有可展示的通知尝试明细；告警触发仍会按已配置通知渠道发送。', channel: '渠道', status: '状态', errorCode: '错误码', latency: '耗时', time: '时间', diagnostics: '诊断', resultStatus: '状态', triggered: '触发', yes: '是', no: '否', observedValue: '观察值', valueSeparator: '：', evaluated: (total, triggered, degraded, skipped) => `评估 ${total} · 触发 ${triggered} · 降级 ${degraded} · 跳过 ${skipped}`, notificationChannel: { __cooldown__: '业务冷却', __cooldown_read_failed__: '冷却读取失败', __noise_suppressed__: '通知降噪', __no_channel__: '无可用渠道', __dispatch__: '通知调度', __context__: '会话渠道' }, notificationStatus: (item) => item.success ? '成功' : item.errorCode === 'cooldown_active' ? '冷却抑制' : item.errorCode === 'cooldown_read_failed' ? '冷却读取失败' : item.errorCode === 'noise_suppressed' ? '降噪抑制' : item.errorCode === 'no_channel' ? '无渠道' : '失败',
  },
  en: {
    pageTitle: 'Alert Center - DSA', heading: 'Alert center', description: 'Manage event alerts, daily technical indicators, watchlists, portfolio and account rules, and market traffic-light rules. Run one-time tests and review background evaluation history.', createdRule: (name) => `Alert rule “${name}” created`, createSuccess: 'Created', close: 'Close', testResult: 'Test result', notificationRecords: 'Notification attempts', notificationResults: 'Notification results', loadingNotifications: 'Loading notification attempts', noNotifications: 'No notification attempts', noNotificationsDescription: 'There are no notification attempt details to show. Triggered alerts will still be sent through configured channels.', channel: 'Channel', status: 'Status', errorCode: 'Error code', latency: 'Latency', time: 'Time', diagnostics: 'Diagnostics', resultStatus: 'Status', triggered: 'Triggered', yes: 'Yes', no: 'No', observedValue: 'Observed value', valueSeparator: ': ', evaluated: (total, triggered, degraded, skipped) => `Evaluated ${total} · triggered ${triggered} · degraded ${degraded} · skipped ${skipped}`, notificationChannel: { __cooldown__: 'Business cooldown', __cooldown_read_failed__: 'Cooldown read failed', __noise_suppressed__: 'Notification noise suppression', __no_channel__: 'No available channel', __dispatch__: 'Notification dispatch', __context__: 'Session channel' }, notificationStatus: (item) => item.success ? 'Succeeded' : item.errorCode === 'cooldown_active' ? 'Suppressed by cooldown' : item.errorCode === 'cooldown_read_failed' ? 'Cooldown read failed' : item.errorCode === 'noise_suppressed' ? 'Suppressed by noise control' : item.errorCode === 'no_channel' ? 'No channel' : 'Failed',
  },
  ko: {
    pageTitle: '알림 센터 - DSA', heading: '알림 센터', description: '이벤트 알림, 일봉 기술 지표, 관심 종목, 포트폴리오/계좌 연동, 시장 신호등 규칙을 관리합니다. 일회성 테스트를 실행하고 백그라운드 평가 작업의 발동 기록을 확인할 수 있습니다.', createdRule: (name) => `알림 규칙 “${name}”을(를) 만들었습니다`, createSuccess: '생성 완료', close: '닫기', testResult: '테스트 결과', notificationRecords: '알림 전송 시도 기록', notificationResults: '알림 결과', loadingNotifications: '알림 전송 시도 기록을 불러오는 중', noNotifications: '알림 전송 시도 기록 없음', noNotificationsDescription: '표시할 알림 전송 시도 내역이 없습니다. 알림이 발동하면 설정된 채널로 계속 전송됩니다.', channel: '채널', status: '상태', errorCode: '오류 코드', latency: '소요 시간', time: '시각', diagnostics: '진단', resultStatus: '상태', triggered: '발동', yes: '예', no: '아니요', observedValue: '관측값', valueSeparator: ': ', evaluated: (total, triggered, degraded, skipped) => `평가 ${total} · 발동 ${triggered} · 성능 저하 ${degraded} · 건너뜀 ${skipped}`, notificationChannel: { __cooldown__: '업무 재알림 대기', __cooldown_read_failed__: '재알림 대기 조회 실패', __noise_suppressed__: '알림 노이즈 억제', __no_channel__: '사용 가능한 채널 없음', __dispatch__: '알림 전송', __context__: '세션 채널' }, notificationStatus: (item) => item.success ? '성공' : item.errorCode === 'cooldown_active' ? '재알림 대기로 억제됨' : item.errorCode === 'cooldown_read_failed' ? '재알림 대기 조회 실패' : item.errorCode === 'noise_suppressed' ? '노이즈 제어로 억제됨' : item.errorCode === 'no_channel' ? '채널 없음' : '실패',
  },
};

function enabledFilterToQuery(value: AlertRuleEnabledFilter): boolean | undefined {
  if (value === 'enabled') return true;
  if (value === 'disabled') return false;
  return undefined;
}

function alertTypeFilterToQuery(value: AlertTypeFilter): AlertType | undefined {
  return value === 'all' ? undefined : value;
}

function testVariant(result: AlertRuleTestResponse): 'success' | 'warning' | 'danger' {
  if (result.status === 'evaluation_error') return 'danger';
  return result.triggered ? 'success' : 'warning';
}

function renderTestResultMessage(
  result: AlertRuleTestResponse,
  text: (typeof ALERTS_PAGE_TEXT)[UiLanguage],
): React.ReactNode {
  const targetResults = result.targetResults ?? [];
  return (
    <div className="space-y-2">
      <div>
        {result.message}
        {` · ${text.resultStatus}${text.valueSeparator}`}
        {result.status}
        {` · ${text.triggered}${text.valueSeparator}`}
        {result.triggered ? text.yes : text.no}
        {` · ${text.observedValue}${text.valueSeparator}`}
        {result.observedValue == null ? '--' : String(result.observedValue)}
      </div>
      {result.evaluatedCount != null && result.evaluatedCount > 1 ? (
        <div className="text-xs">
          {text.evaluated(result.evaluatedCount, result.triggeredCount ?? 0, result.degradedCount ?? 0, result.skippedCount ?? 0)}
        </div>
      ) : null}
      {targetResults.length > 1 ? (
        <div className="grid gap-1 text-xs">
          {targetResults.slice(0, 20).map((item) => (
            <div key={`${item.target}-${item.status}`} className="flex flex-wrap justify-between gap-2">
              <span>{item.displayTarget ?? item.target}</span>
              <span>
                {item.status}
                {item.recordStatus ? ` / ${item.recordStatus}` : ''}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

const AlertsPage: React.FC = () => {
  const { language } = useUiLanguage();
  const text = ALERTS_PAGE_TEXT[language];
  useEffect(() => {
    document.title = text.pageTitle;
  }, [text.pageTitle]);

  const [rules, setRules] = useState<AlertRuleItem[]>([]);
  const [rulesTotal, setRulesTotal] = useState(0);
  const [rulesPage, setRulesPage] = useState(1);
  const [enabledFilter, setEnabledFilter] = useState<AlertRuleEnabledFilter>('all');
  const [alertTypeFilter, setAlertTypeFilter] = useState<AlertTypeFilter>('all');
  const [rulesLoading, setRulesLoading] = useState(false);
  const [rulesError, setRulesError] = useState<ParsedApiError | null>(null);
  const [rulesLoaded, setRulesLoaded] = useState(false);

  const [triggers, setTriggers] = useState<AlertTriggerItem[]>([]);
  const [triggersLoading, setTriggersLoading] = useState(false);
  const [triggersError, setTriggersError] = useState<ParsedApiError | null>(null);

  const [notifications, setNotifications] = useState<AlertNotificationItem[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState<ParsedApiError | null>(null);

  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<ParsedApiError | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [busyRule, setBusyRule] = useState<AlertRuleBusyState | null>(null);
  const [testResult, setTestResult] = useState<AlertRuleTestResponse | null>(null);
  const rulesRequestIdRef = useRef(0);

  const loadRules = useCallback(async (pageOverride?: number) => {
    const requestId = rulesRequestIdRef.current + 1;
    rulesRequestIdRef.current = requestId;
    const isLatestRequest = () => rulesRequestIdRef.current === requestId;
    const requestedPage = pageOverride ?? rulesPage;
    const baseQuery = {
      enabled: enabledFilterToQuery(enabledFilter),
      alertType: alertTypeFilterToQuery(alertTypeFilter),
      pageSize: PAGE_SIZE,
    };
    setRulesLoading(true);
    try {
      let response = await alertsApi.listRules({ ...baseQuery, page: requestedPage });
      if (!isLatestRequest()) return null;
      const lastPage = Math.max(1, Math.ceil(response.total / PAGE_SIZE));
      if (response.items.length === 0 && response.total > 0 && requestedPage > lastPage) {
        setRulesPage(lastPage);
        response = await alertsApi.listRules({ ...baseQuery, page: lastPage });
        if (!isLatestRequest()) return null;
      } else if (pageOverride !== undefined && pageOverride !== rulesPage) {
        setRulesPage(pageOverride);
      }
      setRules(response.items);
      setRulesTotal(response.total);
      setRulesError(null);
      setRulesLoaded(true);
      return response;
    } catch (error) {
      if (!isLatestRequest()) return null;
      setRulesError(getParsedApiError(error));
      return null;
    } finally {
      if (isLatestRequest()) {
        setRulesLoading(false);
      }
    }
  }, [alertTypeFilter, enabledFilter, rulesPage]);

  const loadTriggers = useCallback(async () => {
    setTriggersLoading(true);
    try {
      const response = await alertsApi.listTriggers({ page: 1, pageSize: PAGE_SIZE });
      setTriggers(response.items);
      setTriggersError(null);
    } catch (error) {
      setTriggersError(getParsedApiError(error));
    } finally {
      setTriggersLoading(false);
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    setNotificationsLoading(true);
    try {
      const response = await alertsApi.listNotifications({ page: 1, pageSize: PAGE_SIZE });
      setNotifications(response.items);
      setNotificationsError(null);
    } catch (error) {
      setNotificationsError(getParsedApiError(error));
    } finally {
      setNotificationsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRules();
  }, [loadRules]);

  useEffect(() => {
    if (!rulesLoaded) return;
    void loadTriggers();
    void loadNotifications();
  }, [loadNotifications, loadTriggers, rulesLoaded]);

  const handleCreateRule = async (payload: AlertRuleCreateRequest) => {
    setCreateLoading(true);
    setCreateError(null);
    setCreateSuccess(null);
    try {
      const created = await alertsApi.createRule(payload);
      setCreateSuccess(text.createdRule(created.name));
      await loadRules(1);
      return true;
    } catch (error) {
      setCreateError(getParsedApiError(error));
      return false;
    } finally {
      setCreateLoading(false);
    }
  };

  const handleToggleEnabled = async (rule: AlertRuleItem) => {
    setBusyRule({ id: rule.id, action: 'toggle' });
    try {
      if (rule.enabled) {
        await alertsApi.disableRule(rule.id);
      } else {
        await alertsApi.enableRule(rule.id);
      }
      await loadRules();
    } catch (error) {
      setRulesError(getParsedApiError(error));
    } finally {
      setBusyRule(null);
    }
  };

  const handleDeleteRule = async (rule: AlertRuleItem) => {
    setBusyRule({ id: rule.id, action: 'delete' });
    try {
      await alertsApi.deleteRule(rule.id);
      await loadRules();
    } catch (error) {
      setRulesError(getParsedApiError(error));
    } finally {
      setBusyRule(null);
    }
  };

  const handleTestRule = async (rule: AlertRuleItem) => {
    setBusyRule({ id: rule.id, action: 'test' });
    setTestResult(null);
    try {
      const result = await alertsApi.testRule(rule.id);
      setTestResult(result);
    } catch (error) {
      setRulesError(getParsedApiError(error));
    } finally {
      setBusyRule(null);
    }
  };

  return (
    <AppPage className="space-y-5">
      <PageHeader
        eyebrow="Alert Center"
        title={text.heading}
        description={text.description}
      />

      {createError ? <ApiErrorAlert error={createError} onDismiss={() => setCreateError(null)} /> : null}
      {createSuccess ? (
        <InlineAlert
          title={text.createSuccess}
          message={createSuccess}
          variant="success"
          action={(
            <button type="button" className="text-sm underline" onClick={() => setCreateSuccess(null)}>
              {text.close}
            </button>
          )}
        />
      ) : null}
      {rulesError ? <ApiErrorAlert error={rulesError} onDismiss={() => setRulesError(null)} /> : null}

      <div className="grid items-stretch gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
        <AlertRuleForm onSubmit={handleCreateRule} isSubmitting={createLoading} />
        <div className="flex h-full min-h-0 flex-col gap-4">
          <AlertRuleList
            className="flex h-full min-h-0 flex-col"
            rules={rules}
            total={rulesTotal}
            page={rulesPage}
            pageSize={PAGE_SIZE}
            isLoading={rulesLoading}
            enabledFilter={enabledFilter}
            alertTypeFilter={alertTypeFilter}
            onEnabledFilterChange={(value) => {
              setEnabledFilter(value);
              setRulesPage(1);
            }}
            onAlertTypeFilterChange={(value) => {
              setAlertTypeFilter(value);
              setRulesPage(1);
            }}
            onPageChange={setRulesPage}
            onToggleEnabled={(rule) => void handleToggleEnabled(rule)}
            onDelete={(rule) => void handleDeleteRule(rule)}
            onTest={(rule) => void handleTestRule(rule)}
            busyRule={busyRule}
          />
          {testResult ? (
            <InlineAlert
              title={text.testResult}
              variant={testVariant(testResult)}
              message={renderTestResultMessage(testResult, text)}
            />
          ) : null}
        </div>
      </div>

      {triggersError ? <ApiErrorAlert error={triggersError} onDismiss={() => setTriggersError(null)} /> : null}
      <AlertTriggerHistory triggers={triggers} isLoading={triggersLoading} />

      {notificationsError ? <ApiErrorAlert error={notificationsError} onDismiss={() => setNotificationsError(null)} /> : null}
      <Card title={text.notificationRecords} subtitle={text.notificationResults} variant="bordered" padding="md">
        {notificationsLoading ? <Loading label={text.loadingNotifications} /> : null}
        {!notificationsLoading && notifications.length === 0 ? (
          <EmptyState
            icon={<BellRing className="h-6 w-6" />}
            title={text.noNotifications}
            description={text.noNotificationsDescription}
          />
        ) : null}
        {!notificationsLoading && notifications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="border-b border-border/60 text-xs uppercase text-muted-text">
                <tr>
                  <th className="px-3 py-2 font-medium">{text.channel}</th>
                  <th className="px-3 py-2 font-medium">{text.status}</th>
                  <th className="px-3 py-2 font-medium">{text.errorCode}</th>
                  <th className="px-3 py-2 font-medium">{text.latency}</th>
                  <th className="px-3 py-2 font-medium">{text.time}</th>
                  <th className="px-3 py-2 font-medium">{text.diagnostics}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {notifications.map((notification) => (
                  <tr key={notification.id}>
                    <td className="px-3 py-3">{text.notificationChannel[notification.channel] ?? notification.channel}</td>
                    <td className="px-3 py-3">{text.notificationStatus(notification)}</td>
                    <td className="px-3 py-3">{notification.errorCode ?? '--'}</td>
                    <td className="px-3 py-3">{notification.latencyMs == null ? '--' : `${notification.latencyMs}ms`}</td>
                    <td className="px-3 py-3">{formatDateTime(notification.createdAt)}</td>
                    <td className="px-3 py-3">{notification.diagnostics ?? '--'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </Card>
    </AppPage>
  );
};

export default AlertsPage;
