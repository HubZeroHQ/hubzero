import type { DocumentRecord } from '@/lib/documents/schema';
import type {
  Blueprint,
  Build,
  EngineeringProfile,
  Lab,
  MediaAsset,
  Note,
  Service,
  TaxonomyEntry,
  Team,
  User,
  Work,
} from '@/types/studio';
import type { PublicEntityType } from './domain';

export type StudioPublicRecord =
  Work | Build | Blueprint | Lab | Note | EngineeringProfile | Team | Service;

export interface StudioPublicEntity<T extends StudioPublicRecord = StudioPublicRecord> {
  type: PublicEntityType;
  id: string;
  record: T;
}

/** Persistence-only input port. Nothing returned here may cross into a public consumer. */
export interface PublicDataSource {
  findEntityBySlug(type: PublicEntityType, slug: string): Promise<StudioPublicEntity | null>;
  findEntityById(type: PublicEntityType, id: string): Promise<StudioPublicEntity | null>;
  listEntities(type: PublicEntityType): Promise<StudioPublicEntity[]>;
  findDocuments(ownerType: DocumentRecord['ownerType'], ownerId: string): Promise<DocumentRecord[]>;
  findMedia(ids: readonly string[]): Promise<MediaAsset[]>;
  findTaxonomy(ids: readonly string[]): Promise<TaxonomyEntry[]>;
  findUser(id: string): Promise<User | null>;
  findTeamsByUserId(userId: string): Promise<Team[]>;
  findProfileByTeamId(teamId: string): Promise<EngineeringProfile | null>;
}
