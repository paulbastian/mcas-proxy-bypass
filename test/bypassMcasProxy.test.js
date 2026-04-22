'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { bypassMcasProxy } = require('../background.js');

// Wraps a destination URL as the originalUrl param on the MCAS proxy entry point.
function wrap(url) {
  return 'https://mcas-proxyweb.mcas.ms/?originalUrl=' + encodeURIComponent(url);
}

test('strips .mcas.ms and McasTsid from a proxied URL', () => {
  const input    = wrap('https://app.example.com.mcas.ms/browse/PROJ-42?focusedCommentId=10001&sourceType=mention&McasTsid=20893');
  const expected = 'https://app.example.com/browse/PROJ-42?focusedCommentId=10001&sourceType=mention';
  assert.equal(bypassMcasProxy(input), expected);
});

test('non-MCAS destination URL is returned unchanged', () => {
  const input    = wrap('https://app.example.com/login?continue=https%3A%2F%2Fexample.com');
  const expected = 'https://app.example.com/login?continue=https://example.com';
  assert.equal(bypassMcasProxy(input), expected);
});

test('strips .mcas.ms suffix and preserves path and query', () => {
  const input    = wrap('https://other.example.com.mcas.ms/orgs/acme/repositories?type=all');
  const expected = 'https://other.example.com/orgs/acme/repositories?type=all';
  assert.equal(bypassMcasProxy(input), expected);
});

test('removes all Mcas* params, keeps unrelated params', () => {
  const input    = wrap('https://app.example.com.mcas.ms/path?keep=1&McasTsid=123&McasCSRF=abc');
  const expected = 'https://app.example.com/path?keep=1';
  assert.equal(bypassMcasProxy(input), expected);
});

test('removes all Mcas* params case-insensitively (mcasFoo, MCASBAR)', () => {
  const input    = wrap('https://app.example.com.mcas.ms/?mcasFoo=1&MCASBAR=2&real=3');
  const expected = 'https://app.example.com/?real=3';
  assert.equal(bypassMcasProxy(input), expected);
});

test('query string is absent when only Mcas* params were present', () => {
  const input    = wrap('https://app.example.com.mcas.ms/?McasTsid=123');
  const expected = 'https://app.example.com/';
  assert.equal(bypassMcasProxy(input), expected);
});

test('URL fragment is preserved', () => {
  const input    = wrap('https://app.example.com.mcas.ms/board#sprint-1');
  const expected = 'https://app.example.com/board#sprint-1';
  assert.equal(bypassMcasProxy(input), expected);
});

test('http:// destinations are accepted alongside https://', () => {
  const input    = wrap('http://legacy.example.com.mcas.ms/page');
  const expected = 'http://legacy.example.com/page';
  assert.equal(bypassMcasProxy(input), expected);
});

test('returns null when originalUrl param is absent', () => {
  assert.equal(bypassMcasProxy('https://mcas-proxyweb.mcas.ms/certificate-checker?login=false'), null);
});

test('returns null for malformed percent-encoding in originalUrl', () => {
  assert.equal(bypassMcasProxy('https://mcas-proxyweb.mcas.ms/?originalUrl=%C0%AF'), null);
});

test('returns null when stripped hostname has no dot (MCAS subdomain, not a proxied site)', () => {
  assert.equal(bypassMcasProxy(wrap('https://something.mcas.ms/path')), null);
});

test('returns null for javascript: scheme in destination (security guard)', () => {
  assert.equal(bypassMcasProxy(wrap('javascript:alert(1)')), null);
});

test('returns null for data: scheme in destination (security guard)', () => {
  assert.equal(bypassMcasProxy(wrap('data:text/html,<h1>hi</h1>')), null);
});

test('full proxy URL: extracts, decodes, strips .mcas.ms and McasTsid', () => {
  const input =
    'https://mcas-proxyweb.mcas.ms/certificate-checker?login=false' +
    '&originalUrl=https%3A%2F%2Fapp.example.com.mcas.ms%2Fbrowse%2FPROJ-42' +
    '%3FfocusedCommentId%3D10001%26sourceType%3Dmention%26McasTsid%3D20893' +
    '&McasCSRF=abc123';
  const expected =
    'https://app.example.com/browse/PROJ-42' +
    '?focusedCommentId=10001&sourceType=mention';
  assert.equal(bypassMcasProxy(input), expected);
});
