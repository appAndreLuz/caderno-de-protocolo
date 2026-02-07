
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { NAF } from '../types';
import { formatDate, calculateNafPage, formatCurrency } from '../utils';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  Users, 
  Loader2, 
  ShieldAlert, 
  History, 
  Quote, 
  Search,
  Activity,
  Zap,
  TrendingUp,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  X,
  Sun,
  Moon,
  CloudSun,
  Calendar,
  DollarSign,
  MapPin
} from 'lucide-react';

const PSALMS = [
  { text: "Bem-aventurado o homem que não anda segundo o conselho dos ímpios.", ref: "Salmo 1:1" },
  { text: "Servi ao Senhor com temor, e alegrai-vos com tremor.", ref: "Salmo 2:11" },
  { text: "Mas tu, Senhor, és um escudo para mim, a minha glória, e o que exalta a minha cabeça.", ref: "Salmo 3:3" },
  { text: "Em paz também me deitarei e dormirei, porque só tu, Senhor, me fazes habitar em segurança.", ref: "Salmo 4:8" },
  { text: "Pela manhã ouvirás a minha voz, ó Senhor; pela manhã apresentarei a ti a minha oração.", ref: "Salmo 5:3" },
  { text: "Senhor, não me repreendas na tua ira, nem me castigues no teu furor.", ref: "Salmo 6:1" },
  { text: "O meu escudo é de Deus, que salva os retos de coração.", ref: "Salmo 7:10" },
  { text: "Ó Senhor, Senhor nosso, quão admirável é o teu nome em toda a terra!", ref: "Salmo 8:1" },
  { text: "Eu te louvarei, Senhor, com todo o meu coração; contarei todas as tuas maravilhas.", ref: "Salmo 9:1" },
  { text: "Por que te deténs de longe, Senhor? Por que te escondes nos tempos de angústia?", ref: "Salmo 10:1" },
  { text: "No Senhor confio; como dizeis à minha alma: Fugi para a vossa montanha, como pássaro?", ref: "Salmo 11:1" },
  { text: "As palavras do Senhor são palavras puras, como prata refinada em forno de barro.", ref: "Salmo 12:6" },
  { text: "Até quando, Senhor? Esquecer-te-ás de mim para sempre?", ref: "Salmo 13:1" },
  { text: "Diz o néscio no seu coração: Não há Deus.", ref: "Salmo 14:1" },
  { text: "Senhor, quem habitará no teu tabernáculo? Quem morará no teu santo monte?", ref: "Salmo 15:1" },
  { text: "Guarda-me, ó Deus, porque em ti confio.", ref: "Salmo 16:1" },
  { text: "Ouve, Senhor, a justiça; atende ao meu clamor.", ref: "Salmo 17:1" },
  { text: "Eu te amarei, ó Senhor, fortaleza minha.", ref: "Salmo 18:1" },
  { text: "Os céus declaram a glória de Deus e o firmamento anuncia a obra das suas mãos.", ref: "Salmo 19:1" },
  { text: "O Senhor te ouça no dia da angústia, o nome do Deus de Jacó te proteja.", ref: "Salmo 20:1" },
  { text: "Na tua força, ó Senhor, o rei se alegra; e na tua salvação quão grandemente se regozija!", ref: "Salmo 21:1" },
  { text: "Deus meu, Deus meu, por que me desamparaste?", ref: "Salmo 22:1" },
  { text: "O Senhor é o meu pastor, nada me faltará.", ref: "Salmo 23:1" },
  { text: "Do Senhor é a terra e a sua plenitude, o mundo e those que nele habitam.", ref: "Salmo 24:1" },
  { text: "A ti, Senhor, levanto a minha alma.", ref: "Salmo 25:1" },
  { text: "Examina-me, Senhor, e prova-me; esquadrinha os meus rins e o meu coração.", ref: "Salmo 26:2" },
  { text: "O Senhor é a minha luz e a minha salvação; a quem temerei?", ref: "Salmo 27:1" },
  { text: "A ti clamarei, ó Senhor, rocha minha; não emudeças para comigo.", ref: "Salmo 28:1" },
  { text: "Tributai ao Senhor a glória devida ao seu nome; adorai o Senhor na beleza da santidade.", ref: "Salmo 29:2" },
  { text: "Exaltar-te-ei, ó Senhor, porque tu me levantaste e não permitiste que os meus inimigos se alegrassem sobre mim.", ref: "Salmo 30:1" },
  { text: "Em ti, Senhor, confio; nunca me deixes confundido.", ref: "Salmo 31:1" },
  { text: "Bem-aventurado aquele cuja transgressão é perdoada, e cujo pecado é coberto.", ref: "Salmo 32:1" },
  { text: "Regozijai-vos no Senhor, vós justos, pois o louvor fica bem aos retos.", ref: "Salmo 33:1" },
  { text: "Louvarei ao Senhor em todo o tempo; o seu louvor estará continuamente na minha boca.", ref: "Salmo 34:1" },
  { text: "Pleiteia, Senhor, com os que pleiteiam comigo; peleja contra os que pelejam contra mim.", ref: "Salmo 35:1" },
  { text: "A tua misericórdia, Senhor, está nos céus, e a tua fidelidade chega até às mais excelsas nuvens.", ref: "Salmo 36:5" },
  { text: "Entrega o teu caminho ao Senhor; confia nele, e ele o fará.", ref: "Salmo 37:5" },
  { text: "Senhor, não me repreendas na tua ira, nem me castigues no teu furor.", ref: "Salmo 38:1" },
  { text: "Disse eu: Guardarei os meus caminhos para não pecar com a minha língua.", ref: "Salmo 39:1" },
  { text: "Esperei com paciência no Senhor, e ele se inclinou para mim, e ouviu o meu clamor.", ref: "Salmo 40:1" },
  { text: "Bem-aventurado é aquele que atende ao pobre; o Senhor o livrará no dia do mal.", ref: "Salmo 41:1" },
  { text: "Assim como o cervo brama pelas correntes das águas, assim suspira a minha alma por ti, ó Deus!", ref: "Salmo 42:1" },
  { text: "Faze-me justiça, ó Deus, e pleiteia a minha causa contra a nação ímpia.", ref: "Salmo 43:1" },
  { text: "Ó Deus, nós ouvimos com os nossos ouvidos, e nossos pais nos contaram a obra que fizeste em seus dias.", ref: "Salmo 44:1" },
  { text: "O meu coração ferve com palavras boas; falo do que tenho feito no tocante ao Rei.", ref: "Salmo 45:1" },
  { text: "Deus é o nosso refúgio e fortaleza, socorro bem presente na angústia.", ref: "Salmo 46:1" },
  { text: "Batei palmas, todos os povos; celebrai a Deus com voz de júbilo.", ref: "Salmo 47:1" },
  { text: "Grande é o Senhor e mui digno de louvor, na cidade do nosso Deus, no seu monte santo.", ref: "Salmo 48:1" },
  { text: "Ouvi isto, vós todos os povos; inclinai os ouvidos, todos os moradores do mundo.", ref: "Salmo 49:1" },
  { text: "O Deus poderoso, o Senhor, falou e chamou a terra desde o nascimento do sol até ao seu ocaso.", ref: "Salmo 50:1" },
  { text: "Cria em mim, ó Deus, um coração puro, e renova em mim um espírito reto.", ref: "Salmo 51:10" },
  { text: "Por que te glorias na malícia, ó homem poderoso? A bondade de Deus dura continuamente.", ref: "Salmo 52:1" },
  { text: "Diz o néscio no seu coração: Não há Deus.", ref: "Salmo 53:1" },
  { text: "Deus, salva-me pelo teu nome, e faze-me justiça pelo teu poder.", ref: "Salmo 54:1" },
  { text: "Dá ouvidos, ó Deus, à minha oração, e não te escondas da minha súplica.", ref: "Salmo 55:1" },
  { text: "Tem misericórdia de mim, ó Deus, porque o homem procura devorar-me.", ref: "Salmo 56:1" },
  { text: "Seja a tua glória sobre toda a terra.", ref: "Salmo 57:5" },
  { text: "Falais deveras, ó congregação, a justiça? Julgais retamente, ó filhos dos homens?", ref: "Salmo 58:1" },
  { text: "Livra-me, meu Deus, dos meus inimigos; defende-me daqueles que se levantam contra mim.", ref: "Salmo 59:1" },
  { text: "Ó Deus, tu nos rejeitaste, tu nos espalhaste, tu estiveste indignado; oh, volta-te para nós.", ref: "Salmo 60:1" },
  { text: "Ouve, ó Deus, o meu clamor; atende à minha oração.", ref: "Salmo 61:1" },
  { text: "A minha alma descansa somente em Deus; dele vem a minha salvação.", ref: "Salmo 62:1" },
  { text: "Ó Deus, tu és o meu Deus, de madrugada te buscarei; a minha alma tem sede de ti.", ref: "Salmo 63:1" },
  { text: "Ouve, ó Deus, a minha voz na minha oração; guarda a minha vida do temor do inimigo.", ref: "Salmo 64:1" },
  { text: "A ti, ó Deus, pertence o louvor em Sião, e a ti se pagará o voto.", ref: "Salmo 65:1" },
  { text: "Celebrai a Deus com júbilo, todos os moradores da terra.", ref: "Salmo 66:1" },
  { text: "Deus tenha misericórdia de nós e nos abençoe; e faça resplandecer o seu rosto sobre nós.", ref: "Salmo 67:1" },
  { text: "Levante-se Deus, e sejam dissipados os seus inimigos.", ref: "Salmo 68:1" },
  { text: "Salva-me, ó Deus, pois as águas entraram até à minha alma.", ref: "Salmo 69:1" },
  { text: "Apressa-te, ó Deus, em me livrar; Senhor, apressa-te em ajudar-me.", ref: "Salmo 70:1" },
  { text: "Em ti, Senhor, confio; nunca seja eu confundido.", ref: "Salmo 71:1" },
  { text: "Ó Deus, dá ao rei os teus juízos, e a tua justiça ao filho do rei.", ref: "Salmo 72:1" },
  { text: "Verdadeiramente bom é Deus para com Israel, para com os limpos de coração.", ref: "Salmo 73:1" },
  { text: "Ó Deus, por que nos rejeitaste para sempre?", ref: "Salmo 74:1" },
  { text: "A ti, ó Deus, rendemos graças, rendemos graças, pois o teu nome está perto.", ref: "Salmo 75:1" },
  { text: "Conhecido é Deus em Judá; grande é o seu nome em Israel.", ref: "Salmo 76:1" },
  { text: "Clamei a Deus com a minha voz, a Deus levantei a minha voz, e ele me inclinou os ouvidos.", ref: "Salmo 77:1" },
  { text: "Escutai a minha lei, povo meu; inclinai os vossos ouvidos às palavras da minha boca.", ref: "Salmo 78:1" },
  { text: "Ó Deus, as nações entraram na tua herança; contaminaram o teu santo templo.", ref: "Salmo 79:1" },
  { text: "Tu que habitas entre os querubins, resplandece.", ref: "Salmo 80:1" },
  { text: "Cantai alegremente a Deus, nossa fortaleza; celebrai com júbilo ao Deus de Jacó.", ref: "Salmo 81:1" },
  { text: "Deus assiste na congregação dos poderosos; julga no meio dos deuses.", ref: "Salmo 82:1" },
  { text: "Ó Deus, não estejas em silêncio; não te cales, nem te confesses quieto, ó Deus.", ref: "Salmo 83:1" },
  { text: "Quão amáveis são os teus tabernáculos, Senhor dos Exércitos!", ref: "Salmo 84:1" },
  { text: "Abençoaste, Senhor, a tua terra; fizeste voltar o cativeiro de Jacó.", ref: "Salmo 85:1" },
  { text: "Inclina, Senhor, os teus ouvidos, e ouve-me, porque estou necessitado e pobre.", ref: "Salmo 86:1" },
  { text: "O seu fundamento está nos montes santos.", ref: "Salmo 87:1" },
  { text: "Senhor Deus da minha salvação, diante de ti tenho clamado de dia e de noite.", ref: "Salmo 88:1" },
  { text: "As misericórdias do Senhor cantarei eternamente.", ref: "Salmo 89:1" },
  { text: "Senhor, tu tens sido o nosso refúgio, de geração em geração.", ref: "Salmo 90:1" },
  { text: "Aquele que habita no esconderijo do Altíssimo, à sombra do Onipotente descansará.", ref: "Salmo 91:1" },
  { text: "Bom é louvar ao Senhor, e cantar louvores ao teu nome, ó Altíssimo.", ref: "Salmo 92:1" },
  { text: "O Senhor reina; está vestido de majestade.", ref: "Salmo 93:1" },
  { text: "Ó Senhor Deus, a quem a vingança pertence, Deus, resplandece.", ref: "Salmo 94:1" },
  { text: "Ó, vinde, cantemos ao Senhor; cantemos com júbilo à rocha da nossa salvação.", ref: "Salmo 95:1" },
  { text: "Cantai ao Senhor um cântico novo, cantai ao Senhor todas as terras.", ref: "Salmo 96:1" },
  { text: "O Senhor reina; regozije-se a terra; alegrem-se as muitas ilhas.", ref: "Salmo 97:1" },
  { text: "Cantai ao Senhor um cântico novo, porque fez maravilhas.", ref: "Salmo 98:1" },
  { text: "O Senhor reina; tremam os povos.", ref: "Salmo 99:1" },
  { text: "Celebrai com júbilo ao Senhor, todas as terras.", ref: "Salmo 100:1" },
  { text: "Cantarei a misericórdia e o juízo; a ti, Senhor, cantarei.", ref: "Salmo 101:1" },
  { text: "Senhor, ouve a minha oração, e chegue a ti o meu clamor.", ref: "Salmo 102:1" },
  { text: "Bendize, ó minha alma, ao Senhor, e tudo o que há em mim bendiga o seu santo nome.", ref: "Salmo 103:1" },
  { text: "Bendize, ó minha alma, ao Senhor! Senhor Deus meu, tu és magnificentíssimo.", ref: "Salmo 104:1" },
  { text: "Louvai ao Senhor, e invocai o seu nome; fazei conhecidas as suas obras entre os povos.", ref: "Salmo 105:1" },
  { text: "Louvai ao Senhor. Louvai ao Senhor, porque ele é bom, porque a sua misericórdia dura para sempre.", ref: "Salmo 106:1" },
  { text: "Louvai ao Senhor, porque ele é bom, porque a sua misericórdia dura para sempre.", ref: "Salmo 107:1" },
  { text: "Preparado está o meu coração, ó Deus; cantarei e darei louvores com a minha glória.", ref: "Salmo 108:1" },
  { text: "Ó Deus do meu louvor, não te cales.", ref: "Salmo 109:1" },
  { text: "Disse o Senhor ao meu Senhor: Assenta-te à minha direita, até que ponha os teus inimigos por escabelo de teus pés.", ref: "Salmo 110:1" },
  { text: "Louvai ao Senhor. Louvarei ao Senhor de todo o meu coração.", ref: "Salmo 111:1" },
  { text: "Louvai ao Senhor. Bem-aventurado o homem que teme ao Senhor.", ref: "Salmo 112:1" },
  { text: "Louvai ao Senhor. Louvai, servos do Senhor, louvai o nome do Senhor.", ref: "Salmo 113:1" },
  { text: "Quando Israel saiu do Egito, e a casa de Jacó de um povo de língua estranha.", ref: "Salmo 114:1" },
  { text: "Não a nós, Senhor, não a nós, mas ao teu nome dá glória.", ref: "Salmo 115:1" },
  { text: "Amo ao Senhor, porque ele ouviu a minha voz e a minha súplica.", ref: "Salmo 116:1" },
  { text: "Louvai ao Senhor todas as nações, louvai-o todos os povos.", ref: "Salmo 117:1" },
  { text: "Louvai ao Senhor, porque ele é bom; porque a sua misericórdia dura para sempre.", ref: "Salmo 118:1" },
  { text: "Lâmpada para os meus pés é tua palavra, e luz para o meu caminho.", ref: "Salmo 119:105" },
  { text: "Na minha angústia clamei ao Senhor, e ele me ouviu.", ref: "Salmo 120:1" },
  { text: "Levantarei os meus olhos para os montes, de onde vem o meu socorro.", ref: "Salmo 121:1" },
  { text: "Alegrei-me quando me disseram: Vamos à casa do Senhor.", ref: "Salmo 122:1" },
  { text: "A ti levanto os meus olhos, ó tu que habitas nos céus.", ref: "Salmo 123:1" },
  { text: "Se o Senhor não tivesse estado do nosso lado, diga agora Israel.", ref: "Salmo 124:1" },
  { text: "Os que confiam no Senhor serão como o monte Sião, que não se abala, mas permanece para sempre.", ref: "Salmo 125:1" },
  { text: "Quando o Senhor trouxe do cativeiro os que voltaram a Sião, estávamos como os que sonham.", ref: "Salmo 126:1" },
  { text: "Se o Senhor não edificar a casa, em vão trabalham os que a edificam.", ref: "Salmo 127:1" },
  { text: "Bem-aventurado aquele que teme ao Senhor e anda nos seus caminhos.", ref: "Salmo 128:1" },
  { text: "Muitas vezes me angustiaram desde a minha mocidade, diga agora Israel.", ref: "Salmo 129:1" },
  { text: "Das profundezas a ti clamo, ó Senhor.", ref: "Salmo 130:1" },
  { text: "Senhor, o meu coração não se elevou nem os meus olhos se levantaram.", ref: "Salmo 131:1" },
  { text: "Lembra-te, Senhor, de Davi, e de todas as suas aflições.", ref: "Salmo 132:1" },
  { text: "Oh! quão bom e quão suave é que os irmãos vivam em união!", ref: "Salmo 133:1" },
  { text: "Eis aqui, bendizei ao Senhor todos vós, servos do Senhor.", ref: "Salmo 134:1" },
  { text: "Louvai ao Senhor. Louvai o nome do Senhor; louvai-o, servos do Senhor.", ref: "Salmo 135:1" },
  { text: "Louvai ao Senhor, porque ele é bom; porque a sua misericórdia dura para sempre.", ref: "Salmo 136:1" },
  { text: "Junto aos rios da Babilônia, ali nos assentamos e choramos, ao lembrarmo-nos de Sião.", ref: "Salmo 137:1" },
  { text: "Eu te louvarei, Senhor, de todo o meu coração; diante dos deuses a ti cantarei louvores.", ref: "Salmo 138:1" },
  { text: "Senhor, tu me sondaste, e me conheces.", ref: "Salmo 139:1" },
  { text: "Livra-me, ó Senhor, do homem mau; guarda-me do homem violento.", ref: "Salmo 140:1" },
  { text: "Senhor, a ti clamo, apressa-te para mim; inclina os teus ouvidos à minha voz, quando a ti clamar.", ref: "Salmo 141:1" },
  { text: "Com a minha voz clamei ao Senhor; com a minha voz supliquei ao Senhor.", ref: "Salmo 142:1" },
  { text: "O Senhor, ouve a minha oração, inclina os ouvidos às minhas súplicas.", ref: "Salmo 143:1" },
  { text: "Bendito seja o Senhor, minha rocha, que ensina as minhas mãos para a peleja.", ref: "Salmo 144:1" },
  { text: "Exaltar-te-ei, ó Deus, Rei meu, e bendirei o teu nome pelos séculos dos séculos.", ref: "Salmo 145:1" },
  { text: "Louvai ao Senhor. Ó minha alma, louva ao Senhor.", ref: "Salmo 146:1" },
  { text: "Louvai ao Senhor, porque é bom cantar louvores ao nosso Deus.", ref: "Salmo 147:1" },
  { text: "Louvai ao Senhor desde os céus, louvai-o nas alturas.", ref: "Salmo 148:1" },
  { text: "Louvai ao Senhor. Cantai ao Senhor um cântico novo.", ref: "Salmo 149:1" },
  { text: "Tudo quanto tem fôlego louve ao Senhor. Louvai ao Senhor.", ref: "Salmo 150:6" }
];

