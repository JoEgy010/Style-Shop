/**
 * ملف وظائف المشاركة الاجتماعية
 * يوفر وظائف لمشاركة المنتجات على وسائل التواصل الاجتماعي
 */

// الروابط الأساسية للمشاركة
const SHARE_URLS = {
    whatsapp: "https://api.whatsapp.com/send?text=",
    telegram: "https://telegram.me/share/url?url=",
    facebook: "https://www.facebook.com/sharer/sharer.php?u=",
    twitter: "https://twitter.com/intent/tweet?text="
};

// عنوان الموقع (سيتغير تلقائيًا حسب عنوان الموقع الحقيقي)
const baseUrl = window.location.origin; 

// التأكد من جاهزية الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('تم تحميل ملف المشاركة الاجتماعية');
});

/**
 * مشاركة منتج على وسائل التواصل الاجتماعي
 * @param {string} platform - منصة المشاركة (whatsapp, telegram, facebook, twitter)
 * @param {Object} product - بيانات المنتج المراد مشاركته
 * @param {string} productColor - لون المنتج المختار
 */
function shareProduct(platform, product, productColor) {
    if (!product || !SHARE_URLS[platform]) {
        console.error("معلومات المشاركة غير صحيحة", platform, product);
        return;
    }

    try {
        // بناء رابط المنتج
        const productUrl = `${baseUrl}/index.html?product=${product.id}&color=${encodeURIComponent(productColor)}`;
        
        // إنشاء نص المشاركة
        let shareText = `${product.name} - ${product.price} ر.س - ستايل شوب`;
        
        // بناء رابط المشاركة الكامل
        let shareUrl;
        switch (platform) {
            case 'whatsapp':
                shareUrl = `${SHARE_URLS[platform]}${encodeURIComponent(shareText + ': ' + productUrl)}`;
                break;
            case 'twitter':
                shareUrl = `${SHARE_URLS[platform]}${encodeURIComponent(shareText + ': ' + productUrl)}`;
                break;
            case 'telegram':
                shareUrl = `${SHARE_URLS[platform]}${encodeURIComponent(productUrl)}&text=${encodeURIComponent(shareText)}`;
                break;
            case 'facebook':
                shareUrl = `${SHARE_URLS[platform]}${encodeURIComponent(productUrl)}`;
                break;
            default:
                shareUrl = productUrl;
        }
        
        console.log(`مشاركة المنتج (${platform}): ${shareUrl}`);
        
        // فتح نافذة المشاركة
        window.open(shareUrl, '_blank', 'width=600,height=400');
    } catch (error) {
        console.error("خطأ في مشاركة المنتج:", error);
    }
}

/**
 * إنشاء أزرار المشاركة الاجتماعية
 * @param {Object} product - بيانات المنتج
 * @param {string} selectedColor - اللون المختار
 * @returns {string} HTML لأزرار المشاركة
 */
function createShareButtons(product, selectedColor) {
    // تخزين بيانات المنتج كمصفوفة نصية لتجنب مشاكل التنسيق
    const productId = product.id;
    const productName = product.name;
    const productPrice = product.price;
    
    // إنشاء عناصر HTML
    const container = document.createElement('div');
    container.className = 'social-share';
    
    const header = document.createElement('h4');
    header.textContent = 'مشاركة المنتج:';
    container.appendChild(header);
    
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'share-buttons';
    
    // إضافة زر واتساب
    const whatsappBtn = document.createElement('button');
    whatsappBtn.className = 'share-button whatsapp';
    whatsappBtn.innerHTML = '<i class="fab fa-whatsapp"></i>';
    whatsappBtn.addEventListener('click', function() {
        shareProduct('whatsapp', { id: productId, name: productName, price: productPrice }, selectedColor);
    });
    buttonContainer.appendChild(whatsappBtn);
    
    // إضافة زر تيليجرام
    const telegramBtn = document.createElement('button');
    telegramBtn.className = 'share-button telegram';
    telegramBtn.innerHTML = '<i class="fab fa-telegram"></i>';
    telegramBtn.addEventListener('click', function() {
        shareProduct('telegram', { id: productId, name: productName, price: productPrice }, selectedColor);
    });
    buttonContainer.appendChild(telegramBtn);
    
    // إضافة زر فيسبوك
    const facebookBtn = document.createElement('button');
    facebookBtn.className = 'share-button facebook';
    facebookBtn.innerHTML = '<i class="fab fa-facebook-f"></i>';
    facebookBtn.addEventListener('click', function() {
        shareProduct('facebook', { id: productId, name: productName, price: productPrice }, selectedColor);
    });
    buttonContainer.appendChild(facebookBtn);
    
    // إضافة زر تويتر
    const twitterBtn = document.createElement('button');
    twitterBtn.className = 'share-button twitter';
    twitterBtn.innerHTML = '<i class="fab fa-twitter"></i>';
    twitterBtn.addEventListener('click', function() {
        shareProduct('twitter', { id: productId, name: productName, price: productPrice }, selectedColor);
    });
    buttonContainer.appendChild(twitterBtn);
    
    container.appendChild(buttonContainer);
    
    // إعادة كائن HTML كنص
    const wrapper = document.createElement('div');
    wrapper.appendChild(container);
    return wrapper.innerHTML;
}

// كشف وظائف المشاركة للاستخدام في ملفات أخرى
window.shareService = {
    shareProduct,
    createShareButtons
};