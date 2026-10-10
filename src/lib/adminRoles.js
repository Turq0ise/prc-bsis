export const ADMIN_ROLES = ["admin", "national_admin", "chapter_admin"];
export const ACCOUNT_ROLES = ["donor", "physician", "staff", "chapter_admin", "national_admin"];
export const isAdmin = (role) => ADMIN_ROLES.includes(role);
export const isNationalAdmin = (role) => role === "admin" || role === "national_admin";
export const roleLabel = (role) => ({ admin: "National administrator", national_admin: "National administrator", chapter_admin: "Chapter administrator", staff: "Chapter staff", physician: "Physician", donor: "Donor" })[role] || "Unknown role";
export function adminAccess(profile) {
    if (!profile || !isAdmin(profile.role) || profile.is_active === false) return false;
    return isNationalAdmin(profile.role) || Boolean(profile.chapter_id);
}
