/**
 * SFD - Authentication & User Session Management
 */

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || {};
  } catch (e) {
    return {};
  }
}

function saveUsers(u) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(u));
  } catch (e) {
    console.error('Failed to save users:', e);
  }
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch (e) {
    return null;
  }
}

function toggleEye(inputId, btnId) {
  const inp = document.getElementById(inputId);
  const btn = document.getElementById(btnId);
  if (!inp || !btn) return;
  if (inp.type === 'password') {
    inp.type = 'text';
    btn.textContent = '🙈';
  } else {
    inp.type = 'password';
    btn.textContent = '👁';
  }
}

function toggleForgot() {
  const p = document.getElementById('forgot-panel');
  if (!p) return;
  p.style.display = p.style.display === 'block' ? 'none' : 'block';
}

function doResetPassword() {
  const email = document.getElementById('fp-email').value.trim().toLowerCase();
  const newPass = document.getElementById('fp-newpass').value;
  const errEl = document.getElementById('fp-err');
  if (!errEl) return;

  errEl.style.display = 'none';
  errEl.textContent = '';

  if (!email) {
    errEl.textContent = 'Please enter your email';
    errEl.style.display = 'block';
    return;
  }
  if (newPass.length < 6) {
    errEl.textContent = 'Password must be at least 6 characters';
    errEl.style.display = 'block';
    return;
  }

  const users = getUsers();
  if (!users[email]) {
    errEl.textContent = '❌ No account found with this email';
    errEl.style.display = 'block';
    return;
  }

  users[email].password = btoa(newPass);
  saveUsers(users);

  document.getElementById('forgot-panel').style.display = 'none';
  document.getElementById('fp-email').value = '';
  document.getElementById('fp-newpass').value = '';
  toast('✅ Password reset! You can now sign in.', 's');
}

function switchAuthTab(tab) {
  const fLogin = document.getElementById('form-login');
  const fRegister = document.getElementById('form-register');
  const tLogin = document.getElementById('tab-login');
  const tRegister = document.getElementById('tab-register');

  if (fLogin) fLogin.style.display = tab === 'login' ? '' : 'none';
  if (fRegister) fRegister.style.display = tab === 'register' ? '' : 'none';
  if (tLogin) tLogin.className = 'auth-tab' + (tab === 'login' ? ' active' : '');
  if (tRegister) tRegister.className = 'auth-tab' + (tab === 'register' ? ' active' : '');

  clearAuthErrors();
}

function clearAuthErrors() {
  const ids = [
    'l-email-err', 'l-pass-err', 'l-gen-err',
    'r-name-err', 'r-email-err', 'r-pass-err', 'r-gen-err', 'fp-err'
  ];
  ids.forEach(id => {
    const e = document.getElementById(id);
    if (e) {
      e.style.display = 'none';
      e.textContent = '';
    }
  });
}

function showErr(id, msg) {
  const e = document.getElementById(id);
  if (e) {
    e.textContent = msg;
    e.style.display = 'block';
  }
}

function doLogin() {
  clearAuthErrors();
  const emailInp = document.getElementById('l-email');
  const passInp = document.getElementById('l-pass');
  if (!emailInp || !passInp) return;

  const email = emailInp.value.trim().toLowerCase();
  const pass = passInp.value;

  if (!email) {
    showErr('l-email-err', 'Please enter your email');
    return;
  }
  if (!pass) {
    showErr('l-pass-err', 'Please enter your password');
    return;
  }

  const users = getUsers();
  if (!users[email]) {
    showErr('l-gen-err', '❌ No account found with this email. Please register.');
    return;
  }
  if (users[email].password !== btoa(pass)) {
    showErr('l-pass-err', '❌ Incorrect password. Please try again.');
    return;
  }

  // Login successful
  const user = { email, name: users[email].name };
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));

  // Load user data
  const userDataKey = 'sfd_data_' + email;
  window._activeUserDataKey = userDataKey;
  const ud = localStorage.getItem(userDataKey);
  D = { transactions: [], habits: [], goals: [] };
  if (ud) {
    try {
      D = { ...D, ...JSON.parse(ud) };
    } catch (e) {
      console.warn('Failed parsing user data:', e);
    }
  }

  onAuthSuccess(user);
}

function doRegister() {
  clearAuthErrors();
  const firstName = document.getElementById('r-firstname').value.trim();
  const lastName = document.getElementById('r-lastname').value.trim();
  const name = (firstName + ' ' + lastName).trim();
  const email = document.getElementById('r-email').value.trim().toLowerCase();
  const pass = document.getElementById('r-pass').value;

  if (!firstName) {
    showErr('r-name-err', 'Please enter your first name');
    return;
  }
  if (!lastName) {
    showErr('r-name-err', 'Please enter your last name');
    return;
  }
  if (!email || !email.includes('@')) {
    showErr('r-email-err', 'Please enter a valid email');
    return;
  }
  if (pass.length < 6) {
    showErr('r-pass-err', 'Password must be at least 6 characters');
    return;
  }

  const users = getUsers();
  if (users[email]) {
    showErr('r-email-err', '❌ This email is already registered. Please sign in.');
    return;
  }

  users[email] = {
    name,
    password: btoa(pass),
    createdAt: new Date().toISOString()
  };
  saveUsers(users);

  const user = { email, name };
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  window._activeUserDataKey = 'sfd_data_' + email;
  D = { transactions: [], habits: [], goals: [] };

  onAuthSuccess(user);
}

function onAuthSuccess(user) {
  const overlay = document.getElementById('auth-overlay');
  if (overlay) overlay.style.display = 'none';

  const nameEl = document.getElementById('user-name-nav');
  if (nameEl) nameEl.textContent = '👤 ' + user.name.split(' ')[0];

  toast('Welcome, ' + user.name + '! 🎉', 's');
  save();

  if (typeof updateBal === 'function') updateBal();
  if (typeof renderTxns === 'function') renderTxns();
  if (typeof renderHabits === 'function') renderHabits();
  if (typeof renderGoals === 'function') renderGoals();
  if (typeof updateNotifStatuses === 'function') updateNotifStatuses();
}

function logoutUser() {
  if (!confirm('Sign out?')) return;
  localStorage.removeItem(SESSION_KEY);
  window.location.reload();
}

// Auto-login on load if session exists
(function checkSession() {
  const user = getCurrentUser();
  if (user) {
    window._activeUserDataKey = 'sfd_data_' + user.email;
    const ud = localStorage.getItem(window._activeUserDataKey);
    D = { transactions: [], habits: [], goals: [] };
    if (ud) {
      try {
        D = { ...D, ...JSON.parse(ud) };
      } catch (e) {
        console.warn('Session load error:', e);
      }
    }
    const overlay = document.getElementById('auth-overlay');
    if (overlay) overlay.style.display = 'none';

    const nameEl = document.getElementById('user-name-nav');
    if (nameEl) nameEl.textContent = '👤 ' + user.name.split(' ')[0];
  }
})();
