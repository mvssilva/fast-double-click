import { use, useState, useEffect } from "react"
import { Link } from "react-router-dom"

export default function Home(){

    const [fase, setFase] = useState('aguardando');
    const [tempoInicial, setTempoInicial] = useState(0);
    const [tempoFinal, setTempoFinal] = useState(null);
    const [melhorTempo, setMelhorTempo] = useState(null);

    // incremento do melhor tempo salvo nos registros
    const buscarRecorde = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/registros?sortBy=time&order=asc');
            const data = await response.json();
            if(data.length > 0){
                setMelhorTempo(data[0].timeMs);
            }
        }catch (error){ 
            console.error("Erro ao buscar tempo recorde:", error);
        }
    };

    // buscar o recorde assim que a página carrega
    useEffect(() => {
        buscarRecorde();
    }, []);

    // função que diferencia entre o primeiro e segundo click, e guarda o tempo.
    const handleClick = async () => {
        if (fase == 'aguardando' || fase == 'resultado'){
            // primeiro click
            setTempoInicial(Date.now());
            setFase('contando');
        } 
        else if (fase == "contando"){
            const tempoDecorrido = Date.now() - tempoInicial;
            setTempoFinal(tempoDecorrido);
            setFase('resultado');

            try {
                await fetch('http://localhost:3000/api/registros',{
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({timeMs: tempoDecorrido})
                });
                buscarRecorde();
            } catch (error) {
                console.error("Erro ao conectar com o back-end: ", error);
            }
        }
    }

    return (
        <div className="min-h-screen bg-[#F4F4F0] text-zinc-900 flex flex-col px-8 py-6 font-sans">
            <header className="flex justify-between items-center border-b-2 border-zinc-900 pb-4 mb-4">
                <span className="text-md font-bold tracking-widest uppercase">Desafio Técnico</span>
                <Link 
                    to={"/historico"}
                    className="text-md font-bold tracking-widest uppercase hover:text-zinc-500 transition-colors"
                >
                    Histórico
                </Link>
            </header>
            <main className="flex-1 flex gap-15 items-center justify-center w-full mx-auto">
                
                <div className="flex flex-col items-center">
                    <h1 className="text-[10vw] leading-[0.8] font-black tracking-tighter uppercase">
                        Fast<br />Click
                    </h1>
                    {melhorTempo && (
                        <div className="inline-block bg-yellow-300 px-4 py-2 rounded-full border border-zinc-300">
                            <span className="text-sm font-bold uppercase tracking-widest text-black">
                                Melhor Tempo: <span className="text-black">{melhorTempo} ms</span>
                            </span>
                        </div>
                    )}
                </div>

                <div className="w-full max-w-3xl flex flex-col items-center gap-6">
                    <button
                        onClick={handleClick}
                        className={`w-full py-16 md:py-24 rounded-2xl text-4xl md:text-5xl font-black uppercase tracking-tight transition-all active:scale-95 cursor-pointer
                            ${fase == 'aguardando' ? 'bg-zinc-800 text-[#F4F4F0] hover:bg-zinc-800': ''}
                            ${fase == 'contando' ? 'bg-blue-500 text-zinc-900 shadow-[0_0_50px_rgba(250,204,21,0.5)]': ''}
                            ${fase === 'resultado' ? 'bg-green-500 text-zinc-900' : ''}
                        `}
                    >
                        {fase === 'aguardando' && 'Iniciar Teste'}
                        {fase === 'contando' && 'Clique Novamente!'}
                        {fase === 'resultado' && `${tempoFinal} ms`}
                    </button>
                    <div className="h-6">
                        {fase === 'resultado' && (
                        <p className="text-zinc-900 font-medium uppercase tracking-widest text-xs md:text-sm">
                            Tempo registrado no histórico.
                        </p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}