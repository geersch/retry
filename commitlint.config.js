// Scoped Commits: https://scopedcommits.com
// Format: <scope>: <description>
export default {
  extends: ['@commitlint/config-conventional'],
  parserPreset: {
    parserOpts: {
      headerPattern: /^(.+?):\s(.+)$/,
      headerCorrespondence: ['type', 'subject'],
    },
  },
  rules: {
    // Allow any scope (disable conventional commits type restrictions)
    'type-enum': [0],
    'type-case': [0],
    // Allow any subject casing
    'subject-case': [0],
  },
};
