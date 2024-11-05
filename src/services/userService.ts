import { supabase } from './databaseService';
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

export const userService = {
  async getUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
      return [];
    }
  },

  async createUser(email: string, password: string, name: string, role: 'admin' | 'user' = 'user'): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          email,
          password, // In production, this should be hashed
          name,
          role,
          status: role === 'admin' ? 'approved' : 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      toast.success('User created successfully');
      return data;
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
      return null;
    }
  },

  async updateUserStatus(userId: string, status: User['status']): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ status })
        .eq('id', userId);

      if (error) throw error;
      toast.success('User status updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
      return false;
    }
  },

  async deleteUser(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      toast.success('User deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
      return false;
    }
  }
};