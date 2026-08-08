import { describe, expect, it } from 'vitest';
import { UI_TEXT } from '../uiText';

const CJK = /[\u3400-\u9fff\uf900-\ufaff]/;

describe('Korean UI catalog', () => {
  it('has the same keys as the Chinese and English catalogs', () => {
    expect(Object.keys(UI_TEXT.ko).sort()).toEqual(Object.keys(UI_TEXT.en).sort());
    expect(Object.keys(UI_TEXT.ko).sort()).toEqual(Object.keys(UI_TEXT.zh).sort());
  });

  it('localizes settings labels that previously fell back to English', () => {
    expect(UI_TEXT.ko['settings.desktopChecking']).toBe('업데이트 확인 중');
    expect(UI_TEXT.ko['settings.desktopCheckError']).toBe('업데이트 확인 실패');
    expect(UI_TEXT.ko['settings.diagnosticHintDesktop']).toContain('데스크톱 로그');
    expect(UI_TEXT.ko['settings.promptCacheAdvancedTitle']).toBe('Provider Prompt Cache 고급 설정');
  });

  it('does not contain Chinese characters in Korean display text', () => {
    expect(Object.entries(UI_TEXT.ko).filter(([, value]) => CJK.test(value))).toEqual([]);
  });
});
