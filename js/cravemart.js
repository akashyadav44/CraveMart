/* ============================================================
   cravemart.js  —  Shared utilities for ALL pages
   Cart · Auth · Navbar · Toast
   ============================================================ */

/* ── 1. CART ─────────────────────────────────────────────────── */
const Cart = {
  get() {
    return JSON.parse(localStorage.getItem('cm_cart') || '[]');
  },
  save(items) {
    localStorage.setItem('cm_cart', JSON.stringify(items));
    Cart.updateBadges();
  },
  add(product) {
    const items = Cart.get();
    const existing = items.find(i => i.id === product.id);
    if (existing) {
      existing.qty += 1;
    } else {
      items.push({ ...product, qty: 1 });
    }
    Cart.save(items);
    Toast.show('🛒 ' + product.name + ' added to cart!');
  },
  remove(id) {
    const items = Cart.get().filter(i => i.id !== id);
    Cart.save(items);
  },
  clear() {
    localStorage.removeItem('cm_cart');
    Cart.updateBadges();
  },
  count() {
    return Cart.get().reduce((sum, i) => sum + i.qty, 0);
  },
  total() {
    return Cart.get().reduce((sum, i) => sum + i.price * i.qty, 0);
  },
  updateBadges() {
    const count = Cart.count();
    document.querySelectorAll('.cm-cart-count').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  }
};

