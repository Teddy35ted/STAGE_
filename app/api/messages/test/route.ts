import { NextRequest, NextResponse } from 'next/server';
import { MessageService } from '../../../Backend/services/collections/MessageService';
import { verifyAuth } from '../../../Backend/utils/authVerifier';

const messageService = new MessageService();

export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('🧪 Test CRUD Messages pour utilisateur:', auth.uid);
    
    const testResults: any = {
      userId: auth.uid,
      timestamp: new Date().toISOString(),
      operations: {},
      success: true,
      errors: []
    };

    // Test 1: CREATE
    try {
      console.log('➕ Test CREATE message...');
      const testMessageData = {
        receiverId: 'test-receiver',
        message: {
          type: 'text',
          text: `Message de test créé le ${new Date().toLocaleString()}`,
          createdAt: Date.now(),
          author: {
            id: auth.uid
          }
        },
        nomsend: 'Testeur',
        nomrec: 'Destinataire Test',
        date: new Date().toISOString().split('T')[0],
        heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      };
      
      const createdId = await messageService.create(testMessageData);
      testResults.operations.create = { success: true, id: createdId };
      console.log('✅ CREATE réussi, ID:', createdId);

      // Test 2: READ
      try {
        console.log('📖 Test READ message...');
        const readMessage = await messageService.getById(createdId);
        testResults.operations.read = { 
          success: !!readMessage, 
          data: readMessage ? 'Message trouvé' : 'Message non trouvé' 
        };
        console.log('✅ READ réussi');

        // Test 3: UPDATE
        try {
          console.log('✏️ Test UPDATE message...');
          const updateData = {
            message: {
              type: 'text',
              text: `Message modifié le ${new Date().toLocaleString()}`,
              updatedAt: Date.now()
            }
          };
          
          await messageService.update(createdId, updateData);
          testResults.operations.update = { success: true, data: 'Message mis à jour' };
          console.log('✅ UPDATE réussi');

          // Test 4: GET BY USER
          try {
            console.log('👤 Test GET BY USER...');
            const userMessages = await messageService.getMessagesByUser(auth.uid);
            testResults.operations.getByUser = { 
              success: true, 
              count: userMessages.length,
              data: `${userMessages.length} messages trouvés`
            };
            console.log('✅ GET BY USER réussi, messages:', userMessages.length);

            // Test 5: DELETE
            try {
              console.log('🗑️ Test DELETE message...');
              await messageService.delete(createdId);
              
              // Vérifier que le message a été supprimé
              const deletedMessage = await messageService.getById(createdId);
              testResults.operations.delete = { 
                success: !deletedMessage, 
                data: deletedMessage ? 'Message encore présent' : 'Message supprimé'
              };
              console.log('✅ DELETE réussi');

            } catch (deleteError) {
              console.error('❌ Erreur DELETE:', deleteError);
              testResults.operations.delete = { success: false, error: deleteError instanceof Error ? deleteError.message : 'Erreur DELETE' };
              testResults.errors.push(`DELETE: ${deleteError instanceof Error ? deleteError.message : 'Erreur inconnue'}`);
            }

          } catch (getUserError) {
            console.error('❌ Erreur GET BY USER:', getUserError);
            testResults.operations.getByUser = { success: false, error: getUserError instanceof Error ? getUserError.message : 'Erreur GET BY USER' };
            testResults.errors.push(`GET BY USER: ${getUserError instanceof Error ? getUserError.message : 'Erreur inconnue'}`);
          }

        } catch (updateError) {
          console.error('❌ Erreur UPDATE:', updateError);
          testResults.operations.update = { success: false, error: updateError instanceof Error ? updateError.message : 'Erreur UPDATE' };
          testResults.errors.push(`UPDATE: ${updateError instanceof Error ? updateError.message : 'Erreur inconnue'}`);
        }

      } catch (readError) {
        console.error('❌ Erreur READ:', readError);
        testResults.operations.read = { success: false, error: readError instanceof Error ? readError.message : 'Erreur READ' };
        testResults.errors.push(`READ: ${readError instanceof Error ? readError.message : 'Erreur inconnue'}`);
      }

    } catch (createError) {
      console.error('❌ Erreur CREATE:', createError);
      testResults.operations.create = { success: false, error: createError instanceof Error ? createError.message : 'Erreur CREATE' };
      testResults.errors.push(`CREATE: ${createError instanceof Error ? createError.message : 'Erreur inconnue'}`);
      testResults.success = false;
    }

    // Résumé
    const successfulOps = Object.values(testResults.operations).filter((op: any) => op.success).length;
    const totalOps = Object.keys(testResults.operations).length;
    
    testResults.summary = {
      successfulOperations: successfulOps,
      totalOperations: totalOps,
      successRate: totalOps > 0 ? `${((successfulOps / totalOps) * 100).toFixed(1)}%` : '0%',
      allOperationsSuccessful: successfulOps === totalOps && testResults.errors.length === 0
    };

    testResults.success = testResults.summary.allOperationsSuccessful;

    console.log('🏁 Test CRUD Messages terminé:', testResults.summary);

    return NextResponse.json(testResults);

  } catch (error) {
    console.error('❌ Erreur générale test CRUD Messages:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors du test CRUD Messages',
      details: error instanceof Error ? error.message : 'Erreur inconnue',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}