/**
 * SalesSync — Authentication Module
 * Client-side auth with localStorage (for static GitHub Pages deployment).
 *
 * Default credentials:
 *   Username: admin
 *   Password: admin123
 */

class SalesSyncAuth {
    constructor() {
        this.STORAGE_KEY = 'salessync_users';
        this.SESSION_KEY = 'salessync_session';
        this.REMEMBER_KEY = 'salessync_remember';
        this.ensureDefaultUser();
    }

    /**
     * Create the default admin account if no users exist yet.
     */
    ensureDefaultUser() {
        try {
            const users = this.getUsers();
            if (users.length === 0) {
                this.saveUsers([
                    {
                        id: 1,
                        username: 'admin',
                        password: this.hashPassword('admin123'),
                        fullName: 'Admin User',
                        role: 'administrator',
                        createdAt: new Date().toISOString()
                    }
                ]);
            }
        } catch (e) {
            console.warn('Auth: failed to initialize default user', e);
        }
    }

    /**
     * Simple hash — NOT cryptographically secure; suitable for a demo.
     * For production, use a real backend with bcrypt/argon2.
     */
    hashPassword(password) {
        let hash = 0;
        const str = 'salessync_salt_' + password;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0; // Convert to 32-bit integer
        }
        return 'ss_' + Math.abs(hash).toString(36) + '_' + btoa(password.length + 'x' + password.charAt(0)).replace(/=/g, '');
    }

    getUsers() {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    }

    saveUsers(users) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
    }

    /**
     * Attempt login.
     * @returns {{ success: boolean, message: string, user?: object }}
     */
    login(username, password) {
        if (!username || !password) {
            return { success: false, message: 'Please enter both username and password.' };
        }

        const users = this.getUsers();
        const hashed = this.hashPassword(password);
        const user = users.find(u =>
            u.username.toLowerCase() === username.toLowerCase() && u.password === hashed
        );

        if (!user) {
            return { success: false, message: 'Invalid username or password.' };
        }

        // Create session
        const session = {
            userId: user.id,
            username: user.username,
            fullName: user.fullName,
            role: user.role,
            loginAt: new Date().toISOString()
        };

        sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));

        return { success: true, message: 'Login successful!', user: session };
    }

    /**
     * Register a new user.
     * @returns {{ success: boolean, message: string }}
     */
    register(username, password, fullName) {
        if (!username || !password) {
            return { success: false, message: 'Username and password are required.' };
        }
        if (username.length < 3) {
            return { success: false, message: 'Username must be at least 3 characters.' };
        }
        if (password.length < 6) {
            return { success: false, message: 'Password must be at least 6 characters.' };
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return { success: false, message: 'Username may only contain letters, numbers, and underscores.' };
        }

        const users = this.getUsers();
        const exists = users.find(u => u.username.toLowerCase() === username.toLowerCase());

        if (exists) {
            return { success: false, message: 'Username is already taken.' };
        }

        const newUser = {
            id: Date.now(),
            username: username,
            password: this.hashPassword(password),
            fullName: fullName || username,
            role: 'user',
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        this.saveUsers(users);

        return { success: true, message: 'Account created successfully! You can now sign in.' };
    }

    /**
     * Check if user is currently authenticated.
     */
    isAuthenticated() {
        try {
            const session = sessionStorage.getItem(this.SESSION_KEY);
            if (session) return true;

            // Check "remember me" in localStorage
            const remembered = localStorage.getItem(this.REMEMBER_KEY);
            if (remembered) {
                const data = JSON.parse(remembered);
                // Restore session from remembered data
                sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(data));
                return true;
            }
        } catch {
            return false;
        }
        return false;
    }

    /**
     * Get current session info.
     */
    getSession() {
        try {
            const raw = sessionStorage.getItem(this.SESSION_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }

    /**
     * Save persistent "remember me" data.
     */
    remember(session) {
        try {
            localStorage.setItem(this.REMEMBER_KEY, JSON.stringify(session));
        } catch (e) {}
    }

    /**
     * Clear "remember me" data.
     */
    forgetRemember() {
        localStorage.removeItem(this.REMEMBER_KEY);
    }

    /**
     * Logout — clear session.
     */
    logout() {
        sessionStorage.removeItem(this.SESSION_KEY);
        localStorage.removeItem(this.REMEMBER_KEY);
    }

    /**
     * Auth guard: redirect to login page if not authenticated.
     * Call this at the top of protected pages.
     * @param {string} loginPage - relative path to login page
     */
    requireAuth(loginPage) {
        if (!this.isAuthenticated()) {
            window.location.href = loginPage;
            return false;
        }
        return true;
    }
}

// Export singleton
window.SalesSyncAuth = new SalesSyncAuth();
