/**
 * Shared people roster — org team members who create events and upload media.
 * Primitive seed data (no entity types) so every entity mock can reference the
 * same contributors by stable id and name. Lives in `shared` because it is
 * cross-entity reference data, not a domain model.
 */
export interface Person {
  id: string;
  name: string;
}

export const TEAM_MEMBERS: Person[] = [
  { id: 'u_dana', name: 'Dana Whitfield' },
  { id: 'u_marco', name: 'Marco Bellini' },
  { id: 'u_priya', name: 'Priya Raman' },
  { id: 'u_lena', name: 'Lena Vogt' },
  { id: 'u_chen', name: 'Chen Wei' },
  { id: 'u_aisha', name: 'Aisha Karim' },
  { id: 'u_diego', name: 'Diego Santos' },
  { id: 'u_nora', name: 'Nora Lindqvist' },
];

export const teamMember = (id: string): Person =>
  TEAM_MEMBERS.find((p) => p.id === id) ?? { id, name: 'Unknown' };
