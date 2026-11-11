/* dqle.io gate — client-side password prompt.
   SECURITY NOTE: a static site cannot keep a secret. The page source contains the
   content and the digests, so this stops casual visitors, not a determined one.
   To change the password: open DevTools console and run
     [...Array(2)].map((_,s)=>{let h1=0xdeadbeef^s,h2=0x41c6ce57^s;const k='dqle.io::gate::v1::NEWPASSWORD';for(let i=0;i<k.length;i++){const c=k.charCodeAt(i);h1=Math.imul(h1^c,2654435761);h2=Math.imul(h2+c,1597334677);}h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909);h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);return (4294967296*(2097151&h2)+h1).toString(16)})
   then paste the two values into PASS_A / PASS_B below. */
(function () {
  'use strict';

  var SALT = 'dqle.io::gate::v1::';
  var PASS_A = '79f2a21cce5a5';
  var PASS_B = '94b2af9b8f7e9';
  var KEY = 'dqle-unlocked';

  function cyrb53(str, seed) {
    var h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (var i = 0, ch; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 + ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + h1).toString(16);
  }

  var root = document.documentElement;
  var gate = document.getElementById('gate');
  var form = document.getElementById('gateForm');
  var input = document.getElementById('gatePass');
  var note = document.getElementById('gateNote');
  var maxTries = 6;
  var tries = 0;
  var locked = false;

  function unlockedFlag() {
    try { return sessionStorage.getItem(KEY) === '1'; } catch (e) { return false; }
  }

  function setOpen(inert) {
    [document.getElementById('topbar'), document.getElementById('main'), document.querySelector('.footer')]
      .forEach(function (el) { if (el) el.inert = inert; });
  }

  function open() {
    root.classList.remove('gated');
    if (gate) gate.remove();
    root.removeAttribute('data-gate');
    setOpen(false);
  }

  function lock(msg) {
    note.textContent = msg;
    note.setAttribute('aria-live', 'assertive');
    input.value = '';
    input.focus();
  }

  // Already unlocked in this tab session.
  if (unlockedFlag()) { open(); return; }

  root.classList.add('gated');
  root.setAttribute('data-gate', 'locked');
  setOpen(true);
  if (input) input.focus();

  if (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (locked) return;
      var pass = input ? input.value : '';
      if (!pass) { lock('Enter the password to continue.'); return; }
      if (cyrb53(SALT + pass, 0) === PASS_A && cyrb53(SALT + pass, 13) === PASS_B) {
        try { sessionStorage.setItem(KEY, '1'); } catch (e) { /* private mode */ }
        open();
        return;
      }
      tries += 1;
      if (tries >= maxTries) {
        locked = true;
        if (input) input.disabled = true;
        var btn = document.getElementById('gateBtn');
        if (btn) btn.disabled = true;
        lock('Too many attempts. Reload this page to try again.');
        return;
      }
      lock('Incorrect password — attempt ' + tries + ' of ' + maxTries + '.');
    });
  }
})();
