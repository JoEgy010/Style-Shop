// متغيرات عامة
let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
const shippingCost = 70; // تكلفة الشحن الثابتة (جنيه مصري)
let currentTheme = localStorage.getItem('theme') || 'light';

// تحديث عدد العناصر في السلة
function updateCartCount() {
    const cartCountElement = document.getElementById('cart-count');
    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
    cartCountElement.textContent = totalItems;
}

// حساب إجمالي سعر السلة
function calculateCartTotal() {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// عرض عناصر السلة
function displayCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartSummaryContainer = document.getElementById('cart-summary');
    
    // التحقق من وجود عناصر في السلة
    if (cartItems.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>سلة التسوق فارغة</p>
                <button id="shop-now-btn" class="btn primary-btn">تسوق الآن</button>
            </div>
        `;
        cartSummaryContainer.innerHTML = '';
        
        // إضافة حدث للزر "تسوق الآن"
        const shopNowBtn = document.getElementById('shop-now-btn');
        shopNowBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
        return;
    }
    
    // عرض العناصر
    cartItemsContainer.innerHTML = '';
    cartItems.forEach((item, index) => {
        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        cartItemElement.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-details">
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-variant">اللون: ${item.color} | المقاس: ${item.size}</div>
                <div class="cart-item-price">${item.price} جنيه</div>
                <div class="cart-item-actions">
                    <div class="cart-quantity">
                        <button class="quantity-btn minus-btn" data-index="${index}">-</button>
                        <div class="quantity-value">${item.quantity}</div>
                        <button class="quantity-btn plus-btn" data-index="${index}">+</button>
                    </div>
                    <div class="remove-item" data-index="${index}">
                        <i class="fas fa-trash"></i> إزالة
                    </div>
                </div>
            </div>
        `;
        
        cartItemsContainer.appendChild(cartItemElement);
    });
    
    // تحديث ملخص السلة
    updateCartSummary();
    
    // إضافة أحداث لأزرار الكمية وإزالة العناصر
    addCartItemEventListeners();
}

// تحديث ملخص السلة
function updateCartSummary() {
    const cartSummaryContainer = document.getElementById('cart-summary');
    const subtotal = calculateCartTotal();
    const total = subtotal + shippingCost;
    
    cartSummaryContainer.innerHTML = `
        <h3>ملخص الطلب</h3>
        <div class="summary-row">
            <span>إجمالي المنتجات:</span>
            <span>${subtotal} جنيه</span>
        </div>
        <div class="summary-row">
            <span>تكلفة الشحن:</span>
            <span>${shippingCost} جنيه</span>
        </div>
        <div class="summary-row total">
            <span>الإجمالي:</span>
            <span>${total} جنيه</span>
        </div>
    `;
}

// إضافة أحداث لأزرار العناصر في السلة
function addCartItemEventListeners() {
    // أزرار زيادة ونقصان الكمية
    const minusBtns = document.querySelectorAll('.minus-btn');
    const plusBtns = document.querySelectorAll('.plus-btn');
    const removeItemBtns = document.querySelectorAll('.remove-item');
    
    minusBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            if (cartItems[index].quantity > 1) {
                cartItems[index].quantity--;
                updateCart();
            }
        });
    });
    
    plusBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            cartItems[index].quantity++;
            updateCart();
        });
    });
    
    removeItemBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            cartItems.splice(index, 1);
            updateCart();
        });
    });
}

// تحديث السلة
function updateCart() {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    updateCartCount();
    displayCartItems();
}

