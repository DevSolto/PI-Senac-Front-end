import { getAqiCategory, getAqiColor } from '../aqi';

describe('getAqiCategory', () => {
  it('retorna "good" para valores inválidos', () => {
    expect(getAqiCategory(-5)).toBe('good');
    expect(getAqiCategory(Number.NaN)).toBe('good');
    expect(getAqiCategory(Number.POSITIVE_INFINITY)).toBe('good');
  });

  it.each([
    { value: 0, expected: 'good' },
    { value: 50, expected: 'good' },
    { value: 51, expected: 'moderate' },
    { value: 100, expected: 'moderate' },
    { value: 101, expected: 'unhealthy-for-sensitive' },
    { value: 150, expected: 'unhealthy-for-sensitive' },
    { value: 151, expected: 'unhealthy' },
    { value: 200, expected: 'unhealthy' },
    { value: 201, expected: 'very-unhealthy' },
    { value: 300, expected: 'very-unhealthy' },
    { value: 301, expected: 'hazardous' },
    { value: 600, expected: 'hazardous' },
  ])('identifica o limiar $value como $expected', ({ value, expected }) => {
    expect(getAqiCategory(value)).toBe(expected);
  });
});

describe('getAqiColor', () => {
  it('usa a categoria calculada ao receber um valor numérico', () => {
    expect(getAqiColor(45)).toBe('#2ecc71');
    expect(getAqiColor(175)).toBe('#e74c3c');
  });

  it('resolve diretamente cores por categoria', () => {
    expect(getAqiColor('very-unhealthy')).toBe('#8e44ad');
  });

  it('retorna cor neutra para categorias desconhecidas', () => {
    expect(getAqiColor('desconhecida' as never)).toBe('#95a5a6');
  });
});
