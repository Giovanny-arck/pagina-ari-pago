document.addEventListener('DOMContentLoaded', function() {
  // --- NOVO: Bloco para capturar e armazenar as UTMs ---
  const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  const urlParams = new URLSearchParams(window.location.search);
  const capturedUtms = {};

  utmKeys.forEach(key => {
    // Se o parâmetro UTM existir na URL, ele é adicionado ao nosso objeto
    if (urlParams.has(key)) {
      capturedUtms[key] = urlParams.get(key);
    }
  });
  // --- Fim do Bloco de Captura de UTMs ---

  const form = document.getElementById('register-form');
  const submitButton = document.getElementById('submit-button');
  
  // Formatando o campo de WhatsApp
  const whatsappInput = document.querySelector('input[name="whatsapp"]');
  whatsappInput.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (!value.startsWith('55')) {
      value = '55' + value;
    }
    e.target.value = '+' + value.slice(0, 13);
  });
  
  // Envio do formulário
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // ATUALIZADO: Os dados do formulário agora incluem as UTMs capturadas
    const formData = {
      nome: form.nome.value,
      email: form.email.value,
      whatsapp: form.whatsapp.value,
      profissao: form.profissao.value, 
      valor_investimento: form.valor_investimento.value,
      ...capturedUtms // <-- A MÁGICA ACONTECE AQUI!
    };
    
    // Validação atualizada
    if (!formData.nome || !formData.email || !formData.whatsapp || formData.whatsapp.length < 14 || !formData.profissao || !formData.valor_investimento) {
      alert('Por favor, preencha todos os campos obrigatórios corretamente.');
      return;
    }
    
    // Simulando envio
    submitButton.disabled = true;
    submitButton.textContent = 'ENVIANDO...';
    
    try {
      // Envio para os webhooks (já com as UTMs)
      const response1 = await fetch('https://n8nwebhook.arck1pro.shop/webhook/lp-rd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const response2 = await fetch('https://n8nwebhook.arck1pro.shop/webhook/lp-ari-rdstationcrm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response1.ok && response2.ok) {
        alert('Cadastro realizado com sucesso. Redirecionando...');
        form.reset();
        
        // Redirecionamento para sua página de obrigado
        setTimeout(() => {
          window.location.href = "pg_obrigado.html";
        }, 1000);

      } else {
        throw new Error('Erro ao enviar formulário');
      }
    } catch (error) {
      alert('Ocorreu um erro ao enviar o cadastro. Tente novamente.');
      console.error(error);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'QUERO ME REGISTRAR';
    }
  });
});

// ===============================================
// FUNÇÃO PARA ROLAGEM DOS BOTÕES DAS NOVAS SEÇÕES
// ===============================================

function scrollToForm() {
  const formElement = document.getElementById('register-form');
  
  if (formElement) {
    const containerParaRolar = formElement.closest('.form-container');
    if (containerParaRolar) {
      containerParaRolar.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}