export interface AccountInfo  {
  user_id: string;
  check_in: string | null;
  check_out: string | null;
  phone_number: string;
  position: string;
  face_embedding_count: number;
  has_face_embedding: boolean;
  url_image: string | '';
}
