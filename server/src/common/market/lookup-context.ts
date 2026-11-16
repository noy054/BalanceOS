import { DEFAULT_MARKET_CODE, Market, resolveMarket } from './markets';

export type LookupContext = {
  market: Market;
  uiLanguage: string | null;
};

export function lookupContext(
  marketCode: string | null | undefined = DEFAULT_MARKET_CODE,
  uiLanguage: string | null = null,
): LookupContext {
  return { market: resolveMarket(marketCode), uiLanguage };
}

export function nameLanguages(context: LookupContext): string[] {
  return [
    ...new Set(
      [...context.market.nameLanguages, context.uiLanguage].filter(
        (language): language is string => Boolean(language),
      ),
    ),
  ];
}
