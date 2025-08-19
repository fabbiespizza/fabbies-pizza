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
// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Initialize hero slideshow
    initSlideshow();
    // Initialize scroll header effect
    window.addEventListener('scroll', handleScroll);
    // Initialize mobile menu
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    // Initialize cart functionality
    initCart();
    // Initialize menu filtering
    initMenuFilter();
});
// Hero Slideshow
function initSlideshow() {
    const slides = document.querySelectorAll('.hero-slide');
    let currentSlide = 0;
    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        slides[index].classList.add('active');
    }
    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }
    // Start slideshow
    showSlide(0);
    setInterval(nextSlide, 5000);
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
    mobileMenuBtn.innerHTML = navLinks.classList.contains('active') ? 
        '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
}
// Cart Functionality
function initCart() {
    // Toggle cart sidebar
    cartBtn.addEventListener('click', () => {
        cartSidebar.classList.add('active');
        updateCartDisplay();
    });
    closeCartBtn.addEventListener('click', () => {
        cartSidebar.classList.remove('active');
    });
// Add to cart buttons - FIXED VERSION
document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', function () {
        const itemName = this.getAttribute('data-item');
        let itemElement = this.closest('.menu-item') || this.closest('.offer-card');
        if (!itemElement) return;
        const sizeSelector = itemElement.querySelector('.size-selector');
        const selectedSize = sizeSelector ? sizeSelector.value : null;
        const selectedSizeText = sizeSelector ? sizeSelector.options[sizeSelector.selectedIndex].text : null;
        // Default price for non-size items (e.g., burgers)
        let price = parseFloat(this.getAttribute('data-price'));
        // If it's a size-based item (like pizza), extract price from .price-size span
        if (selectedSize && itemElement.querySelector('.price-size')) {
            const priceSpans = itemElement.querySelectorAll('.price-size .item-price');
            let priceText = '';
            for (let span of priceSpans) {
                const text = span.textContent.trim();
                if (text.toLowerCase().includes(selectedSizeText.toLowerCase())) {
                    priceText = text;
                    break;
                }
            }
            // Extract number: e.g., "Medium: Rs. 1200" → 1200
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
        showCartNotification();
    });
});
    // Checkout button
    checkoutBtn.addEventListener('click', function() {
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        cartSidebar.classList.remove('active');
        checkoutModal.classList.add('active');
    });
    // Close modals
    closeCheckout.addEventListener('click', function() {
        checkoutModal.classList.remove('active');
    });
    closeConfirmation.addEventListener('click', function() {
        confirmationModal.classList.remove('active');
    });
    window.addEventListener('click', function(e) {
        if (e.target === checkoutModal) {
            checkoutModal.classList.remove('active');
        }
        if (e.target === confirmationModal) {
            confirmationModal.classList.remove('active');
        }
    });
    // Form submission
    checkoutForm.addEventListener('submit', function(e) {
        e.preventDefault();
        // Generate random order ID
        const orderId = Math.floor(Math.random() * 90000) + 10000;
        // Get selected payment method
        const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
        const paymentMethodText = {
            'jazzcash': 'JazzCash',
            'easypaisa': 'EasyPaisa',
            'card': 'Credit/Debit Card',
            'cod': 'Cash on Delivery'
        }[paymentMethod];
        // Prepare order data for EmailJS
const templateParams = {
    to_email: document.getElementById('checkout-email').value,
    to_name: document.getElementById('checkout-name').value,
    order_id: orderId,
    phone: document.getElementById('checkout-phone').value,
    address: document.getElementById('checkout-address').value,
    payment_method: paymentMethodText,
    items: cart.map(item => `${item.name} x ${item.quantity}`).join('<br>'),
    total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
};

// Send email via EmailJS
emailjs.send('service_mqnhy5n', 'template_w6wpil4', templateParams)
    .then(() => {
        console.log('✅ Order email sent successfully!');
    })
    .catch(err => {
        console.log('❌ EmailJS Error:', err);
    });

// Show confirmation
orderIdElement.textContent = orderId;
paymentMethodElement.textContent = paymentMethodText;
checkoutModal.classList.remove('show');
confirmationModal.classList.add('show');

// Reset cart
cart = [];
updateCartCount();
updateCartDisplay();
checkoutForm.reset();
        // In a real app, you would send the order data to your backend here
        const orderData = {
            customer: {
                name: document.getElementById('checkout-name').value,
                phone: document.getElementById('checkout-phone').value,
                address: document.getElementById('checkout-address').value
            },
            paymentMethod: paymentMethod,
            items: cart,
            total: cart.reduce((total, item) => total + (item.price * item.quantity), 0),
            orderId: orderId
        };
        console.log('Order placed:', orderData);
        // Reset cart
        cart = [];
        updateCartCount();
        updateCartDisplay();
        // Reset form
        checkoutForm.reset();
    });
}
// Update cart count display
function updateCartCount() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
}
// Update cart items display
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
                <p class="cart-item-price">Rs. ${item.price} x ${item.quantity}</p>
                <div class="cart-item-actions">
                    <button class="remove-item" data-index="${index}">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            </div>
        `;
        cartItemsContainer.appendChild(itemElement);
        // Add event listener to remove button
        itemElement.querySelector('.remove-item').addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            cart.splice(index, 1);
            updateCartDisplay();
            updateCartCount();
        });
    });
    cartTotal.textContent = total.toFixed(2);
}
// Show notification when item added to cart
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
// Menu Filter Functionality
function initMenuFilter() {
    categoryBtns.forEach(button => {
        button.addEventListener('click', function() {
            // Update active button
            categoryBtns.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            const category = this.getAttribute('data-category');
            // Filter menu items
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
// Checkout Modal open
document.getElementById('checkout-btn').addEventListener('click', () => {
    document.getElementById('checkout-modal').classList.add('show');
    document.body.style.overflow = 'hidden'; // prevent background scroll
});
// Checkout Modal close
document.getElementById('close-checkout').addEventListener('click', () => {
    document.getElementById('checkout-modal').classList.remove('show');
    document.body.style.overflow = ''; // restore scroll
});
// Confirmation Modal close (optional handling)
document.getElementById('close-confirmation').addEventListener('click', () => {
    document.getElementById('confirmation-modal').classList.remove('show');
    document.body.style.overflow = '';

});
