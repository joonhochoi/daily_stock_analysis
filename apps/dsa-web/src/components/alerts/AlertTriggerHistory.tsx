import type React from 'react';
import { Activity } from 'lucide-react';
import { Badge, Card, EmptyState, Loading } from '../common';
import { useUiLanguage } from '../../contexts/UiLanguageContext';
import type { UiLanguage } from '../../i18n/uiText';
import type { AlertTriggerItem } from '../../types/alerts';
import { formatDateTime } from '../../utils/format';
import { getMarketPhaseSummaryLabel } from '../../utils/marketPhase';

const TEXT: Record<UiLanguage, {
  title: string;
  subtitle: string;
  loading: string;
  emptyTitle: string;
  emptyDescription: string;
  status: string;
  phaseQuality: string;
  target: string;
  observedValue: string;
  threshold: string;
  dataSource: string;
  dataTimestamp: string;
  reason: string;
  quality: string;
  triggered: string;
  skipped: string;
  degraded: string;
  failed: string;
}> = {
  zh: {
    title: '触发历史', subtitle: '评估记录', loading: '正在加载触发历史',
    emptyTitle: '暂无触发历史',
    emptyDescription: '后台评估会记录 triggered、skipped、degraded 和 failed 状态；正常未触发不会写入历史。',
    status: '状态', phaseQuality: '阶段 / 质量', target: '目标', observedValue: '观察值', threshold: '阈值',
    dataSource: '数据源', dataTimestamp: '数据时间', reason: '原因', quality: '质量',
    triggered: '已触发', skipped: '已跳过', degraded: '降级', failed: '失败',
  },
  en: {
    title: 'Trigger history', subtitle: 'Evaluation records', loading: 'Loading trigger history',
    emptyTitle: 'No trigger history',
    emptyDescription: 'Background evaluation records triggered, skipped, degraded, and failed states. Normal non-triggers are not recorded.',
    status: 'Status', phaseQuality: 'Phase / quality', target: 'Target', observedValue: 'Observed value', threshold: 'Threshold',
    dataSource: 'Data source', dataTimestamp: 'Data time', reason: 'Reason', quality: 'Quality',
    triggered: 'Triggered', skipped: 'Skipped', degraded: 'Degraded', failed: 'Failed',
  },
  ko: {
    title: '트리거 이력', subtitle: '평가 기록', loading: '트리거 이력을 불러오는 중',
    emptyTitle: '트리거 이력이 없습니다',
    emptyDescription: '백그라운드 평가는 triggered, skipped, degraded, failed 상태를 기록합니다. 정상적으로 미발생한 경우는 이력에 남기지 않습니다.',
    status: '상태', phaseQuality: '장 구분 / 품질', target: '대상', observedValue: '관측값', threshold: '임계값',
    dataSource: '데이터 소스', dataTimestamp: '데이터 시각', reason: '사유', quality: '품질',
    triggered: '발생', skipped: '건너뜀', degraded: '성능 저하', failed: '실패',
  },
};

function statusVariant(status: string): 'success' | 'warning' | 'danger' | 'default' {
  if (status === 'triggered') return 'success';
  if (status === 'skipped' || status === 'degraded') return 'warning';
  if (status === 'failed') return 'danger';
  return 'default';
}

function formatNullable(value?: string | number | null): string {
  if (value === null || value === undefined || value === '') return '--';
  return String(value);
}

function renderPhaseQuality(trigger: AlertTriggerItem, language: UiLanguage, qualityLabel: string): React.ReactNode {
  const phase = getMarketPhaseSummaryLabel(trigger.marketPhaseSummary, language);
  const quality = trigger.analysisContextPackOverview?.dataQuality?.level;
  const limitations = trigger.analysisContextPackOverview?.dataQuality?.limitations?.slice(0, 2) ?? [];
  if (!phase && !quality && limitations.length === 0) {
    return <span className="text-xs text-muted-text">--</span>;
  }
  return (
    <div className="space-y-1">
      {phase ? <Badge variant="default">{phase.replace(/^[^:：]+[:：]\s*/, '')}</Badge> : null}
      {quality ? <div className="text-xs text-secondary-text">{qualityLabel}: {quality}</div> : null}
      {limitations.length ? (
        <div className="max-w-[180px] text-xs text-muted-text">{limitations.join('；')}</div>
      ) : null}
    </div>
  );
}

interface AlertTriggerHistoryProps {
  triggers: AlertTriggerItem[];
  isLoading?: boolean;
}

export const AlertTriggerHistory: React.FC<AlertTriggerHistoryProps> = ({ triggers, isLoading = false }) => {
  const { language } = useUiLanguage();
  const text = TEXT[language];
  const statusLabel: Record<string, string> = {
    triggered: text.triggered,
    skipped: text.skipped,
    degraded: text.degraded,
    failed: text.failed,
  };

  return (
    <Card title={text.title} subtitle={text.subtitle} variant="bordered" padding="md">
      {isLoading ? <Loading label={text.loading} /> : null}
      {!isLoading && triggers.length === 0 ? (
        <EmptyState
          icon={<Activity className="h-6 w-6" />}
          title={text.emptyTitle}
          description={text.emptyDescription}
        />
      ) : null}
      {!isLoading && triggers.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-border/60 text-xs uppercase text-muted-text">
              <tr>
                <th className="px-3 py-2 font-medium">{text.status}</th>
                <th className="px-3 py-2 font-medium">{text.phaseQuality}</th>
                <th className="px-3 py-2 font-medium">{text.target}</th>
                <th className="px-3 py-2 font-medium">{text.observedValue}</th>
                <th className="px-3 py-2 font-medium">{text.threshold}</th>
                <th className="px-3 py-2 font-medium">{text.dataSource}</th>
                <th className="px-3 py-2 font-medium">{text.dataTimestamp}</th>
                <th className="px-3 py-2 font-medium">{text.reason}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {triggers.map((trigger) => (
                <tr key={trigger.id} className="align-top">
                  <td className="px-3 py-3">
                    <Badge variant={statusVariant(trigger.status)}>
                      {statusLabel[trigger.status] ?? trigger.status}
                    </Badge>
                  </td>
                  <td className="px-3 py-3">{renderPhaseQuality(trigger, language, text.quality)}</td>
                  <td className="px-3 py-3 font-mono text-secondary-text">{trigger.target}</td>
                  <td className="px-3 py-3 text-secondary-text">{formatNullable(trigger.observedValue)}</td>
                  <td className="px-3 py-3 text-secondary-text">{formatNullable(trigger.threshold)}</td>
                  <td className="px-3 py-3 text-secondary-text">{formatNullable(trigger.dataSource)}</td>
                  <td className="px-3 py-3 text-xs text-secondary-text">
                    {formatDateTime(trigger.dataTimestamp ?? trigger.triggeredAt)}
                  </td>
                  <td className="px-3 py-3 text-secondary-text">
                    {trigger.reason || trigger.diagnostics || '--'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </Card>
  );
};
