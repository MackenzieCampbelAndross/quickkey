/**
 * Secure mathematical expression evaluator without eval() or Function().
 * Tokenizer and Recursive-Descent Parser supporting operators, functions, and unit conversions.
 */

import { CalculationResult } from '../types';

export class Calculator {
  static evaluate(expr: string): CalculationResult | null {
    const trimmed = expr.trim();
    if (!trimmed) return null;

    // Check if it looks like a calculation query (contains math operators, numbers, or math functions)
    if (!/[0-9]/.test(trimmed)) return null;
    if (!/[+\-*/^%()]|sqrt|sin|cos|tan|log|ln|abs|pi|e|hex|bin/i.test(trimmed)) return null;

    try {
      const tokens = this.tokenize(trimmed);
      if (tokens.length === 0) return null;

      let pos = 0;

      const parseExpression = (): number => {
        let val = parseTerm();
        while (pos < tokens.length) {
          const op = tokens[pos];
          if (op === '+' || op === '-') {
            pos++;
            const nextVal = parseTerm();
            val = op === '+' ? val + nextVal : val - nextVal;
          } else {
            break;
          }
        }
        return val;
      };

      const parseTerm = (): number => {
        let val = parseFactor();
        while (pos < tokens.length) {
          const op = tokens[pos];
          if (op === '*' || op === '/' || op === '%') {
            pos++;
            const nextVal = parseFactor();
            if (op === '/' && nextVal === 0) throw new Error('Division by zero');
            val = op === '*' ? val * nextVal : op === '/' ? val / nextVal : val % nextVal;
          } else {
            break;
          }
        }
        return val;
      };

      const parseFactor = (): number => {
        let val = parsePower();
        while (pos < tokens.length && tokens[pos] === '^') {
          pos++;
          const nextVal = parsePower();
          val = Math.pow(val, nextVal);
        }
        return val;
      };

      const parsePower = (): number => {
        if (pos >= tokens.length) throw new Error('Unexpected end of expression');

        const token = tokens[pos];

        // Unary operators
        if (token === '+' || token === '-') {
          pos++;
          const val = parsePower();
          return token === '-' ? -val : val;
        }

        // Parentheses
        if (token === '(') {
          pos++;
          const val = parseExpression();
          if (tokens[pos] !== ')') throw new Error("Expected ')'");
          pos++;
          return val;
        }

        // Functions
        if (/^[a-zA-Z]+$/.test(token)) {
          const fn = token.toLowerCase();
          pos++;
          if (tokens[pos] !== '(') {
            // Check constants
            if (fn === 'pi') return Math.PI;
            if (fn === 'e') return Math.E;
            throw new Error(`Unknown identifier '${fn}'`);
          }
          pos++;
          const arg = parseExpression();
          if (tokens[pos] !== ')') throw new Error("Expected ')' after function argument");
          pos++;

          switch (fn) {
            case 'sqrt': return Math.sqrt(arg);
            case 'sin': return Math.sin(arg * (Math.PI / 180)); // degrees
            case 'cos': return Math.cos(arg * (Math.PI / 180));
            case 'tan': return Math.tan(arg * (Math.PI / 180));
            case 'log': return Math.log10(arg);
            case 'ln': return Math.log(arg);
            case 'abs': return Math.abs(arg);
            case 'round': return Math.round(arg);
            case 'floor': return Math.floor(arg);
            case 'ceil': return Math.ceil(arg);
            default: throw new Error(`Unknown function '${fn}'`);
          }
        }

        // Numbers (decimal, hex, binary)
        pos++;
        if (token.startsWith('0x') || token.startsWith('0X')) {
          return parseInt(token, 16);
        }
        if (token.startsWith('0b') || token.startsWith('0B')) {
          return parseInt(token.slice(2), 2);
        }
        const num = parseFloat(token);
        if (isNaN(num)) throw new Error(`Invalid number: ${token}`);
        return num;
      };

      const result = parseExpression();
      if (isNaN(result) || !isFinite(result)) return null;

      // Format result nicely
      const formatted = Number.isInteger(result)
        ? result.toLocaleString()
        : Math.abs(result) < 0.0001 || Math.abs(result) > 1e12
        ? result.toExponential(4)
        : parseFloat(result.toFixed(6)).toString();

      return {
        expression: trimmed,
        result,
        type: 'math',
        formatted
      };
    } catch {
      return null;
    }
  }

  private static tokenize(expr: string): string[] {
    const tokens: string[] = [];
    let i = 0;

    while (i < expr.length) {
      const ch = expr[i];

      if (/\s/.test(ch)) {
        i++;
        continue;
      }

      if ('+-*/^%()'.includes(ch)) {
        tokens.push(ch);
        i++;
        continue;
      }

      // Numbers (including decimals and hex/bin prefixes)
      if (/[0-9]/.test(ch) || (ch === '.' && i + 1 < expr.length && /[0-9]/.test(expr[i + 1]))) {
        let numStr = '';
        if (ch === '0' && i + 1 < expr.length && (expr[i + 1] === 'x' || expr[i + 1] === 'X')) {
          numStr += expr.slice(i, i + 2);
          i += 2;
          while (i < expr.length && /[0-9a-fA-F]/.test(expr[i])) {
            numStr += expr[i++];
          }
        } else if (ch === '0' && i + 1 < expr.length && (expr[i + 1] === 'b' || expr[i + 1] === 'B')) {
          numStr += expr.slice(i, i + 2);
          i += 2;
          while (i < expr.length && /[01]/.test(expr[i])) {
            numStr += expr[i++];
          }
        } else {
          while (i < expr.length && (/[0-9.]/.test(expr[i]))) {
            numStr += expr[i++];
          }
        }
        tokens.push(numStr);
        continue;
      }

      // Identifiers / functions
      if (/[a-zA-Z]/.test(ch)) {
        let ident = '';
        while (i < expr.length && /[a-zA-Z0-9]/.test(expr[i])) {
          ident += expr[i++];
        }
        tokens.push(ident);
        continue;
      }

      i++;
    }

    return tokens;
  }
}
