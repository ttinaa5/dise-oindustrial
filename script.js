/* script.js
   Malla interactiva:
   - Click en asignatura => alterna APROBADA (si está desbloqueada)
   - Guarda el estado en localStorage
   - Desbloquea asignaturas cuyas correlativas estén aprobadas
*/

/* ------------------ Datos de materias (según tu lista) ------------------
   Cada objeto: { id: <n>, nombre: "...", prereqs: [<id>, ...] }
   NOTA: Interpreté los números que suministraste como IDs y los últimos números
   de cada línea como las correlativas/requisitos.
--------------------------------------------------------------------------*/
const materias = [
  // Ciclo Básico 1°
  { id: 1, nombre: "Diseño I", prereqs: [] },
  { id: 2, nombre: "Lenguaje Proyectual I", prereqs: [] },
  { id: 3, nombre: "Pensamiento Contemporáneo I", prereqs: [] },
  { id: 4, nombre: "Tecnología Gral.", prereqs: [] },
  { id: 5, nombre: "Matemática", prereqs: [] },

  // Ciclo de Desarrollo 2°
  { id: 6, nombre: "Diseño II", prereqs: [1,2] },
  { id: 7, nombre: "Lenguaje Proyectual II", prereqs: [1,2] },
  { id: 8, nombre: "Pensamiento Contemporáneo II", prereqs: [1,2] },
  { id: 9, nombre: "Tecnología I", prereqs: [1,2] },
  { id: 10, nombre: "Física", prereqs: [5] },
  { id: 11, nombre: "Informática I", prereqs: [1,2] },

  // Ciclo de Desarrollo 3°
  { id: 12, nombre: "Diseño III", prereqs: [4,6,7] },
  { id: 13, nombre: "Lenguaje Proyectual III", prereqs: [7] },
  { id: 14, nombre: "Pensamiento Contemporáneo III", prereqs: [3] },
  { id: 15, nombre: "Tecnología II", prereqs: [4,5] },
  { id: 16, nombre: "Ingeniería Humana", prereqs: [4,5] },
  { id: 17, nombre: "Informática II", prereqs: [6,7] },

  // Ciclo de Desarrollo 4°
  { id: 18, nombre: "Diseño IV", prereqs: [9,12,13] },
  { id: 19, nombre: "Lenguaje Proyectual IV", prereqs: [11,13] },
  { id: 20, nombre: "Pensamiento Contemporáneo IV", prereqs: [8] },
  { id: 21, nombre: "Tecnología III", prereqs: [10,9] },
  { id: 22, nombre: "Economía y Marketing", prereqs: [3] },
  { id: 23, nombre: "Sociología", prereqs: [14] },

  // Ciclo de Investigación-Extensión 5°
  { id: 24, nombre: "Organización de la Producción", prereqs: [15,17,18,19] },
  { id: 25, nombre: "Legislación y Práctica Profesional", prereqs: [15,18,19] },
  { id: 26, nombre: "Proyecto de Graduación", prereqs: [16,18,19,20,21,22,23] }
];

/* ------------------ Ciclos (para orden y etiquetas) ------------------ */
const ciclos = [
  { clave: "Básico 1°", ids: [1,2,3,4,5] },
  { clave: "Desarrollo 2°", ids: [6,7,8,9,10,11] },
  { clave: "Desarrollo 3°", ids: [12,13,14,15,16,17] },
  { clave: "Desarrollo 4°", ids: [18,19,20,21,22,23] },
  { clave: "Investigación-Extensión 5°", ids: [24,25,26] }
];

/* ------------------ Persistencia (localStorage) ------------------ */
const STORAGE_KEY = "malla-aprobadas-veterinaria-v1";

function loadAprobadas(){
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return [];
    return JSON.parse(raw);
  } catch(e){
    console.error("Error cargando estado:", e);
    return [];
  }
}
function saveAprobadas(list){
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch(e){
    console.error("Error guardando estado:", e);
  }
}