// عرض نموذج إتمام الطلب
function showCheckoutForm() {
    const checkoutOverlay = document.getElementById('checkout-form-overlay');
    const orderSummary = document.getElementById('order-summary');
    
    // تحديث ملخص الطلب في النموذج
    const subtotal = calculateCartTotal();
    const total = subtotal + shippingCost;
    
    orderSummary.innerHTML = `
        <h3>ملخص الطلب</h3>
        <div class="summary-row">
            <span>إجمالي المنتجات (${cartItems.length} منتج):</span>
            <span>${subtotal} جنيه</span>
        </div>
        <div class="summary-row">
            <span>تكلفة الشحن:</span>
            <span>${shippingCost} جنيه</span>
        </div>
        <div class="summary-row total">
            <span>الإجمالي:</span>
            <span>${total} جنيه</span>
        </div>
    `;
    
    // إظهار النموذج
    checkoutOverlay.classList.add('active');
}

// إغلاق نموذج إتمام الطلب
function closeCheckoutForm() {
    const checkoutOverlay = document.getElementById('checkout-form-overlay');
    checkoutOverlay.classList.remove('active');
}

// إرسال الطلب إلى التليجرام
async function submitOrder(formData) {
    try {
        // تحقق من وجود ملف telegram.js
        if (!window.telegramService) {
            console.error('لم يتم تحميل خدمة التليجرام');
            alert('خطأ في تحميل خدمة التليجرام. يرجى تحديث الصفحة والمحاولة مرة أخرى.');
            return false;
        }
        
        // بيانات العميل
        const customerInfo = {
            name: formData.get('name'),
            phone: formData.get('phone'),
            altPhone: formData.get('alt-phone') || 'غير متوفر',
            governorate: formData.get('governorate'),
            city: formData.get('city'),
            address: formData.get('address'),
            notes: formData.get('notes') || 'لا توجد ملاحظات'
        };
        
        // تركيب عنوان كامل
        const fullAddress = `${customerInfo.governorate} - ${customerInfo.city} - ${customerInfo.address}`;
        
        // توليد رقم الطلب
        const orderNumber = generateOrderNumber();
        
        // إعداد بيانات الطلب لإرساله عبر تيليجرام
        const orderData = {
            orderNumber: orderNumber,
            customerName: customerInfo.name,
            customerPhone: customerInfo.phone,
            customerEmail: customerInfo.altPhone, // استخدام رقم الهاتف البديل كإيميل مؤقتًا
            customerAddress: fullAddress,
            cartItems: cartItems.map(item => ({
                id: item.id,
                name: item.name,
                color: item.color,
                size: item.size,
                price: item.price,
                quantity: item.quantity
            })),
            total: calculateCartTotal() + shippingCost,
            notes: customerInfo.notes
        };
        
        // استخدام خدمة التليجرام لإرسال الطلب
        const result = await window.telegramService.sendOrderToTelegram(orderData);
        
        // إرجاع النتيجة
        return result && result.ok;
    } catch (error) {
        console.error('حدث خطأ في إرسال الطلب:', error);
        
        // في حالة عدم تكوين إعدادات التليجرام
        if (error.message === 'إعدادات تيليجرام غير مكتملة') {
            // سيقوم showTelegramSettings() تلقائيًا بعرض نموذج الإعدادات
            // يمكننا إخبار المستخدم بالحاجة لضبط الإعدادات
            alert('يرجى إكمال إعدادات التليجرام لاستلام الطلبات');
        }
        
        return false;
    }
}

// عرض صفحة نجاح الطلب
function showOrderSuccess() {
    const cartSection = document.querySelector('.cart-section');
    const orderNumber = generateOrderNumber();
    
    cartSection.innerHTML = `
        <div class="order-success">
            <i class="fas fa-check-circle"></i>
            <h2>تم تقديم طلبك بنجاح!</h2>
            <p>شكراً لتسوقك معنا. سيتم التواصل معك قريباً لتأكيد الطلب.</p>
            <div class="order-number">رقم الطلب: ${orderNumber}</div>
            <button id="continue-shopping-success" class="btn continue-shopping-success">العودة للتسوق</button>
        </div>
    `;
    
    // إفراغ السلة
    cartItems = [];
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    updateCartCount();
    
    // إضافة حدث لزر العودة للتسوق
    const continueShoppingBtn = document.getElementById('continue-shopping-success');
    continueShoppingBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
}

