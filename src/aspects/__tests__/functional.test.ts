import { validateCode, rules } from '../functional';
import { isSome } from '../../utils/option';

describe('Functional Programming Aspect Rules', () => {
  describe('no-mutation rule', () => {
    const rule = rules.find(r => r.name === 'no-mutation')!;

    test('should detect direct property mutations', () => {
      const code = `
        obj.prop = 42;
        this.state = newState;
      `;
      const result = rule.validate(code);
      expect(isSome(result)).toBe(true);
      if (isSome(result)) {
        expect(result.value).toContain('Found mutation: .prop =');
        expect(result.value).toContain('Found mutation: .state =');
      }
    });

    test('should detect increment/decrement operators', () => {
      const code = `
        count++;
        i--;
      `;
      const result = rule.validate(code);
      expect(isSome(result)).toBe(true);
      if (isSome(result)) {
        expect(result.value).toContain('Found mutation: ++');
        expect(result.value).toContain('Found mutation: --');
      }
    });
  });

  describe('pure-function rule', () => {
    const rule = rules.find(r => r.name === 'pure-function')!;

    test('should detect console logging', () => {
      const code = `
        console.log('debug');
        console.error('oops');
      `;
      const result = rule.validate(code);
      expect(isSome(result)).toBe(true);
      if (isSome(result)) {
        expect(result.value).toContain('Found side effect: console.log');
        expect(result.value).toContain('Found side effect: console.error');
      }
    });

    test('should detect random number generation', () => {
      const code = `const random = Math.random();`;
      const result = rule.validate(code);
      expect(isSome(result)).toBe(true);
      if (isSome(result)) {
        expect(result.value).toContain('Found side effect: Math.random');
      }
    });
  });

  describe('immutable-state rule', () => {
    const rule = rules.find(r => r.name === 'immutable-state')!;

    test('should detect useState without initialization', () => {
      const code = `const [state, setState] = useState();`;
      const result = rule.validate(code);
      expect(isSome(result)).toBe(true);
      if (isSome(result)) {
        expect(result.value).toContain('Found mutable state: useState()');
      }
    });

    test('should detect class component state mutations', () => {
      const code = `this.state = { count: 0 };`;
      const result = rule.validate(code);
      expect(isSome(result)).toBe(true);
      if (isSome(result)) {
        expect(result.value).toContain('Found mutable state: this.state =');
      }
    });
  });

  describe('option-types rule', () => {
    const rule = rules.find(r => r.name === 'option-types')!;

    test('should detect null usage', () => {
      const code = `const value = null;`;
      const result = rule.validate(code);
      expect(isSome(result)).toBe(true);
      if (isSome(result)) {
        expect(result.value).toContain('Found null/undefined usage: null');
      }
    });

    test('should detect optional chaining', () => {
      const code = `const name = user?.name;`;
      const result = rule.validate(code);
      expect(isSome(result)).toBe(true);
      if (isSome(result)) {
        expect(result.value).toContain('Found null/undefined usage: ?.');
      }
    });
  });

  describe('validateCode', () => {
    test('should return all violations', () => {
      const code = `
        let count = 0;
        count++;
        console.log(count);
        const value = null;
      `;
      const results = validateCode(code);
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.rule === 'no-mutation')).toBe(true);
      expect(results.some(r => r.rule === 'pure-function')).toBe(true);
      expect(results.some(r => r.rule === 'option-types')).toBe(true);
    });
  });
}); 