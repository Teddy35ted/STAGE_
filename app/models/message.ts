export interface ValidationMessageT {
  id?: string;
  idsender?: string;
  receiverId: string;
  idreceiver?: string;
  date?: string;
  mois?: number;
  jour?: number;
  annee?: number;
  heure?: string;
  avatarsend?: string;
  avatarrec?: string;
  chateurs?: string[];
  nomrec?: string;
  nomsend?: string;
  messages?: Array<{
    id?: string;
    type: 'text' | 'image' | 'file';
    text?: string;
    name?: string;
    uri?: string;
    width?: number;
    height?: number;
    size?: number;
    createdAt?: number;
    updateAt?: number;
    updatedAt?: number | null;
    author?: {
      id: string;
    };
    remoteId?: string;
    roomId?: string;
  }>;
  message?: {
    id?: string;
    type: 'text' | 'image' | 'file';
    text?: string;
    name?: string;
    uri?: string;
    width?: number;
    height?: number;
    size?: number;
    createdAt?: number;
    updateAt?: number;
    updatedAt?: number | null;
    author?: {
      id: string;
    };
    remoteId?: string;
    roomId?: string;
  };
}