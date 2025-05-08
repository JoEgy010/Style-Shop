/**
 * ملف وظائف التكامل مع تيليجرام
 * يوفر وظائف لإعداد وإرسال الطلبات إلى مدير المتجر عبر بوت تيليجرام
 */

// تخزين إعدادات التليجرام
const TELEGRAM_SETTINGS_KEY = 'telegram_settings';

// تهيئة إعدادات التيليجرام الافتراضية عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    const settings = loadTelegramSettings();
    if (!settings) {
        // استخدام القيم التي أدخلها المستخدم
        initTelegramSettings('7786050958:AAExJkqwWjFRt1TA5lkGu6YsVjVYMdU2aT8', '1448102314');
    }
});

/**
 * تهيئة إعدادات التليجرام
 * @param {string} botToken - توكن البوت
 * @param {string} chatId - معرّف الدردشة لإرسال الطلبات إليها
 */
function initTelegramSettings(botToken, chatId) {
    const settings = {
        botToken: botToken,
        chatId: chatId,
        timestamp: new Date().getTime()
    };
    
    localStorage.setItem(TELEGRAM_SETTINGS_KEY, JSON.stringify(settings));
    return settings;
}

/**
 * جلب إعدادات تيليجرام من التخزين المحلي
 */
function loadTelegramSettings() {
    const settingsJson = localStorage.getItem(TELEGRAM_SETTINGS_KEY);
    if (!settingsJson) {
        return null;
    }
    
    try {
        return JSON.parse(settingsJson);
    } catch (e) {
        console.error('خطأ في قراءة إعدادات التليجرام:', e);
        return null;
    }
}

/**
 * عرض نموذج إعدادات تيليجرام
 */
function showTelegramSettings() {
    // التحقق من وجود نموذج سابق وإزالته
    const existingOverlay = document.querySelector('.telegram-settings-overlay');
    if (existingOverlay) {
        document.body.removeChild(existingOverlay);
    }
    
    // الحصول على الإعدادات الحالية
    const currentSettings = loadTelegramSettings() || { botToken: '', chatId: '' };
    
    // إنشاء نموذج الإعدادات
    const overlay = document.createElement('div');
    overlay.className = 'telegram-settings-overlay';
    
    overlay.innerHTML = `
        <div class="telegram-settings-modal">
            <h3>إعدادات التليجرام</h3>
            <p>قم بإدخال معلومات بوت التليجرام الخاص بك لاستلام الطلبات</p>
            
            <form id="telegram-settings-form">
                <div class="form-group">
                    <label for="bot-token">توكن البوت:</label>
                    <input type="text" id="bot-token" name="bot-token" value="${currentSettings.botToken}" required>
                    <small>مثال: 1234567890:AAHfiqbqCN1f5xYZ3JRflfDnMxRxQQPIQeQ</small>
                </div>
                <div class="form-group">
                    <label for="chat-id">معرّف الدردشة:</label>
                    <input type="text" id="chat-id" name="chat-id" value="${currentSettings.chatId}" required>
                    <small>مثال: 123456789</small>
                </div>
                <div class="buttons">
                    <button type="submit" class="btn primary-btn">حفظ الإعدادات</button>
                    <button type="button" class="btn secondary-btn" id="cancel-telegram-settings">إلغاء</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // إضافة الأحداث للنموذج
    const form = document.getElementById('telegram-settings-form');
    const cancelBtn = document.getElementById('cancel-telegram-settings');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const botToken = document.getElementById('bot-token').value.trim();
        const chatId = document.getElementById('chat-id').value.trim();
        
        if (!botToken || !chatId) {
            alert('يرجى ملء جميع الحقول المطلوبة');
            return;
        }
        
        // حفظ الإعدادات
        initTelegramSettings(botToken, chatId);
        
        // إغلاق النموذج
        document.body.removeChild(overlay);
        
        alert('تم حفظ إعدادات التليجرام بنجاح!');
    });
    
    cancelBtn.addEventListener('click', () => {
        document.body.removeChild(overlay);
    });
    
    // إغلاق النموذج عند النقر خارج المحتوى
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
        }
    });
}

/**
 * إرسال رسالة إلى تيليجرام
 * @param {string} message - الرسالة المراد إرسالها
 * @returns {Promise} وعد بنتيجة الإرسال
 */
async function sendTelegramMessage(message) {
    const settings = loadTelegramSettings();
    
    if (!settings || !settings.botToken || !settings.chatId) {
        showTelegramSettings();
        throw new Error('إعدادات تيليجرام غير مكتملة');
    }
    
    try {
        const response = await fetch(`https://api.telegram.org/bot${settings.botToken}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: settings.chatId,
                text: message,
                parse_mode: 'HTML'
            })
        });
        
        const result = await response.json();
        
        if (!result.ok) {
            throw new Error(`خطأ في إرسال الرسالة: ${result.description}`);
        }
        
        return result;
    } catch (error) {
        console.error('خطأ في إرسال رسالة تيليجرام:', error);
        throw error;
    }
}

/**
 * إنشاء رسالة الطلب وإرسالها إلى تيليجرام
 * @param {Object} orderData - بيانات الطلب
 * @returns {Promise} وعد بنتيجة الإرسال
 */
async function sendOrderToTelegram(orderData) {
    try {
        // تنسيق تفاصيل المنتجات
        const productsDetails = orderData.cartItems.map(item => {
            const totalItemPrice = item.price * item.quantity;
            return `المنتج: ${item.name}\nكود المنتج: ${item.id || 'غير متوفر'}\nاللون: ${item.color}\nالمقاس: ${item.size}\nالكمية: ${item.quantity}\nالسعر: ${item.price} جنيه\nالإجمالي: ${totalItemPrice} جنيه`;
        }).join('\n\n');
        
        // إنشاء نص الرسالة
        const message = `
🛍️ طلب جديد #${orderData.orderNumber} 🛍️

👤 بيانات العميل:
الاسم: ${orderData.customerName}
الهاتف: ${orderData.customerPhone}
هاتف إضافي: ${orderData.customerEmail || 'غير متوفر'}
العنوان: ${orderData.customerAddress}
ملاحظات: ${orderData.notes || 'لا توجد ملاحظات'}

📦 تفاصيل المنتجات:
${productsDetails}

💰 ملخص الطلب:
إجمالي الطلب: ${orderData.total} جنيه

📅 تاريخ الطلب: ${new Date().toLocaleString('ar-EG')}
`;
        
        // إرسال الرسالة إلى تيليجرام
        return await sendTelegramMessage(message);
    } catch (error) {
        console.error('خطأ في إرسال الطلب إلى تيليجرام:', error);
        throw error;
    }
}

// كشف وظائف التليجرام للاستخدام في ملفات أخرى
window.telegramService = {
    initTelegramSettings,
    loadTelegramSettings,
    showTelegramSettings,
    sendTelegramMessage,
    sendOrderToTelegram
};