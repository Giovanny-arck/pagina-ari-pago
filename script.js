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
  
  // --- INÍCIO DA NOVA MÁSCARA DE TELEFONE ---
  const whatsappInput = document.querySelector('input[name="whatsapp"]');
  
  whatsappInput.addEventListener('input', function(e) {
    let v = e.target.value.replace(/\D/g, ""); // Remove tudo que não é dígito
    
    // Limita a 11 dígitos (DDD + 9 números)
    if (v.length > 11) {
        v = v.substring(0, 11);
    }
    
    // Aplica a máscara padrão (XX) XXXXX-XXXX
    v = v.replace(/^(\d{2})(\d)/g, "($1) $2"); // Coloca parênteses em volta dos dois primeiros dígitos
    v = v.replace(/(\d)(\d{4})$/, "$1-$2");    // Coloca hífen antes dos últimos 4 dígitos
    
    e.target.value = v;
  });
  // --- FIM DA NOVA MÁSCARA DE TELEFONE ---
  
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Obtém apenas os números do telefone para validação e envio
    const rawPhone = form.whatsapp.value.replace(/\D/g, '');

    // Validação específica do telefone (deve ter 10 ou 11 dígitos)
    if (rawPhone.length < 10 || rawPhone.length > 11) {
        alert('Por favor, preencha um número de WhatsApp válido com DDD (ex: 11999998888).');
        return;
    }

    const formData = {
      nome: form.nome.value,
      email: form.email.value,
      // Adiciona o 55 automaticamente apenas no envio para o backend (n8n)
      whatsapp: '55' + rawPhone, 
      profissao: form.profissao.value, 
      valor_investimento: form.valor_investimento.value,
      ...capturedUtms 
    };
    
    if (!formData.nome || !formData.email || !formData.profissao || !formData.valor_investimento) {
      alert('Por favor, preencha todos os campos obrigatórios corretamente.');
      return;
    }
    
    submitButton.disabled = true;
    submitButton.textContent = 'ENVIANDO...';
    
    try {
      const response1 = await fetch('https://n8nwebhook.arck1pro.shop/webhook/crmeventonovembro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const response2 = await fetch('https://n8nwebhook.arck1pro.shop/webhook/mktcrmeventonovembro', {
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
        
        // MODIFICAÇÃO: Pequeno delay de 0.5s para garantir que o Pixel seja enviado antes de mudar de página
        setTimeout(function() {
            window.location.href = "pg_obrigado.html";
        }, 500);

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
