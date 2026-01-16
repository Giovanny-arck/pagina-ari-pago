document.addEventListener('DOMContentLoaded', function() {
    // --- CONFIGURAÇÃO DO TELEFONE INTERNACIONAL ---
    const whatsappInput = document.querySelector("#whatsapp");
    const iti = window.intlTelInput(whatsappInput, {
      initialCountry: "auto",
      geoIpLookup: function(callback) {
        fetch("https://ipapi.co/json")
          .then(res => res.json())
          .then(data => callback(data.country_code))
          .catch(() => callback("br"));
      },
      utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
    });

    // --- FUNÇÃO DE CAPTURA DINÂMICA DE UTMs ---
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

    const form = document.getElementById('register-form');
    const submitButton = document.getElementById('submit-button');
    
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      if (!iti.isValidNumber()) {
        alert('Por favor, insira um número de telefone válido.');
        return;
      }
      
      const urlParams = new URLSearchParams(window.location.search);

      const formData = {
        nome: form.nome.value,
        email: form.email.value,
        whatsapp: iti.getNumber(), 
        profissao: form.profissao.value, 
        valor_investimento: form.valor_investimento.value,
        investe_atualmente: form.investe_atualmente.value,
        prazo_investimento: form.prazo_investimento.value,
        ciente_emprestimos: form.ciente_emprestimos.value,
        utm_placement: urlParams.get('utm_placement') || '',
        utm_id: urlParams.get('utm_id') || '',
        ...getUtmParams() 
      };
      
      // Validação básica
      if (!formData.nome || !formData.email || !formData.profissao || !formData.valor_investimento || !formData.investe_atualmente || !formData.prazo_investimento || !formData.ciente_emprestimos) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
      }
      
      submitButton.disabled = true;
      submitButton.textContent = 'ENVIANDO...';
      
      try {
        // 1. Envio para webhook principal (Validação de duplicidade)
        const response1 = await fetch('https://n8nwebhook.arck1pro.shop/webhook/lp-lead-direto', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        if (response1.status === 409) { 
          alert('Você já tem um cadastro conosco.');
          submitButton.disabled = false;
          submitButton.textContent = 'QUERO ME REGISTRAR';
          return; 
        }
        
        if (!response1.ok) {
          throw new Error('Erro na primeira validação do formulário.');
        }

        // 2. Envio para webhook secundário (RD Mkt)
        try {
            const response2 = await fetch('https://n8nwebhook.arck1pro.shop/webhook/lp-lead-direto-rdmkt', { 
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(formData)
            });
            if (!response2.ok) console.warn('Lead salvo, mas falha ao enviar para RD Mkt.');
        } catch (rdError) {
            console.warn('Erro de conexão com RD Mkt', rdError);
        }
        
        // 3. DISPARO DO PIXEL
        if (typeof fbq === 'function') {
          fbq('track', 'CompleteRegistration');
        }
        
        // 4. Redirecionamento
        window.location = 'obrigado.html';

      } catch (error) {
        alert('Ocorreu um erro ao enviar o cadastro. Tente novamente.');
        console.error(error);
        
        submitButton.disabled = false;
        submitButton.textContent = 'QUERO ME REGISTRAR';
      }
    });
});

// --- 5. FUNÇÃO GLOBAL ---
function scrollToForm() {
  const formElement = document.getElementById('register-form');
  if (formElement) {
    const containerParaRolar = formElement.closest('.form-container') || formElement;
    containerParaRolar.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
