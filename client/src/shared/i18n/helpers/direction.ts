import i18n from '../i18n';

export function isRTL(): boolean {
  return i18n.dir(i18n.language) === 'rtl';
}

export function getTextAlign(): 'right' | 'left' {
  return isRTL() ? 'right' : 'left';
}

export function getWritingDirection(): 'rtl' | 'ltr' {
  return isRTL() ? 'rtl' : 'ltr';
}
