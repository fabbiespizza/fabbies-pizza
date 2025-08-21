// DOM Elements
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const navLinks = document.getElementById('nav-links');
const cartBtn = document.getElementById('cart-btn');
const cartSidebar = document.getElementById('cart-sidebar');
const closeCartBtn = document.getElementById('close-cart');
const cartCount = document.getElementById('cart-count');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const checkoutModal = document.getElementById('checkout-modal');
const closeCheckout = document.getElementById('close-checkout');
const confirmationModal = document.getElementById('confirmation-modal');
const closeConfirmation = document.getElementById('close-confirmation');
const categoryBtns = document.querySelectorAll('.category-btn');
const menuItems = document.querySelectorAll('.menu-item');
const checkoutForm = document.getElementById('checkout-form');
const orderIdElement = document.getElementById('order-id');
const paymentMethodElement = document.getElementById('payment-method');

// Cart Data
let cart = [];
const LOCAL_STORAGE_CART_KEY = 'fabbies_cart_v1';

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    initSlideshow();
    window.addEventListener('scroll', handleScroll);
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    restoreCartFromStorage();
    initCart();
    initMenuFilter();
    initEmailJS();
});

// Hero Slideshow
function initSlideshow() {
    const slides = document.querySelectorAll('.hero-slide');
    let currentSlide = 0;
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        slides[index].classList.add('active');
    }
    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }
    showSlide(0);
    if (!prefersReducedMotion) {
        setInterval(nextSlide, 5000);
    }
}

