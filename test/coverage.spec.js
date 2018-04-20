/**
 * Copyright 2018 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

module.exports.addTests = function({testRunner, expect}) {
  const {describe, xdescribe, fdescribe} = testRunner;
  const {it, fit, xit} = testRunner;
  const {beforeAll, beforeEach, afterAll, afterEach} = testRunner;

  describe('JSCoverage', function() {
    it('should work', async function({page, server}) {
      await page.coverage.startJSCoverage();
      await page.goto(server.PREFIX + '/jscoverage/simple.html');
      const coverage = await page.coverage.stopJSCoverage();
      expect(coverage.length).toBe(1);
      expect(coverage[0].url).toContain('/jscoverage/simple.html');
      expect(coverage[0].ranges).toEqual([
        { start: 0, end: 17 },
        { start: 35, end: 61 },
      ]);
    });
    it('should report sourceURLs', async function({page, server}) {
      await page.coverage.startJSCoverage();
      await page.goto(server.PREFIX + '/jscoverage/sourceurl.html');
      const coverage = await page.coverage.stopJSCoverage();
      expect(coverage.length).toBe(1);
      expect(coverage[0].url).toBe('nicename.js');
    });
    it('should ignore anonymous scripts', async function({page, server}) {
      await page.coverage.startJSCoverage();
      await page.goto(server.EMPTY_PAGE);
      await page.evaluate(() => console.log(1));
      const coverage = await page.coverage.stopJSCoverage();
      expect(coverage.length).toBe(0);
    });
    it('should report multiple scripts', async function({page, server}) {
      await page.coverage.startJSCoverage();
      await page.goto(server.PREFIX + '/jscoverage/multiple.html');
      const coverage = await page.coverage.stopJSCoverage();
      expect(coverage.length).toBe(2);
      coverage.sort((a, b) => a.url.localeCompare(b.url));
      expect(coverage[0].url).toContain('/jscoverage/script1.js');
      expect(coverage[1].url).toContain('/jscoverage/script2.js');
    });
    it('should report right ranges', async function({page, server}) {
      await page.coverage.startJSCoverage();
      await page.goto(server.PREFIX + '/jscoverage/ranges.html');
      const coverage = await page.coverage.stopJSCoverage();
      expect(coverage.length).toBe(1);
      const entry = coverage[0];
      expect(entry.ranges.length).toBe(1);
      const range = entry.ranges[0];
      expect(entry.text.substring(range.start, range.end)).toBe(`console.log('used!');`);
    });
    it('should report scripts that have no coverage', async function({page, server}) {
      await page.coverage.startJSCoverage();
      await page.goto(server.PREFIX + '/jscoverage/unused.html');
      const coverage = await page.coverage.stopJSCoverage();
      expect(coverage.length).toBe(1);
      const entry = coverage[0];
      expect(entry.url).toContain('unused.html');
      expect(entry.ranges.length).toBe(0);
    });
    it('should work with conditionals', async function({page, server}) {
      await page.coverage.startJSCoverage();
      await page.goto(server.PREFIX + '/jscoverage/involved.html');
      const coverage = await page.coverage.stopJSCoverage();
      expect(JSON.stringify(coverage, null, 2).replace(/:\d{4}\//g, ':<PORT>/')).toBeGolden('jscoverage-involved.txt');
    });
    describe('resetOnNavigation', function() {
      it('should report scripts across navigations when disabled', async function({page, server}) {
        await page.coverage.startJSCoverage({resetOnNavigation: false});
        await page.goto(server.PREFIX + '/jscoverage/multiple.html');
        await page.goto(server.EMPTY_PAGE);
        const coverage = await page.coverage.stopJSCoverage();
        expect(coverage.length).toBe(2);
      });
      it('should NOT report scripts across navigations when enabled', async function({page, server}) {
        await page.coverage.startJSCoverage(); // Enabled by default.
        await page.goto(server.PREFIX + '/jscoverage/multiple.html');
        await page.goto(server.EMPTY_PAGE);
        const coverage = await page.coverage.stopJSCoverage();
        expect(coverage.length).toBe(0);
      });
    });
  });

  describe('CSSCoverage', function() {
    it('should work', async function({page, server}) {
      await page.coverage.startCSSCoverage();
      await page.goto(server.PREFIX + '/csscoverage/simple.html');
      const coverage = await page.coverage.stopCSSCoverage();
      expect(coverage.length).toBe(1);
      expect(coverage[0].url).toContain('/csscoverage/simple.html');
      expect(coverage[0].ranges).toEqual([
        {start: 1, end: 22}
      ]);
      const range = coverage[0].ranges[0];
      expect(coverage[0].text.substring(range.start, range.end)).toBe('div { color: green; }');
    });
    it('should report sourceURLs', async function({page, server}) {
      await page.coverage.startCSSCoverage();
      await page.goto(server.PREFIX + '/csscoverage/sourceurl.html');
      const coverage = await page.coverage.stopCSSCoverage();
      expect(coverage.length).toBe(1);
      expect(coverage[0].url).toBe('nicename.css');
    });
    it('should report multiple stylesheets', async function({page, server}) {
      await page.coverage.startCSSCoverage();
      await page.goto(server.PREFIX + '/csscoverage/multiple.html');
      const coverage = await page.coverage.stopCSSCoverage();
      expect(coverage.length).toBe(2);
      coverage.sort((a, b) => a.url.localeCompare(b.url));
      expect(coverage[0].url).toContain('/csscoverage/stylesheet1.css');
      expect(coverage[1].url).toContain('/csscoverage/stylesheet2.css');
    });
    it('should report stylesheets that have no coverage', async function({page, server}) {
      await page.coverage.startCSSCoverage();
      await page.goto(server.PREFIX + '/csscoverage/unused.html');
      const coverage = await page.coverage.stopCSSCoverage();
      expect(coverage.length).toBe(1);
      expect(coverage[0].url).toBe('unused.css');
      expect(coverage[0].ranges.length).toBe(0);
    });
    it('should work with media queries', async function({page, server}) {
      await page.coverage.startCSSCoverage();
      await page.goto(server.PREFIX + '/csscoverage/media.html');
      const coverage = await page.coverage.stopCSSCoverage();
      expect(coverage.length).toBe(1);
      expect(coverage[0].url).toContain('/csscoverage/media.html');
      expect(coverage[0].ranges).toEqual([
        {start: 17, end: 38}
      ]);
    });
    it('should work with complicated usecases', async function({page, server}) {
      await page.coverage.startCSSCoverage();
      await page.goto(server.PREFIX + '/csscoverage/involved.html');
      const coverage = await page.coverage.stopCSSCoverage();
      expect(JSON.stringify(coverage, null, 2).replace(/:\d{4}\//g, ':<PORT>/')).toBeGolden('csscoverage-involved.txt');
    });
    it('should ignore injected stylesheets', async function({page, server}) {
      await page.coverage.startCSSCoverage();
      await page.addStyleTag({content: 'body { margin: 10px;}'});
      // trigger style recalc
      const margin = await page.evaluate(() => window.getComputedStyle(document.body).margin);
      expect(margin).toBe('10px');
      const coverage = await page.coverage.stopCSSCoverage();
      expect(coverage.length).toBe(0);
    });
    describe('resetOnNavigation', function() {
      it('should report stylesheets across navigations', async function({page, server}) {
        await page.coverage.startCSSCoverage({resetOnNavigation: false});
        await page.goto(server.PREFIX + '/csscoverage/multiple.html');
        await page.goto(server.EMPTY_PAGE);
        const coverage = await page.coverage.stopCSSCoverage();
        expect(coverage.length).toBe(2);
      });
      it('should NOT report scripts across navigations', async function({page, server}) {
        await page.coverage.startCSSCoverage(); // Enabled by default.
        await page.goto(server.PREFIX + '/csscoverage/multiple.html');
        await page.goto(server.EMPTY_PAGE);
        const coverage = await page.coverage.stopCSSCoverage();
        expect(coverage.length).toBe(0);
      });
    });
  });
};