// توليد رقم طلب عشوائي
function generateOrderNumber() {
    const timestamp = new Date().getTime().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${timestamp}-${random}`;
}

// تحديث وضع السمة (النهاري/الليلي)
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    currentTheme = theme;
}

// تبديل وضع السمة (النهاري/الليلي)
function toggleTheme() {
    if (currentTheme === 'light') {
        setTheme('dark');
    } else {
        setTheme('light');
    }
    
    // تحديث حالة عنصر الإدخال في زر التبديل
    const themeToggleInput = document.getElementById('theme-toggle-input');
    if (themeToggleInput) {
        themeToggleInput.checked = (currentTheme === 'dark');
    }
}

// عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    // تطبيق السمة المحفوظة
    setTheme(currentTheme);
    
    // عرض عناصر السلة
    displayCartItems();
    
    // تحديث عدد عناصر السلة
    updateCartCount();
    
    // إعداد زر التبديل الجديد
    const themeToggleInput = document.getElementById('theme-toggle-input');
    if (themeToggleInput) {
        // تعيين الحالة الأولية للزر
        themeToggleInput.checked = (currentTheme === 'dark');
        
        // إضافة حدث للاستجابة للتغيير
        themeToggleInput.addEventListener('change', () => {
            if (themeToggleInput.checked) {
                setTheme('dark');
            } else {
                setTheme('light');
            }
        });
    }
    
    // إضافة حدث لزر "مواصلة التسوق"
    const continueShoppingBtn = document.getElementById('continue-shopping-btn');
    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
    
    // إضافة حدث لزر "إتمام الطلب"
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cartItems.length > 0) {
                showCheckoutForm();
            } else {
                alert('يرجى إضافة منتجات إلى السلة أولاً.');
            }
        });
    }
    
    // إضافة حدث لزر إغلاق نموذج الطلب
    const closeCheckoutBtn = document.getElementById('close-checkout');
    if (closeCheckoutBtn) {
        closeCheckoutBtn.addEventListener('click', closeCheckoutForm);
    }
    
    // إغلاق نموذج الطلب عند النقر خارج المحتوى
    const checkoutOverlay = document.getElementById('checkout-form-overlay');
    checkoutOverlay.addEventListener('click', (e) => {
        if (e.target === checkoutOverlay) {
            closeCheckoutForm();
        }
    });
    
    // إضافة حدث لتحديد سعر الشحن عند اختيار المحافظة
    const governorateSelect = document.getElementById('governorate');
    governorateSelect.addEventListener('change', () => {
        if (governorateSelect.value) {
            // تحديث ملخص الطلب بعد اختيار المحافظة
            const orderSummary = document.getElementById('order-summary');
            const subtotal = calculateCartTotal();
            const total = subtotal + shippingCost;
            
            orderSummary.innerHTML = `
                <h3>ملخص الطلب</h3>
                <div class="summary-row">
                    <span>إجمالي المنتجات (${cartItems.length} منتج):</span>
                    <span>${subtotal} جنيه</span>
                </div>
                <div class="summary-row">
                    <span>تكلفة الشحن (${governorateSelect.value}):</span>
                    <span>${shippingCost} جنيه</span>
                </div>
                <div class="summary-row total">
                    <span>الإجمالي:</span>
                    <span>${total} جنيه</span>
                </div>
            `;
        }
    });
    
    // إضافة حدث لنموذج الطلب
    const orderForm = document.getElementById('order-form');
    orderForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(orderForm);
        
        // إظهار حالة التحميل
        const submitBtn = orderForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = 'جاري إرسال الطلب...';
        submitBtn.disabled = true;
        
        // إرسال الطلب
        const success = await submitOrder(formData);
        
        if (success) {
            closeCheckoutForm();
            showOrderSuccess();
        } else {
            alert('عذراً، حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.');
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
        }
    });
});