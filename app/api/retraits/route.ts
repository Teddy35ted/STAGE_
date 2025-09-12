import { NextRequest, NextResponse } from 'next/server';
import { RetraitService } from '../../Backend/services/collections/RetraitService';

const retraitService = new RetraitService();

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log('Données reçues pour création:', data); // Debug
    
    // Générer un ID unique
    const id = `${Date.now()}Retrait${Math.floor(Math.random() * 10000)}`;
    
    // Créer l'objet retrait complet
    const dateCreation = new Date(data.dateCreation || new Date().toISOString());
    const dateTraitement = new Date(data.dateTraitement || (dateCreation.getTime() + 5 * 60 * 1000));
    
    const nouveauRetrait = {
      id,
      montant: data.montant,
      tel: data.tel,
      operateur: data.operateur,
      statut: data.statut || 'En attente',
      dateCreation: dateCreation.toISOString(),
      dateTraitement: dateTraitement.toISOString(),
      montantDebite: data.montantDebite || false,
      // Champs optionnels pour compatibilité
      operation: `Demande de retrait de ${data.montant} FCFA via ${data.operateur}`,
      nom: 'Animateur',
      islivreur: false,
      date: dateCreation.toISOString().split('T')[0],
      idcompte: 'animateur-' + Date.now(), // ID temporaire
      istraite: false,
      heure: dateCreation.toTimeString().split(' ')[0].slice(0, 5),
      iskouri: false,
      isbusiness: false,
      isservice: false,
      ismobilem: true,
      issubmit: true,
    };

    console.log('Objet retrait à créer:', nouveauRetrait); // Debug
    
    const createdId = await retraitService.create(nouveauRetrait);
    console.log('Retrait créé avec ID:', createdId); // Debug
    
    return NextResponse.json({ id: createdId, retrait: nouveauRetrait }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du retrait:', error);
    return NextResponse.json({ error: 'Erreur lors de la création du retrait' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('Récupération de tous les retraits...'); // Debug
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const compteId = searchParams.get('compteId');

    if (id) {
      console.log('Récupération du retrait avec ID:', id); // Debug
      const retrait = await retraitService.getById(id);
      if (retrait) {
        return NextResponse.json(retrait);
      } else {
        return NextResponse.json({ error: 'Retrait not found' }, { status: 404 });
      }
    } else if (compteId) {
      console.log('Récupération des retraits pour compte:', compteId); // Debug
      const retraits = await retraitService.getByCompte(compteId);
      console.log('Retraits trouvés pour le compte:', retraits.length); // Debug
      return NextResponse.json(retraits);
    } else {
      const retraits = await retraitService.getAll();
      console.log('Tous les retraits récupérés:', retraits.length); // Debug
      return NextResponse.json(retraits);
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des retraits:', error);
    return NextResponse.json({ error: 'Erreur lors du chargement des retraits' }, { status: 500 });
  }
}
