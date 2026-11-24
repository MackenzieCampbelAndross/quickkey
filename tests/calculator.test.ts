import { describe, it, expect } from 'vitest';
import { Calculator } from '../src/core/calculator';

describe('Calculator Engine', () => {
  it('evaluates basic arithmetic with proper operator precedence', () => {
    const res = Calculator.evaluate('2 + 3 * 4');
    expect(res).not.toBeNull();
    expect(res!.result).toBe(14);
  });

  it('evaluates parenthesized sub-expressions', () => {
    const res = Calculator.evaluate('(2 + 3) * 4');
    expect(res).not.toBeNull();
    expect(res!.result).toBe(20);
  });

  it('evaluates exponents and powers', () => {
    const res = Calculator.evaluate('2 ^ 8');
    expect(res).not.toBeNull();
    expect(res!.result).toBe(256);
  });

  it('evaluates mathematical functions', () => {
    const sqrtRes = Calculator.evaluate('sqrt(144)');
    expect(sqrtRes).not.toBeNull();
    expect(sqrtRes!.result).toBe(12);

    const absRes = Calculator.evaluate('abs(-99)');
    expect(absRes).not.toBeNull();
    expect(absRes!.result).toBe(99);

    const logRes = Calculator.evaluate('log(1000)');
    expect(logRes).not.toBeNull();
    expect(logRes!.result).toBe(3);
  });

  it('supports constants like pi and e', () => {
    const piRes = Calculator.evaluate('pi * 2');
    expect(piRes).not.toBeNull();
    expect(piRes!.result).toBeCloseTo(Math.PI * 2, 5);
  });

  it('evaluates hexadecimal and binary numbers', () => {
    const hexRes = Calculator.evaluate('0xFF + 1');
    expect(hexRes).not.toBeNull();
    expect(hexRes!.result).toBe(256);

    const binRes = Calculator.evaluate('0b1010 + 2');
    expect(binRes).not.toBeNull();
    expect(binRes!.result).toBe(12);
  });

  it('handles division by zero and malformed input gracefully without crashing', () => {
    expect(Calculator.evaluate('10 / 0')).toBeNull();
    expect(Calculator.evaluate('+++')).toBeNull();
    expect(Calculator.evaluate('not a math query')).toBeNull();
  });
});
