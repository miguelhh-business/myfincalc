// myfincalc.org — Central Configuration
// Replace YOUR-ID with your actual affiliate IDs when you register

const CONFIG = {
  ADSENSE_ID: 'YOUR-ADSENSE-ID-HERE',

  // ── Affiliate Links ──
  // Replace these as you sign up for each program
  AFFILIATES: {
    // NZ-specific
    SHARESIES:  'https://sharesies.nz/?ref=YOUR-ID',    // NZ investing — ~$20-50/referral
    KERNEL:     'https://kernel.co.nz/?ref=YOUR-ID',    // NZ KiwiSaver — ~$20-30/referral
    HATCH:      'https://hatch.as/?ref=YOUR-ID',        // NZ US stocks — ~$20/referral

    // Global
    WISE:       'https://wise.com/invite/?ref=YOUR-ID',  // International transfers — $50-100/referral
    ETORO:      'https://etoro.com/?ref=YOUR-ID',        // Global investing — $50-200/lead
    TRADING212: 'https://trading212.com/?ref=YOUR-ID',   // UK/EU investing — varies
  },

  // ── Geo-Targeted Affiliate Logic ──
  // Each calculator type maps to the best affiliate per country
  // Format: { text: "CTA text", cta: "Button text", link: "AFFILIATE_KEY" }
  GEO_AFFILIATES: {
    // For investment calculators (FIRE, compound interest, how much to invest, investment returns)
    invest: {
      NZ: { text: 'Start investing from just $1 with Sharesies', cta: 'Try Sharesies →', link: 'SHARESIES' },
      AU: { text: 'Start investing with a global platform', cta: 'Try eToro →', link: 'ETORO' },
      GB: { text: 'Start investing commission-free', cta: 'Try Trading 212 →', link: 'TRADING212' },
      US: { text: 'Start investing with a trusted platform', cta: 'Try eToro →', link: 'ETORO' },
      CA: { text: 'Start investing with a global platform', cta: 'Try eToro →', link: 'ETORO' },
      DEFAULT: { text: 'Ready to start investing? Open an account in minutes', cta: 'Start investing →', link: 'ETORO' },
    },

    // For retirement calculators (retirement savings, FIRE)
    retirement: {
      NZ: { text: 'Maximize your KiwiSaver with the right fund', cta: 'Compare with Kernel →', link: 'KERNEL' },
      AU: { text: 'Make your super work harder for you', cta: 'Try eToro →', link: 'ETORO' },
      GB: { text: 'Start your pension savings today', cta: 'Try Trading 212 →', link: 'TRADING212' },
      US: { text: 'Open an IRA or brokerage account', cta: 'Try eToro →', link: 'ETORO' },
      CA: { text: 'Maximize your RRSP contributions', cta: 'Try eToro →', link: 'ETORO' },
      DEFAULT: { text: 'Start your retirement savings today', cta: 'Start investing →', link: 'ETORO' },
    },

    // For salary / international (salary after tax, savings goal)
    salary: {
      NZ: { text: 'Sending money overseas? Save on fees', cta: 'Try Wise →', link: 'WISE' },
      AU: { text: 'Transfer money internationally with low fees', cta: 'Try Wise →', link: 'WISE' },
      GB: { text: 'Send money abroad at the real exchange rate', cta: 'Try Wise →', link: 'WISE' },
      US: { text: 'International transfers with no hidden fees', cta: 'Try Wise →', link: 'WISE' },
      CA: { text: 'Send money internationally at the real rate', cta: 'Try Wise →', link: 'WISE' },
      DEFAULT: { text: 'Transfer money internationally with low fees', cta: 'Try Wise →', link: 'WISE' },
    },

    // For debt / savings (debt payoff, emergency fund, savings goal)
    savings: {
      NZ: { text: 'Put your savings to work — invest the difference', cta: 'Try Sharesies →', link: 'SHARESIES' },
      AU: { text: 'Make your money work harder', cta: 'Try eToro →', link: 'ETORO' },
      GB: { text: 'Grow your savings with smart investing', cta: 'Try Trading 212 →', link: 'TRADING212' },
      US: { text: 'Start growing your savings through investing', cta: 'Try eToro →', link: 'ETORO' },
      CA: { text: 'Make your savings work harder', cta: 'Try eToro →', link: 'ETORO' },
      DEFAULT: { text: 'Make your money work harder for you', cta: 'Start investing →', link: 'ETORO' },
    },

    // For property (rent vs buy, solar panels)
    property: {
      NZ: { text: 'Invest the deposit difference while you rent', cta: 'Try Sharesies →', link: 'SHARESIES' },
      AU: { text: 'Invest while you weigh your options', cta: 'Try eToro →', link: 'ETORO' },
      GB: { text: 'Invest while you decide on property', cta: 'Try Trading 212 →', link: 'TRADING212' },
      US: { text: 'Invest the difference while you rent', cta: 'Try eToro →', link: 'ETORO' },
      CA: { text: 'Invest while you plan your purchase', cta: 'Try eToro →', link: 'ETORO' },
      DEFAULT: { text: 'Invest your money while you decide', cta: 'Start investing →', link: 'ETORO' },
    },
  },
};

// ── Geo Detection & Affiliate Renderer ──
// Detects user country via ipapi.co (free, no key needed)
// Caches result in sessionStorage to avoid repeated API calls

let _userCountry = null;

async function getUserCountry() {
  if (_userCountry) return _userCountry;
  const cached = sessionStorage.getItem('mfc_country');
  if (cached) { _userCountry = cached; return cached; }
  try {
    const res = await fetch('https://ipapi.co/json/', { timeout: 3000 });
    const data = await res.json();
    _userCountry = data.country_code || 'DEFAULT';
    sessionStorage.setItem('mfc_country', _userCountry);
    return _userCountry;
  } catch (e) {
    _userCountry = 'DEFAULT';
    return 'DEFAULT';
  }
}

// Maps country codes to our geo keys
function geoKey(countryCode) {
  const map = { NZ: 'NZ', AU: 'AU', GB: 'GB', UK: 'GB', US: 'US', CA: 'CA' };
  return map[countryCode] || 'DEFAULT';
}

// Creates an affiliate banner element for a given calculator type
// Usage: const banner = await createAffiliateBanner('invest');
//        panel.appendChild(banner);
async function createAffiliateBanner(calcType) {
  const country = await getUserCountry();
  const geo = geoKey(country);
  const affConfig = CONFIG.GEO_AFFILIATES[calcType] || CONFIG.GEO_AFFILIATES.invest;
  const aff = affConfig[geo] || affConfig.DEFAULT;
  const link = CONFIG.AFFILIATES[aff.link] || '#';

  const banner = document.createElement('div');
  banner.className = 'aff-banner';
  banner.innerHTML = `
    <span class="aff-text">${aff.text}</span>
    <a class="aff-cta" href="${link}" target="_blank" rel="noopener sponsored">${aff.cta}</a>`;
  return banner;
}
