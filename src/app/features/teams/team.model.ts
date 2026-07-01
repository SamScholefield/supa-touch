/** A team row. `members` and `admins` hold user emails ("email as id"). */
export interface Team {
  id: string;
  name: string;
  members: string[];
  admins: string[];
  created_at: string;
  updated_at: string;
}
