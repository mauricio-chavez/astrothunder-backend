const dialogflow = require('@google-cloud/dialogflow');

async function detectIntent(query, contexts, sessionId) {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT;
  const sessionClient = new dialogflow.SessionsClient();

  const sessionPath = sessionClient.projectAgentSessionPath(
    projectId,
    sessionId
  );

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: query,
        languageCode: 'es',
      },
    },
  };

  if (contexts && contexts.length > 0) {
    request.queryParams = {
      contexts: contexts,
    };
  }

  const responses = await sessionClient.detectIntent(request);
  return responses[0];
}

async function executeQuery(query, context, socketId) {
  try {
    const intentResponse = await detectIntent(query, context, socketId);
    const newContext = intentResponse.queryResult.outputContexts;
    const fulfillmentText = intentResponse.queryResult.fulfillmentText;
    return [fulfillmentText, newContext];
  } catch (error) {
    console.error(error);
    return [null, null];
  }
}

async function dialogflowSession(socket, io) {
  let context;
  socket.on('chat message', async msg => {
    if (msg) {
      const [fulfillmentText, newContext] = await executeQuery(
        msg,
        context,
        socket.id
      );
      if (fulfillmentText) {
        context = newContext;
        io.to(socket.id).emit('chat message', fulfillmentText);
      } else {
        io.to(socket.id).emit(
          'chat message',
          'Estoy teniendo algunas complaciones, háblame de nuevo más tarde :P'
        );
      }
    } else {
      io.to(socket.id).emit(
        'chat message',
        'Interpretaré tu silencio como algo bueno :)'
      );
    }
  });
}

module.exports = dialogflowSession;
