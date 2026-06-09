// ==========================================
// 0. Firebase Setup & Initialization
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { 
    getFirestore, 
    collection, 
    addDoc, 
    serverTimestamp,
    query,
    where,
    getDocs,
    onSnapshot,
    orderBy,
    doc,
    deleteDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCm_Q4TXyaoV46HkmnmwFmR71UccOKIxmc",
  authDomain: "shopnest-1f3bc.firebaseapp.com",
  projectId: "shopnest-1f3bc",
  storageBucket: "shopnest-1f3bc.firebasestorage.app",
  messagingSenderId: "167119449832",
  appId: "1:167119449832:web:db9a71363bc7de5bf0635d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); 

// ==========================================
// 1. Theme Toggle System (Dark / Light Mode)
// ==========================================
const themeToggleBtn = document.getElementById('themeToggle');
const htmlElement = document.documentElement;

const savedTheme = localStorage.getItem('shopnest_theme');
if (savedTheme) {
    htmlElement.setAttribute('data-theme', savedTheme);
    if(themeToggleBtn) themeToggleBtn.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
}

if(themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('shopnest_theme', newTheme);
        themeToggleBtn.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    });
}

// ==========================================
// 2. Flash Sale Countdown Timer
// ==========================================
const countdownElement = document.getElementById('countdown');

if(countdownElement) {
    let totalSeconds = (2 * 3600) + (45 * 60) + 30; 

    const timerInterval = setInterval(() => {
        if (totalSeconds <= 0) {
            clearInterval(timerInterval);
            countdownElement.textContent = "Sale Ended!";
            return;
        }
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const formattedHours = String(hours).padStart(2, '0');
        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(seconds).padStart(2, '0');

        countdownElement.textContent = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
        totalSeconds--;
    }, 1000);
}

// ==========================================
// 3. Toast Notification System
// ==========================================
const toastElement = document.createElement('div');
toastElement.className = 'toast';
document.body.appendChild(toastElement);

function showToast(message) {
    toastElement.textContent = message;
    toastElement.classList.add('show');
    setTimeout(() => {
        toastElement.classList.remove('show');
    }, 3000);
}

// ==========================================
// 4. Advanced Shopping Cart Logic
// ==========================================
let cart = JSON.parse(localStorage.getItem('shopnest_cart')) || [];
const cartCountElement = document.getElementById('cart-count');
const cartIcon = document.querySelector('.cart-icon');
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const closeCartBtn = document.getElementById('closeCartBtn');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const cartTotalAmount = document.getElementById('cartTotalAmount');

if(cartCountElement) updateCartUI();

if(cartIcon && cartDrawer && cartOverlay) {
    cartIcon.addEventListener('click', () => {
        cartDrawer.classList.add('open');
        cartOverlay.classList.add('active');
    });
}

function closeCart() {
    if(cartDrawer && cartOverlay) {
        cartDrawer.classList.remove('open');
        cartOverlay.classList.remove('active');
    }
}

if(closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
if(cartOverlay) cartOverlay.addEventListener('click', closeCart);

const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
addToCartButtons.forEach(button => {
    button.addEventListener('click', (event) => {
        const productCard = event.target.closest('.product-card');
        const productTitle = productCard.querySelector('.product-title').innerText;
        const productPriceStr = productCard.querySelector('.current-price').innerText;
        const priceValue = parseFloat(productPriceStr.replace('₹', ''));

        const existingProduct = cart.find(item => item.name === productTitle);

        if (existingProduct) {
            existingProduct.quantity += 1;
        } else {
            cart.push({ name: productTitle, price: priceValue, quantity: 1 });
        }
        
        localStorage.setItem('shopnest_cart', JSON.stringify(cart));
        updateCartUI();
        showToast(`${productTitle} added to cart! 🛒`);
    });
});

function updateCartUI() {
    if(!cartCountElement) return;

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountElement.textContent = totalItems;
    
    cartCountElement.style.transform = 'scale(1.5)';
    setTimeout(() => cartCountElement.style.transform = 'scale(1)', 200);

    if(cartItemsContainer) {
        cartItemsContainer.innerHTML = ''; 
        let totalPrice = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p style="text-align:center; color:gray;">Your cart is empty.</p>';
        } else {
            cart.forEach((item, index) => {
                totalPrice += item.price * item.quantity;
                cartItemsContainer.innerHTML += `
                    <div class="cart-item">
                        <div class="cart-item-info">
                            <h4>${item.name}</h4>
                            <p>₹${item.price.toFixed(2)} x ${item.quantity}</p>
                        </div>
                        <button class="remove-item-btn" onclick="removeFromCart(${index})">Remove</button>
                    </div>
                `;
            });
        }
        if(cartTotalAmount) cartTotalAmount.textContent = `₹${totalPrice.toFixed(2)}`;
    }
}

