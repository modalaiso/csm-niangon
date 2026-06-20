type Role = "MODERATOR" | "WRITER" | "ADMIN";

const ACCESS_KEYS: Record<Role, string[]> = {
  MODERATOR: [
    process.env.MODERATOR_KEY_1!,
    process.env.MODERATOR_KEY_2!,
    process.env.MODERATOR_KEY_3!,
  ].filter(Boolean),

  WRITER: [
    process.env.WRITER_KEY_1!,
    process.env.WRITER_KEY_2!,
    process.env.WRITER_KEY_3!,
  ].filter(Boolean),

  ADMIN: [
    process.env.ADMIN_KEY_1!,
    process.env.ADMIN_KEY_2!,
    process.env.ADMIN_KEY_3!,
  ].filter(Boolean),
};

export function validateAccessKey(key: string, role: Role): boolean {
  if (!key || !role) return false;
  return ACCESS_KEYS[role]?.includes(key) ?? false;
}

export function getAccessKeyRole(key: string): Role | null {
  for (const [role, keys] of Object.entries(ACCESS_KEYS)) {
    if (keys.includes(key)) {
      return role as Role;
    }
  }
  return null;
}