/* ── 2. AUTH ─────────────────────────────────────────────────── */
const Auth = {
  getUser() {
    return JSON.parse(localStorage.getItem('cm_user') || 'null');
  },
  setUser(user) {
    localStorage.setItem('cm_user', JSON.stringify(user));
  },
  logout() {
    localStorage.removeItem('cm_user');
    localStorage.removeItem('cm_token');
    window.location.href = 'index.html';
  },
  isLoggedIn() {
    return !!Auth.getUser();
  },
  isAdmin() {
    const u = Auth.getUser();
    return u && u.role === 'admin';
  },
  requireLogin(redirectTo) {
    if (!Auth.isLoggedIn()) {
      localStorage.setItem('cm_redirect', redirectTo || window.location.href);
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }
};

/* ── 3. TOAST ────────────────────────────────────────────────── */
const Toast = {
  timer: null,
  show(msg, duration = 2800) {
    let el = document.getElementById('cm-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'cm-toast';
      el.style.cssText = `
        position:fixed;bottom:2rem;right:2rem;background:#1C1208;color:#fff;
        padding:0.9rem 1.4rem;border-radius:16px;font-size:0.85rem;font-weight:500;
        opacity:0;transform:translateY(20px);transition:all .3s;
        pointer-events:none;z-index:9999;font-family:'DM Sans',sans-serif;
        max-width:320px;box-shadow:0 8px 30px rgba(0,0,0,0.2);
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

/* ── 4. SHARED NAVBAR ────────────────────────────────────────── */
const Navbar = {
  render(activePage = '') {
    const user = Auth.getUser();
    const cartCount = Cart.count();

    const html = `
      <nav class="cm-nav" id="cmNav">
        <a href="index.html" class="cm-logo">Crave<span>Mart</span></a>

        <ul class="cm-nav-links">
          <li><a href="index.html" class="${activePage==='home'?'active':''}">Menu</a></li>
          <li><a href="index.html#offers" class="${activePage==='offers'?'active':''}">Offers</a></li>
          ${Auth.isAdmin() ? `<li><a href="admin.html" style="color:var(--brand);font-weight:700">Admin ⚡</a></li>` : ''}
        </ul>

        <div class="cm-nav-right">
          ${user ? `
            <div class="cm-user-pill">
              <span class="cm-user-avatar">${user.name ? user.name[0].toUpperCase() : 'U'}</span>
              <span class="cm-user-name">${user.name ? user.name.split(' ')[0] : 'Account'}</span>
              <div class="cm-user-dropdown">
                <a href="order-success.html">My Orders</a>
                <a href="#" onclick="Auth.logout()">Logout</a>
              </div>
            </div>
          ` : `
            <a href="login.html" class="cm-btn-login">Sign in</a>
          `}
          <a href="cart.html" class="cm-btn-cart">
            <i class="ti ti-shopping-cart"></i>
            Cart
            <span class="cm-cart-count" style="display:${cartCount>0?'flex':'none'}">${cartCount}</span>
          </a>
        </div>

        <button class="cm-hamburger" onclick="Navbar.toggleMobile()" id="cmHamburger">
          <i class="ti ti-menu-2"></i>
        </button>
      </nav>

      <!-- Mobile Menu -->
      <div class="cm-mobile-menu" id="cmMobileMenu">
        <a href="index.html">🍽️ Menu</a>
        <a href="index.html#offers">🎉 Offers</a>
        <a href="cart.html">🛒 Cart (${cartCount})</a>
        ${user
          ? `<a href="#" onclick="Auth.logout()">👋 Logout (${user.name||'User'})</a>`
          : `<a href="login.html">👤 Sign In</a><a href="signup.html">✨ Sign Up</a>`
        }
        ${Auth.isAdmin() ? `<a href="admin.html">⚡ Admin Panel</a>` : ''}
      </div>
    `;

    // Inject into #cm-navbar-root if it exists, else prepend to body
    const root = document.getElementById('cm-navbar-root');
    if (root) {
      root.innerHTML = html;
    } else {
      document.body.insertAdjacentHTML('afterbegin', html);
    }

    Cart.updateBadges();
  },

  toggleMobile() {
    const menu = document.getElementById('cmMobileMenu');
    const btn  = document.getElementById('cmHamburger');
    const open = menu.classList.toggle('open');
    btn.innerHTML = open ? '<i class="ti ti-x"></i>' : '<i class="ti ti-menu-2"></i>';
  },

  injectStyles() {
    if (document.getElementById('cm-nav-styles')) return;
    const style = document.createElement('style');
    style.id = 'cm-nav-styles';
    style.textContent = `
      .cm-nav {
        display:flex; align-items:center; justify-content:space-between;
        padding:1rem 2.5rem; background:#FFFBF7;
        border-bottom:1px solid #EDE5DC;
        position:sticky; top:0; z-index:200;
        font-family:'DM Sans',sans-serif;
      }
      .cm-logo {
        font-family:'Fraunces',serif; font-size:1.6rem; font-weight:700;
        color:#C8401A; letter-spacing:-0.5px; text-decoration:none;
      }
      .cm-logo span { color:#1C1208; }
      .cm-nav-links { display:flex; gap:2rem; list-style:none; }
      .cm-nav-links a {
        text-decoration:none; font-size:0.9rem; font-weight:500;
        color:#7A6A5A; transition:color .2s;
      }
      .cm-nav-links a:hover, .cm-nav-links a.active { color:#C8401A; }
      .cm-nav-right { display:flex; align-items:center; gap:0.75rem; }
      .cm-btn-login {
        text-decoration:none; font-size:0.88rem; font-weight:600;
        color:#1C1208; padding:0.5rem 1rem; border-radius:50px;
        border:1.5px solid #EDE5DC; transition:all .2s;
      }
      .cm-btn-login:hover { border-color:#1C1208; }
      .cm-btn-cart {
        display:flex; align-items:center; gap:6px;
        background:#1C1208; color:#fff; border:none; border-radius:50px;
        padding:0.55rem 1.2rem; font-family:'DM Sans',sans-serif;
        font-size:0.85rem; font-weight:600; cursor:pointer;
        text-decoration:none; transition:background .2s; position:relative;
      }
      .cm-btn-cart:hover { background:#C8401A; }
      .cm-cart-count {
        background:#C8401A; color:#fff; border-radius:50%;
        width:18px; height:18px; font-size:10px;
        align-items:center; justify-content:center; font-weight:700;
        min-width:18px;
      }
      /* User pill */
      .cm-user-pill {
        display:flex; align-items:center; gap:8px; cursor:pointer;
        padding:0.4rem 0.9rem; border-radius:50px;
        border:1.5px solid #EDE5DC; position:relative; transition:all .2s;
        font-family:'DM Sans',sans-serif;
      }
      .cm-user-pill:hover { border-color:#C8401A; }
      .cm-user-avatar {
        width:24px; height:24px; background:#C8401A; color:#fff;
        border-radius:50%; display:flex; align-items:center; justify-content:center;
        font-size:0.72rem; font-weight:700;
      }
      .cm-user-name { font-size:0.85rem; font-weight:600; color:#1C1208; }
      .cm-user-dropdown {
        display:none; position:absolute; top:calc(100% + 8px); right:0;
        background:#fff; border:1px solid #EDE5DC; border-radius:14px;
        padding:0.5rem; min-width:150px;
        box-shadow:0 8px 30px rgba(0,0,0,0.1); z-index:300;
      }
      .cm-user-pill:hover .cm-user-dropdown { display:block; }
      .cm-user-dropdown a {
        display:block; padding:0.55rem 0.9rem; font-size:0.85rem;
        font-weight:500; color:#1C1208; text-decoration:none;
        border-radius:8px; transition:background .18s;
      }
      .cm-user-dropdown a:hover { background:#FAF0EC; color:#C8401A; }
      /* Hamburger */
      .cm-hamburger {
        display:none; background:none; border:1.5px solid #EDE5DC;
        border-radius:8px; width:36px; height:36px; cursor:pointer;
        align-items:center; justify-content:center; font-size:1.2rem;
      }
      /* Mobile menu */
      .cm-mobile-menu {
        display:none; flex-direction:column;
        background:#1C1208; padding:1rem 1.5rem; gap:0;
        position:fixed; top:60px; left:0; right:0; z-index:199;
        box-shadow:0 8px 30px rgba(0,0,0,0.3);
      }
      .cm-mobile-menu.open { display:flex; }
      .cm-mobile-menu a {
        color:rgba(255,255,255,0.8); text-decoration:none;
        padding:0.9rem 0; font-size:0.95rem; font-weight:500;
        border-bottom:1px solid rgba(255,255,255,0.06);
        font-family:'DM Sans',sans-serif;
      }
      .cm-mobile-menu a:last-child { border-bottom:none; }
      .cm-mobile-menu a:hover { color:#fff; }
      @media (max-width:768px) {
        .cm-nav { padding:1rem 1.5rem; }
        .cm-nav-links { display:none; }
        .cm-hamburger { display:flex; }
        .cm-nav-right .cm-btn-login { display:none; }
      }
    `;
    document.head.appendChild(style);
  }
};

/* ── 5. PRODUCTS DATA (shared across pages) ──────────────────── */
const PRODUCTS = [
  { id:1, name:'Butter Chicken',   desc:'Creamy tomato gravy, tender chicken, basmati rice',   price:249, old:349, emoji:'🍛', cat:'indian',  badge:'Bestseller', rating:'4.9', reviews:342 },
  { id:2, name:'Margherita Pizza', desc:'San Marzano tomatoes, fresh mozzarella, basil',        price:319, old:399, emoji:'🍕', cat:'pizza',   badge:'Hot',        rating:'4.8', reviews:218 },
  { id:3, name:'Smash Burger',     desc:'Double patty, cheddar, caramelised onion, secret sauce', price:199, old:249, emoji:'🍔', cat:'burger',  badge:'New',       rating:'4.7', reviews:156 },
  { id:4, name:'Dragon Roll',      desc:'Shrimp tempura, avocado, spicy mayo',                  price:389, old:null,emoji:'🍱', cat:'sushi',   badge:null,         rating:'4.9', reviews:89  },
  { id:5, name:'Gulab Jamun',      desc:'Soft milk-solid dumplings in rose syrup',              price:99,  old:149, emoji:'🍮', cat:'dessert', badge:'Sweet',      rating:'4.8', reviews:201 },
  { id:6, name:'Mango Lassi',      desc:'Fresh Alphonso mangoes, thick yogurt, cardamom',       price:89,  old:null,emoji:'🥭', cat:'drinks',  badge:null,         rating:'4.7', reviews:167 },
  { id:7, name:'Paneer Tikka',     desc:'Charred paneer, peppers, mint chutney',                price:179, old:229, emoji:'🧆', cat:'indian',  badge:'Veg',        rating:'4.8', reviews:289 },
  { id:8, name:'BBQ Chicken Pizza',desc:'Smoky BBQ sauce, grilled chicken, red onions',         price:349, old:429, emoji:'🍕', cat:'pizza',   badge:null,         rating:'4.6', reviews:143 },
];

/* ── 6. AUTO-INIT on every page ──────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  Navbar.injectStyles();
  // Navbar.render() is called per-page with activePage param
  Cart.updateBadges();
});
