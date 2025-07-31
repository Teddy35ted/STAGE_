export interface CoGestionnaire {
    id: string;
    nom: string;
    email: string;
    tel: string;
    pays: string;
    ville: string;
    ACCES : 'gerer' | 'consulter' | 'Ajouter' 
}