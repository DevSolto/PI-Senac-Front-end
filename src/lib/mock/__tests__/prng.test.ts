import { createPrng } from '../prng';

describe('createPrng', () => {
  it('gera sequências determinísticas para a mesma semente', () => {
    const generatorA = createPrng('seed-123');
    const generatorB = createPrng('seed-123');

    const sequenceA = Array.from({ length: 10 }, () => generatorA.next());
    const sequenceB = Array.from({ length: 10 }, () => generatorB.next());

    expect(sequenceA).toEqual(sequenceB);
  });

  it('restaura o estado inicial após chamar reset', () => {
    const generator = createPrng(42);
    const firstRun = Array.from({ length: 5 }, () => generator.next());

    generator.next();
    generator.next();
    generator.reset();

    const secondRun = Array.from({ length: 5 }, () => generator.next());

    expect(secondRun).toEqual(firstRun);
  });

  it('mantém valores de nextRange dentro do intervalo informado', () => {
    const generator = createPrng('range');
    const min = -10;
    const max = 10;

    const values = Array.from({ length: 100 }, () => generator.nextRange(min, max));

    expect(values.every((value) => value >= min && value <= max)).toBe(true);
  });

  it('inclui os limites ao gerar inteiros com nextInt', () => {
    const generator = createPrng('int');
    const min = 2;
    const max = 5;

    const values = Array.from({ length: 200 }, () => generator.nextInt(min, max));

    expect(values.every((value) => Number.isInteger(value))).toBe(true);
    expect(values.some((value) => value === min)).toBe(true);
    expect(values.some((value) => value === max)).toBe(true);
    expect(values.every((value) => value >= min && value <= max)).toBe(true);
  });
});
