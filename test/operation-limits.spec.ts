import { buildSchema, getIntrospectionQuery, parse, validate } from 'graphql';
import { operationLimitsRule } from '../src/graphql/operation-limits.rule';

const schema = buildSchema(
  'type Query { profiles: [Profile!]! } type Profile { slug: String! }',
);
const errors = (query: string) =>
  validate(schema, parse(query), [operationLimitsRule]);

describe('GraphQL operation budgets', () => {
  it('allows exactly 50 aliases and rejects the next one, including fragment reuse', () => {
    const fields = Array.from({ length: 50 }, (_, i) => `s${i}: slug`).join(
      ' ',
    );
    expect(errors(`{ profiles { ${fields} } }`)).toHaveLength(0);
    expect(
      errors(
        `{ profiles { ${fields} ...More } } fragment More on Profile { extra: slug }`,
      )[0]?.message,
    ).toContain('alias limit of 50');
  });

  it('allows exactly 1000 selections and rejects the next one without aliases', () => {
    expect(errors(`{ profiles { ${'slug '.repeat(999)} } }`)).toHaveLength(0);
    expect(
      errors(`{ profiles { ${'slug '.repeat(1000)} } }`)[0]?.message,
    ).toContain('selection limit of 1000');
  });

  it('expands nested fragments at each spread without exponential work', () => {
    const fragments = Array.from(
      { length: 30 },
      (_, i) =>
        `fragment F${i} on Profile { ${i === 29 ? 'slug' : `...F${i + 1} ...F${i + 1}`} }`,
    ).join(' ');
    expect(errors(`{ profiles { ...F0 } } ${fragments}`)[0]?.message).toContain(
      'selection limit',
    );
  });

  it('leaves cyclic-fragment rejection to standard validation without looping', () => {
    const document = parse(
      '{ profiles { ...Cycle } } fragment Cycle on Profile { ...Cycle }',
    );
    expect(validate(schema, document, [operationLimitsRule])).toHaveLength(0);
    expect(
      validate(schema, document).some((error) =>
        error.message.includes('within itself'),
      ),
    ).toBe(true);
  });

  it('applies budgets separately to operations and conservatively counts skipped selections', () => {
    const fields = Array.from({ length: 50 }, (_, i) => `s${i}: slug`).join(
      ' ',
    );
    expect(
      errors(
        `query A { profiles { ${fields} } } query B { profiles { ${fields} } }`,
      ),
    ).toHaveLength(0);
    expect(
      errors(
        `{ profiles { ${fields} ... on Profile @skip(if: true) { extra: slug } } }`,
      )[0]?.message,
    ).toContain('alias limit');
  });

  it('allows full introspection with every optional metadata field', () => {
    expect(
      errors(
        getIntrospectionQuery({
          descriptions: true,
          specifiedByUrl: true,
          directiveIsRepeatable: true,
          schemaDescription: true,
          inputValueDeprecation: true,
          oneOf: true,
        }),
      ),
    ).toHaveLength(0);
  });
});
