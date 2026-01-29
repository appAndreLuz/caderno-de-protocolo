
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { NAF } from '../types';
import { formatDate, calculateNafPage } from '../utils';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  Users, 
  Loader2, 
  ShieldAlert, 
  Sparkles, 
  History, 
  Quote, 
  Search
} from 'lucide-react';

const PSALMS = [
  { text: "Bem-aventurado o homem que não anda segundo o conselho dos ímpios.", ref: "Salmo 1:1" },
  { text: "Servi ao Senhor com temor, e alegrai-vos com tremor.", ref: "Salmo 2:11" },
  { text: "Mas tu, Senhor, és um escudo para mim, a minha glória.", ref: "Salmo 3:3" },
  { text: "Em paz também me deitarei e dormirei, porque só tu, Senhor, me fazes habitar em segurança.", ref: "Salmo 4:8" },
  { text: "Pela manhã ouvirás a minha voz, ó Senhor; pela manhã apresentarei a ti a minha oração.", ref: "Salmo 5:3" },
  { text: "Senhor, não me repreendas na tua ira, nem me castigues no teu furor.", ref: "Salmo 6:1" },
  { text: "Senhor meu Deus, em ti confio; salva-me de todos os que me perseguem.", ref: "Salmo 7:1" },
  { text: "Ó Senhor, Senhor nosso, quão admirável é o teu nome em toda a terra!", ref: "Salmo 8:1" },
  { text: "Louvar-te-ei, Senhor, com todo o meu coração; contarei todas as tuas maravilhas.", ref: "Salmo 9:1" },
  { text: "O Senhor é rei eterno e para sempre.", ref: "Salmo 10:16" },
  { text: "No Senhor confio; como dizeis à minha alma: Fugi para a vossa montanha como pássaro?", ref: "Salmo 11:1" },
  { text: "Salva-nos, Senhor, porque faltam os homens bons.", ref: "Salmo 12:1" },
  { text: "Até quando, Senhor? Esquecer-te-ás de mim para sempre?", ref: "Salmo 13:1" },
  { text: "Diz o néscio no seu coração: Não há Deus.", ref: "Salmo 14:1" },
  { text: "Senhor, quem habitará no teu tabernáculo? Quem morará no teu santo monte?", ref: "Salmo 15:1" },
  { text: "Guarda-me, ó Deus, porque em ti confio.", ref: "Salmo 16:1" },
  { text: "Ouve, Senhor, a justiça; atende ao meu clamor.", ref: "Salmo 17:1" },
  { text: "Eu te amarei, ó Senhor, fortaleza minha.", ref: "Salmo 18:1" },
  { text: "Os céus declaram a glória de Deus e o firmamento anuncia a obra das suas mãos.", ref: "Salmo 19:1" },
  { text: "O Senhor te ouça no dia da angústia, o nome do Deus de Jacó te proteja.", ref: "Salmo 20:1" },
  { text: "Na tua força, ó Senhor, o rei se alegra.", ref: "Salmo 21:1" },
  { text: "Deus meu, Deus meu, por que me desamparaste?", ref: "Salmo 22:1" },
  { text: "O Senhor é o meu pastor, nada me faltará.", ref: "Salmo 23:1" },
  { text: "Do Senhor é a terra e a sua plenitude, o mundo e aqueles que nele habitam.", ref: "Salmo 24:1" },
  { text: "A ti, Senhor, levanto a minha alma.", ref: "Salmo 25:1" },
  { text: "Julga-me, Senhor, pois tenho andado na minha sinceridade.", ref: "Salmo 26:1" },
  { text: "O Senhor é a minha luz e a minha salvação; a quem temerei?", ref: "Salmo 27:1" },
  { text: "A ti clamarei, ó Senhor, minha rocha; não emudeças para comigo.", ref: "Salmo 28:1" },
  { text: "Dai ao Senhor, ó filhos dos poderosos, dai ao Senhor glória e força.", ref: "Salmo 29:1" },
  { text: "Exaltar-te-ei, ó Senhor, porque tu me levantaste.", ref: "Salmo 30:1" },
  { text: "Em ti, Senhor, confio; nunca me deixes confundido.", ref: "Salmo 31:1" },
  { text: "Bem-aventurado aquele cuja transgressão é perdoada, e cujo pecado é coberto.", ref: "Salmo 32:1" },
  { text: "Regozijai-vos no Senhor, vós justos, pois aos retos fica bem o louvor.", ref: "Salmo 33:1" },
  { text: "Louvarei ao Senhor em todo o tempo; o seu louvor estará continuamente na minha boca.", ref: "Salmo 34:1" },
  { text: "Contende, Senhor, com os que contendem comigo; peleja contra os que pelejam contra mim.", ref: "Salmo 35:1" },
  { text: "A transgressão do ímpio diz no íntimo do meu coração: Não há temor de Deus perante os seus olhos.", ref: "Salmo 36:1" },
  { text: "Não te indignes por causa dos malfeitores, nem tenhas inveja dos que praticam a iniquidade.", ref: "Salmo 37:1" },
  { text: "Senhor, não me repreendas na tua ira, nem me castigues no teu furor.", ref: "Salmo 38:1" },
  { text: "Disse: Guardarei os meus caminhos para não pecar com a minha língua.", ref: "Salmo 39:1" },
  { text: "Esperei com paciência no Senhor, e ele se inclinou para mim, e ouviu o meu clamor.", ref: "Salmo 40:1" },
  { text: "Bem-aventurado é aquele que atende ao pobre; o Senhor o livrará no dia do mal.", ref: "Salmo 41:1" },
  { text: "Como o cervo brama pelas correntes das águas, assim suspira a minha alma por ti, ó Deus!", ref: "Salmo 42:1" },
  { text: "Faze-me justiça, ó Deus, e pleiteia a minha causa contra a nação ímpia.", ref: "Salmo 43:1" },
  { text: "Ó Deus, nós ouvimos com os nossos ouvidos, e nossos pais nos contaram a obra que fizeste.", ref: "Salmo 44:1" },
  { text: "O meu coração ferve com palavras boas; falo do que tenho feito no tocante ao Rei.", ref: "Salmo 45:1" },
  { text: "Deus é o nosso refúgio e fortaleza, socorro bem presente na angústia.", ref: "Salmo 46:1" },
  { text: "Batei palmas, todos os povos; celebrai a Deus com vozes de júbilo.", ref: "Salmo 47:1" },
  { text: "Grande é o Senhor e mui digno de louvor, na cidade do nosso Deus, no seu monte santo.", ref: "Salmo 48:1" },
  { text: "Ouvi isto, vós todos os povos; inclinai os ouvidos, todos os moradores do mundo.", ref: "Salmo 49:1" },
  { text: "O Deus poderoso, o Senhor, falou e chamou a terra desde o nascimento do sol até ao seu ocaso.", ref: "Salmo 50:1" },
  { text: "Tem misericórdia de mim, ó Deus, segundo a tua benignidade.", ref: "Salmo 51:1" },
  { text: "Por que te glorias na maldade, ó homem poderoso?", ref: "Salmo 52:1" },
  { text: "Disse o néscio no seu coração: Não há Deus.", ref: "Salmo 53:1" },
  { text: "Salva-me, ó Deus, pelo teu nome, e faze-me justiça pelo teu poder.", ref: "Salmo 54:1" },
  { text: "Dá ouvidos, ó Deus, à minha oração, e não te escondas da minha súplica.", ref: "Salmo 55:1" },
  { text: "Tem misericórdia de mim, ó Deus, porque o homem procura devorar-me.", ref: "Salmo 56:1" },
  { text: "Tem misericórdia de mim, ó Deus, tem misericórdia de mim, porque a minha alma confia em ti.", ref: "Salmo 57:1" },
  { text: "Falais deveras, ó congregação, a justiça? Julgais retamente, ó filhos dos homens?", ref: "Salmo 58:1" },
  { text: "Livra-me, meu Deus, dos meus inimigos; defende-me dos que se levantam contra mim.", ref: "Salmo 59:1" },
  { text: "Ó Deus, tu nos rejeitaste, tu nos espalhaste, tu te indignaste; oh, volta-te para nós.", ref: "Salmo 60:1" },
  { text: "Ouve, ó Deus, o meu clamor; atende à minha oração.", ref: "Salmo 61:1" },
  { text: "A minha alma descansa somente em Deus; dele vem a minha salvação.", ref: "Salmo 62:1" },
  { text: "Ó Deus, tu és o meu Deus, de madrugada te buscarei.", ref: "Salmo 63:1" },
  { text: "Ouve, ó Deus, a minha voz na minha oração; guarda a minha vida do temor do inimigo.", ref: "Salmo 64:1" },
  { text: "A ti, ó Deus, pertence o louvor em Sião, e a ti se pagará o voto.", ref: "Salmo 65:1" },
  { text: "Celebrai a Deus com júbilo, todos os moradores da terra.", ref: "Salmo 66:1" },
  { text: "Deus tenha misericórdia de nós e nos abençoe; e faça resplandecer o seu rosto sobre nós.", ref: "Salmo 67:1" },
  { text: "Levante-se Deus, e sejam dissipados os seus inimigos.", ref: "Salmo 68:1" },
  { text: "Salva-me, ó Deus, pois as águas entraram até à minha alma.", ref: "Salmo 69:1" },
  { text: "Apressa-te, ó Deus, em me livrar; Senhor, apressa-te em ajudar-me.", ref: "Salmo 70:1" },
  { text: "Em ti, Senhor, confio; nunca me deixes confundido.", ref: "Salmo 71:1" },
  { text: "Ó Deus, dá ao rei os teus juízos, e a tua justiça ao filho do rei.", ref: "Salmo 72:1" },
  { text: "Verdadeiramente bom é Deus para com Israel, para com os limpos de coração.", ref: "Salmo 73:1" },
  { text: "Ó Deus, por que nos rejeitaste para sempre?", ref: "Salmo 74:1" },
  { text: "A ti, ó Deus, rendemos graças, rendemos graças, pois o teu nome está perto.", ref: "Salmo 75:1" },
  { text: "Conhecido é Deus em Judá; grande é o seu nome em Israel.", ref: "Salmo 76:1" },
  { text: "Clamei a Deus com a minha voz, a Deus levantei a minha voz, e ele me inclinou os ouvidos.", ref: "Salmo 77:1" },
  { text: "Escutai a minha lei, povo meu; inclinai os vossos ouvidos às palavras da minha boca.", ref: "Salmo 78:1" },
  { text: "Ó Deus, as nações entraram na tua herança; contaminaram o teu santo templo.", ref: "Salmo 79:1" },
  { text: "Tu, que és pastor de Israel, dá ouvidos; tu, que guias a José como a um rebanho.", ref: "Salmo 80:1" },
  { text: "Cantai alegremente a Deus, nossa fortaleza; celebrai ao Deus de Jacó.", ref: "Salmo 81:1" },
  { text: "Deus assiste na congregação dos poderosos; juiz é no meio dos deuses.", ref: "Salmo 82:1" },
  { text: "Ó Deus, não estejas em silêncio; não te cales, nem te confesses quieto, ó Deus.", ref: "Salmo 83:1" },
  { text: "Quão amáveis são os teus tabernáculos, Senhor dos Exércitos!", ref: "Salmo 84:1" },
  { text: "Abençoaste, Senhor, a tua terra; voltaste o cativeiro de Jacó.", ref: "Salmo 85:1" },
  { text: "Inclina, Senhor, os teus ouvidos, e ouve-me, porque estou necessitado e pobre.", ref: "Salmo 86:1" },
  { text: "O seu fundamento está nos montes santos.", ref: "Salmo 87:1" },
  { text: "Senhor Deus da minha salvação, diante de ti tenho clamado de dia e de noite.", ref: "Salmo 88:1" },
  { text: "As misericórdias do Senhor cantarei eternamente.", ref: "Salmo 89:1" },
  { text: "Senhor, tu tens sido o nosso refúgio, de geração em geração.", ref: "Salmo 90:1" },
  { text: "Aquele que habita no esconderijo do Altíssimo, à sombra do Onipotente descansará.", ref: "Salmo 91:1" },
  { text: "Bom é louvar ao Senhor, e cantar louvores ao teu nome, ó Altíssimo.", ref: "Salmo 92:1" },
  { text: "O Senhor reina; está vestido de majestade.", ref: "Salmo 93:1" },
  { text: "Ó Senhor Deus, a quem a vingança pertence, mostra-te resplandecente.", ref: "Salmo 94:1" },
  { text: "Vinde, cantemos ao Senhor; jubilemos à rocha da nossa salvação.", ref: "Salmo 95:1" },
  { text: "Cantai ao Senhor um cântico novo, cantai ao Senhor todas as terras.", ref: "Salmo 96:1" },
  { text: "O Senhor reina; regozije-se a terra; alegrem-se as muitas ilhas.", ref: "Salmo 97:1" },
  { text: "Cantai ao Senhor um cântico novo, porque fez maravilhas.", ref: "Salmo 98:1" },
  { text: "O Senhor reina; tremam os povos.", ref: "Salmo 99:1" },
  { text: "Celebrai com júbilo ao Senhor, todas as terras.", ref: "Salmo 100:1" },
  { text: "Cantarei a misericórdia e o juízo; a ti, Senhor, cantarei.", ref: "Salmo 101:1" },
  { text: "Senhor, ouve a minha oração, e chegue a ti o meu clamor.", ref: "Salmo 102:1" },
  { text: "Bendize, ó minha alma, ao Senhor, e tudo o que há em mim bendiga o seu santo nome.", ref: "Salmo 103:1" },
  { text: "Bendize, ó minha alma, ao Senhor. Senhor Deus meu, tu és magnificentíssimo.", ref: "Salmo 104:1" },
  { text: "Louvai ao Senhor, e invocai o seu nome; fazei conhecidas as suas obras entre os povos.", ref: "Salmo 105:1" },
  { text: "Louvai ao Senhor. Louvai ao Senhor, porque ele é bom, porque a sua misericórdia dura para sempre.", ref: "Salmo 106:1" },
  { text: "Louvai ao Senhor, porque ele é bom, porque a sua misericórdia dura para sempre.", ref: "Salmo 107:1" },
  { text: "Preparado está o meu coração, ó Deus; cantarei e darei louvores.", ref: "Salmo 108:1" },
  { text: "Ó Deus do meu louvor, não te cales.", ref: "Salmo 109:1" },
  { text: "Disse o Senhor ao meu Senhor: Assenta-te à minha direita.", ref: "Salmo 110:1" },
  { text: "Louvai ao Senhor. Louvarei ao Senhor de todo o meu coração.", ref: "Salmo 111:1" },
  { text: "Louvai ao Senhor. Bem-aventurado o homem que teme ao Senhor.", ref: "Salmo 112:1" },
  { text: "Louvai ao Senhor. Louvai, servos do Senhor, louvai o nome do Senhor.", ref: "Salmo 113:1" },
  { text: "Quando Israel saiu do Egito, e a casa de Jacó de um povo de língua estranha.", ref: "Salmo 114:1" },
  { text: "Não a nós, Senhor, não a nós, mas ao teu nome dá glória.", ref: "Salmo 115:1" },
  { text: "Amo ao Senhor, porque ele ouviu a minha voz e a minha súplica.", ref: "Salmo 116:1" },
  { text: "Louvai ao Senhor todas as nações, louvai-o todos os povos.", ref: "Salmo 117:1" },
  { text: "Louvai ao Senhor, porque ele é bom, porque a sua misericórdia dura para sempre.", ref: "Salmo 118:1" },
  { text: "Lâmpada para os meus pés é tua palavra, e luz para o meu caminho.", ref: "Salmo 119:105" },
  { text: "Na minha angústia clamei ao Senhor, e ele me ouviu.", ref: "Salmo 120:1" },
  { text: "Elevo os meus olhos para os montes; de onde virá o meu socorro? O meu socorro vem do Senhor.", ref: "Salmo 121:1-2" },
  { text: "Alegrei-me quando me disseram: Vamos à casa do Senhor.", ref: "Salmo 122:1" },
  { text: "A ti levanto os meus olhos, ó tu que habitas nos céus.", ref: "Salmo 123:1" },
  { text: "Se o Senhor não fora por nós, diga-o agora Israel.", ref: "Salmo 124:1" },
  { text: "Os que confiam no Senhor serão como o monte Sião, que não se abala, mas permanece para sempre.", ref: "Salmo 125:1" },
  { text: "Quando o Senhor trouxe do cativeiro os que voltaram a Sião, estávamos como os que sonham.", ref: "Salmo 126:1" },
  { text: "Se o Senhor não edificar a casa, em vão trabalham os que a edificam.", ref: "Salmo 127:1" },
  { text: "Bem-aventurado aquele que teme ao Senhor e anda nos seus caminhos.", ref: "Salmo 128:1" },
  { text: "Muitas vezes me angustiaram desde a minha mocidade, diga-o agora Israel.", ref: "Salmo 129:1" },
  { text: "Das profundezas a ti clamo, ó Senhor.", ref: "Salmo 130:1" },
  { text: "Senhor, o meu coração não se elevou, nem os meus olhos se levantaram.", ref: "Salmo 131:1" },
  { text: "Lembra-te, Senhor, de Davi, e de todas as suas aflições.", ref: "Salmo 132:1" },
  { text: "Oh! quão bom e quão suave é que os irmãos vivam em união!", ref: "Salmo 133:1" },
  { text: "Eis aqui, bendizei ao Senhor todos vós, servos do Senhor.", ref: "Salmo 134:1" },
  { text: "Louvai ao Senhor. Louvai o nome do Senhor; louvai-o, servos do Senhor.", ref: "Salmo 135:1" },
  { text: "Louvai ao Senhor, porque ele é bom; porque a sua misericórdia dura para sempre.", ref: "Salmo 136:1" },
  { text: "Junto aos rios da Babilônia, ali nos assentamos e choramos, lembrando-nos de Sião.", ref: "Salmo 137:1" },
  { text: "Louvar-te-ei, Senhor, de todo o meu coração; na presença dos deuses a ti cantarei louvores.", ref: "Salmo 138:1" },
  { text: "Senhor, tu me sondaste, e me conheces.", ref: "Salmo 139:1" },
  { text: "Livra-me, ó Senhor, do homem mau; guarda-me do homem violento.", ref: "Salmo 140:1" },
  { text: "Senhor, a ti clamo, apressa-te para mim; dá ouvidos à minha voz.", ref: "Salmo 141:1" },
  { text: "Com a minha voz clamei ao Senhor; com a minha voz supliquei ao Senhor.", ref: "Salmo 142:1" },
  { text: "Senhor, ouve a minha oração, inclina os ouvidos às minhas súplicas.", ref: "Salmo 143:1" },
  { text: "Bendito seja o Senhor, minha rocha, que adestra as minhas mãos para a peleja.", ref: "Salmo 144:1" },
  { text: "Exaltar-te-ei, ó Deus, rei meu, e bendirei o teu nome pelos séculos dos séculos.", ref: "Salmo 145:1" },
  { text: "Louvai ao Senhor. Ó minha alma, louva ao Senhor.", ref: "Salmo 146:1" },
  { text: "Louvai ao Senhor, porque é bom cantar louvores ao nosso Deus.", ref: "Salmo 147:1" },
  { text: "Louvai ao Senhor. Louvai ao Senhor desde os céus, louvai-o nas alturas.", ref: "Salmo 148:1" },
  { text: "Louvai ao Senhor. Cantai ao Senhor um cântico novo, e o seu louvor na congregação dos santos.", ref: "Salmo 149:1" },
  { text: "Louvai ao Senhor. Louvai a Deus no seu santuário; louvai-o no firmamento do seu poder. Tudo quanto tem fôlego louve ao Senhor.", ref: "Salmo 150:1-6" }
];

