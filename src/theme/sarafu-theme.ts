import { defineTheme } from '@astryxdesign/core/theme';

export const BRAND_GREEN = '#00FF01';
export const BRAND_INK = '#000000';

export const sarafuTheme = defineTheme({
  name: 'sarafu',
  color: { accent: BRAND_GREEN, neutralStyle: 'cool' },
  tokens: {
    '--color-accent': [BRAND_GREEN, BRAND_GREEN],
  },
  components: {
    button: {
      'variant:primary': {
        backgroundColor: BRAND_GREEN,
        color: BRAND_INK,
      },
    },
  },
});
