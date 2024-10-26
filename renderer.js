const connectBtn = document.getElementById('connect-btn');
const connectionForm = document.getElementById('connection-form');
const maincontainer = document.getElementById('main-container');
const entryInput = document.getElementById('entry');
const UpdateMessage = document.getElementById('update-message')
const entryStatus = document.getElementById('entry-status');
const createNpcBtn = document.getElementById('create-npc-btn');
const buscarNpcBtn = document.getElementById('buscar-npc-btn');
const successMessage = document.getElementById('success-message');
const successEditNpcMessage = document.getElementById('success-edit-npc-message');
const dbErrorMessage = document.getElementById('db-error-message');
const A6c62058ab695b3d3a521fc9e92c6ee01 = document.getElementById('6c62058ab695b3d3a521fc9e92c6ee01');
const donateModal = document.getElementById('f5c986942e09682bb4866bda70730ebc');
const modalOverlay = document.getElementById('modal-overlay');
const closeModalButton = document.getElementById('close-modal');

// Referências aos elementos do RealmList
const tableBody = document.querySelector('#realmlist-table tbody');
const modal = document.querySelector('#realmlist-modal');
const closeModalBtn = document.querySelector('#close-modal-btn');
const saveRealmBtn = document.querySelector('#save-realm-btn');
const realmIdInput = document.querySelector('#realm-id');
const realmNameInput = document.querySelector('#realm-name');
const realmAddressInput = document.querySelector('#realm-address');
const createRealmBtn = document.querySelector('#create-realm-btn');
// Fechar o modal
closeModalBtn.addEventListener('click', () => {
  modal.style.display = 'none';
});

// Abrir o modal para edição
function openModal(realm) {
  realmIdInput.value = realm.id;
  realmNameInput.value = realm.name;
  realmAddressInput.value = realm.address;
  modal.style.display = 'block';
}

// Função para carregar credenciais do cache
async function carregarCredenciais() {
  console.log('Carregando credenciais do cache...');
  const cachedCredentials = await window.electron.invoke('get-cached-credentials');
  if (cachedCredentials) {
    console.log('Credenciais encontradas:', cachedCredentials);
    document.getElementById('host').value = cachedCredentials.host;
    document.getElementById('port').value = cachedCredentials.port;
    document.getElementById('username').value = cachedCredentials.username;
    document.getElementById('password').value = cachedCredentials.password;
    document.getElementById('database1').value = cachedCredentials.database1;
    document.getElementById('database2').value = cachedCredentials.database2;
  } else {
    console.log('Nenhuma credencial encontrada no cache.');
  }
}

// Evento onload para verificar atualizações e carregar credenciais
window.onload = async () => {
  console.log('DOM carregado'); // Verificar se o DOM está sendo carregado
  const realms = await window.electron.getRealmlist();
  preencherTabela(realms);
  window.electron.onAppVersion((version) => {
      console.log('Versão recebida:', version); // LOG de conferência
      document.getElementById('app-version').innerText = version;
  });
  await Promise.all([carregarCredenciais()]);
  const updateInfo = await window.electron.invoke('verificar-atualizacao');

  if (updateInfo.updateAvailable) {
    // Exibe a mensagem de atualização
    document.getElementById('update-message').innerText = `Nova atualização disponível`;
    UpdateMessage.classList.remove('hidden');
  }
};

// Função auxiliar para acessar chaves aninhadas
function getNestedValue(obj, key) {
  return key.split('.').reduce((acc, part) => acc && acc[part], obj);
}

async function applyTranslations(lang = 'pt-br') {
  const translations = await window.electron.loadTranslations(lang);

  const elements = document.querySelectorAll('[data-translate]');
  elements.forEach((el) => {
    const key = el.getAttribute('data-translate');
    const translatedText = getNestedValue(translations, key);
    if (translatedText) {
      el.innerHTML = translatedText;
    }
  });
}
// Adiciona evento para mudança de idioma
document.getElementById('language-selector').addEventListener('change', (event) => {
  const selectedLang = event.target.value;
  applyTranslations(selectedLang); // Reaplica as traduções com o novo idioma
});

window.addEventListener('DOMContentLoaded', () => applyTranslations());
// Conectar ao banco de dados
connectBtn.addEventListener('click', () => {
  const host = document.getElementById('host').value;
  const port = document.getElementById('port').value;
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const database1 = document.getElementById('database1').value;
  const database2 = document.getElementById('database2').value;

  console.log('Enviando credenciais para conexão...', { host, port, username, password, database1, database2 });
  window.electron.send('connect-db', { host, port, username, password, database1, database2 });
});
// Exibir o formulário de NPC após conexão bem-sucedida e ocultar o formulário de conexão
window.electron.on('db-connected', () => {
  console.log('Conexão ao banco de dados bem-sucedida!');
  connectionForm.classList.add('hidden'); 
  maincontainer.classList.remove('hidden');  
  sidebar.classList.remove('hidden');
  homesession.classList.remove('hidden'); 
  
});

