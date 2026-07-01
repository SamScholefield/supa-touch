export interface Team {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

/** A team membership. Registered members have a `profile_id`; guests have only a
 *  `display_name`. The embedded `profile` (when present) is the current account. */
export interface TeamMember {
  id: string;
  team_id: string;
  profile_id: string | null;
  display_name: string | null;
  is_admin: boolean;
  created_at: string;
  profile: { display_name: string | null; email: string | null } | null;
}

/** A row from listMyTeams: the team plus the caller's role in it. */
export interface TeamMembership {
  is_admin: boolean;
  team: Team;
}

/** Best available human label for a member. */
export function memberName(member: TeamMember): string {
  return member.profile?.display_name ?? member.display_name ?? member.profile?.email ?? 'Unknown';
}

/** Whether a member is a registered account (vs a name-only guest). */
export function isRegistered(member: TeamMember): boolean {
  return member.profile_id !== null;
}
