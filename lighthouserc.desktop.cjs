const { ci, median } = require('./lighthouserc.cjs')

module.exports = {
  ci: {
    ...ci,
    collect: { ...ci.collect, settings: { preset: 'desktop' } },
    assert: {
      assertions: {
        ...ci.assert.assertions,
        'categories:performance': median({ minScore: 0.95 }),
      },
    },
    upload: { ...ci.upload, outputDir: 'lighthouse-reports/desktop' },
  },
}
