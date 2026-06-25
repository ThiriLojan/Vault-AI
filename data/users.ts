// Mock database (zero-config in-memory storage for GitHub showcase)
export const users: Array<{ id: string, username: string, email: string, password: string, resetToken?: string, resetTokenExpiry?: number }> = [
    {
        id: "usr_demo_vip_01",
        username: "demo",
        email: "demo@vaultai.io",
        password: "demo"
    }
];

// Add new user
export function addUser(user: { id: string, username: string, email: string, password: string }) {
    users.push(user);
}

// Update existing user
export function updateUser(id: string, updates: Partial<{ password: string, resetToken: string, resetTokenExpiry: number }>) {
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
        users[index] = { ...users[index], ...updates };
        return true;
    }
    return false;
}

// Find user by username
export function findUserByUsername(username: string) {
    return users.find(user => user.username === username);
}

// Find user by email (Ensure it's case insensitive)
export function findUserByEmail(email: string) {
    return users.find(user => user.email.toLowerCase() === email.toLowerCase());
}

// Find user by reset token
export function findUserByResetToken(token: string) {
    return users.find(user => user.resetToken === token && user.resetTokenExpiry && user.resetTokenExpiry > Date.now());
}