const DashboardCard = ({ title, value, icon: Icon, colorClass }: any) => (
  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-3 transition-all hover:shadow-md">
    <div className={`p-2 rounded-lg ${colorClass}`}>
      <Icon size={18} />
    </div>
    <div>
      <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">{title}</p>
      <h3 className="text-lg font-black text-gray-800 leading-none">{value}</h3>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalNafs: 0,
    activeNafs: 0,
    baixasToday: 0,
    fornecedores: 0,
    incompleteSuppliers: 0,
    nearExpiry30Meds: 0,
    nearExpiry60Meds: 0,
    expiredMeds: 0
  });
  const [oldestNaf, setOldestNaf] = useState<NAF | null>(null);
  const [loading, setLoading] = useState(true);
  const [randomPsalm, setRandomPsalm] = useState(PSALMS[0]);

  const [quickSearchTerm, setQuickSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<(NAF & { page: number })[]>([]);
  const [searchExecuted, setSearchExecuted] = useState(false);

  useEffect(() => {
    // Escolhe um dos 150 salmos aleatoriamente
    const randomIndex = Math.floor(Math.random() * PSALMS.length);
    setRandomPsalm(PSALMS[randomIndex]);

    const fetchStats = async () => {
      try {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        const next30Days = new Date();
        next30Days.setDate(today.getDate() + 30);
        const next30DaysStr = next30Days.toISOString().split('T')[0];

        const next60Days = new Date();
        next60Days.setDate(today.getDate() + 60);
        const next60DaysStr = next60Days.toISOString().split('T')[0];
        
        const [totalRes, activeRes, supplierRes, baixasRes, incompleteRes, near30Res, near60Res, expiredRes, oldestRes] = await Promise.all([
          supabase.from('nafs').select('id', { count: 'exact', head: true }),
          supabase.from('nafs').select('id', { count: 'exact', head: true }).is('data_baixa', null),
          supabase.from('fornecedores').select('id', { count: 'exact', head: true }),
          supabase.from('nafs').select('id', { count: 'exact', head: true }).eq('data_baixa', todayStr),
          supabase.from('fornecedores').select('id', { count: 'exact', head: true }).or('telefone.is.null,email.is.null,telefone.eq."",email.eq.""'),
          supabase.from('medicamentos').select('id', { count: 'exact', head: true }).gte('validade', todayStr).lte('validade', next30DaysStr),
          supabase.from('medicamentos').select('id', { count: 'exact', head: true }).gt('validade', next30DaysStr).lte('validade', next60DaysStr),
          supabase.from('medicamentos').select('id', { count: 'exact', head: true }).lt('validade', todayStr),
          supabase.from('nafs').select('*, fornecedor:fornecedores(*)').is('data_baixa', null).order('data_entrada', { ascending: true }).limit(1).maybeSingle()
        ]);

        setStats({
          totalNafs: totalRes.count || 0,
          activeNafs: activeRes.count || 0,
          baixasToday: baixasRes.count || 0,
          fornecedores: supplierRes.count || 0,
          incompleteSuppliers: incompleteRes.count || 0,
          nearExpiry30Meds: near30Res.count || 0,
          nearExpiry60Meds: near60Res.count || 0,
          expiredMeds: expiredRes.count || 0
        });

        if (oldestRes.data) {
          setOldestNaf(oldestRes.data);
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const handleQuickSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSearchTerm.trim()) return;

    setIsSearching(true);
    setSearchExecuted(true);
    
    try {
      const { data: matchedNafs, error } = await supabase
        .from('nafs')
        .select('*, fornecedor:fornecedores(*)')
        .eq('numero_naf', quickSearchTerm.trim())
        .order('numero_subnaf', { ascending: true });

      if (error) throw error;

      if (matchedNafs && matchedNafs.length > 0) {
        const enrichedResults = await Promise.all(matchedNafs.map(async (n) => {
          const { count } = await supabase
            .from('nafs')
            .select('id', { count: 'exact', head: true })
            .lt('created_at', n.created_at);
          
          return {
            ...n,
            page: calculateNafPage(count || 0)
          };
        }));
        setSearchResults(enrichedResults);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setQuickSearchTerm('');
    setSearchResults([]);
    setSearchExecuted(false);
  };

  const getDaysWaiting = (dateStr: string) => {
    const start = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0,0,0,0);
    const diffTime = Math.abs(today.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">Sincronizando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-12 text-sm">
      {/* Welcome Hero - Dinâmico e Compacto */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between relative overflow-hidden group">
        <div className="absolute -right-6 -top-6 text-blue-50 opacity-40 group-hover:scale-110 transition-transform duration-700">
           <ShieldAlert size={120} />
        </div>
        <div className="relative z-10 flex items-center space-x-4">
          <div className="bg-blue-600 p-3 rounded-xl text-white shadow-lg shadow-blue-200">
            <Sparkles size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tighter uppercase mb-0.5">
               {getGreeting()}, André Luz
            </h1>
            <p className="text-gray-400 text-[11px] font-bold uppercase tracking-tight">
               Situação atual das NAF's: <span className="text-blue-600 font-black">{stats.activeNafs} NAF's paradas</span>
            </p>
          </div>
        </div>
        <div className="hidden md:flex flex-col items-end relative z-10">
          <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1 rounded-full border border-gray-100">
             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
             <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Sistema Ativo</span>
          </div>
        </div>
      </div>

      {/* Quick Search - Compact */}
      <div className="relative z-20">
        <form onSubmit={handleQuickSearch} className="max-w-xl mx-auto">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-300 group-focus-within:text-blue-600 transition-colors">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Pesquisa rápida de NAF..."
              value={quickSearchTerm}
              onChange={(e) => setQuickSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-24 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all text-black font-bold text-xs uppercase tracking-wider"
            />
            <div className="absolute inset-y-1.5 right-1.5 flex items-center">
              <button
                type="submit"
                disabled={isSearching || !quickSearchTerm.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-md active:scale-95 transition-all disabled:opacity-50 flex items-center space-x-2"
              >
                {isSearching ? <Loader2 size={12} className="animate-spin" /> : <span>Buscar</span>}
              </button>
            </div>
          </div>
        </form>

        {searchExecuted && (
          <div className="mt-4 animate-scaleIn max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl border border-blue-50 shadow-xl overflow-hidden">
              <div className="p-3 bg-blue-50/50 border-b border-blue-100 flex justify-between items-center px-5">
                <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest">Localizador de NAF</span>
                <button onClick={clearSearch} className="text-[9px] font-black text-gray-400 uppercase hover:text-red-500">Limpar</button>
              </div>
              <div className="p-4 space-y-3">
                {searchResults.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nenhuma NAF encontrada com este número.</p>
                  </div>
                ) : (
                  searchResults.map((res) => (
                    <div key={res.id} className="p-3 bg-gray-50/50 rounded-xl border border-gray-100 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-600 text-white w-10 h-10 rounded-lg flex flex-col items-center justify-center shadow-md">
                          <span className="text-[7px] font-black leading-none opacity-60">PÁG</span>
                          <span className="text-sm font-black leading-none">{res.page}</span>
                        </div>
                        <div>
                          <p className="text-xs font-black text-gray-900">{res.numero_naf} / {res.numero_subnaf}</p>
                          <p className="text-[9px] font-black text-blue-600 uppercase tracking-tighter truncate max-w-[150px]">{res.fornecedor?.razao_social}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black text-gray-400 uppercase">{formatDate(res.data_entrada)}</p>
                        <span className={`text-[8px] font-black uppercase ${res.data_baixa ? 'text-emerald-500' : 'text-amber-500'}`}>
                          {res.data_baixa ? 'Baixada' : 'Pendente'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Biblical Psalm - Compact (Base de 150 Salmos) */}
      <div className="animate-fadeIn">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50/30 p-4 rounded-2xl border border-blue-100/50 flex flex-col items-center text-center relative overflow-hidden">
          <Quote size={20} className="absolute top-2 left-2 text-blue-200 opacity-30" />
          <p className="text-gray-600 font-medium italic text-[12px] leading-snug mb-1">"{randomPsalm.text}"</p>
          <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">{randomPsalm.ref}</span>
        </div>
      </div>

      {/* Main Stats Grid - Smaller */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard title="Total NAFs" value={stats.totalNafs} icon={FileText} colorClass="bg-blue-50 text-blue-600" />
        <DashboardCard title="Pendentes" value={stats.activeNafs} icon={Clock} colorClass="bg-amber-50 text-amber-600" />
        <DashboardCard title="Baixas Hoje" value={stats.baixasToday} icon={CheckCircle2} colorClass="bg-emerald-50 text-emerald-600" />
        <DashboardCard title="Fornecedores" value={stats.fornecedores} icon={Users} colorClass="bg-purple-50 text-purple-600" />
      </div>

      {/* Expiry Alerts - Smaller */}
      <div className="pt-2">
        <div className="flex items-center space-x-2 mb-4 text-gray-800">
          <ShieldAlert size={16} className="text-red-500" />
          <h2 className="text-[10px] font-black uppercase tracking-widest">Alertas de Validade</h2>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center space-y-2">
             <div className={`p-2 rounded-lg ${stats.expiredMeds > 0 ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                <FileText size={20} />
             </div>
             <div>
                <h3 className={`text-xl font-black ${stats.expiredMeds > 0 ? 'text-red-600' : 'text-gray-400'}`}>{stats.expiredMeds}</h3>
                <p className="text-[8px] font-black uppercase tracking-tight text-gray-400">Já Vencidos</p>
             </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center space-y-2">
             <div className="p-2 rounded-lg bg-amber-500 text-white">
                <Clock size={20} />
             </div>
             <div>
                <h3 className="text-xl font-black text-amber-600">{stats.nearExpiry30Meds}</h3>
                <p className="text-[8px] font-black uppercase tracking-tight text-gray-400">Vencem 30d</p>
             </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center space-y-2">
             <div className="p-2 rounded-lg bg-slate-100 text-gray-400">
                <FileText size={20} />
             </div>
             <div>
                <h3 className="text-xl font-black text-gray-500">{stats.nearExpiry60Meds}</h3>
                <p className="text-[8px] font-black uppercase tracking-tight text-gray-400">Vencem 60d</p>
             </div>
          </div>
        </div>
      </div>

      {/* Oldest NAF - Smaller */}
      {oldestNaf && !searchExecuted && (
        <div className="mt-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-all hover:border-red-100">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-red-50 text-red-600">
              <History size={18} />
            </div>
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Protocolo Estagnado</p>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-lg font-black text-gray-800 tracking-tighter">
                  {oldestNaf.numero_naf} <span className="text-gray-300">/</span> {oldestNaf.numero_subnaf}
                </h3>
                <span className="text-[10px] font-bold text-gray-400 truncate max-w-[120px] uppercase">
                  {oldestNaf.fornecedor?.razao_social}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-gray-50">
            <div className="text-center md:text-right">
              <p className="text-[8px] font-black text-gray-400 uppercase mb-0.5">Dias em aberto</p>
              <p className="text-lg font-black text-red-600 leading-none">
                {getDaysWaiting(oldestNaf.data_entrada)} <span className="text-[9px] uppercase font-bold text-gray-300">dias</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
