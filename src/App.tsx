/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { 
  Bone, 
  Activity, 
  Zap, 
  Eye, 
  EyeOff, 
  RotateCcw, 
  MousePointer2, 
  Info,
  ChevronRight,
  CheckCircle2,
  XCircle,
  PlayCircle,
  Layers,
  Search,
  ExternalLink,
  Maximize2,
  X
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface Question {
  q: string;
  a: string;
  opts: string[];
  category: string;
}

interface UserAnswer {
  question: string;
  selected: string;
  correct: string;
  isCorrect: boolean;
}

// --- Constants ---
const QUESTION_BANK: Question[] = [
  // --- OSTEOLOGÍA (15) ---
  {q: "¿Qué accidente anatómico divide la cara posterior de la escápula?", a: "Espina de la escápula", opts: ["Acromion", "Apófisis coracoides", "Espina de la escápula", "Cavidad glenoidea"], category: "Osteología"},
  {q: "¿En qué hueso se encuentra el surco intertubercular (corredera bicipital)?", a: "Húmero", opts: ["Radio", "Cúbito", "Húmero", "Clavícula"], category: "Osteología"},
  {q: "¿Con qué se articula el cóndilo (capitulum) del húmero?", a: "Cabeza del radio", opts: ["Olécranon", "Cabeza del radio", "Apófisis coronoides", "Troclea"], category: "Osteología"},
  {q: "¿Qué hueso del carpo presenta un gancho palpable?", a: "Ganchoso", opts: ["Grande", "Ganchoso", "Pisiforme", "Escafoides"], category: "Osteología"},
  {q: "¿Cuál es el hueso fracturado más comúnmente en el carpo?", a: "Escafoides", opts: ["Semilunar", "Piramidal", "Escafoides", "Trapecio"], category: "Osteología"},
  {q: "¿Qué estructura se inserta en la apófisis coracoides?", a: "Músculo pectoral menor", opts: ["Músculo pectoral mayor", "Músculo pectoral menor", "Músculo supraespinoso", "Músculo deltoides"], category: "Osteología"},
  {q: "¿Qué hueso del antebrazo es medial en posición anatómica?", a: "Cúbito", opts: ["Radio", "Cúbito", "Húmero", "Escafoides"], category: "Osteología"},
  {q: "¿Dónde se localiza la fosa olecraneana?", a: "Extremo distal del húmero, cara posterior", opts: ["Extremo distal del húmero, cara anterior", "Extremo distal del húmero, cara posterior", "Extremo proximal del cúbito", "Extremo proximal del radio"], category: "Osteología"},
  {q: "¿Qué hueso del carpo se articula con el primer metacarpiano?", a: "Trapecio", opts: ["Trapezoide", "Trapecio", "Grande", "Escafoides"], category: "Osteología"},
  {q: "¿Cuál es el orden de la fila proximal del carpo (de lateral a medial)?", a: "Escafoides, Semilunar, Piramidal, Pisiforme", opts: ["Trapecio, Trapezoide, Grande, Ganchoso", "Escafoides, Semilunar, Piramidal, Pisiforme", "Pisiforme, Piramidal, Semilunar, Escafoides", "Escafoides, Trapecio, Grande, Ganchoso"], category: "Osteología"},
  {q: "¿Qué parte del radio se articula con la escotadura radial del cúbito?", a: "Circunferencia articular de la cabeza", opts: ["Apófisis estiloides", "Tuberosidad del radio", "Circunferencia articular de la cabeza", "Cuello del radio"], category: "Osteología"},
  {q: "¿Qué estructura forma el relieve del codo?", a: "Olécranon", opts: ["Apófisis coronoides", "Olécranon", "Epicóndilo medial", "Cabeza del radio"], category: "Osteología"},
  {q: "¿Qué tipo de hueso es la clavícula?", a: "Hueso largo", opts: ["Hueso plano", "Hueso largo", "Hueso corto", "Hueso irregular"], category: "Osteología"},
  {q: "¿Qué fosa se encuentra por encima de la espina de la escápula?", a: "Fosa supraespinosa", opts: ["Fosa infraespinosa", "Fosa subescapular", "Fosa supraespinosa", "Fosa glenoidea"], category: "Osteología"},
  {q: "¿Qué hueso posee la apófisis estiloides medial?", a: "Cúbito", opts: ["Radio", "Cúbito", "Húmero", "Semilunar"], category: "Osteología"},

  // --- MIOLOGÍA (15) ---
  {q: "¿Qué músculo es el principal abductor del brazo hasta los 90 grados?", a: "Deltoides", opts: ["Supraespinoso", "Pectoral mayor", "Deltoides", "Dorsal ancho"], category: "Miología"},
  {q: "¿Qué músculo se inserta en la tuberosidad bicipital del radio?", a: "Bíceps braquial", opts: ["Braquial", "Bíceps braquial", "Braquiorradial", "Supinador"], category: "Miología"},
  {q: "¿Cuál de estos músculos pertenece al manguito rotador?", a: "Subescapular", opts: ["Redondo mayor", "Subescapular", "Deltoides", "Pectoral menor"], category: "Miología"},
  {q: "¿Qué músculo forma la pared medial de la axila?", a: "Serrato anterior", opts: ["Subescapular", "Pectoral mayor", "Serrato anterior", "Dorsal ancho"], category: "Miología"},
  {q: "¿Qué músculo es el principal extensor del antebrazo?", a: "Tríceps braquial", opts: ["Bíceps braquial", "Braquial", "Tríceps braquial", "Ancóneo"], category: "Miología"},
  {q: "¿Qué músculo inicia la abducción del brazo (primeros 15°)?", a: "Supraespinoso", opts: ["Deltoides", "Supraespinoso", "Infraespinoso", "Redondo menor"], category: "Miología"},
  {q: "¿Qué músculo se conoce como el 'músculo del boxeador'?", a: "Serrato anterior", opts: ["Pectoral mayor", "Serrato anterior", "Deltoides", "Tríceps"], category: "Miología"},
  {q: "¿Qué músculo flexiona el brazo y es perforado por el nervio musculocutáneo?", a: "Coracobraquial", opts: ["Bíceps braquial", "Braquial", "Coracobraquial", "Pectoral menor"], category: "Miología"},
  {q: "¿Cuál es la acción principal del músculo braquiorradial?", a: "Flexión del antebrazo", opts: ["Extensión del antebrazo", "Flexión del antebrazo", "Supinación", "Pronación"], category: "Miología"},
  {q: "¿Qué músculo forma el límite lateral de la fosa del codo?", a: "Braquiorradial", opts: ["Pronador redondo", "Braquiorradial", "Bíceps braquial", "Braquial"], category: "Miología"},
  {q: "¿Qué músculo es el principal pronador del antebrazo?", a: "Pronador redondo", opts: ["Pronador cuadrado", "Pronador redondo", "Braquiorradial", "Supinador"], category: "Miología"},
  {q: "¿Qué músculo se inserta en el olécranon?", a: "Tríceps braquial", opts: ["Bíceps braquial", "Braquial", "Tríceps braquial", "Coracobraquial"], category: "Miología"},
  {q: "¿Qué músculo del manguito rotador realiza rotación medial?", a: "Subescapular", opts: ["Supraespinoso", "Infraespinoso", "Redondo menor", "Subescapular"], category: "Miología"},
  {q: "¿Qué músculo retrae la escápula?", a: "Romboides", opts: ["Serrato anterior", "Romboides", "Pectoral menor", "Subclavio"], category: "Miología"},
  {q: "¿Qué músculo se inserta en la base del segundo metacarpiano?", a: "Extensor radial largo del carpo", opts: ["Extensor radial corto del carpo", "Extensor radial largo del carpo", "Flexor radial del carpo", "Extensor cubital del carpo"], category: "Miología"},

  // --- ANGIOLOGÍA (15) ---
  {q: "¿Dónde termina la arteria axilar y comienza la braquial?", a: "Borde inferior del pectoral mayor", opts: ["Borde superior del pectoral menor", "Borde inferior del pectoral mayor", "Cuello del húmero", "Fosa cubital"], category: "Angiología"},
  {q: "¿Qué arteria pasa por el canal del pulso?", a: "Arteria Radial", opts: ["Arteria Cubital", "Arteria Radial", "Arteria Interósea", "Arteria Mediana"], category: "Angiología"},
  {q: "¿Qué arteria acompaña al nervio radial en el surco de torsión?", a: "Braquial profunda", opts: ["Colateral cubital", "Braquial profunda", "Nutricia", "Circunfleja"], category: "Angiología"},
  {q: "¿Cuál es la rama terminal de la arteria braquial que es más medial?", a: "Arteria Cubital", opts: ["Arteria Radial", "Arteria Cubital", "Arteria Interósea", "Arteria Braquial Profunda"], category: "Angiología"},
  {q: "¿Qué vena se origina en la parte lateral de la red venosa dorsal de la mano?", a: "Vena Cefálica", opts: ["Vena Basílica", "Vena Cefálica", "Vena Axilar", "Vena Mediana"], category: "Angiología"},
  {q: "¿Qué arteria da origen a la arteria interósea común?", a: "Arteria Cubital", opts: ["Arteria Radial", "Arteria Cubital", "Arteria Braquial", "Arteria Axilar"], category: "Angiología"},
  {q: "¿Qué estructura separa la arteria axilar en tres porciones?", a: "Músculo pectoral menor", opts: ["Músculo pectoral mayor", "Músculo pectoral menor", "Músculo subclavio", "Clavícula"], category: "Angiología"},
  {q: "¿Qué arteria forma principalmente el arco palmar profundo?", a: "Arteria Radial", opts: ["Arteria Cubital", "Arteria Radial", "Arteria Mediana", "Arteria Interósea"], category: "Angiología"},
  {q: "¿Qué vena drena directamente en la vena axilar?", a: "Vena Cefálica", opts: ["Vena Basílica", "Vena Cefálica", "Vena Yugular", "Vena Braquiocefálica"], category: "Angiología"},
  {q: "¿Cuál es la primera rama de la arteria axilar?", a: "Arteria torácica superior", opts: ["Arteria toracoacromial", "Arteria torácica superior", "Arteria subescapular", "Arteria torácica lateral"], category: "Angiología"},
  {q: "¿Qué arteria rodea el cuello quirúrgico del húmero?", a: "Arteria circunfleja humeral posterior", opts: ["Arteria braquial profunda", "Arteria circunfleja humeral posterior", "Arteria subescapular", "Arteria supraescapular"], category: "Angiología"},
  {q: "¿Dónde se localiza la vena basílica en el antebrazo?", a: "Lado medial", opts: ["Lado lateral", "Lado medial", "Lado anterior central", "Lado posterior central"], category: "Angiología"},
  {q: "¿Qué arteria irriga el compartimiento posterior del brazo?", a: "Arteria braquial profunda", opts: ["Arteria braquial", "Arteria braquial profunda", "Arteria axilar", "Arteria cubital"], category: "Angiología"},
  {q: "¿Qué vena se utiliza comúnmente para venopunción en la fosa del codo?", a: "Vena mediana del codo", opts: ["Vena cefálica", "Vena basílica", "Vena mediana del codo", "Vena axilar"], category: "Angiología"},
  {q: "¿Qué arteria pasa por la tabaquera anatómica?", a: "Arteria Radial", opts: ["Arteria Cubital", "Arteria Radial", "Arteria Interósea", "Arteria Mediana"], category: "Angiología"},

  // --- NEUROLOGÍA (15) ---
  {q: "¿Qué nervio inerva los músculos del compartimiento posterior del brazo?", a: "Nervio Radial", opts: ["Nervio Cubital", "Nervio Mediano", "Nervio Radial", "Nervio Axilar"], category: "Neurología"},
  {q: "¿La lesión de qué nervio provoca la 'mano en garra'?", a: "Nervio Cubital", opts: ["Nervio Radial", "Nervio Mediano", "Nervio Cubital", "Nervio Musculocutáneo"], category: "Neurología"},
  {q: "¿Qué nervio transcurre por el túnel carpiano?", a: "Nervio Mediano", opts: ["Nervio Radial", "Nervio Cubital", "Nervio Mediano", "Nervio Axilar"], category: "Neurología"},
  {q: "¿Qué nervio rodea el cuello quirúrgico del húmero?", a: "Nervio Axilar", opts: ["Nervio Radial", "Nervio Axilar", "Nervio Supraescapular", "Nervio Musculocutáneo"], category: "Neurología"},
  {q: "¿Qué nervio inerva al músculo bíceps braquial?", a: "Nervio Musculocutáneo", opts: ["Nervio Mediano", "Nervio Radial", "Nervio Musculocutáneo", "Nervio Axilar"], category: "Neurología"},
  {q: "¿Qué nervio inerva la mayoría de los músculos intrínsecos de la mano?", a: "Nervio Cubital", opts: ["Nervio Mediano", "Nervio Radial", "Nervio Cubital", "Nervio Axilar"], category: "Neurología"},
  {q: "¿La lesión de qué nervio provoca la 'mano caída'?", a: "Nervio Radial", opts: ["Nervio Mediano", "Nervio Radial", "Nervio Cubital", "Nervio Axilar"], category: "Neurología"},
  {q: "¿Qué raíces espinales forman el plexo braquial?", a: "C5-T1", opts: ["C1-C4", "C5-T1", "T1-T12", "L1-L5"], category: "Neurología"},
  {q: "¿Qué nervio inerva al músculo serrato anterior?", a: "Nervio torácico largo", opts: ["Nervio toracodorsal", "Nervio torácico largo", "Nervio supraescapular", "Nervio axilar"], category: "Neurología"},
  {q: "¿Qué nervio inerva al músculo dorsal ancho?", a: "Nervio toracodorsal", opts: ["Nervio toracodorsal", "Nervio torácico largo", "Nervio subescapular", "Nervio axilar"], category: "Neurología"},
  {q: "¿Qué nervio pasa por detrás del epicóndilo medial del húmero?", a: "Nervio Cubital", opts: ["Nervio Radial", "Nervio Mediano", "Nervio Cubital", "Nervio Axilar"], category: "Neurología"},
  {q: "¿Qué nervio inerva los músculos de la eminencia tenar (excepto el aductor)?", a: "Nervio Mediano", opts: ["Nervio Radial", "Nervio Mediano", "Nervio Cubital", "Nervio Musculocutáneo"], category: "Neurología"},
  {q: "¿Qué nervio inerva la piel de la cara lateral del antebrazo?", a: "Nervio musculocutáneo (N. cutáneo antebraquial lateral)", opts: ["Nervio radial", "Nervio mediano", "Nervio musculocutáneo (N. cutáneo antebraquial lateral)", "Nervio cubital"], category: "Neurología"},
  {q: "¿De qué fascículo del plexo braquial se origina el nervio cubital?", a: "Fascículo medial", opts: ["Fascículo lateral", "Fascículo medial", "Fascículo posterior", "Tronco superior"], category: "Neurología"},
  {q: "¿Qué nervio inerva al músculo deltoides?", a: "Nervio Axilar", opts: ["Nervio Supraescapular", "Nervio Axilar", "Nervio Radial", "Nervio Toracodorsal"], category: "Neurología"},
  
  // --- ARTROLOGÍA (10) ---
  {q: "¿Qué tipo de articulación es la glenohumeral?", a: "Esferoidea (Enartrosis)", opts: ["Plana", "Gínglimo", "Esferoidea (Enartrosis)", "En silla de montar"], category: "Artrología"},
  {q: "¿Qué estructura amplía la cavidad glenoidea para la cabeza del húmero?", a: "Rodete glenoideo (Labrum)", opts: ["Cápsula articular", "Rodete glenoideo (Labrum)", "Ligamento coracohumeral", "Bolsa subacromial"], category: "Artrología"},
  {q: "¿Qué tipo de articulación es la esternoclavicular?", a: "En silla de montar (Encaje recíproco)", opts: ["Plana", "Esferoidea", "En silla de montar (Encaje recíproco)", "Trocoide"], category: "Artrología"},
  {q: "¿Cuál de estas articulaciones del codo permite la pronosupinación?", a: "Radiocubital proximal", opts: ["Humerocubital", "Humerorradial", "Radiocubital proximal", "Radiocarpiana"], category: "Artrología"},
  {q: "¿Qué ligamento del codo rodea la cabeza del radio?", a: "Ligamento anular del radio", opts: ["Ligamento colateral radial", "Ligamento colateral cubital", "Ligamento anular del radio", "Ligamento cuadrado"], category: "Artrología"},
  {q: "¿Qué tipo de articulación es la radiocarpiana (muñeca)?", a: "Elipsoidea (Condílea)", opts: ["Troclear", "Esferoidea", "Elipsoidea (Condílea)", "Trocoide"], category: "Artrología"},
  {q: "¿Qué huesos se articulan principalmente en la articulación de la muñeca?", a: "Radio con Escafoides y Semilunar", opts: ["Cúbito con Piramidal", "Radio con Grande y Ganchoso", "Radio con Escafoides y Semilunar", "Cúbito con Pisiforme"], category: "Artrología"},
  {q: "¿Qué tipo de articulación es la carpometacarpiana del pulgar?", a: "En silla de montar", opts: ["Plana", "En silla de montar", "Condílea", "Troclear"], category: "Artrología"},
  {q: "¿Qué tipo de articulación son las interfalángicas?", a: "Gínglimo (Troclear)", opts: ["Condílea", "Gínglimo (Troclear)", "Plana", "Trocoide"], category: "Artrología"},
  {q: "¿Qué articulación une el esqueleto del miembro superior con el esqueleto axial?", a: "Esternoclavicular", opts: ["Acromioclavicular", "Glenohumeral", "Esternoclavicular", "Escapulotorácica"], category: "Artrología"},
  {q: "¿Qué ligamento refuerza la parte superior de la articulación glenohumeral?", a: "Ligamento coracohumeral", opts: ["Ligamento glenohumeral inferior", "Ligamento coracohumeral", "Ligamento transverso del húmero", "Ligamento conoideo"], category: "Artrología"},
  {q: "¿Qué tipo de articulación es la acromioclavicular?", a: "Sinovial plana (Artrodia)", opts: ["Esferoidea", "Sinovial plana (Artrodia)", "Trocoide", "Gínglimo"], category: "Artrología"},
  {q: "¿Qué ligamento estabiliza la articulación acromioclavicular evitando el desplazamiento superior de la clavícula?", a: "Ligamento coracoclavicular", opts: ["Ligamento acromioclavicular", "Ligamento coracoclavicular", "Ligamento coracoacromial", "Ligamento transverso"], category: "Artrología"},
  {q: "¿Cuál es el componente medial del ligamento coracoclavicular?", a: "Ligamento conoideo", opts: ["Ligamento trapezoideo", "Ligamento conoideo", "Ligamento acromial", "Ligamento costoclavicular"], category: "Artrología"},
  {q: "¿Qué articulación del codo permite el movimiento de bisagra (flexo-extensión)?", a: "Humerocubital", opts: ["Humerorradial", "Radiocubital proximal", "Humerocubital", "Radiocarpiana"], category: "Artrología"},
  {q: "¿Qué ligamento del codo se lesiona con frecuencia en lanzadores de béisbol (Tommy John)?", a: "Ligamento colateral cubital", opts: ["Ligamento colateral radial", "Ligamento colateral cubital", "Ligamento anular", "Ligamento cuadrado"], category: "Artrología"},
  {q: "¿Qué estructura separa la articulación radiocarpiana del cúbito?", a: "Disco articular (Fibrocartílago triangular)", opts: ["Cápsula articular", "Ligamento colateral", "Disco articular (Fibrocartílago triangular)", "Menisco cubital"], category: "Artrología"},
  {q: "¿Qué tipo de articulación son las mediocarpianas?", a: "Sinoviales planas", opts: ["Sinoviales planas", "Trocleares", "Condíleas", "Enartrosis"], category: "Artrología"},
  {q: "¿Qué ligamento mantiene la cabeza del radio en contacto con la escotadura radial del cúbito?", a: "Ligamento anular", opts: ["Ligamento cuadrado", "Ligamento anular", "Ligamento colateral radial", "Cuerda oblicua"], category: "Artrología"},
  {q: "¿Cuál es la patología caracterizada por la inflamación de la vaina sinovial de los tendones en el túnel carpiano?", a: "Síndrome del túnel carpiano", opts: ["Epicondilitis", "Síndrome del túnel carpiano", "Tendinitis de De Quervain", "Dedo en gatillo"], category: "Artrología"},
  {q: "¿Qué articulación se ve afectada principalmente en la 'luxación de hombro' más común?", a: "Glenohumeral", opts: ["Acromioclavicular", "Esternoclavicular", "Glenohumeral", "Escapulotorácica"], category: "Artrología"},
  {q: "¿Cómo se denomina la inflamación del epicóndilo lateral del húmero?", a: "Codo de tenista", opts: ["Codo de golfista", "Codo de tenista", "Bursitis olecraniana", "Artrosis de codo"], category: "Artrología"},
  {q: "¿Qué ligamento es fundamental para la estabilidad de la articulación esternoclavicular?", a: "Ligamento costoclavicular", opts: ["Ligamento coracoclavicular", "Ligamento costoclavicular", "Ligamento acromioclavicular", "Ligamento glenohumeral"], category: "Artrología"},
  {q: "¿Qué tipo de articulación es la radiocubital distal?", a: "Trocoide (Pivote)", opts: ["Gínglimo", "Trocoide (Pivote)", "Plana", "Esferoidea"], category: "Artrología"},
  {q: "¿Qué estructura se interpone en la articulación esternoclavicular para mejorar la congruencia?", a: "Disco articular", opts: ["Rodete", "Disco articular", "Menisco", "Ligamento interclavicular"], category: "Artrología"}
];

// --- Components ---

const Header = () => (
  <header className="bg-slate-900 text-white p-4 md:p-6 flex flex-col md:flex-row justify-between items-center gap-4 shadow-xl z-50">
    <div className="flex items-center gap-3">
      <div className="bg-blue-600 p-2 rounded-lg">
        <Activity className="w-8 h-8" />
      </div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight uppercase">BioMod</h1>
        <p className="text-xs text-blue-300 font-light">Guía Interactiva de Anatomía Humana</p>
      </div>
    </div>
    <div className="bg-slate-800/50 border-l-4 border-blue-500 p-3 rounded-r-lg text-right text-sm">
      <span className="font-semibold text-blue-400">Fuente Bibliográfica:</span><br />
      Latarjet, M. & Ruiz Liard, A. <span className="italic opacity-80">Anatomía Humana</span>
    </div>
  </header>
);

const Nav = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) => {
  const tabs = [
    { id: 'osteology', label: 'Osteología' },
    { id: 'arthrology', label: 'Artrología' },
    { id: 'myology', label: 'Miología' },
    { id: 'angiology', label: 'Vascularización' },
    { id: 'neurology', label: 'Neurología' },
    { id: '3dviewer', label: 'Lector 3D' },
    { id: 'quiz', label: 'Centro de Quiz' },
  ];

  return (
    <nav className="bg-white border-b sticky top-0 z-40 overflow-x-auto no-scrollbar">
      <div className="flex justify-center min-w-max px-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-6 py-4 text-sm font-semibold transition-all border-b-4",
              activeTab === tab.id 
                ? "text-blue-600 border-blue-600 bg-blue-50/50" 
                : "text-slate-500 border-transparent hover:text-blue-500 hover:bg-slate-50"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
};

const ImageCard = ({ src, alt, caption }: { src: string, alt: string, caption: string }) => {
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <>
      <div className="bg-white border rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow">
        <div className="aspect-video bg-slate-50 rounded-lg overflow-hidden flex items-center justify-center mb-3 group relative">
          <img 
            src={src} 
            alt={alt} 
            className="max-w-full max-h-full object-contain transition-transform group-hover:scale-105 cursor-pointer"
            loading="lazy"
            referrerPolicy="no-referrer"
            onClick={() => setIsZoomed(true)}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "https://placehold.co/600x400?text=Error+de+Carga";
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
            <button 
              onClick={() => setIsZoomed(true)}
              className="bg-white/90 backdrop-blur-sm text-[10px] font-bold px-3 py-1.5 rounded shadow-sm flex items-center gap-1 text-slate-700 hover:bg-white transition-colors"
            >
              <Maximize2 className="w-3 h-3" /> Zoom
            </button>
            <a 
              href={src} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white/90 backdrop-blur-sm text-[10px] font-bold px-3 py-1.5 rounded shadow-sm flex items-center gap-1 text-slate-700 hover:bg-white transition-colors"
            >
              <ExternalLink className="w-3 h-3" /> Original
            </a>
          </div>
        </div>
        <p className="text-xs text-slate-500 italic text-center line-clamp-1">{caption}</p>
      </div>

      {isZoomed && (
        <div 
          className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12"
          onClick={() => setIsZoomed(false)}
        >
          <button
            className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors p-2 bg-white/10 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomed(false);
            }}
          >
            <X className="w-8 h-8" />
          </button>
          
          <div 
            className="relative max-w-5xl w-full h-full flex flex-col items-center justify-center gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={src} 
              alt={alt} 
              className="max-w-full max-h-[80vh] object-contain shadow-2xl rounded-lg"
              referrerPolicy="no-referrer"
            />
            <div className="text-center space-y-2">
              <h3 className="text-white text-xl font-bold">{alt}</h3>
              <p className="text-white/60 italic text-sm max-w-2xl">{caption}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const Section = ({ title, children, active }: { title: string, children: React.ReactNode, active: boolean }) => (
  <div className={cn("space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500", !active && "hidden")}>
    <div className="border-b pb-4">
      <h2 className="text-3xl font-bold text-slate-800">{title}</h2>
    </div>
    {children}
  </div>
);

// --- 3D Viewer Component ---
const Viewer3D = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPart, setSelectedPart] = useState<THREE.Object3D | null>(null);
  const originalEmissive = useRef<{ [uuid: string]: THREE.Color }>({});
  const [hasModel, setHasModel] = useState(false);
  const [layers, setLayers] = useState({
    bones: true,
    muscles: true,
    nerves: true,
    vessels: true,
    others: true
  });
  
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  const loadModelFromURL = async (url: string) => {
    if (!sceneRef.current) {
      console.error("Error: La escena 3D no está lista para cargar el modelo.");
      return;
    }
    
    console.log(`Intentando cargar modelo automático desde: ${url}`);
    setLoading(true);
    
    try {
      // Verificamos primero si el archivo existe y qué tipo de contenido es
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Servidor respondió con estado ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        throw new Error("El servidor devolvió HTML en lugar de un archivo 3D. Esto suele significar que el archivo no existe en la carpeta 'public'.");
      }

      const loader = new GLTFLoader();
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
      loader.setDRACOLoader(dracoLoader);

      loader.load(url, (gltf) => {
        console.log("¡Archivo detectado y cargado con éxito!");
        if (modelRef.current) sceneRef.current?.remove(modelRef.current);
        
        const model = gltf.scene;
        modelRef.current = model;
        sceneRef.current?.add(model);

        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        console.log("Dimensiones del modelo:", size);
        console.log("Centro del modelo:", center);

        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim === 0) {
          console.error("Error: El modelo tiene un tamaño de 0.");
          setLoading(false);
          return;
        }

        const fov = cameraRef.current?.fov || 45;
        let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov * Math.PI / 360));
        cameraZ *= 3;

        if (controlsRef.current && cameraRef.current) {
          controlsRef.current.target.copy(center);
          cameraRef.current.position.set(center.x + cameraZ, center.y + cameraZ, center.z + cameraZ);
          cameraRef.current.far = cameraZ * 20;
          cameraRef.current.updateProjectionMatrix();
          controlsRef.current.update();
        }

        setHasModel(true);
        setLoading(false);

        // Forzar renderizado inmediato y actualización de layout
        setTimeout(() => {
          if (rendererRef.current && sceneRef.current && cameraRef.current) {
            rendererRef.current.render(sceneRef.current, cameraRef.current);
          }
          window.dispatchEvent(new Event('resize'));
        }, 100);
      }, (progress) => {
        const percent = (progress.loaded / progress.total) * 100;
        if (progress.total > 0) console.log(`Cargando: ${Math.round(percent)}%`);
      }, (err) => {
        console.error("Error al procesar el GLB:", err);
        setLoading(false);
      });
    } catch (error: any) {
      console.warn("Aviso de carga:", error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a); // Slate 900
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    camera.position.set(5, 5, 5);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const lights = [
      { pos: [10, 10, 10], int: 1.5 },
      { pos: [-10, 10, 10], int: 1.0 },
      { pos: [0, -10, 0], int: 0.8 },
      { pos: [0, 10, -10], int: 1.0 }
    ];

    lights.forEach(l => {
      const light = new THREE.DirectionalLight(0xffffff, l.int);
      light.position.set(l.pos[0], l.pos[1], l.pos[2]);
      scene.add(light);
    });

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
    scene.add(hemiLight);

    // Grid
    const grid = new THREE.GridHelper(20, 20, 0x334155, 0x1e293b);
    scene.add(grid);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // --- CARGA DE MODELO PREDETERMINADO ---
    // Cambia 'modelo.glb' por el nombre de tu archivo en la carpeta public
    loadModelFromURL('/modelo.glb');

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !sceneRef.current) return;

    setLoading(true);
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = (event) => {
      const arrayBuffer = event.target?.result as ArrayBuffer;
      const loader = new GLTFLoader();
      
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
      loader.setDRACOLoader(dracoLoader);

      loader.parse(arrayBuffer, '', (gltf) => {
        if (modelRef.current) sceneRef.current?.remove(modelRef.current);
        
        const model = gltf.scene;
        modelRef.current = model;
        sceneRef.current?.add(model);

        // Auto-ajuste inteligente de cámara
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        console.log("Carga manual - Tamaño:", size, "Centro:", center);

        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = cameraRef.current?.fov || 45;
        let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov * Math.PI / 360));
        cameraZ *= 3;

        if (controlsRef.current && cameraRef.current) {
          controlsRef.current.target.copy(center);
          cameraRef.current.position.set(center.x + cameraZ, center.y + cameraZ, center.z + cameraZ);
          cameraRef.current.far = cameraZ * 20;
          cameraRef.current.updateProjectionMatrix();
          controlsRef.current.update();
        }

        setHasModel(true);
        setLoading(false);

        // Forzar renderizado inmediato
        setTimeout(() => {
          if (rendererRef.current && sceneRef.current && cameraRef.current) {
            rendererRef.current.render(sceneRef.current, cameraRef.current);
          }
          window.dispatchEvent(new Event('resize'));
        }, 100);
      }, (err) => {
        console.error("Error al procesar el archivo manual:", err);
        setLoading(false);
        alert("Error al procesar el modelo. Verifica que sea un .glb válido.");
      });
    };
  };

  const categorizeObject = (obj: THREE.Object3D) => {
    let current: THREE.Object3D | null = obj;
    while (current && current !== modelRef.current) {
      const n = (current.name || '').toLowerCase();
      
      // Bones: Comprehensive list including common anatomical terms and parts
      if (
        n.includes('hueso') || n.includes('bone') || n.includes('skeleton') || n.includes('osteo') || 
        n.includes('esquelo') || n.includes('clavicula') || n.includes('escapula') || n.includes('humero') || 
        n.includes('radio') || n.includes('cubito') || n.includes('carpo') || n.includes('scapula') || 
        n.includes('humerus') || n.includes('ulna') || n.includes('radius') || n.includes('vertebra') ||
        n.includes('costilla') || n.includes('rib') || n.includes('sternum') || n.includes('phalange') ||
        n.includes('metacarpal') || n.includes('carpal') || n.includes('joint') || n.includes('articulacion') ||
        n.includes('process') || n.includes('tuberosity') || n.includes('fossa') || n.includes('epicondyle') ||
        n.includes('trochlea') || n.includes('capitulum') || n.includes('styloid') || n.includes('olecranon')
      ) return 'bones';

      // Muscles: Including tendons, common muscle names and functional groups
      if (
        n.includes('musculo') || n.includes('muscle') || n.includes('m.') || n.includes('myo') || 
        n.includes('pectoral') || n.includes('deltoid') || n.includes('bicep') || n.includes('tricep') || 
        n.includes('braquial') || n.includes('brachial') || n.includes('flexor') || n.includes('extensor') || 
        n.includes('serrato') || n.includes('trapecio') || n.includes('dorsal') || n.includes('tendon') ||
        n.includes('fascia') || n.includes('aponeurosis') || n.includes('levator') || n.includes('rhomboid') ||
        n.includes('teres') || n.includes('subscapularis') || n.includes('supraspinatus') || n.includes('infraspinatus') ||
        n.includes('pronator') || n.includes('supinator') || n.includes('palmaris') || n.includes('anconeus') ||
        n.includes('coracobrachialis') || n.includes('brachioradialis')
      ) return 'muscles';

      // Nerves: Including plexus parts and specific nerves
      if (
        n.includes('nervio') || n.includes('nerve') || n.includes('n.') || n.includes('neuro') || 
        n.includes('plexo') || n.includes('plexus') || n.includes('ganglion') || n.includes('ramus') ||
        n.includes('median') || n.includes('ulnar') || n.includes('radial') || n.includes('axillary') ||
        n.includes('musculocutaneous') || n.includes('suprascapular')
      ) return 'nerves';

      // Vessels: Arteries, Veins, Lymphatics
      if (
        n.includes('arteria') || n.includes('vena') || n.includes('vessel') || n.includes('artery') || 
        n.includes('vein') || n.includes('a.') || n.includes('v.') || n.includes('vaso') || 
        n.includes('angio') || n.includes('circunfleja') || n.includes('axillary') || n.includes('cephalic') || 
        n.includes('basilic') || n.includes('lymph') || n.includes('linfa') || n.includes('capillary') ||
        n.includes('brachial') || n.includes('radial') || n.includes('ulnar') || n.includes('profunda')
      ) return 'vessels';

      current = current.parent;
    }
    return 'others';
  };

  const toggleLayer = (layer: keyof typeof layers) => {
    const newState = !layers[layer];
    setLayers(prev => ({ ...prev, [layer]: newState }));

    if (modelRef.current) {
      modelRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const cat = categorizeObject(child);
          if (cat === layer) {
            child.visible = newState;
          }
        }
      });
    }
  };

  const handleMouseClick = (event: React.MouseEvent) => {
    if (!containerRef.current || !cameraRef.current || !modelRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.current.setFromCamera(mouse.current, cameraRef.current);
    const intersects = raycaster.current.intersectObject(modelRef.current, true);

    // Restore previous highlight
    if (selectedPart && selectedPart instanceof THREE.Mesh && selectedPart.material) {
      const materials = Array.isArray(selectedPart.material) ? selectedPart.material : [selectedPart.material];
      materials.forEach((m: any) => {
        if (m.emissive) {
          m.emissive.copy(originalEmissive.current[selectedPart.uuid] || new THREE.Color(0, 0, 0));
        }
      });
    }

    if (intersects.length > 0) {
      const object = intersects[0].object;
      setSelectedPart(object);
      
      // Apply highlight
      if (object instanceof THREE.Mesh && object.material) {
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((m: any) => {
          if (m.emissive) {
            if (!originalEmissive.current[object.uuid]) {
              originalEmissive.current[object.uuid] = m.emissive.clone();
            }
            m.emissive.setHex(0x3b82f6); // Blue highlight
            m.emissiveIntensity = 0.5;
          }
        });
      }
    } else {
      setSelectedPart(null);
    }
  };

  const hideSelected = () => {
    if (selectedPart) {
      selectedPart.visible = false;
      setSelectedPart(null);
    }
  };

  const resetVisibility = () => {
    if (modelRef.current) {
      modelRef.current.traverse((child) => {
        child.visible = true;
      });
      setLayers({
        bones: true,
        muscles: true,
        nerves: true,
        vessels: true,
        others: true
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Controls Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-4 rounded-xl border shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              Capas del Modelo
            </h3>
            <div className="space-y-2">
              <button 
                onClick={() => toggleLayer('bones')}
                className={cn(
                  "w-full flex items-center justify-between p-2 rounded-lg text-sm transition-colors",
                  layers.bones ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-slate-50 text-slate-400 border border-transparent"
                )}
              >
                <div className="flex items-center gap-2">
                  <Bone className="w-4 h-4" />
                  Huesos
                </div>
                {layers.bones ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button 
                onClick={() => toggleLayer('muscles')}
                className={cn(
                  "w-full flex items-center justify-between p-2 rounded-lg text-sm transition-colors",
                  layers.muscles ? "bg-red-50 text-red-700 border border-red-200" : "bg-slate-50 text-slate-400 border border-transparent"
                )}
              >
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Músculos
                </div>
                {layers.muscles ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button 
                onClick={() => toggleLayer('nerves')}
                className={cn(
                  "w-full flex items-center justify-between p-2 rounded-lg text-sm transition-colors",
                  layers.nerves ? "bg-yellow-50 text-yellow-700 border border-yellow-200" : "bg-slate-50 text-slate-400 border border-transparent"
                )}
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Nervios
                </div>
                {layers.nerves ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button 
                onClick={() => toggleLayer('vessels')}
                className={cn(
                  "w-full flex items-center justify-between p-2 rounded-lg text-sm transition-colors",
                  layers.vessels ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-50 text-slate-400 border border-transparent"
                )}
              >
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Vasos
                </div>
                {layers.vessels ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>

            <div className="pt-4 border-t space-y-2">
              <label className="block w-full text-center p-3 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors font-bold text-sm">
                <input type="file" className="hidden" accept=".glb" onChange={handleFileUpload} />
                📂 Cargar archivo .glb
              </label>
              <button 
                onClick={() => loadModelFromURL('/modelo.glb')}
                className="w-full flex items-center justify-center gap-2 p-2 text-blue-600 hover:bg-blue-50 rounded-lg text-sm border border-blue-100"
              >
                <RotateCcw className="w-4 h-4" />
                Recargar Predeterminado
              </button>
              <button 
                onClick={resetVisibility}
                className="w-full flex items-center justify-center gap-2 p-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm"
              >
                <RotateCcw className="w-4 h-4" />
                Restablecer Visibilidad
              </button>
            </div>
          </div>

          {selectedPart && (
            <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-md animate-in fade-in zoom-in duration-200">
              <h4 className="text-xs font-bold text-blue-600 uppercase mb-2">Elemento Seleccionado</h4>
              <p className="font-semibold text-slate-800 mb-3">{selectedPart.name || "Sin nombre"}</p>
              <button 
                onClick={hideSelected}
                className="w-full flex items-center justify-center gap-2 p-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 rounded-lg text-sm transition-colors"
              >
                <EyeOff className="w-4 h-4" />
                Ocultar esta parte
              </button>
            </div>
          )}
        </div>

        {/* Viewer Area */}
        <div className="lg:col-span-3 relative bg-slate-900 rounded-2xl overflow-hidden border-4 border-slate-800 shadow-2xl h-[600px]">
          <div 
            ref={containerRef} 
            className="absolute inset-0 cursor-crosshair" 
            onClick={handleMouseClick}
          />
          
          {loading && (
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-white z-20">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-lg font-bold">Procesando geometría 3D...</p>
              <p className="text-sm opacity-60">Por favor espera un momento</p>
            </div>
          )}

          {!hasModel && !loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 p-8 text-center">
              <MousePointer2 className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-xl font-medium text-slate-300">El visor está vacío</p>
              <p className="text-sm max-w-xs mt-2">
                No se detectó el archivo <code className="bg-slate-800 px-1 rounded text-blue-400">modelo.glb</code>.
              </p>
              <div className="bg-slate-800/50 p-4 rounded-xl mt-4 text-xs text-left space-y-2 border border-slate-700">
                <p className="font-bold text-blue-400">Instrucciones para GitHub:</p>
                <ol className="list-decimal ml-4 space-y-1 text-slate-400">
                  <li>Crea una carpeta llamada <code className="text-white">public</code> en la raíz de tu proyecto.</li>
                  <li>Mueve tu archivo <code className="text-white">modelo.glb</code> dentro de esa carpeta.</li>
                  <li>La ruta final debe ser: <code className="text-emerald-400">public/modelo.glb</code></li>
                </ol>
              </div>
              <div className="mt-6 flex flex-col gap-3 w-full max-w-xs">
                <button 
                  onClick={() => loadModelFromURL('/modelo.glb')}
                  className="bg-blue-600 text-white py-3 px-6 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg pointer-events-auto"
                >
                  Intentar Cargar de Nuevo
                </button>
                <label className="bg-slate-800 text-slate-300 py-3 px-6 rounded-xl font-bold hover:bg-slate-700 transition-all cursor-pointer pointer-events-auto border border-slate-700">
                  <input type="file" className="hidden" accept=".glb" onChange={handleFileUpload} />
                  Subir Manualmente
                </label>
              </div>
              <p className="text-[10px] mt-8 opacity-40 uppercase tracking-widest">
                Asegúrate de que el nombre sea exacto y esté en la carpeta public
              </p>
            </div>
          )}

          <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white/80 p-3 rounded-lg text-xs space-y-1 pointer-events-none border border-white/10">
            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-blue-500 rounded-full"></div> Clic Izq: Rotar</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-emerald-500 rounded-full"></div> Clic Der: Mover</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-yellow-500 rounded-full"></div> Rueda: Zoom</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-red-500 rounded-full"></div> Clic sobre pieza: Seleccionar</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Quiz Component ---
const Quiz = () => {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start');
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [quizMode, setQuizMode] = useState<string>('all');

  const startQuiz = (mode: string) => {
    setQuizMode(mode);
    let pool = [...QUESTION_BANK];
    let count = 10;

    if (mode === 'mock') {
      count = 15;
    } else if (mode !== 'all') {
      pool = pool.filter(q => q.category.toLowerCase() === mode.toLowerCase());
      count = Math.min(pool.length, 10);
    }

    const shuffled = pool.sort(() => 0.5 - Math.random()).slice(0, count);
    setCurrentQuestions(shuffled);
    setQIndex(0);
    setScore(0);
    setUserAnswers([]);
    setSelectedOpt(null);
    setGameState('playing');
  };

  const handleSelect = (opt: string) => {
    setSelectedOpt(opt);
  };

  const nextQuestion = () => {
    if (!selectedOpt) return;

    const currentQ = currentQuestions[qIndex];
    const isCorrect = selectedOpt === currentQ.a;
    
    const newAnswer: UserAnswer = {
      question: currentQ.q,
      selected: selectedOpt,
      correct: currentQ.a,
      isCorrect
    };

    setUserAnswers([...userAnswers, newAnswer]);
    if (isCorrect) setScore(score + 1);

    if (qIndex < currentQuestions.length - 1) {
      setQIndex(qIndex + 1);
      setSelectedOpt(null);
    } else {
      setGameState('result');
    }
  };

  if (gameState === 'start') {
    const modes = [
      { id: 'Osteología', label: 'Osteología', icon: <Bone className="w-6 h-6" />, desc: '10 preguntas sobre huesos y accidentes óseos.' },
      { id: 'Artrología', label: 'Artrología', icon: <Activity className="w-6 h-6" />, desc: '10 preguntas sobre articulaciones y ligamentos.' },
      { id: 'Miología', label: 'Miología', icon: <Zap className="w-6 h-6" />, desc: '10 preguntas sobre músculos y acciones.' },
      { id: 'Angiología', label: 'Vascularización', icon: <Activity className="w-6 h-6" />, desc: '10 preguntas sobre arterias y venas.' },
      { id: 'Neurología', label: 'Neurología', icon: <Zap className="w-6 h-6" />, desc: '10 preguntas sobre nervios y plexos.' },
      { id: 'mock', label: 'Simulacro de Parcial', icon: <Layers className="w-6 h-6" />, desc: '15 preguntas aleatorias de todos los temas.', highlight: true },
    ];

    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h3 className="text-4xl font-black text-slate-800 mb-4">Centro de Evaluación</h3>
          <p className="text-slate-600 max-w-2xl mx-auto">Selecciona una modalidad para poner a prueba tus conocimientos. Los simulacros integran todo el contenido del banco de preguntas.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modes.map((mode) => (
            <button 
              key={mode.id}
              onClick={() => startQuiz(mode.id)}
              className={cn(
                "p-6 rounded-3xl border-2 text-left transition-all group relative overflow-hidden",
                mode.highlight 
                  ? "border-blue-600 bg-blue-600 text-white shadow-xl shadow-blue-200 hover:scale-105" 
                  : "border-slate-100 bg-white hover:border-blue-400 hover:shadow-lg"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
                mode.highlight ? "bg-white/20" : "bg-blue-50 text-blue-600"
              )}>
                {mode.icon}
              </div>
              <h4 className="text-xl font-bold mb-2">{mode.label}</h4>
              <p className={cn("text-sm", mode.highlight ? "text-blue-100" : "text-slate-500")}>{mode.desc}</p>
              {mode.highlight && (
                <div className="absolute -right-4 -bottom-4 opacity-10">
                  <PlayCircle className="w-24 h-24" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (gameState === 'playing') {
    const q = currentQuestions[qIndex];
    const progress = ((qIndex + 1) / currentQuestions.length) * 100;

    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="mb-6 space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
            <span>{quizMode === 'mock' ? 'Simulacro de Parcial' : `Quiz de ${quizMode}`}</span>
            <span>Pregunta {qIndex + 1} de {currentQuestions.length}</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-500" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border space-y-6">
          <div className="flex items-center gap-2">
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">{q.category}</span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-slate-800 leading-tight">{q.q}</h3>
          <div className="space-y-3">
            {q.opts.map((opt) => (
              <button
                key={opt}
                onClick={() => handleSelect(opt)}
                className={cn(
                  "w-full text-left p-4 rounded-xl border-2 transition-all flex justify-between items-center group",
                  selectedOpt === opt 
                    ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm" 
                    : "border-slate-100 hover:border-blue-200 hover:bg-slate-50 text-slate-600"
                )}
              >
                <span className="font-medium">{opt}</span>
                <div className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                  selectedOpt === opt ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200"
                )}>
                  {selectedOpt === opt && <CheckCircle2 className="w-4 h-4" />}
                </div>
              </button>
            ))}
          </div>
          <button 
            disabled={!selectedOpt}
            onClick={nextQuestion}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-all shadow-lg"
          >
            {qIndex === currentQuestions.length - 1 ? "Finalizar Intento" : "Siguiente Pregunta"}
          </button>
        </div>
      </div>
    );
  }

  const percentage = Math.round((score / currentQuestions.length) * 100);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      <div className="bg-white p-10 rounded-3xl shadow-xl border text-center space-y-6 relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-3xl font-bold text-slate-800">Resultados del {quizMode === 'mock' ? 'Simulacro' : 'Quiz'}</h3>
          <div className="py-6">
            <div className="text-7xl font-black text-blue-600 mb-2">{percentage}%</div>
            <div className="text-slate-400 font-bold">Puntaje: {score} de {currentQuestions.length} correctas</div>
          </div>
          <p className="text-slate-600 max-w-md mx-auto mb-8">
            {percentage >= 90 ? "¡Nivel de excelencia! Tienes un dominio total de la materia." : 
             percentage >= 70 ? "¡Muy buen trabajo! Estás bien preparado para el parcial." : 
             percentage >= 50 ? "Aprobado, pero hay conceptos que requieren refuerzo." : 
             "Te recomendamos volver a estudiar los temas y realizar los quizzes específicos."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => setGameState('start')} 
              className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" /> Volver al Menú
            </button>
            <button 
              onClick={() => startQuiz(quizMode)} 
              className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              <PlayCircle className="w-5 h-5" /> Reintentar
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 z-0"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-slate-50 rounded-full -ml-24 -mb-24 z-0"></div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h4 className="font-bold text-slate-700">Revisión Detallada</h4>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Desempeño</span>
        </div>
        {userAnswers.map((ans, i) => (
          <div key={i} className={cn(
            "p-5 rounded-2xl border-l-8 bg-white shadow-sm transition-all hover:shadow-md",
            ans.isCorrect ? "border-emerald-500" : "border-red-500"
          )}>
            <div className="flex items-start gap-4">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                ans.isCorrect ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
              )}>
                {ans.isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-800 mb-2 leading-snug">{i + 1}. {ans.question}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className={cn(
                    "p-3 rounded-xl text-sm",
                    ans.isCorrect ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"
                  )}>
                    <span className="block text-[10px] uppercase font-black opacity-50 mb-1">Tu Selección</span>
                    {ans.selected}
                  </div>
                  {!ans.isCorrect && (
                    <div className="p-3 rounded-xl text-sm bg-slate-50 text-slate-700 border border-slate-100">
                      <span className="block text-[10px] uppercase font-black opacity-50 mb-1">Respuesta Correcta</span>
                      {ans.correct}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Main App ---
export default function App() {
  const [activeTab, setActiveTab] = useState('osteology');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Debug message */}
      <div className="bg-yellow-100 text-yellow-800 text-[10px] text-center py-1">
        BioMod v1.0.2 - Render Check
      </div>
      <Header />
      <Nav activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8">
        
        {/* Test de Conexión */}
        <div className="mb-4 p-2 bg-slate-100 rounded-lg flex items-center justify-center gap-4 text-[10px] text-slate-500">
          <span>Test de Conexión:</span>
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-3 h-3" />
          <img src="https://picsum.photos/seed/test/20/20" alt="Picsum" className="w-3 h-3 rounded-full" />
          <span className="text-emerald-600 font-medium italic">Si ves los iconos de la izquierda, el internet está funcionando.</span>
        </div>

        {/* Osteology */}
        <Section title="Osteología: Esqueleto del Miembro Superior" active={activeTab === 'osteology'}>
          <div className="grid grid-cols-1 gap-8">
            {/* Cintura Escapular */}
            <div className="bg-white p-6 rounded-2xl border shadow-sm">
              <h3 className="text-2xl font-bold text-blue-700 border-l-4 border-blue-600 pl-3 mb-6">Cintura Escapular</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="grid grid-cols-2 gap-3">
                  <ImageCard 
                    src="https://commons.wikimedia.org/wiki/Special:FilePath/Gray200.png"
                    alt="Cintura Escapular"
                    caption="Visión anterior de la clavícula y escápula."
                  />
                  <ImageCard 
                    src="https://commons.wikimedia.org/wiki/Special:FilePath/Gray201.png"
                    alt="Clavícula"
                    caption="Clavícula izquierda: Superior e Inferior."
                  />
                  <ImageCard 
                    src="https://commons.wikimedia.org/wiki/Special:FilePath/Gray203.png"
                    alt="Escápula Posterior"
                    caption="Escápula izquierda: Vista Dorsal."
                  />
                  <ImageCard 
                    src="https://commons.wikimedia.org/wiki/Special:FilePath/Gray204.png"
                    alt="Escápula Lateral"
                    caption="Escápula izquierda: Vista Lateral."
                  />
                </div>
                <div className="space-y-6">
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                    <h4 className="font-bold text-blue-800 text-lg mb-3 flex items-center gap-2">
                      <Bone className="w-5 h-5" /> Clavícula
                    </h4>
                    <p className="text-sm text-slate-700 leading-relaxed mb-3">
                      Hueso largo, par, situado transversalmente entre el manubrio del esternón y el acromion de la escápula. Presenta una doble curvatura en forma de "S" itálica.
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="text-xs bg-white p-2 rounded border"><span className="font-bold text-blue-600">Cara Superior:</span> Casi lisa en su totalidad, presenta rugosidades para las inserciones de los músculos trapecio (posteriormente) y deltoides (anteriormente).</div>
                      <div className="text-xs bg-white p-2 rounded border"><span className="font-bold text-blue-600">Cara Inferior:</span> Accidentada. Presenta el <span className="italic">surco del músculo subclavio</span> en su tercio medio. En el extremo acromial se observa la <span className="italic">tuberosidad coracoclavicular</span>, compuesta por el <span className="font-bold">tubérculo conoideo</span> y la <span className="font-bold">línea trapezoidea</span>. En el extremo esternal se encuentra la <span className="italic">impresión del ligamento costoclavicular</span>.</div>
                      <div className="text-xs bg-white p-2 rounded border"><span className="font-bold text-blue-600">Extremos:</span> El <span className="font-bold">Esternal</span> es voluminoso y presenta una superficie articular para el manubrio del esternón. El <span className="font-bold">Acromial</span> es aplanado y se articula con el acromion de la escápula.</div>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                    <h4 className="font-bold text-blue-800 text-lg mb-3 flex items-center gap-2">
                      <Bone className="w-5 h-5" /> Escápula (Omóplato)
                    </h4>
                    <p className="text-sm text-slate-700 leading-relaxed mb-3">
                      Hueso plano, triangular, situado en la parte posterior y superior del tórax.
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="text-xs bg-white p-2 rounded border"><span className="font-bold text-blue-600">Cara Anterior (Costal):</span> Cóncava, forma la <span className="italic">fosa subescapular</span> donde se inserta el músculo homónimo. Presenta crestas oblicuas para las inserciones musculares.</div>
                      <div className="text-xs bg-white p-2 rounded border"><span className="font-bold text-blue-600">Cara Posterior (Dorsal):</span> Convexa, dividida por la <span className="italic">espina de la escápula</span> en <span className="italic">fosa supraespinosa</span> (superior) e <span className="italic">infraespinosa</span> (inferior). La espina se proyecta lateralmente como el <span className="italic">acromion</span>, que presenta una carilla articular para la clavícula.</div>
                      <div className="text-xs bg-white p-2 rounded border"><span className="font-bold text-blue-600">Ángulo Lateral:</span> Presenta la <span className="italic">cavidad glenoidea</span>, una superficie articular piriforme que recibe la cabeza del húmero. Por encima y debajo de ella se encuentran los <span className="font-bold">tubérculos supraglenoideo</span> e <span className="font-bold">infraglenoideo</span> (inserciones de las cabezas largas del bíceps y tríceps). La <span className="italic">apófisis coracoides</span> se proyecta anteriormente como un "dedo flexionado".</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Húmero */}
            <div className="bg-white p-6 rounded-2xl border shadow-sm">
              <h3 className="text-2xl font-bold text-blue-700 border-l-4 border-blue-600 pl-3 mb-6">Húmero</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="grid grid-cols-2 gap-3">
                  <ImageCard 
                    src="https://commons.wikimedia.org/wiki/Special:FilePath/Gray207.png"
                    alt="Húmero Anterior"
                    caption="Húmero: Vista Anterior."
                  />
                  <ImageCard 
                    src="https://commons.wikimedia.org/wiki/Special:FilePath/Gray208.png"
                    alt="Húmero Posterior"
                    caption="Húmero: Vista Posterior."
                  />
                  <ImageCard 
                    src="https://commons.wikimedia.org/wiki/Special:FilePath/Gray210.png"
                    alt="Epífisis Proximal"
                    caption="Extremo superior del húmero."
                  />
                  <ImageCard 
                    src="https://commons.wikimedia.org/wiki/Special:FilePath/Gray211.png"
                    alt="Epífisis Distal"
                    caption="Extremo inferior del húmero."
                  />
                </div>
                <div className="space-y-4">
                  <p className="text-sm text-slate-700 leading-relaxed">
                    Hueso largo que constituye el esqueleto del brazo. Se articula con la escápula superiormente y con el radio y cúbito inferiormente.
                  </p>
                  <div className="space-y-3">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                      <h5 className="font-bold text-blue-800 text-sm mb-2">Epífisis Proximal (Superior)</h5>
                      <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                        <li><span className="font-bold">Cabeza:</span> Superficie esférica lisa que representa un tercio de esfera.</li>
                        <li><span className="font-bold">Cuello Anatómico:</span> Surco estrecho que separa la cabeza de los tubérculos.</li>
                        <li><span className="font-bold">Tubérculo Mayor (Troquíter):</span> Situado lateralmente, presenta tres carillas para los músculos supraespinoso, infraespinoso y redondo menor.</li>
                        <li><span className="font-bold">Tubérculo Menor (Troquín):</span> Situado anteriormente, presta inserción al músculo subescapular.</li>
                        <li><span className="font-bold">Surco Intertubercular (Corredera Bicipital):</span> Canal profundo entre ambos tubérculos que aloja el tendón de la cabeza larga del bíceps. Presenta una <span className="font-bold">cresta del tubérculo mayor</span> (labio lateral) y una <span className="font-bold">cresta del tubérculo menor</span> (labio medial).</li>
                        <li><span className="font-bold">Cuello Quirúrgico:</span> Parte estrecha distal a los tubérculos, sitio frecuente de fracturas donde el nervio axilar y la arteria circunfleja humeral posterior están en contacto.</li>
                      </ul>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <h5 className="font-bold text-slate-800 text-sm mb-2">Diáfisis (Cuerpo)</h5>
                      <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                        <li><span className="font-bold">Tuberosidad Deltoidea (V deltoidea):</span> Elevación rugosa en forma de "V" en la cara lateral, donde se inserta el músculo deltoides.</li>
                        <li><span className="font-bold">Surco del Nervio Radial (Canal de Torsión):</span> Depresión oblicua en la cara posterior que desciende lateralmente. Por él transcurren el <span className="font-bold">nervio radial</span> y la <span className="font-bold">arteria braquial profunda</span>.</li>
                      </ul>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                      <h5 className="font-bold text-blue-800 text-sm mb-2">Epífisis Distal (Cóndilo Humeral)</h5>
                      <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                        <li><span className="font-bold">Capitulum (Cóndilo):</span> Superficie redondeada lateral que se articula con la cabeza del radio.</li>
                        <li><span className="font-bold">Tróclea:</span> Superficie en forma de polea medial que se articula con la escotadura troclear del cúbito.</li>
                        <li><span className="font-bold">Epicóndilo Medial (Epitróclea):</span> Prominencia mayor donde se originan los músculos flexores del antebrazo.</li>
                        <li><span className="font-bold">Epicóndilo Lateral:</span> Prominencia menor donde se originan los músculos extensores.</li>
                        <li><span className="font-bold">Fosas:</span> <span className="font-bold">Coronoides</span> (anterior, sobre la tróclea), <span className="font-bold">Radial</span> (anterior, sobre el capitulum) y <span className="font-bold">Olecraneana</span> (posterior, profunda, recibe al olécranon).</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Antebrazo */}
            <div className="bg-white p-6 rounded-2xl border shadow-sm">
              <h3 className="text-2xl font-bold text-blue-700 border-l-4 border-blue-600 pl-3 mb-6">Antebrazo: Radio y Cúbito</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="grid grid-cols-2 gap-3">
                  <ImageCard 
                    src="https://commons.wikimedia.org/wiki/Special:FilePath/Gray213.png"
                    alt="Radio y Cúbito Post."
                    caption="Huesos del antebrazo (Posterior)."
                  />
                  <ImageCard 
                    src="https://commons.wikimedia.org/wiki/Special:FilePath/Gray214.png"
                    alt="Radio y Cúbito Ant."
                    caption="Huesos del antebrazo (Anterior)."
                  />
                  <ImageCard 
                    src="https://commons.wikimedia.org/wiki/Special:FilePath/Gray215.png"
                    alt="Radio"
                    caption="Radio izquierdo: Vista Anterior."
                  />
                  <ImageCard 
                    src="https://commons.wikimedia.org/wiki/Special:FilePath/Gray216.png"
                    alt="Cúbito"
                    caption="Cúbito izquierdo: Vista Anterior."
                  />
                </div>
                <div className="space-y-6">
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                    <h4 className="font-bold text-blue-800 text-lg mb-3 flex items-center gap-2">
                      <Bone className="w-5 h-5" /> Radio
                    </h4>
                    <p className="text-sm text-slate-700 mb-3">Hueso lateral del antebrazo. Su extremo distal es más voluminoso.</p>
                    <ul className="text-xs text-slate-600 space-y-2">
                      <li><span className="font-bold">Cabeza:</span> Presenta la <span className="font-bold">fóvea articular</span> (cóncava para el capitulum) y la <span className="font-bold">circunferencia articular</span> (para la escotadura radial del cúbito).</li>
                      <li><span className="font-bold">Cuello:</span> Porción estrecha entre la cabeza y la tuberosidad.</li>
                      <li><span className="font-bold">Tuberosidad del Radio:</span> Prominencia ovoidea donde se inserta el bíceps braquial.</li>
                      <li><span className="font-bold">Extremo Distal:</span> Presenta la <span className="font-bold">carilla articular carpiana</span> (para escafoides y semilunar) y la <span className="font-bold">escotadura cubital</span> (medial, para la cabeza del cúbito).</li>
                      <li><span className="font-bold">Apófisis Estiloides:</span> Proyección lateral piramidal. En la cara posterior se encuentra el <span className="font-bold">tubérculo dorsal (de Lister)</span>.</li>
                    </ul>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                    <h4 className="font-bold text-blue-800 text-lg mb-3 flex items-center gap-2">
                      <Bone className="w-5 h-5" /> Cúbito (Ulna)
                    </h4>
                    <p className="text-sm text-slate-700 mb-3">Hueso medial del antebrazo. Su extremo proximal es más voluminoso.</p>
                    <ul className="text-xs text-slate-600 space-y-2">
                      <li><span className="font-bold">Olécranon:</span> Proyección superior robusta que forma la punta del codo.</li>
                      <li><span className="font-bold">Apófisis Coronoides:</span> Proyección anterior que, junto al olécranon, forma la <span className="font-bold">escotadura troclear</span> (para la tróclea humeral).</li>
                      <li><span className="font-bold">Escotadura Radial:</span> Superficie articular lateral para la cabeza del radio.</li>
                      <li><span className="font-bold">Cuerpo:</span> Presenta el <span className="font-bold">borde interóseo</span> (lateral) para la membrana interósea.</li>
                      <li><span className="font-bold">Cabeza del Cúbito:</span> Extremo distal redondeado que presenta una circunferencia articular.</li>
                      <li><span className="font-bold">Apófisis Estiloides:</span> Pequeña proyección medial y posterior, separada de la cabeza por un surco.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Mano */}
            <div className="bg-white p-6 rounded-2xl border shadow-sm">
              <h3 className="text-2xl font-bold text-blue-700 border-l-4 border-blue-600 pl-3 mb-6">Esqueleto de la Mano</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="grid grid-cols-2 gap-3">
                  <ImageCard 
                    src="https://commons.wikimedia.org/wiki/Special:FilePath/Gray219.png"
                    alt="Huesos de la Mano Ant."
                    caption="Huesos de la mano (Palmar)."
                  />
                  <ImageCard 
                    src="https://commons.wikimedia.org/wiki/Special:FilePath/Gray220.png"
                    alt="Huesos de la Mano Post."
                    caption="Huesos de la mano (Dorsal)."
                  />
                  <ImageCard 
                    src="https://commons.wikimedia.org/wiki/Special:FilePath/Gray221.png"
                    alt="Carpo"
                    caption="Huesos del carpo izquierdo."
                  />
                  <ImageCard 
                    src="https://commons.wikimedia.org/wiki/Special:FilePath/Gray222.png"
                    alt="Metacarpo"
                    caption="Metacarpianos del pulgar y dedos."
                  />
                </div>
                <div className="space-y-6">
                  <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                    <h4 className="font-bold text-blue-800 text-sm uppercase tracking-widest mb-4">Huesos del Carpo (8)</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="font-bold text-xs text-blue-700 mb-2">Fila Proximal (Lat a Med):</p>
                        <ul className="text-[11px] text-slate-600 space-y-1">
                          <li>1. Escafoides (más fracturado)</li>
                          <li>2. Semilunar</li>
                          <li>3. Piramidal</li>
                          <li>4. Pisiforme (sesamoideo)</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-bold text-xs text-blue-700 mb-2">Fila Distal (Lat a Med):</p>
                        <ul className="text-[11px] text-slate-600 space-y-1">
                          <li>5. Trapecio (art. pulgar)</li>
                          <li>6. Trapezoide</li>
                          <li>7. Grande (Capitatum)</li>
                          <li>8. Ganchoso (Hamatus)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <h5 className="font-bold text-slate-800 text-xs mb-2 uppercase">Metacarpo</h5>
                      <p className="text-[11px] text-slate-600">Cinco huesos largos numerados del I (pulgar) al V (meñique). Presentan base, cuerpo y cabeza.</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <h5 className="font-bold text-slate-800 text-xs mb-2 uppercase">Falanges</h5>
                      <p className="text-[11px] text-slate-600">Catorce huesos. El pulgar tiene 2 (proximal y distal), los demás dedos tienen 3 (proximal, media y distal).</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Arthrology */}
        <Section title="Artrología: Articulaciones del Miembro Superior" active={activeTab === 'arthrology'}>
          <div className="grid grid-cols-1 gap-8">
            <div className="bg-white p-6 rounded-2xl border shadow-sm">
              <h3 className="text-2xl font-bold text-emerald-700 border-l-4 border-emerald-600 pl-3 mb-6">Complejo Articular del Hombro</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="grid grid-cols-2 gap-3">
                  <ImageCard 
                    src="https://commons.wikimedia.org/wiki/Special:FilePath/Gray326.png"
                    alt="Articulación Hombro"
                    caption="Cápsula de la articulación del hombro."
                  />
                  <ImageCard 
                    src="https://commons.wikimedia.org/wiki/Special:FilePath/Gray327.png"
                    alt="Ligamentos Hombro"
                    caption="Vista anterior de los ligamentos del hombro."
                  />
                </div>
                <div className="space-y-4">
                  <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-100">
                    <h4 className="font-bold text-emerald-800 text-lg mb-3">Articulación Glenohumeral</h4>
                    <ul className="text-sm text-slate-700 space-y-2">
                      <li><span className="font-bold text-emerald-700">Tipo:</span> Sinovial, Esferoidea (Enartrosis).</li>
                      <li><span className="font-bold text-emerald-700">Superficies:</span> Cabeza del húmero y cavidad glenoidea de la escápula (ampliada por el <span className="italic">rodete glenoideo</span>).</li>
                      <li><span className="font-bold text-emerald-700">Movimientos:</span> Flexión/Extensión, Abducción/Aducción, Rotación interna/externa y Circunducción.</li>
                      <li><span className="font-bold text-emerald-700">Estabilidad:</span> Depende principalmente de los músculos del <span className="font-bold">manguito rotador</span>.</li>
                    </ul>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-xs p-3 bg-slate-50 rounded-lg border">
                      <span className="font-bold block mb-1">Acromioclavicular</span>
                      Sinovial plana. Une el acromion con la clavícula.
                    </div>
                    <div className="text-xs p-3 bg-slate-50 rounded-lg border">
                      <span className="font-bold block mb-1">Esternoclavicular</span>
                      Sinovial en silla de montar. Única unión ósea con el esqueleto axial.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border shadow-sm">
              <h3 className="text-2xl font-bold text-emerald-700 border-l-4 border-emerald-600 pl-3 mb-6">Articulación del Codo</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="grid grid-cols-2 gap-3">
                  <ImageCard 
                    src="https://commons.wikimedia.org/wiki/Special:FilePath/Gray329.png"
                    alt="Articulación Codo Medial"
                    caption="Ligamento colateral cubital."
                  />
                  <ImageCard 
                    src="https://commons.wikimedia.org/wiki/Special:FilePath/Gray330.png"
                    alt="Articulación Codo Lateral"
                    caption="Ligamento colateral radial."
                  />
                </div>
                <div className="space-y-4">
                  <p className="text-sm text-slate-700">Complejo formado por tres articulaciones envueltas en una sola cápsula:</p>
                  <div className="space-y-3">
                    <div className="bg-slate-50 p-3 rounded-lg border">
                      <span className="font-bold text-emerald-700 text-sm block">1. Humerocubital</span>
                      <p className="text-xs text-slate-600">Tipo: Gínglimo (Troclear). Permite flexión y extensión.</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border">
                      <span className="font-bold text-emerald-700 text-sm block">2. Humerorradial</span>
                      <p className="text-xs text-slate-600">Tipo: Esferoidea (funciona como gínglimo). Entre cóndilo y cúpula radial.</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border">
                      <span className="font-bold text-emerald-700 text-sm block">3. Radiocubital Proximal</span>
                      <p className="text-xs text-slate-600">Tipo: Trocoide (Pivote). Permite la pronosupinación.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border shadow-sm">
              <h3 className="text-2xl font-bold text-emerald-700 border-l-4 border-emerald-600 pl-3 mb-6">Articulaciones del Antebrazo y Mano</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="grid grid-cols-2 gap-3">
                  <ImageCard 
                    src="https://commons.wikimedia.org/wiki/Special:FilePath/Gray334.png"
                    alt="Articulación Muñeca"
                    caption="Ligamentos de la muñeca (Palmar)."
                  />
                  <ImageCard 
                    src="https://commons.wikimedia.org/wiki/Special:FilePath/Gray335.png"
                    alt="Articulación Muñeca Post"
                    caption="Ligamentos de la muñeca (Dorsal)."
                  />
                  <ImageCard 
                    src="https://commons.wikimedia.org/wiki/Special:FilePath/Gray336.png"
                    alt="Articulaciones Mano"
                    caption="Cortes de las articulaciones del carpo."
                  />
                  <ImageCard 
                    src="https://commons.wikimedia.org/wiki/Special:FilePath/Gray337.png"
                    alt="Ligamentos Dedos"
                    caption="Articulaciones metacarpofalángicas e interfalángicas."
                  />
                </div>
                <div className="space-y-4">
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                    <h4 className="font-bold text-emerald-800 text-sm mb-2">Articulación Radiocubital Distal</h4>
                    <ul className="text-xs text-slate-700 space-y-1">
                      <li><span className="font-bold">Tipo:</span> Sinovial Trocoide (Pivote).</li>
                      <li><span className="font-bold">Superficies:</span> Cabeza del cúbito y escotadura cubital del radio.</li>
                      <li><span className="font-bold">Medios de unión:</span> Cápsula articular y el <span className="italic">disco articular (ligamento triangular)</span>, que es el principal medio de unión.</li>
                      <li><span className="font-bold">Movimientos:</span> Pronación y supinación del antebrazo.</li>
                    </ul>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <h4 className="font-bold text-slate-800 text-sm mb-2">Articulación Radiocarpiana (Muñeca)</h4>
                    <p className="text-xs text-slate-700">
                      <span className="font-bold">Tipo:</span> Sinovial Elipsoidea (Condílea). Une el radio y el disco articular con la fila proximal del carpo (escafoides, semilunar y piramidal). Permite flexión, extensión, abducción y aducción.
                    </p>
                  </div>

                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                    <h4 className="font-bold text-emerald-800 text-sm mb-2">Articulaciones Carpometacarpianas</h4>
                    <div className="space-y-2">
                      <p className="text-xs text-slate-700">
                        <span className="font-bold">Del Pulgar:</span> Sinovial en silla de montar (encaje recíproco). Entre el trapecio y el 1er metacarpiano. Esencial para la <span className="font-bold">oposición</span>.
                      </p>
                      <p className="text-xs text-slate-700">
                        <span className="font-bold">De los dedos (II-V):</span> Sinoviales planas (artrodias). Permiten movimientos limitados de deslizamiento.
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <h4 className="font-bold text-slate-800 text-sm mb-2">Articulaciones Interfalángicas</h4>
                    <ul className="text-xs text-slate-700 space-y-1">
                      <li><span className="font-bold">Tipo:</span> Sinovial Gínglimo (Troclear).</li>
                      <li><span className="font-bold">Superficies:</span> Cabeza de la falange proximal y base de la falange distal/media.</li>
                      <li><span className="font-bold">Medios de unión:</span> Cápsula, ligamentos colaterales (medial y lateral) y ligamentos palmares.</li>
                      <li><span className="font-bold">Movimientos:</span> Uniaxiales, exclusivamente flexión y extensión.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Myology */}
        <Section title="Miología: Sistema Muscular" active={activeTab === 'myology'}>
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl border shadow-sm">
              <h3 className="text-xl font-bold text-blue-700 border-l-4 border-blue-600 pl-3 mb-6">Músculos del Hombro y Tórax</h3>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
                <ImageCard 
                  src="https://commons.wikimedia.org/wiki/Special:FilePath/Gray410.png"
                  alt="Músculos Superficiales"
                  caption="Deltoides y Pectoral Mayor."
                />
                <ImageCard 
                  src="https://commons.wikimedia.org/wiki/Special:FilePath/Gray411.png"
                  alt="Pectoral Menor"
                  caption="Pectoral Menor y Subclavio."
                />
                <ImageCard 
                  src="https://commons.wikimedia.org/wiki/Special:FilePath/Gray412.png"
                  alt="Serrato Anterior"
                  caption="Músculo Serrato Anterior."
                />
                <ImageCard 
                  src="https://commons.wikimedia.org/wiki/Special:FilePath/Gray413.png"
                  alt="Deltoides"
                  caption="Músculo Deltoides (Vista Lateral)."
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-lg">Región</th>
                      <th className="px-4 py-3">Músculos</th>
                      <th className="px-4 py-3 rounded-tr-lg">Acción Principal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="px-4 py-4 font-bold text-slate-700">Axioapendicular Ant.</td>
                      <td className="px-4 py-4">Pectoral Mayor, Menor, Subclavio, Serrato ant.</td>
                      <td className="px-4 py-4">Aducción brazo, Protracción escápula</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-4 font-bold text-slate-700">Axioapendicular Post.</td>
                      <td className="px-4 py-4">Trapecio, Dorsal Ancho, Romboides, Elevador escápula</td>
                      <td className="px-4 py-4">Elevación/Retracción escápula, Extensión brazo</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-4 font-bold text-slate-700">Escapulohumerales</td>
                      <td className="px-4 py-4">Deltoides, Redondo mayor, Manguito rotador</td>
                      <td className="px-4 py-4">Abducción y rotación del hombro</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-2xl border shadow-sm">
                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <div className="w-2 h-6 bg-red-500 rounded-full"></div>
                  Brazo
                </h4>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <ImageCard 
                    src="https://commons.wikimedia.org/wiki/Special:FilePath/Gray414.png"
                    alt="Bíceps Braquial"
                    caption="Músculo Bíceps Braquial."
                  />
                  <ImageCard 
                    src="https://commons.wikimedia.org/wiki/Special:FilePath/Gray415.png"
                    alt="Coracobraquial"
                    caption="Músculo Coracobraquial."
                  />
                  <ImageCard 
                    src="https://commons.wikimedia.org/wiki/Special:FilePath/Gray416.png"
                    alt="Tríceps Braquial"
                    caption="Músculo Tríceps Braquial."
                  />
                  <ImageCard 
                    src="https://commons.wikimedia.org/wiki/Special:FilePath/Gray417.png"
                    alt="Ancóneo"
                    caption="Músculo Ancóneo."
                  />
                </div>
                <div className="space-y-4">
                  <div className="bg-red-50 p-4 rounded-xl">
                    <p className="font-bold text-red-800 text-sm mb-2">Compartimiento Anterior (Flexor)</p>
                    <ul className="text-sm text-red-700 list-disc list-inside">
                      <li>Bíceps Braquial</li>
                      <li>Coracobraquial</li>
                      <li>Braquial (Flexor puro)</li>
                    </ul>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="font-bold text-slate-800 text-sm mb-2">Compartimiento Posterior (Extensor)</p>
                    <ul className="text-sm text-slate-600 list-disc list-inside">
                      <li>Tríceps Braquial (3 cabezas)</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border shadow-sm">
                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <div className="w-2 h-6 bg-blue-500 rounded-full"></div>
                  Antebrazo
                </h4>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <ImageCard 
                    src="https://commons.wikimedia.org/wiki/Special:FilePath/Gray418.png"
                    alt="Flexores Superficiales"
                    caption="Músculos flexores del antebrazo."
                  />
                  <ImageCard 
                    src="https://commons.wikimedia.org/wiki/Special:FilePath/Gray420.png"
                    alt="Flexores Profundos"
                    caption="Músculos flexores profundos."
                  />
                  <ImageCard 
                    src="https://commons.wikimedia.org/wiki/Special:FilePath/Gray421.png"
                    alt="Extensores Superficiales"
                    caption="Músculos extensores del antebrazo."
                  />
                  <ImageCard 
                    src="https://commons.wikimedia.org/wiki/Special:FilePath/Gray423.png"
                    alt="Extensores Profundos"
                    caption="Músculos extensores profundos."
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <p className="font-bold text-slate-700">Anterior (Flexores)</p>
                    <p className="text-xs text-slate-500 italic">Pronador redondo, Flexores del carpo y dedos.</p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-bold text-slate-700">Lateral/Posterior</p>
                    <p className="text-xs text-slate-500 italic">Braquiorradial, Extensores radiales, Supinador.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Angiology */}
        <Section title="Vascularización: Arterias y Venas" active={activeTab === 'angiology'}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
              <h3 className="text-xl font-bold text-blue-700 border-l-4 border-blue-600 pl-3">Sistema Arterial</h3>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <ImageCard 
                  src="https://commons.wikimedia.org/wiki/Special:FilePath/Gray525.png"
                  alt="Arteria Axilar"
                  caption="Arteria Axilar y sus ramas."
                />
                <ImageCard 
                  src="https://commons.wikimedia.org/wiki/Special:FilePath/Gray526.png"
                  alt="Arteria Braquial"
                  caption="Arteria Braquial en el brazo."
                />
                <ImageCard 
                  src="https://commons.wikimedia.org/wiki/Special:FilePath/Gray527.png"
                  alt="Arterias Antebrazo"
                  caption="Arterias Radial y Cubital."
                />
                <ImageCard 
                  src="https://commons.wikimedia.org/wiki/Special:FilePath/Gray528.png"
                  alt="Arcos Palmares"
                  caption="Vascularización de la mano."
                />
              </div>
              <div className="space-y-4">
                {[
                  { n: "Axilar", d: "Continuación de la subclavia. Ramas torácicas y circunflejas." },
                  { n: "Braquial", d: "Desciende por el canal braquial. Da la Braquial Profunda." },
                  { n: "Radial", d: "Lateral. Pasa por el canal del pulso." },
                  { n: "Cubital", d: "Medial. Forma el arco palmar superficial." }
                ].map((art, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="bg-red-100 text-red-600 font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs">{i+1}</div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">Arteria {art.n}</p>
                      <p className="text-xs text-slate-500">{art.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
              <h3 className="text-xl font-bold text-blue-700 border-l-4 border-blue-600 pl-3">Retorno Venoso</h3>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <ImageCard 
                  src="https://commons.wikimedia.org/wiki/Special:FilePath/Gray574.png"
                  alt="Venas Superficiales"
                  caption="Venas cefálica y basílica."
                />
                <ImageCard 
                  src="https://commons.wikimedia.org/wiki/Special:FilePath/Gray575.png"
                  alt="Venas de la Mano"
                  caption="Red venosa dorsal de la mano."
                />
                <ImageCard 
                  src="https://commons.wikimedia.org/wiki/Special:FilePath/Gray576.png"
                  alt="Venas del Antebrazo"
                  caption="Venas superficiales del antebrazo."
                />
                <ImageCard 
                  src="https://commons.wikimedia.org/wiki/Special:FilePath/Gray577.png"
                  alt="Vena Axilar"
                  caption="Vena Axilar y Subclavia."
                />
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="font-bold text-blue-800 text-sm mb-2">Venas Superficiales Clave</p>
                  <ul className="text-sm text-blue-700 space-y-2">
                    <li className="flex justify-between"><span>Vena Cefálica</span> <span className="text-xs opacity-70">Lateral</span></li>
                    <li className="flex justify-between"><span>Vena Basílica</span> <span className="text-xs opacity-70">Medial</span></li>
                    <li className="flex justify-between"><span>M Venosa</span> <span className="text-xs opacity-70">Fosa del codo</span></li>
                  </ul>
                </div>
                <p className="text-xs text-slate-500 italic">Nota: Las venas profundas suelen ser dobles y acompañan a las arterias homónimas.</p>
              </div>
            </div>
          </div>
        </Section>

        {/* Neurology */}
        <Section title="Neurología: Plexo Braquial" active={activeTab === 'neurology'}>
          <div className="bg-white p-6 md:p-8 rounded-3xl border shadow-sm space-y-8">
              <div className="grid grid-cols-2 gap-4 items-center">
                <div className="grid grid-cols-2 gap-2">
                  <ImageCard 
                    src="https://commons.wikimedia.org/wiki/Special:FilePath/Brachial_plexus_2.svg"
                    alt="Plexo Braquial"
                    caption="Diagrama de troncos y fascículos."
                  />
                  <ImageCard 
                    src="https://commons.wikimedia.org/wiki/Special:FilePath/Gray807.png"
                    alt="Plexo Braquial (Gray)"
                    caption="Anatomía del Plexo Braquial."
                  />
                  <ImageCard 
                    src="https://commons.wikimedia.org/wiki/Special:FilePath/Gray808.png"
                    alt="Nervios del Brazo"
                    caption="Distribución nerviosa en el brazo."
                  />
                  <ImageCard 
                    src="https://commons.wikimedia.org/wiki/Special:FilePath/Gray810.png"
                    alt="Nervios de la Mano"
                    caption="Inervación de la mano."
                  />
                </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <h4 className="text-lg font-bold text-slate-800">Organización del Plexo</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">Se origina de los ramos anteriores de C5 a T1. Se divide en raíces, troncos, divisiones, fascículos y finalmente ramos terminales.</p>
                </div>
                <div className="space-y-3">
                  {[
                    { f: "Lateral", n: "Musculocutáneo", i: "Flexores del brazo" },
                    { f: "Medial", n: "Cubital", i: "Intrínsecos mano" },
                    { f: "Posterior", n: "Radial / Axilar", i: "Extensores / Deltoides" },
                    { f: "Lat + Med", n: "Mediano", i: "Flexores antebrazo / Tenar" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="bg-blue-600 text-white p-2 rounded-lg"><Zap className="w-4 h-4" /></div>
                      <div className="text-xs">
                        <p className="font-bold text-slate-800">Fascículo {item.f} → N. {item.n}</p>
                        <p className="text-slate-500">{item.i}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* 3D Viewer */}
        <Section title="Lector de Modelos Anatómicos (.glb)" active={activeTab === '3dviewer'}>
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-xl mb-6">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-blue-600 shrink-0" />
              <p className="text-sm text-blue-800">
                <strong>Instrucciones:</strong> Carga un archivo <strong>.glb</strong>. El sistema identificará automáticamente huesos, músculos y vasos según sus nombres internos. Puedes ocultar capas completas o piezas individuales haciendo clic sobre ellas.
              </p>
            </div>
          </div>
          <Viewer3D />
        </Section>

        {/* Quiz */}
        <Section title="Centro de Evaluación" active={activeTab === 'quiz'}>
          <Quiz />
        </Section>

      </main>

      <footer className="bg-slate-900 text-slate-500 py-8 px-4 text-center text-sm border-t border-slate-800">
        <p>© 2024 BioMod - Proyecto Educativo de Anatomía Humana</p>
        <p className="mt-2 opacity-50">Desarrollado para estudiantes de ciencias de la salud</p>
      </footer>
    </div>
  );
}
