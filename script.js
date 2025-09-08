// Conteúdo de script.js modificado

document.addEventListener('DOMContentLoaded', function() {
  const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  const urlParams = new URLSearchParams(window.location.search);
  const capturedUtms = {};

  utmKeys.forEach(key => {
    if (urlParams.has(key)) {
      capturedUtms[key] = urlParams.get(key);
    }
  });

  const form = document.getElementById('register-form');
  const submitButton = document.getElementById('submit-button');
  
  const whatsappInput = document.querySelector('input[name="whatsapp"]');
  whatsappInput.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (!value.startsWith('55')) {
      value = '55' + value;
    }
    e.target.value = '+' + value.slice(0, 13);
  });
  
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = {
      nome: form.nome.value,
      email: form.email.value,
      whatsapp: form.whatsapp.value,
      profissao: form.profissao.value, 
      valor_investimento: form.valor_investimento.value,
      ...capturedUtms 
    };
    
    if (!formData.nome || !formData.email || !formData.whatsapp || formData.whatsapp.length < 14 || !formData.profissao || !formData.valor_investimento) {
      alert('Por favor, preencha todos os campos obrigatórios corretamente.');
      return;
    }
    
    submitButton.disabled = true;
    submitButton.textContent = 'ENVIANDO...';
    
    try {
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
        // 🔥 Disparar evento do Meta Pixel
        if (typeof fbq === 'function') {
          fbq('track', 'CompleteRegistration');
        }

        form.reset();
        
        // MODIFICAÇÃO: Redirecionamento imediato sem alerta.
        window.location.href = "pg_obrigado.html";

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
