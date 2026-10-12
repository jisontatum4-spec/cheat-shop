// ─── OWNER CONSTANTS ───────────────────────────────────────────────────────
        const OWNER_EMAIL    = "osje76hwhu72@gmail.com";   // always lowercased for compare
        const OWNER_USERNAME = "OwnerAdmin";
        const OWNER_PASSWORD = "Jaebu027Jshsu0028";
        const OWNER_ROLE     = "owner";
        // ───────────────────────────────────────────────────────────────────────────

        function readStoredArray(key) {
            try {
                const value = JSON.parse(localStorage.getItem(key) || '[]');
                return Array.isArray(value) ? value : [];
            } catch (error) {
                console.warn(`Unable to read ${key}; resetting it.`, error);
                return [];
            }
        }

        function createRecordId(prefix) {
            return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
        }

        function addNotification(recipientEmail, type, title, message, orderId = null, metadata = null) {
            const notifications = readStoredArray('granted_notifications');
            notifications.unshift({
                id: createRecordId('NTF'),
                recipientEmail: String(recipientEmail || '').toLowerCase(),
                type,
                title,
                message,
                orderId,
                metadata,
                read: false,
                createdAt: Date.now()
            });
            localStorage.setItem('granted_notifications', JSON.stringify(notifications.slice(0, 200)));
        }

        function getNotificationsForUser(user) {
            if (!user || !user.email) return [];
            return readStoredArray('granted_notifications')
                .filter(notification => String(notification.recipientEmail || '').toLowerCase() === user.email.toLowerCase())
                .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
        }

        function markNotificationRead(notificationId) {
            const notifications = readStoredArray('granted_notifications');
            const notification = notifications.find(item => item.id === notificationId);
            if (notification) {
                notification.read = true;
                localStorage.setItem('granted_notifications', JSON.stringify(notifications));
            }
        }

        function getActiveUser() {
            try {
                const user = JSON.parse(localStorage.getItem('granted_current_user') || 'null');
                return user && user.email ? user : null;
            } catch (error) {
                return null;
            }
        }

        const MIN_CASH_IN = 100;

        function readStoredBalances() {
            try {
                const value = JSON.parse(localStorage.getItem('granted_balances') || '{}');
                return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
            } catch (error) {
                return {};
            }
        }

        function getUserBalance(user = getActiveUser()) {
            if (!user || !user.email) return 0;
            const balances = readStoredBalances();
            const amount = Number(balances[String(user.email).toLowerCase()] || 0);
            return Number.isFinite(amount) && amount > 0 ? amount : 0;
        }

        function setUserBalance(email, amount) {
            const balances = readStoredBalances();
            balances[String(email || '').toLowerCase()] = Math.max(0, Number(amount) || 0);
            localStorage.setItem('granted_balances', JSON.stringify(balances));
            refreshBalanceUI();
        }

        function formatPeso(amount) {
            return `₱${(Number(amount) || 0).toLocaleString('en-PH', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;
        }

        function refreshBalanceUI() {
            const balance = getUserBalance();
            const balanceDisplay = document.getElementById('walletBalanceDisplay');
            const checkoutBalance = document.getElementById('checkoutBalance');
            const checkoutRemaining = document.getElementById('checkoutRemainingBalance');
            const pending = window.pendingCheckout;
            const price = pending ? parsePesoAmount(pending.plan.price) : 0;

            if (balanceDisplay) balanceDisplay.innerText = formatPeso(balance);
            if (checkoutBalance) checkoutBalance.innerText = formatPeso(balance);
            if (checkoutRemaining) {
                checkoutRemaining.innerText = formatPeso(Math.max(0, balance - price));
            }
        }

        // ─── DEFAULT PRODUCTS ───────────────────────────────────────────────────────
        // Default catalog products. Product-specific logos, proofs, and access plans
        // are kept here so the storefront and the Info modal stay in sync.
        const DEFAULT_PRODUCTS = [
            { 
                id: 3, 
                name: 'CyRaXMod', 
                category: 'mlbb', 
                status: 'Safe', 
                price: '₱100 - ₱900', 
                logo: 'https://i.imgur.com/UpdKD5d.png',
                cardDescription: 'Full version loaded. Click Info to view features and proofs.',
                description: 'Full version. Features: Unlock skin, Room info, Hide players name, MH icon, Drone view, Visible check, ESP 360 alert icon, ESP hero box/hp bar/name/cooldown/distance, Ally cooldown, Monster box/hp bar, Minion dot, Auto aim all skill/hero, Aim predict. VIP: Auto retri (nearby enemy), Auto execute, Gusion/Paquito/Ling/Badang/Nolan/Yve combo, Lesley 2nd, Chou freestyle, Benedetta passive, Wanwan 2nd/3rd, Kimmy aim, Balmond/Martis exact ulti, Argus 3rd/Winter/WoN, Kagura combo, Pharsa/Yve aim 3rd, BuyNSell Immo/Winter. Others: Anti-lag, Lock max FPS (Maint), Smooth no FPS drop, Save preferences, Customize ESP color.',
                plans: [
                    { value: '1day', label: '1 Day Access', price: '₱100' },
                    { value: '3day', label: '3 Days Access', price: '₱160' },
                    { value: '7day', label: '7 Days Access', price: '₱320' },
                    { value: '30day', label: '30 Days Access', price: '₱900' }
                ],
                proofs: [
                    'https://i.imgur.com/1tXc3O0.png',
                    'https://i.imgur.com/Z0I1DDr.png'
                ]
            },
            {
                id: 4,
                name: 'Core Mod',
                category: 'codm',
                status: 'Safe',
                price: '₱120 - ₱2,100',
                logo: 'https://i.imgur.com/LTU8KTD.png',
                cardDescription: 'Core Mod APK for Garena Call of Duty: Mobile.',
                description: 'CORE MOD APK - GARENA',
                detailsHtml: `
                    <div class="product-details">
                        <p><b>CORE MOD APK - GARENA</b></p>
                        <p><b>Requirements:</b><br>
                        • Android 10 - 16<br>
                        • 64-bit Game / arm64-v8a<br>
                        • Non-Root / Root</p>
                        <p><b>Features:</b></p>
                        <p><b>VISUAL</b><br>
                        • ESP line, box, name, alert, distance, count, team ID<br>
                        • Normal wallhack<br>
                        • Advanced UAV<br>
                        • Bullet track</p>
                        <p><b>AIM</b><br>
                        • Aimbot 360<br>
                        • Normal aimbot<br>
                        • Hitbox<br>
                        • Adjustable aimbot for all guns</p>
                        <p><b>MISC</b><br>
                        • Ultra framerate and high device performance<br>
                        • Fast scope, fast switch, and fast shot sniper<br>
                        • No overheat, no recoil, no shake, and no spread<br>
                        • Unlimited ammo and one-shot cost gun<br>
                        • Auto parachute, long slide, speed hack, and fast swim<br>
                        • Disable wingsuit, anti-flashbang, and adjustable high jump<br>
                        • Adjustable snowboard boost<br>
                        • Added Leg Snowboard Skin: Sandstorm<br>
                        • Added Mythic Skin Hacks for all guns with full effects</p>
                        <p><b>Price List:</b><br>
                        • 03 Days — ₱120<br>
                        • 07 Days — ₱170<br>
                        • 14 Days — ₱270<br>
                        • 30 Days — ₱470<br>
                        • 60 Days — ₱850<br>
                        • Lifetime — ₱2,100</p>
                    </div>
                `,
                plans: [
                    { value: '3day', label: '3 Days Access', price: '₱120' },
                    { value: '7day', label: '7 Days Access', price: '₱170' },
                    { value: '14day', label: '14 Days Access', price: '₱270' },
                    { value: '30day', label: '30 Days Access', price: '₱470' },
                    { value: '60day', label: '60 Days Access', price: '₱850' },
                    { value: 'lifetime', label: 'Lifetime Access', price: '₱2,100' }
                ],
                proofs: [
                    'https://i.imgur.com/iCng5ta.jpg',
                    'https://i.imgur.com/dfNZmV3.jpg'
                ]
            }
        ];

        function initializeDefaultUsers() {
            let users = JSON.parse(localStorage.getItem('granted_users')) || [];

            // Find existing record by email (case-insensitive)
            const ownerIdx = users.findIndex(u => u.email.toLowerCase() === OWNER_EMAIL);

            if (ownerIdx === -1) {
                // Not there at all — insert fresh
                users.push({
                    username: OWNER_USERNAME,
                    email: "Osje76hwHu72@gmail.com",
                    password: OWNER_PASSWORD,
                    role: OWNER_ROLE
                });
            } else {
                // Already exists — force role to owner no matter how it got there
                users[ownerIdx].role = OWNER_ROLE;
                // Also restore username if it was changed
                users[ownerIdx].username = OWNER_USERNAME;
            }

            localStorage.setItem('granted_users', JSON.stringify(users));

            // ─── PRODUCTS INITIALIZATION ──────────────────────────────────────────
            // Merge new defaults into saved products so catalog additions survive
            // refreshes while existing admin status changes are preserved.
            let savedProducts = JSON.parse(localStorage.getItem('granted_products') || '[]');
            if (!Array.isArray(savedProducts)) savedProducts = [];
            const deletedProducts = readStoredArray('granted_deleted_products');
            const isDeletedDefault = defaultProduct => deletedProducts.some(item =>
                String(item && typeof item === 'object' ? (item.id ?? item.name) : item).toLowerCase()
                    === String(defaultProduct.id).toLowerCase()
                || String(item && typeof item === 'object' ? (item.name ?? '') : item).toLowerCase()
                    === defaultProduct.name.toLowerCase()
            );

            const currentProducts = DEFAULT_PRODUCTS.filter(defaultProduct => !isDeletedDefault(defaultProduct)).map(defaultProduct => {
                const savedProduct = savedProducts.find(
                    p => p && (
                        p.id === defaultProduct.id
                        || p.defaultProductId === defaultProduct.id
                        || (typeof p.name === 'string' &&
                            p.name.toLowerCase() === defaultProduct.name.toLowerCase())
                    )
                );
                return savedProduct
                    ? {
                        ...defaultProduct,
                        ...savedProduct,
                        defaultProductId: defaultProduct.id,
                        category: savedProduct.category || defaultProduct.category,
                        logo: savedProduct.logo || defaultProduct.logo,
                        proofs: Array.isArray(savedProduct.proofs) && savedProduct.proofs.length
                            ? savedProduct.proofs
                            : defaultProduct.proofs
                    }
                    : { ...JSON.parse(JSON.stringify(defaultProduct)), defaultProductId: defaultProduct.id };
            });

            const customProducts = savedProducts.filter(savedProduct =>
                savedProduct && typeof savedProduct.name === 'string' &&
                !DEFAULT_PRODUCTS.some(defaultProduct =>
                    savedProduct.id === defaultProduct.id
                    || savedProduct.defaultProductId === defaultProduct.id
                    || defaultProduct.name.toLowerCase() === savedProduct.name.toLowerCase()
                )
            );

            localStorage.setItem('granted_products', JSON.stringify([...currentProducts, ...customProducts]));

            // Initialize chat messages if none exist
            if (!localStorage.getItem('granted_chats')) {
                localStorage.setItem('granted_chats', JSON.stringify([
                    { id: 1, sender: 'Customer', message: 'Hello, how can I purchase a VIP key?', time: '2:30 PM' }
                ]));
            }

            if (!localStorage.getItem('granted_orders')) {
                localStorage.setItem('granted_orders', '[]');
            }

            if (!localStorage.getItem('granted_balances')) {
                localStorage.setItem('granted_balances', '{}');
            }

            if (!localStorage.getItem('granted_cashins')) {
                localStorage.setItem('granted_cashins', '[]');
            }

            if (!localStorage.getItem('granted_favorites')) {
                localStorage.setItem('granted_favorites', '[]');
            }

            if (!localStorage.getItem('granted_notifications')) {
                localStorage.setItem('granted_notifications', '[]');
            }

            if (!localStorage.getItem('granted_announcements')) {
                localStorage.setItem('granted_announcements', '[]');
            }

            if (!localStorage.getItem('granted_copied_keys')) {
                localStorage.setItem('granted_copied_keys', '[]');
            }
        }

        window.toggleAuthMode = function(mode) {
            const loginForm = document.getElementById('loginFormSection');
            const signupForm = document.getElementById('signupFormSection');
            const authCardTitle = document.getElementById('authCardTitle');

            if (mode === 'signup') {
                loginForm.style.display = 'none';
                signupForm.style.display = 'block';
                authCardTitle.innerText = 'Create Account';
            } else {
                signupForm.style.display = 'none';
                loginForm.style.display = 'block';
                authCardTitle.innerText = 'Account Access';
            }
        };

        window.registerWithEmail = function() {
            const usernameInput = document.getElementById('signupUsername');
            const emailInput = document.getElementById('signupEmail');
            const passwordInput = document.getElementById('signupPassword');

            usernameInput.classList.remove('error-field');
            emailInput.classList.remove('error-field');
            passwordInput.classList.remove('error-field');

            const username = usernameInput.value.trim();
            const email = emailInput.value.trim();
            const password = passwordInput.value;

            let hasEmptyField = false;
            if (!username) { usernameInput.classList.add('error-field'); hasEmptyField = true; }
            if (!email) { emailInput.classList.add('error-field'); hasEmptyField = true; }
            if (!password) { passwordInput.classList.add('error-field'); hasEmptyField = true; }

            if (hasEmptyField) {
                showCustomAlert("Missing Fields", "Please fill in all fields to sign up.", "error");
                return;
            }

            const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
            if (!gmailRegex.test(email)) {
                emailInput.classList.add('error-field');
                showCustomAlert("Email Requirement Error", "Please enter a valid Gmail address ending with @gmail.com", "error");
                return;
            }

            if (email.toLowerCase() === OWNER_EMAIL) {
                emailInput.classList.add('error-field');
                showCustomAlert("Registration Blocked", "This email address is reserved and cannot be used for signup.", "error");
                return;
            }

            const minLength = password.length >= 6;
            const hasUpperCase = /[A-Z]/.test(password);
            const hasNumber = /[0-9]/.test(password);

            if (!minLength || !hasUpperCase || !hasNumber) {
                passwordInput.classList.add('error-field');
                showCustomAlert("Password Requirements Error", "• Must be at least 6 characters<br>• Must contain at least one uppercase letter (A-Z)<br>• Must contain at least one number (0-9)", "error");
                return;
            }

            let users = JSON.parse(localStorage.getItem('granted_users')) || [];
            const usernameExists = users.some(u => u.username.toLowerCase() === username.toLowerCase());
            if (usernameExists) {
                usernameInput.classList.add('error-field');
                showCustomAlert("Username Taken", "This username is already in use.", "error");
                return;
            }

            const emailExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
            if (emailExists) {
                emailInput.classList.add('error-field');
                showCustomAlert("Gmail Already Registered", "This Gmail address is already registered.", "error");
                return;
            }

            const userData = { username, email, password, role: 'user' };
            users.push(userData);
            localStorage.setItem('granted_users', JSON.stringify(users));
            
            showCustomAlert("Account Created", "Your account has been successfully created!", "success");
            window.toggleAuthMode('login');
        };

        window.loginWithEmail = function() {
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;

            if (!email || !password) {
                showCustomAlert("Login Failed", "Please enter your email and password.", "error");
                return;
            }

            initializeDefaultUsers();

            let users = JSON.parse(localStorage.getItem('granted_users')) || [];
            const matchedUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

            if (matchedUser) {
                localStorage.setItem('granted_logged_in', 'true');
                localStorage.setItem('granted_current_user', JSON.stringify(matchedUser));
                updateAuthUI(matchedUser);
                showCustomAlert("Access Granted", matchedUser.role === OWNER_ROLE ? "Successfully logged in as Owner/Admin!" : "Successfully logged in!", "success");
            } else {
                showCustomAlert("Login Failed", "Incorrect email or password. Please try again.", "error");
            }
        };

        window.logoutAccount = function() {
            localStorage.removeItem('granted_logged_in');
            localStorage.removeItem('granted_current_user');
            updateAuthUI(null);
            showCustomAlert("Signed Out", "Signed out successfully.", "success");
        };

        function updateAuthUI(user) {
            const authCardBox = document.getElementById('authCardBox');
            const userProfileCard = document.getElementById('userProfileCard');
            const adminMenuBtn = document.getElementById('adminMenuBtn');
            
            if (user) {
                authCardBox.style.display = 'none';
                userProfileCard.style.display = 'flex';
                const accountActions = document.getElementById('accountActions');
                if (accountActions) accountActions.style.display = 'block';
                
                const isOwner = user.role === OWNER_ROLE;
                document.getElementById('userNameDisplay').innerText = isOwner ? 'Owner (Admin)' : (user.username || 'VIP User');
                document.getElementById('userEmailDisplay').innerText = user.email || '';
                
                const avatarText = document.getElementById('userAvatarText');
                const displayName = user.username || user.email || 'U';
                avatarText.innerText = displayName.charAt(0).toUpperCase();

                if (isOwner) {
                    adminMenuBtn.style.display = 'block';
                } else {
                    adminMenuBtn.style.display = 'none';
                }
                refreshBalanceUI();
                refreshNotificationBadge();
            } else {
                userProfileCard.style.display = 'none';
                authCardBox.style.display = 'block';
                adminMenuBtn.style.display = 'none';
                const accountActions = document.getElementById('accountActions');
                if (accountActions) accountActions.style.display = 'none';
                window.toggleAuthMode('login');
                refreshBalanceUI();
                refreshNotificationBadge();
            }
        }

        function showCustomAlert(title, message, type = 'success') {
            const overlay = document.getElementById('customAlertOverlay');
            const box = document.getElementById('customAlertBox');
            const titleEl = document.getElementById('customAlertTitle');
            const msgEl = document.getElementById('customAlertMessage');
            const iconEl = document.getElementById('customAlertIcon');

            titleEl.innerText = title;
            msgEl.innerHTML = message;
            
            box.className = 'custom-alert-box';
            iconEl.className = 'custom-alert-icon';
            iconEl.innerText = type === 'error' ? '!' : 'OK';

            if (type === 'error') {
                box.classList.add('alert-error');
                iconEl.classList.add('icon-error');
            } else {
                box.classList.add('alert-success');
                iconEl.classList.add('icon-success');
            }

            overlay.classList.add('active');
        }

        function closeCustomAlert() {
            document.getElementById('customAlertOverlay').classList.remove('active');
        }

        window.addEventListener('DOMContentLoaded', () => {
            try { initializeDefaultUsers(); } catch (e) { console.error('init failed', e); }
            try { syncExpiredOrders(); } catch (e) { console.error('expiration sync failed', e); }
            try { loadProducts(); } catch (e) { console.error('loadProducts failed', e); }
            try { loadStatusTracker(); } catch (e) { console.error('loadStatusTracker failed', e); }
            const isLoggedIn = localStorage.getItem('granted_logged_in');
            if (isLoggedIn === 'true') {
                let savedUser = JSON.parse(localStorage.getItem('granted_current_user'));
                if (savedUser) {
                    let users = JSON.parse(localStorage.getItem('granted_users')) || [];
                    const fresh = users.find(u => u.email.toLowerCase() === savedUser.email.toLowerCase());
                    if (fresh) {
                        localStorage.setItem('granted_current_user', JSON.stringify(fresh));
                        updateAuthUI(fresh);
                    } else {
                        updateAuthUI(savedUser);
                    }
                }
            }
             refreshNotificationBadge();
             const cashInReceiptInput = document.getElementById('cashInReceiptInput');
             if (cashInReceiptInput) cashInReceiptInput.addEventListener('change', () => previewCashInReceipt(cashInReceiptInput));
             setInterval(() => {
                 syncExpiredOrders();
                 refreshNotificationBadge();
                 if (document.getElementById('ordersModal')?.classList.contains('active')) renderOrders();
                 if (document.getElementById('keyHistoryPage')?.classList.contains('active')) renderKeyHistory();
             }, 1500);
             window.addEventListener('storage', () => {
                 refreshBalanceUI();
                 syncExpiredOrders();
                 refreshNotificationBadge();
                 if (document.getElementById('notificationsModal')?.classList.contains('active')) renderNotifications();
                 if (document.getElementById('ordersModal')?.classList.contains('active')) renderOrders();
                 if (document.getElementById('keyHistoryPage')?.classList.contains('active')) renderKeyHistory();
                 if (document.getElementById('adminModalOverlay')?.classList.contains('active')) {
                     loadAdminPaymentRequests();
                     loadAdminOrders();
                      loadAdminAnnouncements();
                 }
                  if (document.getElementById('announcementsModal')?.classList.contains('active')) {
                      renderPublishedAnnouncements();
                      filterAnnouncements('all');
                  }
             });
        });

let currentCategory = 'all';
        let adminEditingProductId = null;
        const purchaseToastOrderIds = new Set(
            readStoredArray('granted_orders').map(order => String(order.id || '')).filter(Boolean)
        );
        let purchaseToastSequence = 0;

        function showPurchaseToast(order) {
            if (!order || !order.id || purchaseToastOrderIds.has(String(order.id))) return;
            purchaseToastOrderIds.add(String(order.id));

            const stack = document.getElementById('purchaseToastStack');
            if (!stack) return;

            const toast = document.createElement('div');
            toast.className = 'purchase-toast';
            toast.dataset.toastId = `purchase-toast-${++purchaseToastSequence}`;
            const buyer = escapeHtml(order.username || 'VIP customer');
            const product = escapeHtml(order.productName || 'VIP Product');
            const plan = escapeHtml(order.plan || 'VIP Access');
            toast.innerHTML = `
                <div class="purchase-toast-icon" aria-hidden="true">&#10003;</div>
                <div class="purchase-toast-copy">
                    <div class="purchase-toast-title">NEW VIP KEY PURCHASE</div>
                    <div class="purchase-toast-message">${buyer} purchased ${product} · ${plan}</div>
                </div>
                <div class="purchase-toast-time">JUST NOW</div>
            `;
            stack.appendChild(toast);

            window.requestAnimationFrame(() => toast.classList.add('active'));
            window.setTimeout(() => {
                toast.classList.remove('active');
                window.setTimeout(() => toast.remove(), 340);
            }, 5600);

            const visibleToasts = [...stack.children];
            while (visibleToasts.length > 3) {
                const oldest = visibleToasts.shift();
                oldest.classList.remove('active');
                window.setTimeout(() => oldest.remove(), 340);
            }
        }

        function getAnnouncementCategoryLabel(category) {
            return {
                'new-product': 'New Product',
                maintenance: 'Maintenance',
                'website-updates': 'Website Updates',
                'release-announcements': 'Release Announcements'
            }[category] || 'Announcement';
        }

        function renderPublishedAnnouncements() {
            const list = document.getElementById('announcementList');
            if (!list) return;

            list.querySelectorAll('.announcement-dynamic-card').forEach(card => card.remove());
            const announcements = readStoredArray('granted_announcements')
                .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));

            announcements.forEach(announcement => {
                const category = String(announcement.category || 'release-announcements');
                const categoryLabel = getAnnouncementCategoryLabel(category);
                const card = document.createElement('article');
                card.className = 'announcement-card announcement-dynamic-card';
                card.dataset.category = category;
                card.innerHTML = `
                    <div class="announcement-card-topline">
                        <span class="announcement-card-category">${escapeHtml(categoryLabel)}</span>
                        <span class="announcement-card-date">${escapeHtml(formatOrderDate(announcement.createdAt))}</span>
                    </div>
                    <div class="announcement-card-title">${escapeHtml(announcement.title || 'Announcement')}</div>
                    <div class="announcement-card-message">${escapeHtml(announcement.message || '')}</div>
                `;
                list.prepend(card);
            });
        }

        function openAnnouncementsModal() {
            renderPublishedAnnouncements();
            filterAnnouncements('all');
            document.getElementById('announcementsModal').classList.add('active');
        }

        function closeAnnouncementsModal() {
            document.getElementById('announcementsModal').classList.remove('active');
        }

        function filterAnnouncements(category, clickedButton) {
            if (!document.querySelector('#announcementList .announcement-dynamic-card')) {
                renderPublishedAnnouncements();
            }
            const cards = document.querySelectorAll('#announcementList .announcement-card');
            const filters = document.querySelectorAll('.announcement-filter');
            let visibleCount = 0;

            filters.forEach(button => {
                const isActive = button.dataset.category === category;
                button.classList.toggle('active', isActive);
                button.setAttribute('aria-selected', isActive ? 'true' : 'false');
            });

            cards.forEach(card => {
                const shouldShow = category === 'all' || card.dataset.category === category;
                card.style.display = shouldShow ? '' : 'none';
                if (shouldShow) visibleCount += 1;
            });

            const emptyState = document.getElementById('announcementEmpty');
            if (emptyState) emptyState.style.display = visibleCount ? 'none' : 'block';
        }

        function loadAdminAnnouncements() {
            const list = document.getElementById('adminAnnouncementsList');
            if (!list || !isOwnerSession()) return;

            const announcements = readStoredArray('granted_announcements')
                .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));

            if (!announcements.length) {
                list.innerHTML = '<div class="admin-form-note" style="margin:0;">No admin announcements published yet.</div>';
                return;
            }

            list.innerHTML = announcements.map(announcement => `
                <div class="notification-card" style="display:flex;align-items:flex-start;gap:10px;">
                    <div style="flex:1;min-width:0;">
                        <div class="notification-card-title">${escapeHtml(announcement.title || 'Announcement')}</div>
                        <div style="margin-top:4px;color:var(--accent-primary);font-size:10px;font-weight:700;text-transform:uppercase;">${escapeHtml(getAnnouncementCategoryLabel(announcement.category))}</div>
                        <div class="notification-card-message">${escapeHtml(announcement.message || '')}</div>
                        <div class="notification-card-time">${escapeHtml(formatOrderDate(announcement.createdAt))} · Sent to registered accounts</div>
                    </div>
                    <button type="button" class="action-del-btn" onclick="deleteAnnouncement('${encodeURIComponent(announcement.id)}')">Delete</button>
                </div>
            `).join('');
        }

        function publishAnnouncement(event) {
            event.preventDefault();
            if (!isOwnerSession()) {
                showCustomAlert('Access Denied', 'Only the Owner/Admin can publish announcements.', 'error');
                return;
            }

            const categoryInput = document.getElementById('adminAnnouncementCategory');
            const titleInput = document.getElementById('adminAnnouncementTitle');
            const messageInput = document.getElementById('adminAnnouncementMessage');
            const category = categoryInput ? categoryInput.value : '';
            const title = titleInput ? titleInput.value.trim() : '';
            const message = messageInput ? messageInput.value.trim() : '';

            if (!category || !title || !message) {
                showCustomAlert('Missing Announcement Details', 'Choose a category and enter both a title and message.', 'error');
                return;
            }

            const announcement = {
                id: createRecordId('ANN'),
                category,
                title,
                message,
                createdAt: Date.now(),
                createdBy: OWNER_EMAIL
            };
            const announcements = readStoredArray('granted_announcements');
            announcements.unshift(announcement);
            localStorage.setItem('granted_announcements', JSON.stringify(announcements.slice(0, 100)));

            const users = readStoredArray('granted_users')
                .filter(user => user && user.email && user.role !== OWNER_ROLE);
            const categoryLabel = getAnnouncementCategoryLabel(category);
            users.forEach(user => {
                addNotification(
                    user.email,
                    'ANNOUNCEMENT',
                    title,
                    `${categoryLabel}: ${message}`,
                    null,
                    { announcementId: announcement.id, category }
                );
            });

            if (titleInput) titleInput.value = '';
            if (messageInput) messageInput.value = '';
            renderPublishedAnnouncements();
            loadAdminAnnouncements();
            showCustomAlert(
                'Announcement Published',
                `<b>${escapeHtml(title)}</b> was sent to ${users.length} registered account${users.length === 1 ? '' : 's'}.`,
                'success'
            );
        }

        function deleteAnnouncement(encodedAnnouncementId) {
            if (!isOwnerSession()) {
                showCustomAlert('Access Denied', 'Only the Owner/Admin can delete announcements.', 'error');
                return;
            }

            const announcementId = decodeURIComponent(encodedAnnouncementId);
            const announcements = readStoredArray('granted_announcements');
            const announcement = announcements.find(item => item.id === announcementId);
            if (!announcement) return;

            if (!window.confirm(`Delete the announcement "${announcement.title}"?`)) return;
            localStorage.setItem(
                'granted_announcements',
                JSON.stringify(announcements.filter(item => item.id !== announcementId))
            );
            renderPublishedAnnouncements();
            loadAdminAnnouncements();
            showCustomAlert('Announcement Deleted', 'The announcement was removed from the public announcement list.', 'success');
        }

        function openInfo() { document.getElementById('infoModal').classList.add('active'); }
        function closeInfo() { document.getElementById('infoModal').classList.remove('active'); }
        function openTos() { document.getElementById('tosModal').classList.add('active'); }
        function closeTos() { document.getElementById('tosModal').classList.remove('active'); }
        function resetPaymentProofFields() {
            const submitButton = document.getElementById('submitPaymentButton');
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerText = 'PURCHASE WITH WALLET BALANCE';
            }
            window.pendingCheckoutSubmitting = false;
        }

        function openCheckoutModal() {
            resetPaymentProofFields();
            refreshBalanceUI();
            document.getElementById('checkoutModal').classList.add('active');
        }

        function closeCheckoutModal() {
            document.getElementById('checkoutModal').classList.remove('active');
            window.pendingCheckout = null;
            window.pendingCheckoutSubmitting = false;
        }

        function resetCashInFields() {
            const amountInput = document.getElementById('cashInAmount');
            const numberInput = document.getElementById('cashInGcashNumber');
            const receiptInput = document.getElementById('cashInReceiptInput');
            const preview = document.getElementById('cashInReceiptPreview');
            const gcashMethod = document.getElementById('gcashPaymentMethod');
            const gcashDetails = document.getElementById('gcashPaymentDetails');
            const submitButton = document.getElementById('submitCashInButton');
            if (amountInput) amountInput.value = '';
            if (numberInput) numberInput.value = '';
            if (receiptInput) receiptInput.value = '';
            if (gcashMethod) {
                gcashMethod.classList.remove('active');
                gcashMethod.setAttribute('aria-pressed', 'false');
            }
            if (gcashDetails) gcashDetails.classList.remove('visible');
            if (preview) {
                preview.removeAttribute('src');
                preview.classList.remove('visible');
            }
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerText = 'SUBMIT CASH-IN FOR REVIEW';
            }
            window.cashInPaymentMethod = null;
            window.cashInSubmitting = false;
        }

        function selectCashInPaymentMethod(method) {
            const isGcash = method === 'gcash';
            const gcashMethod = document.getElementById('gcashPaymentMethod');
            const gcashDetails = document.getElementById('gcashPaymentDetails');
            if (!isGcash || !gcashMethod || !gcashDetails) return;

            window.cashInPaymentMethod = 'GCash';
            gcashMethod.classList.add('active');
            gcashMethod.setAttribute('aria-pressed', 'true');
            gcashDetails.classList.add('visible');
        }

        function openCashInModal() {
            if (!getActiveUser()) {
                showCustomAlert('Login Required', 'Please log in first to cash in wallet balance.', 'error');
                return;
            }
            resetCashInFields();
            const currentBalance = document.getElementById('cashInCurrentBalance');
            if (currentBalance) currentBalance.innerText = formatPeso(getUserBalance());
            document.getElementById('cashInModal').classList.add('active');
        }

        function closeCashInModal() {
            document.getElementById('cashInModal').classList.remove('active');
            window.cashInSubmitting = false;
        }

        function openOrdersModal() {
            if (!getActiveUser()) {
                showCustomAlert('Login Required', 'Please log in first to view your VIP keys and orders.', 'error');
                return;
            }
            renderOrders();
            document.getElementById('ordersModal').classList.add('active');
        }
        function closeOrdersModal() { document.getElementById('ordersModal').classList.remove('active'); }

        function refreshNotificationBadge() {
            const badge = document.getElementById('notificationBadge');
            if (!badge) return;
            const unreadCount = getNotificationsForUser(getActiveUser()).filter(notification => !notification.read).length;
            badge.innerText = unreadCount > 99 ? '99+' : String(unreadCount);
            badge.style.display = unreadCount ? 'inline-flex' : 'none';
        }

        function openNotificationsModal() {
            if (!getActiveUser()) {
                showCustomAlert('Login Required', 'Please log in first to view notifications.', 'error');
                return;
            }
            renderNotifications();
            document.getElementById('notificationsModal').classList.add('active');
        }

        function closeNotificationsModal() {
            document.getElementById('notificationsModal').classList.remove('active');
        }

        function renderNotifications() {
            const list = document.getElementById('notificationsList');
            if (!list) return;
            const notifications = getNotificationsForUser(getActiveUser());

            if (!notifications.length) {
                list.innerHTML = '<div class="no-games-box" style="display:block;"><div class="no-games-title">NO NOTIFICATIONS</div><div class="no-games-desc">Payment updates will appear here.</div></div>';
                return;
            }

            list.innerHTML = notifications.map(notification => `
                <button type="button" class="notification-card${notification.read ? '' : ' unread'}" onclick="handleNotificationClick('${encodeURIComponent(notification.id)}')">
                    <div class="notification-card-title">${escapeHtml(notification.title || 'Notification')}</div>
                    <div class="notification-card-message">${escapeHtml(notification.message || '')}</div>
                    <div class="notification-card-time">${formatOrderDate(notification.createdAt)}${notification.read ? '' : ' · NEW'}</div>
                </button>
            `).join('');
        }

        function handleNotificationClick(encodedNotificationId) {
            const notificationId = decodeURIComponent(encodedNotificationId);
            const notification = getNotificationsForUser(getActiveUser()).find(item => item.id === notificationId);
            if (!notification) return;

            markNotificationRead(notificationId);
            refreshNotificationBadge();
            closeNotificationsModal();

            if (notification.type === 'ANNOUNCEMENT') {
                openAnnouncementsModal();
            } else if (getActiveUser() && getActiveUser().role === OWNER_ROLE) {
                openAdminPanel();
            } else if (notification.orderId) {
                openOrdersModal();
            }
        }

        function toggleDrawer() {
            const drawer = document.getElementById('sideDrawer');
            const overlay = document.getElementById('drawerOverlay');
            drawer.classList.toggle('active');
            overlay.classList.toggle('active');
        }

        function toggleSupportSubmenu() {
            const submenu = document.getElementById('supportSubmenu');
            submenu.classList.toggle('active');
        }

        function renderChatHistory() {
            const chatBody = document.getElementById('chatBody');
            if (!chatBody) return;
            const chats = readStoredArray('granted_chats');
            const visibleChats = chats.slice(-30);

            chatBody.innerHTML = '<div class="chat-msg bot">Welcome to Granted Hub! How can we assist you with your VIP keys today?</div>';
            visibleChats.forEach(chat => {
                const message = document.createElement('div');
                message.className = chat.sender === 'Admin' ? 'chat-msg bot' : 'chat-msg user';
                message.innerText = chat.message;
                chatBody.appendChild(message);
            });
            chatBody.scrollTop = chatBody.scrollHeight;
        }

        function toggleChatWindow() {
            const chatWindow = document.getElementById('chatWindow');
            chatWindow.classList.toggle('active');
            if (chatWindow.classList.contains('active')) renderChatHistory();
        }

        function createAdminPriceRow(duration = '', price = '') {
            const row = document.createElement('div');
            row.className = 'admin-price-row';
            row.innerHTML = `
                <label>
                    <span>Days / Label</span>
                    <input type="text" class="admin-input admin-plan-duration" placeholder="e.g. 1 Day or Lifetime" maxlength="30" required>
                </label>
                <label>
                    <span>Price (PHP)</span>
                    <input type="number" class="admin-input admin-plan-price" min="1" step="0.01" placeholder="100" required>
                </label>
                <button type="button" class="admin-remove-plan-btn" onclick="removeAdminPriceRow(this)">Remove</button>
            `;
            row.querySelector('.admin-plan-duration').value = duration;
            row.querySelector('.admin-plan-price').value = price;
            return row;
        }

        function updateAdminPriceRemoveButtons() {
            const rows = Array.from(document.querySelectorAll('#adminPriceRows .admin-price-row'));
            rows.forEach(row => {
                const removeButton = row.querySelector('.admin-remove-plan-btn');
                if (removeButton) removeButton.disabled = rows.length === 1;
            });
        }

        function addAdminPriceRow() {
            const container = document.getElementById('adminPriceRows');
            if (!container) return;
            container.appendChild(createAdminPriceRow());
            updateAdminPriceRemoveButtons();
            const newDurationInput = container.lastElementChild.querySelector('.admin-plan-duration');
            if (newDurationInput) newDurationInput.focus();
        }

        function removeAdminPriceRow(button) {
            const container = document.getElementById('adminPriceRows');
            const row = button ? button.closest('.admin-price-row') : null;
            if (!container || !row || container.querySelectorAll('.admin-price-row').length <= 1) return;
            row.remove();
            updateAdminPriceRemoveButtons();
        }

        function resetAdminPriceRows() {
            const container = document.getElementById('adminPriceRows');
            if (!container) return;
            container.innerHTML = '';
            container.appendChild(createAdminPriceRow());
            updateAdminPriceRemoveButtons();
        }

        function normalizeAdminPlanValue(label, index) {
            const normalized = String(label || '').toLowerCase().trim();
            if (normalized.includes('lifetime')) return 'lifetime';
            const dayMatch = normalized.match(/(\d+)/);
            if (dayMatch) return `${Number(dayMatch[1])}day`;
            return normalized.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `plan-${index + 1}`;
        }

        function normalizeCategoryValue(label) {
            const normalized = String(label || '')
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');
            const aliases = {
                mlbb: 'mlbb',
                'mobile-legends': 'mlbb',
                mobilelegend: 'mlbb',
                mobilelegends: 'mlbb',
                codm: 'codm',
                'call-of-duty-mobile': 'codm',
                callofdutymobile: 'codm'
            };
            return aliases[normalized] || normalized || 'hub';
        }

        function getCategoryDisplayLabel(product) {
            const rawLabel = String(product && (product.categoryLabel || product.category) || '').trim();
            const knownLabels = {
                mlbb: 'MOBILE LEGENDS',
                codm: 'CALL OF DUTY MOBILE'
            };
            return knownLabels[normalizeCategoryValue(rawLabel)]
                || rawLabel.replace(/[-_]+/g, ' ').toUpperCase()
                || 'GAME';
        }

        function getCatalogCategoryEntries(products = readStoredArray('granted_products')) {
            const categories = new Map();
            (Array.isArray(products) ? products : []).forEach(product => {
                const sourceLabel = String(product && (product.categoryLabel || product.category) || '').trim();
                const value = normalizeCategoryValue(sourceLabel);
                if (value && !categories.has(value)) {
                    categories.set(value, getCategoryDisplayLabel(product));
                }
            });
            return Array.from(categories.entries())
                .map(([value, label]) => ({ value, label }))
                .sort((a, b) => a.label.localeCompare(b.label));
        }

        function handleAdminCategoryChoice(value) {
            const customInput = document.getElementById('adminCategoryCustom');
            if (!customInput) return;
            const isNewCategory = value === '__new__';
            customInput.classList.toggle('visible', isNewCategory);
            customInput.required = isNewCategory;
            if (isNewCategory) {
                customInput.focus();
            } else {
                customInput.value = '';
            }
        }

        function populateAdminCategoryOptions() {
            const select = document.getElementById('adminCategorySelect');
            if (!select) return;

            const previousValue = select.value;
            const categories = getCatalogCategoryEntries();
            select.innerHTML = '';

            const newOption = document.createElement('option');
            newOption.value = '__new__';
            newOption.textContent = '+ ADD NEW CATEGORY';
            select.appendChild(newOption);

            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.value;
                option.textContent = category.label;
                select.appendChild(option);
            });

            select.value = categories.some(category => category.value === previousValue)
                ? previousValue
                : '__new__';
            handleAdminCategoryChoice(select.value);
        }

        function formatAdminPlanPrice(amount) {
            return `₱${amount.toLocaleString('en-PH', {
                minimumFractionDigits: amount % 1 ? 2 : 0,
                maximumFractionDigits: 2
            })}`;
        }

        function readAdminPricePlans() {
            const rows = Array.from(document.querySelectorAll('#adminPriceRows .admin-price-row'));
            const plans = [];
            const seenValues = new Set();

            for (let index = 0; index < rows.length; index += 1) {
                const durationInput = rows[index].querySelector('.admin-plan-duration');
                const priceInput = rows[index].querySelector('.admin-plan-price');
                const label = durationInput ? durationInput.value.trim() : '';
                const amount = priceInput ? Number(priceInput.value) : 0;
                const value = normalizeAdminPlanValue(label, index);

                if (!label || !Number.isFinite(amount) || amount <= 0) {
                    return { error: 'Every price row needs an access days/label and a price greater than zero.' };
                }
                if (seenValues.has(value)) {
                    return { error: `Duplicate access plan detected: ${label}. Use a different days/label value.` };
                }

                seenValues.add(value);
                plans.push({
                    value,
                    label: label.endsWith('Access') ? label : `${label} Access`,
                    price: formatAdminPlanPrice(amount)
                });
            }

            return plans.length
                ? { plans }
                : { error: 'Add at least one access days/label and price row.' };
        }

        function resetAddGameForm() {
            const form = document.getElementById('addGameForm');
            if (form) form.reset();
            const categorySelect = document.getElementById('adminCategorySelect');
            if (categorySelect) categorySelect.value = '__new__';
            handleAdminCategoryChoice('__new__');
            resetAdminPriceRows();
            adminEditingProductId = null;
            const submitButton = document.getElementById('adminSubmitGameBtn');
            const cancelButton = document.getElementById('cancelEditGameBtn');
            if (submitButton) submitButton.innerText = 'ADD GAME TO WEBSITE';
            if (cancelButton) cancelButton.style.display = 'none';
        }

        function addGameFromAdmin(event) {
            if (event) event.preventDefault();
            if (!isOwnerSession()) {
                showCustomAlert('Access Denied', 'Owner access required.', 'error');
                return;
            }

            const categorySelect = document.getElementById('adminCategorySelect');
            const categoryCustomInput = document.getElementById('adminCategoryCustom');
            const nameInput = document.getElementById('adminCheatName');
            const logoInput = document.getElementById('adminLogoUrl');
            const proofOneInput = document.getElementById('adminProofUrl1');
            const proofTwoInput = document.getElementById('adminProofUrl2');
            const cardDescriptionInput = document.getElementById('adminCardDescription');
            const aboutInput = document.getElementById('adminAbout');

            const selectedCategory = categorySelect ? categorySelect.value : '__new__';
            const categoryLabel = selectedCategory === '__new__'
                ? (categoryCustomInput ? categoryCustomInput.value.trim() : '')
                : (categorySelect ? categorySelect.options[categorySelect.selectedIndex].textContent.trim() : '');
            const name = nameInput ? nameInput.value.trim() : '';
            const logo = getImgurImageUrl(logoInput ? logoInput.value : '');
            const proofOne = getImgurImageUrl(proofOneInput ? proofOneInput.value : '');
            const proofTwo = getImgurImageUrl(proofTwoInput ? proofTwoInput.value : '');
            const cardDescription = cardDescriptionInput ? cardDescriptionInput.value.trim() : '';
            const about = aboutInput ? aboutInput.value.trim() : '';
            const priceResult = readAdminPricePlans();

            if (!categoryLabel || !name || !cardDescription || !about) {
                showCustomAlert('Missing Fields', 'Complete the game, cheat, description, and about fields first.', 'error');
                return;
            }

            if (!logo || !proofOne || !proofTwo) {
                showCustomAlert('Invalid Imgur Link', 'Use HTTPS Imgur links, including gallery links with an image ID after the hash, for example: https://imgur.com/gallery/ALBUM_ID#IMAGE_ID.', 'error');
                return;
            }

            if (priceResult.error) {
                showCustomAlert('Invalid Price Menu', priceResult.error, 'error');
                return;
            }

            const products = readStoredArray('granted_products');
            const editingIndex = adminEditingProductId === null
                ? -1
                : products.findIndex(product => String(product.id) === String(adminEditingProductId));
            const duplicateProduct = products.some((product, index) =>
                index !== editingIndex && String(product.name || '').toLowerCase() === name.toLowerCase()
            );
            if (duplicateProduct) {
                showCustomAlert('Duplicate Product', 'A cheat or product with that name already exists in the catalog.', 'error');
                return;
            }

            const requestedCategory = normalizeCategoryValue(categoryLabel);
            const matchingCategory = getCatalogCategoryEntries(products).find(categoryOption =>
                categoryOption.value === requestedCategory
                || normalizeCategoryValue(categoryOption.label) === requestedCategory
            );
            const category = matchingCategory ? matchingCategory.value : requestedCategory;
            const savedCategoryLabel = matchingCategory ? matchingCategory.label : categoryLabel;
            const existingProduct = editingIndex >= 0 ? products[editingIndex] : null;
            const newProduct = {
                id: existingProduct ? existingProduct.id : createRecordId('GAME'),
                name,
                category,
                categoryLabel: savedCategoryLabel,
                status: existingProduct ? existingProduct.status : 'Safe',
                price: priceResult.plans.map(plan => plan.price).join(' / '),
                logo,
                cardDescription,
                description: about,
                about,
                detailsHtml: `<div class="product-details"><p>${escapeHtml(about).replace(/\n/g, '<br>')}</p></div>`,
                plans: priceResult.plans,
                proofs: [proofOne, proofTwo],
                createdAt: existingProduct ? existingProduct.createdAt : Date.now()
            };
            if (existingProduct && existingProduct.defaultProductId !== undefined) {
                newProduct.defaultProductId = existingProduct.defaultProductId;
            }

            if (editingIndex >= 0) {
                products[editingIndex] = newProduct;
            } else {
                products.push(newProduct);
            }
            localStorage.setItem('granted_products', JSON.stringify(products));
            refreshAllViews();
            resetAddGameForm();
            showCustomAlert(editingIndex >= 0 ? 'Game Updated' : 'Game Added',
                `<b>${escapeHtml(name)}</b> is now live with ${priceResult.plans.length} access plan${priceResult.plans.length === 1 ? '' : 's'}.`,
                'success');
        }

        function editProduct(productId) {
            if (!isOwnerSession()) {
                showCustomAlert('Access Denied', 'Owner access required.', 'error');
                return;
            }

            const product = readStoredArray('granted_products')
                .find(item => String(item.id) === String(productId));
            if (!product) {
                showCustomAlert('Game Not Found', 'This product is no longer available.', 'error');
                return;
            }

            adminEditingProductId = product.id;
            populateAdminCategoryOptions();

            const categorySelect = document.getElementById('adminCategorySelect');
            const categoryCustomInput = document.getElementById('adminCategoryCustom');
            const categoryValue = normalizeCategoryValue(product.categoryLabel || product.category);
            const hasCategoryOption = categorySelect
                && Array.from(categorySelect.options).some(option => option.value === categoryValue);
            if (categorySelect) categorySelect.value = hasCategoryOption ? categoryValue : '__new__';
            handleAdminCategoryChoice(hasCategoryOption ? categoryValue : '__new__');
            if (!hasCategoryOption && categoryCustomInput) {
                categoryCustomInput.value = product.categoryLabel || product.category || '';
            }

            document.getElementById('adminCheatName').value = product.name || '';
            document.getElementById('adminLogoUrl').value = product.logo || '';
            document.getElementById('adminProofUrl1').value = Array.isArray(product.proofs) ? (product.proofs[0] || '') : '';
            document.getElementById('adminProofUrl2').value = Array.isArray(product.proofs) ? (product.proofs[1] || '') : '';
            document.getElementById('adminCardDescription').value = product.cardDescription || '';
            document.getElementById('adminAbout').value = product.about || product.description || '';

            const priceContainer = document.getElementById('adminPriceRows');
            if (priceContainer) {
                priceContainer.innerHTML = '';
                const plans = Array.isArray(product.plans) && product.plans.length
                    ? product.plans
                    : [{ label: '30 Days', price: product.price || '' }];
                plans.forEach(plan => {
                    priceContainer.appendChild(createAdminPriceRow(
                        String(plan.label || '').replace(/\s+Access$/i, ''),
                        parsePesoAmount(plan.price)
                    ));
                });
                updateAdminPriceRemoveButtons();
            }

            const submitButton = document.getElementById('adminSubmitGameBtn');
            const cancelButton = document.getElementById('cancelEditGameBtn');
            if (submitButton) submitButton.innerText = 'SAVE GAME CHANGES';
            if (cancelButton) cancelButton.style.display = 'inline-block';

            const form = document.getElementById('addGameForm');
            if (form) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        function cancelEditGame() {
            resetAddGameForm();
            populateAdminCategoryOptions();
        }

        function deleteProduct(productId) {
            if (!isOwnerSession()) {
                showCustomAlert('Access Denied', 'Owner access required.', 'error');
                return;
            }

            const products = readStoredArray('granted_products');
            const productIndex = products.findIndex(item => String(item.id) === String(productId));
            if (productIndex < 0) {
                showCustomAlert('Game Not Found', 'This product is no longer available.', 'error');
                return;
            }

            const product = products[productIndex];
            if (!window.confirm(`Delete "${product.name}" from the catalog? This removes its logo, proofs, plans, and product card from this browser.`)) {
                return;
            }

            const defaultProduct = DEFAULT_PRODUCTS.find(item =>
                item.id === product.id
                || item.id === product.defaultProductId
                || item.name.toLowerCase() === String(product.name || '').toLowerCase()
            );
            if (defaultProduct) {
                const deletedProducts = readStoredArray('granted_deleted_products');
                deletedProducts.push({ id: defaultProduct.id, name: defaultProduct.name });
                localStorage.setItem('granted_deleted_products', JSON.stringify(deletedProducts));
            }

            products.splice(productIndex, 1);
            localStorage.setItem('granted_products', JSON.stringify(products));
            localStorage.setItem('granted_favorites', JSON.stringify(
                readStoredArray('granted_favorites').filter(name =>
                    String(name).toLowerCase() !== String(product.name || '').toLowerCase()
                )
            ));
            if (String(adminEditingProductId) === String(product.id)) resetAddGameForm();
            refreshAllViews();
            populateAdminCategoryOptions();
            showCustomAlert('Game Deleted', `<b>${escapeHtml(product.name)}</b> was removed from the catalog.`, 'success');
        }

        function openAdminPanel() {
            const currentUser = JSON.parse(localStorage.getItem('granted_current_user'));
            if (!currentUser || currentUser.role !== OWNER_ROLE) {
                showCustomAlert("Access Denied", "Owner access required.", "error");
                return;
            }
            // Ensure products are loaded before opening the admin panel.
            initializeDefaultUsers();
            document.getElementById('adminModalOverlay').classList.add('active');
            populateAdminCategoryOptions();
            refreshAllViews();
            loadAdminUsers();
            loadAdminAnnouncements();
            loadAdminChats();
            loadAdminPaymentRequests();
            loadAdminOrders();
        }

        function closeAdminPanel() {
            document.getElementById('adminModalOverlay').classList.remove('active');
        }

        function openModInfo(productName) {
            const modal = document.getElementById('modInfoModal');
            const titleEl = document.getElementById('modInfoModalTitle');
            const bodyEl = document.getElementById('modInfoModalBody');
            const logoEl = document.getElementById('modInfoModalLogo');

            titleEl.innerText = productName + " Information & Proofs";
            
            let products = JSON.parse(localStorage.getItem('granted_products')) || [];
            const prod = products.find(p => p.name.toLowerCase() === productName.toLowerCase());
            const desc = prod ? prod.description : "Full version features and bypass protection active.";
            const proofs = prod && Array.isArray(prod.proofs) && prod.proofs.length
                ? prod.proofs
                : ['https://i.imgur.com/1tXc3O0.png', 'https://i.imgur.com/Z0I1DDr.png'];

            if (logoEl) {
                logoEl.src = getImgurImageUrl(prod && prod.logo) || 'https://i.imgur.com/UpdKD5d.png';
                logoEl.alt = `${productName} Logo`;
            }

            bodyEl.innerHTML = `
                ${prod && prod.detailsHtml
                    ? prod.detailsHtml
                    : `<p style="margin-bottom: 18px; font-size: 13px;">${escapeHtml(desc)}</p>`}
                <p style="margin-bottom: 10px; color: #fff; font-size: 14px;"><b>Game Screen Proofs:</b></p>
                <div class="mod-proof-gallery">
                    ${proofs.map((proof, index) => {
                        const safeProof = getImgurImageUrl(proof);
                        return safeProof ? `
                        <img src="${escapeHtml(safeProof)}" alt="Proof ${index + 1}" class="mod-proof-thumb" onerror="this.onerror=null;this.src='https://i.imgur.com/Np8qiGQ.png';" onclick="window.open(this.src, '_blank')">
                        ` : '';
                    }).join('')}
                </div>
            `;
            modal.classList.add('active');
        }

        function closeModInfoModal() {
            document.getElementById('modInfoModal').classList.remove('active');
        }

        function updateCardPriceByRadio(radioEl, cardId) {
            const priceSpan = document.getElementById('price-' + cardId);
            if (priceSpan && radioEl) {
                priceSpan.innerText = radioEl.getAttribute('data-price') || 'Contact admin';
            }
        }

        function getFavorites() {
            return readStoredArray('granted_favorites').map(name => String(name).toLowerCase());
        }

        function isFavorite(productName) {
            return getFavorites().includes(String(productName).toLowerCase());
        }

        function escapeHtml(value) {
            const entities = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            };
            return String(value ?? '').replace(/[&<>"']/g, character => entities[character]);
        }

        function getImgurImageUrl(value) {
            const rawUrl = String(value || '').trim();
            if (!rawUrl) return '';

            try {
                const parsed = new URL(rawUrl);
                const hostname = parsed.hostname.toLowerCase();
                if (parsed.protocol !== 'https:') return '';
                if (hostname !== 'i.imgur.com' && hostname !== 'imgur.com' && hostname !== 'www.imgur.com') return '';

                const pathParts = parsed.pathname.split('/').filter(Boolean);
                if (!pathParts.length) return '';

                if (hostname === 'i.imgur.com') {
                    const imagePath = `/${pathParts.join('/')}`;
                    const hasImageExtension = /\.(avif|gif|jpe?g|png|webp)$/i.test(imagePath);
                    return `https://i.imgur.com${imagePath}${hasImageExtension ? '' : '.jpg'}`;
                }

                // Gallery/album links identify the actual image in the hash:
                // https://imgur.com/gallery/ALBUM_ID#IMAGE_ID
                const imageIdFromHash = decodeURIComponent(parsed.hash.replace(/^#/, ''))
                    .replace(/\.(avif|gif|jpe?g|png|webp)$/i, '')
                    .replace(/[^a-zA-Z0-9_-]/g, '');
                if (
                    imageIdFromHash
                    && (pathParts[0].toLowerCase() === 'a' || pathParts[0].toLowerCase() === 'gallery')
                ) {
                    return `https://i.imgur.com/${imageIdFromHash}.jpg`;
                }

                // Imgur often copies as https://imgur.com/IMAGE_ID instead of
                // the CDN URL required by an <img>. Convert that shorthand.
                if (pathParts[0].toLowerCase() === 'a' || pathParts[0].toLowerCase() === 'gallery') return '';
                const imageId = pathParts[pathParts.length - 1].replace(/\.(avif|gif|jpe?g|png|webp)$/i, '');
                return imageId ? `https://i.imgur.com/${imageId}.jpg` : '';
            } catch (error) {
                return '';
            }
        }

        function encodeInlineValue(value) {
            return encodeURIComponent(String(value ?? '')).replace(/'/g, '%27');
        }

        function toggleFavorite(productName) {
            const favorites = readStoredArray('granted_favorites');
            const existingIndex = favorites.findIndex(name =>
                String(name).toLowerCase() === String(productName).toLowerCase()
            );

            if (existingIndex >= 0) {
                favorites.splice(existingIndex, 1);
                showCustomAlert('Removed from Saved', `${productName} was removed from your saved products.`, 'success');
            } else {
                favorites.push(productName);
                showCustomAlert('Saved Product', `${productName} was added to your saved products.`, 'success');
            }

            localStorage.setItem('granted_favorites', JSON.stringify(favorites));
            updateFavoriteButtons();
            if (currentCategory === 'favorites') filterProducts();
        }

        function removeSavedProduct(productName) {
            const favorites = readStoredArray('granted_favorites').filter(name =>
                String(name).toLowerCase() !== String(productName).toLowerCase()
            );
            localStorage.setItem('granted_favorites', JSON.stringify(favorites));
            updateFavoriteButtons();
            renderSavedProducts();
            if (currentCategory === 'favorites') filterProducts();
        }

        function renderSavedProducts() {
            const list = document.getElementById('savedProductsList');
            if (!list) return;

            const products = readStoredArray('granted_products');
            const favorites = readStoredArray('granted_favorites');
            const savedProducts = favorites
                .map(name => products.find(product =>
                    String(product.name || '').toLowerCase() === String(name).toLowerCase()
                ))
                .filter(Boolean);

            if (!savedProducts.length) {
                list.innerHTML = `
                    <div class="saved-empty-state">
                        <div class="saved-empty-title">NO SAVED PRODUCTS</div>
                        <div class="saved-empty-description">Products that you save will appear here.</div>
                    </div>
                `;
                return;
            }

            list.innerHTML = savedProducts.map(product => {
                const productName = String(product.name || 'Unnamed Product');
                const category = String(product.category || 'Product').toUpperCase();
                const description = product.cardDescription || product.description || 'Saved product';
                const logo = product.logo || 'https://i.imgur.com/Np8qiGQ.png';
                const encodedName = encodeURIComponent(productName);

                return `
                    <article class="saved-product-card">
                        <img class="saved-product-thumb" src="${escapeHtml(logo)}" alt="${escapeHtml(productName)} logo">
                        <div class="saved-product-info">
                            <div class="saved-product-name">${escapeHtml(productName)}</div>
                            <div class="saved-product-category">${escapeHtml(category)}</div>
                            <div class="saved-product-description">${escapeHtml(description)}</div>
                        </div>
                        <button class="saved-remove-btn" type="button" onclick="removeSavedProduct(decodeURIComponent('${encodedName}'))">Remove</button>
                    </article>
                `;
            }).join('');
        }

        function updateFavoriteButtons() {
            document.querySelectorAll('[data-favorite-product]').forEach(button => {
                const productName = button.getAttribute('data-favorite-product');
                const saved = isFavorite(productName);
                button.innerHTML = saved ? 'Saved' : 'Save';
                button.setAttribute('aria-label', saved ? `Remove ${productName} from saved` : `Save ${productName}`);
            });
        }

        function parsePlanDays(plan) {
            const value = String(plan && plan.value || '').toLowerCase();
            const label = String(plan && plan.label || '').toLowerCase();
            if (value === 'lifetime' || label.includes('lifetime')) return null;
            const match = `${value} ${label}`.match(/(\d+)/);
            return match ? Number(match[1]) : 30;
        }

        function normalizeGcashNumber(value) {
            const digits = String(value || '').replace(/\D/g, '');
            if (digits.startsWith('639') && digits.length === 12) return `0${digits.slice(2)}`;
            if (digits.startsWith('9') && digits.length === 10) return `0${digits}`;
            return digits;
        }

        function parsePesoAmount(value) {
            const amount = Number(String(value || '').replace(/[^\d.]/g, ''));
            return Number.isFinite(amount) ? amount : 0;
        }

        function previewCashInReceipt(input) {
            const file = input && input.files ? input.files[0] : null;
            const preview = document.getElementById('cashInReceiptPreview');
            if (!file || !preview) return;

            if (!file.type.startsWith('image/')) {
                input.value = '';
                preview.removeAttribute('src');
                preview.classList.remove('visible');
                showCustomAlert('Invalid Receipt', 'Please upload an image file only.', 'error');
                return;
            }

            if (file.size > 2 * 1024 * 1024) {
                input.value = '';
                preview.removeAttribute('src');
                preview.classList.remove('visible');
                showCustomAlert('Receipt Too Large', 'Please upload an image smaller than 2 MB.', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = event => {
                preview.src = event.target.result;
                preview.classList.add('visible');
            };
            reader.readAsDataURL(file);
        }

        function createVipKey(category) {
            const prefix = String(category || 'hub').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5) || 'HUB';
            const randomPart = (window.crypto && window.crypto.getRandomValues)
                ? Array.from(window.crypto.getRandomValues(new Uint8Array(8)))
                    .map(value => value.toString(16).padStart(2, '0'))
                    .join('')
                    .toUpperCase()
                    .slice(0, 10)
                : Math.random().toString(36).slice(2, 12).toUpperCase();
            return `VIP-${prefix}-${randomPart}`;
        }

        function formatOrderDate(timestamp) {
            return new Date(timestamp).toLocaleString([], {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }

        function getOrderExpiry(order) {
            if (!order || !order.durationDays || order.status !== 'ACTIVE') return null;
            const activationTime = order.approvedAt || order.createdAt;
            return activationTime + (order.durationDays * 24 * 60 * 60 * 1000);
        }

        function syncExpiredOrders() {
            const orders = readStoredArray('granted_orders');
            const now = Date.now();
            let changed = false;

            orders.forEach(order => {
                const expiry = getOrderExpiry(order);
                if (expiry && now >= expiry) {
                    order.status = 'EXPIRED';
                    order.expiredAt = order.expiredAt || now;
                    order.key = null;
                    changed = true;
                }
            });

            if (changed) {
                localStorage.setItem('granted_orders', JSON.stringify(orders));
            }
            return orders;
        }

        function getOrderState(order) {
            if (!order) return 'INVALID';
            if (order.status === 'PENDING') return 'PENDING';
            if (order.status === 'REJECTED') return 'REJECTED';
            if (order.status === 'REVOKED') return 'REVOKED';
            if (order.status === 'EXPIRED') return 'EXPIRED';
            if (order.status === 'REDEEMED') return 'REDEEMED';
            const expiry = getOrderExpiry(order);
            if (expiry && Date.now() >= expiry) return 'EXPIRED';
            return 'ACTIVE';
        }

        function copyText(text, onSuccess = null) {
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(text).then(() => {
                    showCustomAlert('Copied', 'The VIP key was copied to your clipboard.', 'success');
                    if (typeof onSuccess === 'function') onSuccess();
                }).catch(() => fallbackCopyText(text));
            } else {
                fallbackCopyText(text, onSuccess);
            }
        }

        function fallbackCopyText(text, onSuccess = null) {
            const helper = document.createElement('textarea');
            helper.value = text;
            helper.style.position = 'fixed';
            helper.style.opacity = '0';
            document.body.appendChild(helper);
            helper.select();
            try {
                document.execCommand('copy');
                showCustomAlert('Copied', 'The VIP key was copied to your clipboard.', 'success');
                if (typeof onSuccess === 'function') onSuccess();
            } catch (error) {
                showCustomAlert('Copy Failed', `Copy this key manually: <b>${text}</b>`, 'error');
            }
            helper.remove();
        }

        function copyVipKeyAndRevealRedeem(encodedOrderId, encodedKey) {
            const orderId = decodeURIComponent(encodedOrderId);
            const key = decodeURIComponent(encodedKey);
            const revealButton = document.getElementById(`redeem-after-copy-${encodeURIComponent(orderId)}`);
            copyText(key, () => {
                const copiedKeys = readStoredArray('granted_copied_keys');
                if (!copiedKeys.includes(orderId)) {
                    copiedKeys.push(orderId);
                    localStorage.setItem('granted_copied_keys', JSON.stringify(copiedKeys.slice(-200)));
                }
                if (revealButton) {
                    revealButton.hidden = false;
                    revealButton.removeAttribute('aria-hidden');
                }
            });
        }

        function openRedeemForCopiedKey(encodedKey) {
            const key = decodeURIComponent(encodedKey);
            closeOrdersModal();
            openRedeemPage();
            const input = document.getElementById('redeemKeyInput');
            if (input) {
                input.value = key;
                input.focus();
            }
        }

        function buyProductKey(productName, cardId) {
            const products = JSON.parse(localStorage.getItem('granted_products') || '[]');
            const product = products.find(p => p && p.name === productName);
            if (product && (product.status === 'Updating' || product.status === 'Maintenance')) {
                showCustomAlert(
                    "Temporarily Unavailable",
                    `${productName} is currently marked as <b>${product.status.toUpperCase()}</b>. Key purchase is locked until the status returns to SAFE.`,
                    "error"
                );
                return;
            }

            const currentUser = getActiveUser();
            if (!currentUser) {
                showCustomAlert('Login Required', 'Log in or create an account first so your generated VIP key can be saved securely to this browser.', 'error');
                toggleDrawer();
                return;
            }

            const selectedRadio = document.querySelector(`input[name="duration-${cardId}"]:checked`);
            const durationText = selectedRadio ? selectedRadio.getAttribute('data-label') : '30 Days Access';
            const currentPrice = document.getElementById('price-' + cardId).innerText;
            const planValue = selectedRadio ? selectedRadio.value : '30day';
            const plan = (product.plans || []).find(item => item.value === planValue) || {
                value: planValue,
                label: durationText,
                price: currentPrice
            };

            window.pendingCheckout = {
                productName,
                productCategory: product.category || 'hub',
                paymentMethod: 'Wallet Balance',
                plan: { ...plan, label: durationText, price: currentPrice }
            };

            document.getElementById('checkoutProductName').innerText = productName;
            document.getElementById('checkoutPlanName').innerText = durationText;
            document.getElementById('checkoutPrice').innerText = currentPrice;
            openCheckoutModal();
        }

        function confirmCheckout() {
            const pending = window.pendingCheckout;
            const currentUser = getActiveUser();

            if (!pending || !currentUser) {
                closeCheckoutModal();
                showCustomAlert('Checkout Expired', 'Please select a product again and make sure you are logged in.', 'error');
                return;
            }

            if (window.pendingCheckoutSubmitting) return;

            const submitButton = document.getElementById('submitPaymentButton');
            const priceAmount = parsePesoAmount(pending.plan.price);
            const currentBalance = getUserBalance(currentUser);

            if (!priceAmount) {
                showCustomAlert('Invalid Price', 'This product price is not available. Please contact support.', 'error');
                return;
            }

            if (currentBalance < priceAmount) {
                showCustomAlert(
                    'Insufficient Balance',
                    `You need <b>${formatPeso(priceAmount - currentBalance)}</b> more to complete this purchase. Please cash in at least ₱100 first.`,
                    'error'
                );
                return;
            }

            window.pendingCheckoutSubmitting = true;
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.innerText = 'PROCESSING...';
            }

            const now = Date.now();
            const order = {
                id: createRecordId('ORD'),
                userEmail: currentUser.email.toLowerCase(),
                username: currentUser.username || currentUser.email.split('@')[0],
                productName: pending.productName,
                category: pending.productCategory,
                paymentMethod: 'Wallet Balance',
                amountPaid: priceAmount,
                plan: pending.plan.label,
                price: pending.plan.price,
                key: createVipKey(pending.productCategory),
                status: 'ACTIVE',
                durationDays: parsePlanDays(pending.plan),
                createdAt: now,
                approvedAt: now,
                approvedBy: 'Wallet Balance'
            };

            const orders = readStoredArray('granted_orders');
            orders.unshift(order);
            localStorage.setItem('granted_orders', JSON.stringify(orders));
            setUserBalance(currentUser.email, currentBalance - priceAmount);

            addNotification(
                currentUser.email,
                'PURCHASE_COMPLETED',
                'VIP key purchase completed',
                `Your ${order.plan} VIP key for ${order.productName} is ready. Open My VIP Keys & Orders to view it.`,
                order.id
            );
            showPurchaseToast(order);

            closeCheckoutModal();
            showCustomAlert(
                'Purchase Complete',
                'Check your purchased key in <b>My VIP Keys &amp; Orders</b>.' +
                '<button type="button" class="custom-alert-link-btn" onclick="closeCustomAlert(); openOrdersModal();">OPEN MY VIP KEYS &amp; ORDERS</button>',
                'success'
            );
            refreshBalanceUI();
            if (document.getElementById('ordersModal')?.classList.contains('active')) {
                renderOrders();
            }
        }

        function submitCashIn() {
            const currentUser = getActiveUser();
            if (!currentUser) {
                closeCashInModal();
                showCustomAlert('Login Required', 'Please log in first to cash in wallet balance.', 'error');
                return;
            }
            if (window.cashInSubmitting) return;

            const amountInput = document.getElementById('cashInAmount');
            const numberInput = document.getElementById('cashInGcashNumber');
            const receiptInput = document.getElementById('cashInReceiptInput');
            const submitButton = document.getElementById('submitCashInButton');
            const amount = parsePesoAmount(amountInput ? amountInput.value : '');
            const gcashNumber = normalizeGcashNumber(numberInput ? numberInput.value : '');
            const receiptFile = receiptInput && receiptInput.files ? receiptInput.files[0] : null;

            if (window.cashInPaymentMethod !== 'GCash') {
                showCustomAlert('Choose Payment Method', 'Click the GCash method to display the QR code before submitting.', 'error');
                return;
            }

            if (amount < MIN_CASH_IN) {
                showCustomAlert('Minimum Cash-In Required', `The minimum cash-in amount is ${formatPeso(MIN_CASH_IN)}.`, 'error');
                if (amountInput) amountInput.focus();
                return;
            }

            if (!/^09\d{9}$/.test(gcashNumber)) {
                showCustomAlert('GCash Number Required', 'Enter a valid 11-digit Philippine GCash number.', 'error');
                if (numberInput) numberInput.focus();
                return;
            }

            if (!receiptFile) {
                showCustomAlert('Cash-In Receipt Required', 'Upload your cash-in receipt or screenshot before submitting.', 'error');
                if (receiptInput) receiptInput.focus();
                return;
            }

            if (receiptFile.size > 2 * 1024 * 1024) {
                showCustomAlert('Receipt Too Large', 'Please upload an image smaller than 2 MB.', 'error');
                return;
            }

            window.cashInSubmitting = true;
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.innerText = 'SUBMITTING...';
            }

            const reader = new FileReader();
            reader.onerror = () => {
                window.cashInSubmitting = false;
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerText = 'SUBMIT CASH-IN FOR REVIEW';
                }
                showCustomAlert('Upload Failed', 'The receipt could not be read. Please choose the image again.', 'error');
            };
            reader.onload = event => {
                const now = Date.now();
                const cashIn = {
                    id: createRecordId('CIN'),
                    userEmail: currentUser.email.toLowerCase(),
                    username: currentUser.username || currentUser.email.split('@')[0],
                    amount,
                    paymentMethod: 'GCash',
                    buyerGcashNumber: gcashNumber,
                    receiptImage: event.target.result,
                    status: 'PENDING',
                    createdAt: now,
                    submittedAt: now
                };

                const cashIns = readStoredArray('granted_cashins');
                cashIns.unshift(cashIn);
                localStorage.setItem('granted_cashins', JSON.stringify(cashIns));

                addNotification(
                    OWNER_EMAIL,
                    'CASH_IN_SUBMITTED',
                    'New cash-in request submitted',
                    `${cashIn.username} submitted a ${formatPeso(cashIn.amount)} cash-in request. Please review the payment proof and verify the cash-in details.`,
                    cashIn.id
                );

                closeCashInModal();
                showCustomAlert('Cash-In Submitted', 'Your cash-in request is waiting for admin verification. Your balance will update after approval.', 'success');
                refreshNotificationBadge();
                if (document.getElementById('adminModalOverlay')?.classList.contains('active')) {
                    loadAdminPaymentRequests();
                }
            };
            reader.readAsDataURL(receiptFile);
        }

        function sendChatMessage() {
            const input = document.getElementById('chatInput');
            const chatBody = document.getElementById('chatBody');
            const text = input.value.trim();

            if (!text) return;

            let chats = JSON.parse(localStorage.getItem('granted_chats')) || [];
            let currentUser = JSON.parse(localStorage.getItem('granted_current_user'));
            let senderName = currentUser ? currentUser.username : 'Guest User';
            
            chats.push({
                id: Date.now(),
                sender: senderName,
                message: text,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
            localStorage.setItem('granted_chats', JSON.stringify(chats));

            const userMsg = document.createElement('div');
            userMsg.className = 'chat-msg user';
            userMsg.innerText = text;
            chatBody.appendChild(userMsg);

            input.value = '';
            chatBody.scrollTop = chatBody.scrollHeight;

            setTimeout(() => {
                const botMsg = document.createElement('div');
                botMsg.className = 'chat-msg bot';
                botMsg.innerText = "Thank you for your message! An admin will review your inquiry shortly. For a faster response, message us on Telegram (@GrandeeXM).";
                chatBody.appendChild(botMsg);
                chatBody.scrollTop = chatBody.scrollHeight;
            }, 1000);
        }

        function handleChatEnter(e) {
            if (e.key === 'Enter') { sendChatMessage(); }
        }

        // ─── LOAD PRODUCTS (FIXED: always falls back to DEFAULT_PRODUCTS) ───────
        function getNoGamesBox() {
            const grid = document.getElementById('productsGrid');
            let box = document.getElementById('noGamesNotice');
            if (!box && grid) {
                box = document.createElement('div');
                box.className = 'no-games-box';
                box.id = 'noGamesNotice';
                box.style.display = 'none';
                box.innerHTML = '<div class="no-games-title">NO PRODUCTS AVAILABLE</div><div class="no-games-desc">No products are currently available. Please check back later for updates.</div>';
                grid.appendChild(box);
            }
            return box;
        }

        function renderCategoryFilters(products = readStoredArray('granted_products')) {
            const container = document.getElementById('categoryFilterContainer');
            if (!container) return;

            const categories = getCatalogCategoryEntries(products);
            const activeCategoryStillExists = currentCategory === 'all'
                || currentCategory === 'favorites'
                || categories.some(category => category.value === currentCategory);
            if (!activeCategoryStillExists) currentCategory = 'all';

            container.innerHTML = '';
            const allButton = document.createElement('button');
            allButton.className = `filter-btn${currentCategory === 'all' ? ' active' : ''}`;
            allButton.type = 'button';
            allButton.textContent = 'ALL PRODUCTS';
            allButton.onclick = () => filterCategory('all', allButton);
            container.appendChild(allButton);

            categories.forEach(category => {
                const button = document.createElement('button');
                button.className = `filter-btn${currentCategory === category.value ? ' active' : ''}`;
                button.type = 'button';
                button.textContent = category.label;
                button.onclick = () => filterCategory(category.value, button);
                container.appendChild(button);
            });
        }

        function loadProducts() {
            const grid = document.getElementById('productsGrid');
            if (!grid) return;
            let products = JSON.parse(localStorage.getItem('granted_products') || '[]');

            // FALLBACK: if empty or invalid, load from DEFAULT_PRODUCTS
            if (!Array.isArray(products) || products.length === 0) {
                products = JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
                localStorage.setItem('granted_products', JSON.stringify(products));
            }

            renderCategoryFilters(products);
            grid.innerHTML = '';
            const noGamesBox = getNoGamesBox();
            if (products.length === 0) {
                if (noGamesBox) noGamesBox.style.display = 'block';
                return;
            }
            if (noGamesBox) noGamesBox.style.display = 'none';

            products.forEach((p, index) => {
                const card = document.createElement('div');
                const statusKey = ['Safe', 'Updating', 'Maintenance'].includes(p.status) ? p.status : 'Safe';
                const statusClass = statusKey.toLowerCase();
                const isLocked = statusKey !== 'Safe';
                const statusIcon = isLocked ? '!' : 'OK';
                const statusNote = isLocked ? 'Purchases locked' : 'Ready for access';
                const cardCategory = normalizeCategoryValue(p.categoryLabel || p.category);

                card.className = `product-card status-${statusClass}${isLocked ? ' status-locked' : ''}`;
                card.setAttribute('data-category', cardCategory);
                card.setAttribute('data-product-name', p.name);
                card.setAttribute('data-name', p.name.toLowerCase() + ' ' + (p.description || '').toLowerCase());

                const logoSrc = p.logo || 'https://i.imgur.com/Np8qiGQ.png';
                const plans = Array.isArray(p.plans) && p.plans.length
                    ? p.plans
                    : [{ value: '30day', label: '30 Days Access', price: p.price || 'Contact admin' }];
                const defaultPlan = plans.find(plan => plan.value === '30day') || plans[plans.length - 1];
                const safeLogoSrc = escapeHtml(getImgurImageUrl(logoSrc) || 'https://i.imgur.com/Np8qiGQ.png');
                const safeProductName = escapeHtml(p.name || 'Unnamed Product');
                const safeCardDescription = escapeHtml(p.cardDescription || p.description || '');
                const safeCategoryLabel = escapeHtml(p.categoryLabel || p.category || 'Game');

                card.innerHTML = `
                    <div>
                        <div class="product-status-row">
                            <span class="product-status-badge status-${statusClass}">
                                <span class="status-icon">${statusIcon}</span>
                                ${statusKey.toUpperCase()}
                            </span>
                            <span class="product-status-note${isLocked ? ' warning' : ''}">${statusNote}</span>
                        </div>
                        <div class="product-header-row">
                            <div class="product-title-group">
                                <div class="product-visual${isLocked ? ' visual-locked' : ''}">
                                    <img src="${safeLogoSrc}" alt="${safeProductName} Logo" class="product-thumb" onerror="this.onerror=null;this.src='https://i.imgur.com/Np8qiGQ.png';">
                                    ${isLocked ? `
                                        <div class="product-status-overlay status-${statusClass}" aria-label="${statusKey} status">
                                            <span class="overlay-warning-icon">!</span>
                                            <span class="overlay-status-label">${statusKey.toUpperCase()}</span>
                                        </div>
                                    ` : ''}
                                </div>
                                <div class="product-title">${safeProductName}<span class="product-game-label">GAME: ${safeCategoryLabel}</span></div>
                            </div>
                            <div class="product-actions">
                                <button class="mod-info-badge-btn" onclick="openModInfo(decodeURIComponent('${encodeInlineValue(p.name)}'))">
                                    <svg style="width:12px;height:12px;fill:currentColor;" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v0zm0-8h-2V7h2v2z"/></svg>
                                    Details
                                </button>
                                <button class="mod-info-badge-btn" data-favorite-product="${safeProductName}" onclick="toggleFavorite(decodeURIComponent('${encodeInlineValue(p.name)}'))">
                                    ${isFavorite(p.name) ? 'Saved' : 'Save'}
                                </button>
                            </div>
                        </div>
                        <div class="product-desc">${safeCardDescription}</div>
                    </div>
                    ${!isLocked ? `
                        <div class="product-footer">
                            <div class="access-heading">
                                <span class="access-kicker">SELECT AN ACCESS PLAN</span>
                                <span class="access-title">Choose your VIP key duration</span>
                            </div>
                            <div class="keys-radio-group">
                                ${plans.map(plan => `
                                    <label class="key-radio-label">
                                        <span>${escapeHtml(plan.label)}</span>
                                        <input type="radio" name="duration-${index}" value="${escapeHtml(plan.value)}" data-label="${escapeHtml(plan.label)}" data-price="${escapeHtml(plan.price)}" ${plan.value === defaultPlan.value ? 'checked' : ''} onchange="updateCardPriceByRadio(this, ${index})">
                                    </label>
                                `).join('')}
                            </div>
                            <div class="product-footer-row">
                                <div class="price-block">
                                    <span class="price-label">SELECTED PLAN</span>
                                    <span class="product-price" id="price-${index}">${escapeHtml(defaultPlan.price)}</span>
                                </div>
                                <button class="buy-btn" onclick="buyProductKey(decodeURIComponent('${encodeInlineValue(p.name)}'), ${index})">GET VIP ACCESS</button>
                            </div>
                        </div>
                    ` : ''}
                `;
                grid.appendChild(card);
            });
            updateFavoriteButtons();
            filterProducts();
        }

        // ─── LOAD STATUS TRACKER (FIXED: always falls back to DEFAULT_PRODUCTS) ─
        function loadStatusTracker() {
            const container = document.getElementById('statusTableListContainer');
            if (!container) return;
            let products = JSON.parse(localStorage.getItem('granted_products') || '[]');

            // FALLBACK: if empty or invalid, load from DEFAULT_PRODUCTS
            if (!Array.isArray(products) || products.length === 0) {
                products = JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
                localStorage.setItem('granted_products', JSON.stringify(products));
            }

            container.innerHTML = '';
            if (products.length === 0) {
                container.innerHTML = `<div class="status-row"><div class="status-game-info"><span class="summary-game-name" style="color: var(--text-muted); font-style: italic;">No active systems currently running.</span></div></div>`;
                return;
            }

            products.forEach(p => {
                let dotClass = 'green';
                if (p.status === 'Updating') dotClass = 'yellow';
                if (p.status === 'Maintenance') dotClass = 'maintenance';

                const row = document.createElement('div');
                row.className = 'status-row';
                row.innerHTML = `
                    <div class="status-game-info">
                        <span class="legend-dot ${dotClass}"></span>
                        <span class="summary-game-name">${p.name}</span>
                    </div>
                    <span style="font-size:11px; font-weight:600; color:var(--text-muted);">${p.status.toUpperCase()}</span>
                `;
                container.appendChild(row);
            });
        }

        function loadAdminProducts() {
            const tbody = document.getElementById('adminProductsTableBody');
            if (!tbody) return;
            let products = JSON.parse(localStorage.getItem('granted_products') || '[]');
            tbody.innerHTML = '';

            // Apply the same fallback here.
            if (!Array.isArray(products) || products.length === 0) {
                products = JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
                localStorage.setItem('granted_products', JSON.stringify(products));
            }

            products.forEach((p, index) => {
                const tr = document.createElement('tr');
                const productId = encodeInlineValue(p.id);
                tr.innerHTML = `
                    <td>${escapeHtml(p.name || 'Unnamed Product')}</td>
                    <td>${escapeHtml(p.categoryLabel || p.category || 'GAME')}</td>
                    <td><b>${escapeHtml(p.status || 'Safe')}</b></td>
                    <td>
                        <select class="admin-input" onchange="updateProductStatus(${index}, this.value)">
                            <option value="Safe" ${p.status === 'Safe' ? 'selected' : ''}>Safe (Green)</option>
                            <option value="Updating" ${p.status === 'Updating' ? 'selected' : ''}>Updating (Yellow)</option>
                            <option value="Maintenance" ${p.status === 'Maintenance' ? 'selected' : ''}>Maintenance (Red)</option>
                        </select>
                        <button type="button" class="action-update-btn" onclick="editProduct(decodeURIComponent('${productId}'))">Edit Game</button>
                        <button type="button" class="action-del-btn" onclick="deleteProduct(decodeURIComponent('${productId}'))">Delete</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }

        // ─── UPDATE PRODUCT STATUS (FIXED: re-render all views) ───────────────────
        function refreshAllViews() {
            try { loadProducts(); } catch (e) { console.error('loadProducts failed', e); }
            try { loadStatusTracker(); } catch (e) { console.error('loadStatusTracker failed', e); }
            try { loadAdminProducts(); } catch (e) { console.error('loadAdminProducts failed', e); }
            try { loadAdminPaymentRequests(); } catch (e) { console.error('loadAdminPaymentRequests failed', e); }
        }

        function updateProductStatus(index, newStatus) {
            let products = JSON.parse(localStorage.getItem('granted_products')) || [];
            if (products[index]) {
                products[index].status = newStatus;
                localStorage.setItem('granted_products', JSON.stringify(products));
                refreshAllViews();
                showCustomAlert('Status Updated', products[index].name + ' is now ' + newStatus + '.', 'success');
            }
        }

        function loadAdminUsers() {
            const tbody = document.getElementById('adminUsersTableBody');
            let users = JSON.parse(localStorage.getItem('granted_users')) || [];
            tbody.innerHTML = '';

            users.forEach((u, index) => {
                const isOwner = u.role === OWNER_ROLE;
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${u.username}</td>
                    <td>${u.email}</td>
                    <td>${isOwner ? '<span class="owner-badge">OWNER</span>' : (u.role || 'user')}</td>
                    <td><span class="pw-mask">${'•'.repeat(Math.min(u.password ? u.password.length : 6, 12))}</span></td>
                    <td>
                        ${isOwner
                            ? `<span style="font-size:10px; color:var(--text-muted); font-style:italic;">Protected</span>`
                            : `<input type="password" class="pw-input" id="newpw-${index}" placeholder="New password">`
                        }
                    </td>
                    <td>
                        ${isOwner
                            ? `<span style="font-size:10px; color:var(--text-muted); font-style:italic;">Self-change only</span>`
                            : `<button class="action-update-btn" onclick="updateUserPassword(${index})">Update</button>
                               <button class="action-del-btn" style="margin-left:6px;" onclick="deleteUser(${index})">Remove</button>`
                        }
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }

        function updateUserPassword(index) {
            let users = JSON.parse(localStorage.getItem('granted_users')) || [];
            const user = users[index];

            if (!user) return;
            if (user.role === OWNER_ROLE) {
                showCustomAlert("Protected Account", "Owner account password cannot be changed here.", "error");
                return;
            }

            const inputEl = document.getElementById(`newpw-${index}`);
            const newPw = inputEl ? inputEl.value : '';

            if (!newPw) {
                showCustomAlert("Missing Password", "Please enter a new password first.", "error");
                return;
            }

            const minLength = newPw.length >= 6;
            const hasUpperCase = /[A-Z]/.test(newPw);
            const hasNumber = /[0-9]/.test(newPw);

            if (!minLength || !hasUpperCase || !hasNumber) {
                showCustomAlert("Password Requirements Error", "• Must be at least 6 characters<br>• Must contain at least one uppercase letter (A-Z)<br>• Must contain at least one number (0-9)", "error");
                return;
            }

            users[index].password = newPw;
            localStorage.setItem('granted_users', JSON.stringify(users));

            let currentUser = JSON.parse(localStorage.getItem('granted_current_user'));
            if (currentUser && currentUser.email.toLowerCase() === user.email.toLowerCase()) {
                localStorage.setItem('granted_current_user', JSON.stringify(users[index]));
            }

            showCustomAlert("Password Updated", `Password for <b>${user.username}</b> has been updated successfully.`, "success");
            loadAdminUsers();
        }

        function deleteUser(index) {
            let users = JSON.parse(localStorage.getItem('granted_users')) || [];
            const user = users[index];
            if (!user || user.role === OWNER_ROLE) {
                showCustomAlert("Protected Account", "Owner account cannot be removed.", "error");
                return;
            }
            users.splice(index, 1);
            localStorage.setItem('granted_users', JSON.stringify(users));
            loadAdminUsers();
        }

        function loadAdminChats() {
            const tbody = document.getElementById('adminChatInboxBody');
            let chats = JSON.parse(localStorage.getItem('granted_chats')) || [];
            tbody.innerHTML = '';

            if (chats.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted); font-style:italic;">No support messages yet.</td></tr>`;
                return;
            }

            chats.forEach((c, index) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><b>${c.sender}</b></td>
                    <td>${c.message}</td>
                    <td style="font-size:11px; color:var(--text-muted);">${c.time}</td>
                    <td><button class="action-del-btn" onclick="deleteChat(${index})">Delete</button></td>
                `;
                tbody.appendChild(tr);
            });
        }

        function deleteChat(index) {
            let chats = JSON.parse(localStorage.getItem('granted_chats')) || [];
            chats.splice(index, 1);
            localStorage.setItem('granted_chats', JSON.stringify(chats));
            loadAdminChats();
        }

        function renderOrders() {
            const currentUser = getActiveUser();
            const summary = document.getElementById('ordersSummary');
            const list = document.getElementById('ordersList');
            if (!summary || !list) return;

            if (!currentUser) {
                summary.innerHTML = '';
                list.innerHTML = '<div class="no-games-desc">Log in to view your orders.</div>';
                return;
            }

            const allOrders = syncExpiredOrders();
            const orders = allOrders.filter(order =>
                String(order.userEmail || '').toLowerCase() === currentUser.email.toLowerCase()
            );
            const visibleOrders = orders.filter(order => !['REVOKED', 'EXPIRED', 'REDEEMED'].includes(getOrderState(order)));
            const activeCount = orders.filter(order => getOrderState(order) === 'ACTIVE').length;
            const expiredCount = orders.filter(order => getOrderState(order) === 'EXPIRED').length;
            const pendingCount = orders.filter(order => getOrderState(order) === 'PENDING').length;
            const redeemedCount = orders.filter(order => getOrderState(order) === 'REDEEMED').length;

            summary.innerHTML = `
                <div class="hl-item"><span class="hl-dot"></span> ${orders.length} total</div>
                <div class="hl-item"><span class="hl-dot"></span> ${activeCount} active</div>
                <div class="hl-item"><span class="hl-dot"></span> ${expiredCount} expired</div>
                <div class="hl-item"><span class="hl-dot"></span> ${pendingCount} pending</div>
                <div class="hl-item"><span class="hl-dot"></span> ${redeemedCount} redeemed</div>
            `;

            if (visibleOrders.length === 0) {
                list.innerHTML = orders.length
                    ? '<div class="no-games-box" style="display:block;"><div class="no-games-title">NO ACTIVE ORDERS</div><div class="no-games-desc">Revoked and expired key records are available on the Revoked or Expired Keys page.</div></div>'
                    : '<div class="no-games-box" style="display:block;"><div class="no-games-title">NO VIP KEYS YET</div><div class="no-games-desc">Choose a product and generate your first access key.</div></div>';
                return;
            }

            list.innerHTML = visibleOrders.map(order => {
                const state = getOrderState(order);
                const expiry = getOrderExpiry(order);
                const expiryText = expiry
                    ? `Expires ${new Date(expiry).toLocaleDateString()}`
                    : state === 'ACTIVE' ? 'Lifetime access' : '';
                const stateColor = state === 'ACTIVE'
                    ? '#10b981'
                    : state === 'PENDING' ? '#f59e0b'
                    : state === 'REJECTED' ? '#ef4444'
                    : '#94a3b8';
                const statusText = state === 'PENDING'
                    ? 'Payment proof submitted — waiting for admin review.'
                    : state === 'REJECTED'
                    ? (order.rejectionReason || 'Payment proof was rejected by the administrator.')
                    : state === 'REVOKED'
                    ? 'This VIP key was revoked by admin.'
                    : '';
                const encodedKey = order.key ? encodeURIComponent(order.key) : '';
                const encodedOrderId = encodeURIComponent(order.id);
                const copiedKeyIds = readStoredArray('granted_copied_keys');
                const keyWasCopied = copiedKeyIds.includes(order.id);
                const keyMarkup = order.key
                    ? `<div style="font-family:monospace; font-size:11px; color:${stateColor}; word-break:break-all;">${escapeHtml(order.key)}</div>
                       <button class="mod-info-badge-btn" style="margin-top:7px;" onclick="copyVipKeyAndRevealRedeem('${encodedOrderId}', '${encodedKey}')">Copy Key</button>
                       <button type="button" class="copy-redeem-btn" id="redeem-after-copy-${encodedOrderId}"${keyWasCopied ? '' : ' hidden'} onclick="openRedeemForCopiedKey('${encodedKey}')">REDEEM THIS KEY</button>`
                    : `<div style="font-size:11px;color:${stateColor};max-width:210px;">${escapeHtml(statusText)}</div>`;

                return `
                    <div class="status-row" style="margin-bottom: 10px; align-items: flex-start; gap: 12px;">
                        <div class="status-game-info" style="align-items: flex-start;">
                            <span class="legend-dot" style="background:${stateColor}; box-shadow:0 0 8px ${stateColor}; margin-top:5px;"></span>
                            <div>
                                <div class="summary-game-name">${escapeHtml(order.productName)}</div>
                                <div style="font-size:11px; color:var(--text-muted); margin-top:4px;">${escapeHtml(order.plan)}${expiryText ? ` · ${escapeHtml(expiryText)}` : ''}</div>
                                <div style="font-size:10px; color:var(--text-muted); margin-top:3px;">${formatOrderDate(order.createdAt)}</div>
                            </div>
                        </div>
                        <div style="text-align:right; margin-left:auto;">
                            ${keyMarkup}
                        </div>
                    </div>
                `;
            }).join('');
        }

        function renderKeyHistory() {
            const currentUser = getActiveUser();
            const list = document.getElementById('keyHistoryList');
            if (!list) return;

            if (!currentUser) {
                list.innerHTML = '<div class="saved-empty-state"><div class="saved-empty-title">LOGIN REQUIRED</div><div class="saved-empty-description">Log in to view your revoked or expired key records.</div></div>';
                return;
            }

            const orders = syncExpiredOrders()
                .filter(order =>
                    String(order.userEmail || '').toLowerCase() === currentUser.email.toLowerCase()
                )
                .map(order => ({ order, state: getOrderState(order) }))
                .filter(item => ['REVOKED', 'EXPIRED'].includes(item.state))
                .sort((a, b) => {
                    const aDate = a.order.revokedAt || a.order.expiredAt || a.order.approvedAt || a.order.createdAt || 0;
                    const bDate = b.order.revokedAt || b.order.expiredAt || b.order.approvedAt || b.order.createdAt || 0;
                    return bDate - aDate;
                });

            if (!orders.length) {
                list.innerHTML = `
                    <div class="saved-empty-state">
                        <div class="saved-empty-title">NO REVOKED OR EXPIRED KEYS</div>
                        <div class="saved-empty-description">Keys that are revoked or expire will be listed here.</div>
                    </div>
                `;
                return;
            }

            list.innerHTML = orders.map(({ order, state }) => {
                const isRevoked = state === 'REVOKED';
                const eventTime = order.revokedAt || order.expiredAt || order.approvedAt || order.createdAt;
                const eventLabel = isRevoked ? 'Revoked' : 'Expired';
                const statusNote = isRevoked
                    ? 'This key was revoked by the administrator and can no longer be used.'
                    : 'This key reached the end of its access period and can no longer be used.';

                return `
                    <article class="saved-product-card history-key-card">
                        <div class="saved-product-info">
                            <div class="saved-product-name">${escapeHtml(order.productName || 'VIP Product')}</div>
                            <div class="saved-product-category">${escapeHtml(order.plan || 'Access Plan')}</div>
                            <div class="saved-product-description">${eventLabel} on ${escapeHtml(formatOrderDate(eventTime))}</div>
                            <div class="history-key-note">${statusNote}</div>
                        </div>
                        <div class="history-key-status ${isRevoked ? 'revoked' : 'expired'}">${state}</div>
                    </article>
                `;
            }).join('');
        }

        function isOwnerSession() {
            const currentUser = getActiveUser();
            return Boolean(currentUser && currentUser.role === OWNER_ROLE);
        }

        function findOrderById(orderId) {
            return readStoredArray('granted_orders').find(order => order.id === orderId);
        }

        function findCashInById(cashInId) {
            return readStoredArray('granted_cashins').find(cashIn => cashIn.id === cashInId);
        }

        function viewPaymentReceipt(encodedOrderId) {
            if (!isOwnerSession()) {
                showCustomAlert('Access Denied', 'Owner access required.', 'error');
                return;
            }
            const cashIn = findCashInById(decodeURIComponent(encodedOrderId));
            if (!cashIn || !cashIn.receiptImage) {
                showCustomAlert('Receipt Not Found', 'This cash-in request does not have a readable receipt image.', 'error');
                return;
            }
            const receiptWindow = window.open('', '_blank');
            if (!receiptWindow) {
                showCustomAlert('Popup Blocked', 'Allow popups to view the cash-in receipt.', 'error');
                return;
            }
            receiptWindow.document.write(`
                <!doctype html>
                <html>
                <head><title>Cash-In Receipt - ${escapeHtml(cashIn.username || 'Customer')}</title></head>
                <body style="margin:0;background:#111;display:flex;align-items:center;justify-content:center;min-height:100vh;">
                    <img src="${cashIn.receiptImage}" alt="Cash-in receipt" style="max-width:96vw;max-height:96vh;object-fit:contain;">
                </body>
                </html>
            `);
            receiptWindow.document.close();
        }

        function loadAdminPaymentRequests() {
            const tbody = document.getElementById('adminPaymentRequestsTableBody');
            if (!tbody) return;
            const pendingCashIns = readStoredArray('granted_cashins')
                .filter(cashIn => cashIn.status === 'PENDING');
            tbody.innerHTML = '';

            if (!pendingCashIns.length) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);font-style:italic;">No pending cash-in requests.</td></tr>';
                return;
            }

            pendingCashIns.forEach(cashIn => {
                const encodedCashInId = encodeURIComponent(cashIn.id);
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><b>${escapeHtml(cashIn.username || 'Guest')}</b><br><span style="font-size:10px;color:var(--text-muted);">${escapeHtml(cashIn.userEmail || '')}</span></td>
                    <td><b>${formatPeso(cashIn.amount)}</b><br><span style="font-size:10px;color:var(--text-muted);">Wallet cash-in</span></td>
                    <td style="font-family:monospace;font-size:11px;">${escapeHtml(cashIn.buyerGcashNumber || '—')}</td>
                    <td>
                        <img src="${cashIn.receiptImage}" class="admin-receipt-thumb" alt="Cash-in receipt" onclick="viewPaymentReceipt('${encodedCashInId}')">
                        <button type="button" class="admin-receipt-link" onclick="viewPaymentReceipt('${encodedCashInId}')">Open receipt</button>
                    </td>
                    <td style="font-size:11px;color:var(--text-muted);">${formatOrderDate(cashIn.submittedAt || cashIn.createdAt)}</td>
                    <td style="white-space:nowrap;">
                        <button class="action-approve-btn" onclick="approvePaymentOrder('${encodedCashInId}')">Accept</button>
                        <button class="action-reject-btn" style="margin-left:5px;" onclick="rejectPaymentOrder('${encodedCashInId}')">Reject</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }

        function approvePaymentOrder(encodedOrderId) {
            if (!isOwnerSession()) {
                showCustomAlert('Access Denied', 'Owner access required.', 'error');
                return;
            }
            const cashInId = decodeURIComponent(encodedOrderId);
            const cashIns = readStoredArray('granted_cashins');
            const cashIn = cashIns.find(item => item.id === cashInId);
            if (!cashIn || cashIn.status !== 'PENDING') {
                showCustomAlert('Request Already Handled', 'This cash-in request is no longer pending.', 'error');
                loadAdminPaymentRequests();
                return;
            }
            if (!window.confirm(`Approve the ${formatPeso(cashIn.amount)} cash-in for ${cashIn.username || 'this customer'}? The amount will be added to the wallet balance.`)) return;

            const approvedAt = Date.now();
            cashIn.status = 'APPROVED';
            cashIn.approvedAt = approvedAt;
            cashIn.approvedBy = OWNER_EMAIL;
            localStorage.setItem('granted_cashins', JSON.stringify(cashIns));

            const updatedBalance = getUserBalance({ email: cashIn.userEmail }) + Number(cashIn.amount || 0);
            setUserBalance(cashIn.userEmail, updatedBalance);
            const approvalMessage = `Your ${formatPeso(cashIn.amount)} cash-in has been approved. Your new wallet balance is ${formatPeso(updatedBalance)}.`;

            addNotification(
                cashIn.userEmail,
                'CASH_IN_APPROVED',
                'Cash-in approved',
                approvalMessage,
                cashIn.id
            );

            loadAdminPaymentRequests();
            loadAdminOrders();
            showCustomAlert('Cash-In Approved', `${formatPeso(cashIn.amount)} has been added to ${escapeHtml(cashIn.username || 'the customer')}'s wallet balance.`, 'success');
        }

        function rejectPaymentOrder(encodedOrderId) {
            if (!isOwnerSession()) {
                showCustomAlert('Access Denied', 'Owner access required.', 'error');
                return;
            }
            const cashInId = decodeURIComponent(encodedOrderId);
            const cashIns = readStoredArray('granted_cashins');
            const cashIn = cashIns.find(item => item.id === cashInId);
            if (!cashIn || cashIn.status !== 'PENDING') {
                showCustomAlert('Request Already Handled', 'This cash-in request is no longer pending.', 'error');
                loadAdminPaymentRequests();
                return;
            }

            const rejectionChoices = {
                '1': 'Wrong amount sent. The amount in the receipt does not match the submitted cash-in amount.',
                '2': 'Invalid receipt. The payment receipt is incorrect, unreadable, or does not match the transaction.',
                '3': 'Payment not received. No payment was received in the recipient\'s GCash account.'
            };
            const choice = window.prompt(
                'Select a reason for rejecting this cash-in request:\n\n' +
                '1. Wrong amount sent\n' +
                '2. Invalid or incorrect receipt\n' +
                '3. Payment was not received in the recipient\'s GCash account\n\n' +
                'Enter 1, 2, or 3:',
                '1'
            );
            const rejectionReason = rejectionChoices[String(choice || '').trim()];

            if (!rejectionReason) {
                showCustomAlert('Rejection Reason Required', 'Enter 1, 2, or 3 to select a valid rejection reason.', 'error');
                return;
            }

            if (!window.confirm(
                `Reject the ${formatPeso(cashIn.amount)} cash-in request for ${cashIn.username || 'this customer'}?\n\nReason: ${rejectionReason}`
            )) return;

            cashIn.status = 'REJECTED';
            cashIn.rejectedAt = Date.now();
            cashIn.rejectionReason = rejectionReason;
            localStorage.setItem('granted_cashins', JSON.stringify(cashIns));

            addNotification(
                cashIn.userEmail,
                'CASH_IN_REJECTED',
                'Cash-in request rejected',
                cashIn.rejectionReason,
                cashIn.id
            );

            loadAdminPaymentRequests();
            loadAdminOrders();
            showCustomAlert('Cash-In Rejected', 'The customer has been notified.', 'success');
        }

        function loadAdminOrders() {
            const tbody = document.getElementById('adminOrdersTableBody');
            if (!tbody) return;
            const orders = syncExpiredOrders();
            tbody.innerHTML = '';

            if (orders.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:var(--text-muted); font-style:italic;">No VIP key orders yet.</td></tr>';
                return;
            }

            orders.forEach(order => {
                const state = getOrderState(order);
                const stateColor = state === 'ACTIVE'
                    ? '#10b981'
                    : state === 'PENDING' ? '#f59e0b'
                    : state === 'REJECTED' ? '#ef4444'
                    : state === 'REDEEMED' ? '#38bdf8'
                    : '#94a3b8';
                const encodedOrderId = encodeURIComponent(order.id);
                const actionMarkup = state === 'ACTIVE'
                    ? `<button class="action-del-btn" onclick="deleteOrder('${encodedOrderId}')">Revoke</button>`
                    : '<span style="font-size:10px;color:var(--text-muted);font-style:italic;">No action</span>';
                const keyLabel = order.key || (
                    state === 'REVOKED' || state === 'EXPIRED'
                        ? 'Key removed'
                        : state === 'REDEEMED'
                        ? 'Claimed by customer'
                        : 'Waiting for approval'
                );
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><b>${escapeHtml(order.username || 'Guest')}</b><br><span style="font-size:10px;color:var(--text-muted);">${escapeHtml(order.userEmail || '')}</span></td>
                    <td>${escapeHtml(order.productName || '')}<br><span style="font-size:10px;color:var(--text-muted);">${escapeHtml(order.plan || '')} · ${escapeHtml(order.price || '')}</span></td>
                    <td><span style="font-family:monospace;font-size:10px;">${escapeHtml(keyLabel)}</span></td>
                    <td><b style="color:${stateColor};">${state}</b></td>
                    <td style="font-size:11px;color:var(--text-muted);">${formatOrderDate(order.createdAt)}</td>
                    <td>${actionMarkup}</td>
                `;
                tbody.appendChild(tr);
            });
        }

        function deleteOrder(encodedOrderId) {
            const orders = readStoredArray('granted_orders');
            const orderId = decodeURIComponent(encodedOrderId);
            const orderIndex = orders.findIndex(item => item.id === orderId);
            const order = orderIndex >= 0 ? orders[orderIndex] : null;
            if (!order) return;
            if (order.status !== 'ACTIVE') {
                showCustomAlert('Cannot Revoke', 'Only an active VIP key can be revoked.', 'error');
                return;
            }
            if (!window.confirm(`Revoke the key ${order.key}?`)) return;
            const revokedKey = order.key;
            order.status = 'REVOKED';
            order.revokedAt = Date.now();
            order.key = null;
            orders[orderIndex] = order;
            localStorage.setItem('granted_orders', JSON.stringify(orders));
            loadAdminOrders();
            addNotification(
                order.userEmail,
                'KEY_REVOKED',
                'VIP key revoked',
                `Your ${order.productName} VIP key has been revoked by admin.`,
                order.id
            );
            showCustomAlert('Key Revoked', `${revokedKey || 'The VIP key'} has been permanently removed and is no longer valid.`, 'success');
        }

        function openSavedProducts() {
            const drawer = document.getElementById('sideDrawer');
            if (drawer && drawer.classList.contains('active')) {
                toggleDrawer();
            }

            renderSavedProducts();
            const page = document.getElementById('savedProductsPage');
            if (page) {
                page.classList.add('active');
                page.setAttribute('aria-hidden', 'false');
            }
            document.body.classList.add('saved-page-open');
        }

        function closeSavedProducts() {
            const page = document.getElementById('savedProductsPage');
            if (page) {
                page.classList.remove('active');
                page.setAttribute('aria-hidden', 'true');
            }
            document.body.classList.remove('saved-page-open');
        }

        function openKeyHistory() {
            if (!getActiveUser()) {
                showCustomAlert('Login Required', 'Please log in first to view revoked or expired keys.', 'error');
                return;
            }

            renderKeyHistory();
            const page = document.getElementById('keyHistoryPage');
            if (page) {
                page.classList.add('active');
                page.setAttribute('aria-hidden', 'false');
            }
            document.body.classList.add('saved-page-open');
        }

        function closeKeyHistory() {
            const page = document.getElementById('keyHistoryPage');
            if (page) {
                page.classList.remove('active');
                page.setAttribute('aria-hidden', 'true');
            }
            document.body.classList.remove('saved-page-open');
        }

        const ADMIN_TELEGRAM_USERNAME = 'GrandeeXM';
        const ADMIN_TELEGRAM_URL = `https://t.me/${ADMIN_TELEGRAM_USERNAME}`;
        let redeemIsProcessing = false;
        let redeemRequestToken = 0;

        function showRedeemLoading() {
            const loading = document.getElementById('redeemLoading');
            if (!loading) return;
            const status = document.getElementById('redeemLoadingStatus');
            const code = document.getElementById('redeemLoadingCode');
            const submitButton = document.querySelector('.redeem-submit-btn');
            loading.hidden = false;
            if (status) status.innerText = 'Decrypting your access record...';
            if (code) code.innerText = 'CHECK 01/03';
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.innerText = 'VERIFYING...';
            }

            window.clearTimeout(window.redeemLoadingStepTimer);
            window.redeemLoadingStepTimer = window.setTimeout(() => {
                if (status) status.innerText = 'Matching product and duration...';
                if (code) code.innerText = 'CHECK 02/03';
            }, 300);
            window.redeemLoadingStepTimer = window.setTimeout(() => {
                if (status) status.innerText = 'Preparing secure Telegram claim...';
                if (code) code.innerText = 'CHECK 03/03';
            }, 650);
        }

        function hideRedeemLoading() {
            const loading = document.getElementById('redeemLoading');
            const submitButton = document.querySelector('.redeem-submit-btn');
            if (loading) loading.hidden = true;
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerText = 'REDEEM KEY';
            }
            window.clearTimeout(window.redeemLoadingStepTimer);
        }

        function openRedeemPage() {
            const currentUser = getActiveUser();
            if (!currentUser) {
                showCustomAlert('Login Required', 'Please log in first so we can verify the VIP key saved to your account.', 'error');
                toggleDrawer();
                return;
            }

            const page = document.getElementById('redeemPage');
            if (!page) return;
            page.classList.add('active');
            page.setAttribute('aria-hidden', 'false');
            document.body.classList.add('saved-page-open');
            resetRedeemPage();
        }

        function resetRedeemPage() {
            redeemRequestToken += 1;
            redeemIsProcessing = false;
            hideRedeemLoading();
            const input = document.getElementById('redeemKeyInput');
            if (input) {
                input.value = '';
                input.focus();
            }
            const claimCard = document.getElementById('redeemClaimCard');
            if (claimCard) claimCard.hidden = true;
            const result = document.getElementById('redeemResult');
            if (result) {
                result.className = 'redeem-result';
                result.innerHTML = '';
            }
            const messageBox = document.getElementById('redeemTelegramMessage');
            if (messageBox) messageBox.value = '';
            const telegramLink = document.getElementById('redeemTelegramLink');
            if (telegramLink) {
                telegramLink.href = '#';
                telegramLink.classList.add('is-disabled');
                telegramLink.setAttribute('aria-disabled', 'true');
                telegramLink.innerText = 'CLAIM THIS PURCHASE ON TELEGRAM';
            }
        }

        function closeRedeemPage() {
            redeemRequestToken += 1;
            redeemIsProcessing = false;
            hideRedeemLoading();
            const page = document.getElementById('redeemPage');
            if (page) {
                page.classList.remove('active');
                page.setAttribute('aria-hidden', 'true');
            }
            document.body.classList.remove('saved-page-open');
        }

        function handleRedeemKeyEnter(event) {
            if (event.key === 'Enter') submitRedeemKey();
        }

        function showRedeemResult(message, type) {
            const result = document.getElementById('redeemResult');
            if (!result) return;
            result.className = `redeem-result visible ${type}`;
            result.innerHTML = message;
        }

        function getRedeemDuration(order) {
            if (order && order.plan) {
                return String(order.plan).replace(/\s+/g, ' ').trim();
            }
            if (order && Number.isFinite(Number(order.durationDays)) && Number(order.durationDays) > 0) {
                return `${Number(order.durationDays)} Days Access`;
            }
            return 'Lifetime Access';
        }

        function buildRedeemTelegramMessage(order, currentUser) {
            const productName = String(order.productName || 'VIP Product').trim();
            const duration = getRedeemDuration(order);
            const key = String(order.key || '').trim();
            return [
                `Hello Admin @${ADMIN_TELEGRAM_USERNAME}, I want to claim this VIP purchase.`,
                '',
                `VIP Key: ${key}`,
                `Cheat / Product: ${productName}`,
                `Duration: ${duration}`,
                `Account: ${currentUser.username || currentUser.email.split('@')[0]}`
            ].join('\n');
        }

        function renderRedeemClaim(order, currentUser) {
            const claimCard = document.getElementById('redeemClaimCard');
            const productValue = document.getElementById('redeemProductValue');
            const durationValue = document.getElementById('redeemDurationValue');
            const keyValue = document.getElementById('redeemKeyValue');
            const messageBox = document.getElementById('redeemTelegramMessage');
            const telegramLink = document.getElementById('redeemTelegramLink');
            if (!claimCard || !productValue || !durationValue || !keyValue || !messageBox || !telegramLink) return;

            const message = buildRedeemTelegramMessage(order, currentUser);
            productValue.innerText = order.productName || 'VIP Product';
            durationValue.innerText = getRedeemDuration(order);
            keyValue.innerText = order.key || '—';
            messageBox.value = message;
            telegramLink.href = `${ADMIN_TELEGRAM_URL}?text=${encodeURIComponent(message)}`;
            telegramLink.classList.remove('is-disabled');
            telegramLink.removeAttribute('aria-disabled');
            telegramLink.innerText = `CLAIM ${order.productName || 'PURCHASE'} ON TELEGRAM`;
            claimCard.hidden = false;
        }

        function submitRedeemKey() {
            if (redeemIsProcessing) return;
            const currentUser = getActiveUser();
            const input = document.getElementById('redeemKeyInput');
            const claimCard = document.getElementById('redeemClaimCard');
            const enteredKey = input ? input.value.trim().toUpperCase() : '';

            if (!currentUser) {
                showRedeemResult('Please log in first so your purchase can be verified.', 'error');
                if (claimCard) claimCard.hidden = true;
                return;
            }

            if (!enteredKey) {
                showRedeemResult('Enter your VIP key to continue.', 'error');
                if (claimCard) claimCard.hidden = true;
                if (input) input.focus();
                return;
            }

            redeemIsProcessing = true;
            const requestToken = ++redeemRequestToken;
            showRedeemLoading();

            window.setTimeout(() => {
                if (requestToken !== redeemRequestToken) return;
                redeemIsProcessing = false;
                hideRedeemLoading();

                const orders = syncExpiredOrders();
                const orderIndex = orders.findIndex(order =>
                    String(order.userEmail || '').toLowerCase() === currentUser.email.toLowerCase() &&
                    getOrderState(order) === 'ACTIVE' &&
                    String(order.key || '').toUpperCase() === enteredKey
                );
                const activeOrder = orderIndex >= 0 ? orders[orderIndex] : null;

                if (!activeOrder) {
                    showRedeemResult('This key is invalid, expired, revoked, or is not linked to your logged-in account.', 'error');
                    if (claimCard) claimCard.hidden = true;
                    return;
                }

                const redeemedAt = Date.now();
                activeOrder.status = 'REDEEMED';
                activeOrder.redeemedAt = redeemedAt;
                activeOrder.redeemedBy = currentUser.email.toLowerCase();
                orders[orderIndex] = activeOrder;
                localStorage.setItem('granted_orders', JSON.stringify(orders));

                const duration = getRedeemDuration(activeOrder);
                addNotification(
                    currentUser.email,
                    'KEY_REDEEMED',
                    'VIP key redeemed successfully',
                    `${activeOrder.productName} · ${duration}. Your Telegram claim message is ready for @${ADMIN_TELEGRAM_USERNAME}.`,
                    activeOrder.id
                );
                refreshNotificationBadge();
                if (document.getElementById('notificationsModal')?.classList.contains('active')) {
                    renderNotifications();
                }
                if (document.getElementById('ordersModal')?.classList.contains('active')) {
                    renderOrders();
                }

                showRedeemResult('Key redeemed successfully. It has been removed from My VIP Keys & Orders and your Telegram claim message is ready below.', 'success');
                renderRedeemClaim(activeOrder, currentUser);
            }, 950);
        }

        function copyRedeemMessage() {
            const messageBox = document.getElementById('redeemTelegramMessage');
            if (messageBox) copyText(messageBox.value);
        }

        function filterCategory(category, btnEl) {
            currentCategory = category;
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btnEl.classList.add('active');
            filterProducts();
        }

        function filterProducts() {
            const searchEl = document.getElementById('searchInput');
            const query = searchEl ? searchEl.value.toLowerCase() : '';
            const cards = document.querySelectorAll('.products-grid .product-card');
            let visibleCount = 0;

            cards.forEach(card => {
                const cat = card.getAttribute('data-category');
                const text = card.getAttribute('data-name');

                const matchesCategory = currentCategory === 'favorites'
                    ? isFavorite(card.getAttribute('data-product-name'))
                    : (currentCategory === 'all' || cat === currentCategory);
                const matchesSearch = text.includes(query);

                if (matchesCategory && matchesSearch) {
                    card.classList.remove('hide');
                    visibleCount++;
                } else {
                    card.classList.add('hide');
                }
            });

            const noGamesBox = getNoGamesBox();
            if (noGamesBox) noGamesBox.style.display = (visibleCount === 0) ? 'block' : 'none';
        }

        function checkKeyStatus() {
            const inputVal = document.getElementById('keyInput').value.trim();
            const resultBox = document.getElementById('checkerResult');

            if (!inputVal) {
                resultBox.className = 'checker-result error';
                resultBox.innerText = 'Please enter a valid VIP key to check.';
                return;
            }

            const normalizedKey = inputVal.toUpperCase();
            const orders = syncExpiredOrders();
            const order = orders.find(item => String(item.key || '').toUpperCase() === normalizedKey);

            if (order && getOrderState(order) === 'ACTIVE') {
                const expiry = getOrderExpiry(order);
                const expiryText = expiry
                    ? `Expires on ${new Date(expiry).toLocaleDateString()}`
                    : 'Lifetime access';
                resultBox.className = 'checker-result success';
                resultBox.innerHTML = `<b>Status: ACTIVE & VALID</b> — ${order.productName} · ${order.plan} · ${expiryText}`;
            } else if (order) {
                resultBox.className = 'checker-result error';
                resultBox.innerHTML = `<b>Status: ${getOrderState(order)}</b> — This key is no longer available for access.`;
            } else {
                resultBox.className = 'checker-result error';
                resultBox.innerHTML = `<b>Status: INVALID OR EXPIRED</b> — No matching VIP key was found in this browser.`;
            }
        }

        function toggleFaq(btn) {
            const item = btn.parentElement;
            const wasActive = item.classList.contains('active');
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
            if (!wasActive) { item.classList.add('active'); }
        }

        window.addEventListener('storage', event => {
            if (event.key !== 'granted_orders' || !event.newValue) return;
            let nextOrders = [];
            try {
                nextOrders = JSON.parse(event.newValue);
            } catch (error) {
                return;
            }
            if (!Array.isArray(nextOrders)) return;
            nextOrders
                .filter(order => order && order.status === 'ACTIVE')
                .sort((a, b) => Number(a.createdAt || 0) - Number(b.createdAt || 0))
                .forEach(order => showPurchaseToast(order));
        });

        document.addEventListener('keydown', event => {
            if (event.key !== 'Escape') return;

            document.querySelectorAll('.modal-overlay.active, .mod-info-modal.active, .custom-alert-overlay.active, .admin-modal-overlay.active')
                .forEach(modal => modal.classList.remove('active'));

            const drawer = document.getElementById('sideDrawer');
            const drawerOverlay = document.getElementById('drawerOverlay');
            if (drawer && drawer.classList.contains('active')) {
                drawer.classList.remove('active');
                drawerOverlay.classList.remove('active');
            }

            const savedPage = document.getElementById('savedProductsPage');
            if (savedPage && savedPage.classList.contains('active')) {
                closeSavedProducts();
            }

            const keyHistoryPage = document.getElementById('keyHistoryPage');
            if (keyHistoryPage && keyHistoryPage.classList.contains('active')) {
                closeKeyHistory();
            }

            const redeemPage = document.getElementById('redeemPage');
            if (redeemPage && redeemPage.classList.contains('active')) {
                closeRedeemPage();
            }
        });

// Hacker-style connected bubble network for the page background.
        (() => {
            const canvas = document.getElementById('bg-canvas');
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            const state = { width: 0, height: 0, dpr: 1, nodes: [] };
            const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            function resizeNetwork() {
                state.width = window.innerWidth;
                state.height = window.innerHeight;
                state.dpr = Math.min(window.devicePixelRatio || 1, 2);
                canvas.width = Math.floor(state.width * state.dpr);
                canvas.height = Math.floor(state.height * state.dpr);
                ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);

                const count = Math.min(
                    72,
                    Math.max(30, Math.floor((state.width * state.height) / 15500))
                );

                state.nodes = Array.from({ length: count }, (_, index) => ({
                    x: Math.random() * state.width,
                    y: Math.random() * state.height,
                    vx: (Math.random() - 0.5) * 0.16,
                    vy: (Math.random() - 0.5) * 0.16,
                    radius: 1 + Math.random() * 1.25,
                    phase: index * 0.75,
                    accent: index % 5 === 0
                }));
            }

            function drawNetwork(time) {
                ctx.clearRect(0, 0, state.width, state.height);
                const maxDistance = state.width < 640 ? 118 : 156;

                for (const node of state.nodes) {
                    if (!reduceMotion) {
                        node.x += node.vx;
                        node.y += node.vy;
                        if (node.x < -20 || node.x > state.width + 20) node.vx *= -1;
                        if (node.y < -20 || node.y > state.height + 20) node.vy *= -1;
                    }
                }

                for (let i = 0; i < state.nodes.length; i++) {
                    for (let j = i + 1; j < state.nodes.length; j++) {
                        const a = state.nodes[i];
                        const b = state.nodes[j];
                        const dx = a.x - b.x;
                        const dy = a.y - b.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        if (distance < maxDistance) {
                            const opacity = (1 - distance / maxDistance) * 0.34;
                            ctx.beginPath();
                            ctx.moveTo(a.x, a.y);
                            ctx.lineTo(b.x, b.y);
                            ctx.strokeStyle = `rgba(255, 42, 75, ${opacity})`;
                            ctx.lineWidth = distance < maxDistance * 0.45 ? 0.8 : 0.45;
                            ctx.stroke();
                        }
                    }
                }

                for (const node of state.nodes) {
                    const pulse = 0.75 + Math.sin(time * 0.0014 + node.phase) * 0.25;
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, node.radius + pulse * 0.55, 0, Math.PI * 2);
                    ctx.fillStyle = node.accent
                        ? `rgba(255, 165, 180, ${0.78 * pulse})`
                        : `rgba(255, 72, 96, ${0.6 * pulse})`;
                    ctx.shadowColor = node.accent ? '#ff9dad' : '#ff2a4b';
                    ctx.shadowBlur = node.accent ? 10 : 6;
                    ctx.fill();
                    ctx.shadowBlur = 0;
                }

                if (!reduceMotion) requestAnimationFrame(drawNetwork);
            }

            window.addEventListener('resize', resizeNetwork, { passive: true });
            resizeNetwork();
            drawNetwork(0);
        })();