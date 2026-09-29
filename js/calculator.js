/**
 * OMNIQUOTE STUDIO — Real-Time Moving Price Calculation Engine (Shadcn Light Edition)
 */

const QuoteEngine = {
  state: {
    moveType: 'local',
    homeSize: '2bed',
    basePrice: 580,
    baseHours: 4.0,
    crewSize: 3,
    truckSize: '24ft Truck',
    distance: 25,
    addons: {
      packing: false,
      piano: false,
      stairs: false,
      storage: false
    },
    currency: '$',
    multiplier: 1.0,
    priceLow: 580,
    priceHigh: 790
  },

  homeSizes: {
    studio: { base: 320, hours: 2.5, crew: 2, truck: '16ft Truck', label: 'Studio / 1-Bed' },
    '2bed': { base: 580, hours: 4.0, crew: 3, truck: '24ft Truck', label: '2 - 3 Bedroom' },
    '4bed': { base: 950, hours: 6.5, crew: 4, truck: '26ft Truck', label: '4+ Bedroom Home' },
    commercial: { base: 1400, hours: 8.0, crew: 5, truck: 'Heavy Fleet', label: 'Office / Commercial' }
  },

  addonCosts: {
    packing: 180,
    piano: 150,
    stairs: 80,
    storage: 220
  },

  init() {
    this.bindEvents();
    this.recalculate();
  },

  bindEvents() {
    // 1. Move Type Selection
    const typeButtons = document.querySelectorAll('#move-type-group .tab-btn');
    typeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        typeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.moveType = btn.dataset.type;
        this.recalculate();
      });
    });

    // 2. Home Size Selection
    const sizeButtons = document.querySelectorAll('#home-size-group .bento-card');
    sizeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        sizeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.homeSize = btn.dataset.size;
        const meta = this.homeSizes[this.state.homeSize];
        this.state.basePrice = meta.base;
        this.state.baseHours = meta.hours;
        this.state.crewSize = meta.crew;
        this.state.truckSize = meta.truck;
        this.recalculate();
      });
    });

    // 3. Distance Slider (with dynamic fill track)
    const slider = document.getElementById('distance-slider');
    const distanceDisplay = document.getElementById('distance-display');
    
    const updateSliderFill = (miles) => {
      const min = parseInt(slider.min, 10);
      const max = parseInt(slider.max, 10);
      const pct = ((miles - min) / (max - min)) * 100;
      slider.style.setProperty('--slider-pct', `${pct}%`);
    };

    updateSliderFill(parseInt(slider.value, 10));

    slider.addEventListener('input', (e) => {
      const miles = parseInt(e.target.value, 10);
      this.state.distance = miles;
      distanceDisplay.textContent = `${miles} Miles`;
      updateSliderFill(miles);
      this.recalculate();
    });

    // 4. Value-Add Toggles
    const checkboxes = document.querySelectorAll('.service-checkbox');
    checkboxes.forEach(cb => {
      cb.addEventListener('change', () => {
        const id = cb.id.replace('service-', '');
        this.state.addons[id] = cb.checked;
        this.recalculate();
      });
    });

    // 5. Quote Lock Form Submit
    const form = document.getElementById('quote-lock-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleFormSubmit();
    });

    // 6. Direct WhatsApp & SMS Buttons
    document.getElementById('btn-whatsapp-quote').addEventListener('click', () => {
      this.sendInstantMessage('whatsapp');
    });

    document.getElementById('btn-sms-quote').addEventListener('click', () => {
      this.sendInstantMessage('sms');
    });
  },

  recalculate() {
    const meta = this.homeSizes[this.state.homeSize];
    let low = meta.base * this.state.multiplier;
    let high = (meta.base * 1.35) * this.state.multiplier;
    let hoursLow = meta.hours;
    let hoursHigh = meta.hours + 1.5;

    // Distance Calculation
    if (this.state.moveType === 'local') {
      if (this.state.distance > 40) {
        const extraMiles = this.state.distance - 40;
        low += extraMiles * 2.5 * this.state.multiplier;
        high += extraMiles * 3.2 * this.state.multiplier;
      }
    } else {
      const transitBase = 450 * this.state.multiplier;
      const mileageFee = this.state.distance * 1.85 * this.state.multiplier;
      low += transitBase + mileageFee;
      high += transitBase + (mileageFee * 1.25);
      hoursLow += 4;
      hoursHigh += 12;
    }

    // Addons Calculation
    let addonTotal = 0;
    const activeAddons = [];
    for (const [key, active] of Object.entries(this.state.addons)) {
      if (active) {
        const cost = this.addonCosts[key] * this.state.multiplier;
        addonTotal += cost;
        activeAddons.push(key);
      }
    }

    low += addonTotal;
    high += addonTotal;

    // Currency Rounding
    if (this.state.currency === '₱') {
      low = Math.round((low * 30) / 100) * 100;
      high = Math.round((high * 30) / 100) * 100;
    } else {
      low = Math.round(low / 10) * 10;
      high = Math.round(high / 10) * 10;
    }

    this.state.priceLow = low;
    this.state.priceHigh = high;

    this.renderUpdates(meta, hoursLow, hoursHigh, activeAddons);
  },

  renderUpdates(meta, hoursLow, hoursHigh, activeAddons) {
    const priceLowEl = document.getElementById('price-low');
    const priceHighEl = document.getElementById('price-high');
    const hoursEl = document.getElementById('hours-display');
    const crewSummary = document.getElementById('crew-summary');
    const scopeSummary = document.getElementById('scope-summary');
    const travelSummary = document.getElementById('travel-summary');
    const addonsRow = document.getElementById('addons-row');
    const addonsSummary = document.getElementById('addons-summary');

    priceLowEl.textContent = this.state.priceLow.toLocaleString();
    priceHighEl.textContent = this.state.priceHigh.toLocaleString();

    if (this.state.moveType === 'local') {
      hoursEl.textContent = `Estimated: ${hoursLow} – ${hoursHigh} Hours`;
      scopeSummary.textContent = `Local Move (${this.state.distance} Miles)`;
      travelSummary.textContent = this.state.distance > 40 ? 'Extended Metro Transit' : 'Standard Metro Included';
    } else {
      hoursEl.textContent = `Estimated: 1 – 2 Business Days Transit`;
      scopeSummary.textContent = `Long Distance (${this.state.distance} Miles)`;
      travelSummary.textContent = `Linehaul Interstate Freight`;
    }

    crewSummary.textContent = `${meta.crew} Movers • ${meta.truck}`;

    if (activeAddons.length > 0) {
      addonsRow.style.display = 'flex';
      addonsSummary.textContent = `${activeAddons.length} Selected`;
    } else {
      addonsRow.style.display = 'none';
    }
  },

  handleFormSubmit() {
    const name = document.getElementById('cust-name').value;
    const phone = document.getElementById('cust-phone').value;
    const date = document.getElementById('cust-date').value;
    const from = document.getElementById('cust-from').value || 'Current City';
    const to = document.getElementById('cust-to').value || 'New City';

    const form = document.getElementById('quote-lock-form');
    const successMsg = document.getElementById('quote-success-msg');
    const successEst = document.getElementById('success-estimate');

    successEst.textContent = `${this.state.currency}${this.state.priceLow.toLocaleString()} – ${this.state.currency}${this.state.priceHigh.toLocaleString()}`;
    form.style.display = 'none';
    successMsg.style.display = 'block';

    if (window.lucide) {
      lucide.createIcons();
    }
  },

  sendInstantMessage(platform) {
    const bizPhone = document.getElementById('brand-phone-text').textContent.replace(/[^0-9]/g, '');
    const meta = this.homeSizes[this.state.homeSize];
    const text = encodeURIComponent(
      `Hello! I just calculated an instant quote on your website:
• Size: ${meta.label} (${meta.crew} Movers)
• Distance: ${this.state.distance} Miles (${this.state.moveType === 'local' ? 'Local Move' : 'Long Distance'})
• Ballpark Estimate: ${this.state.currency}${this.state.priceLow.toLocaleString()} - ${this.state.currency}${this.state.priceHigh.toLocaleString()}
I'd like to check your available move dates!`
    );

    if (platform === 'whatsapp') {
      window.open(`https://wa.me/${bizPhone || '18005550199'}?text=${text}`, '_blank');
    } else {
      window.open(`sms:${bizPhone || '18005550199'}?body=${text}`, '_blank');
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  QuoteEngine.init();
});
