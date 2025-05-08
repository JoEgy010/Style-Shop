// متغيرات عامة
let products = [];
let filteredProducts = [];
let currentCategory = 'all';
let currentSearch = '';
let currentMaxPrice = 1000;
let currentSizes = [];
let currentSort = 'default';
let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
let currentTheme = localStorage.getItem('theme') || 'light';

// تحديث عدد العناصر في السلة
function updateCartCount() {
    const cartCountElement = document.getElementById('cart-count');
    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
    cartCountElement.textContent = totalItems;
}

// جلب المنتجات من الملف JSON
async function fetchProducts() {
    try {
        const response = await fetch('products.json');
        if (!response.ok) {
            throw new Error('فشل في تحميل المنتجات');
        }
        products = await response.json();
        displayProducts();
    } catch (error) {
        console.error('حدث خطأ:', error);
        document.getElementById('products-container').innerHTML = `
            <div class="error-message">
                <p>عذراً، حدث خطأ أثناء تحميل المنتجات. يرجى المحاولة مرة أخرى لاحقاً.</p>
            </div>
        `;
    }
}

// تطبيق فلترة المنتجات حسب جميع المعايير
function applyFilters() {
    // تصفية حسب الفئة
    filteredProducts = currentCategory === 'all' 
        ? [...products] 
        : products.filter(product => product.category === currentCategory);
    
    // تصفية حسب البحث
    if (currentSearch) {
        const searchLower = currentSearch.toLowerCase();
        filteredProducts = filteredProducts.filter(product => 
            product.name.toLowerCase().includes(searchLower) || 
            product.category.toLowerCase().includes(searchLower)
        );
    }
    
    // تصفية حسب السعر
    filteredProducts = filteredProducts.filter(product => 
        product.price <= currentMaxPrice
    );
    
    // تصفية حسب المقاس
    if (currentSizes.length > 0) {
        filteredProducts = filteredProducts.filter(product => 
            currentSizes.some(size => product.sizes.includes(size))
        );
    }
    
    // ترتيب النتائج
    if (currentSort !== 'default') {
        switch(currentSort) {
            case 'price-asc':
                filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'name-asc':
                filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
        }
    }
    
    // تحديث عدد المنتجات
    updateProductCount();
    
    // تحديث علامات الفلترة
    updateFilterTags();
    
    return filteredProducts;
}

// تحديث عدد المنتجات المعروضة
function updateProductCount() {
    const countElement = document.getElementById('products-count');
    if (countElement) {
        countElement.textContent = `عدد المنتجات: ${filteredProducts.length}`;
    }
}

// تحديث علامات الفلترة المعروضة
function updateFilterTags() {
    const tagsContainer = document.getElementById('filter-tags');
    if (!tagsContainer) return;
    
    tagsContainer.innerHTML = '';
    let hasTags = false;
    
    // إضافة علامة الفئة
    if (currentCategory !== 'all') {
        addFilterTag(tagsContainer, `الفئة: ${currentCategory}`, () => {
            currentCategory = 'all';
            // إعادة تنشيط رابط "الكل" في التصنيفات
            const categoryLinks = document.querySelectorAll('.categories a');
            categoryLinks.forEach(link => {
                link.classList.remove('active');
                if (link.dataset.category === 'all') {
                    link.classList.add('active');
                }
            });
            displayProducts();
        });
        hasTags = true;
    }
    
    // إضافة علامة البحث
    if (currentSearch) {
        addFilterTag(tagsContainer, `بحث: ${currentSearch}`, () => {
            currentSearch = '';
            document.getElementById('search-input').value = '';
            displayProducts();
        });
        hasTags = true;
    }
    
    // إضافة علامة السعر
    if (currentMaxPrice < 1000) {
        addFilterTag(tagsContainer, `السعر: حتى ${currentMaxPrice} جنيه`, () => {
            currentMaxPrice = 1000;
            document.getElementById('price-range').value = 1000;
            document.getElementById('price-value').textContent = '1000 جنيه';
            displayProducts();
        });
        hasTags = true;
    }
    
    // إضافة علامات المقاسات
    if (currentSizes.length > 0) {
        currentSizes.forEach(size => {
            addFilterTag(tagsContainer, `المقاس: ${size}`, () => {
                currentSizes = currentSizes.filter(s => s !== size);
                // إزالة التنشيط من زر المقاس
                const sizeButtons = document.querySelectorAll('.size-filter-btn');
                sizeButtons.forEach(btn => {
                    if (btn.dataset.size === size) {
                        btn.classList.remove('active');
                    }
                });
                displayProducts();
            });
        });
        hasTags = true;
    }
    
    // إضافة علامة الترتيب
    if (currentSort !== 'default') {
        let sortText = '';
        switch(currentSort) {
            case 'price-asc': sortText = 'السعر: من الأقل للأعلى'; break;
            case 'price-desc': sortText = 'السعر: من الأعلى للأقل'; break;
            case 'name-asc': sortText = 'الاسم: أ-ي'; break;
        }
        
        addFilterTag(tagsContainer, `ترتيب حسب: ${sortText}`, () => {
            currentSort = 'default';
            document.getElementById('sort-select').value = 'default';
            displayProducts();
        });
        hasTags = true;
    }
    
    // إظهار أو إخفاء قسم العلامات
    tagsContainer.style.display = hasTags ? 'flex' : 'none';
}

