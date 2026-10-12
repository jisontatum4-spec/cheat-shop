// GRANTED HUB — Supabase Live
const SUPABASE_URL = 'https://gepnzqigtprphcklbxt.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Rc4K8rSLBUB9rA2nSS5MHA_hyGE0psW';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const OWNER_EMAIL = 'osje76hwhu72@gmail.com';
const OWNER_PASSWORD = 'Jaebu027Jshsu0028';
const OWNER_USERNAME = 'OwnerAdmin';

let currentUser = null;
let productsCache = [];

// ─── DEFAULT PRODUCTS (seed if empty) ───────────────────────────────────────
const DEFAULT_PRODUCTS = [
  {
    id: '3',
    name: 'CyRaXMod',
    category: 'mlbb',
    status: 'Safe',
    price: '₱100 - ₱900',
    logo: 'https://i.imgur.com/UpdKD5d.png',
    card_description: 'Full version loaded. Click Info to view features and proofs.',
    description: 'Full version. Features: Unlock skin, Room info, Hide players name, MH icon, Drone view, Visible check, ESP 360 alert icon, ESP hero box/hp bar/name/cooldown/distance, Ally cooldown, Monster box/hp bar, Minion dot, Auto aim all skill/hero, Aim predict. VIP features included.',
    plans: [
      { value: '1day', label: '1 Day Access', price: '₱100' },
      { value: '3day', label: '3 Days Access', price: '₱160' },
      { value: '7day', label: '7 Days Access', price: '₱320' },
      { value: '30day', label: '30 Days Access', price: '₱900' }
    ],
    proofs: ['https://i.imgur.com/1tXc3O0.png', 'https://i.imgur.com/Z0I1DDr.png']
  },
  {
    id: '4',
    name: 'Core Mod',
    category: 'codm',
    status: 'Safe',
    price: '₱120 - ₱2,100',
    logo: 'https://i.imgur.com/LTU8KTD.png',
    card_description: 'Core Mod APK for Garena Call of Duty: Mobile.',
    description: 'CORE MOD APK - GARENA. ESP, Aimbot, Visuals, Misc features.',
    plans: [
      { value: '3day', label: '3 Days Access', price: '₱120' },
      { value: '7day', label: '7 Days Access', price: '₱170' },
      { value: '14day', label: '14 Days Access', price: '₱270' },
      { value: '30day', label: '30 Days Access', price: '₱470' },
      { value: '60day', label: '60 Days Access', price: '₱850' },
      { value: 'lifetime', label: 'Lifetime Access', price: '₱2,100' }
    ],
    proofs: ['https://i.imgur.com/iCng5ta.jpg', 'https://i.imgur.com/dfNZmV3.jpg']
  }
];

// ─── HELPERS ────────────────────────────────────────────────────────────────
function showCustomAlert(title, message, type = 'success') {
  const overlay = document.getElementById('customAlertOverlay');
  const box = document.getElementById('customAlertBox');
  const titleEl = document.getElementById('customAlertTitle');
  const msgEl = document.getElementById('customAlertMessage');
  const iconEl = document.getElementById('customAlertIcon');
  titleEl.innerText = title;
  msgEl.innerHTML = message;
  box.className = 'custom-alert-box ' + (type === 'error' ? 'alert-error' : 'alert-success');
  iconEl.className = 'custom-alert-icon ' + (type === 'error' ? 'icon-error' : 'icon-success');
  iconEl.innerText = type === 'error' ? '!' : 'OK';
  overlay.classList.add('active');
}

function closeCustomAlert() {
  document.getElementById('customAlertOverlay').classList.remove('active');
}

function toggleDrawer() {
  document.getElementById('sideDrawer').classList.toggle('active');
  document.getElementById('drawerOverlay').classList.toggle('active');
}

function toggleAuthMode(mode) {
  document.getElementById('loginFormSection').style.display = mode === 'signup' ? 'none' : 'block';
  document.getElementById('signupFormSection').style.display = mode === 'signup' ? 'block' : 'none';
  document.getElementById('authCardTitle').innerText = mode === 'signup' ? 'Create Account' : 'Account Access';
}

// ─── AUTH ───────────────────────────────────────────────────────────────────
async function ensureOwner() {
  const { data } = await supabase.from('users').select('*').eq('email', OWNER_EMAIL).maybeSingle();
  if (!data) {
    await supabase.from('users').insert({
      email: OWNER_EMAIL,
      username: OWNER_USERNAME,
      password: OWNER_PASSWORD,
      role: 'owner',
      balance: 0
    });
  }
}