const DashboardCard = ({ title, value, icon: Icon, colorClass }: any) => (
  <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-2.5 transition-all hover:shadow-md">
    <div className={`p-2 rounded-xl ${colorClass} shadow-inner`}>
      <Icon size={16} />
    </div>
    <div>
      <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest leading-none mb-0.5">{title}</p>
      <h3 className="text-base font-black text-gray-800 leading-none tracking-tighter">{value}</h3>
    </div>
  </div>
);

const ActivityItem: React.FC<{ type: 'new' | 'done', title: string, subtitle: string, time: string }> = ({ type, title, subtitle, time }) => (
  <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-xl transition-colors group cursor-default">
    <div className={`p-1.5 rounded-lg ${type === 'new' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
      {type === 'new' ? <Zap size={12} /> : <CheckCircle2 size={12} />}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-center">
        <p className="text-[9px] font-black text-gray-900 uppercase tracking-tight truncate">{title}</p>
        <span className="text-[7px] font-bold text-gray-300 uppercase shrink-0 ml-2">{time}</span>
      </div>
      <p className="text-[8px] text-gray-400 uppercase font-medium truncate leading-tight">{subtitle}</p>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalNafs: 0,
    activeNafs: 0,
    baixasToday: 0,
    fornecedores: 0,
    nearExpiry30Meds: 0,
    expiredMeds: 0,
    avgLeadTime: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [criticalNafs, setCriticalNafs] = useState<NAF[]>([]);
  const [criticalIndex, setCriticalIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [randomPsalm, setRandomPsalm] = useState(PSALMS[0]);
  const [greeting, setGreeting] = useState({ text: '', icon: Sun });

  const [quickSearchTerm, setQuickSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<(NAF & { page: number })[]>([]);
  const [searchExecuted, setSearchExecuted] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting({ text: 'BOM DIA', icon: Sun });
    else if (hour >= 12 && hour < 18) setGreeting({ text: 'BOA TARDE', icon: CloudSun });
    else setGreeting({ text: 'BOA NOITE', icon: Moon });

    const randomIndex = Math.floor(Math.random() * PSALMS.length);
    setRandomPsalm(PSALMS[randomIndex]);

    const fetchDashboardData = async () => {
      try {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const next30Str = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const [totalRes, activeRes, supplierRes, baixasTodayRes, expiredRes, near30Res, leadTimeDataRes] = await Promise.all([
          supabase.from('nafs').select('id', { count: 'exact', head: true }),
          supabase.from('nafs').select('id', { count: 'exact', head: true }).is('data_baixa', null),
          supabase.from('fornecedores').select('id', { count: 'exact', head: true }),
          supabase.from('nafs').select('id', { count: 'exact', head: true }).eq('data_baixa', todayStr),
          supabase.from('medicamentos').select('id', { count: 'exact', head: true }).lt('validade', todayStr),
          supabase.from('medicamentos').select('id', { count: 'exact', head: true }).gte('validade', todayStr).lte('validade', next30Str),
          supabase.from('nafs').select('data_entrada, data_baixa').not('data_baixa', 'is', null)
        ]);

        let avgLT = 0;
        if (leadTimeDataRes.data && leadTimeDataRes.data.length > 0) {
          const totalDays = leadTimeDataRes.data.reduce((acc, curr) => {
            const start = new Date(curr.data_entrada);
            const end = new Date(curr.data_baixa!);
            return acc + Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
          }, 0);
          avgLT = Math.round(totalDays / leadTimeDataRes.data.length);
        }

        const [recentCreated, recentFinished] = await Promise.all([
          supabase.from('nafs').select('*, fornecedor:fornecedores(*)').order('created_at', { ascending: false }).limit(5),
          supabase.from('nafs').select('*, fornecedor:fornecedores(*)').not('data_baixa', 'is', null).order('data_baixa', { ascending: false }).limit(5)
        ]);

        const combinedActivity = [
          ...(recentCreated.data || []).map(n => ({ ...n, actType: 'new', actTime: n.created_at })),
          ...(recentFinished.data || []).map(n => ({ ...n, actType: 'done', actTime: n.data_baixa }))
        ].sort((a, b) => new Date(b.actTime).getTime() - new Date(a.actTime).getTime()).slice(0, 5);

        const { data: criticalData } = await supabase
          .from('nafs')
          .select('*, fornecedor:fornecedores(*)')
          .is('data_baixa', null)
          .order('data_entrada', { ascending: true });

        setStats({
          totalNafs: totalRes.count || 0,
          activeNafs: activeRes.count || 0,
          baixasToday: baixasTodayRes.count || 0,
          fornecedores: supplierRes.count || 0,
          nearExpiry30Meds: near30Res.count || 0,
          expiredMeds: expiredRes.count || 0,
          avgLeadTime: avgLT
        });

        setRecentActivity(combinedActivity);
        setCriticalNafs(criticalData || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleQuickSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSearchTerm.trim()) return;
    setIsSearching(true);
    setSearchExecuted(true);
    try {
      const { data } = await supabase.from('nafs').select('*, fornecedor:fornecedores(*)').eq('numero_naf', quickSearchTerm.trim()).order('numero_subnaf', { ascending: true });
      if (data) {
        const enriched = await Promise.all(data.map(async (n) => {
          const { count } = await supabase.from('nafs').select('id', { count: 'exact', head: true }).lt('created_at', n.created_at);
          return { ...n, page: calculateNafPage(count || 0) };
        }));
        setSearchResults(enriched);
      }
    } catch (err) { console.error(err); } finally { setIsSearching(false); }
  };

  const nextCritical = () => setCriticalIndex(prev => (prev + 1) % criticalNafs.length);
  const prevCritical = () => setCriticalIndex(prev => (prev - 1 + criticalNafs.length) % criticalNafs.length);

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-64 space-y-4">
      <Loader2 className="animate-spin text-blue-600" size={32} />
      <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">Sincronizando Módulos...</p>
    </div>
  );

  const GreetingIcon = greeting.icon;
  const currentCritical = criticalNafs[criticalIndex];

  return (
    <div className="space-y-5 animate-fadeIn pb-12 text-sm max-w-7xl mx-auto">
      
      {/* 1. Header & KPIs */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-3 rounded-2xl text-white shadow-lg">
            <GreetingIcon size={20} />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tighter uppercase leading-none">
              {greeting.text}, <span className="text-blue-600">ANDRÉ LUZ</span>
            </h1>
            <p className="text-gray-400 text-[8px] font-black uppercase tracking-[0.2em] mt-1">Caderno de Protocolo • {new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>

        <form onSubmit={handleQuickSearch} className="relative group flex-1 max-sm:w-full max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
          <input
            type="text"
            placeholder="Localizar NAF..."
            value={quickSearchTerm}
            onChange={(e) => setQuickSearchTerm(e.target.value)}
            className="w-full pl-9 pr-20 py-2.5 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-600/5 outline-none font-black text-[9px] uppercase tracking-widest"
          />
          <button type="submit" className="absolute right-1 top-1 bottom-1 bg-blue-600 text-white px-3 rounded-xl text-[7px] font-black uppercase tracking-widest">
            {isSearching ? <Loader2 size={10} className="animate-spin" /> : 'Localizar'}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <DashboardCard title="Protocolos" value={stats.totalNafs} icon={FileText} colorClass="bg-blue-50 text-blue-600" />
        <DashboardCard title="Em Aberto" value={stats.activeNafs} icon={Clock} colorClass="bg-amber-50 text-amber-600" />
        <DashboardCard title="Baixas Hoje" value={stats.baixasToday} icon={CheckCircle2} colorClass="bg-emerald-50 text-emerald-600" />
        <DashboardCard title="Parceiros" value={stats.fornecedores} icon={Users} colorClass="bg-purple-50 text-purple-600" />
      </div>

      {searchExecuted && (
        <div className="bg-blue-600 rounded-[1.5rem] p-4 text-white shadow-2xl animate-scaleIn relative overflow-hidden">
          <button onClick={() => setSearchExecuted(false)} className="absolute top-3 right-3 p-1.5 hover:bg-white/20 rounded-full transition-colors"><X size={16} /></button>
          
          <div className="flex items-center space-x-2.5 mb-4">
            <div className="bg-white/20 p-1.5 rounded-lg">
              <Search size={16} className="text-white" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest leading-none">Dossiê de Busca</h3>
              <p className="text-[8px] font-bold text-blue-200 uppercase mt-0.5 tracking-widest">Encontrado {searchResults.length} registro(s)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {searchResults.length === 0 ? (
              <div className="col-span-full py-8 text-center">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60">Nenhum protocolo localizado para este número.</p>
              </div>
            ) : (
              searchResults.map(res => (
                <div key={res.id} className="bg-white rounded-[1.2rem] p-4 shadow-lg border border-white/10 group hover:scale-[1.01] transition-transform">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-0.5">Identificador</p>
                      <h4 className="text-lg font-black text-gray-900 tracking-tighter leading-none">
                        {res.numero_naf} <span className="text-gray-200">/</span> {res.numero_subnaf}
                      </h4>
                    </div>
                    <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-sm ${
                      res.data_baixa ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600 animate-pulse'
                    }`}>
                      {res.data_baixa ? '✓ Baixada' : '• Pendente'}
                    </span>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center space-x-2">
                      <MapPin size={10} className="text-blue-300" />
                      <p className="text-[10px] font-black text-gray-800 uppercase truncate tracking-tight">
                        {res.fornecedor?.razao_social || 'Fornecedor n/d'}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
                        <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Entrada</p>
                        <div className="flex items-center space-x-1">
                          <Calendar size={9} className="text-blue-400" />
                          <span className="text-[9px] font-black text-gray-700">{formatDate(res.data_entrada)}</span>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
                        <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Valor</p>
                        <div className="flex items-center space-x-1">
                          <DollarSign size={9} className="text-emerald-500" />
                          <span className="text-[9px] font-black text-emerald-600">{formatCurrency(res.valor)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-auto">
                    <div className="flex flex-col">
                      <p className="text-[7px] font-black text-gray-300 uppercase tracking-widest">Folha Física</p>
                      <span className="text-[10px] font-black text-blue-600">Pág. {res.page}</span>
                    </div>
                    {res.data_baixa && (
                      <div className="text-right">
                        <p className="text-[7px] font-black text-gray-300 uppercase tracking-widest">Saída em</p>
                        <span className="text-[10px] font-black text-emerald-600">{formatDate(res.data_baixa)}</span>
                      </div>
                    )}
                    {!res.data_baixa && (
                      <div className="bg-blue-50 px-1.5 py-0.5 rounded text-[7px] font-black text-blue-600 uppercase flex items-center space-x-1">
                        <Clock size={7} />
                        <span>Aguardando</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 2. Meditação Diária (Salmos) - Versão Compacta Horizontal */}
      <div className="bg-white p-4 rounded-[1.5rem] border border-blue-50 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-5 text-blue-600">
          <Quote size={32} />
        </div>
        <div className="flex items-center space-x-3.5 relative z-10">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
            <Quote size={16} />
          </div>
          <div className="flex-1 flex flex-col md:flex-row md:items-center md:justify-between gap-1.5">
            <div>
              <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest leading-none mb-0.5">Meditação Diária</p>
              <p className="text-xs md:text-sm font-medium text-gray-700 italic leading-snug">"{randomPsalm.text}"</p>
            </div>
            <div className="flex items-center space-x-1.5 shrink-0">
              <div className="w-3 h-[1px] bg-blue-400"></div>
              <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest">{randomPsalm.ref}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Saúde de Estoque */}
      <div className="bg-white p-4 rounded-[1.8rem] border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-5">
           <div className="flex items-center space-x-3">
              <div className="p-3 bg-red-50 text-red-600 rounded-2xl border border-red-100 shadow-sm">
                <ShieldAlert size={22} />
              </div>
              <div>
                <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-tight">Saúde de Estoque</h3>
                <p className="text-[7px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Alertas de Validade</p>
              </div>
           </div>
           
           <div className="flex flex-1 items-stretch space-x-2.5 w-full md:w-auto">
              <div className="flex-1 p-3 bg-red-50 rounded-2xl border border-red-100 flex flex-col items-center justify-center hover:bg-red-100 transition-colors">
                 <span className="text-2xl font-black text-red-600 leading-none">{stats.expiredMeds}</span>
                 <p className="text-[7px] font-black text-red-400 uppercase tracking-widest mt-1">Vencidos</p>
              </div>
              <div className="flex-1 p-3 bg-amber-50 rounded-2xl border border-amber-100 flex flex-col items-center justify-center hover:bg-amber-100 transition-colors">
                 <span className="text-2xl font-black text-amber-600 leading-none">{stats.nearExpiry30Meds}</span>
                 <p className="text-[7px] font-black text-amber-400 uppercase tracking-widest mt-1">Próx. 30 Dias</p>
              </div>
           </div>
        </div>
      </div>

      {/* 4. Fluxo & Urgência (Base) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Atividades (Lado Esquerdo) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-[1.8rem] border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-5">
             <div className="flex items-center space-x-2">
               <Activity size={16} className="text-gray-400" />
               <h2 className="text-[9px] font-black uppercase tracking-widest text-gray-500">Fluxo de Atividade</h2>
             </div>
             <div className="flex items-center space-x-1 bg-blue-50 px-2 py-0.5 rounded-full">
                <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-[7px] font-black text-blue-600 uppercase">Live Sync</span>
             </div>
          </div>
          
          <div className="space-y-0.5 flex-1">
            {recentActivity.length === 0 ? (
              <div className="py-10 text-center text-[8px] text-gray-300 font-bold uppercase tracking-widest">Nenhuma atividade recente.</div>
            ) : (
              recentActivity.map((act, i) => (
                <ActivityItem 
                  key={i}
                  type={act.actType as any}
                  title={`${act.actType === 'new' ? 'Entrada' : 'Saída'} NAF ${act.numero_naf}`}
                  subtitle={act.fornecedor?.razao_social || 'Fornecedor n/d'}
                  time={act.actType === 'new' ? 'Agora' : formatDate(act.data_baixa)}
                />
              ))
            )}
          </div>
        </div>

        {/* Urgência Crítica Compacta (Lado Direito) */}
        <div className="lg:col-span-5 flex flex-col">
          {criticalNafs.length > 0 ? (
            <div className="bg-gradient-to-br from-red-600 to-red-800 p-5 rounded-[1.8rem] text-white shadow-lg flex-1 flex flex-col relative overflow-hidden group min-h-[180px]">
              <div className="flex items-center justify-between mb-3 relative z-10">
                 <div className="bg-white/20 p-2 rounded-xl">
                   <History size={16} />
                 </div>
                 <div className="bg-white/20 px-2.5 py-0.5 rounded-full flex items-center space-x-1.5">
                    <span className="text-[8px] font-black uppercase tracking-widest">Crítico</span>
                    <span className="text-[8px] font-black bg-red-600 px-1 rounded-md">{criticalIndex + 1}/{criticalNafs.length}</span>
                 </div>
              </div>
              
              <div className="relative z-10 flex-1 flex flex-col justify-center animate-fadeIn" key={currentCritical.id}>
                <p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-60 mb-0.5">Protocolo Estagnado</p>
                <h4 className="text-xl font-black tracking-tighter uppercase mb-0.5">{currentCritical.numero_naf} <span className="opacity-30">/</span> {currentCritical.numero_subnaf}</h4>
                <p className="text-[9px] font-black uppercase truncate mb-3 opacity-90">{currentCritical.fornecedor?.razao_social}</p>
                
                <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-auto">
                   <span className="text-[8px] font-black uppercase tracking-widest opacity-60">Espera</span>
                   <div className="flex items-baseline space-x-1">
                      <span className="text-2xl font-black">{Math.ceil(Math.abs(new Date().getTime() - new Date(currentCritical.data_entrada).getTime()) / (1000 * 60 * 60 * 24))}</span>
                      <span className="text-[8px] font-black uppercase">Dias</span>
                   </div>
                </div>
              </div>

              {/* Controles de Navegação Compactos */}
              {criticalNafs.length > 1 && (
                <div className="absolute inset-y-0 right-2 flex flex-col justify-center space-y-1.5 z-20">
                   <button onClick={prevCritical} className="p-1 bg-white/10 hover:bg-white/30 rounded-lg backdrop-blur-md transition-all active:scale-90"><ChevronLeft size={14} /></button>
                   <button onClick={nextCritical} className="p-1 bg-white/10 hover:bg-white/30 rounded-lg backdrop-blur-md transition-all active:scale-90"><ChevronRight size={14} /></button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white p-5 rounded-[1.8rem] border border-gray-100 shadow-sm flex-1 flex flex-col items-center justify-center text-center">
               <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle2 size={20} />
               </div>
               <h3 className="text-[9px] font-black text-gray-900 uppercase tracking-widest">Fluxo em Dia</h3>
            </div>
          )}
          
          <div className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm mt-3 text-center">
             <div className="flex items-center justify-center space-x-1.5 text-blue-600 mb-0.5">
                <TrendingUp size={10} />
                <span className="text-[8px] font-black uppercase tracking-widest">Eficiência Média</span>
             </div>
             <p className="text-[7px] font-bold text-gray-400 uppercase">
               Tempo de Baixa: <span className="text-gray-900 font-black">{stats.avgLeadTime} Dias</span>
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
