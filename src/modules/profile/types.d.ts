import type { Profile } from "@modules/profile/domain/entities/Profile";
import type {
  DatatablePageQuery,
  DatatablePageResult,
  IPaginatedRepository,
  IRepository,
  PartialUpdatePayload,
} from "@shared/types";

/**
 * Type alias for profile create payload.
 */
export type ProfileCreatePayload = Pick<Profile, "fullName"> &
  Partial<Omit<Profile, "id" | "fullName" | "createdAt" | "updatedAt">>;

/**
 * Type alias for profile update payload.
 */
export type ProfileUpdatePayload = PartialUpdatePayload<ProfileCreatePayload>;

/**
 * Defines profile repository contract.
 */
export interface IProfileRepository
  extends
    IRepository<Profile, ProfileCreatePayload, ProfileUpdatePayload>,
    IPaginatedRepository<Profile> {
  get(id: string): Promise<Profile | null>;
  listPage(query: DatatablePageQuery): Promise<DatatablePageResult<Profile>>;
}