async function registerWithEmail() {
  const username = document.getElementById('signupUsername').value.trim();
  const email = document.getElementById('signupEmail').value.trim().toLowerCase();
  const password = document.getElementById('signupPassword').value;
  if (!username || !email || !password) {
    showCustomAlert('Missing Fields', 'Fill all fields.', 'error');
    return;
  }
  if (!email.endsWith('@gmail.com')) {
    showCustomAlert('Email Error', 'Gmail only.', 'error');
    return;
  }
  if (email === OWNER_EMAIL) {
    showCustomAlert('Blocked', 'This email is reserved.', 'error');
    return;
  }
  const { data: existing } = await supabase.from('users').select('email').eq('email', email).maybeSingle();
  if (existing) {
    showCustomAlert('Exists', 'Email already registered.', 'error');
    return;
  }
  await supabase.from('users').insert({ email, username, password, role: 'user', balance: 0 });
  showCustomAlert('Created', 'Account created. Login now.', 'success');
  toggleAuthMode('login');
}

async function loginWithEmail() {
  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const password = document.getElementById('loginPassword').value;
  if (!email || !password) {
    showCustomAlert('Login Failed', 'Enter email and password.', 'error');
    return;
  }
  await ensureOwner();
  const { data } = await supabase.from('users').select('*').eq('email', email).eq('password', password).maybeSingle();
  if (!data) {
    showCustomAlert('Login Failed', 'Incorrect email or password.', 'error');
    return;
  }
  currentUser = data;
  localStorage.setItem('granted_current_user', JSON.stringify(data));
  updateAuthUI(data);
  showCustomAlert('Access Granted', data.role === 'owner' ? 'Logged in as Owner!' : 'Logged in!', 'success');
}

function logoutAccount() {
  currentUser = null;
  localStorage.removeItem('granted_current_user');
  updateAuthUI(null);
  showCustomAlert('Signed Out', 'Signed out successfully.', 'success');
}

function updateAuthUI(user) {
  const authCard = document.getElementById('authCardBox');
  const profile = document.getElementById('userProfileCard');
  const actions = document.getElementById('accountActions');
  const adminBtn = document.getElementById('adminMenuBtn');
  if (user) {
    authCard.style.display = 'none';
    profile.style.display = 'flex';
    actions.style.display = 'block';
    document.getElementById('userNameDisplay').innerText = user.role === 'owner' ? 'Owner (Admin)' : user.username;
    document.getElementById('userEmailDisplay').innerText = user.email;
    document.getElementById('userAvatarText').innerText = (user.username || 'U').charAt(0).toUpperCase();
    adminBtn.style.display = user.role === 'owner' ? 'block' : 'none';
    document.getElementById('walletBalanceDisplay').innerText = '₱' + Number(user.balance || 0).toFixed(2);
  } else {
    profile.style.display = 'none';
    authCard.style.display = 'block';
    actions.style.display = 'none';
    adminBtn.style.display = 'none';
  }
}

// ─── PRODUCTS (LIVE) ────────────────────────────────────────────────────────
async function seedProducts() {
  const { data } = await supabase.from('products').select('id');
  if (!data || data.length === 0) {
    for (const p of DEFAULT_PRODUCTS) {
      await supabase.from('products').insert(p);
    }
  }
}

async function loadProducts() {
  const { data, error } = await supabase.from('products').select('*').order('created_at');
  if (error) {
    console.error(error);
    return;
  }
  productsCache = data || [];
  renderProducts(productsCache);
  renderStatusTracker(productsCache);
  renderAdminProducts(productsCache);
}

function renderProducts(products) {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  grid.innerHTML = '';
  if (!products.length) {
    grid.innerHTML = '<div class="no-games-box"><div class="no-games-title">NO PRODUCTS</div></div>';
    return;
  }
  products.forEach((p, index) => {
    const status = p.status || 'Safe';
    const isLocked = status !== 'Safe';
    const plans = Array.isArray(p.plans) ? p.plans : (typeof p.plans === 'string' ? JSON.parse(p.plans || '[]') : []);
    const defaultPlan = plans.find(x => x.value === '30day') || plans[plans.length - 1] || { label: '30 Days', price: p.price || '—' };
    const card = document.createElement('div');
    card.className = `product-card status-${status.toLowerCase()}${isLocked ? ' status-locked' : ''}`;
    card.innerHTML = `
      <div class="product-status-row">
        <span class="product-status-badge status-${status.toLowerCase()}">
          <span class="status-icon">${isLocked ? '!' : 'OK'}</span> ${status.toUpperCase()}
        </span>
        <span class="product-status-note${isLocked ? ' warning' : ''}">${isLocked ? 'Purchases locked' : 'Ready for access'}</span>
      </div>
      <div class="product-header-row">
        <div class="product-title-group">
          <img src="${p.logo || ''}" class="product-thumb" onerror="this.src='https://i.imgur.com/Np8qiGQ.png'">
          <div class="product-title">${p.name}<span class="product-game-label">GAME: ${(p.category || '').toUpperCase()}</span></div>
        </div>
      </div>
      <div class="product-desc">${p.card_description || p.description || ''}</div>
      ${!isLocked ? `
        <div class="product-footer">
          <div class="access-heading">
            <span class="access-kicker">SELECT AN ACCESS PLAN</span>
            <span class="access-title">Choose your VIP key duration</span>
          </div>
          <div class="keys-radio-group">
            ${plans.map(plan => `
              <label class="key-radio-label">
                <span>${plan.label}</span>
                <input type="radio" name="duration-${index}" value="${plan.value}" data-price="${plan.price}" ${plan.value === defaultPlan.value ? 'checked' : ''} onchange="updatePrice(this, ${index})">
              </label>
            `).join('')}
          </div>
          <div class="product-footer-row">
            <div class="price-block">
              <span class="price-label">SELECTED PLAN</span>
              <span class="product-price" id="price-${index}">${defaultPlan.price}</span>
            </div>
            <button class="buy-btn" onclick="buyKey('${p.name}')">GET VIP ACCESS</button>
          </div>
        </div>
      ` : ''}
    `;
    grid.appendChild(card);
  });
}