window.electron.on('db-connected-false', () => {
  dbErrorMessage.style.display = 'block';
  dbErrorMessage.style.opacity = '1';
  dbErrorMessage.classList.add('bg-red');

  setTimeout(() => {
    dbErrorMessage.style.opacity = '0';
    setTimeout(() => (dbErrorMessage.style.display = 'none'), 500);
  }, 3000);
});

// Verificar se o "entry" já está em uso
entryInput.addEventListener('input', async (e) => {
  const entry = e.target.value;
  console.log('Verificando se o entry já está em uso:', entry);

  const exists = await window.electron.invoke('check-entry', entry);
  if (exists) {
    entryStatus.textContent = 'Entry já em uso!';
    entryStatus.style.color = 'red';
    createNpcBtn.disabled = true;
  } else {
    entryStatus.textContent = 'Entry disponível!';
    entryStatus.style.color = 'LawnGreen';
    createNpcBtn.disabled = false;
  }
});

// Enviar dados do NPC para criação
createNpcBtn.addEventListener('click', () => {
  const npcData = {
    entry: entryInput.value,
    name: document.getElementById('name').value,
    subname: document.getElementById('subname').value,
    faction: document.getElementById('faction').value,
    minlevel: document.getElementById('minlevel').value,
    maxlevel: document.getElementById('maxlevel').value,
    npcflag: document.getElementById('npcflag').value,
    VerifiedBuild: 12340,
    modelData: {
      CreatureID: entryInput.value,
      Idx: 0,
      CreatureDisplayID: document.getElementById('creature-display-id').value,
      DisplayScale: document.getElementById('display-scale').value || 1,
      Probability: document.getElementById('probability').value || 1,
      VerifiedBuild: 12340
    }
  };

  console.log('Enviando dados do NPC para criação:', npcData);
  window.electron.send('create-npc', npcData);
  showSuccessMessage();
});

// Exibir uma mensagem de sucesso por 3 segundos
function showSuccessMessage() {
  successMessage.style.display = 'block';
  successMessage.style.opacity = '1';

  setTimeout(() => {
    successMessage.style.opacity = '0';
    setTimeout(() => (successMessage.style.display = 'none'), 500);
  }, 3000);
}
// Exibir uma mensagem de sucesso por 3 segundos
function showsuccessEditNpcMessage() {
  successEditNpcMessage.style.display = 'block';
  successEditNpcMessage.style.opacity = '1';

  setTimeout(() => {
    successEditNpcMessage.style.opacity = '0';
    setTimeout(() => (successEditNpcMessage.style.display = 'none'), 500);
  }, 3000);
}

// Menu DropDown
document.addEventListener("DOMContentLoaded", function() {
  const dropdownToggles = document.querySelectorAll(".dropdown-toggle");

  dropdownToggles.forEach(toggle => {
    toggle.addEventListener("click", function(e) {
      e.preventDefault(); // Impede a ação padrão do link
      this.classList.toggle("active"); // Alterna a classe 'active' no link
      const dropdown = this.nextElementSibling; // Seleciona o próximo elemento (ul.dropdown)
      if (dropdown.style.display === "block") {
        dropdown.style.display = "none"; // Esconde o dropdown
      } else {
        dropdown.style.display = "block"; // Exibe o dropdown
      }
    });
  });
});
//Busca de NPC
document.getElementById('buscar-npc-btn').addEventListener('click', async () => {
  const entry = document.getElementById('entry-input').value;
  const name = document.getElementById('name-input').value;
  const subname = document.getElementById('subname-input').value;
  try {
    const npcs = await window.electron.buscarNPCs({ entry, name, subname });
    mostrarResultados(npcs);
  } catch (error) {
    console.error('Erro ao buscar NPCs:', error);
  }
});

function mostrarResultados(npcs) {
  const resultadosDiv = document.getElementById('resultados');
  resultadosDiv.innerHTML = '';

  npcs.forEach(npc => {
    const npcDiv = document.createElement('tr');
    npcDiv.innerHTML = `<td>${npc.entry}</td><td>${npc.name}</td><td>${npc.subname}</td>`;
    npcDiv.addEventListener('click', () => abrirModal(npc));

    resultadosDiv.appendChild(npcDiv);
  });
}

function abrirModal(npc) {
  document.getElementById('npc-entry').value = npc.entry;
  document.getElementById('npc-name').value = npc.name;
  document.getElementById('npc-subname').value = npc.subname;
  document.getElementById('npc-minlevel').value = npc.minlevel;
  document.getElementById('npc-maxlevel').value = npc.maxlevel;
  document.getElementById('npc-faction').value = npc.faction;
  document.getElementById('npc-npcflag').value = npc.npcflag;

  const SearchentryInput = npc.entry;
  document.getElementById('npc-CreatureID').value = SearchentryInput;
  document.getElementById('npc-CreatureDisplayID').value = npc.CreatureDisplayID;
  document.getElementById('npc-DisplayScale').value = npc.DisplayScale;
  document.getElementById('npc-Probability').value = npc.Probability;

  const modal = document.getElementById('modal-editar');
  modal.classList.add('active');
}

