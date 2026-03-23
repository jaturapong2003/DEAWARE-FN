export interface AccountInfo {
  user_id: string;
  user_name?: string;
  display_name?: string;
  email?: string;
  check_in: string | null;
  check_out: string | null;
  phone_number?: string;
  position?: string;
  face_embedding_count?: number;
  has_face_embedding?: boolean;
  url_image: string | null;
  record: Record<string, unknown>;
}

export interface CreateAccount {
  user_name: string;
  display_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  password: string;
  phone?: string;
  position?: string;
}