window.removeFromCart = function(index) {
    cart.splice(index, 1);
    localStorage.setItem('shopnest_cart', JSON.stringify(cart));
    updateCartUI();
};

// ==========================================
// 5. Category Filtering System
// ==========================================
const categoryBoxes = document.querySelectorAll('.category-box');

categoryBoxes.forEach(box => {
    box.addEventListener('click', () => {
        categoryBoxes.forEach(b => b.classList.remove('active'));
        box.classList.add('active');

        const selectedCategory = box.getAttribute('data-category').toLowerCase();
        const productCards = document.querySelectorAll('.product-card');

        productCards.forEach(card => {
            const cardCategoryElement = card.querySelector('.category');
            if (!cardCategoryElement) return;

            const cardCategory = cardCategoryElement.innerText.toLowerCase();
            if (selectedCategory === 'all' || cardCategory === selectedCategory) {
                card.style.display = 'block';
                setTimeout(() => card.style.opacity = '1', 50);
            } else {
                card.style.opacity = '0';
                setTimeout(() => card.style.display = 'none', 300);
            }
        });
    });
});

// ==========================================
// 6. Product Details Page Logic
// ==========================================
const mainImage = document.getElementById('mainProductImage');
const thumbnails = document.querySelectorAll('.thumbnail');