document.getElementById('fechar-modal-btn').addEventListener('click', () => {
  document.getElementById('modal-editar').classList.remove('active');
});

document.getElementById('salvar-edicao-btn').addEventListener('click', async () => {
  const entry = document.getElementById('npc-entry').value;
  const name = document.getElementById('npc-name').value;
  const subname = document.getElementById('npc-subname').value;
  const minlevel = document.getElementById('npc-minlevel').value;
  const maxlevel = document.getElementById('npc-maxlevel').value;
  const faction = document.getElementById('npc-faction').value;
  const npcflag = document.getElementById('npc-npcflag').value;
  const CreatureDisplayID = document.getElementById('npc-CreatureDisplayID').value;
  const DisplayScale = document.getElementById('npc-DisplayScale').value;
  const Probability = document.getElementById('npc-Probability').value;
  const CreatureID = document.getElementById('npc-entry').value;
  try {
    await window.electron.editarNPC({ entry, name, subname, minlevel, maxlevel, faction, npcflag, CreatureDisplayID, DisplayScale, Probability, CreatureID});
    
    document.getElementById('modal-editar').classList.remove('active');
  } catch (error) {
    console.error('Erro ao editar NPC:', error);
    alert('Erro ao atualizar NPC.');
  }
});
//Modal do painel
    function OpenDonateModal() {
      donateModal.style.display = 'block'; 
      document.getElementById('D41D8CD9').innerText = D41D8CD9;
      document.getElementById('F800B204').innerText = F800B204;
      document.getElementById('A34095e673f78539ea65fe2535b3b2620').innerHTML = AB221024;
      modalOverlay.style.display = 'block';
  }

  function CloseDonateModal() {
      donateModal.style.display = 'none';
      modalOverlay.style.display = 'none';
  }
  A6c62058ab695b3d3a521fc9e92c6ee01.addEventListener('click', OpenDonateModal);
  closeModalButton.addEventListener('click', CloseDonateModal);
  // Fechar modal ao clicar fora dele
  modalOverlay.addEventListener('click', CloseDonateModal);

  const b4698d02 = 
  "ht" + "t" + "ps:" + "//" + "i" + ".i" + "mg" + "ur" + ".c" + "om" + 
  "/R" + "Ic" + "iao" + "M" + ".p" + "ng";

    const AB221024 = 
    `<p>` + `Pi` + `x:` + `</` + `p>` +
    `<im` + `g ` + `sr` + `c=` + 
    `"${b4698d02}"` + `al` + `t=` + `"Im` + 
    `ag` + `em` + ` d` + `e ` + `Do` + `aç` + 
    `ão"` + ` st` + `yl` + `e="` + `ma` + `x-w` + 
    `idt` + `h: ` + `10` + `0%;` + ` he` + `igh` + 
    `t: a` + `ut` + `o;">`;


  const D41D8CD9 = 
  "Ag" + "ra" + "de" + "ce" + "mo" + "s " +
  "su" + "a " + "ge" + "ne" + "ro" + "si" + "da" + "de!";

  const F800B204 = 
  "F" + "a" + "ç" + 
  "a " + "u" + "m" + 
  "a" + " D" + "o" + 
  "aç" + "ã" + "o";
//Links Externos
document.getElementById('release-link').addEventListener('click', (event) => {
  event.preventDefault(); // Impede o comportamento padrão do link
  window.electron.shell.openExternal('https://github.com/AzerothLegends/AzerothForge/releases');
});
document.getElementById('repo-link').addEventListener('click', (event) => {
  event.preventDefault(); // Impede o comportamento padrão do link
  window.electron.shell.openExternal('https://github.com/AzerothLegends/AzerothForge');
});

// Preencher a tabela com os dados da realmlist
function preencherTabela(realms) {
  tableBody.innerHTML = ''; // Limpar a tabela

  realms.forEach((realm) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${realm.id}</td>
      <td>${realm.name}</td>
      <td>${realm.address}</td>
    `;
    row.addEventListener('click', () => openModal(realm));
    tableBody.appendChild(row);
  });
}

// Enviar dados editados para o processo principal
saveRealmBtn.addEventListener('click', async () => {
  const updatedRealm = {
    id: realmIdInput.value,
    name: realmNameInput.value,
    address: realmAddressInput.value,
  };

  const success = await window.electron.invoke('update-realm', updatedRealm);
  if (success) {
    modal.style.display = 'none'; // Fechar o modal após salvar
    const realms = await window.electron.invoke('get-realmlist'); // Recarregar dados atualizados
    preencherTabela(realms);
  } else {
    console.error('Erro ao atualizar o realm');
  }
});
createRealmBtn.addEventListener('click', async () => {
  console.log('Botão "Criar Novo Realm" clicado');  // Log de clique

  const success = await window.electron.createRealm();
  console.log(`Resultado da criação: ${success}`);  // Log de resultado

  if (success) {
    const realms = await window.electron.getRealmlist();
    console.log('Realms atualizados:', realms);  // Log de novos realms
    preencherTabela(realms);
  } else {
    console.error('Erro ao criar novo realm');
  }
});