// Scroll Header Effect
function handleScroll() {
    const header = document.getElementById('header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
}

// Mobile Menu Toggle
function toggleMobileMenu() {
    navLinks.classList.toggle('active');
    const isOpen = navLinks.classList.contains('active');
    mobileMenuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    mobileMenuBtn.innerHTML = isOpen ? 
        '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
}

// Cart Functionality
function initCart() {
    // Toggle cart sidebar
    cartBtn.addEventListener('click', () => {
        cartSidebar.classList.add('active');
        document.documentElement.classList.add('ui-overlay-open');
        updateCartDisplay();
    });
    closeCartBtn.addEventListener('click', () => {
        cartSidebar.classList.remove('active');
        document.documentElement.classList.remove('ui-overlay-open');
    });

    // Add to cart buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function () {
            const itemName = this.getAttribute('data-item');
            let itemElement = this.closest('.menu-item') || this.closest('.offer-card');
            if (!itemElement) return;
            const sizeSelector = itemElement.querySelector('.size-selector');
            const selectedSize = sizeSelector ? sizeSelector.value : null;
            const selectedSizeText = sizeSelector ? sizeSelector.options[sizeSelector.selectedIndex]?.text : null;
            let price = parseFloat(this.getAttribute('data-price'));

            if (selectedSize && itemElement.querySelector('.price-size')) {
                const priceSpans = itemElement.querySelectorAll('.price-size .item-price');
                let priceText = '';
                for (let span of priceSpans) {
                    const text = span.textContent.trim();
                    if (text.toLowerCase().includes(selectedSizeText?.toLowerCase())) {
                        priceText = text;
                        break;
                    }
                }
                const extractedPrice = priceText.match(/[\d,]+(\.\d+)?/);
                price = extractedPrice ? parseFloat(extractedPrice[0].replace(',', '')) : 0;
            }

            const displayName = selectedSizeText ? `${itemName} (${selectedSizeText})` : itemName;
            const imageElement = itemElement.querySelector('img');
            const imageSrc = imageElement ? imageElement.src : '';

            const existingItemIndex = cart.findIndex(item => item.name === displayName);
            if (existingItemIndex >= 0) {
                cart[existingItemIndex].quantity += 1;
            } else {
                cart.push({
                    name: displayName,
                    price: price,
                    quantity: 1,
                    size: selectedSize,
                    image: imageSrc
                });
            }
            updateCartCount();
            saveCartToStorage();
            showCartNotification();
        });
    });

    // Checkout button
    checkoutBtn.addEventListener('click', function() {
        if (cart.length === 0) {
            showToast('Your cart is empty!', 'error');
            return;
        }
        cartSidebar.classList.remove('active');
        checkoutModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        document.documentElement.classList.add('ui-overlay-open');
    });

    // Close modals
    closeCheckout.addEventListener('click', function() {
        checkoutModal.classList.remove('active');
        document.body.style.overflow = '';
        document.documentElement.classList.remove('ui-overlay-open');
    });
    closeConfirmation.addEventListener('click', function() {
        confirmationModal.classList.remove('active');
        document.body.style.overflow = '';
        document.documentElement.classList.remove('ui-overlay-open');
    });

    window.addEventListener('click', function(e) {
        if (e.target === checkoutModal) {
            checkoutModal.classList.remove('active');
            document.body.style.overflow = '';
            document.documentElement.classList.remove('ui-overlay-open');
        }
        if (e.target === confirmationModal) {
            confirmationModal.classList.remove('active');
            document.body.style.overflow = '';
            document.documentElement.classList.remove('ui-overlay-open');
        }
    });

    // Form submission
    checkoutForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Enhanced validation for all devices
        const nameVal = document.getElementById('checkout-name').value.trim();
        const emailVal = document.getElementById('checkout-email').value.trim();
        const phoneVal = document.getElementById('checkout-phone').value.trim();
        const addressVal = document.getElementById('checkout-address').value.trim();

        // Enhanced validation patterns
        const emailValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(emailVal);
        const phoneValid = /^[\+]?[0-9\s\-\(\)]{9,15}$/.test(phoneVal);
        const nameValid = /^[a-zA-Z\s]{3,50}$/.test(nameVal);

        // Validation with better error messages
        if (!nameValid || nameVal.length < 3) { 
            showToast('Please enter a valid full name', 'error'); 
            document.getElementById('checkout-name').focus();
            return; 
        }
        
        if (!emailValid) { 
            showToast('Please enter a valid email address (e.g., user@example.com).', 'error'); 
            document.getElementById('checkout-email').focus();
            return; 
        }
        
        if (!phoneValid) { 
            showToast('Please enter a valid phone number', 'error'); 
            document.getElementById('checkout-phone').focus();
            return; 
        }
        
        if (addressVal.length < 15) { 
            showToast('Please enter a complete delivery address ', 'error'); 
            document.getElementById('checkout-address').focus();
            return; 
        }

        const orderId = Math.floor(Math.random() * 90000) + 10000;
        const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
        const paymentMethodText = {
            'jazzcash': 'JazzCash',
            'easypaisa': 'EasyPaisa',
            'card': 'Credit/Debit Card',
            'cod': 'Cash on Delivery'
        }[paymentMethod];

        const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const deliveryFee = 99;
        const totalCost = subtotal + deliveryFee;

        const templateParams = {
            to_email: emailVal,
            to_name: nameVal,
            order_id: orderId,
            phone: phoneVal,
            address: addressVal,
            payment_method: paymentMethodText,
            orders: cart.map(item => ({
                name: item.name,
                units: item.quantity,
                price: (item.price * item.quantity).toFixed(2)
            })),
            cost: {
                subtotal: subtotal.toFixed(2),
                delivery: deliveryFee.toFixed(2),
                total: totalCost.toFixed(2)
            }
        };

        // Show loading state
        const submitBtn = this.querySelector('.confirm-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = 'Sending...';
        submitBtn.disabled = true;

        // Send email
        if (window.emailjs && typeof emailjs.send === 'function') {
            emailjs.send('service_mqnhy5n', 'template_w6wpil4', templateParams)
            .then(() => {
                console.log('✅ Order email sent!');
                showToast('Order confirmed! Check your email for details.', 'success');
            })
            .catch(err => {
                console.error('❌ EmailJS Error:', err);
                showToast('Order placed, but email failed. We will contact you shortly.', 'error');
            })
            .finally(() => {
                // Show confirmation
                orderIdElement.textContent = orderId;
                paymentMethodElement.textContent = paymentMethodText;
                checkoutModal.classList.remove('active');
                confirmationModal.classList.add('active');
                document.body.style.overflow = 'hidden';
                document.documentElement.classList.add('ui-overlay-open');

                // Reset cart
                cart = [];
                updateCartCount();
                updateCartDisplay();
                saveCartToStorage();
                checkoutForm.reset();
                
                // Reset button
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                // Move focus for accessibility
                closeConfirmation.focus();
            });
        } else {
            // Fallback if EmailJS not available
            console.warn('EmailJS not loaded; proceeding without email.');
            orderIdElement.textContent = orderId;
            paymentMethodElement.textContent = paymentMethodText;
            checkoutModal.classList.remove('active');
            confirmationModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            document.documentElement.classList.add('ui-overlay-open');
            cart = [];
            updateCartCount();
            updateCartDisplay();
            saveCartToStorage();
            checkoutForm.reset();
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            closeConfirmation.focus();
        }
    });
}

// Update cart count
function updateCartCount() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
}

// Update cart display
function updateCartDisplay() {
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #777;">
                <i class="fas fa-shopping-cart" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>Your cart is empty</p>
            </div>
        `;
        cartTotal.textContent = '0';
        return;
    }
    cartItemsContainer.innerHTML = '';
    let total = 0;
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-details">
                <h4 class="cart-item-title">${item.name}</h4>
                <div class="cart-item-qty-row">
                    <button class="cart-qty-btn cart-qty-minus" data-index="${index}" aria-label="Decrease quantity"><i class="fas fa-minus"></i></button>
                    <span class="cart-item-qty">${item.quantity}</span>
                    <button class="cart-qty-btn cart-qty-plus" data-index="${index}" aria-label="Increase quantity"><i class="fas fa-plus"></i></button>
                </div>
                <p class="cart-item-price">Rs. ${(item.price * item.quantity).toFixed(2)}</p>
                <div class="cart-item-actions">
                    <button class="remove-item" data-index="${index}">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            </div>
        `;
        cartItemsContainer.appendChild(itemElement);
        // Remove item
        itemElement.querySelector('.remove-item').addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            cart.splice(index, 1);
            updateCartDisplay();
            updateCartCount();
            saveCartToStorage();
        });
        // Quantity minus
        itemElement.querySelector('.cart-qty-minus').addEventListener('click', function() {
            const idx = parseInt(this.getAttribute('data-index'));
            if (cart[idx].quantity > 1) {
                cart[idx].quantity -= 1;
            } else {
                cart.splice(idx, 1);
            }
            updateCartDisplay();
            updateCartCount();
            saveCartToStorage();
        });
        // Quantity plus
        itemElement.querySelector('.cart-qty-plus').addEventListener('click', function() {
            const idx = parseInt(this.getAttribute('data-index'));
            cart[idx].quantity += 1;
            updateCartDisplay();
            updateCartCount();
            saveCartToStorage();
        });
    });
    cartTotal.textContent = total.toFixed(2);
}

