import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Invoice {
  id: string;
  user_id: string;
  number: number;
  type: 'invoice' | 'purchase_order' | 'quotation';
  date: string;
  due_date: string;
  status: 'pending' | 'completed' | 'cancelled';
  approver: string;
  tags?: string[];
  items: any[];
  tax_calculation_method: boolean;
  ppn_percentage?: number;
  pph_percentage?: number;
  pph_type?: string;
  dpp?: number;
  ppn?: number;
  pph?: number;
  grand_total: number;
  created_at: string;
  updated_at?: string;
}

export interface Offer {
  id: string;
  user_id: string;
  number: number;
  type: string;
  date: string;
  expiry_date?: string;
  due_date: string;
  status: 'pending' | 'completed' | 'cancelled';
  discount_terms?: string;
  tags?: string[];
  items: any[];
  grand_total: number;
  created_at: string;
  updated_at?: string;
}

export interface Order {
  id: string;
  user_id: string;
  number: number;
  type: string;
  date: string;
  orders_date: string;
  due_date: string;
  status: 'pending' | 'completed' | 'cancelled';
  tags?: string[];
  items: any[];
  grand_total: number;
  created_at: string;
  updated_at?: string;
}

export interface Request {
  id: string;
  user_id: string;
  number: number;
  type: string;
  date?: string;
  due_date: string;
  status: 'pending' | 'completed' | 'cancelled';
  requested_by: string;
  urgency: 'High' | 'Medium' | 'Low';
  tags?: string[];
  items: any[];
  grand_total: number;
  created_at: string;
  updated_at?: string;
}

export interface Shipment {
  id: string;
  user_id: string;
  number: number;
  type: string;
  date: string;
  shipping_date: string;
  due_date: string;
  status: 'pending' | 'completed' | 'cancelled';
  tracking_number: string;
  carrier: string;
  tags?: string[];
  items: any[];
  grand_total: number;
  created_at: string;
  updated_at?: string;
}

// Invoices hooks
export const useInvoices = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching invoices:', error);
        throw error;
      }

      return data as Invoice[];
    },
    enabled: !!user,
  });
};

// Offers hooks
export const useOffers = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['offers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching offers:', error);
        throw error;
      }

      return data as Offer[];
    },
    enabled: !!user,
  });
};

// Orders hooks
export const useOrders = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }

      return data as Order[];
    },
    enabled: !!user,
  });
};

// Requests hooks
export const useRequests = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching requests:', error);
        throw error;
      }

      return data as Request[];
    },
    enabled: !!user,
  });
};

// Shipments hooks
export const useShipments = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['shipments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching shipments:', error);
        throw error;
      }

      return data as Shipment[];
    },
    enabled: !!user,
  });
};

// Create mutations for each type
export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (newInvoice: Omit<Invoice, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('invoices')
        .insert([{
          ...newInvoice,
          user_id: user?.id,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating invoice:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

export const useCreateOffer = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (newOffer: Omit<Offer, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('offers')
        .insert([{
          ...newOffer,
          user_id: user?.id,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating offer:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
    },
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (newOrder: Omit<Order, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('orders')
        .insert([{
          ...newOrder,
          user_id: user?.id,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating order:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useCreateRequest = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (newRequest: Omit<Request, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('requests')
        .insert([{
          ...newRequest,
          user_id: user?.id,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating request:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
  });
};

export const useCreateShipment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (newShipment: Omit<Shipment, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('shipments')
        .insert([{
          ...newShipment,
          user_id: user?.id,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating shipment:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
    },
  });
};

// Update mutations for all types
export const useUpdateOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Offer> }) => {
      const { data, error } = await supabase
        .from('offers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating offer:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
    },
  });
};

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Order> }) => {
      const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating order:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useUpdateRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Request> }) => {
      const { data, error } = await supabase
        .from('requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating request:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
  });
};

export const useUpdateShipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Shipment> }) => {
      const { data, error } = await supabase
        .from('shipments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating shipment:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
    },
  });
};

// Delete mutations for all types
export const useDeleteOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('offers')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting offer:', error);
        throw error;
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
    },
  });
};

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting order:', error);
        throw error;
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useDeleteRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('requests')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting request:', error);
        throw error;
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
  });
};

export const useDeleteShipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('shipments')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting shipment:', error);
        throw error;
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
    },
  });
};

// Update and Delete mutations (keeping existing ones and adding for other types)
export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Invoice> }) => {
      const { data, error } = await supabase
        .from('invoices')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating invoice:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting invoice:', error);
        throw error;
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

// Generic hook to fetch any purchase by ID and type
export const usePurchaseById = (id: string, type: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['purchase', type, id],
    queryFn: async () => {
      let tableName: 'invoices' | 'offers' | 'orders' | 'requests' | 'shipments';
      
      switch (type) {
        case 'invoice':
          tableName = 'invoices';
          break;
        case 'offer':
          tableName = 'offers';
          break;
        case 'order':
          tableName = 'orders';
          break;
        case 'request':
          tableName = 'requests';
          break;
        case 'shipment':
          tableName = 'shipments';
          break;
        default:
          throw new Error(`Unknown purchase type: ${type}`);
      }

      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Error fetching ${type}:`, error);
        throw error;
      }

      return data;
    },
    enabled: !!user && !!id && !!type,
  });
};
