import {
  GraphQLError,
  Kind,
  type SelectionNode,
  type ValidationRule,
} from 'graphql';

export const MAX_OPERATION_ALIASES = 50;
export const MAX_OPERATION_SELECTIONS = 1000;

// Expand each fragment at every spread; stop as soon as the budget is exhausted.
// Counting selections (including spreads) also bounds work on fragment-heavy input.
export const operationLimitsRule: ValidationRule = (context) => ({
  OperationDefinition(operation) {
    let aliases = 0;
    let selections = 0;
    const pending: { node: SelectionNode; path: ReadonlySet<string> }[] =
      operation.selectionSet.selections.map((node) => ({
        node,
        path: new Set(),
      }));
    while (pending.length) {
      const { node, path } = pending.pop()!;
      selections++;
      if (node.kind === Kind.FIELD && node.alias) aliases++;
      const message =
        aliases > MAX_OPERATION_ALIASES
          ? `Operation exceeds the alias limit of ${MAX_OPERATION_ALIASES}.`
          : selections > MAX_OPERATION_SELECTIONS
            ? `Operation exceeds the selection limit of ${MAX_OPERATION_SELECTIONS}.`
            : undefined;
      if (message) {
        context.reportError(
          new GraphQLError(message, {
            nodes: operation,
            extensions: { code: 'GRAPHQL_VALIDATION_FAILED' },
          }),
        );
        return false;
      }
      if (node.kind === Kind.FRAGMENT_SPREAD) {
        if (path.has(node.name.value)) continue; // Standard validation rejects cycles.
        const fragment = context.getFragment(node.name.value);
        if (fragment) {
          const nextPath = new Set(path).add(node.name.value);
          for (const child of fragment.selectionSet.selections) {
            pending.push({ node: child, path: nextPath });
          }
        }
      } else if (node.selectionSet) {
        for (const child of node.selectionSet.selections) {
          pending.push({ node: child, path });
        }
      }
    }
    return false;
  },
});
