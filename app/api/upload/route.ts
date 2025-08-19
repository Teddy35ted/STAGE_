import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    console.log('📤 Upload local - début');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    console.log('📁 Fichier reçu:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Validation du fichier
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'Fichier trop volumineux (max 50MB)' 
      }, { status: 400 });
    }

    // Types autorisés
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Type de fichier non supporté' 
      }, { status: 400 });
    }

    // Créer le répertoire d'upload s'il n'existe pas
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop() || '';
    const fileName = `${timestamp}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
    const filePath = join(uploadDir, fileName);

    // Convertir le fichier en buffer et l'écrire
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    await writeFile(filePath, buffer);

    // Générer l'URL publique
    const fileUrl = `/uploads/${fileName}`;

    console.log('✅ Upload local réussi:', fileUrl);

    return NextResponse.json({
      fileId: fileName,
      url: fileUrl,
      success: true,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type
    });

  } catch (error) {
    console.error('❌ Erreur upload local:', error);
    return NextResponse.json({
      error: 'Erreur lors de l\'upload local'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ Suppression fichier local - début');
    
    const { fileUrl } = await request.json();
    
    if (!fileUrl || !fileUrl.startsWith('/uploads/')) {
      return NextResponse.json({ 
        error: 'URL de fichier invalide' 
      }, { status: 400 });
    }

    // Extraire le nom du fichier de l'URL
    const fileName = fileUrl.replace('/uploads/', '');
    const filePath = join(process.cwd(), 'public', 'uploads', fileName);

    console.log('🗑️ Suppression fichier:', filePath);

    // Vérifier si le fichier existe avant de le supprimer
    if (!existsSync(filePath)) {
      console.warn('⚠️ Fichier non trouvé:', filePath);
      return NextResponse.json({ 
        success: true, 
        message: 'Fichier déjà supprimé ou inexistant' 
      });
    }

    // Supprimer le fichier
    const { unlink } = await import('fs/promises');
    await unlink(filePath);

    console.log('✅ Fichier local supprimé:', fileName);

    return NextResponse.json({
      success: true,
      message: 'Fichier supprimé avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur suppression fichier local:', error);
    return NextResponse.json({
      error: 'Erreur lors de la suppression du fichier local'
    }, { status: 500 });
  }
}