if (mainImage && thumbnails) {
    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', function() {
            mainImage.src = this.src;
            thumbnails.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

const btnDecrease = document.getElementById('decreaseQty');
const btnIncrease = document.getElementById('increaseQty');
const qtyInput = document.getElementById('productQty');

if (btnDecrease && btnIncrease && qtyInput) {
    btnDecrease.addEventListener('click', () => {
        if (qtyInput.value > 1) {
            qtyInput.value = parseInt(qtyInput.value) - 1;
        }
    });

    btnIncrease.addEventListener('click', () => {
        qtyInput.value = parseInt(qtyInput.value) + 1;
    });
}

const detailAddToCartBtn = document.getElementById('detailAddToCart');
if (detailAddToCartBtn) {
    detailAddToCartBtn.addEventListener('click', () => {
        const productTitle = document.querySelector('.product-title-large').innerText;
        const productPriceStr = document.getElementById('productPrice').innerText;
        const priceValue = parseFloat(productPriceStr.replace('₹', ''));
        const quantity = parseInt(qtyInput.value);

        const existingProduct = cart.find(item => item.name === productTitle);

        if (existingProduct) {
            existingProduct.quantity += quantity; 
        } else {
            cart.push({ name: productTitle, price: priceValue, quantity: quantity });
        }
        
        localStorage.setItem('shopnest_cart', JSON.stringify(cart));
        updateCartUI();
        showToast(`${quantity} x ${productTitle} added to cart! 🛒`);
    });
}

// ==========================================
// 7. Checkout Page Logic (WITH TELEGRAM API)
// ==========================================
const checkoutItemsContainer = document.getElementById('checkoutItemsContainer');
const checkoutSubtotal = document.getElementById('checkoutSubtotal');
const checkoutTax = document.getElementById('checkoutTax');
const checkoutTotal = document.getElementById('checkoutTotal');
const checkoutForm = document.getElementById('checkoutForm');

if (checkoutItemsContainer) {
    let subtotal = 0;
    const shippingFee = 50.00;

    if (cart.length === 0) {
        checkoutItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
        const placeOrderBtn = document.getElementById('placeOrderBtn');
        if(placeOrderBtn) placeOrderBtn.disabled = true; 
    } else {
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            
            checkoutItemsContainer.innerHTML += `
                <div class="checkout-item">
                    <div>
                        <h4>${item.name}</h4>
                        <p>Qty: ${item.quantity}</p>
                    </div>
                    <div>
                        <strong>₹${itemTotal.toFixed(2)}</strong>
                    </div>
                </div>
            `;
        });
    }

    const taxAmount = subtotal * 0.05; 
    const grandTotal = subtotal + taxAmount + (subtotal > 0 ? shippingFee : 0);

    if(checkoutSubtotal) checkoutSubtotal.textContent = `₹${subtotal.toFixed(2)}`;
    if(checkoutTax) checkoutTax.textContent = `₹${taxAmount.toFixed(2)}`;
    if(checkoutTotal) checkoutTotal.textContent = `₹${grandTotal.toFixed(2)}`;

    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            
            const submitBtn = document.getElementById('placeOrderBtn');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Processing Order...';

            try {
                const firstName = checkoutForm.querySelector('input[placeholder="Enter your first name"]').value;
                const email = checkoutForm.querySelector('input[type="email"]').value;
                const address = checkoutForm.querySelector('input[placeholder="123 Main Street, Appt 4B"]').value;
                const paymentMethod = checkoutForm.querySelector('input[name="payment"]:checked').value;

                const docRef = await addDoc(collection(db, "orders"), {
                    customerName: firstName,
                    customerEmail: email,
                    shippingAddress: address,
                    paymentMethod: paymentMethod,
                    orderItems: cart, 
                    totalAmount: grandTotal, 
                    orderDate: serverTimestamp(), 
                    status: "Pending" 
                });

                // ==========================================
                // TELEGRAM NOTIFICATION CODE START
                // ==========================================
                const botToken = "8256951370:AAFanXhCPtCuTj2dPuM7ZRB2xav4a1ReVHY"; // <-- আপনার দেওয়া টোকেন
                const chatId = "5537559810";     // <-- আপনার দেওয়া চ্যাট আইডি

                let orderDetails = cart.map(item => `📦 ${item.name} (Qty: ${item.quantity})`).join('\n');
                let telegramMsg = `🎉 *New Order on ShopNest!* 🎉\n\n👤 *Customer:* ${firstName}\n📧 *Email:* ${email}\n🏠 *Address:* ${address}\n💳 *Payment:* ${paymentMethod}\n💰 *Total Amount:* ₹${grandTotal.toFixed(2)}\n\n*Ordered Items:*\n${orderDetails}`;

                try {
                    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            chat_id: chatId,
                            text: telegramMsg,
                            parse_mode: 'Markdown'
                        })
                    });
                    
                    if (!response.ok) {
                        const errorData = await response.json();
                        console.error("Telegram API Error:", errorData);
                    }
                } catch (tgError) {
                    console.error("Failed to send Telegram message:", tgError);
                }
                // ==========================================
                // TELEGRAM NOTIFICATION CODE END
                // ==========================================

                alert('🎉 Order Placed Successfully!\nYour Order ID is: ' + docRef.id);
                
                cart = [];
                localStorage.setItem('shopnest_cart', JSON.stringify(cart));
                window.location.href = 'index.html';
                
            } catch (error) {
                console.error("Error adding document: ", error);
                alert('❌ Error placing order. Please try again.');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Place Order';
            }
        });
    }
}

// ==========================================
// 8. Real Firebase Login & Registration
// ==========================================
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const showRegisterBtn = document.getElementById('showRegister');
const showLoginBtn = document.getElementById('showLogin');

