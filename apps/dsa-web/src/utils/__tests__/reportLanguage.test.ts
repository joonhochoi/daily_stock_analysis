import { describe, expect, it } from 'vitest';
import { getReportText, normalizeReportLanguage } from '../reportLanguage';
import { getSentimentLabel } from '../../types/analysis';

describe('report language helpers', () => {
  it('normalizes Korean locale variants to ko', () => {
    expect(normalizeReportLanguage('ko')).toBe('ko');
    expect(normalizeReportLanguage('ko-KR')).toBe('ko');
    expect(normalizeReportLanguage('korean')).toBe('ko');
  });

  it('returns Korean fixed report copy and sentiment labels', () => {
    expect(getReportText('ko').fullReport).toBe('전체 분석 보고서');
    expect(getReportText('ko').actionAdvice).toBe('매매 의견');
    expect(getSentimentLabel(85, 'ko')).toBe('매우 낙관적');
    expect(getSentimentLabel(15, 'ko')).toBe('매우 비관적');
  });
});
