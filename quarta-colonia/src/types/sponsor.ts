export interface ApiSponsorItem {
  id?: string;
  name?: string;
  imageUrl?: string;
  imagePath?: string;
  link?: string | null;
  active?: boolean;
  order?: number;
}

export interface PortalSponsorItem {
  id: string;
  name: string;
  imageUrl: string;
  imagePath: string;
  link: string | null;
  active: boolean;
  order: number;
}