if (loginForm && registerForm) {
    showRegisterBtn.addEventListener('click', () => {
        loginForm.classList.remove('active');
        registerForm.classList.add('active');
    });

    showLoginBtn.addEventListener('click', () => {
        registerForm.classList.remove('active');
        loginForm.classList.add('active');
    });

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = registerForm.querySelector('input[type="email"]').value;
        const password = registerForm.querySelector('input[type="password"]').value;

        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                alert('🎉 Account Created Successfully! Please login.');
                registerForm.reset();
                registerForm.classList.remove('active');
                loginForm.classList.add('active');
            })
            .catch((error) => {
                alert(`❌ Error: ${error.message}`);
            });
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = loginForm.querySelector('input[type="email"]').value;
        const password = loginForm.querySelector('input[type="password"]').value;

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                alert('✅ Login Successful! Welcome back.');
                window.location.href = 'index.html';
            })
            .catch((error) => {
                alert(`❌ Invalid Email or Password!`);
            });
    });
}

// ==========================================
// 9. Auth State Observer & Profile Navigation
// ==========================================
const authLink = document.getElementById('authLink');

onAuthStateChanged(auth, (user) => {
    if (authLink) {
        if (user) {
            authLink.innerHTML = '👤 My Profile';
            authLink.href = 'profile.html'; 
        } else {
            authLink.innerHTML = '👤 Login';
            authLink.href = 'login.html'; 
        }
    }

// ==========================================
// 10. Profile Page Logic (Order History Fetch)
// ==========================================
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const orderListContainer = document.getElementById('orderListContainer');
    const logoutBtn = document.getElementById('logoutBtn');

    if (profileName && profileEmail && orderListContainer) {
        if (user) {
            profileEmail.textContent = user.email;
            profileName.textContent = "Awesome Shopper"; 

            fetchUserOrders(user.email);

            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => {
                    signOut(auth).then(() => {
                        window.location.href = 'index.html'; 
                    });
                });
            }
        } else {
            window.location.href = 'login.html';
        }
    }
});

