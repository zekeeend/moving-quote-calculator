/**
 * OMNIQUOTE STUDIO — 5-Second Brand Switcher & Demo Generator (Shadcn Light Edition)
 */

const BrandSwitcher = {
      presets: {
    texas: {
      name: "Lone Star Moving Pro",
      tagline: "Austin's Premier Residential & Long-Distance Movers",
      phone: "(512) 555-0188",
      color: "#059669", // US = Green
      currency: "$",
      logo: "truck",
      multiplier: 1.15
    },
    sydney: {
      name: "Pacific Coast Removals",
      tagline: "Premium Residential & Commercial Movers Sydney",
      phone: "+61 2 8900 1234",
      color: "#0284c7", // Ocean Blue
      currency: "AU$",
      logo: "navigation",
      multiplier: 1.2
    },
    london: {
      name: "Kensington Haulers UK",
      tagline: "Reliable London Home & Flat Relocation Specialists",
      phone: "+44 20 7946 0912",
      color: "#1e3a8a", // Royal Navy
      currency: "£",
      logo: "shield-check",
      multiplier: 1.05
    },
    manila: {
      name: "Metro Manila Lipat-Bahay Masters",
      tagline: "Affordable 4-Wheeler & 6-Wheeler Closed Van Hauling",
      phone: "0917-888-2345",
      color: "#ea580c", // PH = Orange
      currency: "₱",
      logo: "truck",
      multiplier: 1.0
    }
  },

  init() {
    this.bindDrawer();
    this.loadFromUrlOrStorage();
  },

  bindDrawer() {
    const drawer = document.getElementById('brand-switcher-drawer');
    const toggleBtn = document.getElementById('toggle-drawer-btn');
    const closeBtn = document.getElementById('close-drawer-btn');
    const applyBtn = document.getElementById('apply-branding-btn');
    const copyLinkBtn = document.getElementById('copy-demo-link-btn');

    const colorInput = document.getElementById('config-color');
    const colorHex = document.getElementById('color-hex-val');
    const rateSlider = document.getElementById('config-rate-slider');
    const multVal = document.getElementById('multiplier-val');

    toggleBtn.addEventListener('click', () => drawer.classList.toggle('open'));
    closeBtn.addEventListener('click', () => drawer.classList.remove('open'));

    // Keyboard shortcut: Ctrl + B
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        drawer.classList.toggle('open');
      }
    });

    colorInput.addEventListener('input', (e) => {
      colorHex.textContent = e.target.value.toUpperCase();
      this.applyColorTheme(e.target.value);
    });

    rateSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value).toFixed(2);
      multVal.textContent = `${val}x (${val > 1 ? 'High Ticket' : 'Budget'})`;
    });

    const presetBtns = document.querySelectorAll('.preset-pill');
    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.preset;
        if (this.presets[key]) {
          this.loadPreset(this.presets[key]);
        }
      });
    });

    applyBtn.addEventListener('click', () => {
      this.applyCurrentFormValues();
      drawer.classList.remove('open');
    });

    copyLinkBtn.addEventListener('click', () => {
      this.copyShareableUrl();
    });
  },

  loadPreset(p) {
    document.getElementById('config-biz-name').value = p.name;
    document.getElementById('config-biz-tagline').value = p.tagline;
    document.getElementById('config-biz-phone').value = p.phone;
    document.getElementById('config-currency').value = p.currency;
    document.getElementById('config-color').value = p.color;
    document.getElementById('color-hex-val').textContent = p.color.toUpperCase();
    document.getElementById('config-logo').value = p.logo;
    document.getElementById('config-rate-slider').value = p.multiplier;
    document.getElementById('multiplier-val').textContent = `${p.multiplier.toFixed(2)}x`;

    this.applyCurrentFormValues();
  },

  applyCurrentFormValues() {
    const name = document.getElementById('config-biz-name').value;
    const tagline = document.getElementById('config-biz-tagline').value;
    const phone = document.getElementById('config-biz-phone').value;
    const currency = document.getElementById('config-currency').value;
    const color = document.getElementById('config-color').value;
    const logo = document.getElementById('config-logo').value;
    const multiplier = parseFloat(document.getElementById('config-rate-slider').value);

    this.applyColorTheme(color);

    document.getElementById('brand-name').textContent = name;
    document.getElementById('brand-tagline').textContent = tagline;
    document.getElementById('page-title').textContent = `${name} | Instant Moving Quote Calculator`;
    document.getElementById('footer-copy').textContent = `© 2026 ${name}. All rights reserved.`;

    document.getElementById('brand-phone-text').textContent = phone;
    document.getElementById('brand-phone-btn').setAttribute('href', `tel:${phone.replace(/[^0-9]/g, '')}`);

    const iconEl = document.getElementById('brand-lucide-icon');
    const imgEl = document.getElementById('brand-logo-img');
    if (logo.startsWith('http://') || logo.startsWith('https://') || logo.startsWith('/')) {
      imgEl.src = logo;
      imgEl.style.display = 'block';
      if (iconEl) iconEl.style.display = 'none';
    } else {
      if (iconEl) {
        iconEl.setAttribute('data-lucide', logo || 'truck');
        iconEl.style.display = 'inline-block';
      }
      imgEl.style.display = 'none';
    }

    document.querySelectorAll('.currency-symbol').forEach(el => el.textContent = currency);
    document.getElementById('summary-currency').textContent = currency;
    document.getElementById('summary-currency-high').textContent = currency;

    if (window.QuoteEngine) {
      QuoteEngine.state.currency = currency;
      QuoteEngine.state.multiplier = multiplier;
      QuoteEngine.recalculate();
    }

    if (window.lucide) {
      lucide.createIcons();
    }

    localStorage.setItem('omni_brand_config_v2', JSON.stringify({
      name, tagline, phone, currency, color, logo, multiplier
    }));
  },

  applyColorTheme(hex) {
    const root = document.documentElement;
    root.style.setProperty('--primary', hex);
    root.style.setProperty('--primary-hover', this.adjustColor(hex, -20));
    root.style.setProperty('--primary-subtle', `${hex}15`);
    root.style.setProperty('--primary-glow', `${hex}33`);
  },

  adjustColor(col, amt) {
    let usePound = false;
    if (col[0] == "#") {
      col = col.slice(1);
      usePound = true;
    }
    let num = parseInt(col, 16);
    let r = (num >> 16) + amt;
    if (r > 255) r = 255; else if (r < 0) r = 0;
    let b = ((num >> 8) & 0x00FF) + amt;
    if (b > 255) b = 255; else if (b < 0) b = 0;
    let g = (num & 0x0000FF) + amt;
    if (g > 255) g = 255; else if (g < 0) g = 0;
    return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
  },

  loadFromUrlOrStorage() {
    const params = new URLSearchParams(window.location.search);
    if (params.has('biz') || params.has('name')) {
      const bizName = params.get('biz') || params.get('name');
      const color = params.get('color') ? (params.get('color').startsWith('#') ? params.get('color') : `#${params.get('color')}`) : '#059669';
      const phone = params.get('phone') || '(800) 555-0199';
      const currency = params.get('curr') || params.get('currency') || '$';
      const logo = params.get('logo') || 'truck';
      const mult = parseFloat(params.get('mult') || '1.0');

      this.loadPreset({
        name: bizName,
        tagline: 'Licensed, Insured & Trusted Professional Moving Services',
        phone: phone,
        color: color,
        currency: currency,
        logo: logo,
        multiplier: mult
      });
      return;
    }

    const saved = localStorage.getItem('omni_brand_config_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.loadPreset(parsed);
      } catch (e) {
        console.error('Could not load saved config', e);
      }
    }
  },

  copyShareableUrl() {
    const name = encodeURIComponent(document.getElementById('config-biz-name').value);
    const color = encodeURIComponent(document.getElementById('config-color').value.replace('#', ''));
    const phone = encodeURIComponent(document.getElementById('config-biz-phone').value);
    const curr = encodeURIComponent(document.getElementById('config-currency').value);
    const logo = encodeURIComponent(document.getElementById('config-logo').value);

    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}?biz=${name}&color=${color}&phone=${phone}&curr=${curr}&logo=${logo}`;

    navigator.clipboard.writeText(shareUrl).then(() => {
      const btn = document.getElementById('copy-demo-link-btn');
      const originalHtml = btn.innerHTML;
      btn.innerHTML = '<i data-lucide="check"></i> Copied to Clipboard!';
      if (window.lucide) lucide.createIcons();
      setTimeout(() => {
        btn.innerHTML = originalHtml;
        if (window.lucide) lucide.createIcons();
      }, 2500);
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  BrandSwitcher.init();
});
