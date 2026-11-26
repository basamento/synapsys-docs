const fs = require('node:fs');
const path = require('node:path');

// Collect licenses of packages present in the client compilation. Include all
// LICENSE/NOTICE files found, even when a module is later optimized away.
module.exports = function thirdPartyNotices({ siteDir }) {
  return {
    name: 'third-party-notices',
    postBuild({ outDir }) {
      fs.copyFileSync(path.join(siteDir, 'LICENSE'), path.join(outDir, 'license.txt'));
    },
    configureWebpack(_config, isServer) {
      if (isServer) return {};
      return { plugins: [{
        apply(compiler) {
          if (compiler.options.mode !== 'production') return;
          compiler.hooks.afterEmit.tap('ThirdPartyNotices', (compilation) => {
            const packages = new Map();
            function visit(module) {
              if (module.modules) for (const child of module.modules) visit(child);
              const resource = (module.resource || '').split('?')[0];
              if (!resource.split(/[\\/]/).includes('node_modules')) return;
              let dir = path.dirname(resource);
              while (dir.split(/[\\/]/).includes('node_modules')) {
                const manifest = path.join(dir, 'package.json');
                if (fs.existsSync(manifest)) {
                  const pkg = JSON.parse(fs.readFileSync(manifest, 'utf8'));
                  if (pkg.name && pkg.version) {
                    const key = `${pkg.name}@${pkg.version}`;
                    if (packages.has(key)) return;
                    const files = fs.readdirSync(dir)
                      .filter((name) => /^(licen[cs]e|copying|notice)(\b|[._-])/i.test(name))
                      .filter((name) => fs.statSync(path.join(dir, name)).isFile());
                    const texts = files.map((name) => `${name}:\n${fs.readFileSync(path.join(dir, name), 'utf8')}`);
                    if (!texts.length && key === 'isarray@0.0.1') {
                      const readme = fs.readFileSync(path.join(dir, 'README.md'), 'utf8');
                      const section = readme.split('## License')[1];
                      if (!section) throw new Error(`Missing license section for ${key}`);
                      texts.push(`README.md, License section:\n${section.trim()}`);
                    }
                    if (!texts.length && key === 'infima@0.2.0-alpha.45') {
                      const fallback = path.join(__dirname, 'license-overrides', 'infima-0.2.0-alpha.45.txt');
                      texts.push(fs.readFileSync(fallback, 'utf8'));
                    }
                    if (!texts.length) throw new Error(`No license text found for ${key}`);
                    packages.set(key, { key, license: pkg.license || 'See license text', texts });
                    return;
                  }
                }
                dir = path.dirname(dir);
              }
            }
            for (const module of compilation.modules) visit(module);
            const entries = [...packages.values()].sort((a, b) => a.key.localeCompare(b.key));
            if (!entries.length) throw new Error('No third-party client packages were found');
            const output = ['Third-party notices for Synapsys documentation',
              'Generated from the client compilation. Package licenses apply to their respective components.',
              ...entries.map((entry) => `\n${'='.repeat(72)}\n${entry.key} (${entry.license})\n\n${entry.texts.join('\n\n')}`), ''].join('\n');
            fs.writeFileSync(path.join(compiler.outputPath, 'third-party-notices.txt'), output);
          });
        },
      }] };
    },
  };
};
