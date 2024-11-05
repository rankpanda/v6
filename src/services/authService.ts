import { toast } from '../components/ui/Toast';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  last_login?: string;
}

const DEFAULT_ADMIN = {
  id: '1',
  email: 'rui@rankpanda.pt',
  name: 'Admin',
  password: 'bb212977923BB',
  role: 'admin' as const,
  status: 'approved' as const,
  created_at: new Date().toISOString()
};

export const authService = {
  async initializeDefaultAdmin(): Promise<void> {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const adminExists = users.some((u: User) => u.email === DEFAULT_ADMIN.email);
      
      if (!adminExists) {
        users.push(DEFAULT_ADMIN);
        localStorage.setItem('users', JSON.stringify(users));
      }
    } catch (error) {
      console.error('Error initializing default admin:', error);
    }
  },

  async login(email: string, password: string): Promise<User> {
    try {
      await this.initializeDefaultAdmin();

      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find((u: User & { password?: string }) => 
        u.email === email && u.password === password
      );

      if (!user) {
        throw new Error('Invalid credentials');
      }

      if (user.status !== 'approved') {
        throw new Error('Account pending approval');
      }

      user.last_login = new Date().toISOString();
      localStorage.setItem('users', JSON.stringify(users));
      
      const { password: _, ...userWithoutPassword } = user;
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      
      return userWithoutPassword;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  logout(): void {
    localStorage.removeItem('currentUser');
  },

  getCurrentUser(): User | null {
    const userJson = localStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
  },

  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  },

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  },

  async getUsers(): Promise<User[]> {
    try {
      await this.initializeDefaultAdmin();
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      return users.map(({ password: _, ...user }: any) => user);
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  async updateUserStatus(userId: string, status: User['status']): Promise<void> {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex((u: User) => u.id === userId);
      
      if (userIndex === -1) throw new Error('User not found');
      
      users[userIndex].status = status;
      localStorage.setItem('users', JSON.stringify(users));
      
      toast.success('User status updated successfully');
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  },

  async createUser(email: string, password: string, name: string, role: 'admin' | 'user' = 'user'): Promise<void> {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      if (users.some((u: User) => u.email === email)) {
        throw new Error('Email already exists');
      }

      const newUser = {
        id: crypto.randomUUID(),
        email,
        password,
        name,
        role,
        status: 'approved' as const,
        created_at: new Date().toISOString()
      };

      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      toast.success('User created successfully');
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }
};