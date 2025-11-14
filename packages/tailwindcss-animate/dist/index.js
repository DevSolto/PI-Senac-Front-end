import plugin from 'tailwindcss/plugin';

const buildTransform = (prefix) =>
  `translate3d(var(--tw-${prefix}-translate-x, 0), var(--tw-${prefix}-translate-y, 0), 0) scale(var(--tw-${prefix}-scale, 1)) rotate(var(--tw-${prefix}-rotate, 0))`;

const defaultEasing = 'cubic-bezier(0.16, 1, 0.3, 1)';
const defaultDuration = '200ms';

const withUnit = (value) => (typeof value === 'number' ? `${value}` : value);

const createSlideUtilities = (type, axis, sign) => (value) => ({
  [`--tw-${type}-translate-${axis}`]:
    sign === 'negative' ? `-${value}` : value,
});

const animatePlugin = plugin(({ addBase, addUtilities, matchUtilities, theme }) => {
  addBase({
    '@keyframes animate-in': {
      from: {
        opacity: 'var(--tw-enter-opacity, 0)',
        transform: buildTransform('enter'),
        filter: 'blur(var(--tw-enter-blur, 0))',
      },
      to: {
        opacity: 'var(--tw-enter-final-opacity, 1)',
        transform: 'translate3d(0, 0, 0) scale(1) rotate(0)',
        filter: 'blur(0)',
      },
    },
    '@keyframes animate-out': {
      from: {
        opacity: 'var(--tw-exit-initial-opacity, 1)',
        transform: 'translate3d(0, 0, 0) scale(1) rotate(0)',
        filter: 'blur(0)',
      },
      to: {
        opacity: 'var(--tw-exit-opacity, 0)',
        transform: buildTransform('exit'),
        filter: 'blur(var(--tw-exit-blur, 0))',
      },
    },
  });

  addUtilities({
    '.animate-in': {
      '--tw-enter-opacity': '1',
      '--tw-enter-final-opacity': '1',
      '--tw-enter-scale': '1',
      '--tw-enter-rotate': '0deg',
      '--tw-enter-translate-x': '0',
      '--tw-enter-translate-y': '0',
      '--tw-enter-blur': '0',
      animation: `animate-in var(--tw-enter-duration, ${defaultDuration}) var(--tw-enter-easing, ${defaultEasing}) both`,
    },
    '.animate-out': {
      '--tw-exit-opacity': '0',
      '--tw-exit-initial-opacity': '1',
      '--tw-exit-scale': '1',
      '--tw-exit-rotate': '0deg',
      '--tw-exit-translate-x': '0',
      '--tw-exit-translate-y': '0',
      '--tw-exit-blur': '0',
      animation: `animate-out var(--tw-exit-duration, ${defaultDuration}) var(--tw-exit-easing, ${defaultEasing}) both`,
    },
    '.slide-in-from-top': {
      '--tw-enter-translate-y': '-100%'
    },
    '.slide-in-from-bottom': {
      '--tw-enter-translate-y': '100%'
    },
    '.slide-in-from-left': {
      '--tw-enter-translate-x': '-100%'
    },
    '.slide-in-from-right': {
      '--tw-enter-translate-x': '100%'
    },
    '.slide-out-to-top': {
      '--tw-exit-translate-y': '-100%'
    },
    '.slide-out-to-bottom': {
      '--tw-exit-translate-y': '100%'
    },
    '.slide-out-to-left': {
      '--tw-exit-translate-x': '-100%'
    },
    '.slide-out-to-right': {
      '--tw-exit-translate-x': '100%'
    },
  });

  matchUtilities(
    {
      'fade-in': (value) => ({
        '--tw-enter-opacity': value,
      }),
      'fade-out': (value) => ({
        '--tw-exit-opacity': value,
      }),
    },
    { values: theme('opacity') }
  );

  const spacing = Object.fromEntries(
    Object.entries(theme('spacing')).map(([key, val]) => [key, withUnit(val)])
  );

  matchUtilities(
    {
      'slide-in-from-top': createSlideUtilities('enter', 'y', 'negative'),
      'slide-in-from-bottom': createSlideUtilities('enter', 'y', 'positive'),
      'slide-in-from-left': createSlideUtilities('enter', 'x', 'negative'),
      'slide-in-from-right': createSlideUtilities('enter', 'x', 'positive'),
      'slide-out-to-top': createSlideUtilities('exit', 'y', 'negative'),
      'slide-out-to-bottom': createSlideUtilities('exit', 'y', 'positive'),
      'slide-out-to-left': createSlideUtilities('exit', 'x', 'negative'),
      'slide-out-to-right': createSlideUtilities('exit', 'x', 'positive'),
    },
    { values: spacing, supportsNegativeValues: false }
  );

  const scale = Object.fromEntries(
    Object.entries(theme('scale')).map(([key, val]) => [key, withUnit(val)])
  );

  matchUtilities(
    {
      'zoom-in': (value) => ({
        '--tw-enter-scale': value,
      }),
      'zoom-out': (value) => ({
        '--tw-exit-scale': value,
      }),
    },
    { values: scale }
  );

  matchUtilities(
    {
      'spin-in': (value) => ({
        '--tw-enter-rotate': value,
      }),
      'spin-out': (value) => ({
        '--tw-exit-rotate': value,
      }),
    },
    {
      values: {
        0: '0deg',
        90: '90deg',
        180: '180deg',
        270: '270deg',
        360: '360deg',
      },
    }
  );

  matchUtilities(
    {
      'blur-in': (value) => ({
        '--tw-enter-blur': value,
      }),
      'blur-out': (value) => ({
        '--tw-exit-blur': value,
      }),
    },
    {
      values: {
        sm: '4px',
        DEFAULT: '8px',
        lg: '12px',
      },
    }
  );
});

export default animatePlugin;