// Show notification
function showCartNotification() {
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = 'var(--success)';
    notification.style.color = 'white';
    notification.style.padding = '15px 25px';
    notification.style.borderRadius = '5px';
    notification.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
    notification.style.zIndex = '1000';
    notification.style.display = 'flex';
    notification.style.alignItems = 'center';
    notification.style.gap = '10px';
    notification.innerHTML = `
        <i class="fas fa-check-circle" style="font-size: 1.2rem;"></i>
        <span>Item added to cart!</span>
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// Generic toast - Mobile optimized
function showToast(message, type = 'info') {
    // Remove any existing toasts first
    const existingToasts = document.querySelectorAll('.toast-notification');
    existingToasts.forEach(toast => toast.remove());
    
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    
    // Set colors based on type
    let bgColor, icon;
    switch(type) {
        case 'error':
            bgColor = '#e53935';
            icon = '❌';
            break;
        case 'success':
            bgColor = 'var(--success)';
            icon = '✅';
            break;
        case 'warning':
            bgColor = '#ff9800';
            icon = '⚠️';
            break;
        default:
            bgColor = '#333';
            icon = 'ℹ️';
    }
    
    // Mobile-optimized styles
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        right: 20px;
        max-width: 400px;
        margin: 0 auto;
        background-color: ${bgColor};
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 9999;
        font-size: 14px;
        font-weight: 500;
        line-height: 1.4;
        display: flex;
        align-items: center;
        gap: 12px;
        transform: translateY(100px);
        opacity: 0;
        transition: all 0.3s ease;
        word-wrap: break-word;
        overflow-wrap: break-word;
    `;
    
    toast.innerHTML = `
        <span style="font-size: 18px;">${icon}</span>
        <span style="flex: 1;">${message}</span>
        <button onclick="this.parentElement.remove()" style="
            background: none;
            border: none;
            color: white;
            font-size: 18px;
            cursor: pointer;
            padding: 0;
            margin-left: 8px;
            opacity: 0.7;
            transition: opacity 0.2s;
        " onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.7'">×</button>
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    requestAnimationFrame(() => {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
    });
    
    // Auto remove after 4 seconds
    const timeout = setTimeout(() => {
        toast.style.transform = 'translateY(100px)';
        toast.style.opacity = '0';
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 300);
    }, 4000);
    
    // Allow manual close to clear timeout
    toast.querySelector('button').addEventListener('click', () => {
        clearTimeout(timeout);
    });
    
    // Add touch support for mobile
    let touchStartY = 0;
    let touchEndY = 0;
    
    toast.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    toast.addEventListener('touchend', (e) => {
        touchEndY = e.changedTouches[0].clientY;
        const swipeDistance = touchStartY - touchEndY;
        
        // If swiped up more than 50px, dismiss the toast
        if (swipeDistance > 50) {
            clearTimeout(timeout);
            toast.style.transform = 'translateY(-100px)';
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.remove();
                }
            }, 300);
        }
    }, { passive: true });
}

// Persistence helpers
function saveCartToStorage() {
    try {
        localStorage.setItem(LOCAL_STORAGE_CART_KEY, JSON.stringify(cart));
    } catch (e) {
        console.warn('Unable to persist cart:', e);
    }
}

function restoreCartFromStorage() {
    try {
        const raw = localStorage.getItem(LOCAL_STORAGE_CART_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                cart = parsed;
                updateCartCount();
                updateCartDisplay();
            }
        }
    } catch (e) {
        console.warn('Unable to restore cart:', e);
    }
}

// EmailJS init
function initEmailJS() {
    try {
        if (window.emailjs && typeof emailjs.init === 'function') {
            emailjs.init('TrATLnE8FzcvRLEnY');
        }
    } catch (e) {
        console.warn('EmailJS init failed:', e);
    }
}

// Menu Filter
function initMenuFilter() {
    categoryBtns.forEach(button => {
        button.addEventListener('click', function() {
            categoryBtns.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            const category = this.getAttribute('data-category');
            menuItems.forEach(item => {
                if (category === 'all' || item.getAttribute('data-category') === category) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
}
