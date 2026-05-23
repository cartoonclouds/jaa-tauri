/**
 * Tag entity used for labeling and filtering.
 */
export interface Tag {
  /** Unique tag identifier. */
  id: string;
  /** Display name for the tag. */
  name: string;
  /** Optional color associated with the tag. */
  color: string | null;
  /** Creation timestamp. */
  createdAt: Date;
  /** Last update timestamp. */
  updatedAt: Date;
}

/**
 * Input required to create a tag.
 */
export interface CreateTagInput {
  /** Display name for the tag. */
  name: string;
  /** Optional color associated with the tag. */
  color?: string | null;
}