function updatePrice(radio, index) {
  const el = document.getElementById('price-' + index);
  if (el) el.innerText = radio.getAttribute('data-price');
}

function renderStatusTracker(products) {
  const container = document.getElementById('statusTableListContainer');
  if (!container) return;
  container.innerHTML = products.map(p => {
    let dot = 'green';
    if (p.status === 'Updating') dot = 'yellow';
    if (p.status === 'Maintenance') dot = 'maintenance';
    return `<div class="status-row">
      <div class="status-game-info">
        <span class="legend-dot ${dot}"></span>
        <span class="summary-game-name">${p.name}</span>
      </div>
      <span style="font-size:11px;font-weight:600;color:var(--text-muted)">${(p.status || 'Safe').toUpperCase()}</span>
    </div>`;
  }).join('');
}

function renderAdminProducts(products) {
  const tbody = document.getElementById('adminProductsTableBody');
  if (!tbody) return;
  tbody.innerHTML = products.map((p, i) => `
    <tr>
      <td>${p.name}</td>
      <td>${(p.category || '').toUpperCase()}</td>
      <td><b>${p.status || 'Safe'}</b></td>
      <td>
        <select class="admin-input" onchange="updateProductStatus('${p.id}', this.value)">
          <option value="Safe" ${p.status === 'Safe' ? 'selected' : ''}>Safe</option>
          <option value="Updating" ${p.status === 'Updating' ? 'selected' : ''}>Updating</option>
          <option value="Maintenance" ${p.status === 'Maintenance' ? 'selected' : ''}>Maintenance</option>
        </select>
      </td>
    </tr>
  `).join('');
}

async function updateProductStatus(id, newStatus) {
  if (!currentUser || currentUser.role !== 'owner') {
    showCustomAlert('Access Denied', 'Owner only.', 'error');
    return;
  }
  const { error } = await supabase.from('products').update({ status: newStatus }).eq('id', id);
  if (error) {
    showCustomAlert('Error', error.message, 'error');
    return;
  }
  showCustomAlert('Status Updated', 'Status changed to ' + newStatus, 'success');
  // Realtime will refresh the UI automatically
}

function buyKey(name) {
  if (!currentUser) {
    showCustomAlert('Login Required', 'Login first.', 'error');
    toggleDrawer();
    return;
  }
  showCustomAlert('Order', `Contact admin on Telegram to complete purchase for <b>${name}</b>.`, 'success');
}

function openAdminPanel() {
  if (!currentUser || currentUser.role !== 'owner') {
    showCustomAlert('Access Denied', 'Owner only.', 'error');
    return;
  }
  document.getElementById('adminModalOverlay').classList.add('active');
  renderAdminProducts(productsCache);
}

function closeAdminPanel() {
  document.getElementById('adminModalOverlay').classList.remove('active');
}

function filterCategory(cat, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  // simple filter — reload all for now
  renderProducts(productsCache);
}

// ─── REALTIME ───────────────────────────────────────────────────────────────
function setupRealtime() {
  supabase
    .channel('products-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, payload => {
      console.log('Realtime update', payload);
      loadProducts();
    })
    .subscribe();
}

// ─── INIT ───────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', async () => {
  await ensureOwner();
  await seedProducts();
  await loadProducts();
  setupRealtime();

  const saved = localStorage.getItem('granted_current_user');
  if (saved) {
    try {
      currentUser = JSON.parse(saved);
      updateAuthUI(currentUser);
    } catch (e) {}
  }
});