// إضافة علامة فلترة
function addFilterTag(container, text, onRemove) {
    const tag = document.createElement('div');
    tag.className = 'filter-tag';
    tag.innerHTML = `
        ${text}
        <span class="remove-tag">×</span>
    `;
    
    const removeBtn = tag.querySelector('.remove-tag');
    removeBtn.addEventListener('click', onRemove);
    
    container.appendChild(tag);
}

// عرض المنتجات حسب الفلترة المحددة
function displayProducts() {
    const productsContainer = document.getElementById('products-container');
    productsContainer.innerHTML = '';
    
    // تطبيق الفلترة
    applyFilters();
    
    if (filteredProducts.length === 0) {
        productsContainer.innerHTML = `
            <div class="empty-category">
                <p>لا توجد منتجات تطابق معايير البحث والتصفية.</p>
            </div>
        `;
        return;
    }
    
    // إنشاء بطاقة لكل منتج
    filteredProducts.forEach(product => {
        // الحصول على الصورة الأولى من ألوان المنتج
        const firstColorKey = Object.keys(product.colors)[0];
        const firstImage = product.colors[firstColorKey];
        
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${firstImage}" alt="${product.name}">
            </div>
            <div class="product-info">
                <div class="product-title">${product.name}</div>
                <div class="product-category">${product.category}</div>
                <div class="product-price">${product.price} جنيه</div>
                <div class="product-actions">
                    <button class="btn primary-btn view-details-btn" data-id="${product.id}">عرض التفاصيل</button>
                </div>
            </div>
        `;
        
        productsContainer.appendChild(productCard);
        
        // إضافة حدث النقر لعرض التفاصيل
        const viewDetailsBtn = productCard.querySelector('.view-details-btn');
        viewDetailsBtn.addEventListener('click', () => openProductDetails(product.id));
    });
}

// فتح تفاصيل المنتج
function openProductDetails(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const productDetailOverlay = document.getElementById('product-detail');
    const productDetailContent = document.getElementById('product-detail-content');
    
    // الحصول على أول لون ومفتاحه
    const firstColorKey = Object.keys(product.colors)[0];
    const firstImage = product.colors[firstColorKey];
    
    // إنشاء خيارات الألوان
    let colorOptionsHTML = '';
    for (const [colorName, imagePath] of Object.entries(product.colors)) {
        colorOptionsHTML += `
            <div class="color-option ${colorName === firstColorKey ? 'active' : ''}" 
                 data-color="${colorName}" 
                 data-image="${imagePath}" 
                 style="background-color: ${getColorCode(colorName)};">
            </div>
        `;
    }
    
    // إنشاء خيارات المقاسات
    let sizeOptionsHTML = '';
    product.sizes.forEach(size => {
        sizeOptionsHTML += `
            <div class="size-option" data-size="${size}">${size}</div>
        `;
    });
    
    // إنشاء محتوى تفاصيل المنتج
    productDetailContent.innerHTML = `
        <div class="product-detail-image">
            <img src="${firstImage}" alt="${product.name}" id="detail-image">
        </div>
        <div class="product-detail-info">
            <div class="product-detail-title">${product.name}</div>
            <div class="product-detail-category">${product.category}</div>
            <div class="product-detail-price">${product.price} جنيه</div>
                        
            <div class="product-detail-description">
                <h3>وصف المنتج:</h3>
                <p>${product.description || 'لا يوجد وصف متاح لهذا المنتج.'}</p>
            </div>
            <div class="product-colors">
                <h3>اللون:</h3>
                <div class="color-options">
                    ${colorOptionsHTML}
                </div>
            </div>
            
            <div class="product-sizes">
                <h3>المقاس:</h3>
                <div class="size-options">
                    ${sizeOptionsHTML}
                </div>
            </div>
            
            <div class="quantity-selector">
                <label>الكمية:</label>
                <div class="quantity-input">
                    <button class="quantity-btn minus-btn">-</button>
                    <div class="quantity-value">1</div>
                    <button class="quantity-btn plus-btn">+</button>
                </div>
            </div>
            
            <button class="btn primary-btn add-to-cart-btn" data-id="${product.id}">إضافة إلى السلة</button>
            
            <div id="social-share-container"></div>
        </div>
    `;
    
    // عرض التفاصيل
    productDetailOverlay.classList.add('active');
    
    // إضافة أزرار المشاركة الاجتماعية
    setTimeout(() => {
        if (window.shareService) {
            const shareContainer = document.getElementById('social-share-container');
            if (shareContainer) {
                shareContainer.innerHTML = window.shareService.createShareButtons(product, firstColorKey);
                console.log("تم إضافة أزرار المشاركة الاجتماعية للمنتج: " + product.name);
            }
        }
    }, 100);
    
    // تحديد المتغيرات وإضافة الأحداث
    const detailImage = document.getElementById('detail-image');
    const colorOptions = productDetailContent.querySelectorAll('.color-option');
    const sizeOptions = productDetailContent.querySelectorAll('.size-option');
    const minusBtn = productDetailContent.querySelector('.minus-btn');
    const plusBtn = productDetailContent.querySelector('.plus-btn');
    const quantityValue = productDetailContent.querySelector('.quantity-value');
    const addToCartBtn = productDetailContent.querySelector('.add-to-cart-btn');
    
    // تحديد اللون الافتراضي والمقاس الافتراضي
    let selectedColor = firstColorKey;
    let selectedSize = product.sizes[0];
    let selectedQuantity = 1;
    
    // إضافة أحداث للألوان
    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            // إزالة الصنف النشط من جميع الخيارات
            colorOptions.forEach(opt => opt.classList.remove('active'));
            // إضافة الصنف النشط للخيار المحدد
            option.classList.add('active');
            // تحديث اللون المحدد والصورة
            selectedColor = option.dataset.color;
            detailImage.src = option.dataset.image;
            
            // تحديث أزرار المشاركة لعكس اللون الجديد
            if (window.shareService) {
                const shareContainer = document.getElementById('social-share-container');
                if (shareContainer) {
                    // تحديث محتوى حاوية المشاركة
                    const newShareHtml = window.shareService.createShareButtons(product, selectedColor);
                    shareContainer.innerHTML = newShareHtml;
                    console.log("تم تحديث أزرار المشاركة للون: " + selectedColor);
                }
            }
        });
    });
    
    // إضافة أحداث للمقاسات
    sizeOptions.forEach(option => {
        option.addEventListener('click', () => {
            // إزالة الصنف النشط من جميع الخيارات
            sizeOptions.forEach(opt => opt.classList.remove('active'));
            // إضافة الصنف النشط للخيار المحدد
            option.classList.add('active');
            // تحديث المقاس المحدد
            selectedSize = option.dataset.size;
        });
    });
    
    // التحديد الافتراضي للمقاس الأول
    sizeOptions[0].classList.add('active');
    
    // إضافة أحداث لأزرار الكمية
    minusBtn.addEventListener('click', () => {
        if (selectedQuantity > 1) {
            selectedQuantity--;
            quantityValue.textContent = selectedQuantity;
        }
    });
    
    plusBtn.addEventListener('click', () => {
        selectedQuantity++;
        quantityValue.textContent = selectedQuantity;
    });
    
    // إضافة حدث لزر "إضافة إلى السلة"
    addToCartBtn.addEventListener('click', () => {
        addToCart(product, selectedColor, selectedSize, selectedQuantity);
        closeProductDetails();
    });
}

// إغلاق تفاصيل المنتج
function closeProductDetails() {
    const productDetailOverlay = document.getElementById('product-detail');
    productDetailOverlay.classList.remove('active');
}

// إضافة منتج إلى السلة
function addToCart(product, color, size, quantity) {
    // البحث عن نفس المنتج بنفس اللون والمقاس
    const existingItemIndex = cartItems.findIndex(item => 
        item.id === product.id && item.color === color && item.size === size
    );
    
    if (existingItemIndex !== -1) {
        // إذا وجد، زيادة الكمية فقط
        cartItems[existingItemIndex].quantity += quantity;
    } else {
        // إذا لم يوجد، إضافة عنصر جديد
        cartItems.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.colors[color],
            color: color,
            size: size,
            quantity: quantity
        });
    }
    
    // تحديث التخزين المحلي وعدد عناصر السلة
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    updateCartCount();
    
    // إظهار رسالة نجاح
    alert(`تمت إضافة ${product.name} إلى سلة التسوق!`);
}

// تحويل اسم اللون إلى كود لون CSS
function getColorCode(colorName) {
    const colorMap = {
        'أسود': '#000000',
        'أبيض': '#FFFFFF',
        'أزرق': '#0000FF',
        'أزرق غامق': '#000080',
        'أزرق فاتح': '#ADD8E6',
        'أزرق سماوي': '#87CEEB',
        'أحمر': '#FF0000',
        'أخضر': '#008000',
        'أصفر': '#FFFF00',
        'برتقالي': '#FFA500',
        'وردي': '#FFC0CB',
        'بنفسجي': '#800080',
        'رمادي': '#808080',
        'بني': '#A52A2A',
        'ذهبي': '#FFD700',
        'فضي': '#C0C0C0'
    };
    
    return colorMap[colorName] || '#CCCCCC'; // لون افتراضي إذا لم يتم العثور على اللون
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
        themeToggleInput.checked = (currentTheme === 'light'); // معكوس: عندما light=شمس مضاءة (checked)، و dark=قمر مظلم (!checked)
    }
}

// عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    // تطبيق السمة المحفوظة
    setTheme(currentTheme);
    
    // تحميل المنتجات
    fetchProducts();
    
    // تحديث عدد عناصر السلة
    updateCartCount();
    
    // إعداد زر التبديل الجديد
    const themeToggleInput = document.getElementById('theme-toggle-input');
    if (themeToggleInput) {
        // تعيين الحالة الأولية للزر (معكوس: عندما light=شمس مضاءة، و dark=قمر مظلم)
        themeToggleInput.checked = (currentTheme === 'light');
        
        // إضافة حدث للاستجابة للتغيير (معكوس: عندما الزر checked=شمس=وضع نهاري)
        themeToggleInput.addEventListener('change', () => {
            if (themeToggleInput.checked) {
                setTheme('light');
            } else {
                setTheme('dark');
            }
        });
    }
    
    // إضافة أحداث للبحث
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    
    if (searchInput && searchBtn) {
        // البحث عند الضغط على زر البحث
        searchBtn.addEventListener('click', () => {
            currentSearch = searchInput.value.trim();
            displayProducts();
        });
        
        // البحث عند الضغط على زر Enter
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                currentSearch = searchInput.value.trim();
                displayProducts();
            }
        });
    }
    
    // إضافة أحداث لشريط تحديد السعر
    const priceRange = document.getElementById('price-range');
    const priceValue = document.getElementById('price-value');
    
    if (priceRange && priceValue) {
        priceRange.addEventListener('input', () => {
            const value = priceRange.value;
            priceValue.textContent = `${value} جنيه`;
            currentMaxPrice = parseInt(value);
            displayProducts();
        });
    }
    
    // إضافة أحداث لأزرار المقاسات
    const sizeButtons = document.querySelectorAll('.size-filter-btn');
    
    sizeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const size = btn.dataset.size;
            
            // تبديل حالة التنشيط للزر
            btn.classList.toggle('active');
            
            // تحديث قائمة المقاسات المحددة
            if (btn.classList.contains('active')) {
                if (!currentSizes.includes(size)) {
                    currentSizes.push(size);
                }
            } else {
                currentSizes = currentSizes.filter(s => s !== size);
            }
            
            displayProducts();
        });
    });
    
    // إضافة حدث لقائمة الترتيب
    const sortSelect = document.getElementById('sort-select');
    
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            currentSort = sortSelect.value;
            displayProducts();
        });
    }
    
    // إضافة حدث لزر إعادة ضبط التصفية
    const resetFiltersBtn = document.getElementById('reset-filters-btn');
    
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', () => {
            // إعادة ضبط جميع متغيرات التصفية
            currentSearch = '';
            currentMaxPrice = 1000;
            currentSizes = [];
            currentSort = 'default';
            
            // إعادة ضبط واجهة المستخدم
            if (searchInput) searchInput.value = '';
            if (priceRange) {
                priceRange.value = 1000;
                priceValue.textContent = '1000 جنيه';
            }
            
            // إزالة التنشيط من أزرار المقاسات
            sizeButtons.forEach(btn => btn.classList.remove('active'));
            
            // إعادة ضبط قائمة الترتيب
            if (sortSelect) sortSelect.value = 'default';
            
            displayProducts();
        });
    }
    
    // إضافة أحداث لأزرار الفئات
    const categoryLinks = document.querySelectorAll('.categories a');
    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            // إزالة الصنف النشط من جميع الروابط
            categoryLinks.forEach(l => l.classList.remove('active'));
            // إضافة الصنف النشط للرابط المحدد
            link.classList.add('active');
            // تحديث الفئة الحالية وعرض المنتجات
            currentCategory = link.dataset.category;
            displayProducts();
        });
    });
    
    // إضافة حدث لزر إغلاق التفاصيل
    const closeDetailBtn = document.getElementById('close-detail');
    if (closeDetailBtn) {
        closeDetailBtn.addEventListener('click', closeProductDetails);
    }
    
    // إغلاق التفاصيل عند النقر خارج المحتوى
    const productDetailOverlay = document.getElementById('product-detail');
    if (productDetailOverlay) {
        productDetailOverlay.addEventListener('click', (e) => {
            if (e.target === productDetailOverlay) {
                closeProductDetails();
            }
        });
    }
});