async function fetchUserOrders(userEmail) {
    const orderListContainer = document.getElementById('orderListContainer');
    
    try {
        const q = query(collection(db, "orders"), where("customerEmail", "==", userEmail));
        const querySnapshot = await getDocs(q);
        
        orderListContainer.innerHTML = ''; 

        if (querySnapshot.empty) {
            orderListContainer.innerHTML = '<p>You have no orders yet. Start shopping!</p>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const orderData = doc.data();
            
            let itemsHtml = '';
            orderData.orderItems.forEach(item => {
                itemsHtml += `<p>✔️ ${item.name} (Qty: ${item.quantity}) - ₹${(item.price * item.quantity).toFixed(2)}</p>`;
            });

            const dateStr = orderData.orderDate ? orderData.orderDate.toDate().toLocaleDateString() : 'Just Now';
            
            orderListContainer.innerHTML += `
                <div class="order-card">
                    <div class="order-header">
                        <div>
                            <strong>Order ID:</strong> #${doc.id.slice(0,8).toUpperCase()}<br>
                            <span class="text-muted">Date: ${dateStr}</span>
                        </div>
                        <div>
                            <span class="order-status">${orderData.status}</span>
                        </div>
                    </div>
                    <div class="order-items-list">
                        ${itemsHtml}
                    </div>
                    <div style="margin-top: 1rem; border-top: 1px solid #ccc; padding-top: 0.5rem;">
                        <strong>Total Paid: ₹${orderData.totalAmount.toFixed(2)}</strong> 
                        <span class="text-muted">(${orderData.paymentMethod.toUpperCase()})</span>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.log("Error fetching orders:", error);
        orderListContainer.innerHTML = '<p style="color:red;">Error loading orders.</p>';
    }
}

// ==========================================
// 11. Admin Panel - Upload, Edit & Delete Product
// ==========================================
const adminProductForm = document.getElementById('adminProductForm');
const adminProductList = document.getElementById('adminProductList');
let editingProductId = null;

if (adminProductForm) {
    adminProductForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const uploadBtn = document.getElementById('uploadBtn');
        uploadBtn.disabled = true;
        uploadBtn.textContent = 'Processing... ⏳';

        try {
            const title = document.getElementById('pTitle').value;
            const category = document.getElementById('pCategory').value;
            const price = parseFloat(document.getElementById('pPrice').value);
            const originalPrice = parseFloat(document.getElementById('pOriginalPrice').value);
            const affiliateLink = document.getElementById('pAffiliateLink').value;

            // ৩টি ছবির লিংক সংগ্রহ করা
            const img1 = document.getElementById('pImage1').value;
            const img2 = document.getElementById('pImage2').value;
            const img3 = document.getElementById('pImage3').value;
            
            // যেগুলো ফাঁকা নয়, সেগুলো দিয়ে একটি Array তৈরি করা
            const imagesArray = [img1, img2, img3].filter(img => img.trim() !== "");

            if (editingProductId) {
                const productRef = doc(db, "products", editingProductId);
                await updateDoc(productRef, {
                    title: title,
                    category: category,
                    price: price,
                    originalPrice: originalPrice,
                    images: imagesArray, // Array হিসেবে সেভ হবে
                    affiliateLink: affiliateLink
                });
                alert('✅ Product Updated Successfully!');
                editingProductId = null;
                document.getElementById('formTitle').innerHTML = '⚙️ Upload New Product';
            } else {
                await addDoc(collection(db, "products"), {
                    title: title,
                    category: category,
                    price: price,
                    originalPrice: originalPrice,
                    images: imagesArray, // Array হিসেবে সেভ হবে
                    affiliateLink: affiliateLink,
                    timestamp: serverTimestamp()
                });
                alert('✅ Product Uploaded Successfully!');
            }

            adminProductForm.reset();
            uploadBtn.textContent = '🚀 Upload Product';
            
        } catch (error) {
            console.error("Error: ", error);
            alert('❌ Error processing request.');
            uploadBtn.textContent = 'Retry';
        } finally {
            uploadBtn.disabled = false;
        }
    });
}

if (adminProductList) {
    const productsQuery = query(collection(db, "products"), orderBy("timestamp", "desc"));
    
    onSnapshot(productsQuery, (snapshot) => {
        adminProductList.innerHTML = ''; 
        if (snapshot.empty) return adminProductList.innerHTML = '<tr><td colspan="3">No products.</td></tr>';

        snapshot.forEach((docSnap) => {
            const product = docSnap.data();
            const productId = docSnap.id;
            
            // পুরানো প্রোডাক্টের ১টি ছবি থাকলে সেটাও যেন সাপোর্ট করে
            const images = product.images || [product.image];
            
            const safeTitle = product.title.replace(/'/g, "\\'");
            const safeLink = product.affiliateLink.replace(/'/g, "\\'");
            const safeImagesJson = encodeURIComponent(JSON.stringify(images));

            adminProductList.innerHTML += `
                <tr>
                    <td><img src="${images[0]}" alt="Img"></td>
                    <td>
                        <strong>${product.title}</strong><br>
                        <span style="color:orange;">₹${product.price}</span>
                    </td>
                    <td>
                        <button class="action-btn edit-btn" onclick="editAdminProduct('${productId}', '${safeTitle}', '${product.category}', ${product.price}, ${product.originalPrice || product.price}, '${safeImagesJson}', '${safeLink}')">✏️ Edit</button>
                        <button class="action-btn delete-btn" onclick="deleteAdminProduct('${productId}')">🗑️ Delete</button>
                    </td>
                </tr>
            `;
        });
    });
}

window.deleteAdminProduct = async function(id) {
    if(confirm("⚠️ Delete this product?")) {
        await deleteDoc(doc(db, "products", id));
        alert("🗑️ Deleted!");
    }
};

window.editAdminProduct = function(id, title, category, price, originalPrice, imagesJson, link) {
    const images = JSON.parse(decodeURIComponent(imagesJson));
    
    document.getElementById('pTitle').value = title;
    document.getElementById('pCategory').value = category;
    document.getElementById('pPrice').value = price;
    document.getElementById('pOriginalPrice').value = originalPrice;
    document.getElementById('pImage1').value = images[0] || '';
    document.getElementById('pImage2').value = images[1] || '';
    document.getElementById('pImage3').value = images[2] || '';
    document.getElementById('pAffiliateLink').value = link;

    editingProductId = id;
    document.getElementById('formTitle').innerHTML = '✏️ Edit Product';
    document.getElementById('uploadBtn').textContent = '💾 Update Product';
    window.scrollTo(0, 0);
};

// ==========================================
// 12. Load Products to Homepage (With Auto Image Slider)
// ==========================================
const featuredProductsGrid = document.getElementById('featuredProducts');

if (featuredProductsGrid) {
    const productsQuery = query(collection(db, "products"), orderBy("timestamp", "desc"));

    onSnapshot(productsQuery, (snapshot) => {
        featuredProductsGrid.innerHTML = ''; 

        snapshot.forEach((doc) => {
            const product = doc.data();
            
            let priceDisplayHtml = `<span class="current-price">₹${product.price}</span>`;
            if (product.originalPrice && product.originalPrice > product.price) {
                const discountPercent = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
                priceDisplayHtml = `
                    <span class="current-price">₹${product.price}</span>
                    <del style="color: #999; margin-left: 8px;">₹${product.originalPrice}</del>
                    <span style="color: #e74c3c; font-size: 0.85em; font-weight: bold; margin-left: 8px; background: #ffebee; padding: 2px 5px; border-radius: 4px;">(${discountPercent}% OFF)</span>
                `;
            }

            // ছবিগুলোকে স্লাইডারের জন্য রেডি করা (পুরানো প্রোডাক্ট থাকলে সেটাও সাপোর্ট করবে)
            let imagesArray = product.images || [product.image];
            let sliderImagesHtml = '';
            
            imagesArray.forEach((img, index) => {
                // প্রথম ছবিটি দেখা যাবে, বাকিগুলো লুকানো থাকবে
                let opacity = index === 0 ? '1' : '0';
                sliderImagesHtml += `<img src="${img}" class="slide-img" style="position:absolute; top:0; left:0; width:100%; height:100%; object-fit:contain; opacity:${opacity}; transition: opacity 0.8s ease-in-out;">`;
            });
            
            featuredProductsGrid.innerHTML += `
                <div class="product-card">
                    <div class="product-image slider-container" style="position: relative;">
                        <a href="${product.affiliateLink}" target="_blank" rel="noopener noreferrer" style="display:block; width:100%; height:100%;">
                            ${sliderImagesHtml}
                        </a>
                    </div>
                    
                    <div class="product-info">
                        <span class="category">${product.category}</span>
                        <h3 class="product-title">
                            <a href="${product.affiliateLink}" target="_blank" style="text-decoration: none; color: inherit;">
                                ${product.title}
                            </a>
                        </h3>
                        <div class="price-box">
                            ${priceDisplayHtml}
                        </div>
                        <a href="${product.affiliateLink}" target="_blank" rel="noopener noreferrer" class="affiliate-btn">
                            🛍️ Buy Now
                        </a>
                        <div class="cashback-section">
                            <span style="color: gray;">Want extra Cashback? </span>
                            <a href="https://whatsapp.com/channel/0029Vb8GOmX5q08bbMNrk32e" target="_blank" style="color: #25D366; font-weight: bold; text-decoration: none;">
                                💬 Join WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            `;
        });
    });
}

// ==========================================
// 13. Auto Image Slider Logic (Runs every 4 seconds)
// ==========================================
setInterval(() => {
    const sliderContainers = document.querySelectorAll('.slider-container');
    
    sliderContainers.forEach(container => {
        const images = container.querySelectorAll('.slide-img');
        
        // যদি একাধিক ছবি থাকে, তবেই স্লাইড হবে
        if (images.length > 1) {
            let activeIndex = -1;
            
            // বর্তমানে কোন ছবিটি দেখা যাচ্ছে (Opacity 1) সেটি খুঁজে বের করা
            images.forEach((img, index) => {
                if (img.style.opacity === '1') {
                    activeIndex = index;
                }
            });
            
            if (activeIndex !== -1) {
                // বর্তমান ছবিটিকে লুকিয়ে ফেলা
                images[activeIndex].style.opacity = '0';
                
                // পরবর্তী ছবিটিকে দেখানো (শেষ ছবিতে গেলে আবার প্রথমে ফিরে আসবে)
                let nextIndex = (activeIndex + 1) % images.length;
                images[nextIndex].style.opacity = '1';
            }
        }
    });
}, 4000);