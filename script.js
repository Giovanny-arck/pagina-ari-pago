document.addEventListener('DOMContentLoaded', function() {

  // --- 1. FUNÇÕES UTILITÁRIAS ---
  // Captura todas as UTMs da URL automaticamente
  function getUtmParams() {
      const params = new URLSearchParams(window.location.search);
      const utm = {};
      for (const [key, value] of params.entries()) {
          if (key.startsWith('utm_')) {
              utm[key] = value;
          }
      }
      return utm;
  }

  // --- 2. ELEMENTOS DO DOM ---
  const form = document.getElementById('register-form');
  const submitButton = document.getElementById('submit-button');
  const whatsappInput = document.querySelector('input[name="whatsapp"]');

  // --- 3. MÁSCARA DE TELEFONE BRASIL ---
  if (whatsappInput) {
      whatsappInput.addEventListener('input', function(e) {
          let v = e.target.value.replace(/\D/g, "");
          // Limita a 11 dígitos (DDD + 9 dígitos)
          if (v.length > 11) v = v.substring(0, 11);
          // Aplica a formatação (XX) XXXXX-XXXX
          v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
          v = v.replace(/(\d)(\d{4})$/, "$1-$2");
          e.target.value = v;
      });
  }

  // --- 4. ENVIO DO FORMULÁRIO ---
  if (form) {
      form.addEventListener('submit', async function(e) {
          e.preventDefault();

          // Validação básica do telefone no front-end (garante 10 ou 11 dígitos)
          const rawPhone = form.whatsapp.value.replace(/\D/g, '');
          if (rawPhone.length < 10 || rawPhone.length > 11) {
              alert('Por favor, preencha um número de WhatsApp válido com DDD (ex: 47999998888).');
              return;
          }

          // Preparação do Payload (Dados)
          const formData = {
              nome: form.nome.value,
              email: form.email.value,
              whatsapp: '55' + rawPhone, // Adiciona 55 apenas no envio para o n8n
              profissao: form.profissao.value,
              valor_investimento: form.valor_investimento.value,
              ...getUtmParams(), // Espalha as UTMs capturadas da URL
              submittedAt: new Date().toISOString()
          };

          // UI de Carregamento
          submitButton.disabled = true;
          const originalBtnText = submitButton.textContent;
          submitButton.textContent = 'ENVIANDO...';

          try {
              // ============================================================
              // 1. ENVIO PRINCIPAL (Validação Crítica - n8n)
              // ============================================================
              const response1 = await fetch('https://n8nwebhook.arck1pro.shop/webhook/crmeventonovembro', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(formData)
              });

              // VALIDAÇÃO N8N: Se retornar status 409 (Conflict), o lead já existe.
              if (response1.status === 409) {
                  alert('Este email ou telefone já está cadastrado conosco.');
                  throw new Error('Lead duplicado (409)'); // Interrompe o fluxo aqui
              }

              // Se deu qualquer outro erro técnico (ex: 400, 500)
              if (!response1.ok) {
                  throw new Error(`Erro no Webhook Principal: ${response1.status}`);
              }

              // ============================================================
              // 2. ENVIO SECUNDÁRIO (CRM/Backup) - Isolado
              // ============================================================
              // Usamos try/catch aqui para que, se este falhar, o cadastro NÃO seja perdido.
              try {
                  await fetch('https://n8nwebhook.arck1pro.shop/webhook/mktcrmeventonovembro', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(formData)
                  });
              } catch (errorWebhook2) {
                  console.warn("Aviso: Segundo webhook não completou, mas seguindo fluxo de sucesso.", errorWebhook2);
              }

              // ============================================================
              // 3. SUCESSO E REDIRECIONAMENTO
              // ============================================================
              
              // Disparo do Pixel do Facebook
              if (typeof fbq === 'function') {
                  fbq('track', 'CompleteRegistration');
              }

              form.reset();
              
              // Redireciona com pequeno delay (0.5s) para garantir que o pixel seja enviado
              setTimeout(function() {
                  window.location.href = "pg_obrigado.html";
              }, 500);

          } catch (error) {
              console.error('Erro no envio:', error);
              
              // Restaura o botão apenas se houve erro (para permitir tentar de novo)
              submitButton.disabled = false;
              submitButton.textContent = originalBtnText;

              // Se NÃO foi o erro 409 (que já tem seu próprio alert acima), mostra mensagem genérica
              if (!error.message.includes('(409)')) {
                   alert('Ocorreu um erro ao processar seu cadastro. Por favor, verifique sua conexão e tente novamente.');
              }
          }
      });
  }
});

// --- 5. FUNÇÃO GLOBAL (usada nos botões 'onclick' do HTML) ---
function scrollToForm() {
  const formElement = document.getElementById('register-form');
  if (formElement) {
    // Tenta rolar para o container do formulário para centralizar melhor
    const containerParaRolar = formElement.closest('.form-container') || formElement;
    containerParaRolar.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } else {
    // Fallback se não achar o formulário
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
