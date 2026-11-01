const { ci, assertMatrix } = require('./lighthouserc.cjs')

module.exports = {
  ci: {
    ...ci,
    collect: { ...ci.collect, settings: { ...ci.collect.settings, preset: 'desktop' } },
    assert: { assertMatrix: assertMatrix({ performance: 0.95 }) },
    upload: { ...ci.upload, outputDir: 'lighthouse-reports/desktop' },
  },
}
