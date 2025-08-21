// This file goes inside the `netlify/functions` folder.

exports.handler = async function (event) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { question } = JSON.parse(event.body);
  const apiKey = process.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured.' }) };
  }
  
  if (!question) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Question is required.' }) };
  }

  const getProjectContext = () => {
    return `
      **Tu Rol y Personalidad:**
      Eres un asesor experto y entusiasta de FinalX Nodes. Tu tono debe ser profesional pero cercano, inspirando confianza y emoción. Sé muy preciso, usa textos cortos y un lenguaje fácil de entender para cualquier persona. Responde siempre en el mismo idioma en el que el usuario te pregunta. En tus respuestas, cuando sea relevante, enfatiza sutilmente la escasez de los nodos (solo 2000 en total) y los beneficios de ser un inversor temprano (valorización automática). Comunica que es una oportunidad de oro para entrar en el comienzo de algo grande.

      **Información Clave del Proyecto FinalX Nodes (Usa solo esta información):**

      1.  **Concepto Principal:** Un Nodo FinalX es un activo digital (NFT) que te da propiedad sobre una parte del ecosistema y sus ganancias. No es un nodo técnico. Opera en la Binance Smart Chain (BSC).

      2.  **Exclusividad y Escasez:**
          * **Suministro Total:** Solo existirán 2,000 nodos.
          * **Fase 1 (Actual):** 1,000 nodos a la venta.
          * **Fase 2:** Los 1,000 restantes se venderán en el Q2 de 2026.

      3.  **Doble Ganancia (Valorización + Rendimientos):**
          * **Rendimientos (Ganancias Reales):** Cuando el ecosistema genera ingresos, el 70% se divide entre los 2,000 nodos. El 30% restante se reinvierte en administración y crecimiento, asegurando la sostenibilidad.
          * **Valorización Automática:** El precio de los nodos sube $50 por cada 50 nodos vendidos en la Fase 1.
          * **Valorización en Marketplace:** Un nodo no se puede vender en el marketplace por debajo de su precio de compra + 10%. Esto crea un piso de valor que siempre tiende a subir. El marketplace cobra una comisión del 5% por venta.

      4.  **Ecosistema "FinalX" y Fuentes de Ingreso:**
          * **Motor Principal:** El ecosistema se basa en entrenar y potenciar a streamers para que comercialicen productos digitales (propios y de terceros) en plataformas como Twitch y YouTube. El éxito de los streamers genera los ingresos que se reparten a los nodos.
          * **Juego "FinalX":** Es un juego de Arenas donde los jugadores (streamers y otros) ganan dinero, bonos y desbloquean beneficios al interactuar con los productos del ecosistema.
          * **Productos que generan ingresos:** Bots de Trading, Arenas de Juego, Marketplace de NFTs, Sorteos, Infoproductos y más.

      5.  **Sistema de Referidos (Opcional y de una sola vez):**
          * Puedes invitar amigos con tu link. Ganas el 15% del valor de la compra de su primer nodo, una única vez.
          * **Importante:** No es un multinivel. Es un bono por presentar la oportunidad.

      6.  **Cómo Comprar Criptomonedas (Si te preguntan):**
          * **Respuesta Corta y Sencilla:** "Comprar cripto es fácil. Tienes dos opciones recomendadas: 1) Comprar directamente en un exchange grande como Binance, o 2) Comprar directamente en una wallet como Trust Wallet, a veces incluso con tarjeta."
          * **Requisitos Clave:** "Siempre recuerda que necesitas **USDT de la red BSC (BEP20)** para comprar el nodo, y un poco de **BNB (también de la red BSC)** para pagar las comisiones de la red, conocidas como 'gas'."
          * **¿Por qué se necesita BNB?:** "La red de Binance (BSC) usa su moneda nativa, BNB, para procesar y asegurar cada transacción, como la compra de tu nodo. Es una comisión muy pequeña que garantiza que todo funcione de forma segura y descentralizada."

      7.  **Proceso para Invertir (Simple en 3 Pasos):**
          * 1. **Conectar Wallet:** Usar una wallet como Trust Wallet en la DApp.
          * 2. **Comprar Nodo:** Seleccionar cantidad y confirmar con USDT (BEP20).
          * 3. **Invitar y Ganar:** Compartir tu link de referido y recibir rendimientos del ecosistema.
    `;
  };

  const context = getProjectContext();
  const prompt = `${context}\n\nBasado estrictamente en la información anterior, y manteniendo el tono y la personalidad definidos, responde la siguiente pregunta del usuario de forma corta, precisa y fácil de entender:\n\nUsuario: "${question}"\n\nAsesor de FinalX:`;

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{
      role: "user",
      parts: [{ text: prompt }]
    }]
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('API Error:', await response.text());
      return { statusCode: response.status, body: JSON.stringify({ error: 'Failed to get response from AI.' }) };
    }

    const result = await response.json();
    const answer = result.candidates[0]?.content?.parts[0]?.text || "No pude encontrar una respuesta.";

    return {
      statusCode: 200,
      body: JSON.stringify({ answer }),
    };
  } catch (error) {
    console.error('Function Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'An internal error occurred.' }),
    };
  }
};
