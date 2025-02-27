import { Option, Some, None, fromNullable } from '../utils/option';

export type AspectRule = {
  name: string;
  description: string;
  validate: (code: string) => Option<string[]>;
};

export type ValidationResult = {
  rule: string;
  violations: string[];
};

// Functional programming rules
export const rules: AspectRule[] = [
  {
    name: 'no-mutation',
    description: 'Avoid mutating state directly',
    validate: (code: string): Option<string[]> => {
      const violations: string[] = [];
      const mutationPatterns = [
        /\.[a-zA-Z]+\s*=\s*/g,
        /\+\+/g,
        /--/g,
        /\+=|-=|\*=|\/=/g
      ];

      mutationPatterns.forEach(pattern => {
        const matches = code.match(pattern);
        if (matches) {
          violations.push(...matches.map(m => `Found mutation: ${m.trim()}`));
        }
      });

      return violations.length > 0 ? Some(violations) : None;
    }
  },
  {
    name: 'pure-function',
    description: 'Functions should be pure and have no side effects',
    validate: (code: string): Option<string[]> => {
      const violations: string[] = [];
      const sideEffectPatterns = [
        /console\.(log|warn|error)/g,
        /Math\.random/g,
        /new Date\(\)/g,
        /setTimeout|setInterval/g
      ];

      sideEffectPatterns.forEach(pattern => {
        const matches = code.match(pattern);
        if (matches) {
          violations.push(...matches.map(m => `Found side effect: ${m.trim()}`));
        }
      });

      return violations.length > 0 ? Some(violations) : None;
    }
  },
  {
    name: 'immutable-state',
    description: 'Use immutable state management',
    validate: (code: string): Option<string[]> => {
      const violations: string[] = [];
      const mutableStatePatterns = [
        /useState\(\)/g,
        /this\.state\s*=/g,
        /setState\(\{[^}]+\}\)/g
      ];

      mutableStatePatterns.forEach(pattern => {
        const matches = code.match(pattern);
        if (matches) {
          violations.push(...matches.map(m => `Found mutable state: ${m.trim()}`));
        }
      });

      return violations.length > 0 ? Some(violations) : None;
    }
  },
  {
    name: 'option-types',
    description: 'Use Option types instead of null/undefined',
    validate: (code: string): Option<string[]> => {
      const violations: string[] = [];
      const nullPatterns = [
        /null/g,
        /undefined/g,
        /\?\./g
      ];

      nullPatterns.forEach(pattern => {
        const matches = code.match(pattern);
        if (matches) {
          violations.push(...matches.map(m => `Found null/undefined usage: ${m.trim()}`));
        }
      });

      return violations.length > 0 ? Some(violations) : None;
    }
  }
];

// Validation function
export const validateCode = (code: string): ValidationResult[] => {
  return rules
    .map(rule => ({
      rule: rule.name,
      violations: fromNullable(rule.validate(code))
        .fold(
          () => [],
          violations => violations
        )
    }))
    .filter(result => result.violations.length > 0);
}; 