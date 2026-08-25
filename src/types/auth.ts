export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
export type RoleCode = "ADMIN" | "DIRECTOR" | "ADMINISTRATION" | "MUSICIAN" | "VIEWER";

export interface AppUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
}

export interface OrganizationIdentity {
  id: string;
  name: string;
  logoUrl: string | null;
  coverUrl: string | null;
  primaryColor: string;
  currencyCode: string;
  timezone: string;
}

export interface Membership {
  id: string;
  organizationId: string;
  approvalStatus: ApprovalStatus;
  roleId: string;
  roleCode: RoleCode | null;
  roleName: string | null;
  permissions: string[];
}
