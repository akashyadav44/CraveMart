 /* ============================================================
   cravemart.js  —  Shared utilities for ALL pages
   Cart · Auth · Navbar · Toast · Dark Mode (Global)
   ============================================================ */

/* ── 1. DARK MODE — Sab pages pe kaam karta hai ─────────────── */
const Theme = {
  // CSS variables inject karo har page pe
  injectStyles() {
    if (document.getElementById('cm-theme-styles')) return;
    const style = document.createElement('style');
    style.id = 'cm-theme-styles';
    style.textContent = `
      :root {
        --brand:#E8420A; --brand2:#FF6B35;
        --cream:#FFFBF7; --dark:#0F0A05;
        --card:#FFFFFF; --text:#1C1208;
        --muted:#7A6A5A; --border:#EDE5DC;
        --nav-bg:rgba(255,251,247,0.92);
        --input-bg:#FFFFFF;
      }
      [data-theme="dark"] {
        --cream:#0F0A05; --card:#1A1208;
        --text:#F5EDE0; --muted:#8A7A6A;
        --border:#2A1F15; --nav-bg:rgba(15,10,5,0.92);
        --input-bg:#1A1208;
      }
      body {
        background: var(--cream) !important;
        color: var(--text) !important;
        transition: background .3s, color .3s;
      }
      /* Cards */
      .cart-item, .section-card, .summary-card, .table-card,
      .product-card, .review-card, .related-card, .auth-card,
      .modal, .top-products, .chart-card, .addr-card2,
      .coupon-box, .promo-banner-inner {
        background: var(--card) !important;
        border-color: var(--border) !important;
        color: var(--text) !important;
      }
      /* Inputs */
      input, select, textarea {
        background: var(--input-bg) !important;
        color: var(--text) !important;
        border-color: var(--border) !important;
      }
      input::placeholder, textarea::placeholder {
        color: var(--muted) !important;
      }
      /* Nav */
      .cm-nav, nav {
        background: var(--nav-bg) !important;
        border-color: var(--border) !important;
      }
      /* Tables */
      table, th, td {
        border-color: var(--border) !important;
      }
      th { background: var(--card) !important; color: var(--muted) !important; }
      td { color: var(--text) !important; }
      tr:hover td { background: var(--card) !important; filter: brightness(0.95); }
      /* Progress bar */
      .progress-bar { background: var(--card) !important; border-color: var(--border) !important; }
      /* Sidebar stays dark always */
      .sidebar { background: #0F0A05 !important; }
      /* Auth pages */
      .right-panel { background: var(--cream) !important; }
      .auth-heading { color: var(--text) !important; }
      .auth-sub { color: var(--muted) !important; }
      /* Misc text */
      h1,h2,h3,h4,h5,h6 { color: var(--text) !important; }
      p { color: var(--muted) !important; }
      /* Theme toggle btn on all pages */
      .cm-theme-toggle {
        width: 44px; height: 24px; border-radius: 50px;
        border: none; cursor: pointer;
        background: var(--border); position: relative;
        transition: all .3s; flex-shrink: 0;
      }
      .cm-theme-toggle::after {
        content: ''; position: absolute; top: 3px; left: 3px;
        width: 18px; height: 18px; border-radius: 50%;
        background: var(--brand); transition: all .3s;
      }
      [data-theme="dark"] .cm-theme-toggle { background: #3A2A1A; }
      [data-theme="dark"] .cm-theme-toggle::after { transform: translateX(20px); }
      /* Mobile menu */
      .cm-mobile-drawer {
        position: fixed; top: 0; right: -100%; width: 280px; height: 100vh;
        background: var(--card); z-index: 9999;
        box-shadow: -8px 0 40px rgba(0,0,0,0.2);
        transition: right .35s cubic-bezier(.4,0,.2,1);
        display: flex; flex-direction: column; padding: 0;
        border-left: 1px solid var(--border);
      }
      .cm-mobile-drawer.open { right: 0; }
      .cm-drawer-overlay {
        position: fixed; inset: 0; background: rgba(0,0,0,0.5);
        z-index: 9998; display: none; backdrop-filter: blur(4px);
      }
      .cm-drawer-overlay.open { display: block; }
      .cm-drawer-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 1.2rem 1.5rem; border-bottom: 1px solid var(--border);
      }
      .cm-drawer-logo {
        font-family: 'Fraunces', serif; font-size: 1.4rem;
        font-weight: 900; color: var(--brand); text-decoration: none;
      }
      .cm-drawer-logo span { color: var(--text); }
      .cm-drawer-close {
        width: 34px; height: 34px; border-radius: 50%;
        border: 1px solid var(--border); background: none;
        cursor: pointer; display: flex; align-items: center;
        justify-content: center; font-size: 1.1rem; color: var(--text);
      }
      .cm-drawer-links { flex: 1; padding: 1.5rem; display: flex; flex-direction: column; gap: 4px; }
      .cm-drawer-links a {
        display: flex; align-items: center; gap: 10px;
        padding: 0.85rem 1rem; border-radius: 12px;
        text-decoration: none; font-size: 0.95rem; font-weight: 500;
        color: var(--text); transition: all .18s;
      }
      .cm-drawer-links a:hover { background: rgba(232,66,10,0.08); color: var(--brand); }
      .cm-drawer-links a i { font-size: 18px; color: var(--brand); }
      .cm-drawer-footer {
        padding: 1.5rem; border-top: 1px solid var(--border);
        display: flex; align-items: center; justify-content: space-between;
      }
      .cm-drawer-footer-label { font-size: 0.85rem; color: var(--muted); }
    `;
    document.head.appendChild(style);
  },

  apply() {
    const saved = localStorage.getItem('cm-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    // Update all toggle buttons
    document.querySelectorAll('.cm-theme-toggle').forEach(btn => {
      btn.title = saved === 'dark' ? 'Switch to Light' : 'Switch to Dark';
    });
    document.querySelectorAll('.cm-theme-icon').forEach(el => {
      el.className = 'ti ' + (saved === 'dark' ? 'ti-sun' : 'ti-moon') + ' cm-theme-icon';
      el.style.color = 'var(--muted)';
      el.style.fontSize = '14px';
    });
  },

  toggle() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    localStorage.setItem('cm-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    Theme.apply();
  },

  init() {
    Theme.injectStyles();
    Theme.apply();
  }
};

/* ── 2. CART ─────────────────────────────────────────────────── */
const Cart = {
  get() { return JSON.parse(localStorage.getItem('cm_cart') || '[]'); },
  save(items) { localStorage.setItem('cm_cart', JSON.stringify(items)); Cart.updateBadges(); },
  add(product) {
    const items = Cart.get();
    const existing = items.find(i => i.id === product.id);
    if (existing) existing.qty += 1;
    else items.push({ ...product, qty: 1 });
    Cart.save(items);
    Toast.show('🛒 ' + product.name + ' added to cart!');
  },
  remove(id) { Cart.save(Cart.get().filter(i => i.id !== id)); },
  clear() { localStorage.removeItem('cm_cart'); Cart.updateBadges(); },
  count() { return Cart.get().reduce((s, i) => s + i.qty, 0); },
  total() { return Cart.get().reduce((s, i) => s + i.price * i.qty, 0); },
  updateBadges() {
    const count = Cart.count();
    document.querySelectorAll('.cm-cart-count').forEach(el => {
      el.textContent = count;
    });
  }
};

/* ── 3. AUTH ─────────────────────────────────────────────────── */
const Auth = {
  getUser() { return JSON.parse(localStorage.getItem('cm_user') || 'null'); },
  setUser(user) { localStorage.setItem('cm_user', JSON.stringify(user)); },
  logout() {
    localStorage.removeItem('cm_user');
    localStorage.removeItem('cm_token');
    window.location.href = 'index.html';
  },
  isLoggedIn() { return !!Auth.getUser(); },
  isAdmin() { const u = Auth.getUser(); return u && u.role === 'admin'; },
  requireLogin(redirectTo) {
    if (!Auth.isLoggedIn()) {
      localStorage.setItem('cm_redirect', redirectTo || window.location.href);
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }
};

/* ── 4. TOAST ────────────────────────────────────────────────── */
const Toast = {
  timer: null,
  show(msg, duration = 2800) {
    let el = document.getElementById('cm-toast-global');
    if (!el) {
      el = document.createElement('div');
      el.id = 'cm-toast-global';
      el.style.cssText = `
        position:fixed;bottom:2rem;right:2rem;
        background:#1C1208;color:#fff;
        padding:.9rem 1.4rem;border-radius:16px;
        font-size:.85rem;font-weight:500;
        opacity:0;transform:translateY(20px);
        transition:all .3s;pointer-events:none;
        z-index:99999;font-family:'DM Sans',sans-serif;
        max-width:320px;box-shadow:0 8px 30px rgba(0,0,0,0.25);
      `;
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
    clearTimeout(Toast.timer);
    Toast.timer = setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
    }, duration);
  }
};

/* ── 5. MOBILE DRAWER ────────────────────────────────────────── */
const Drawer = {
  open() {
    document.getElementById('cmDrawer')?.classList.add('open');
    document.getElementById('cmOverlay')?.classList.add('open');
    document.body.style.overflow = 'hidden';
  },
  close() {
    document.getElementById('cmDrawer')?.classList.remove('open');
    document.getElementById('cmOverlay')?.classList.remove('open');
    document.body.style.overflow = '';
  },
  inject() {
    if (document.getElementById('cmDrawer')) return;
    const user = Auth.getUser();
    const cartCount = Cart.count();
    const drawerHTML = `
      <div class="cm-drawer-overlay" id="cmOverlay" onclick="Drawer.close()"></div>
      <div class="cm-mobile-drawer" id="cmDrawer">
        <div class="cm-drawer-header">
          <a href="index.html" class="cm-drawer-logo">Crave<span>Mart</span></a>
          <button class="cm-drawer-close" onclick="Drawer.close()">✕</button>
        </div>
        <div class="cm-drawer-links">
          <a href="index.html"><i class="ti ti-home" aria-hidden="true"></i> Home</a>
          <a href="index.html#menu"><i class="ti ti-bowl" aria-hidden="true"></i> Menu</a>
          <a href="cart.html"><i class="ti ti-shopping-cart" aria-hidden="true"></i> Cart (${cartCount})</a>
          ${user
            ? `<a href="order-success.html"><i class="ti ti-package" aria-hidden="true"></i> My Orders</a>
               <a href="#" onclick="Auth.logout()"><i class="ti ti-logout" aria-hidden="true"></i> Logout (${user.name?.split(' ')[0]})</a>`
            : `<a href="login.html"><i class="ti ti-user" aria-hidden="true"></i> Login</a>
               <a href="signup.html"><i class="ti ti-user-plus" aria-hidden="true"></i> Sign Up</a>`
          }
          ${Auth.isAdmin() ? `<a href="admin.html"><i class="ti ti-dashboard" aria-hidden="true"></i> Admin Panel</a>` : ''}
        </div>
        <div class="cm-drawer-footer">
          <span class="cm-drawer-footer-label">${document.documentElement.getAttribute('data-theme') === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}</span>
          <button class="cm-theme-toggle" onclick="Theme.toggle();Drawer.close()" aria-label="Toggle theme"></button>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', drawerHTML);
  }
};

/* ── 6. SHARED NAVBAR ────────────────────────────────────────── */
const Navbar = {
  render(activePage = '') {
    const user = Auth.getUser();
    const cartCount = Cart.count();
    const html = `
      <nav class="cm-nav" id="cmNav" style="
        display:flex;align-items:center;justify-content:space-between;
        padding:0 2.5rem;height:68px;position:sticky;top:0;z-index:200;
        background:var(--nav-bg);backdrop-filter:blur(20px);
        border-bottom:1px solid var(--border);font-family:'DM Sans',sans-serif;
      ">
        <a href="index.html" style="font-family:'Fraunces',serif;font-size:1.6rem;font-weight:900;color:var(--brand);text-decoration:none;letter-spacing:-1px">
          Crave<span style="color:var(--text)">Mart</span>
        </a>

        <ul style="display:flex;gap:2rem;list-style:none" class="cm-nav-desktop">
          <li><a href="index.html" style="text-decoration:none;font-size:.88rem;font-weight:500;color:var(--muted);transition:color .2s" onmouseover="this.style.color='var(--brand)'" onmouseout="this.style.color='var(--muted)'">Menu</a></li>
          <li><a href="index.html#offers" style="text-decoration:none;font-size:.88rem;font-weight:500;color:var(--muted);transition:color .2s" onmouseover="this.style.color='var(--brand)'" onmouseout="this.style.color='var(--muted)'">Offers</a></li>
          ${Auth.isAdmin() ? `<li><a href="admin.html" style="text-decoration:none;font-size:.88rem;font-weight:600;color:var(--brand)">⚡ Admin</a></li>` : ''}
        </ul>

        <div style="display:flex;align-items:center;gap:0.75rem">
          <i class="ti ti-sun cm-theme-icon" style="font-size:14px;color:var(--muted)" aria-hidden="true"></i>
          <button class="cm-theme-toggle" onclick="Theme.toggle()" aria-label="Toggle dark/light mode"></button>

          ${user
            ? `<div style="position:relative" id="cmUserWrap">
                <button onclick="document.getElementById('cmUserDrop').style.display=document.getElementById('cmUserDrop').style.display==='block'?'none':'block'" style="background:rgba(232,66,10,0.1);color:var(--brand);border:1px solid rgba(232,66,10,0.25);border-radius:50px;padding:.4rem 1rem;font-family:'DM Sans',sans-serif;font-size:.85rem;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px">
                  👤 ${user.name?.split(' ')[0] || 'User'}
                  <i class="ti ti-chevron-down" style="font-size:12px" aria-hidden="true"></i>
                </button>
                <div id="cmUserDrop" style="display:none;position:absolute;top:calc(100%+8px);right:0;background:var(--card);border:1px solid var(--border);border-radius:14px;padding:.5rem;min-width:160px;z-index:999;box-shadow:0 8px 30px rgba(0,0,0,.12)">
                  <a href="order-success.html" style="display:block;padding:.6rem .9rem;font-size:.85rem;color:var(--text);text-decoration:none;border-radius:8px">📦 My Orders</a>
                  <a href="#" onclick="Auth.logout()" style="display:block;padding:.6rem .9rem;font-size:.85rem;color:#E8420A;text-decoration:none;border-radius:8px">🚪 Logout</a>
                </div>
              </div>`
            : `<a href="login.html" style="text-decoration:none;font-size:.85rem;font-weight:600;color:var(--text);padding:.45rem 1rem;border:1.5px solid var(--border);border-radius:50px;transition:all .2s" onmouseover="this.style.borderColor='var(--brand)'" onmouseout="this.style.borderColor='var(--border)'">Login</a>`
          }

          <a href="cart.html" style="display:flex;align-items:center;gap:6px;background:var(--brand);color:#fff;border:none;border-radius:50px;padding:.5rem 1.2rem;font-size:.85rem;font-weight:600;cursor:pointer;text-decoration:none;transition:all .25s" onmouseover="this.style.opacity='.85'" onmouseout="this.style.opacity='1'">
            <i class="ti ti-shopping-cart" aria-hidden="true"></i> Cart
            <span class="cm-cart-count" style="background:#fff;color:var(--brand);border-radius:50%;width:18px;height:18px;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center">${cartCount}</span>
          </a>

          <button onclick="Drawer.open()" style="display:none;background:none;border:1px solid var(--border);border-radius:8px;width:38px;height:38px;cursor:pointer;align-items:center;justify-content:center;color:var(--text);font-size:1.2rem" class="cm-ham-btn" aria-label="Open menu">
            <i class="ti ti-menu-2" aria-hidden="true"></i>
          </button>
        </div>
      </nav>

      <style>
        @media(max-width:768px){
          .cm-nav-desktop{display:none!important}
          .cm-ham-btn{display:flex!important}
          .cm-nav{padding:0 1.2rem!important}
        }
      </style>`;

    const root = document.getElementById('cm-navbar-root');
    if (root) root.innerHTML = html;
    else document.body.insertAdjacentHTML('afterbegin', html);

    // Close dropdown on outside click
    document.addEventListener('click', e => {
      const wrap = document.getElementById('cmUserWrap');
      const drop = document.getElementById('cmUserDrop');
      if (drop && wrap && !wrap.contains(e.target)) drop.style.display = 'none';
    });

    Drawer.inject();
    Cart.updateBadges();
    Theme.apply();
  },

  injectStyles() {} // kept for compatibility
};

/* ── 7. PRODUCTS DATA ────────────────────────────────────────── */
const PRODUCTS = [
  { id:1, name:'Butter Chicken',   desc:'Creamy tomato gravy, tender chicken, basmati rice',        price:249, old:349, emoji:'🍛', cat:'indian',  badge:'Bestseller', rating:'4.9', reviews:342 },
  { id:2, name:'Margherita Pizza', desc:'San Marzano tomatoes, fresh mozzarella, basil',             price:319, old:399, emoji:'🍕', cat:'pizza',   badge:'Hot',        rating:'4.8', reviews:218 },
  { id:3, name:'Smash Burger',     desc:'Double patty, cheddar, caramelised onion, secret sauce',   price:199, old:249, emoji:'🍔', cat:'burger',  badge:'New',        rating:'4.7', reviews:156 },
  { id:4, name:'Dragon Roll',      desc:'Shrimp tempura, avocado, spicy mayo',                       price:389, old:null,emoji:'🍱', cat:'sushi',   badge:null,         rating:'4.9', reviews:89  },
  { id:5, name:'Gulab Jamun',      desc:'Soft milk-solid dumplings in rose syrup',                   price:99,  old:149, emoji:'🍮', cat:'dessert', badge:'Sweet',      rating:'4.8', reviews:201 },
  { id:6, name:'Mango Lassi',      desc:'Fresh Alphonso mangoes, thick yogurt, cardamom',            price:89,  old:null,emoji:'🥭', cat:'drinks',  badge:null,         rating:'4.7', reviews:167 },
  { id:7, name:'Paneer Tikka',     desc:'Charred paneer, peppers, mint chutney',                     price:179, old:229, emoji:'🧆', cat:'indian',  badge:'Veg',        rating:'4.8', reviews:289 },
  { id:8, name:'BBQ Chicken Pizza',desc:'Smoky BBQ sauce, grilled chicken, red onions',              price:349, old:429, emoji:'🍕', cat:'pizza',   badge:null,         rating:'4.6', reviews:143 },
];

/* ── 8. AUTO INIT ────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  Theme.init();
  Cart.updateBadges();
});