/* ------------------ Estado en memoria ------------------ */
let aprobadas = loadAprobadas(); // array de ids aprobadas

/* ------------------ Utilidades ------------------ */
function isAprobada(id){
  return aprobadas.includes(id);
}
function canAprobar(materia){
  // si ya está aprobada, sigue permitiendo desmarcarla
  if(isAprobada(materia.id)) return true;
  // si no tiene prereqs => desbloqueada
  if(!materia.prereqs || materia.prereqs.length === 0) return true;
  // comprobar que todas las prereqs estén aprobadas
  return materia.prereqs.every(pid => isAprobada(pid));
}

/* ------------------ Renderizado ------------------ */
const container = document.getElementById("mallaContainer");

function render(){
  container.innerHTML = "";
  ciclos.forEach(ciclo => {
    const col = document.createElement("div");
    col.className = "ciclo";

    // header ciclo
    const header = document.createElement("div");
    header.className = "ciclo-header";
    header.innerHTML = `
      <div class="ciclo-title">${ciclo.clave}</div>
      <div class="tag">Asignaturas: ${ciclo.ids.length}</div>
    `;
    col.appendChild(header);

    // lista de asignaturas (orden vertical según ids)
    const lista = document.createElement("div");
    lista.className = "asignaturas-list";
    ciclo.ids.forEach(id => {
      const m = materias.find(x => x.id === id);
      if(!m) return;
      const caja = document.createElement("div");
      caja.className = "asignatura";
      if(isAprobada(m.id)) caja.classList.add("aprobada");
      // bloqueada si no puede aprobarse y no está aprobada
      if(!canAprobar(m) && !isAprobada(m.id)) caja.classList.add("bloqueada");

      // contenido
      const meta = document.createElement("div");
      meta.className = "meta";
      meta.innerHTML = `<div class="nombre">${m.nombre}</div><div class="id">#${m.id}</div>`;

      const corr = document.createElement("div");
      corr.className = "correlativas";
      corr.innerText = (m.prereqs && m.prereqs.length > 0)
        ? `Correlativas: ${m.prereqs.join(", ")}`
        : "Sin correlativas";

      caja.appendChild(meta);
      caja.appendChild(corr);

      // click handler: sólo si está desbloqueada o ya aprobada (permitir desmarcar)
      caja.addEventListener("click", () => {
        if(!canAprobar(m) && !isAprobada(m.id)){
          // bloqueada: no hacer nada
          // se podría mostrar un toast, pero mantenemos simple
          return;
        }
        // toggle aprobada
        if(isAprobada(m.id)){
          // quitar
          aprobadas = aprobadas.filter(x => x !== m.id);
        } else {
          aprobadas.push(m.id);
        }
        saveAprobadas(aprobadas);
        render(); // actualización inmediata
      });

      lista.appendChild(caja);
    });

    col.appendChild(lista);
    container.appendChild(col);
  });
}

/* ------------------ Controles: reset / export / import ------------------ */
document.getElementById("resetBtn").addEventListener("click", () => {
  if(!confirm("¿Borrar todo el progreso?")) return;
  aprobadas = [];
  saveAprobadas(aprobadas);
  render();
});

document.getElementById("exportBtn").addEventListener("click", () => {
  const dataStr = JSON.stringify({ aprobadas }, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "malla-progreso.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

document.getElementById("importBtn").addEventListener("click", () => {
  document.getElementById("importInput").click();
});
document.getElementById("importInput").addEventListener("change", (ev) => {
  const f = ev.target.files[0];
  if(!f) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const obj = JSON.parse(e.target.result);
      if(!obj.aprobadas || !Array.isArray(obj.aprobadas)) throw new Error("Formato inválido");
      aprobadas = obj.aprobadas.map(x => Number(x));
      saveAprobadas(aprobadas);
      render();
      alert("Progreso importado correctamente.");
    } catch(err){
      alert("Error importando: " + err.message);
    }
  };
  reader.readAsText(f);
});

/* ------------------ Inicialización ------------------ */
render();

