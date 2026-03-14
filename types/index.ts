export interface Profile {
  id: string;
  phone: string;
  name: string;
  avatar_url?: string;
  city: string;
  created_at: string;
}

export interface Listing {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: 'new' | 'like_new' | 'good' | 'fair';
  delivery_options: ('meetup' | 'shipping')[];
  city: string;
  images: string[];
  status: 'active' | 'sold' | 'deleted';
  created_at: string;
  seller?: Profile;
}

export interface SavedListing {
  id: string;
  user_id: string;
  listing_id: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  listing?: Listing;
  buyer?: Profile;
  seller?: Profile;
  last_message?: Message;
  unread_count?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export type Category =
  | 'Electronics'
  | 'Cars'
  | 'Home'
  | 'Fashion'
  | 'Sports'
  | 'Kids'
  | 'Jobs'
  | 'More';

export type Condition = 'new' | 'like_new' | 'good' | 'fair';
export type DeliveryOption = 'meetup' | 'shipping';
